import { UserAnalytics } from '../models/UserAnalytics';
import { InterviewSession } from '../models/InterviewSession';
import { Evaluation } from '../models/Evaluation';
import mongoose from 'mongoose';

export const analyticsService = {
  
  async syncUserAnalytics(userId: string) {
    const sessions = await InterviewSession.find({ userId }).sort({ createdAt: -1 });
    const completedSessions = sessions.filter(s => s.status === 'completed');
    
    const evaluations = await Evaluation.find({ userId });
    
    let totalPracticeTime = 0;
    let highestScore = 0;
    let totalScore = 0;
    
    let radarTotals = {
      technical: 0,
      communication: 0,
      problemSolving: 0,
      confidence: 0,
      project: 0,
      timeManagement: 0,
    };
    
    const allStrengths = new Map<string, number>();
    const allImprovements = new Map<string, number>();

    evaluations.forEach(ev => {
      totalScore += ev.overallScore;
      if (ev.overallScore > highestScore) highestScore = ev.overallScore;
      
      radarTotals.technical += ev.technicalScore;
      radarTotals.communication += ev.communicationScore;
      radarTotals.problemSolving += ev.problemSolvingScore;
      radarTotals.confidence += ev.confidenceScore;
      radarTotals.project += ev.projectScore;
      radarTotals.timeManagement += ev.timeManagementScore;

      ev.strengths.forEach(s => allStrengths.set(s, (allStrengths.get(s) || 0) + 1));
      ev.improvements.forEach(i => allImprovements.set(i, (allImprovements.get(i) || 0) + 1));
    });

    completedSessions.forEach(s => {
      totalPracticeTime += s.duration || 0;
    });

    const evalCount = evaluations.length || 1; // avoid div by 0
    
    // Determine Top Skills
    const strongestSkills = [...allStrengths.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(e => e[0]);
      
    const weakestSkills = [...allImprovements.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(e => e[0]);

    // Very naive streak calculation (real implementation would check days)
    const currentStreak = completedSessions.length > 0 ? 1 : 0;
    const longestStreak = Math.max(1, currentStreak);

    // Achievements
    const achievements: string[] = [];
    if (completedSessions.length >= 1) achievements.push("First Interview");
    if (completedSessions.length >= 5) achievements.push("5 Interviews");
    if (completedSessions.length >= 10) achievements.push("10 Interviews");
    if (highestScore >= 90) achievements.push("Average Score 90+");
    if (totalPracticeTime > 60) achievements.push("Consistent Learner");

    const analytics = await UserAnalytics.findOneAndUpdate(
      { userId },
      {
        totalInterviews: sessions.length,
        completedInterviews: completedSessions.length,
        averageScore: evaluations.length > 0 ? Math.round(totalScore / evaluations.length) : 0,
        highestScore,
        averageDuration: completedSessions.length > 0 ? Math.round(totalPracticeTime / completedSessions.length) : 0,
        totalPracticeTime,
        currentStreak,
        longestStreak,
        strongestSkills,
        weakestSkills,
        achievements,
        lastInterviewDate: completedSessions.length > 0 ? completedSessions[0].createdAt : undefined,
        radarScores: {
          technical: Math.round(radarTotals.technical / evalCount),
          communication: Math.round(radarTotals.communication / evalCount),
          problemSolving: Math.round(radarTotals.problemSolving / evalCount),
          confidence: Math.round(radarTotals.confidence / evalCount),
          project: Math.round(radarTotals.project / evalCount),
          timeManagement: Math.round(radarTotals.timeManagement / evalCount),
        }
      },
      { upsert: true, new: true }
    );

    return analytics;
  },

  async getDashboard(userId: string) {
    let analytics = await UserAnalytics.findOne({ userId });
    if (!analytics) {
      analytics = await this.syncUserAnalytics(userId);
    }
    return analytics;
  },

  async getHistory(userId: string) {
    return await InterviewSession.find({ userId }).sort({ createdAt: -1 }).populate('resumeId', 'title');
  },
  
  async getProgressTimeline(userId: string) {
    const evaluations = await Evaluation.find({ userId }).sort({ createdAt: 1 });
    // Map to a line chart format
    return evaluations.map((ev, idx) => ({
      name: `Int ${idx + 1}`,
      score: ev.overallScore,
      date: ev.createdAt
    }));
  },
  
  async deleteInterview(interviewId: string, userId: string) {
    await InterviewSession.findOneAndDelete({ _id: interviewId, userId });
    await Evaluation.findOneAndDelete({ interviewId, userId });
    await this.syncUserAnalytics(userId);
    return { success: true };
  }
};
