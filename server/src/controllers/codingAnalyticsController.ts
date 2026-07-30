import { Request, Response } from 'express';
import { codingAnalyticsService } from '../services/coding/codingAnalyticsService';

export const getAnalyticsDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Attempt to update analytics in background, but return current quickly or await if first time
    // For a smooth experience, we'll await it so it's always up to date. 
    // In production, might be better to do background processing.
    const analytics = await codingAnalyticsService.updateUserAnalytics(userId);
    res.json(analytics);
  } catch (error: any) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Server error fetching analytics' });
  }
};

export const getTopicAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const analytics = await codingAnalyticsService.getAnalytics(userId);
    res.json(analytics?.topicBreakdown || []);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getLanguageAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const analytics = await codingAnalyticsService.getAnalytics(userId);
    res.json(analytics?.languageBreakdown || []);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getProgressCharts = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const analytics = await codingAnalyticsService.getAnalytics(userId);
    res.json(analytics?.monthlyProgress || []);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const generateRecommendations = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const recs = await codingAnalyticsService.generateRecommendations(userId);
    res.json(recs);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error generating recommendations' });
  }
};
