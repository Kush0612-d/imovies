import express from 'express';
import {
  getCinemas,
  getCinemasByCity,
  getCinemaById,
  createCinema,
  updateCinema,
  deleteCinema
} from '../controllers/cinemaController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getCinemas);
router.get('/city/:city', getCinemasByCity);
router.get('/:id', getCinemaById);

// Admin cinema management
router.post('/', protect, adminOnly, createCinema);
router.put('/:id', protect, adminOnly, updateCinema);
router.delete('/:id', protect, adminOnly, deleteCinema);

export default router;

