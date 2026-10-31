import express from 'express';
import {
  registerUser,
  loginUser,
  getCurrentUser,
  updateProfile,
  logoutUser
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/me', protect, getCurrentUser);
router.put('/me', protect, updateProfile);

export default router;

