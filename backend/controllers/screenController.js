import Screen from '../models/Screen.js';
import Cinema from '../models/Cinema.js';

// @desc    Get screens by cinema ID
// @route   GET /api/screens/cinema/:cinemaId
// @access  Public
export const getScreensByCinema = async (req, res, next) => {
  try {
    const screens = await Screen.find({ cinemaId: req.params.cinemaId });
    res.json({ success: true, count: screens.length, screens });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single screen
// @route   GET /api/screens/:id
// @access  Public
export const getScreenById = async (req, res, next) => {
  try {
    const screen = await Screen.findById(req.params.id).populate('cinemaId', 'name city address');
    if (!screen) {
      return res.status(404).json({ success: false, message: 'Screen not found' });
    }
    res.json({ success: true, screen });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new screen (Admin)
// @route   POST /api/screens
// @access  Private/Admin
export const createScreen = async (req, res, next) => {
  try {
    const { cinemaId, screenName, totalSeats, seatCategories, rowsCount, seatsPerRow } = req.body;

    const cinema = await Cinema.findById(cinemaId);
    if (!cinema) {
      return res.status(404).json({ success: false, message: 'Cinema not found' });
    }

    const screen = await Screen.create({
      cinemaId,
      screenName,
      totalSeats: totalSeats || 80,
      seatCategories: seatCategories || [
        { name: 'Premium', price: 350, rows: ['A', 'B'] },
        { name: 'Regular', price: 220, rows: ['C', 'D', 'E', 'F', 'G', 'H'] }
      ],
      rowsCount: rowsCount || 8,
      seatsPerRow: seatsPerRow || 10
    });

    res.status(201).json({ success: true, message: 'Screen created successfully', screen });
  } catch (error) {
    next(error);
  }
};

// @desc    Update screen (Admin)
// @route   PUT /api/screens/:id
// @access  Private/Admin
export const updateScreen = async (req, res, next) => {
  try {
    const screen = await Screen.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!screen) {
      return res.status(404).json({ success: false, message: 'Screen not found' });
    }
    res.json({ success: true, message: 'Screen updated successfully', screen });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete screen (Admin)
// @route   DELETE /api/screens/:id
// @access  Private/Admin
export const deleteScreen = async (req, res, next) => {
  try {
    const screen = await Screen.findByIdAndDelete(req.params.id);
    if (!screen) {
      return res.status(404).json({ success: false, message: 'Screen not found' });
    }
    res.json({ success: true, message: 'Screen deleted successfully' });
  } catch (error) {
    next(error);
  }
};

