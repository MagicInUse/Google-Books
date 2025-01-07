import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const secret = process.env.JWT_SECRET_KEY;
const expiration = '1h';

export class AuthenticationError extends Error {
  constructor(message = 'Authentication error') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export const authMiddleware = function ({ req }) {
  let token = req.body.token || req.query.token || req.headers.authorization;

  if (req.headers.authorization) {
    token = token.split(' ').pop().trim();
  }

  if (!token) {
    return req;
  }

  try {
    const { data } = jwt.verify(token, secret, { maxAge: expiration });
    req.user = data;
  } catch (err) {
    console.log('Invalid token:', err.message);
  }

  return req;
};

export const signToken = function ({ username, email, _id }) {
  const payload = { username, email, _id };
  return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
};