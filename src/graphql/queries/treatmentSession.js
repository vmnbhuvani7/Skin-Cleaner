import { gql } from '@apollo/client';

export const GET_ALL_SESSIONS = gql`
  query GetAllSessions($page: Int, $limit: Int, $status: String, $search: String) {
    getAllSessions(page: $page, limit: $limit, status: $status, search: $search) {
      sessions {
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
          totalAmount
          paidAmount
          discount
          paymentStatus
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
        baseAmount
        paidAmount
      }
      totalCount
      totalPages
      currentPage
      hasMore
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
      service {
        id
        title
      }
      treatmentPlan {
        id
        totalSessions
        completedSessions
      }
    }
  }
`;
