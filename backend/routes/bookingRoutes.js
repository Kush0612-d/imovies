import express from 'express';
import {
  lockSeats,
  confirmBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  verifyTicket
} from '../controllers/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public ticket QR verification
router.get('/verify/:bookingId', verifyTicket);

// Protected user booking routes
router.post('/lock-seats', protect, lockSeats);
router.post('/confirm', protect, confirmBooking);
router.get('/my-bookings', protect, getMyBookings);
router.get('/:id', protect, getBookingById);
router.post('/:id/cancel', protect, cancelBooking);

export default router;

