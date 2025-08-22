import { Platform, StatusBar, StyleSheet } from 'react-native';

export const backButtonStyles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
        left: 10,
    },
    image: {
        width: 24,
        height: 24,
    },
});
