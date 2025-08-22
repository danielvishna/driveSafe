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
  accountTypeValidator,
  associatedAccountValidator,
  limitValidator,
  nameValidator,
  parentValidator,
  passwordValidator,
  repeatPasswordValidator,
  VaOwnerValidator,
} from '../core/validators';

type Props = {
  navigation: NavigationScreenProp<NavigationState, NavigationParams>;
};

const SignupScreen = ({ navigation }: Props) => {
  const initialState = { value: '', error: '' };
  const [username, setUserName] = useState(initialState);
  const [newPassword, setNewPassword] = useState(initialState);
  const [repeatPassword, setRepeatPassword] = useState(initialState);
  const [accountType, setAccountType] = useState(initialState);
  const [VaOwner, setVaOwner] = useState(initialState);
  const [parentAccount, setParentAccount] = useState(initialState);
  const [isLimit, setIsLimit] = useState(false);
  const [limit, setLimit] = useState(initialState);
  const [signupError, setSignupError] = useState('');
  const [allAccounts, setAllAccounts] = useState(['']);
  const [allMasterAccounts, setAllMasterAccounts] = useState(['']);
  const [associateAccounts, setAssociateAccounts] = useState(initialState);
  const [processesSignup, setProcessesSignup] = useState(false);

  const handleSignup = async (): Promise<void> => {
    // const result = await signup(
    //     username.value,
    //     newPassword.value,
    //     accountType.value,
    //     parentAccount.value,
    //     isLimit,
    //     limit.value,
    //     VaOwner.value,
    //     associateAccounts.value
    // );
    // if (result.success) {
    //     setSignupError('');
    //     navigation.navigate('LoginScreen');
    // } else {
    //     setSignupError(result.message);
    // }
  };

  const _onSignUpPressed = () => {
    const nameError = nameValidator(username.value);
    const passwordError = passwordValidator(newPassword.value);
    const repeatPasswordError = repeatPasswordValidator(
      newPassword.value,
      repeatPassword.value,
    );
    const accountTypeError = accountTypeValidator(accountType.value);

    let getError = false;

    if (passwordError || nameError || repeatPasswordError || accountTypeError) {
      setUserName({ ...username, error: nameError });
      setNewPassword({ ...newPassword, error: passwordError });
      setRepeatPassword({ ...repeatPassword, error: repeatPasswordError });
      setAccountType({ ...accountType, error: accountTypeError });
    }
    if (accountType.value === 'Child Account') {
      const parentAccountError = parentValidator(parentAccount.value);
      let limitError = '';
      if (isLimit) {
        limitError = limitValidator(limit.value) || '';
      }
      if (parentAccountError || limitError) {
        setParentAccount({ ...parentAccount, error: parentAccountError });
        setLimit({ ...limit, error: limitError });
        getError = true;
      }
    } else if (accountType.value === 'Virtual Account') {
      const VaOwnerError = VaOwnerValidator(VaOwner.value);
      const associatedAccountsError = associatedAccountValidator(
        associateAccounts.value,
        parentAccount.value,
      );

      if (VaOwnerError || associatedAccountsError) {
        setVaOwner({ ...VaOwner, error: VaOwnerError });
        setAssociateAccounts({
          ...associateAccounts,
          error: associatedAccountsError,
        });
        getError = true;
      }
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
        label="User Name"
        returnKeyType="next"
        value={username.value}
        onChangeText={text => setUserName({ value: text, error: '' })}
        error={!!username.error}
        errorText={username.error}
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
