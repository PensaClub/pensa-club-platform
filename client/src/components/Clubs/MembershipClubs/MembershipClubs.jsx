import { useState, useEffect, useMemo } from 'react';
import { useLocalizedNavigate } from '../../../hooks/useLocalizedNavigate';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUserFriends,
    faSpinner,
    faSearch
} from '@fortawesome/free-solid-svg-icons';

import './membershipClubs.css';
import { useAuthContext } from '../../contexts/UserContext';
import { useClubContext } from '../../contexts/ClubContext';

// Импорти на подкомпонентите
import SearchMembershipClubsBar from './SearchMembershipClubsBar/SearchMembershipClubsBar';
import MembershipClubsFilterDropdown from './MembershipClubsFilterDropdown/MembershipClubsFilterDropdown';
import MembershipClubsSortDropdown from './MembershipClubsSortDropdown/MembershipClubsSortDropdown';
import MembershipClubsCard from './MembershipClubsCard/MembershipClubsCard';
import MembershipClubsEmptyState from './MembershipClubsEmptyState/MembershipClubsEmptyState';
import MembershipStatsOverview from './MembershipStatsOverview/MembershipStatsOverview';

const MembershipClubs = () => {
    const { t } = useTranslation('clubs');
    const navigate = useLocalizedNavigate();
    const {
        isAuthentication,
        userEmail,
        setRedirectAfterLogin
    } = useAuthContext();

    const { getUserMembershipClubs } = useClubContext();

    // State management
    const [clubs, setClubs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterBy, setFilterBy] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState(null);

    // Authentication check
    useEffect(() => {
        if (!isAuthentication) {
            setRedirectAfterLogin('/profile/memberships');
            navigate('/sign-up?view=login');
            return;
        }
    }, [isAuthentication, navigate, setRedirectAfterLogin]);

    // Fetch user membership clubs
    useEffect(() => {
        const fetchMembershipClubs = async () => {
            if (!isAuthentication || !userEmail) return;

            try {
                setInitialLoading(true);
                setError(null);

                const membershipClubs = await getUserMembershipClubs(userEmail);

                if (Array.isArray(membershipClubs)) {
                    setClubs(membershipClubs);
                } else {
                    console.warn('getUserMembershipClubs did not return an array:', membershipClubs);
                    setClubs([]);
                }
            } catch (err) {
                console.error('Error fetching membership clubs:', err);
                setError(err.message || 'Failed to fetch membership clubs');
                setClubs([]);
            } finally {
                setInitialLoading(false);
            }
        };

        fetchMembershipClubs();
    }, [getUserMembershipClubs, userEmail, isAuthentication]);

    // Filter and search clubs
    const filteredAndSortedClubs = useMemo(() => {
        if (!Array.isArray(clubs)) {
            return [];
        }

        let filtered = clubs;

        // Apply search filter
        if (searchTerm.trim()) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(club =>
                club.name?.toLowerCase().includes(searchLower) ||
                club.shortDescription?.toLowerCase().includes(searchLower) ||
                club.location?.city?.toLowerCase().includes(searchLower) ||
                club.category?.toLowerCase().includes(searchLower)
            );
        }

        // Apply category filter
        if (filterBy !== 'all') {
            filtered = filtered.filter(club => {
                switch (filterBy) {
                    case 'active':
                        return club.status === 'active';
                    case 'inactive':
                        return club.status === 'inactive';
                    case 'general':
                        return club.category === 'general';
                    case 'cultural':
                        return club.category === 'cultural';
                    case 'traditional':
                        return club.category === 'traditional';
                    case 'social':
                        return club.category === 'social';
                    case 'sports':
                        return club.category === 'sports';
                    case 'recent':
                        const thirtyDaysAgo = new Date();
                        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                        return new Date(club.memberSince || 0) > thirtyDaysAgo;
                    default:
                        return true;
                }
            });
        }

        // Apply sorting
        const sorted = [...filtered].sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.memberSince || 0) - new Date(a.memberSince || 0);
                case 'oldest':
                    return new Date(a.memberSince || 0) - new Date(b.memberSince || 0);
                case 'name':
                    return (a.name || '').localeCompare(b.name || '');
                case 'members':
                    return (b.membership?.totalMembers || 0) - (a.membership?.totalMembers || 0);
                case 'location':
                    return (a.location?.city || '').localeCompare(b.location?.city || '');
                case 'activity':
                    const aEvents = (a.activities?.events?.length || 0) + (a.activities?.regular?.length || 0);
                    const bEvents = (b.activities?.events?.length || 0) + (b.activities?.regular?.length || 0);
                    return bEvents - aEvents;
                default:
                    return 0;
            }
        });

        return sorted;
    }, [clubs, searchTerm, filterBy, sortBy]);

    // Calculate statistics
    const stats = useMemo(() => {
        if (!Array.isArray(clubs)) {
            return { total: 0, active: 0, recent: 0, avgSize: 0 };
        }

        const total = clubs.length;
        const active = clubs.filter(club => club.status === 'active').length;
        
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recent = clubs.filter(club => 
            new Date(club.memberSince || 0) > thirtyDaysAgo
        ).length;

        const totalMembers = clubs.reduce((sum, club) =>
            sum + (club.membership?.totalMembers || 0), 0
        );
        const avgSize = total > 0 ? Math.round(totalMembers / total) : 0;

        return { total, active, recent, avgSize };
    }, [clubs]);

    const handleClubClick = (club) => {
        navigate(`/clubs/${club.slug}`);
    };

    const handleDiscoverClubs = () => {
        navigate('/clubs');
    };

    // Show loading state
    if (initialLoading) {
        return (
            <div className="membershipclubs-loading">
                <FontAwesomeIcon icon={faSpinner} spin className="membershipclubs-loading-icon" />
                <p>{t('membershipClubs.loading')}</p>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="membershipclubs-error">
                <div className="membershipclubs-error-content">
                    <h3>{t('membershipClubs.errorTitle')}</h3>
                    <p>{error}</p>
                    <button
                        className="membershipclubs-retry-button"
                        onClick={() => window.location.reload()}
                    >
                        {t('membershipClubs.retry')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="membershipclubs-container">
            {/* Header */}
            <div className="membershipclubs-header">
                <div className="membershipclubs-header-content">
                    <div className="membershipclubs-header-text">
                        <h1 className="membershipclubs-page-title">
                            <FontAwesomeIcon icon={faUserFriends} className="membershipclubs-title-icon" />
                            {t('membershipClubs.title')}
                        </h1>
                        <p className="membershipclubs-page-subtitle">
                            {t('membershipClubs.subtitle')}
                        </p>
                    </div>

                    <button
                        className="membershipclubs-discover-btn"
                        onClick={handleDiscoverClubs}
                    >
                        <FontAwesomeIcon icon={faSearch} />
                        {t('membershipClubs.discoverClubs')}
                    </button>
                </div>

                <MembershipStatsOverview stats={stats} />
            </div>

            {/* Search and Filters */}
            <div className="membershipclubs-controls">
                <SearchMembershipClubsBar
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder={t('membershipClubs.searchPlaceholder')}
                />

                <div className="membershipclubs-controls-right">
                    <MembershipClubsFilterDropdown
                        value={filterBy}
                        onChange={setFilterBy}
                        options={[
                            { value: 'all', label: t('membershipClubs.filters.all') },
                            { value: 'active', label: t('membershipClubs.filters.active') },
                            { value: 'inactive', label: t('membershipClubs.filters.inactive') },
                            { value: 'recent', label: t('membershipClubs.filters.recent') },
                            { value: 'general', label: t('membershipClubs.filters.general') },
                            { value: 'cultural', label: t('membershipClubs.filters.cultural') },
                            { value: 'traditional', label: t('membershipClubs.filters.traditional') },
                            { value: 'social', label: t('membershipClubs.filters.social') },
                            { value: 'sports', label: t('membershipClubs.filters.sports') }
                        ]}
                    />

                    <MembershipClubsSortDropdown
                        value={sortBy}
                        onChange={setSortBy}
                        options={[
                            { value: 'newest', label: t('membershipClubs.sorting.newest') },
                            { value: 'oldest', label: t('membershipClubs.sorting.oldest') },
                            { value: 'name', label: t('membershipClubs.sorting.name') },
                            { value: 'members', label: t('membershipClubs.sorting.members') },
                            { value: 'activity', label: t('membershipClubs.sorting.activity') },
                            { value: 'location', label: t('membershipClubs.sorting.location') }
                        ]}
                    />
                </div>
            </div>

            {/* Clubs Grid */}
            <div className="membershipclubs-content">
                {filteredAndSortedClubs.length > 0 ? (
                    <div className="membershipclubs-grid">
                        {filteredAndSortedClubs.map((club) => (
                            <MembershipClubsCard
                                key={club.id}
                                club={club}
                                onView={() => handleClubClick(club)}
                                isMember={true}
                            />
                        ))}
                    </div>
                ) : (
                    <MembershipClubsEmptyState
                        searchTerm={searchTerm}
                        filterBy={filterBy}
                        totalClubs={clubs.length}
                        onDiscoverClubs={handleDiscoverClubs}
                        onClearFilters={() => {
                            setSearchTerm('');
                            setFilterBy('all');
                        }}
                    />
                )}
            </div>

            {/* Results info */}
            {filteredAndSortedClubs.length > 0 && (
                <div className="membershipclubs-results-info">
                    <p>
                        {t('membershipClubs.resultsInfo', {
                            showing: filteredAndSortedClubs.length,
                            total: clubs.length
                        })}
                    </p>
                </div>
            )}
        </div>
    );
};

export default MembershipClubs;