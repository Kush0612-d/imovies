import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api';
import TrailerModal from '../components/TrailerModal';
import { useCity } from '../context/CityContext';
import {
  FaPlay,
  FaTicketAlt,
  FaStar,
  FaClock,
  FaCalendarAlt,
  FaUserTie,
  FaUsers,
  FaLanguage,
  FaArrowLeft,
  FaMapMarkerAlt
} from 'react-icons/fa';

const MovieDetails = () => {
  const { id } = useParams();
  const { selectedCity } = useCity();

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Trailer modal state
  const [trailerOpen, setTrailerOpen] = useState(false);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        setLoading(true);
        const { data } = await API.get(`/movies/${id}`);
        setMovie(data.movie);
      } catch (err) {
        setError('Movie not found or failed to load.');
      } finally {
        setLoading(false);
      }
    };
    fetchMovie();
  }, [id]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-danger" style={{ width: '3rem', height: '3rem' }}></div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="container py-5 text-center">
        <div className="glass-panel p-5">
          <h3 className="text-white mb-3">Movie Details Not Found</h3>
          <p className="text-muted">{error}</p>
          <Link to="/movies" className="btn btn-cinema-secondary">
            Back to Movies
          </Link>
        </div>
      </div>
    );
  }

  const durationHours = Math.floor(movie.duration / 60);
  const durationMins = movie.duration % 60;
  const durationStr = `${durationHours}h ${durationMins}m`;

  const formattedDate = new Date(movie.releaseDate).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div>
      {/* Movie Backdrop Hero */}
      <div
        className="position-relative py-5"
        style={{
          backgroundImage: `url(${movie.backdrop || movie.poster})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '440px'
        }}
      >
        <div
          className="position-absolute inset-0 w-100 h-100"
          style={{
            background: 'linear-gradient(to right, #0b0f19 35%, rgba(11, 15, 25, 0.85) 75%, rgba(11, 15, 25, 0.95) 100%)',
            top: 0,
            left: 0
          }}
        ></div>

        <div className="container position-relative z-2">
          <Link to="/movies" className="btn btn-sm btn-cinema-secondary mb-4 d-inline-flex align-items-center gap-2">
            <FaArrowLeft size={12} /> Back to Movies
          </Link>

          <div className="row g-4 align-items-center">
            {/* Poster */}
            <div className="col-md-4 col-lg-3 text-center text-md-start">
              <img
                src={movie.poster}
                alt={movie.title}
                className="img-fluid rounded-3 shadow-lg border border-secondary border-opacity-50"
                style={{ maxHeight: '420px', width: '100%', objectFit: 'cover' }}
              />
            </div>

            {/* Main Info */}
            <div className="col-md-8 col-lg-9">
              <div className="d-flex flex-wrap gap-2 align-items-center mb-2">
                <span className="badge bg-danger">{movie.status === 'now-showing' ? 'NOW SHOWING' : 'COMING SOON'}</span>
                <span className="badge bg-dark border border-secondary">{movie.certification}</span>
                <span className="badge bg-secondary">{movie.language}</span>
                {movie.rating > 0 && (
                  <span className="badge bg-warning text-dark fw-bold d-flex align-items-center gap-1">
                    <FaStar size={12} /> {movie.rating.toFixed(1)} / 10
                  </span>
                )}
              </div>

              <h1 className="display-4 fw-black text-white mb-2">{movie.title}</h1>

              {/* Genre Pills */}
              <div className="d-flex flex-wrap gap-2 mb-3">
                {movie.genre?.map((g, idx) => (
                  <span key={idx} className="badge bg-primary bg-opacity-25 text-primary border border-primary border-opacity-25 py-2 px-3">
                    {g}
                  </span>
                ))}
              </div>

              {/* Meta Stats */}
              <div className="d-flex flex-wrap gap-4 text-light small mb-4 py-2 border-top border-bottom border-secondary border-opacity-25">
                <div className="d-flex align-items-center gap-2">
                  <FaClock className="text-danger" />
                  <span>{durationStr}</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <FaCalendarAlt className="text-warning" />
                  <span>{formattedDate}</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <FaLanguage className="text-info" />
                  <span>{movie.language} (Subtitles Available)</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="d-flex flex-wrap gap-3">
                {movie.status === 'now-showing' ? (
                  <Link
                    to={`/showtimes/${movie._id}`}
                    className="btn btn-cinema-primary d-flex align-items-center gap-2 px-4 py-2"
                  >
                    <FaTicketAlt size={16} />
                    <span>Book Tickets in {selectedCity}</span>
                  </Link>
                ) : (
                  <button className="btn btn-outline-warning px-4 py-2" disabled>
                    Coming Soon ({formattedDate})
                  </button>
                )}

                {movie.trailerUrl && (
                  <button
                    className="btn btn-cinema-secondary d-flex align-items-center gap-2 px-4 py-2"
                    onClick={() => setTrailerOpen(true)}
                  >
                    <FaPlay size={13} className="text-danger" />
                    <span>Watch Trailer</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Details & Cast Section */}
      <div className="container py-5">
        <div className="row g-4">
          <div className="col-lg-8">
            {/* Synopsis */}
            <div className="glass-panel p-4 mb-4">
              <h4 className="fw-bold text-white mb-3">About the Movie</h4>
              <p className="text-light text-opacity-80 lead" style={{ fontSize: '1.05rem', lineHeight: '1.7' }}>
                {movie.description}
              </p>
            </div>

            {/* Cast & Crew */}
            <div className="glass-panel p-4 mb-4">
              <h4 className="fw-bold text-white mb-3 d-flex align-items-center gap-2">
                <FaUsers className="text-danger" />
                <span>Cast & Star Cast</span>
              </h4>

              <div className="row g-3">
                {movie.cast && movie.cast.length > 0 ? (
                  movie.cast.map((actor, idx) => (
                    <div key={idx} className="col-6 col-sm-4 col-md-3">
                      <div className="p-3 rounded bg-dark border border-secondary border-opacity-25 text-center">
                        <div
                          className="rounded-circle mx-auto mb-2 d-flex align-items-center justify-content-center text-white fw-bold"
                          style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg, #ef4444, #8b5cf6)' }}
                        >
                          {actor.charAt(0)}
                        </div>
                        <div className="fw-semibold text-white small text-truncate">{actor}</div>
                        <small className="text-muted" style={{ fontSize: '0.75rem' }}>Actor</small>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted">Cast information not listed.</p>
                )}
              </div>

              {/* Director */}
              <div className="mt-4 pt-3 border-top border-secondary border-opacity-25 d-flex align-items-center gap-3">
                <FaUserTie className="text-primary" size={24} />
                <div>
                  <div className="small text-muted">Directed By</div>
                  <div className="fw-bold text-white fs-6">{movie.director || 'N/A'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right sidebar quick cinema check */}
          <div className="col-lg-4">
            <div className="glass-panel p-4 sticky-top" style={{ top: '90px' }}>
              <h5 className="fw-bold text-white mb-3 d-flex align-items-center gap-2">
                <FaMapMarkerAlt className="text-danger" />
                <span>Cinemas in {selectedCity}</span>
              </h5>
              <p className="text-muted small mb-3">
                Experience this movie in IMAX, Dolby Atmos 4K, and luxury recliners at top theatres in {selectedCity}.
              </p>

              {movie.status === 'now-showing' ? (
                <Link
                  to={`/showtimes/${movie._id}`}
                  className="btn btn-cinema-primary w-100 py-3 text-center fw-bold d-flex align-items-center justify-content-center gap-2"
                >
                  <FaTicketAlt /> Select Cinema & Showtimes
                </Link>
              ) : (
                <div className="alert alert-warning bg-warning bg-opacity-10 border-warning border-opacity-25 text-warning small mb-0">
                  Tickets will open closer to release on {formattedDate}.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Trailer Modal */}
      <TrailerModal
        isOpen={trailerOpen}
        onClose={() => setTrailerOpen(false)}
        trailerUrl={movie.trailerUrl}
        title={movie.title}
      />
    </div>
  );
};

export default MovieDetails;

