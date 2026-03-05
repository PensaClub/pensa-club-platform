// src/components/AcademyCourses/CourseReviewModal/CourseReviewModal.jsx

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAcademyCourses } from '../../contexts/AcademyCoursesProvider';
import { useAuthContext } from '../../contexts/UserContext';
import { toast } from 'react-toastify';
import './courseReviewModal.css';

export const CourseReviewModal = ({ isOpen, onClose, course, onSuccess }) => {
  const { t } = useTranslation('academy');
  const { createCourseReview } = useAcademyCourses();
  const { profileData } = useAuthContext();

  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [text, setText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userName = profileData?.details?.username ||
                   profileData?.details?.firstName ||
                   profileData?.email?.split('@')[0] ||
                   'Потребител';

  const userEmail = profileData?.email || '';

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error(t('courseReviewModal.ratingRequired'));
      return;
    }

    setIsSubmitting(true);

    try {
      const reviewData = {
        name: isAnonymous ? t('courseReviewModal.anonymousName', 'Анонимен') : userName,
        email: userEmail,
        role: 'participant',
        rating: rating,
        text: text.trim() || undefined,
        isAnonymous
      };

      await createCourseReview(course.id, reviewData);

      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Error submitting course review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="crm-overlay" onClick={handleSkip}>
      <div
        className="crm-content"
        onClick={(e) => e.stopPropagation()}
      >

        {/* Header */}
        <div className="crm-header">
          <div className="crm-icon">⭐</div>
          <h2 className="crm-title">
            {t('courseReviewModal.title')}
          </h2>
          <p className="crm-subtitle">
            {t('courseReviewModal.subtitle')}
          </p>
          <button
            className="crm-close"
            onClick={handleSkip}
            aria-label="Close"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Course Info */}
        <div className="crm-course-info">
          {course.imageUrl ? (
            <img
              src={course.imageUrl}
              alt={course.title}
              className="crm-course-image"
            />
          ) : (
            <div className="crm-course-image-placeholder">
              {course.title?.charAt(0)?.toUpperCase() || 'C'}
            </div>
          )}
          <div className="crm-course-details">
            <h3 className="crm-course-name">{course.title}</h3>
            {course.category && (
              <p className="crm-course-category">
                {course.category}
              </p>
            )}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="crm-form">

          {/* Rating */}
          <div className="crm-field">
            <label className="crm-label">
              {t('courseReviewModal.ratingLabel')} *
            </label>
            <div className="crm-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`crm-star ${
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
              <p className="crm-rating-text">
                {rating === 1 && t('courseReviewModal.rating1')}
                {rating === 2 && t('courseReviewModal.rating2')}
                {rating === 3 && t('courseReviewModal.rating3')}
                {rating === 4 && t('courseReviewModal.rating4')}
                {rating === 5 && t('courseReviewModal.rating5')}
              </p>
            )}
          </div>

          {/* Text (Optional) */}
          <div className="crm-field">
            <label className="crm-label">
              {t('courseReviewModal.textLabel')} <span className="crm-optional">({t('courseReviewModal.optional')})</span>
            </label>
            <textarea
              className="crm-textarea"
              placeholder={t('courseReviewModal.textPlaceholder')}
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              maxLength={1000}
            />
            <p className="crm-char-count">
              {text.length} / 1000
            </p>
          </div>

          {/* Anonymous toggle */}
          <label className="crm-anonymous">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="crm-anonymous-checkbox"
            />
            <span className="crm-anonymous-label">
              {t('courseReviewModal.anonymous', 'Анонимен отзив')}
            </span>
            <span className="crm-anonymous-hint">
              {isAnonymous
                ? t('courseReviewModal.anonymousHint', 'Името ви няма да бъде показано')
                : t('courseReviewModal.publicHint', 'Ще бъде показано като: ') + userName
              }
            </span>
          </label>

          {/* Buttons */}
          <div className="crm-buttons">
            <button
              type="button"
              className="crm-btn crm-btn-skip"
              onClick={handleSkip}
              disabled={isSubmitting}
            >
              {t('courseReviewModal.skip')}
            </button>
            <button
              type="submit"
              className="crm-btn crm-btn-submit"
              disabled={rating === 0 || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="crm-spinner"></span>
                  {t('courseReviewModal.submitting')}
                </>
              ) : (
                t('courseReviewModal.submit')
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};