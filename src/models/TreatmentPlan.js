import mongoose from 'mongoose';

const TreatmentPlanSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true,
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
  },
  totalSessions: {
    type: Number,
    required: true,
    default: 1, // 1 for one-time treatments
  },
  completedSessions: {
    type: Number,
    default: 0,
  },
  intervalWeeks: {
    type: Number,
    default: 4, // Default 4 weeks interval
  },
  status: {
    type: String,
    enum: ['In Progress', 'Completed', 'Abandoned', 'Cancelled'],
    default: 'In Progress',
  },
  totalAmount: {
    type: Number,
    default: 0,
  },
  paidAmount: {
    type: Number,
    default: 0,
  },
  discount: {
    type: Number,
    default: 0,
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Partially Paid', 'Fully Paid'],
    default: 'Pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.TreatmentPlan || mongoose.model('TreatmentPlan', TreatmentPlanSchema);
