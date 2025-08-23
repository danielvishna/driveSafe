import { useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  Pressable,
  Platform,
} from 'react-native';
import * as Keychain from 'react-native-keychain';

// import { getLastTransactions, TransactionDetails } from '../clients/backendService';
// import { AccountOverview } from '../components/AccountOverview/AccountOverview';
import { Background } from '../components/Background/Background';
import Header from '../components/Header/Header';
import Logo from '../components/Logo/Logo';
// import { Logout } from '../components/Logout/Logout';
// import ScrollableActionMenu from '../components/ScrollableActionMenu/ScrollableActionMenu';
// import { TransactionList } from '../components/TransactionList/TransactionList';
import { DashboardProps } from '../types';

const Dashboard: React.FC<DashboardProps> = ({
  navigation,
}: DashboardProps) => {
  const [credentials, setCredentials] = useState<any>(null);
  const [touchCount, setTouchCount] = useState(0);

  useEffect(() => {
    const fetchCredentials = async () => {
      const creds = await Keychain.getGenericPassword();
      setCredentials(creds);
    };

    fetchCredentials();
  }, []);

  if (!credentials) {
    return <Text style={{ color: 'red' }}>Error loading account details</Text>;
  }

  const moveScreen = (screenName: string) => {
    navigation.navigate(screenName, {});
  };

  const handlePress = () => {
    if (Platform.OS === 'android') {
      setTouchCount(prev => prev + 1);
    }
  };

  return (
    <Background>
      <Logo />
      {/* {isLoading || firstLoad ? ( */}
      {/* <ActivityIndicator /> */}
      {/* ) : ( */}
      {/* <> */}
      {/* <ScrollableActionMenu onPress={moveScreen} /> */}
      <Header>Account Dashboard</Header>
      <Text>Welcome back!</Text>
      <Text>Your address: {credentials.username}</Text>
      {Platform.OS === 'android' && (
        <Text style={{ marginTop: 10 }} onPress={() => setTouchCount(touchCount + 1)}>Screen touches: {touchCount}</Text>
      )}
      {/* <AccountOverview /> */}
      {/* {transactionListError !== '' && <Text style={styles.error}>{transactionListError}</Text>} */}
      {/* <TransactionList username={username} transactions={transactionList} func={refetch} /> */}

      {/* {transactionListError !== null && transactionList.length === 0 && ( */}
      {/* <Text>No transactions to display</Text> */}
      {/* )} */}
      {/* <Logout navigation={navigation} /> */}
      {/* </> */}
      {/* )} */}
    </Background>
  );
};
const styles = StyleSheet.create({
  error: {
    color: 'red',
    marginTop: 10,
  },
});
export default Dashboard;
