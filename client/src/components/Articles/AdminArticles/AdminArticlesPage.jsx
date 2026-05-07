import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import { useArticleContext } from '../../contexts/ArticleContext';
import { useAnalytics } from '../../contexts/AnalyticsContext';
import { LocalizedLink } from '../../LocalizedLink/LocalizedLink';

import Pagination from '../Pagination/Pagination';
import AdminArticlesToolbar from './AdminArticlesToolbar/AdminArticlesToolbar';
import AdminArticleCard from './AdminArticleCard/AdminArticleCard';
import AdminArticleListRow from './AdminArticleListRow/AdminArticleListRow';
import AdminArticlesEmptyState from './AdminArticlesEmptyState/AdminArticlesEmptyState';
import AdminArticlesSkeleton from './AdminArticlesSkeleton/AdminArticlesSkeleton';
import DeleteConfirmModal from './DeleteConfirmModal/DeleteConfirmModal';

import { serializeAdminParams } from './adminArticlesUtils';
import './adminArticlesPage.css';

const VIEW_MODE_KEY = 'adminArticles.viewMode';
const LIMIT_KEY = 'adminArticles.limit';

const DEFAULT_FILTERS = {
  page: 1,
  limit: 6,
  sort: 'updatedAt',
  order: 'desc',
  status: 'all',
  search: '',
  author: '',
  tag: '',
  dateFrom: '',
  dateTo: '',
};

const ALLOWED_LIMITS = [6, 12, 24, 48];

/**
 * AdminArticlesPage — Phase 2 redesign of the admin articles list.
 *
 * Phase 3 prep:
 * - Selection state will live alongside `filters` in this component (just
 *   add a `selectedIds` set + a sticky bulk-action bar). Card/Row already
 *   isolate their action buttons via `stopPropagation`, so a top-left
 *   checkbox layer can be added without breaking click-to-edit.
 * - Quick Preview slide-in panel will share the existing fetch/state — pass
 *   a `previewArticleId` and render a sibling drawer.
 */
