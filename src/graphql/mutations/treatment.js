import { gql } from '@apollo/client';

export const CREATE_TREATMENT = gql`
  mutation CreateTreatment($input: CreateTreatmentInput!) {
    createTreatment(input: $input) {
      id
    }
  }
`;

export const UPDATE_TREATMENT = gql`
  mutation UpdateTreatment($id: ID!, $input: UpdateTreatmentInput!) {
    updateTreatment(id: $id, input: $input) {
      id
    }
  }
`;

export const DELETE_TREATMENT = gql`
  mutation DeleteTreatment($id: ID!) {
    deleteTreatment(id: $id)
  }
`;

export const UPDATE_SESSION = gql`
  mutation UpdateSession($id: ID!, $input: UpdateSessionInput!) {
    updateSession(id: $id, input: $input) {
      id
      status
      paidAmount
    }
  }
`;
