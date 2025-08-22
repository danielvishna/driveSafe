import React, { memo } from 'react';
import {
  NavigationParams,
  NavigationScreenProp,
  NavigationState,
} from 'react-navigation';
import { Background } from '../components/Background/Background';
import Button from '../components/Button/Button';
import Header from '../components/Header/Header';
import Logo from '../components/Logo/Logo';
import Paragraph from '../components/Paragraph/Paragraph';

type Props = {
  navigation: NavigationScreenProp<NavigationState, NavigationParams>;
};

const HomeScreen = ({ navigation }: Props) => (
  // const HomeScreen = () => (

  <Background>
    <Logo />
    <Header>Home page</Header>

    <Paragraph>The easiest way to manage money</Paragraph>
    <Button mode="contained" onPress={() => {navigation.navigate('LoginScreen')}}>
      Login
    </Button>
    <Button mode="outlined" onPress={() => navigation.navigate('SignupScreen')}>
      Sign Up
    </Button>
  </Background>
);

export default memo(HomeScreen);
