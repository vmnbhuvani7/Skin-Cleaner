export const treatmentTypeDefs = `#graphql
  enum TreatmentType {
    ONE_TIME
    MULTI_SESSION
  }

  enum TreatmentStatus {
    IN_PROGRESS
    COMPLETED
    CANCELLED
  }

  enum SessionStatus {
    PENDING
    COMPLETED
    CANCELLED
    ESTIMATED
  }

  type Treatment {
    id: ID!
    patient: Patient!
    service: Service!
    doctor: Doctor!
    type: TreatmentType!
    totalAmount: Float!
    discount: Float
    finalAmount: Float!
    totalSessions: Int
    intervalDays: Int
    status: TreatmentStatus!
    sessions: [TreatmentSession]
    createdAt: String
    updatedAt: String
  }

  type TreatmentSession {
    id: ID!
    treatment: Treatment!
    sessionNumber: Int!
    date: String!
    status: SessionStatus!
    paidAmount: Float
    discount: Float
    onlinePayment: Float
    cashPayment: Float
    doctor: Doctor
    notes: String
    createdAt: String
  }

  input CreateTreatmentInput {
    patientId: ID!
    serviceId: ID!
    doctorId: ID!
    type: TreatmentType!
    totalAmount: Float!
    discount: Float
    finalAmount: Float!
    totalSessions: Int
    intervalDays: Int
    # Initial session details
    paidAmount: Float
    sessionDiscount: Float
    onlinePayment: Float
    cashPayment: Float
    notes: String
  }

  input UpdateTreatmentInput {
    doctorId: ID
    totalAmount: Float
    discount: Float
    finalAmount: Float
    totalSessions: Int
    intervalDays: Int
    status: TreatmentStatus
  }

  input CreateSessionInput {
    treatmentId: ID!
    sessionNumber: Int!
    date: String!
    status: SessionStatus
    paidAmount: Float
    discount: Float
    onlinePayment: Float
    cashPayment: Float
    doctorId: ID
    notes: String
  }

  input UpdateSessionInput {
    date: String
    status: SessionStatus
    paidAmount: Float
    discount: Float
    onlinePayment: Float
    cashPayment: Float
    doctorId: ID
    notes: String
  }

  extend type Query {
    getTreatments: [Treatment]
    getTreatment(id: ID!): Treatment
    getPatientTreatments(patientId: ID!): [Treatment]
  }

  extend type Mutation {
    createTreatment(input: CreateTreatmentInput!): Treatment
    updateTreatment(id: ID!, input: UpdateTreatmentInput!): Treatment
    deleteTreatment(id: ID!): Boolean
    
    addSession(input: CreateSessionInput!): TreatmentSession
    updateSession(id: ID!, input: UpdateSessionInput!): TreatmentSession
    deleteSession(id: ID!): Boolean
  }
`;

export default treatmentTypeDefs;
