import mongoose from 'mongoose';

const TreatmentSessionSchema = new mongoose.Schema({
  treatment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Treatment',
    required: true,
  },
  sessionNumber: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['PENDING', 'COMPLETED', 'CANCELLED', 'ESTIMATED'],
    default: 'PENDING',
  },
  paidAmount: {
    type: Number,
    default: 0,
  },
  discount: {
    type: Number,
    default: 0,
  },
  onlinePayment: {
    type: Number,
    default: 0,
  },
  cashPayment: {
    type: Number,
    default: 0,
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
  },
  notes: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.TreatmentSession || mongoose.model('TreatmentSession', TreatmentSessionSchema);
