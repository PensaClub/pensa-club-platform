// src/components/Profile/ProfileReviews.jsx

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAcademy } from '../contexts/AcademyProvider';
import './profileReviews.css';

export const ProfileReviews = () => {
  const { t, i18n } = useTranslation('digibridge');
  const { getUserReviews } = useAcademy();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const result = await getUserReviews();
        setReviews(result?.reviews || []);
      } catch (error) {
        console.error('Error fetching user reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [getUserReviews]);

  const getTypeText = (type) => {
    switch (type) {
      case 'academy':
        return t('profileReviews.typeAcademy');
      case 'mentor':
        return t('profileReviews.typeMentor');
      case 'course':
        return t('profileReviews.typeCourse');
      case 'lecture':
        return t('profileReviews.typeLecture');
      default:
        return type;
    }
  };

  const getTypeBadgeClass = (type) => {
    const baseClass = 'pr-type-badge';
    switch (type) {
      case 'academy':
        return `${baseClass} pr-type-badge-academy`;
      case 'mentor':
        return `${baseClass} pr-type-badge-mentor`;
      case 'course':
        return `${baseClass} pr-type-badge-course`;
      case 'lecture':
        return `${baseClass} pr-type-badge-lecture`;
      default:
        return baseClass;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return t('profileReviews.statusPending');
      case 'approved':
        return t('profileReviews.statusApproved');
      case 'rejected':
        return t('profileReviews.statusRejected');
      default:
        return status;
    }
  };

  const getStatusBadgeClass = (status) => {
    const baseClass = 'pr-status-badge';
    switch (status) {
      case 'pending':
        return `${baseClass} pr-status-badge-pending`;
      case 'approved':
        return `${baseClass} pr-status-badge-approved`;
      case 'rejected':
        return `${baseClass} pr-status-badge-rejected`;
      default:
        return baseClass;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const locale = i18n.language === 'bg' ? 'bg-BG' :
                     i18n.language === 'de' ? 'de-DE' : 'en-GB';
      return date.toLocaleDateString(locale, {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return '';
    }
  };

  if (loading) {
    return (
      <div className="pr-loading">
        <div className="pr-spinner"></div>
        <p>{t('profileReviews.loading')}</p>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="pr-container">
        <h2 className="pr-title">{t('profileReviews.title')}</h2>
        <div className="pr-empty">
          <div className="pr-empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
          </div>
          <h3>{t('profileReviews.noReviews')}</h3>
          <p>{t('profileReviews.noReviewsDesc')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pr-container">
      <h2 className="pr-title">{t('profileReviews.title')}</h2>

      <div className="pr-list">
        {reviews.map((review) => (
          <div key={review.id} className="pr-card">
            <div className="pr-card-header">
              <div className="pr-badges">
                <span className={getTypeBadgeClass(review.reviewType)}>
                  {getTypeText(review.reviewType)}
                </span>
                <span className={getStatusBadgeClass(review.status)}>
                  {getStatusText(review.status)}
                </span>
              </div>
            </div>

            {review.targetName && (
              <div className="pr-target-name">
                {review.targetName}
              </div>
            )}

            <div className="pr-rating">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className={`pr-star ${i < review.rating ? 'pr-star-filled' : ''}`}
                >
                  ★
                </span>
              ))}
              <span className="pr-rating-text">{review.rating}/5</span>
            </div>

            {review.text && (
              <p className="pr-text">
                {review.text.length > 200 ? `${review.text.substring(0, 200)}...` : review.text}
              </p>
            )}

            {review.status === 'rejected' && review.rejectionReason && (
              <div className="pr-rejection">
                <strong>{t('profileReviews.rejectionReason')}:</strong>
                <p>{review.rejectionReason}</p>
              </div>
            )}

            <div className="pr-date">
              {t('profileReviews.submittedOn')}: {formatDate(review.createdAt)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
