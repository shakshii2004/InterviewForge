import mongoose, { Document, Schema } from 'mongoose';

export interface IEvaluation extends Document {
  userId: mongoose.Types.ObjectId;
  interviewId: mongoose.Types.ObjectId;
  overallScore: number;
  technicalScore: number;
  communicationScore: number;
  problemSolvingScore: number;
  confidenceScore: number;
  projectScore: number;
  timeManagementScore: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  recommendedTopics: string[];
  questionFeedback: Array<{
    questionId: mongoose.Types.ObjectId | string;
    score: number;
    strengths: string[];
    missingPoints: string[];
    feedback: string;
  }>;
  generatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const evaluationSchema = new Schema<IEvaluation>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  interviewId: { type: Schema.Types.ObjectId, ref: 'InterviewSession', required: true, unique: true },
  overallScore: { type: Number, required: true },
  technicalScore: { type: Number, required: true },
  communicationScore: { type: Number, required: true },
  problemSolvingScore: { type: Number, required: true },
  confidenceScore: { type: Number, required: true },
  projectScore: { type: Number, required: true },
  timeManagementScore: { type: Number, required: true },
  summary: { type: String, required: true },
  strengths: [{ type: String }],
  improvements: [{ type: String }],
  recommendedTopics: [{ type: String }],
  questionFeedback: [{
    questionId: { type: Schema.Types.Mixed, required: true },
    score: { type: Number, required: true },
    strengths: [{ type: String }],
    missingPoints: [{ type: String }],
    feedback: { type: String, required: true }
  }],
  generatedBy: { type: String, default: 'AI' }
}, {
  timestamps: true
});

export const Evaluation = mongoose.model<IEvaluation>('Evaluation', evaluationSchema);
