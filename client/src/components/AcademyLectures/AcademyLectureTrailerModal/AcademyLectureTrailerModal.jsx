// src/components/AcademyLectures/AcademyLectureTrailerModal/AcademyLectureTrailerModal.jsx

import { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import './academyLectureTrailerModal.css';

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

// Format duration
const formatDuration = (minutes) => {
  if (!minutes) return '';
  if (minutes < 60) return `${minutes} мин`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}ч ${mins}мин` : `${hours}ч`;
};

export const AcademyLectureTrailerModal = ({ 
  isOpen, 
  onClose, 
  lecture,
  accentColor = '#ff6347',
  onViewLecture
}) => {
  const { t } = useTranslation();

  // Handle Escape key
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  // Handle click outside
  const handleBackdropClick = useCallback((e) => {
    if (e.target.classList.contains('altm-backdrop')) {
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

  if (!isOpen || !lecture) return null;

  const videoId = getYouTubeVideoId(lecture.videoUrl);
  const hasVideo = !!videoId;
  const totalCredits = (lecture.creditsForAttendance || 0) + (lecture.creditsForTest || 0);

  const modalContent = (
    <div 
      className="altm-backdrop"
      onClick={handleBackdropClick}
      style={{ '--altm-accent': accentColor }}
    >
      <div className="altm-modal">
        {/* Header */}
        <div className="altm-header">
          <div className="altm-header-left">
            <span className="altm-header-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5,3 19,12 5,21" />
              </svg>
              {t('academyLectureTrailerModal.preview', 'Преглед')}
            </span>
            <span className="altm-header-category">{lecture.category}</span>
          </div>
          
          <button 
            className="altm-close"
            onClick={onClose}
            aria-label={t('academyLectureTrailerModal.close', 'Затвори')}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Video Container */}
        <div className="altm-video">
          {hasVideo ? (
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
              title={lecture.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="altm-video-error">
              <div className="altm-video-error-icon">🎬</div>
              <p className="altm-video-error-text">
                {t('academyLectureTrailerModal.noVideo', 'Видеото не е налично')}
              </p>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="altm-info">
          {/* Title */}
          <h3 className="altm-title">{lecture.title}</h3>
          
          {/* Description */}
          {lecture.shortDescription && (
            <p className="altm-description">{lecture.shortDescription}</p>
          )}

          {/* Stats Row */}
          <div className="altm-stats">
            {lecture.durationMinutes && (
              <div className="altm-stat">
                <span className="altm-stat-icon">⏱️</span>
                <span className="altm-stat-value">{formatDuration(lecture.durationMinutes)}</span>
              </div>
            )}
            
            {lecture.viewsCount > 0 && (
              <div className="altm-stat">
                <span className="altm-stat-icon">👁️</span>
                <span className="altm-stat-value">{lecture.viewsCount.toLocaleString()}</span>
              </div>
            )}
            
            {lecture.rating && (
              <div className="altm-stat altm-stat--rating">
                <span className="altm-stat-icon">⭐</span>
                <span className="altm-stat-value">{parseFloat(lecture.rating).toFixed(1)}</span>
              </div>
            )}

            {totalCredits > 0 && (
              <div className="altm-stat altm-stat--credits">
                <span className="altm-stat-icon">🪙</span>
                <span className="altm-stat-value">+{totalCredits}</span>
              </div>
            )}
          </div>

          {/* Lecturer */}
          {lecture.lecturer && (
            <div className="altm-lecturer">
              <div className="altm-lecturer-avatar">
                {lecture.lecturer.photoUrl ? (
                  <img src={lecture.lecturer.photoUrl} alt={lecture.lecturer.name} />
                ) : (
                  <span className="altm-lecturer-avatar-placeholder">👤</span>
                )}
              </div>
              <div className="altm-lecturer-info">
                <span className="altm-lecturer-label">
                  {t('academyLectureTrailerModal.lecturer', 'Лектор')}
                </span>
                <span className="altm-lecturer-name">{lecture.lecturer.name}</span>
                {lecture.lecturer.specialization && (
                  <span className="altm-lecturer-spec">{lecture.lecturer.specialization}</span>
                )}
              </div>
            </div>
          )}

          {/* Course Badge */}
          {lecture.course && (
            <div className="altm-course">
              <span className="altm-course-icon">📚</span>
              <span className="altm-course-label">
                {t('academyLectureTrailerModal.partOfCourse', 'Част от курс')}:
              </span>
              <span className="altm-course-name">{lecture.course.name}</span>
            </div>
          )}

          {/* Tags */}
          {lecture.tags && lecture.tags.length > 0 && (
            <div className="altm-tags">
              {lecture.tags.slice(0, 4).map((tag, index) => (
                <span key={index} className="altm-tag">#{tag}</span>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="altm-footer">
          <p className="altm-footer-hint">
            {t('academyLectureTrailerModal.hint', 'Натиснете ESC за затваряне')}
          </p>
          <button 
            className="altm-footer-btn"
            onClick={() => {
              onClose();
              if (onViewLecture) onViewLecture(lecture);
            }}
          >
            {t('academyLectureTrailerModal.viewLecture', 'Към лекцията')}
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

export default AcademyLectureTrailerModal;