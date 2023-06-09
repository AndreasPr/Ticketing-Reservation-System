import express, {Request, Response} from 'express';
import {body} from 'express-validator';
import jwt from 'jsonwebtoken';
import {Password} from '../services/password';
import { validateResult } from '../middlewares/validate-request';
import { BadRequestError } from '../errors/bad-request-error';
import { User } from '../models/user';
const router = express.Router();

router.post('/api/users/signin', [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password').trim().notEmpty().withMessage('You must supply a password')
], validateResult, 
async (req: Request, res: Response) => {
    const {email, password} = req.body;
    const existingUser = await User.findOne({email});
    if(!existingUser){
        throw new BadRequestError('Invalid credentials');
    }

    const passwordsMatch = await Password.compare(existingUser.password, password);
    if(!passwordsMatch){
        throw new BadRequestError('Invalid Credentials');
    }

    //Run the following command to create an env for JWT secret in Kubernetes: 
    // kubectl create secret generic jwt-secret --from-literal JWT_KEY=asdf
    //Generate JWT
    const userJwt = jwt.sign({
        id: existingUser.id,
        email: existingUser.email
    }, process.env.JWT_KEY!
    );

    //Store it on a session token
    req.session = {
        jwt: userJwt
    };

    res.status(200).send(existingUser);
});

export {router as signinRouter};