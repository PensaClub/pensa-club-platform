// src/components/AdminDigiBridgeMentors/AdminDigiBridgeMentorCard/AdminDigiBridgeMentorCard.jsx

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './adminDigiBridgeMentorCard.css';

export const AdminDigiBridgeMentorCard = ({ 
  mentor, 
  onViewDetails, 
  onEdit, 
  onSendEmail, 
  onDeactivate, 
  onDelete,
  bulkMode,
  isSelected,
  onToggleSelect
}) => {
  const { t } = useTranslation();
  const [showActions, setShowActions] = useState(false);

  const getPriorityContactIcon = (contact) => {
    switch(contact) {
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

  const getPriorityContactLabel = (contact) => {
    switch(contact) {
      case 'viber':
        return 'Viber';
      case 'facebook':
        return 'Facebook';
      case 'linkedin':
        return 'LinkedIn';
      case 'phone':
        return t('AdminDigiBridgeMentors.Card.phone');
      case 'email':
        return 'Email';
      default:
        return t('AdminDigiBridgeMentors.Card.other');
    }
  };

  return (
    <div className={`admin-digibridge-mentor-card ${bulkMode ? 'bulk-mode' : ''} ${isSelected ? 'selected' : ''}`}>
      
      {/* BULK CHECKBOX */}
      {bulkMode && (
        <div className="admin-digibridge-mentor-card-checkbox">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(mentor.id)}
          />
        </div>
      )}

      {/* HEADER */}
      <div className="admin-digibridge-mentor-card-header">
        <img 
          src={mentor.photoUrl} 
          alt={mentor.name}
          className="admin-digibridge-mentor-card-avatar"
        />
        
        {/* ONLINE BADGE */}
        <div className={`admin-digibridge-mentor-card-status ${mentor.isOnline ? 'online' : 'offline'}`}>
          <span className="admin-digibridge-mentor-card-status-dot"></span>
          {mentor.isOnline ? t('AdminDigiBridgeMentors.Card.online') : t('AdminDigiBridgeMentors.Card.offline')}
        </div>
      </div>

      {/* INFO */}
      <div className="admin-digibridge-mentor-card-info">
        <h3 className="admin-digibridge-mentor-card-name">{mentor.name}</h3>
        <p className="admin-digibridge-mentor-card-age">
          {mentor.age} {t('AdminDigiBridgeMentors.Card.years')}
        </p>

        <div className="admin-digibridge-mentor-card-spec">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
          <span>{mentor.specialization}</span>
        </div>

        <div className="admin-digibridge-mentor-card-contact">
          <p className="admin-digibridge-mentor-card-email">{mentor.email}</p>
          <p className="admin-digibridge-mentor-card-phone">{mentor.phone}</p>
        </div>
      </div>

      {/* STATS */}
      <div className="admin-digibridge-mentor-card-stats">
        <div className="admin-digibridge-mentor-card-stat">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
          </svg>
          <div>
            <span className="admin-digibridge-mentor-card-stat-value">{mentor.studentsCount}</span>
            <span className="admin-digibridge-mentor-card-stat-label">{t('AdminDigiBridgeMentors.Card.students')}</span>
          </div>
        </div>

        <div className="admin-digibridge-mentor-card-stat">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          <div>
            <span className="admin-digibridge-mentor-card-stat-value">{mentor.rating.toFixed(1)}</span>
            <span className="admin-digibridge-mentor-card-stat-label">{t('AdminDigiBridgeMentors.Card.rating')}</span>
          </div>
        </div>

        <div className="admin-digibridge-mentor-card-stat">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          <div>
            <span className="admin-digibridge-mentor-card-stat-value">{mentor.sessionsCount}</span>
            <span className="admin-digibridge-mentor-card-stat-label">{t('AdminDigiBridgeMentors.Card.sessions')}</span>
          </div>
        </div>
      </div>

      {/* PRIORITY CONTACT */}
      {mentor.priorityContact && (
        <div className="admin-digibridge-mentor-card-priority">
          <span className="admin-digibridge-mentor-card-priority-icon">
            {getPriorityContactIcon(mentor.priorityContact)}
          </span>
          <span className="admin-digibridge-mentor-card-priority-label">
            {t('AdminDigiBridgeMentors.Card.priorityContact')}: {getPriorityContactLabel(mentor.priorityContact)}
          </span>
        </div>
      )}

      {/* ADMIN NOTES */}
      {mentor.adminNotes && (
        <div className="admin-digibridge-mentor-card-notes">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
          <p>{mentor.adminNotes}</p>
        </div>
      )}

      {/* ACTIONS */}
      <div className="admin-digibridge-mentor-card-actions">
        <button
          className="admin-digibridge-mentor-card-btn admin-digibridge-mentor-card-btn-primary"
          onClick={() => onViewDetails(mentor)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          {t('AdminDigiBridgeMentors.Card.viewDetails')}
        </button>

        <button
          className="admin-digibridge-mentor-card-btn admin-digibridge-mentor-card-btn-secondary"
          onClick={() => onEdit(mentor)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          {t('AdminDigiBridgeMentors.Card.edit')}
        </button>

        <button
          className="admin-digibridge-mentor-card-more"
          onClick={() => setShowActions(!showActions)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="1"/>
            <circle cx="12" cy="5" r="1"/>
            <circle cx="12" cy="19" r="1"/>
          </svg>
        </button>

        {showActions && (
          <div className="admin-digibridge-mentor-card-dropdown">
            <button onClick={() => { onSendEmail(mentor); setShowActions(false); }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              {t('AdminDigiBridgeMentors.Card.sendEmail')}
            </button>

            <button onClick={() => { onDeactivate(mentor.id); setShowActions(false); }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
              </svg>
              {t('AdminDigiBridgeMentors.Card.deactivate')}
            </button>

            <button 
              className="admin-digibridge-mentor-card-dropdown-delete"
              onClick={() => { onDelete(mentor.id); setShowActions(false); }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
              {t('AdminDigiBridgeMentors.Card.delete')}
            </button>
          </div>
        )}
      </div>

    </div>
  );
};