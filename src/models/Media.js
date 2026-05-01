import mongoose from 'mongoose';

const MediaSchema = new mongoose.Schema({
  filename: String,
  contentType: String,
  data: Buffer,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Media || mongoose.model('Media', MediaSchema);
