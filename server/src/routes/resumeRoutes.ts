import express from 'express';
import multer from 'multer';
import { protect } from '../middleware/authMiddleware';
import { uploadResume, getResume, deleteResume } from '../controllers/resumeController';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// Protect all resume routes
router.use(protect);

router.post('/upload', upload.single('resume'), uploadResume);
router.get('/', getResume);
router.delete('/', deleteResume);

export default router;
