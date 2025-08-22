import React from 'react';
import { ImageBackground, KeyboardAvoidingView } from 'react-native';
import { backgroundStyles } from './styles';
interface Props {
    children: React.ReactNode;
}

export const Background = ({ children }: Props) => (
    <ImageBackground
        source={require('../../assets/background_dot.png')}
        resizeMode="repeat"
        style={backgroundStyles.background}
    >
        <KeyboardAvoidingView style={backgroundStyles.container} behavior="padding">
            {children}
        </KeyboardAvoidingView>
    </ImageBackground>
);
