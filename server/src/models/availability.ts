
import mongoose from 'mongoose';

const availabilitySchema = new mongoose.Schema({
  mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dayOfWeek: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], required: true },
  startTime: { type: String, required: true }, // e.g. "15:00"
  endTime: { type: String, required: true }    // e.g. "17:00"
});

export const Availability = mongoose.model('Availability', availabilitySchema);
