// client/src/components/DigiMentorPanel/StudentDetails/StudentCoursesTab.jsx

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './studentCoursesTab.css';

export const StudentCoursesTab = ({ student }) => {
  const { t } = useTranslation();
  const [filterStatus, setFilterStatus] = useState('all');

  if (!student || !student.courses) return null;

  const { courses } = student;

  const getStatusBadge = (status) => {
    const statusConfig = {
      in_progress: { color: '#2563eb', bg: '#dbeafe', label: t('studentDetails.courses.inProgress') },
      completed: { color: '#059669', bg: '#d1fae5', label: t('studentDetails.courses.completed') },
      not_started: { color: '#6b7280', bg: '#f3f4f6', label: t('studentDetails.courses.notStarted') }
    };
    return statusConfig[status] || statusConfig.not_started;
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Базови дигитални умения': '#3b82f6',
      'Напреднали дигитални умения': '#8b5cf6',
      'Специализирани умения': '#ec4899',
      'Социални медии': '#06b6d4',
      'Творчески умения': '#f59e0b'
    };
    return colors[category] || '#6b7280';
  };

  const filteredCourses = filterStatus === 'all' 
    ? courses 
    : courses.filter(c => c.status === filterStatus);

  return (
    <div className="student-courses-tab">
      {/* HEADER WITH FILTERS */}
      <div className="student-courses-header">
        <h3 className="student-courses-title">
          📚 {t('studentDetails.courses.title')} ({filteredCourses.length})
        </h3>
        
        <div className="student-courses-filters">
          <button
            className={`student-courses-filter-btn ${filterStatus === 'all' ? 'student-courses-filter-btn-active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            {t('studentDetails.courses.all')}
          </button>
          <button
            className={`student-courses-filter-btn ${filterStatus === 'in_progress' ? 'student-courses-filter-btn-active' : ''}`}
            onClick={() => setFilterStatus('in_progress')}
          >
            {t('studentDetails.courses.inProgress')}
          </button>
          <button
            className={`student-courses-filter-btn ${filterStatus === 'completed' ? 'student-courses-filter-btn-active' : ''}`}
            onClick={() => setFilterStatus('completed')}
          >
            {t('studentDetails.courses.completed')}
          </button>
          <button
            className={`student-courses-filter-btn ${filterStatus === 'not_started' ? 'student-courses-filter-btn-active' : ''}`}
            onClick={() => setFilterStatus('not_started')}
          >
            {t('studentDetails.courses.notStarted')}
          </button>
        </div>
      </div>

      {/* COURSES GRID */}
      {filteredCourses.length === 0 ? (
        <div className="student-courses-empty">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 6.25278V19.2528M12 6.25278C10.8321 5.47686 9.24649 5 7.5 5C5.75351 5 4.16789 5.47686 3 6.25278V19.2528C4.16789 18.4769 5.75351 18 7.5 18C9.24649 18 10.8321 18.4769 12 19.2528M12 6.25278C13.1679 5.47686 14.7535 5 16.5 5C18.2465 5 19.8321 5.47686 21 6.25278V19.2528C19.8321 18.4769 18.2465 18 16.5 18C14.7535 18 13.1679 18.4769 12 19.2528" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p>{t('studentDetails.courses.noCourses')}</p>
        </div>
      ) : (
        <div className="student-courses-grid">
          {filteredCourses.map((course) => {
            const statusBadge = getStatusBadge(course.status);
            const categoryColor = getCategoryColor(course.category);
            
            return (
              <div key={course.courseId} className="student-course-card">
                {/* THUMBNAIL */}
                {course.thumbnailUrl && (
                  <div className="student-course-thumbnail">
                    <img src={course.thumbnailUrl} alt={course.courseName} />
                  </div>
                )}

                {/* CARD HEADER */}
                <div className="student-course-card-header">
                  <div className="student-course-icon">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 6.25278V19.2528M12 6.25278C10.8321 5.47686 9.24649 5 7.5 5C5.75351 5 4.16789 5.47686 3 6.25278V19.2528C4.16789 18.4769 5.75351 18 7.5 18C9.24649 18 10.8321 18.4769 12 19.2528M12 6.25278C13.1679 5.47686 14.7535 5 16.5 5C18.2465 5 19.8321 5.47686 21 6.25278V19.2528C19.8321 18.4769 18.2465 18 16.5 18C14.7535 18 13.1679 18.4769 12 19.2528" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span 
                    className="student-course-status-badge"
                    style={{ background: statusBadge.bg, color: statusBadge.color }}
                  >
                    {statusBadge.label}
                  </span>
                </div>

                {/* CARD BODY */}
                <div className="student-course-card-body">
                  <h4 className="student-course-name">{course.courseName}</h4>
                  
                  {/* CATEGORY */}
                  {course.category && (
                    <div className="student-course-category">
                      <span 
                        className="student-course-category-badge"
                        style={{ 
                          background: `${categoryColor}20`,
                          color: categoryColor,
                          borderColor: categoryColor
                        }}
                      >
                        {course.category}
                      </span>
                    </div>
                  )}

                  {/* PROGRESS BAR */}
                  <div className="student-course-progress">
                    <div className="student-course-progress-header">
                      <span className="student-course-progress-label">{t('studentDetails.courses.progress')}</span>
                      <span className="student-course-progress-value">{course.progress}%</span>
                    </div>
                    <div className="student-course-progress-bar">
                      <div 
                        className="student-course-progress-bar-fill"
                        style={{ 
                          width: `${course.progress}%`,
                          background: course.status === 'completed' ? '#059669' : 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
                        }}
                      />
                    </div>
                  </div>

                  {/* LESSONS INFO */}
                  <div className="student-course-lessons">
                    <div className="student-course-stat">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>{course.completedLessons} / {course.totalLessons} {t('studentDetails.courses.lessons')}</span>
                    </div>
                    <div className="student-course-stat">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>{course.earnedCredits} / {course.maxCredits} 💎</span>
                    </div>
                  </div>

                  {/* DATES */}
                  <div className="student-course-dates">
                    {course.startDate && (
                      <div className="student-course-date">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M8 7V3M16 7V3M7 11H17M5 21H19C20.1046 21 21 20.1046 21 19V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V19C3 20.1046 3.89543 21 5 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span>
                          {t('studentDetails.courses.startDate')}: {new Date(course.startDate).toLocaleDateString('bg-BG')}
                        </span>
                      </div>
                    )}
                    {course.endDate && (
                      <div className="student-course-date">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span>
                          {t('studentDetails.courses.endDate')}: {new Date(course.endDate).toLocaleDateString('bg-BG')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};