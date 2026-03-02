import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './digiBridgeMentorsPage.css';
import { useAcademy } from '../../contexts/AcademyProvider';
import { Loader } from '../../Loader/Loader';
import { MentorDetailModal } from './MentorDetailModal';
import SEOHead from '../../SEO/SEOHead';

const THEMES = [
  { primary: '#6366f1', gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', light: '#eef2ff' },
  { primary: '#0ea5e9', gradient: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)', light: '#ecfeff' },
  { primary: '#10b981', gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)', light: '#ecfdf5' },
  { primary: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)', light: '#fffbeb' },
  { primary: '#ef4444', gradient: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)', light: '#fef2f2' },
  { primary: '#8b5cf6', gradient: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)', light: '#f5f3ff' },
];

export const DigiBridgeMentorsPage = () => {
  const { t, i18n } = useTranslation('digibridge');
  const { getAllMentors } = useAcademy();

  const [mentors, setMentors] = useState([]);
  const [filteredMentors, setFilteredMentors] = useState([]);
  const [selectedSpecialization, setSelectedSpecialization] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  useEffect(() => {
    fetchMentors();
    window.scrollTo(0, 0);
  }, []);

  const fetchMentors = async () => {
    setIsLoading(true);
    try {
      const response = await getAllMentors({ status: 'active' });
      if (response.success) {
        setMentors(response.mentors || []);
        setFilteredMentors(response.mentors || []);
      }
    } catch (error) {
      console.error('Error fetching mentors:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let result = mentors;
    if (selectedSpecialization !== 'all') {
      result = result.filter(m => m.specialization === selectedSpecialization);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(m =>
        m.name.toLowerCase().includes(query) ||
        m.specialization?.toLowerCase().includes(query)
      );
    }
    setFilteredMentors(result);
  }, [selectedSpecialization, searchQuery, mentors]);

  // Close filters when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isFiltersOpen && !e.target.closest('.dmp-filters') && !e.target.closest('.dmp-filters-toggle')) {
        setIsFiltersOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isFiltersOpen]);

  const specializations = [
    { value: 'all', label: t('digiBridge.mentorsPage.filters.all', 'Всички') },
    { value: 'Digital Security', label: t('digiBridge.mentorsPage.filters.digitalSecurity', 'Дигитална сигурност') },
    { value: 'Media Literacy', label: t('digiBridge.mentorsPage.filters.mediaLiteracy', 'Медийна грамотност') },
    { value: 'Social Media', label: t('digiBridge.mentorsPage.filters.socialMedia', 'Социални мрежи') },
    { value: 'Online Banking', label: t('digiBridge.mentorsPage.filters.onlineBanking', 'Онлайн банкиране') },
    { value: 'Basic Computer Skills', label: t('digiBridge.mentorsPage.filters.basicSkills', 'Основни умения') },
  ];

  const availableCount = mentors.filter(m => m.isOnline).length;
  const specsCount = [...new Set(mentors.map(m => m.specialization))].length;
  const totalSessions = mentors.reduce((sum, m) => sum + (m.sessionsCount || 0), 0);

  const activeFiltersCount = (selectedSpecialization !== 'all' ? 1 : 0) + (searchQuery.trim() ? 1 : 0);

  const handleSelectSpec = (value) => {
    setSelectedSpecialization(value);
    // На мобилни затваряме филтрите след избор
    if (window.innerWidth < 768) {
      setIsFiltersOpen(false);
    }
  };

  const metaData = useMemo(() => ({
    title: t('digiBridge.mentorsPage.meta.title', 'Ментори | DigiBridge Academy'),
    description: t('digiBridge.mentorsPage.meta.description', `Запознайте се с нашите ${mentors.length} ментори.`),
    keywords: 'ментори, дигитална грамотност, обучение',
    image: '/images/digibridge/mentors-hero.jpg'
  }), [mentors.length, t]);

  if (isLoading) {
    return (
      <div className="dmp-page">
        <div className="dmp-loading"><Loader /></div>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title={metaData.title}
        description={metaData.description}
        keywords={metaData.keywords}
        image={metaData.image}
        type="website"
        canonical="https://pensa.club/academy/mentors"
      />

      <div className="dmp-page">
        {/* ========== HERO ========== */}
        <section className="dmp-hero">
          <div className="dmp-hero-grid"></div>
          <div className="dmp-hero-glow dmp-hero-glow--1"></div>
          <div className="dmp-hero-glow dmp-hero-glow--2"></div>

          <div className="dmp-hero-container">
            <div className="dmp-hero-content">
              <div className="dmp-hero-badge">
                <span className="dmp-hero-badge-dot"></span>
                {availableCount} {t('digiBridge.mentorsPage.hero.online', 'онлайн сега')}
              </div>
              <h1 className="dmp-hero-title">
                {t('digiBridge.mentorsPage.hero.title', 'Нашите ментори')}
              </h1>
              <p className="dmp-hero-desc">
                {t('digiBridge.mentorsPage.hero.subtitle', 'Млади професионалисти, готови да споделят знания и опит с търпение и разбиране')}
              </p>
              <div className="dmp-hero-actions">
                <a href="#mentors-grid" className="dmp-btn dmp-btn--primary">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                  {t('digiBridge.mentorsPage.hero.findMentor', 'Намери ментор')}
                </a>
                <Link to="/academy/become-mentor" className="dmp-btn dmp-btn--outline">
                  {t('digiBridge.mentorsPage.hero.become', 'Стани ментор')}
                </Link>
              </div>
            </div>

            <div className="dmp-hero-visual">
              <div className="dmp-hero-img-frame">
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80"
                  alt="Mentors"
                  className="dmp-hero-img"
                />
                <div className="dmp-hero-img-overlay"></div>
              </div>

              <div className="dmp-hero-stat-card dmp-hero-stat-card--1">
                <span className="dmp-hero-stat-num">{mentors.length}</span>
                <span className="dmp-hero-stat-label">{t('digiBridge.mentorsPage.stats.mentors', 'Ментори')}</span>
              </div>
              <div className="dmp-hero-stat-card dmp-hero-stat-card--2">
                <span className="dmp-hero-stat-num">{totalSessions}+</span>
                <span className="dmp-hero-stat-label">{t('digiBridge.mentorsPage.stats.sessions', 'Сесии')}</span>
              </div>
              <div className="dmp-hero-stat-card dmp-hero-stat-card--3">
                <span className="dmp-hero-stat-num">{specsCount}</span>
                <span className="dmp-hero-stat-label">{t('digiBridge.mentorsPage.stats.specializations', 'Области')}</span>
              </div>
            </div>
          </div>
        </section>

        {/* ========== MOBILE FILTERS TOGGLE ========== */}
        <button
          className={`dmp-filters-toggle ${isFiltersOpen ? 'dmp-filters-toggle--active' : ''}`}
          onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          aria-label="Филтри"
        >
          {isFiltersOpen ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
              <line x1="11" y1="8" x2="11" y2="14" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
          )}
          {activeFiltersCount > 0 && (
            <span className="dmp-filters-toggle-badge">{activeFiltersCount}</span>
          )}
        </button>

        {/* ========== FILTERS ========== */}
        <section className={`dmp-filters ${isFiltersOpen ? 'dmp-filters--open' : ''}`}>
          <div className="dmp-filters-inner">
            <div className="dmp-filters-header">
              <span className="dmp-filters-title">{t('digiBridge.mentorsPage.filtersDrawer.title', 'Филтри и търсене')}</span>
              <button className="dmp-filters-close" onClick={() => setIsFiltersOpen(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="dmp-search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder={t('digiBridge.mentorsPage.search', 'Търси по име или специализация...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="dmp-search-clear" onClick={() => setSearchQuery('')}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <div className="dmp-tags">
              {specializations.map(spec => (
                <button
                  key={spec.value}
                  className={`dmp-tag ${selectedSpecialization === spec.value ? 'dmp-tag--active' : ''}`}
                  onClick={() => handleSelectSpec(spec.value)}
                >
                  {spec.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Overlay for mobile */}
        {isFiltersOpen && <div className="dmp-filters-overlay" onClick={() => setIsFiltersOpen(false)}></div>}

        {/* ========== MENTORS ZIGZAG ========== */}
        <section className="dmp-mentors" id="mentors-grid">
          <div className="dmp-mentors-header">
            <h2>
              {selectedSpecialization === 'all'
                ? t('digiBridge.mentorsPage.list.all', 'Всички ментори')
                : specializations.find(s => s.value === selectedSpecialization)?.label
              }
            </h2>
            <span className="dmp-mentors-count">{filteredMentors.length} {t('digiBridge.mentorsPage.list.found', 'намерени')}</span>

          </div>

          {filteredMentors.length > 0 ? (
            <div className="dmp-mentors-list">
              {filteredMentors.map((mentor, index) => {
                const theme = THEMES[index % THEMES.length];
                const isRight = index % 2 !== 0;

                return (
                  <article
                    key={mentor.id}
                    className={`dmp-card ${isRight ? 'dmp-card--right' : ''}`}
                    style={{
                      '--theme-primary': theme.primary,
                      '--theme-gradient': theme.gradient,
                      '--theme-light': theme.light
                    }}
                  >
                    {/* Image Side */}
                    <div className="dmp-card-visual">
                      <div className="dmp-card-blob">
                        <img src={mentor.photoUrl} alt={mentor.name} />
                      </div>
                      <div className={`dmp-card-status ${mentor.isOnline ? 'dmp-card-status--on' : ''}`}>
                        {mentor.isOnline && <span className="dmp-card-status-dot"></span>}
                        {mentor.isOnline ? t('digiBridge.mentorsPage.card.available', 'Онлайн') : t('digiBridge.mentorsPage.card.busy', 'Офлайн')}
                      </div>
                      <div className="dmp-card-sessions">
                        <span className="dmp-card-sessions-num">{mentor.sessionsCount || 0}</span>
                        <span className="dmp-card-sessions-label">{t('digiBridge.mentorsPage.card.sessions', 'сесии')}</span>

                      </div>
                    </div>

                    {/* Content Side */}
                    <div className="dmp-card-content">
                      <div className="dmp-card-top">
                        <h3 className="dmp-card-name">{mentor.name}</h3>
                        <span className="dmp-card-age">{mentor.age} {t('digiBridge.mentorsPage.card.years', 'г.')}</span>
                      </div>

                      <div className="dmp-card-spec">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 2L2 7l10 5 10-5-10-5z" />
                          <path d="M2 17l10 5 10-5" />
                          <path d="M2 12l10 5 10-5" />
                        </svg>
                        {mentor.specialization}
                      </div>

                      <p className="dmp-card-bio">{mentor.bio || mentor.motivation}</p>

                      {mentor.languages?.length > 0 && (
                        <div className="dmp-card-langs">
                          <span>{t('digiBridge.mentorsPage.card.speaks', 'Говори:')}</span>

                          {mentor.languages.map(lang => (
                            <span key={lang} className="dmp-card-lang">
                              {lang === 'bg' ? 'BG' : lang === 'en' ? 'EN' : lang === 'de' ? 'DE' : lang.toUpperCase()}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="dmp-card-stats">
                        <div className="dmp-card-stat">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                          </svg>
                          <span>{mentor.studentsCount || 0}</span>
                          <small>{t('digiBridge.mentorsPage.card.students', 'ученици')}</small>
                        </div>
                        <div className="dmp-card-stat">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                          <span>{parseFloat(mentor.reviewsAvgRating || 0).toFixed(1)}</span>
                          <small>{t('digiBridge.mentorsPage.card.rating', 'рейтинг')}</small>
                        </div>
                        <div className="dmp-card-stat">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                          <span>{mentor.reviewsCount || 0}</span>
                          <small>{t('digiBridge.mentorsPage.card.reviews', 'отзиви')}</small>
                        </div>
                      </div>

                      {mentor.availability && (
                        <div className="dmp-card-avail">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                          {mentor.availability}
                        </div>
                      )}

                      <button
                        className="dmp-card-btn"
                        onClick={() => { setSelectedMentor(mentor); setIsModalOpen(true); }}
                      >
                        {t('digiBridge.mentorsPage.card.viewProfile', 'Виж профил')}
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="dmp-empty">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <h3>{t('digiBridge.mentorsPage.noResults.title', 'Няма намерени ментори')}</h3>
              <p>{t('digiBridge.mentorsPage.noResults.desc', 'Опитайте с различни филтри')}</p>
            </div>
          )}
        </section>

        {/* Modal */}
        {isModalOpen && selectedMentor && (
          <MentorDetailModal
            mentor={selectedMentor}
            onClose={() => { setIsModalOpen(false); setSelectedMentor(null); }}
          />
        )}
      </div>
    </>
  );
};

export default DigiBridgeMentorsPage;