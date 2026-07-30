import { GoogleGenAI } from '@google/genai';
import { Evaluation } from '../../models/Evaluation';
import { InterviewSession } from '../../models/InterviewSession';
import { Question } from '../../models/Question';
import { Answer } from '../../models/Answer';
import { Resume } from '../../models/Resume';
import { buildEvaluationPrompt } from './evaluationPromptBuilder';
import { parseEvaluationResponse } from './evaluationParser';
import { AIProviderFactory } from '../ai/AIProviderFactory';

export const evaluationService = {
  async generateEvaluation(interviewId: string, userId: string) {
    // 1. Check if evaluation already exists
    const existing = await Evaluation.findOne({ interviewId, userId });
    if (existing) {
      return existing;
    }

    // 2. Fetch all session data
    const session = await InterviewSession.findOne({ _id: interviewId, userId });
    if (!session) throw new Error('Interview Session not found');
    if (session.status !== 'completed') throw new Error('Interview is not completed');

    const questions = await Question.find({ interviewId }).sort({ order: 1 });
    const answers = await Answer.find({ interviewId });
    
    let resumeText = undefined;
    if (session.resumeId) {
      const resume = await Resume.findById(session.resumeId);
      if (resume) resumeText = resume.extractedText;
    }

    // 3. Build Prompt
    const prompt = buildEvaluationPrompt(session, questions, answers, resumeText);

    // 4. Call AI through Factory
    const aiResponseText = await AIProviderFactory.evaluateInterview(prompt);

    // 5. Parse Response
    const parsedData = parseEvaluationResponse(aiResponseText);

    // 6. Save to DB
    const evaluation = new Evaluation({
      userId,
      interviewId,
      overallScore: parsedData.overallScore || 0,
      technicalScore: parsedData.technicalScore || 0,
      communicationScore: parsedData.communicationScore || 0,
      problemSolvingScore: parsedData.problemSolvingScore || 0,
      confidenceScore: parsedData.confidenceScore || 0,
      projectScore: parsedData.projectScore || 0,
      timeManagementScore: parsedData.timeManagementScore || 0,
      summary: parsedData.summary || 'No summary provided',
      strengths: parsedData.strengths || [],
      improvements: parsedData.improvements || [],
      recommendedTopics: parsedData.recommendedTopics || [],
      questionFeedback: parsedData.questionFeedback?.map((qf: any) => {
        // Map the index back to the real questionId
        const qIndex = parseInt(qf.questionId, 10);
        let realQuestionId = questions[0]._id;
        if (!isNaN(qIndex) && questions[qIndex]) {
          realQuestionId = questions[qIndex]._id;
        }
        return {
          questionId: realQuestionId,
          score: qf.score || 0,
          strengths: qf.strengths || [],
          missingPoints: qf.missingPoints || [],
          feedback: qf.feedback || 'No feedback'
        };
      }) || []
    });

    try {
      await evaluation.save();
      
      // Update the session score as well for quick access
      session.score = evaluation.overallScore;
      await session.save();
      
      // Sync UserAnalytics
      const { analyticsService } = await import('../analyticsService');
      await analyticsService.syncUserAnalytics(userId);

      return evaluation;
    } catch (error: any) {
      if (error.code === 11000) {
        // Race condition: another request just created this evaluation.
        const existing = await Evaluation.findOne({ interviewId, userId });
        if (existing) return existing;
      }
      throw error;
    }
  },

  async getEvaluation(interviewId: string, userId: string) {
    const evaluation = await Evaluation.findOne({ interviewId, userId });
    if (!evaluation) {
      throw new Error('Evaluation not found');
    }
    return evaluation;
  },

  async deleteEvaluation(interviewId: string, userId: string) {
    await Evaluation.findOneAndDelete({ interviewId, userId });
    return { success: true };
  }
};
