import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaFilm, FaUser, FaEnvelope, FaPhone, FaLock, FaExclamationTriangle, FaUserPlus } from 'react-icons/fa';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { name, email, phone, password, confirmPassword } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !phone || !password || !confirmPassword) {
      setError('Please fill out all registration fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await register({ name, email, phone, password, confirmPassword });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-9 col-lg-6">
          <div className="glass-panel p-4 p-md-5 shadow-lg">
            {/* Header */}
            <div className="text-center mb-4">
              <div className="brand-logo justify-content-center mb-2" style={{ fontSize: '2rem' }}>
                <FaFilm className="text-danger" />
                <span>IMovies</span>
              </div>
              <h4 className="fw-bold text-white mb-1">Create an Account</h4>
              <p className="text-muted small">Join IMovies for fast seat reservations and digital QR passes</p>
            </div>

            {error && (
              <div className="alert alert-danger bg-danger bg-opacity-20 border-danger text-light small d-flex align-items-center gap-2 mb-3">
                <FaExclamationTriangle className="text-danger flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label text-muted small fw-semibold">Full Name</label>
                <div className="input-group">
                  <span className="input-group-text bg-dark border-secondary border-opacity-25 text-muted">
                    <FaUser />
                  </span>
                  <input
                    type="text"
                    name="name"
                    className="form-control form-control-cinema"
                    placeholder="Enter full name"
                    value={name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="row g-2 mb-3">
                <div className="col-12 col-md-6">
                  <label className="form-label text-muted small fw-semibold">Email Address</label>
                  <div className="input-group">
                    <span className="input-group-text bg-dark border-secondary border-opacity-25 text-muted">
                      <FaEnvelope />
                    </span>
                    <input
                      type="email"
                      name="email"
                      className="form-control form-control-cinema"
                      placeholder="name@example.com"
                      value={email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label text-muted small fw-semibold">Phone Number</label>
                  <div className="input-group">
                    <span className="input-group-text bg-dark border-secondary border-opacity-25 text-muted">
                      <FaPhone />
                    </span>
                    <input
                      type="tel"
                      name="phone"
                      className="form-control form-control-cinema"
                      placeholder="9876543210"
                      value={phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="row g-2 mb-4">
                <div className="col-12 col-md-6">
                  <label className="form-label text-muted small fw-semibold">Password</label>
                  <div className="input-group">
                    <span className="input-group-text bg-dark border-secondary border-opacity-25 text-muted">
                      <FaLock />
                    </span>
                    <input
                      type="password"
                      name="password"
                      className="form-control form-control-cinema"
                      placeholder="At least 6 chars"
                      value={password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label text-muted small fw-semibold">Confirm Password</label>
                  <div className="input-group">
                    <span className="input-group-text bg-dark border-secondary border-opacity-25 text-muted">
                      <FaLock />
                    </span>
                    <input
                      type="password"
                      name="confirmPassword"
                      className="form-control form-control-cinema"
                      placeholder="Repeat password"
                      value={confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-cinema-primary w-100 py-2 fw-bold d-flex align-items-center justify-content-center gap-2 mb-3"
                disabled={loading}
              >
                {loading ? (
                  <div className="spinner-border spinner-border-sm" role="status"></div>
                ) : (
                  <>
                    <FaUserPlus /> Complete Registration
                  </>
                )}
              </button>
            </form>

            <div className="text-center text-muted small">
              Already have an account?{' '}
              <Link to="/login" className="text-danger text-decoration-none fw-semibold">
                Sign In Instead
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

