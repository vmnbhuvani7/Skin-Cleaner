import TreatmentSession from '@/models/TreatmentSession';
import TreatmentPlan from '@/models/TreatmentPlan';
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
    treatmentPlan: async (parent) => {
      if (!parent.treatmentPlan) return null;
      await dbConnect();
      return await TreatmentPlan.findById(parent.treatmentPlan);
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
    actualDate: (parent) => parent.actualDate ? parent.actualDate.toISOString() : null,
    treatmentStartTime: (parent) => parent.treatmentStartTime ? parent.treatmentStartTime.toISOString() : null,
    treatmentEndTime: (parent) => parent.treatmentEndTime ? parent.treatmentEndTime.toISOString() : null,
    createdAt: (parent) => parent.createdAt.toISOString(),
  },
  Query: {
    getPatientSessions: async (_, { patientId }) => {
      await dbConnect();
      const now = new Date();
      
      // Auto-update status to 'Missed'
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
    getAllSessions: async () => {
      await dbConnect();
      const now = new Date();
      
      // Auto-update all scheduled sessions that have passed
      await TreatmentSession.updateMany(
        { 
          status: 'Scheduled', 
          appointmentDate: { $lt: now } 
        },
        { $set: { status: 'Missed' } }
      );

      // Abandoned Logic: If 3+ missed sessions in a plan
      const plans = await TreatmentPlan.find({ status: 'In Progress' });
      for (const plan of plans) {
        const missedCount = await TreatmentSession.countDocuments({ 
          treatmentPlan: plan.id, 
          status: 'Missed' 
        });
        if (missedCount >= 3) {
          await TreatmentPlan.findByIdAndUpdate(plan.id, { status: 'Abandoned' });
        }
      }

      return await TreatmentSession.find().sort({ appointmentDate: -1 });
    },
  },
  Mutation: {
    scheduleSession: async (_, { patientId, treatmentPlanId, appointmentDate, actualDate, isWalkIn, serviceId, doctorId, status, notes, sessionNumber }) => {
      await dbConnect();
      return await TreatmentSession.create({
        patient: patientId,
        treatmentPlan: treatmentPlanId,
        appointmentDate: new Date(appointmentDate),
        actualDate: actualDate ? new Date(actualDate) : (isWalkIn ? new Date() : null),
        isWalkIn: isWalkIn || false,
        status: status || 'Scheduled',
        service: serviceId,
        doctor: doctorId,
        notes,
        sessionNumber: sessionNumber || 1
      });
    },
    completeSession: async (_, { id, actualDate, treatmentStartTime, treatmentEndTime, areaTreated, dosage, complications, beforeNotes, afterNotes, notes }) => {
      await dbConnect();
      const session = await TreatmentSession.findById(id);
      if (!session) throw new Error('Session not found');

      const updatedSession = await TreatmentSession.findByIdAndUpdate(id, {
        status: 'Completed',
        actualDate: new Date(actualDate),
        treatmentStartTime: treatmentStartTime ? new Date(treatmentStartTime) : null,
        treatmentEndTime: treatmentEndTime ? new Date(treatmentEndTime) : null,
        areaTreated,
        dosage,
        complications,
        beforeNotes,
        afterNotes,
        notes,
        attended: true
      }, { new: true });

      // If part of a series, handle auto-scheduling
      if (session.treatmentPlan) {
        const plan = await TreatmentPlan.findById(session.treatmentPlan);
        const newCompletedCount = plan.completedSessions + 1;
        
        await TreatmentPlan.findByIdAndUpdate(plan.id, {
          completedSessions: newCompletedCount,
          status: newCompletedCount >= plan.totalSessions ? 'Completed' : 'In Progress'
        });

        // Auto-schedule next session if not finished
        if (newCompletedCount < plan.totalSessions) {
          const nextDate = new Date(actualDate);
          nextDate.setDate(nextDate.getDate() + (plan.intervalWeeks * 7));

          await TreatmentSession.create({
            patient: plan.patient,
            treatmentPlan: plan.id,
            service: plan.service,
            doctor: plan.doctor,
            sessionNumber: newCompletedCount + 1,
            appointmentDate: nextDate,
            status: 'Scheduled',
            notes: `Auto-scheduled follow-up for ${plan.service.title || 'treatment'}`
          });
        }
      }

      return updatedSession;
    },
    updateSessionStatus: async (_, { id, status, actualDate, notes }) => {
      await dbConnect();
      const session = await TreatmentSession.findById(id);
      let update = { status };
      if (notes) update.notes = notes;
      if (actualDate) update.actualDate = new Date(actualDate);
      
      const updatedSession = await TreatmentSession.findByIdAndUpdate(id, update, { new: true });

      // If status changed to Completed, update plan progress
      if (status === 'Completed' && session.status !== 'Completed' && session.treatmentPlan) {
        const plan = await TreatmentPlan.findById(session.treatmentPlan);
        const newCompletedCount = (plan.completedSessions || 0) + 1;
        await TreatmentPlan.findByIdAndUpdate(plan.id, {
          completedSessions: newCompletedCount,
          status: newCompletedCount >= plan.totalSessions ? 'Completed' : 'In Progress'
        });
      }

      return updatedSession;
    },
    updateSession: async (_, { id, appointmentDate, doctorId, serviceId, ...others }) => {
      await dbConnect();
      const updates = { ...others };
      if (appointmentDate) updates.appointmentDate = new Date(appointmentDate);
      if (doctorId) updates.doctor = doctorId;
      if (serviceId) updates.service = serviceId;
      
      if (updates.actualDate) updates.actualDate = new Date(updates.actualDate);
      if (updates.treatmentStartTime) updates.treatmentStartTime = new Date(updates.treatmentStartTime);
      if (updates.treatmentEndTime) updates.treatmentEndTime = new Date(updates.treatmentEndTime);

      const session = await TreatmentSession.findById(id);
      const updatedSession = await TreatmentSession.findByIdAndUpdate(id, updates, { new: true });

      // If status changed to Completed, we might need to update the plan progress
      if (updates.status === 'Completed' && session.status !== 'Completed' && session.treatmentPlan) {
        const plan = await TreatmentPlan.findById(session.treatmentPlan);
        const newCompletedCount = plan.completedSessions + 1;
        await TreatmentPlan.findByIdAndUpdate(plan.id, {
          completedSessions: newCompletedCount,
          status: newCompletedCount >= plan.totalSessions ? 'Completed' : 'In Progress'
        });
      }

      return updatedSession;
    },
    deleteSession: async (_, { id }) => {
      await dbConnect();
      await TreatmentSession.findByIdAndDelete(id);
      return true;
    },
  },
};
