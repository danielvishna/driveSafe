import { NativeModules, DeviceEventEmitter, PermissionsAndroid, Platform } from 'react-native';

const { DrivingDetection } = NativeModules;

export interface DrivingData {
  isDriving: boolean;
  speed: number;
  latitude: number;
  longitude: number;
}

type DrivingStatusListener = (data: DrivingData) => void;

class DrivingDetectionService {
  private isDriving = false;
  private listeners: DrivingStatusListener[] = [];
  private drivingStatusListener: any;

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners() {
    // Listen for driving status changes from the background service
    this.drivingStatusListener = DeviceEventEmitter.addListener(
      'DrivingStatusChanged',
      (data: DrivingData) => {
        this.isDriving = data.isDriving;
        this.notifyListeners(data);
      }
    );
  }

  // Request necessary permissions for background location
  async requestPermissions(): Promise<{ granted: boolean; message: string }> {
    if (Platform.OS !== 'android') {
      return { granted: false, message: 'Only Android is supported' };
    }

    try {
      const permissions = [
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
      ];

      // Add background location permission for Android 10+
      if (Platform.Version >= 29) {
        permissions.push(PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION);
      }

      const granted = await PermissionsAndroid.requestMultiple(permissions);

      const allGranted = Object.values(granted).every(
        permission => permission === PermissionsAndroid.RESULTS.GRANTED
      );

      if (!allGranted) {
        return { 
          granted: false, 
          message: 'Location permissions are required for driving detection' 
        };
      }

      return { granted: true, message: 'All permissions granted' };
    } catch (error) {
      return { granted: false, message: `Permission error: ${error}` };
    }
  }

  // Start the background driving detection service
  async startDrivingDetection(): Promise<string> {
    return new Promise((resolve, reject) => {
      DrivingDetection.startDrivingDetection((error: string | null, result: string) => {
        if (error) {
          reject(new Error(error));
        } else {
          resolve(result);
        }
      });
    });
  }

  // Stop the background driving detection service
  async stopDrivingDetection(): Promise<string> {
    return new Promise((resolve, reject) => {
      DrivingDetection.stopDrivingDetection((error: string | null, result: string) => {
        if (error) {
          reject(new Error(error));
        } else {
          resolve(result);
        }
      });
    });
  }

  // Check if location permission is granted
  async hasLocationPermission(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      DrivingDetection.hasLocationPermission((error: string | null, hasPermission: boolean) => {
        if (error) {
          reject(new Error(error));
        } else {
          resolve(hasPermission);
        }
      });
    });
  }

  // Add listener for driving status changes
  addListener(callback: DrivingStatusListener): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  // Notify all listeners about driving status changes
  private notifyListeners(data: DrivingData) {
    this.listeners.forEach(callback => {
      callback(data);
    });
  }

  // Get current driving status
  getCurrentDrivingStatus(): boolean {
    return this.isDriving;
  }

  // Cleanup
  destroy() {
    if (this.drivingStatusListener) {
      this.drivingStatusListener.remove();
    }
    this.listeners = [];
  }
}

// Export singleton instance
export default new DrivingDetectionService();