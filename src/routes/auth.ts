// src/controllers/auth.ts
import { Router } from 'express';
import bcryptjs from 'bcryptjs'
import { isValidEmail, isValidPassword } from '../validators/stringValidation';
import { createAccount, getUserByDocId, getUserByEmail } from '../helpers/users';
import { sign, verify } from 'jsonwebtoken';    
import { getRefreshTokenByUserDocId, removeTokenDoc, storeRefreshToken } from '../helpers/auth';
import { generateRandomString } from '../helpers/generators';
const admin = require('firebase-admin');
const router = Router();


router.post('/signup', async (req, res) => {
    // this endpoint signs up a user.
    
    const email = req.body.email
    const password = req.body.password
    const confirmPassword = req.body.confirmPassword

    // Check if any of the required fields are missing or empty
    if (!email || !password || !confirmPassword) {
        return res.status(400).json({ formError: 'The request sent to the server was invalid. Please try again.', errorTitle: '400 Error (1) : Bad Request' });
    }

    if (!isValidEmail(email)){
        return res.status(400).json({ formError: 'The request sent to the server was invalid. Please try again.', errorTitle: '400 Error (2) : Bad Request' });
    }

    if (password !== confirmPassword){
        return res.status(400).json({ formError: 'The request sent to the server was invalid. Please try again.', errorTitle: '400 Error (3) : Bad Request' });
    }

    if (!isValidPassword(password)){
        return res.status(400).json({ formError: 'The request sent to the server was invalid. Please try again.', errorTitle: '400 Error (4) : Bad Request' });
    }


    // if the request is valid
    

    try {
        const newUser = await createAccount(email, await bcryptjs.hash(password, 12))

        // here send a 200 response
        return res.status(200).send(newUser);
    } catch (error) {

        if (error instanceof Error) {

            // console.log(error.message); // Now safely logging the error message

            if (error.message === 'User already exists'){
                return res.status(409).json({ 
                    formError: 'The email account you have entered already has an account!', 
                    errorTitle: '409 Error : User Exists'  
                });
            }

            if (error.message === 'Invalid email address.'){
                return res.status(400).json({ 
                    formError: 'The request sent to the server was invalid. Please try again.', 
                    errorTitle: '400 Error (5) : Bad Request' 
                });
            }

            if (error.message === 'Invalid email address create account function in helpers / users.ts.'){
                return res.status(400).json({ 
                    formError: 'The request sent to the server was invalid. Please try again.', 
                    errorTitle: '400 Error (6) : Bad Request' 
                });
            }
            if (error.message === 'Invalid email address doesUserExistByEmail function in helpers / users.ts.'){
                return res.status(400).json({ 
                    formError: 'The request sent to the server was invalid. Please try again.', 
                    errorTitle: '400 Error (7) : Bad Request' 
                });
            }

            if (error.message === 'Failed to query user database doesUserExistByEmail helpers / users.ts.'){
                return res.status(500).json({
                    formError: 'An internal server error occurred while processing your request. Please try again later.',
                    errorTitle: '500 Error (1) : Internal Server Error'
                });
            }
            if (error.message === '1. Failed to fetch new user account data in createAccount in helpers/ users.ts.'){
                return res.status(500).json({
                    formError: 'An internal server error occurred while processing your request. Please try again later.',
                    errorTitle: '500 Error (2) : Internal Server Error'
                });
            }
            if (error.message === '2. Failed to fetch new user account data in createAccount in helpers/ users.ts.'){
                return res.status(500).json({
                    formError: 'An internal server error occurred while processing your request. Please try again later.',
                    errorTitle: '500 Error (3) : Internal Server Error'
                });
            }


        } else {
            return res.status(500).json({
                formError: 'An occurred while processing your request. Please try again later.',
                errorTitle: '500 Error (4) : Internal Server Error',
                error: error
            });
        } 
    }



});

