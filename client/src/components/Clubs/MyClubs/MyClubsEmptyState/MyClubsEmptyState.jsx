import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faSearch,
  faUsers,
  faExclamationCircle,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import './myClubsEmptyState.css';

const MyClubsEmptyState = ({ 
  searchTerm, 
  filterBy, 
  totalClubs, 
  onCreateNew, 
  onClearFilters 
}) => {
  const { t } = useTranslation();

  // Determine which empty state to show
  const hasFiltersApplied = searchTerm.trim() || filterBy !== 'all';
  const hasNoClubsAtAll = totalClubs === 0;

  if (hasNoClubsAtAll) {
    // User has no clubs created yet
    return (
      <div className="myclunsempty-container">
        <div className="myclunsempty-content">
          <div className="myclunsempty-icon-wrapper myclunsempty-icon-wrapper--primary">
            <FontAwesomeIcon icon={faUsers} className="myclunsempty-icon" />
          </div>
          
          <div className="myclunsempty-text">
            <h3 className="myclunsempty-title">
              {t('profile.clubs.empty.noClubs.title')}
            </h3>
            <p className="myclunsempty-description">
              {t('profile.clubs.empty.noClubs.description')}
            </p>
          </div>

          <div className="myclunsempty-actions">
            <button 
              className="myclunsempty-btn myclunsempty-btn--primary"
              onClick={onCreateNew}
            >
              <FontAwesomeIcon icon={faPlus} />
              {t('profile.clubs.empty.noClubs.createButton')}
            </button>
          </div>

          <div className="myclunsempty-features">
            <div className="myclunsempty-feature">
              <div className="myclunsempty-feature-icon">
                <FontAwesomeIcon icon={faUsers} />
              </div>
              <div className="myclunsempty-feature-text">
                <h4>{t('profile.clubs.empty.features.community.title')}</h4>
                <p>{t('profile.clubs.empty.features.community.description')}</p>
              </div>
            </div>
            
            <div className="myclunsempty-feature">
              <div className="myclunsempty-feature-icon">
                <FontAwesomeIcon icon={faSearch} />
              </div>
              <div className="myclunsempty-feature-text">
                <h4>{t('profile.clubs.empty.features.visibility.title')}</h4>
                <p>{t('profile.clubs.empty.features.visibility.description')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (hasFiltersApplied) {
    // No results for current search/filter
    return (
      <div className="myclunsempty-container">
        <div className="myclunsempty-content">
          <div className="myclunsempty-icon-wrapper myclunsempty-icon-wrapper--secondary">
            <FontAwesomeIcon icon={faExclamationCircle} className="myclunsempty-icon" />
          </div>
          
          <div className="myclunsempty-text">
            <h3 className="myclunsempty-title">
              {t('profile.clubs.empty.noResults.title')}
            </h3>
            <p className="myclunsempty-description">
              {searchTerm 
                ? t('profile.clubs.empty.noResults.searchDescription', { term: searchTerm })
                : t('profile.clubs.empty.noResults.filterDescription')
              }
            </p>
          </div>

          <div className="myclunsempty-current-filters">
            {searchTerm && (
              <div className="myclunsempty-filter-tag">
                <FontAwesomeIcon icon={faSearch} />
                <span>"{searchTerm}"</span>
              </div>
            )}
            {filterBy !== 'all' && (
              <div className="myclunsempty-filter-tag">
                <FontAwesomeIcon icon={faUsers} />
                <span>{t(`profile.clubs.filters.${filterBy}`)}</span>
              </div>
            )}
          </div>

          <div className="myclunsempty-actions">
            <button 
              className="myclunsempty-btn myclunsempty-btn--secondary"
              onClick={onClearFilters}
            >
              <FontAwesomeIcon icon={faTimes} />
              {t('profile.clubs.empty.noResults.clearFilters')}
            </button>
            
            <button 
              className="myclunsempty-btn myclunsempty-btn--primary"
              onClick={onCreateNew}
            >
              <FontAwesomeIcon icon={faPlus} />
              {t('profile.clubs.empty.noResults.createButton')}
            </button>
          </div>

          <div className="myclunsempty-suggestions">
            <h4>{t('profile.clubs.empty.suggestions.title')}</h4>
            <ul className="myclunsempty-suggestions-list">
              <li>{t('profile.clubs.empty.suggestions.clearSearch')}</li>
              <li>{t('profile.clubs.empty.suggestions.tryDifferentFilter')}</li>
              <li>{t('profile.clubs.empty.suggestions.checkSpelling')}</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Fallback empty state
  return (
    <div className="myclunsempty-container">
      <div className="myclunsempty-content">
        <div className="myclunsempty-icon-wrapper">
          <FontAwesomeIcon icon={faUsers} className="myclunsempty-icon" />
        </div>
        
        <div className="myclunsempty-text">
          <h3 className="myclunsempty-title">
            {t('profile.clubs.empty.default.title')}
          </h3>
          <p className="myclunsempty-description">
            {t('profile.clubs.empty.default.description')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MyClubsEmptyState;