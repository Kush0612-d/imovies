import React from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaClock, FaTicketAlt, FaInfoCircle } from 'react-icons/fa';

const MovieCard = ({ movie }) => {
  const formattedReleaseDate = movie.releaseDate
    ? new Date(movie.releaseDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : 'Coming Soon';

  const durationHours = Math.floor(movie.duration / 60);
  const durationMins = movie.duration % 60;
  const durationStr = `${durationHours}h ${durationMins}m`;

  return (
    <div className="movie-card">
      <div className="movie-poster-wrap">
        <img
          src={movie.poster || 'https://picsum.photos/500/750?grayscale'}
          alt={movie.title}
          className="movie-poster-img"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=80';
          }}
        />

        {/* Certification badge */}
        {movie.certification && (
          <span className="cert-badge">{movie.certification}</span>
        )}

        {/* Rating Badge */}
        {movie.rating > 0 ? (
          <div className="rating-badge">
            <FaStar className="text-warning" size={13} />
            <span>{movie.rating.toFixed(1)}</span>
          </div>
        ) : (
          <div className="rating-badge" style={{ color: '#06b6d4', borderColor: '#06b6d4' }}>
            <span>NEW</span>
          </div>
        )}
      </div>

      <div className="p-3 d-flex flex-column flex-grow-1 justify-content-between">
        <div>
          {/* Genre tags */}
          <div className="d-flex flex-wrap gap-1 mb-2">
            {Array.isArray(movie.genre) &&
              movie.genre.slice(0, 2).map((g, idx) => (
                <span
                  key={idx}
                  className="badge bg-secondary bg-opacity-50 text-light fw-normal"
                  style={{ fontSize: '0.7rem' }}
                >
                  {g}
                </span>
              ))}
            <span
              className="badge bg-dark border border-secondary text-muted"
              style={{ fontSize: '0.7rem' }}
            >
              {movie.language || 'Hindi'}
            </span>
          </div>

          {/* Title */}
          <h5
            className="text-white fw-bold mb-1 text-truncate"
            title={movie.title}
            style={{ fontSize: '1.05rem' }}
          >
            {movie.title}
          </h5>

          {/* Duration & Release Date */}
          <div className="d-flex align-items-center justify-content-between text-muted small mb-3">
            <span className="d-flex align-items-center gap-1">
              <FaClock size={11} /> {durationStr}
            </span>
            <span>{formattedReleaseDate}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="d-flex gap-2 mt-auto pt-2 border-top border-secondary border-opacity-25">
          <Link
            to={`/movies/${movie._id}`}
            className="btn btn-sm btn-cinema-secondary flex-grow-1 d-flex align-items-center justify-content-center gap-1 py-2"
          >
            <FaInfoCircle size={13} />
            <span>Details</span>
          </Link>

          {movie.status === 'now-showing' ? (
            <Link
              to={`/showtimes/${movie._id}`}
              className="btn btn-sm btn-cinema-primary flex-grow-1 d-flex align-items-center justify-content-center gap-1 py-2"
            >
              <FaTicketAlt size={13} />
              <span>Book</span>
            </Link>
          ) : (
            <Link
              to={`/movies/${movie._id}`}
              className="btn btn-sm btn-outline-warning flex-grow-1 d-flex align-items-center justify-content-center gap-1 py-2"
            >
              <span>Notify</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieCard;

