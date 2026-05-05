import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
  },
  mobile: {
    type: String,
    required: [true, 'Please provide a mobile number'],
  },
  password: {
    type: String,
    // Not strictly required since patients might not have passwords immediately when created by an org
  },
  birthdate: {
    type: Date,
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
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
  image: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
});

// Hash password before saving
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.models.User || mongoose.model('User', UserSchema);
