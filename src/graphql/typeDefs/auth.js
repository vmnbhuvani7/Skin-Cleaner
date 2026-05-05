export const authTypeDefs = `#graphql
  type Role {
    id: ID!
    name: String
  }

  type User {
    id: ID!
    name: String
    email: String
    mobile: String
    organizationName: String
    role: Role
    organization: User
  }

  type AuthPayload {
    token: String
    user: User
  }

  type Query {
    me: User
    publicGetOrganizations: [User]
  }

  type Mutation {
    login(identifier: String!, password: String!): AuthPayload
    signup(
      name: String!
      email: String!
      mobile: String!
      password: String!
      roleName: String!
      organizationName: String
      organizationId: ID
      birthdate: String
      gender: String
    ): AuthPayload
  }
`;
