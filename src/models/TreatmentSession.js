import mongoose from 'mongoose';

const TreatmentSessionSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
  },
  treatmentPlan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TreatmentPlan',
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
  },
  sessionNumber: {
    type: Number,
    default: 1,
  },
  appointmentDate: {
    type: Date,
    required: [true, 'Please provide appointment date'],
  },
  actualDate: {
    type: Date,
  },
  treatmentStartTime: {
    type: Date,
  },
  treatmentEndTime: {
    type: Date,
  },
  isWalkIn: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Completed', 'Missed', 'Cancelled', 'Rescheduled'],
    default: 'Scheduled',
  },
  // Detailed Treatment Record Fields
  areaTreated: {
    type: String, // Body area/zones
  },
  dosage: {
    type: String, // Intensity/Settings
  },
  complications: {
    type: String,
  },
  beforeNotes: {
    type: String,
  },
  afterNotes: {
    type: String,
  },
  notes: {
    type: String,
  },
  attended: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.TreatmentSession || mongoose.model('TreatmentSession', TreatmentSessionSchema);
