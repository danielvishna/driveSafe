import axios, { AxiosError, isAxiosError } from 'axios';

interface Payload {
  username: string;
  password: string;
  parent?: string | null;
  limit?: number | null;
  is_virtual: boolean;
  va_owner: string;
  associated_accounts: string[];
}

const CONNECTION_TIMEOUT = 10000; // 10 seconds
const STATUS_OK = 200;
const STATUS_SERVERERROR = 500;
const STATUS_BADREQUEST = 400;

const axiosInstance = axios.create({
  baseURL: 'http://192.168.1.193:3001',
  timeout: CONNECTION_TIMEOUT,
  headers: {
    Connection: 'close', // Force closing the connection after each request
  },
});

export const authenticateUser = async (
  email: string,
  password: string,
): Promise<{
  success: boolean;
  message: string;
  accessToken: string | null;
}> => {
  try {
    const result = await axiosInstance.post('/auth/login', { email, password });
    return {
      success: result.status === 201,
      message: result.status === 201 ? 'Login successful' : 'Login failed',
      accessToken: result.data?.access_token || null,
    };
  } catch (error) {
    console.error('Error during authentication:', error);
    return {
      success: false,
      message: 'Login failed',
      accessToken: null,
    };
  }
};
const getAccounts = async (
  url: string,
): Promise<{
  status: number;
  content: string[];
}> => {
  try {
    const response = await axiosInstance.get(url);
    if (response.status === STATUS_OK) {
      return { status: response.status, content: response.data['response'] };
    }
    return { status: STATUS_SERVERERROR, content: [] };
  } catch {
    return { status: STATUS_SERVERERROR, content: [] };
  }
};

export const getAllAccounts = async (): Promise<{
  status: number;
  content: string[];
}> => {
  return getAccounts('/getallaccounts');
};

export const getAllMangerAccounts = async (): Promise<{
  status: number;
  content: string[];
}> => {
  return getAccounts('/getallMasteraccounts');
};

const createPayload = (
  new_username: string,
  new_password: string,
  account_type: string,
  parent_username?: string,
  sub_account_limit?: number,
  virtual_owner?: string,
  associated_accounts: string[] = [],
): Payload => {
  return {
    username: new_username,
    password: new_password,
    parent: account_type === 'Child Account' ? parent_username : null,
    limit: account_type === 'Child Account' ? sub_account_limit : null,
    is_virtual: account_type === 'Virtual Account',
    va_owner: account_type === 'Virtual Account' ? virtual_owner || '' : '',
    associated_accounts:
      account_type === 'Virtual Account' ? associated_accounts : [],
  };
};

export const signup = async (
  username: string,
  newPassword: string,
  accountType: string,
  parentAccount: string,
  isLimit: boolean,
  limit: string,
  vaOwner: string,
  associateAccounts: string,
) => {
  const associatedAccountsList = associateAccounts
    .split(',')
    .map(account => account.trim())
    .filter(account => account !== '');
  const url =
    accountType === 'Child Account' ? '/create_sub_account' : '/signup';
  const payload = createPayload(
    username,
    newPassword,
    accountType,
    parentAccount,
    parseInt(limit),
    vaOwner,
    associatedAccountsList,
  );

  try {
    const response = await axiosInstance.post(url, payload, {
      validateStatus: function (status: number) {
        return status < 500; // Allows 400 status to be handled in the try block
      },
    });

    if (
      response.status === STATUS_OK &&
      typeof response.data === 'object' &&
      response.data !== null
    ) {
      return { success: true, message: 'Signup successful' };
    } else if (response.status === STATUS_BADREQUEST) {
      // Handle the 400 Bad Request for invalid credentials
      return {
        success: false,
        message: 'The username is already taken',
      };
    } else {
      console.log('Authentication failed: Unexpected response');
      return {
        success: false,
        message: 'Signup failed. Unexpected server response.',
      };
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      console.error('Axios error:', axiosError.message);
      console.error('Axios error code:', axiosError.code);

      if (axiosError.code === 'ECONNABORTED') {
        return {
          success: false,
          message: 'Request timed out. Please try again.',
        };
      } else if (axiosError.response) {
        // This block will handle server errors (status >= 500)
        console.error('Response data:', axiosError.response.data);
        console.error('Response status:', axiosError.response.status);
        return {
          success: false,
          message: `Server error: ${axiosError.response.status}`,
        };
      } else if (axiosError.request) {
        return {
          success: false,
          message:
            'No response received from server. Please check your connection.',
        };
      } else {
        return {
          success: false,
          message: 'An unexpected error occurred. Please try again.',
        };
      }
    } else {
      console.error('Non-Axios error:', error);
      return {
        success: false,
        message: 'An unexpected error occurred. Please try again.',
      };
    }
  }
};
export interface AccountDetails {
  address: string;
  username: string;
  balance: number;
  limit: bigint;
  childrenAccounts: [string];
  derivationPath: string;
  isUnlimited: boolean;
  isMasterAccount: boolean;
  parentAddress: string;
}

