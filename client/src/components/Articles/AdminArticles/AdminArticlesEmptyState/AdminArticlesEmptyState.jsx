import { useTranslation } from 'react-i18next';
import { LocalizedLink } from '../../../LocalizedLink/LocalizedLink';
import './adminArticlesEmptyState.css';

/**
 * Empty state for the admin articles list.
 * - When `hasActiveFilters` is true → CTA clears filters (button).
 * - Otherwise                       → CTA links to /profile/article-create.
 *
 * Inline SVG illustration; no external assets per the brief.
 */
const AdminArticlesEmptyState = ({ hasActiveFilters = false, onClearFilters }) => {
  const { t } = useTranslation('adminArticles');

  return (
    <div className="aaes-wrap">
      <svg
        className="aaes-illustration"
        width="220"
        height="180"
        viewBox="0 0 220 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <ellipse cx="110" cy="160" rx="90" ry="10" fill="#fde7d8" />
        <rect x="40" y="30" width="120" height="130" rx="10" fill="#ffffff" stroke="#E26020" strokeWidth="2" />
        <rect x="55" y="50" width="80" height="8" rx="4" fill="#fbcfb0" />
        <rect x="55" y="68" width="100" height="6" rx="3" fill="#f6e5d6" />
        <rect x="55" y="82" width="90" height="6" rx="3" fill="#f6e5d6" />
        <rect x="55" y="96" width="70" height="6" rx="3" fill="#f6e5d6" />
        <circle cx="170" cy="60" r="22" fill="#E26020" />
        <path
          d="M163 60h14M170 53v14"
          stroke="#ffffff"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>

      <h2 className="aaes-title">{t('empty.title')}</h2>
      <p className="aaes-subtitle">
        {hasActiveFilters ? t('empty.subtitle') : t('empty.subtitleNoFilters')}
      </p>

      {hasActiveFilters ? (
        <button type="button" className="aaes-cta" onClick={onClearFilters}>
          {t('empty.ctaWithFilters')}
        </button>
      ) : (
        <LocalizedLink to="/profile/article-create" className="aaes-cta">
          {t('empty.cta')}
        </LocalizedLink>
      )}
    </div>
  );
};

export default AdminArticlesEmptyState;
