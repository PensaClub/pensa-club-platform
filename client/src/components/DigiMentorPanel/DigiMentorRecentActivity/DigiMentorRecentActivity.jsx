// client/src/components/DigiMentorPanel/DigiMentorRecentActivity/DigiMentorRecentActivity.jsx

import { useTranslation } from 'react-i18next';
import { formatDistanceToNow } from 'date-fns';
import { bg, enUS, de } from 'date-fns/locale';
import './digiMentorRecentActivity.css';

export const DigiMentorRecentActivity = ({ activities = [] }) => {
  const { t, i18n } = useTranslation();

  const getLocale = () => {
    switch (i18n.language) {
      case 'bg': return bg;
      case 'de': return de;
      default: return enUS;
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'session_started':
        return (
          <path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        );
      case 'session_completed':
        return (
          <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        );
      case 'message_received':
        return (
          <path d="M8 10H16M8 14H11M6 20L3 17V7C3 5.89543 3.89543 5 5 5H19C20.1046 5 21 5.89543 21 7V15C21 16.1046 20.1046 17 19 17H9L6 20Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        );
      case 'new_student':
        return (
          <path d="M17 20C17 18.3431 14.7614 17 12 17C9.23858 17 7 18.3431 7 20M12 14C10.3431 14 9 12.6569 9 11C9 9.34315 10.3431 8 12 8C13.6569 8 15 9.34315 15 11C15 12.6569 13.6569 14 12 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        );
      case 'review_received':
        return (
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        );
      default:
        return (
          <path d="M13 16H12V12H11M12 8H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        );
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'session_started': return 'blue';
      case 'session_completed': return 'green';
      case 'message_received': return 'purple';
      case 'new_student': return 'orange';
      case 'review_received': return 'yellow';
      default: return 'gray';
    }
  };

  if (!activities || activities.length === 0) {
    return (
      <div className="digi-mentor-recent-activity">
        <h2 className="digi-mentor-recent-activity-title">
          {t('digiMentorRecentActivity.title')}
        </h2>
        <div className="digi-mentor-recent-activity-empty">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p>{t('digiMentorRecentActivity.noActivity')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="digi-mentor-recent-activity">
      <h2 className="digi-mentor-recent-activity-title">
        {t('digiMentorRecentActivity.title')}
      </h2>
      <div className="digi-mentor-recent-activity-list">
        {activities.map((activity) => (
          <div key={activity.id} className="digi-mentor-recent-activity-item">
            <div className={`digi-mentor-recent-activity-icon digi-mentor-recent-activity-icon-${getActivityColor(activity.type)}`}>
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                {getActivityIcon(activity.type)}
              </svg>
            </div>
            <div className="digi-mentor-recent-activity-content">
              <p className="digi-mentor-recent-activity-text">
                {t(`digiMentorRecentActivity.types.${activity.type}`, { 
                  student: activity.studentName,
                  rating: activity.rating 
                })}
              </p>
              <span className="digi-mentor-recent-activity-time">
                {formatDistanceToNow(new Date(activity.timestamp), { 
                  addSuffix: true, 
                  locale: getLocale() 
                })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};