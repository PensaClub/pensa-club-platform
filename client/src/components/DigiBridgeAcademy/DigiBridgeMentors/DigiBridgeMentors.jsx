import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './digiBridgeMentors.css';

export const DigiBridgeMentors = () => {
  const { t } = useTranslation();

  const mentorQualities = [
    {
      icon: '💡',
      title: t('digiBridge.mentors.quality1.title'),
      description: t('digiBridge.mentors.quality1.description'),
    },
    {
      icon: '❤️',
      title: t('digiBridge.mentors.quality2.title'),
      description: t('digiBridge.mentors.quality2.description'),
    },
    {
      icon: '🎯',
      title: t('digiBridge.mentors.quality3.title'),
      description: t('digiBridge.mentors.quality3.description'),
    },
    {
      icon: '🤝',
      title: t('digiBridge.mentors.quality4.title'),
      description: t('digiBridge.mentors.quality4.description'),
    },
  ];

  return (
    <section className="digibridge-mentors">
      <div className="digibridge-mentors-container">
        
        {/* Left Content */}
        <div className="digibridge-mentors-content">
          <span className="digibridge-mentors-label">
            {t('digiBridge.mentors.label')}
          </span>
          <h2 className="digibridge-mentors-title">
            {t('digiBridge.mentors.title')}
          </h2>
          <p className="digibridge-mentors-description">
            {t('digiBridge.mentors.description')}
          </p>

          <div className="digibridge-mentors-qualities">
            {mentorQualities.map((quality, index) => (
              <div key={index} className="digibridge-mentors-quality">
                <div className="digibridge-mentors-quality-icon">{quality.icon}</div>
                <div className="digibridge-mentors-quality-content">
                  <h3 className="digibridge-mentors-quality-title">{quality.title}</h3>
                  <p className="digibridge-mentors-quality-description">{quality.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="digibridge-mentors-actions">
            <Link to="/academy/mentors" className="digibridge-mentors-button digibridge-mentors-button-primary">
              {t('digiBridge.mentors.findMentor')}
            </Link>
            <Link to="/academy/become-mentor" className="digibridge-mentors-button digibridge-mentors-button-secondary">
              {t('digiBridge.mentors.becomeMentor')}
            </Link>
          </div>
        </div>

        {/* Right Image */}
        <div className="digibridge-mentors-image">
          <div className="digibridge-mentors-image-wrapper">
            <img 
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&q=80" 
              alt="Ментор и обучаем" 
              className="digibridge-mentors-img"
            />
            <div className="digibridge-mentors-stats-card">
              <div className="digibridge-mentors-stat-item">
                <h4 className="digibridge-mentors-stat-number">10+</h4>
                <p className="digibridge-mentors-stat-label">{t('digiBridge.mentors.activeMentors')}</p>
              </div>
              <div className="digibridge-mentors-stat-divider"></div>
              <div className="digibridge-mentors-stat-item">
                <h4 className="digibridge-mentors-stat-number">100%</h4>
                <p className="digibridge-mentors-stat-label">{t('digiBridge.mentors.satisfaction')}</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};