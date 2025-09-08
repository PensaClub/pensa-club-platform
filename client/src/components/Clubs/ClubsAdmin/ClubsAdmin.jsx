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
    const { t } = useTranslation();
    const { isAdmin, isAuthentication,isModerator } = useAuthContext();
    
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
    const [selectedClubs, setSelectedClubs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterBy, setFilterBy] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(12);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showBulkActions, setShowBulkActions] = useState(false);
    
    // Modal states
    const [modalState, setModalState] = useState({
        isOpen: false,
        type: null, // 'status', 'verify', 'approve', 'reject'
        club: null,
        data: null
    });

    // Check admin access
    useEffect(() => {
        if (!isAuthentication || !isAdmin || !isModerator) {
            setError(t('clubsAdmin.errors.noAccess'));
            return;
        }
    }, [isAuthentication, isAdmin, isModerator, t]);

    // Fetch all clubs
    useEffect(() => {
        const fetchAllClubs = async () => {
            if (!isAuthentication || !isAdmin ) return;

            try {
                setInitialLoading(true);
                setError(null);

                const response = await getAllClubs(true, 1, 1000); 
                const allClubs = response?.clubs || response || [];
                
                setClubs(Array.isArray(allClubs) ? allClubs : []);
            } catch (err) {
                console.error('Error fetching clubs for admin:', err);
                setError(err.message || t('clubsAdmin.errors.fetchFailed'));
                setClubs([]);
            } finally {
                setInitialLoading(false);
            }
        };

        fetchAllClubs();
    }, [ isAuthentication, isAdmin, t]);

    // Filter, search and sort clubs
    const filteredAndSortedClubs = useMemo(() => {
        if (!Array.isArray(clubs)) return [];

        let filtered = [...clubs];

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
    }, [clubs, searchTerm, filterBy, sortBy]);

    // Pagination
    const paginatedClubs = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredAndSortedClubs.slice(startIndex, endIndex);
    }, [filteredAndSortedClubs, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredAndSortedClubs.length / itemsPerPage);

    // Calculate statistics
    const stats = useMemo(() => {
        if (!Array.isArray(clubs)) return {};

        return {
            total: clubs.length,
            active: clubs.filter(club => club.status === 'active').length,
            inactive: clubs.filter(club => club.status === 'inactive').length,
            draft: clubs.filter(club => club.status === 'draft').length,
            suspended: clubs.filter(club => club.status === 'suspended').length,
            rejected: clubs.filter(club => club.status === 'rejected').length,
            verified: clubs.filter(club => club.metadata?.isVerified === true).length,
            unverified: clubs.filter(club => club.metadata?.isVerified === false).length,
            totalMembers: clubs.reduce((sum, club) => sum + (club.membership?.totalMembers || 0), 0)
        };
    }, [clubs]);

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
                setClubs(prev => prev.map(c => 
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
            }
        } catch (error) {
            console.error('Error approving club:', error);
        }
    };

    const handleRejectClub = async (club, reason) => {
        try {
            const result = await rejectClub(club.id || club.slug, reason);
            if (result) {
                setClubs(prev => prev.map(c => 
                    c.id === club.id ? { ...c, status: 'rejected' } : c
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
                } else {
                    // Refresh clubs after bulk actions
                    const response = await getAllClubs(true, 1, 1000);
                    const updatedClubs = response?.clubs || response || [];
                    setClubs(Array.isArray(updatedClubs) ? updatedClubs : []);
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

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="clubsadmin-pagination">
                                <button
                                    className="clubsadmin-pagination-btn"
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                >
                                    {t('clubsAdmin.pagination.previous')}
                                </button>
                                
                                <div className="clubsadmin-pagination-info">
                                    {t('clubsAdmin.pagination.info', { 
                                        current: currentPage, 
                                        total: totalPages 
                                    })}
                                </div>
                                
                                <button
                                    className="clubsadmin-pagination-btn"
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                >
                                    {t('clubsAdmin.pagination.next')}
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
                                }}
                            >
                                {t('clubsAdmin.empty.clearFilters')}
                            </button>
                        ) : null}
                    </div>
                )}
            </div>

            {/* Results Info */}
            {filteredAndSortedClubs.length > 0 && (
                <div className="clubsadmin-results-info">
                    <p>
                        {t('clubsAdmin.results.showing', {
                            showing: paginatedClubs.length,
                            total: filteredAndSortedClubs.length,
                            allTotal: clubs.length
                        })}
                    </p>
                </div>
            )}

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