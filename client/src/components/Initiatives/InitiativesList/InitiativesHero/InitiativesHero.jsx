
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
  const fetchAllStats = async () => {
    if (initiatives.length === 0) return;
    
    try {
      // Статистики от инициативи
      const totalInitiatives = initiatives.length;
      
      // Уникални градове
      const cities = new Set();
      initiatives.forEach(initiative => {
        if (initiative.location.address ) {
          cities.add(initiative.location.address);
        }
      });
      const uniqueCities = cities.size;
      
      // Участници от API
      const applications = await getAllApplications();
      const totalParticipants = applications.length;
      
      setStats({
        totalInitiatives,
        totalParticipants,
        uniqueCities
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  fetchAllStats();
}, [initiatives]); // Само initiatives като dependency

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
            {t('initiatives.hero.mainTitle')}
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