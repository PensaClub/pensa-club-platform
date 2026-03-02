// src/components/AdminDigiBridgeMentorApplications/ApplicationsStats/ApplicationsStats.jsx

import { useTranslation } from 'react-i18next';
import './applicationsStats.css';

export const ApplicationsStats = ({ stats }) => {
  const { t } = useTranslation('digibridge');

  const statCards = [
    {
      key: 'totalApplications',
      label: t('ApplicationsStats.totalApplications'),
      value: stats.totalApplications,
      icon: '📋',
      color: '#8b5cf6',
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
    },
    {
      key: 'newToday',
      label: t('ApplicationsStats.newToday'),
      value: stats.newToday,
      icon: '🆕',
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
    },
    {
      key: 'pending',
      label: t('ApplicationsStats.pending'),
      value: stats.pending,
      icon: '⏳',
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
    }
  ];

  return (
    <div className="applications-stats">
      <div className="applications-stats-grid">
        {statCards.map((card) => (
          <div 
            key={card.key} 
            className="applications-stats-card"
            style={{ '--card-gradient': card.gradient }}
          >
            <div className="applications-stats-card-icon-wrapper">
              <span 
                className="applications-stats-card-icon"
                style={{ backgroundColor: card.color }}
              >
                {card.icon}
              </span>
            </div>
            
            <div className="applications-stats-card-content">
              <h3 className="applications-stats-card-label">
                {card.label}
              </h3>
              <p className="applications-stats-card-value">
                {card.value}
              </p>
            </div>

            {/* Animated background glow */}
            <div 
              className="applications-stats-card-glow"
              style={{ backgroundColor: card.color }}
            ></div>
          </div>
        ))}
      </div>
    </div>
  );
};