'use client';

import * as Apollo from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { useMemo } from 'react';

const { ApolloClient, InMemoryCache, createHttpLink, ApolloProvider } = Apollo;

const httpLink = createHttpLink({
  uri: '/api/graphql',
});

const authLink = setContext((_, { headers }) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  }
});

export default function GraphQLProvider({ children }) {
  const client = useMemo(() => {
    return new ApolloClient({
      link: authLink.concat(httpLink),
      cache: new InMemoryCache(),
    });
  }, []);

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
