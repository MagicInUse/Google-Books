import { Request } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export interface UserPayload {
  _id: string;
  email: string;
  username: string;
}

export interface Context {
  user?: UserPayload;
}

const secret = process.env.JWT_SECRET || '';

export const authMiddleware = ({ req }: { req: Request }): Context => {
  const token = req.headers.authorization || '';

  if (token) {
    try {
      const decoded = jwt.verify(token.split(' ')[1], secret) as UserPayload;
      return { user: decoded };
    } catch (err) {
      console.error('Invalid/Expired token');
    }
  }

  return {};
};