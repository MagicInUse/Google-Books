import { GET_ME } from '../graphql/queries.js';
import { LOGIN_USER, ADD_USER, SAVE_BOOK, DELETE_BOOK } from '../graphql/mutations.js';
import AuthService from './auth.js';
import client from './ApolloClient.js'; // Import the Apollo Client

export const getMe = async () => {
  return client.query({ query: GET_ME });
};

export const loginUser = async (username: string, password: string) => {
  const { data } = await client.mutate({ mutation: LOGIN_USER, variables: { username, password } });
  AuthService.login(data.login.token);
  return data;
};

export const createUser = async (username: string, email: string, password: string) => {
  const { data } = await client.mutate({ mutation: ADD_USER, variables: { username, email, password } });
  AuthService.login(data.createUser.token);
  return data;
};

export const saveBook = async (bookData: any) => {
  return client.mutate({ mutation: SAVE_BOOK, variables: { bookData } });
};

export const deleteBook = async (bookId: string) => {
  return client.mutate({ mutation: DELETE_BOOK, variables: { bookId } });
};
