import mongoose, { Document, Schema } from 'mongoose';

export interface IQuestion extends Document {
  interviewId: mongoose.Types.ObjectId;
  order: number;
  question: string;
  category: string;
  difficulty: string;
  expectedPoints: string[];
  followUps: string[];
  aiGenerated: boolean;
}

const questionSchema = new Schema<IQuestion>({
  interviewId: {
    type: Schema.Types.ObjectId,
    ref: 'InterviewSession',
    required: true
  },
  order: {
    type: Number,
    required: true
  },
  question: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    required: true
  },
  expectedPoints: [{
    type: String
  }],
  followUps: [{
    type: String
  }],
  aiGenerated: {
    type: Boolean,
    default: true
  }
});

export const Question = mongoose.model<IQuestion>('Question', questionSchema);
