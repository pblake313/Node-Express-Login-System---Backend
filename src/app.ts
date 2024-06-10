import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import * as admin from 'firebase-admin';
import cookieParser from 'cookie-parser'

dotenv.config();


if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_PRIVATE_KEY || !process.env.FIREBASE_CLIENT_EMAIL) {
  throw new Error('Required Firebase environment variables are not set');
}

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Ensure new lines are correctly interpreted
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL
  })
});

const app = express();
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [];

// Define CORS options with proper types
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};
 
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser())

// routes
import auth from './routes/auth';
app.use('/auth', auth);

import protectedData from './routes/protected'
app.use('/protectedData', protectedData)


export default app; 
