package com.drivesafe.drivingdetection;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.util.Log;
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
    public static ReactApplicationContext staticReactContext;

    public DrivingDetectionModule(ReactApplicationContext reactContext) {
        super(reactContext);
        Log.d("DrivingDetectionModule", "=== DrivingDetectionModule Constructor Called ===");
        staticReactContext = reactContext;
        Log.d("DrivingDetectionModule", "DrivingDetectionModule created successfully!");
    }

    @Override
    public String getName() {
        Log.d("DrivingDetectionModule", "getName() called - returning: " + MODULE_NAME);
        return MODULE_NAME;
    }

    public static void emitEvent(String eventName, WritableMap params) {
        if (staticReactContext != null && staticReactContext.hasActiveReactInstance()) {
            staticReactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
        }
    }

    @ReactMethod
    public void startDrivingDetection(Callback callback) {
        Log.d("DrivingDetectionModule", "startDrivingDetection called!");
        if (!hasLocationPermission()) {
            callback.invoke("Location permission not granted", null);
            return;
        }
        try {
            Intent serviceIntent = new Intent(getReactApplicationContext(), DrivingDetectionService.class);
            getReactApplicationContext().startForegroundService(serviceIntent);
            Log.d("DrivingDetectionModule", "Service start intent sent");
            callback.invoke(null, "Background driving detection started successfully");
        } catch (Exception e) {
            Log.e("DrivingDetectionModule", "Error starting service", e);
            callback.invoke("Error starting service: " + e.getMessage(), null);
        }
    }

    @ReactMethod
    public void testBroadcast(Callback callback) {
        Log.d("DrivingDetectionModule", "testBroadcast called - sending test broadcast");
        try {
            WritableMap params = Arguments.createMap();
            params.putBoolean("isDriving", true);
            params.putDouble("speed", 25.5f);
            params.putDouble("latitude", 31.95);
            params.putDouble("longitude", 34.75);

            emitEvent("DrivingStatusChanged", params);

            Log.d("DrivingDetectionModule", "Test event emitted directly");
            callback.invoke(null, "Test broadcast sent successfully");
        } catch (Exception e) {
            Log.e("DrivingDetectionModule", "Error sending test event", e);
            callback.invoke("Error sending test event: " + e.getMessage(), null);
        }
    }

    @ReactMethod
    public void stopDrivingDetection(Callback callback) {
        Log.d("DrivingDetectionModule", "stopDrivingDetection called!");
        try {
            Intent serviceIntent = new Intent(getReactApplicationContext(), DrivingDetectionService.class);
            getReactApplicationContext().stopService(serviceIntent);
            callback.invoke(null, "Background driving detection stopped successfully");
        } catch (Exception e) {
            Log.e("DrivingDetectionModule", "Error stopping service", e);
            callback.invoke("Error stopping service: " + e.getMessage(), null);
        }
    }

    @ReactMethod
    public void hasLocationPermission(Callback callback) {
        Log.d("DrivingDetectionModule", "hasLocationPermission called!");
        boolean hasPermission = hasLocationPermission();
        callback.invoke(null, hasPermission);
    }

    private boolean hasLocationPermission() {
        return ContextCompat.checkSelfPermission(
            getReactApplicationContext(),
            Manifest.permission.ACCESS_FINE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED;
    }
}