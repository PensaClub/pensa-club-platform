


import React from 'react';
import { useTranslation } from 'react-i18next';
import './publicationsHero.css';

export const PublicationsHero = () => {
  const { t } = useTranslation();

  return (
    <div className="publications-hero">
      <div className="publications-hero-background">
        <img
          src="/images/homePage/publications-hero.jpg"
          alt="Publications"
          className="publications-hero-image"
        />
        <div className="publications-hero-overlay"></div>
      </div>
      <div className="publications-hero-content">
        <div className="container">
          <div className="publications-hero-main">
            <div className="publications-hero-badge">
              <span className="publications-hero-badge-icon">📚</span>
              {t('publications.hero.badge')}
            </div>
            <h1 className="publications-hero-title">
              {t('publications.hero.title')}
            </h1>
            <p className="publications-hero-description">
              {t('publications.hero.description')}
            </p>
            <div className="publications-hero-stats">
              <div className="publications-hero-stat">
                <span className="publications-hero-stat-number">0</span>
                <span className="publications-hero-stat-label">
                  {t('publications.hero.totalPublications')}
                </span>
              </div>
              <div className="publications-hero-stat">
                <span className="publications-hero-stat-number">0</span>
                <span className="publications-hero-stat-label">
                  {t('publications.hero.categories')}
                </span>
              </div>
              <div className="publications-hero-stat">
                <span className="publications-hero-stat-number">0</span>
                <span className="publications-hero-stat-label">
                  {t('publications.hero.downloads')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
