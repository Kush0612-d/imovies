import React, { useRef } from 'react';
import { FaFilm, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaPrint } from 'react-icons/fa';

const DigitalTicket = ({ booking }) => {
  const printRef = useRef();

  if (!booking) return null;

  const movie = booking.movieId || {};
  const cinema = booking.cinemaId || {};
  const screen = booking.screenId || {};
  const showDate = booking.showId?.showDate || booking.createdAt?.slice(0, 10);
  const startTime = booking.showId?.startTime || '06:30 PM';
  const seatsList = booking.seats?.map(s => s.seatNumber).join(', ') || 'N/A';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="digital-ticket-wrapper mx-auto" style={{ maxWidth: '620px' }}>
      <div className="digital-ticket-card p-4 text-light" ref={printRef}>
        <div className="ticket-notch-left"></div>
        <div className="ticket-notch-right"></div>

        {/* Header */}
        <div className="d-flex justify-content-between align-items-center pb-3 border-bottom border-secondary border-opacity-50">
          <div className="d-flex align-items-center gap-2">
            <div className="brand-logo" style={{ fontSize: '1.4rem' }}>
              <FaFilm className="text-danger" />
              <span>IMovies</span>
            </div>
            <span className="badge bg-success bg-opacity-25 text-success border border-success border-opacity-25 ms-2">
              {booking.bookingStatus === 'confirmed' ? 'CONFIRMED' : 'CANCELLED'}
            </span>
          </div>
          <div className="text-end">
            <div className="small text-muted text-uppercase" style={{ letterSpacing: '1px' }}>
              Booking Reference
            </div>
            <div className="font-monospace fw-bold text-warning">{booking.bookingId}</div>
          </div>
        </div>

        {/* Main Body */}
        <div className="row g-4 py-4 align-items-center">
          {/* Movie Poster */}
          <div className="col-4 col-sm-3">
            <img
              src={movie.poster || 'https://picsum.photos/300/450'}
              alt={movie.title}
              className="img-fluid rounded shadow-sm border border-secondary border-opacity-25"
              style={{ objectFit: 'cover', height: '150px', width: '100%' }}
            />
          </div>

          {/* Ticket Information */}
          <div className="col-8 col-sm-9">
            <h4 className="fw-bold text-white mb-1">{movie.title || 'Movie Title'}</h4>
            <div className="d-flex gap-2 align-items-center text-muted small mb-2">
              <span className="badge bg-secondary">{movie.language || 'Hindi'}</span>
              <span className="badge bg-dark border border-secondary">{movie.certification || 'UA'}</span>
              <span>{movie.duration ? `${Math.floor(movie.duration / 60)}h ${movie.duration % 60}m` : '2h 15m'}</span>
            </div>

            <div className="d-flex align-items-center gap-1 text-light small mb-2">
              <FaMapMarkerAlt className="text-danger flex-shrink-0" />
              <span className="fw-semibold">{cinema.name || 'Cinema Multiplex'}</span>
              <span className="text-muted">({cinema.city || 'City'})</span>
            </div>

            <div className="badge bg-primary bg-opacity-20 text-primary border border-primary border-opacity-25 mb-1">
              {screen.screenName || 'Audi 1 - Dolby Atmos'}
            </div>
          </div>
        </div>

        {/* Date, Time & Seats Bar */}
        <div className="row g-2 p-3 rounded bg-black bg-opacity-40 border border-secondary border-opacity-25 mb-4 text-center">
          <div className="col-4 border-end border-secondary border-opacity-25">
            <div className="small text-muted text-uppercase">Date</div>
            <div className="fw-bold text-white mt-1 d-flex align-items-center justify-content-center gap-1">
              <FaCalendarAlt className="text-danger" size={13} />
              <span>{showDate}</span>
            </div>
          </div>

          <div className="col-4 border-end border-secondary border-opacity-25">
            <div className="small text-muted text-uppercase">Time</div>
            <div className="fw-bold text-white mt-1 d-flex align-items-center justify-content-center gap-1">
              <FaClock className="text-primary" size={13} />
              <span>{startTime}</span>
            </div>
          </div>

          <div className="col-4">
            <div className="small text-muted text-uppercase">Seats</div>
            <div className="fw-bold text-warning mt-1" style={{ fontSize: '1.05rem' }}>
              {seatsList}
            </div>
          </div>
        </div>

        {/* Footer with QR Code & Verification */}
        <div className="d-flex justify-content-between align-items-center pt-3 border-top border-secondary border-opacity-50">
          <div>
            <div className="small text-muted">Amount Paid</div>
            <div className="fs-5 fw-bold text-white">₹{booking.totalAmount?.toFixed(2)}</div>
            <div className="small text-muted" style={{ fontSize: '0.75rem' }}>
              Inc. GST & Booking Convenience Fee
            </div>
          </div>

          <div className="text-center">
            {booking.qrCodeDataUrl ? (
              <img
                src={booking.qrCodeDataUrl}
                alt="Ticket QR Code"
                className="bg-white p-1 rounded shadow-sm"
                style={{ width: '90px', height: '90px' }}
              />
            ) : (
              <div
                className="bg-white p-2 rounded text-dark font-monospace small"
                style={{ width: '90px', height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                QR VERIFIED
              </div>
            )}
            <div className="small text-muted mt-1" style={{ fontSize: '0.65rem' }}>
              Scan at Entrance
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="d-flex justify-content-end gap-2 mt-3 d-print-none">
        <button className="btn btn-cinema-secondary btn-sm d-flex align-items-center gap-2" onClick={handlePrint}>
          <FaPrint /> Print / Save Ticket
        </button>
      </div>
    </div>
  );
};

export default DigitalTicket;

