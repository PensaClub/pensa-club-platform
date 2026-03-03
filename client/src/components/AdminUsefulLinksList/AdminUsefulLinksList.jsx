import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocalizedNavigate } from '../../hooks/useLocalizedNavigate';
import { useUsefulLinksContext } from '../contexts/UsefulLinksContext';
import { notify } from '../../utils/notify';
import { Loader } from '../Loader/Loader';
import './adminUsefulLinksList.css';

const DEFAULT_CATEGORIES = [
  'general', 'health', 'finance', 'government', 'education',
  'entertainment', 'technology', 'social', 'transport', 'communication',
];

const AdminUsefulLinksList = () => {
  const { t } = useTranslation('useful-links');
  const navigate = useLocalizedNavigate();
  const { fetchAdminLinks, deleteLink, toggleActive } = useUsefulLinksContext();

  const [links, setLinks] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [isLoading, setIsLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [knownCategories, setKnownCategories] = useState([]);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timeout);
  }, [search]);

  const fetchLinks = useCallback(async (page = 1) => {
    try {
      setIsLoading(true);
      const data = await fetchAdminLinks(page, 12, debouncedSearch, category, status, sortBy);
      const fetchedLinks = data.links || [];
      setLinks(fetchedLinks);
      setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });

      const newCats = fetchedLinks.map(l => l.category).filter(Boolean);
      setKnownCategories(prev => {
        const merged = new Set([...prev, ...newCats]);
        return [...merged].sort();
      });
    } catch (err) {
      console.error('Error fetching admin links:', err);
    } finally {
      setIsLoading(false);
    }
  }, [fetchAdminLinks, debouncedSearch, category, status, sortBy]);

  useEffect(() => {
    fetchLinks(1);
  }, [debouncedSearch, status, category, sortBy]);

  const availableCategories = useMemo(() => {
    const all = new Set([...DEFAULT_CATEGORIES, ...knownCategories]);
    return [...all].sort();
  }, [knownCategories]);

  const getCategoryLabel = (cat) => {
    const translated = t(`categories.${cat}`, { defaultValue: '' });
    if (translated && translated !== `categories.${cat}` && translated !== '') return translated;
    return cat.charAt(0).toUpperCase() + cat.slice(1);
  };

  const handleDelete = async (id) => {
    const success = await deleteLink(id);
    if (success) {
      notify('success', t('admin.toast.deleted'));
      setDeleteModal(null);
      fetchLinks(pagination.page);
    }
  };

  const handleToggleActive = async (id) => {
    setActionLoading(id);
    try {
      const result = await toggleActive(id);
      if (result) {
        notify('success', t('admin.toast.toggledActive'));
        fetchLinks(pagination.page);
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchLinks(newPage);
    }
  };

  return (
    <div className="aull-page">
      <div className="aull-container">
        {/* Header */}
        <div className="aull-header">
          <div>
            <h1 className="aull-title">{t('admin.title')}</h1>
            <p className="aull-subtitle">{pagination.total} {t('admin.title').toLowerCase()}</p>
          </div>
          <button
            className="aull-create-btn"
            onClick={() => navigate('/admin/useful-links/create')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            {t('admin.actions.create')}
          </button>
        </div>

        {/* Filters */}
        <div className="aull-filters">
          <div className="aull-search-wrapper">
            <svg className="aull-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              className="aull-search"
              placeholder={t('admin.filters.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="aull-filter-group">
            {/* Status chips */}
            <div className="aull-chips">
              {['all', 'active', 'inactive'].map(s => (
                <button
                  key={s}
                  className={`aull-chip ${status === s ? 'aull-chip-active' : ''}`}
                  onClick={() => setStatus(s)}
                >
                  {t(`admin.filters.${s}`)}
                </button>
              ))}
            </div>

            {/* Category filter - dynamic */}
            <select
              className="aull-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="all">{t('admin.filters.all')}</option>
              {availableCategories.map(cat => (
                <option key={cat} value={cat}>{getCategoryLabel(cat)}</option>
              ))}
            </select>

            {/* Sort */}
            <select
              className="aull-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">{t('admin.filters.newest')}</option>
              <option value="oldest">{t('admin.filters.oldest')}</option>
              <option value="name">{t('admin.filters.name')}</option>
              <option value="mostViewed">{t('admin.filters.mostViewed')}</option>
            </select>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <Loader />
        ) : links.length > 0 ? (
          <>
            <div className="aull-grid">
              {links.map(link => (
                <div key={link.id} className={`aull-card ${!link.isActive ? 'aull-card-inactive' : ''}`}>
                  {link.imageUrl && (
                    <div className="aull-card-image-wrapper">
                      <img src={link.imageUrl} alt={link.title} className="aull-card-image" />
                    </div>
                  )}
                  <div className="aull-card-body">
                    <div className="aull-card-top">
                      <span className={`aull-status-dot ${link.isActive ? 'aull-status-active' : 'aull-status-inactive'}`}></span>
                      <span className="aull-card-category">{getCategoryLabel(link.category)}</span>
                    </div>
                    <h3 className="aull-card-title">{link.title}</h3>
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="aull-card-url">
                      {link.url.length > 40 ? link.url.substring(0, 40) + '...' : link.url}
                    </a>
                    <div className="aull-card-stats">
                      <span className="aull-card-views">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                        {link.viewCount || 0}
                      </span>
                    </div>
                  </div>
                  <div className="aull-card-actions">
                    <button
                      className="aull-action-btn aull-action-edit"
                      onClick={() => navigate(`/admin/useful-links/edit/${link.id}`)}
                      title={t('admin.actions.edit')}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      className={`aull-action-btn aull-action-toggle ${!link.isActive ? 'aull-toggle-off' : ''}`}
                      onClick={() => handleToggleActive(link.id)}
                      disabled={actionLoading === link.id}
                      title={t('admin.actions.toggleActive')}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        {link.isActive ? (
                          <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>
                        ) : (
                          <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></>
                        )}
                      </svg>
                    </button>
                    <button
                      className="aull-action-btn aull-action-delete"
                      onClick={() => setDeleteModal(link)}
                      title={t('admin.actions.delete')}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="aull-pagination">
                <button
                  className="aull-page-btn"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
                <span className="aull-page-info">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <button
                  className="aull-page-btn"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="aull-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            <p>{t('admin.noLinks')}</p>
          </div>
        )}

        {/* Delete Modal */}
        {deleteModal && (
          <div className="aull-modal-overlay" onClick={() => setDeleteModal(null)}>
            <div className="aull-modal" onClick={(e) => e.stopPropagation()}>
              <h3 className="aull-modal-title">{t('admin.actions.delete')}</h3>
              <p className="aull-modal-text">{t('admin.confirmDelete')}</p>
              <p className="aull-modal-link-name">{deleteModal.title}</p>
              <div className="aull-modal-actions">
                <button className="aull-btn aull-btn-cancel" onClick={() => setDeleteModal(null)}>
                  {t('admin.actions.cancel')}
                </button>
                <button className="aull-btn aull-btn-danger" onClick={() => handleDelete(deleteModal.id)}>
                  {t('admin.actions.delete')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsefulLinksList;
