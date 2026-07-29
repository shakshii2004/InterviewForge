import mongoose, { Document, Schema } from 'mongoose';

export interface IUserAnalytics extends Document {
  userId: mongoose.Types.ObjectId;
  totalInterviews: number;
  completedInterviews: number;
  averageScore: number;
  highestScore: number;
  averageDuration: number;
  totalPracticeTime: number; // in minutes
  currentStreak: number;
  longestStreak: number;
  strongestSkills: string[];
  weakestSkills: string[];
  achievements: string[];
  lastInterviewDate?: Date;
  radarScores: {
    technical: number;
    communication: number;
    problemSolving: number;
    confidence: number;
    project: number;
    timeManagement: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const userAnalyticsSchema = new Schema<IUserAnalytics>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  totalInterviews: { type: Number, default: 0 },
  completedInterviews: { type: Number, default: 0 },
  averageScore: { type: Number, default: 0 },
  highestScore: { type: Number, default: 0 },
  averageDuration: { type: Number, default: 0 },
  totalPracticeTime: { type: Number, default: 0 },
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  strongestSkills: [{ type: String }],
  weakestSkills: [{ type: String }],
  achievements: [{ type: String }],
  lastInterviewDate: { type: Date },
  radarScores: {
    technical: { type: Number, default: 0 },
    communication: { type: Number, default: 0 },
    problemSolving: { type: Number, default: 0 },
    confidence: { type: Number, default: 0 },
    project: { type: Number, default: 0 },
    timeManagement: { type: Number, default: 0 },
  }
}, {
  timestamps: true
});

export const UserAnalytics = mongoose.model<IUserAnalytics>('UserAnalytics', userAnalyticsSchema);
