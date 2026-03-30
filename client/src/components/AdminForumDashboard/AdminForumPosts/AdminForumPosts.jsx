// src/components/AdminForumDashboard/AdminForumPosts/AdminForumPosts.jsx
// Prefix: afp-

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { forumServiceFactory } from '../../Services/forumServiceFactory';
import { toast } from 'react-toastify';
import {
  Search,
  Check,
  X,
  EyeOff,
  Pin,
  Lock,
  Unlock,
  Trash2,
  Award,
  ChevronLeft,
  ChevronRight,
  Filter,
  MoreHorizontal,
  RefreshCw,
  Eye,
} from 'lucide-react';
import './adminForumPosts.css';

const STATUS_OPTIONS = ['all', 'published', 'pending', 'hidden', 'rejected'];
const TYPE_OPTIONS = ['all', 'discussion', 'question', 'poll', 'article'];

const AdminForumPosts = () => {
  const { t } = useTranslation('admin');
  const forumService = forumServiceFactory();

  const [posts, setPosts] = useState([]);
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [spaceFilter, setSpaceFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchPosts = useCallback(async (p = 1) => {
    try {
      setLoading(true);
      const params = { page: p, limit: 20 };
      if (status !== 'all') params.status = status;
      if (spaceFilter !== 'all') params.spaceId = spaceFilter;
      if (typeFilter !== 'all') params.type = typeFilter;
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();

      const data = await forumService.adminGetPosts(params);
      setPosts(data.posts || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
      setPage(p);
      setSelected([]);
    } catch {
      toast.error(t('forum.posts.loadError', 'Error loading posts'));
    } finally {
      setLoading(false);
    }
  }, [status, spaceFilter, typeFilter, debouncedSearch]);

  const fetchSpaces = useCallback(async () => {
    try {
      const data = await forumService.adminGetSpaces();
      setSpaces(data.spaces || data || []);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    fetchSpaces();
  }, [fetchSpaces]);

  useEffect(() => {
    fetchPosts(1);
  }, [fetchPosts]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      setActionLoading(id);
      await forumService.adminUpdatePostStatus(id, { status: newStatus });
      toast.success(t('forum.posts.statusUpdated', 'Status updated'));
      fetchPosts(page);
    } catch {
      toast.error(t('forum.posts.actionError', 'Action failed'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleTogglePin = async (id) => {
    try {
      setActionLoading(id);
      await forumService.adminTogglePin(id);
      toast.success(t('forum.posts.pinToggled', 'Pin toggled'));
      fetchPosts(page);
    } catch {
      toast.error(t('forum.posts.actionError', 'Action failed'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleLock = async (id) => {
    try {
      setActionLoading(id);
      await forumService.adminToggleLock(id);
      toast.success(t('forum.posts.lockToggled', 'Lock toggled'));
      fetchPosts(page);
    } catch {
      toast.error(t('forum.posts.actionError', 'Action failed'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('forum.posts.confirmDelete', 'Delete this post?'))) return;
    try {
      setActionLoading(id);
      await forumService.adminDeletePost(id);
      toast.success(t('forum.posts.deleted', 'Post deleted'));
      fetchPosts(page);
    } catch {
      toast.error(t('forum.posts.actionError', 'Action failed'));
    } finally {
      setActionLoading(null);
    }
  };

  const handlePostOfWeek = async (id) => {
    try {
      setActionLoading(id);
      await forumService.adminSetPostOfWeek(id);
      toast.success(t('forum.posts.postOfWeek', 'Post of the week set'));
      fetchPosts(page);
    } catch {
      toast.error(t('forum.posts.actionError', 'Action failed'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleSelectAll = () => {
    if (selected.length === posts.length) {
      setSelected([]);
    } else {
      setSelected(posts.map((p) => p.id));
    }
  };

  const handleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selected.length === 0) return;
    if (!window.confirm(t('forum.posts.confirmBulk', 'Apply action to selected posts?'))) return;
    try {
      await forumService.adminBulkAction({ action: bulkAction, postIds: selected });
      toast.success(t('forum.posts.bulkSuccess', 'Bulk action applied'));
      setBulkAction('');
      setSelected([]);
      fetchPosts(page);
    } catch {
      toast.error(t('forum.posts.actionError', 'Action failed'));
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('bg-BG', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="afp-container">
      {/* Filter bar */}
      <div className="afp-filters">
        <div className="afp-search-wrap">
          <Search size={16} className="afp-search-icon" />
          <input
            type="text"
            className="afp-search"
            placeholder={t('forum.posts.searchPlaceholder', 'Search posts...')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="afp-select" value={status} onChange={(e) => setStatus(e.target.value)}>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {t(`forum.posts.status.${s}`, s)}
            </option>
          ))}
        </select>
        <select className="afp-select" value={spaceFilter} onChange={(e) => setSpaceFilter(e.target.value)}>
          <option value="all">{t('forum.posts.allSpaces', 'All Spaces')}</option>
          {spaces.map((sp) => (
            <option key={sp.id} value={sp.id}>{sp.name}</option>
          ))}
        </select>
        <select className="afp-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          {TYPE_OPTIONS.map((tp) => (
            <option key={tp} value={tp}>
              {t(`forum.posts.type.${tp}`, tp)}
            </option>
          ))}
        </select>
        <button className="afp-refresh-btn" onClick={() => fetchPosts(page)} title="Refresh">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Bulk action bar */}
      {selected.length > 0 && (
        <div className="afp-bulk-bar">
          <span className="afp-bulk-count">
            {t('forum.posts.selected', '{{count}} selected', { count: selected.length })}
          </span>
          <select className="afp-select afp-bulk-select" value={bulkAction} onChange={(e) => setBulkAction(e.target.value)}>
            <option value="">{t('forum.posts.bulkAction', 'Bulk action...')}</option>
            <option value="approve">{t('forum.posts.approve', 'Approve')}</option>
            <option value="hide">{t('forum.posts.hide', 'Hide')}</option>
            <option value="reject">{t('forum.posts.reject', 'Reject')}</option>
            <option value="delete">{t('forum.posts.delete', 'Delete')}</option>
          </select>
          <button className="afp-bulk-apply" onClick={handleBulkAction} disabled={!bulkAction}>
            {t('forum.posts.apply', 'Apply')}
          </button>
        </div>
      )}

      {/* Total count */}
      <div className="afp-total">
        {t('forum.posts.totalResults', '{{count}} posts', { count: total })}
      </div>

      {/* Table */}
      <div className="afp-table-wrap">
        <table className="afp-table">
          <thead>
            <tr>
              <th className="afp-th-check">
                <input
                  type="checkbox"
                  checked={selected.length === posts.length && posts.length > 0}
                  onChange={handleSelectAll}
                />
              </th>
              <th>{t('forum.posts.titleCol', 'Title')}</th>
              <th>{t('forum.posts.author', 'Author')}</th>
              <th>{t('forum.posts.space', 'Space')}</th>
              <th>{t('forum.posts.typeCol', 'Type')}</th>
              <th>{t('forum.posts.statusCol', 'Status')}</th>
              <th>{t('forum.posts.views', 'Views')}</th>
              <th>{t('forum.posts.commentsCol', 'Comments')}</th>
              <th>{t('forum.posts.reportsCol', 'Reports')}</th>
              <th>{t('forum.posts.dateCol', 'Date')}</th>
              <th>{t('forum.posts.actionsCol', 'Actions')}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="11" className="afp-loading-cell">
                  <div className="afp-spinner"></div>
                </td>
              </tr>
            ) : posts.length === 0 ? (
              <tr>
                <td colSpan="11" className="afp-empty-cell">
                  {t('forum.posts.noPosts', 'No posts found')}
                </td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr key={post.id} className={selected.includes(post.id) ? 'afp-row-selected' : ''}>
                  <td className="afp-td-check">
                    <input
                      type="checkbox"
                      checked={selected.includes(post.id)}
                      onChange={() => handleSelect(post.id)}
                    />
                  </td>
                  <td className="afp-td-title">
                    <span className="afp-post-title">{post.title}</span>
                    {post.isPinned && <span className="afp-pin-badge"><Pin size={12} /></span>}
                    {post.isLocked && <span className="afp-lock-badge"><Lock size={12} /></span>}
                  </td>
                  <td className="afp-td-author">
                    <span className="afp-author-name">{post.author?.firstName} {post.author?.lastName}</span>
                  </td>
                  <td className="afp-td-space">
                    <span className="afp-space-name">{post.space?.name || '-'}</span>
                  </td>
                  <td>
                    <span className="afp-type-badge">{post.type || 'discussion'}</span>
                  </td>
                  <td>
                    <span className={`afd-badge afd-badge-${post.status}`}>{post.status}</span>
                  </td>
                  <td className="afp-td-num">{post.viewCount || 0}</td>
                  <td className="afp-td-num">{post.commentCount || 0}</td>
                  <td className="afp-td-num">
                    {(post.reportCount || 0) > 0 && (
                      <span className="afp-report-count">{post.reportCount}</span>
                    )}
                    {(!post.reportCount || post.reportCount === 0) && '0'}
                  </td>
                  <td className="afp-td-date">{formatDate(post.createdAt)}</td>
                  <td className="afp-td-actions">
                    {actionLoading === post.id ? (
                      <div className="afp-action-spinner"></div>
                    ) : (
                      <div className="afp-actions">
                        <a
                          href={`/academy/community/post/${post.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="afp-action-btn afp-action-view"
                          title="Преглед"
                        >
                          <Eye size={14} />
                        </a>
                        {post.status !== 'published' && (
                          <button
                            className="afp-action-btn afp-action-approve"
                            onClick={() => handleStatusChange(post.id, 'published')}
                            title={t('forum.posts.approve', 'Approve')}
                          >
                            <Check size={14} />
                          </button>
                        )}
                        {post.status !== 'rejected' && (
                          <button
                            className="afp-action-btn afp-action-reject"
                            onClick={() => handleStatusChange(post.id, 'rejected')}
                            title={t('forum.posts.reject', 'Reject')}
                          >
                            <X size={14} />
                          </button>
                        )}
                        {post.status !== 'hidden' && (
                          <button
                            className="afp-action-btn afp-action-hide"
                            onClick={() => handleStatusChange(post.id, 'hidden')}
                            title={t('forum.posts.hide', 'Hide')}
                          >
                            <EyeOff size={14} />
                          </button>
                        )}
                        <button
                          className={`afp-action-btn ${post.isPinned ? 'afp-action-active' : ''}`}
                          onClick={() => handleTogglePin(post.id)}
                          title={t('forum.posts.pin', 'Pin')}
                        >
                          <Pin size={14} />
                        </button>
                        <button
                          className={`afp-action-btn ${post.isLocked ? 'afp-action-active' : ''}`}
                          onClick={() => handleToggleLock(post.id)}
                          title={post.isLocked ? t('forum.posts.unlock', 'Unlock') : t('forum.posts.lock', 'Lock')}
                        >
                          {post.isLocked ? <Unlock size={14} /> : <Lock size={14} />}
                        </button>
                        <button
                          className="afp-action-btn afp-action-star"
                          onClick={() => handlePostOfWeek(post.id)}
                          title={t('forum.posts.postOfWeek', 'Post of the week')}
                        >
                          <Award size={14} />
                        </button>
                        <button
                          className="afp-action-btn afp-action-delete"
                          onClick={() => handleDelete(post.id)}
                          title={t('forum.posts.delete', 'Delete')}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="afp-pagination">
          <button
            className="afp-page-btn"
            onClick={() => fetchPosts(page - 1)}
            disabled={page <= 1}
          >
            <ChevronLeft size={16} />
          </button>
          <span className="afp-page-info">
            {page} / {totalPages}
          </span>
          <button
            className="afp-page-btn"
            onClick={() => fetchPosts(page + 1)}
            disabled={page >= totalPages}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminForumPosts;
