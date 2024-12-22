import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { GET_ME } from '../graphql/queries';
import { LOGIN_USER, CREATE_USER, SAVE_BOOK, DELETE_BOOK } from '../graphql/mutations';
import AuthService from './auth';

const httpLink = createHttpLink({
  uri: '/graphql',
});

const authLink = setContext((_, { headers }) => {
  const token = AuthService.getToken();
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

export const getMe = async () => {
  return client.query({ query: GET_ME });
};

export const loginUser = async (username: string, password: string) => {
  const { data } = await client.mutate({ mutation: LOGIN_USER, variables: { username, password } });
  AuthService.login(data.login.token);
  return data;
};

export const createUser = async (username: string, email: string, password: string) => {
  const { data } = await client.mutate({ mutation: CREATE_USER, variables: { username, email, password } });
  AuthService.login(data.createUser.token);
  return data;
};

export const saveBook = async (bookData: any) => {
  return client.mutate({ mutation: SAVE_BOOK, variables: { bookData } });
};

export const deleteBook = async (bookId: string) => {
  return client.mutate({ mutation: DELETE_BOOK, variables: { bookId } });
};
