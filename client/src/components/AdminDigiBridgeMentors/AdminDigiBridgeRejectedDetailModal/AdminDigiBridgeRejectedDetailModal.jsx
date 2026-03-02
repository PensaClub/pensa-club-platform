// src/components/AdminDigiBridgeMentors/AdminDigiBridgeRejectedDetailModal/AdminDigiBridgeRejectedDetailModal.jsx

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import './adminDigiBridgeRejectedDetailModal.css';

export const AdminDigiBridgeRejectedDetailModal = ({ application, onClose, onApprove, onSendEmail }) => {
  const { t } = useTranslation('digibridge');
  const [copiedField, setCopiedField] = useState(null);

  // ЗАЩИТА
  if (!application) {
    return null;
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('bg-BG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  const getCountryName = (code) => {
    const countries = {
      'BG': '🇧🇬 България',
      'DE': '🇩🇪 Германия',
      'AT': '🇦🇹 Австрия',
      'GR': '🇬🇷 Гърция',
      'RO': '🇷🇴 Румъния',
      'RS': '🇷🇸 Сърбия',
      'MK': '🇲🇰 Северна Македония',
      'TR': '🇹🇷 Турция',
      'OTHER': '🌍 Друга'
    };
    return countries[code] || code;
  };
  const handleCopy = async (text, fieldName) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      toast.success(t('AdminDigiBridgeMentors.RejectedDetailModal.copied'));

      setTimeout(() => {
        setCopiedField(null);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error(t('AdminDigiBridgeMentors.RejectedDetailModal.copyError'));
    }
  };

  const handleApprove = () => {
    if (window.confirm(t('AdminDigiBridgeMentors.RejectedDetailModal.confirmApprove'))) {
      onApprove(application.id);
      onClose();
    }
  };

  const handleSendEmail = () => {
    if (onSendEmail) {
      onSendEmail();
    } else {
      console.warn('onSendEmail handler is not provided');
    }
  };

  return (
    <div className="admin-digibridge-rejected-detail-modal-overlay" onClick={onClose}>
      <div
        className="admin-digibridge-rejected-detail-modal"
        onClick={(e) => e.stopPropagation()}
      >

        {/* HEADER */}
        <div className="admin-digibridge-rejected-detail-modal-header">
          <h2>{t('AdminDigiBridgeMentors.RejectedDetailModal.title')}</h2>
          <button
            className="admin-digibridge-rejected-detail-modal-close"
            onClick={onClose}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* CONTENT */}
        <div className="admin-digibridge-rejected-detail-modal-content">

          {/* PROFILE SECTION */}
          <div className="admin-digibridge-rejected-detail-section">
            <div className="admin-digibridge-rejected-detail-profile">
              <img src={application.photoUrl} alt={application.name} />
              <div className="admin-digibridge-rejected-detail-profile-info">
                <h3>{application.name}</h3>
                <p className="admin-digibridge-rejected-detail-age">
                  {application.age} {t('AdminDigiBridgeMentors.RejectedDetailModal.years')}
                </p>
              </div>
            </div>

            <div className="admin-digibridge-rejected-detail-spec-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
              {application.specialization}
            </div>
          </div>

          {/* REJECTION REASON */}
          <div className="admin-digibridge-rejected-detail-section">
            <div className="admin-digibridge-rejected-detail-rejection-box">
              <div className="admin-digibridge-rejected-detail-rejection-header">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                <h4>{t('AdminDigiBridgeMentors.RejectedDetailModal.rejectionReason')}</h4>
              </div>
              <p>{application.rejectionReason}</p>
            </div>
          </div>

          {/* CONTACT INFO */}
          <div className="admin-digibridge-rejected-detail-section">
            <h4 className="admin-digibridge-rejected-detail-section-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              {t('AdminDigiBridgeMentors.RejectedDetailModal.contactInfo')}
            </h4>

            <div className="admin-digibridge-rejected-detail-info-grid">

              {/* EMAIL */}
              <div className="admin-digibridge-rejected-detail-info-item-with-copy">
                <div className="admin-digibridge-rejected-detail-info-item">
                  <span className="admin-digibridge-rejected-detail-info-label">Email:</span>
                  {onSendEmail ? (
                    <button
                      className="admin-digibridge-rejected-detail-info-value admin-digibridge-rejected-detail-email-link"
                      onClick={handleSendEmail}
                    >
                      {application.email}
                    </button>
                  ) : (
                    <a href={`mailto:${application.email}`} className="admin-digibridge-rejected-detail-info-value">
                      {application.email}
                    </a>
                  )}
                </div>
                <button
                  className={`admin-digibridge-rejected-detail-copy-btn ${copiedField === 'email' ? 'copied' : ''}`}
                  onClick={() => handleCopy(application.email, 'email')}
                  title={t('AdminDigiBridgeMentors.RejectedDetailModal.copyToClipboard')}
                >
                  {copiedField === 'email' ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                  )}
                </button>
              </div>

              {/* PHONE */}
              <div className="admin-digibridge-rejected-detail-info-item-with-copy">
                <div className="admin-digibridge-rejected-detail-info-item">
                  <span className="admin-digibridge-rejected-detail-info-label">{t('AdminDigiBridgeMentors.RejectedDetailModal.phone')}:</span>
                  <a href={`tel:${application.phone}`} className="admin-digibridge-rejected-detail-info-value">
                    {application.phone}
                  </a>
                </div>
                <button
                  className={`admin-digibridge-rejected-detail-copy-btn ${copiedField === 'phone' ? 'copied' : ''}`}
                  onClick={() => handleCopy(application.phone, 'phone')}
                  title={t('AdminDigiBridgeMentors.RejectedDetailModal.copyToClipboard')}
                >
                  {copiedField === 'phone' ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                  )}
                </button>
              </div>
              {/* COUNTRY */}
              <div className="admin-digibridge-rejected-detail-info-item-with-copy">
                <div className="admin-digibridge-rejected-detail-info-item">
                  <span className="admin-digibridge-rejected-detail-info-label">{t('AdminDigiBridgeMentors.DetailModal.country')}:</span>
                  <span className="admin-digibridge-rejected-detail-info-value">{getCountryName(application.country)}</span>
                </div>
                <button
                  className={`admin-digibridge-rejected-detail-copy-btn ${copiedField === 'country' ? 'copied' : ''}`}
                  onClick={() => handleCopy(application.country, 'country')}
                  title={t('AdminDigiBridgeMentors.DetailModal.copyToClipboard')}
                >
                  {copiedField === 'country' ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                  )}
                </button>
              </div>
              {/* VIBER */}
              {application.viber && (
                <div className="admin-digibridge-rejected-detail-info-item-with-copy">
                  <div className="admin-digibridge-rejected-detail-info-item">
                    <span className="admin-digibridge-rejected-detail-info-label">Viber:</span>
                    <span className="admin-digibridge-rejected-detail-info-value">{application.viber}</span>
                  </div>
                  <button
                    className={`admin-digibridge-rejected-detail-copy-btn ${copiedField === 'viber' ? 'copied' : ''}`}
                    onClick={() => handleCopy(application.viber, 'viber')}
                    title={t('AdminDigiBridgeMentors.RejectedDetailModal.copyToClipboard')}
                  >
                    {copiedField === 'viber' ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                    )}
                  </button>
                </div>
              )}

              {/* FACEBOOK */}
              {application.facebook && (
                <div className="admin-digibridge-rejected-detail-info-item-with-copy">
                  <div className="admin-digibridge-rejected-detail-info-item">
                    <span className="admin-digibridge-rejected-detail-info-label">Facebook:</span>
                    <a
                      href={application.facebook.startsWith('http') ? application.facebook : `https://${application.facebook}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="admin-digibridge-rejected-detail-info-value"
                    >
                      {application.facebook}
                    </a>
                  </div>
                  <button
                    className={`admin-digibridge-rejected-detail-copy-btn ${copiedField === 'facebook' ? 'copied' : ''}`}
                    onClick={() => handleCopy(application.facebook, 'facebook')}
                    title={t('AdminDigiBridgeMentors.RejectedDetailModal.copyToClipboard')}
                  >
                    {copiedField === 'facebook' ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                    )}
                  </button>
                </div>
              )}

              {/* LINKEDIN */}
              {application.linkedin && (
                <div className="admin-digibridge-rejected-detail-info-item-with-copy">
                  <div className="admin-digibridge-rejected-detail-info-item">
                    <span className="admin-digibridge-rejected-detail-info-label">LinkedIn:</span>
                    <a
                      href={application.linkedin.startsWith('http') ? application.linkedin : `https://${application.linkedin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="admin-digibridge-rejected-detail-info-value"
                    >
                      {application.linkedin}
                    </a>
                  </div>
                  <button
                    className={`admin-digibridge-rejected-detail-copy-btn ${copiedField === 'linkedin' ? 'copied' : ''}`}
                    onClick={() => handleCopy(application.linkedin, 'linkedin')}
                    title={t('AdminDigiBridgeMentors.RejectedDetailModal.copyToClipboard')}
                  >
                    {copiedField === 'linkedin' ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                    )}
                  </button>
                </div>
              )}

              {/* OTHER CONTACT */}
              {application.otherContact && (
                <div className="admin-digibridge-rejected-detail-info-item-with-copy">
                  <div className="admin-digibridge-rejected-detail-info-item">
                    <span className="admin-digibridge-rejected-detail-info-label">{t('AdminDigiBridgeMentors.RejectedDetailModal.otherContact')}:</span>
                    <span className="admin-digibridge-rejected-detail-info-value">{application.otherContact}</span>
                  </div>
                  <button
                    className={`admin-digibridge-rejected-detail-copy-btn ${copiedField === 'otherContact' ? 'copied' : ''}`}
                    onClick={() => handleCopy(application.otherContact, 'otherContact')}
                    title={t('AdminDigiBridgeMentors.RejectedDetailModal.copyToClipboard')}
                  >
                    {copiedField === 'otherContact' ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* EDUCATION & EXPERIENCE */}
          {(application.education || application.experience) && (
            <div className="admin-digibridge-rejected-detail-section">
              <h4 className="admin-digibridge-rejected-detail-section-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
                {t('AdminDigiBridgeMentors.RejectedDetailModal.educationExperience')}
              </h4>

              {application.education && (
                <div className="admin-digibridge-rejected-detail-text-block">
                  <p><strong>{t('AdminDigiBridgeMentors.RejectedDetailModal.education')}:</strong></p>
                  <p>{application.education}</p>
                </div>
              )}

              {application.experience && (
                <div className="admin-digibridge-rejected-detail-text-block">
                  <p><strong>{t('AdminDigiBridgeMentors.RejectedDetailModal.experience')}:</strong></p>
                  <p>{application.experience}</p>
                </div>
              )}
            </div>
          )}

          {/* AVAILABILITY & LANGUAGES */}
          {(application.availability || (application.languages && application.languages.length > 0)) && (
            <div className="admin-digibridge-rejected-detail-section">
              <h4 className="admin-digibridge-rejected-detail-section-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                {t('AdminDigiBridgeMentors.RejectedDetailModal.availabilityLanguages')}
              </h4>

              <div className="admin-digibridge-rejected-detail-info-grid">
                {application.availability && (
                  <div className="admin-digibridge-rejected-detail-info-item">
                    <span className="admin-digibridge-rejected-detail-info-label">{t('AdminDigiBridgeMentors.RejectedDetailModal.availability')}:</span>
                    <span className="admin-digibridge-rejected-detail-info-value">{application.availability}</span>
                  </div>
                )}

                {application.languages && application.languages.length > 0 && (
                  <div className="admin-digibridge-rejected-detail-info-item">
                    <span className="admin-digibridge-rejected-detail-info-label">{t('AdminDigiBridgeMentors.RejectedDetailModal.languages')}:</span>
                    <div className="admin-digibridge-rejected-detail-languages">
                      {application.languages.map((lang, index) => (
                        <span key={index} className="admin-digibridge-rejected-detail-language-badge">
                          {lang.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MOTIVATION */}
          {application.motivation && (
            <div className="admin-digibridge-rejected-detail-section">
              <h4 className="admin-digibridge-rejected-detail-section-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                {t('AdminDigiBridgeMentors.RejectedDetailModal.motivation')}
              </h4>

              <div className="admin-digibridge-rejected-detail-text-block">
                <p>{application.motivation}</p>
              </div>
            </div>
          )}

          {/* CV */}
          {application.cvUrl && (
            <div className="admin-digibridge-rejected-detail-section">
              <h4 className="admin-digibridge-rejected-detail-section-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                CV
              </h4>

              <a
                href={application.cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="admin-digibridge-rejected-detail-cv-btn"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                {t('AdminDigiBridgeMentors.RejectedDetailModal.downloadCV')}: {application.cvOriginalName || 'CV.pdf'}
              </a>
            </div>
          )}

          {/* DATES */}
          <div className="admin-digibridge-rejected-detail-section">
            <h4 className="admin-digibridge-rejected-detail-section-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              {t('AdminDigiBridgeMentors.RejectedDetailModal.importantDates')}
            </h4>

            <div className="admin-digibridge-rejected-detail-dates">
              <div className="admin-digibridge-rejected-detail-date-item">
                <span className="admin-digibridge-rejected-detail-date-label">{t('AdminDigiBridgeMentors.RejectedDetailModal.createdAt')}:</span>
                <span className="admin-digibridge-rejected-detail-date-value">{formatDate(application.createdAt)}</span>
              </div>

              <div className="admin-digibridge-rejected-detail-date-item">
                <span className="admin-digibridge-rejected-detail-date-label">{t('AdminDigiBridgeMentors.RejectedDetailModal.rejectedAt')}:</span>
                <span className="admin-digibridge-rejected-detail-date-value">{formatDate(application.rejectedAt)}</span>
              </div>
            </div>
          </div>

        </div>

        {/* FOOTER */}
        <div className="admin-digibridge-rejected-detail-modal-footer">
          <button
            className="admin-digibridge-rejected-detail-modal-btn-close"
            onClick={onClose}
          >
            {t('AdminDigiBridgeMentors.RejectedDetailModal.close')}
          </button>

          <button
            className="admin-digibridge-rejected-detail-modal-btn-approve"
            onClick={handleApprove}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {t('AdminDigiBridgeMentors.RejectedDetailModal.approveNow')}
          </button>
        </div>

      </div>
    </div>
  );
};