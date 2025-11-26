// src/components/AdminDigiBridgeStudents/StudentsStatsCharts/TopPerformersTable.jsx

import { useTranslation } from 'react-i18next';
import './studentsStatsCharts.css';

export const TopPerformersTable = ({ students, loading, onViewDetails }) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="studentsStatsChart">
        <div className="studentsStatsChart-loading">
          <div className="studentsStatsChart-spinner"></div>
          <span>{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  if (!students || students.length === 0) {
    return (
      <div className="studentsStatsChart">
        <div className="studentsStatsChart-empty">
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
    <div className="studentsStatsChart">
      <div className="studentsStatsChart-header">
        <h3 className="studentsStatsChart-title">
          <span className="studentsStatsChart-icon">🏆</span>
          {t('adminDigiBridgeStudents.charts.topPerformers')}
        </h3>
      </div>

      <div className="studentsStatsChart-body">
        <div className="topPerformers-table">
          <div className="topPerformers-header">
            <span className="topPerformers-col topPerformers-col--rank">#</span>
            <span className="topPerformers-col topPerformers-col--student">
              {t('adminDigiBridgeStudents.charts.student')}
            </span>
            <span className="topPerformers-col topPerformers-col--credits">
              {t('adminDigiBridgeStudents.charts.credits')}
            </span>
            <span className="topPerformers-col topPerformers-col--attendance">
              {t('adminDigiBridgeStudents.charts.attendance')}
            </span>
            <span className="topPerformers-col topPerformers-col--actions"></span>
          </div>

          <div className="topPerformers-body">
            {students.map((student, index) => (
              <div 
                key={student.id} 
                className={`topPerformers-row ${index < 3 ? 'topPerformers-row--top' : ''}`}
              >
                <span className="topPerformers-col topPerformers-col--rank">
                  {getMedalEmoji(index + 1) || index + 1}
                </span>
                <div className="topPerformers-col topPerformers-col--student">
                  <div className="topPerformers-avatar">
                    {student.avatar || student.imageUrl ? (
                      <img src={student.avatar || student.imageUrl} alt={student.name} />
                    ) : (
                      <span>{student.name?.charAt(0)?.toUpperCase() || '?'}</span>
                    )}
                  </div>
                  <div className="topPerformers-info">
                    <span className="topPerformers-name">{student.name}</span>
                    <span className="topPerformers-email">{student.email}</span>
                  </div>
                </div>
                <span className="topPerformers-col topPerformers-col--credits">
                  <span className="topPerformers-credits">
                    ⭐ {student.credits || student.totalCredits || 0}
                  </span>
                </span>
                <span className="topPerformers-col topPerformers-col--attendance">
                  <span className="topPerformers-attendance">
                    {student.attendance || student.attendanceRate || 0}%
                  </span>
                </span>
                <span className="topPerformers-col topPerformers-col--actions">
                  <button
                    className="topPerformers-viewBtn"
                    onClick={() => onViewDetails(student)}
                    type="button"
                  >
                    <svg width="18" height="18" viewBox="0 0 18 18">
                      <path d="M9 3.5c-4 0-7.5 3.5-7.5 5.5s3.5 5.5 7.5 5.5 7.5-3.5 7.5-5.5-3.5-5.5-7.5-5.5zm0 9a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7zm0-5.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" fill="currentColor"/>
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