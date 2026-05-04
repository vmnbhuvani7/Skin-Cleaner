import { gql } from '@apollo/client';

export const GET_APPOINTMENTS = gql`
  query GetAppointments($page: Int, $limit: Int, $status: String, $dateFrom: String, $dateTo: String) {
    getAppointments(page: $page, limit: $limit, status: $status, dateFrom: $dateFrom, dateTo: $dateTo) {
      appointments {
        id
        patient {
          id
          name
          email
          mobile
        }
        service {
          id
          title
          desc
          icon
        }
        doctor {
          id
          name
          specialization
        }
        appointmentDate
        status
        notes
        createdAt
      }
      totalCount
      totalPages
      currentPage
      hasMore
    }
  }
`;

export const GET_APPOINTMENT = gql`
  query GetAppointment($id: ID!) {
    getAppointment(id: $id) {
      id
      patient {
        id
        name
        email
        mobile
      }
      service {
        id
        title
        desc
        icon
      }
      doctor {
        id
        name
        specialization
      }
      appointmentDate
      status
      notes
      createdAt
    }
  }
`;

export const GET_APPOINTMENT_STATS = gql`
  query GetAppointmentStats {
    getAppointmentStats {
      totalPending
      totalApproved
      totalRejected
      todayAppointments
      todayPending
      todayApproved
      todayRejected
    }
  }
`;
