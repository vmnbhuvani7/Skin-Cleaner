import mongoose from 'mongoose';

const TreatmentSessionSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
  },
  appointmentDate: {
    type: Date,
    required: [true, 'Please provide appointment date'],
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Completed', 'Missed', 'Cancelled'],
    default: 'Scheduled',
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
