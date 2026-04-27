import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';

const typeDefs = `#graphql
  type User {
    id: ID!
    name: String
    email: String
    mobile: String
  }

  type AuthPayload {
    token: String
    user: User
  }

  type Query {
    me: User
  }

  type Mutation {
    login(identifier: String!, password: String!): AuthPayload
    signup(
      name: String!
      email: String!
      mobile: String!
      password: String!
    ): AuthPayload
  }
`;

const resolvers = {
  Query: {
    me: () => ({ id: '1', name: 'Demo User', email: 'demo@example.com' }),
  },
  Mutation: {
    login: (_, { identifier, password }) => {
      // Mock implementation
      console.log('Login mutation called:', { identifier, password });
      return {
        token: 'mock-token',
        user: { id: '1', name: 'Demo User', email: identifier.includes('@') ? identifier : 'demo@example.com' }
      };
    },
    signup: (_, { name, email, mobile, password }) => {
      // Mock implementation
      console.log('Signup mutation called:', { name, email, mobile, password });
      return {
        token: 'mock-token',
        user: { id: '2', name, email, mobile }
      };
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const handler = startServerAndCreateNextHandler(server);

export { handler as GET, handler as POST };
