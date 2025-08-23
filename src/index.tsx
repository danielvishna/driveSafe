import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import 'react-native-gesture-handler';

import {
  // ForgotPasswordScreen,
  HomeScreen,
  // Dashboard,
  // InitiatedRequests,
  // LoadBalance,
  LoginScreen,
  // PullMoney,
  SignupScreen,
  // TransferMoney,
} from './screens/index';

const AppNavigator = createStackNavigator(
  {
    HomeScreen,
    LoginScreen,
    SignupScreen,
    // ForgotPasswordScreen,
    // Dashboard,
    // LoadBalance,
    // InitiatedRequests,
    // TransferMoney,
    // PullMoney,
    // AssignedRequests,
  },
  {
    initialRouteName: 'HomeScreen',
    headerMode: 'none',
  },
);

export default createAppContainer(AppNavigator);
