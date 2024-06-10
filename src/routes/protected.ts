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
import basicAuthMiddleware from '../middlewares/basicAuthMiddleware'

router.use(basicAuthMiddleware)

router.get('/get-private-data', async (req, res) => {
    res.status(200).send({successMessage: `Successfuly retreived protected data at ${new Date()}`})
})


export default router; 
