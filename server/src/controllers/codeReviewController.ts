import { Request, Response } from 'express';
import { codeReviewService } from '../services/codeReview/codeReviewService';
import { codingAnalyticsService } from '../services/coding/codingAnalyticsService';

export const generateReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const submissionId = req.params.submissionId as string;
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const review = await codeReviewService.generateReview(submissionId, userId);
    
    // Background update
    codingAnalyticsService.updateUserAnalytics(userId).catch(e => console.error('Analytics update error:', e));
    
    res.status(201).json(review);
  } catch (error: any) {
    console.error('Generate review error:', error);
    res.status(500).json({ message: error.message || 'Server error generating review' });
  }
};

export const getReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const submissionId = req.params.submissionId as string;
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const review = await codeReviewService.getReviewBySubmissionId(submissionId, userId);
    if (!review) {
      res.status(404).json({ message: 'Review not found' });
      return;
    }
    res.json(review);
  } catch (error: any) {
    console.error('Get review error:', error);
    res.status(500).json({ message: 'Server error fetching review' });
  }
};

export const deleteReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const submissionId = req.params.submissionId as string;
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    await codeReviewService.deleteReview(submissionId, userId);
    res.json({ message: 'Review deleted successfully' });
  } catch (error: any) {
    console.error('Delete review error:', error);
    res.status(500).json({ message: 'Server error deleting review' });
  }
};
