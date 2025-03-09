import { Request, Response, NextFunction } from "express";
import User from "../models/User";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mongoose from "mongoose";

const USER_REGEX = /^(?=.*[A-Za-z])[A-Za-z0-9]{3,16}$/;
const PWD_REGEX = /^(?=.*[A-Z])(?=.*[!@#$%\-\+=_]).{8,20}$/;

async function handleNewUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { username, pwd } = req.body;
    if (!username || !pwd) {
      return res.status(400).json({ 'message': 'Username and password are required'});
    }
  
    if (USER_REGEX.test(username)) {
      return res.status(400).json({ 'message': 'Invalid username'});
    }
  
    if (PWD_REGEX.test(pwd)) {
      return res.status(400).json({ 'message': 'Invalid password'});
    }
  
    const duplicate = await User.findOne({ username }).exec();
    if (duplicate) {
      return res.send(409).json({ 'message': 'User with this name already exists' });
    }
  
    try {
      const hashedPwd: string = await bcrypt.hash(pwd, 10);
      const refreshSecret = process.env.REFRESH_TOKEN_SECRET;
      const accessSecret = process.env.ACCESS_TOKEN_SECRET;
      if (!refreshSecret || !accessSecret) {
        throw new Error('Token secrets are not defined');
      }
      const userId = new mongoose.Types.ObjectId();
      const accessToken = jwt.sign(
        {
          "UserInfo": {
            "_id": userId,
            "username": username,
            "roles": [1305]
          }
        },
        accessSecret, { expiresIn: '20m' }
      );
      const refreshToken = jwt.sign(
        { "_id": userId },
        refreshSecret,
        { expiresIn: '3d' }
      );
  
      const result = await User.create({
        "_id": userId,
        "username": username,
        "password": hashedPwd,
        "vocabularies": [],
        "refreshToken": refreshToken
      });
      res.cookie('jwt', refreshToken, { httpOnly: true, sameSite: 'none', secure: true, maxAge: 24*60*60*1000});
      res.status(201).json({ 'message': 'User registered successfully', accessToken });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ 'message': error.message });
      } else {
        res.status(500).json({ 'message': 'Unknown error' });
      }
    }
  } catch (error) {
    next(error);
  }
} 

export default handleNewUser;
