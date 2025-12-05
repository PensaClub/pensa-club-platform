// src/components/AcademyCourses/AcademyCourseDetail/AcademyCourseDetail.jsx

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAcademyCourses } from '../../contexts/AcademyCoursesProvider';
import { AcademyTrailerModal } from '../AcademyTrailerModal/AcademyTrailerModal';
import './academyCourseDetail.css';

// Level colors
const LEVEL_CONFIG = {
  beginner: { color: '#10b981', label: 'beginner', icon: '🌱' },
  intermediate: { color: '#f59e0b', label: 'intermediate', icon: '🌿' },
  advanced: { color: '#ef4444', label: 'advanced', icon: '🌳' }
};

// Category colors
const CATEGORY_COLORS = {
  'Мобилни устройства': '#3b82f6',
  'Интернет сигурност': '#ef4444',
  'Дигитална грамотност': '#f59e0b',
  'Социални мрежи': '#8b5cf6',
  'Офис приложения': '#10b981',
  'Онлайн банкиране': '#06b6d4',
  'default': '#ff6347'
};

export const AcademyCourseDetail = () => {
  const { t } = useTranslation();
  const { slug } = useParams();
  const navigate = useNavigate();
  const { getCourseBySlug, currentCourse, isLoading } = useAcademyCourses();

  const [error, setError] = useState(null);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Prevent multiple fetches
  const fetchedSlugRef = useRef(null);

  // Fetch course by slug - само веднъж при промяна на slug
  useEffect(() => {
    if (!slug || fetchedSlugRef.current === slug) return;

    const loadCourse = async () => {
      setError(null);
      fetchedSlugRef.current = slug;
      try {
        await getCourseBySlug(slug);
      } catch (err) {
        setError(err.message || 'Failed to load course');
      }
    };

    loadCourse();
  }, [slug]); // Премахнахме getCourseBySlug от dependencies

  const course = currentCourse;

  // Loading state
  if (isLoading) {
    return (
      <div className="academyCourseDetail academyCourseDetail--loading">
        <div className="academyCourseDetail-loader">
          <div className="academyCourseDetail-loader-spinner"></div>
          <p>{t('academyCourseDetail.loading')}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !course) {
    return (
      <div className="academyCourseDetail academyCourseDetail--error">
        <div className="academyCourseDetail-error">
          <div className="academyCourseDetail-error-icon">😕</div>
          <h2>{t('academyCourseDetail.notFound')}</h2>
          <p>{t('academyCourseDetail.notFoundText')}</p>
          <button onClick={() => navigate('/academy/courses')}>
            {t('academyCourseDetail.backToCourses')}
          </button>
        </div>
      </div>
    );
  }

  // Extract course data
  const title = course.name || course.title || 'Untitled Course';
  const description = course.shortDescription || course.description || '';
  const fullDescription = course.fullDescription || course.description || description;
  const imageUrl = course.thumbnailUrl || course.imageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80';
  const trailerUrl = course.trailerUrl || null;
  const category = course.category || '';
  const categoryColor = CATEGORY_COLORS[category] || CATEGORY_COLORS.default;
  const level = LEVEL_CONFIG[course.difficultyLevel] || LEVEL_CONFIG.beginner;
  const duration = course.estimatedHours ? `${course.estimatedHours}` : '0';
  const weeks = course.durationWeeks || 0;
  const lessonsCount = course.totalLessons || 0;
  const enrolledCount = course.enrolledCount || 0;
  const completedCount = course.completedCount || 0;
  const rating = typeof course.rating === 'string' ? parseFloat(course.rating) : (course.rating || 0);
  const maxCredits = course.maxCredits || 0;
  const creditsForCompletion = course.creditsForCompletion || 0;
  const hasCertificate = course.hasCertificate || false;
  const tags = course.tags || [];
  const targetAudience = course.targetAudience || [];

  // Tabs
  const tabs = [
    { id: 'overview', label: t('academyCourseDetail.tabs.overview'), icon: '📋' },
    { id: 'content', label: t('academyCourseDetail.tabs.content'), icon: '📚' },
    { id: 'reviews', label: t('academyCourseDetail.tabs.reviews'), icon: '⭐' }
  ];

  return (
    <div className="academyCourseDetail" style={{ '--accent-color': categoryColor }}>
      {/* Hero Section */}
      <section className="academyCourseDetail-hero">
        <div className="academyCourseDetail-hero-bg">
          <img src={imageUrl} alt="" />
          <div className="academyCourseDetail-hero-overlay"></div>
        </div>

        <div className="academyCourseDetail-hero-container">
          {/* Breadcrumb */}
          <nav className="academyCourseDetail-breadcrumb">
            <Link to="/academy">{t('academyCourseDetail.breadcrumb.academy')}</Link>
            <span>/</span>
            <Link to="/academy/courses">{t('academyCourseDetail.breadcrumb.courses')}</Link>
            <span>/</span>
            <span className="academyCourseDetail-breadcrumb-current">{title}</span>
          </nav>

          <div className="academyCourseDetail-hero-content">
            {/* Left - Info */}
            <div className="academyCourseDetail-hero-info">
              {/* Category & Level */}
              <div className="academyCourseDetail-hero-badges">
                {category && (
                  <span className="academyCourseDetail-badge academyCourseDetail-badge--category">
                    {category}
                  </span>
                )}
                <span 
                  className="academyCourseDetail-badge academyCourseDetail-badge--level"
                  style={{ '--level-color': level.color }}
                >
                  {level.icon} {t(`academyCourseDetail.levels.${level.label}`)}
                </span>
              </div>

              {/* Title */}
              <h1 className="academyCourseDetail-hero-title">{title}</h1>

              {/* Description */}
              <p className="academyCourseDetail-hero-description">{description}</p>

              {/* Meta Stats */}
              <div className="academyCourseDetail-hero-meta">
                {rating > 0 && (
                  <div className="academyCourseDetail-hero-meta-item academyCourseDetail-hero-meta-item--rating">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
                    </svg>
                    <span>{rating.toFixed(1)}</span>
                    <span className="academyCourseDetail-hero-meta-label">({enrolledCount} {t('academyCourseDetail.ratings')})</span>
                  </div>
                )}
                <div className="academyCourseDetail-hero-meta-item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                  </svg>
                  <span>{enrolledCount.toLocaleString()}</span>
                  <span className="academyCourseDetail-hero-meta-label">{t('academyCourseDetail.enrolled')}</span>
                </div>
                <div className="academyCourseDetail-hero-meta-item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12,6 12,12 16,14" />
                  </svg>
                  <span>{duration}ч</span>
                  <span className="academyCourseDetail-hero-meta-label">{t('academyCourseDetail.duration')}</span>
                </div>
              </div>

              {/* Tags */}
              {tags.length > 0 && (
                <div className="academyCourseDetail-hero-tags">
                  {tags.slice(0, 5).map((tag, index) => (
                    <span key={index} className="academyCourseDetail-tag">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Right - Preview Card */}
            <div className="academyCourseDetail-hero-card">
              {/* Preview Image/Video */}
              <div className="academyCourseDetail-card-preview">
                <img src={imageUrl} alt={title} />
                <div className="academyCourseDetail-card-preview-overlay"></div>
                
                {trailerUrl && (
                  <button 
                    className="academyCourseDetail-card-play"
                    onClick={() => setIsTrailerOpen(true)}
                  >
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5,3 19,12 5,21" />
                    </svg>
                    <span>{t('academyCourseDetail.watchPreview')}</span>
                  </button>
                )}
              </div>

              {/* Card Content */}
              <div className="academyCourseDetail-card-content">
                {/* Price */}
                <div className="academyCourseDetail-card-price">
                  <span className="academyCourseDetail-card-price-free">
                    {t('academyCourseDetail.free')}
                  </span>
                  {maxCredits > 0 && (
                    <span className="academyCourseDetail-card-price-credits">
                      +{maxCredits} 🪙 {t('academyCourseDetail.credits')}
                    </span>
                  )}
                </div>

                {/* CTA Button */}
                <button className="academyCourseDetail-card-cta">
                  {t('academyCourseDetail.enrollNow')}
                </button>

                {/* Features */}
                <ul className="academyCourseDetail-card-features">
                  <li>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    </svg>
                    <span>{lessonsCount} {t('academyCourseDetail.lessons')}</span>
                  </li>
                  <li>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12,6 12,12 16,14" />
                    </svg>
                    <span>{duration} {t('academyCourseDetail.hours')}</span>
                  </li>
                  {weeks > 0 && (
                    <li>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      <span>{weeks} {t('academyCourseDetail.weeks')}</span>
                    </li>
                  )}
                  {hasCertificate && (
                    <li>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="8" r="6" />
                        <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
                      </svg>
                      <span>{t('academyCourseDetail.certificate')}</span>
                    </li>
                  )}
                  {creditsForCompletion > 0 && (
                    <li>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 6v6l4 2" />
                      </svg>
                      <span>+{creditsForCompletion} {t('academyCourseDetail.creditsOnComplete')}</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="academyCourseDetail-main">
        <div className="academyCourseDetail-main-container">
          {/* Tabs */}
          <div className="academyCourseDetail-tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`academyCourseDetail-tab ${activeTab === tab.id ? 'is-active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="academyCourseDetail-tab-icon">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="academyCourseDetail-tabContent">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="academyCourseDetail-overview">
                {/* About */}
                <div className="academyCourseDetail-section">
                  <h2 className="academyCourseDetail-section-title">
                    {t('academyCourseDetail.aboutCourse')}
                  </h2>
                  <div className="academyCourseDetail-section-content">
                    <p>{fullDescription || description}</p>
                  </div>
                </div>

                {/* Target Audience */}
                {targetAudience.length > 0 && (
                  <div className="academyCourseDetail-section">
                    <h2 className="academyCourseDetail-section-title">
                      {t('academyCourseDetail.targetAudience')}
                    </h2>
                    <div className="academyCourseDetail-audience">
                      {targetAudience.map((audience, index) => (
                        <span key={index} className="academyCourseDetail-audience-item">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20,6 9,17 4,12" />
                          </svg>
                          {audience}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* What You'll Learn */}
                <div className="academyCourseDetail-section">
                  <h2 className="academyCourseDetail-section-title">
                    {t('academyCourseDetail.whatYouLearn')}
                  </h2>
                  <div className="academyCourseDetail-learn-grid">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="academyCourseDetail-learn-item">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20,6 9,17 4,12" />
                        </svg>
                        <span>{t(`academyCourseDetail.learnItems.item${i}`, { defaultValue: `Learning outcome ${i}` })}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="academyCourseDetail-stats-grid">
                  <div className="academyCourseDetail-stat-card">
                    <div className="academyCourseDetail-stat-icon">👥</div>
                    <div className="academyCourseDetail-stat-value">{enrolledCount.toLocaleString()}</div>
                    <div className="academyCourseDetail-stat-label">{t('academyCourseDetail.totalEnrolled')}</div>
                  </div>
                  <div className="academyCourseDetail-stat-card">
                    <div className="academyCourseDetail-stat-icon">✅</div>
                    <div className="academyCourseDetail-stat-value">{completedCount.toLocaleString()}</div>
                    <div className="academyCourseDetail-stat-label">{t('academyCourseDetail.completed')}</div>
                  </div>
                  <div className="academyCourseDetail-stat-card">
                    <div className="academyCourseDetail-stat-icon">⭐</div>
                    <div className="academyCourseDetail-stat-value">{rating.toFixed(1)}</div>
                    <div className="academyCourseDetail-stat-label">{t('academyCourseDetail.rating')}</div>
                  </div>
                  <div className="academyCourseDetail-stat-card">
                    <div className="academyCourseDetail-stat-icon">🪙</div>
                    <div className="academyCourseDetail-stat-value">{maxCredits}</div>
                    <div className="academyCourseDetail-stat-label">{t('academyCourseDetail.maxCredits')}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Content Tab */}
            {activeTab === 'content' && (
              <div className="academyCourseDetail-content">
                <div className="academyCourseDetail-section">
                  <h2 className="academyCourseDetail-section-title">
                    {t('academyCourseDetail.courseContent')}
                  </h2>
                  <p className="academyCourseDetail-content-summary">
                    {lessonsCount} {t('academyCourseDetail.lessonsTotal')} • {duration} {t('academyCourseDetail.hoursTotal')}
                  </p>

                  {/* Placeholder lessons */}
                  <div className="academyCourseDetail-lessons">
                    {Array.from({ length: Math.min(lessonsCount, 8) }, (_, i) => (
                      <div key={i} className="academyCourseDetail-lesson">
                        <div className="academyCourseDetail-lesson-number">{i + 1}</div>
                        <div className="academyCourseDetail-lesson-info">
                          <h4 className="academyCourseDetail-lesson-title">
                            {t('academyCourseDetail.lessonPlaceholder', { number: i + 1 })}
                          </h4>
                          <span className="academyCourseDetail-lesson-duration">
                            ~{Math.floor(Math.random() * 20 + 10)} {t('academyCourseDetail.minutes')}
                          </span>
                        </div>
                        <div className="academyCourseDetail-lesson-icon">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <polygon points="10,8 16,12 10,16" fill="currentColor" stroke="none" />
                          </svg>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div className="academyCourseDetail-reviews">
                <div className="academyCourseDetail-section">
                  <h2 className="academyCourseDetail-section-title">
                    {t('academyCourseDetail.studentReviews')}
                  </h2>

                  {/* Rating Overview */}
                  <div className="academyCourseDetail-reviews-overview">
                    <div className="academyCourseDetail-reviews-score">
                      <span className="academyCourseDetail-reviews-score-value">{rating.toFixed(1)}</span>
                      <div className="academyCourseDetail-reviews-stars">
                        {[1, 2, 3, 4, 5].map(star => (
                          <svg 
                            key={star} 
                            width="20" 
                            height="20" 
                            viewBox="0 0 24 24" 
                            fill={star <= Math.round(rating) ? 'currentColor' : 'none'}
                            stroke="currentColor" 
                            strokeWidth="2"
                          >
                            <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
                          </svg>
                        ))}
                      </div>
                      <span className="academyCourseDetail-reviews-count">
                        {enrolledCount} {t('academyCourseDetail.reviews')}
                      </span>
                    </div>
                  </div>

                  {/* Placeholder reviews */}
                  <div className="academyCourseDetail-reviews-list">
                    <div className="academyCourseDetail-review-placeholder">
                      <p>{t('academyCourseDetail.noReviewsYet')}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Trailer Modal */}
      <AcademyTrailerModal
        isOpen={isTrailerOpen}
        onClose={() => setIsTrailerOpen(false)}
        videoUrl={trailerUrl}
        courseTitle={title}
        accentColor={categoryColor}
      />
    </div>
  );
};