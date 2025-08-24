import React, { useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import Geolocation, {
  GeoPosition,
  GeoError,
} from 'react-native-geolocation-service';
import { PERMISSIONS, RESULTS, check, request } from 'react-native-permissions';
import { Logout } from '../components/Logout/Logout';
import { DashboardProps } from '../types';
import * as Keychain from 'react-native-keychain';

function mpsToKmh(mps?: number | null) {
  if (mps == null || Number.isNaN(mps)) return 0;
  return Math.max(0, mps * 3.6);
}

async function ensureLocationPermission(): Promise<boolean> {
  const perm =
    Platform.OS === 'ios'
      ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
      : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

  let res = await check(perm);
  if (res === RESULTS.DENIED) {
    res = await request(perm);
  }
  return res === RESULTS.GRANTED || res === RESULTS.LIMITED;
}

const Dashboard: React.FC<DashboardProps> = ({ navigation }) => {
  const [granted, setGranted] = useState<boolean | null>(null);
  const [speedKmh, setSpeedKmh] = useState(0);
  const watchId = useRef<number | null>(null);
  const buffer = useRef<number[]>([]);
  const [credentials, setCredentials] = useState<any>(null);
  // async function fetchCredentials(): Promise<void> {
  //   const creds = await Keychain.getGenericPassword();
  //   setCredentials(creds);
  // }

  const moveScreen = (screenName: string) => {
    navigation.navigate(screenName, {});
  };

  const maxSamples = 5;
  useEffect(() => {
    (async () => {
      const ok = await ensureLocationPermission();
      setGranted(ok);
      if (!ok) return;
      // fetchCredentials();

      watchId.current = Geolocation.watchPosition(
        (pos: GeoPosition) => {
          const v = mpsToKmh(pos.coords.speed);
          buffer.current.push(v);
          if (buffer.current.length > maxSamples) buffer.current.shift();
          const avg =
            buffer.current.reduce((a, b) => a + b, 0) / buffer.current.length;
          console.log(
            'New speed',
            v,
            'buffer',
            buffer.current,
            'avg',
            avg,
            buffer,
          );
          console.log(pos);
          setSpeedKmh(Number.isFinite(avg) ? avg : 0);
        },
        (err: GeoError) => {
          console.warn('Location error', err);
        },
        {
          enableHighAccuracy: true,
          distanceFilter: 0, // meters
          interval: 100, // Android
          fastestInterval: 200, // Android
          showsBackgroundLocationIndicator: false, // iOS
          forceRequestLocation: true,
          useSignificantChanges: false,
        },
      );
    })();

    return () => {
      if (watchId.current != null) {
        Geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
    };
  }, []);

  // if (!credentials) {
  //   return <Text style={{ color: 'red' }}>Error loading account details</Text>;
  // }

  if (granted === false) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Location permission needed</Text>
        <Text>Enable location to show current speed.</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Text style={styles.badge}>DriveSafe</Text>
      <Logout navigation={navigation} />
      <Text style={styles.speed}>{speedKmh > 5 ? speedKmh.toFixed(1) : 0}</Text>
      <Text style={styles.unit}>km/h</Text>
      {speedKmh > 5 && (
        <Text style={{ color: 'orange', fontSize: 20, marginBottom: 8 }}>
          🚗 You are driving!
        </Text>
      )}
      <Text style={styles.tip}>
        Tip: keep the phone near a window for better GPS.
      </Text>
      {/* <Text style={styles.tip}>Your address: {credentials.username}</Text> */}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0b1220',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  badge: { color: '#9bb7ff', fontSize: 18, marginBottom: 8 },
  speed: { color: 'white', fontSize: 96, fontWeight: '600', letterSpacing: 1 },
  unit: { color: '#9bb7ff', fontSize: 24, marginTop: -8, marginBottom: 24 },
  tip: { color: '#7f8aa3' },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: { fontSize: 20, marginBottom: 8, fontWeight: '600' },
});
export default Dashboard;
