import React, { memo, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  NavigationParams,
  NavigationScreenProp,
  NavigationState,
} from 'react-navigation';
// import { getAllAccounts, getAllMangerAccounts, signup } from '../clients/backendService';
import { BackButton } from '../components/BackButton/BackButton';
import { Background } from '../components/Background/Background';
import Button from '../components/Button/Button';
import Header from '../components/Header/Header';
import Logo from '../components/Logo/Logo';
import TextInput from '../components/TextInput/TextInput';
import { theme } from '../core/theme';
import {
  emailValidator,
  passwordValidator,
  repeatPasswordValidator,
} from '../core/validators';
import { signup } from '../backend/backendService';

type Props = {
  navigation: NavigationScreenProp<NavigationState, NavigationParams>;
};

const SignupScreen = ({ navigation }: Props) => {
  const initialState = { value: '', error: '' };
  const [email, setEmail] = useState(initialState);
  const [newPassword, setNewPassword] = useState(initialState);
  const [repeatPassword, setRepeatPassword] = useState(initialState);
  const [signupError, setSignupError] = useState('');
  const [processesSignup, setProcessesSignup] = useState(false);

  const handleSignup = async (): Promise<void> => {
    const result = await signup(email.value, newPassword.value);
    if (result.success && result.userId) {
      setSignupError('');
      navigation.navigate('LoginScreen');
    } else {
      setSignupError(result.message);
    }
  };

  const _onSignUpPressed = () => {
    const emailError = emailValidator(email.value);
    const passwordError = passwordValidator(newPassword.value);
    const repeatPasswordError = repeatPasswordValidator(
      newPassword.value,
      repeatPassword.value,
    );
    let getError = false;

    if (passwordError || emailError || repeatPasswordError) {
      setEmail({ ...email, error: emailError });
      setNewPassword({ ...newPassword, error: passwordError });
      setRepeatPassword({ ...repeatPassword, error: repeatPasswordError });
      getError = true;
    }
    if (!getError) {
      setProcessesSignup(true);
      handleSignup().then(() => {
        setProcessesSignup(false);
      });
    }
  };

  return (
    <Background>
      <BackButton goBack={() => navigation.navigate('HomeScreen')} />

      <Logo />

      <Header>Create Account</Header>

      <TextInput
        label="email"
        returnKeyType="next"
        keyboardType="email-address"
        value={email.value}
        onChangeText={text => setEmail({ value: text, error: '' })}
        error={!!email.error}
        errorText={email.error}
      />

      <TextInput
        label="Password"
        returnKeyType="done"
        value={newPassword.value}
        onChangeText={text => setNewPassword({ value: text, error: '' })}
        error={!!newPassword.error}
        errorText={newPassword.error}
        secureTextEntry
      />

      <TextInput
        label="Repeat the Password"
        returnKeyType="done"
        value={repeatPassword.value}
        onChangeText={text => setRepeatPassword({ value: text, error: '' })}
        error={!!repeatPassword.error}
        errorText={repeatPassword.error}
        secureTextEntry
      />

      <Button mode="contained" onPress={_onSignUpPressed} style={styles.button}>
        Sign Up
      </Button>
      {signupError ? <Text style={styles.error}>{signupError}</Text> : null}
      {processesSignup && <ActivityIndicator size="small" color="#0000ff" />}

      <View style={styles.row}>
        <Text style={styles.label}>Already have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')}>
          <Text style={styles.link}>Login</Text>
        </TouchableOpacity>
      </View>
    </Background>
  );
};

const styles = StyleSheet.create({
  label: {
    color: theme.colors.secondary,
  },
  button: {
    marginTop: 24,
  },
  row: {
    flexDirection: 'row',
    marginTop: 4,
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

export default memo(SignupScreen);
