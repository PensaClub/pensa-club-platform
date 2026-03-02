import React from 'react';
import { useTranslation } from 'react-i18next';
import './publicationStoriesHero.css';

export const PublicationStoriesHero = ({ contentType = 'stories' }) => {
  const { t } = useTranslation('content');

  return (
    <div className="ps-hero-new">
      <div className="ps-hero-container">
        <div className="ps-hero-content">
          <div className="ps-hero-badge">
            {contentType === 'publications' ? 'Publications' : 'Stories'}
          </div>
          <h1 className="ps-hero-title">
            {t(`publicationStories.hero.${contentType}.title`)}
          </h1>
          <p className="ps-hero-description">
            {t(`publicationStories.hero.${contentType}.description`)}
          </p>
        </div>

        <div className="ps-hero-visual">
          <div className="ps-hero-icon-wrapper">
            {contentType === 'publications' ? (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2"/>
                <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2"/>
                <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2"/>
                <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2"/>
              </svg>
            ) : (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" stroke="currentColor" strokeWidth="2"/>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" stroke="currentColor" strokeWidth="2"/>
              </svg>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
