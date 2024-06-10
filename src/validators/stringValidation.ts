export function isValidEmail(email: string): boolean {
    // Remove all spaces from the email string
    email = email.replace(/\s+/g, '');

    // Regular expression for validating an email
    const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    // Test the email string against the regex
    return emailRegex.test(email);
}


export function isValidPassword(password: string): boolean {
    // Check for at least 9 characters
    if (password.length < 9) {
        return false;
    }

    // Check for no spaces
    if (/\s/.test(password)) {
        return false;
    }

    // Check for at least one uppercase letter
    if (!/[A-Z]/.test(password)) {
        return false;
    }

    // Check for at least one digit
    if (!/[0-9]/.test(password)) {
        return false;
    }

    // Check for at least one special character
    if (!containsSpecialCharacter(password)) {
        return false;
    }

    return true; // If all conditions are met, the password is valid
}


function containsSpecialCharacter(string: string): boolean {
    return /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(string);
}