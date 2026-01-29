import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import './studentQuickStats.css';

const StudentQuickStats = ({ data }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // data е целият response, достъпваме през dashboard
  const dashboard = data?.dashboard;

  const stats = [
    {
      id: 'enrolled',
      label: t('studentQuickStats.enrolledCourses'),
      value: dashboard?.courses?.enrolled || 0,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      ),
      color: '#3b82f6',
      gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
      onClick: () => navigate('/academy/my/courses')
    },
    {
      id: 'completed',
      label: t('studentQuickStats.completedCourses'),
      value: dashboard?.courses?.completed || 0,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #10b981, #059669)',
      onClick: () => navigate('/academy/my/courses?filter=completed')
    },
    {
      id: 'lectures',
      label: t('studentQuickStats.upcomingLectures'),
      value: dashboard?.lectures?.upcoming || 0,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
      onClick: () => navigate('/academy/my/lectures')
    },
    {
      id: 'certificates',
      label: t('studentQuickStats.certificates'),
      value: dashboard?.certificates || 0,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="8" r="6" />
          <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
        </svg>
      ),
      color: '#8b5cf6',
      gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
      onClick: () => navigate('/academy/my/certificates')
    }
  ];

  return (
    <div className="sdqs-container">
      <h2 className="sdqs-title">{t('studentQuickStats.title')}</h2>
      
      <div className="sdqs-grid">
        {stats.map((stat) => (
          <div 
            key={stat.id}
            className="sdqs-card"
            onClick={stat.onClick}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => e.key === 'Enter' && stat.onClick()}
          >
            <div 
              className="sdqs-card-icon"
              style={{ background: stat.gradient }}
            >
              {stat.icon}
            </div>
            
            <div className="sdqs-card-content">
              <div className="sdqs-card-value">{stat.value}</div>
              <div className="sdqs-card-label">{stat.label}</div>
            </div>

            <div 
              className="sdqs-card-accent"
              style={{ background: stat.color }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentQuickStats;