import mongoose from 'mongoose';
import { CodingAnalytics, ICodingAnalytics } from '../../models/CodingAnalytics';
import { CodeSubmission } from '../../models/CodeSubmission';
import { CodeReview } from '../../models/CodeReview';
import { CodingQuestion } from '../../models/CodingQuestion';
import { AIProviderFactory } from '../ai/AIProviderFactory';

export const codingAnalyticsService = {
  
  async updateUserAnalytics(userId: string) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    
    // 1. Get all submissions and questions for this user
    const submissions = await CodeSubmission.find({ userId: userObjectId }).lean();
    const questions = await CodingQuestion.find({}).lean(); // Fetch all or join, for now fetch all to map
    const questionMap = new Map(questions.map(q => [q._id.toString(), q]));
    
    // 2. Get all AI reviews for this user
    const reviews = await CodeReview.find({ userId: userObjectId }).lean();
    const reviewMap = new Map(reviews.map(r => [r.submissionId.toString(), r]));

    // 3. Compute Base Stats
    const totalSubmissions = submissions.length;
    const acceptedSubmissionsList = submissions.filter(s => s.status === 'Accepted');
    const acceptedSubmissions = acceptedSubmissionsList.length;
    
    // Using unique problems solved
    const solvedProblemIds = new Set(acceptedSubmissionsList.map(s => s.questionId.toString()));
    const totalProblemsSolved = solvedProblemIds.size;
    
    const acceptanceRate = totalSubmissions > 0 ? (acceptedSubmissions / totalSubmissions) * 100 : 0;
    
    const sumRuntime = acceptedSubmissionsList.reduce((acc, curr) => acc + (curr.executionTime || 0), 0);
    const sumMemory = acceptedSubmissionsList.reduce((acc, curr) => acc + (curr.memoryUsed || 0), 0);
    const averageRuntime = acceptedSubmissions > 0 ? sumRuntime / acceptedSubmissions : 0;
    const averageMemory = acceptedSubmissions > 0 ? sumMemory / acceptedSubmissions : 0;
    
    // 4. Compute Scores from Reviews
    let sumOverallScore = 0;
    let sumCorrectness = 0;
    let sumOptimization = 0;
    let sumReadability = 0;
    let sumBestPractices = 0;
    let sumComplexity = 0;
    
    const validReviews = reviews.filter(r => r.overallScore > 0);
    const reviewCount = validReviews.length;
    
    if (reviewCount > 0) {
      validReviews.forEach(r => {
        sumOverallScore += r.overallScore || 0;
        sumCorrectness += r.correctnessScore || 0;
        sumOptimization += r.optimizationScore || 0;
        sumReadability += r.readabilityScore || 0;
        sumBestPractices += r.bestPracticesScore || 0;
        sumComplexity += ((r.timeComplexityScore || 0) + (r.spaceComplexityScore || 0)) / 2;
      });
    }
    
    const averageScore = reviewCount > 0 ? sumOverallScore / reviewCount : 0;
    const averageCorrectness = reviewCount > 0 ? sumCorrectness / reviewCount : 0;
    const averageOptimization = reviewCount > 0 ? sumOptimization / reviewCount : 0;
    const averageReadability = reviewCount > 0 ? sumReadability / reviewCount : 0;
    const averageBestPractices = reviewCount > 0 ? sumBestPractices / reviewCount : 0;
    const averageComplexity = reviewCount > 0 ? sumComplexity / reviewCount : 0;
    
    // 5. Streaks
    // Simplified streak calc: group by YYYY-MM-DD
    const dates = acceptedSubmissionsList
      .map(s => new Date(s.submittedAt))
      .sort((a, b) => a.getTime() - b.getTime())
      .map(d => d.toISOString().split('T')[0]);
      
    const uniqueDates = [...new Set(dates)];
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let lastDate: Date | null = null;
    
    for (const dateStr of uniqueDates) {
      const d = new Date(dateStr);
      if (!lastDate) {
        tempStreak = 1;
      } else {
        const diffTime = Math.abs(d.getTime() - lastDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          tempStreak += 1;
        } else {
          tempStreak = 1;
        }
      }
      if (tempStreak > longestStreak) longestStreak = tempStreak;
      lastDate = d;
    }
    
    // Check if current streak is active (today or yesterday)
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (uniqueDates.length > 0) {
      const last = uniqueDates[uniqueDates.length - 1];
      if (last === todayStr || last === yesterdayStr) {
        currentStreak = tempStreak;
      } else {
        currentStreak = 0;
      }
    }
    
    const lastSubmission = submissions.length > 0 ? 
      submissions.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())[0].submittedAt 
      : null;

    // 6. Breakdowns (Language, Difficulty, Topic)
    const languageStats: Record<string, { solved: number, score: number, time: number, revCount: number }> = {};
    const difficultyStats: any = {
      easy: { solved: 0, total: 0, time: 0, score: 0, revCount: 0 },
      medium: { solved: 0, total: 0, time: 0, score: 0, revCount: 0 },
      hard: { solved: 0, total: 0, time: 0, score: 0, revCount: 0 }
    };
    const topicStats: Record<string, { solved: number, total: number, score: number, revCount: number }> = {};

    submissions.forEach(sub => {
      const q = questionMap.get(sub.questionId.toString());
      const r = reviewMap.get(sub._id.toString());
      const isAcc = sub.status === 'Accepted';
      const score = r?.overallScore || 0;
      const hasRev = !!r;
      const time = sub.executionTime || 0;
      
      // Language
      if (sub.language) {
        if (!languageStats[sub.language]) languageStats[sub.language] = { solved: 0, score: 0, time: 0, revCount: 0 };
        if (isAcc) {
          languageStats[sub.language].solved += 1;
          languageStats[sub.language].time += time;
        }
        if (hasRev) {
          languageStats[sub.language].score += score;
          languageStats[sub.language].revCount += 1;
        }
      }

      // Difficulty & Topic
      if (q) {
        const diff = q.difficulty.toLowerCase();
        if (difficultyStats[diff]) {
          difficultyStats[diff].total += 1;
          if (isAcc) {
            difficultyStats[diff].solved += 1;
            difficultyStats[diff].time += time;
          }
          if (hasRev) {
            difficultyStats[diff].score += score;
            difficultyStats[diff].revCount += 1;
          }
        }
        
        q.topics?.forEach((t: string) => {
          if (!topicStats[t]) topicStats[t] = { solved: 0, total: 0, score: 0, revCount: 0 };
          topicStats[t].total += 1;
          if (isAcc) topicStats[t].solved += 1;
          if (hasRev) {
            topicStats[t].score += score;
            topicStats[t].revCount += 1;
          }
        });
      }
    });

    const languageBreakdown = Object.entries(languageStats).map(([lang, s]) => ({
      language: lang,
      problemsSolved: s.solved,
      averageScore: s.revCount > 0 ? s.score / s.revCount : 0,
      averageRuntime: s.solved > 0 ? s.time / s.solved : 0
    }));
    
    // Determine favorite language
    const favoriteLanguage = languageBreakdown.sort((a, b) => b.problemsSolved - a.problemsSolved)[0]?.language || 'None';

    const formatDiff = (d: any) => ({
      solved: d.solved,
      successRate: d.total > 0 ? (d.solved / d.total) * 100 : 0,
      averageRuntime: d.solved > 0 ? d.time / d.solved : 0,
      averageScore: d.revCount > 0 ? d.score / d.revCount : 0
    });

    const topicBreakdown = Object.entries(topicStats).map(([topic, s]) => {
      const avgScore = s.revCount > 0 ? s.score / s.revCount : 0;
      const accRate = s.total > 0 ? (s.solved / s.total) * 100 : 0;
      
      let weaknessLevel = 'Low';
      if (accRate < 40 || (s.revCount > 0 && avgScore < 60)) weaknessLevel = 'High';
      else if (accRate < 70 || (s.revCount > 0 && avgScore < 80)) weaknessLevel = 'Medium';
      
      return {
        topic,
        solved: s.solved,
        averageScore: avgScore,
        acceptanceRate: accRate,
        weaknessLevel,
        trend: avgScore > 75 ? 'Up' : avgScore < 50 ? 'Down' : 'Stable'
      };
    });

    const favoriteTopic = topicBreakdown.sort((a, b) => b.solved - a.solved)[0]?.topic || 'None';
    const strongestTopics = topicBreakdown.filter(t => t.weaknessLevel === 'Low').sort((a,b) => b.averageScore - a.averageScore).slice(0,3).map(t => t.topic);
    const weakestTopics = topicBreakdown.filter(t => t.weaknessLevel === 'High').sort((a,b) => a.averageScore - b.averageScore).slice(0,3).map(t => t.topic);

    // 7. Monthly Progress
    const monthlyMap: Record<string, { solved: number, score: number, revCount: number }> = {};
    submissions.forEach(sub => {
      const d = new Date(sub.submittedAt);
      const monthStr = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      if (!monthlyMap[monthStr]) monthlyMap[monthStr] = { solved: 0, score: 0, revCount: 0 };
      
      if (sub.status === 'Accepted') monthlyMap[monthStr].solved += 1;
      
      const r = reviewMap.get(sub._id.toString());
      if (r) {
        monthlyMap[monthStr].score += r.overallScore;
        monthlyMap[monthStr].revCount += 1;
      }
    });

    const monthlyProgress = Object.entries(monthlyMap).map(([month, s]) => ({
      month,
      problemsSolved: s.solved,
      averageScore: s.revCount > 0 ? s.score / s.revCount : 0
    })).sort((a, b) => a.month.localeCompare(b.month));

    // 8. Achievements
    let achievements = await this.calculateAchievements(userId, {
      totalSubmissions, totalProblemsSolved, currentStreak, longestStreak
    });

    // 9. Fetch existing document to keep recommendations, or create new
    let analytics = await CodingAnalytics.findOne({ userId: userObjectId });
    
    if (!analytics) {
      analytics = new CodingAnalytics({ userId: userObjectId, recommendations: [] });
    }

    analytics.totalProblemsSolved = totalProblemsSolved;
    analytics.totalSubmissions = totalSubmissions;
    analytics.acceptedSubmissions = acceptedSubmissions;
    analytics.acceptanceRate = acceptanceRate;
    analytics.averageRuntime = averageRuntime;
    analytics.averageMemory = averageMemory;
    analytics.averageScore = averageScore;
    
    analytics.averageCorrectness = averageCorrectness;
    analytics.averageOptimization = averageOptimization;
    analytics.averageReadability = averageReadability;
    analytics.averageBestPractices = averageBestPractices;
    analytics.averageComplexity = averageComplexity;

    analytics.currentStreak = currentStreak;
    analytics.longestStreak = longestStreak;
    if (lastSubmission) analytics.lastSubmission = lastSubmission;

    analytics.favoriteLanguage = favoriteLanguage;
    analytics.favoriteTopic = favoriteTopic;
    analytics.strongestTopics = strongestTopics;
    analytics.weakestTopics = weakestTopics;

    analytics.difficultyBreakdown = {
      easy: formatDiff(difficultyStats.easy),
      medium: formatDiff(difficultyStats.medium),
      hard: formatDiff(difficultyStats.hard)
    };
    analytics.languageBreakdown = languageBreakdown;
    analytics.topicBreakdown = topicBreakdown;
    analytics.monthlyProgress = monthlyProgress;
    analytics.achievements = achievements;

    await analytics.save();
    return analytics;
  },

  async calculateAchievements(userId: string, stats: any) {
    const badges = [];
    if (stats.totalSubmissions > 0) badges.push('First Submission');
    if (stats.totalProblemsSolved >= 10) badges.push('10 Problems Solved');
    if (stats.totalProblemsSolved >= 50) badges.push('50 Problems Solved');
    if (stats.totalProblemsSolved >= 100) badges.push('100 Problems Solved');
    if (stats.longestStreak >= 7) badges.push('7-Day Streak');
    // More complex badges can be calculated...
    return badges;
  },

  async getAnalytics(userId: string) {
    let analytics = await CodingAnalytics.findOne({ userId });
    if (!analytics) {
      analytics = await this.updateUserAnalytics(userId);
    }
    return analytics;
  },

  async generateRecommendations(userId: string) {
    const analytics = await CodingAnalytics.findOne({ userId }).lean();
    if (!analytics) throw new Error('Analytics not found');

    const prompt = `
      You are an expert technical interviewer and competitive programming coach.
      Analyze the following candidate's coding analytics and provide 3 personalized recommendations.
      
      Weakest Topics: ${analytics.weakestTopics.join(', ')}
      Strongest Topics: ${analytics.strongestTopics.join(', ')}
      Average Score: ${analytics.averageScore}
      Acceptance Rate: ${analytics.acceptanceRate}%

      Return EXACTLY a JSON array of objects.
      Format: [{"topic": "String", "action": "String", "reason": "String"}]
    `;

    try {
      const response = await AIProviderFactory.executeWithFallback('reviewCode', prompt);
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const recs = JSON.parse(jsonMatch[0]);
        await CodingAnalytics.findOneAndUpdate(
          { userId },
          { $set: { recommendations: recs } }
        );
        return recs;
      }
      return [];
    } catch (error) {
      console.error('Failed to generate recommendations', error);
      return [];
    }
  }
};
