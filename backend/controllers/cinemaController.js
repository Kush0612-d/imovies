import Cinema from '../models/Cinema.js';
import Screen from '../models/Screen.js';

// @desc    Get all cinemas (optional city filter)
// @route   GET /api/cinemas
// @access  Public
export const getCinemas = async (req, res, next) => {
  try {
    const { city } = req.query;
    let query = { isActive: true };
    if (city && city !== 'All') {
      query.city = city;
    }

    const cinemas = await Cinema.find(query).populate('screens');
    res.json({ success: true, count: cinemas.length, cinemas });
  } catch (error) {
    next(error);
  }
};

// @desc    Get cinemas by city
// @route   GET /api/cinemas/city/:city
// @access  Public
export const getCinemasByCity = async (req, res, next) => {
  try {
    const { city } = req.params;
    const cinemas = await Cinema.find({
      city: new RegExp(`^${city}$`, 'i'),
      isActive: true
    });
    res.json({ success: true, count: cinemas.length, cinemas });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single cinema by ID
// @route   GET /api/cinemas/:id
// @access  Public
export const getCinemaById = async (req, res, next) => {
  try {
    const cinema = await Cinema.findById(req.params.id);
    if (!cinema) {
      return res.status(404).json({ success: false, message: 'Cinema not found' });
    }

    const screens = await Screen.find({ cinemaId: cinema._id });

    res.json({
      success: true,
      cinema,
      screens
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new cinema (Admin)
// @route   POST /api/cinemas
// @access  Private/Admin
export const createCinema = async (req, res, next) => {
  try {
    const cinema = await Cinema.create(req.body);
    res.status(201).json({ success: true, message: 'Cinema created successfully', cinema });
  } catch (error) {
    next(error);
  }
};

// @desc    Update cinema (Admin)
// @route   PUT /api/cinemas/:id
// @access  Private/Admin
export const updateCinema = async (req, res, next) => {
  try {
    const cinema = await Cinema.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!cinema) {
      return res.status(404).json({ success: false, message: 'Cinema not found' });
    }
    res.json({ success: true, message: 'Cinema updated successfully', cinema });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete cinema (Admin)
// @route   DELETE /api/cinemas/:id
// @access  Private/Admin
export const deleteCinema = async (req, res, next) => {
  try {
    const cinema = await Cinema.findByIdAndDelete(req.params.id);
    if (!cinema) {
      return res.status(404).json({ success: false, message: 'Cinema not found' });
    }
    // Also delete screens associated with this cinema
    await Screen.deleteMany({ cinemaId: cinema._id });
    res.json({ success: true, message: 'Cinema and associated screens deleted successfully' });
  } catch (error) {
    next(error);
  }
};

