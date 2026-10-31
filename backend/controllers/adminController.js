import User from '../models/User.js';
import Movie from '../models/Movie.js';
import Cinema from '../models/Cinema.js';
import Show from '../models/Show.js';
import Booking from '../models/Booking.js';
import Payment from '../models/Payment.js';

// @desc    Get Admin Dashboard Summary Statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getAdminStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalMovies = await Movie.countDocuments();
    const totalCinemas = await Cinema.countDocuments();
    const totalBookings = await Booking.countDocuments({ bookingStatus: 'confirmed' });
    const upcomingShows = await Show.countDocuments({ status: 'active' });

    // Calculate total revenue from confirmed bookings
    const revenueResult = await Booking.aggregate([
      { $match: { bookingStatus: 'confirmed' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    // Recent bookings (last 5)
    const recentBookings = await Booking.find()
      .populate('userId', 'name email')
      .populate('movieId', 'title poster')
      .populate('cinemaId', 'name city')
      .sort({ createdAt: -1 })
      .limit(5);

    // City distribution of cinemas
    const cinemasByCity = await Cinema.aggregate([
      { $group: { _id: '$city', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalMovies,
        totalCinemas,
        totalBookings,
        totalRevenue,
        upcomingShows
      },
      recentBookings,
      cinemasByCity
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users with search and pagination (Admin)
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res, next) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role (Admin)
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: `User role updated to ${role}`, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings (Admin)
// @route   GET /api/admin/bookings
// @access  Private/Admin
export const getAllBookings = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    let query = {};

    if (status && status !== 'All') {
      query.bookingStatus = status;
    }

    if (search) {
      query.bookingId = { $regex: search, $options: 'i' };
    }

    const bookings = await Booking.find(query)
      .populate('userId', 'name email phone')
      .populate('movieId', 'title poster duration')
      .populate('cinemaId', 'name city')
      .populate('screenId', 'screenName')
      .populate('paymentId')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    next(error);
  }
};

