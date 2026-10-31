import Show from '../models/Show.js';
import Screen from '../models/Screen.js';
import Movie from '../models/Movie.js';
import Cinema from '../models/Cinema.js';

// Helper function to build fresh seat array for a screen
export const generateSeatMap = (screen) => {
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].slice(0, screen.rowsCount || 8);
  const seatsPerRow = screen.seatsPerRow || 10;
  const seats = [];

  rows.forEach((rowName) => {
    // Determine category based on screen.seatCategories
    const matchedCategory = screen.seatCategories.find(cat => cat.rows.includes(rowName));
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

// @desc    Get all shows (with optional query filters: movieId, cinemaId, city, date)
// @route   GET /api/shows
// @access  Public
export const getShows = async (req, res, next) => {
  try {
    const { movieId, cinemaId, city, date } = req.query;
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

// @desc    Get shows grouped by Cinema for a given Movie & Date (with optional city filter)
// @route   GET /api/shows/movie/:movieId
// @access  Public
export const getShowsByMovie = async (req, res, next) => {
  try {
    const { movieId } = req.params;
    const { date, city } = req.query;

    let query = { movieId, status: 'active' };
    if (date) {
      query.showDate = date;
    }

    const shows = await Show.find(query)
      .populate('cinemaId', 'name address city facilities image')
      .populate('screenId', 'screenName totalSeats seatCategories')
      .sort({ startTime: 1 });

    // Filter by city if specified
    const filteredShows = city && city !== 'All'
      ? shows.filter(s => s.cinemaId && s.cinemaId.city.toLowerCase() === city.toLowerCase())
      : shows;

    // Group shows by Cinema
    const cinemaMap = {};
    filteredShows.forEach(show => {
      if (!show.cinemaId) return;
      const cId = show.cinemaId._id.toString();
      if (!cinemaMap[cId]) {
        cinemaMap[cId] = {
          cinema: show.cinemaId,
          shows: []
        };
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

    const cinemasWithShows = Object.values(cinemaMap);

    res.json({
      success: true,
      movieId,
      date: date || 'all',
      cinemas: cinemasWithShows
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get seat layout and real-time availability for a show (automatically cleans expired locks)
// @route   GET /api/shows/:id/seats
// @access  Public
export const getShowSeats = async (req, res, next) => {
  try {
    const show = await Show.findById(req.params.id)
      .populate('movieId', 'title poster duration language certification')
      .populate('cinemaId', 'name city address facilities')
      .populate('screenId', 'screenName rowsCount seatsPerRow seatCategories totalSeats');

    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found' });
    }

    // Clean up expired locks automatically
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

    // Check if conflicting show already exists on the same screen, date, and time
    const conflict = await Show.findOne({
      screenId,
      showDate,
      startTime,
      status: { $ne: 'cancelled' }
    });

    if (conflict) {
      return res.status(400).json({
        success: false,
        message: `Conflict detected! A show is already scheduled on this screen at ${startTime} on ${showDate}.`
      });
    }

    const screen = await Screen.findById(screenId);
    if (!screen) {
      return res.status(404).json({ success: false, message: 'Screen not found' });
    }

    // Generate fresh seats from the screen template
    const seats = generateSeatMap(screen);

    // Apply custom ticket prices if provided
    if (ticketPrice) {
      seats.forEach(seat => {
        if (seat.category === 'Premium' && ticketPrice.premium) {
          seat.price = ticketPrice.premium;
        } else if (seat.category === 'Regular' && ticketPrice.regular) {
          seat.price = ticketPrice.regular;
        }
      });
    }

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

    res.status(201).json({
      success: true,
      message: 'Show scheduled successfully',
      show
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update show (Admin)
// @route   PUT /api/shows/:id
// @access  Private/Admin
export const updateShow = async (req, res, next) => {
  try {
    const show = await Show.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found' });
    }
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
    const show = await Show.findByIdAndDelete(req.params.id);
    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found' });
    }
    res.json({ success: true, message: 'Show deleted successfully' });
  } catch (error) {
    next(error);
  }
};

