// src/components/AcademyCourses/AcademyTrailerModal/AcademyTrailerModal.jsx

import { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import './academyTrailerModal.css';

// Helper to extract YouTube video ID
const getYouTubeVideoId = (url) => {
  if (!url) return null;
  
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/,
    /^([a-zA-Z0-9_-]{11})$/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
};

export const AcademyTrailerModal = ({ 
  isOpen, 
  onClose, 
  videoUrl, 
  courseTitle,
  accentColor = '#ff6347'
}) => {
  const { t } = useTranslation('academy');

  // Handle Escape key
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  // Handle click outside
  const handleBackdropClick = useCallback((e) => {
    if (e.target.classList.contains('academyTrailerModal-backdrop')) {
      onClose();
    }
  }, [onClose]);

  // Add/remove event listeners
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const videoId = getYouTubeVideoId(videoUrl);

  const modalContent = (
    <div 
      className="academyTrailerModal-backdrop"
      onClick={handleBackdropClick}
      style={{ '--accent-color': accentColor }}
    >
      <div className="academyTrailerModal">
        {/* Header */}
        <div className="academyTrailerModal-header">
          <div className="academyTrailerModal-header-info">
            <span className="academyTrailerModal-header-badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5,3 19,12 5,21" />
              </svg>
              {t('academyTrailerModal.preview')}
            </span>
            <h3 className="academyTrailerModal-header-title">{courseTitle}</h3>
          </div>
          
          <button 
            className="academyTrailerModal-close"
            onClick={onClose}
            aria-label={t('academyTrailerModal.close')}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Video Container */}
        <div className="academyTrailerModal-video">
          {videoId ? (
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
              title={courseTitle}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="academyTrailerModal-video-error">
              <div className="academyTrailerModal-video-error-icon">🎬</div>
              <p className="academyTrailerModal-video-error-text">
                {t('academyTrailerModal.noVideo')}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="academyTrailerModal-footer">
          <p className="academyTrailerModal-footer-hint">
            {t('academyTrailerModal.hint')}
          </p>
          <button 
            className="academyTrailerModal-footer-btn"
            onClick={onClose}
          >
            {t('academyTrailerModal.viewCourse')}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};