export const getAccountDetails = async (
  address: string,
): Promise<{ response: AccountDetails | null; errorMessage: string }> => {
  try {
    const response = await axiosInstance.post(`/getaccountdetails`, {
      address,
    });

    const accountDetails: AccountDetails = {
      address: address,
      username: response.data.response[0],
      balance: response.data.response[1],
      limit: BigInt(response.data.response[2]),
      childrenAccounts: response.data.response[3],
      derivationPath: response.data.response[4],
      isUnlimited: response.data.response[5],
      isMasterAccount: response.data.response[6],
      parentAddress: response.data.response[7],
    };

    return { response: accountDetails, errorMessage: '' };
  } catch {
    return {
      response: null,
      errorMessage: "There's been an error. Please try again later",
    };
  }
};

export const getBalanceLimit = async (
  address: string,
): Promise<{ balance: number; limit: string; errorMessage: string }> => {
  let balance = -1;
  let limit = 'Infinity';
  let errorMessage = '';

  await getAccountDetails(address)
    .then(data => {
      if (data.response !== null && data.errorMessage === '') {
        const isUnlimited = data.response.isUnlimited;
        limit = isUnlimited ? 'Infinity' : data.response.limit.toString();
        balance = data.response.balance;
        errorMessage = data.errorMessage;
      } else {
        errorMessage = "There's been an error. Please try again later";
      }
    })
    .catch(err => {
      errorMessage = err;
      balance = -15;
    });
  return { balance: balance, limit: limit, errorMessage: errorMessage };
};
export interface TransactionDetails {
  amount: number;
  company: string;
  from_address: string;
  handler_address: string;
  handler_user: string;
  id: number;
  initiator_level: number;
  is_approved: boolean;
  from_user: string;
  last_timestamp: number;
  status: string;
  to_address: string;
  to_user: string;
  txn_type: string;
}

interface TransactionGroup {
  self_initiated_pending_transactions: TransactionDetails[];
  self_initiated_approved_transactions: TransactionDetails[];
  self_initiated_denied_transactions: TransactionDetails[];
  handler_assigned_pending_transactions: TransactionDetails[];
  handler_assigned_approved_transactions: TransactionDetails[];
  handler_assigned_denied_transactions: TransactionDetails[];
  handler_assigned_log_transactions: TransactionDetails[];
}

interface TransactionResponse {
  response: TransactionGroup;
}

const getTransactions = async (
  username: string,
): Promise<{ response: TransactionGroup | null; errorMessage: string }> => {
  try {
    const response = await axiosInstance.post('/gettransactions', {
      master_account: username,
    });

    if (response.status === 200) {
      return { response: response.data.response, errorMessage: '' };
    } else {
      return { response: null, errorMessage: 'Failed to fetch transactions.' };
    }
  } catch (error) {
    console.error('Error fetching transactions:', error);
    let errorMessage = 'An error occurred while fetching transactions.';
    if (isAxiosError(error)) {
      errorMessage = error.response?.data?.message || error.message;
    }
    return { response: null, errorMessage };
  }
};

