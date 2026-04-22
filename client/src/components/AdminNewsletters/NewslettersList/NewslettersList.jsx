// src/components/AdminNewsletters/NewslettersList/NewslettersList.jsx
// Prefix: anl-

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Filter,
  X,
  Eye,
  Pencil,
  Copy,
  Ban,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Calendar,
  Users,
  Mail,
} from 'lucide-react';
import { useCommunityContext } from '../../contexts/CommunityContext';
import { notify } from '../../../utils/notify.jsx';
import './newslettersList.css';

const STATUS_OPTIONS = ['draft', 'scheduled', 'sending', 'sent', 'failed'];
const TYPE_OPTIONS = ['manual', 'weekly', 'monthly', 'event'];
const PAGE_LIMIT = 12;

const formatDate = (value, locale) => {
  if (!value) return '—';
  try {
    return new Intl.DateTimeFormat(locale || 'bg-BG', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value));
  } catch {
    return String(value);
  }
};

export const NewslettersList = ({ refreshKey = 0, onEdit }) => {
  const { t, i18n } = useTranslation('adminNewsletters');
  const {
    getAdminNewsletters,
    deleteNewsletter,
    duplicateNewsletter,
    cancelScheduledNewsletter,
    getNewsletterStats,
  } = useCommunityContext();

  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [confirm, setConfirm] = useState(null); // { kind: 'delete'|'cancel', item }
  const [statsModal, setStatsModal] = useState(null); // { item, data, loading }

  const localeCode = useMemo(() => {
    const map = { bg: 'bg-BG', en: 'en-US', de: 'de-DE' };
    return map[i18n.language] || 'bg-BG';
  }, [i18n.language]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchList = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = { page, limit: PAGE_LIMIT };
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      if (status) params.status = status;
      if (type) params.type = type;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;

      const data = await getAdminNewsletters(params);
      setItems(data?.newsletters || []);
      setPagination(data?.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch {
      notify('error', null, t('messages.fetchError'));
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedSearch, status, type, dateFrom, dateTo]);

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchList, refreshKey]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, type, dateFrom, dateTo]);

  const clearFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setStatus('');
    setType('');
    setDateFrom('');
    setDateTo('');
  };

  const hasActiveFilters =
    Boolean(search) || Boolean(status) || Boolean(type) || Boolean(dateFrom) || Boolean(dateTo);

  const handleShowStats = async (item) => {
    setStatsModal({ item, data: null, loading: true });
    try {
      const data = await getNewsletterStats(item.id);
      setStatsModal({ item, data, loading: false });
    } catch {
      notify('error', null, t('messages.statsError'));
      setStatsModal(null);
    }
  };

  const handleDuplicate = async (item) => {
    setActionId(item.id);
    try {
      await duplicateNewsletter(item.id);
      notify('success', null, t('messages.duplicated'));
      await fetchList();
    } finally {
      setActionId(null);
    }
  };

  const handleCancel = async () => {
    if (!confirm?.item) return;
    setActionId(confirm.item.id);
    try {
      await cancelScheduledNewsletter(confirm.item.id);
      notify('success', null, t('messages.cancelled'));
      setConfirm(null);
      await fetchList();
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async () => {
    if (!confirm?.item) return;
    setActionId(confirm.item.id);
    try {
      await deleteNewsletter(confirm.item.id);
      notify('success', null, t('messages.deleted'));
      setConfirm(null);
      await fetchList();
    } finally {
      setActionId(null);
    }
  };

  const dateFor = (item) => {
    if (item.status === 'sent' && item.sentAt) {
      return { label: t('list.dateSent'), value: item.sentAt };
    }
    if (item.status === 'scheduled' && item.scheduledAt) {
      return { label: t('list.dateScheduled'), value: item.scheduledAt };
    }
    return { label: t('list.dateCreated'), value: item.createdAt };
  };

  const canEdit = (item) => item.status === 'draft' || item.status === 'scheduled';
  const canCancel = (item) => item.status === 'scheduled';

  return (
    <div className="anl-root">
      {/* TOOLBAR */}
      <div className="anl-toolbar">
        <div className="anl-search">
          <span className="anl-search-icon">
            <Search />
          </span>
          <input
            type="text"
            className="anl-search-input"
            placeholder={t('list.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              className="anl-search-clear"
              onClick={() => setSearch('')}
              aria-label={t('list.clearFilters')}
            >
              <span className="anl-icon">
                <X />
              </span>
            </button>
          )}
        </div>

        <div className="anl-toolbar-actions">
          <button
            type="button"
            className={`anl-filter-btn ${showFilters ? 'anl-filter-btn--active' : ''}`}
            onClick={() => setShowFilters((v) => !v)}
          >
            <span className="anl-icon">
              <Filter />
            </span>
            <span>{t('list.filters')}</span>
            {hasActiveFilters && <span className="anl-filter-dot" aria-hidden="true" />}
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              className="anl-clear-btn"
              onClick={clearFilters}
            >
              <span className="anl-icon">
                <X />
              </span>
              <span>{t('list.clearFilters')}</span>
            </button>
          )}
        </div>
      </div>

      {/* FILTERS PANEL */}
      {showFilters && (
        <div className="anl-filters">
          <div className="anl-filter-group">
            <label className="anl-filter-label">{t('list.filterByStatus')}</label>
            <select
              className="anl-filter-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">{t('list.allStatuses')}</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {t(`statuses.${s}`)}
                </option>
              ))}
            </select>
          </div>

          <div className="anl-filter-group">
            <label className="anl-filter-label">{t('list.filterByType')}</label>
            <select
              className="anl-filter-select"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="">{t('list.allTypes')}</option>
              {TYPE_OPTIONS.map((ty) => (
                <option key={ty} value={ty}>
                  {t(`types.${ty}`)}
                </option>
              ))}
            </select>
          </div>

          <div className="anl-filter-group">
            <label className="anl-filter-label">{t('list.filterByDateFrom')}</label>
            <input
              type="date"
              className="anl-filter-input"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>

          <div className="anl-filter-group">
            <label className="anl-filter-label">{t('list.filterByDateTo')}</label>
            <input
              type="date"
              className="anl-filter-input"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* CONTENT */}
      {isLoading ? (
        <div className="anl-loading">
          <div className="anl-spinner" />
          <span>{t('list.loading')}</span>
        </div>
      ) : items.length === 0 ? (
        <div className="anl-empty">
          <div className="anl-empty-icon">
            <Inbox />
          </div>
          <h3 className="anl-empty-title">{t('list.empty.title')}</h3>
          <p className="anl-empty-desc">{t('list.empty.description')}</p>
        </div>
      ) : (
        <>
          {/* TABLE (desktop) */}
          <div className="anl-table-wrap">
            <table className="anl-table">
              <thead>
                <tr>
                  <th>{t('list.columns.title')}</th>
                  <th>{t('list.columns.type')}</th>
                  <th>{t('list.columns.status')}</th>
                  <th>{t('list.columns.date')}</th>
                  <th className="anl-col-num">{t('list.columns.recipients')}</th>
                  <th className="anl-col-num">{t('list.columns.opens')}</th>
                  <th className="anl-col-actions">{t('list.columns.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const d = dateFor(item);
                  return (
                    <tr key={item.id}>
                      <td className="anl-cell-title">
                        <span className="anl-title-text">{item.title}</span>
                        {item.subject && (
                          <span className="anl-subject-text">{item.subject}</span>
                        )}
                      </td>
                      <td>
                        <span className={`anl-badge anl-badge--type-${item.type}`}>
                          {t(`types.${item.type}`)}
                        </span>
                      </td>
                      <td>
                        <span className={`anl-badge anl-badge--status-${item.status}`}>
                          {t(`statuses.${item.status}`)}
                        </span>
                      </td>
                      <td>
                        <span className="anl-date-label">{d.label}</span>
                        <span className="anl-date-value">{formatDate(d.value, localeCode)}</span>
                      </td>
                      <td className="anl-col-num">{item.sentCount ?? 0}</td>
                      <td className="anl-col-num">{item.openedCount ?? 0}</td>
                      <td className="anl-col-actions">
                        <ActionButtons
                          item={item}
                          t={t}
                          busy={actionId === item.id}
                          onShowStats={() => handleShowStats(item)}
                          onEdit={() => onEdit?.(item.id)}
                          onDuplicate={() => handleDuplicate(item)}
                          onCancel={() => setConfirm({ kind: 'cancel', item })}
                          onDelete={() => setConfirm({ kind: 'delete', item })}
                          canEdit={canEdit(item)}
                          canCancel={canCancel(item)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* CARDS (mobile) */}
          <div className="anl-cards">
            {items.map((item) => {
              const d = dateFor(item);
              return (
                <article key={item.id} className="anl-card">
                  <header className="anl-card-header">
                    <div className="anl-card-title-wrap">
                      <h4 className="anl-card-title">{item.title}</h4>
                      {item.subject && (
                        <p className="anl-card-subject">{item.subject}</p>
                      )}
                    </div>
                    <span className={`anl-badge anl-badge--status-${item.status}`}>
                      {t(`statuses.${item.status}`)}
                    </span>
                  </header>

                  <div className="anl-card-meta">
                    <div className="anl-card-meta-item">
                      <span className="anl-card-meta-icon">
                        <Mail />
                      </span>
                      <span>{t(`types.${item.type}`)}</span>
                    </div>
                    <div className="anl-card-meta-item">
                      <span className="anl-card-meta-icon">
                        <Calendar />
                      </span>
                      <span>
                        {d.label}: {formatDate(d.value, localeCode)}
                      </span>
                    </div>
                    <div className="anl-card-meta-item">
                      <span className="anl-card-meta-icon">
                        <Users />
                      </span>
                      <span>
                        {item.sentCount ?? 0} / {item.openedCount ?? 0}
                      </span>
                    </div>
                  </div>

                  <footer className="anl-card-footer">
                    <ActionButtons
                      item={item}
                      t={t}
                      busy={actionId === item.id}
                      onShowStats={() => handleShowStats(item)}
                      onEdit={() => onEdit?.(item.id)}
                      onDuplicate={() => handleDuplicate(item)}
                      onCancel={() => setConfirm({ kind: 'cancel', item })}
                      onDelete={() => setConfirm({ kind: 'delete', item })}
                      canEdit={canEdit(item)}
                      canCancel={canCancel(item)}
                    />
                  </footer>
                </article>
              );
            })}
          </div>

          {/* PAGINATION */}
          {pagination.totalPages > 1 && (
            <div className="anl-pagination">
              <button
                type="button"
                className="anl-page-btn"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page <= 1}
              >
                <span className="anl-icon">
                  <ChevronLeft />
                </span>
                <span>{t('list.prev')}</span>
              </button>

              <span className="anl-page-info">
                {t('list.pageInfo', { current: page, total: pagination.totalPages })}
              </span>

              <button
                type="button"
                className="anl-page-btn"
                onClick={() => setPage((p) => Math.min(p + 1, pagination.totalPages))}
                disabled={page >= pagination.totalPages}
              >
                <span>{t('list.next')}</span>
                <span className="anl-icon">
                  <ChevronRight />
                </span>
              </button>
            </div>
          )}
        </>
      )}

      {/* CONFIRM MODAL */}
      {confirm &&
        createPortal(
          <div
            className="anl-modal-overlay"
            role="dialog"
            aria-modal="true"
            onClick={() => setConfirm(null)}
          >
            <div className="anl-modal" onClick={(e) => e.stopPropagation()}>
              <h3 className="anl-modal-title">
                {confirm.kind === 'delete'
                  ? t('confirm.deleteTitle')
                  : t('confirm.cancelTitle')}
              </h3>
              <p className="anl-modal-body">
                {confirm.kind === 'delete'
                  ? t('confirm.deleteBody', { title: confirm.item.title })
                  : t('confirm.cancelBody', { title: confirm.item.title })}
              </p>
              <div className="anl-modal-actions">
                <button
                  type="button"
                  className="anl-btn-secondary"
                  onClick={() => setConfirm(null)}
                >
                  {t('confirm.back')}
                </button>
                <button
                  type="button"
                  className="anl-btn-danger"
                  onClick={confirm.kind === 'delete' ? handleDelete : handleCancel}
                  disabled={actionId === confirm.item.id}
                >
                  {t('confirm.confirm')}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* PER-NEWSLETTER STATS MODAL */}
      {statsModal &&
        createPortal(
          <div
            className="anl-modal-overlay"
            role="dialog"
            aria-modal="true"
            onClick={() => setStatsModal(null)}
          >
            <div
              className="anl-modal anl-stats-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="anl-stats-head">
                <h3 className="anl-modal-title">
                  {t('statsModal.title')}
                </h3>
                <button
                  type="button"
                  className="anl-stats-close"
                  onClick={() => setStatsModal(null)}
                  aria-label={t('confirm.back')}
                >
                  <span className="anl-icon">
                    <X />
                  </span>
                </button>
              </div>

              <p className="anl-stats-subject">{statsModal.item.title}</p>

              {statsModal.loading && (
                <p className="anl-stats-loading">{t('statsModal.loading')}</p>
              )}

              {!statsModal.loading && statsModal.data && (
                <>
                  <div className="anl-stats-grid">
                    <div className="anl-stat-card anl-stat-card--teal">
                      <span className="anl-stat-label">{t('statsModal.sent')}</span>
                      <span className="anl-stat-value">{statsModal.data.sentCount || 0}</span>
                    </div>
                    <div className="anl-stat-card anl-stat-card--green">
                      <span className="anl-stat-label">{t('statsModal.opened')}</span>
                      <span className="anl-stat-value">{statsModal.data.openedCount || 0}</span>
                      <span className="anl-stat-meta">
                        {statsModal.data.openRate || 0}%
                      </span>
                    </div>
                    <div className="anl-stat-card anl-stat-card--amber">
                      <span className="anl-stat-label">{t('statsModal.clicked')}</span>
                      <span className="anl-stat-value">{statsModal.data.clickedCount || 0}</span>
                      <span className="anl-stat-meta">
                        {statsModal.data.clickRate || 0}%
                      </span>
                    </div>
                    <div className="anl-stat-card anl-stat-card--violet">
                      <span className="anl-stat-label">{t('statsModal.uniqueClickers')}</span>
                      <span className="anl-stat-value">{statsModal.data.uniqueClickers || 0}</span>
                    </div>
                    <div className="anl-stat-card anl-stat-card--red">
                      <span className="anl-stat-label">{t('statsModal.failed')}</span>
                      <span className="anl-stat-value">{statsModal.data.failedCount || 0}</span>
                    </div>
                  </div>

                  {statsModal.data.topLinks?.length > 0 ? (
                    <div className="anl-stats-toplinks">
                      <h4 className="anl-stats-section-title">
                        {t('statsModal.topLinksTitle')}
                      </h4>
                      <ul className="anl-stats-link-list">
                        {statsModal.data.topLinks.map((link) => (
                          <li key={link.targetUrl} className="anl-stats-link-row">
                            <a
                              href={link.targetUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="anl-stats-link-url"
                              title={link.targetUrl}
                            >
                              {link.targetUrl}
                            </a>
                            <span className="anl-stats-link-count">
                              {t('statsModal.clicksCount', { count: link.clicks })}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="anl-stats-empty">
                      {t('statsModal.noClicks')}
                    </p>
                  )}
                </>
              )}

              <div className="anl-modal-actions">
                <button
                  type="button"
                  className="anl-btn-secondary"
                  onClick={() => setStatsModal(null)}
                >
                  {t('confirm.back')}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

// ===============================
// Action buttons (table + cards)
// ===============================
const ActionButtons = ({
  item,
  t,
  busy,
  onShowStats,
  onEdit,
  onDuplicate,
  onCancel,
  onDelete,
  canEdit,
  canCancel,
}) => (
  <div className="anl-actions">
    <button
      type="button"
      className="anl-action-btn anl-action-btn--view"
      title={t('actions.view')}
      aria-label={t('actions.view')}
      onClick={onShowStats}
      disabled={busy}
    >
      <span className="anl-icon">
        <Eye />
      </span>
    </button>
    {canEdit && (
      <button
        type="button"
        className="anl-action-btn anl-action-btn--edit"
        title={t('actions.edit')}
        aria-label={t('actions.edit')}
        onClick={onEdit}
        disabled={busy}
      >
        <span className="anl-icon">
          <Pencil />
        </span>
      </button>
    )}
    <button
      type="button"
      className="anl-action-btn anl-action-btn--dup"
      title={t('actions.duplicate')}
      aria-label={t('actions.duplicate')}
      onClick={onDuplicate}
      disabled={busy}
    >
      <span className="anl-icon">
        <Copy />
      </span>
    </button>
    {canCancel && (
      <button
        type="button"
        className="anl-action-btn anl-action-btn--cancel"
        title={t('actions.cancel')}
        aria-label={t('actions.cancel')}
        onClick={onCancel}
        disabled={busy}
      >
        <span className="anl-icon">
          <Ban />
        </span>
      </button>
    )}
    <button
      type="button"
      className="anl-action-btn anl-action-btn--delete"
      title={t('actions.delete')}
      aria-label={t('actions.delete')}
      onClick={onDelete}
      disabled={busy}
    >
      <span className="anl-icon">
        <Trash2 />
      </span>
    </button>
  </div>
);
