import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import './studentContinueLearning.css';

const StudentContinueLearning = ({ courses = [] }) => {
  const { t } = useTranslation('student-dashboard');
  const navigate = useNavigate();

  return (
    <div className="sdcl-container">
      <div className="sdcl-header">
        <h2 className="sdcl-title">{t('studentContinueLearning.title')}</h2>
        {courses.length > 0 && (
          <button 
            className="sdcl-view-all"
            onClick={() => navigate('/academy/my/courses')}
          >
            {t('studentContinueLearning.viewAll')}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        )}
      </div>

      {/* Courses Grid */}
      {courses.length > 0 ? (
        <div className="sdcl-grid">
          {courses.map((enrollment) => {
            const courseData = enrollment.course || {};
            const progress = enrollment.progressPercentage || 0;
            const completedLessons = enrollment.completedLessons || 0;
            const totalLessons = courseData.totalLessons || 0;
            const thumbnail = courseData.thumbnailUrl;
            const title = courseData.name || 'Untitled';
            const slug = courseData.slug || '';

            return (
              <div 
                key={enrollment.id} 
                className="sdcl-card"
                onClick={() => navigate(`/academy/courses/${slug}`)}
              >
                {/* Thumbnail */}
                <div className="sdcl-card-image">
                  {thumbnail ? (
                    <img src={thumbnail} alt={title} />
                  ) : (
                    <div className="sdcl-card-placeholder">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                      </svg>
                    </div>
                  )}
                  
                  {/* Progress Badge */}
                  <div className="sdcl-card-badge">
                    {progress}%
                  </div>
                </div>

                {/* Info */}
                <div className="sdcl-card-info">
                  <h3 className="sdcl-card-title">{title}</h3>
                  <p className="sdcl-card-lessons">
                    {completedLessons} / {totalLessons} {t('studentContinueLearning.lessons')}
                  </p>
                  
                  {/* Progress Bar */}
                  <div className="sdcl-progress">
                    <div 
                      className="sdcl-progress-fill"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Play Icon Overlay */}
                <div className="sdcl-card-play">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="sdcl-empty-inline">
          <p>{t('studentContinueLearning.noCourses')}</p>
        </div>
      )}

      {/* Browse More Link */}
      <div className="sdcl-footer">
        <button 
          className="sdcl-browse-link"
          onClick={() => navigate('/academy/courses')}
        >
          {t('studentContinueLearning.browseMore')}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default StudentContinueLearning;