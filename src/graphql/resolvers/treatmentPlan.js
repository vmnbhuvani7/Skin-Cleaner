import TreatmentPlan from '@/models/TreatmentPlan';
import TreatmentSession from '@/models/TreatmentSession';
import Patient from '@/models/Patient';
import Service from '@/models/Service';
import Doctor from '@/models/Doctor';
import dbConnect from '@/lib/mongodb';

export const treatmentPlanResolvers = {
  TreatmentPlan: {
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
    sessions: async (parent) => {
      await dbConnect();
      return await TreatmentSession.find({ treatmentPlan: parent.id }).sort({ sessionNumber: 1 });
    },
    createdAt: (parent) => parent.createdAt.toISOString(),
  },
  Query: {
    getPatientPlans: async (_, { patientId }) => {
      await dbConnect();
      return await TreatmentPlan.find({ patient: patientId }).sort({ createdAt: -1 });
    },
    getPlanDetails: async (_, { id }) => {
      await dbConnect();
      return await TreatmentPlan.findById(id);
    },
    getGlobalStats: async () => {
      await dbConnect();
      const allPlans = await TreatmentPlan.find();
      const allSessions = await TreatmentSession.find();

      const totalPlans = allPlans.length || 1;
      const completedPlans = allPlans.filter(p => p.status === 'Completed').length;
      const abandonedPlans = allPlans.filter(p => p.status === 'Abandoned').length;
      
      const totalSessions = allSessions.length || 1;
      const missedSessions = allSessions.filter(s => s.status === 'Missed').length;

      return {
        completionRate: (completedPlans / totalPlans) * 100,
        dropoutRate: (abandonedPlans / totalPlans) * 100,
        noShowRate: (missedSessions / totalSessions) * 100,
        totalRevenue: totalSessions * 1500, // Placeholder revenue calculation
      };
    }
  },
  Mutation: {
    startTreatmentPlan: async (_, { patientId, serviceId, doctorId, totalSessions, intervalWeeks, firstAppointmentDate, notes }) => {
      await dbConnect();
      
      const plan = await TreatmentPlan.create({
        patient: patientId,
        service: serviceId,
        doctor: doctorId,
        totalSessions: totalSessions || 1,
        intervalWeeks: intervalWeeks || 4,
        status: 'In Progress'
      });

      // Create the first session
      await TreatmentSession.create({
        patient: patientId,
        treatmentPlan: plan.id,
        service: serviceId,
        doctor: doctorId,
        sessionNumber: 1,
        appointmentDate: new Date(firstAppointmentDate),
        status: 'Scheduled',
        notes
      });

      return plan;
    },
    cancelPlan: async (_, { id, reason }) => {
      await dbConnect();
      return await TreatmentPlan.findByIdAndUpdate(id, { 
        status: 'Cancelled',
        // In a real app, you might save the reason in a notes field
      }, { new: true });
    },
    updateTreatmentPlan: async (_, { id, doctorId, ...updates }) => {
      await dbConnect();
      if (doctorId) updates.doctor = doctorId;
      return await TreatmentPlan.findByIdAndUpdate(id, updates, { new: true });
    }
  }
};
