import React from 'react';
import { FaTimes } from 'react-icons/fa';

const TrailerModal = ({ isOpen, onClose, trailerUrl, title }) => {
  if (!isOpen) return null;

  // Convert youtube watch URL to embed URL if needed
  let embedUrl = trailerUrl || '';
  if (embedUrl.includes('watch?v=')) {
    const videoId = embedUrl.split('watch?v=')[1]?.split('&')[0];
    embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  } else if (embedUrl.includes('youtu.be/')) {
    const videoId = embedUrl.split('youtu.be/')[1]?.split('?')[0];
    embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  }

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(5px)', zIndex: 1050 }}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-dialog-centered modal-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content bg-dark text-light border border-secondary border-opacity-50 shadow-lg">
          <div className="modal-header border-secondary border-opacity-25 py-2 px-3">
            <h6 className="modal-title fw-bold text-white mb-0">
              {title} – Official Trailer
            </h6>
            <button
              type="button"
              className="btn btn-sm text-light p-0 border-0"
              onClick={onClose}
            >
              <FaTimes size={18} />
            </button>
          </div>
          <div className="modal-body p-0">
            <div className="ratio ratio-16x9">
              <iframe
                src={embedUrl}
                title={`${title} Trailer`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrailerModal;

