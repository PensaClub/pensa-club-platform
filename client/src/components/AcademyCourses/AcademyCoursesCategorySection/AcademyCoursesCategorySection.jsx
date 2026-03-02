// src/components/AcademyCourses/AcademyCoursesCategorySection/AcademyCoursesCategorySection.jsx

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
// import { AcademyCoursesCard } from '../AcademyCoursesCard/AcademyCoursesCard';
import './academyCoursesCategorySection.css';

// Предефинирани цветове за разнообразие
const CATEGORY_COLORS = [
  '#ff6347', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', 
  '#ec4899', '#06b6d4', '#14b8a6', '#f97316', '#6366f1',
  '#84cc16', '#ef4444', '#0ea5e9', '#d946ef', '#22c55e'
];

// Предефинирани икони
const CATEGORY_ICONS = [
  '📚', '💻', '📱', '🌐', '🔒', '💬', '📄', '💳', 
  '🎓', '📊', '🎯', '💡', '🚀', '⚡', '🎨'
];

// Специфични mapping-и за известни категории
const KNOWN_CATEGORIES = {
  'мобилни': { icon: '📱', color: '#3b82f6' },
  'mobile': { icon: '📱', color: '#3b82f6' },
  'телефон': { icon: '📱', color: '#3b82f6' },
  'сигурност': { icon: '🔒', color: '#ef4444' },
  'security': { icon: '🔒', color: '#ef4444' },
  'защита': { icon: '🛡️', color: '#ef4444' },
  'интернет': { icon: '🌐', color: '#10b981' },
  'internet': { icon: '🌐', color: '#10b981' },
  'web': { icon: '🌐', color: '#10b981' },
  'грамотност': { icon: '📚', color: '#f59e0b' },
  'literacy': { icon: '📚', color: '#f59e0b' },
  'основи': { icon: '📖', color: '#f59e0b' },
  'социал': { icon: '💬', color: '#8b5cf6' },
  'social': { icon: '💬', color: '#8b5cf6' },
  'офис': { icon: '📄', color: '#06b6d4' },
  'office': { icon: '📄', color: '#06b6d4' },
  'документ': { icon: '📄', color: '#06b6d4' },
  'банк': { icon: '💳', color: '#14b8a6' },
  'bank': { icon: '💳', color: '#14b8a6' },
  'финанс': { icon: '💰', color: '#14b8a6' },
  'здрав': { icon: '🏥', color: '#ec4899' },
  'health': { icon: '🏥', color: '#ec4899' },
  'снимк': { icon: '📸', color: '#f97316' },
  'photo': { icon: '📸', color: '#f97316' },
  'видео': { icon: '🎬', color: '#f97316' },
  'video': { icon: '🎬', color: '#f97316' },
  'комуникац': { icon: '📞', color: '#6366f1' },
  'communicat': { icon: '📞', color: '#6366f1' },
  'email': { icon: '📧', color: '#0ea5e9' },
  'имейл': { icon: '📧', color: '#0ea5e9' },
  'поща': { icon: '📧', color: '#0ea5e9' }
};

export const AcademyCoursesCategorySection = ({ category, courses = [] }) => {
  const { t } = useTranslation('academy');
  const [isExpanded, setIsExpanded] = useState(false);

  const INITIAL_SHOW = 4;
  const hasMore = courses.length > INITIAL_SHOW;
  const visibleCourses = isExpanded ? courses : courses.slice(0, INITIAL_SHOW);

  // Категория данни
  const categoryName = typeof category === 'string' 
    ? category 
    : category?.name || t('academyCoursesCategorySection.uncategorized');

  // Вземи икона и цвят - първо провери known categories, после fallback
  const { icon: categoryIcon, color: categoryColor } = getCategoryStyle(categoryName);

  if (courses.length === 0) return null;

  return (
    <section className="academyCoursesCategorySection">
      {/* Decorative Background */}
      <div 
        className="academyCoursesCategorySection-bg"
        style={{ '--category-color': categoryColor }}
      />

      {/* Header */}
      <div className="academyCoursesCategorySection-header">
        <div className="academyCoursesCategorySection-title-wrapper">
          <div 
            className="academyCoursesCategorySection-icon"
            style={{ '--icon-color': categoryColor }}
          >
            <span className="academyCoursesCategorySection-icon-emoji">{categoryIcon}</span>
            <div className="academyCoursesCategorySection-icon-ring" />
          </div>
          <div className="academyCoursesCategorySection-title-content">
            <h2 className="academyCoursesCategorySection-title">{categoryName}</h2>
            <div className="academyCoursesCategorySection-meta">
              <span 
                className="academyCoursesCategorySection-count"
                style={{ '--count-color': categoryColor }}
              >
                {courses.length} {courses.length === 1 
                  ? t('academyCoursesCategorySection.course') 
                  : t('academyCoursesCategorySection.courses')
                }
              </span>
              <span className="academyCoursesCategorySection-divider">•</span>
              <span className="academyCoursesCategorySection-level">
                {t('academyCoursesCategorySection.allLevels')}
              </span>
            </div>
          </div>
        </div>

        {hasMore && (
          <button 
            className="academyCoursesCategorySection-toggle"
            onClick={() => setIsExpanded(!isExpanded)}
            style={{ '--toggle-color': categoryColor }}
          >
            <span>
              {isExpanded 
                ? t('academyCoursesCategorySection.showLess')
                : t('academyCoursesCategorySection.showAll', { count: courses.length })
              }
            </span>
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5"
              className={`academyCoursesCategorySection-toggle-icon ${isExpanded ? 'rotated' : ''}`}
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        )}
      </div>

      {/* Courses Grid */}
      <div className="academyCoursesCategorySection-grid">
        {/* {visibleCourses.map((course, index) => (
          <AcademyCoursesCard 
            key={course.id || index}
            course={course}
            categoryColor={categoryColor}
            index={index}
          />
        ))} */}
      </div>

      {/* Show More Button (mobile) */}
      {hasMore && !isExpanded && (
        <div className="academyCoursesCategorySection-footer">
          <button 
            className="academyCoursesCategorySection-showMore"
            onClick={() => setIsExpanded(true)}
            style={{ '--btn-color': categoryColor }}
          >
            <span>{t('academyCoursesCategorySection.loadMore', { remaining: courses.length - INITIAL_SHOW })}</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </div>
      )}
    </section>
  );
};

// Helper: Get style based on category name
function getCategoryStyle(name) {
  const lowerName = (name || '').toLowerCase();
  
  // Първо провери известните категории
  for (const [key, value] of Object.entries(KNOWN_CATEGORIES)) {
    if (lowerName.includes(key)) {
      return value;
    }
  }
  
  // Fallback: генерирай консистентен цвят и икона базирани на името
  const hash = hashString(lowerName);
  const colorIndex = Math.abs(hash) % CATEGORY_COLORS.length;
  const iconIndex = Math.abs(hash) % CATEGORY_ICONS.length;
  
  return {
    icon: CATEGORY_ICONS[iconIndex],
    color: CATEGORY_COLORS[colorIndex]
  };
}

// Simple string hash function за консистентност
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash;
}