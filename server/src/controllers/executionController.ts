import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { executionService } from '../services/execution/executionService';
import { codingAnalyticsService } from '../services/coding/codingAnalyticsService';

export const runCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, language, questionId: reqQuestionId } = req.body;
    let questionId = reqQuestionId;

    // Handle stale frontend states that send dummy_question_id
    if (questionId === 'dummy_question_id') {
      const CodingQuestion = mongoose.model('CodingQuestion');
      const firstQ = await CodingQuestion.findOne();
      if (firstQ) questionId = firstQ._id.toString();
    }
    
    if (!code || !language || !questionId) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    const results = await executionService.runSampleTests(code, language, questionId);
    res.json({ results });
  } catch (error: any) {
    console.error('Run code error:', error);
    res.status(500).json({ message: error.message || 'Server error running code' });
  }
};

export const submitCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { code, language, questionId: reqQuestionId, sessionId } = req.body;
    let questionId = reqQuestionId;

    // Handle stale frontend states that send dummy_question_id
    if (questionId === 'dummy_question_id') {
      const CodingQuestion = mongoose.model('CodingQuestion');
      const firstQ = await CodingQuestion.findOne();
      if (firstQ) questionId = firstQ._id.toString();
    }

    if (!code || !language || !questionId || !sessionId) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    const { submission, results } = await executionService.submitHiddenTests(code, language, questionId, sessionId, userId);
    
    // Background update
    codingAnalyticsService.updateUserAnalytics(userId).catch(e => console.error('Analytics update error:', e));

    res.status(201).json({ submission, results });
  } catch (error) {
    console.error('Submit code error:', error);
    res.status(500).json({ message: 'Server error submitting code' });
  }
};

export const getSubmissions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const CodeSubmission = mongoose.model('CodeSubmission');
    const submissions = await CodeSubmission.find({ codingSessionId: sessionId }).sort({ submittedAt: -1 });
    
    res.json(submissions);
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ message: 'Server error fetching submissions' });
  }
};
