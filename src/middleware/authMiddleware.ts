import jwt from "jsonwebtoken";
import {Request, Response, NextFunction} from "express";
import {jwtSecret} from "../config/environment";


export interface AuthenticatedRequest extends Request {
    user ?: {id: string, email: string, username: string}
}

export function verifyToken(token: string){
    return jwt.verify(token, jwtSecret) as {id: string, username: string, email: string};
}

export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction){
    const authHeader: any = req?.headers?.authorization;
    let token = authHeader.split(" ")[1];

    if (!token){
        return res.status(401).json("No token provided");
    }

    try {
        let decoded: any;
        decoded = jwt.verify(token, jwtSecret);
        req.user = decoded
    } catch (error) {
        return res.status(401).json("Invalid or expired token");
    }

}