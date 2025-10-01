/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useCallback, useMemo } from 'react';
import './allStories.css';
import { useTranslation } from 'react-i18next';
import { useInitiativeContext } from '../../../contexts/InitiativeProvider';
import { notify } from '../../../../utils/notify';
import StoryForm from '../MainForm/MainFormStory';
import { StoryPubView } from '../../InitiativeView/StoryPubView/StoryPubView';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { transformStoryForDisplay } from '../utils/dataTransformationUtils';
import { StoriesSearchAdmin } from './CleanHystory/StoriesSearchAdmin/StoriesSearchAdmin';
import { StoriesHeaderAdmin } from './CleanHystory/StoriesHeaderAdmin/StoriesHeaderAdmin';

export const AllStories = () => {
    const { t } = useTranslation();
    const {
        getAllStories,
        stories = [],
        storiesHasMore = false,
        storiesCurrentPage = 1,
        isLoading: contextLoading = false,
        deleteStory,
        toggleStoryDraftStatus,
    } = useInitiativeContext();

    const [viewMode, setViewMode] = useState('stories');
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        category: 'all',
        sortBy: 'newest'
    });
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const [showPreview, setShowPreview] = useState(false);

    const [previewData, setPreviewData] = useState(null);
  // Form state
    // Form state
    const [formMode, setFormMode] = useState(null); // null, 'create', or 'edit'
    const [editingItem, setEditingItem] = useState(null);

    // Load data when viewMode changes
    useEffect(() => {
        const loadData = async () => {
            try {
                if (viewMode === 'create') {
                    return; // Don't load data for create mode
                }

                const isDraft = viewMode === 'drafts';
                await getAllStories(1, true, isDraft);
            } catch (error) {
                notify('error', 'Failed to load stories');
            }
        };

        loadData();
    }, [viewMode]);

    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape' && showPreview) {
                closePreview();
            }
        };

        const handleOutsideClick = (event) => {
            if (showPreview && event.target.classList.contains('story-preview-modal-overlay')) {
                closePreview();
            }
        };

        if (showPreview) {
            document.addEventListener('keydown', handleEscape);
            document.addEventListener('click', handleOutsideClick);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.removeEventListener('click', handleOutsideClick);
            document.body.style.overflow = 'unset';
        };
    }, [showPreview]);

    useEffect(() => {
        const handleGlobalClick = (event) => {
            if (!event.target.closest('.all-stories-card-actions')) {
                setOpenDropdownId(null);
            }
        };

        document.addEventListener('click', handleGlobalClick);
        return () => document.removeEventListener('click', handleGlobalClick);
    }, []);

    useEffect(() => {
        if (stories.length > 0) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [stories.length]);

    // Filter and sort stories
    const filteredItems = useMemo(() => {
        let filtered = [...stories];

        if (searchTerm) {
            filtered = filtered.filter(item =>
                item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.shortDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.authorEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.author?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (filters.category !== 'all') {
            filtered = filtered.filter(item => item.category === filters.category);
        }

        filtered.sort((a, b) => {
            switch (filters.sortBy) {
                case 'newest':
                    const dateA = a.publishedAt ? new Date(a.publishedAt) : new Date(a.createdAt);
                    const dateB = b.publishedAt ? new Date(b.publishedAt) : new Date(b.createdAt);
                    return dateB - dateA;
                case 'oldest':
                    const dateAOld = a.publishedAt ? new Date(a.publishedAt) : new Date(a.createdAt);
                    const dateBOld = b.publishedAt ? new Date(b.publishedAt) : new Date(b.createdAt);
                    return dateAOld - dateBOld;
                case 'updated':
                    return new Date(b.updatedAt) - new Date(a.updatedAt);
                case 'published':
                    const pubDateA = a.publishedAt ? new Date(a.publishedAt) : new Date(0);
                    const pubDateB = b.publishedAt ? new Date(b.publishedAt) : new Date(0);
                    return pubDateB - pubDateA;
                case 'likes':
                    return (b.likes || 0) - (a.likes || 0);
                case 'views':
                    return (b.views || 0) - (a.views || 0);
                default:
                    return 0;
            }
        });

        return filtered;
    }, [stories, searchTerm, filters]);


    const handleViewModeChange = (mode) => {
        if (mode === 'create') {
            setFormMode('create');
            setEditingItem(null);
            setViewMode('create');
            return;
        }

        setViewMode(mode);
        setFormMode(null);
        setSearchTerm('');
        setFilters({
            category: 'all',
            sortBy: 'newest'
        });
    };

    const handleSearch = (term) => {
        setSearchTerm(term);
    };

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
    };

    // Load more stories
    const handleLoadMore = useCallback(() => {
        if (storiesHasMore && !contextLoading && viewMode !== 'create') {
            const isDraft = viewMode === 'drafts';
            getAllStories(storiesCurrentPage + 1, false, isDraft);
        }
    }, [viewMode, storiesHasMore, storiesCurrentPage, contextLoading, getAllStories]);

    const formatDate = (dateString) => {
        if (!dateString) return t('stories.admin.noDate');
        const date = new Date(dateString);
        return date.toLocaleDateString('bg-BG', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const getPreviewData = (item) => {
        return transformStoryForDisplay(item, {
            includeConnections: true,
            isEditMode: formMode === 'edit',
            t: t
        });
    };

    // Show preview modal
    const handleShowPreview = (item) => {
        setPreviewData(getPreviewData(item));
        setShowPreview(true);
    };

    // Close preview modal
    const closePreview = () => {
        setShowPreview(false);
        setPreviewData(null);
    };

    // Perform actions on stories
    const performAction = async (action, item) => {
        setOpenDropdownId(null);
        const identifier = item.id;

        try {
            switch (action) {
                case 'view':
                    handleShowPreview(item);
                    break;

                case 'edit':
                    setEditingItem(item);
                    setFormMode('edit');
                    break;

                case 'delete':
                    const isDraft = item.isDraft;
                    const confirmMessage = isDraft
                        ? t('stories.admin.confirmDeleteDraft')
                        : t('stories.admin.confirmDeleteStory');

                    if (window.confirm(confirmMessage)) {
                        await deleteStory(identifier);
                        notify('success', isDraft
                            ? t('stories.admin.draftDeletedSuccess')
                            : t('stories.admin.storyDeletedSuccess')
                        );
                    }
                    break;

                case 'toggleDraft':
                    await toggleStoryDraftStatus(identifier);
                    notify('success', t('stories.admin.statusUpdatedSuccess'));
                    const isDraftView = viewMode === 'drafts';
                    await getAllStories(1, true, isDraftView);
                    break;

                default:
                    break;
            }
        } catch (error) {
            notify('error', t('stories.admin.actionError'));
        }
    };

    // Close form
    const handleCloseForm = async () => {
        setFormMode(null);
        setEditingItem(null);
        setViewMode('stories');

        try {
            const isDraft = viewMode === 'drafts';
            await getAllStories(1, true, isDraft);
        } catch (error) {
            notify('error', 'Failed to refresh stories');
        }
    };

    // Get status badge
    const getStatusBadge = (item) => {
        if (item.isDraft) {
            return <span className="all-stories-status-badge draft">{t('stories.admin.statusDraft')}</span>;
        } else {
            return <span className="all-stories-status-badge active">{t('stories.admin.statusPublished')}</span>;
        }
    };

    // Get default image
    const getDefaultImage = () => {
        return `data:image/svg+xml,${encodeURIComponent(`
    <svg width="400" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#1e293b"/>
      <text x="50%" y="50%" font-family="Arial" font-size="18" fill="#64748b" text-anchor="middle" dy=".3em">
        ${t('stories.preview.noImageAvailable')}
      </text>
    </svg>
  `)}`;
    };

    // Get category translation
    const getCategoryTranslation = (categoryKey) => {
        if (!categoryKey) return t('stories.categories.other');

        const translationKey = `stories.categories.${categoryKey}`;
        const translation = t(translationKey);

        if (translation === translationKey) {
            return categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1);
        }

        return translation;
    };

    return (
        <div className="all-stories-admin-container">
            {formMode && (
                <>
                    {formMode === 'create' && (
                        <StoriesHeaderAdmin
                            totalCount={0}
                            viewMode="create"
                            onViewModeChange={handleViewModeChange}
                            isLoading={false}
                        />
                    )}

                    <StoryForm
                        mode={formMode}
                        initialValues={editingItem}
                        onCancel={handleCloseForm}
                    />
                </>
            )}

            {!formMode && (
                <>
                    <StoriesHeaderAdmin
                        totalCount={stories.length}
                        viewMode={viewMode}
                        onViewModeChange={handleViewModeChange}
                        isLoading={contextLoading}
                    />

                    <StoriesSearchAdmin
                        onSearch={handleSearch}
                        onFilterChange={handleFilterChange}
                        filters={filters}
                        viewMode={viewMode}
                        totalCount={filteredItems.length}
                    />

                    <div className="all-stories-grid-admin">
                        {filteredItems.map((item) => (
                            <div key={`${viewMode}-${item.id}`} className="all-stories-card">
                                <div className="all-stories-card-header">
                                    <img
                                        src={item.mainImage?.src || item.logo || getDefaultImage()}
                                        alt={item.mainImage?.alt || item.title}
                                        className="all-stories-card-image"
                                        onError={(e) => {
                                            e.target.src = getDefaultImage();
                                        }}
                                    />
                                    <div className="all-stories-status-overlay">
                                        {getStatusBadge(item)}
                                    </div>
                                </div>

                                <div className="all-stories-card-body">
                                    <h3 className="all-stories-card-title">{item.title}</h3>
                                    <p className="all-stories-card-description">
                                        {item.shortDescription?.slice(0, 100)}...
                                    </p>

                                    <div className="all-stories-card-meta">
                                        <div className="all-stories-meta-item">
                                            <svg className="all-stories-meta-icon" viewBox="0 0 24 24" fill="none">
                                                <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" />
                                                <path d="M8.5 11C10.7091 11 12.5 9.20914 12.5 7C12.5 4.79086 10.7091 3 8.5 3C6.29086 3 4.5 4.79086 4.5 7C4.5 9.20914 6.29086 11 8.5 11Z" stroke="currentColor" strokeWidth="2" />
                                            </svg>
                                            <span>{item.author || item.authorEmail || t('stories.admin.unknownAuthor')}</span>
                                        </div>

                                        <div className="all-stories-meta-item">
                                            <svg className="all-stories-meta-icon" viewBox="0 0 24 24" fill="none">
                                                <path d="M8 2V6M16 2V6M3 10H21M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z" stroke="currentColor" strokeWidth="2" />
                                            </svg>
                                            <span>{formatDate(item.createdAt)}</span>
                                        </div>

                                        {item.publishedAt && (
                                            <div className="all-stories-meta-item">
                                                <svg className="all-stories-meta-icon" viewBox="0 0 24 24" fill="none">
                                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                                    <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" />
                                                </svg>
                                                <span>{formatDate(item.publishedAt)}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="all-stories-card-footer">
                                        <div className="all-stories-card-stats">
                                            {item.category && (
                                                <span className="all-stories-stat-badge">{getCategoryTranslation(item.category)}</span>
                                            )}
                                            {item.readTime && (
                                                <span className="all-stories-stat-badge">
                                                    {item.readTime} {t('stories.view.readTime')}
                                                </span>
                                            )}
                                            {item.views !== undefined && (
                                                <span className="all-stories-stat-badge">
                                                    {item.views} {item.views === 1 ? t('counts.view.singular') : t('counts.view.plural')}
                                                </span>
                                            )}
                                            {item.likes !== undefined && (
                                                <span className="all-stories-stat-badge">
                                                    {item.likes} {item.likes === 1 ? t('counts.like.singular') : t('counts.like.plural')}
                                                </span>
                                            )}
                                        </div>

                                        <div className="all-stories-card-actions">
                                            <button
                                                className="all-stories-action-menu-btn"
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
                                                <div className="all-stories-action-dropdown">
                                                    <button
                                                        className="all-stories-dropdown-item view"
                                                        onMouseDown={() => performAction('view', item)}
                                                    >
                                                        <svg viewBox="0 0 24 24" fill="none">
                                                            <path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" stroke="currentColor" strokeWidth="2" />
                                                            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                                                        </svg>
                                                        {t('stories.common.view')}
                                                    </button>

                                                    <button
                                                        className="all-stories-dropdown-item edit"
                                                        onMouseDown={() => performAction('edit', item)}
                                                    >
                                                        <svg viewBox="0 0 24 24" fill="none">
                                                            <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" />
                                                            <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.43741 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="currentColor" strokeWidth="2" />
                                                        </svg>
                                                        {t('stories.common.edit')}
                                                    </button>

                                                    <button
                                                        className="all-stories-dropdown-item toggle"
                                                        onMouseDown={() => performAction('toggleDraft', item)}
                                                    >
                                                        <svg viewBox="0 0 24 24" fill="none">
                                                            <path d="M9 14L4 9L9 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                            <path d="M4 9H16C18.2091 9 20 10.7909 20 13C20 15.2091 18.2091 17 16 17H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                        </svg>
                                                        {item.isDraft ? t('stories.common.publish') : t('stories.common.convertToDraft')}
                                                    </button>

                                                    <button
                                                        className="all-stories-dropdown-item delete"
                                                        onMouseDown={() => performAction('delete', item)}
                                                    >
                                                        <svg viewBox="0 0 24 24" fill="none">
                                                            <path d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" />
                                                            <path d="M10 11V17M14 11V17" stroke="currentColor" strokeWidth="2" />
                                                        </svg>
                                                        {t('stories.common.delete')}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {storiesHasMore && !contextLoading && (
                        <div className="all-stories-load-more-container">
                            <button
                                className="all-stories-load-more-btn"
                                onClick={handleLoadMore}
                            >
                                {t('stories.admin.loadMore')} {viewMode === 'stories' ? t('stories.admin.stories') : t('stories.admin.drafts')}
                            </button>
                        </div>
                    )}

                    {contextLoading && (
                        <div className="all-stories-loading-container">
                            <div className="all-stories-loading-spinner"></div>
                            <p>{t('stories.admin.loading')}</p>
                        </div>
                    )}

                    {!contextLoading && filteredItems.length === 0 && (
                        <div className="all-stories-empty-state">
                            <svg viewBox="0 0 24 24" fill="none" className="all-stories-empty-icon">
                                <path d="M19 21L12 16L5 21V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H17C17.5304 3 18.0391 3.21071 18.4142 3.58579C18.7893 3.96086 19 4.46957 19 5V21Z" stroke="currentColor" strokeWidth="2" />
                            </svg>
                            <h3>{t('stories.admin.noItemsFound')}</h3>
                            <p>{t('stories.admin.tryChangingCriteria')}</p>
                        </div>
                    )}
                </>
            )}

            {/* Preview Modal */}
            {showPreview && previewData && (
                <div className="story-preview-modal-overlay">
                    <div className="story-preview-modal-content">
                        <div className="story-preview-modal-header">
                            <button
                                className="story-preview-close-btn"
                                onClick={closePreview}
                            >
                                <FontAwesomeIcon icon={faArrowLeft} />
                                {t('stories.common.back')}
                            </button>
                            <h2>{t('stories.preview.previewMode')}</h2>
                        </div>
                        <div className="story-preview-modal-body">
                            <StoryPubView
                                type="story"
                                previewMode={true}
                                previewData={previewData}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
