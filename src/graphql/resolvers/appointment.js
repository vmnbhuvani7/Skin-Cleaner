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
    getAppointments: isAuthenticated(async (_, { page = 1, limit = 10, filter }, context) => {
      await dbConnect();
      
      let query = {};
      const parsedFilter = filter ? JSON.parse(filter) : {};
      const { status, patientId, dateFrom, dateTo, searchTerm } = parsedFilter;
      
      // Role-based scoping
      if (context.user.role === 'Patient') {
        query.patient = context.user.id;
      } else if (context.user.role === 'Organization') {
        query.organization = context.user.id;
      }
      
      // Status Filter
      if (status && status !== 'all') {
        query.status = status;
      }

      // Patient Filter (for Orgs)
      if (patientId && patientId !== 'all' && context.user.role === 'Organization') {
        query.patient = patientId;
      }

      // Date Range Filter
      if (dateFrom || dateTo) {
        query.appointmentDate = {};
        if (dateFrom) {
          query.appointmentDate.$gte = new Date(dateFrom);
        }
        if (dateTo) {
          query.appointmentDate.$lte = new Date(dateTo);
        }
      }

      // Backend Search Logic
      if (searchTerm) {
        // Search in patients
        const matchingPatients = await User.find({ 
          name: { $regex: searchTerm, $options: 'i' },
          role: 'Patient'
        }).select('_id');
        
        // Search in services
        const matchingServices = await Service.find({
          title: { $regex: searchTerm, $options: 'i' }
        }).select('_id');

        query.$or = [
          { patient: { $in: matchingPatients.map(p => p._id) } },
          { service: { $in: matchingServices.map(s => s._id) } },
          { notes: { $regex: searchTerm, $options: 'i' } }
        ];
      }

      const skip = (page - 1) * limit;
      const appointments = await Appointment.find(query)
        .sort({ createdAt: -1 })
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
    getAppointmentStats: isAuthenticated(async (_, __, context) => {
      await dbConnect();
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      let baseQuery = {};
      if (context.user.role === 'Organization') {
        baseQuery = { organization: context.user.id };
      } else if (context.user.role === 'Patient') {
        baseQuery = { patient: context.user.id };
      } else {
        return {
          totalPending: 0, totalApproved: 0, totalRejected: 0,
          todayAppointments: 0, todayPending: 0, todayApproved: 0, todayRejected: 0
        };
      }
      
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
        args.status = 'Pending';
        // Find patient's organization and assign it
        const patientData = await User.findById(context.user.id);
        if (patientData && patientData.organization) {
          args.organization = patientData.organization;
        }
      } else if (context.user.role === 'Organization') {
        args.organization = context.user.id;
        if (!args.status) args.status = 'Approved';
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
    deleteAppointment: isAuthenticated(async (_, { id }, context) => {
      await dbConnect();
      const appointment = await Appointment.findById(id);
      if (!appointment) throw new Error('Appointment not found');

      // Security check: Only owner or assigned organization can delete
      if (context.user.role === 'Patient' && appointment.patient.toString() !== context.user.id) {
        throw new Error('Unauthorized: You can only delete your own appointments');
      }
      
      if (context.user.role === 'Organization' && appointment.organization.toString() !== context.user.id) {
        throw new Error('Unauthorized: You can only delete appointments for your own clinic');
      }

      await Appointment.findByIdAndDelete(id);
      return true;
    }),
  },
};