export enum RequestType {
  All,
  Initiated,
  Assigned,
}
const processTransactions = (
  transactions: TransactionGroup,
  transactionsType: RequestType,
): TransactionDetails[] => {
  // Combine all transaction arrays
  let allTransactions;
  if (transactionsType === RequestType.All) {
    allTransactions = [
      ...transactions.self_initiated_approved_transactions,
      ...transactions.self_initiated_denied_transactions,
      ...transactions.self_initiated_pending_transactions,
      ...transactions.handler_assigned_log_transactions,
    ];
  } else if (transactionsType === RequestType.Assigned) {
    allTransactions = [
      ...transactions.handler_assigned_approved_transactions,
      ...transactions.handler_assigned_denied_transactions,
      ...transactions.handler_assigned_pending_transactions,
    ];
  } else {
    allTransactions = [
      ...transactions.self_initiated_approved_transactions,
      ...transactions.self_initiated_denied_transactions,
      ...transactions.self_initiated_pending_transactions,
    ];
  }

  // Sort transactions by date (most recent first)
  const sortedTransactions = allTransactions.sort(
    (a, b) => b.last_timestamp - a.last_timestamp,
  );
  return sortedTransactions;

  // // Select only the required fields
  // const simplifiedTransactions = sortedTransactions.map((transaction) => ({
  //     amount: transaction.amount,
  //     from_user: transaction.from_user,
  //     // last_timestamp: new Date(transaction.last_timestamp * 1000),
  //     last_timestamp: transaction.last_timestamp,
  //     status: transaction.status,
  //     to_user: transaction.to_user,
  //     txn_type: transaction.txn_type,
  // }));

  // return simplifiedTransactions;
};

export const getTransactionsByType = async (
  username: string,
  type: RequestType,
): Promise<{ response: TransactionDetails[] | null; errorMessage: string }> => {
  const response = await getTransactions(username);
  if (response.errorMessage === '' && response.response !== null) {
    return {
      response: processTransactions(response.response, type),
      errorMessage: '',
    };
  } else {
    return { response: null, errorMessage: response.errorMessage };
  }
};

export const getLastTransactions = async (
  username: string,
): Promise<{ response: TransactionDetails[] | null; errorMessage: string }> => {
  const response = await getTransactions(username);
  if (response.errorMessage === '' && response.response !== null) {
    return {
      response: processTransactions(response.response, RequestType.All).slice(
        0,
        5,
      ),
      errorMessage: '',
    };
  } else {
    return { response: null, errorMessage: response.errorMessage };
  }
};
interface AxiosErrorResponse {
  response: {
    data: {
      message: string;
    };
  };
}

