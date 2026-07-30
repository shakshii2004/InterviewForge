import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { 
  createCodingSession, 
  getCodingSession, 
  getCodingHistory, 
  deleteCodingSession,
  updateCodingSession
} from '../controllers/codingController';
import { runCode, submitCode, getSubmissions } from '../controllers/executionController';
import { generateReview, getReview, deleteReview } from '../controllers/codeReviewController';
import { getAnalyticsDashboard, getTopicAnalytics, getLanguageAnalytics, getProgressCharts, generateRecommendations } from '../controllers/codingAnalyticsController';
import { 
  getHistory, getHistoryDetails, deleteHistory, compareAttempts,
  getPracticeQuestions, getBookmarks, toggleBookmark,
  startAssessment, getAssessment, submitAssessment 
} from '../controllers/codingPlatformController';

const router = express.Router();

router.use(protect); // All coding routes require auth

// Sessions
router.post('/session', createCodingSession);
router.get('/session/history', getCodingHistory); // Kept for backwards compatibility if used elsewhere
router.get('/session/:id', getCodingSession);
router.patch('/session/:id', updateCodingSession);
router.delete('/session/:id', deleteCodingSession);

// New Coding History
router.get('/history', getHistory);
router.get('/history/:id', getHistoryDetails);
router.delete('/history/:id', deleteHistory);
router.get('/history/compare/:questionId', compareAttempts);

// Practice & Bookmarks
router.get('/practice/questions', getPracticeQuestions);
router.get('/bookmarks', getBookmarks);
router.post('/bookmarks', toggleBookmark);

// Assessments & Contests
router.post('/assessment', startAssessment);
router.get('/assessment/:id', getAssessment);
router.post('/assessment/:id/submit', submitAssessment);

// Execution
router.post('/run', runCode);
router.post('/submit', submitCode);
router.get('/submissions/:sessionId', getSubmissions);

// Reviews
router.post('/review/:submissionId', generateReview);
router.get('/review/:submissionId', getReview);
router.delete('/review/:submissionId', deleteReview);

// Analytics
router.get('/analytics', getAnalyticsDashboard);
router.get('/topics', getTopicAnalytics);
router.get('/languages', getLanguageAnalytics);
router.get('/progress', getProgressCharts);
router.post('/analytics/recommendations', generateRecommendations);

export default router;
