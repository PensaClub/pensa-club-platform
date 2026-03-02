// client/src/components/DigiMentorPanel/DigiMentorStats/DigiMentorStats.jsx

import { useTranslation } from 'react-i18next';
import './digiMentorStats.css';

export const DigiMentorStats = ({ stats }) => {
  const { t } = useTranslation('digibridge-mentor');

  const statCards = [
    {
      key: 'totalStudents',
      icon: 'blue',
      label: t('digiMentorStats.totalStudents'),
      value: stats.totalStudents,
      svg: (
        <path d="M17 20C17 18.3431 14.7614 17 12 17C9.23858 17 7 18.3431 7 20M12 14C10.3431 14 9 12.6569 9 11C9 9.34315 10.3431 8 12 8C13.6569 8 15 9.34315 15 11C15 12.6569 13.6569 14 12 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      )
    },
    {
      key: 'activeSessions',
      icon: 'green',
      label: t('digiMentorStats.activeSessions'),
      value: stats.activeSessions,
      svg: (
        <path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      )
    },
    {
      key: 'completedSessions',
      icon: 'purple',
      label: t('digiMentorStats.completedSessions'),
      value: stats.completedSessions,
      svg: (
        <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      )
    },
    {
      key: 'onlineHours',
      icon: 'orange',
      label: t('digiMentorStats.onlineHours'),
      value: `${stats.totalOnlineHours}h`,
      svg: (
        <path d="M12 6V12L16 14M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      )
    },
    {
      key: 'averageRating',
      icon: 'yellow',
      label: t('digiMentorStats.averageRating'),
      value: `${stats.averageRating.toFixed(1)} / 5.0`,
      detail: `(${stats.totalReviews} ${t('digiMentorStats.reviews')})`,
      svg: (
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      )
    },
    {
      key: 'totalMessages',
      icon: 'pink',
      label: t('digiMentorStats.totalMessages'),
      value: stats.totalMessages,
      svg: (
        <path d="M8 10H16M8 14H11M6 20L3 17V7C3 5.89543 3.89543 5 5 5H19C20.1046 5 21 5.89543 21 7V15C21 16.1046 20.1046 17 19 17H9L6 20Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      )
    },
    {
      key: 'responseTime',
      icon: 'teal',
      label: t('digiMentorStats.responseTime'),
      value: `${stats.averageResponseTime} ${t('digiMentorStats.minutes')}`,
      svg: (
        <path d="M13 10V3L4 14H11L11 21L20 10L13 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      )
    },
    {
      key: 'completionRate',
      icon: 'indigo',
      label: t('digiMentorStats.completionRate'),
      value: `${stats.completedSessions > 0 
        ? Math.round((stats.completedSessions / (stats.completedSessions + stats.activeSessions)) * 100)
        : 0}%`,
      svg: (
        <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      )
    }
  ];

  return (
    <div className="digi-mentor-stats-container">
      {statCards.map((card) => (
        <div key={card.key} className="digi-mentor-stats-card">
          <div className={`digi-mentor-stats-icon digi-mentor-stats-icon-${card.icon}`}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              {card.svg}
            </svg>
          </div>
          <div className="digi-mentor-stats-content">
            <p className="digi-mentor-stats-label">{card.label}</p>
            <p className="digi-mentor-stats-value">{card.value}</p>
            {card.detail && <p className="digi-mentor-stats-detail">{card.detail}</p>}
          </div>
        </div>
      ))}
    </div>
  );
};