import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import MovieCard from '../components/MovieCard';
import TrailerModal from '../components/TrailerModal';
import { useCity } from '../context/CityContext';
import {
  FaPlay,
  FaTicketAlt,
  FaFire,
  FaCalendarAlt,
  FaStar,
  FaFilm,
  FaChevronRight,
  FaMapMarkerAlt
} from 'react-icons/fa';

const Home = () => {
  const { selectedCity, changeCity, availableCities } = useCity();

  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [nowShowing, setNowShowing] = useState([]);
  const [comingSoon, setComingSoon] = useState([]);
  const [trending, setTrending] = useState([]);
  const [popular, setPopular] = useState([]);
  const [loading, setLoading] = useState(true);

  // Trailer modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTrailer, setActiveTrailer] = useState({ url: '', title: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [nowRes, soonRes, trendRes, popRes] = await Promise.all([
          API.get('/movies/now-showing'),
          API.get('/movies/coming-soon'),
          API.get('/movies/trending'),
          API.get('/movies/popular')
        ]);

        const nowMovies = nowRes.data.movies || [];
        setNowShowing(nowMovies);
        setComingSoon(soonRes.data.movies || []);
        setTrending(trendRes.data.movies || []);
        setPopular(popRes.data.movies || []);

        if (nowMovies.length > 0) {
          setFeaturedMovie(nowMovies[0]);
        }
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const openTrailer = (url, title) => {
    setActiveTrailer({ url, title });
    setModalOpen(true);
  };

  if (loading) {
    return (
      <div
        className="d-flex flex-column justify-content-center align-items-center"
        style={{ minHeight: '70vh' }}
      >
        <div className="spinner-border text-danger mb-3" style={{ width: '3rem', height: '3rem' }}></div>
        <p className="text-muted fw-semibold">Loading cinema experience in {selectedCity}...</p>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* City Switcher Banner */}
      <div className="glass-panel p-3 mb-4 d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
        <div className="d-flex align-items-center gap-2">
          <FaMapMarkerAlt className="text-danger" size={20} />
          <div>
            <span className="text-dark fw-bold">Currently exploring cinemas in </span>
            <span className="badge bg-danger fs-6">{selectedCity}</span>
          </div>
        </div>
        <div className="d-flex flex-wrap gap-2">
          {availableCities.map((city) => (
            <button
              key={city}
              className={`city-pill ${selectedCity === city ? 'active' : ''}`}
              onClick={() => changeCity(city)}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Hero Section */}
      {featuredMovie && (
        <div
          className="hero-banner mb-5 shadow-lg"
          style={{
            backgroundImage: `url(${featuredMovie.backdrop || featuredMovie.poster})`
          }}
        >
          <div className="hero-overlay"></div>
          <div className="position-relative z-2 p-4 p-md-5 w-100">
            <div className="row align-items-end">
              <div className="col-lg-8">
                <div className="d-flex flex-wrap gap-2 mb-2 align-items-center">
                  <span className="badge bg-danger">FEATURED BLOCKBUSTER</span>
                  <span className="badge bg-secondary">{featuredMovie.language}</span>
                  <span className="badge bg-dark border border-secondary">{featuredMovie.certification}</span>
                  {featuredMovie.rating > 0 && (
                    <span className="badge bg-warning text-dark fw-bold d-flex align-items-center gap-1">
                      <FaStar size={11} /> {featuredMovie.rating.toFixed(1)}
                    </span>
                  )}
                </div>

                <h1 className="display-4 fw-black text-white mb-2">{featuredMovie.title}</h1>

                <p className="text-light text-opacity-75 lead mb-3 d-none d-md-block" style={{ maxWidth: '650px' }}>
                  {featuredMovie.description.length > 200
                    ? `${featuredMovie.description.slice(0, 200)}...`
                    : featuredMovie.description}
                </p>

                <div className="d-flex flex-wrap gap-3 mt-4">
                  {featuredMovie.trailerUrl && (
                    <button
                      className="btn btn-cinema-secondary d-flex align-items-center gap-2 px-4 py-2"
                      onClick={() => openTrailer(featuredMovie.trailerUrl, featuredMovie.title)}
                    >
                      <FaPlay size={14} className="text-danger" />
                      <span>Watch Trailer</span>
                    </button>
                  )}
                  <Link
                    to={`/showtimes/${featuredMovie._id}`}
                    className="btn btn-cinema-primary d-flex align-items-center gap-2 px-4 py-2"
                  >
                    <FaTicketAlt size={16} />
                    <span>Book Tickets</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Now Showing Section */}
      <section className="mb-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h3 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
              <span className="badge-now-showing badge p-2">NOW SHOWING</span>
              <span>In Cinemas</span>
            </h3>
            <small className="text-muted">Currently playing in {selectedCity} multiplexes</small>
          </div>
          <Link
            to="/movies?status=now-showing"
            className="text-danger text-decoration-none fw-semibold d-flex align-items-center gap-1"
          >
            <span>View All</span>
            <FaChevronRight size={12} />
          </Link>
        </div>

        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
          {nowShowing.slice(0, 8).map((movie) => (
            <div key={movie._id} className="col">
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>
      </section>

      {/* Trending Movies Section */}
      {trending.length > 0 && (
        <section className="mb-5">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h3 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                <FaFire className="text-danger" />
                <span>Trending This Week</span>
              </h3>
              <small className="text-muted">Most booked and highest rated movies</small>
            </div>
            <Link
              to="/movies?sort=popularity"
              className="text-danger text-decoration-none fw-semibold d-flex align-items-center gap-1"
            >
              <span>Explore All</span>
              <FaChevronRight size={12} />
            </Link>
          </div>

          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
            {trending.slice(0, 4).map((movie) => (
              <div key={movie._id} className="col">
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Coming Soon Section */}
      <section className="mb-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h3 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
              <FaCalendarAlt className="text-warning" />
              <span>Coming Soon</span>
            </h3>
            <small className="text-muted">Upcoming theatrical releases</small>
          </div>
          <Link
            to="/coming-soon"
            className="text-warning text-decoration-none fw-semibold d-flex align-items-center gap-1"
          >
            <span>View All Releases</span>
            <FaChevronRight size={12} />
          </Link>
        </div>

        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
          {comingSoon.slice(0, 4).map((movie) => (
            <div key={movie._id} className="col">
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>
      </section>

      {/* Popular Movies Section */}
      {popular.length > 0 && (
        <section className="mb-5">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h3 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                <FaStar className="text-warning" />
                <span>Top Rated & Popular</span>
              </h3>
              <small className="text-muted">Audience and critically acclaimed blockbusters</small>
            </div>
            <Link
              to="/movies?sort=rating"
              className="text-danger text-decoration-none fw-semibold d-flex align-items-center gap-1"
            >
              <span>View All</span>
              <FaChevronRight size={12} />
            </Link>
          </div>

          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
            {popular.slice(0, 4).map((movie) => (
              <div key={movie._id} className="col">
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Cinema Experience Banner */}
      <div className="glass-panel p-4 p-md-5 my-5 text-center position-relative overflow-hidden">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <FaFilm className="text-danger mb-3" size={40} />
            <h2 className="fw-bold text-dark mb-2">Cinema Experience Elevated</h2>
            <p className="text-muted mb-4">
              Select your favorite cinema in <strong>{selectedCity}</strong>, choose your preferred recliner
              or regular seats, and get instant digital tickets with secure QR validation right on your device.
            </p>
            <div className="d-flex justify-content-center gap-3">
              <Link to="/movies" className="btn btn-cinema-primary px-4 py-2">
                Explore Movies Now
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Trailer Modal */}
      <TrailerModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        trailerUrl={activeTrailer.url}
        title={activeTrailer.title}
      />
    </div>
  );
};

export default Home;

