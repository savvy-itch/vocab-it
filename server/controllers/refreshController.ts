import { Request, Response } from "express";
import User from "../models/User";
import jwt from 'jsonwebtoken';

interface DecodedPayload {
  _id: string,
  username: string,
  roles: string[]
}

async function handleRefreshToken(req: Request, res: Response) {
  try {
    const cookies = req.cookies;
    if (!cookies?.jwt) {
      console.log({ msg: 'no refresh token' });
      return res.sendStatus(401); // Unauthorized
    }
  
    const refreshToken = cookies.jwt;
    const foundUser = await User.findOne({ refreshToken }).exec();
    if (!foundUser) {
      console.log('user not found');
      return res.sendStatus(403); // Forbidden
    }
  
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET) as DecodedPayload;
    if (foundUser._id.toString() !== decoded._id) {
      console.log({msg: 'usernames dont match', username: foundUser.username, decodedUsername: decoded.username});
      return res.sendStatus(403);
    }
    const roles = Object.values(foundUser.roles).filter(Boolean);
    const accessToken = jwt.sign(
      {
        "UserInfo": {
          "_id": foundUser._id,
          "username": foundUser.username,
          "roles": roles
        }
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '20m' }
    );
    res.json({ accessToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: error.message });
  }
}

export default handleRefreshToken;
