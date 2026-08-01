import express from 'express';
import { importFromLeetCode } from '../controllers/adminCodingController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/import', protect, admin, importFromLeetCode);

export default router;
