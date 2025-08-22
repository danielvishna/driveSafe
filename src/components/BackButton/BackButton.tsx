import React from 'react';
import { Image, SafeAreaView, TouchableOpacity } from 'react-native';
import { backButtonStyles } from './styles';

interface BackButtonProps {
    goBack: () => void;
}

export const BackButton = ({ goBack }: BackButtonProps) => (
    <SafeAreaView style={backButtonStyles.container}>
        <TouchableOpacity onPress={goBack} style={backButtonStyles.container}>
            <Image style={backButtonStyles.image} source={require('../../assets/arrow_back.png')} />
        </TouchableOpacity>
    </SafeAreaView>
);
