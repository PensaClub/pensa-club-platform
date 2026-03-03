import { useTranslation } from 'react-i18next';
import { useUsefulLinksContext } from '../../contexts/UsefulLinksContext';
import { trackUsefulLinkView } from '../../Services/analyticsService';
import './usefulLinksCard.css';

const CATEGORY_COLORS = {
  general: '#2563eb',
  health: '#1B6D4D',
  finance: '#d4a017',
  government: '#2563eb',
  education: '#059669',
  entertainment: '#BB1D3D',
  technology: '#0ea5e9',
  social: '#7c3aed',
  transport: '#475569',
  communication: '#0891b2',
};

const getCategoryLabel = (category, t) => {
  const translated = t(`categories.${category}`, { defaultValue: '' });
  if (translated && translated !== `categories.${category}` && translated !== '') return translated;
  return category.charAt(0).toUpperCase() + category.slice(1);
};

const UsefulLinksCard = ({ link }) => {
  const { t, i18n } = useTranslation('useful-links');
  const { trackView } = useUsefulLinksContext();
  const lang = i18n.language;

  const getLocalizedField = (baseName) => {
    if (lang === 'en' && link[`${baseName}En`]) return link[`${baseName}En`];
    if (lang === 'de' && link[`${baseName}De`]) return link[`${baseName}De`];
    return link[baseName];
  };

  const title = getLocalizedField('title');
  const rawDescription = getLocalizedField('description');
  const description = rawDescription && rawDescription.length > 150
    ? rawDescription.slice(0, 150).trimEnd() + '...'
    : rawDescription;
  const categoryColor = CATEGORY_COLORS[link.category] || CATEGORY_COLORS.general;
  const categoryLabel = getCategoryLabel(link.category, t);

  const handleClick = () => {
    trackView(link.id);
    if (typeof trackUsefulLinkView === 'function') {
      trackUsefulLinkView(link.id, title);
    }
  };

  return (
    <article className="ulc-card" style={{ '--ulc-category-color': categoryColor }}>
      {link.imageUrl && (
        <div className="ulc-image-wrapper">
          <img src={link.imageUrl} alt={title} className="ulc-image" loading="lazy" />
          <div className="ulc-image-overlay"></div>
          <span className="ulc-category-badge" style={{ backgroundColor: categoryColor }}>
            {categoryLabel}
          </span>
        </div>
      )}

      {!link.imageUrl && (
        <div className="ulc-no-image-header" style={{ backgroundColor: `${categoryColor}10` }}>
          <span className="ulc-category-badge ulc-category-badge-inline" style={{ backgroundColor: categoryColor }}>
            {categoryLabel}
          </span>
        </div>
      )}

      <div className="ulc-content">
        <h3 className="ulc-title">{title}</h3>
        {description && <p className="ulc-description">{description}</p>}

        <div className="ulc-footer">
          <span className="ulc-views">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            {t('page.viewCount', { count: link.viewCount || 0 })}
          </span>

          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="ulc-cta"
            onClick={handleClick}
            style={{ '--ulc-cta-bg': categoryColor }}
          >
            {t('page.visitLink')}
            <svg className="ulc-cta-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17L17 7" />
              <path d="M7 7h10v10" />
            </svg>
          </a>
        </div>
      </div>
    </article>
  );
};

export default UsefulLinksCard;
