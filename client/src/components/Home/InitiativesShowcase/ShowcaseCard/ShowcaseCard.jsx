import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './showcaseCard.css';

export const ShowcaseCard = ({ item, type, index, isVisible }) => {
  const { t } = useTranslation();
  const cardDelay = index * 0.2;

  const getItemLink = (item, type) => {
    switch (type) {
      case 'initiatives':
        return `/initiatives/${item.slug}`;
      case 'projects':
        return item.link || `/projects/${item.slug}`;
      case 'stories':
        return `/stories/${item.slug}`;
      default:
        return '#';
    }
  };

  return (
    <div 
      className={`showcase-card ${isVisible ? 'visible' : ''}`}
      style={{ '--delay': `${cardDelay}s` }}
    >
      <div className="showcase-card-inner">
        {/* Card Header */}
        <div className="showcase-card-header">
          {item.mainImage?.src || item.image ? (
            <img 
              src={item.mainImage?.src || item.image} 
              alt={item.title}
              className="showcase-card-image"
            />
          ) : (
            <div className="showcase-card-placeholder">
              <div className={`placeholder-icon ${type}`}>
                {type === 'initiatives' && '🎯'}
                {type === 'projects' && '🚀'}
                {type === 'stories' && '📖'}
              </div>
            </div>
          )}
          
          <div className="showcase-card-overlay">
            <span className={`card-type-badge ${type}`}>
              {t(`home.showcase.${type.slice(0, -1)}`)}
            </span>
          </div>
        </div>

        {/* Card Content */}
        <div className="showcase-card-content">
          <h3 className="showcase-card-title">{item.title}</h3>
          
          <p className="showcase-card-description">
            {item.shortDescription || item.description || item.excerpt || t('home.showcase.noDescription')}
          </p>

          {/* Meta Info */}
          <div className="showcase-card-meta">
            {type === 'projects' && item.status && (
              <span className={`status-badge ${item.status}`}>
                {t(`projects.status.${item.status}`)}
              </span>
            )}
            
            {item.initiativeTitle && (
              <span className="initiative-badge">
                {item.initiativeTitle}
              </span>
            )}
          </div>

          {/* Action Button */}
          <Link 
            to={getItemLink(item, type)} 
            className="showcase-card-button"
          >
            <span>{t('home.showcase.learnMore')}</span>
            <svg className="button-arrow" viewBox="0 0 24 24" width="20" height="20">
              <path d="M12 4L10.59 5.41L16.17 11H4V13H16.17L10.59 18.59L12 20L20 12L12 4Z" fill="currentColor"/>
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};