import React from 'react';
import { Link } from 'react-router-dom';
import { FaFilm, FaHome } from 'react-icons/fa';

const NotFound = () => {
  return (
    <div className="container py-5 text-center">
      <div className="glass-panel p-5 mx-auto" style={{ maxWidth: '500px' }}>
        <FaFilm className="text-danger mb-3" size={54} />
        <h1 className="display-4 fw-black text-white">404</h1>
        <h4 className="fw-bold text-white mb-2">Screen Not Found</h4>
        <p className="text-muted small mb-4">
          The page or cinema showtime you are looking for has concluded or does not exist.
        </p>
        <Link to="/" className="btn btn-cinema-primary d-inline-flex align-items-center gap-2">
          <FaHome /> Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;

