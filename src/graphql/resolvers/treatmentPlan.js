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

      // Revenue = One-time sessions + Plan payments
      const oneTimeRevenue = allSessions
        .filter(s => !s.treatmentPlan)
        .reduce((sum, s) => sum + (s.paidAmount || 0), 0);
      
      const planRevenue = allPlans.reduce((sum, p) => sum + (p.paidAmount || 0), 0);

      return {
        completionRate: (completedPlans / totalPlans) * 100,
        dropoutRate: (abandonedPlans / totalPlans) * 100,
        noShowRate: (missedSessions / totalSessions) * 100,
        totalRevenue: oneTimeRevenue + planRevenue,
      };
    }
  },
  Mutation: {
    startTreatmentPlan: async (_, { 
      patientId, 
      serviceId, 
      doctorId, 
      totalSessions, 
      intervalWeeks, 
      firstAppointmentDate, 
      notes,
      totalAmount,
      paidAmount,
      discount
    }) => {
      await dbConnect();
      
      const paymentStatus = (paidAmount || 0) >= (totalAmount || 0) ? 'Fully Paid' : (paidAmount > 0 ? 'Partially Paid' : 'Pending');

      const plan = await TreatmentPlan.create({
        patient: patientId,
        service: serviceId,
        doctor: doctorId,
        totalSessions: totalSessions || 1,
        intervalWeeks: intervalWeeks || 4,
        status: 'In Progress',
        totalAmount: totalAmount || 0,
        paidAmount: paidAmount || 0,
        discount: discount || 0,
        paymentStatus
      });

      // Create the first session
      // If upfront payment was made, we might want to record it on the first session too?
      // Actually, if it's upfront, it's on the plan. 
      // But let's track the session's base amount.
      await TreatmentSession.create({
        patient: patientId,
        treatmentPlan: plan.id,
        service: serviceId,
        doctor: doctorId,
        sessionNumber: 1,
        appointmentDate: new Date(firstAppointmentDate),
        status: 'Scheduled',
        notes,
        baseAmount: (totalAmount || 0) / (totalSessions || 1)
      });

      return plan;
    },
    cancelPlan: async (_, { id, reason }) => {
      await dbConnect();
      return await TreatmentPlan.findByIdAndUpdate(id, { 
        status: 'Cancelled',
      }, { new: true });
    },
    updateTreatmentPlan: async (_, { id, doctorId, ...updates }) => {
      await dbConnect();
      if (doctorId) updates.doctor = doctorId;
      
      const plan = await TreatmentPlan.findById(id);
      if (!plan) return null;

      // Recalculate payment status if amounts are updated
      const newTotal = updates.totalAmount !== undefined ? updates.totalAmount : plan.totalAmount;
      const newPaid = updates.paidAmount !== undefined ? updates.paidAmount : plan.paidAmount;
      
      updates.paymentStatus = (newPaid || 0) >= (newTotal || 0) ? 'Fully Paid' : (newPaid > 0 ? 'Partially Paid' : 'Pending');

      return await TreatmentPlan.findByIdAndUpdate(id, updates, { new: true });
    }
  }
};
