import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { MentorCard } from './MentorCard';
import './digiBridgeMentorsPage.css';
import { DigiBridgeHeader } from '../../DigiBridgeAcademy/DigiBridgeHeader/DigiBridgeHeader';
import { useAcademy } from '../../contexts/AcademyProvider';
import { Loader } from '../../Loader/Loader';
import { MentorDetailModal } from './MentorDetailModal';

export const DigiBridgeMentorsPage = () => {
  const { t } = useTranslation();
  const { getAllMentors } = useAcademy();
  
  const [mentors, setMentors] = useState([]);
  const [filteredMentors, setFilteredMentors] = useState([]);
  const [selectedSpecialization, setSelectedSpecialization] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [scrollY, setScrollY] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch mentors
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

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Filter mentors
  useEffect(() => {
    let result = mentors;

    // Specialization filter
    if (selectedSpecialization !== 'all') {
      result = result.filter(m => m.specialization === selectedSpecialization);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(m => 
        m.name.toLowerCase().includes(query) ||
        m.specialization?.toLowerCase().includes(query) ||
        m.bio?.toLowerCase().includes(query)
      );
    }

    setFilteredMentors(result);
  }, [selectedSpecialization, searchQuery, mentors]);

  const specializations = [
    { value: 'all', label: t('digiBridge.mentorsPage.filters.all') },
    { value: 'Digital Security', label: t('digiBridge.mentorsPage.filters.digitalSecurity') },
    { value: 'Media Literacy', label: t('digiBridge.mentorsPage.filters.mediaLiteracy') },
    { value: 'Social Media', label: t('digiBridge.mentorsPage.filters.socialMedia') },
    { value: 'Online Banking', label: t('digiBridge.mentorsPage.filters.onlineBanking') },
    { value: 'Basic Computer Skills', label: t('digiBridge.mentorsPage.filters.basicSkills') },
  ];

  const handleOpenModal = (mentor) => {
    setSelectedMentor(mentor);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMentor(null);
  };

  const availableMentorsCount = mentors.filter(m => m.isOnline).length;
  const uniqueSpecializations = [...new Set(mentors.map(m => m.specialization))].length;

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
              <span className="mentors-stat-number">{availableMentorsCount}</span>
              <span className="mentors-stat-label">{t('digiBridge.mentorsPage.stats.available')}</span>
            </div>
            <div className="mentors-stat-card">
              <span className="mentors-stat-number">{uniqueSpecializations}</span>
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

        {/* MENTORS LIST */}
        <section className="mentors-list-new">
          <div className="mentors-list-container">
            
            {isLoading ? (
              <Loader />
            ) : filteredMentors.length > 0 ? (
              <>
                {filteredMentors.map((mentor, index) => (
                  <MentorCard 
                    key={mentor.id} 
                    mentor={mentor} 
                    index={index}
                    onViewProfile={() => handleOpenModal(mentor)}
                  />
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

        {/* MODAL */}
        {isModalOpen && selectedMentor && (
          <MentorDetailModal 
            mentor={selectedMentor}
            onClose={handleCloseModal}
          />
        )}

      </div>
    </>
  );
};