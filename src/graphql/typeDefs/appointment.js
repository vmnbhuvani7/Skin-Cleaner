export const appointmentTypeDefs = `#graphql
  type Patient {
    id: ID!
    name: String!
    email: String!
    mobile: String!
  }

  type Service {
    id: ID!
    title: String!
    desc: String
    icon: String
  }

  type Doctor {
    id: ID!
    name: String!
    specialization: String!
  }

  type Appointment {
    id: ID!
    patient: Patient!
    service: Service!
    doctor: Doctor
    appointmentDate: String!
    status: String!
    notes: String
    createdAt: String
  }

  type AppointmentsResponse {
    appointments: [Appointment]
    totalCount: Int
    totalPages: Int
    currentPage: Int
    hasMore: Boolean
  }

  type AppointmentStats {
    totalPending: Int
    totalApproved: Int
    totalRejected: Int
    todayAppointments: Int
    todayPending: Int
    todayApproved: Int
    todayRejected: Int
  }

  extend type Query {
    getAppointments(page: Int, limit: Int, status: String, dateFrom: String, dateTo: String): AppointmentsResponse
    getAppointment(id: ID!): Appointment
    getAppointmentStats: AppointmentStats
  }

  extend type Mutation {
    createAppointment(
      patient: ID!
      service: ID!
      doctor: ID
      appointmentDate: String!
      notes: String
    ): Appointment

    updateAppointment(
      id: ID!
      patient: ID
      service: ID
      doctor: ID
      appointmentDate: String
      status: String
      notes: String
    ): Appointment

    approveAppointment(id: ID!): Appointment

    rejectAppointment(id: ID!): Appointment

    deleteAppointment(id: ID!): Boolean
  }
`;
