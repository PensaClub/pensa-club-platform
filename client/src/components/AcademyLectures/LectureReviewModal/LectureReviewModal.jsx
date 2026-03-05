// src/components/AcademyLectures/LectureReviewModal/LectureReviewModal.jsx

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAcademyCourses } from '../../contexts/AcademyCoursesProvider';
import { useAuthContext } from '../../contexts/UserContext';
import { toast } from 'react-toastify';
import './lectureReviewModal.css';

export const LectureReviewModal = ({ isOpen, onClose, lecture, onSuccess }) => {
  const { t } = useTranslation('academy');
  const { createLectureReview } = useAcademyCourses();
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
      toast.error(t('lectureReviewModal.ratingRequired'));
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

      await createLectureReview(lecture.id, reviewData);

      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Error submitting lecture review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="lrm-overlay" onClick={handleSkip}>
      <div
        className="lrm-content"
        onClick={(e) => e.stopPropagation()}
      >

        {/* Header */}
        <div className="lrm-header">
          <div className="lrm-icon">⭐</div>
          <h2 className="lrm-title">
            {t('lectureReviewModal.title')}
          </h2>
          <p className="lrm-subtitle">
            {t('lectureReviewModal.subtitle')}
          </p>
          <button
            className="lrm-close"
            onClick={handleSkip}
            aria-label="Close"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Lecture Info */}
        <div className="lrm-lecture-info">
          {lecture.imageUrl ? (
            <img
              src={lecture.imageUrl}
              alt={lecture.title}
              className="lrm-lecture-image"
            />
          ) : (
            <div className="lrm-lecture-image-placeholder">
              {lecture.title?.charAt(0)?.toUpperCase() || 'L'}
            </div>
          )}
          <div className="lrm-lecture-details">
            <h3 className="lrm-lecture-name">{lecture.title}</h3>
            {lecture.category && (
              <p className="lrm-lecture-category">
                {lecture.category}
              </p>
            )}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="lrm-form">

          {/* Rating */}
          <div className="lrm-field">
            <label className="lrm-label">
              {t('lectureReviewModal.ratingLabel')} *
            </label>
            <div className="lrm-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`lrm-star ${
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
              <p className="lrm-rating-text">
                {rating === 1 && t('lectureReviewModal.rating1')}
                {rating === 2 && t('lectureReviewModal.rating2')}
                {rating === 3 && t('lectureReviewModal.rating3')}
                {rating === 4 && t('lectureReviewModal.rating4')}
                {rating === 5 && t('lectureReviewModal.rating5')}
              </p>
            )}
          </div>

          {/* Text (Optional) */}
          <div className="lrm-field">
            <label className="lrm-label">
              {t('lectureReviewModal.textLabel')} <span className="lrm-optional">({t('lectureReviewModal.optional')})</span>
            </label>
            <textarea
              className="lrm-textarea"
              placeholder={t('lectureReviewModal.textPlaceholder')}
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              maxLength={1000}
            />
            <p className="lrm-char-count">
              {text.length} / 1000
            </p>
          </div>

          {/* Buttons */}
          <div className="lrm-buttons">
            <button
              type="button"
              className="lrm-btn lrm-btn-skip"
              onClick={handleSkip}
              disabled={isSubmitting}
            >
              {t('lectureReviewModal.skip')}
            </button>
            <button
              type="submit"
              className="lrm-btn lrm-btn-submit"
              disabled={rating === 0 || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="lrm-spinner"></span>
                  {t('lectureReviewModal.submitting')}
                </>
              ) : (
                t('lectureReviewModal.submit')
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};