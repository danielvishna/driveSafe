import { useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';
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
  // const { data: accountDetails } = useQuery({
  //     queryKey: ['accountDetails'],
  //     // No need for queryFn here as we're just accessing existing data
  // });
  // console.log('Dasbord accountDetails: ', accountDetails);

  // const userDetails = navigation.state?.params?.accountDetails;
  // const { username, address, limit, balance } = {
  //     username: userDetails.username || 'User',
  //     address: userDetails.address || 'Unknown',
  //     limit: userDetails.limit || -1,
  //     balance: userDetails.balance || -1,
  // };
  const getSecureStore = async (key: string): Promise<string | null> => {
    return await SecureStore.getItemAsync(key);
  };
  const [firstLoad, setFirstLoad] = useState(true);

  const username = SecureStore.getItem('username');
  const address = SecureStore.getItem('address');

  if (!username || !address) {
    return <Text style={{ color: 'red' }}>Error loading account details</Text>;
  }

  // const {
  //     data: listTransaction,
  //     isError,
  //     isLoading,
  // } = useQuery({
  //     queryKey: ['transactions', username],
  //     queryFn: () => getLastTransactions(username),
  //     enabled: !!username,
  // });
  // const [transactionList, setTransactionList] = useState<TransactionDetails[]>([]);
  const [transactionListError, setTransactionListError] = useState('');

  const queryClient = useQueryClient();

  const refetch = async () => {
    await queryClient.invalidateQueries({
      queryKey: ['transactions', username],
    });
    await queryClient.invalidateQueries({
      queryKey: ['accountDetails', username],
    });
  };
  // useEffect(() => {
  //     setFirstLoad(true);
  //     if (listTransaction?.errorMessage === '' && listTransaction!.response !== null) {
  //         setTransactionList(listTransaction!.response);
  //         setTransactionListError('');
  //     } else {
  //         if (listTransaction?.errorMessage !== '' && listTransaction?.errorMessage !== undefined) {
  //             console.log('Error Transactions response:', listTransaction);
  //             console.log('Setting transaction list error:', listTransaction?.errorMessage);
  //         }
  //         setTransactionListError(listTransaction?.errorMessage || '');
  //     }
  //     setFirstLoad(false);
  // }, [listTransaction?.errorMessage, listTransaction?.response]);

  const moveScreen = (screenName: string) => {
    navigation.navigate(screenName, {});
  };

  return (
    <Background>
      <Logo />
      {/* {isLoading || firstLoad ? ( */}
      {/* <ActivityIndicator /> */}
      {/* ) : ( */}
      {/* <> */}
      {/* <ScrollableActionMenu onPress={moveScreen} /> */}
      {/* <Header>Account Dashboard</Header> */}
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
