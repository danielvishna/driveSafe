import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View, ScrollView } from 'react-native';
import { Logout } from '../components/Logout/Logout';
import { DashboardProps } from '../types';
import DrivingDetectionService, {
  DrivingData,
} from '../backend/DrivingDetectionService';
import Button from '../components/Button/Button';

const Dashboard: React.FC<DashboardProps> = ({ navigation }) => {
  const [isDriving, setIsDriving] = useState(false);
  const [isServiceRunning, setIsServiceRunning] = useState(false);
  const [locationData, setLocationData] = useState<DrivingData | null>(null);
  const [speedKmh, setSpeedKmh] = useState(0);
  const [debugMessages, setDebugMessages] = useState<string[]>([]);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);

  const addDebugMessage = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugMessages(prev => [`${timestamp}: ${message}`, ...prev.slice(0, 9)]);
  };

  useEffect(() => {
    addDebugMessage('Dashboard mounted, setting up listener...');

    const removeListener = DrivingDetectionService.addListener(
      (data: DrivingData) => {
        setIsDriving(data.isDriving);
        setLocationData(data);
        setSpeedKmh(data.speed * 3.6);
        setLastUpdateTime(new Date());

        addDebugMessage(
          `Received update: ${
            data.isDriving ? 'DRIVING' : 'NOT DRIVING'
          }, Speed: ${(data.speed * 3.6).toFixed(1)} km/h`,
        );

        if (data.isDriving && !isDriving) {
          Alert.alert(
            'Driving Detected! 🚗',
            `Speed: ${(data.speed * 3.6).toFixed(
              1,
            )} km/h - Please focus on driving safely!`,
            [{ text: 'OK' }],
          );
          addDebugMessage('Driving alert shown to user');
        }
      },
    );

    return () => {
      removeListener();
      addDebugMessage('Dashboard unmounted, listener removed');
    };
  }, [isDriving]);

  const testBroadcast = async () => {
    try {
      addDebugMessage('Testing broadcast receiver...');
      const result = await DrivingDetectionService.testBroadcast();
      addDebugMessage(`Test broadcast result: ${result}`);
      Alert.alert('Test Result', result);
    } catch (error) {
      const errorMessage = (error as Error).message;
      addDebugMessage(`Test broadcast error: ${errorMessage}`);
      Alert.alert('Test Error', errorMessage);
    }
  };

  const handleStartDetection = async () => {
    try {
      addDebugMessage('Requesting permissions...');

      const permissionResult =
        await DrivingDetectionService.requestPermissions();
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', permissionResult.message);
        addDebugMessage(`Permission denied: ${permissionResult.message}`);
        return;
      }

      addDebugMessage('Permissions granted, starting service...');

      const result = await DrivingDetectionService.startDrivingDetection();
      setIsServiceRunning(true);
      addDebugMessage(`Service started: ${result}`);
      Alert.alert('Success', result);
    } catch (error) {
      const errorMessage = (error as Error).message;
      addDebugMessage(`Error: ${errorMessage}`);
      Alert.alert('Error', errorMessage);
    }
  };

  const handleStopDetection = async () => {
    try {
      addDebugMessage('Stopping service...');
      const result = await DrivingDetectionService.stopDrivingDetection();
      setIsServiceRunning(false);
      setIsDriving(false);
      setLocationData(null);
      setSpeedKmh(0);
      setLastUpdateTime(null);
      addDebugMessage(`Service stopped: ${result}`);
      Alert.alert('Success', result);
    } catch (error) {
      const errorMessage = (error as Error).message;
      addDebugMessage(`Error stopping: ${errorMessage}`);
      Alert.alert('Error', errorMessage);
    }
  };

  const clearDebugMessages = () => {
    setDebugMessages([]);
    addDebugMessage('Debug log cleared');
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.container}>
      <Text style={styles.badge}>DriveSafe Debug</Text>

      {/* Service Control Buttons */}
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handleStartDetection}
          disabled={isServiceRunning}
          style={[
            styles.button,
            { backgroundColor: isServiceRunning ? '#666' : '#600EE6' },
          ]}
        >
          {isServiceRunning ? 'Service Running' : 'Start Detection'}
        </Button>

        <Button
          mode="outlined"
          onPress={handleStopDetection}
          disabled={!isServiceRunning}
          style={styles.button}
        >
          Stop Detection
        </Button>

        <Button
          mode="contained"
          onPress={testBroadcast}
          style={[styles.button, { backgroundColor: '#FF6B35' }]}
        >
          Test Broadcast Receiver
        </Button>

        <Button
          mode="outlined"
          onPress={clearDebugMessages}
          style={styles.button}
        >
          Clear Debug Log
        </Button>
      </View>

      {/* Status Display */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>Service Status:</Text>
        <Text
          style={[
            styles.statusValue,
            { color: isServiceRunning ? '#4CAF50' : '#f44336' },
          ]}
        >
          {isServiceRunning ? 'ACTIVE' : 'STOPPED'}
        </Text>
      </View>

      {/* Last Update Time */}
      {lastUpdateTime && (
        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Last Update:</Text>
          <Text style={styles.statusValue}>
            {lastUpdateTime.toLocaleTimeString()}
          </Text>
        </View>
      )}

      {/* Speed Display */}
      <Text style={styles.speedLabel}>Current Speed:</Text>
      <Text style={styles.speed}>
        {speedKmh > 1 ? speedKmh.toFixed(1) : '0.0'}
      </Text>
      <Text style={styles.unit}>km/h</Text>

      {/* Driving Status */}
      {isDriving && (
        <View style={styles.drivingAlert}>
          <Text style={styles.drivingText}>🚗 DRIVING DETECTED</Text>
          <Text style={styles.safetyText}>Stay focused on the road!</Text>
        </View>
      )}

      {/* Location Info from Background Service */}
      {locationData && isServiceRunning && (
        <View style={styles.locationContainer}>
          <Text style={styles.debugTitle}>Background Service Data:</Text>
          <Text style={styles.locationText}>
            Location: {locationData.latitude.toFixed(6)},{' '}
            {locationData.longitude.toFixed(6)}
          </Text>
          <Text style={styles.locationText}>
            Raw Speed: {locationData.speed.toFixed(2)} m/s (
            {(locationData.speed * 3.6).toFixed(1)} km/h)
          </Text>
          <Text style={styles.locationText}>
            Status: {locationData.isDriving ? 'DRIVING' : 'NOT DRIVING'}
          </Text>
        </View>
      )}

      {/* Debug Messages */}
      <View style={styles.debugContainer}>
        <Text style={styles.debugTitle}>Debug Log:</Text>
        <ScrollView style={styles.debugScrollView} nestedScrollEnabled={true}>
          {debugMessages.map((message, index) => (
            <Text key={index} style={styles.debugMessage}>
              {message}
            </Text>
          ))}
          {debugMessages.length === 0 && (
            <Text style={styles.debugMessage}>No debug messages yet...</Text>
          )}
        </ScrollView>
      </View>

      {/* Tips */}
      <Text style={styles.tip}>
        🚨 Detection threshold lowered to 18 km/h for testing
      </Text>
      <Text style={styles.tip}>
        📱 Check PowerShell: adb logcat | Select-String
        "DrivingDetectionService"
      </Text>
      <Text style={styles.tip}>
        🔧 Make sure Location is set to "Allow all the time" in app settings
      </Text>

      {/* Logout Button */}
      <View style={styles.logoutContainer}>
        <Logout navigation={navigation} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0b1220',
  },
  container: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 20,
    paddingBottom: 100,
  },
  badge: {
    color: '#9bb7ff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 15,
  },
  button: {
    marginVertical: 3,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    width: '100%',
    justifyContent: 'center',
  },
  statusLabel: {
    color: '#9bb7ff',
    fontSize: 14,
    marginRight: 8,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  speedLabel: {
    color: '#9bb7ff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 5,
  },
  speed: {
    color: 'white',
    fontSize: 48,
    fontWeight: '600',
    letterSpacing: 1,
    textAlign: 'center',
    marginVertical: 5,
  },
  unit: {
    color: '#9bb7ff',
    fontSize: 18,
    marginBottom: 15,
    textAlign: 'center',
  },
  drivingAlert: {
    backgroundColor: '#ff4444',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
    width: '100%',
  },
  drivingText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  safetyText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 5,
  },
  locationContainer: {
    backgroundColor: 'rgba(155, 183, 255, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    width: '100%',
  },
  locationText: {
    color: '#9bb7ff',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 3,
  },
  debugContainer: {
    backgroundColor: 'rgba(155, 183, 255, 0.05)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    width: '100%',
    height: 200,
  },
  debugScrollView: {
    flex: 1,
  },
  debugTitle: {
    color: '#9bb7ff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  debugMessage: {
    color: '#7f8aa3',
    fontSize: 11,
    marginBottom: 3,
    fontFamily: 'monospace',
  },
  tip: {
    color: '#7f8aa3',
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 8,
  },
  logoutContainer: {
    width: '80%',
    marginTop: 20,
  },
});

export default Dashboard;
