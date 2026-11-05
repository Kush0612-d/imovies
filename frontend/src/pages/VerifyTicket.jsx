import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api';
import { FaCheckCircle, FaTimesCircle, FaShieldAlt, FaTicketAlt, FaFilm, FaCalendarAlt, FaClock } from 'react-icons/fa';

const VerifyTicket = () => {
  const { bookingId } = useParams();

  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verify = async () => {
      try {
        setLoading(true);
        const { data } = await API.get(`/bookings/verify/${bookingId}`);
        setVerification(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Ticket verification failed or invalid reference.');
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [bookingId]);

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="glass-panel p-4 p-md-5 text-center shadow-lg">
            <FaShieldAlt className="text-primary mb-3" size={48} />
            <h3 className="fw-bold text-dark mb-2">IMovies Ticket Verification</h3>
            <p className="text-muted small mb-4">Official Gate Entry Pass Authentication Portal</p>

            {loading ? (
              <div className="py-4">
                <div className="spinner-border text-primary"></div>
                <div className="text-muted small mt-2">Authenticating QR Code with IMovies Security Server...</div>
              </div>
            ) : error ? (
              <div className="alert alert-danger bg-danger bg-opacity-20 border-danger text-dark p-4">
                <FaTimesCircle className="text-danger mb-2" size={36} />
                <h5 className="fw-bold text-dark mb-1">INVALID PASS / BOOKING NOT FOUND</h5>
                <p className="small mb-0">{error}</p>
              </div>
            ) : verification?.valid ? (
              <div>
                <div className="alert alert-success bg-success bg-opacity-20 border-success text-dark p-4 mb-4">
                  <FaCheckCircle className="text-success mb-2" size={42} />
                  <h4 className="fw-bold text-dark mb-1">AUTHENTIC TICKET VERIFIED</h4>
                  <div className="badge bg-success">STATUS: CONFIRMED ENTRY ALLOWED</div>
                </div>

                <div className="text-start p-3 rounded bg-light border border-light-subtle mb-4">
                  <div className="d-flex justify-content-between pb-2 border-bottom border-light-subtle mb-2">
                    <span className="text-muted small">Booking ID</span>
                    <span className="fw-bold font-monospace text-danger">{verification.booking?.bookingId}</span>
                  </div>
                  <div className="d-flex justify-content-between pb-2 border-bottom border-light-subtle mb-2">
                    <span className="text-muted small">Movie Title</span>
                    <span className="fw-bold text-dark">{verification.booking?.movie}</span>
                  </div>
                  <div className="d-flex justify-content-between pb-2 border-bottom border-light-subtle mb-2">
                    <span className="text-muted small">Cinema Multiplex</span>
                    <span className="fw-bold text-dark">{verification.booking?.cinema}</span>
                  </div>
                  <div className="d-flex justify-content-between pb-2 border-bottom border-light-subtle mb-2">
                    <span className="text-muted small">Auditorium / Screen</span>
                    <span className="text-dark">{verification.booking?.screen}</span>
                  </div>
                  <div className="d-flex justify-content-between pb-2 border-bottom border-light-subtle mb-2">
                    <span className="text-muted small">Show Date & Time</span>
                    <span className="text-dark">{verification.booking?.showDate} at {verification.booking?.startTime}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted small">Reserved Seats</span>
                    <span className="fw-bold text-danger">{verification.booking?.seats?.join(', ')}</span>
                  </div>
                </div>

                <Link to="/" className="btn btn-cinema-secondary">
                  Back to IMovies Home
                </Link>
              </div>
            ) : (
              <div className="alert alert-warning bg-warning bg-opacity-20 border-warning text-dark p-4">
                <FaTimesCircle className="text-warning mb-2" size={36} />
                <h5 className="fw-bold text-dark mb-1">TICKET CANCELLED OR EXPIRED</h5>
                <p className="small mb-0">This booking has been cancelled and is no longer valid for admission.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyTicket;

