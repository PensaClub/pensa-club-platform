import { useTranslation } from 'react-i18next';
import './showcaseHeader.css';

export const ShowcaseHeader = ({ isVisible }) => {
  const { t } = useTranslation('home');

  return (
    <div className={`showcase-header ${isVisible ? 'visible' : ''}`}>
      <h2 className="showcase-title">
        {t('home.showcase.title')}
      </h2>
      <p className="showcase-subtitle">
        {t('home.showcase.subtitle')}
      </p>
    </div>
  );
};