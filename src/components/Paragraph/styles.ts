import { StyleSheet } from 'react-native';
import { theme } from '../../core/theme';

export const paragraphStyles = StyleSheet.create({
    text: {
        fontSize: 16,
        lineHeight: 26,
        color: theme.colors.secondary,
        textAlign: 'center',
        marginBottom: 14,
    },
});
