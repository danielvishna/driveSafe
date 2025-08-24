package com.drivesafe.drivingdetection;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Build;
import androidx.core.content.ContextCompat;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class DrivingDetectionModule extends ReactContextBaseJavaModule {
    
    private static final String MODULE_NAME = "DrivingDetection";
    private ReactApplicationContext reactContext;
    private BroadcastReceiver drivingStatusReceiver;
    
    public DrivingDetectionModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        android.util.Log.d("DrivingDetectionModule", "=== DrivingDetectionModule Constructor Called ===");
        
        // Don't setup broadcast receiver in constructor - it might be too early
        // We'll do it when the module is first used
        android.util.Log.d("DrivingDetectionModule", "DrivingDetectionModule created successfully!");
    }
    
    @Override
    public String getName() {
        android.util.Log.d("DrivingDetectionModule", "getName() called - returning: " + MODULE_NAME);
        return MODULE_NAME;
    }
    
    private void setupBroadcastReceiver() {
        android.util.Log.d("DrivingDetectionModule", "=== setupBroadcastReceiver() called ===");
        
        try {
            android.util.Log.d("DrivingDetectionModule", "Creating BroadcastReceiver...");
            drivingStatusReceiver = new BroadcastReceiver() {
                @Override
                public void onReceive(Context context, Intent intent) {
                    android.util.Log.d("DrivingDetectionModule", "=== BROADCAST RECEIVED ===");
                    android.util.Log.d("DrivingDetectionModule", "Broadcast received: " + intent.getAction());
                    
                    if ("com.drivesafe.DRIVING_STATUS_CHANGED".equals(intent.getAction())) {
                        boolean isDriving = intent.getBooleanExtra("isDriving", false);
                        float speed = intent.getFloatExtra("speed", 0);
                        double latitude = intent.getDoubleExtra("latitude", 0);
                        double longitude = intent.getDoubleExtra("longitude", 0);
                        
                        android.util.Log.d("DrivingDetectionModule", "Processing broadcast - isDriving: " + isDriving + ", speed: " + speed);
                        
                        WritableMap params = Arguments.createMap();
                        params.putBoolean("isDriving", isDriving);
                        params.putDouble("speed", speed);
                        params.putDouble("latitude", latitude);
                        params.putDouble("longitude", longitude);
                        
                        android.util.Log.d("DrivingDetectionModule", "Sending event to React Native");
                        sendEvent("DrivingStatusChanged", params);
                    } else {
                        android.util.Log.d("DrivingDetectionModule", "Received different broadcast: " + intent.getAction());
                    }
                }
            };
            android.util.Log.d("DrivingDetectionModule", "BroadcastReceiver created successfully");
            
            android.util.Log.d("DrivingDetectionModule", "Creating IntentFilter...");
            IntentFilter filter = new IntentFilter("com.drivesafe.DRIVING_STATUS_CHANGED");
            android.util.Log.d("DrivingDetectionModule", "IntentFilter created for: com.drivesafe.DRIVING_STATUS_CHANGED");
            
            android.util.Log.d("DrivingDetectionModule", "Registering BroadcastReceiver...");
            android.util.Log.d("DrivingDetectionModule", "Android API Level: " + Build.VERSION.SDK_INT);
            
            // Fix for Android 14+ (API 34+): Specify receiver export flag
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                android.util.Log.d("DrivingDetectionModule", "Using RECEIVER_NOT_EXPORTED for Android 13+");
                reactContext.registerReceiver(drivingStatusReceiver, filter, Context.RECEIVER_NOT_EXPORTED);
                android.util.Log.d("DrivingDetectionModule", "BroadcastReceiver registered with RECEIVER_NOT_EXPORTED");
            } else {
                android.util.Log.d("DrivingDetectionModule", "Using standard registration for older Android");
                reactContext.registerReceiver(drivingStatusReceiver, filter);
                android.util.Log.d("DrivingDetectionModule", "BroadcastReceiver registered without flags");
            }
            
            android.util.Log.d("DrivingDetectionModule", "=== BroadcastReceiver setup completed successfully ===");
        } catch (Exception e) {
            android.util.Log.e("DrivingDetectionModule", "=== ERROR setting up BroadcastReceiver ===", e);
        }
    }
    
    @ReactMethod
    public void startDrivingDetection(Callback callback) {
        android.util.Log.d("DrivingDetectionModule", "startDrivingDetection called!");
        
        // Setup broadcast receiver here instead of constructor
        if (drivingStatusReceiver == null) {
            android.util.Log.d("DrivingDetectionModule", "Setting up broadcast receiver...");
            setupBroadcastReceiver();
        }
        
        if (!hasLocationPermission()) {
            callback.invoke("Location permission not granted", null);
            return;
        }
        
        try {
            Intent serviceIntent = new Intent(reactContext, DrivingDetectionService.class);
            reactContext.startForegroundService(serviceIntent);
            android.util.Log.d("DrivingDetectionModule", "Service start intent sent");
            callback.invoke(null, "Background driving detection started successfully");
        } catch (Exception e) {
            android.util.Log.e("DrivingDetectionModule", "Error starting service", e);
            callback.invoke("Error starting service: " + e.getMessage(), null);
        }
    }
    
    @ReactMethod
    public void testBroadcast(Callback callback) {
        android.util.Log.d("DrivingDetectionModule", "testBroadcast called - sending test broadcast");
        
        try {
            // Send a test broadcast to verify the receiver is working
            Intent testIntent = new Intent("com.drivesafe.DRIVING_STATUS_CHANGED");
            testIntent.putExtra("isDriving", true);
            testIntent.putExtra("speed", 25.5f);
            testIntent.putExtra("latitude", 31.95);
            testIntent.putExtra("longitude", 34.75);
            
            reactContext.sendBroadcast(testIntent);
            android.util.Log.d("DrivingDetectionModule", "Test broadcast sent");
            callback.invoke(null, "Test broadcast sent successfully");
        } catch (Exception e) {
            android.util.Log.e("DrivingDetectionModule", "Error sending test broadcast", e);
            callback.invoke("Error sending test broadcast: " + e.getMessage(), null);
        }
    }
    
    @ReactMethod
    public void stopDrivingDetection(Callback callback) {
        android.util.Log.d("DrivingDetectionModule", "stopDrivingDetection called!");
        
        try {
            Intent serviceIntent = new Intent(reactContext, DrivingDetectionService.class);
            reactContext.stopService(serviceIntent);
            callback.invoke(null, "Background driving detection stopped successfully");
        } catch (Exception e) {
            android.util.Log.e("DrivingDetectionModule", "Error stopping service", e);
            callback.invoke("Error stopping service: " + e.getMessage(), null);
        }
    }
    
    @ReactMethod
    public void hasLocationPermission(Callback callback) {
        android.util.Log.d("DrivingDetectionModule", "hasLocationPermission called!");
        
        boolean hasPermission = ContextCompat.checkSelfPermission(
            reactContext, 
            Manifest.permission.ACCESS_FINE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED;
        
        callback.invoke(null, hasPermission);
    }
    
    private boolean hasLocationPermission() {
        return ContextCompat.checkSelfPermission(
            reactContext, 
            Manifest.permission.ACCESS_FINE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED;
    }
    
    private void sendEvent(String eventName, WritableMap params) {
        try {
            android.util.Log.d("DrivingDetectionModule", "=== sendEvent() called ===");
            android.util.Log.d("DrivingDetectionModule", "Event name: " + eventName);
            android.util.Log.d("DrivingDetectionModule", "Params: " + params.toString());
            
            if (reactContext == null) {
                android.util.Log.e("DrivingDetectionModule", "React context is null!");
                return;
            }
            
            android.util.Log.d("DrivingDetectionModule", "Checking if React context has active instance...");
            if (reactContext.hasActiveReactInstance()) {
                android.util.Log.d("DrivingDetectionModule", "React context is active, sending event...");
                reactContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit(eventName, params);
                android.util.Log.d("DrivingDetectionModule", "=== Event sent successfully: " + eventName + " ===");
            } else {
                android.util.Log.w("DrivingDetectionModule", "React context not ready, cannot send event: " + eventName);
            }
        } catch (Exception e) {
            android.util.Log.e("DrivingDetectionModule", "=== ERROR sending event: " + eventName + " ===", e);
        }
    }
    
    @Override
    public void onCatalystInstanceDestroy() {
        super.onCatalystInstanceDestroy();
        try {
            if (drivingStatusReceiver != null) {
                reactContext.unregisterReceiver(drivingStatusReceiver);
                android.util.Log.d("DrivingDetectionModule", "BroadcastReceiver unregistered");
            }
        } catch (Exception e) {
            android.util.Log.e("DrivingDetectionModule", "Error unregistering receiver", e);
        }
    }
}