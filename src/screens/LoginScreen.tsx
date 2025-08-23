import { StackNavigationProp } from '@react-navigation/stack';
// import * as SecureStore from 'expo-secure-store';
import React, { memo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { authenticateUser, getAccountDetails } from '../backend/backendService';
import { BackButton } from '../components/BackButton/BackButton';
import { Background } from '../components/Background/Background';
import Button from '../components/Button/Button';
import Header from '../components/Header/Header';
import Logo from '../components/Logo/Logo';
import TextInput from '../components/TextInput/TextInput';
import { theme } from '../core/theme';
import { passwordValidator, usernameValidator } from '../core/validators';
import { RootStackParamList } from '../types';
type LoginScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'LoginScreen'
>;

type Props = {
  navigation: LoginScreenNavigationProp;
};

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [username, setUsername] = useState({ value: '', error: '' });
  const [password, setPassword] = useState({ value: '', error: '' });
  const [logInError, setLogInError] = useState('');
  const [_isLoggedIn, setIsLoggedIn] = useState(false);
  const handleLogin = async (
    username: string,
    password: string,
  ): Promise<void> => {
    const result = await authenticateUser(username, password);
    if (result.success && result.data) {
      console.log('Login successful, fetching account details...');
      //   try {
      //     // Fetch new account details
      //     const newAccountDetails = await getAccountDetails(result.data);

      //     if (newAccountDetails && newAccountDetails.response !== null) {
      //       await SecureStore.setItemAsync('username', username);
      //       await SecureStore.setItemAsync(
      //         'address',
      //         result.response!.access_token,
      //       );

      //       setIsLoggedIn(true);
      //       setLogInError('');
      //       navigation.push('Dashboard');
      //     } else {
      //       setIsLoggedIn(false);
      //       setLogInError(newAccountDetails?.errorMessage || 'Unknown error');
      //     }
      //   } catch (error) {
      //     console.error('Error fetching account details:', error);
      //     setIsLoggedIn(false);
      //     setLogInError('Error fetching account details');
      //   }
    } else {
      setIsLoggedIn(false);
      setLogInError(result.message);
    }
  };

  const _onLoginPressed = async () => {
    const usernameError = usernameValidator(username.value);
    const passwordError = passwordValidator(password.value);

    if (usernameError || passwordError) {
      setUsername({ ...username, error: usernameError });
      setPassword({ ...password, error: passwordError });
      return;
    }
    // handleLogin(username.value, password.value);
  };
  return (
    <Background>
      <BackButton goBack={() => navigation.navigate('HomeScreen')} />

      <Logo />

      <Header>Welcome back.</Header>

      <TextInput
        label="Username"
        returnKeyType="next"
        value={username.value}
        onChangeText={text => setUsername({ value: text, error: '' })}
        error={!!username.error}
        errorText={username.error}
        autoCapitalize="none"
        textContentType="username"
      />

      <TextInput
        label="Password"
        returnKeyType="done"
        value={password.value}
        onChangeText={text => setPassword({ value: text, error: '' })}
        error={!!password.error}
        errorText={password.error}
        secureTextEntry
      />

      <View style={styles.forgotPassword}>
        <TouchableOpacity
          onPress={() => navigation.navigate('ForgotPasswordScreen')}
        >
          <Text style={styles.label}>Forgot your password?</Text>
        </TouchableOpacity>
      </View>

      <Button mode="contained" onPress={_onLoginPressed}>
        Login
      </Button>
      {logInError ? <Text style={styles.error}>{logInError}</Text> : null}

      <View style={styles.row}>
        <Text style={styles.label}>Don’t have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('SignupScreen')}>
          <Text style={styles.link}>Sign up</Text>
        </TouchableOpacity>
      </View>
    </Background>
  );
};

const styles = StyleSheet.create({
  forgotPassword: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    marginTop: 4,
  },
  label: {
    color: theme.colors.secondary,
  },
  link: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  error: {
    color: 'red',
    marginTop: 10,
  },
});

export default memo(LoginScreen);
