import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { uploadFile, getMediaFiles, deleteMediaFile } from '../controllers/mediaController.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Admin routes
router.post('/upload', protect, authorize('ADMIN'), upload.single('file'), uploadFile);
router.get('/', protect, authorize('ADMIN'), getMediaFiles);
router.delete('/:id', protect, authorize('ADMIN'), deleteMediaFile);

export default router; 