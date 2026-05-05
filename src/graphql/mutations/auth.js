import * as Apollo from '@apollo/client';
const { gql } = Apollo;

export const LOGIN_MUTATION = gql`
  mutation Login($identifier: String!, $password: String!) {
    login(identifier: $identifier, password: $password) {
      token
      user {
        id
        name
        email
        mobile
        organizationName
        role {
          id
          name
        }
        organization {
          id
          name
          organizationName
        }
      }
    }
  }
`;

export const SIGNUP_MUTATION = gql`
  mutation Signup($name: String!, $email: String!, $mobile: String!, $password: String!, $roleName: String!, $organizationName: String) {
    signup(name: $name, email: $email, mobile: $mobile, password: $password, roleName: $roleName, organizationName: $organizationName) {
      token
      user {
        id
        name
        email
        mobile
        organizationName
        role {
          id
          name
        }
        organization {
          id
          name
          organizationName
        }
      }
    }
  }
`;
