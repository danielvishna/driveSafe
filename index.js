/**
 * @format
 */
import 'react-native-gesture-handler'; // <-- Add this as the first import
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
