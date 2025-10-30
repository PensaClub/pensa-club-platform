// src/components/AdminDigiBridgeMentors/AdminDigiBridgeMentorDetailModal/AdminDigiBridgeMentorDetailModal.jsx

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import './adminDigiBridgeMentorDetailModal.css';

export const AdminDigiBridgeMentorDetailModal = ({ mentor, onClose, onSendEmail  }) => {
  const { t } = useTranslation();
  const [copiedField, setCopiedField] = useState(null);

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

  const getContactIcon = (type) => {
    switch(type) {
      case 'viber':
        return '📱';
      case 'facebook':
        return '👥';
      case 'linkedin':
        return '💼';
      case 'phone':
        return '📞';
      case 'email':
        return '✉️';
      default:
        return '📧';
    }
  };

  // COPY TO CLIPBOARD ФУНКЦИЯ
  const handleCopy = async (text, fieldName) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      toast.success(t('AdminDigiBridgeMentors.DetailModal.copied'));
      
      setTimeout(() => {
        setCopiedField(null);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error(t('AdminDigiBridgeMentors.DetailModal.copyError'));
    }
  };

  return (
    <div className="admin-digibridge-mentor-detail-modal-overlay" onClick={onClose}>
      <div 
        className="admin-digibridge-mentor-detail-modal"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* HEADER */}
        <div className="admin-digibridge-mentor-detail-modal-header">
          <h2>{t('AdminDigiBridgeMentors.DetailModal.title')}</h2>
          <button 
            className="admin-digibridge-mentor-detail-modal-close"
            onClick={onClose}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* CONTENT */}
        <div className="admin-digibridge-mentor-detail-modal-content">
          
          {/* PROFILE SECTION */}
          <div className="admin-digibridge-mentor-detail-section">
            <div className="admin-digibridge-mentor-detail-profile">
              <img src={mentor.photoUrl} alt={mentor.name} />
              <div className="admin-digibridge-mentor-detail-profile-info">
                <h3>{mentor.name}</h3>
                <p className="admin-digibridge-mentor-detail-age">
                  {mentor.age} {t('AdminDigiBridgeMentors.DetailModal.years')}
                </p>
                <div className={`admin-digibridge-mentor-detail-status ${mentor.isOnline ? 'online' : 'offline'}`}>
                  <span className="admin-digibridge-mentor-detail-status-dot"></span>
                  {mentor.isOnline ? t('AdminDigiBridgeMentors.DetailModal.online') : t('AdminDigiBridgeMentors.DetailModal.offline')}
                </div>
              </div>
            </div>

            <div className="admin-digibridge-mentor-detail-spec-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
              {mentor.specialization}
            </div>
          </div>

          {/* STATS */}
          <div className="admin-digibridge-mentor-detail-stats-grid">
            <div className="admin-digibridge-mentor-detail-stat">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
              </svg>
              <div>
                <span className="admin-digibridge-mentor-detail-stat-value">{mentor.studentsCount}</span>
                <span className="admin-digibridge-mentor-detail-stat-label">{t('AdminDigiBridgeMentors.DetailModal.students')}</span>
              </div>
            </div>

            <div className="admin-digibridge-mentor-detail-stat">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              <div>
                <span className="admin-digibridge-mentor-detail-stat-value">{mentor.rating.toFixed(1)}</span>
                <span className="admin-digibridge-mentor-detail-stat-label">{t('AdminDigiBridgeMentors.DetailModal.rating')}</span>
              </div>
            </div>

            <div className="admin-digibridge-mentor-detail-stat">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              <div>
                <span className="admin-digibridge-mentor-detail-stat-value">{mentor.sessionsCount}</span>
                <span className="admin-digibridge-mentor-detail-stat-label">{t('AdminDigiBridgeMentors.DetailModal.sessions')}</span>
              </div>
            </div>
          </div>

          {/* CONTACT INFO */}
          <div className="admin-digibridge-mentor-detail-section">
            <h4 className="admin-digibridge-mentor-detail-section-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              {t('AdminDigiBridgeMentors.DetailModal.contactInfo')}
            </h4>

            <div className="admin-digibridge-mentor-detail-info-grid">
              
              {/* EMAIL */}
              <div className="admin-digibridge-mentor-detail-info-item-with-copy">
  <div className="admin-digibridge-mentor-detail-info-item">
    <span className="admin-digibridge-mentor-detail-info-label">Email:</span>
    <button 
      className="admin-digibridge-mentor-detail-info-value admin-digibridge-mentor-detail-email-link"
      onClick={() => onSendEmail()}
    >
      {mentor.email}
    </button>
  </div>
  <button
    className={`admin-digibridge-mentor-detail-copy-btn ${copiedField === 'email' ? 'copied' : ''}`}
    onClick={() => handleCopy(mentor.email, 'email')}
    title={t('AdminDigiBridgeMentors.DetailModal.copyToClipboard')}
  >
    {copiedField === 'email' ? (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    ) : (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
      </svg>
    )}
  </button>
