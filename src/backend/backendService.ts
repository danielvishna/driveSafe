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

export const signup = async (
  email: string,
  password: string,
): Promise<{
  success: boolean;
  message: string;
  userId: string | null;
}> => {
  try {
    const result = await axiosInstance.post('/auth/signup', { email, password });
    return {
      success: result.status === 201,
      message: result.status === 201 ? 'Signup successful' : 'Signup failed',
      userId: result.data?.userId || null,
    };
  } catch (error) {
    console.error('Error during authentication:', error);
    return {
      success: false,
      message: 'Signup failed',
      userId: null,
    };
  }
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

// export const signup = async (
//   username: string,
//   newPassword: string,
//   accountType: string,
//   parentAccount: string,
//   isLimit: boolean,
//   limit: string,
//   vaOwner: string,
//   associateAccounts: string,
// ) => {
//   const associatedAccountsList = associateAccounts
//     .split(',')
//     .map(account => account.trim())
//     .filter(account => account !== '');
//   const url =
//     accountType === 'Child Account' ? '/create_sub_account' : '/signup';
//   const payload = createPayload(
//     username,
//     newPassword,
//     accountType,
//     parentAccount,
//     parseInt(limit),
//     vaOwner,
//     associatedAccountsList,
//   );

//   try {
//     const response = await axiosInstance.post(url, payload, {
//       validateStatus: function (status: number) {
//         return status < 500; // Allows 400 status to be handled in the try block
//       },
//     });

//     if (
//       response.status === STATUS_OK &&
//       typeof response.data === 'object' &&
//       response.data !== null
//     ) {
//       return { success: true, message: 'Signup successful' };
//     } else if (response.status === STATUS_BADREQUEST) {
//       // Handle the 400 Bad Request for invalid credentials
//       return {
//         success: false,
//         message: 'The username is already taken',
//       };
//     } else {
//       console.log('Authentication failed: Unexpected response');
//       return {
//         success: false,
//         message: 'Signup failed. Unexpected server response.',
//       };
//     }
//   } catch (error) {
//     if (axios.isAxiosError(error)) {
//       const axiosError = error as AxiosError;
//       console.error('Axios error:', axiosError.message);
//       console.error('Axios error code:', axiosError.code);

//       if (axiosError.code === 'ECONNABORTED') {
//         return {
//           success: false,
//           message: 'Request timed out. Please try again.',
//         };
//       } else if (axiosError.response) {
//         // This block will handle server errors (status >= 500)
//         console.error('Response data:', axiosError.response.data);
//         console.error('Response status:', axiosError.response.status);
//         return {
//           success: false,
//           message: `Server error: ${axiosError.response.status}`,
//         };
//       } else if (axiosError.request) {
//         return {
//           success: false,
//           message:
//             'No response received from server. Please check your connection.',
//         };
//       } else {
//         return {
//           success: false,
//           message: 'An unexpected error occurred. Please try again.',
//         };
//       }
//     } else {
//       console.error('Non-Axios error:', error);
//       return {
//         success: false,
//         message: 'An unexpected error occurred. Please try again.',
//       };
//     }
//   }
// };
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



