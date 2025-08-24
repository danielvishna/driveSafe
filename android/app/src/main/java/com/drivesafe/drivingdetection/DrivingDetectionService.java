package com.drivesafe.drivingdetection;

import android.Manifest;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.util.Log;
import androidx.core.app.ActivityCompat;
import androidx.core.app.NotificationCompat;
import androidx.core.content.ContextCompat;

import java.util.ArrayList;
import java.util.List;

public class DrivingDetectionService extends Service implements LocationListener {
    
    private static final String CHANNEL_ID = "DrivingDetectionChannel";
    private static final int NOTIFICATION_ID = 1001;
    private static final long MIN_TIME_BETWEEN_UPDATES = 5000; // 5 seconds
    private static final float MIN_DISTANCE_CHANGE = 10; // 10 meters
    private static final float DRIVING_SPEED_THRESHOLD = 5.0f; // 5 m/s (~18 km/h) - lowered for testing
    private static final int SPEED_SAMPLES = 5;
    
    private LocationManager locationManager;
    private List<Float> speedSamples = new ArrayList<>();
    private boolean isDriving = false;
    private Handler mainHandler;
    
    @Override
    public void onCreate() {
        super.onCreate();
        android.util.Log.d("DrivingDetectionService", "Service onCreate called");
        mainHandler = new Handler(Looper.getMainLooper());
        createNotificationChannel();
    }
    
    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        startForegroundService();
        startLocationTracking();
        return START_STICKY; // Restart service if killed
    }
    
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
    
    @Override
    public void onDestroy() {
        super.onDestroy();
        stopLocationTracking();
    }
    
    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "Driving Detection Service",
                NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription("Monitors location to detect driving");
            NotificationManager manager = getSystemService(NotificationManager.class);
            manager.createNotificationChannel(channel);
        }
    }
    
    private void startForegroundService() {
        Intent notificationIntent = new Intent(this, getMainActivityClass());
        PendingIntent pendingIntent = PendingIntent.getActivity(
            this, 0, notificationIntent, 
            Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE : 0
        );
        
        Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("DriveSafe - Monitoring")
            .setContentText("Detecting driving for your safety")
            .setSmallIcon(android.R.drawable.ic_menu_mylocation)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .build();
            
        startForeground(NOTIFICATION_ID, notification);
    }
    
    private Class<?> getMainActivityClass() {
        String packageName = getPackageName();
        Intent launchIntent = getPackageManager().getLaunchIntentForPackage(packageName);
        try {
            return Class.forName(launchIntent.getComponent().getClassName());
        } catch (Exception e) {
            return null;
        }
    }
    
    private void startLocationTracking() {
        android.util.Log.d("DrivingDetectionService", "Starting location tracking");
        
        if (!hasLocationPermission()) {
            android.util.Log.e("DrivingDetectionService", "No location permission, stopping service");
            stopSelf();
            return;
        }
        
        try {
            locationManager = (LocationManager) getSystemService(Context.LOCATION_SERVICE);
            
            if (locationManager != null) {
                boolean gpsEnabled = locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER);
                boolean networkEnabled = locationManager.isProviderEnabled(LocationManager.NETWORK_PROVIDER);
                
                android.util.Log.d("DrivingDetectionService", "GPS enabled: " + gpsEnabled + ", Network enabled: " + networkEnabled);
                
                if (gpsEnabled) {
                    locationManager.requestLocationUpdates(
                        LocationManager.GPS_PROVIDER,
                        MIN_TIME_BETWEEN_UPDATES,
                        MIN_DISTANCE_CHANGE,
                        this
                    );
                    android.util.Log.d("DrivingDetectionService", "GPS location updates requested");
                }
                
                if (networkEnabled) {
                    locationManager.requestLocationUpdates(
                        LocationManager.NETWORK_PROVIDER,
                        MIN_TIME_BETWEEN_UPDATES,
                        MIN_DISTANCE_CHANGE,
                        this
                    );
                    android.util.Log.d("DrivingDetectionService", "Network location updates requested");
                }
                
                if (!gpsEnabled && !networkEnabled) {
                    android.util.Log.w("DrivingDetectionService", "No location providers available");
                }
            } else {
                android.util.Log.e("DrivingDetectionService", "LocationManager is null");
            }
        } catch (SecurityException e) {
            android.util.Log.e("DrivingDetectionService", "Security exception in location tracking", e);
            stopSelf();
        }
    }
    
    private void stopLocationTracking() {
        if (locationManager != null) {
            try {
                locationManager.removeUpdates(this);
            } catch (SecurityException e) {
                // Handle exception
            }
        }
    }
    
    private boolean hasLocationPermission() {
        return ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) 
               == PackageManager.PERMISSION_GRANTED;
    }
    
    @Override
    public void onLocationChanged(Location location) {
        android.util.Log.d("DrivingDetectionService", "Location changed: " + location.toString());
        
        if (location.hasSpeed()) {
            float speedMps = location.getSpeed(); // meters per second
            android.util.Log.d("DrivingDetectionService", "Current speed: " + speedMps + " m/s");
            
            // Add speed to samples
            speedSamples.add(speedMps);
            if (speedSamples.size() > SPEED_SAMPLES) {
                speedSamples.remove(0);
            }
            
            // Calculate average speed
            float averageSpeed = calculateAverageSpeed();
            boolean currentlyDriving = averageSpeed > DRIVING_SPEED_THRESHOLD;
            
            android.util.Log.d("DrivingDetectionService", "Average speed: " + averageSpeed + " m/s, isDriving: " + currentlyDriving);
            
            // Check if driving status changed
            if (currentlyDriving != isDriving) {
                isDriving = currentlyDriving;
                updateNotification();
                
                android.util.Log.d("DrivingDetectionService", "Driving status changed to: " + isDriving);
                
                // Send broadcast to notify app about driving status change
                Intent intent = new Intent("com.drivesafe.DRIVING_STATUS_CHANGED");
                intent.putExtra("isDriving", isDriving);
                intent.putExtra("speed", averageSpeed);
                intent.putExtra("latitude", location.getLatitude());
                intent.putExtra("longitude", location.getLongitude());
                sendBroadcast(intent);
                
                android.util.Log.d("DrivingDetectionService", "Broadcast sent with driving status: " + isDriving);
            }
        } else {
            android.util.Log.d("DrivingDetectionService", "Location update without speed information");
        }
    }
    
    private float calculateAverageSpeed() {
        if (speedSamples.isEmpty()) return 0;
        
        float sum = 0;
        for (float speed : speedSamples) {
            sum += speed;
        }
        return sum / speedSamples.size();
    }
    
    private void updateNotification() {
        String text = isDriving ? "🚗 Driving detected - Stay safe!" : "Monitoring for driving";
        
        Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("DriveSafe - Monitoring")
            .setContentText(text)
            .setSmallIcon(android.R.drawable.ic_menu_mylocation)
            .setOngoing(true)
            .build();
            
        NotificationManager manager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        manager.notify(NOTIFICATION_ID, notification);
    }
    
    @Override
    public void onStatusChanged(String provider, int status, Bundle extras) {}
    
    @Override
    public void onProviderEnabled(String provider) {}
    
    @Override
    public void onProviderDisabled(String provider) {}
}