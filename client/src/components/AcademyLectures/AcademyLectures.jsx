// src/components/AcademyLectures/AcademyLectures.jsx

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocalizedNavigate } from '../../hooks/useLocalizedNavigate';

import { AcademyLectureTrailerModal } from './AcademyLectureTrailerModal/AcademyLectureTrailerModal';
import AcademyLecturesSkeleton from './AcademyLecturesSkeleton/AcademyLecturesSkeleton';
import './academyLectures.css';
import { useAcademyCourses } from '../contexts/AcademyCoursesProvider';
import { useAuthContext } from '../contexts/UserContext';
import SEOHead from '../SEO/SEOHead';
import ScrollToTop from '../ScrollToTop/ScrollToTop';
import { TextZoom } from '../TextZoom/TextZoom';
import { useLocation } from 'react-router-dom';

// Цветова схема за категории
const LECTURE_CATEGORY_COLORS = {
  'Интернет сигурност': { primary: '#ef4444', icon: '🔒' },
  'Мобилни устройства': { primary: '#3b82f6', icon: '📱' },
  'Дигитална грамотност': { primary: '#f59e0b', icon: '📚' },
  'Социални мрежи': { primary: '#8b5cf6', icon: '💬' },
  'Онлайн услуги': { primary: '#10b981', icon: '🌐' },
  'Здраве и технологии': { primary: '#ec4899', icon: '🏥' },
  'default': { primary: '#ff6347', icon: '🎓' }
};

// Филтър табове
const FILTER_TABS = [
  { id: 'all', icon: '📋' },
  { id: 'live', icon: '🔴' },
  { id: 'upcoming', icon: '📅' },
  { id: 'recordings', icon: '📹' }
];

// Items per page
const ITEMS_PER_PAGE = 8;

// Helper функция ИЗВЪН компонента - без dependencies
const getLectureStatus = (lecture) => {
  if (!lecture) return 'unknown';
  if (lecture.status === 'cancelled') return 'cancelled';

  const now = new Date();
  const startTime = lecture.scheduledDate ? new Date(lecture.scheduledDate) : null;
  const endTime = lecture.scheduledEndDate ? new Date(lecture.scheduledEndDate) : null;

  if (startTime && endTime && now >= startTime && now <= endTime) {
    return 'live';
  }

  if (startTime && !endTime) {
    const duration = lecture.durationMinutes || 60;
    const estimatedEnd = new Date(startTime.getTime() + duration * 60 * 1000);
    if (now >= startTime && now <= estimatedEnd) return 'live';
  }

  if (startTime && now < startTime) return 'upcoming';

  return 'recording';
};

