import express from 'express';
import { getProfile, updateProfile, updatePreferences, changePassword } from '../controllers/profileController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// All profile routes are protected
router.use(protect);

router.route('/')
  .get(getProfile)
  .put(updateProfile);

router.put('/preferences', updatePreferences);
router.put('/password', changePassword);

export default router;
