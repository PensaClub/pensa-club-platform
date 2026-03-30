// src/components/AdminForumDashboard/AdminForumComments/AdminForumComments.jsx
// Prefix: afcm-

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { forumServiceFactory } from '../../Services/forumServiceFactory';
import { toast } from 'react-toastify';
import {
  Search,
  Check,
  X,
  EyeOff,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  MessageSquare,
  ExternalLink,
} from 'lucide-react';
import './adminForumComments.css';

const STATUS_OPTIONS = ['all', 'visible', 'hidden', 'deleted'];

const AdminForumComments = () => {
  const { t } = useTranslation('admin');
  const forumService = forumServiceFactory();

  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchComments = useCallback(async (p = 1) => {
    try {
      setLoading(true);
      const params = { page: p, limit: 20 };
      if (status !== 'all') params.status = status;
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();

      const data = await forumService.adminGetComments(params);
      setComments(data.comments || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
      setPage(p);
    } catch {
      toast.error(t('forum.comments.loadError', 'Error loading comments'));
    } finally {
      setLoading(false);
    }
  }, [status, debouncedSearch]);

  useEffect(() => {
    fetchComments(1);
  }, [fetchComments]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      setActionLoading(id);
      await forumService.adminUpdateCommentStatus(id, { status: newStatus });
      toast.success(t('forum.comments.statusUpdated', 'Status updated'));
      fetchComments(page);
    } catch {
      toast.error(t('forum.comments.actionError', 'Action failed'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('forum.comments.confirmDelete', 'Delete this comment?'))) return;
    try {
      setActionLoading(id);
      await forumService.adminDeleteComment(id);
      toast.success(t('forum.comments.deleted', 'Comment deleted'));
      fetchComments(page);
    } catch {
      toast.error(t('forum.comments.actionError', 'Action failed'));
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('bg-BG', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const truncate = (text, maxLen = 120) => {
    if (!text) return '';
    return text.length > maxLen ? text.slice(0, maxLen) + '...' : text;
  };

  return (
    <div className="afcm-container">
      <div className="afcm-filters">
        <div className="afcm-search-wrap">
          <Search size={16} className="afcm-search-icon" />
          <input
            type="text"
            className="afcm-search"
            placeholder={t('forum.comments.searchPlaceholder', 'Search comments...')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="afcm-select" value={status} onChange={(e) => setStatus(e.target.value)}>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {t(`forum.comments.status.${s}`, s)}
            </option>
          ))}
        </select>
        <button className="afcm-refresh-btn" onClick={() => fetchComments(page)}>
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="afcm-total">
        {t('forum.comments.totalResults', '{{count}} comments', { count: total })}
      </div>

      <div className="afcm-table-wrap">
        <table className="afcm-table">
          <thead>
            <tr>
              <th>{t('forum.comments.content', 'Content')}</th>
              <th>{t('forum.comments.author', 'Author')}</th>
              <th>{t('forum.comments.post', 'Post')}</th>
              <th>{t('forum.comments.statusCol', 'Status')}</th>
              <th>{t('forum.comments.dateCol', 'Date')}</th>
              <th>{t('forum.comments.actionsCol', 'Actions')}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="afcm-loading-cell">
                  <div className="afcm-spinner"></div>
                </td>
              </tr>
            ) : comments.length === 0 ? (
              <tr>
                <td colSpan="6" className="afcm-empty-cell">
                  <MessageSquare size={20} />
                  {t('forum.comments.noComments', 'No comments found')}
                </td>
              </tr>
            ) : (
              comments.map((comment) => (
                <tr key={comment.id}>
                  <td className="afcm-td-content">
                    <span className="afcm-content-text">{truncate(comment.content)}</span>
                  </td>
                  <td className="afcm-td-author">
                    <span className="afcm-author-name">
                      {comment.author?.firstName} {comment.author?.lastName}
                    </span>
                  </td>
                  <td className="afcm-td-post">
                    <span className="afcm-post-title">{truncate(comment.post?.title, 60)}</span>
                  </td>
                  <td>
                    <span className={`afd-badge afd-badge-${comment.status}`}>{comment.status}</span>
                  </td>
                  <td className="afcm-td-date">{formatDate(comment.createdAt)}</td>
                  <td className="afcm-td-actions">
                    {actionLoading === comment.id ? (
                      <div className="afcm-action-spinner"></div>
                    ) : (
                      <div className="afcm-actions">
                        {comment.status !== 'visible' && (
                          <button
                            className="afcm-action-btn afcm-action-approve"
                            onClick={() => handleStatusChange(comment.id, 'visible')}
                            title={t('forum.comments.approve', 'Approve')}
                          >
                            <Check size={14} />
                          </button>
                        )}
                        {comment.status !== 'rejected' && (
                          <button
                            className="afcm-action-btn afcm-action-reject"
                            onClick={() => handleStatusChange(comment.id, 'rejected')}
                            title={t('forum.comments.reject', 'Reject')}
                          >
                            <X size={14} />
                          </button>
                        )}
                        {comment.status !== 'hidden' && (
                          <button
                            className="afcm-action-btn afcm-action-hide"
                            onClick={() => handleStatusChange(comment.id, 'hidden')}
                            title={t('forum.comments.hide', 'Hide')}
                          >
                            <EyeOff size={14} />
                          </button>
                        )}
                        <button
                          className="afcm-action-btn afcm-action-delete"
                          onClick={() => handleDelete(comment.id)}
                          title={t('forum.comments.delete', 'Delete')}
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

      {totalPages > 1 && (
        <div className="afcm-pagination">
          <button className="afcm-page-btn" onClick={() => fetchComments(page - 1)} disabled={page <= 1}>
            <ChevronLeft size={16} />
          </button>
          <span className="afcm-page-info">{page} / {totalPages}</span>
          <button className="afcm-page-btn" onClick={() => fetchComments(page + 1)} disabled={page >= totalPages}>
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminForumComments;