router.post('/login', async (req, res) => {

    // this endpoint simply returns a refresh token as a cookie to the front, and an access token to the front via json so the front can use it as a bearer cookie.

    const email = req.body.email 
    const password = req.body.password

    if (!email || !password ) {
        return res.status(400).json({ formError: 'The request sent to the server was invalid. Please try again.', errorTitle: '400 Error (1) : Bad Request' });
    }

    if (!isValidEmail(email)){
        return res.status(400).json({ formError: 'The request sent to the server was invalid. Please try again.', errorTitle: '400 Error (2) : Bad Request' });
    }


    try {
        const retreivedUser: any = await getUserByEmail(email)

        if (!await bcryptjs.compare(password, retreivedUser.password)){
            throw new Error ("Passwords do not match.")
        }

        const refreshToken = sign({ userDocId: retreivedUser.id }, process.env.REFRESH_SECRET || '', { expiresIn: '3w' });


        res.cookie('refresh_token', refreshToken, {
            httpOnly: true, // this means only the backend can acces the cookies... not the front.
            secure: true,
            maxAge: 21 * 24 * 60 * 60 * 1000, // 21 days
            sameSite: 'none'
        })

        const expirationDate = new Date()
        expirationDate.setDate(expirationDate.getDate() + 21)

        // enter shit here
        const tokenData = {
            userDocId: retreivedUser.id,
            token: refreshToken,
            createdAt: new Date(),
            expires: expirationDate
        }

        await storeRefreshToken(tokenData)

        const accessToken = sign({userDocId: retreivedUser.id,}, process.env.ACCESS_SECRET || '', {expiresIn: '30s'})


        return res.status(200).send({accessToken: accessToken}) // here i need to remove the password before sending it back.


    } catch (error){
        if (error instanceof Error) {
            // console.log(error.message); // Now safely logging the error message
            if (error.message === 'Invalid email address getUserByEmail function in helpers / users.ts.'){
                return res.status(400).json({ 
                    formError: 'The request sent to the server was invalid. Please try again.', 
                    errorTitle: '400 Error (3) : Bad Request' 
                });
            }


            if (error.message === 'User does not exist in getUserByEmail function in helpers / users.ts.') {
                return res.status(409).json({  
                    formError: 'The credentials you have entered are invalid. (1)', 
                });
            }

            
            if (error.message === 'Failed to retrieve user by email in getUserByEmail function in helpers/users.ts.') {
                return res.status(409).json({ 
                    formError: 'The credentials you have entered are invalid. (2)', 
                });
            }

            if (error.message === 'Passwords do not match.') {
                return res.status(409).json({ 
                    formError: 'The credentials you have entered are invalid. (3)', 
                });
            }


        } else {
            return res.status(500).json({
                formError: 'An occurred while processing your request. Please try again later.',
                errorTitle: '500 Error (2) : Internal Server Error',
                error: error
            });
        } 
    }

});

router.get('/getAuthenticatedUser', async (req, res) => {
    // this endpoint is simply going to return a user that is authenticated. a valid access token is required.

    const bearerToken = req.header('Authorization')?.split(' ')[1] || '';


    if (!bearerToken) {
        return res.status(401).json({
            message: 'Bearer authentication token is missing.',
            errorTitle: '401 Error (2) : Unauthorized'
        });
    }

    try {
        // verify the token 
        const payload: any = verify(bearerToken, process.env.ACCESS_SECRET || '');
        if (!payload) {
            return res.status(401).json({message: 'User is unauthorized. Could not verify access token payload with secret provided.'});
        }
        // console.log(payload);

        // if we have a valid access token, continue.

        try {
            const authenticatedUser = await getUserByDocId(payload.userDocId);
            return res.status(200).send({user: authenticatedUser});
        } catch (error) {
            if (error instanceof Error) {
                // console.log(error.message); // Now safely logging the error message
                if (error.message === 'User does not exist for the provided ID in getUserByDocId function in helpers / users.ts.') {
                    return res.status(404).json({ 
                        formError: 'No user found with the provided ID.', 
                        errorTitle: '404 Error : User Not Found' 
                    });
                } else {
                    return res.status(500).json({ 
                        formError: 'An occurred while processing your request. Please try again later.', 
                        errorTitle: '500 Error (1) : Internal Server Error',
                    });
                }
            } else {
                return res.status(500).json({
                    formError: 'An occurred while processing your request. Please try again later.',
                    errorTitle: '500 Error (2) : Internal Server Error',
                    error: error
                });
            } 
        }
    } catch (err) {
        // console.log(err);
        // console.log('bearer token:', bearerToken)

        // this will trigger if the bearer token is expired based ont he exp value within the payload.
        return res.status(401).send({
            message: 'User is unauthorized. Token expired, missing or invalid.',
            errorTitle: '401 Error (2) : Unauthorized'
        });
    }
});

