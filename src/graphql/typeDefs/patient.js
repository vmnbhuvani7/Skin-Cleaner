export const patientTypeDefs = `#graphql
  type Patient {
    id: ID!
    name: String!
    email: String!
    mobile: String!
    birthdate: String!
    age: Int!
    gender: String!
    address: String
    medicalHistory: String
    ongoingTreatments: String
    isActive: Boolean!
    createdAt: String
  }

  type PatientsResponse {
    patients: [Patient]
    totalCount: Int
    totalPages: Int
    currentPage: Int
    hasMore: Boolean
  }

  extend type Query {
    getPatients(page: Int, limit: Int, search: String, isActive: Boolean): PatientsResponse
    getPatient(id: ID!): Patient
  }

  extend type Mutation {
    createPatient(
      name: String!
      email: String!
      mobile: String!
      birthdate: String!
      gender: String!
      address: String
      medicalHistory: String
      ongoingTreatments: String
    ): Patient

    updatePatient(
      id: ID!
      name: String
      email: String
      mobile: String
      birthdate: String
      gender: String
      address: String
      medicalHistory: String
      ongoingTreatments: String
      isActive: Boolean
    ): Patient

    deletePatient(id: ID!): Boolean
  }
`;
