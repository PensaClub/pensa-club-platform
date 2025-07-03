
import './initiativesHero.css';
import { useTranslation } from 'react-i18next';
import { useInitiativeContext } from '../../../contexts/InitiativeProvider';
import { useEffect, useState } from 'react';

export const InitiativesHero = () => {
  const { t } = useTranslation();
  const { initiatives, getAllApplications } = useInitiativeContext();
  const [stats, setStats] = useState({
    totalInitiatives: 0,
    totalParticipants: 0,
    uniqueCities: 0
  });

  useEffect(() => {
    if (initiatives.length > 0) {
      // Брой инициативи
      const totalInitiatives = initiatives.length;
      
      // Уникални градове
      const cities = new Set();
      initiatives.forEach(initiative => {
        // if (initiative.city) {
        //   cities.add(initiative.city);
        // }
        // Или ако е в location обект:
        if (initiative.location?.address) {
          cities.add(initiative.location.address);
        }
      });
      const uniqueCities = cities.size;
      
      setStats(prev => ({
        ...prev,
        totalInitiatives,
        uniqueCities
      }));
    }
  }, [initiatives]);

useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const applications = await getAllApplications();

        const totalParticipants = applications.length;
        
        // Или ако искаме уникални участници:
        // const uniqueParticipants = new Set(applications.map(app => app.userId)).size;
        
        setStats(prev => ({
          ...prev,
          totalParticipants
        }));
      } catch (error) {
        console.error('Error fetching participants:', error);
      }
    };

    fetchParticipants();
  }, []);

  return (
    <div className="initiatives-hero">
      <div className="initiatives-hero-content">
        {/* Лява секция - голямо кръгло изображение */}
        <div className="hero-main-image">
          <div className="hero-main-circle"></div>
        </div>

        {/* Централна секция - снимки и заглавие между тях */}
        <div className="hero-center-section">
          {/* Горни две снимки */}
          <div className="hero-small-images-top">
            <div className="hero-small-image"></div>
            <div className="hero-small-image"></div>
          </div>
          
          {/* Заглавие между снимките */}
          <div className="hero-title-panel">
            <h2 className="initiatives-hero-title">
              {t('initiatives.hero.title')}
            </h2>
            {/* <div className="hero-year">2024</div> */}
          </div>
          
          {/* Долни две снимки */}
          <div className="hero-small-images-bottom">
            <div className="hero-small-image"></div>
            <div className="hero-small-image"></div>
          </div>
        </div>

        {/* Дясна секция - главно съдържание */}
        <div className="hero-content-panel">
          <h1 className="hero-main-title">
            {t('initiatives.hero.mainTitle', 'ВЪЗРАСТНИ ПРАВЯТ ПРОМЯНА')}
          </h1>
          <p className="initiatives-hero-description">
            {t('initiatives.hero.description')}
          </p>
          
          <div className="initiatives-hero-stats">
            <div className="hero-stat-item">
              <span className="stat-number">{stats.totalInitiatives}</span>
              <span className="stat-label-view">{t('initiatives.hero.activeInitiatives')}</span>
            </div>
            <div className="hero-stat-item">
              <span className="stat-number">{stats.totalParticipants}+</span>
              <span className="stat-label-view">{t('initiatives.hero.participants')}</span>
            </div>
            <div className="hero-stat-item">
              <span className="stat-number">{stats.uniqueCities}</span>
              <span className="stat-label-view">{t('initiatives.hero.cities')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};