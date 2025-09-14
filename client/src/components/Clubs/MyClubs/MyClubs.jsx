import { useState, useEffect, useMemo, useCallback } from 'react';
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
        searchClubs,
        getClubsByCategory,
        getActiveClubs,
        deleteClub,
        transferClubOwnership
    } = useClubContext();

    // State management
    const [clubs, setClubs] = useState([]);
    const [allUserClubs, setAllUserClubs] = useState([]); // За статистики
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(''); // Debounced search
    const [filterBy, setFilterBy] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(6);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Pagination info from server
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    // Authentication check
    useEffect(() => {
        if (!isAuthentication) {
            setRedirectAfterLogin('/profile/clubs');
            navigate('/sign-up');
            return;
        }
    }, [isAuthentication, navigate, setRedirectAfterLogin]);

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500); // 500ms delay

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Зареждаме всички клубове веднъж за статистики
    useEffect(() => {
        const fetchAllUserClubs = async () => {
            if (!isAuthentication || !userEmail) return;

            try {
                const response = await getUserClubs(userEmail, 1, 6);
                let userClubs = [];
                
                if (Array.isArray(response)) {
                    userClubs = response;
                } else if (response && Array.isArray(response.clubs)) {
                    userClubs = response.clubs;
                }
                
                setAllUserClubs(userClubs);
            } catch (err) {
                console.error('Error fetching all user clubs for stats:', err);
                setAllUserClubs([]);
            }
        };

        fetchAllUserClubs();
    }, [getUserClubs, userEmail, isAuthentication]);

    // Reset to first page when filters change
    useEffect(() => {
        if (currentPage !== 1) {
            setCurrentPage(1);
        }
    }, [debouncedSearchTerm, filterBy, sortBy]);

    // Main data fetching effect
    useEffect(() => {
        const fetchClubs = async () => {
            if (!isAuthentication || !userEmail) return;

            try {
                setInitialLoading(true);
                setError(null);

                let response;
                let fetchedClubs = [];
                let pagination = null;
                let total = 0;

                // Determine which endpoint to use based on filters
                if (debouncedSearchTerm.trim()) {
                    // Use search endpoint
                    const searchParams = {
                        query: debouncedSearchTerm,
                        page: currentPage,
                        limit: itemsPerPage,
                        owner: userEmail // Filter by owner to get only user's clubs
                    };

                    response = await searchClubs(searchParams);
                } else if (filterBy === 'active') {
                    // Use active clubs endpoint, then filter by owner
                    response = await getActiveClubs(currentPage, itemsPerPage);
                    
                    // Filter only user's clubs from active clubs
                    if (response && Array.isArray(response.clubs)) {
                        response.clubs = response.clubs.filter(club => club.owner === userEmail);
                    } else if (Array.isArray(response)) {
                        response = response.filter(club => club.owner === userEmail);
                    }
                } else if (['general', 'cultural', 'traditional', 'social', 'sports'].includes(filterBy)) {
                    // Use category endpoint, then filter by owner
                    response = await getClubsByCategory(filterBy, currentPage, itemsPerPage);
                    
                    // Filter only user's clubs from category clubs
                    if (response && Array.isArray(response.clubs)) {
                        response.clubs = response.clubs.filter(club => club.owner === userEmail);
                    } else if (Array.isArray(response)) {
                        response = response.filter(club => club.owner === userEmail);
                    }
                } else {
                    // Default: get user clubs with status filter if needed
                    response = await getUserClubs(userEmail, currentPage, itemsPerPage);
                    
                    // Apply client-side status filtering if needed
                    if (filterBy !== 'all' && response) {
                        let clubsToFilter = [];
                        
                        if (Array.isArray(response)) {
                            clubsToFilter = response;
                        } else if (response && Array.isArray(response.clubs)) {
                            clubsToFilter = response.clubs;
                        }

                        const filteredClubs = clubsToFilter.filter(club => {
                            switch (filterBy) {
                                case 'inactive':
                                    return club.status === 'inactive';
                                case 'draft':
                                    return club.status === 'draft';
                                case 'verified':
                                    return club.metadata?.isVerified === true;
                                case 'unverified':
                                    return club.metadata?.isVerified === false || club.metadata?.isVerified == null;
                                default:
                                    return true;
                            }
                        });

                        if (Array.isArray(response)) {
                            response = filteredClubs;
                        } else {
                            response.clubs = filteredClubs;
                            response.total = filteredClubs.length;
                        }
                    }
                }

                // Process response
                if (Array.isArray(response)) {
                    fetchedClubs = response;
                    total = response.length;
                } else if (response && Array.isArray(response.clubs)) {
                    fetchedClubs = response.clubs;
                    pagination = response.pagination;
                    total = response.total || response.pagination?.totalItems || fetchedClubs.length;
                } else {
                    console.warn('Unexpected response format:', response);
                    fetchedClubs = [];
                }

                // Apply sorting if not default
                if (sortBy !== 'newest') {
                    fetchedClubs.sort((a, b) => {
                        switch (sortBy) {
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
                }

                setClubs(fetchedClubs);
                setTotalItems(total);
                setTotalPages(pagination?.totalPages || Math.ceil(total / itemsPerPage));

            } catch (err) {
                console.error('Error fetching clubs:', err);
                setError(err.message || 'Failed to fetch clubs');
                setClubs([]);
            } finally {
                setInitialLoading(false);
            }
        };

        fetchClubs();
    }, [
        getUserClubs, 
        searchClubs, 
        getClubsByCategory, 
        getActiveClubs,
        userEmail, 
        isAuthentication, 
        currentPage, 
        itemsPerPage, 
        debouncedSearchTerm, 
        filterBy, 
        sortBy
    ]);

    // Calculate statistics from all user clubs
    const stats = useMemo(() => {
        if (!Array.isArray(allUserClubs)) {
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

        const total = allUserClubs.length;
        
        // Статистики по статус
        const active = allUserClubs.filter(club => club.status === 'active').length;
        const inactive = allUserClubs.filter(club => club.status === 'inactive').length;
        const draft = allUserClubs.filter(club => club.status === 'draft').length;
        const suspended = allUserClubs.filter(club => club.status === 'suspended').length;
        const rejected = allUserClubs.filter(club => club.status === 'rejected').length;
        
        // Статистики по верификация
        const verified = allUserClubs.filter(club => club.metadata?.isVerified === true).length;
        const unverified = allUserClubs.filter(club => 
            club.metadata?.isVerified === false || 
            club.metadata?.isVerified == null
        ).length;
        
        // Членове
        const totalMembers = allUserClubs.reduce((sum, club) =>
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
            unverified,
            totalMembers,
            avgMembers
        };
    }, [allUserClubs]);

    // Handle manual search (when search button is clicked)
    const handleManualSearch = useCallback(() => {
        setDebouncedSearchTerm(searchTerm);
        if (currentPage !== 1) {
            setCurrentPage(1);
        }
    }, [searchTerm, currentPage]);

    // Handle page change
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleCreateNew = () => {
        navigate('/profile/club-create');
    };
    
    const handleDeleteClub = async (club) => {
        try {
            const success = await deleteClub(club.id || club.slug);
            if (success) {
                // Remove from current view
                setClubs(prevClubs => prevClubs.filter(c => c.id !== club.id));
                // Remove from all clubs for stats
                setAllUserClubs(prevClubs => prevClubs.filter(c => c.id !== club.id));
            }
        } catch (error) {
            console.error('Error deleting club:', error);
        }
    };

    const handleTransferOwnership = async (club, newOwnerEmail) => {
        try {
            const success = await transferClubOwnership(club.id || club.slug, newOwnerEmail);
            if (success) {
                // Remove from current view
                setClubs(prevClubs => prevClubs.filter(c => c.id !== club.id));
                // Remove from all clubs for stats
                setAllUserClubs(prevClubs => prevClubs.filter(c => c.id !== club.id));
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

    // Show loading state
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
                    onSearch={handleManualSearch}
                    placeholder="Search your clubs by name, description, location..."
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
                            { value: 'verified', label: 'Verified' },
                            { value: 'unverified', label: 'Unverified' },
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
                {clubs.length > 0 ? (
                    <>
                        <div className="myclubs-grid">
                            {clubs.map((club) => (
                                <MyClubsCard
                                    key={club.id}
                                    club={club}
                                    onView={() => handleClubClick(club)}
                                    onEdit={() => handleEditClub(club)}
                                    onDelete={() => handleDeleteClub(club)}
                                    onTransferOwnership={handleTransferOwnership}
                                    isOwner={true}
                                />
                            ))}
                        </div>

                        {/* Enhanced Pagination */}
                        {totalPages > 1 && (
                            <div className="myclubs-pagination">
                                <button
                                    className="myclubs-pagination-btn"
                                    onClick={() => handlePageChange(1)}
                                    disabled={currentPage === 1}
                                    title="First Page"
                                >
                                    ⟪
                                </button>
                                
                                <button
                                    className="myclubs-pagination-btn"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </button>
                                
                                <div className="myclubs-pagination-info">
                                    <span>
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <div className="myclubs-pagination-details">
                                        Showing {clubs.length} of {totalItems} clubs
                                    </div>
                                </div>
                                
                                <button
                                    className="myclubs-pagination-btn"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                </button>
                                
                                <button
                                    className="myclubs-pagination-btn"
                                    onClick={() => handlePageChange(totalPages)}
                                    disabled={currentPage === totalPages}
                                    title="Last Page"
                                >
                                    ⟫
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <MyClubsEmptyState
                        searchTerm={debouncedSearchTerm}
                        filterBy={filterBy}
                        totalClubs={allUserClubs.length}
                        onCreateNew={handleCreateNew}
                        onClearFilters={() => {
                            setSearchTerm('');
                            setDebouncedSearchTerm('');
                            setFilterBy('all');
                            setSortBy('newest');
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default MyClubs;