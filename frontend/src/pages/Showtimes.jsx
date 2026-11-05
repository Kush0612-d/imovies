import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useCity } from '../context/CityContext';
import {
  FaFilm,
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaChevronRight,
  FaTicketAlt,
  FaArrowLeft
} from 'react-icons/fa';

const Showtimes = () => {
  const { movieId } = useParams();
  const { selectedCity, changeCity, availableCities } = useCity();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [cinemasWithShows, setCinemasWithShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [datesList, setDatesList] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');

  // 1. Generate dates list: Today, Tomorrow, and next 5 days
  useEffect(() => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 6; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const isoStr = d.toISOString().slice(0, 10);
      const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' });
      const monthDay = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dates.push({
        iso: isoStr,
        dayName,
        monthDay
      });
    }
    setDatesList(dates);
    setSelectedDate(dates[0].iso);
  }, []);

  // 2. Fetch Movie details
  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const { data } = await API.get(`/movies/${movieId}`);
        setMovie(data.movie);
      } catch (err) {
        console.error('Error fetching movie:', err);
      }
    };
    fetchMovie();
  }, [movieId]);

  // 3. Fetch shows dynamically from MongoDB for selected movie, city, and date
  useEffect(() => {
    if (!selectedDate) return;

    const fetchShows = async () => {
      try {
        setLoading(true);
        const { data } = await API.get(`/shows/movie/${movieId}`, {
          params: {
            date: selectedDate,
            city: selectedCity
          }
        });
        setCinemasWithShows(data.cinemas || []);
      } catch (err) {
        console.error('Error fetching shows:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchShows();
  }, [movieId, selectedCity, selectedDate]);

  return (
    <div className="container py-4">
      {/* Back button & Breadcrumb */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <Link to={`/movies/${movieId}`} className="btn btn-sm btn-cinema-secondary d-flex align-items-center gap-2">
          <FaArrowLeft size={12} /> Back to Movie Details
        </Link>
        <div className="small text-muted d-none d-sm-block">
          Step 1 of 3: Choose Cinema & Showtime
        </div>
      </div>

      {/* Movie Mini Header */}
      {movie && (
        <div className="glass-panel p-3 mb-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div className="d-flex align-items-center gap-3">
            <img
              src={movie.poster}
              alt={movie.title}
              className="rounded"
              style={{ width: '50px', height: '70px', objectFit: 'cover' }}
            />
            <div>
              <h4 className="fw-bold text-dark mb-1">{movie.title}</h4>
              <div className="d-flex gap-2 text-muted small">
                <span className="badge bg-secondary">{movie.language}</span>
                <span className="badge bg-light text-secondary border">{movie.certification}</span>
                <span>{Math.floor(movie.duration / 60)}h {movie.duration % 60}m</span>
                <span>• {movie.genre?.join(', ')}</span>
              </div>
            </div>
          </div>

          {/* City Indicator / Selector */}
          <div className="d-flex align-items-center gap-2">
            <span className="text-muted small">City:</span>
            <select
              className="form-select form-control-cinema form-select-sm"
              value={selectedCity}
              onChange={(e) => changeCity(e.target.value)}
              style={{ width: '150px' }}
            >
              {availableCities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Date Selector Navigation Bar */}
      <div className="glass-panel p-3 mb-4">
        <div className="text-muted small fw-bold text-uppercase mb-2 d-flex align-items-center gap-2">
          <FaCalendarAlt className="text-danger" />
          <span>Select Show Date</span>
        </div>
        <div className="d-flex gap-2 overflow-x-auto pb-2">
          {datesList.map((d) => {
            const isSelected = selectedDate === d.iso;
            return (
              <button
                key={d.iso}
                onClick={() => setSelectedDate(d.iso)}
                className={`btn text-center px-3 py-2 flex-shrink-0 transition-all ${
                  isSelected
                    ? 'btn-cinema-primary shadow'
                    : 'btn-cinema-secondary text-dark'
                }`}
                style={{ minWidth: '95px' }}
              >
                <div className="small fw-bold">{d.dayName}</div>
                <div className="fw-black fs-6">{d.monthDay}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Cinemas & Showtimes List */}
      <div>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
            <FaMapMarkerAlt className="text-danger" />
            <span>Cinemas in {selectedCity}</span>
          </h5>
          <small className="text-muted">{cinemasWithShows.length} Cinemas Available</small>
        </div>

        {loading ? (
          <div className="d-flex justify-content-center py-5">
            <div className="spinner-border text-danger"></div>
          </div>
        ) : cinemasWithShows.length > 0 ? (
          <div className="d-flex flex-column gap-3">
            {cinemasWithShows.map(({ cinema, shows }) => (
              <div key={cinema._id} className="glass-panel p-4 shadow-sm">
                <div className="row g-3 align-items-center">
                  {/* Cinema Info */}
                  <div className="col-lg-4 col-md-5">
                    <h5 className="fw-bold text-dark mb-1">{cinema.name}</h5>
                    <p className="text-muted small mb-2">{cinema.address}</p>
                    {/* Facilities Tags */}
                    <div className="d-flex flex-wrap gap-1">
                      {cinema.facilities?.slice(0, 3).map((f, i) => (
                        <span key={i} className="badge bg-light text-secondary border" style={{ fontSize: '0.7rem' }}>
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Showtimes Pills */}
                  <div className="col-lg-8 col-md-7">
                    <div className="d-flex flex-wrap gap-2">
                      {shows.map((show) => {
                        return (
                          <button
                            key={show._id}
                            className="btn btn-cinema-secondary d-flex flex-column text-start p-2 px-3 hover-scale"
                            onClick={() => navigate(`/seat-selection/${show._id}`)}
                            style={{ minWidth: '130px' }}
                          >
                            <span className="fw-bold text-success fs-6 d-flex align-items-center gap-1">
                              <FaClock size={12} /> {show.startTime}
                            </span>
                            <small className="text-secondary text-truncate" style={{ fontSize: '0.75rem', maxWidth: '140px' }}>
                              {show.screen?.screenName || 'Audi 1'}
                            </small>
                            <div className="d-flex justify-content-between align-items-center mt-1 border-top border-light-subtle pt-1 w-100">
                              <span className="text-warning fw-semibold" style={{ fontSize: '0.72rem' }}>
                                ₹{show.ticketPrice?.regular || 220}+
                              </span>
                              <span className="text-muted" style={{ fontSize: '0.68rem' }}>
                                {show.availableSeatsCount} seats left
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-panel text-center py-5">
            <FaFilm className="text-muted mb-3" size={40} />
            <h5 className="text-dark">No shows scheduled for {selectedDate} in {selectedCity}</h5>
            <p className="text-muted small mb-3">
              Try selecting another date or check other nearby cities.
            </p>
            <div className="d-flex justify-content-center gap-2">
              {availableCities.filter(c => c !== selectedCity).slice(0, 3).map(city => (
                <button
                  key={city}
                  className="btn btn-sm btn-cinema-secondary"
                  onClick={() => changeCity(city)}
                >
                  Switch to {city}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Showtimes;

