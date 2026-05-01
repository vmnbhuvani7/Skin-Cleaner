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
      totalAmount
      paidAmount
      discount
      paymentStatus
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
        baseAmount
        paidAmount
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
  mutation UpdateTreatmentPlan($id: ID!, $totalSessions: Int, $intervalWeeks: Int, $status: String, $doctorId: ID, $totalAmount: Float, $paidAmount: Float, $discount: Float) {
    updateTreatmentPlan(id: $id, totalSessions: $totalSessions, intervalWeeks: $intervalWeeks, status: $status, doctorId: $doctorId, totalAmount: $totalAmount, paidAmount: $paidAmount, discount: $discount) {
      id
      totalSessions
      intervalWeeks
      status
      totalAmount
      paidAmount
      discount
      paymentStatus
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
