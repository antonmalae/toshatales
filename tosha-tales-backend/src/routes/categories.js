import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createCategorySchema, updateCategorySchema } from '../utils/validation.js';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../controllers/categoryController.js';

const router = express.Router();

// Public routes
router.get('/', getCategories);

// Admin routes
router.post('/', protect, authorize('ADMIN'), validate(createCategorySchema), createCategory);
router.put('/:id', protect, authorize('ADMIN'), validate(updateCategorySchema), updateCategory);
router.delete('/:id', protect, authorize('ADMIN'), deleteCategory);

export default router; 