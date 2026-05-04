import { gql } from '@apollo/client';

export const GET_TREATMENTS = gql`
  query GetTreatments {
    getTreatments {
      id
      patient {
        id
        name
      }
      service {
        id
        title
      }
      doctor {
        id
        name
      }
      type
      totalAmount
      discount
      finalAmount
      status
      totalSessions
      sessions {
        id
        status
        sessionNumber
        paidAmount
      }
      createdAt
    }
  }
`;

export const GET_TREATMENT_DETAILS = gql`
  query GetTreatmentDetails($id: ID!) {
    getTreatment(id: $id) {
      id
      patient {
        id
        name
      }
      service {
        id
        title
      }
      doctor {
        id
        name
      }
      type
      totalAmount
      discount
      finalAmount
      status
      totalSessions
      intervalDays
      sessions {
        id
        sessionNumber
        date
        status
        paidAmount
        onlinePayment
        cashPayment
        notes
        doctor {
          id
          name
        }
      }
      createdAt
    }
  }
`;

export const GET_PATIENT_TREATMENTS = gql`
  query GetPatientTreatments($patientId: ID!) {
    getPatientTreatments(patientId: $patientId) {
      id
      service {
        id
        title
      }
      type
      status
      totalSessions
      finalAmount
      sessions {
        id
        status
        paidAmount
      }
      createdAt
    }
  }
`;
