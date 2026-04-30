import { gql } from '@apollo/client';

export const GET_ALL_SESSIONS = gql`
  query GetAllSessions {
    getAllSessions {
      id
      patient {
        id
        name
        mobile
      }
      treatmentPlan {
        id
        totalSessions
        completedSessions
        status
      }
      service {
        id
        title
      }
      doctor {
        id
        name
      }
      sessionNumber
      appointmentDate
      actualDate
      treatmentStartTime
      treatmentEndTime
      status
      areaTreated
      dosage
      complications
      beforeNotes
      afterNotes
      notes
      isWalkIn
      createdAt
    }
  }
`;

export const GET_PATIENT_SESSIONS = gql`
  query GetPatientSessions($patientId: ID!) {
    getPatientSessions(patientId: $patientId) {
      id
      sessionNumber
      appointmentDate
      actualDate
      status
      areaTreated
      notes
      treatmentPlan {
        id
        totalSessions
        completedSessions
      }
    }
  }
`;
