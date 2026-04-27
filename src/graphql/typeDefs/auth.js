export const authTypeDefs = `#graphql
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
