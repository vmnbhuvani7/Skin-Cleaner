import { gql } from '@apollo/client';

export const GET_PATIENTS = gql`
  query GetPatients($page: Int, $limit: Int, $search: String, $isActive: Boolean) {
    getPatients(page: $page, limit: $limit, search: $search, isActive: $isActive) {
      patients {
        id
        name
        email
        mobile
        birthdate
        age
        gender
        isActive
      }
      totalCount
      totalPages
      currentPage
      hasMore
    }
  }
`;

export const GET_PATIENT = gql`
  query GetPatient($id: ID!) {
    getPatient(id: $id) {
      id
      name
      email
      mobile
      birthdate
      age
      gender
      address
      medicalHistory
      ongoingTreatments
      isActive
      createdAt
    }
  }
`;
