// authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';

const basicAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const bearerToken = req.header('Authorization')?.split(' ')[1] || '';

    if (!bearerToken) {
        return res.status(401).json({
            message: 'Bearer authentication token is missing.',
            errorTitle: '401 Error : Unauthorized'
        });
    }

    try {
        const payload: any = verify(bearerToken, process.env.ACCESS_SECRET || '');
        if (!payload) {
            return res.status(401).json({message: 'User is unauthorized. Could not verify access token payload with secret provided.'});
        }
      
    } catch (err) {
        return res.status(401).send({
            message: 'User is unauthorized. Token expired, missing or invalid.',
            errorTitle: '401 Error (2) : Unauthorized'
        });
    }

    // If authenticated, continue to the next middleware or route handler
    next();
};
     
export default basicAuthMiddleware;