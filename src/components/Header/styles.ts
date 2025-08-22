import { StyleSheet } from 'react-native';
import { theme } from '../../core/theme';

export const headerStyles = StyleSheet.create({
    header: {
        fontSize: 26,
        color: theme.colors.primary,
        fontWeight: 'bold',
        paddingVertical: 14,
    },
});