router.post('/refreshAccessToken', async (req, res) => {
    // this endpoint simply updates the access token

    try {
        const cookie = req.cookies['refresh_token'] 

        const payload: any = verify(cookie, process.env.REFRESH_SECRET || '') 

        if (!payload) {
            return res.status(401).send({message: 'User is unauthorized. Could not verify refresh token payload with secret provided.'})
        }

        // if we have a valid refresh token and it is not expirted.

        const refreshToken = await getRefreshTokenByUserDocId(payload.userDocId)

        if (!refreshToken) {
            return res.status(401).send({message: 'Refresh token is invalid.'})
        }

        // refresh token is valid... sign an access token and send it back

        const accessToken = sign({userDocId: payload.userDocId,}, process.env.ACCESS_SECRET || '', {expiresIn: '30s'})

        return res.status(200).send({accessToken: accessToken})
    } catch (err){

        // this will fire if the token is exired.
        // console.log(err)

        return res.status(401).send({message: 'User is unauthorized. Refresh token expired.'})

    }


})

router.post('/logout', async (req, res)=> {
    try {
        const cookie = req.cookies['refresh_token']

        const payload: any = verify(cookie, process.env.REFRESH_SECRET || '') 

        if (payload.userDocId) {
            await removeTokenDoc(payload.userDocId)
        }
     
        res.cookie('refresh_token', '', {maxAge: 0})
    
        res.status(200).send({message: 'logout successful'})
    } catch {
        res.cookie('refresh_token', '', {maxAge: 0})
        res.status(200).send({message: 'logout successful'})

    }
})


 
router.post('/googleAuth', async (req, res) => {
    const { token } = req.body;
    if (!token) {
        return res.status(400).send({ error: 'Token is required' });
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        let user;

        try {
            user = await getUserByEmail(decodedToken.email);
            // console.log('User found in DB.');
        } catch (error) {
            // console.log('User does not exist yet, need to create one.');
            const password = generateRandomString(25);

            try {
                user = await createAccount(decodedToken.email, await bcryptjs.hash(password, 12));
            } catch (error) {
                console.error('Account creation failed:', error);
                return res.status(500).send({ error: 'Could not create account. Please try again later.' });
            }
        }

        if (!user || !user.id) {
            return res.status(404).send({error: 'User could not be found or created. Please try again later.'});
        }

        const refreshToken = sign({ userDocId: user.id }, process.env.REFRESH_SECRET || '', { expiresIn: '3w' });

        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: true,
            maxAge: 21 * 24 * 60 * 60 * 1000, // 3 week
            sameSite: 'none'
        });

        const expirationDate = new Date(Date.now() + 21 * 24 * 60 * 60 * 1000);
        const tokenData = {
            userDocId: user.id,
            token: refreshToken,
            createdAt: new Date(),
            expires: expirationDate
        };

        await storeRefreshToken(tokenData);

        const accessToken = sign({ userDocId: user.id }, process.env.ACCESS_SECRET || '', { expiresIn: '30s' });

        return res.status(200).send({ accessToken });
    } catch (error) {
        console.error('Error verifying token:', error);
        return res.status(401).send({error: 'Unauthorized.'});
    }
});


export default router; 

