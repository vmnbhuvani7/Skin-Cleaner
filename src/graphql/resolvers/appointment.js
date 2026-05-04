import Appointment from '@/models/Appointment';
import Patient from '@/models/Patient';
import Service from '@/models/Service';
import Doctor from '@/models/Doctor';
import dbConnect from '@/lib/mongodb';

export const appointmentResolvers = {
  Appointment: {
    patient: async (parent) => {
      await dbConnect();
      return await Patient.findById(parent.patient);
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
    getAppointments: async (_, { page = 1, limit = 10, status, dateFrom, dateTo }) => {
      await dbConnect();
      
      let query = {};
      
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
    },
    getAppointment: async (_, { id }) => {
      await dbConnect();
      return await Appointment.findById(id);
    },
    getAppointmentStats: async () => {
      await dbConnect();
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const totalPending = await Appointment.countDocuments({ status: 'Pending' });
      const totalApproved = await Appointment.countDocuments({ status: 'Approved' });
      const totalRejected = await Appointment.countDocuments({ status: 'Rejected' });
      
      const todayAppointments = await Appointment.find({
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
    }
  },
  Mutation: {
    createAppointment: async (_, args) => {
      await dbConnect();
      return await Appointment.create(args);
    },
    updateAppointment: async (_, { id, ...args }) => {
      await dbConnect();
      return await Appointment.findByIdAndUpdate(id, args, { new: true });
    },
    approveAppointment: async (_, { id }) => {
      await dbConnect();
      return await Appointment.findByIdAndUpdate(id, { status: 'Approved' }, { new: true });
    },
    rejectAppointment: async (_, { id }) => {
      await dbConnect();
      return await Appointment.findByIdAndUpdate(id, { status: 'Rejected' }, { new: true });
    },
    deleteAppointment: async (_, { id }) => {
      await dbConnect();
      await Appointment.findByIdAndDelete(id);
      return true;
    },
  },
};
