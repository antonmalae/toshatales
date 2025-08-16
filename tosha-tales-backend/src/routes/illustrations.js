import express from 'express';
import {
  getStoryIllustrations,
  addStoryIllustration,
  updateStoryIllustration,
  deleteStoryIllustration,
  reorderStoryIllustrations,
} from '../controllers/illustrationController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { illustrationLimiter } from '../middleware/rateLimit.js';
import { requestLogger } from '../middleware/requestLogger.js';
import { 
  createIllustrationSchema, 
  updateIllustrationSchema,
  reorderIllustrationsSchema 
} from '../utils/validation.js';

const router = express.Router();

// Public routes
router.get('/:storyId/illustrations', getStoryIllustrations);

// Protected routes (Admin only)
router.post('/:storyId/illustrations', protect, authorize('ADMIN'), requestLogger, illustrationLimiter, validate(createIllustrationSchema), addStoryIllustration);
router.put('/:storyId/illustrations/:id', protect, authorize('ADMIN'), requestLogger, illustrationLimiter, validate(updateIllustrationSchema), updateStoryIllustration);
router.delete('/:storyId/illustrations/:id', protect, authorize('ADMIN'), requestLogger, illustrationLimiter, deleteStoryIllustration);
router.put('/:storyId/illustrations/reorder', protect, authorize('ADMIN'), requestLogger, illustrationLimiter, validate(reorderIllustrationsSchema), reorderStoryIllustrations);

export default router; 