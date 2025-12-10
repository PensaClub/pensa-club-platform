// src/components/AcademyCourses/AcademyCoursesList/AcademyCoursesList.jsx

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './academyCoursesList.css';
import { AcademyCourseCard } from '../AcademyCourseCard/AcademyCourseCard';

export const AcademyCoursesList = ({ 
  program = null, 
  courses = [], 
  onClose = null,
  showViewAll = false 
}) => {
  const { t } = useTranslation();
  const [filter, setFilter] = useState('all');

  // Helper to get course level (API uses difficultyLevel)
  const getCourseLevel = (course) => {
    return course.difficultyLevel || course.level || 'beginner';
  };

  // Filter options with counts
  const filters = [
    { value: 'all', label: t('academyCoursesList.filters.all') },
    { value: 'beginner', label: t('academyCoursesList.filters.beginner') },
    { value: 'intermediate', label: t('academyCoursesList.filters.intermediate') },
    { value: 'advanced', label: t('academyCoursesList.filters.advanced') }
  ];

  // Filtered courses - use difficultyLevel
  const filteredCourses = filter === 'all' 
    ? courses 
    : courses.filter(course => getCourseLevel(course) === filter);

  // Get count for each filter
  const getFilterCount = (filterValue) => {
    if (filterValue === 'all') return courses.length;
    return courses.filter(course => getCourseLevel(course) === filterValue).length;
  };

  return (
    <div 
      className="academyCoursesList"
      style={program ? { '--accent-color': program.primary } : {}}
    >
      {/* Header (only if program is selected) */}
      {program && (
        <div className="academyCoursesList-header">
          <div className="academyCoursesList-header-info">
            <div 
              className="academyCoursesList-header-icon"
              style={{ background: program.gradient }}
            >
              {program.icon}
            </div>
            <div className="academyCoursesList-header-text">
              <h3 className="academyCoursesList-header-title">{program.name}</h3>
              <p className="academyCoursesList-header-count">
                {courses.length} {courses.length === 1 
                  ? t('academyCoursesList.course') 
                  : t('academyCoursesList.courses')
                }
              </p>
            </div>
          </div>

          <button 
            className="academyCoursesList-header-close"
            onClick={onClose}
            aria-label={t('academyCoursesList.close')}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="academyCoursesList-filters">
        <div className="academyCoursesList-filters-pills">
          {filters.map(f => {
            const count = getFilterCount(f.value);
            // Hide filter if no courses match (except 'all')
            if (f.value !== 'all' && count === 0) return null;
            
            return (
              <button
                key={f.value}
                className={`academyCoursesList-filter ${filter === f.value ? 'is-active' : ''}`}
                onClick={() => setFilter(f.value)}
              >
                {f.label}
                {f.value !== 'all' && (
                  <span className="academyCoursesList-filter-count">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search (optional) */}
        <div className="academyCoursesList-search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input 
            type="text" 
            placeholder={t('academyCoursesList.searchPlaceholder')}
            className="academyCoursesList-search-input"
          />
        </div>
      </div>

      {/* Courses Grid */}
      {filteredCourses.length > 0 ? (
        <div className="academyCoursesList-grid">
          {filteredCourses.map((course, index) => (
            <AcademyCourseCard 
              key={course.id || index}
              course={course}
              accentColor={program?.primary || '#ff6347'}
              index={index}
            />
          ))}
        </div>
      ) : (
        <div className="academyCoursesList-empty">
          <div className="academyCoursesList-empty-icon">🔍</div>
          <p className="academyCoursesList-empty-text">
            {t('academyCoursesList.noResults')}
          </p>
          <button 
            className="academyCoursesList-empty-reset"
            onClick={() => setFilter('all')}
          >
            {t('academyCoursesList.resetFilter')}
          </button>
        </div>
      )}

      {/* View All Button */}
      {showViewAll && (
        <div className="academyCoursesList-viewAll">
          <button className="academyCoursesList-viewAll-btn">
            {t('academyCoursesList.viewAllCourses')}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};