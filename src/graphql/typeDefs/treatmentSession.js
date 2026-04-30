export const treatmentSessionTypeDefs = `#graphql
  type TreatmentSession {
    id: ID!
    patient: Patient!
    service: Service
    doctor: Doctor
    appointmentDate: String!
    status: String!
    notes: String
    createdAt: String
  }

  extend type Query {
    getPatientSessions(patientId: ID!): [TreatmentSession]
    getUpcomingAppointments: [TreatmentSession]
  }

  extend type Mutation {
    scheduleSession(
      patientId: ID!
      appointmentDate: String!
      serviceId: ID
      doctorId: ID
      notes: String
    ): TreatmentSession

    updateSessionStatus(
      id: ID!
      status: String!
      notes: String
    ): TreatmentSession

    deleteSession(id: ID!): Boolean
  }
`;
