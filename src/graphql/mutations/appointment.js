import { gql } from '@apollo/client';

export const CREATE_APPOINTMENT = gql`
  mutation CreateAppointment(
    $patient: ID!
    $service: ID!
    $doctor: ID
    $appointmentDate: String!
    $notes: String
  ) {
    createAppointment(
      patient: $patient
      service: $service
      doctor: $doctor
      appointmentDate: $appointmentDate
      notes: $notes
    ) {
      id
      status
    }
  }
`;

export const UPDATE_APPOINTMENT = gql`
  mutation UpdateAppointment(
    $id: ID!
    $patient: ID
    $service: ID
    $doctor: ID
    $appointmentDate: String
    $status: String
    $notes: String
  ) {
    updateAppointment(
      id: $id
      patient: $patient
      service: $service
      doctor: $doctor
      appointmentDate: $appointmentDate
      status: $status
      notes: $notes
    ) {
      id
      status
    }
  }
`;

export const APPROVE_APPOINTMENT = gql`
  mutation ApproveAppointment($id: ID!) {
    approveAppointment(id: $id) {
      id
      status
    }
  }
`;

export const REJECT_APPOINTMENT = gql`
  mutation RejectAppointment($id: ID!) {
    rejectAppointment(id: $id) {
      id
      status
    }
  }
`;

export const DELETE_APPOINTMENT = gql`
  mutation DeleteAppointment($id: ID!) {
    deleteAppointment(id: $id)
  }
`;
