import React, { memo } from 'react';
import { Text, View } from 'react-native';
import { TextInput as Input } from 'react-native-paper';
import { theme } from '../../core/theme';
import { textInputStyles } from './styles';

type Props = React.ComponentProps<typeof Input> & { errorText?: string };

const TextInput = ({ errorText, ...props }: Props) => (
    <View style={textInputStyles.container}>
        <Input
            style={textInputStyles.input}
            selectionColor={theme.colors.primary}
            underlineColor="transparent"
            mode="outlined"
            {...props}
        />
        {errorText ? <Text style={textInputStyles.error}>{errorText}</Text> : null}
    </View>
);

//TODO: get rid of default exports, find out if you really need memo

export default memo(TextInput);
