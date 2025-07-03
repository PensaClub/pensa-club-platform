// components/AdminDashboard/AllInitiatives/AllInitiatives.js
import React, { useEffect, useState, useCallback } from 'react';
import { InitiativesSearchAdmin } from './InitiativesSearchAdmin/InitiativesSearchAdmin';
import './allInitiatives.css';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useInitiativeContext } from '../../contexts/InitiativeProvider';
import { notify } from '../../../utils/notify';

export const AllInitiatives = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    getAllInitiatives,
    getAllDrafts,
    deleteInitiative,
    deleteDraftInitiative,
    toggleDraftStatus,
    initiatives,
    drafts,
    isLoading,
    hasMore,
    draftsHasMore,
    currentPage,
    draftsCurrentPage,
  } = useInitiativeContext();

  const [viewMode, setViewMode] = useState('initiatives');
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    sortBy: 'newest'
  });
  const [openDropdownId, setOpenDropdownId] = useState(null);

  useEffect(() => {
    if (viewMode === 'initiatives' && initiatives.length === 0) {
      getAllInitiatives(1, true);
    } else if (viewMode === 'drafts' && drafts.length === 0) {
      getAllDrafts(1, true);
    }
  }, [viewMode, initiatives.length, drafts.length]);

  // Global click handler to close dropdown
  useEffect(() => {
    const handleGlobalClick = (event) => {
      // Ако кликнем извън dropdown областта, затваряме го
      if (!event.target.closest('.card-actions-admin')) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, []);

  // Filter items
  useEffect(() => {
    const items = viewMode === 'initiatives' ? initiatives : drafts;
    let filtered = [...items];

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.shortDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.userEmail?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (viewMode === 'initiatives' && filters.status !== 'all') {
      filtered = filtered.filter(item => {
        if (filters.status === 'active') return item.status === 'active';
        if (filters.status === 'completed') return item.status === 'completed';
        if (filters.status === 'paused') return item.status === 'paused';
        return true;
      });
    }

    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'updated':
          return new Date(b.updatedAt) - new Date(a.updatedAt);
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    setFilteredItems(filtered);
  }, [initiatives, drafts, searchTerm, filters, viewMode]);

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    setSearchTerm('');
    setFilters({ status: 'all', sortBy: 'newest' });
    setOpenDropdownId(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('bg-BG', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleLoadMore = useCallback(() => {
    if (viewMode === 'initiatives' && hasMore && !isLoading) {
      getAllInitiatives(currentPage + 1);
    } else if (viewMode === 'drafts' && draftsHasMore && !isLoading) {
      getAllDrafts(draftsCurrentPage + 1);
    }
  }, [
    viewMode,
    hasMore,
    draftsHasMore,
    isLoading,
    currentPage,
    draftsCurrentPage,
    getAllInitiatives,
    getAllDrafts
  ]);

  // Action handlers
  const performAction = async (action, item) => {
    setOpenDropdownId(null);
    const identifier = item.slug || item.id;

    try {
      switch (action) {
        case 'view':
          if (viewMode === 'initiatives') {
            navigate(`/initiatives/${identifier}`);
          } else {
            navigate(`/profile/initiative-create?draftId=${identifier}`);
          }
          break;

        case 'edit':
          if (viewMode === 'drafts') {
            navigate(`/profile/initiative-create?draftId=${identifier}`);
          } else {
            navigate(`/profile/initiative-create?editId=${identifier}&mode=edit`);
          }
          break;

        case 'delete':
          const isDraft = viewMode === 'drafts';
          const confirmMessage = isDraft
            ? t('initiatives.admin.confirmDeleteDraft')
            : t('initiatives.admin.confirmDeleteInitiative');

          if (window.confirm(confirmMessage)) {
            if (isDraft) {
              await deleteDraftInitiative(identifier, item);
              notify('success', t('initiatives.admin.draftDeletedSuccess'));
              getAllDrafts(1, true);
            } else {
              await deleteInitiative(identifier);
              notify('success', t('initiatives.admin.initiativeDeletedSuccess'));
              getAllInitiatives(1, true);
            }
          }
          break;

        case 'publish':
          if (window.confirm(t('initiatives.admin.confirmPublishDraft'))) {
            await toggleDraftStatus(identifier);
            notify('success', t('initiatives.admin.draftPublishedSuccess'));
            getAllDrafts(1, true);
            getAllInitiatives(1, true);
            setViewMode('initiatives');
          }
          break;

        default:
          break;
      }
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
      notify('error', t('initiatives.admin.deleteError'));
    }
  };

  const getStatusBadge = (item) => {
    if (viewMode === 'drafts') {
      return <span className="status-badge draft">{t('initiatives.admin.statusDraft')}</span>;
    }

    switch (item.status) {
      case 'active':
        return <span className="status-badge active">{t('initiatives.admin.statusActive')}</span>;
      case 'completed':
        return <span className="status-badge completed">{t('initiatives.admin.statusCompleted')}</span>;
      case 'paused':
        return <span className="status-badge paused">{t('initiatives.admin.statusPaused')}</span>;
      default:
        return <span className="status-badge default">{t('initiatives.admin.statusUnknown')}</span>;
    }
  };

  const getDefaultImage = () => {
    return 'https://via.placeholder.com/400x200/f7fafc/718096?text=Няма+изображение';
  };

  return (
    <div className="all-initiatives-admin">
      <InitiativesSearchAdmin
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        totalCount={viewMode === 'initiatives' ? initiatives.length : drafts.length}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
      />

      <div className="initiatives-grid-admin">
        {filteredItems.map((item) => (
          <div key={`${viewMode}-${item.id}`} className="initiative-card-admin">
            <div className="card-header-admin">
              <img
                src={item.mainImage?.src || item.logo || getDefaultImage()}
                alt={item.title}
                className="card-image-admin"
                onError={(e) => {
                  e.target.src = getDefaultImage();
                }}
              />
              <div className="card-status-overlay">
                {getStatusBadge(item)}
              </div>
            </div>

            <div className="card-body-admin">
              <h3 className="card-title-admin">{item.title}</h3>
              <p className="card-description-admin">
                {item.shortDescription?.slice(0, 100)}...
              </p>

              <div className="card-meta-admin">
                <div className="meta-item-admin">
                  <svg className="meta-icon-admin" viewBox="0 0 24 24" fill="none">
                    <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" />
                    <path d="M8.5 11C10.7091 11 12.5 9.20914 12.5 7C12.5 4.79086 10.7091 3 8.5 3C6.29086 3 4.5 4.79086 4.5 7C4.5 9.20914 6.29086 11 8.5 11Z" stroke="currentColor" strokeWidth="2" />
                  </svg>
                  <span>{item.userEmail || t('initiatives.admin.unknownAuthor')}</span>
                </div>

                <div className="meta-item-admin">
                  <svg className="meta-icon-admin" viewBox="0 0 24 24" fill="none">
                    <path d="M8 2V6M16 2V6M3 10H21M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z" stroke="currentColor" strokeWidth="2" />
                  </svg>
                  <span>{formatDate(item.createdAt)}</span>
                </div>
              </div>

              <div className="card-footer-admin">
                <div className="card-stats-admin">
                  {item.category && (
                    <span className="stat-badge-admin">{item.category}</span>
                  )}
                  {item.priority && (
                    <span className={`priority-badge-admin ${item.priority.toLowerCase()}`}>
                      {item.priority}
                    </span>
                  )}
                </div>

                <div className="card-actions-admin">
                  <button
                    className="action-menu-btn"
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
                    <div className="action-dropdown">
                      <button
                        className="dropdown-item view"
                        onMouseDown={() => performAction('view', item)}
                      >
                        <svg viewBox="0 0 24 24" fill="none">
                          <path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" stroke="currentColor" strokeWidth="2" />
                          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                        </svg>
                        {t('initiatives.admin.view')}
                      </button>

                      <button
                        className="dropdown-item edit"
                        onMouseDown={() => performAction('edit', item)}
                      >
                        <svg viewBox="0 0 24 24" fill="none">
                          <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" />
                          <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.43741 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="currentColor" strokeWidth="2" />
                        </svg>
                        {t('initiatives.admin.edit')}
                      </button>

                      {viewMode === 'drafts' && (
                        <button
                          className="dropdown-item publish"
                          onMouseDown={() => performAction('publish', item)}
                        >
                          <svg viewBox="0 0 24 24" fill="none">
                            <path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          {t('initiatives.admin.publish')}
                        </button>
                      )}

                      <button
                        className="dropdown-item delete"
                        onMouseDown={() => performAction('delete', item)}
                      >
                        <svg viewBox="0 0 24 24" fill="none">
                          <path d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" />
                          <path d="M10 11V17M14 11V17" stroke="currentColor" strokeWidth="2" />
                        </svg>
                        {t('initiatives.admin.delete')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {((viewMode === 'initiatives' && hasMore) || (viewMode === 'drafts' && draftsHasMore)) && !isLoading && (
        <div className="load-more-container-admin">
          <button
            className="load-more-btn-admin"
            onClick={handleLoadMore}
          >
            {t('initiatives.admin.loadMore')} {viewMode === 'initiatives' ? t('initiatives.admin.initiatives') : t('initiatives.admin.drafts')}
          </button>
        </div>
      )}

      {isLoading && (
        <div className="loading-container-admin">
          <div className="loading-spinner-admin"></div>
          <p>{t('initiatives.admin.loading')}</p>
        </div>
      )}

      {!isLoading && filteredItems.length === 0 && (
        <div className="empty-state-admin">
          <svg viewBox="0 0 24 24" fill="none" className="empty-icon-admin">
            <path d="M9 2L3 8V16C3 17.1 3.9 18 5 18H19C20.1 18 21 17.1 21 16V8L15 2H9Z" stroke="currentColor" strokeWidth="2" />
            <path d="M9 2V8H15" stroke="currentColor" strokeWidth="2" />
            <path d="M12 11V17M9 14H15" stroke="currentColor" strokeWidth="2" />
          </svg>
          <h3>{t('initiatives.admin.noItemsFound')} {viewMode === 'initiatives' ? t('initiatives.admin.initiatives') : t('initiatives.admin.drafts')}</h3>
          <p>{t('initiatives.admin.tryChangingCriteria')}</p>
        </div>
      )}
    </div>
  );
};