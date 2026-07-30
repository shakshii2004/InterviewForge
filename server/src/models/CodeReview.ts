import mongoose, { Document, Schema } from 'mongoose';

export interface ICodeReview extends Document {
  userId: mongoose.Types.ObjectId;
  submissionId: mongoose.Types.ObjectId;
  
  overallScore: number;
  correctnessScore: number;
  timeComplexityScore: number;
  spaceComplexityScore: number;
  readabilityScore: number;
  bestPracticesScore: number;
  optimizationScore: number;
  
  summary: string;
  timeComplexity: string;
  timeComplexityExplanation: string;
  spaceComplexity: string;
  spaceComplexityExplanation: string;
  
  strengths: string[];
  weaknesses: string[];
  bugs: string[];
  
  edgeCaseAnalysis: {
    case: string;
    handled: boolean;
  }[];
  
  optimizations: string[];
  alternativeApproaches: string[];
  
  interviewerFeedback: string;
  recommendedTopics: string[];
  
  interviewReadiness: {
    rating: string;
    feedback: string;
  };
  
  industryComparison: {
    averageScore: number;
    candidateScore: number;
    estimatedPercentile: string;
  };
  
  learningRoadmap: {
    topic: string;
    reason: string;
    difficulty: string;
    estimatedTime: string;
  }[];
  
  improvementChecklist: string[];
  
  interviewerNotes: {
    communication: number;
    codeOrganization: number;
    problemSolving: number;
    optimizationThinking: number;
    debuggingAbility: number;
    overallImpression: string;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

const codeReviewSchema = new Schema<ICodeReview>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  submissionId: {
    type: Schema.Types.ObjectId,
    ref: 'CodeSubmission',
    required: true,
    unique: true
  },
  overallScore: { type: Number, required: true },
  correctnessScore: { type: Number, required: true },
  timeComplexityScore: { type: Number, required: true },
  spaceComplexityScore: { type: Number, required: true },
  readabilityScore: { type: Number, required: true },
  bestPracticesScore: { type: Number, required: true },
  optimizationScore: { type: Number, required: true },
  
  summary: { type: String, required: true },
  timeComplexity: { type: String, required: true },
  timeComplexityExplanation: { type: String, default: '' },
  spaceComplexity: { type: String, required: true },
  spaceComplexityExplanation: { type: String, default: '' },
  
  strengths: [{ type: String }],
  weaknesses: [{ type: String }],
  bugs: [{ type: String }],
  
  edgeCaseAnalysis: [{
    case: { type: String },
    handled: { type: Boolean }
  }],
  
  optimizations: [{ type: String }],
  alternativeApproaches: [{ type: String }],
  
  interviewerFeedback: { type: String, required: true },
  recommendedTopics: [{ type: String }],
  
  interviewReadiness: {
    rating: { type: String, default: 'Good' },
    feedback: { type: String, default: '' }
  },
  
  industryComparison: {
    averageScore: { type: Number, default: 75 },
    candidateScore: { type: Number, default: 0 },
    estimatedPercentile: { type: String, default: 'Top 50%' }
  },
  
  learningRoadmap: [{
    topic: { type: String },
    reason: { type: String },
    difficulty: { type: String },
    estimatedTime: { type: String }
  }],
  
  improvementChecklist: [{ type: String }],
  
  interviewerNotes: {
    communication: { type: Number, default: 0 },
    codeOrganization: { type: Number, default: 0 },
    problemSolving: { type: Number, default: 0 },
    optimizationThinking: { type: Number, default: 0 },
    debuggingAbility: { type: Number, default: 0 },
    overallImpression: { type: String, default: '' }
  }
}, {
  timestamps: true
});

export const CodeReview = mongoose.model<ICodeReview>('CodeReview', codeReviewSchema);
