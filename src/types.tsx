import { NavigationParams, NavigationScreenProp, NavigationState } from 'react-navigation';

export type RootStackParamList = {
    HomeScreen: undefined;
    LoginScreen: undefined;
    SignupScreen: undefined;
    ForgotPasswordScreen: undefined;
    Dashboard: undefined;
    InitiatedRequests: undefined;
    // LoadBalance: { accountDetails: accountDetails };
    LoadBalance: undefined;
    PullMoney: undefined;
};

export type DashboardNavigation = NavigationScreenProp<NavigationState, NavigationParams>;
export type DashboardProps = {
    navigation: NavigationScreenProp<NavigationState>;
};

// export type DashboardProps = {
//     navigation: DashboardNavigation;
//     route?: {
//         params: {
//             username: string;
//             address: string;
//         };
//     };
// };