export const LoadBalanceBack = async (
  address: string,
  amountToLoad: number,
  username: string,
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await axiosInstance.post('/loadbalance', {
      address: address,
      amount: amountToLoad,
      username: username,
    });
    if (response.status === 200) {
      return { success: true, message: 'Balance loaded successfully!' };
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<AxiosErrorResponse>;
      if (axiosError.response?.data.response) {
        return {
          success: false,
          message: String(axiosError.response.data?.response),
        };
      }
    }
  }
  return {
    success: false,
    message: 'Failed to load balance. Please try again later',
  };
};
export const performTransaction = async (
  operation: string,
  fromUser: string,
  toUser: string,
  amount: string,
): Promise<{ success: boolean; message: string }> => {
  let url = '';
  if (operation === 'transfer') {
    url = 'transfer';
  } else if (operation === 'pull') {
    url = 'pullmoney';
  } else {
    return {
      success: false,
      message: `Failed to ${operation}. Please try again later`,
    };
  }
  try {
    const response = await axiosInstance.post(url, {
      from_username: fromUser,
      amount: amount,
      to_username: toUser,
    });
    if (response.status === 200) {
      return { success: true, message: `${operation} successfully!` };
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<AxiosErrorResponse>;
      if (axiosError.response?.data.response) {
        return {
          success: false,
          message: String(axiosError.response.data?.response),
        };
      }
    }
  }
  return {
    success: false,
    message: `Failed to ${operation}. Please try again later`,
  };
};
export const requestApproval = async (
  operation: string,
  fromUser: string,
  toUser: string,
  amount: string,
): Promise<{ success: boolean; message: string }> => {
  let url = 'request_transaction';
  try {
    const response = await axiosInstance.post(url, {
      operation: operation,
      from_username: fromUser,
      amount: Number(amount),
      to_username: toUser,
    });
    if (response.status === 200) {
      return { success: true, message: `Request ${operation} successful!` };
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<AxiosErrorResponse>;
      if (axiosError.response?.data.response) {
        return {
          success: false,
          message: String(axiosError.response.data?.response),
        };
      }
    }
  }
  return {
    success: false,
    message: `Failed to request approval ${operation}. Please try again later`,
  };
};
interface AccountNameBalance {
  accountName: string;
  balance: string;
}

export const getOwnedVirtualAccounts = async (
  username: string,
): Promise<{
  status: number;
  content: AccountNameBalance[];
}> => {
  const url = 'getOwnedVirtualAccounts';
  const { data, status } = await axiosInstance.post(url, {
    username: username,
  });

  if (status === STATUS_OK) {
    const accountBalancePromises = data.users.map(async (va: string) => {
      const balanceResult = await getAccountBalance(va);

      return {
        accountName: va,
        balance: balanceResult.balance,
      };
    });

    const accountBalance = await Promise.all(accountBalancePromises);
    return { content: accountBalance, status };
  } else {
    console.log('Error status:', status); // Log error status
    return { content: [], status };
  }
};

export const getAccountBalance = async (
  accountName: string,
): Promise<{
  balance: string;
}> => {
  const url = 'getAccountBalance';
  const { data, status } = await axiosInstance.post(url, {
    account: accountName,
  });

  if (status === STATUS_OK) {
    return { balance: data.balance };
  } else {
    return { balance: '-1' };
  }
};

export const denyTransaction = async (
  txn: TransactionDetails,
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await axiosInstance.post('/deny_transaction', {
      denier: txn.handler_user,
      txn: txn,
    });
    if (response.status === 200) {
      return { success: true, message: 'Deny transaction successfully!' };
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<AxiosErrorResponse>;
      if (axiosError.response?.data.response) {
        return {
          success: false,
          message: String(axiosError.response.data?.response),
        };
      }
    }
  }
  return {
    success: false,
    message: 'Failed to deny transaction. Please try again later',
  };
};

export const approveTransaction = async (
  txn: TransactionDetails,
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await axiosInstance.post('/approve_transaction', {
      approver: txn.from_user,
      operation: txn.txn_type,
      dst: txn.to_user,
      amount: txn.amount,
      initiator_level: txn.initiator_level,
      txn: txn,
    });
    if (response.status === 200) {
      return { success: true, message: 'Approve transaction successfully!' };
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<AxiosErrorResponse>;
      if (axiosError.response?.data.response) {
        return {
          success: false,
          message: String(axiosError.response.data?.response),
        };
      }
    }
  }
  return {
    success: false,
    message: 'Failed to Approve transaction. Please try again later',
  };
};

export const requestHigherApproval = async (
  txn: TransactionDetails,
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await axiosInstance.post('/request_higher_approval', {
      txn: txn,
    });
    if (response.status === 200) {
      return {
        success: true,
        message: 'Request higher approval successfully!',
      };
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<AxiosErrorResponse>;
      if (axiosError.response?.data.response) {
        return {
          success: false,
          message: String(axiosError.response.data?.response),
        };
      }
    }
  }
  return {
    success: false,
    message: 'Failed to request higher approval . Please try again later',
  };
};
