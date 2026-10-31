import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaFilm, FaLock, FaEnvelope, FaExclamationTriangle, FaSignInAlt } from 'react-icons/fa';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Quick fill for testing
  const fillCredentials = (type) => {
    if (type === 'admin') {
      setEmail('admin@imovies.com');
      setPassword('adminpassword123');
    } else {
      setEmail('user@imovies.com');
      setPassword('userpassword123');
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-5">
          <div className="glass-panel p-4 p-md-5 shadow-lg">
            {/* Header */}
            <div className="text-center mb-4">
              <div className="brand-logo justify-content-center mb-2" style={{ fontSize: '2rem' }}>
                <FaFilm className="text-danger" />
                <span>IMovies</span>
              </div>
              <h4 className="fw-bold text-white mb-1">Welcome Back</h4>
              <p className="text-muted small">Sign in to your IMovies cinema account</p>
            </div>

            {error && (
              <div className="alert alert-danger bg-danger bg-opacity-20 border-danger text-light small d-flex align-items-center gap-2 mb-3">
                <FaExclamationTriangle className="text-danger flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label text-muted small fw-semibold">Email Address</label>
                <div className="input-group">
                  <span className="input-group-text bg-dark border-secondary border-opacity-25 text-muted">
                    <FaEnvelope />
                  </span>
                  <input
                    type="email"
                    className="form-control form-control-cinema"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="form-label text-muted small fw-semibold mb-0">Password</label>
                </div>
                <div className="input-group">
                  <span className="input-group-text bg-dark border-secondary border-opacity-25 text-muted">
                    <FaLock />
                  </span>
                  <input
                    type="password"
                    className="form-control form-control-cinema"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
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
                    <FaSignInAlt /> Sign In
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Logins for Academic Evaluators */}
            <div className="p-3 mb-4 rounded bg-dark border border-secondary border-opacity-25 text-center">
              <div className="small text-muted mb-2 fw-semibold">One-Click Demo Accounts:</div>
              <div className="d-flex justify-content-center gap-2">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-warning py-1 px-2"
                  style={{ fontSize: '0.78rem' }}
                  onClick={() => fillCredentials('admin')}
                >
                  Admin (admin@imovies.com)
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary py-1 px-2"
                  style={{ fontSize: '0.78rem' }}
                  onClick={() => fillCredentials('user')}
                >
                  User (user@imovies.com)
                </button>
              </div>
            </div>

            <div className="text-center text-muted small">
              Don't have an IMovies account?{' '}
              <Link to="/register" className="text-danger text-decoration-none fw-semibold">
                Sign Up Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

