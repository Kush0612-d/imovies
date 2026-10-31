import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../services/api';
import MovieCard from '../components/MovieCard';
import { FaSearch, FaFilter, FaRedo, FaFilm } from 'react-icons/fa';

const GENRES = ['All', 'Action', 'Adventure', 'Sci-Fi', 'Comedy', 'Drama', 'Thriller', 'Horror', 'Biography', 'Mythology'];
const LANGUAGES = ['All', 'Hindi', 'English', 'Tamil', 'Telugu'];
const RATINGS = ['All', '8', '7', '6'];
const YEARS = ['All', '2025', '2024', '2023'];

const Movies = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [genre, setGenre] = useState(searchParams.get('genre') || 'All');
  const [language, setLanguage] = useState(searchParams.get('language') || 'All');
  const [status, setStatus] = useState(searchParams.get('status') || 'All');
  const [minRating, setMinRating] = useState(searchParams.get('rating') || 'All');
  const [year, setYear] = useState(searchParams.get('year') || 'All');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'releaseDateDesc');

  useEffect(() => {
    fetchFilteredMovies();
  }, [genre, language, status, minRating, year, sortBy]);

  const fetchFilteredMovies = async () => {
    try {
      setLoading(true);
      const params = {};

      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (genre !== 'All') params.genre = genre;
      if (language !== 'All') params.language = language;
      if (status !== 'All') params.status = status;
      if (minRating !== 'All') params.minRating = minRating;
      if (year !== 'All') params.year = year;
      if (sortBy) params.sort = sortBy;

      const { data } = await API.get('/movies', { params });
      setMovies(data.movies || []);
    } catch (err) {
      console.error('Failed to fetch movies:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchFilteredMovies();
  };

  const resetFilters = () => {
    setSearchTerm('');
    setGenre('All');
    setLanguage('All');
    setStatus('All');
    setMinRating('All');
    setYear('All');
    setSortBy('releaseDateDesc');
  };

  return (
    <div className="container py-4">
      {/* Page Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-white mb-1 d-flex align-items-center gap-2">
            <FaFilm className="text-danger" />
            <span>Discover Movies</span>
          </h2>
          <p className="text-muted mb-0 small">
            Browse currently showing movies, search titles, and filter by your favorite genres.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="d-flex gap-2" style={{ maxWidth: '380px' }}>
          <div className="input-group">
            <input
              type="text"
              className="form-control form-control-cinema"
              placeholder="Search movie title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="btn btn-cinema-primary" type="submit">
              <FaSearch />
            </button>
          </div>
        </form>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="glass-panel p-3 mb-4">
        <div className="row g-2 align-items-center">
          {/* Status Filter */}
          <div className="col-6 col-md-2">
            <label className="form-label small text-muted mb-1">Status</label>
            <select
              className="form-select form-control-cinema form-select-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="now-showing">Now Showing</option>
              <option value="coming-soon">Coming Soon</option>
            </select>
          </div>

          {/* Genre Filter */}
          <div className="col-6 col-md-2">
            <label className="form-label small text-muted mb-1">Genre</label>
            <select
              className="form-select form-control-cinema form-select-sm"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
            >
              {GENRES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Language Filter */}
          <div className="col-6 col-md-2">
            <label className="form-label small text-muted mb-1">Language</label>
            <select
              className="form-select form-control-cinema form-select-sm"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              {LANGUAGES.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          {/* Rating Filter */}
          <div className="col-6 col-md-2">
            <label className="form-label small text-muted mb-1">Min Rating</label>
            <select
              className="form-select form-control-cinema form-select-sm"
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
            >
              <option value="All">Any Rating</option>
              <option value="8">★ 8.0 & Above</option>
              <option value="7">★ 7.0 & Above</option>
              <option value="6">★ 6.0 & Above</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="col-8 col-md-3">
            <label className="form-label small text-muted mb-1">Sort By</label>
            <select
              className="form-select form-control-cinema form-select-sm"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="releaseDateDesc">Newest Release First</option>
              <option value="releaseDateAsc">Oldest Release First</option>
              <option value="popularity">Most Popular / Booked</option>
              <option value="rating">Highest Rated</option>
              <option value="titleAsc">Title A-Z</option>
            </select>
          </div>

          {/* Reset button */}
          <div className="col-4 col-md-1 d-flex align-items-end pt-3">
            <button
              className="btn btn-sm btn-cinema-secondary w-100"
              onClick={resetFilters}
              title="Reset Filters"
            >
              <FaRedo size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* Movies Grid */}
      {loading ? (
        <div
          className="d-flex flex-column justify-content-center align-items-center"
          style={{ minHeight: '40vh' }}
        >
          <div className="spinner-border text-danger mb-2"></div>
          <p className="text-muted small">Loading movies...</p>
        </div>
      ) : movies.length > 0 ? (
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
          {movies.map((movie) => (
            <div key={movie._id} className="col">
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-5 glass-panel">
          <FaFilm className="text-muted mb-3" size={48} />
          <h4 className="text-white">No Movies Found</h4>
          <p className="text-muted">
            We couldn't find any movie matching your current filters and search query.
          </p>
          <button className="btn btn-cinema-secondary" onClick={resetFilters}>
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default Movies;

