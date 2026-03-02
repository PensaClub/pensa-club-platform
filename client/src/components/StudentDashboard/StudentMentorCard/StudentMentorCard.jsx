import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { User, Mail, MessageCircle, ArrowRight, Star } from 'lucide-react';
import './studentMentorCard.css';

const StudentMentorCard = ({ mentor = null, onSendEmail }) => {
  const { t } = useTranslation('student-dashboard');

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    const first = parts[0]?.charAt(0) || '';
    const last = parts[1]?.charAt(0) || '';
    return (first + last).toUpperCase() || '?';
  };

  // Empty state - няма ментор
  if (!mentor) {
    return (
      <div className="smc-container">
        <div className="smc-header">
          <h3 className="smc-title">
            <User className="smc-title-icon" />
            {t('studentMentorCard.title')}
          </h3>
        </div>
        <div className="smc-empty">
          <div className="smc-empty-avatar">
            <User className="smc-empty-avatar-icon" />
          </div>
          <p className="smc-empty-text">{t('studentMentorCard.noMentor')}</p>
          <Link to="/academy/mentors" className="smc-find-btn">
            {t('studentMentorCard.findMentor')}
            <ArrowRight className="smc-find-btn-icon" />
          </Link>
        </div>
      </div>
    );
  }

  const rating = parseFloat(mentor.rating) || 0;

  return (
    <div className="smc-container">
      <div className="smc-header">
        <h3 className="smc-title">
          <User className="smc-title-icon" />
          {t('studentMentorCard.title')}
        </h3>
        <Link to="/academy/mentors" className="smc-view-all">
          {t('studentMentorCard.changeMentor')}
          <ArrowRight className="smc-view-all-icon" />
        </Link>
      </div>

      <div className="smc-card">
        <div className="smc-avatar-wrapper">
          {mentor.photoUrl ? (
            <img src={mentor.photoUrl} alt={mentor.name} className="smc-avatar" />
          ) : (
            <div className="smc-avatar-placeholder">
              {getInitials(mentor.name)}
            </div>
          )}
          <span 
            className={`smc-status-dot ${mentor.isOnline ? 'smc-status-online' : 'smc-status-offline'}`} 
            title={mentor.isOnline ? t('studentMentorCard.online') : t('studentMentorCard.offline')}
          />
        </div>

        <div className="smc-info">
          <h4 className="smc-name">{mentor.name}</h4>
          <p className="smc-specialization">{mentor.specialization || t('studentMentorCard.defaultSpecialization')}</p>
          
          {rating > 0 && (
            <p className="smc-rating">
              <Star className="smc-rating-icon" />
              {rating.toFixed(1)}
            </p>
          )}
        </div>

        <div className="smc-actions">
          {mentor.email && (
            <button 
              onClick={onSendEmail}
              className="smc-action-btn smc-action-email" 
              title={t('studentMentorCard.sendEmail')}
            >
              <Mail className="smc-action-icon" />
            </button>
          )}
          <Link 
            to={`/messages?to=${mentor.id}`} 
            className="smc-action-btn smc-action-message" 
            title={t('studentMentorCard.sendMessage')}
          >
            <MessageCircle className="smc-action-icon" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StudentMentorCard;