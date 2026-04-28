import * as Apollo from '@apollo/client';
const { gql } = Apollo;

export const GET_SERVICES = gql`
  query GetServices($page: Int, $limit: Int, $search: String, $isActive: Boolean) {
    getServices(page: $page, limit: $limit, search: $search, isActive: $isActive) {
      services {
        id
        title
        desc
        icon
        image
        isActive
        createdAt
      }
      totalCount
      totalPages
      currentPage
    }
  }
`;

export const GET_SERVICE = gql`
  query GetService($id: ID!) {
    getService(id: $id) {
      id
      title
      desc
      icon
      image
      isActive
    }
  }
`;
