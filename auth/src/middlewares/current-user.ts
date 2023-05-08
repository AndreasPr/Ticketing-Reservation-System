import {  Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';

interface UserPayload {
    id: string;
    email: string;
}

//We reach into an existing type definition and make a modification to it.
//We tell Typescript that inside of Express project find the interface of request that was already defined inside there, but take 
//that interface that was already created and add an additional property to it. So we want to have a property called currentUser that 
//might be defined.
declare global {
    namespace Express{
        interface Request{
            currentUser?: UserPayload;
        }
    }
}

export const currentUser = (req: Request, res: Response, next: NextFunction) => {
    if(!req.session?.jwt){
        return next();
    }

    try{
        const payload = jwt.verify(req.session.jwt, process.env.JWT_KEY!) as UserPayload;
        req.currentUser = payload;
    }catch(err){}
    next();
};