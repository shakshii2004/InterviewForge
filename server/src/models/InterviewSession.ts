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
  currentQuestionIndex: number;
  totalQuestions: number;
  score?: number;
  
  // Phase 3.7: Live Interview Fields
  communicationMode?: 'Text' | 'Voice' | 'Video';
  transcript?: Array<{
    speaker: 'AI' | 'User';
    text: string;
    timestamp: Date;
  }>;
  speechMetrics?: {
    averageResponseTime: number;
    wordsPerMinute: number;
    fillerWords: number;
    totalSpeakingTime: number;
  };
  recordingPath?: string;

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
  currentQuestionIndex: {
    type: Number,
    default: 0
  },
  totalQuestions: {
    type: Number,
    default: 5
  },
  score: {
    type: Number
  },
  
  communicationMode: {
    type: String,
    enum: ['Text', 'Voice', 'Video'],
    default: 'Text'
  },
  transcript: [{
    speaker: { type: String, enum: ['AI', 'User'] },
    text: { type: String },
    timestamp: { type: Date, default: Date.now }
  }],
  speechMetrics: {
    averageResponseTime: { type: Number },
    wordsPerMinute: { type: Number },
    fillerWords: { type: Number },
    totalSpeakingTime: { type: Number }
  },
  recordingPath: { type: String },

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
