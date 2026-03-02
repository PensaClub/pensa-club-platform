// src/components/ReviewsManagement/ReviewActionModal/ReviewActionModal.jsx

import React from 'react';
import { useTranslation } from 'react-i18next';
import './reviewActionModal.css';

export const ReviewActionModal = ({ 
  review,
  actionType,
  rejectionReason,
  onReasonChange,
  onConfirm,
  onCancel,
  isOpen
}) => {
  const { t } = useTranslation('digibridge');

  if (!isOpen || !review) return null;

  const getModalConfig = () => {
    switch (actionType) {
      case 'approve':
        return {
          icon: '✅',
          iconClass: 'review-action-pensa-club-modal-icon-approve',
          title: t('modalReviewAction.approveTitle'),
          message: t('modalReviewAction.approveMessage', { name: review.name }),
          confirmText: t('modalReviewAction.confirmApprove'),
          confirmClass: 'review-action-pensa-club-modal-btn-approve'
        };
      case 'reject':
        return {
          icon: '❌',
          iconClass: 'review-action-pensa-club-modal-icon-reject',
          title: t('modalReviewAction.rejectTitle'),
          message: t('modalReviewAction.rejectMessage', { name: review.name }),
          confirmText: t('modalReviewAction.confirmReject'),
          confirmClass: 'review-action-pensa-club-modal-btn-reject',
          requiresReason: true
        };
      case 'delete':
        return {
          icon: '🗑️',
          iconClass: 'review-action-pensa-club-modal-icon-delete',
          title: t('modalReviewAction.deleteTitle'),
          message: t('modalReviewAction.deleteMessage', { name: review.name }),
          confirmText: t('modalReviewAction.confirmDelete'),
          confirmClass: 'review-action-pensa-club-modal-btn-delete'
        };
      default:
        return {};
    }
  };

  const config = getModalConfig();

  const handleConfirm = () => {
    if (config.requiresReason && !rejectionReason.trim()) {
      return;
    }
    onConfirm();
  };

  return (
    <div className="review-action-pensa-club-modal-overlay" onClick={onCancel}>
      <div 
        className="review-action-pensa-club-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Icon */}
        <div className={`review-action-pensa-club-modal-icon ${config.iconClass}`}>
          {config.icon}
        </div>

        {/* Title */}
        <h2 className="review-action-pensa-club-modal-title">
          {config.title}
        </h2>

        {/* Message */}
        <p className="review-action-pensa-club-modal-message">
          {config.message}
        </p>

        {/* Review Preview */}
        <div className="review-action-pensa-club-modal-preview">
          <div className="review-action-pensa-club-modal-preview-header">
            {review.imageUrl ? (
              <img 
                src={review.imageUrl} 
                alt={review.name}
                className="review-action-pensa-club-modal-preview-avatar"
              />
            ) : (
              <div className="review-action-pensa-club-modal-preview-avatar-placeholder">
                {review.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="review-action-pensa-club-modal-preview-info">
              <h4 className="review-action-pensa-club-modal-preview-name">{review.name}</h4>
              <p className="review-action-pensa-club-modal-preview-email">{review.email}</p>
            </div>
          </div>

          <div className="review-action-pensa-club-modal-preview-rating">
            {[...Array(5)].map((_, i) => (
              <span 
                key={i} 
                className={`review-action-pensa-club-modal-preview-star ${i < review.rating ? 'review-action-pensa-club-modal-preview-star-filled' : ''}`}
              >
                ★
              </span>
            ))}
          </div>

          <p className="review-action-pensa-club-modal-preview-text">
            {review.text.length > 100 ? `${review.text.substring(0, 100)}...` : review.text}
          </p>
        </div>

        {/* Rejection Reason Input (only for reject) */}
        {config.requiresReason && (
          <div className="review-action-pensa-club-modal-reason">
            <label className="review-action-pensa-club-modal-reason-label">
              {t('modalReviewAction.rejectionReasonLabel')} *
            </label>
            <textarea
              className="review-action-pensa-club-modal-reason-input"
              placeholder={t('modalReviewAction.rejectionReasonPlaceholder')}
              value={rejectionReason}
              onChange={(e) => onReasonChange(e.target.value)}
              rows={4}
              required
            />
            {rejectionReason.trim().length === 0 && (
              <p className="review-action-pensa-club-modal-reason-hint">
                {t('modalReviewAction.rejectionReasonHint')}
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="review-action-pensa-club-modal-actions">
          <button
            className="review-action-pensa-club-modal-btn review-action-pensa-club-modal-btn-cancel"
            onClick={onCancel}
          >
            {t('modalReviewAction.cancel')}
          </button>
          <button
            className={`review-action-pensa-club-modal-btn ${config.confirmClass}`}
            onClick={handleConfirm}
            disabled={config.requiresReason && !rejectionReason.trim()}
          >
            {config.confirmText}
          </button>
        </div>

      </div>
    </div>
  );
};