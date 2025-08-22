import React, { memo } from 'react';
import { Image } from 'react-native';
import { logoStyles } from './styles';

const Logo = () => <Image source={require('../../assets/logo.png')} style={logoStyles.image} />;

export default memo(Logo);
