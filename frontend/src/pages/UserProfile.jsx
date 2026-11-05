import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { FaUserCircle, FaEnvelope, FaPhone, FaLock, FaTicketAlt, FaShieldAlt, FaSave, FaCheckCircle } from 'react-icons/fa';

const UserProfile = () => {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (password && password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      setSuccessMsg('');

      const updateData = { name, phone };
      if (password) updateData.password = password;

      await updateProfile(updateData);
      setSuccessMsg('Profile updated successfully!');
      setPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="glass-panel p-4 p-md-5">
            <div className="d-flex align-items-center gap-3 pb-4 mb-4 border-bottom border-light-subtle">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold fs-3 shadow-sm"
                style={{ width: '64px', height: '64px', background: 'linear-gradient(135deg, #ef4444, #8b5cf6)' }}
              >
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div>
                <h4 className="fw-bold text-dark mb-0">{user?.name}</h4>
                <div className="text-muted small">{user?.email}</div>
                <div className="d-flex gap-2 mt-1">
                  <span className="badge bg-secondary">{user?.role?.toUpperCase()}</span>
                  <Link to="/my-bookings" className="badge bg-danger text-decoration-none">
                    <FaTicketAlt className="me-1" /> View Bookings
                  </Link>
                </div>
              </div>
            </div>

            {successMsg && (
              <div className="alert alert-success bg-success bg-opacity-20 border-success text-dark small d-flex align-items-center gap-2 mb-3">
                <FaCheckCircle className="text-success" /> {successMsg}
              </div>
            )}

            {errorMsg && (
              <div className="alert alert-danger bg-danger bg-opacity-20 border-danger text-dark small mb-3">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleUpdate}>
              <h6 className="fw-bold text-dark mb-3">Personal Information</h6>

              <div className="mb-3">
                <label className="form-label small text-muted">Full Name</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-light-subtle text-muted">
                    <FaUserCircle />
                  </span>
                  <input
                    type="text"
                    className="form-control form-control-cinema"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small text-muted">Email Address (Read-only)</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-light-subtle text-muted">
                    <FaEnvelope />
                  </span>
                  <input
                    type="email"
                    className="form-control form-control-cinema"
                    value={user?.email || ''}
                    disabled
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label small text-muted">Phone Number</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-light-subtle text-muted">
                    <FaPhone />
                  </span>
                  <input
                    type="tel"
                    className="form-control form-control-cinema"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              <h6 className="fw-bold text-dark mb-3 pt-2 border-top border-light-subtle">
                Change Password (Leave blank to keep existing)
              </h6>

              <div className="row g-2 mb-4">
                <div className="col-12 col-md-6">
                  <label className="form-label small text-muted">New Password</label>
                  <input
                    type="password"
                    className="form-control form-control-cinema"
                    placeholder="New password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label small text-muted">Confirm New Password</label>
                  <input
                    type="password"
                    className="form-control form-control-cinema"
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-cinema-primary w-100 py-2 d-flex align-items-center justify-content-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <div className="spinner-border spinner-border-sm" role="status"></div>
                ) : (
                  <>
                    <FaSave /> Save Changes
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;

