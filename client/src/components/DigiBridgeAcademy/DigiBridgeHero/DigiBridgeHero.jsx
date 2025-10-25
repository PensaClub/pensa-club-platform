import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './digiBridgeHero.css';

export const DigiBridgeHero = () => {
  const { t } = useTranslation();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="digibridge-hero">
      {/* Parallax Background */}
      <div 
        className="digibridge-hero-background"
        style={{ transform: `translateY(${scrollY * 0.5}px)` }}
      ></div>

      {/* Gradient Overlay */}
      <div className="digibridge-hero-overlay"></div>

      {/* Content */}
      <div className="digibridge-hero-container">
        <div className="digibridge-hero-content">
          <h1 className="digibridge-hero-title">
            {t('digiBridge.hero.title')}
          </h1>
          <p className="digibridge-hero-subtitle">
            {t('digiBridge.hero.subtitle')}
          </p>
          <div className="digibridge-hero-actions">
            <Link to="/academy/courses" className="digibridge-hero-button digibridge-hero-button-primary">
              {t('digiBridge.hero.startLearning')}
            </Link>
            <Link to="/academy/become-mentor" className="digibridge-hero-button digibridge-hero-button-secondary">
              {t('digiBridge.hero.becomeMentor')}
            </Link>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="digibridge-hero-decoration digibridge-hero-decoration-1"></div>
      <div className="digibridge-hero-decoration digibridge-hero-decoration-2"></div>
    </section>
  );
};