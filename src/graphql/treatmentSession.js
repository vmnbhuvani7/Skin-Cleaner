import { gql } from '@apollo/client';

export const GET_PATIENT_SESSIONS = gql`
  query GetPatientSessions($patientId: ID!) {
    getPatientSessions(patientId: $patientId) {
      id
      appointmentDate
      status
      notes
      sessionNumber
      areaTreated
      dosage
      complications
      service {
        id
        title
      }
      doctor {
        id
        name
      }
      treatmentPlan {
        id
        totalSessions
        completedSessions
        status
        totalAmount
        paidAmount
        discount
        paymentStatus
      }
      baseAmount
      paidAmount
    }
  }
`;

export const SCHEDULE_SESSION = gql`
  mutation ScheduleSession(
    $patientId: ID!
    $treatmentPlanId: ID
    $appointmentDate: String!
    $serviceId: ID
    $doctorId: ID
    $notes: String
    $sessionNumber: Int
    $baseAmount: Float
    $paidAmount: Float
    $discount: Float
  ) {
    scheduleSession(
      patientId: $patientId
      treatmentPlanId: $treatmentPlanId
      appointmentDate: $appointmentDate
      serviceId: $serviceId
      doctorId: $doctorId
      notes: $notes
      sessionNumber: $sessionNumber
      baseAmount: $baseAmount
      paidAmount: $paidAmount
      discount: $discount
    ) {
      id
      appointmentDate
      status
      baseAmount
      paidAmount
      discount
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

export const UPDATE_SESSION = gql`
  mutation UpdateSession(
    $id: ID!
    $appointmentDate: String
    $serviceId: ID
    $doctorId: ID
    $status: String
    $notes: String
    $areaTreated: String
    $dosage: String
    $complications: String
    $actualDate: String
    $treatmentStartTime: String
    $treatmentEndTime: String
    $baseAmount: Float
    $paidAmount: Float
    $discount: Float
  ) {
    updateSession(
      id: $id
      appointmentDate: $appointmentDate
      serviceId: $serviceId
      doctorId: $doctorId
      status: $status
      notes: $notes
      areaTreated: $areaTreated
      dosage: $dosage
      complications: $complications
      actualDate: $actualDate
      treatmentStartTime: $treatmentStartTime
      treatmentEndTime: $treatmentEndTime
      baseAmount: $baseAmount
      paidAmount: $paidAmount
      discount: $discount
    ) {
      id
      appointmentDate
      notes
      status
      baseAmount
      paidAmount
      discount
    }
  }
`;

export const DELETE_SESSION = gql`
  mutation DeleteSession($id: ID!) {
    deleteSession(id: $id)
  }
`;
