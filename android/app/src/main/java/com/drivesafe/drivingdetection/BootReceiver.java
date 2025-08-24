package com.drivesafe.drivingdetection;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.util.Log;

public class BootReceiver extends BroadcastReceiver {
    private static final String TAG = "BootReceiver";
    
    @Override
    public void onReceive(Context context, Intent intent) {
        Log.d(TAG, "BootReceiver triggered with action: " + intent.getAction());
        
        if (Intent.ACTION_BOOT_COMPLETED.equals(intent.getAction()) ||
            Intent.ACTION_MY_PACKAGE_REPLACED.equals(intent.getAction()) ||
            Intent.ACTION_PACKAGE_REPLACED.equals(intent.getAction())) {
            
            try {
                // Check if driving detection was enabled before reboot
                SharedPreferences prefs = context.getSharedPreferences("DrivingDetection", Context.MODE_PRIVATE);
                boolean wasEnabled = prefs.getBoolean("service_enabled", false);
                
                Log.d(TAG, "Service was previously enabled: " + wasEnabled);
                
                if (wasEnabled) {
                    Intent serviceIntent = new Intent(context, DrivingDetectionService.class);
                    context.startForegroundService(serviceIntent);
                    Log.d(TAG, "DrivingDetectionService restarted after boot");
                }
            } catch (Exception e) {
                Log.e(TAG, "Error handling boot receiver", e);
            }
        }
    }
}