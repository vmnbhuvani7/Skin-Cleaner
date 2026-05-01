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
      return await TreatmentSession.find({ patient: patientId })
        .sort({ appointmentDate: -1 })
        .populate('service')
        .populate('doctor')
        .populate('treatmentPlan');
    },
    getUpcomingAppointments: async () => {
      await dbConnect();
      const now = new Date();
      
      // Auto-update passed scheduled sessions to Missed
      await TreatmentSession.updateMany(
        { status: 'Scheduled', appointmentDate: { $lt: now } },
        { $set: { status: 'Missed' } }
      );

      return await TreatmentSession.find({
        status: 'Scheduled',
        appointmentDate: { $gte: now }
      }).sort({ appointmentDate: 1 }).populate('patient').populate('service').populate('doctor');
    },
    getAllSessions: async (_, { page = 1, limit = 10, status, search }) => {
      await dbConnect();
      const skip = (page - 1) * limit;
      
      const query = {};
      if (status && status !== 'All') {
        query.status = status;
      }

      if (search) {
        // Find patients matching name or mobile
        const patients = await Patient.find({
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { mobile: { $regex: search, $options: 'i' } }
          ]
        }).select('_id');
        
        const patientIds = patients.map(p => p._id);
        query.patient = { $in: patientIds };
      }
      
      const [sessions, totalCount] = await Promise.all([
        TreatmentSession.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate('patient')
          .populate('treatmentPlan')
          .populate('service')
          .populate('doctor'),
        TreatmentSession.countDocuments(query)
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      return {
        sessions,
        totalCount,
        totalPages,
        currentPage: page,
        hasMore: page < totalPages
      };
    },
  },
  Mutation: {
    scheduleSession: async (_, { patientId, treatmentPlanId, appointmentDate, actualDate, isWalkIn, serviceId, doctorId, status, notes, sessionNumber, baseAmount, paidAmount, discount }) => {
      await dbConnect();
      
      const session = await TreatmentSession.create({
        patient: patientId,
        treatmentPlan: treatmentPlanId,
        appointmentDate: new Date(appointmentDate),
        actualDate: actualDate ? new Date(actualDate) : (isWalkIn ? new Date() : null),
        isWalkIn: isWalkIn || false,
        status: status || 'Scheduled',
        service: serviceId,
        doctor: doctorId,
        notes,
        sessionNumber: sessionNumber || 1,
        baseAmount: baseAmount || 0,
        paidAmount: paidAmount || 0,
        discount: discount || 0
      });

      // If one-time session has paidAmount, we consider it part of revenue
      // (Global stats already sums this up)

      // If it's part of a plan and has paidAmount, update plan
      if (treatmentPlanId && paidAmount > 0) {
        const plan = await TreatmentPlan.findById(treatmentPlanId);
        if (plan) {
          const newPaid = plan.paidAmount + paidAmount;
          const paymentStatus = newPaid >= plan.totalAmount ? 'Fully Paid' : (newPaid > 0 ? 'Partially Paid' : 'Pending');
          await TreatmentPlan.findByIdAndUpdate(treatmentPlanId, { 
            paidAmount: newPaid,
            paymentStatus
          });
        }
      }

      return session;
    },
    completeSession: async (_, { id, actualDate, treatmentStartTime, treatmentEndTime, areaTreated, dosage, complications, beforeNotes, afterNotes, notes, shouldAutoSchedule, nextSessionDate, updateNextSessionId, paidAmount, discount }) => {
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
        attended: true,
        paidAmount: paidAmount || 0,
        discount: discount || 0
      }, { new: true });

      // Handle existing next session update
      if (updateNextSessionId && nextSessionDate) {
        await TreatmentSession.findByIdAndUpdate(updateNextSessionId, {
          appointmentDate: new Date(nextSessionDate)
        });
      }

      // If part of a series, handle auto-scheduling and plan progress
      if (session.treatmentPlan) {
        const plan = await TreatmentPlan.findById(session.treatmentPlan);
        const newCompletedCount = plan.completedSessions + 1;
        
        // Update plan progress AND cumulative payment
        const newPlanPaid = plan.paidAmount + (paidAmount || 0);
        const paymentStatus = newPlanPaid >= plan.totalAmount ? 'Fully Paid' : (newPlanPaid > 0 ? 'Partially Paid' : 'Pending');

        await TreatmentPlan.findByIdAndUpdate(plan.id, {
          completedSessions: newCompletedCount,
          status: newCompletedCount >= plan.totalSessions ? 'Completed' : 'In Progress',
          paidAmount: newPlanPaid,
          paymentStatus
        });

        // Auto-schedule next session if not finished and requested
        if (!updateNextSessionId && shouldAutoSchedule !== false && newCompletedCount < plan.totalSessions) {
          const finalNextDate = nextSessionDate ? new Date(nextSessionDate) : new Date(actualDate);
          if (!nextSessionDate) {
            finalNextDate.setDate(finalNextDate.getDate() + (plan.intervalWeeks * 7));
          }

          await TreatmentSession.create({
            patient: plan.patient,
            treatmentPlan: plan.id,
            service: plan.service,
            doctor: plan.doctor,
            sessionNumber: newCompletedCount + 1,
            appointmentDate: finalNextDate,
            status: 'Scheduled',
            notes: `Auto-scheduled follow-up for ${plan.service.title || 'treatment'}`,
            baseAmount: plan.totalAmount / plan.totalSessions
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
    updateSession: async (_, { id, appointmentDate, doctorId, serviceId, baseAmount, paidAmount, discount, ...others }) => {
      await dbConnect();
      const updates = { ...others };
      if (appointmentDate) updates.appointmentDate = new Date(appointmentDate);
      if (doctorId) updates.doctor = doctorId;
      if (serviceId) updates.service = serviceId;
      if (baseAmount !== undefined) updates.baseAmount = baseAmount;
      if (paidAmount !== undefined) updates.paidAmount = paidAmount;
      if (discount !== undefined) updates.discount = discount;
      
      if (updates.actualDate) updates.actualDate = new Date(updates.actualDate);
      if (updates.treatmentStartTime) updates.treatmentStartTime = new Date(updates.treatmentStartTime);
      if (updates.treatmentEndTime) updates.treatmentEndTime = new Date(updates.treatmentEndTime);

      const session = await TreatmentSession.findById(id);
      
      // If paidAmount is updated and it belongs to a plan, we need to adjust the plan's cumulative total
      if (session.treatmentPlan && paidAmount !== undefined && paidAmount !== session.paidAmount) {
        const plan = await TreatmentPlan.findById(session.treatmentPlan);
        if (plan) {
          const diff = paidAmount - session.paidAmount;
          const newPlanPaid = plan.paidAmount + diff;
          const paymentStatus = newPlanPaid >= plan.totalAmount ? 'Fully Paid' : (newPlanPaid > 0 ? 'Partially Paid' : 'Pending');
          
          await TreatmentPlan.findByIdAndUpdate(plan.id, {
            paidAmount: newPlanPaid,
            paymentStatus
          });
        }
      }

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
