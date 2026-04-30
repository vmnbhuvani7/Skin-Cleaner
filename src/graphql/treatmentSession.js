import { gql } from '@apollo/client';

export const GET_PATIENT_SESSIONS = gql`
  query GetPatientSessions($patientId: ID!) {
    getPatientSessions(patientId: $patientId) {
      id
      appointmentDate
      status
      notes
      service {
        id
        title
      }
      doctor {
        id
        name
      }
    }
  }
`;

export const SCHEDULE_SESSION = gql`
  mutation ScheduleSession(
    $patientId: ID!
    $appointmentDate: String!
    $serviceId: ID
    $doctorId: ID
    $notes: String
  ) {
    scheduleSession(
      patientId: $patientId
      appointmentDate: $appointmentDate
      serviceId: $serviceId
      doctorId: $doctorId
      notes: $notes
    ) {
      id
      appointmentDate
      status
    }
  }
`;

export const UPDATE_SESSION_STATUS = gql`
  mutation UpdateSessionStatus($id: ID!, $status: String!, $notes: String) {
    updateSessionStatus(id: $id, status: $status, notes: $notes) {
      id
      status
    }
  }
`;

export const DELETE_SESSION = gql`
  mutation DeleteSession($id: ID!) {
    deleteSession(id: $id)
  }
`;
