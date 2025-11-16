// client/src/components/DigiMentorPanel/DigiMentorReviews/DigiMentorReviewCard/DigiMentorReviewCard.jsx

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './digiMentorReviewCard.css';

export const DigiMentorReviewCard = ({ review }) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  const TEXT_PREVIEW_LENGTH = 200;

  const {
    name,
    email,
    role,
    rating,
    text,
    status,
    approvedAt,
    createdAt,
    imageUrl,
    user
  } = review;

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return t('digiMentorReviewCard.today');
    } else if (diffDays === 1) {
      return t('digiMentorReviewCard.yesterday');
    } else if (diffDays < 7) {
      return t('digiMentorReviewCard.daysAgo', { count: diffDays });
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return t('digiMentorReviewCard.weeksAgo', { count: weeks });
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return t('digiMentorReviewCard.monthsAgo', { count: months });
    } else {
      return date.toLocaleDateString('bg-BG', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  // Render stars
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg 
        key={i} 
        viewBox="0 0 24 24" 
        fill={i < rating ? 'currentColor' : 'none'} 
        xmlns="http://www.w3.org/2000/svg"
        className={i < rating ? 'digi-mentor-review-card-star-filled' : 'digi-mentor-review-card-star-empty'}
      >
        <path 
          d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
    ));
  };

  // Check if text needs truncation
  const needsTruncation = text && text.length > TEXT_PREVIEW_LENGTH;
  const displayText = needsTruncation && !isExpanded 
    ? text.substring(0, TEXT_PREVIEW_LENGTH) + '...' 
    : text;

  // Get initials for fallback avatar
  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="digi-mentor-review-card">
      {/* HEADER */}
      <div className="digi-mentor-review-card-header">
        <div className="digi-mentor-review-card-user">
          <div className="digi-mentor-review-card-avatar">
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt={name} 
                className="digi-mentor-review-card-avatar-img"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className="digi-mentor-review-card-avatar-fallback"
              style={{ display: imageUrl ? 'none' : 'flex' }}
            >
              {getInitials(name)}
            </div>
          </div>
          <div className="digi-mentor-review-card-user-info">
            <h3 className="digi-mentor-review-card-name">{name}</h3>
            <p className="digi-mentor-review-card-role">{role}</p>
          </div>
        </div>

        {/* STATUS BADGE */}
        {status === 'approved' && (
          <div className="digi-mentor-review-card-badge">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>{t('digiMentorReviewCard.approved')}</span>
          </div>
        )}
      </div>

      {/* RATING & DATE */}
      <div className="digi-mentor-review-card-meta">
        <div className="digi-mentor-review-card-rating">
          <div className="digi-mentor-review-card-stars">
            {renderStars(rating)}
          </div>
          <span className="digi-mentor-review-card-rating-number">{rating.toFixed(1)}</span>
        </div>
        <div className="digi-mentor-review-card-date">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>{formatDate(approvedAt || createdAt)}</span>
        </div>
      </div>

      {/* REVIEW TEXT */}
      {text && (
        <div className="digi-mentor-review-card-text">
          <p className="digi-mentor-review-card-text-content">{displayText}</p>
          
          {needsTruncation && (
            <button
              className="digi-mentor-review-card-expand-btn"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded 
                ? t('digiMentorReviewCard.showLess') 
                : t('digiMentorReviewCard.showMore')
              }
              <svg 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className={isExpanded ? 'digi-mentor-review-card-expand-icon-rotated' : ''}
              >
                <path d="M19 9L12 16L5 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
        </div>
      )}

      {/* FOOTER - Optional helpful info */}
      <div className="digi-mentor-review-card-footer">
        <div className="digi-mentor-review-card-footer-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span className="digi-mentor-review-card-footer-text">
          {t('digiMentorReviewCard.thankYou')}
        </span>
      </div>
    </div>
  );
};