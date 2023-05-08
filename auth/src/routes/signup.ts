import express, {Request, Response} from 'express';
import {body} from 'express-validator';
import jwt from 'jsonwebtoken';
import { BadRequestError } from '../errors/bad-request-error';
import { validateResult } from '../middlewares/validate-request';
import {User} from '../models/user';

const router = express.Router();

router.post('/api/users/signup', [
        body('email')
        .isEmail()
        .withMessage('Email must be valid'),
        body('password')
            .trim()
            .isLength({min: 4, max: 20})
            .withMessage('Password must be between 4 and 20 characters')
    ], 
    validateResult, 
    async (req: Request, res: Response) => {

        const {email, password} = req.body;
        const existingUser = await User.findOne({email});

        if(existingUser){
            throw new BadRequestError('Email in use');
        }

        const user = User.build({email, password});
        await user.save();

        //Run the following command to create an env for JWT secret in Kubernetes: 
        // kubectl create secret generic jwt-secret --from-literal JWT_KEY=asdf
        //Generate JWT
        const userJwt = jwt.sign({
            id: user.id,
            email: user.email
        }, process.env.JWT_KEY!
        );

        //Store it on a session token
        req.session = {
            jwt: userJwt
        };

        res.status(201).send(user);

        
});

export {router as signupRouter};