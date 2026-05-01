export const treatmentPlanTypeDefs = `#graphql
  type TreatmentPlan {
    id: ID!
    patient: Patient!
    service: Service!
    doctor: Doctor
    totalSessions: Int!
    completedSessions: Int!
    intervalWeeks: Int!
    status: String!
    totalAmount: Float
    paidAmount: Float
    discount: Float
    paymentStatus: String
    createdAt: String
    sessions: [TreatmentSession]
  }

  extend type Query {
    getPatientPlans(patientId: ID!): [TreatmentPlan]
    getPlanDetails(id: ID!): TreatmentPlan
    getGlobalStats: GlobalStats
  }

  type GlobalStats {
    completionRate: Float
    dropoutRate: Float
    noShowRate: Float
    totalRevenue: Float
  }

  extend type Mutation {
    startTreatmentPlan(
      patientId: ID!
      serviceId: ID!
      doctorId: ID
      totalSessions: Int
      intervalWeeks: Int
      firstAppointmentDate: String!
      notes: String
      totalAmount: Float
      paidAmount: Float
      discount: Float
    ): TreatmentPlan

    cancelPlan(id: ID!, reason: String): TreatmentPlan

    updateTreatmentPlan(
      id: ID!
      totalSessions: Int
      intervalWeeks: Int
      status: String
      doctorId: ID
      totalAmount: Float
      paidAmount: Float
      discount: Float
    ): TreatmentPlan
  }
`;
