import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { getDashboardAnalytics, getInterviewHistory, getProgressTimeline, deleteHistoryItem } from '../controllers/analyticsController';

const router = express.Router();

router.use(protect);

router.get('/dashboard', getDashboardAnalytics);
router.get('/history', getInterviewHistory);
router.get('/progress', getProgressTimeline);
router.delete('/interview/:id', deleteHistoryItem);

export default router;
