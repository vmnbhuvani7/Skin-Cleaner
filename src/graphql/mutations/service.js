import * as Apollo from '@apollo/client';
const { gql } = Apollo;

export const CREATE_SERVICE = gql`
  mutation CreateService($title: String!, $desc: String!, $icon: String, $image: String) {
    createService(title: $title, desc: $desc, icon: $icon, image: $image) {
      id
    }
  }
`;

export const UPDATE_SERVICE = gql`
  mutation UpdateService($id: ID!, $title: String, $desc: String, $icon: String, $image: String, $isActive: Boolean) {
    updateService(id: $id, title: $title, desc: $desc, icon: $icon, image: $image, isActive: $isActive) {
      id
      title
      desc
      isActive
    }
  }
`;

export const DELETE_SERVICE = gql`
  mutation DeleteService($id: ID!) {
    deleteService(id: $id)
  }
`;
