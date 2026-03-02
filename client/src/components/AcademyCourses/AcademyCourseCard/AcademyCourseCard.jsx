// src/components/AcademyCourses/AcademyCourseCard/AcademyCourseCard.jsx

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { AcademyTrailerModal } from '../AcademyTrailerModal/AcademyTrailerModal';
import './academyCourseCard.css';

// Level badge colors
const LEVEL_COLORS = {
  beginner: { bg: '#10b981', label: 'beginner' },
  intermediate: { bg: '#f59e0b', label: 'intermediate' },
  advanced: { bg: '#ef4444', label: 'advanced' }
};

export const AcademyCourseCard = ({ course, accentColor = '#ff6347', index = 0 }) => {
  const { t } = useTranslation('academy');
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  // Guard clause
  if (!course) {
    return null;
  }

  // Map API fields to component fields
  const level = LEVEL_COLORS[course.difficultyLevel] || LEVEL_COLORS[course.level] || LEVEL_COLORS.beginner;
  const courseSlug = course.slug || course.id || index;
  // Image - API uses thumbnailUrl
  const imageUrl = course.thumbnailUrl || course.imageUrl || course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&q=80';
  
  // Title - API uses name
  const title = course.name || course.title || 'Untitled Course';
  
  // Description - API uses shortDescription
  const description = course.shortDescription || course.description || '';
  
  // Duration - API uses estimatedHours
  const duration = course.estimatedHours 
    ? `${course.estimatedHours}ч` 
    : course.duration || course.totalDuration || '2ч';
  
  // Lessons count - API uses totalLessons
  const lessonsCount = course.totalLessons || course.lessonsCount || course.lectures?.length || 0;
  
  // Enrolled count
  const enrolledCount = course.enrolledCount || 0;
  
  // Rating - API returns string, need to parse
  const rating = typeof course.rating === 'string' 
    ? parseFloat(course.rating) 
    : (typeof course.rating === 'number' ? course.rating : 4.5);
  
  // Credits - API uses maxCredits or creditsForCompletion
  const credits = course.maxCredits || course.creditsForCompletion || 0;
  
  // Trailer URL
  const trailerUrl = course.trailerUrl || null;
  
  // Course ID
  const courseId = course.id || course.slug || index;

  // Get category name safely
  const getCategoryName = () => {
    if (!course.category) return null;
    if (typeof course.category === 'string') return course.category;
    if (course.category.name) return course.category.name;
    return null;
  };

  const categoryName = getCategoryName();

  // Handle play button click
  const handlePlayClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (trailerUrl) {
      setIsTrailerOpen(true);
    }
  };

  return (
    <>
      <Link 
        to={`/academy/courses/${courseSlug}`}
        className="academyCourseCard"
        style={{ 
          '--accent-color': accentColor,
          '--animation-delay': `${index * 0.1}s`
        }}
      >
        {/* Image */}
        <div className="academyCourseCard-image">
          <img 
            src={imageUrl} 
            alt={title}
            loading="lazy"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&q=80';
            }}
          />
          <div className="academyCourseCard-image-overlay"></div>
          
          {/* Level Badge */}
          <span 
            className="academyCourseCard-level"
            style={{ '--level-color': level.bg }}
          >
            {t(`academyCourseCard.levels.${level.label}`)}
          </span>

          {/* Duration */}
          <span className="academyCourseCard-duration">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12,6 12,12 16,14" />
            </svg>
            {duration}
          </span>

          {/* Credits Badge */}
          {credits > 0 && (
            <span className="academyCourseCard-credits">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              +{credits} {t('academyCourseCard.credits')}
            </span>
          )}

          {/* Play Button - only if trailer exists */}
          {trailerUrl && (
            <button 
              className="academyCourseCard-play"
              onClick={handlePlayClick}
              aria-label={t('academyCourseCard.watchTrailer')}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5,3 19,12 5,21" />
              </svg>
            </button>
          )}
        </div>

        {/* Content */}
        <div className="academyCourseCard-content">
          {/* Category */}
          {categoryName && (
            <span className="academyCourseCard-category">
              {categoryName}
            </span>
          )}

          {/* Title */}
          <h4 className="academyCourseCard-title">{title}</h4>

          {/* Description */}
          {description && (
            <p className="academyCourseCard-description">
              {description.length > 80 
                ? `${description.substring(0, 80)}...` 
                : description
              }
            </p>
          )}

          {/* Stats */}
          <div className="academyCourseCard-stats">
            {/* Rating */}
            <div className="academyCourseCard-stat academyCourseCard-stat--rating">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
              </svg>
              <span>{rating.toFixed(1)}</span>
            </div>

            {/* Lessons */}
            {lessonsCount > 0 && (
              <div className="academyCourseCard-stat">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
                <span>{lessonsCount} {t('academyCourseCard.lessons')}</span>
              </div>
            )}

            {/* Enrolled */}
            {enrolledCount > 0 && (
              <div className="academyCourseCard-stat">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <span>{enrolledCount.toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="academyCourseCard-footer">
            <div className="academyCourseCard-price">
              <span className="academyCourseCard-price-free">{t('academyCourseCard.free')}</span>
              {credits > 0 && (
                <span className="academyCourseCard-price-credits">
                  +{credits} 🪙
                </span>
              )}
            </div>
            <div className="academyCourseCard-cta">
              <span>{t('academyCourseCard.startLearning')}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </div>
          </div>
        </div>

        {/* Hover Glow */}
        <div className="academyCourseCard-glow"></div>
      </Link>

      {/* Trailer Modal */}
      <AcademyTrailerModal
        isOpen={isTrailerOpen}
        onClose={() => setIsTrailerOpen(false)}
        videoUrl={trailerUrl}
        courseTitle={title}
        accentColor={accentColor}
      />
    </>
  );
};