import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { MentorCard } from './MentorCard';
import './digiBridgeMentorsPage.css';
import { DigiBridgeHeader } from '../../DigiBridgeAcademy/DigiBridgeHeader/DigiBridgeHeader';

export const DigiBridgeMentorsPage = () => {
  const { t } = useTranslation();
  const [selectedSpecialization, setSelectedSpecialization] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // MOCK DATA
  const mentors = [
    {
      id: 1,
      name: 'Мария Петрова',
      age: 24,
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      specialization: 'Digital Security',
      bio: 'Студент по киберсигурност с опит в обучение на възрастни хора',
      availability: 'available',
      studentsCount: 8,
      rating: 5.0,
      experience: '2 години',
    },
    {
      id: 2,
      name: 'Иван Георгиев',
      age: 28,
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      specialization: 'Media Literacy',
      bio: 'Журналист с над 5 години опит в медийна грамотност',
      availability: 'busy',
      studentsCount: 12,
      rating: 4.8,
      experience: '3 години',
    },
    {
      id: 3,
      name: 'Елена Димитрова',
      age: 26,
      avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
      specialization: 'Social Media',
      bio: 'Специалист по социални мрежи и дигитален маркетинг',
      availability: 'available',
      studentsCount: 5,
      rating: 5.0,
      experience: '1.5 години',
    },
    {
      id: 4,
      name: 'Георги Стоянов',
      age: 30,
      avatar: 'https://randomuser.me/api/portraits/men/52.jpg',
      specialization: 'Online Banking',
      bio: 'Финансов експерт с фокус върху дигитални платежни решения',
      availability: 'available',
      studentsCount: 10,
      rating: 4.9,
      experience: '4 години',
    },
    {
      id: 5,
      name: 'София Иванова',
      age: 23,
      avatar: 'https://randomuser.me/api/portraits/women/28.jpg',
      specialization: 'Basic Computer Skills',
      bio: 'IT студент с търпение и разбиране към начинаещи',
      availability: 'available',
      studentsCount: 6,
      rating: 5.0,
      experience: '1 година',
    },
    {
      id: 6,
      name: 'Николай Петров',
      age: 27,
      avatar: 'https://randomuser.me/api/portraits/men/75.jpg',
      specialization: 'Digital Security',
      bio: 'Специалист по информационна сигурност и защита на лични данни',
      availability: 'busy',
      studentsCount: 15,
      rating: 4.7,
      experience: '3 години',
    },
  ];

  const specializations = [
    { value: 'all', label: t('digiBridge.mentorsPage.filters.all') },
    { value: 'Digital Security', label: t('digiBridge.mentorsPage.filters.digitalSecurity') },
    { value: 'Media Literacy', label: t('digiBridge.mentorsPage.filters.mediaLiteracy') },
    { value: 'Social Media', label: t('digiBridge.mentorsPage.filters.socialMedia') },
    { value: 'Online Banking', label: t('digiBridge.mentorsPage.filters.onlineBanking') },
    { value: 'Basic Computer Skills', label: t('digiBridge.mentorsPage.filters.basicSkills') },
  ];

  // Филтриране
  const filteredMentors = mentors.filter(mentor => {
    const matchesSpecialization = selectedSpecialization === 'all' || mentor.specialization === selectedSpecialization;
    const matchesSearch = mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         mentor.bio.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSpecialization && matchesSearch;
  });

  return (
    <>
      <Helmet>
        <title>{t('digiBridge.mentorsPage.meta.title')}</title>
        <meta name="description" content={t('digiBridge.mentorsPage.meta.description')} />
      </Helmet>

      <div className="mentors-page-new">
        <DigiBridgeHeader />

        {/* HERO SECTION */}
        <section className="mentors-hero-new">
          <div 
            className="mentors-hero-background"
            style={{ transform: `translateY(${scrollY * 0.5}px)` }}
          ></div>
          <div className="mentors-hero-overlay"></div>
          
          <div className="mentors-hero-container">
            <div className="mentors-hero-content">
              <h1 className="mentors-hero-title">
                {t('digiBridge.mentorsPage.hero.title')}
              </h1>
              <p className="mentors-hero-subtitle">
                {t('digiBridge.mentorsPage.hero.subtitle')}
              </p>
              <div className="mentors-hero-actions">
                <Link to="/academy/courses" className="mentors-hero-btn mentors-hero-btn-primary">
                  {t('digiBridge.mentorsPage.hero.findMentor')}
                </Link>
                <Link to="/academy/become-mentor" className="mentors-hero-btn mentors-hero-btn-secondary">
                  {t('digiBridge.mentorsPage.hero.becomeButton')}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* STATS SECTION */}
        <section className="mentors-stats-new">
          <div className="mentors-stats-container">
            <div className="mentors-stat-card">
              <span className="mentors-stat-number">{filteredMentors.length}</span>
              <span className="mentors-stat-label">{t('digiBridge.mentorsPage.stats.mentors')}</span>
            </div>
            <div className="mentors-stat-card">
              <span className="mentors-stat-number">{mentors.filter(m => m.availability === 'available').length}</span>
              <span className="mentors-stat-label">{t('digiBridge.mentorsPage.stats.available')}</span>
            </div>
            <div className="mentors-stat-card">
              <span className="mentors-stat-number">6</span>
              <span className="mentors-stat-label">{t('digiBridge.mentorsPage.stats.specializations')}</span>
            </div>
          </div>
        </section>

        {/* FILTERS SECTION */}
        <section className="mentors-filters-new">
          <div className="mentors-filters-container">
            
            {/* Search */}
            <div className="mentors-search-box">
              <svg className="mentors-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder={t('digiBridge.mentorsPage.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mentors-search-input"
              />
            </div>

            {/* Specializations */}
            <div className="mentors-spec-buttons">
              {specializations.map((spec) => (
                <button
                  key={spec.value}
                  className={`mentors-spec-btn ${selectedSpecialization === spec.value ? 'active' : ''}`}
                  onClick={() => setSelectedSpecialization(spec.value)}
                >
                  {spec.label}
                </button>
              ))}
            </div>
            
          </div>
        </section>

        {/* MENTORS SECTIONS - FULL WIDTH ZIGZAG */}
        <section className="mentors-list-new">
          <div className="mentors-list-container">
            
            {filteredMentors.length > 0 ? (
              <>
                {filteredMentors.map((mentor, index) => (
                  <MentorCard key={mentor.id} mentor={mentor} index={index} />
                ))}
              </>
            ) : (
              <div className="mentors-empty-new">
                <div className="mentors-empty-icon">🔍</div>
                <h3>{t('digiBridge.mentorsPage.noResults.title')}</h3>
                <p>{t('digiBridge.mentorsPage.noResults.description')}</p>
              </div>
            )}
            
          </div>
        </section>

      </div>
    </>
  );
};