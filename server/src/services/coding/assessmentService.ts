import mongoose from 'mongoose';
import { CodingAssessment } from '../../models/CodingAssessment';
import { CodingQuestion } from '../../models/CodingQuestion';

export const assessmentService = {
  async startAssessment(userId: string, config: { type: 'Assessment' | 'Contest', durationMinutes: number, difficulty?: string, questionCount: number }) {
    
    // Fetch random questions
    const matchQuery: any = {};
    if (config.difficulty) {
      matchQuery.difficulty = config.difficulty;
    }
    
    const questions = await CodingQuestion.aggregate([
      { $match: matchQuery },
      { $sample: { size: config.questionCount } }
    ]);

    if (questions.length === 0) {
      throw new Error('No questions found for the given criteria');
    }

    const assessment = new CodingAssessment({
      userId: new mongoose.Types.ObjectId(userId),
      type: config.type,
      durationMinutes: config.durationMinutes,
      questions: questions.map(q => q._id),
      status: 'In Progress',
      startTime: new Date()
    });

    await assessment.save();
    return assessment.populate('questions');
  },

  async getAssessment(assessmentId: string, userId: string) {
    const assessment = await CodingAssessment.findOne({ _id: assessmentId, userId })
      .populate('questions');
    if (!assessment) throw new Error('Assessment not found');
    return assessment;
  },

  async submitAssessment(assessmentId: string, userId: string, results: any) {
    const assessment = await CodingAssessment.findOne({ _id: assessmentId, userId });
    if (!assessment) throw new Error('Assessment not found');

    if (assessment.status === 'Completed') {
      throw new Error('Assessment already completed');
    }

    assessment.status = 'Completed';
    assessment.endTime = new Date();
    assessment.results = results;

    await assessment.save();
    return assessment;
  }
};
