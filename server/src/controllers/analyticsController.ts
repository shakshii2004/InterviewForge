import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { analyticsService } from '../services/analyticsService';

export const getDashboardAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const data = await analyticsService.getDashboard(userId);
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getInterviewHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const history = await analyticsService.getHistory(userId);
    res.status(200).json({ success: true, data: history });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProgressTimeline = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const timeline = await analyticsService.getProgressTimeline(userId);
    res.status(200).json({ success: true, data: timeline });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteHistoryItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    await analyticsService.deleteInterview(req.params.id as string, userId);
    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
