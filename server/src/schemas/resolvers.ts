import { AuthenticationError } from 'apollo-server-express';
import User from '../models/User.js';
import { Context } from '../context.js';
import { signToken } from '../services/auth.js';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request } from 'express';

const secret = process.env.JWT_SECRET_KEY || '';

interface UserPayload extends JwtPayload {
  _id: string;
  username: string;
  email: string;
}

const contextMiddleware = ({ req }: { req: Request }) => {
  const token = req.headers.authorization || '';

  if (token) {
    try {
      const decoded = jwt.verify(token.split(' ')[1], secret) as UserPayload;
      if (typeof decoded !== 'string') {
        req.user = decoded;
      } else {
        throw new AuthenticationError('Invalid token');
      }
    } catch (err) {
      throw new AuthenticationError('Invalid/Expired token');
    }
  }

  return req;
};

const resolvers = {
  Query: {
    me: async (_parent: any, _args: any, context: Context) => {
      if (context.user) {
        return User.findById(context.user._id);
      }
      throw new AuthenticationError('You need to be logged in!');
    },
  },
  Mutation: {
    login: async (_parent: any, { username, password }: { username: string; password: string }) => {
      const user = await User.findOne({ username });

      if (!user) {
        throw new AuthenticationError('Incorrect credentials');
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError('Incorrect credentials');
      }

      const token = signToken(user);
      return { token, user };
    },
    createUser: async (_parent: unknown, { username, email, password }: { username: string; email: string; password: string }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);
      return { token, user };
    },
    saveBook: async (_parent: any, { bookData }: { bookData: any }, context: Context) => {
      if (!context.user) {
        throw new AuthenticationError('You need to be logged in!');
      }

      const updatedUser = await User.findByIdAndUpdate(
        context.user._id,
        { $addToSet: { savedBooks: bookData } },
        { new: true }
      );

      return updatedUser;
    },
    deleteBook: async (_parent: unknown, { bookId }: { bookId: string }, context: Context) => {
      if (!context.user) {
        throw new AuthenticationError('You need to be logged in!');
      }

      const updatedUser = await User.findByIdAndUpdate(
        context.user._id,
        { $pull: { savedBooks: { bookId } } },
        { new: true }
      );

      return updatedUser;
    },
  },
};

export { resolvers, contextMiddleware };