import express from 'express';
import {
  getAdminStats,
  getAllUsers,
  updateUserRole,
  getAllBookings
} from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply auth and admin check to all admin routes
router.use(protect, adminOnly);

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.get('/bookings', getAllBookings);

export default router;

