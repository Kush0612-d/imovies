import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  FaLock,
  FaShieldAlt,
  FaCreditCard,
  FaMobileAlt,
  FaUniversity,
  FaTicketAlt,
  FaArrowLeft,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle
} from 'react-icons/fa';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const checkoutState = location.state;

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState(600); // 10 mins default
  const [paymentMethod, setPaymentMethod] = useState('mock_upi');
  const [upiId, setUpiId] = useState('user@okaxis');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [processing, setProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!checkoutState) {
      navigate('/movies');
      return;
    }

    if (checkoutState.lockedUntil) {
      const lockExpiry = new Date(checkoutState.lockedUntil).getTime();
      const updateTimer = () => {
        const remaining = Math.max(0, Math.floor((lockExpiry - Date.now()) / 1000));
        setTimeLeft(remaining);
        if (remaining <= 0) {
          setErrorMsg('Your temporary seat lock has expired. Please select your seats again.');
        }
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [checkoutState, navigate]);

  if (!checkoutState) return null;

  const { showId, showData, selectedSeats, pricing } = checkoutState;
  const movie = showData.movie || {};
  const cinema = showData.cinema || {};
  const screen = showData.screen || {};

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handlePayment = async () => {
    if (timeLeft <= 0) {
      setErrorMsg('Seat lock expired. Please go back to seat selection.');
      return;
    }

    try {
      setProcessing(true);
      setErrorMsg('');

      // Step 1: Create payment order on backend
      const orderPayload = {
        amount: pricing.totalAmount,
        currency: 'INR',
        receipt: `rcpt_${Date.now()}`
      };

      const orderRes = await API.post('/payments/create-order', orderPayload);
      const { order, mode, keyId } = orderRes.data;

      // Step 2: Handle payment verification on backend
      let verificationRes;

      if (mode === 'razorpay' && window.Razorpay) {
        // Live/Test Razorpay Checkout
        const options = {
          key: keyId,
          amount: order.amount,
          currency: 'INR',
          name: 'IMovies Tickets',
          description: `Booking for ${movie.title}`,
          order_id: order.id,
          prefill: {
            name: user.name,
            email: user.email,
            contact: user.phone
          },
          theme: { color: '#8b5cf6' },
          handler: async (response) => {
            verificationRes = await API.post('/payments/verify', {
              mode: 'razorpay',
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature
            });
            await finalizeBooking(verificationRes.data.transactionId);
          }
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
        return;
      } else {
        // Secure Academic Mock Gateway verification
        // Simulating realistic gateway network verification
        await new Promise((resolve) => setTimeout(resolve, 1500));

        verificationRes = await API.post('/payments/verify', {
          mode: 'mock',
          orderId: order.id,
          paymentId: `TXN-MCK-${Date.now()}`
        });
      }

      // Step 3: Finalize booking on backend with revalidation
      await finalizeBooking(verificationRes.data.transactionId);
    } catch (err) {
      console.error('Checkout error:', err);
      setErrorMsg(err.response?.data?.message || 'Payment processing failed. Please try again.');
      setProcessing(false);
    }
  };

  const finalizeBooking = async (transactionId) => {
    try {
      const confirmPayload = {
        showId,
        seatNumbers: selectedSeats.map((s) => s.seatNumber),
        paymentMethod,
        transactionId
      };

      const { data } = await API.post('/bookings/confirm', confirmPayload);

      if (data.success && data.booking) {
        navigate(`/booking-confirmation/${data.booking._id}`, {
          state: { booking: data.booking }
        });
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Booking confirmation failed. Please contact support.');
      setProcessing(false);
    }
  };

  return (
    <div className="container py-4">
      {/* Top Lock Timer Banner */}
      <div className="glass-panel p-3 mb-4 d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2 border-warning border-opacity-50">
        <div className="d-flex align-items-center gap-2">
          <FaClock className="text-warning" size={20} />
          <div>
            <span className="text-white fw-bold">Seats Temporarily Locked: </span>
            <span className="text-muted small">Complete your booking before the timer expires</span>
          </div>
        </div>
        <div className="badge bg-warning text-dark font-monospace fs-6 px-3 py-2">
          ⏱ {formatTimer(timeLeft)}
        </div>
      </div>

      {errorMsg && (
        <div className="alert alert-danger bg-danger bg-opacity-20 border-danger text-light d-flex align-items-center gap-2 mb-4">
          <FaExclamationTriangle className="text-danger flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="row g-4">
        {/* Left Column: Order Summary */}
        <div className="col-lg-7">
          <div className="glass-panel p-4 mb-4">
            <h4 className="fw-bold text-white mb-3 d-flex align-items-center gap-2">
              <FaTicketAlt className="text-danger" />
              <span>Order Summary</span>
            </h4>

            {/* Movie Info */}
            <div className="d-flex gap-3 pb-3 border-bottom border-secondary border-opacity-25">
              <img
                src={movie.poster}
                alt={movie.title}
                className="rounded"
                style={{ width: '70px', height: '100px', objectFit: 'cover' }}
              />
              <div>
                <h5 className="fw-bold text-white mb-1">{movie.title}</h5>
                <div className="d-flex gap-2 text-muted small mb-1">
                  <span className="badge bg-secondary">{movie.language}</span>
                  <span className="badge bg-dark border border-secondary">{movie.certification}</span>
                  <span>{movie.duration ? `${Math.floor(movie.duration / 60)}h ${movie.duration % 60}m` : '2h 15m'}</span>
                </div>
                <div className="text-light small">{cinema.name} ({cinema.city})</div>
                <small className="text-muted">{screen.screenName || 'Audi 1'}</small>
              </div>
            </div>

            {/* Show Details */}
            <div className="row g-3 py-3 border-bottom border-secondary border-opacity-25 small">
              <div className="col-4">
                <div className="text-muted">Date</div>
                <div className="fw-bold text-white">{showData.showDate}</div>
              </div>
              <div className="col-4">
                <div className="text-muted">Time</div>
                <div className="fw-bold text-success">{showData.startTime}</div>
              </div>
              <div className="col-4">
                <div className="text-muted">Seats</div>
                <div className="fw-bold text-warning">
                  {selectedSeats.map((s) => s.seatNumber).join(', ')}
                </div>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="pt-3">
              <h6 className="fw-bold text-white mb-3">Price Breakdown</h6>
              <div className="d-flex justify-content-between text-muted small mb-2">
                <span>Base Ticket Price ({selectedSeats.length} seats)</span>
                <span className="text-white">₹{pricing.baseAmount}</span>
              </div>
              <div className="d-flex justify-content-between text-muted small mb-2">
                <span>Convenience Fee (Booking & Maintenance)</span>
                <span className="text-white">₹{pricing.convenienceFee}</span>
              </div>
              <div className="d-flex justify-content-between text-muted small mb-2">
                <span>Integrated GST (18%)</span>
                <span className="text-white">₹{pricing.taxAmount}</span>
              </div>
              <hr className="border-secondary border-opacity-25" />
              <div className="d-flex justify-content-between align-items-center">
                <span className="fw-bold text-white fs-5">Total Amount Payable</span>
                <span className="fw-bold text-white fs-4">₹{pricing.totalAmount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Payment Gateway Simulation */}
        <div className="col-lg-5">
          <div className="glass-panel p-4">
            <h5 className="fw-bold text-white mb-3 d-flex align-items-center gap-2">
              <FaLock className="text-success" />
              <span>Select Payment Method</span>
            </h5>

            {/* Academic Mode Notice */}
            <div className="p-2 mb-3 rounded bg-black bg-opacity-40 border border-secondary border-opacity-25 small text-muted">
              🔒 <strong>IMovies Sandbox Gateway</strong> (Instant secure test authorization)
            </div>

            {/* Payment Options */}
            <div className="d-flex flex-column gap-2 mb-4">
              <label
                className={`p-3 rounded border d-flex align-items-center gap-3 cursor-pointer transition-all ${
                  paymentMethod === 'mock_upi'
                    ? 'border-primary bg-primary bg-opacity-10'
                    : 'border-secondary border-opacity-25 bg-dark'
                }`}
                style={{ cursor: 'pointer' }}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'mock_upi'}
                  onChange={() => setPaymentMethod('mock_upi')}
                />
                <FaMobileAlt className="text-primary fs-5" />
                <div className="flex-grow-1">
                  <div className="text-white fw-bold small">UPI (Google Pay / PhonePe / Paytm)</div>
                  <div className="text-muted small" style={{ fontSize: '0.75rem' }}>Instant authorization</div>
                </div>
              </label>

              <label
                className={`p-3 rounded border d-flex align-items-center gap-3 cursor-pointer transition-all ${
                  paymentMethod === 'mock_card'
                    ? 'border-primary bg-primary bg-opacity-10'
                    : 'border-secondary border-opacity-25 bg-dark'
                }`}
                style={{ cursor: 'pointer' }}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'mock_card'}
                  onChange={() => setPaymentMethod('mock_card')}
                />
                <FaCreditCard className="text-warning fs-5" />
                <div className="flex-grow-1">
                  <div className="text-white fw-bold small">Credit / Debit Card</div>
                  <div className="text-muted small" style={{ fontSize: '0.75rem' }}>Visa, Mastercard, RuPay</div>
                </div>
              </label>

              <label
                className={`p-3 rounded border d-flex align-items-center gap-3 cursor-pointer transition-all ${
                  paymentMethod === 'mock_netbanking'
                    ? 'border-primary bg-primary bg-opacity-10'
                    : 'border-secondary border-opacity-25 bg-dark'
                }`}
                style={{ cursor: 'pointer' }}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'mock_netbanking'}
                  onChange={() => setPaymentMethod('mock_netbanking')}
                />
                <FaUniversity className="text-success fs-5" />
                <div className="flex-grow-1">
                  <div className="text-white fw-bold small">Net Banking</div>
                  <div className="text-muted small" style={{ fontSize: '0.75rem' }}>All Major Indian Banks</div>
                </div>
              </label>
            </div>

            {/* Input Details Preview */}
            {paymentMethod === 'mock_upi' && (
              <div className="mb-3">
                <label className="form-label small text-muted">Virtual Payment Address (UPI ID)</label>
                <input
                  type="text"
                  className="form-control form-control-cinema form-control-sm"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                />
              </div>
            )}

            {paymentMethod === 'mock_card' && (
              <div className="mb-3">
                <label className="form-label small text-muted">Test Card Number</label>
                <input
                  type="text"
                  className="form-control form-control-cinema form-control-sm mb-2"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                />
                <div className="row g-2">
                  <div className="col-6">
                    <input
                      type="text"
                      className="form-control form-control-cinema form-control-sm"
                      placeholder="MM/YY"
                      defaultValue="12/28"
                    />
                  </div>
                  <div className="col-6">
                    <input
                      type="text"
                      className="form-control form-control-cinema form-control-sm"
                      placeholder="CVV"
                      defaultValue="789"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Pay Button */}
            <button
              className="btn btn-cinema-primary w-100 py-3 fw-bold d-flex align-items-center justify-content-center gap-2"
              onClick={handlePayment}
              disabled={processing || timeLeft <= 0}
            >
              {processing ? (
                <>
                  <div className="spinner-border spinner-border-sm" role="status"></div>
                  <span>Verifying Payment with Gateway...</span>
                </>
              ) : (
                <>
                  <FaShieldAlt /> Pay ₹{pricing.totalAmount} Securely
                </>
              )}
            </button>

            <div className="text-center mt-3">
              <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                By clicking pay, you agree to IMovies Terms of Booking. All bookings are final and protected with instant QR authentication.
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

