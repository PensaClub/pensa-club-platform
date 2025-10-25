import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './digiBridgeFeatures.css';

export const DigiBridgeFeatures = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: '📚',
      title: t('digiBridge.features.courses.title'),
      description: t('digiBridge.features.courses.description'),
      link: '/academy/courses',
      color: '#ff6347',
    },
    {
      icon: '🤝',
      title: t('digiBridge.features.mentors.title'),
      description: t('digiBridge.features.mentors.description'),
      link: '/academy/mentors',
      color: '#ff7f50',
    },
    {
      icon: '📺',
      title: t('digiBridge.features.events.title'),
      description: t('digiBridge.features.events.description'),
      link: '/academy/events',
      color: '#ffa07a',
    },
    {
      icon: '📖',
      title: t('digiBridge.features.library.title'),
      description: t('digiBridge.features.library.description'),
      link: '/academy/library',
      color: '#ff8c69',
    },
  ];

  return (
    <section className="digibridge-features">
      <div className="digibridge-features-container">
        
        <div className="digibridge-features-header">
          <span className="digibridge-features-label">
            {t('digiBridge.features.label')}
          </span>
          <h2 className="digibridge-features-title">
            {t('digiBridge.features.title')}
          </h2>
          <p className="digibridge-features-subtitle">
            {t('digiBridge.features.subtitle')}
          </p>
        </div>

        <div className="digibridge-features-grid">
          {features.map((feature, index) => (
            <Link 
              key={index} 
              to={feature.link} 
              className="digibridge-features-card"
              style={{ '--feature-color': feature.color }}
            >
              <div className="digibridge-features-card-icon">{feature.icon}</div>
              <h3 className="digibridge-features-card-title">{feature.title}</h3>
              <p className="digibridge-features-card-description">{feature.description}</p>
              <div className="digibridge-features-card-arrow">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
};