export const emailValidator = (email: string) => {
    const re = /\S+@\S+\.\S+/;

    if (!email || email.length <= 0) return 'Email cannot be empty.';
    if (!re.test(email)) return 'Oops! We need a valid email address.';

    return '';
};

export const usernameValidator = (username: string) => {
    if (!username || username.length <= 0) return 'Username cannot be empty.';
    return '';
};

export const passwordValidator = (password: string) => {
    if (!password || password.length <= 0) return 'Password cannot be empty.';

    return '';
};

export const nameValidator = (name: string) => {
    if (!name || name.length <= 0) return 'Name cannot be empty.';

    return '';
};

export const repeatPasswordValidator = (password: string, repeatPassword: string) => {
    if (!repeatPassword || repeatPassword.length <= 0) return 'Password cannot be empty.';
    if (repeatPassword !== password) return 'Passwords do not match.';
    return '';
};

export const accountTypeValidator = (accountType: string) => {
    if (!accountType || accountType.length <= 0) return 'Account type cannot be empty.';
    return '';
};
export const parentValidator = (parent: string) => {
    if (!parent || parent.length <= 0) return 'Need to choose parent account.';

    return '';
};
export const VaOwnerValidator = (parent: string) => {
    if (!parent || parent.length <= 0) return 'Need to choose Virtual Account Owner.';

    return '';
};
export const associatedAccountValidator = (associatedAccounts: string, virtualOwner: string) => {
    const accountsArray = associatedAccounts
        .split(',')
        .map((account) => account.trim())
        .filter((account) => account !== '');

    if (accountsArray.length === 0) {
        return 'You must specify at least one associated account';
    }

    if (virtualOwner !== '' && !accountsArray.includes(virtualOwner)) {
        return 'Virtual owner must belong to associated accounts';
    }
    return '';
};
export const limitValidator = (limit: string) => {
    if (isNaN(parseInt(limit))) return 'Limit need to be number greater than 0';
};
