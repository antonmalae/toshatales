import express from 'express';
import {
  getStories,
  getStory,
  createStory,
  updateStory,
  deleteStory,
  rateStory,
  toggleStoryLike,
} from '../controllers/storyController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate, validateQuery } from '../middleware/validate.js';
import {
  createStorySchema,
  updateStorySchema,
  ratingSchema,
  paginationSchema,
  filterSchema,
} from '../utils/validation.js';

const router = express.Router();

// Public routes
router.get('/', validateQuery(paginationSchema), getStories);
router.get('/:id', getStory);

// Protected routes
router.post('/:id/rate', protect, validate(ratingSchema), rateStory);
router.post('/:id/like', protect, toggleStoryLike);

// Admin routes
router.post('/', protect, authorize('ADMIN'), validate(createStorySchema), createStory);
router.put('/:id', protect, authorize('ADMIN'), validate(updateStorySchema), updateStory);
router.delete('/:id', protect, authorize('ADMIN'), deleteStory);

export default router; 