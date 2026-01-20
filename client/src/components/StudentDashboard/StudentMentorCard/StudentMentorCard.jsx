import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { User, Mail, MessageCircle, Calendar, ArrowRight } from 'lucide-react';
import './studentMentorCard.css';

const StudentMentorCard = ({ mentor = null, assignedDate = null }) => {
  const { t } = useTranslation();

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('bg-BG', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getInitials = (firstName, lastName) => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
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

  const firstName = mentor.user?.details?.firstName || '';
  const lastName = mentor.user?.details?.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim() || mentor.user?.email || 'Ментор';
  const imageURL = mentor.user?.details?.imageURL;
  const specialization = mentor.specialization || t('studentMentorCard.defaultSpecialization');
  const email = mentor.user?.email;

  return (
    <div className="smc-container">
      <div className="smc-header">
        <h3 className="smc-title">
          <User className="smc-title-icon" />
          {t('studentMentorCard.title')}
        </h3>
        <Link to="/academy/mentors" className="smc-view-all">
          {t('studentMentorCard.allMentors')}
          <ArrowRight className="smc-view-all-icon" />
        </Link>
      </div>

      <div className="smc-card">
        <div className="smc-avatar-wrapper">
          {imageURL ? (
            <img src={imageURL} alt={fullName} className="smc-avatar" />
          ) : (
            <div className="smc-avatar-placeholder">
              {getInitials(firstName, lastName)}
            </div>
          )}
          <span className="smc-status-dot" title={t('studentMentorCard.active')}></span>
        </div>

        <div className="smc-info">
          <h4 className="smc-name">{fullName}</h4>
          <p className="smc-specialization">{specialization}</p>
          
          {assignedDate && (
            <p className="smc-assigned">
              <Calendar className="smc-assigned-icon" />
              {t('studentMentorCard.mentorSince')} {formatDate(assignedDate)}
            </p>
          )}
        </div>

        <div className="smc-actions">
          {email && (
            <a href={`mailto:${email}`} className="smc-action-btn smc-action-email" title={t('studentMentorCard.sendEmail')}>
              <Mail className="smc-action-icon" />
            </a>
          )}
          <Link to={`/messages?to=${mentor.userId || mentor.id}`} className="smc-action-btn smc-action-message" title={t('studentMentorCard.sendMessage')}>
            <MessageCircle className="smc-action-icon" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StudentMentorCard;