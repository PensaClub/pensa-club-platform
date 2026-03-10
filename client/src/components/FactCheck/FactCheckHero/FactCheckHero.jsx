import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './factCheckHero.css';

const FactCheckHero = ({ stats, onSearch }) => {
  const { t } = useTranslation('factcheck');
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(searchValue);
  };

  const scrollToSignalForm = () => {
    document.getElementById('signal-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="fch">
      <div className="fch-bg">
        <div className="fch-bg-pattern"></div>
        <div className="fch-bg-glow fch-bg-glow--1"></div>
        <div className="fch-bg-glow fch-bg-glow--2"></div>
      </div>

      <div className="fch-container">
        {/* Logos */}
        <div className="fch-logos">
          <img src="/images/partners/BFFW-20Logo-Prink2.svg" alt="Bulgarian Fund for Women" className="fch-logo" />
          <span className="fch-logos-divider"></span>
          <img src="/images/homePage/logo.png" alt="Pensa Club" className="fch-logo" />
        </div>

        <span className="fch-program-label">{t('hero.programLabel')}</span>

        <h1 className="fch-title">{t('hero.title')}</h1>
        <p className="fch-subtitle">{t('hero.subtitle')}</p>
        <p className="fch-description">{t('hero.description')}</p>

        {/* Search */}
        <form className="fch-search" onSubmit={handleSearch}>
          <svg className="fch-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            className="fch-search-input"
            placeholder={t('hero.searchPlaceholder')}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
          <button type="submit" className="fch-search-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </form>

        {/* Actions */}
        <div className="fch-actions">
          <button className="fch-btn fch-btn--signal" onClick={scrollToSignalForm}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
            {t('hero.submitSignal')}
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="fch-stats">
            <div className="fch-stat">
              <span className="fch-stat-number">{stats.totalModules || 0}</span>
              <span className="fch-stat-label">{t('hero.statChecked')}</span>
            </div>
            <div className="fch-stat-divider"></div>
            <div className="fch-stat">
              <span className="fch-stat-number">{stats.totalSignals || 0}</span>
              <span className="fch-stat-label">{t('hero.statResolved')}</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default FactCheckHero;
