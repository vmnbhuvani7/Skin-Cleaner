import mongoose from 'mongoose';

const TreatmentSchema = new mongoose.Schema({
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
    required: true,
  },
  type: {
    type: String,
    enum: ['ONE_TIME', 'MULTI_SESSION'],
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
    default: 0,
  },
  discount: {
    type: Number,
    default: 0,
  },
  finalAmount: {
    type: Number,
    required: true,
    default: 0,
  },
  totalSessions: {
    type: Number,
    default: 1,
  },
  intervalDays: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
    default: 'IN_PROGRESS',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

TreatmentSchema.pre('save', function () {
  this.updatedAt = Date.now();
});

export default mongoose.models.Treatment || mongoose.model('Treatment', TreatmentSchema);
