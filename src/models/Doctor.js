import mongoose from 'mongoose';

const DoctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a doctor name'],
  },
  specialization: {
    type: String,
    enum: ['Skin', 'Hair', 'Both'],
    required: [true, 'Please provide specialization'],
  },
  experience: {
    type: Number,
    required: [true, 'Please provide years of experience'],
  },
  consultationFee: {
    type: Number,
    required: [true, 'Please provide consultation fee'],
  },
  mobile: {
    type: String,
    required: [true, 'Please provide contact number'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  image: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Doctor || mongoose.model('Doctor', DoctorSchema);
