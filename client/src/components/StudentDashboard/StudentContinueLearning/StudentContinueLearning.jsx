import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import './studentContinueLearning.css';

const StudentContinueLearning = ({ courses = [] }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Ако няма курсове
  if (!courses || courses.length === 0) {
    return (
      <div className="sdcl-container">
        <h2 className="sdcl-title">{t('studentContinueLearning.title')}</h2>
        
        <div className="sdcl-empty">
          <div className="sdcl-empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              <line x1="12" y1="6" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <p className="sdcl-empty-text">{t('studentContinueLearning.noCourses')}</p>
          <button 
            className="sdcl-browse-button"
            onClick={() => navigate('/academy/courses')}
          >
            {t('studentContinueLearning.browseCourses')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="sdcl-container">
      <div className="sdcl-header">
        <h2 className="sdcl-title">{t('studentContinueLearning.title')}</h2>
        <button 
          className="sdcl-view-all"
          onClick={() => navigate('/academy/my/courses')}
        >
          {t('studentContinueLearning.viewAll')}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      <div className="sdcl-list">
        {courses.map((course) => {
          const progress = course.progress || course.completionPercentage || 0;
          const completedLessons = course.completedLessons || 0;
          const totalLessons = course.totalLessons || course.lessonsCount || 0;
          const thumbnail = course.thumbnail || course.imageUrl || null;

          return (
            <div key={course.id || course.slug} className="sdcl-card">
              {/* Thumbnail */}
              <div className="sdcl-card-thumbnail">
                {thumbnail ? (
                  <img src={thumbnail} alt={course.title} />
                ) : (
                  <div className="sdcl-card-thumbnail-placeholder">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                )}
                
                {/* Progress overlay */}
                <div className="sdcl-card-progress-badge">
                  {Math.round(progress)}%
                </div>
              </div>

              {/* Content */}
              <div className="sdcl-card-content">
                <h3 className="sdcl-card-title">{course.title}</h3>
                
                <div className="sdcl-card-meta">
                  <span className="sdcl-card-lessons">
                    {completedLessons} / {totalLessons} {t('studentContinueLearning.lessons')}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="sdcl-card-progress-bar">
                  <div 
                    className="sdcl-card-progress-fill"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
              </div>

              {/* Continue button */}
              <button 
                className="sdcl-card-button"
                onClick={() => navigate(`/academy/courses/${course.slug}`)}
              >
                {t('studentContinueLearning.continue')}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StudentContinueLearning;