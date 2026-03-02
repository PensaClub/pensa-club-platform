// src/components/AdminDigiBridgeMentorApplications/AdminDigiBridgeApplicationCard/AdminDigiBridgeApplicationCard.jsx

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './adminDigiBridgeApplicationCard.css';

export const AdminDigiBridgeApplicationCard = ({ 
  application, 
  onViewDetails, 
  onSendEmail, 
  onApprove, 
  onReject 
}) => {
  const { t } = useTranslation('digibridge');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('bg-BG', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getLanguageFlags = (languages) => {
    const flagMap = {
      'bg': '🇧🇬',
      'en': '🇬🇧',
      'de': '🇩🇪',
      'fr': '🇫🇷',
      'es': '🇪🇸',
      'it': '🇮🇹'
    };
    return languages.map(lang => flagMap[lang] || '🌐').join(' ');
  };

  const handleRejectClick = () => {
    setShowRejectModal(true);
    setRejectionReason('');
  };

  const handleRejectConfirm = () => {
    if (!rejectionReason.trim()) {
      alert('Моля, въведете причина за отхвърляне');
      return;
    }
    onReject(application.id, rejectionReason);
    setShowRejectModal(false);
    setRejectionReason('');
  };

  const handleRejectCancel = () => {
    setShowRejectModal(false);
    setRejectionReason('');
  };

  return (
    <>
      <div className="admin-digibridge-application-card">
        {/* HEADER */}
        <div className="admin-digibridge-application-card-header">
          <img
            src={application.photoUrl}
            alt={application.name}
            className="admin-digibridge-application-card-photo"
            onError={(e) => {
              e.target.src = "/images/homePage/user-it.png";
            }}
          />
          <div className="admin-digibridge-application-card-badge">
            <span className="admin-digibridge-application-card-badge-icon">⏳</span>
            <span className="admin-digibridge-application-card-badge-text">
              {t('AdminDigiBridgeApplicationCard.pending')}
            </span>
          </div>
        </div>

        {/* CONTENT */}
        <div className="admin-digibridge-application-card-content">
          <h3 className="admin-digibridge-application-card-name">
            {application.name}
          </h3>

          <div className="admin-digibridge-application-card-specialization">
            <span className="admin-digibridge-application-card-spec-icon">🎓</span>
            {application.specialization}
          </div>

          <div className="admin-digibridge-application-card-info">
            <div className="admin-digibridge-application-card-info-item">
              <svg className="admin-digibridge-application-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <span>{application.email}</span>
            </div>

            <div className="admin-digibridge-application-card-info-item">
              <svg className="admin-digibridge-application-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <span>{application.phone}</span>
            </div>

            <div className="admin-digibridge-application-card-info-item">
              <svg className="admin-digibridge-application-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span>{formatDate(application.createdAt)}</span>
            </div>

            <div className="admin-digibridge-application-card-info-item">
              <span className="admin-digibridge-application-card-languages">
                {getLanguageFlags(application.languages)}
              </span>
            </div>
          </div>

          {/* EDUCATION SNIPPET */}
          {application.education && (
            <div className="admin-digibridge-application-card-education">
              <svg className="admin-digibridge-application-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
              <span>{application.education}</span>
            </div>
          )}

          {/* EXPERIENCE SNIPPET */}
          {application.experience && (
            <div className="admin-digibridge-application-card-experience">
              <svg className="admin-digibridge-application-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
              <span>{application.experience}</span>
            </div>
          )}
        </div>

        {/* ACTIONS */}
        <div className="admin-digibridge-application-card-actions">
          <button
            onClick={() => onViewDetails(application)}
            className="admin-digibridge-application-card-btn admin-digibridge-application-card-btn-view"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            {t('AdminDigiBridgeApplicationCard.viewDetails')}
          </button>

          <button
            onClick={() => onSendEmail(application)}
            className="admin-digibridge-application-card-btn admin-digibridge-application-card-btn-email"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            {t('AdminDigiBridgeApplicationCard.sendEmail')}
          </button>

          <div className="admin-digibridge-application-card-action-group">
            <button
              onClick={() => onApprove(application.id)}
              className="admin-digibridge-application-card-btn admin-digibridge-application-card-btn-approve"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {t('AdminDigiBridgeApplicationCard.approve')}
            </button>

            <button
              onClick={handleRejectClick}
              className="admin-digibridge-application-card-btn admin-digibridge-application-card-btn-reject"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              {t('AdminDigiBridgeApplicationCard.reject')}
            </button>
          </div>
        </div>
      </div>

      {/* REJECT MODAL */}
      {showRejectModal && (
        <div className="admin-digibridge-reject-modal-overlay" onClick={handleRejectCancel}>
          <div className="admin-digibridge-reject-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-digibridge-reject-modal-header">
              <h3>Отхвърляне на кандидатура</h3>
              <button className="admin-digibridge-reject-modal-close" onClick={handleRejectCancel}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="admin-digibridge-reject-modal-body">
              <p className="admin-digibridge-reject-modal-warning">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                Сигурни ли сте, че искате да отхвърлите кандидатурата на <strong>{application.name}</strong>?
              </p>

              <label className="admin-digibridge-reject-modal-label">
                Причина за отхвърляне: <span className="required">*</span>
              </label>
              <textarea
                className="admin-digibridge-reject-modal-textarea"
                placeholder="Въведете причина за отхвърляне..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows="4"
                autoFocus
              />
            </div>

            <div className="admin-digibridge-reject-modal-footer">
              <button
                className="admin-digibridge-reject-modal-btn-cancel"
                onClick={handleRejectCancel}
              >
                Откажи
              </button>
              <button
                className="admin-digibridge-reject-modal-btn-confirm"
                onClick={handleRejectConfirm}
                disabled={!rejectionReason.trim()}
              >
                Отхвърли кандидатурата
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};