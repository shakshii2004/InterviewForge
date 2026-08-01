import { CodingSession } from '../models/CodingSession';

export const codingService = {
  async createSession(userId: string, data: any) {
    const session = new CodingSession({
      userId,
      ...data
    });
    await session.save();
    return session;
  },

  async getSessionById(sessionId: string, userId: string) {
    const session = await CodingSession.findOne({ _id: sessionId, userId })
      .populate('currentQuestion')
      .populate('questions');
    return session;
  },

  async updateSession(sessionId: string, userId: string, data: any) {
    const session = await CodingSession.findOneAndUpdate(
      { _id: sessionId, userId },
      { $set: data },
      { new: true }
    );
    return session;
  },

  async getHistory(userId: string) {
    return await CodingSession.find({ userId }).sort({ createdAt: -1 });
  },

  async getStats(userId: string) {
    const sessions = await CodingSession.find({ userId });
    
    let problemsSolved = 0;
    // In the future, problemsSolved will be derived from completed questions inside the session.
    // For now, if completed, assume all were solved.
    
    let languageCounts: Record<string, number> = {};
    let completedInterviews = 0;

    sessions.forEach(s => {
      if (s.status === 'completed') {
        completedInterviews++;
        problemsSolved += s.numberOfQuestions;
      }
      languageCounts[s.language] = (languageCounts[s.language] || 0) + 1;
    });

    let favoriteLanguage = 'None';
    let max = 0;
    for (const [lang, count] of Object.entries(languageCounts)) {
      if (count > max) {
        max = count;
        favoriteLanguage = lang;
      }
    }

    return {
      interviewsCompleted: completedInterviews,
      problemsSolved,
      averageScore: 0, // Placeholder until Phase 3.2
      favoriteLanguage
    };
  },

  async deleteSession(sessionId: string, userId: string) {
    return await CodingSession.findOneAndDelete({ _id: sessionId, userId });
  }
};
