import mongoose, { Document, Schema } from 'mongoose';

export interface ICodingSession extends Document {
  userId: mongoose.Types.ObjectId;
  language: string;
  difficulty: string;
  topics: string[];
  numberOfQuestions: number;
  duration: number; // in minutes
  status: 'pending' | 'active' | 'completed' | 'abandoned';
  code: string;
  currentQuestion?: mongoose.Types.ObjectId;
  questions?: mongoose.Types.ObjectId[];
  codes?: Map<string, string>;
  progress: number;
  lastSavedAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const codingSessionSchema = new Schema<ICodingSession>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  language: {
    type: String,
    required: true,
    enum: ['Java', 'C++', 'Python', 'JavaScript']
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['Easy', 'Medium', 'Hard']
  },
  topics: [{
    type: String,
    required: true
  }],
  numberOfQuestions: {
    type: Number,
    required: true,
    enum: [1, 2, 3, 5]
  },
  duration: {
    type: Number,
    required: true,
    enum: [15, 30, 45, 60, 90]
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'abandoned'],
    default: 'pending'
  },
  code: {
    type: String,
    default: ''
  },
  currentQuestion: {
    type: Schema.Types.ObjectId,
    ref: 'CodingQuestion'
  },
  questions: [{
    type: Schema.Types.ObjectId,
    ref: 'CodingQuestion'
  }],
  codes: {
    type: Map,
    of: String,
    default: {}
  },
  progress: {
    type: Number,
    default: 0
  },
  lastSavedAt: {
    type: Date
  },
  startedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  }
}, { timestamps: true });

export const CodingSession = mongoose.model<ICodingSession>('CodingSession', codingSessionSchema);
