import express from 'express';
import {
  getScreensByCinema,
  getScreenById,
  createScreen,
  updateScreen,
  deleteScreen
} from '../controllers/screenController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/cinema/:cinemaId', getScreensByCinema);
router.get('/:id', getScreenById);

// Admin screen management
router.post('/', protect, adminOnly, createScreen);
router.put('/:id', protect, adminOnly, updateScreen);
router.delete('/:id', protect, adminOnly, deleteScreen);

export default router;

