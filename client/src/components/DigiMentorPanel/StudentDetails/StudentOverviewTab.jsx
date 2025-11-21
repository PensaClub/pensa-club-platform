// client/src/components/DigiMentorPanel/StudentDetails/StudentOverviewTab.jsx

import { useTranslation } from 'react-i18next';
import './studentOverviewTab.css';

export const StudentOverviewTab = ({ student }) => {
  const { t } = useTranslation();

  if (!student) return null;

  const { credits, currentMentor, mentorHistory, courses } = student;

  // Calculate overall progress
  const totalCoursesProgress = courses.reduce((sum, course) => sum + course.progress, 0);
  const averageProgress = courses.length > 0 ? Math.round(totalCoursesProgress / courses.length) : 0;

  const inProgressCourses = courses.filter(c => c.status === 'in_progress').length;
  const completedCourses = courses.filter(c => c.status === 'completed').length;

  // ✅ Safe progress calculation
  const creditsProgress = credits.totalPossible > 0 
    ? (credits.totalEarned / credits.totalPossible) * 502.4 
    : 0;

  return (
    <div className="student-overview-tab">
      {/* CREDITS SECTION */}
      <div className="student-overview-section">
        <h3 className="student-overview-section-title">
          💎 {t('studentDetails.overview.creditsBreakdown')}
        </h3>
        
        <div className="student-overview-credits">
          {/* MAIN CREDITS CARD */}
          <div className="student-overview-credits-main">
            <div className="student-overview-credits-circle">
              <svg viewBox="0 0 200 200">
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="20"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="20"
                  strokeDasharray={`${creditsProgress} 502.4`}
                  strokeLinecap="round"
                  transform="rotate(-90 100 100)"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#667eea" />
                    <stop offset="100%" stopColor="#764ba2" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="student-overview-credits-center">
                <span className="student-overview-credits-value">{credits.totalEarned}</span>
                <span className="student-overview-credits-total">/ {credits.totalPossible}</span>
              </div>
            </div>
            <p className="student-overview-credits-label">{t('studentDetails.totalCredits')}</p>
          </div>

          {/* BREAKDOWN CARDS */}
          <div className="student-overview-credits-breakdown">
            <div className="student-overview-credits-card">
              <div className="student-overview-credits-card-icon" style={{ background: '#dbeafe' }}>
                📚
              </div>
              <div className="student-overview-credits-card-content">
                <span className="student-overview-credits-card-value">{credits.breakdown.fromCourses}</span>
                <span className="student-overview-credits-card-label">{t('studentDetails.overview.fromCourses')}</span>
              </div>
            </div>

            <div className="student-overview-credits-card">
              <div className="student-overview-credits-card-icon" style={{ background: '#fef3c7' }}>
                🎓
              </div>
              <div className="student-overview-credits-card-content">
                <span className="student-overview-credits-card-value">{credits.breakdown.fromLectures}</span>
                <span className="student-overview-credits-card-label">{t('studentDetails.overview.fromLectures')}</span>
              </div>
            </div>

            <div className="student-overview-credits-card">
              <div className="student-overview-credits-card-icon" style={{ background: '#d1fae5' }}>
                🎯
              </div>
              <div className="student-overview-credits-card-content">
                <span className="student-overview-credits-card-value">{credits.breakdown.fromSeminars}</span>
                <span className="student-overview-credits-card-label">{t('studentDetails.overview.fromSeminars')}</span>
              </div>
            </div>

            <div className="student-overview-credits-card">
              <div className="student-overview-credits-card-icon" style={{ background: '#fce7f3' }}>
                📊
              </div>
              <div className="student-overview-credits-card-content">
                <span className="student-overview-credits-card-value">{credits.breakdown.fromPresentations}</span>
                <span className="student-overview-credits-card-label">{t('studentDetails.overview.fromPresentations')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MENTOR INFO & PROGRESS */}
      <div className="student-overview-grid">
        {/* CURRENT MENTOR */}
        <div className="student-overview-section">
          <h3 className="student-overview-section-title">
            👤 {t('studentDetails.overview.mentorInfo')}
          </h3>
          
          <div className="student-overview-mentor-card">
            <div className="student-overview-mentor-current">
              <div className="student-overview-mentor-avatar">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17 20C17 18.3431 14.7614 17 12 17C9.23858 17 7 18.3431 7 20M12 14C10.3431 14 9 12.6569 9 11C9 9.34315 10.3431 8 12 8C13.6569 8 15 9.34315 15 11C15 12.6569 13.6569 14 12 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="student-overview-mentor-info">
                <span className="student-overview-mentor-name">{currentMentor?.name || 'N/A'}</span>
                {currentMentor?.assignedDate && (
                  <span className="student-overview-mentor-date">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 7V3M16 7V3M7 11H17M5 21H19C20.1046 21 21 20.1046 21 19V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V19C3 20.1046 3.89543 21 5 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {t('studentDetails.overview.assignedDate')}: {new Date(currentMentor.assignedDate).toLocaleDateString('bg-BG')}
                  </span>
                )}
              </div>
              <span className="student-overview-mentor-badge">{t('studentDetails.currentMentor')}</span>
            </div>

            {/* MENTOR HISTORY */}
            {mentorHistory && mentorHistory.length > 0 && (
              <div className="student-overview-mentor-history">
                <h4 className="student-overview-mentor-history-title">
                  {t('studentDetails.overview.mentorHistory')}
                </h4>
                {mentorHistory.map((history) => (
                  <div key={history.id} className="student-overview-mentor-history-item">
                    <div className="student-overview-mentor-history-icon">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="student-overview-mentor-history-content">
                      <span className="student-overview-mentor-history-name">{history.mentorName}</span>
                      <span className="student-overview-mentor-history-period">
                        {new Date(history.periodStart).toLocaleDateString('bg-BG')} - {history.periodEnd ? new Date(history.periodEnd).toLocaleDateString('bg-BG') : 'Настояще'}
                      </span>
                      {history.reason && (
                        <span className="student-overview-mentor-history-reason">{history.reason}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* PROGRESS SUMMARY */}
        <div className="student-overview-section">
          <h3 className="student-overview-section-title">
            📈 {t('studentDetails.overview.progress')}
          </h3>
          
          <div className="student-overview-progress-card">
            {/* OVERALL PROGRESS */}
            <div className="student-overview-progress-item">
              <div className="student-overview-progress-header">
                <span className="student-overview-progress-label">{t('studentDetails.overview.overallProgress')}</span>
                <span className="student-overview-progress-value">{averageProgress}%</span>
              </div>
              <div className="student-overview-progress-bar">
                <div 
                  className="student-overview-progress-bar-fill"
                  style={{ width: `${averageProgress}%` }}
                />
              </div>
            </div>

            {/* COURSES STATS */}
            <div className="student-overview-progress-stats">
              <div className="student-overview-progress-stat">
                <div className="student-overview-progress-stat-icon" style={{ background: '#dbeafe', color: '#2563eb' }}>
                  📚
                </div>
                <div className="student-overview-progress-stat-content">
                  <span className="student-overview-progress-stat-value">{inProgressCourses}</span>
                  <span className="student-overview-progress-stat-label">{t('studentDetails.courses.inProgress')}</span>
                </div>
              </div>

              <div className="student-overview-progress-stat">
                <div className="student-overview-progress-stat-icon" style={{ background: '#d1fae5', color: '#059669' }}>
                  ✅
                </div>
                <div className="student-overview-progress-stat-content">
                  <span className="student-overview-progress-stat-value">{completedCourses}</span>
                  <span className="student-overview-progress-stat-label">{t('studentDetails.courses.completed')}</span>
                </div>
              </div>

              <div className="student-overview-progress-stat">
                <div className="student-overview-progress-stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
                  🎯
                </div>
                <div className="student-overview-progress-stat-content">
                  <span className="student-overview-progress-stat-value">{courses.length}</span>
                  <span className="student-overview-progress-stat-label">{t('studentDetails.overview.totalCourses')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};