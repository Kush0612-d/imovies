import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import API from '../services/api';
import DigitalTicket from '../components/DigitalTicket';
import { FaCheckCircle, FaTicketAlt, FaHome, FaPrint } from 'react-icons/fa';

const BookingConfirmation = () => {
  const { id } = useParams();
  const location = useLocation();

  const [booking, setBooking] = useState(location.state?.booking || null);
  const [loading, setLoading] = useState(!location.state?.booking);

  useEffect(() => {
    if (!booking) {
      const fetchBooking = async () => {
        try {
          setLoading(true);
          const { data } = await API.get(`/bookings/${id}`);
          setBooking(data.booking);
        } catch (err) {
          console.error('Error fetching booking details:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchBooking();
    }
  }, [id, booking]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-danger"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container py-5 text-center">
        <div className="glass-panel p-5">
          <h4 className="text-dark">Booking not found</h4>
          <Link to="/" className="btn btn-cinema-secondary mt-3">
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      {/* Success Banner */}
      <div className="text-center mb-4">
        <div
          className="d-inline-flex align-items-center justify-content-center rounded-circle bg-success bg-opacity-20 text-success p-3 mb-2 shadow-sm"
          style={{ width: '70px', height: '70px' }}
        >
          <FaCheckCircle size={36} />
        </div>
        <h2 className="fw-black text-dark mb-1">Booking Confirmed!</h2>
        <p className="text-muted small">
          Your cinema seats have been secured. Here is your official digital ticket.
        </p>
      </div>

      {/* Digital Ticket Card */}
      <DigitalTicket booking={booking} />

      {/* Action Buttons */}
      <div className="d-flex justify-content-center gap-3 mt-4">
        <Link to="/my-bookings" className="btn btn-cinema-secondary d-flex align-items-center gap-2">
          <FaTicketAlt /> View My Bookings
        </Link>
        <Link to="/" className="btn btn-cinema-primary d-flex align-items-center gap-2">
          <FaHome /> Book More Tickets
        </Link>
      </div>
    </div>
  );
};

export default BookingConfirmation;

