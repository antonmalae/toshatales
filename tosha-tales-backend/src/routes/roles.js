import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createRoleSchema, updateRoleSchema } from '../utils/validation.js';
import { getRoles, createRole, updateRole, deleteRole } from '../controllers/roleController.js';

const router = express.Router();

// Public routes
router.get('/', getRoles);

// Admin routes
router.post('/', protect, authorize('ADMIN'), validate(createRoleSchema), createRole);
router.put('/:id', protect, authorize('ADMIN'), validate(updateRoleSchema), updateRole);
router.delete('/:id', protect, authorize('ADMIN'), deleteRole);

export default router; 