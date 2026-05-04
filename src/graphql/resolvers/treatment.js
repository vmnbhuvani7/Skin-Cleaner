import Treatment from '@/models/Treatment';
import TreatmentSession from '@/models/TreatmentSession';
import Patient from '@/models/Patient';
import Service from '@/models/Service';
import Doctor from '@/models/Doctor';
import dbConnect from '@/lib/mongodb';

export const treatmentResolvers = {
  Treatment: {
    patient: async (parent) => {
      await dbConnect();
      return await Patient.findById(parent.patient);
    },
    service: async (parent) => {
      await dbConnect();
      return await Service.findById(parent.service);
    },
    doctor: async (parent) => {
      await dbConnect();
      return await Doctor.findById(parent.doctor);
    },
    sessions: async (parent) => {
      await dbConnect();
      return await TreatmentSession.find({ treatment: parent.id }).sort({ sessionNumber: 1 });
    },
    createdAt: (parent) => parent.createdAt ? parent.createdAt.toISOString() : null,
    updatedAt: (parent) => parent.updatedAt ? parent.updatedAt.toISOString() : null,
  },
  TreatmentSession: {
    doctor: async (parent) => {
      if (!parent.doctor) return null;
      await dbConnect();
      return await Doctor.findById(parent.doctor);
    },
    date: (parent) => parent.date ? parent.date.toISOString() : null,
    createdAt: (parent) => parent.createdAt ? parent.createdAt.toISOString() : null,
  },
  Query: {
    getTreatments: async () => {
      await dbConnect();
      return await Treatment.find().sort({ createdAt: -1 });
    },
    getTreatment: async (_, { id }) => {
      await dbConnect();
      return await Treatment.findById(id);
    },
    getPatientTreatments: async (_, { patientId }) => {
      await dbConnect();
      return await Treatment.find({ patient: patientId }).sort({ createdAt: -1 });
    },
  },
  Mutation: {
    createTreatment: async (_, { input }) => {
      await dbConnect();
      const {
        patientId, serviceId, doctorId, type, totalAmount, discount, finalAmount,
        totalSessions, intervalDays, paidAmount, onlinePayment, cashPayment, notes,
        sessionDiscount
      } = input;

      const treatment = await Treatment.create({
        patient: patientId,
        service: serviceId,
        doctor: doctorId,
        type,
        totalAmount,
        discount,
        finalAmount,
        totalSessions,
        intervalDays,
        status: 'IN_PROGRESS'
      });

      // Create first session (Completed)
      await TreatmentSession.create({
        treatment: treatment._id,
        sessionNumber: 1,
        date: new Date(),
        status: 'COMPLETED',
        paidAmount,
        onlinePayment,
        cashPayment,
        discount: sessionDiscount || 0,
        doctor: doctorId,
        notes
      });

      // If multi-session, create estimated future sessions
      if (type === 'MULTI_SESSION' && totalSessions > 1) {
        const sessionsToCreate = [];
        for (let i = 2; i <= totalSessions; i++) {
          const estimatedDate = new Date();
          estimatedDate.setDate(estimatedDate.getDate() + (intervalDays * (i - 1)));
          sessionsToCreate.push({
            treatment: treatment._id,
            sessionNumber: i,
            date: estimatedDate,
            status: 'ESTIMATED',
            doctor: doctorId
          });
        }
        await TreatmentSession.insertMany(sessionsToCreate);
      } else if (type === 'ONE_TIME') {
          // Mark treatment as completed immediately for one-time
          treatment.status = 'COMPLETED';
          await treatment.save();
      }

      return treatment;
    },
    updateTreatment: async (_, { id, input }) => {
      await dbConnect();
      const treatment = await Treatment.findByIdAndUpdate(id, input, { new: true });
      return treatment;
    },
    deleteTreatment: async (_, { id }) => {
      await dbConnect();
      await TreatmentSession.deleteMany({ treatment: id });
      await Treatment.findByIdAndDelete(id);
      return true;
    },
    addSession: async (_, { input }) => {
        await dbConnect();
        // This is for adding a session that wasn't pre-generated or filling an estimated one
        // Check if sessionNumber already exists as ESTIMATED
        const existingSession = await TreatmentSession.findOne({ 
            treatment: input.treatmentId, 
            sessionNumber: input.sessionNumber 
        });

        if (existingSession) {
            return await TreatmentSession.findByIdAndUpdate(existingSession._id, {
                ...input,
                status: input.status || 'COMPLETED',
                date: input.date ? new Date(input.date) : new Date()
            }, { new: true });
        }

        return await TreatmentSession.create({
            ...input,
            treatment: input.treatmentId,
            date: input.date ? new Date(input.date) : new Date(),
            status: input.status || 'COMPLETED'
        });
    },
    updateSession: async (_, { id, input }) => {
      await dbConnect();
      const updateData = { ...input };
      if (input.date) updateData.date = new Date(input.date);
      
      const session = await TreatmentSession.findByIdAndUpdate(id, updateData, { new: true });
      
      // Check if all sessions are completed to update treatment status
      const treatment = await Treatment.findById(session.treatment);
      const allSessions = await TreatmentSession.find({ treatment: treatment._id });
      const allCompleted = allSessions.every(s => s.status === 'COMPLETED');
      
      if (allCompleted && treatment.status !== 'COMPLETED') {
          treatment.status = 'COMPLETED';
          await treatment.save();
      }
      
      return session;
    },
    deleteSession: async (_, { id }) => {
      await dbConnect();
      await TreatmentSession.findByIdAndDelete(id);
      return true;
    },
  },
};
