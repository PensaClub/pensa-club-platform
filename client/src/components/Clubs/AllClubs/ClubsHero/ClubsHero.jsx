import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './clubsHero.css';

export const ClubsHero = ({ totalClubs }) => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className={`clubs-hero-section ${isVisible ? 'clubs-hero-visible' : ''}`}>
      <div className="clubs-hero-background">
        <div className="clubs-hero-pattern"></div>
        <div className="clubs-hero-gradient"></div>
      </div>
      
      <div className="clubs-hero-content">
        <div className="clubs-hero-text-content">
          <h1 className="clubs-hero-title">
            {t('clubs.ClubsHero.title.prefix')} <span className="clubs-hero-title-highlight">{t('clubs.ClubsHero.title.highlight')}</span>
          </h1>
          <p className="clubs-hero-subtitle">
            {t('clubs.ClubsHero.subtitle')}
          </p>
          <div className="clubs-hero-stats">
            <div className="clubs-hero-stat-item">
              <span className="clubs-hero-stat-number">{totalClubs}</span>
              <span className="clubs-hero-stat-label">{t('clubs.ClubsHero.stats.activeClubs')}</span>
            </div>
            <div className="clubs-hero-stat-divider"></div>
            <div className="clubs-hero-stat-item">
              <span className="clubs-hero-stat-number">50+</span>
              <span className="clubs-hero-stat-label">{t('clubs.ClubsHero.stats.cities')}</span>
            </div>
            <div className="clubs-hero-stat-divider"></div>
            <div className="clubs-hero-stat-item">
              <span className="clubs-hero-stat-number">2000+</span>
              <span className="clubs-hero-stat-label">{t('clubs.ClubsHero.stats.activeMembers')}</span>
            </div>
          </div>
        </div>
        
        <div className="clubs-hero-visual">
          <div className="clubs-hero-circles">
            <div className="clubs-hero-circle clubs-hero-circle-1"></div>
            <div className="clubs-hero-circle clubs-hero-circle-2"></div>
            <div className="clubs-hero-circle clubs-hero-circle-3"></div>
          </div>
        </div>
      </div>
    </section>
  );
};