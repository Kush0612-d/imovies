import Show from '../models/Show.js';
import Movie from '../models/Movie.js';
import Booking from '../models/Booking.js';
import Payment from '../models/Payment.js';
import { generateTicketQR } from '../utils/qrHelper.js';
import crypto from 'crypto';

const LOCK_DURATION_MS = 10 * 60 * 1000; // 10 minutes lock

// @desc    Temporarily lock seats for checkout
// @route   POST /api/bookings/lock-seats
// @access  Private
export const lockSeats = async (req, res, next) => {
  try {
    const { showId, seatNumbers } = req.body;
    const userId = req.user._id;

    if (!showId || !Array.isArray(seatNumbers) || seatNumbers.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide showId and an array of seat numbers' });
    }

    const show = await Show.findById(showId);
    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found' });
    }

    const now = new Date();
    const lockedUntil = new Date(Date.now() + LOCK_DURATION_MS);

    // Verify all requested seats are valid and not booked or locked by another user
    const seatsToLock = [];
    let baseAmount = 0;

    for (const seatNum of seatNumbers) {
      const seat = show.seats.find(s => s.seatNumber === seatNum);
      if (!seat) {
        return res.status(400).json({ success: false, message: `Seat ${seatNum} does not exist in this auditorium` });
      }

      if (seat.status === 'booked') {
        return res.status(400).json({ success: false, message: `Seat ${seatNum} is already booked by another patron` });
      }

      // Check if locked by someone else and lock has not expired
      if (
        seat.status === 'locked' &&
        seat.lockedUntil &&
        new Date(seat.lockedUntil) > now &&
        seat.lockedBy &&
        seat.lockedBy.toString() !== userId.toString()
      ) {
        return res.status(400).json({
          success: false,
          message: `Seat ${seatNum} is currently held by another user. Please choose another seat or try again shortly.`
        });
      }

      seatsToLock.push(seat);
      baseAmount += seat.price;
    }

    // Apply the lock to the seats
    seatsToLock.forEach(seat => {
      seat.status = 'locked';
      seat.lockedBy = userId;
      seat.lockedUntil = lockedUntil;
    });

    await show.save();

    const convenienceFee = Math.round(seatNumbers.length * 25);
    const taxAmount = Math.round((baseAmount + convenienceFee) * 0.18);
    const totalAmount = baseAmount + convenienceFee + taxAmount;

    res.json({
      success: true,
      message: 'Seats locked successfully for 10 minutes',
      showId,
      seatNumbers,
      lockedUntil,
      pricing: {
        baseAmount,
        convenienceFee,
        taxAmount,
        totalAmount
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Confirm booking after payment
// @route   POST /api/bookings/confirm
// @access  Private
export const confirmBooking = async (req, res, next) => {
  try {
    const { showId, seatNumbers, paymentMethod, transactionId, razorpayDetails } = req.body;
    const userId = req.user._id;

    if (!showId || !Array.isArray(seatNumbers) || seatNumbers.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid show or seat numbers' });
    }

    const show = await Show.findById(showId)
      .populate('movieId')
      .populate('cinemaId')
      .populate('screenId');

    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found' });
    }

    const now = new Date();
    const confirmedSeats = [];
    let baseAmount = 0;

    // Strict revalidation of seat availability
    for (const seatNum of seatNumbers) {
      const seat = show.seats.find(s => s.seatNumber === seatNum);

      if (!seat) {
        return res.status(400).json({ success: false, message: `Seat ${seatNum} not found` });
      }

      if (seat.status === 'booked') {
        return res.status(400).json({
          success: false,
          message: `Double booking prevented: Seat ${seatNum} is already booked!`
        });
      }

      // If locked, verify it was locked by this user (or lock expired and available)
      if (
        seat.status === 'locked' &&
        seat.lockedBy &&
        seat.lockedBy.toString() !== userId.toString() &&
        seat.lockedUntil &&
        new Date(seat.lockedUntil) > now
      ) {
        return res.status(400).json({
          success: false,
          message: `Seat ${seatNum} lock has expired or is held by another user`
        });
      }

      confirmedSeats.push(seat);
      baseAmount += seat.price;
    }

    // Mark seats as permanently booked
    confirmedSeats.forEach(seat => {
      seat.status = 'booked';
      seat.lockedBy = null;
      seat.lockedUntil = null;
    });

    await show.save();

    // Financial calculations
    const convenienceFee = Math.round(seatNumbers.length * 25);
    const taxAmount = Math.round((baseAmount + convenienceFee) * 0.18);
    const totalAmount = baseAmount + convenienceFee + taxAmount;

    // Generate readable Unique Booking ID
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const bookingId = `IMOV-${dateStr}-${randomSuffix}`;
    const secureVerificationCode = crypto.randomBytes(8).toString('hex').toUpperCase();

    // Generate Digital Ticket QR Code
    const qrCodeDataUrl = await generateTicketQR({
      bookingId,
      movieTitle: show.movieId.title,
      cinemaName: show.cinemaId.name,
      showDate: show.showDate,
      startTime: show.startTime,
      seats: seatNumbers.join(', '),
      secureVerificationCode
    });

    // Create Payment Record
    const finalTransactionId = transactionId || `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const payment = await Payment.create({
      userId,
      amount: totalAmount,
      paymentMethod: paymentMethod || 'mock_upi',
      transactionId: finalTransactionId,
      paymentStatus: 'successful',
      razorpayOrderId: razorpayDetails?.orderId || '',
      razorpayPaymentId: razorpayDetails?.paymentId || '',
      razorpaySignature: razorpayDetails?.signature || ''
    });

    // Create Booking Record
    const booking = await Booking.create({
      bookingId,
      userId,
      showId: show._id,
      movieId: show.movieId._id,
      cinemaId: show.cinemaId._id,
      screenId: show.screenId._id,
      seats: confirmedSeats.map(s => ({
        seatNumber: s.seatNumber,
        category: s.category,
        price: s.price
      })),
      baseAmount,
      convenienceFee,
      taxAmount,
      totalAmount,
      paymentId: payment._id,
      paymentStatus: 'paid',
      bookingStatus: 'confirmed',
      qrCodeDataUrl,
      secureVerificationCode
    });

    payment.bookingId = booking._id;
    await payment.save();

    // Increment movie popularity count
    await Movie.findByIdAndUpdate(show.movieId._id, {
      $inc: { bookingCount: seatNumbers.length }
    });

    // Populate for response
    const populatedBooking = await Booking.findById(booking._id)
      .populate('movieId')
      .populate('cinemaId')
      .populate('screenId')
      .populate('userId', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Movie tickets booked successfully!',
      booking: populatedBooking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's booking history
// @route   GET /api/bookings/my-bookings
// @access  Private
export const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate('movieId')
      .populate('cinemaId')
      .populate('screenId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single booking by ID or bookingId
// @route   GET /api/bookings/:id
// @access  Private
export const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let query = id.startsWith('IMOV-') ? { bookingId: id } : { _id: id };

    const booking = await Booking.findOne(query)
      .populate('movieId')
      .populate('cinemaId')
      .populate('screenId')
      .populate('userId', 'name email phone')
      .populate('paymentId');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Only ticket owner or admin can view
    if (booking.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this booking' });
    }

    res.json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel booking & free up seats
// @route   POST /api/bookings/:id/cancel
// @access  Private
export const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Ensure authorized
    if (booking.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to cancel this booking' });
    }

    if (booking.bookingStatus === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
    }

    // Free up seats in the Show record
    const show = await Show.findById(booking.showId);
    if (show) {
      const bookedSeatNums = booking.seats.map(s => s.seatNumber);
      show.seats.forEach(seat => {
        if (bookedSeatNums.includes(seat.seatNumber)) {
          seat.status = 'available';
          seat.lockedBy = null;
          seat.lockedUntil = null;
        }
      });
      await show.save();
    }

    booking.bookingStatus = 'cancelled';
    booking.paymentStatus = 'refunded';
    await booking.save();

    if (booking.paymentId) {
      await Payment.findByIdAndUpdate(booking.paymentId, { paymentStatus: 'refunded' });
    }

    res.json({
      success: true,
      message: 'Booking cancelled successfully. Refund initiated to original payment source.',
      booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify QR Code / Ticket authenticity (Public or Staff)
// @route   GET /api/bookings/verify/:bookingId
// @access  Public
export const verifyTicket = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ bookingId: req.params.bookingId })
      .populate('movieId', 'title poster duration language certification')
      .populate('cinemaId', 'name city address')
      .populate('screenId', 'screenName')
      .populate('showId', 'showDate startTime');

    if (!booking) {
      return res.status(404).json({
        success: false,
        valid: false,
        message: 'Invalid ticket: No booking record found for this code.'
      });
    }

    res.json({
      success: true,
      valid: booking.bookingStatus === 'confirmed',
      status: booking.bookingStatus,
      booking: {
        bookingId: booking.bookingId,
        movie: booking.movieId?.title,
        poster: booking.movieId?.poster,
        cinema: booking.cinemaId?.name,
        screen: booking.screenId?.screenName,
        showDate: booking.showId?.showDate,
        startTime: booking.showId?.startTime,
        seats: booking.seats.map(s => s.seatNumber),
        totalAmount: booking.totalAmount,
        bookingStatus: booking.bookingStatus,
        verificationCode: booking.secureVerificationCode
      }
    });
  } catch (error) {
    next(error);
  }
};

