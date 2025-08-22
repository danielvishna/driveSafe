import React, { memo } from 'react';
import { Text } from 'react-native';
import { paragraphStyles } from './styles';

interface Props {
    children: React.ReactNode;
}

const Paragraph = ({ children }: Props) => <Text style={paragraphStyles.text}>{children}</Text>;

export default memo(Paragraph);
