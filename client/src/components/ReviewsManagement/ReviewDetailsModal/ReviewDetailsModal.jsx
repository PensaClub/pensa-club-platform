// src/components/ReviewsManagement/ReviewDetailsModal/ReviewDetailsModal.jsx

import { useTranslation } from 'react-i18next';
import './reviewDetailsModal.css';

export const ReviewDetailsModal = ({ 
  review, 
  isOpen, 
  onClose, 
  onApprove, 
  onReject, 
  onDelete 
}) => {
  const { t, i18n } = useTranslation('digibridge');

  if (!isOpen || !review) return null;

  const getStatusBadgeClass = (status) => {
    const baseClass = 'review-details-pensa-club-modal-status-badge';
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
        return t('modalReviewDetails.statusPending');
      case 'approved':
        return t('modalReviewDetails.statusApproved');
      case 'rejected':
        return t('modalReviewDetails.statusRejected');
      default:
        return status;
    }
  };

  const getTypeText = (type) => {
    switch (type) {
      case 'academy':
        return t('modalReviewDetails.typeAcademy');
      case 'mentor':
        return t('modalReviewDetails.typeMentor');
      case 'course':
        return t('modalReviewDetails.typeCourse');
      default:
        return type;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';

      const locale = i18n.language === 'bg' ? 'bg-BG' : 
                     i18n.language === 'de' ? 'de-DE' : 'en-GB';

      return date.toLocaleDateString(locale, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'N/A';
    }
  };

  return (
    <div className="review-details-pensa-club-modal-overlay" onClick={onClose}>
      <div 
        className="review-details-pensa-club-modal-content" 
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="review-details-pensa-club-modal-header">
          <h2 className="review-details-pensa-club-modal-title">
            {t('modalReviewDetails.title')}
          </h2>
          <button 
            className="review-details-pensa-club-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="review-details-pensa-club-modal-body">
          
          {/* User Info Section */}
          <div className="review-details-pensa-club-modal-section">
            <div className="review-details-pensa-club-modal-user-header">
              {review.imageUrl ? (
                <img 
                  src={review.imageUrl} 
                  alt={review.name}
                  className="review-details-pensa-club-modal-user-avatar"
                />
              ) : (
                <div className="review-details-pensa-club-modal-user-avatar-placeholder">
                  {review.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="review-details-pensa-club-modal-user-info">
                <h3 className="review-details-pensa-club-modal-user-name">{review.name}</h3>
                <p className="review-details-pensa-club-modal-user-email">{review.email}</p>
                <p className="review-details-pensa-club-modal-user-username">
                  @{review.user?.username || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Status & Type Badges */}
          <div className="review-details-pensa-club-modal-section">
            <div className="review-details-pensa-club-modal-badges">
              <div className="review-details-pensa-club-modal-badge-item">
                <span className="review-details-pensa-club-modal-badge-label">
                  {t('modalReviewDetails.status')}:
                </span>
                <span className={getStatusBadgeClass(review.status)}>
                  {getStatusText(review.status)}
                </span>
              </div>
              <div className="review-details-pensa-club-modal-badge-item">
                <span className="review-details-pensa-club-modal-badge-label">
                  {t('modalReviewDetails.type')}:
                </span>
                <span className="review-details-pensa-club-modal-type-badge">
                  {getTypeText(review.reviewType)}
                </span>
              </div>
              <div className="review-details-pensa-club-modal-badge-item">
                <span className="review-details-pensa-club-modal-badge-label">
                  {t('modalReviewDetails.role')}:
                </span>
                <span className="review-details-pensa-club-modal-role-badge">
                  {review.role === 'participant' 
                    ? t('modalReviewDetails.roleParticipant') 
                    : t('modalReviewDetails.roleMentor')}
                </span>
              </div>
            </div>
          </div>

          {/* Rating Section */}
          <div className="review-details-pensa-club-modal-section">
            <h4 className="review-details-pensa-club-modal-section-title">
              {t('modalReviewDetails.rating')}
            </h4>
            <div className="review-details-pensa-club-modal-rating">
              {[...Array(5)].map((_, i) => (
                <span 
                  key={i} 
                  className={`review-details-pensa-club-modal-star ${i < review.rating ? 'review-details-pensa-club-modal-star-filled' : ''}`}
                >
                  ★
                </span>
              ))}
              <span className="review-details-pensa-club-modal-rating-text">
                {review.rating}/5
              </span>
            </div>
          </div>

          {/* Review Text Section */}
          <div className="review-details-pensa-club-modal-section">
            <h4 className="review-details-pensa-club-modal-section-title">
              {t('modalReviewDetails.reviewText')}
            </h4>
            <div className="review-details-pensa-club-modal-text">
              <p>{review.text}</p>
            </div>
          </div>

          {/* Rejection Reason (if rejected) */}
          {review.status === 'rejected' && review.rejectionReason && (
            <div className="review-details-pensa-club-modal-section">
              <h4 className="review-details-pensa-club-modal-section-title review-details-pensa-club-modal-section-title-danger">
                {t('modalReviewDetails.rejectionReason')}
              </h4>
              <div className="review-details-pensa-club-modal-rejection">
                <p>{review.rejectionReason}</p>
                {review.rejecter && (
                  <p className="review-details-pensa-club-modal-rejection-by">
                    {t('modalReviewDetails.rejectedBy')}: <strong>{review.rejecter.name}</strong>
                  </p>
                )}
                {review.rejectedAt && (
                  <p className="review-details-pensa-club-modal-rejection-date">
                    {formatDate(review.rejectedAt)}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Approval Info (if approved) */}
          {review.status === 'approved' && review.approver && (
            <div className="review-details-pensa-club-modal-section">
              <h4 className="review-details-pensa-club-modal-section-title review-details-pensa-club-modal-section-title-success">
                {t('modalReviewDetails.approvalInfo')}
              </h4>
              <div className="review-details-pensa-club-modal-approval">
                <p>
                  {t('modalReviewDetails.approvedBy')}: <strong>{review.approver.name}</strong>
                </p>
                {review.approvedAt && (
                  <p className="review-details-pensa-club-modal-approval-date">
                    {formatDate(review.approvedAt)}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Metadata Section */}
          <div className="review-details-pensa-club-modal-section">
            <h4 className="review-details-pensa-club-modal-section-title">
              {t('modalReviewDetails.metadata')}
            </h4>
            <div className="review-details-pensa-club-modal-metadata">
              <div className="review-details-pensa-club-modal-meta-item">
                <span className="review-details-pensa-club-modal-meta-label">
                  {t('modalReviewDetails.submittedOn')}:
                </span>
                <span className="review-details-pensa-club-modal-meta-value">
                  {formatDate(review.createdAt)}
                </span>
              </div>
              <div className="review-details-pensa-club-modal-meta-item">
                <span className="review-details-pensa-club-modal-meta-label">
                  {t('modalReviewDetails.lastUpdated')}:
                </span>
                <span className="review-details-pensa-club-modal-meta-value">
                  {formatDate(review.updatedAt)}
                </span>
              </div>
              <div className="review-details-pensa-club-modal-meta-item">
                <span className="review-details-pensa-club-modal-meta-label">
                  ID:
                </span>
                <span className="review-details-pensa-club-modal-meta-value">
                  #{review.id}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer - Action Buttons */}
        <div className="review-details-pensa-club-modal-footer">
          
          {/* Approve Button (only for pending/rejected) */}
          {(review.status === 'pending' || review.status === 'rejected') && (
            <button
              className="review-details-pensa-club-modal-btn review-details-pensa-club-modal-btn-approve"
              onClick={() => {
                onApprove(review);
                onClose();
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {t('modalReviewDetails.approve')}
            </button>
          )}

          {/* Reject Button (only for pending/approved) */}
          {(review.status === 'pending' || review.status === 'approved') && (
            <button
              className="review-details-pensa-club-modal-btn review-details-pensa-club-modal-btn-reject"
              onClick={() => {
                onReject(review);
                onClose();
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              {t('modalReviewDetails.reject')}
            </button>
          )}

          {/* Delete Button */}
          <button
            className="review-details-pensa-club-modal-btn review-details-pensa-club-modal-btn-delete"
            onClick={() => {
              onDelete(review);
              onClose();
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            {t('modalReviewDetails.delete')}
          </button>

          {/* Close Button */}
          <button
            className="review-details-pensa-club-modal-btn review-details-pensa-club-modal-btn-close"
            onClick={onClose}
          >
            {t('modalReviewDetails.close')}
          </button>
        </div>

      </div>
    </div>
  );
};