import { Request, Response } from "express";
import User from "../models/User";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

async function handleLogin(req: Request, res: Response) {
  try {
    const { username, pwd } = req.body;
    if (!username || !pwd) {
      return res.status(401).json({ msg: 'Username and password are required' });
    }

    const foundUser = await User.findOne({ username }).exec();
    if (!foundUser) {
      return res.status(401).json({ msg: 'User does not exist' });
    }

    const match = await bcrypt.compare(pwd, foundUser.password);
    if (!match) {
      return res.status(401).json({ msg: 'Invalid password' });
    }

    const refreshSecret = process.env.REFRESH_TOKEN_SECRET;
    const accessSecret = process.env.ACCESS_TOKEN_SECRET;
    if (!refreshSecret || !accessSecret) {
      throw new Error('Token secrets are not defined');
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
      accessSecret,
      { expiresIn: '10s' } // 20m
    );
    const refreshToken = jwt.sign(
      { "_id": foundUser._id },
      refreshSecret,
      { expiresIn: '20s' } // 3d
    );
    foundUser.refreshToken = refreshToken;
    await foundUser.save();

    res.cookie('jwt', refreshToken, { httpOnly: true, sameSite: "none", secure: true, maxAge: 24 * 60 * 60 * 1000 });
    res.json({ accessToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: error.message });
  }
}

export default handleLogin;
