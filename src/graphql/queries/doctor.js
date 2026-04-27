import * as Apollo from '@apollo/client';
const { gql } = Apollo;

export const GET_DOCTORS = gql`
  query GetDoctors($page: Int, $limit: Int, $search: String) {
    getDoctors(page: $page, limit: $limit, search: $search) {
      doctors {
        id
        name
        specialization
        experience
        consultationFee
        mobile
        isActive
      }
      totalCount
      hasMore
    }
  }
`;

export const GET_DOCTOR = gql`
  query GetDoctor($id: ID!) {
    getDoctor(id: $id) {
      id
      name
      specialization
      experience
      consultationFee
      mobile
      isActive
    }
  }
`;
