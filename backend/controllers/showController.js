import mongoose from 'mongoose';
import Show from '../models/Show.js';
import Screen from '../models/Screen.js';
import Movie from '../models/Movie.js';
import Cinema from '../models/Cinema.js';
import { memoryStore } from '../utils/memoryStore.js';

const isDbConnected = () => mongoose.connection.readyState === 1;

// Helper function to build fresh seat array for a screen
export const generateSeatMap = (screen) => {
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].slice(0, screen.rowsCount || 8);
  const seatsPerRow = screen.seatsPerRow || 10;
  const seats = [];

  rows.forEach((rowName) => {
    const matchedCategory = screen.seatCategories?.find(cat => cat.rows?.includes(rowName));
    const categoryName = matchedCategory ? matchedCategory.name : (['A', 'B'].includes(rowName) ? 'Premium' : 'Regular');
    const price = matchedCategory ? matchedCategory.price : (categoryName === 'Premium' ? 350 : 220);

    for (let c = 1; c <= seatsPerRow; c++) {
      seats.push({
        seatNumber: `${rowName}${c}`,
        row: rowName,
        col: c,
        category: categoryName,
        price,
        status: 'available',
        lockedUntil: null,
        lockedBy: null
      });
    }
  });

  return seats;
};

// @desc    Get all shows
// @route   GET /api/shows
// @access  Public
export const getShows = async (req, res, next) => {
  try {
    const { movieId, cinemaId, city, date } = req.query;

    if (!isDbConnected()) {
      let shows = [...memoryStore.shows];
      if (movieId) shows = shows.filter(s => (s.movieId?._id || s.movieId).toString() === movieId);
      if (cinemaId) shows = shows.filter(s => (s.cinemaId?._id || s.cinemaId).toString() === cinemaId);
      if (date) shows = shows.filter(s => s.showDate === date);
      if (city && city !== 'All') {
        shows = shows.filter(s => s.cinemaId?.city?.toLowerCase() === city.toLowerCase());
      }
      return res.json({ success: true, count: shows.length, shows });
    }

    let query = { status: 'active' };
    if (movieId) query.movieId = movieId;
    if (cinemaId) query.cinemaId = cinemaId;
    if (date) query.showDate = date;

    let shows = await Show.find(query)
      .populate('movieId', 'title poster duration language certification genre rating')
      .populate('cinemaId', 'name address city facilities')
      .populate('screenId', 'screenName totalSeats seatCategories')
      .sort({ showDate: 1, startTime: 1 });

    if (city && city !== 'All') {
      shows = shows.filter(show => show.cinemaId && show.cinemaId.city.toLowerCase() === city.toLowerCase());
    }

    res.json({ success: true, count: shows.length, shows });
  } catch (error) {
    next(error);
  }
};

// @desc    Get shows grouped by Cinema for a given Movie & Date
// @route   GET /api/shows/movie/:movieId
// @access  Public
export const getShowsByMovie = async (req, res, next) => {
  try {
    const { movieId } = req.params;
    const { date, city } = req.query;

    if (!isDbConnected()) {
      let shows = memoryStore.shows.filter(s => (s.movieId?._id || s.movieId).toString() === movieId);
      if (date && date !== 'all') {
        shows = shows.filter(s => s.showDate === date);
      }
      if (city && city !== 'All') {
        shows = shows.filter(s => s.cinemaId?.city?.toLowerCase() === city.toLowerCase());
      }

      const cinemaMap = {};
      shows.forEach(show => {
        const c = show.cinemaId;
        const cId = c._id.toString();
        if (!cinemaMap[cId]) {
          cinemaMap[cId] = { cinema: c, shows: [] };
        }
        cinemaMap[cId].shows.push({
          _id: show._id,
          showDate: show.showDate,
          startTime: show.startTime,
          ticketPrice: show.ticketPrice,
          screen: show.screenId,
          availableSeatsCount: show.seats.filter(s => s.status === 'available').length,
          totalSeats: show.seats.length
        });
      });

      return res.json({ success: true, movieId, date: date || 'all', cinemas: Object.values(cinemaMap) });
    }

    let query = { movieId, status: 'active' };
    if (date) query.showDate = date;

    const shows = await Show.find(query)
      .populate('cinemaId', 'name address city facilities image')
      .populate('screenId', 'screenName totalSeats seatCategories')
      .sort({ startTime: 1 });

    const filteredShows = city && city !== 'All'
      ? shows.filter(s => s.cinemaId && s.cinemaId.city.toLowerCase() === city.toLowerCase())
      : shows;

    const cinemaMap = {};
    filteredShows.forEach(show => {
      if (!show.cinemaId) return;
      const cId = show.cinemaId._id.toString();
      if (!cinemaMap[cId]) {
        cinemaMap[cId] = { cinema: show.cinemaId, shows: [] };
      }
      cinemaMap[cId].shows.push({
        _id: show._id,
        showDate: show.showDate,
        startTime: show.startTime,
        ticketPrice: show.ticketPrice,
        screen: show.screenId,
        availableSeatsCount: show.seats.filter(s => s.status === 'available').length,
        totalSeats: show.seats.length
      });
    });

    res.json({ success: true, movieId, date: date || 'all', cinemas: Object.values(cinemaMap) });
  } catch (error) {
    next(error);
  }
};

