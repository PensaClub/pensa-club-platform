
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './digiBridgeCTA.css';

export const DigiBridgeCTA = () => {
  const { t } = useTranslation();

  return (
    <section className="digibridge-cta">
      <div className="digibridge-cta-background"></div>
      <div className="digibridge-cta-overlay"></div>
      
      <div className="digibridge-cta-container">
        <div className="digibridge-cta-content">
          
          <div className="digibridge-cta-badge">
            <span className="digibridge-cta-badge-icon">✨</span>
            <span className="digibridge-cta-badge-text">{t('digiBridge.cta.badge')}</span>
          </div>

          <h2 className="digibridge-cta-title">
            {t('digiBridge.cta.title')}
          </h2>

          <p className="digibridge-cta-description">
            {t('digiBridge.cta.description')}
          </p>

          <div className="digibridge-cta-actions">
            <Link to="/academy/courses" className="digibridge-cta-button digibridge-cta-button-primary">
              <svg className="digibridge-cta-button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              <span>{t('digiBridge.cta.startLearning')}</span>
            </Link>

            <Link to="/academy/become-mentor" className="digibridge-cta-button digibridge-cta-button-secondary">
              <svg className="digibridge-cta-button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <span>{t('digiBridge.cta.becomeMentor')}</span>
            </Link>
          </div>

          <div className="digibridge-cta-features">
            <div className="digibridge-cta-feature">
              <svg className="digibridge-cta-feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span>{t('digiBridge.cta.feature1')}</span>
            </div>
            <div className="digibridge-cta-feature">
              <svg className="digibridge-cta-feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span>{t('digiBridge.cta.feature2')}</span>
            </div>
            <div className="digibridge-cta-feature">
              <svg className="digibridge-cta-feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span>{t('digiBridge.cta.feature3')}</span>
            </div>
          </div>

        </div>
      </div>

      {/* Decorative Elements */}
      <div className="digibridge-cta-decoration digibridge-cta-decoration-1"></div>
      <div className="digibridge-cta-decoration digibridge-cta-decoration-2"></div>
      <div className="digibridge-cta-decoration digibridge-cta-decoration-3"></div>
    </section>
  );
};