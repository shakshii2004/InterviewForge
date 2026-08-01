import express from 'express';
import { importFromLeetCode } from '../controllers/adminCodingController';
// Add authentication middleware for admin later
// import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = express.Router();

router.post('/import', importFromLeetCode);

export default router;
