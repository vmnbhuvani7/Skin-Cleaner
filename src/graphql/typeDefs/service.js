export const serviceTypeDefs = `#graphql
  type Service {
    id: ID!
    title: String!
    desc: String!
    icon: String
    isActive: Boolean
    createdAt: String
  }

  type ServicesResponse {
    services: [Service]
    totalCount: Int
    totalPages: Int
    currentPage: Int
  }

  extend type Query {
    getServices(page: Int, limit: Int, search: String, isActive: Boolean): ServicesResponse
    getService(id: ID!): Service
  }

  extend type Mutation {
    createService(
      title: String!
      desc: String!
      icon: String
    ): Service

    updateService(
      id: ID!
      title: String
      desc: String
      icon: String
      isActive: Boolean
    ): Service

    deleteService(id: ID!): Boolean
  }
`;
