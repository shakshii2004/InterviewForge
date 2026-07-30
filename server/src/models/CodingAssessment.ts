import mongoose, { Schema, Document } from 'mongoose';

export interface ICodingAssessment extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'Assessment' | 'Contest';
  durationMinutes: number;
  status: 'In Progress' | 'Completed';
  questions: mongoose.Types.ObjectId[];
  startTime: Date;
  endTime?: Date;
  results?: {
    overallScore: number;
    averageRuntime: number;
    averageMemory: number;
    accuracy: number;
    aiReview: string;
    questionScores: Array<{
      questionId: mongoose.Types.ObjectId;
      score: number;
      status: string;
    }>;
  };
  createdAt: Date;
  updatedAt: Date;
}

const codingAssessmentSchema = new Schema<ICodingAssessment>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['Assessment', 'Contest'], required: true },
  durationMinutes: { type: Number, required: true },
  status: { type: String, enum: ['In Progress', 'Completed'], default: 'In Progress' },
  questions: [{ type: Schema.Types.ObjectId, ref: 'CodingQuestion' }],
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
  results: {
    overallScore: { type: Number },
    averageRuntime: { type: Number },
    averageMemory: { type: Number },
    accuracy: { type: Number },
    aiReview: { type: String },
    questionScores: [{
      questionId: { type: Schema.Types.ObjectId, ref: 'CodingQuestion' },
      score: { type: Number },
      status: { type: String }
    }]
  }
}, { timestamps: true });

export const CodingAssessment = mongoose.model<ICodingAssessment>('CodingAssessment', codingAssessmentSchema);