// @desc    Get seat layout and real-time availability for a show
// @route   GET /api/shows/:id/seats
// @access  Public
export const getShowSeats = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      const show = memoryStore.shows.find(s => s._id.toString() === req.params.id);
      if (!show) return res.status(404).json({ success: false, message: 'Show not found' });
      return res.json({
        success: true,
        showId: show._id,
        movie: show.movieId,
        cinema: show.cinemaId,
        screen: show.screenId,
        showDate: show.showDate,
        startTime: show.startTime,
        ticketPrice: show.ticketPrice,
        seats: show.seats
      });
    }

    const show = await Show.findById(req.params.id)
      .populate('movieId', 'title poster duration language certification')
      .populate('cinemaId', 'name city address facilities')
      .populate('screenId', 'screenName rowsCount seatsPerRow seatCategories totalSeats');

    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found' });
    }

    const now = new Date();
    let updatedAnyLock = false;
    show.seats.forEach(seat => {
      if (seat.status === 'locked' && seat.lockedUntil && new Date(seat.lockedUntil) < now) {
        seat.status = 'available';
        seat.lockedUntil = null;
        seat.lockedBy = null;
        updatedAnyLock = true;
      }
    });

    if (updatedAnyLock) {
      await show.save();
    }

    res.json({
      success: true,
      showId: show._id,
      movie: show.movieId,
      cinema: show.cinemaId,
      screen: show.screenId,
      showDate: show.showDate,
      startTime: show.startTime,
      ticketPrice: show.ticketPrice,
      seats: show.seats
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new show schedule (Admin)
// @route   POST /api/shows
// @access  Private/Admin
export const createShow = async (req, res, next) => {
  try {
    const { movieId, cinemaId, screenId, showDate, startTime, ticketPrice } = req.body;

    if (!isDbConnected()) {
      const screen = memoryStore.screens.find(s => s._id.toString() === screenId) || { rowsCount: 6, seatsPerRow: 10 };
      const movie = memoryStore.movies.find(m => m._id.toString() === movieId) || { title: 'Movie' };
      const cinema = memoryStore.cinemas.find(c => c._id.toString() === cinemaId) || { name: 'Cinema' };
      const seats = generateSeatMap(screen);

      const show = {
        _id: `show_mem_${Date.now()}`,
        movieId: movie,
        cinemaId: cinema,
        screenId: screen,
        showDate,
        startTime,
        ticketPrice: ticketPrice || { premium: 350, regular: 220 },
        seats,
        status: 'active'
      };
      memoryStore.shows.push(show);
      return res.status(201).json({ success: true, message: 'Show scheduled successfully', show });
    }

    const conflict = await Show.findOne({ screenId, showDate, startTime, status: { $ne: 'cancelled' } });
    if (conflict) {
      return res.status(400).json({
        success: false,
        message: `Conflict detected! A show is already scheduled on this screen at ${startTime} on ${showDate}.`
      });
    }

    const screen = await Screen.findById(screenId);
    if (!screen) return res.status(404).json({ success: false, message: 'Screen not found' });

    const seats = generateSeatMap(screen);
    const show = await Show.create({
      movieId,
      cinemaId,
      screenId,
      showDate,
      startTime,
      ticketPrice: ticketPrice || { premium: 350, regular: 220 },
      seats,
      status: 'active'
    });

    res.status(201).json({ success: true, message: 'Show scheduled successfully', show });
  } catch (error) {
    next(error);
  }
};

// @desc    Update show (Admin)
// @route   PUT /api/shows/:id
// @access  Private/Admin
export const updateShow = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      const idx = memoryStore.shows.findIndex(s => s._id.toString() === req.params.id);
      if (idx === -1) return res.status(404).json({ success: false, message: 'Show not found' });
      memoryStore.shows[idx] = { ...memoryStore.shows[idx], ...req.body };
      return res.json({ success: true, message: 'Show updated successfully', show: memoryStore.shows[idx] });
    }
    const show = await Show.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!show) return res.status(404).json({ success: false, message: 'Show not found' });
    res.json({ success: true, message: 'Show updated successfully', show });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete show (Admin)
// @route   DELETE /api/shows/:id
// @access  Private/Admin
export const deleteShow = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      memoryStore.shows = memoryStore.shows.filter(s => s._id.toString() !== req.params.id);
      return res.json({ success: true, message: 'Show deleted successfully' });
    }
    const show = await Show.findByIdAndDelete(req.params.id);
    if (!show) return res.status(404).json({ success: false, message: 'Show not found' });
    res.json({ success: true, message: 'Show deleted successfully' });
  } catch (error) {
    next(error);
  }
};
