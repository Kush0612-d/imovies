import React, { useState, useEffect } from 'react';
import API from '../services/api';
import MovieCard from '../components/MovieCard';
import { FaCalendarAlt } from 'react-icons/fa';

const ComingSoon = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComingSoon = async () => {
      try {
        const { data } = await API.get('/movies/coming-soon');
        setMovies(data.movies || []);
      } catch (err) {
        console.error('Failed to load upcoming movies:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchComingSoon();
  }, []);

  return (
    <div className="container py-4">
      <div className="mb-4">
        <h2 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
          <FaCalendarAlt className="text-warning" />
          <span>Coming Soon to Cinemas</span>
        </h2>
        <p className="text-muted small">
          Get ready for the most awaited theatrical releases. Preview trailers and release dates.
        </p>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-warning"></div>
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
        <div className="glass-panel text-center py-5">
          <h4 className="text-dark">No upcoming releases scheduled yet</h4>
          <p className="text-muted">Stay tuned for new blockbuster announcements!</p>
        </div>
      )}
    </div>
  );
};

export default ComingSoon;

