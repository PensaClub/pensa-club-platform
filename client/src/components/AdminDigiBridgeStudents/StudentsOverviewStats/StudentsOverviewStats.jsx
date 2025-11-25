// src/components/AdminDigiBridgeStudents/StudentsOverviewStats/StudentsOverviewStats.jsx

import { useTranslation } from 'react-i18next';
import './studentsOverviewStats.css';

export const StudentsOverviewStats = ({ stats, loading }) => {
  const { t } = useTranslation();

  if (loading || !stats) {
    return (
      <div className="students-overview-stats">
        <div className="stats-loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  const statsData = [
    {
      label: t('adminDigiBridgeStudents.stats.totalStudents'),
      value: stats.totalStudents || 0,
      icon: '👥',
      bgColor: '#eff6ff',
      textColor: '#2563eb'
    },
    {
      label: t('adminDigiBridgeStudents.stats.activeStudents'),
      value: stats.activeStudents || 0,
      icon: '✅',
      bgColor: '#f0fdf4',
      textColor: '#10b981'
    },
    {
      label: t('adminDigiBridgeStudents.stats.withMentor'),
      value: stats.studentsWithMentor || 0,
      icon: '🎓',
      bgColor: '#f5f3ff',
      textColor: '#8b5cf6'
    },
    {
      label: t('adminDigiBridgeStudents.stats.totalCredits'),
      value: stats.totalCreditsEarned || 0,
      icon: '⭐',
      bgColor: '#fffbeb',
      textColor: '#f59e0b'
    },
    {
      label: t('adminDigiBridgeStudents.stats.avgCredits'),
      value: stats.averageCreditsPerStudent || 0,
      icon: '📊',
      bgColor: '#fff7ed',
      textColor: '#f97316'
    },
    {
      label: t('adminDigiBridgeStudents.stats.attendanceRate'),
      value: `${stats.averageAttendanceRate || 0}%`,
      icon: '📅',
      bgColor: '#f0fdfa',
      textColor: '#14b8a6'
    },
    {
      label: t('adminDigiBridgeStudents.stats.activeCourses'),
      value: stats.activeCourses || 0,
      icon: '📚',
      bgColor: '#eef2ff',
      textColor: '#6366f1'
    },
    {
      label: t('adminDigiBridgeStudents.stats.completedCourses'),
      value: stats.completedCourses || 0,
      icon: '🎯',
      bgColor: '#fdf4ff',
      textColor: '#ec4899'
    }
  ];

  return (
    <div className="students-overview-stats">
      <div className="stats-container">
        {statsData.map((stat, index) => (
          <div key={index} className="stat-item">
            <div 
              className="stat-icon-wrapper" 
              style={{ backgroundColor: stat.bgColor }}
            >
              <span className="stat-icon">{stat.icon}</span>
            </div>
            <div className="stat-content">
              <div className="stat-value" style={{ color: stat.textColor }}>
                {stat.value}
              </div>
              <div className="stat-label">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};