import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  FaArrowLeft,
  FaFilm,
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaLock,
  FaCheckCircle,
  FaExclamationTriangle
} from 'react-icons/fa';

const SeatBooking = () => {
  const { showId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [showData, setShowData] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lockLoading, setLockLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch show seats & layout
  const fetchSeats = async () => {
    try {
      setLoading(true);
      const { data } = await API.get(`/shows/${showId}/seats`);
      setShowData(data);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to load auditorium seating layout.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeats();
    // Poll every 30 seconds for real-time seat lock changes
    const interval = setInterval(fetchSeats, 30000);
    return () => clearInterval(interval);
  }, [showId]);

  // Group seats by row
  const rowsMap = {};
  if (showData?.seats) {
    showData.seats.forEach((seat) => {
      if (!rowsMap[seat.row]) {
        rowsMap[seat.row] = [];
      }
      rowsMap[seat.row].push(seat);
    });
  }

  // Handle seat click
  const handleSeatClick = (seat) => {
    if (seat.status === 'booked') return;
    if (seat.status === 'locked') {
      setErrorMessage(`Seat ${seat.seatNumber} is currently held by another user. Please choose an available green seat.`);
      setTimeout(() => setErrorMessage(''), 4000);
      return;
    }

    setErrorMessage('');
    const exists = selectedSeats.find((s) => s.seatNumber === seat.seatNumber);
    if (exists) {
      setSelectedSeats(selectedSeats.filter((s) => s.seatNumber !== seat.seatNumber));
    } else {
      if (selectedSeats.length >= 8) {
        setErrorMessage('You can select a maximum of 8 seats per booking transaction.');
        setTimeout(() => setErrorMessage(''), 4000);
        return;
      }
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  // Pricing calculations
  const baseTotal = selectedSeats.reduce((sum, s) => sum + s.price, 0);
  const convenienceFee = selectedSeats.length > 0 ? selectedSeats.length * 25 : 0;
  const taxAmount = Math.round((baseTotal + convenienceFee) * 0.18);
  const grandTotal = baseTotal + convenienceFee + taxAmount;

  // Lock seats and proceed to checkout
  const handleProceedToCheckout = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/seat-selection/${showId}` } });
      return;
    }

    if (selectedSeats.length === 0) {
      setErrorMessage('Please select at least one seat to proceed.');
      return;
    }

    try {
      setLockLoading(true);
      setErrorMessage('');

      const seatNumbers = selectedSeats.map((s) => s.seatNumber);
      const { data } = await API.post('/bookings/lock-seats', {
        showId,
        seatNumbers
      });

      if (data.success) {
        // Pass locked details to checkout
        navigate('/checkout', {
          state: {
            showId,
            showData,
            selectedSeats,
            lockedUntil: data.lockedUntil,
            pricing: data.pricing
          }
        });
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to lock seats. Some seats may have been taken.');
      fetchSeats(); // Refresh seats to reflect current status
    } finally {
      setLockLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-danger" style={{ width: '3rem', height: '3rem' }}></div>
      </div>
    );
  }

  if (!showData) {
    return (
      <div className="container py-5 text-center">
        <div className="glass-panel p-5">
          <h4 className="text-dark">Show details not found</h4>
          <Link to="/movies" className="btn btn-cinema-secondary mt-3">
            Back to Movies
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Header Bar */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="btn btn-sm btn-cinema-secondary mb-2 d-inline-flex align-items-center gap-2"
          >
            <FaArrowLeft size={12} /> Back to Showtimes
          </button>
          <h3 className="fw-bold text-dark mb-0">{showData.movie?.title}</h3>
          <div className="d-flex flex-wrap gap-2 text-muted small mt-1">
            <span className="text-dark fw-semibold">{showData.cinema?.name}</span>
            <span>• {showData.screen?.screenName || 'Audi 1'}</span>
            <span>• {showData.showDate}</span>
            <span className="text-success fw-bold">• {showData.startTime}</span>
          </div>
        </div>

        {/* Legend */}
        <div className="glass-panel py-2 px-3 d-flex flex-wrap gap-3 align-items-center">
          <div className="seat-legend-item">
            <div className="legend-sample seat-available"></div>
            <span>Available</span>
          </div>
          <div className="seat-legend-item">
            <div className="legend-sample seat-selected"></div>
            <span>Selected</span>
          </div>
          <div className="seat-legend-item">
            <div className="legend-sample seat-booked"></div>
            <span>Booked</span>
          </div>
          <div className="seat-legend-item">
            <div className="legend-sample bg-light border border-warning" style={{ borderTop: '3.5px solid #f59e0b' }}></div>
            <span>Premium</span>
          </div>
        </div>
      </div>

      {/* Error / Conflict Alert */}
      {errorMessage && (
        <div className="alert alert-danger bg-danger bg-opacity-20 border-danger text-light d-flex align-items-center gap-2 mb-4">
          <FaExclamationTriangle className="text-danger flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Auditorium Screen & Seating Layout */}
      <div className="glass-panel p-4 mb-4 text-center">
        {/* Cinema Screen Curve */}
        <div className="cinema-screen-container mx-auto" style={{ maxWidth: '650px' }}>
          <div className="cinema-screen"></div>
          <div className="cinema-screen-text">ALL EYES THIS WAY • CINEMA SCREEN</div>
        </div>

        {/* Interactive Seat Grid */}
        <div className="seat-grid">
          {Object.keys(rowsMap).map((rowName) => {
            const seatsInRow = rowsMap[rowName];
            const isPremiumRow = ['A', 'B'].includes(rowName);

            return (
              <div key={rowName} className="seat-row">
                {/* Row Label Left */}
                <div className="seat-row-label">{rowName}</div>

                {/* Seat buttons */}
                {seatsInRow.map((seat) => {
                  const isSelected = selectedSeats.some((s) => s.seatNumber === seat.seatNumber);
                  const isBooked = seat.status === 'booked';
                  const isLocked = seat.status === 'locked';

                  let statusClass = 'seat-available';
                  if (isSelected) statusClass = 'seat-selected';
                  else if (isBooked || isLocked) statusClass = 'seat-booked';

                  return (
                    <button
                      key={seat.seatNumber}
                      type="button"
                      disabled={isBooked}
                      title={`${seat.seatNumber} (${seat.category} - ₹${seat.price})`}
                      className={`seat-btn ${statusClass} ${isPremiumRow ? 'seat-premium-badge' : ''}`}
                      onClick={() => handleSeatClick(seat)}
                    >
                      {seat.col}
                    </button>
                  );
                })}

                {/* Row Label Right */}
                <div className="seat-row-label">{rowName}</div>
              </div>
            );
          })}
        </div>

        <div className="text-muted small mt-3">
          Row A & B: <span className="text-warning fw-semibold">Premium Recliners (₹{showData.ticketPrice?.premium || 350})</span> |
          Row C to H: <span className="text-dark fw-semibold">Regular Standard (₹{showData.ticketPrice?.regular || 220})</span>
        </div>
      </div>

      {/* Floating Bottom Booking Action Bar */}
      <div className="glass-panel p-3 p-md-4 shadow-lg sticky-bottom" style={{ bottom: '15px', zIndex: 100 }}>
        <div className="row align-items-center g-3">
          {/* Selected Seats info */}
          <div className="col-md-7 col-12">
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="text-muted small">Selected Seats:</span>
              {selectedSeats.length > 0 ? (
                <div className="d-flex flex-wrap gap-1">
                  {selectedSeats.map((s) => (
                    <span key={s.seatNumber} className="badge bg-primary text-white px-2 py-1 shadow-sm">
                      {s.seatNumber} (₹{s.price})
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-muted fst-italic small">No seats selected yet. Click any green seat above.</span>
              )}
            </div>
            <div className="text-muted small">
              {selectedSeats.length} seat(s) selected • Maximum 8 seats per order
            </div>
          </div>

          {/* Pricing & Checkout CTA */}
          <div className="col-md-5 col-12 d-flex justify-content-md-end align-items-center gap-3">
            <div className="text-md-end">
              <div className="small text-muted">Estimated Total</div>
              <div className="fs-4 fw-bold text-dark">₹{grandTotal}</div>
            </div>

            <button
              className="btn btn-cinema-primary px-4 py-2 d-flex align-items-center gap-2"
              disabled={selectedSeats.length === 0 || lockLoading}
              onClick={handleProceedToCheckout}
            >
              {lockLoading ? (
                <>
                  <div className="spinner-border spinner-border-sm" role="status"></div>
                  <span>Locking Seats...</span>
                </>
              ) : (
                <>
                  <FaLock size={13} />
                  <span>Proceed to Pay</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatBooking;

