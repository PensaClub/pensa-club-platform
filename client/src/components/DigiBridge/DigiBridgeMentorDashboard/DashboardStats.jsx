// src/components/DigiBridge/DigiBridgeMentorDashboard/DashboardStats.jsx

import React from 'react';
import { useTranslation } from 'react-i18next';
import './dashboardStats.css';

export const DashboardStats = ({ pendingCount, activeCount, completedCount }) => {
  const { t } = useTranslation();

  const stats = [
    {
      icon: '⏳',
      label: t('digiBridge.dashboard.stats.pending'),
      value: pendingCount,
      color: 'orange',
      description: t('digiBridge.dashboard.stats.pendingDesc')
    },
    {
      icon: '💬',
      label: t('digiBridge.dashboard.stats.active'),
      value: activeCount,
      color: 'green',
      description: t('digiBridge.dashboard.stats.activeDesc')
    },
    {
      icon: '✅',
      label: t('digiBridge.dashboard.stats.completed'),
      value: completedCount,
      color: 'blue',
      description: t('digiBridge.dashboard.stats.completedDesc')
    }
  ];

  return (
    <div className="digibridge-dashboard-stats">
      {stats.map((stat, index) => (
        <div 
          key={index} 
          className={`digibridge-dashboard-stat-card digibridge-dashboard-stat-${stat.color}`}
        >
          <div className="digibridge-dashboard-stat-icon">{stat.icon}</div>
          <div className="digibridge-dashboard-stat-content">
            <div className="digibridge-dashboard-stat-value">{stat.value}</div>
            <div className="digibridge-dashboard-stat-label">{stat.label}</div>
            <div className="digibridge-dashboard-stat-description">{stat.description}</div>
          </div>
        </div>
      ))}
    </div>
  );
};