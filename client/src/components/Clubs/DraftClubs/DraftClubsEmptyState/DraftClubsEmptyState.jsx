import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faFileAlt,
    faSearch,
    faPlus,
    faFilter,
    faTimes,
    faLightbulb,
    faArrowRight,
    faPencilAlt,
    faRocket
} from '@fortawesome/free-solid-svg-icons';
import './draftClubsEmptyState.css';

const DraftClubsEmptyState = ({ 
    searchTerm, 
    filterBy, 
    totalDrafts, 
    onCreateNew, 
    onClearFilters 
}) => {
    const { t } = useTranslation('clubs');

    // Determine which empty state to show
    const isFiltered = searchTerm || (filterBy && filterBy !== 'all');
    const hasNoDrafts = totalDrafts === 0;

    if (hasNoDrafts) {
        // No drafts at all - first time user
        return (
            <div className="draftclubsemptystate-container">
                <div className="draftclubsemptystate-content draftclubsemptystate-no-drafts">
                    
                    {/* Illustration */}
                    <div className="draftclubsemptystate-illustration">
                        <div className="draftclubsemptystate-illustration-bg">
                            <FontAwesomeIcon icon={faFileAlt} className="draftclubsemptystate-main-icon" />
                            <div className="draftclubsemptystate-floating-icons">
                                <FontAwesomeIcon icon={faPencilAlt} className="draftclubsemptystate-float-1" />
                                <FontAwesomeIcon icon={faLightbulb} className="draftclubsemptystate-float-2" />
                                <FontAwesomeIcon icon={faRocket} className="draftclubsemptystate-float-3" />
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="draftclubsemptystate-text">
                        <h3 className="draftclubsemptystate-title">
                            {t('draftClubsEmptyState.noDrafts.title')}
                        </h3>
                        <p className="draftclubsemptystate-description">
                            {t('draftClubsEmptyState.noDrafts.description')}
                        </p>
                    </div>

                    {/* Benefits list */}
                    <div className="draftclubsemptystate-benefits">
                        <h4 className="draftclubsemptystate-benefits-title">
                            {t('draftClubsEmptyState.noDrafts.benefitsTitle')}
                        </h4>
                        <ul className="draftclubsemptystate-benefits-list">
                            <li>
                                <FontAwesomeIcon icon={faArrowRight} />
                                <span>{t('draftClubsEmptyState.noDrafts.benefit1')}</span>
                            </li>
                            <li>
                                <FontAwesomeIcon icon={faArrowRight} />
                                <span>{t('draftClubsEmptyState.noDrafts.benefit2')}</span>
                            </li>
                            <li>
                                <FontAwesomeIcon icon={faArrowRight} />
                                <span>{t('draftClubsEmptyState.noDrafts.benefit3')}</span>
                            </li>
                        </ul>
                    </div>

                    {/* Action */}
                    <div className="draftclubsemptystate-actions">
                        <button 
                            className="draftclubsemptystate-primary-btn"
                            onClick={onCreateNew}
                        >
                            <FontAwesomeIcon icon={faPlus} />
                            {t('draftClubsEmptyState.noDrafts.createFirst')}
                        </button>
                    </div>

                </div>
            </div>
        );
    }

    if (isFiltered) {
        // No results from search/filter
        return (
            <div className="draftclubsemptystate-container">
                <div className="draftclubsemptystate-content draftclubsemptystate-no-results">
                    
                    {/* Search illustration */}
                    <div className="draftclubsemptystate-illustration">
                        <div className="draftclubsemptystate-search-bg">
                            <FontAwesomeIcon icon={faSearch} className="draftclubsemptystate-search-icon" />
                            <div className="draftclubsemptystate-search-rings">
                                <div className="draftclubsemptystate-ring-1"></div>
                                <div className="draftclubsemptystate-ring-2"></div>
                                <div className="draftclubsemptystate-ring-3"></div>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="draftclubsemptystate-text">
                        <h3 className="draftclubsemptystate-title">
                            {t('draftClubsEmptyState.noResults.title')}
                        </h3>
                        <p className="draftclubsemptystate-description">
                            {searchTerm ? 
                                t('draftClubsEmptyState.noResults.searchDescription', { term: searchTerm }) :
                                t('draftClubsEmptyState.noResults.filterDescription')
                            }
                        </p>
                    </div>

                    {/* Current filters */}
                    <div className="draftclubsemptystate-filters">
                        <h4 className="draftclubsemptystate-filters-title">
                            {t('draftClubsEmptyState.noResults.currentFilters')}
                        </h4>
                        <div className="draftclubsemptystate-filter-tags">
                            {searchTerm && (
                                <div className="draftclubsemptystate-filter-tag">
                                    <FontAwesomeIcon icon={faSearch} />
                                    <span>"{searchTerm}"</span>
                                </div>
                            )}
                            {filterBy && filterBy !== 'all' && (
                                <div className="draftclubsemptystate-filter-tag">
                                    <FontAwesomeIcon icon={faFilter} />
                                    <span>{t(`draftClubs.filters.${filterBy}`)}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Suggestions */}
                    <div className="draftclubsemptystate-suggestions">
                        <h4 className="draftclubsemptystate-suggestions-title">
                            {t('draftClubsEmptyState.noResults.suggestionsTitle')}
                        </h4>
                        <ul className="draftclubsemptystate-suggestions-list">
                            <li>{t('draftClubsEmptyState.noResults.suggestion1')}</li>
                            <li>{t('draftClubsEmptyState.noResults.suggestion2')}</li>
                            <li>{t('draftClubsEmptyState.noResults.suggestion3')}</li>
                        </ul>
                    </div>

                    {/* Actions */}
                    <div className="draftclubsemptystate-actions">
                        <button 
                            className="draftclubsemptystate-secondary-btn"
                            onClick={onClearFilters}
                        >
                            <FontAwesomeIcon icon={faTimes} />
                            {t('draftClubsEmptyState.noResults.clearFilters')}
                        </button>
                        <button 
                            className="draftclubsemptystate-primary-btn"
                            onClick={onCreateNew}
                        >
                            <FontAwesomeIcon icon={faPlus} />
                            {t('draftClubsEmptyState.noResults.createNew')}
                        </button>
                    </div>

                </div>
            </div>
        );
    }

    // Fallback - shouldn't happen but just in case
    return null;
};

export default DraftClubsEmptyState;