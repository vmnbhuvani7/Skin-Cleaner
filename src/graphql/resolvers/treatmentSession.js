import TreatmentSession from '@/models/TreatmentSession';
import Patient from '@/models/Patient';
import Service from '@/models/Service';
import Doctor from '@/models/Doctor';
import dbConnect from '@/lib/mongodb';

export const treatmentSessionResolvers = {
  TreatmentSession: {
    patient: async (parent) => {
      await dbConnect();
      return await Patient.findById(parent.patient);
    },
    service: async (parent) => {
      if (!parent.service) return null;
      await dbConnect();
      return await Service.findById(parent.service);
    },
    doctor: async (parent) => {
      if (!parent.doctor) return null;
      await dbConnect();
      return await Doctor.findById(parent.doctor);
    },
    appointmentDate: (parent) => parent.appointmentDate.toISOString(),
    createdAt: (parent) => parent.createdAt.toISOString(),
  },
  Query: {
    getPatientSessions: async (_, { patientId }) => {
      await dbConnect();
      // Auto-update status to 'Missed' if date has passed and still 'Scheduled'
      const now = new Date();
      await TreatmentSession.updateMany(
        { 
          patient: patientId, 
          status: 'Scheduled', 
          appointmentDate: { $lt: now } 
        },
        { $set: { status: 'Missed' } }
      );

      return await TreatmentSession.find({ patient: patientId }).sort({ appointmentDate: -1 });
    },
    getUpcomingAppointments: async () => {
      await dbConnect();
      const now = new Date();
      return await TreatmentSession.find({ 
        status: 'Scheduled', 
        appointmentDate: { $gte: now } 
      }).sort({ appointmentDate: 1 });
    },
  },
  Mutation: {
    scheduleSession: async (_, { patientId, appointmentDate, serviceId, doctorId, notes }) => {
      await dbConnect();
      return await TreatmentSession.create({
        patient: patientId,
        appointmentDate: new Date(appointmentDate),
        service: serviceId,
        doctor: doctorId,
        notes
      });
    },
    updateSessionStatus: async (_, { id, status, notes }) => {
      await dbConnect();
      let update = { status };
      if (notes) update.notes = notes;
      return await TreatmentSession.findByIdAndUpdate(id, update, { new: true });
    },
    deleteSession: async (_, { id }) => {
      await dbConnect();
      await TreatmentSession.findByIdAndDelete(id);
      return true;
    },
  },
};
