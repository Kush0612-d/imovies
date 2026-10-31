import express from 'express';
import {
  getMovies,
  getNowShowingMovies,
  getComingSoonMovies,
  getTrendingMovies,
  getPopularMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie
} from '../controllers/movieController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getMovies);
router.get('/now-showing', getNowShowingMovies);
router.get('/coming-soon', getComingSoonMovies);
router.get('/trending', getTrendingMovies);
router.get('/popular', getPopularMovies);
router.get('/:id', getMovieById);

// Admin movie management
router.post('/', protect, adminOnly, createMovie);
router.put('/:id', protect, adminOnly, updateMovie);
router.delete('/:id', protect, adminOnly, deleteMovie);

export default router;