export const AcademyLectures = () => {
  const { t } = useTranslation('academy');
  const navigate = useLocalizedNavigate();
  const { isAuthentication } = useAuthContext();
  const {
    lectures = [],
    isLoading,
    getLectures,
    getLectureCategories
  } = useAcademyCourses();

  // State
  const [categories, setCategories] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [dataLoaded, setDataLoaded] = useState(false);

  // Pagination state
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  // Trailer modal state
  const [trailerLecture, setTrailerLecture] = useState(null);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
   const location = useLocation();

    useEffect(() => {
      window.scrollTo(0, 0);
    }, [location.pathname]);

  // Initial data load
  useEffect(() => {
    if (dataLoaded) return;
    setDataLoaded(true);

    getLectureCategories().then(data => {
      if (Array.isArray(data)) {
        const normalized = data.map((name, index) => ({
          id: index,
          slug: name,
          name,
          ...(LECTURE_CATEGORY_COLORS[name] || LECTURE_CATEGORY_COLORS.default)
        }));
        setCategories(normalized);
      }
    });

    getLectures({});
  }, [dataLoaded, getLectureCategories, getLectures]);

  // Reset pagination when filters change
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [activeFilter, selectedCategory, searchQuery, sortBy]);

  // Get upcoming LIVE lectures for schedule
  const upcomingLiveLectures = useMemo(() => {
    return lectures
      .filter(lecture => {
        const status = getLectureStatus(lecture);
        return (status === 'upcoming' || status === 'live') && lecture.lectureType === 'live';
      })
      .sort((a, b) => new Date(a.scheduledDate || 0) - new Date(b.scheduledDate || 0))
      .slice(0, 5);
  }, [lectures]);

  // Filtered & sorted lectures
  const filteredLectures = useMemo(() => {
    let result = [...lectures];

    if (activeFilter !== 'all') {
      result = result.filter(lecture => {
        const status = getLectureStatus(lecture);
        if (activeFilter === 'live') return status === 'live';
        if (activeFilter === 'upcoming') return status === 'upcoming';
        if (activeFilter === 'recordings') return status === 'recording';
        return true;
      });
    }

    if (selectedCategory) {
      result = result.filter(lecture => lecture.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(lecture => {
        const title = (lecture.title || '').toLowerCase();
        const description = (lecture.shortDescription || '').toLowerCase();
        const speaker = (lecture.lecturer?.name || '').toLowerCase();
        const tags = (lecture.tags || []).join(' ').toLowerCase();
        return title.includes(query) || description.includes(query) || speaker.includes(query) || tags.includes(query);
      });
    }

    if (sortBy === 'date') {
      result.sort((a, b) => {
        const statusA = getLectureStatus(a);
        const statusB = getLectureStatus(b);
        const statusOrder = { live: 0, upcoming: 1, recording: 2 };
        if (statusOrder[statusA] !== statusOrder[statusB]) {
          return statusOrder[statusA] - statusOrder[statusB];
        }
        return new Date(b.scheduledDate || 0) - new Date(a.scheduledDate || 0);
      });
    } else if (sortBy === 'popular') {
      result.sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0));
    } else if (sortBy === 'alphabetical') {
      result.sort((a, b) => (a.title || '').localeCompare(b.title || '', 'bg'));
    }

    return result;
  }, [lectures, activeFilter, selectedCategory, searchQuery, sortBy]);

  // Visible lectures (paginated)
  const visibleLectures = useMemo(() => {
    return filteredLectures.slice(0, visibleCount);
  }, [filteredLectures, visibleCount]);

  // Pagination info
  const hasMore = visibleCount < filteredLectures.length;
  const remainingCount = filteredLectures.length - visibleCount;

  // Stats
  const stats = useMemo(() => {
    const live = lectures.filter(l => getLectureStatus(l) === 'live').length;
    const upcoming = lectures.filter(l => getLectureStatus(l) === 'upcoming').length;
    const recordings = lectures.filter(l => getLectureStatus(l) === 'recording').length;
    const totalCredits = lectures.reduce((sum, l) => sum + (l.creditsForAttendance || 0), 0);

    return { total: lectures.length, live, upcoming, recordings, totalCredits };
  }, [lectures]);

  // SEO meta data
  const metaData = useMemo(() => {
    const siteName = 'DigiBridge Academy';
    let title, description;

    if (searchQuery) {
      title = t('academyLecturesSeo.searchTitle', { term: searchQuery, defaultValue: `Търсене: ${searchQuery} | Лекции | ${siteName}` });
      description = t('academyLecturesSeo.searchDescription', { term: searchQuery, count: filteredLectures.length, defaultValue: `Намерени ${filteredLectures.length} лекции за "${searchQuery}" в ${siteName}.` });
    } else if (selectedCategory) {
      title = t('academyLecturesSeo.categoryTitle', { category: selectedCategory, defaultValue: `Лекции по ${selectedCategory} | ${siteName}` });
      description = t('academyLecturesSeo.categoryDescription', { category: selectedCategory, defaultValue: `Безплатни онлайн лекции по ${selectedCategory} за дигитална грамотност. ${siteName} — обучение за възрастни хора 60+.` });
    } else {
      title = t('academyLecturesSeo.listTitle', { defaultValue: `Лекции за дигитална грамотност | ${siteName}` });
      description = t('academyLecturesSeo.listDescription', { defaultValue: 'Безплатни онлайн лекции за дигитална грамотност, интернет сигурност и технологии. DigiBridge Academy — обучение за възрастни хора 60+ с квалифицирани лектори.' });
    }

    return {
      title,
      description,
      keywords: 'лекции, дигитална грамотност, DigiBridge Academy, Pensa Club, безплатни лекции, обучение, пенсионери, 60+, интернет сигурност'
    };
  }, [searchQuery, selectedCategory, filteredLectures.length, t]);

  const structuredData = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": metaData.title,
    "description": metaData.description,
    "url": window.location.href,
    "isPartOf": {
      "@type": "WebSite",
      "name": "Pensa Club",
      "url": "https://pensa.club"
    },
    "provider": {
      "@type": "EducationalOrganization",
      "name": "DigiBridge Academy",
      "url": "https://pensa.club/academy",
      "sameAs": ["https://www.facebook.com/profile.php?id=61578204366479"]
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": window.location.href
    }
  }), [metaData]);

  // Format date for schedule
  const formatScheduleDate = useCallback((dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const isToday = date.toDateString() === now.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();

    const time = date.toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' });

    if (isToday) return { day: t('academyLectures.schedule.today'), time };
    if (isTomorrow) return { day: t('academyLectures.schedule.tomorrow'), time };

    return { day: date.toLocaleDateString('bg-BG', { day: 'numeric', month: 'short' }), time };
  }, [t]);

  // Get category color
  const getCategoryColor = useCallback((lecture) => {
    return LECTURE_CATEGORY_COLORS[lecture.category] || LECTURE_CATEGORY_COLORS.default;
  }, []);

  // Handlers
  const handleLectureClick = useCallback((lecture) => {
    navigate(`/academy/lectures/${lecture.slug}`);
  }, [navigate]);

  const handleClearFilters = useCallback(() => {
    setActiveFilter('all');
    setSelectedCategory(null);
    setSearchQuery('');
    setSortBy('date');
  }, []);

  const handleLoadMore = useCallback(() => {
    setVisibleCount(prev => prev + ITEMS_PER_PAGE);
  }, []);

  // Trailer handlers
  const handlePlayClick = useCallback((e, lecture) => {
    e.stopPropagation();
    if (lecture.videoUrl) {
      setTrailerLecture(lecture);
      setIsTrailerOpen(true);
    }
  }, []);

  const handleTrailerClose = useCallback(() => {
    setIsTrailerOpen(false);
    setTrailerLecture(null);
  }, []);

  const handleViewLecture = useCallback((lecture) => {
    navigate(`/academy/lectures/${lecture.slug}`);
  }, [navigate]);

  if (!isAuthentication) return null;

  const hasActiveFilters = activeFilter !== 'all' || selectedCategory || searchQuery.trim();

  return (
    <div className="al">
      <TextZoom />
      <SEOHead
        title={metaData.title}
        description={metaData.description}
        keywords={metaData.keywords}
        image="/images/digibridge/hero-image.jpg"
        type="website"
        structuredData={structuredData}
      />
      {/* ========== HERO SECTION ========== */}
      <section className="al-hero">
        <div className="al-hero-bg">
          <img
            src="/images/academy/lectures-1.jpg"
            alt=""
            className="al-hero-bg-img"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <div className="al-hero-overlay"></div>
          <div className="al-hero-noise"></div>
          <div className="al-hero-grid"></div>
        </div>

        <div className="al-hero-content">
          <div className="al-hero-badge">
            <span className="al-hero-badge-icon">🎬</span>
            <span className="al-hero-badge-text">{t('academyLectures.hero.badge')}</span>
            {stats.live > 0 && (
              <span className="al-hero-badge-live">
                <span className="al-hero-badge-live-dot"></span>
                {stats.live} LIVE
              </span>
            )}
          </div>

          <h1 className="al-hero-title">
            {t('academyLectures.hero.title')}
            <span className="al-hero-title-glow">{t('academyLectures.hero.titleAccent')}</span>
          </h1>

          <p className="al-hero-subtitle">{t('academyLectures.hero.subtitle')}</p>

          <div className="al-hero-stats">
            <div className="al-hero-stat">
              <div className="al-hero-stat-icon">📺</div>
              <div className="al-hero-stat-value">{stats.total}</div>
              <div className="al-hero-stat-label">{t('academyLectures.hero.stats.total')}</div>
            </div>
            <div className="al-hero-stat">
              <div className="al-hero-stat-icon">📅</div>
              <div className="al-hero-stat-value">{stats.upcoming}</div>
              <div className="al-hero-stat-label">{t('academyLectures.hero.stats.upcoming')}</div>
            </div>
            <div className="al-hero-stat">
              <div className="al-hero-stat-icon">📹</div>
              <div className="al-hero-stat-value">{stats.recordings}</div>
              <div className="al-hero-stat-label">{t('academyLectures.hero.stats.recordings')}</div>
            </div>
            <div className="al-hero-stat al-hero-stat--accent">
              <div className="al-hero-stat-icon">🪙</div>
              <div className="al-hero-stat-value">{stats.totalCredits}</div>
              <div className="al-hero-stat-label">{t('academyLectures.hero.stats.credits')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== LIVE SCHEDULE ========== */}
      {upcomingLiveLectures.length > 0 && (
        <section className="al-schedule">
          <div className="al-schedule-container">
            <div className="al-schedule-header">
              <h2 className="al-schedule-title">
                <span className="al-schedule-title-icon">📡</span>
                {t('academyLectures.schedule.title')}
              </h2>
              <span className="al-schedule-count">
                {upcomingLiveLectures.length} {t('academyLectures.schedule.upcoming')}
              </span>
            </div>

            <div className="al-schedule-timeline">
              {upcomingLiveLectures.map((lecture, index) => {
                const status = getLectureStatus(lecture);
                const isLive = status === 'live';
                const { day, time } = formatScheduleDate(lecture.scheduledDate);
                const catColor = getCategoryColor(lecture);

                return (
                  <div
                    key={lecture.id || index}
                    className={`al-schedule-item ${isLive ? 'is-live' : ''}`}
                    style={{ '--item-color': catColor.primary }}
                    onClick={() => handleLectureClick(lecture)}
                  >
                    {isLive && (
                      <div className="al-schedule-item-live">
                        <span className="al-schedule-item-live-dot"></span>
                        LIVE
                      </div>
                    )}
                    <div className="al-schedule-item-time">
                      <span className="al-schedule-item-day">{day}</span>
                      <span className="al-schedule-item-hour">{time}</span>
                    </div>
                    <div className="al-schedule-item-content">
                      <h4 className="al-schedule-item-title">{lecture.title}</h4>
                      <div className="al-schedule-item-meta">
                        <span className="al-schedule-item-category">
                          {catColor.icon} {lecture.category}
                        </span>
                        <span className="al-schedule-item-duration">
                          ⏱️ {lecture.durationMinutes} мин
                        </span>
                        {lecture.hasTest && (
                          <span className="al-schedule-item-test">📝 +Тест</span>
                        )}
                      </div>
                    </div>
                    <div className="al-schedule-item-arrow">→</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ========== MAIN CONTENT ========== */}
      <main className="al-main">
        <div className="al-container">

          {/* Filters */}
          <div className="al-filters">
            <div className="al-filters-tabs">
              {FILTER_TABS.map(tab => (
                <button
                  key={tab.id}
                  className={`al-filters-tab ${activeFilter === tab.id ? 'is-active' : ''}`}
                  onClick={() => setActiveFilter(tab.id)}
                >
                  <span className="al-filters-tab-icon">{tab.icon}</span>
                  <span className="al-filters-tab-label">{t(`academyLectures.filters.${tab.id}`)}</span>
                  {tab.id === 'live' && stats.live > 0 && (
                    <span className="al-filters-tab-badge al-filters-tab-badge--live">{stats.live}</span>
                  )}
                  {tab.id === 'upcoming' && stats.upcoming > 0 && (
                    <span className="al-filters-tab-badge">{stats.upcoming}</span>
                  )}
                </button>
              ))}
            </div>

            <div className="al-filters-search">
              <svg className="al-filters-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                className="al-filters-search-input"
                placeholder={t('academyLectures.filters.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="al-filters-search-clear" onClick={() => setSearchQuery('')}>✕</button>
              )}
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="al-filters-sort"
            >
              <option value="date">{t('academyLectures.sort.date')}</option>
              <option value="popular">{t('academyLectures.sort.popular')}</option>
              <option value="alphabetical">{t('academyLectures.sort.alphabetical')}</option>
            </select>
          </div>

          {/* Categories */}
          {categories.length > 0 && (
            <div className="al-categories">
              {categories.map(category => (
                <button
                  key={category.id}
                  className={`al-category ${selectedCategory === category.slug ? 'is-active' : ''}`}
                  style={{ '--cat-color': category.primary }}
                  onClick={() => setSelectedCategory(prev => prev === category.slug ? null : category.slug)}
                >
                  <span className="al-category-icon">{category.icon}</span>
                  <span className="al-category-name">{category.name}</span>
                </button>
              ))}
            </div>
          )}

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="al-activeFilters">
              <span>{filteredLectures.length} {t('academyLectures.results.found')}</span>
              <button onClick={handleClearFilters}>{t('academyLectures.filters.clearAll')}</button>
            </div>
          )}

          {/* Content */}
          {isLoading ? (
            <AcademyLecturesSkeleton />
          ) : filteredLectures.length === 0 ? (
            <div className="al-empty">
              <div className="al-empty-icon">{hasActiveFilters ? '🔍' : '🎬'}</div>
              <h3>{hasActiveFilters ? t('academyLectures.empty.noResults') : t('academyLectures.empty.noLectures')}</h3>
              <p>{hasActiveFilters ? t('academyLectures.empty.tryDifferent') : t('academyLectures.empty.checkBack')}</p>
              {hasActiveFilters && (
                <button className="al-empty-btn" onClick={handleClearFilters}>
                  {t('academyLectures.filters.clearAll')}
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="al-grid">
                {visibleLectures.map((lecture, index) => {
                  const status = getLectureStatus(lecture);
                  const catColor = getCategoryColor(lecture);
                  const totalCredits = (lecture.creditsForAttendance || 0) + (lecture.creditsForTest || 0);
                  const hasTrailer = status === 'recording' && lecture.videoUrl;

                  return (
                    <article
                      key={lecture.id || index}
                      className={`al-card al-card--${status}`}
                      style={{ '--card-color': catColor.primary }}
                      onClick={() => handleLectureClick(lecture)}
                    >
                      {/* Thumbnail */}
                      <div className="al-card-thumb">
                        {lecture.thumbnailUrl && (
                          <img src={lecture.thumbnailUrl} alt={lecture.title} className="al-card-thumb-img" />
                        )}
                        <div className="al-card-thumb-overlay"></div>

                        {status === 'live' && (
                          <div className="al-card-live">
                            <span className="al-card-live-dot"></span>
                            <span>LIVE</span>
                          </div>
                        )}
                        {status === 'upcoming' && (
                          <div className="al-card-upcoming">📅 {t('academyLectures.card.upcoming')}</div>
                        )}
                        {status === 'recording' && (
                          <div className="al-card-recording">📹 {t('academyLectures.card.recording')}</div>
                        )}

                        <div className="al-card-credits">
                          <span className="al-card-credits-icon">🪙</span>
                          <span>+{totalCredits}</span>
                        </div>

                        {/* Play button - САМО за recordings с videoUrl */}
                        {hasTrailer && (
                          <button
                            className="al-card-play al-card-play--trailer"
                            onClick={(e) => handlePlayClick(e, lecture)}
                            aria-label={t('academyLectures.card.preview', 'Преглед')}
                          >
                            ▶️
                          </button>
                        )}

                        {/* Status icons за live/upcoming (визуални, без click) */}
                        {status === 'live' && !hasTrailer && (
                          <div className="al-card-status-icon al-card-status-icon--live">📡</div>
                        )}
                        {status === 'upcoming' && (
                          <div className="al-card-status-icon al-card-status-icon--upcoming">🔔</div>
                        )}

                        {lecture.durationMinutes && (
                          <div className="al-card-duration">{lecture.durationMinutes} мин</div>
                        )}

                        {/* Views count - NEW */}
                        {lecture.viewsCount > 0 && (
                          <div className="al-card-views">
                            <span className="al-card-views-icon">👁️</span>
                            <span>{lecture.viewsCount.toLocaleString()}</span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="al-card-content">
                        <div className="al-card-category" style={{ color: catColor.primary }}>
                          {catColor.icon} {lecture.category}
                        </div>

                        <h3 className="al-card-title">{lecture.title}</h3>
                        <p className="al-card-desc">{lecture.shortDescription}</p>

                        {/* Tags - NEW */}
                        {lecture.tags && lecture.tags.length > 0 && (
                          <div className="al-card-tags">
                            {lecture.tags.slice(0, 3).map((tag, idx) => (
                              <span key={idx} className="al-card-tag">#{tag}</span>
                            ))}
                          </div>
                        )}

                        {/* Lecturer with photo - UPDATED */}
                        <div className="al-card-lecturer">
                          <div className="al-card-lecturer-avatar">
                            {lecture.lecturer?.photoUrl ? (
                              <img src={lecture.lecturer.photoUrl} alt={lecture.lecturer.name} />
                            ) : (
                              <span>👤</span>
                            )}
                          </div>
                          <div className="al-card-lecturer-info">
                            <span className="al-card-lecturer-name">
                              {lecture.lecturer?.name || t('academyLectures.card.speaker')}
                            </span>
                            {lecture.rating && (
                              <span className="al-card-lecturer-rating">
                                ⭐ {parseFloat(lecture.rating).toFixed(1)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Course badge - NEW */}
                        {lecture.course && (
                          <div className="al-card-course">
                            <span className="al-card-course-icon">📚</span>
                            <span className="al-card-course-name">{lecture.course.name}</span>
                          </div>
                        )}

                        {/* Footer */}
                        <div className="al-card-footer">
                          {status === 'upcoming' && lecture.maxParticipants && (
                            <div className="al-card-spots">
                              <div className="al-card-spots-bar">
                                <div
                                  className="al-card-spots-fill"
                                  style={{ width: `${Math.min((lecture.registeredCount / lecture.maxParticipants) * 100, 100)}%` }}
                                ></div>
                              </div>
                              <span>{lecture.registeredCount}/{lecture.maxParticipants}</span>
                            </div>
                          )}

                          {lecture.hasTest && (
                            <span className="al-card-test">📝 {t('academyLectures.card.hasTest')}</span>
                          )}

                          <button className={`al-card-btn al-card-btn--${status}`}>
                            {status === 'live' && t('academyLectures.card.watchLive')}
                            {status === 'upcoming' && t('academyLectures.card.signUp')}
                            {status === 'recording' && t('academyLectures.card.watch')}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Load More Button - NEW */}
              {hasMore && (
                <div className="al-loadMore">
                  <button className="al-loadMore-btn" onClick={handleLoadMore}>
                    <span className="al-loadMore-btn-icon">📥</span>
                    <span className="al-loadMore-btn-text">
                      {t('academyLectures.loadMore', 'Зареди още')}
                    </span>
                    <span className="al-loadMore-btn-count">
                      ({Math.min(remainingCount, ITEMS_PER_PAGE)} от {remainingCount})
                    </span>
                  </button>
                  <div className="al-loadMore-progress">
                    <div
                      className="al-loadMore-progress-fill"
                      style={{ width: `${(visibleCount / filteredLectures.length) * 100}%` }}
                    ></div>
                  </div>
                  <span className="al-loadMore-info">
                    {t('academyLectures.showing', 'Показани')} {visibleCount} {t('academyLectures.of', 'от')} {filteredLectures.length}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Trailer Modal */}
      <AcademyLectureTrailerModal
        isOpen={isTrailerOpen}
        onClose={handleTrailerClose}
        lecture={trailerLecture}
        accentColor={trailerLecture ? getCategoryColor(trailerLecture).primary : '#ff6347'}
        onViewLecture={handleViewLecture}
      />
      <ScrollToTop />
    </div>
  );
};

export default AcademyLectures;