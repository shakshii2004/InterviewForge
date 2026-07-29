import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { createInterview, getInterviews, getInterviewById, deleteInterview } from '../controllers/interviewController';

const router = express.Router();

router.use(protect);

router.post('/', createInterview);
router.get('/', getInterviews);
router.get('/:id', getInterviewById);
router.delete('/:id', deleteInterview);

export default router;
