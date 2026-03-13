import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './reActionHero.css';

const ReActionHero = ({ stats }) => {
  const { t } = useTranslation('reaction');

  const scrollToBookingForm = () => {
    document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="rah">
      <div className="rah-bg">
        <div className="rah-bg-pattern"></div>
        <div className="rah-bg-glow rah-bg-glow--1"></div>
        <div className="rah-bg-glow rah-bg-glow--2"></div>
      </div>

      <div className="rah-container">
        {/* Logos */}
        <div className="rah-logos">
          <img src="/images/partners/BFFW-20Logo-Prink2.svg" alt="Bulgarian Fund for Women" className="rah-logo" />
          <span className="rah-logos-divider"></span>
          <img src="/images/homePage/logo.png" alt="Pensa Club" className="rah-logo" />
        </div>

        <span className="rah-program-label">{t('hero.programLabel')}</span>

        <h1 className="rah-title">{t('hero.title')}</h1>
        <p className="rah-subtitle">{t('hero.subtitle')}</p>
        <p className="rah-description">{t('hero.description')}</p>

        {/* CTA */}
        <div className="rah-actions">
          <button className="rah-btn rah-btn--cta" onClick={scrollToBookingForm}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            {t('hero.cta')}
          </button>
          <Link to="/reaction/track" className="rah-btn rah-btn--track">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            {t('hero.trackCta')}
          </Link>
        </div>

        {/* Stats */}
        {stats && (
          <div className="rah-stats">
            <div className="rah-stat">
              <span className="rah-stat-number">{stats.visitsCompleted || 0}</span>
              <span className="rah-stat-label">{t('stats.visitsCompleted')}</span>
            </div>
            <div className="rah-stat-divider"></div>
            <div className="rah-stat">
              <span className="rah-stat-number">{stats.clubsReached || 0}</span>
              <span className="rah-stat-label">{t('stats.clubsReached')}</span>
            </div>
            <div className="rah-stat-divider"></div>
            <div className="rah-stat">
              <span className="rah-stat-number">{stats.citiesCovered || 0}</span>
              <span className="rah-stat-label">{t('stats.citiesCovered')}</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ReActionHero;
