// src/components/AdminDigiBridgeMentors/AdminDigiBridgeMentorStats/AdminDigiBridgeMentorStats.jsx

import React from 'react';
import { useTranslation } from 'react-i18next';
import './adminDigiBridgeMentorStats.css';

export const AdminDigiBridgeMentorStats = ({ 
  totalMentors, 
  onlineMentors, 
  totalStudents, 
  averageRating 
}) => {
  const { t } = useTranslation();

  const stats = [
    {
      id: 1,
      label: t('AdminDigiBridgeMentors.Stats.totalMentors'),
      value: totalMentors,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
      gradient: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
      bgColor: 'rgba(14, 165, 233, 0.1)'
    },
    {
      id: 2,
      label: t('AdminDigiBridgeMentors.Stats.onlineMentors'),
      value: onlineMentors,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 6v6l4 2"/>
        </svg>
      ),
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      bgColor: 'rgba(16, 185, 129, 0.1)'
    },
    {
      id: 3,
      label: t('AdminDigiBridgeMentors.Stats.totalStudents'),
      value: totalStudents,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      bgColor: 'rgba(245, 158, 11, 0.1)'
    },
    {
      id: 4,
      label: t('AdminDigiBridgeMentors.Stats.averageRating'),
      value: averageRating,
      suffix: '/5',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ),
      gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      bgColor: 'rgba(239, 68, 68, 0.1)'
    }
  ];

  return (
    <div className="admin-digibridge-mentor-stats">
      {stats.map(stat => (
        <div 
          key={stat.id} 
          className="admin-digibridge-mentor-stats-card"
          style={{ background: stat.bgColor }}
        >
          <div 
            className="admin-digibridge-mentor-stats-icon"
            style={{ background: stat.gradient }}
          >
            {stat.icon}
          </div>
          
          <div className="admin-digibridge-mentor-stats-content">
            <div className="admin-digibridge-mentor-stats-value">
              {stat.value}
              {stat.suffix && <span className="admin-digibridge-mentor-stats-suffix">{stat.suffix}</span>}
            </div>
            <div className="admin-digibridge-mentor-stats-label">
              {stat.label}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};