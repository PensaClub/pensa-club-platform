// src/components/AdminDigiBridgeStudents/StudentsStatsCharts/TopPerformersTable.jsx

import { useTranslation } from 'react-i18next';
import './topPerformersTable.css';

export const TopPerformersTable = ({ students, loading, onViewDetails }) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="topPerformersTable">
        <div className="topPerformersTable-loading">
          <div className="topPerformersTable-spinner"></div>
          <span>{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  if (!students || students.length === 0) {
    return (
      <div className="topPerformersTable">
        <div className="topPerformersTable-empty">
          <svg width="64" height="64" viewBox="0 0 64 64">
            <path d="M32 8l8 16h16l-12 12 4 16-16-8-16 8 4-16L8 24h16z" fill="currentColor" opacity="0.3"/>
          </svg>
          <span>{t('adminDigiBridgeStudents.charts.noData')}</span>
        </div>
      </div>
    );
  }

  const getMedalEmoji = (rank) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return null;
    }
  };

  return (
    <div className="topPerformersTable">
      <div className="topPerformersTable-header">
        <h3 className="topPerformersTable-title">
          <span className="topPerformersTable-icon">🏆</span>
          {t('adminDigiBridgeStudents.charts.topPerformers')}
        </h3>
        <span className="topPerformersTable-count">
          {students.length} {t('adminDigiBridgeStudents.charts.students')}
        </span>
      </div>

      <div className="topPerformersTable-body">
        <div className="topPerformersTable-grid">
          {/* Table Header */}
          <div className="topPerformersTable-gridHeader">
            <span className="topPerformersTable-col topPerformersTable-col--rank">
              {t('adminDigiBridgeStudents.charts.rank')}
            </span>
            <span className="topPerformersTable-col topPerformersTable-col--student">
              {t('adminDigiBridgeStudents.charts.student')}
            </span>
            <span className="topPerformersTable-col topPerformersTable-col--credits">
              {t('adminDigiBridgeStudents.charts.credits')}
            </span>
            <span className="topPerformersTable-col topPerformersTable-col--attendance">
              {t('adminDigiBridgeStudents.charts.attendance')}
            </span>
            <span className="topPerformersTable-col topPerformersTable-col--actions"></span>
          </div>

          {/* Table Rows */}
          <div className="topPerformersTable-rows">
            {students.map((student, index) => (
              <div 
                key={student.id} 
                className={`topPerformersTable-row ${index < 3 ? 'topPerformersTable-row--top' : ''}`}
              >
                <span className="topPerformersTable-col topPerformersTable-col--rank">
                  {getMedalEmoji(index + 1) || index + 1}
                </span>
                <div className="topPerformersTable-col topPerformersTable-col--student">
                  <div className="topPerformersTable-avatar">
                    {student.avatar || student.imageUrl ? (
                      <img src={student.avatar || student.imageUrl} alt={student.name} />
                    ) : (
                      <span>{student.name?.charAt(0)?.toUpperCase() || '?'}</span>
                    )}
                  </div>
                  <div className="topPerformersTable-studentInfo">
                    <span className="topPerformersTable-studentName">{student.name}</span>
                    <span className="topPerformersTable-studentMentor">
                      {student.mentorName || t('adminDigiBridgeStudents.noMentor')}
                    </span>
                  </div>
                </div>
                <span className="topPerformersTable-col topPerformersTable-col--credits">
                  <span className="topPerformersTable-creditsValue">
                    ⭐ {student.totalCredits || student.credits || 0}
                  </span>
                </span>
                <span className="topPerformersTable-col topPerformersTable-col--attendance">
                  <span className="topPerformersTable-attendanceValue">
                    {student.attendanceRate || student.attendance || 0}%
                  </span>
                </span>
                <span className="topPerformersTable-col topPerformersTable-col--actions">
                  <button
                    className="topPerformersTable-viewBtn"
                    onClick={() => onViewDetails && onViewDetails(student)}
                    type="button"
                    title={t('adminDigiBridgeStudents.charts.viewDetails')}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  </button>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};