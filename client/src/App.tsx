import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { SetContextLink } from '@apollo/client/link/context';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { ApolloProvider } from '@apollo/client/react';
import MUForum from './MUForum.tsx';
import { ApolloLink } from '@apollo/client';

// 1. Настройка HTTP (для Query и Mutation)
const httpLink = new HttpLink({
  uri: 'http://localhost:7000/graphql',
});

const authLink = new SetContextLink((_, { headers }: any) => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  };
});

// 2. Настройка WebSocket (для Subscriptions)
const wsLink = new GraphQLWsLink(createClient({
  url: 'ws://localhost:7000/graphql',
  connectionParams: () => {
    const token = localStorage.getItem('token');
    return {
      authorization: token ? `Bearer ${token}` : "",
    };
  },
}));

// 3. Функция-"разводящий" (split)
// Если операция - подпись, идем в WS, иначе в HTTP
const splitLink = ApolloLink.split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  authLink.concat(httpLink),
);

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});

function App() {
  return (
    <ApolloProvider client={client}>
      <MUForum/>
    </ApolloProvider>
  );
}

export default App
