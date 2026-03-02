// client/src/components/DigiMentorPanel/DigiMentorUpcomingSessions/DigiMentorUpcomingSessions.jsx

import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { bg, enUS, de } from 'date-fns/locale';
import './digiMentorUpcomingSessions.css';

export const DigiMentorUpcomingSessions = ({ sessions = [] }) => {
  const { t, i18n } = useTranslation('digibridge-mentor');

  const getLocale = () => {
    switch (i18n.language) {
      case 'bg': return bg;
      case 'de': return de;
      default: return enUS;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'green';
      case 'pending': return 'yellow';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  };

  const getStatusLabel = (status) => {
    return t(`digiMentorUpcomingSessions.status.${status}`);
  };

  if (!sessions || sessions.length === 0) {
    return (
      <div className="digi-mentor-upcoming-sessions">
        <h2 className="digi-mentor-upcoming-sessions-title">
          {t('digiMentorUpcomingSessions.title')}
        </h2>
        <div className="digi-mentor-upcoming-sessions-empty">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 7V3M16 7V3M7 11H17M5 21H19C20.1046 21 21 20.1046 21 19V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V19C3 20.1046 3.89543 21 5 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p>{t('digiMentorUpcomingSessions.noSessions')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="digi-mentor-upcoming-sessions">
      <div className="digi-mentor-upcoming-sessions-header">
        <h2 className="digi-mentor-upcoming-sessions-title">
          {t('digiMentorUpcomingSessions.title')}
        </h2>
        <span className="digi-mentor-upcoming-sessions-count">
          {sessions.length} {t('digiMentorUpcomingSessions.sessionsCount')}
        </span>
      </div>

      <div className="digi-mentor-upcoming-sessions-list">
        {sessions.map((session) => (
          <div key={session.id} className="digi-mentor-upcoming-sessions-card">
            <div className="digi-mentor-upcoming-sessions-card-header">
              <div className="digi-mentor-upcoming-sessions-student">
                <div className="digi-mentor-upcoming-sessions-avatar">
                  {session.studentAvatar ? (
                    <img src={session.studentAvatar} alt={session.studentName} />
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17 20C17 18.3431 14.7614 17 12 17C9.23858 17 7 18.3431 7 20M12 14C10.3431 14 9 12.6569 9 11C9 9.34315 10.3431 8 12 8C13.6569 8 15 9.34315 15 11C15 12.6569 13.6569 14 12 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <div className="digi-mentor-upcoming-sessions-student-info">
                  <p className="digi-mentor-upcoming-sessions-student-name">
                    {session.studentName}
                  </p>
                  <p className="digi-mentor-upcoming-sessions-topic">
                    {session.topic || t('digiMentorUpcomingSessions.noTopic')}
                  </p>
                </div>
              </div>
              <span className={`digi-mentor-upcoming-sessions-status digi-mentor-upcoming-sessions-status-${getStatusColor(session.status)}`}>
                {getStatusLabel(session.status)}
              </span>
            </div>

            <div className="digi-mentor-upcoming-sessions-card-body">
              <div className="digi-mentor-upcoming-sessions-info-row">
                <div className="digi-mentor-upcoming-sessions-info-item">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 7V3M16 7V3M7 11H17M5 21H19C20.1046 21 21 20.1046 21 19V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V19C3 20.1046 3.89543 21 5 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>{format(new Date(session.dateTime), 'PPP', { locale: getLocale() })}</span>
                </div>
                <div className="digi-mentor-upcoming-sessions-info-item">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>{format(new Date(session.dateTime), 'p', { locale: getLocale() })}</span>
                </div>
              </div>

              {session.duration && (
                <div className="digi-mentor-upcoming-sessions-info-item">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 6V12L16 14M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>{session.duration} {t('digiMentorUpcomingSessions.minutes')}</span>
                </div>
              )}

              {session.notes && (
                <div className="digi-mentor-upcoming-sessions-notes">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5M12 12H15M12 16H15M9 12H9.01M9 16H9.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <p>{session.notes}</p>
                </div>
              )}
            </div>

            <div className="digi-mentor-upcoming-sessions-card-footer">
              <button className="digi-mentor-upcoming-sessions-btn digi-mentor-upcoming-sessions-btn-primary">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 10L11 14L17 20L21 4L3 11L7 13M15 10L7 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {t('digiMentorUpcomingSessions.joinSession')}
              </button>
              <button className="digi-mentor-upcoming-sessions-btn digi-mentor-upcoming-sessions-btn-secondary">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11 5H6C4.89543 5 4 5.89543 4 7V18C4 19.1046 4.89543 20 6 20H17C18.1046 20 19 19.1046 19 18V13M17.5858 3.58579C18.3668 2.80474 19.6332 2.80474 20.4142 3.58579C21.1953 4.36683 21.1953 5.63316 20.4142 6.41421L11.8284 15H9L9 12.1716L17.5858 3.58579Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {t('digiMentorUpcomingSessions.editSession')}
              </button>
              <button className="digi-mentor-upcoming-sessions-btn digi-mentor-upcoming-sessions-btn-danger">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 18L18 6M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {t('digiMentorUpcomingSessions.cancelSession')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};