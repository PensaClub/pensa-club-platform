import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUserFriends,
    faSearch,
    faFilter,
    faPlus,
    faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import './membershipClubsEmptyState.css';

const MembershipClubsEmptyState = ({ 
    searchTerm, 
    filterBy, 
    totalClubs, 
    onDiscoverClubs, 
    onClearFilters 
}) => {
    const { t } = useTranslation();

    // Определи типа на празното състояние
    const getEmptyStateType = () => {
        if (totalClubs === 0) {
            return 'no-memberships';
        } else if (searchTerm) {
            return 'no-search-results';
        } else if (filterBy !== 'all') {
            return 'no-filter-results';
        }
        return 'no-memberships';
    };

    const emptyStateType = getEmptyStateType();

    const renderContent = () => {
        switch (emptyStateType) {
            case 'no-memberships':
                return (
                    <>
                        <div className="membershipclubsemptystate-icon-wrapper membershipclubsemptystate-icon-wrapper--primary">
                            <FontAwesomeIcon icon={faUserFriends} className="membershipclubsemptystate-icon" />
                        </div>
                        <h3 className="membershipclubsemptystate-title">
                            {t('membershipClubsEmptyState.noMemberships.title')}
                        </h3>
                        <p className="membershipclubsemptystate-description">
                            {t('membershipClubsEmptyState.noMemberships.description')}
                        </p>
                        <div className="membershipclubsemptystate-actions">
                            <button
                                className="membershipclubsemptystate-btn membershipclubsemptystate-btn--primary"
                                onClick={onDiscoverClubs}
                            >
                                <FontAwesomeIcon icon={faSearch} />
                                {t('membershipClubsEmptyState.noMemberships.discoverButton')}
                            </button>
                        </div>
                        <div className="membershipclubsemptystate-tips">
                            <h4>{t('membershipClubsEmptyState.noMemberships.tipsTitle')}</h4>
                            <ul>
                                <li>{t('membershipClubsEmptyState.noMemberships.tip1')}</li>
                                <li>{t('membershipClubsEmptyState.noMemberships.tip2')}</li>
                                <li>{t('membershipClubsEmptyState.noMemberships.tip3')}</li>
                            </ul>
                        </div>
                    </>
                );

            case 'no-search-results':
                return (
                    <>
                        <div className="membershipclubsemptystate-icon-wrapper membershipclubsemptystate-icon-wrapper--search">
                            <FontAwesomeIcon icon={faSearch} className="membershipclubsemptystate-icon" />
                        </div>
                        <h3 className="membershipclubsemptystate-title">
                            {t('membershipClubsEmptyState.noSearchResults.title')}
                        </h3>
                        <p className="membershipclubsemptystate-description">
                            {t('membershipClubsEmptyState.noSearchResults.description', { searchTerm })}
                        </p>
                        <div className="membershipclubsemptystate-search-term">
                            <strong>"{searchTerm}"</strong>
                        </div>
                        <div className="membershipclubsemptystate-actions">
                            <button
                                className="membershipclubsemptystate-btn membershipclubsemptystate-btn--secondary"
                                onClick={onClearFilters}
                            >
                                <FontAwesomeIcon icon={faTimes} />
                                {t('membershipClubsEmptyState.noSearchResults.clearButton')}
                            </button>
                            <button
                                className="membershipclubsemptystate-btn membershipclubsemptystate-btn--primary"
                                onClick={onDiscoverClubs}
                            >
                                <FontAwesomeIcon icon={faPlus} />
                                {t('membershipClubsEmptyState.noSearchResults.discoverButton')}
                            </button>
                        </div>
                    </>
                );

            case 'no-filter-results':
                return (
                    <>
                        <div className="membershipclubsemptystate-icon-wrapper membershipclubsemptystate-icon-wrapper--filter">
                            <FontAwesomeIcon icon={faFilter} className="membershipclubsemptystate-icon" />
                        </div>
                        <h3 className="membershipclubsemptystate-title">
                            {t('membershipClubsEmptyState.noFilterResults.title')}
                        </h3>
                        <p className="membershipclubsemptystate-description">
                            {t('membershipClubsEmptyState.noFilterResults.description')}
                        </p>
                        <div className="membershipclubsemptystate-filter-info">
                            <FontAwesomeIcon icon={faExclamationTriangle} />
                            <span>{t('membershipClubsEmptyState.noFilterResults.filterInfo')}</span>
                        </div>
                        <div className="membershipclubsemptystate-actions">
                            <button
                                className="membershipclubsemptystate-btn membershipclubsemptystate-btn--secondary"
                                onClick={onClearFilters}
                            >
                                <FontAwesomeIcon icon={faFilter} />
                                {t('membershipClubsEmptyState.noFilterResults.clearButton')}
                            </button>
                            <button
                                className="membershipclubsemptystate-btn membershipclubsemptystate-btn--primary"
                                onClick={onDiscoverClubs}
                            >
                                <FontAwesomeIcon icon={faPlus} />
                                {t('membershipClubsEmptyState.noFilterResults.discoverButton')}
                            </button>
                        </div>
                    </>
                );

            default:
                return null;
        }
    };

    return (
        <div className="membershipclubsemptystate-container">
            <div className="membershipclubsemptystate-content">
                {renderContent()}
            </div>
        </div>
    );
};

export default MembershipClubsEmptyState;