const AdminArticlesPage = () => {
  const { t } = useTranslation('adminArticles');
  const { getArticlesPaginated, updateArticleStatus, deleteArticle } = useArticleContext();
  const { loadArticleViewCounts } = useAnalytics();

  // Persisted prefs
  const initialViewMode = (() => {
    try {
      const saved = window.localStorage.getItem(VIEW_MODE_KEY);
      return saved === 'list' || saved === 'grid' ? saved : 'grid';
    } catch {
      return 'grid';
    }
  })();
  const initialLimit = (() => {
    try {
      const saved = parseInt(window.localStorage.getItem(LIMIT_KEY), 10);
      return ALLOWED_LIMITS.includes(saved) ? saved : DEFAULT_FILTERS.limit;
    } catch {
      return DEFAULT_FILTERS.limit;
    }
  })();

  const [viewMode, setViewMode] = useState(initialViewMode);
  const [filters, setFilters] = useState({ ...DEFAULT_FILTERS, limit: initialLimit });

  // Server response state
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null); // id whose toggle/delete is in flight
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Persist viewMode + limit
  useEffect(() => {
    try { window.localStorage.setItem(VIEW_MODE_KEY, viewMode); } catch { /* ignore */ }
  }, [viewMode]);
  useEffect(() => {
    try { window.localStorage.setItem(LIMIT_KEY, String(filters.limit)); } catch { /* ignore */ }
  }, [filters.limit]);

  // ─── URL hash ↔ pagination sync ──────────────────────────────────────
  // Mirror the proven pattern from ArticlesList.jsx / AllArticles.jsx so
  // refresh on /profile/articles#page=3 lands on page 3.
  const parsePageFromHash = useCallback(() => {
    const m = (typeof window !== 'undefined' ? window.location.hash : '').match(/page=(\d+)/);
    if (!m) return 1;
    const n = parseInt(m[1], 10);
    return Number.isFinite(n) && n >= 1 ? n : 1;
  }, []);

  const writePageToHash = useCallback((pageNumber, { push = false } = {}) => {
    if (typeof window === 'undefined') return;
    const url = `${window.location.pathname}${window.location.search}${pageNumber > 1 ? `#page=${pageNumber}` : ''}`;
    if (push) {
      window.history.pushState(null, '', url);
    } else {
      window.history.replaceState(null, '', url);
    }
  }, []);

  // Seed page from hash on first mount.
  const seededRef = useRef(false);
  useEffect(() => {
    if (seededRef.current) return;
    seededRef.current = true;
    const fromHash = parsePageFromHash();
    if (fromHash > 1) {
      setFilters((f) => ({ ...f, page: fromHash }));
    }
  }, [parsePageFromHash]);

  // After we know totalPages, clamp the page if the hash points beyond range.
  useEffect(() => {
    if (totalPages < 1) return;
    if (filters.page > totalPages) {
      const next = totalPages;
      setFilters((f) => ({ ...f, page: next }));
      writePageToHash(next);
    } else {
      // Keep the hash in sync with the current page (replaceState only).
      writePageToHash(filters.page);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPages]);

  // Browser back/forward sync.
  useEffect(() => {
    const onHashChange = () => {
      const next = Math.min(Math.max(parsePageFromHash(), 1), Math.max(totalPages, 1));
      setFilters((f) => (f.page === next ? f : { ...f, page: next }));
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [totalPages, parsePageFromHash]);

  // Reset to page 1 + clean hash when non-page filters change. Skip the
  // FIRST render so the hash-seed has a chance to take effect.
  const filtersInitedRef = useRef(false);
  useEffect(() => {
    if (!filtersInitedRef.current) {
      filtersInitedRef.current = true;
      return;
    }
    setFilters((f) => (f.page === 1 ? f : { ...f, page: 1 }));
    writePageToHash(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.search, filters.status, filters.sort, filters.order,
    filters.author, filters.tag, filters.dateFrom, filters.dateTo, filters.limit,
  ]);

  // ─── Server fetch ────────────────────────────────────────────────────
  const fetchData = useCallback(async (params) => {
    setLoading(true);
    try {
      const resp = await getArticlesPaginated(serializeAdminParams(params));
      const safeItems = Array.isArray(resp?.items) ? resp.items : [];
      setItems(safeItems);
      setTotal(Number.isFinite(resp?.total) ? resp.total : 0);
      setTotalPages(Number.isFinite(resp?.totalPages) ? resp.totalPages : 0);

      if (safeItems.length > 0 && typeof loadArticleViewCounts === 'function') {
        loadArticleViewCounts(safeItems.map((a) => a.id));
      }
    } catch (e) {
      console.error('Fetch admin articles failed:', e);
      toast.error(t('error.fetchFailed'), { role: 'alert' });
      setItems([]);
      setTotal(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [getArticlesPaginated, loadArticleViewCounts, t]);

  // Refetch on any relevant filter change.
  useEffect(() => {
    fetchData(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.page, filters.limit, filters.sort, filters.order, filters.status,
    filters.search, filters.author, filters.tag, filters.dateFrom, filters.dateTo,
  ]);

  // ─── Page change ─────────────────────────────────────────────────────
  const gridSectionRef = useRef(null);

  const handlePageChange = (pageNumber) => {
    setFilters((f) => ({ ...f, page: pageNumber }));
    writePageToHash(pageNumber, { push: true });
    // Smooth-scroll to top of the grid section so the user knows the page
    // changed even on long lists.
    requestAnimationFrame(() => {
      if (gridSectionRef.current) {
        const top = gridSectionRef.current.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({ top, behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  };

  // ─── Toolbar callbacks ───────────────────────────────────────────────
  const handleFiltersChange = (patch) => {
    setFilters((f) => ({ ...f, ...patch }));
  };

  const handleViewModeChange = (next) => {
    setViewMode(next);
  };

  // ─── Item action callbacks ───────────────────────────────────────────
  const handleToggleVisibility = async (article, nextStatus) => {
    setBusyId(article.id);
    try {
      const updated = await updateArticleStatus(article.id, nextStatus);
      if (!updated) {
        toast.error(t('toggleVisibility.error'), { role: 'alert' });
        return;
      }
      // Optimistic local update
      setItems((arr) => arr.map((a) => (a.id === article.id ? { ...a, status: nextStatus } : a)));
      const key = nextStatus === 'published' ? 'successPublished'
        : nextStatus === 'archived' ? 'successArchived' : 'successDraft';
      toast.success(t(`toggleVisibility.${key}`), { role: 'alert' });
    } catch {
      toast.error(t('toggleVisibility.error'), { role: 'alert' });
    } finally {
      setBusyId(null);
    }
  };

  const handleDeleteRequest = (article) => {
    setPendingDelete(article);
  };

  const handleDeleteConfirm = async () => {
    if (!pendingDelete) return;
    setDeleteLoading(true);
    setBusyId(pendingDelete.id);
    try {
      const ok = await deleteArticle(pendingDelete.id);
      if (ok) {
        toast.success(t('delete.successToast'), { role: 'alert' });
        setPendingDelete(null);
        // Refetch — total count may move us off the last page.
        fetchData(filters);
      } else {
        toast.error(t('delete.errorToast'), { role: 'alert' });
      }
    } catch {
      toast.error(t('delete.errorToast'), { role: 'alert' });
    } finally {
      setDeleteLoading(false);
      setBusyId(null);
    }
  };

  const handleDeleteCancel = () => {
    if (deleteLoading) return;
    setPendingDelete(null);
  };

  // ─── Author / tag option lists ───────────────────────────────────────
  const authorOptions = useMemo(() => {
    const set = new Set();
    items.forEach((a) => { if (a.author) set.add(a.author); });
    return Array.from(set).sort();
  }, [items]);

  const tagOptions = useMemo(() => {
    const set = new Set();
    items.forEach((a) => {
      if (Array.isArray(a.tags)) a.tags.forEach((t) => t && set.add(t));
    });
    return Array.from(set).sort();
  }, [items]);

  // ─── Render ──────────────────────────────────────────────────────────
  const hasActiveFilters = Boolean(
    (filters.search && filters.search.trim()) ||
    (filters.status && filters.status !== 'all') ||
    filters.author ||
    filters.tag ||
    filters.dateFrom ||
    filters.dateTo
  );

  const clearFilters = () => {
    setFilters((f) => ({
      ...f,
      search: '',
      status: 'all',
      author: '',
      tag: '',
      dateFrom: '',
      dateTo: '',
      page: 1,
    }));
  };

  return (
    <div className="aap-wrap">
      <div className="aap-header">
        <div className="aap-header-text">
          <h1 className="aap-title">{t('page.title')}</h1>
          <p className="aap-total">{t('page.totalCount', { count: total })}</p>
        </div>
        <LocalizedLink to="/profile/article-create" className="aap-cta">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span>{t('page.newArticle')}</span>
        </LocalizedLink>
      </div>

      <AdminArticlesToolbar
        filters={filters}
        onChange={handleFiltersChange}
        authorOptions={authorOptions}
        tagOptions={tagOptions}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        totalCount={total}
      />

      {totalPages > 1 && (
        <div className="aap-pagination-top">
          <Pagination
            currentPage={filters.page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      <div ref={gridSectionRef} className="aap-grid-section">
        {loading ? (
          <AdminArticlesSkeleton count={Math.min(filters.limit, 8)} viewMode={viewMode} />
        ) : items.length === 0 ? (
          <AdminArticlesEmptyState
            hasActiveFilters={hasActiveFilters}
            onClearFilters={clearFilters}
          />
        ) : viewMode === 'grid' ? (
          <div className="aap-grid">
            {items.map((article) => (
              <AdminArticleCard
                key={article.id}
                article={article}
                onDeleteRequest={handleDeleteRequest}
                onToggleVisibility={handleToggleVisibility}
                busy={busyId === article.id}
              />
            ))}
          </div>
        ) : (
          <div className="aap-list">
            {items.map((article) => (
              <AdminArticleListRow
                key={article.id}
                article={article}
                onDeleteRequest={handleDeleteRequest}
                onToggleVisibility={handleToggleVisibility}
                busy={busyId === article.id}
              />
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="aap-pagination-bottom">
          <Pagination
            currentPage={filters.page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      <DeleteConfirmModal
        open={Boolean(pendingDelete)}
        title={t('delete.title')}
        message={t('delete.message', { title: pendingDelete?.title || '' })}
        cancelLabel={t('delete.cancel')}
        confirmLabel={t('delete.confirm')}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
        variant="danger"
      />
    </div>
  );
};

export default AdminArticlesPage;
