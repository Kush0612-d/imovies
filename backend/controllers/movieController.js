import Movie from '../models/Movie.js';

// @desc    Get all movies with filters, search, and sorting
// @route   GET /api/movies
// @access  Public
export const getMovies = async (req, res, next) => {
  try {
    const {
      search,
      genre,
      language,
      status,
      year,
      minRating,
      sort
    } = req.query;

    let query = {};

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    if (genre && genre !== 'All') {
      query.genre = { $in: [new RegExp(`^${genre}$`, 'i')] };
    }

    if (language && language !== 'All') {
      query.language = { $regex: `^${language}$`, $options: 'i' };
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (minRating) {
      query.rating = { $gte: Number(minRating) };
    }

    if (year) {
      const startYear = new Date(`${year}-01-01`);
      const endYear = new Date(`${year}-12-31T23:59:59.999Z`);
      query.releaseDate = { $gte: startYear, $lte: endYear };
    }

    // Sorting
    let sortOptions = { releaseDate: -1 };
    if (sort === 'popularity') {
      sortOptions = { bookingCount: -1, rating: -1 };
    } else if (sort === 'rating') {
      sortOptions = { rating: -1 };
    } else if (sort === 'releaseDateDesc') {
      sortOptions = { releaseDate: -1 };
    } else if (sort === 'releaseDateAsc') {
      sortOptions = { releaseDate: 1 };
    } else if (sort === 'titleAsc') {
      sortOptions = { title: 1 };
    }

    const movies = await Movie.find(query).sort(sortOptions);

    res.json({
      success: true,
      count: movies.length,
      movies
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Now Showing movies
// @route   GET /api/movies/now-showing
// @access  Public
export const getNowShowingMovies = async (req, res, next) => {
  try {
    const movies = await Movie.find({ status: 'now-showing' }).sort({ rating: -1, releaseDate: -1 });
    res.json({ success: true, count: movies.length, movies });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Coming Soon movies
// @route   GET /api/movies/coming-soon
// @access  Public
export const getComingSoonMovies = async (req, res, next) => {
  try {
    const movies = await Movie.find({ status: 'coming-soon' }).sort({ releaseDate: 1 });
    res.json({ success: true, count: movies.length, movies });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Trending movies
// @route   GET /api/movies/trending
// @access  Public
export const getTrendingMovies = async (req, res, next) => {
  try {
    const movies = await Movie.find({
      $or: [{ isTrending: true }, { bookingCount: { $gt: 50 } }]
    }).sort({ bookingCount: -1, rating: -1 }).limit(8);

    // If fewer than 4 flagged trending, fallback to top rated
    if (movies.length < 4) {
      const fallback = await Movie.find({ status: 'now-showing' }).sort({ rating: -1 }).limit(8);
      return res.json({ success: true, count: fallback.length, movies: fallback });
    }

    res.json({ success: true, count: movies.length, movies });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Popular movies
// @route   GET /api/movies/popular
// @access  Public
export const getPopularMovies = async (req, res, next) => {
  try {
    const movies = await Movie.find({
      $or: [{ isPopular: true }, { rating: { $gte: 7.5 } }]
    }).sort({ rating: -1, bookingCount: -1 }).limit(8);

    res.json({ success: true, count: movies.length, movies });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single movie by ID
// @route   GET /api/movies/:id
// @access  Public
export const getMovieById = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }
    res.json({ success: true, movie });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new movie (Admin)
// @route   POST /api/movies
// @access  Private/Admin
export const createMovie = async (req, res, next) => {
  try {
    const movie = await Movie.create(req.body);
    res.status(201).json({ success: true, message: 'Movie created successfully', movie });
  } catch (error) {
    next(error);
  }
};

// @desc    Update movie (Admin)
// @route   PUT /api/movies/:id
// @access  Private/Admin
export const updateMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }
    res.json({ success: true, message: 'Movie updated successfully', movie });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete movie (Admin)
// @route   DELETE /api/movies/:id
// @access  Private/Admin
export const deleteMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }
    res.json({ success: true, message: 'Movie deleted successfully' });
  } catch (error) {
    next(error);
  }
};

