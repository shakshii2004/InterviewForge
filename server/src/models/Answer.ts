import mongoose, { Document, Schema } from 'mongoose';

export interface IAnswer extends Document {
  interviewId: mongoose.Types.ObjectId;
  questionId: mongoose.Types.ObjectId;
  answer: string;
  startedAt: Date;
  submittedAt?: Date;
  responseTime?: number; // in seconds
  aiFeedback?: string;
  score?: number;
}

const answerSchema = new Schema<IAnswer>({
  interviewId: {
    type: Schema.Types.ObjectId,
    ref: 'InterviewSession',
    required: true
  },
  questionId: {
    type: Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  answer: {
    type: String,
    default: ''
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  submittedAt: {
    type: Date
  },
  responseTime: {
    type: Number
  },
  aiFeedback: {
    type: String
  },
  score: {
    type: Number
  }
});

export const Answer = mongoose.model<IAnswer>('Answer', answerSchema);
