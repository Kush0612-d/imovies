import mongoose from 'mongoose';
import Cinema from '../models/Cinema.js';
import Screen from '../models/Screen.js';
import { memoryStore } from '../utils/memoryStore.js';

const isDbConnected = () => mongoose.connection.readyState === 1;

// @desc    Get all cinemas (optional city filter)
// @route   GET /api/cinemas
// @access  Public
export const getCinemas = async (req, res, next) => {
  try {
    const { city } = req.query;

    if (!isDbConnected()) {
      let filtered = [...memoryStore.cinemas];
      if (city && city !== 'All') {
        filtered = filtered.filter(c => c.city.toLowerCase() === city.toLowerCase());
      }
      return res.json({ success: true, count: filtered.length, cinemas: filtered });
    }

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

    if (!isDbConnected()) {
      const filtered = memoryStore.cinemas.filter(c => c.city.toLowerCase() === city.toLowerCase());
      return res.json({ success: true, count: filtered.length, cinemas: filtered });
    }

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
    if (!isDbConnected()) {
      const cinema = memoryStore.cinemas.find(c => c._id.toString() === req.params.id);
      if (!cinema) return res.status(404).json({ success: false, message: 'Cinema not found' });
      const screens = memoryStore.screens.filter(s => s.cinemaId.toString() === cinema._id.toString());
      return res.json({ success: true, cinema, screens });
    }

    const cinema = await Cinema.findById(req.params.id);
    if (!cinema) {
      return res.status(404).json({ success: false, message: 'Cinema not found' });
    }

    const screens = await Screen.find({ cinemaId: cinema._id });
    res.json({ success: true, cinema, screens });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new cinema (Admin)
// @route   POST /api/cinemas
// @access  Private/Admin
export const createCinema = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      const cinema = { ...req.body, _id: `cinema_${Date.now()}` };
      memoryStore.cinemas.push(cinema);
      return res.status(201).json({ success: true, message: 'Cinema created successfully', cinema });
    }
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
    if (!isDbConnected()) {
      const idx = memoryStore.cinemas.findIndex(c => c._id.toString() === req.params.id);
      if (idx === -1) return res.status(404).json({ success: false, message: 'Cinema not found' });
      memoryStore.cinemas[idx] = { ...memoryStore.cinemas[idx], ...req.body };
      return res.json({ success: true, message: 'Cinema updated successfully', cinema: memoryStore.cinemas[idx] });
    }
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
    if (!isDbConnected()) {
      memoryStore.cinemas = memoryStore.cinemas.filter(c => c._id.toString() !== req.params.id);
      return res.json({ success: true, message: 'Cinema deleted successfully' });
    }
    const cinema = await Cinema.findByIdAndDelete(req.params.id);
    if (!cinema) {
      return res.status(404).json({ success: false, message: 'Cinema not found' });
    }
    await Screen.deleteMany({ cinemaId: cinema._id });
    res.json({ success: true, message: 'Cinema and associated screens deleted successfully' });
  } catch (error) {
    next(error);
  }
};
