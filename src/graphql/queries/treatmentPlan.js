import { gql } from '@apollo/client';

export const GET_PATIENT_PLANS = gql`
  query GetPatientPlans($patientId: ID!) {
    getPatientPlans(patientId: $patientId) {
      id
      service {
        id
        title
      }
      doctor {
        id
        name
      }
      totalSessions
      completedSessions
      intervalWeeks
      status
      createdAt
      sessions {
        id
        sessionNumber
        appointmentDate
        actualDate
        status
        notes
        areaTreated
        dosage
        attended
        doctor {
          id
          name
        }
      }
    }
  }
`;

export const GET_GLOBAL_STATS = gql`
  query GetGlobalStats {
    getGlobalStats {
      completionRate
      dropoutRate
      noShowRate
      totalRevenue
    }
  }
`;
export const UPDATE_TREATMENT_PLAN = gql`
  mutation UpdateTreatmentPlan($id: ID!, $totalSessions: Int, $intervalWeeks: Int, $status: String, $doctorId: ID) {
    updateTreatmentPlan(id: $id, totalSessions: $totalSessions, intervalWeeks: $intervalWeeks, status: $status, doctorId: $doctorId) {
      id
      totalSessions
      intervalWeeks
      status
    }
  }
`;

export const CANCEL_PLAN = gql`
  mutation CancelPlan($id: ID!, $reason: String) {
    cancelPlan(id: $id, reason: $reason) {
      id
      status
    }
  }
`;
