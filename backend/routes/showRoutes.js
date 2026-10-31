import express from 'express';
import {
  getShows,
  getShowsByMovie,
  getShowSeats,
  createShow,
  updateShow,
  deleteShow
} from '../controllers/showController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getShows);
router.get('/movie/:movieId', getShowsByMovie);
router.get('/:id/seats', getShowSeats);

// Admin show management
router.post('/', protect, adminOnly, createShow);
router.put('/:id', protect, adminOnly, updateShow);
router.delete('/:id', protect, adminOnly, deleteShow);

export default router;

