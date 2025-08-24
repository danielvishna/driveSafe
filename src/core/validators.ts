export const emailValidator = (email: string) => {
    const re = /\S+@\S+\.\S+/;

    if (!email || email.length <= 0) return 'Email cannot be empty.';
    if (!re.test(email)) return 'Oops! We need a valid email address.';

    return '';
};


export const passwordValidator = (password: string) => {
    if (!password || password.length <= 0) return 'Password cannot be empty.';

    return '';
};

export const repeatPasswordValidator = (password: string, repeatPassword: string) => {
    if (!repeatPassword || repeatPassword.length <= 0) return 'Password cannot be empty.';
    if (repeatPassword !== password) return 'Passwords do not match.';
    return '';
};