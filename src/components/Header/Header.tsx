import React, { memo } from 'react';
import { Text } from 'react-native';
import { headerStyles } from './styles';

interface Props {
    children: React.ReactNode;
}

const Header = ({ children }: Props) => <Text style={headerStyles.header}>{children}</Text>;

export default memo(Header);
