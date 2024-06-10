import * as admin from 'firebase-admin';


interface Token {
    userDocId: string,
    token: string,
    createdAt: Date,
    expires: Date
}

export async function storeRefreshToken(tokenData: Token) {
    const db = admin.firestore(); // Get Firestore database instance
    const tokenCollection = db.collection('refreshTokens'); // Define the collection name

    try {
        // Add a new document in the 'tokens' collection
        const docRef = await tokenCollection.add(tokenData);
        // console.log(`Token stored successfully with ID: ${docRef.id}`);

    } catch (error) {
        // console.error('Error storing token:', error);
        throw new Error('Error storing token in storeRefreshToken function in helpers / auth.ts.')
    }
}

export async function getRefreshTokenByUserDocId(docId: string) {
    const db = admin.firestore();
    const tokenCollection = db.collection('refreshTokens');
    const today = new Date();

    try {
        // Query for documents where 'userDocId' matches 'docId'
        const querySnapshot = await tokenCollection.where('userDocId', '==', docId).get();

        if (querySnapshot.empty) {
            // console.log('No matching token found or token expired');
            return false;
        }

        // Assume the first document in the results is the correct one
        const tokenDoc = querySnapshot.docs[0];
        const tokenData = tokenDoc.data();


        // Check if the token has expired
        const tokenExpiryDate = new Date(tokenData.expires._seconds * 1000); // Converting Firestore Timestamp to JavaScript Date object


        if (today > tokenExpiryDate) {
            return false; // Return false or handle token expiration appropriately
        }

        return tokenData; // Token is valid
    } catch (error) {
        // console.error('Error retrieving token:', error);
        throw new Error('Error retrieving token in getRefreshTokenByUserDocId function in helpers / auth.ts.');
    }
}

export async function removeTokenDoc(userDocId: string) {
    const db = admin.firestore();
    const tokenCollection = db.collection('refreshTokens');

    try {
        // Query for documents where 'userDocId' matches the provided 'userDocId'
        const querySnapshot = await tokenCollection.where('userDocId', '==', userDocId).get();

        if (querySnapshot.empty) {
            // console.log('No matching documents found to delete.');
            return;
        }

        // Deleting each document found in the query
        querySnapshot.forEach(async (doc) => {
            await doc.ref.delete();
            // console.log(`Deleted document with ID: ${doc.id}`);
        });
    } catch (error) {
        console.error('Error removing token documents:', error);
        throw new Error('Error removing token documents in removeTokenDoc function in helpers / auth.ts.');
    }
}