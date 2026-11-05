import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCity } from '../context/CityContext';
import {
  FaFilm,
  FaMapMarkerAlt,
  FaUserCircle,
  FaTicketAlt,
  FaSignOutAlt,
  FaShieldAlt,
  FaBars,
  FaTimes
} from 'react-icons/fa';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { selectedCity, changeCity, availableCities } = useCity();
  const navigate = useNavigate();
  const [navOpen, setNavOpen] = useState(false);
  const [cityDropdown, setCityDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light navbar-imovies sticky-top py-2 py-lg-3">
      <div className="container">
        {/* Brand Logo */}
        <Link to="/" className="navbar-brand brand-logo text-decoration-none">
          <FaFilm className="text-danger me-1" />
          <span>IMovies</span>
          <span className="brand-badge d-none d-sm-inline">PRO</span>
        </Link>

        {/* City Selector Button (Mobile & Desktop) */}
        <div className="position-relative me-auto ms-2 ms-md-4">
          <button
            className="btn btn-sm btn-cinema-secondary d-flex align-items-center gap-2 py-1 px-2 px-md-3"
            type="button"
            onClick={() => setCityDropdown(!cityDropdown)}
          >
            <FaMapMarkerAlt className="text-danger" />
            <span className="fw-semibold">{selectedCity}</span>
            <small className="text-muted ms-1">▼</small>
          </button>

          {cityDropdown && (
            <div
              className="position-absolute mt-2 py-2 shadow-lg glass-panel z-3"
              style={{ minWidth: '180px', top: '100%', left: 0 }}
            >
              <div className="px-3 py-1 text-muted small fw-bold text-uppercase border-bottom border-light-subtle mb-1">
                Select City
              </div>
              {availableCities.map((city) => (
                <button
                  key={city}
                  className={`dropdown-item px-3 py-2 text-start w-100 border-0 bg-transparent d-flex justify-content-between align-items-center ${
                    selectedCity === city ? 'text-primary fw-bold' : 'text-dark'
                  }`}
                  onClick={() => {
                    changeCity(city);
                    setCityDropdown(false);
                  }}
                >
                  <span>{city}</span>
                  {selectedCity === city && <span className="text-danger fw-bold">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          className="navbar-toggler border-0 p-1"
          type="button"
          onClick={() => setNavOpen(!navOpen)}
          aria-label="Toggle navigation"
        >
          {navOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
        </button>

        {/* Nav Links & User Section */}
        <div className={`collapse navbar-collapse ${navOpen ? 'show mt-3 mt-lg-0' : ''}`}>
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0 gap-lg-1">
            <li className="nav-item">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `nav-link px-3 ${isActive ? 'active' : ''}`
                }
                onClick={() => setNavOpen(false)}
                end
              >
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/movies"
                className={({ isActive }) =>
                  `nav-link px-3 ${isActive ? 'active' : ''}`
                }
                onClick={() => setNavOpen(false)}
              >
                Movies
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/coming-soon"
                className={({ isActive }) =>
                  `nav-link px-3 ${isActive ? 'active' : ''}`
                }
                onClick={() => setNavOpen(false)}
              >
                Coming Soon
              </NavLink>
            </li>
            {isAuthenticated && (
              <li className="nav-item">
                <NavLink
                  to="/my-bookings"
                  className={({ isActive }) =>
                    `nav-link px-3 ${isActive ? 'active' : ''}`
                  }
                  onClick={() => setNavOpen(false)}
                >
                  <FaTicketAlt className="me-1 text-danger" />
                  My Bookings
                </NavLink>
              </li>
            )}
            {isAdmin && (
              <li className="nav-item">
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    `nav-link px-3 ${isActive ? 'active text-primary fw-bold' : ''}`
                  }
                  onClick={() => setNavOpen(false)}
                >
                  <FaShieldAlt className="me-1 text-primary" />
                  Admin
                </NavLink>
              </li>
            )}
          </ul>

          {/* Right Profile / Auth Buttons */}
          <div className="d-flex align-items-center gap-2 mt-2 mt-lg-0">
            {isAuthenticated ? (
              <div className="dropdown">
                <button
                  className="btn btn-cinema-secondary dropdown-toggle d-flex align-items-center gap-2 py-1 px-3"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  id="userDropdown"
                  onClick={(e) => {
                    const el = e.currentTarget.nextElementSibling;
                    if (el) el.classList.toggle('show');
                  }}
                >
                  <FaUserCircle className="text-primary" size={18} />
                  <span className="fw-semibold text-truncate" style={{ maxWidth: '120px' }}>
                    {user?.name?.split(' ')[0] || 'Account'}
                  </span>
                </button>
                <ul
                  className="dropdown-menu dropdown-menu-end shadow-lg glass-panel py-2"
                  aria-labelledby="userDropdown"
                >
                  <li className="px-3 py-1 border-bottom border-light-subtle mb-1">
                    <div className="fw-bold text-dark">{user?.name}</div>
                    <small className="text-muted">{user?.email}</small>
                  </li>
                  <li>
                    <Link
                      to="/profile"
                      className="dropdown-item py-2"
                      onClick={() => setNavOpen(false)}
                    >
                      <FaUserCircle className="me-2 text-primary" /> Profile & Settings
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/my-bookings"
                      className="dropdown-item py-2"
                      onClick={() => setNavOpen(false)}
                    >
                      <FaTicketAlt className="me-2 text-danger" /> My Bookings
                    </Link>
                  </li>
                  {isAdmin && (
                    <li>
                      <Link
                        to="/admin"
                        className="dropdown-item text-primary py-2"
                        onClick={() => setNavOpen(false)}
                      >
                        <FaShieldAlt className="me-2" /> Admin Dashboard
                      </Link>
                    </li>
                  )}
                  <li>
                    <hr className="dropdown-divider border-light-subtle my-1" />
                  </li>
                  <li>
                    <button
                      className="dropdown-item text-danger py-2"
                      onClick={handleLogout}
                    >
                      <FaSignOutAlt className="me-2" /> Sign Out
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="d-flex gap-2">
                <Link
                  to="/login"
                  className="btn btn-sm btn-cinema-secondary px-3"
                  onClick={() => setNavOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn btn-sm btn-cinema-primary px-3"
                  onClick={() => setNavOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

