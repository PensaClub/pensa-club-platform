// src/components/DigiBridge/MentorReviewModal/MentorReviewModal.jsx

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAcademy } from '../../contexts/AcademyProvider';
import { useAuthContext } from '../../contexts/UserContext';
import { toast } from 'react-toastify';
import './mentorReviewModal.css';

export const MentorReviewModal = ({ mentor, onClose, onSuccess }) => {
  const { t } = useTranslation('digibridge');
  const { createMentorReview } = useAcademy();
  const { profileData } = useAuthContext();
  
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userName = profileData?.details?.username || 
                   profileData?.details?.firstName || 
                   profileData?.email?.split('@')[0] || 
                   'Потребител';
  
  const userEmail = profileData?.email || '';

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error(t('mentorReviewModal.ratingRequired'));
      return;
    }

    setIsSubmitting(true);

    try {
      const reviewData = {
        name: userName,
        email: userEmail,
        role: 'participant',
        rating: rating,
        text: text.trim() || undefined
      };

      await createMentorReview(mentor.id, reviewData);
      
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <div className="mentor-review-modal-overlay" onClick={handleSkip}>
      <div 
        className="mentor-review-modal-content" 
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="mentor-review-modal-header">
          <div className="mentor-review-modal-icon">⭐</div>
          <h2 className="mentor-review-modal-title">
            {t('mentorReviewModal.title')}
          </h2>
          <p className="mentor-review-modal-subtitle">
            {t('mentorReviewModal.subtitle')}
          </p>
          <button 
            className="mentor-review-modal-close"
            onClick={handleSkip}
            aria-label="Close"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Mentor Info */}
        <div className="mentor-review-modal-mentor-info">
          {mentor.photoUrl ? (
            <img 
              src={mentor.photoUrl} 
              alt={mentor.name}
              className="mentor-review-modal-mentor-avatar"
            />
          ) : (
            <div className="mentor-review-modal-mentor-avatar-placeholder">
              {mentor.name?.charAt(0)?.toUpperCase() || 'M'}
            </div>
          )}
          <div className="mentor-review-modal-mentor-details">
            <h3 className="mentor-review-modal-mentor-name">{mentor.name}</h3>
            {mentor.specialization && (
              <p className="mentor-review-modal-mentor-specialization">
                {mentor.specialization}
              </p>
            )}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mentor-review-modal-form">
          
          {/* Rating */}
          <div className="mentor-review-modal-field">
            <label className="mentor-review-modal-label">
              {t('mentorReviewModal.ratingLabel')} *
            </label>
            <div className="mentor-review-modal-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`mentor-review-modal-star ${
                    star <= (hoveredRating || rating) ? 'filled' : ''
                  }`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                >
                  ★
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="mentor-review-modal-rating-text">
                {rating === 1 && t('mentorReviewModal.rating1')}
                {rating === 2 && t('mentorReviewModal.rating2')}
                {rating === 3 && t('mentorReviewModal.rating3')}
                {rating === 4 && t('mentorReviewModal.rating4')}
                {rating === 5 && t('mentorReviewModal.rating5')}
              </p>
            )}
          </div>

          {/* Text (Optional) */}
          <div className="mentor-review-modal-field">
            <label className="mentor-review-modal-label">
              {t('mentorReviewModal.textLabel')} <span className="mentor-review-modal-optional">({t('mentorReviewModal.optional')})</span>
            </label>
            <textarea
              className="mentor-review-modal-textarea"
              placeholder={t('mentorReviewModal.textPlaceholder')}
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              maxLength={1000}
            />
            <p className="mentor-review-modal-char-count">
              {text.length} / 1000
            </p>
          </div>

          {/* Buttons */}
          <div className="mentor-review-modal-buttons">
            <button
              type="button"
              className="mentor-review-modal-btn mentor-review-modal-btn-skip"
              onClick={handleSkip}
              disabled={isSubmitting}
            >
              {t('mentorReviewModal.skip')}
            </button>
            <button
              type="submit"
              className="mentor-review-modal-btn mentor-review-modal-btn-submit"
              disabled={rating === 0 || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="mentor-review-modal-spinner"></span>
                  {t('mentorReviewModal.submitting')}
                </>
              ) : (
                t('mentorReviewModal.submit')
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};