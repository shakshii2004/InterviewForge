import mongoose, { Document, Schema } from 'mongoose';

export interface IInterviewSession extends Document {
  userId: mongoose.Types.ObjectId;
  role: string;
  experienceLevel: string;
  interviewType: string;
  difficulty: string;
  duration: number; // in minutes
  resumeId?: mongoose.Types.ObjectId;
  status: 'pending' | 'in-progress' | 'completed';
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
}

const interviewSessionSchema = new Schema<IInterviewSession>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    required: true
  },
  experienceLevel: {
    type: String,
    required: true
  },
  interviewType: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  resumeId: {
    type: Schema.Types.ObjectId,
    ref: 'Resume',
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending'
  },
  startedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const InterviewSession = mongoose.model<IInterviewSession>('InterviewSession', interviewSessionSchema);
