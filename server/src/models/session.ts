// models/Session.ts
import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  menteeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  startTime: { type: String, required: true }, // e.g. "15:00"
  endTime: { type: String, required: true },   // e.g. "16:00"
  status: { type: String, enum: ['UPCOMING', 'COMPLETED', 'CANCELLED'], default: 'UPCOMING' }
});


export const Session = mongoose.model('Session', sessionSchema);
