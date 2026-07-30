import { Request, Response } from 'express';
import { historyService } from '../services/coding/historyService';
import { assessmentService } from '../services/coding/assessmentService';
import { practiceService } from '../services/coding/practiceService';

// History
export const getHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const history = await historyService.getUserHistory(userId, req.query);
    res.json(history);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const getHistoryDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const details = await historyService.getSubmissionDetails(req.params.id as string, userId);
    res.json(details);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const deleteHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    await historyService.deleteSubmission(req.params.id as string, userId);
    res.json({ message: 'Deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const compareAttempts = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const comparison = await historyService.compareAttempts(req.params.questionId as string, userId);
    res.json(comparison);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Practice & Bookmarks
export const getPracticeQuestions = async (req: Request, res: Response): Promise<void> => {
  try {
    const questions = await practiceService.getQuestions(req.query);
    res.json(questions);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const getBookmarks = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const bookmarks = await practiceService.getBookmarks(userId);
    res.json(bookmarks);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const toggleBookmark = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const { questionId } = req.body;
    if (!questionId) {
      res.status(400).json({ message: 'Question ID required' });
      return;
    }
    const result = await practiceService.toggleBookmark(userId, questionId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Assessments
export const startAssessment = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const { type, durationMinutes, difficulty, questionCount } = req.body;
    if (!type || !durationMinutes || !questionCount) {
      res.status(400).json({ message: 'Missing required assessment parameters' });
      return;
    }
    const assessment = await assessmentService.startAssessment(userId, { type, durationMinutes, difficulty, questionCount });
    res.status(201).json(assessment);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const getAssessment = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const assessment = await assessmentService.getAssessment(req.params.id as string, userId);
    res.json(assessment);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const submitAssessment = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const { results } = req.body;
    const assessment = await assessmentService.submitAssessment(req.params.id as string, userId, results);
    res.json(assessment);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};
