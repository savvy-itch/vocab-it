import { NextFunction, Request, Response } from "express";
import jwt, {JwtPayload} from 'jsonwebtoken';
import { CustomJwtPayload } from "../types";

interface AuthenticatedRequest extends Request {
  userInfo: any
}

function verifyJWT(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader: string | undefined = req.headers.authorization || req.headers.Authorization as string | undefined;

  if (!authHeader?.startsWith('Bearer ')) {
    res.sendStatus(401); // Unauthorized
    return;
  }

  const token = authHeader.split(' ')[1];
  const accessSecret = process.env.ACCESS_TOKEN_SECRET;
  if (!accessSecret) {
    res.sendStatus(401);
    return;
  }
  
  jwt.verify(
    token, 
    accessSecret,
    (err, decoded) => {
      if (err) {
        res.sendStatus(403);
        return;
      }
      if (typeof decoded !== 'string' && 'UserInfo' in decoded) {
        req.userInfo = decoded.UserInfo;
      } else {
        res.sendStatus(403);
      }
      next();
    }
  );
}

export default verifyJWT;
