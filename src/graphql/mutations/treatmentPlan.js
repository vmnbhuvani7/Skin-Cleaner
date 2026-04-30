import { gql } from '@apollo/client';

export const START_TREATMENT_PLAN = gql`
  mutation StartTreatmentPlan(
    $patientId: ID!,
    $serviceId: ID!,
    $doctorId: ID,
    $totalSessions: Int,
    $intervalWeeks: Int,
    $firstAppointmentDate: String!,
    $notes: String
  ) {
    startTreatmentPlan(
      patientId: $patientId,
      serviceId: $serviceId,
      doctorId: $doctorId,
      totalSessions: $totalSessions,
      intervalWeeks: $intervalWeeks,
      firstAppointmentDate: $firstAppointmentDate,
      notes: $notes
    ) {
      id
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
