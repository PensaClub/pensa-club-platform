// client/src/components/DigiMentorPanel/StudentDetails/StudentActivitiesTab.jsx

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './studentActivitiesTab.css';

export const StudentActivitiesTab = ({ student }) => {
  const { t } = useTranslation('digibridge-mentor');
  const [activeSection, setActiveSection] = useState('all');

  if (!student) return null;

  const { lectures = [], seminars = [], presentations = [] } = student;

  const getActivityIcon = (type) => {
    const icons = {
      lecture: '🎓',
      seminar: '🎯',
      presentation: '📊'
    };
    return icons[type] || '📝';
  };

  const getStatusBadge = (attended, status) => {
    if (status === 'scheduled') {
      return { color: '#d97706', bg: '#fef3c7', label: t('studentDetails.activities.scheduled') };
    }
    return attended
      ? { color: '#059669', bg: '#d1fae5', label: t('studentDetails.activities.attended') }
      : { color: '#dc2626', bg: '#fee2e2', label: t('studentDetails.activities.missed') };
  };

  // Calculate stats
  const totalLectures = lectures.length;
  const attendedLectures = lectures.filter(l => l.attended).length;
  const totalSeminars = seminars.length;
  const attendedSeminars = seminars.filter(s => s.attended).length;
  const totalPresentations = presentations.length;

  const sections = [
    { id: 'all', label: t('studentDetails.activities.all'), icon: '📋' },
    { id: 'lectures', label: t('studentDetails.activities.lectures'), icon: '🎓', count: totalLectures },
    { id: 'seminars', label: t('studentDetails.activities.seminars'), icon: '🎯', count: totalSeminars },
    { id: 'presentations', label: t('studentDetails.activities.presentations'), icon: '📊', count: totalPresentations }
  ];

  const renderActivity = (activity, type) => {
    const statusBadge = getStatusBadge(activity.attended, activity.status);
    
    return (
      <div key={activity[`${type}Id`]} className="student-activity-card">
        <div className="student-activity-card-header">
          <div className="student-activity-icon">
            {getActivityIcon(type)}
          </div>
          <span
            className="student-activity-status-badge"
            style={{ background: statusBadge.bg, color: statusBadge.color }}
          >
            {statusBadge.label}
          </span>
        </div>

        <div className="student-activity-card-body">
          <h4 className="student-activity-title">{activity.title}</h4>

          <div className="student-activity-details">
            <div className="student-activity-detail">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 7V3M16 7V3M7 11H17M5 21H19C20.1046 21 21 20.1046 21 19V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V19C3 20.1046 3.89543 21 5 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>{new Date(activity.date).toLocaleDateString('bg-BG')}</span>
            </div>

            {activity.duration && (
              <div className="student-activity-detail">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>{activity.duration} {t('studentDetails.activities.minutes')}</span>
              </div>
            )}

            <div className="student-activity-detail">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>{activity.earnedCredits || activity.maxCredits || 0} {t('studentDetails.activities.credits')}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="student-activities-tab">
      {/* STATS OVERVIEW */}
      <div className="student-activities-stats">
        <div className="student-activities-stat-card">
          <div className="student-activities-stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
            🎓
          </div>
          <div className="student-activities-stat-content">
            <span className="student-activities-stat-value">{attendedLectures} / {totalLectures}</span>
            <span className="student-activities-stat-label">{t('studentDetails.activities.lectures')}</span>
          </div>
        </div>

        <div className="student-activities-stat-card">
          <div className="student-activities-stat-icon" style={{ background: '#d1fae5', color: '#059669' }}>
            🎯
          </div>
          <div className="student-activities-stat-content">
            <span className="student-activities-stat-value">{attendedSeminars} / {totalSeminars}</span>
            <span className="student-activities-stat-label">{t('studentDetails.activities.seminars')}</span>
          </div>
        </div>

        <div className="student-activities-stat-card">
          <div className="student-activities-stat-icon" style={{ background: '#dbeafe', color: '#2563eb' }}>
            📊
          </div>
          <div className="student-activities-stat-content">
            <span className="student-activities-stat-value">{totalPresentations}</span>
            <span className="student-activities-stat-label">{t('studentDetails.activities.presentations')}</span>
          </div>
        </div>

        <div className="student-activities-stat-card">
          <div className="student-activities-stat-icon" style={{ background: '#fce7f3', color: '#db2777' }}>
            💎
          </div>
          <div className="student-activities-stat-content">
            <span className="student-activities-stat-value">
              {[...lectures, ...seminars, ...presentations].reduce((sum, activity) => sum + (activity.earnedCredits || 0), 0)}
            </span>
            <span className="student-activities-stat-label">{t('studentDetails.activities.totalCredits')}</span>
          </div>
        </div>
      </div>

      {/* SECTION FILTERS */}
      <div className="student-activities-filters">
        {sections.map(section => (
          <button
            key={section.id}
            className={`student-activities-filter-btn ${activeSection === section.id ? 'student-activities-filter-btn-active' : ''}`}
            onClick={() => setActiveSection(section.id)}
          >
            <span className="student-activities-filter-icon">{section.icon}</span>
            <span className="student-activities-filter-label">{section.label}</span>
            {section.count !== undefined && (
              <span className="student-activities-filter-count">{section.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* ACTIVITIES GRID */}
      <div className="student-activities-content">
        {/* LECTURES */}
        {(activeSection === 'all' || activeSection === 'lectures') && lectures.length > 0 && (
          <div className="student-activities-section">
            {activeSection === 'all' && (
              <h3 className="student-activities-section-title">
                🎓 {t('studentDetails.activities.lectures')}
              </h3>
            )}
            <div className="student-activities-grid">
              {lectures.map(lecture => renderActivity(lecture, 'lecture'))}
            </div>
          </div>
        )}

        {/* SEMINARS */}
        {(activeSection === 'all' || activeSection === 'seminars') && seminars.length > 0 && (
          <div className="student-activities-section">
            {activeSection === 'all' && (
              <h3 className="student-activities-section-title">
                🎯 {t('studentDetails.activities.seminars')}
              </h3>
            )}
            <div className="student-activities-grid">
              {seminars.map(seminar => renderActivity(seminar, 'seminar'))}
            </div>
          </div>
        )}

        {/* PRESENTATIONS */}
        {(activeSection === 'all' || activeSection === 'presentations') && presentations.length > 0 && (
          <div className="student-activities-section">
            {activeSection === 'all' && (
              <h3 className="student-activities-section-title">
                📊 {t('studentDetails.activities.presentations')}
              </h3>
            )}
            <div className="student-activities-grid">
              {presentations.map(presentation => renderActivity(presentation, 'presentation'))}
            </div>
          </div>
        )}

        {/* EMPTY STATE */}
        {((activeSection === 'lectures' && lectures.length === 0) ||
          (activeSection === 'seminars' && seminars.length === 0) ||
          (activeSection === 'presentations' && presentations.length === 0)) && (
          <div className="student-activities-empty">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 7V3M16 7V3M7 11H17M5 21H19C20.1046 21 21 20.1046 21 19V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V19C3 20.1046 3.89543 21 5 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p>{t('studentDetails.activities.noActivities')}</p>
          </div>
        )}
      </div>
    </div>
  );
};