// src/components/AdminDigiBridgeMentorStatistics/StatisticsOverviewCards/StatisticsOverviewCards.jsx

import React from 'react';
import { useTranslation } from 'react-i18next';
import './statisticsOverviewCards.css';

export const StatisticsOverviewCards = ({ stats }) => {
  const { t } = useTranslation('digibridge');

  const cards = [
    {
      key: 'activeMentors',
      icon: '👥',
      label: t('StatisticsOverviewCards.activeMentors'),
      value: stats.activeMentors,
      total: stats.totalMentors,
      suffix: t('StatisticsOverviewCards.mentors'),
      color: '#8b5cf6',
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
    },
    {
      key: 'totalStudents',
      icon: '🎓',
      label: t('StatisticsOverviewCards.totalStudents'),
      value: stats.totalStudents,
      suffix: t('StatisticsOverviewCards.students'),
      color: '#0ea5e9',
      gradient: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)'
    },
    {
      key: 'averageRating',
      icon: '⭐',
      label: t('StatisticsOverviewCards.averageRating'),
      value: stats.averageRating,
      suffix: '/ 5.0',
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
    },
    {
      key: 'totalCoursesCompleted',
      icon: '📚',
      label: t('StatisticsOverviewCards.coursesCompleted'),
      value: stats.totalCoursesCompleted,
      suffix: t('StatisticsOverviewCards.courses'),
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
    },
    {
      key: 'totalSessionsThisMonth',
      icon: '📝',
      label: t('StatisticsOverviewCards.sessionsThisMonth'),
      value: stats.totalSessionsThisMonth,
      suffix: t('StatisticsOverviewCards.sessions'),
      color: '#6366f1',
      gradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'
    },
    {
      key: 'totalOnlineHours',
      icon: '⏰',
      label: t('StatisticsOverviewCards.onlineHours'),
      value: stats.totalOnlineHours,
      suffix: t('StatisticsOverviewCards.hours'),
      color: '#ec4899',
      gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)'
    },
    {
      key: 'averageCompletionRate',
      icon: '✅',
      label: t('StatisticsOverviewCards.completionRate'),
      value: stats.averageCompletionRate,
      suffix: '%',
      color: '#14b8a6',
      gradient: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)'
    },
    {
      key: 'totalReviews',
      icon: '💬',
      label: t('StatisticsOverviewCards.totalReviews'),
      value: stats.totalReviews,
      suffix: t('StatisticsOverviewCards.reviews'),
      color: '#f97316',
      gradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)'
    }
  ];

  return (
    <div className="statistics-overview-cards">
      <div className="statistics-overview-cards-grid">
        {cards.map((card) => (
          <div 
            key={card.key} 
            className="statistics-overview-card"
            style={{ '--card-gradient': card.gradient }}
          >
            <div className="statistics-overview-card-icon-wrapper">
              <span 
                className="statistics-overview-card-icon"
                style={{ backgroundColor: card.color }}
              >
                {card.icon}
              </span>
            </div>
            
            <div className="statistics-overview-card-content">
              <h3 className="statistics-overview-card-label">
                {card.label}
              </h3>
              <div className="statistics-overview-card-value-wrapper">
                <p className="statistics-overview-card-value">
                  {card.value}
                </p>
                {card.total && (
                  <span className="statistics-overview-card-total">
                    / {card.total}
                  </span>
                )}
                <span className="statistics-overview-card-suffix">
                  {card.suffix}
                </span>
              </div>
            </div>

            {/* Animated background glow */}
            <div 
              className="statistics-overview-card-glow"
              style={{ backgroundColor: card.color }}
            ></div>
          </div>
        ))}
      </div>
    </div>
  );
};