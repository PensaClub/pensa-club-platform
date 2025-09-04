// В MyClubs.jsx - добави функцията и prop-а

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPlus,
    faSpinner,
    faUsers
} from '@fortawesome/free-solid-svg-icons';

import './myClubs.css';
import { useAuthContext } from '../../contexts/UserContext';
import { useClubContext } from '../../contexts/ClubContext';

// Импорти на подкомпонентите
import SearchMyClubsBar from './SearchBar/SearchMyClubsBar';
import MyClubsFilterDropdown from './MyClubsFilterDropdown/MyClubsFilterDropdown';
import MyClubsSortDropdown from './MyClubsSortDropdown/MyClubsSortDropdown';
import MyClubsCard from './ClubCard/MyClubsCard';
import MyClubsEmptyState from './MyClubsEmptyState/MyClubsEmptyState';
import StatsOverview from './StatsOverview/StatsOverview';

const MyClubs = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const {
        isAuthentication,
        userEmail,
        setRedirectAfterLogin
    } = useAuthContext();

    const { 
        getUserClubs,
        deleteClub,
        transferClubOwnership // ДОБАВЕНО
    } = useClubContext();

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
            setRedirectAfterLogin('/profile/clubs');
            navigate('/sign-up');
            return;
        }
    }, [isAuthentication, navigate, setRedirectAfterLogin]);

    // Fetch user clubs
    useEffect(() => {
        const fetchUserClubs = async () => {
            if (!isAuthentication || !userEmail) return;

            try {
                setInitialLoading(true);
                setError(null);

                const userClubs = await getUserClubs(userEmail);

                if (Array.isArray(userClubs)) {
                    setClubs(userClubs);
                } else {
                    console.warn('getUserClubs did not return an array:', userClubs);
                    setClubs([]);
                }
            } catch (err) {
                console.error('Error fetching user clubs:', err);
                setError(err.message || 'Failed to fetch clubs');
                setClubs([]);
            } finally {
                setInitialLoading(false);
            }
        };

        fetchUserClubs();
    }, [getUserClubs, userEmail, isAuthentication]);

    // Filter and search clubs (останалия код същия...)
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
                    case 'draft':
                        return club.status === 'draft';
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
                    default:
                        return true;
                }
            });
        }

        // Apply sorting
        const sorted = [...filtered].sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.metadata?.createdAt || b.createdAt || 0) -
                        new Date(a.metadata?.createdAt || a.createdAt || 0);
                case 'oldest':
                    return new Date(a.metadata?.createdAt || a.createdAt || 0) -
                        new Date(b.metadata?.createdAt || b.createdAt || 0);
                case 'name':
                    return (a.name || '').localeCompare(b.name || '');
                case 'members':
                    return (b.membership?.totalMembers || 0) - (a.membership?.totalMembers || 0);
                case 'location':
                    return (a.location?.city || '').localeCompare(b.location?.city || '');
                default:
                    return 0;
            }
        });

        return sorted;
    }, [clubs, searchTerm, filterBy, sortBy]);

    // Calculate statistics (останалия код същия...)
   const stats = useMemo(() => {
    if (!Array.isArray(clubs)) {
        return {
            total: 0,
            active: 0,
            inactive: 0,
            draft: 0,
            suspended: 0,
            rejected: 0,
            verified: 0,
            unverified: 0,
            totalMembers: 0,
            avgMembers: 0
        };
    }

    const total = clubs.length;
    
    // Статистики по статус
    const active = clubs.filter(club => club.status === 'active').length;
    const inactive = clubs.filter(club => club.status === 'inactive').length;
    const draft = clubs.filter(club => club.status === 'draft').length;
    const suspended = clubs.filter(club => club.status === 'suspended').length;
    const rejected = clubs.filter(club => club.status === 'rejected').length;
    
    // Статистики по верификация (ВАЖНО за "чакащи одобрение")
    const verified = clubs.filter(club => club.metadata?.isVerified === true).length;
    const unverified = clubs.filter(club => 
        club.metadata?.isVerified === false || 
        club.metadata?.isVerified == null
    ).length;
    
    // Членове
    const totalMembers = clubs.reduce((sum, club) =>
        sum + (club.membership?.totalMembers || 0), 0
    );
    const avgMembers = total > 0 ? Math.round(totalMembers / total) : 0;

    return {
        total,
        active,
        inactive,
        draft,
        suspended,
        rejected,
        verified,
        unverified, // Това са клубовете "чакащи одобрение"
        totalMembers,
        avgMembers
    };
}, [clubs]);

    const handleCreateNew = () => {
        navigate('/profile/club-create');
    };
    
    const handleDeleteClub = async (club) => {
        try {
            const success = await deleteClub(club.id || club.slug);
            if (success) {
                setClubs(prevClubs => prevClubs.filter(c => c.id !== club.id));
            }
        } catch (error) {
            console.error('Error deleting club:', error);
        }
    };

    // ДОБАВЕНА ФУНКЦИЯ ЗА ПРЕХВЪРЛЯНЕ НА СОБСТВЕНОСТ
    const handleTransferOwnership = async (club, newOwnerEmail) => {
        try {
            const success = await transferClubOwnership(club.id || club.slug, newOwnerEmail);
            if (success) {
                // Премахни клуба от списъка тъй като вече не е твой
                setClubs(prevClubs => prevClubs.filter(c => c.id !== club.id));
            }
        } catch (error) {
            console.error('Error transferring ownership:', error);
        }
    };
    
    const handleClubClick = (club) => {
        navigate(`/clubs/${club.slug}`);
    };

    const handleEditClub = (club) => {
        navigate(`/profile/club-create?editId=${club.id}&mode=edit`);
    };

    // Show loading state (останалия код същия...)
    if (initialLoading) {
        return (
            <div className="myclubs-loading">
                <FontAwesomeIcon icon={faSpinner} spin className="myclubs-loading-icon" />
                <p>Loading clubs...</p>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="myclubs-error">
                <div className="myclubs-error-content">
                    <h3>Error Loading Clubs</h3>
                    <p>{error}</p>
                    <button
                        className="myclubs-retry-button"
                        onClick={() => window.location.reload()}
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="myclubs-container">
            {/* Header */}
            <div className="myclubs-header">
                <div className="myclubs-header-content">
                    <div className="myclubs-header-text">
                        <h1 className="myclubs-page-title">
                            <FontAwesomeIcon icon={faUsers} className="myclubs-title-icon" />
                            My Clubs
                        </h1>
                        <p className="myclubs-page-subtitle">
                            Manage and view all clubs you have created
                        </p>
                    </div>

                    <button
                        className="myclubs-create-btn"
                        onClick={handleCreateNew}
                    >
                        <FontAwesomeIcon icon={faPlus} />
                        Create New Club
                    </button>
                </div>

                <StatsOverview stats={stats} />
            </div>

            {/* Search and Filters */}
            <div className="myclubs-controls">
                <SearchMyClubsBar
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder="Search clubs by name, description, location..."
                />

                <div className="myclubs-controls-right">
                    <MyClubsFilterDropdown
                        value={filterBy}
                        onChange={setFilterBy}
                        options={[
                            { value: 'all', label: 'All Clubs' },
                            { value: 'active', label: 'Active' },
                            { value: 'inactive', label: 'Inactive' },
                            { value: 'draft', label: 'Draft' },
                            { value: 'general', label: 'General' },
                            { value: 'cultural', label: 'Cultural' },
                            { value: 'traditional', label: 'Traditional' },
                            { value: 'social', label: 'Social' },
                            { value: 'sports', label: 'Sports' }
                        ]}
                    />

                    <MyClubsSortDropdown
                        value={sortBy}
                        onChange={setSortBy}
                        options={[
                            { value: 'newest', label: 'Newest First' },
                            { value: 'oldest', label: 'Oldest First' },
                            { value: 'name', label: 'Name A-Z' },
                            { value: 'members', label: 'Most Members' },
                            { value: 'location', label: 'Location' }
                        ]}
                    />
                </div>
            </div>

            {/* Clubs Grid */}
            <div className="myclubs-content">
                {filteredAndSortedClubs.length > 0 ? (
                    <div className="myclubs-grid">
                        {filteredAndSortedClubs.map((club) => (
                            <MyClubsCard
                                key={club.id}
                                club={club}
                                onView={() => handleClubClick(club)}
                                onEdit={() => handleEditClub(club)}
                                onDelete={() => handleDeleteClub(club)}
                                onTransferOwnership={handleTransferOwnership} // ДОБАВЕНО
                                isOwner={true}
                            />
                        ))}
                    </div>
                ) : (
                    <MyClubsEmptyState
                        searchTerm={searchTerm}
                        filterBy={filterBy}
                        totalClubs={clubs.length}
                        onCreateNew={handleCreateNew}
                        onClearFilters={() => {
                            setSearchTerm('');
                            setFilterBy('all');
                        }}
                    />
                )}
            </div>

            {/* Results info */}
            {filteredAndSortedClubs.length > 0 && (
                <div className="myclubs-results-info">
                    <p>
                        Showing {filteredAndSortedClubs.length} of {clubs.length} clubs
                    </p>
                </div>
            )}
        </div>
    );
};

export default MyClubs;