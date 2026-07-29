import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { generateEvaluation, getEvaluation, deleteEvaluation } from '../controllers/evaluationController';

const router = express.Router();

router.use(protect);

router.post('/:id/generate', generateEvaluation);
router.get('/:id', getEvaluation);
router.delete('/:id', deleteEvaluation);

export default router;
