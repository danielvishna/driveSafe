import React, { memo } from 'react';
import { Button as PaperButton } from 'react-native-paper';
import { theme } from '../../core/theme';
import { buttonStyles } from './styles';

interface ButtonProps extends React.ComponentProps<typeof PaperButton> {}

const Button = ({ mode, style, children, ...props }: ButtonProps) => (
    <PaperButton
        style={[buttonStyles.button, mode === 'outlined' && { backgroundColor: theme.colors.surface }, style]}
        labelStyle={buttonStyles.text}
        mode={mode}
        {...props}
    >
        {children}
    </PaperButton>
);

export default memo(Button);
