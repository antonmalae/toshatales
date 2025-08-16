import express from 'express';
import { validateQuery } from '../middleware/validate.js';
import { searchSchema } from '../utils/validation.js';
import { search } from '../controllers/searchController.js';

const router = express.Router();

// Public routes
router.get('/', validateQuery(searchSchema), search);

export default router; 