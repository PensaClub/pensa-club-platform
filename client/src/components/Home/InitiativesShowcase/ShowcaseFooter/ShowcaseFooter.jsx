import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './showcaseFooter.css';

export const ShowcaseFooter = ({ isVisible }) => {
  const { t } = useTranslation();

  return (
    <div className={`showcase-footer ${isVisible ? 'visible' : ''}`}>
      <Link to="/initiatives" className="showcase-view-all">
        <span>{t('home.showcase.viewAll')}</span>
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path d="M12 4L10.59 5.41L16.17 11H4V13H16.17L10.59 18.59L12 20L20 12L12 4Z" fill="currentColor"/>
        </svg>
      </Link>
    </div>
  );
};