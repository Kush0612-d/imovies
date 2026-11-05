import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import DigitalTicket from '../components/DigitalTicket';
import {
  FaTicketAlt,
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaTimesCircle,
  FaEye,
  FaExclamationTriangle,
  FaTimes
} from 'react-icons/fa';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'upcoming', 'cancelled'
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [cancelModal, setCancelModal] = useState({ open: false, bookingId: null });
  const [actionMsg, setActionMsg] = useState('');

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/bookings/my-bookings');
      setBookings(data.bookings || []);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async () => {
    if (!cancelModal.bookingId) return;

    try {
      const { data } = await API.post(`/bookings/${cancelModal.bookingId}/cancel`);
      setActionMsg(data.message || 'Booking cancelled successfully.');
      setCancelModal({ open: false, bookingId: null });
      fetchBookings();
      setTimeout(() => setActionMsg(''), 4000);
    } catch (err) {
      setActionMsg(err.response?.data?.message || 'Failed to cancel booking.');
    }
  };

  // Filter bookings
  const filteredBookings = bookings.filter((b) => {
    if (filter === 'cancelled') return b.bookingStatus === 'cancelled';
    if (filter === 'upcoming') return b.bookingStatus === 'confirmed';
    return true;
  });

  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
            <FaTicketAlt className="text-danger" />
            <span>My Bookings</span>
          </h2>
          <p className="text-muted small mb-0">
            View your active movie tickets, booking references, and digital QR passes.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="btn-group">
          <button
            className={`btn btn-sm ${filter === 'all' ? 'btn-cinema-primary' : 'btn-cinema-secondary'}`}
            onClick={() => setFilter('all')}
          >
            All ({bookings.length})
          </button>
          <button
            className={`btn btn-sm ${filter === 'upcoming' ? 'btn-cinema-primary' : 'btn-cinema-secondary'}`}
            onClick={() => setFilter('upcoming')}
          >
            Confirmed ({bookings.filter(b => b.bookingStatus === 'confirmed').length})
          </button>
          <button
            className={`btn btn-sm ${filter === 'cancelled' ? 'btn-cinema-primary' : 'btn-cinema-secondary'}`}
            onClick={() => setFilter('cancelled')}
          >
            Cancelled ({bookings.filter(b => b.bookingStatus === 'cancelled').length})
          </button>
        </div>
      </div>

      {actionMsg && (
        <div className="alert alert-info bg-info bg-opacity-20 border-info text-white mb-4">
          {actionMsg}
        </div>
      )}

      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-danger"></div>
        </div>
      ) : filteredBookings.length > 0 ? (
        <div className="d-flex flex-column gap-3">
          {filteredBookings.map((b) => {
            const movie = b.movieId || {};
            const cinema = b.cinemaId || {};
            const screen = b.screenId || {};
            const isConfirmed = b.bookingStatus === 'confirmed';

            return (
              <div key={b._id} className="glass-panel p-4 shadow-sm">
                <div className="row g-3 align-items-center">
                  {/* Poster */}
                  <div className="col-auto">
                    <img
                      src={movie.poster || 'https://picsum.photos/100/150'}
                      alt={movie.title}
                      className="rounded"
                      style={{ width: '65px', height: '90px', objectFit: 'cover' }}
                    />
                  </div>

                  {/* Movie and Cinema Info */}
                  <div className="col">
                    <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                      <h5 className="fw-bold text-dark mb-0">{movie.title || 'Movie'}</h5>
                      <span className={`badge ${isConfirmed ? 'bg-success' : 'bg-danger'} bg-opacity-25 ${isConfirmed ? 'text-success' : 'text-danger'}`}>
                        {b.bookingStatus?.toUpperCase()}
                      </span>
                    </div>

                    <div className="d-flex align-items-center gap-1 text-muted small mb-2">
                      <FaMapMarkerAlt className="text-danger" />
                      <span>{cinema.name} ({cinema.city})</span>
                      <span>• {screen.screenName || 'Audi 1'}</span>
                    </div>

                    <div className="d-flex flex-wrap gap-3 small text-dark">
                      <span className="d-flex align-items-center gap-1">
                        <FaCalendarAlt className="text-danger" /> {b.createdAt?.slice(0, 10)}
                      </span>
                      <span>Seats: <strong className="text-danger">{b.seats?.map(s => s.seatNumber).join(', ')}</strong></span>
                      <span>Total: <strong className="text-dark">₹{b.totalAmount}</strong></span>
                      <span className="text-muted">Ref: <strong className="font-monospace text-dark">{b.bookingId}</strong></span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="col-12 col-md-auto d-flex flex-md-column gap-2 justify-content-end">
                    <button
                      className="btn btn-sm btn-cinema-primary d-flex align-items-center justify-content-center gap-1"
                      onClick={() => setSelectedTicket(b)}
                    >
                      <FaEye size={13} /> View Ticket
                    </button>

                    {isConfirmed && (
                      <button
                        className="btn btn-sm btn-outline-danger d-flex align-items-center justify-content-center gap-1"
                        onClick={() => setCancelModal({ open: true, bookingId: b._id })}
                      >
                        <FaTimesCircle size={13} /> Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-panel text-center py-5">
          <FaTicketAlt className="text-muted mb-3" size={48} />
          <h4 className="text-dark">No Bookings Found</h4>
          <p className="text-muted">You haven't made any movie bookings under this tab yet.</p>
          <Link to="/movies" className="btn btn-cinema-primary mt-2">
            Browse Movies & Book Now
          </Link>
        </div>
      )}

      {/* Ticket Modal */}
      {selectedTicket && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', zIndex: 1060 }}
          onClick={() => setSelectedTicket(null)}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content bg-transparent border-0">
              <div className="text-end mb-2">
                <button className="btn btn-sm btn-light rounded-circle shadow-sm" onClick={() => setSelectedTicket(null)}>
                  <FaTimes />
                </button>
              </div>
              <DigitalTicket booking={selectedTicket} />
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelModal.open && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', zIndex: 1060 }}
          onClick={() => setCancelModal({ open: false, bookingId: null })}
        >
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content bg-white text-dark border border-danger border-opacity-50 shadow-lg">
              <div className="modal-header border-light-subtle">
                <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
                  <FaExclamationTriangle className="text-danger" /> Cancel Booking
                </h5>
                <button
                  type="button"
                  className="btn btn-sm text-light p-0 border-0"
                  onClick={() => setCancelModal({ open: false, bookingId: null })}
                >
                  <FaTimes />
                </button>
              </div>
              <div className="modal-body">
                <p className="text-muted mb-2">
                  Are you sure you want to cancel this booking?
                </p>
                <div className="small text-danger">
                  • Your reserved seats will be freed up for other patrons.<br />
                  • A 100% refund of ₹ will be credited back to your original payment method.
                </div>
              </div>
              <div className="modal-footer border-secondary border-opacity-25">
                <button
                  className="btn btn-cinema-secondary btn-sm"
                  onClick={() => setCancelModal({ open: false, bookingId: null })}
                >
                  No, Keep Booking
                </button>
                <button className="btn btn-danger btn-sm" onClick={handleCancelBooking}>
                  Yes, Cancel & Refund
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;