</div>

              {/* PHONE */}
              <div className="admin-digibridge-mentor-detail-info-item-with-copy">
                <div className="admin-digibridge-mentor-detail-info-item">
                  <span className="admin-digibridge-mentor-detail-info-label">{t('AdminDigiBridgeMentors.DetailModal.phone')}:</span>
                  <a href={`tel:${mentor.phone}`} className="admin-digibridge-mentor-detail-info-value">
                    {mentor.phone}
                  </a>
                </div>
                <button
                  className={`admin-digibridge-mentor-detail-copy-btn ${copiedField === 'phone' ? 'copied' : ''}`}
                  onClick={() => handleCopy(mentor.phone, 'phone')}
                  title={t('AdminDigiBridgeMentors.DetailModal.copyToClipboard')}
                >
                  {copiedField === 'phone' ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </svg>
                  )}
                </button>
              </div>

              {/* VIBER */}
              {mentor.viber && (
                <div className="admin-digibridge-mentor-detail-info-item-with-copy">
                  <div className="admin-digibridge-mentor-detail-info-item">
                    <span className="admin-digibridge-mentor-detail-info-label">Viber:</span>
                    <span className="admin-digibridge-mentor-detail-info-value">{mentor.viber}</span>
                  </div>
                  <button
                    className={`admin-digibridge-mentor-detail-copy-btn ${copiedField === 'viber' ? 'copied' : ''}`}
                    onClick={() => handleCopy(mentor.viber, 'viber')}
                    title={t('AdminDigiBridgeMentors.DetailModal.copyToClipboard')}
                  >
                    {copiedField === 'viber' ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                      </svg>
                    )}
                  </button>
                </div>
              )}

              {/* FACEBOOK */}
              {mentor.facebook && (
                <div className="admin-digibridge-mentor-detail-info-item-with-copy">
                  <div className="admin-digibridge-mentor-detail-info-item">
                    <span className="admin-digibridge-mentor-detail-info-label">Facebook:</span>
                    <a 
                      href={mentor.facebook.startsWith('http') ? mentor.facebook : `https://${mentor.facebook}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="admin-digibridge-mentor-detail-info-value"
                    >
                      {mentor.facebook}
                    </a>
                  </div>
                  <button
                    className={`admin-digibridge-mentor-detail-copy-btn ${copiedField === 'facebook' ? 'copied' : ''}`}
                    onClick={() => handleCopy(mentor.facebook, 'facebook')}
                    title={t('AdminDigiBridgeMentors.DetailModal.copyToClipboard')}
                  >
                    {copiedField === 'facebook' ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                      </svg>
                    )}
                  </button>
                </div>
              )}

              {/* LINKEDIN */}
              {mentor.linkedin && (
                <div className="admin-digibridge-mentor-detail-info-item-with-copy">
                  <div className="admin-digibridge-mentor-detail-info-item">
                    <span className="admin-digibridge-mentor-detail-info-label">LinkedIn:</span>
                    <a 
                      href={mentor.linkedin.startsWith('http') ? mentor.linkedin : `https://${mentor.linkedin}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="admin-digibridge-mentor-detail-info-value"
                    >
                      {mentor.linkedin}
                    </a>
                  </div>
                  <button
                    className={`admin-digibridge-mentor-detail-copy-btn ${copiedField === 'linkedin' ? 'copied' : ''}`}
                    onClick={() => handleCopy(mentor.linkedin, 'linkedin')}
                    title={t('AdminDigiBridgeMentors.DetailModal.copyToClipboard')}
                  >
                    {copiedField === 'linkedin' ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                      </svg>
                    )}
                  </button>
                </div>
              )}

              {/* OTHER CONTACT */}
              {mentor.otherContact && (
                <div className="admin-digibridge-mentor-detail-info-item-with-copy">
                  <div className="admin-digibridge-mentor-detail-info-item">
                    <span className="admin-digibridge-mentor-detail-info-label">{t('AdminDigiBridgeMentors.DetailModal.otherContact')}:</span>
                    <span className="admin-digibridge-mentor-detail-info-value">{mentor.otherContact}</span>
                  </div>
                  <button
                    className={`admin-digibridge-mentor-detail-copy-btn ${copiedField === 'otherContact' ? 'copied' : ''}`}
                    onClick={() => handleCopy(mentor.otherContact, 'otherContact')}
                    title={t('AdminDigiBridgeMentors.DetailModal.copyToClipboard')}
                  >
                    {copiedField === 'otherContact' ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                      </svg>
                    )}
                  </button>
                </div>
              )}
            </div>

            {mentor.priorityContact && (
              <div className="admin-digibridge-mentor-detail-priority-badge">
                <span>{getContactIcon(mentor.priorityContact)}</span>
                <span>
                  {t('AdminDigiBridgeMentors.DetailModal.priorityContact')}: <strong>{mentor.priorityContact}</strong>
                </span>
              </div>
            )}
          </div>

          {/* EDUCATION & EXPERIENCE */}
          <div className="admin-digibridge-mentor-detail-section">
            <h4 className="admin-digibridge-mentor-detail-section-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                <path d="M6 12v5c3 3 9 3 12 0v-5"/>
              </svg>
              {t('AdminDigiBridgeMentors.DetailModal.educationExperience')}
            </h4>

            <div className="admin-digibridge-mentor-detail-text-block">
              <p><strong>{t('AdminDigiBridgeMentors.DetailModal.education')}:</strong></p>
              <p>{mentor.education}</p>
            </div>

            <div className="admin-digibridge-mentor-detail-text-block">
              <p><strong>{t('AdminDigiBridgeMentors.DetailModal.experience')}:</strong></p>
              <p>{mentor.experience}</p>
            </div>
          </div>

          {/* AVAILABILITY & LANGUAGES */}
          <div className="admin-digibridge-mentor-detail-section">
            <h4 className="admin-digibridge-mentor-detail-section-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              {t('AdminDigiBridgeMentors.DetailModal.availabilityLanguages')}
            </h4>

            <div className="admin-digibridge-mentor-detail-info-grid">
              <div className="admin-digibridge-mentor-detail-info-item">
                <span className="admin-digibridge-mentor-detail-info-label">{t('AdminDigiBridgeMentors.DetailModal.availability')}:</span>
                <span className="admin-digibridge-mentor-detail-info-value">{mentor.availability}</span>
              </div>

              <div className="admin-digibridge-mentor-detail-info-item">
                <span className="admin-digibridge-mentor-detail-info-label">{t('AdminDigiBridgeMentors.DetailModal.languages')}:</span>
                <div className="admin-digibridge-mentor-detail-languages">
                  {mentor.languages.map((lang, index) => (
                    <span key={index} className="admin-digibridge-mentor-detail-language-badge">
                      {lang.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* MOTIVATION */}
          <div className="admin-digibridge-mentor-detail-section">
            <h4 className="admin-digibridge-mentor-detail-section-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              {t('AdminDigiBridgeMentors.DetailModal.motivation')}
            </h4>

            <div className="admin-digibridge-mentor-detail-text-block">
              <p>{mentor.motivation}</p>
            </div>
          </div>

          {/* CV */}
          {mentor.cvUrl && (
            <div className="admin-digibridge-mentor-detail-section">
              <h4 className="admin-digibridge-mentor-detail-section-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10 9 9 9 8 9"/>
                </svg>
                CV
              </h4>

              <a 
                href={mentor.cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="admin-digibridge-mentor-detail-cv-btn"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                {t('AdminDigiBridgeMentors.DetailModal.downloadCV')}: {mentor.cvOriginalName}
              </a>
            </div>
          )}

          {/* ADMIN NOTES */}
          {mentor.adminNotes && (
            <div className="admin-digibridge-mentor-detail-section">
              <h4 className="admin-digibridge-mentor-detail-section-title admin-digibridge-mentor-detail-section-title-admin">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
                {t('AdminDigiBridgeMentors.DetailModal.adminNotes')}
              </h4>

              <div className="admin-digibridge-mentor-detail-admin-notes">
                <p>{mentor.adminNotes}</p>
              </div>
            </div>
          )}

          {/* DATES */}
          <div className="admin-digibridge-mentor-detail-section">
            <h4 className="admin-digibridge-mentor-detail-section-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              {t('AdminDigiBridgeMentors.DetailModal.importantDates')}
            </h4>

            <div className="admin-digibridge-mentor-detail-dates">
              <div className="admin-digibridge-mentor-detail-date-item">
                <span className="admin-digibridge-mentor-detail-date-label">{t('AdminDigiBridgeMentors.DetailModal.createdAt')}:</span>
                <span className="admin-digibridge-mentor-detail-date-value">{formatDate(mentor.createdAt)}</span>
              </div>

              <div className="admin-digibridge-mentor-detail-date-item">
                <span className="admin-digibridge-mentor-detail-date-label">{t('AdminDigiBridgeMentors.DetailModal.approvedAt')}:</span>
                <span className="admin-digibridge-mentor-detail-date-value">{formatDate(mentor.approvedAt)}</span>
              </div>

              <div className="admin-digibridge-mentor-detail-date-item">
                <span className="admin-digibridge-mentor-detail-date-label">{t('AdminDigiBridgeMentors.DetailModal.lastActiveAt')}:</span>
                <span className="admin-digibridge-mentor-detail-date-value">{formatDate(mentor.lastActiveAt)}</span>
              </div>
            </div>
          </div>

        </div>

        {/* FOOTER */}
        <div className="admin-digibridge-mentor-detail-modal-footer">
          <button 
            className="admin-digibridge-mentor-detail-modal-btn-close"
            onClick={onClose}
          >
            {t('AdminDigiBridgeMentors.DetailModal.close')}
          </button>
        </div>

      </div>
    </div>
  );
};