import { gql } from '@apollo/client';

export const SCHEDULE_SESSION = gql`
  mutation ScheduleSession(
    $patientId: ID!, 
    $treatmentPlanId: ID,
    $appointmentDate: String!, 
    $actualDate: String,
    $isWalkIn: Boolean,
    $serviceId: ID, 
    $doctorId: ID, 
    $status: String,
    $notes: String,
    $sessionNumber: Int
  ) {
    scheduleSession(
      patientId: $patientId, 
      treatmentPlanId: $treatmentPlanId,
      appointmentDate: $appointmentDate, 
      actualDate: $actualDate,
      isWalkIn: $isWalkIn,
      serviceId: $serviceId, 
      doctorId: $doctorId, 
      status: $status,
      notes: $notes,
      sessionNumber: $sessionNumber
    ) {
      id
      status
    }
  }
`;

export const COMPLETE_SESSION = gql`
  mutation CompleteSession(
    $id: ID!,
    $actualDate: String!,
    $treatmentStartTime: String,
    $treatmentEndTime: String,
    $areaTreated: String,
    $dosage: String,
    $complications: String,
    $beforeNotes: String,
    $afterNotes: String,
    $notes: String
  ) {
    completeSession(
      id: $id,
      actualDate: $actualDate,
      treatmentStartTime: $treatmentStartTime,
      treatmentEndTime: $treatmentEndTime,
      areaTreated: $areaTreated,
      dosage: $dosage,
      complications: $complications,
      beforeNotes: $beforeNotes,
      afterNotes: $afterNotes,
      notes: $notes
    ) {
      id
      status
      actualDate
    }
  }
`;

export const UPDATE_SESSION_STATUS = gql`
  mutation UpdateSessionStatus($id: ID!, $status: String!, $actualDate: String, $notes: String) {
    updateSessionStatus(id: $id, status: $status, actualDate: $actualDate, notes: $notes) {
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
    ) {
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
