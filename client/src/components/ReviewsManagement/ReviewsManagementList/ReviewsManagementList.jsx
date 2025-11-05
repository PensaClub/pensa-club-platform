// src/components/ReviewsManagement/ReviewsManagementList/ReviewsManagementList.jsx

import React from 'react';
import { useTranslation } from 'react-i18next';
import './reviewsManagementList.css';

export const ReviewsManagementList = ({ 
  reviews, 
  loading, 
  onViewReview, 
  onApprove, 
  onReject, 
  onDelete 
}) => {
  const { t } = useTranslation();

  const getStatusBadgeClass = (status) => {
    const baseClass = 'reviews-management-pensa-club-list-status-badge';
    switch (status) {
      case 'pending':
        return `${baseClass} ${baseClass}-pending`;
      case 'approved':
        return `${baseClass} ${baseClass}-approved`;
      case 'rejected':
        return `${baseClass} ${baseClass}-rejected`;
      default:
        return baseClass;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return t('listReviewsManagement.statusPending');
      case 'approved':
        return t('listReviewsManagement.statusApproved');
      case 'rejected':
        return t('listReviewsManagement.statusRejected');
      default:
        return status;
    }
  };

  const getTypeText = (type) => {
    switch (type) {
      case 'academy':
        return t('listReviewsManagement.typeAcademy');
      case 'mentor':
        return t('listReviewsManagement.typeMentor');
      case 'course':
        return t('listReviewsManagement.typeCourse');
      default:
        return type;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('bg-BG', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="reviews-management-pensa-club-list-loading">
        <div className="reviews-management-pensa-club-list-spinner"></div>
        <p>{t('listReviewsManagement.loading')}</p>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="reviews-management-pensa-club-list-empty">
        <div className="reviews-management-pensa-club-list-empty-icon">📭</div>
        <h3>{t('listReviewsManagement.noReviews')}</h3>
        <p>{t('listReviewsManagement.noReviewsMessage')}</p>
      </div>
    );
  }

  return (
    <div className="reviews-management-pensa-club-list">
      <div className="reviews-management-pensa-club-list-container">
        
        {reviews.map((review) => (
          <div 
            key={review.id} 
            className="reviews-management-pensa-club-list-card"
          >
            
            {/* Card Header */}
            <div className="reviews-management-pensa-club-list-card-header">
              
              {/* User Info */}
              <div className="reviews-management-pensa-club-list-user-info">
                {review.imageUrl ? (
                  <img 
                    src={review.imageUrl} 
                    alt={review.name}
                    className="reviews-management-pensa-club-list-user-avatar"
                  />
                ) : (
                  <div className="reviews-management-pensa-club-list-user-avatar-placeholder">
                    {review.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="reviews-management-pensa-club-list-user-details">
                  <h4 className="reviews-management-pensa-club-list-user-name">{review.name}</h4>
                  <p className="reviews-management-pensa-club-list-user-email">{review.email}</p>
                </div>
              </div>

              {/* Status & Type Badges */}
              <div className="reviews-management-pensa-club-list-badges">
                <span className={getStatusBadgeClass(review.status)}>
                  {getStatusText(review.status)}
                </span>
                <span className="reviews-management-pensa-club-list-type-badge">
                  {getTypeText(review.reviewType)}
                </span>
              </div>
            </div>

            {/* Rating */}
            <div className="reviews-management-pensa-club-list-rating">
              {[...Array(5)].map((_, i) => (
                <span 
                  key={i} 
                  className={`reviews-management-pensa-club-list-star ${i < review.rating ? 'reviews-management-pensa-club-list-star-filled' : ''}`}
                >
                  ★
                </span>
              ))}
              <span className="reviews-management-pensa-club-list-rating-text">
                {review.rating}/5
              </span>
            </div>

            {/* Review Text Preview */}
            <div className="reviews-management-pensa-club-list-text">
              <p>{review.text.length > 150 ? `${review.text.substring(0, 150)}...` : review.text}</p>
            </div>

            {/* Metadata */}
            <div className="reviews-management-pensa-club-list-metadata">
              <div className="reviews-management-pensa-club-list-meta-item">
                <span className="reviews-management-pensa-club-list-meta-label">
                  {t('listReviewsManagement.role')}:
                </span>
                <span className="reviews-management-pensa-club-list-meta-value">
                  {review.role === 'participant' ? t('listReviewsManagement.roleParticipant') : t('listReviewsManagement.roleMentor')}
                </span>
              </div>
              <div className="reviews-management-pensa-club-list-meta-item">
                <span className="reviews-management-pensa-club-list-meta-label">
                  {t('listReviewsManagement.submittedOn')}:
                </span>
                <span className="reviews-management-pensa-club-list-meta-value">
                  {formatDate(review.createdAt)}
                </span>
              </div>
            </div>

            {/* Rejection Reason (if rejected) */}
            {review.status === 'rejected' && review.rejectionReason && (
              <div className="reviews-management-pensa-club-list-rejection">
                <strong>{t('listReviewsManagement.rejectionReason')}:</strong>
                <p>{review.rejectionReason}</p>
              </div>
            )}

            {/* Actions */}
            <div className="reviews-management-pensa-club-list-actions">
              
              {/* View Button */}
              <button
                className="reviews-management-pensa-club-list-action-btn reviews-management-pensa-club-list-action-view"
                onClick={() => onViewReview(review)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                {t('listReviewsManagement.view')}
              </button>

              {/* Approve Button (only for pending/rejected) */}
              {(review.status === 'pending' || review.status === 'rejected') && (
                <button
                  className="reviews-management-pensa-club-list-action-btn reviews-management-pensa-club-list-action-approve"
                  onClick={() => onApprove(review)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {t('listReviewsManagement.approve')}
                </button>
              )}

              {/* Reject Button (only for pending/approved) */}
              {(review.status === 'pending' || review.status === 'approved') && (
                <button
                  className="reviews-management-pensa-club-list-action-btn reviews-management-pensa-club-list-action-reject"
                  onClick={() => onReject(review)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                  {t('listReviewsManagement.reject')}
                </button>
              )}

              {/* Delete Button */}
              <button
                className="reviews-management-pensa-club-list-action-btn reviews-management-pensa-club-list-action-delete"
                onClick={() => onDelete(review)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                {t('listReviewsManagement.delete')}
              </button>
            </div>

          </div>
        ))}

      </div>
    </div>
  );
};