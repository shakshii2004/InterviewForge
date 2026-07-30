import mongoose, { Schema, Document } from 'mongoose';

export interface ICodingAnalytics extends Document {
  userId: mongoose.Types.ObjectId;
  
  // Overview
  totalProblemsSolved: number;
  totalSubmissions: number;
  acceptedSubmissions: number;
  acceptanceRate: number;
  averageRuntime: number;
  averageMemory: number;
  averageScore: number;
  
  // Radar Score Averages
  averageCorrectness: number;
  averageOptimization: number;
  averageReadability: number;
  averageBestPractices: number;
  averageComplexity: number;
  
  // Streaks
  currentStreak: number;
  longestStreak: number;
  lastSubmission: Date;
  
  // Top Metrics
  favoriteLanguage: string;
  favoriteTopic: string;
  strongestTopics: string[];
  weakestTopics: string[];
  
  // Breakdowns
  difficultyBreakdown: {
    easy: { solved: number; successRate: number; averageRuntime: number; averageScore: number };
    medium: { solved: number; successRate: number; averageRuntime: number; averageScore: number };
    hard: { solved: number; successRate: number; averageRuntime: number; averageScore: number };
  };
  
  languageBreakdown: Array<{
    language: string;
    problemsSolved: number;
    averageScore: number;
    averageRuntime: number;
  }>;
  
  topicBreakdown: Array<{
    topic: string;
    solved: number;
    averageScore: number;
    acceptanceRate: number;
    weaknessLevel: string; // 'High', 'Medium', 'Low'
    trend: string; // 'Up', 'Down', 'Stable'
  }>;
  
  monthlyProgress: Array<{
    month: string;
    problemsSolved: number;
    averageScore: number;
  }>;
  
  achievements: string[];
  
  recommendations: Array<{
    topic: string;
    action: string;
    reason: string;
  }>;
  
  createdAt: Date;
  updatedAt: Date;
}

const codingAnalyticsSchema = new Schema<ICodingAnalytics>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  
  totalProblemsSolved: { type: Number, default: 0 },
  totalSubmissions: { type: Number, default: 0 },
  acceptedSubmissions: { type: Number, default: 0 },
  acceptanceRate: { type: Number, default: 0 },
  averageRuntime: { type: Number, default: 0 },
  averageMemory: { type: Number, default: 0 },
  averageScore: { type: Number, default: 0 },
  
  averageCorrectness: { type: Number, default: 0 },
  averageOptimization: { type: Number, default: 0 },
  averageReadability: { type: Number, default: 0 },
  averageBestPractices: { type: Number, default: 0 },
  averageComplexity: { type: Number, default: 0 },
  
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastSubmission: { type: Date, default: null },
  
  favoriteLanguage: { type: String, default: 'None' },
  favoriteTopic: { type: String, default: 'None' },
  strongestTopics: [{ type: String }],
  weakestTopics: [{ type: String }],
  
  difficultyBreakdown: {
    easy: {
      solved: { type: Number, default: 0 },
      successRate: { type: Number, default: 0 },
      averageRuntime: { type: Number, default: 0 },
      averageScore: { type: Number, default: 0 }
    },
    medium: {
      solved: { type: Number, default: 0 },
      successRate: { type: Number, default: 0 },
      averageRuntime: { type: Number, default: 0 },
      averageScore: { type: Number, default: 0 }
    },
    hard: {
      solved: { type: Number, default: 0 },
      successRate: { type: Number, default: 0 },
      averageRuntime: { type: Number, default: 0 },
      averageScore: { type: Number, default: 0 }
    }
  },
  
  languageBreakdown: [{
    language: { type: String },
    problemsSolved: { type: Number },
    averageScore: { type: Number },
    averageRuntime: { type: Number }
  }],
  
  topicBreakdown: [{
    topic: { type: String },
    solved: { type: Number },
    averageScore: { type: Number },
    acceptanceRate: { type: Number },
    weaknessLevel: { type: String },
    trend: { type: String }
  }],
  
  monthlyProgress: [{
    month: { type: String },
    problemsSolved: { type: Number },
    averageScore: { type: Number }
  }],
  
  achievements: [{ type: String }],
  
  recommendations: [{
    topic: { type: String },
    action: { type: String },
    reason: { type: String }
  }]
}, {
  timestamps: true
});

export const CodingAnalytics = mongoose.model<ICodingAnalytics>('CodingAnalytics', codingAnalyticsSchema);
