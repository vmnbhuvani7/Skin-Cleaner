export const doctorTypeDefs = `#graphql
  type Doctor {
    id: ID!
    name: String!
    specialization: String!
    experience: Int!
    consultationFee: Int!
    mobile: String!
    isActive: Boolean!
    image: String
    createdAt: String
  }

  type DoctorsResponse {
    doctors: [Doctor]
    totalCount: Int
    totalPages: Int
    currentPage: Int
    hasMore: Boolean
  }

  extend type Query {
    getDoctors(page: Int, limit: Int, search: String, isActive: Boolean): DoctorsResponse
    getDoctor(id: ID!): Doctor
  }

  extend type Mutation {
    createDoctor(
      name: String!
      specialization: String!
      experience: Int!
      consultationFee: Int!
      mobile: String!
      image: String
    ): Doctor

    updateDoctor(
      id: ID!
      name: String
      specialization: String
      experience: Int
      consultationFee: Int
      mobile: String
      image: String
      isActive: Boolean
    ): Doctor

    deleteDoctor(id: ID!): Boolean
  }
`;
