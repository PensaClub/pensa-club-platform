/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useCallback } from 'react';
import './allPublications.css';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { useInitiativeContext } from '../../../contexts/InitiativeProvider';
import { PublicationsSearchAdmin } from './PublicationsSearchAdmin/PublicationsSearchAdmin';
import { PublicationsHeaderAdmin } from './PublicationsHeaderAdmin/PublicationsHeaderAdmin';
import { notify } from '../../../../utils/notify';

export const AllPublications = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const {
        // Publication functions from context - FIXED NAMES
        getAllPublications, // Changed from getAllPublicationsTemporary
        publications = [], // Changed from publicationsTemporary
        publicationsLoaded = false, // Changed from publicationsTemporaryLoaded
        publicationsHasMore = false, // Changed from publicationsTemporaryHasMore
        publicationsCurrentPage = 1, // Changed from publicationsTemporaryCurrentPage
        isLoading: contextLoading = false,
        // NEW:
        getAllPublicationDrafts,
        publicationDrafts = [],
        publicationDraftsHasMore = false,
        publicationDraftsCurrentPage = 1,
    } = useInitiativeContext();

    const location = useLocation();
    const [viewMode, setViewMode] = useState('publications');
    const [filteredItems, setFilteredItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        category: 'all',
        sortBy: 'newest'
    });
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const [hasLoadedInitial, setHasLoadedInitial] = useState(false);

    useEffect(() => {
        // Ако се връщаме от edit страница, refresh-ваме данните
        const urlParams = new URLSearchParams(window.location.search);
        const wasEditing = sessionStorage.getItem('wasEditingDraft');

        if (wasEditing) {
            if (viewMode === 'drafts') {
                // Force refresh - for now just reload the component
                // TODO: Replace with real context function
            }
            sessionStorage.removeItem('wasEditingDraft');
        }
    }, [location.pathname, viewMode]);

    // Load publications on component mount - FIXED function names
    useEffect(() => {
        if (viewMode === 'publications' && !hasLoadedInitial) {
            getAllPublications(1, true); // Changed from getAllPublicationsTemporary
            setHasLoadedInitial(true);
        } else if (viewMode === 'drafts' && !hasLoadedInitial) {
            getAllPublicationDrafts(1, true);
            setHasLoadedInitial(true);
        }
    }, [viewMode, hasLoadedInitial, getAllPublications, getAllPublicationDrafts]);

    // Global click handler to close dropdown
    useEffect(() => {
        const handleGlobalClick = (event) => {
            if (!event.target.closest('.all-publications-card-actions')) {
                setOpenDropdownId(null);
            }
        };

        document.addEventListener('click', handleGlobalClick);
        return () => document.removeEventListener('click', handleGlobalClick);
    }, []);

    // Filter items - FIXED variable names
    useEffect(() => {
        const items = viewMode === 'publications' ? publications : publicationDrafts; // Changed from publicationsTemporary
        let filtered = [...items];

        if (searchTerm) {
            filtered = filtered.filter(item =>
                item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.shortDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.userEmail?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by category
        if (filters.category !== 'all') {
            filtered = filtered.filter(item => item.category === filters.category);
        }

        // Sort items
        filtered.sort((a, b) => {
            switch (filters.sortBy) {
                case 'newest':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'oldest':
                    return new Date(a.createdAt) - new Date(b.createdAt);
                case 'updated':
                    return new Date(b.updatedAt) - new Date(a.updatedAt);
                case 'published':
                    return new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0);
                case 'likes':
                    return (b.likes || 0) - (a.likes || 0);
                case 'views':
                    return (b.views || 0) - (a.views || 0);
                case 'downloads':
                    return (b.downloads || 0) - (a.downloads || 0);
                default:
                    return 0;
            }
        });

        setFilteredItems(filtered);
    }, [viewMode, publications, publicationDrafts, searchTerm, filters]); // Changed from publicationsTemporary

    const handleSearch = (term) => {
        setSearchTerm(term);
    };

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
    };

    const handleViewModeChange = (mode) => {
        setViewMode(mode);
        setSearchTerm('');
        setFilters({
            category: 'all',
            sortBy: 'newest'
        });
        setHasLoadedInitial(false);

        if (mode === 'publications') {
            getAllPublications(1, true); // Changed from getAllPublicationsTemporary
        } else if (mode === 'drafts') {
            getAllPublicationDrafts(1, true);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return t('publications.admin.noDate');
        const date = new Date(dateString);
        return date.toLocaleDateString('bg-BG', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const handleLoadMore = useCallback(() => {
        if (viewMode === 'publications' && publicationsHasMore && !contextLoading) {
            getAllPublications(publicationsCurrentPage + 1);
        } else if (viewMode === 'drafts' && publicationDraftsHasMore && !contextLoading) {
            getAllPublicationDrafts(publicationDraftsCurrentPage + 1);
        }
    }, [
        viewMode,
        publicationsHasMore,
        publicationsCurrentPage,
        publicationDraftsHasMore,
        publicationDraftsCurrentPage,
        contextLoading,
        getAllPublications,
        getAllPublicationDrafts
    ]);

    // Action handlers
    const performAction = async (action, item) => {
        setOpenDropdownId(null);
        const identifier = item.slug || item.id;

        try {
            switch (action) {
                case 'view':
                    if (viewMode === 'publications') {
                        navigate(`/publications/${identifier}`);
                    } else {
                        navigate(`/profile/publication-create?draftId=${identifier}`);
                    }
                    break;
                case 'edit':
                    if (viewMode === 'drafts') {
                        sessionStorage.setItem('wasEditingDraft', 'true');
                        navigate(`/profile/publication-create?draftId=${identifier}`);
                    } else {
                        navigate(`/profile/publication-create?editId=${identifier}&mode=edit`);
                    }
                    break;

                case 'delete':
                    const isDraft = viewMode === 'drafts';
                    const confirmMessage = isDraft
                        ? t('publications.admin.confirmDeleteDraft')
                        : t('publications.admin.confirmDeletePublication');

                    if (window.confirm(confirmMessage)) {
                        if (isDraft) {
                            console.log('️ Deleting draft:', identifier);
                            notify('success', t('publications.admin.draftDeletedSuccess'));
                            // TODO: Replace with real context function
                        } else {
                            console.log('🗑️ Deleting published publication:', identifier);
                            notify('success', t('publications.admin.publicationDeletedSuccess'));
                            // TODO: Replace with real context function
                        }
                    }
                    break;

                case 'publish':
                    if (window.confirm(t('publications.admin.confirmPublishDraft'))) {
                        notify('success', t('publications.admin.draftPublishedSuccess'));
                        // TODO: Replace with real context function
                        setViewMode('publications');
                    }
                    break;

                default:
                    break;
            }
        } catch (error) {
            console.error(`Error performing ${action}:`, error);
            notify('error', t('publications.admin.actionError'));
        }
    };

    const getStatusBadge = (item) => {
        if (viewMode === 'drafts') {
            return <span className="all-publications-status-badge draft">{t('publications.admin.statusDraft')}</span>;
        }

        // For publications, check if it's published or not
        if (item.publishedAt) {
            return <span className="all-publications-status-badge active">{t('publications.admin.statusPublished')}</span>;
        } else {
            return <span className="all-publications-status-badge draft">{t('publications.admin.statusDraft')}</span>;
        }
    };

    const getDefaultImage = () => {
        return `data:image/svg+xml,${encodeURIComponent(`
    <svg width="400" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#1e293b"/>
      <text x="50%" y="50%" font-family="Arial" font-size="18" fill="#64748b" text-anchor="middle" dy=".3em">
        Няма изображение
      </text>
    </svg>
  `)}`;
    };

    return (
        <div className="all-publications-admin-container">
            <PublicationsHeaderAdmin
                totalCount={viewMode === 'publications' ? publications.length : publicationDrafts.length}
                viewMode={viewMode}
                onViewModeChange={handleViewModeChange}
                isLoading={contextLoading}
            />

            <PublicationsSearchAdmin
                onSearch={handleSearch}
                onFilterChange={handleFilterChange}
                totalCount={filteredItems.length}
                viewMode={viewMode}
            />

            <div className="all-publications-grid-admin">
                {filteredItems.map((item) => (
                    <div key={`${viewMode}-${item.id}`} className="all-publications-card">
                        <div className="all-publications-card-header">
                            <img
                                src={item.image?.src || item.logo || getDefaultImage()}
                                alt={item.image?.alt || item.title}
                                className="all-publications-card-image"
                                onError={(e) => {
                                    e.target.src = getDefaultImage();
                                }}
                            />
                            <div className="all-publications-status-overlay">
                                {getStatusBadge(item)}
                            </div>
                        </div>

                        <div className="all-publications-card-body">
                            <h3 className="all-publications-card-title">{item.title}</h3>
                            <p className="all-publications-card-description">
                                {item.shortDescription?.slice(0, 100)}...
                            </p>

                            <div className="all-publications-card-meta">
                                <div className="all-publications-meta-item">
                                    <svg className="all-publications-meta-icon" viewBox="0 0 24 24" fill="none">
                                        <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" />
                                        <path d="M8.5 11C10.7091 11 12.5 9.20914 12.5 7C12.5 4.79086 10.7091 3 8.5 3C6.29086 3 4.5 4.79086 4.5 7C4.5 9.20914 6.29086 11 8.5 11Z" stroke="currentColor" strokeWidth="2" />
                                    </svg>
                                    <span>{item.userEmail || t('publications.admin.unknownAuthor')}</span>
                                </div>

                                <div className="all-publications-meta-item">
                                    <svg className="all-publications-meta-icon" viewBox="0 0 24 24" fill="none">
                                        <path d="M8 2V6M16 2V6M3 10H21M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z" stroke="currentColor" strokeWidth="2" />
                                    </svg>
                                    <span>{formatDate(item.createdAt)}</span>
                                </div>

                                {item.publishedAt && (
                                    <div className="all-publications-meta-item">
                                        <svg className="all-publications-meta-icon" viewBox="0 0 24 24" fill="none">
                                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                            <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" />
                                        </svg>
                                        <span>{formatDate(item.publishedAt)}</span>
                                    </div>
                                )}
                            </div>

                            <div className="all-publications-card-footer">
                                <div className="all-publications-card-stats">
                                    {item.category && (
                                        <span className="all-publications-stat-badge">{item.category}</span>
                                    )}
                                    {item.fileType && (
                                        <span className="all-publications-stat-badge">{item.fileType.toUpperCase()}</span>
                                    )}
                                    {item.readTime && (
                                        <span className="all-publications-stat-badge">{item.readTime}</span>
                                    )}
                                    {item.views !== undefined && (
                                        <span className="all-publications-stat-badge">{item.views} прегледа</span>
                                    )}
                                    {item.likes !== undefined && (
                                        <span className="all-publications-stat-badge">{item.likes} харесвания</span>
                                    )}
                                    {item.downloads !== undefined && (
                                        <span className="all-publications-stat-badge">{item.downloads} изтегляния</span>
                                    )}
                                </div>

                                <div className="all-publications-card-actions">
                                    <button
                                        className="all-publications-action-menu-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setOpenDropdownId(openDropdownId === item.id ? null : item.id);
                                        }}
                                    >
                                        <svg viewBox="0 0 24 24" fill="none">
                                            <circle cx="5" cy="12" r="2" fill="currentColor" />
                                            <circle cx="12" cy="12" r="2" fill="currentColor" />
                                            <circle cx="19" cy="12" r="2" fill="currentColor" />
                                        </svg>
                                    </button>

                                    {openDropdownId === item.id && (
                                        <div className="all-publications-action-dropdown">
                                            <button
                                                className="all-publications-dropdown-item view"
                                                onMouseDown={() => performAction('view', item)}
                                            >
                                                <svg viewBox="0 0 24 24" fill="none">
                                                    <path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" stroke="currentColor" strokeWidth="2" />
                                                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                                                </svg>
                                                {t('publications.admin.view')}
                                            </button>

                                            <button
                                                className="all-publications-dropdown-item edit"
                                                onMouseDown={() => performAction('edit', item)}
                                            >
                                                <svg viewBox="0 0 24 24" fill="none">
                                                    <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" />
                                                    <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.43741 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="currentColor" strokeWidth="2" />
                                                </svg>
                                                {t('publications.admin.edit')}
                                            </button>

                                            {viewMode === 'drafts' && (
                                                <button
                                                    className="all-publications-dropdown-item publish"
                                                    onMouseDown={() => performAction('publish', item)}
                                                >
                                                    <svg viewBox="0 0 24 24" fill="none">
                                                        <path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                    {t('publications.admin.publish')}
                                                </button>
                                            )}

                                            {viewMode === 'drafts' && (
                                                <button
                                                    className="all-publications-dropdown-item delete"
                                                    onMouseDown={() => performAction('delete', item)}
                                                >
                                                    <svg viewBox="0 0 24 24" fill="none">
                                                        <path d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" />
                                                        <path d="M10 11V17M14 11V17" stroke="currentColor" strokeWidth="2" />
                                                    </svg>
                                                    {t('publications.admin.delete')}
                                                </button>
                                            )}

                                            {viewMode === 'publications' && (
                                                <button
                                                    className="all-publications-dropdown-item delete"
                                                    onMouseDown={() => performAction('delete', item)}
                                                >
                                                    <svg viewBox="0 0 24 24" fill="none">
                                                        <path d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" />
                                                        <path d="M10 11V17M14 11V17" stroke="currentColor" strokeWidth="2" />
                                                    </svg>
                                                    {t('publications.admin.delete')}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {((viewMode === 'publications' && publicationsHasMore) || (viewMode === 'drafts' && publicationDraftsHasMore)) && !contextLoading && (
                <div className="all-publications-load-more-container">
                    <button
                        className="all-publications-load-more-btn"
                        onClick={handleLoadMore}
                    >
                        {t('publications.admin.loadMore')} {viewMode === 'publications' ? t('publications.admin.publications') : t('publications.admin.drafts')}
                    </button>
                </div>
            )}

            {contextLoading && (
                <div className="all-publications-loading-container">
                    <div className="all-publications-loading-spinner"></div>
                    <p>{t('publications.admin.loading')}</p>
                </div>
            )}

            {!contextLoading && filteredItems.length === 0 && (
                <div className="all-publications-empty-state">
                    <svg viewBox="0 0 24 24" fill="none" className="all-publications-empty-icon">
                        <path d="M19 21L12 16L5 21V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H17C17.5304 3 18.0391 3.21071 18.4142 3.58579C18.7893 3.96086 19 4.46957 19 5V21Z" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    <h3>{t('publications.admin.noItemsFound')} {viewMode === 'publications' ? t('publications.admin.publications') : t('publications.admin.drafts')}</h3>
                    <p>{t('publications.admin.tryChangingCriteria')}</p>
                </div>
            )}
        </div>
    );
};
