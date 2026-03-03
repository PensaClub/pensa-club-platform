import { useTranslation } from 'react-i18next';
import './usefulLinksHero.css';

const UsefulLinksHero = () => {
  const { t } = useTranslation('useful-links');

  return (
    <section className="ulh-hero">
      <div className="ulh-hero-content">
        <div className="ulh-hero-badge">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
        </div>
        <h1 className="ulh-hero-title">{t('page.title')}</h1>
        <p className="ulh-hero-subtitle">{t('page.subtitle')}</p>
      </div>
      <div className="ulh-hero-decoration">
        <div className="ulh-blob ulh-blob-1"></div>
        <div className="ulh-blob ulh-blob-2"></div>
      </div>
    </section>
  );
};

export default UsefulLinksHero;
