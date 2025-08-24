import { useQueryClient } from '@tanstack/react-query';
import * as Keychain from 'react-native-keychain';
import { DashboardProps } from '../../types';
import Button from '../Button/Button';

export const Logout = ({ navigation }: DashboardProps) => {
    const queryClient = useQueryClient();

    return (
        <Button
            mode="outlined"
            onPress={() => {
                try{
                    Keychain.resetGenericPassword();
                    navigation.navigate('HomeScreen');
                } catch (error) {
                    console.error('Error resetting Keychain:', error);
                }
                
            }}
        >
            Logout
        </Button>
    );
};
