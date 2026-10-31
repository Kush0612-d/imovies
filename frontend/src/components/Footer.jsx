import React from 'react';
import { Link } from 'react-router-dom';
import { FaFilm, FaHeart, FaGithub, FaShieldAlt } from 'react-icons/fa';
import { useCity } from '../context/CityContext';

const Footer = () => {
  const { availableCities, changeCity } = useCity();

  return (
    <footer className="mt-auto border-top border-secondary border-opacity-25 pt-5 pb-4 bg-dark bg-opacity-75">
      <div className="container">
        <div className="row g-4 justify-content-between">
          {/* Brand info */}
          <div className="col-lg-4 col-md-6">
            <Link to="/" className="brand-logo text-decoration-none mb-3 d-inline-block">
              <FaFilm className="text-danger me-1" />
              <span>IMovies</span>
              <span className="brand-badge">PRO</span>
            </Link>
            <p className="text-muted small pe-lg-4 mb-3">
              <strong>IMovies – Movie Ticket Booking Made Simple.</strong> Explore trending movies, discover
              upcoming releases, check cinema showtimes in your city, select your favorite seats, and book digital tickets seamlessly.
            </p>
            <div className="d-flex align-items-center gap-2 text-muted small">
              <span className="badge bg-secondary bg-opacity-50">MERN Stack 2026</span>
              <span className="badge bg-danger bg-opacity-25 text-danger">React + Express + MongoDB</span>
            </div>
          </div>

          {/* Quick links */}
          <div className="col-lg-2 col-md-6 col-6">
            <h6 className="text-white fw-bold mb-3">Quick Links</h6>
            <ul className="list-unstyled d-flex flex-column gap-2 small">
              <li>
                <Link to="/" className="text-muted text-decoration-none hover-white">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/movies" className="text-muted text-decoration-none hover-white">
                  Now Showing
                </Link>
              </li>
              <li>
                <Link to="/coming-soon" className="text-muted text-decoration-none hover-white">
                  Coming Soon
                </Link>
              </li>
              <li>
                <Link to="/my-bookings" className="text-muted text-decoration-none hover-white">
                  My Bookings
                </Link>
              </li>
              <li>
                <Link to="/admin" className="text-muted text-decoration-none hover-white">
                  Admin Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Cities */}
          <div className="col-lg-3 col-md-6 col-6">
            <h6 className="text-white fw-bold mb-3">Popular Cinemas</h6>
            <div className="d-flex flex-wrap gap-2">
              {availableCities.map((city) => (
                <button
                  key={city}
                  onClick={() => changeCity(city)}
                  className="btn btn-sm btn-outline-secondary py-0 px-2"
                  style={{ fontSize: '0.8rem' }}
                >
                  {city}
                </button>
              ))}
            </div>
            <p className="text-muted small mt-3">
              Serving premier multiplexes including PVR INOX, Cinepolis, and IMAX screens across India.
            </p>
          </div>

          {/* Security & Academic Badge */}
          <div className="col-lg-3 col-md-6">
            <h6 className="text-white fw-bold mb-3">Security & Quality</h6>
            <ul className="list-unstyled text-muted small d-flex flex-column gap-2 mb-3">
              <li>✓ JWT & Bcrypt Authentication</li>
              <li>✓ Real-time Seat Locking</li>
              <li>✓ Verified Digital QR Tickets</li>
              <li>✓ Atomic Double-Booking Shield</li>
            </ul>
            <div className="p-2 rounded bg-black bg-opacity-40 border border-secondary border-opacity-25 small text-muted">
              🔒 Academic Full-Stack Web Application Project
            </div>
          </div>
        </div>

        <hr className="border-secondary border-opacity-25 my-4" />

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2 small text-muted">
          <div>
            &copy; {new Date().getFullYear()} IMovies. All cinema trademarks belong to their respective owners.
          </div>
          <div>
            Movie Ticket Booking Made Simple
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

