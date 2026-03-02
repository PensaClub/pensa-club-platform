import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faShieldAlt,
    faSpinner,
    faFilter,
    faSort,
    faSearch,
    faCheckCircle,
    faTimesCircle,
    faCog
} from '@fortawesome/free-solid-svg-icons';

import './clubsAdmin.css';
import { useAuthContext } from '../../contexts/UserContext';
import { useClubContext } from '../../contexts/ClubContext';

import AdminClubFilters from './AdminClubFilters/AdminClubFilters';
import AdminClubActions from './AdminClubActions/AdminClubActions';
import AdminClubCard from './AdminClubCard/AdminClubCard';
import AdminClubModal from './AdminClubModal/AdminClubModal';
import AdminStatsOverview from './AdminStatsOverview/AdminStatsOverview';
import AdminSearchBar from './AdminSearchBar/AdminSearchBar';

const ClubsAdmin = () => {
    const { t } = useTranslation('clubs');
    const { isAdmin, isAuthentication, isModerator } = useAuthContext();

    const {
        getAllClubs,
        toggleClubStatus,
        verifyClub,
        approveClub,
        rejectClub,
        bulkUpdateClubs,
        bulkApproveClubs,
        bulkDeleteClubs,
        isLoading
    } = useClubContext();

    // State management
    const [clubs, setClubs] = useState([]);
    const [allClubs, setAllClubs] = useState([]); // За client-side филтриране
    const [selectedClubs, setSelectedClubs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterBy, setFilterBy] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(12);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showBulkActions, setShowBulkActions] = useState(false);

    // Pagination info from server
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [isServerSidePagination, setIsServerSidePagination] = useState(true);

    // Modal states
    const [modalState, setModalState] = useState({
        isOpen: false,
        type: null,
        club: null,
        data: null
    });

    // Check admin access
    useEffect(() => {
        if (!isAuthentication || (!isAdmin && !isModerator)) {
            setError(t('clubsAdmin.errors.noAccess'));
            return;
        }
    }, [isAuthentication, isAdmin, isModerator, t]);

    // Determine if we need client-side filtering
    const needsClientSideFiltering = useMemo(() => {
        return searchTerm.trim() !== '' || filterBy !== 'all' || sortBy !== 'newest';
    }, [searchTerm, filterBy, sortBy]);

    // Fetch clubs based on pagination strategy
    useEffect(() => {
        const fetchClubs = async () => {
            if (!isAuthentication || (!isAdmin && !isModerator)) return;

            try {
                setInitialLoading(true);
                setError(null);

                if (needsClientSideFiltering) {
                    // Client-side filtering: load all clubs
                    setIsServerSidePagination(false);
                    const response = await getAllClubs(true, 1, 1000);
                    const fetchedClubs = response?.clubs || response || [];
                    setAllClubs(Array.isArray(fetchedClubs) ? fetchedClubs : []);
                    setTotalItems(fetchedClubs.length);
                } else {
                    // Server-side pagination: load current page only
                    setIsServerSidePagination(true);
                    const response = await getAllClubs(true, currentPage, itemsPerPage);
                    const fetchedClubs = response?.clubs || response || [];

                    setClubs(Array.isArray(fetchedClubs) ? fetchedClubs : []);
                    setTotalItems(response?.total || response?.pagination?.totalItems || fetchedClubs.length);
                    setTotalPages(response?.pagination?.totalPages || Math.ceil((response?.total || fetchedClubs.length) / itemsPerPage));
                }
            } catch (err) {
                console.error('Error fetching clubs for admin:', err);
                setError(err.message || t('clubsAdmin.errors.fetchFailed'));
                setClubs([]);
                setAllClubs([]);
            } finally {
                setInitialLoading(false);
            }
        };

        fetchClubs();
    }, [isAuthentication, isAdmin, isModerator, currentPage, needsClientSideFiltering, itemsPerPage, t]);

    // Reset to first page when filters change
    useEffect(() => {
        if (currentPage !== 1) {
            setCurrentPage(1);
        }
    }, [searchTerm, filterBy, sortBy]);

    // Filter, search and sort clubs for client-side
    const filteredAndSortedClubs = useMemo(() => {
        if (!needsClientSideFiltering) {
            return clubs; // Use server-side data
        }

        if (!Array.isArray(allClubs)) return [];

        let filtered = [...allClubs];

        // Apply search filter
        if (searchTerm.trim()) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(club =>
                club.name?.toLowerCase().includes(searchLower) ||
                club.shortDescription?.toLowerCase().includes(searchLower) ||
                club.location?.city?.toLowerCase().includes(searchLower) ||
                club.owner?.toLowerCase().includes(searchLower) ||
                club.category?.toLowerCase().includes(searchLower)
            );
        }

        // Apply status filter
        if (filterBy !== 'all') {
            filtered = filtered.filter(club => {
                switch (filterBy) {
                    case 'active':
                        return club.status === 'active';
                    case 'inactive':
                        return club.status === 'inactive';
                    case 'draft':
                        return club.status === 'draft';
                    case 'suspended':
                        return club.status === 'suspended';
                    case 'rejected':
                        return club.status === 'rejected';
                    case 'verified':
                        return club.metadata?.isVerified === true;
                    case 'unverified':
                        return club.metadata?.isVerified === false;
                    case 'pending':
                        return club.status === 'draft' || club.status === 'inactive';
                    default:
                        return true;
                }
            });
        }

        // Apply sorting
        const sorted = filtered.sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.metadata?.createdAt || b.createdAt || 0) -
                        new Date(a.metadata?.createdAt || a.createdAt || 0);
                case 'oldest':
                    return new Date(a.metadata?.createdAt || a.createdAt || 0) -
                        new Date(b.metadata?.createdAt || b.createdAt || 0);
                case 'name':
                    return (a.name || '').localeCompare(b.name || '');
                case 'status':
                    return (a.status || '').localeCompare(b.status || '');
                case 'members':
                    return (b.membership?.totalMembers || 0) - (a.membership?.totalMembers || 0);
                case 'location':
                    return (a.location?.city || '').localeCompare(b.location?.city || '');
                default:
                    return 0;
            }
        });

        return sorted;
    }, [allClubs, clubs, searchTerm, filterBy, sortBy, needsClientSideFiltering]);

    // Pagination for display
    const paginatedClubs = useMemo(() => {
        if (!needsClientSideFiltering) {
            return clubs; // Server-side pagination already handled
        }

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredAndSortedClubs.slice(startIndex, endIndex);
    }, [filteredAndSortedClubs, clubs, currentPage, itemsPerPage, needsClientSideFiltering]);

    // Calculate total pages
    const calculatedTotalPages = useMemo(() => {
        if (!needsClientSideFiltering) {
            return totalPages; // Use server-side pagination
        }
        return Math.ceil(filteredAndSortedClubs.length / itemsPerPage);
    }, [filteredAndSortedClubs.length, itemsPerPage, totalPages, needsClientSideFiltering]);

    // Calculate statistics
    const stats = useMemo(() => {
        const dataToAnalyze = needsClientSideFiltering ? allClubs : clubs;
        if (!Array.isArray(dataToAnalyze) || dataToAnalyze.length === 0) return {
            total: 0,
            active: 0,
            inactive: 0,
            draft: 0,
            suspended: 0,
            rejected: 0,
            verified: 0,
            unverified: 0,
            totalMembers: 0
        };

        return {
            total: dataToAnalyze.length,
            active: dataToAnalyze.filter(club => club.status === 'active').length,
            inactive: dataToAnalyze.filter(club => club.status === 'inactive').length,
            draft: dataToAnalyze.filter(club => club.status === 'draft').length,
            suspended: dataToAnalyze.filter(club => club.status === 'suspended').length,
            rejected: dataToAnalyze.filter(club => club.status === 'rejected').length,
            verified: dataToAnalyze.filter(club => club.metadata?.isVerified === true).length,
            unverified: dataToAnalyze.filter(club => club.metadata?.isVerified === false).length,
            totalMembers: dataToAnalyze.reduce((sum, club) => sum + (club.membership?.totalMembers || 0), 0)
        };
    }, [clubs, allClubs, needsClientSideFiltering]);

    // Handle page change
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= calculatedTotalPages) {
            setCurrentPage(newPage);
            // Clear selections when changing pages
            setSelectedClubs([]);
        }
    };

    // Handle club selection
    const handleClubSelect = (clubId, isSelected) => {
        setSelectedClubs(prev =>
            isSelected
                ? [...prev, clubId]
                : prev.filter(id => id !== clubId)
        );
    };

    const handleSelectAll = (isSelected) => {
        setSelectedClubs(isSelected ? paginatedClubs.map(club => club.id) : []);
    };

    // Modal handlers
    const openModal = (type, club = null, data = null) => {
        setModalState({ isOpen: true, type, club, data });
    };

    const closeModal = () => {
        setModalState({ isOpen: false, type: null, club: null, data: null });
    };

    // Admin action handlers
    const handleStatusChange = async (club, newStatus) => {
        try {
            const updatedClub = await toggleClubStatus(club.id || club.slug, newStatus);
            if (updatedClub) {
                // Update both clubs arrays
                setClubs(prev => prev.map(c =>
                    c.id === club.id ? updatedClub : c
                ));
                setAllClubs(prev => prev.map(c =>
                    c.id === club.id ? updatedClub : c
                ));
            }
        } catch (error) {
            console.error('Error changing status:', error);
        }
    };

    const handleVerifyClub = async (club) => {
        try {
            const verifiedClub = await verifyClub(club.id || club.slug);
            if (verifiedClub) {
                setClubs(prev => prev.map(c =>
                    c.id === club.id ? verifiedClub : c
                ));
                setAllClubs(prev => prev.map(c =>
                    c.id === club.id ? verifiedClub : c
                ));
            }
        } catch (error) {
            console.error('Error verifying club:', error);
        }
    };

    const handleApproveClub = async (club) => {
        try {
            const approvedClub = await approveClub(club.id || club.slug);
            if (approvedClub) {
                setClubs(prev => prev.map(c =>
                    c.id === club.id ? approvedClub : c
                ));
                setAllClubs(prev => prev.map(c =>
                    c.id === club.id ? approvedClub : c
                ));
            }
        } catch (error) {
            console.error('Error approving club:', error);
        }
    };

    const handleRejectClub = async (club, reason) => {
        try {
            const result = await rejectClub(club.id || club.slug, reason);
            if (result) {
                const updatedClub = { ...club, status: 'rejected' };
                setClubs(prev => prev.map(c =>
                    c.id === club.id ? updatedClub : c
                ));
                setAllClubs(prev => prev.map(c =>
                    c.id === club.id ? updatedClub : c
                ));
            }
        } catch (error) {
            console.error('Error rejecting club:', error);
        }
    };

    // Bulk action handlers
    const handleBulkAction = async (action, data = null) => {
        if (selectedClubs.length === 0) return;

        try {
            let result;
            switch (action) {
                case 'approve':
                    result = await bulkApproveClubs(selectedClubs);
                    break;
                case 'delete':
                    result = await bulkDeleteClubs(selectedClubs);
                    break;
                case 'updateStatus':
                    result = await bulkUpdateClubs(selectedClubs, { status: data.status });
                    break;
                default:
                    return;
            }

            if (result) {
                if (action === 'delete') {
                    setClubs(prev => prev.filter(club => !selectedClubs.includes(club.id)));
                    setAllClubs(prev => prev.filter(club => !selectedClubs.includes(club.id)));
                } else {
                    // Refresh current page data
                    const response = await getAllClubs(true,
                        needsClientSideFiltering ? 1 : currentPage,
                        needsClientSideFiltering ? 1000 : itemsPerPage
                    );
                    const updatedClubs = response?.clubs || response || [];

                    if (needsClientSideFiltering) {
                        setAllClubs(Array.isArray(updatedClubs) ? updatedClubs : []);
                    } else {
                        setClubs(Array.isArray(updatedClubs) ? updatedClubs : []);
                    }
                }
                setSelectedClubs([]);
                setShowBulkActions(false);
            }
        } catch (error) {
            console.error('Error in bulk action:', error);
        }
    };

    // Loading state
    if (initialLoading) {
        return (
            <div className="clubsadmin-loading">
                <FontAwesomeIcon icon={faSpinner} spin className="clubsadmin-loading-icon" />
                <p>{t('clubsAdmin.loading')}</p>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="clubsadmin-error">
                <div className="clubsadmin-error-content">
                    <FontAwesomeIcon icon={faTimesCircle} className="clubsadmin-error-icon" />
                    <h3>{t('clubsAdmin.errors.title')}</h3>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="clubsadmin-container">
            {/* Header */}
            <div className="clubsadmin-header">
                <div className="clubsadmin-header-content">
                    <div className="clubsadmin-header-text">
                        <h1 className="clubsadmin-page-title">
                            <FontAwesomeIcon icon={faShieldAlt} className="clubsadmin-title-icon" />
                            {t('clubsAdmin.title')}
                        </h1>
                        <p className="clubsadmin-page-subtitle">
                            {t('clubsAdmin.subtitle')}
                        </p>
                    </div>
                </div>

                <AdminStatsOverview stats={stats} />
            </div>

            {/* Controls */}
            <div className="clubsadmin-controls">
                <AdminSearchBar
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder={t('clubsAdmin.searchPlaceholder')}
                />

                <div className="clubsadmin-controls-right">
                    <AdminClubFilters
                        value={filterBy}
                        onChange={setFilterBy}
                        stats={stats}
                    />

                    <div className="clubsadmin-sort-dropdown">
                        <FontAwesomeIcon icon={faSort} />
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="clubsadmin-sort-select"
                        >
                            <option value="newest">{t('clubsAdmin.sort.newest')}</option>
                            <option value="oldest">{t('clubsAdmin.sort.oldest')}</option>
                            <option value="name">{t('clubsAdmin.sort.name')}</option>
                            <option value="status">{t('clubsAdmin.sort.status')}</option>
                            <option value="members">{t('clubsAdmin.sort.members')}</option>
                            <option value="location">{t('clubsAdmin.sort.location')}</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Bulk Actions */}
            {selectedClubs.length > 0 && (
                <AdminClubActions
                    selectedCount={selectedClubs.length}
                    onBulkAction={handleBulkAction}
                    onClearSelection={() => setSelectedClubs([])}
                />
            )}

            {/* Clubs Grid */}
            <div className="clubsadmin-content">
                {paginatedClubs.length > 0 ? (
                    <>
                        {/* Select All */}
                        <div className="clubsadmin-select-all">
                            <label className="clubsadmin-checkbox">
                                <input
                                    type="checkbox"
                                    checked={selectedClubs.length === paginatedClubs.length && paginatedClubs.length > 0}
                                    onChange={(e) => handleSelectAll(e.target.checked)}
                                />
                                <span>{t('clubsAdmin.selectAll')}</span>
                            </label>
                        </div>

                        <div className="clubsadmin-grid">
                            {paginatedClubs.map((club) => (
                                <AdminClubCard
                                    key={club.id}
                                    club={club}
                                    isSelected={selectedClubs.includes(club.id)}
                                    onSelect={(isSelected) => handleClubSelect(club.id, isSelected)}
                                    onStatusChange={handleStatusChange}
                                    onVerify={handleVerifyClub}
                                    onApprove={handleApproveClub}
                                    onReject={(reason) => handleRejectClub(club, reason)}
                                    onOpenModal={openModal}
                                />
                            ))}
                        </div>

                        {/* Enhanced Pagination */}
                        {calculatedTotalPages > 1 && (
                            <div className="clubsadmin-pagination">
                                <button
                                    className="clubsadmin-pagination-btn"
                                    onClick={() => handlePageChange(1)}
                                    disabled={currentPage === 1}
                                    title={t('clubsAdmin.pagination.first')}
                                >
                                    ⟪
                                </button>

                                <button
                                    className="clubsadmin-pagination-btn"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    {t('clubsAdmin.pagination.previous')}
                                </button>

                                <div className="clubsadmin-pagination-info">
                                    <span>
                                        {t('clubsAdmin.pagination.info', {
                                            current: currentPage,
                                            total: calculatedTotalPages
                                        })}
                                    </span>
                                    <div className="clubsadmin-pagination-details">
                                        {t('clubsAdmin.results.showing', {
                                            showing: paginatedClubs.length,
                                            total: needsClientSideFiltering ? filteredAndSortedClubs.length : totalItems,
                                            allTotal: needsClientSideFiltering ? allClubs.length : totalItems
                                        })}
                                    </div>
                                </div>

                                <button
                                    className="clubsadmin-pagination-btn"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === calculatedTotalPages}
                                >
                                    {t('clubsAdmin.pagination.next')}
                                </button>

                                <button
                                    className="clubsadmin-pagination-btn"
                                    onClick={() => handlePageChange(calculatedTotalPages)}
                                    disabled={currentPage === calculatedTotalPages}
                                    title={t('clubsAdmin.pagination.last')}
                                >
                                    ⟫
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="clubsadmin-empty">
                        <FontAwesomeIcon icon={faSearch} className="clubsadmin-empty-icon" />
                        <h3>{t('clubsAdmin.empty.title')}</h3>
                        <p>{t('clubsAdmin.empty.message')}</p>
                        {searchTerm || filterBy !== 'all' ? (
                            <button
                                className="clubsadmin-clear-filters-btn"
                                onClick={() => {
                                    setSearchTerm('');
                                    setFilterBy('all');
                                    setSortBy('newest');
                                }}
                            >
                                {t('clubsAdmin.empty.clearFilters')}
                            </button>
                        ) : null}
                    </div>
                )}
            </div>

            {/* Admin Modal */}
            <AdminClubModal
                isOpen={modalState.isOpen}
                type={modalState.type}
                club={modalState.club}
                data={modalState.data}
                onClose={closeModal}
                onConfirm={(action, data) => {
                    // Handle modal actions
                    closeModal();
                }}
            />
        </div>
    );
};

export default ClubsAdmin;