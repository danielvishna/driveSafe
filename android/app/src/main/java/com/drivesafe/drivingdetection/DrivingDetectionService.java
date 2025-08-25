package com.drivesafe.drivingdetection;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Build;
import android.os.IBinder;
import android.util.Log;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

import com.drivesafe.R;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;
import org.json.JSONException;
import org.json.JSONObject;

public class DrivingDetectionService extends Service implements LocationListener {

    private static final String TAG = "DrivingDetectionService";
    private static final String CHANNEL_ID = "DrivingDetectionChannel";
    private static final int NOTIFICATION_ID = 1;
    private static final float DRIVING_SPEED_THRESHOLD = 5.0f; // 5 m/s is ~18 km/h
    private static final int LOCATION_UPDATE_INTERVAL = 5000; // 5 seconds
    private static final int LOCATION_UPDATE_DISTANCE = 10; // 10 meters
    private static final int SPEED_SAMPLES = 10; // Number of location samples to average speed over

    private LocationManager locationManager;
    private List<Float> speedSamples = new ArrayList<>();
    private boolean isDriving = false;

    private static final OkHttpClient client = new OkHttpClient();
    private static final MediaType JSON = MediaType.parse("application/json; charset=utf-8");

    @Override
    public void onCreate() {
        super.onCreate();
        Log.d(TAG, "Service onCreate called");
        createNotificationChannel();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        Log.d(TAG, "Service onStartCommand called");
        startForeground(NOTIFICATION_ID, createNotification());
        startLocationTracking();
        return START_STICKY;
    }

    private void startLocationTracking() {
        Log.d(TAG, "Starting location tracking");
        locationManager = (LocationManager) getSystemService(Context.LOCATION_SERVICE);
        boolean isGPSEnabled = locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER);
        boolean isNetworkEnabled = locationManager.isProviderEnabled(LocationManager.NETWORK_PROVIDER);

        Log.d(TAG, "GPS enabled: " + isGPSEnabled + ", Network enabled: " + isNetworkEnabled);

        if (isGPSEnabled) {
            try {
                locationManager.requestLocationUpdates(
                    LocationManager.GPS_PROVIDER,
                    LOCATION_UPDATE_INTERVAL,
                    LOCATION_UPDATE_DISTANCE,
                    this
                );
                Log.d(TAG, "GPS location updates requested");
            } catch (SecurityException e) {
                Log.e(TAG, "GPS permission not granted", e);
            }
        }

        if (isNetworkEnabled) {
            try {
                locationManager.requestLocationUpdates(
                    LocationManager.NETWORK_PROVIDER,
                    LOCATION_UPDATE_INTERVAL,
                    LOCATION_UPDATE_DISTANCE,
                    this
                );
                Log.d(TAG, "Network location updates requested");
            } catch (SecurityException e) {
                Log.e(TAG, "Network permission not granted", e);
            }
        }
    }

    private void stopLocationTracking() {
        if (locationManager != null) {
            locationManager.removeUpdates(this);
            Log.d(TAG, "Location tracking stopped");
        }
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        Log.d(TAG, "Service onDestroy called");
        stopLocationTracking();
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onLocationChanged(Location location) {
        Log.d(TAG, "Location changed: " + location.toString());
        if (location.hasSpeed()) {
            float speedMps = location.getSpeed();
            Log.d(TAG, "Current speed: " + speedMps + " m/s");

            speedSamples.add(speedMps);
            if (speedSamples.size() > SPEED_SAMPLES) {
                speedSamples.remove(0);
            }

            float averageSpeed = calculateAverageSpeed();
            boolean currentlyDriving = averageSpeed > DRIVING_SPEED_THRESHOLD;

            Log.d(TAG, "Average speed: " + averageSpeed + " m/s, isDriving: " + currentlyDriving);

            if (currentlyDriving != isDriving) {
                isDriving = currentlyDriving;
                updateNotification();
                Log.d(TAG, "Driving status changed to: " + isDriving);

                if (DrivingDetectionModule.staticReactContext != null) {
                    WritableMap params = Arguments.createMap();
                    params.putBoolean("isDriving", isDriving);
                    params.putDouble("speed", averageSpeed);
                    params.putDouble("latitude", location.getLatitude());
                    params.putDouble("longitude", location.getLongitude());

                    DrivingDetectionModule.emitEvent("DrivingStatusChanged", params);
                    Log.d(TAG, "Event emitted directly with driving status: " + isDriving);
                } else {
                    Log.e(TAG, "React context is not available. Cannot emit event.");
                }
            }

            // Send data to the backend
            sendDrivingDataToServer(currentlyDriving, averageSpeed, location.getLatitude(), location.getLongitude());
        } else {
            Log.d(TAG, "Location update without speed information");
        }
    }

    private float calculateAverageSpeed() {
        float sum = 0;
        for (float speed : speedSamples) {
            sum += speed;
        }
        return speedSamples.size() > 0 ? sum / speedSamples.size() : 0;
    }

    private void sendDrivingDataToServer(final boolean isDriving, final double speed, final double latitude, final double longitude) {
        new Thread(() -> {
            try {
                JSONObject json = new JSONObject();
                json.put("isDriving", isDriving);
                json.put("speed", speed);
                json.put("latitude", latitude);
                json.put("longitude", longitude);

                RequestBody body = RequestBody.create(json.toString(), JSON);
                
                // NOTE: Use your NestJS backend URL here.
                // 'http://10.0.2.2:3000' is for an Android emulator.
                // Use your machine's local IP for a physical device.
                String url = "http://192.168.1.193/driving/log";

                Request request = new Request.Builder()
                        .url(url)
                        .post(body)
                        .build();

                try (Response response = client.newCall(request).execute()) {
                    if (response.isSuccessful()) {
                        Log.d(TAG, "Successfully sent data to server.");
                    } else {
                        Log.e(TAG, "Failed to send data to server: " + response.code() + " " + response.message());
                    }
                }

            } catch (JSONException | IOException e) {
                Log.e(TAG, "Error sending data to server", e);
            }
        }).start();
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "Driving Detection",
                NotificationManager.IMPORTANCE_DEFAULT
            );
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(channel);
            }
        }
    }

    private Notification createNotification() {
        Intent notificationIntent = new Intent(this, com.drivesafe.MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(
            this,
            0,
            notificationIntent,
            PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT
        );

        String title = "Driving Detection Service";
        String content = "Detecting driving status...";

        return new NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle(title)
            .setContentText(content)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentIntent(pendingIntent)
            .build();
    }

    private void updateNotification() {
        NotificationManager manager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        if (manager != null) {
            String title = "Driving Detection Service";
            String content = isDriving ? "Status: Driving Detected" : "Status: Idle";
            Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle(title)
                .setContentText(content)
                .setSmallIcon(R.mipmap.ic_launcher)
                .build();
            manager.notify(NOTIFICATION_ID, notification);
        }
    }

    @Override
    public void onStatusChanged(String provider, int status, android.os.Bundle extras) {}

    @Override
    public void onProviderEnabled(String provider) {}

    @Override
    public void onProviderDisabled(String provider) {}
}