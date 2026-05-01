import { gql } from '@apollo/client';

export const CREATE_PATIENT = gql`
  mutation CreatePatient(
    $name: String!
    $email: String!
    $mobile: String!
    $birthdate: String!
    $gender: String!
    $address: String
    $medicalHistory: String
    $ongoingTreatments: String
    $image: String
  ) {
    createPatient(
      name: $name
      email: $email
      mobile: $mobile
      birthdate: $birthdate
      gender: $gender
      address: $address
      medicalHistory: $medicalHistory
      ongoingTreatments: $ongoingTreatments
      image: $image
    ) {
      id
      name
    }
  }
`;

export const UPDATE_PATIENT = gql`
  mutation UpdatePatient(
    $id: ID!
    $name: String
    $email: String
    $mobile: String
    $birthdate: String
    $gender: String
    $address: String
    $medicalHistory: String
    $ongoingTreatments: String
    $image: String
    $isActive: Boolean
  ) {
    updatePatient(
      id: $id
      name: $name
      email: $email
      mobile: $mobile
      birthdate: $birthdate
      gender: $gender
      address: $address
      medicalHistory: $medicalHistory
      ongoingTreatments: $ongoingTreatments
      image: $image
      isActive: $isActive
    ) {
      id
      name
      isActive
    }
  }
`;

export const DELETE_PATIENT = gql`
  mutation DeletePatient($id: ID!) {
    deletePatient(id: $id)
  }
`;
