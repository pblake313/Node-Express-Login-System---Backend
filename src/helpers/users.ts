

import * as admin from 'firebase-admin';
import { isValidEmail } from '../validators/stringValidation';

// Assuming Firebase Admin has been initialized elsewhere in your project

export async function doesUserExistByEmail(email: string): Promise<boolean> {

    if (!isValidEmail(email)) {
        throw new Error("Invalid email address doesUserExistByEmail function in helpers / users.ts.");
    }

    try {
        const usersRef = admin.firestore().collection('Users');
        const snapshot = await usersRef.where('email', '==', email).limit(1).get();
        const exists = !snapshot.empty;

        return exists;
    } catch (error) {
        // console.error('Error querying Firestore for email:', email, 'Error:', error);
        throw new Error('Failed to query user database doesUserExistByEmail helpers / users.ts.');
    }
}

export async function createAccount(email: string, password: string) {
    if (!isValidEmail(email)) {
        throw new Error("Invalid email address create account function in helpers / users.ts.");
    }

    const userExists = await doesUserExistByEmail(email);

    if (userExists) {
        throw new Error("User already exists");
    } else {
        try {
            const usersRef = admin.firestore().collection('Users');
            const newUserRef = await usersRef.add({
                email: email,
                password: password,  // Remember to hash passwords before storing them
                createdAt: new Date().getTime()
            });

            // Retrieve the newly created document from Firestore
            const newUserDoc = await newUserRef.get();
            if (!newUserDoc.exists) {
                throw new Error('1. Failed to fetch new user account data in createAccount in helpers/ users.ts.');
            }

            // Return the data of the new user document
            return { id: newUserDoc.id, ...newUserDoc.data() };
        } catch (error) {
            throw new Error('2. Failed to fetch new user account data in createAccount in helpers/ users.ts.');
        }
    }
}

export async function getUserByEmail(email: string) {

    if (!isValidEmail(email)) {
        throw new Error("Invalid email address getUserByEmail function in helpers / users.ts.");
    }

    try {
        const usersRef = admin.firestore().collection('Users');
        const snapshot = await usersRef.where('email', '==', email).limit(1).get();
        if (snapshot.empty) {
            throw new Error('User does not exist in getUserByEmail function in helpers / users.ts.'); 
        }

        const userDoc = snapshot.docs[0];
        return { id: userDoc.id, ...userDoc.data() };
    } catch (error) {
        throw new Error('Failed to retrieve user by email in getUserByEmail function in helpers/users.ts.'); 
    }
}

export async function getUserByDocId(id: string): Promise<{ id: string; [key: string]: any }> {
    try {
        const userRef = admin.firestore().collection('Users').doc(id);
        const userDoc = await userRef.get();
        
        if (!userDoc.exists) {
            throw new Error('User does not exist for the provided ID in getUserByDocId function in helpers / users.ts.');
        }

        const userData = userDoc.data();

        if (!userData) {
            throw new Error('No data available for this user.');
        }

        // Safely remove the password from the user data object.
        const { password, ...userWithoutPassword } = userData;

        return { id: userDoc.id, ...userWithoutPassword };
    } catch (error) {
        // console.error('Error fetching user:', error);
        throw new Error('Failed to retrieve user by document ID in getUserByDocId function in helpers / users.ts.');
    }
}
                 