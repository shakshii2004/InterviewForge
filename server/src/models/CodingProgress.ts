import mongoose, { Document, Schema } from 'mongoose';

export interface ICodingProgress extends Document {
  userId: mongoose.Types.ObjectId;
  solvedProblems: mongoose.Types.ObjectId[];
  attemptedProblems: mongoose.Types.ObjectId[];
  bookmarkedProblems: mongoose.Types.ObjectId[];
  
  solvedByDifficulty: {
    easy: number;
    medium: number;
    hard: number;
  };
  
  languageUsage: Map<string, number>;
  
  activityHeatmap: Map<string, number>; // "YYYY-MM-DD" -> count
  
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

const CodingProgressSchema = new Schema<ICodingProgress>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  solvedProblems: [{ type: Schema.Types.ObjectId, ref: 'CodingQuestion' }],
  attemptedProblems: [{ type: Schema.Types.ObjectId, ref: 'CodingQuestion' }],
  bookmarkedProblems: [{ type: Schema.Types.ObjectId, ref: 'CodingQuestion' }],
  
  solvedByDifficulty: {
    easy: { type: Number, default: 0 },
    medium: { type: Number, default: 0 },
    hard: { type: Number, default: 0 }
  },
  
  languageUsage: {
    type: Map,
    of: Number,
    default: {}
  },
  
  activityHeatmap: {
    type: Map,
    of: Number,
    default: {}
  },
  
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastActivityDate: { type: Date }
}, { timestamps: true });

export const CodingProgress = mongoose.model<ICodingProgress>('CodingProgress', CodingProgressSchema);
