export const treatmentSessionTypeDefs = `#graphql
  type TreatmentSession {
    id: ID!
    patient: Patient!
    treatmentPlan: TreatmentPlan
    service: Service
    doctor: Doctor
    sessionNumber: Int
    appointmentDate: String!
    actualDate: String
    treatmentStartTime: String
    treatmentEndTime: String
    isWalkIn: Boolean
    status: String!
    areaTreated: String
    dosage: String
    complications: String
    beforeNotes: String
    afterNotes: String
    notes: String
    attended: Boolean
    createdAt: String
  }

  type TreatmentSessionsResponse {
    sessions: [TreatmentSession]
    totalCount: Int
    totalPages: Int
    currentPage: Int
    hasMore: Boolean
  }

  extend type Query {
    getPatientSessions(patientId: ID!): [TreatmentSession]
    getUpcomingAppointments: [TreatmentSession]
    getAllSessions(page: Int, limit: Int, status: String, search: String): TreatmentSessionsResponse
  }

  extend type Mutation {
    scheduleSession(
      patientId: ID!
      treatmentPlanId: ID
      appointmentDate: String!
      actualDate: String
      isWalkIn: Boolean
      serviceId: ID
      doctorId: ID
      status: String
      notes: String
      sessionNumber: Int
    ): TreatmentSession

    completeSession(
      id: ID!
      actualDate: String!
      treatmentStartTime: String
      treatmentEndTime: String
      areaTreated: String
      dosage: String
      complications: String
      beforeNotes: String
      afterNotes: String
      notes: String
      shouldAutoSchedule: Boolean
      nextSessionDate: String
      updateNextSessionId: ID
    ): TreatmentSession

    updateSessionStatus(
      id: ID!
      status: String!
      actualDate: String
      notes: String
    ): TreatmentSession

    updateSession(
      id: ID!
      appointmentDate: String
      doctorId: ID
      serviceId: ID
      status: String
      notes: String
      areaTreated: String
      dosage: String
      complications: String
      actualDate: String
      treatmentStartTime: String
      treatmentEndTime: String
    ): TreatmentSession

    deleteSession(id: ID!): Boolean
  }
`;
