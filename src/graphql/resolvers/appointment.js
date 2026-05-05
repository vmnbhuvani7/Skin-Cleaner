import Appointment from '@/models/Appointment';
import User from '@/models/User';
import Service from '@/models/Service';
import Doctor from '@/models/Doctor';
import dbConnect from '@/lib/mongodb';
import { isAuthenticated, isOrganization } from '@/graphql/middleware/auth';

export const appointmentResolvers = {
  Appointment: {
    patient: async (parent) => {
      await dbConnect();
      return await User.findById(parent.patient);
    },
    service: async (parent) => {
      await dbConnect();
      return await Service.findById(parent.service);
    },
    doctor: async (parent) => {
      if (!parent.doctor) return null;
      await dbConnect();
      return await Doctor.findById(parent.doctor);
    },
    appointmentDate: (parent) => parent.appointmentDate ? parent.appointmentDate.toISOString() : null,
    createdAt: (parent) => parent.createdAt ? parent.createdAt.toISOString() : null,
  },
  Query: {
    getAppointments: isAuthenticated(async (_, { page = 1, limit = 10, status, dateFrom, dateTo }, context) => {
      await dbConnect();
      
      let query = {};
      
      // If user is Patient, they can only see their own appointments
      if (context.user.role === 'Patient') {
        query.patient = context.user.id;
      } else if (context.user.role === 'Organization') {
        query.organization = context.user.id;
      }
      
      if (status) {
        query.status = status;
      }

      if (dateFrom || dateTo) {
        query.appointmentDate = {};
        if (dateFrom) {
          query.appointmentDate.$gte = new Date(dateFrom);
        }
        if (dateTo) {
          query.appointmentDate.$lte = new Date(dateTo);
        }
      }

      const skip = (page - 1) * limit;
      const appointments = await Appointment.find(query)
        .sort({ appointmentDate: -1 })
        .skip(skip)
        .limit(limit);
      
      const totalCount = await Appointment.countDocuments(query);
      
      return {
        appointments,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
        hasMore: totalCount > (skip + appointments.length)
      };
    }),
    getAppointment: isAuthenticated(async (_, { id }, context) => {
      await dbConnect();
      const appointment = await Appointment.findById(id);
      if (context.user.role === 'Patient' && appointment.patient.toString() !== context.user.id) {
        throw new Error('Unauthorized access');
      }
      return appointment;
    }),
    getAppointmentStats: isOrganization(async (_, __, context) => {
      await dbConnect();
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const baseQuery = { organization: context.user.id };
      
      const totalPending = await Appointment.countDocuments({ ...baseQuery, status: 'Pending' });
      const totalApproved = await Appointment.countDocuments({ ...baseQuery, status: 'Approved' });
      const totalRejected = await Appointment.countDocuments({ ...baseQuery, status: 'Rejected' });
      
      const todayAppointments = await Appointment.find({
        ...baseQuery,
        appointmentDate: { $gte: today, $lt: tomorrow }
      });

      const todayPending = todayAppointments.filter(a => a.status === 'Pending').length;
      const todayApproved = todayAppointments.filter(a => a.status === 'Approved').length;
      const todayRejected = todayAppointments.filter(a => a.status === 'Rejected').length;

      return {
        totalPending,
        totalApproved,
        totalRejected,
        todayAppointments: todayAppointments.length,
        todayPending,
        todayApproved,
        todayRejected
      };
    })
  },
  Mutation: {
    createAppointment: isAuthenticated(async (_, args, context) => {
      await dbConnect();
      // If patient, force the patient ID to be their own ID
      if (context.user.role === 'Patient') {
        args.patient = context.user.id;
        // Find patient's organization and assign it
        const patientData = await User.findById(context.user.id);
        if (patientData && patientData.organization) {
          args.organization = patientData.organization;
        }
      } else if (context.user.role === 'Organization') {
        args.organization = context.user.id;
      }
      return await Appointment.create(args);
    }),
    updateAppointment: isAuthenticated(async (_, { id, ...args }, context) => {
      await dbConnect();
      const appointment = await Appointment.findById(id);
      if (context.user.role === 'Patient' && appointment.patient.toString() !== context.user.id) {
        throw new Error('Unauthorized access');
      }
      return await Appointment.findByIdAndUpdate(id, args, { new: true });
    }),
    approveAppointment: isOrganization(async (_, { id }, context) => {
      await dbConnect();
      return await Appointment.findByIdAndUpdate(id, { status: 'Approved' }, { new: true });
    }),
    rejectAppointment: isOrganization(async (_, { id }, context) => {
      await dbConnect();
      return await Appointment.findByIdAndUpdate(id, { status: 'Rejected' }, { new: true });
    }),
    deleteAppointment: isOrganization(async (_, { id }, context) => {
      await dbConnect();
      await Appointment.findByIdAndDelete(id);
      return true;
    }),
  },
};
