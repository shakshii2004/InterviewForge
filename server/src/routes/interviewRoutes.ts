import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { 
  createInterview, 
  getInterviews, 
  getInterviewById, 
  deleteInterview,
  startInterview,
  saveAnswer,
  nextQuestion,
  finishInterview,
  evaluateSession
} from '../controllers/interviewController';

const router = express.Router();

router.use(protect);

router.post('/', createInterview);
router.get('/', getInterviews);
router.get('/:id', getInterviewById);
router.delete('/:id', deleteInterview);

// AI Core Endpoints
router.post('/:id/start', startInterview);
router.post('/:id/answer', saveAnswer);
router.post('/:id/next', nextQuestion);
router.post('/:id/finish', finishInterview);
router.post('/:id/evaluate', evaluateSession);
// Pause and Resume endpoints can be implemented as frontend state, but we provide stubs if needed.
router.post('/:id/pause', (req, res) => { res.json({success:true}) });
router.post('/:id/resume', (req, res) => { res.json({success:true}) });

export default router;
