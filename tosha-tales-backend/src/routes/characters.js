import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createCharacterSchema, updateCharacterSchema } from '../utils/validation.js';
import { 
  getCharacters, 
  getCharacter, 
  createCharacter, 
  updateCharacter, 
  deleteCharacter, 
  toggleCharacterLike,
  getAllCharacters
} from '../controllers/characterController.js';

const router = express.Router();

// Public routes
router.get('/', getCharacters);
router.get('/all', protect, authorize('ADMIN'), getAllCharacters);
router.get('/:id', getCharacter);

// Protected routes
router.post('/:id/like', protect, toggleCharacterLike);

// Admin routes
router.post('/', protect, authorize('ADMIN'), validate(createCharacterSchema), createCharacter);
router.put('/:id', protect, authorize('ADMIN'), validate(updateCharacterSchema), updateCharacter);
router.delete('/:id', protect, authorize('ADMIN'), deleteCharacter);

export default router; 