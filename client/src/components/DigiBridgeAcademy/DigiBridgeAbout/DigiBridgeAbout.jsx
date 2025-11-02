import React from 'react';
import { useTranslation } from 'react-i18next';
import './digiBridgeAbout.css';

export const DigiBridgeAbout = ({ stats, loading }) => {
  const { t } = useTranslation();

  return (
    <section className="digibridge-about">
      <div className="digibridge-about-container">
        
        <div className="digibridge-about-content">
          <div className="digibridge-about-text">
            <span className="digibridge-about-label">
              {t('digiBridge.about.label')}
            </span>
            <h2 className="digibridge-about-title">
              {t('digiBridge.about.title')}
            </h2>
            <p className="digibridge-about-description">
              {t('digiBridge.about.description')}
            </p>
            
            <div className="digibridge-about-stats">
              <div className="digibridge-about-stat">
                <div className="digibridge-about-stat-icon">🎓</div>
                <div className="digibridge-about-stat-content">
                  <h3 className="digibridge-about-stat-number">
                    {loading ? '...' : `${stats?.satisfaction || 100}%`}
                  </h3>
                  <p className="digibridge-about-stat-text">{t('digiBridge.about.stat1')}</p>
                </div>
              </div>
              
              <div className="digibridge-about-stat">
                <div className="digibridge-about-stat-icon">🤝</div>
                <div className="digibridge-about-stat-content">
                  <h3 className="digibridge-about-stat-number">
                    {loading ? '...' : `${stats?.activeMentors || 0}+`}
                  </h3>
                  <p className="digibridge-about-stat-text">{t('digiBridge.about.stat2')}</p>
                </div>
              </div>
              
              <div className="digibridge-about-stat">
                <div className="digibridge-about-stat-icon">🌍</div>
                <div className="digibridge-about-stat-content">
                  <h3 className="digibridge-about-stat-number">
                    {loading ? '...' : stats?.countries || 0}
                  </h3>
                  <p className="digibridge-about-stat-text">{t('digiBridge.about.stat3')}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="digibridge-about-image">
            <div className="digibridge-about-image-wrapper">
              <img 
                src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&q=80" 
                alt="Интергенерационно обучение" 
                className="digibridge-about-img"
              />
              <div className="digibridge-about-image-decoration"></div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};