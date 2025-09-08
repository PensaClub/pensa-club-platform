// src/components/Profile/DraftClubs/DraftClubs.jsx
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPlus,
    faSpinner,
    faFileAlt
} from '@fortawesome/free-solid-svg-icons';

import './draftClubs.css';

// Импорти на подкомпонентите
import DraftClubsFilterDropdown from './DraftClubsFilterDropdown/DraftClubsFilterDropdown';
import DraftClubsSortDropdown from './DraftClubsSortDropdown/DraftClubsSortDropdown';
import DraftClubsEmptyState from './DraftClubsEmptyState/DraftClubsEmptyState';
import DraftStatsOverview from './DraftStatsOverview/DraftStatsOverview';
import { useAuthContext } from '../../contexts/UserContext';
import { useClubContext } from '../../contexts/ClubContext';
import SearchDraftClubsBar from './SearchDraftClubsBar/SearchDraftClubsBar';
import DraftClubsCard from './DraftClubsCard/DraftClubsCard';
import ClubPreviewModal from '../ClubCreateForm/ClubPreviewModal/ClubPreviewModal';

const DraftClubs = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const {
        isAuthentication,
        userEmail,
        setRedirectAfterLogin
    } = useAuthContext();

    const { 
        getAllDrafts,
        deleteDraftClub 
    } = useClubContext();

    // State management
    const [drafts, setDrafts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterBy, setFilterBy] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [previewDraft, setPreviewDraft] = useState(null);

    // Authentication check
    useEffect(() => {
        if (!isAuthentication) {
            setRedirectAfterLogin('/profile/drafts');
            navigate('/sign-up');
            return;
        }
    }, [isAuthentication, navigate, setRedirectAfterLogin]);

    // Функция за определяне на завършеност на драфт
    const isClubComplete = useCallback((draft) => {
        // Основна информация (ЗАДЪЛЖИТЕЛНО)
        const hasBasicInfo = draft.name && draft.name.trim().length > 0 && 
                            draft.shortDescription && draft.shortDescription.trim().length > 0;
        
        // Местоположение
        const hasLocation = (draft.location?.address && draft.location.address.trim()) ||
                           (draft.location?.city && draft.location.city.trim()) ||
                           (draft.location?.coordinates?.lat && draft.location?.coordinates?.lng);
        
        // Дейности
        const hasActivities = (draft.activities?.regular && draft.activities.regular.length > 0) ||
                             (draft.activities?.events && draft.activities.events.length > 0) ||
                             (draft.activities?.trips && draft.activities.trips.length > 0) ||
                             (draft.activities?.courses && draft.activities.courses.length > 0);
        
        // Членове или управление
        const hasMembers = (draft.members && draft.members.length > 0) ||
                          (draft.management?.board && draft.management.board.length > 0);
        
        // Контакти
        const hasContacts = (draft.contacts?.phone && draft.contacts.phone.trim()) ||
                           (draft.contacts?.email && draft.contacts.email.trim()) ||
                           (draft.contacts?.mobile && draft.contacts.mobile.trim());
        
        // Членство
        const hasMembership = draft.membership?.type && draft.membership.type.trim() !== '';
        
        // Draft е завършен ако има основна информация + поне още 3 от другите секции
        const completedSections = [hasLocation, hasActivities, hasMembers, hasContacts, hasMembership].filter(Boolean).length;
        
        return hasBasicInfo && completedSections >= 3;
    }, []);

    // Fetch user drafts
    useEffect(() => {
        const fetchUserDrafts = async () => {
            if (!isAuthentication || !userEmail) return;

            try {
                setInitialLoading(true);
                setError(null);

                const response = await getAllDrafts();
                
                // Обработваме отговора правилно
                let userDrafts = [];
                if (response && Array.isArray(response.drafts)) {
                    userDrafts = response.drafts;
                } else if (Array.isArray(response)) {
                    userDrafts = response;
                } else if (response && Array.isArray(response.data)) {
                    userDrafts = response.data;
                } else if (response && Array.isArray(response.clubs)) {
                    userDrafts = response.clubs;
                }

                setDrafts(userDrafts);
            } catch (err) {
                console.error('Error fetching user drafts:', err);
                setError(err.message || 'Failed to fetch drafts');
                setDrafts([]);
            } finally {
                setInitialLoading(false);
            }
        };

        fetchUserDrafts();
    }, [userEmail, isAuthentication]); 

    // Filter and search drafts
    const filteredAndSortedDrafts = useMemo(() => {
        if (!Array.isArray(drafts)) {
            return [];
        }

        let filtered = drafts;

        // Apply search filter
        if (searchTerm.trim()) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(draft =>
                draft.name?.toLowerCase().includes(searchLower) ||
                draft.shortDescription?.toLowerCase().includes(searchLower) ||
                draft.location?.city?.toLowerCase().includes(searchLower) ||
                draft.category?.toLowerCase().includes(searchLower)
            );
        }

        // Apply category filter
        if (filterBy !== 'all') {
            filtered = filtered.filter(draft => {
                switch (filterBy) {
                    case 'general':
                        return draft.category === 'general';
                    case 'cultural':
                        return draft.category === 'cultural';
                    case 'traditional':
                        return draft.category === 'traditional';
                    case 'social':
                        return draft.category === 'social';
                    case 'sports':
                        return draft.category === 'sports';
                    case 'complete':
                        return isClubComplete(draft);
                    case 'incomplete':
                        return !isClubComplete(draft);
                    default:
                        return true;
                }
            });
        }

        // Apply sorting
        const sorted = [...filtered].sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.metadata?.updatedAt || b.updatedAt || 0) -
                        new Date(a.metadata?.updatedAt || a.updatedAt || 0);
                case 'oldest':
                    return new Date(a.metadata?.updatedAt || a.updatedAt || 0) -
                        new Date(b.metadata?.updatedAt || b.updatedAt || 0);
                case 'name':
                    return (a.name || '').localeCompare(b.name || '');
                case 'category':
                    return (a.category || '').localeCompare(b.category || '');
                case 'completion':
                    // Sort by completion level с новата логика
                    const aComplete = isClubComplete(a) ? 1 : 0;
                    const bComplete = isClubComplete(b) ? 1 : 0;
                    return bComplete - aComplete;
                default:
                    return 0;
            }
        });

        return sorted;
    }, [drafts, searchTerm, filterBy, sortBy, isClubComplete]);

    // Calculate statistics
    const stats = useMemo(() => {
        if (!Array.isArray(drafts)) {
            return { total: 0, complete: 0, incomplete: 0, lastModified: null };
        }

        const total = drafts.length;
        const complete = drafts.filter(draft => isClubComplete(draft)).length;
        const incomplete = total - complete;
        
        // Find most recently modified draft
        const lastModified = drafts.length > 0 
            ? drafts.reduce((latest, draft) => {
                const draftDate = new Date(draft.metadata?.updatedAt || draft.updatedAt || 0);
                const latestDate = new Date(latest?.metadata?.updatedAt || latest?.updatedAt || 0);
                return draftDate > latestDate ? draft : latest;
            })
            : null;

        return { total, complete, incomplete, lastModified };
    }, [drafts, isClubComplete]);

    const handleCreateNew = () => {
        navigate('/profile/club-create');
    };

    const handleDeleteDraft = async (draft) => {
        try {
            const success = await deleteDraftClub(draft.id);
            if (success) {
                setDrafts(prevDrafts => prevDrafts.filter(d => d.id !== draft.id));
            }
        } catch (error) {
            console.error('Error deleting draft:', error);
        }
    };

    const handleContinueDraft = (draft) => {
        navigate(`/profile/club-create?draftId=${draft.id}&mode=continue`);
    };

    const handleViewDraft = (draft) => {
        setPreviewDraft(draft);
        setShowPreviewModal(true);
    };

    // Show loading state
    if (initialLoading) {
        return (
            <div className="draftclubs-loading">
                <FontAwesomeIcon icon={faSpinner} spin className="draftclubs-loading-icon" />
                <p>{t('draftClubs.loading')}</p>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="draftclubs-error">
                <div className="draftclubs-error-content">
                    <h3>{t('draftClubs.errorTitle')}</h3>
                    <p>{error}</p>
                    <button
                        className="draftclubs-retry-button"
                        onClick={() => window.location.reload()}
                    >
                        {t('draftClubs.retry')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="draftclubs-container">
            {/* Header */}
            <div className="draftclubs-header">
                <div className="draftclubs-header-content">
                    <div className="draftclubs-header-text">
                        <h1 className="draftclubs-page-title">
                            <FontAwesomeIcon icon={faFileAlt} className="draftclubs-title-icon" />
                            {t('draftClubs.title')}
                        </h1>
                        <p className="draftclubs-page-subtitle">
                            {t('draftClubs.subtitle')}
                        </p>
                    </div>

                    <button
                        className="draftclubs-create-btn"
                        onClick={handleCreateNew}
                    >
                        <FontAwesomeIcon icon={faPlus} />
                        {t('draftClubs.createNew')}
                    </button>
                </div>

                <DraftStatsOverview stats={stats} />
            </div>

            {/* Search and Filters */}
            <div className="draftclubs-controls">
                <SearchDraftClubsBar
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder={t('draftClubs.searchPlaceholder')}
                />

                <div className="draftclubs-controls-right">
                    <DraftClubsFilterDropdown
                        value={filterBy}
                        onChange={setFilterBy}
                        options={[
                            { value: 'all', label: t('draftClubs.filters.all') },
                            { value: 'complete', label: t('draftClubs.filters.complete') },
                            { value: 'incomplete', label: t('draftClubs.filters.incomplete') },
                            { value: 'general', label: t('draftClubs.filters.general') },
                            { value: 'cultural', label: t('draftClubs.filters.cultural') },
                            { value: 'traditional', label: t('draftClubs.filters.traditional') },
                            { value: 'social', label: t('draftClubs.filters.social') },
                            { value: 'sports', label: t('draftClubs.filters.sports') }
                        ]}
                    />

                    <DraftClubsSortDropdown
                        value={sortBy}
                        onChange={setSortBy}
                        options={[
                            { value: 'newest', label: t('draftClubs.sorting.newest') },
                            { value: 'oldest', label: t('draftClubs.sorting.oldest') },
                            { value: 'name', label: t('draftClubs.sorting.name') },
                            { value: 'category', label: t('draftClubs.sorting.category') },
                            { value: 'completion', label: t('draftClubs.sorting.completion') }
                        ]}
                    />
                </div>
            </div>

            {/* Drafts Grid */}
            <div className="draftclubs-content">
                {filteredAndSortedDrafts.length > 0 ? (
                    <div className="draftclubs-grid">
                        {filteredAndSortedDrafts.map((draft) => (
                            <DraftClubsCard
                                key={draft.id}
                                draft={draft}
                                onContinue={() => handleContinueDraft(draft)}
                                onView={() => handleViewDraft(draft)}
                                onDelete={() => handleDeleteDraft(draft)}
                            />
                        ))}
                    </div>
                ) : (
                    <DraftClubsEmptyState
                        searchTerm={searchTerm}
                        filterBy={filterBy}
                        totalDrafts={drafts.length}
                        onCreateNew={handleCreateNew}
                        onClearFilters={() => {
                            setSearchTerm('');
                            setFilterBy('all');
                        }}
                    />
                )}
            </div>

            {/* Results info */}
            {filteredAndSortedDrafts.length > 0 && (
                <div className="draftclubs-results-info">
                    <p>
                        {t('draftClubs.resultsInfo', {
                            showing: filteredAndSortedDrafts.length,
                            total: drafts.length
                        })}
                    </p>
                </div>
            )}

            {/* Preview Modal */}
            {showPreviewModal && previewDraft && (
                <ClubPreviewModal
                    isOpen={showPreviewModal}
                    onClose={() => {
                        setShowPreviewModal(false);
                        setPreviewDraft(null);
                    }}
                    formData={previewDraft}
                />
            )}
        </div>
    );
};

export default DraftClubs;