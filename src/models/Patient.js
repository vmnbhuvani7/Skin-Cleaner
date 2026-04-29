import mongoose from 'mongoose';

const PatientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a patient name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
  },
  mobile: {
    type: String,
    required: [true, 'Please provide contact number'],
  },
  birthdate: {
    type: Date,
    required: [true, 'Please provide birthdate'],
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: [true, 'Please provide gender'],
  },
  address: {
    type: String,
  },
  medicalHistory: {
    type: String,
  },
  ongoingTreatments: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Patient || mongoose.model('Patient', PatientSchema);
