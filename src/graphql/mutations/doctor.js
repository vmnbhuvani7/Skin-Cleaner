import * as Apollo from '@apollo/client';
const { gql } = Apollo;

export const CREATE_DOCTOR = gql`
  mutation CreateDoctor($name: String!, $specialization: String!, $experience: Int!, $consultationFee: Int!, $mobile: String!, $image: String) {
    createDoctor(name: $name, specialization: $specialization, experience: $experience, consultationFee: $consultationFee, mobile: $mobile, image: $image) {
      id
    }
  }
`;

export const UPDATE_DOCTOR = gql`
  mutation UpdateDoctor($id: ID!, $name: String, $specialization: String, $experience: Int, $consultationFee: Int, $mobile: String, $isActive: Boolean, $image: String) {
    updateDoctor(id: $id, name: $name, specialization: $specialization, experience: $experience, consultationFee: $consultationFee, mobile: $mobile, isActive: $isActive, image: $image) {
      id
      isActive
    }
  }
`;

export const DELETE_DOCTOR = gql`
  mutation DeleteDoctor($id: ID!) {
    deleteDoctor(id: $id)
  }
`;
