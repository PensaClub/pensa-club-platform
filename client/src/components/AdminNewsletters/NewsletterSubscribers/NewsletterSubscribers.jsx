// src/components/AdminNewsletters/NewsletterSubscribers/NewsletterSubscribers.jsx
// Prefix: ans-

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Filter,
  X,
  Ban,
  CheckCircle2,
  Trash2,
  Download,
  ChevronLeft,
  ChevronRight,
  Users,
  Tag,
  Send,
  Check,
} from 'lucide-react';
import { useCommunityContext } from '../../contexts/CommunityContext';
import { notify } from '../../../utils/notify.jsx';
import { NewsletterEditorRichText } from '../NewsletterEditor/NewsletterEditorRichText/NewsletterEditorRichText';
import { NewsletterImageUploader } from '../NewsletterImageUploader/NewsletterImageUploader';
import './newsletterSubscribers.css';

const STATUS_OPTIONS = ['active', 'unsubscribed', 'blocked'];
const CATEGORY_OPTIONS = ['seminars', 'courses', 'articles', 'initiatives', 'clubs', 'games', 'platform'];
const PAGE_LIMIT = 20;

const formatDate = (value, locale) => {
  if (!value) return '—';
  try {
    return new Intl.DateTimeFormat(locale || 'bg-BG', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(value));
  } catch {
    return String(value);
  }
};

export const NewsletterSubscribers = () => {
  const { t, i18n } = useTranslation('adminNewsletters');
  const {
    getAdminSubscriberList,
    blockSubscriber,
    unblockSubscriber,
    deleteSubscriber,
    exportSubscribersPdfUrl,
    exportSubscribersCsvUrl,
    updateSubscriberPreferencesByAdmin,
    sendPersonalNewsletter,
  } = useCommunityContext();

  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [editPrefs, setEditPrefs] = useState(null); // { item, prefs: Set }
  const [personalEmail, setPersonalEmail] = useState(null); // { item, title, body, errors }
  const [isModalBusy, setIsModalBusy] = useState(false);

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
      if (category) params.category = category;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      const data = await getAdminSubscriberList(params);
      setItems(data?.subscribers || []);
      setPagination(data?.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch {
      notify('error', null, t('subscribers.messages.loadError'));
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedSearch, status, category, dateFrom, dateTo]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, category, dateFrom, dateTo]);

  const clearFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setStatus('');
    setCategory('');
    setDateFrom('');
    setDateTo('');
  };

  const hasActiveFilters =
    Boolean(search) || Boolean(status) || Boolean(category) || Boolean(dateFrom) || Boolean(dateTo);

  const handleConfirmAction = async () => {
    if (!confirm) return;
    setActionId(confirm.item.id);
    try {
      if (confirm.kind === 'delete') {
        await deleteSubscriber(confirm.item.id);
        notify('success', null, t('subscribers.messages.deleted'));
      } else if (confirm.kind === 'block') {
        await blockSubscriber(confirm.item.id);
        notify('success', null, t('subscribers.messages.blocked'));
      }
      setConfirm(null);
      await fetchList();
    } finally {
      setActionId(null);
    }
  };

  const handleUnblock = async (item) => {
    setActionId(item.id);
    try {
      await unblockSubscriber(item.id);
      notify('success', null, t('subscribers.messages.unblocked'));
      await fetchList();
    } finally {
      setActionId(null);
    }
  };

  const downloadPdf = async () => {
    const params = {};
    if (status) params.status = status;
    if (debouncedSearch) params.search = debouncedSearch;
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;
    const url = exportSubscribersPdfUrl?.(params);
    if (!url) return;
    try {
      const headers = {};
      const auth = localStorage.getItem('auth');
      if (auth) {
        try {
          const parsed = JSON.parse(auth);
          if (parsed?.token) headers.Authorization = `Bearer ${parsed.token}`;
        } catch {
          /* ignore */
        }
      }
      const res = await fetch(url, { headers, credentials: 'include' });
      if (!res.ok) throw new Error('pdf-fetch-failed');
      const blob = await res.blob();
      const link = document.createElement('a');
      const objectUrl = URL.createObjectURL(blob);
      link.href = objectUrl;
      link.download = `subscribers_${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
    } catch {
      notify('error', null, t('subscribers.messages.loadError'));
    }
  };

  const downloadCsv = async () => {
    const params = {};
    if (status) params.status = status;
    if (debouncedSearch) params.search = debouncedSearch;
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;
    const url = exportSubscribersCsvUrl?.(params);
    if (!url) return;
    try {
      const headers = {};
      const auth = localStorage.getItem('auth');
      if (auth) {
        try {
          const parsed = JSON.parse(auth);
          if (parsed?.token) headers.Authorization = `Bearer ${parsed.token}`;
        } catch {
          /* ignore */
        }
      }
      const res = await fetch(url, { headers, credentials: 'include' });
      if (!res.ok) throw new Error('csv-fetch-failed');
      const blob = await res.blob();
      const link = document.createElement('a');
      const objectUrl = URL.createObjectURL(blob);
      link.href = objectUrl;
      link.download = `subscribers_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
    } catch {
      notify('error', null, t('subscribers.messages.loadError'));
    }
  };

  const openEditPrefs = (item) => {
    const enabled = new Set(
      (item.preferences || []).filter((p) => p.enabled).map((p) => p.category),
    );
    setEditPrefs({ item, prefs: enabled });
  };

  const togglePref = (cat) => {
    setEditPrefs((curr) => {
      if (!curr) return curr;
      const next = new Set(curr.prefs);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return { ...curr, prefs: next };
    });
  };

  const savePrefs = async () => {
    if (!editPrefs) return;
    setIsModalBusy(true);
    try {
      const payload = CATEGORY_OPTIONS.map((cat) => ({
        category: cat,
        enabled: editPrefs.prefs.has(cat),
      }));
      await updateSubscriberPreferencesByAdmin(editPrefs.item.id, payload);
      notify('success', null, t('subscribers.messages.prefsUpdated'));
      setEditPrefs(null);
      await fetchList();
    } catch {
      notify('error', null, t('subscribers.messages.prefsError'));
    } finally {
      setIsModalBusy(false);
    }
  };

  const openPersonalEmail = (item) => {
    setPersonalEmail({ item, title: '', body: '', images: [], errors: {} });
  };

  const sendPersonal = async () => {
    if (!personalEmail) return;
    const errors = {};
    const stripped = (personalEmail.body || '').replace(/<[^>]*>/g, '').trim();
    if (!personalEmail.title.trim()) errors.title = t('subscribers.sendPersonal.subjectRequired');
    if (!stripped && (!personalEmail.images || personalEmail.images.length === 0)) {
      errors.body = t('subscribers.sendPersonal.bodyRequired');
    }
    if (Object.keys(errors).length > 0) {
      setPersonalEmail((p) => ({ ...p, errors }));
      return;
    }
    setIsModalBusy(true);
    try {
      // Append uploaded images to body HTML so they ride along
      const imgsHtml = (personalEmail.images || [])
        .map(
          (url) =>
            `<p><img src="${String(url).replace(/"/g, '&quot;')}" alt="" /></p>`,
        )
        .join('');
      const fullBody = `${personalEmail.body || ''}${imgsHtml}`;
      const res = await sendPersonalNewsletter(personalEmail.item.id, {
        title: personalEmail.title.trim(),
        body: fullBody,
      });
      notify(
        'success',
        null,
        t('subscribers.messages.personalSent', {
          email: res?.to || personalEmail.item.email,
        }),
      );
      setPersonalEmail(null);
    } catch {
      notify('error', null, t('subscribers.messages.personalError'));
    } finally {
      setIsModalBusy(false);
    }
  };

  const renderCategories = (preferences) => {
    const enabled = (preferences || []).filter((p) => p.enabled).map((p) => p.category);
    if (enabled.length === 0) {
      return <span className="ans-cat-empty">{t('subscribers.noCategories')}</span>;
    }
    return (
      <span className="ans-cat-list">
        {enabled.map((c) => (
          <span key={c} className="ans-cat-chip">
            {t(`editor.categories.${c}`, { defaultValue: c })}
          </span>
        ))}
      </span>
    );
  };

  return (
    <div className="ans-root">
      {/* TOOLBAR */}
      <div className="ans-toolbar">
        <div className="ans-search">
          <span className="ans-search-icon">
            <Search />
          </span>
          <input
            type="text"
            className="ans-search-input"
            placeholder={t('subscribers.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              className="ans-search-clear"
              onClick={() => setSearch('')}
              aria-label={t('subscribers.clearFilters')}
            >
              <span className="ans-icon">
                <X />
              </span>
            </button>
          )}
        </div>

        <div className="ans-toolbar-actions">
          <button
            type="button"
            className={`ans-filter-btn ${showFilters ? 'ans-filter-btn--active' : ''}`}
            onClick={() => setShowFilters((v) => !v)}
          >
            <span className="ans-icon">
              <Filter />
            </span>
            <span className="ans-btn-label">{t('subscribers.filters')}</span>
            {hasActiveFilters && <span className="ans-filter-dot" />}
          </button>

          {hasActiveFilters && (
            <button type="button" className="ans-clear-btn" onClick={clearFilters}>
              <span className="ans-icon">
                <X />
              </span>
              <span className="ans-btn-label">{t('subscribers.clearFilters')}</span>
            </button>
          )}

          <button type="button" className="ans-export-btn" onClick={downloadCsv}>
            <span className="ans-icon">
              <Download />
            </span>
            <span className="ans-btn-label">{t('subscribers.exportCsv')}</span>
          </button>

          <button type="button" className="ans-export-btn" onClick={downloadPdf}>
            <span className="ans-icon">
              <Download />
            </span>
            <span className="ans-btn-label">{t('subscribers.exportPdf')}</span>
          </button>
        </div>
      </div>

      {/* FILTERS */}
      {showFilters && (
        <div className="ans-filters">
          <div className="ans-filter-group">
            <label className="ans-filter-label">{t('subscribers.filterByStatus')}</label>
            <select
              className="ans-filter-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">{t('subscribers.allStatuses')}</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {t(`subscribers.statuses.${s}`)}
                </option>
              ))}
            </select>
          </div>

          <div className="ans-filter-group">
            <label className="ans-filter-label">{t('subscribers.filterByCategory')}</label>
            <select
              className="ans-filter-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">{t('subscribers.allCategories')}</option>
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {t(`editor.categories.${c}`, { defaultValue: c })}
                </option>
              ))}
            </select>
          </div>

          <div className="ans-filter-group">
            <label className="ans-filter-label">{t('subscribers.filterByDateFrom')}</label>
            <input
              type="date"
              className="ans-filter-input"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>

          <div className="ans-filter-group">
            <label className="ans-filter-label">{t('subscribers.filterByDateTo')}</label>
            <input
              type="date"
              className="ans-filter-input"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* CONTENT */}
      {isLoading ? (
        <div className="ans-loading">
          <div className="ans-spinner" />
          <span>{t('subscribers.loading')}</span>
        </div>
      ) : items.length === 0 ? (
        <div className="ans-empty">
          <div className="ans-empty-icon">
            <Users />
          </div>
          <h3 className="ans-empty-title">{t('subscribers.empty.title')}</h3>
          <p className="ans-empty-desc">{t('subscribers.empty.description')}</p>
        </div>
      ) : (
        <>
          {/* TABLE (desktop) */}
          <div className="ans-table-wrap">
            <table className="ans-table">
              <thead>
                <tr>
                  <th>{t('subscribers.columns.name')}</th>
                  <th>{t('subscribers.columns.email')}</th>
                  <th>{t('subscribers.columns.status')}</th>
                  <th>{t('subscribers.columns.categories')}</th>
                  <th>{t('subscribers.columns.createdAt')}</th>
                  <th className="ans-col-actions">{t('subscribers.columns.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <span className="ans-name">{item.name}</span>
                    </td>
                    <td>
                      <span className="ans-email">{item.email}</span>
                    </td>
                    <td>
                      <span className={`ans-badge ans-badge--${item.status}`}>
                        {t(`subscribers.statuses.${item.status}`)}
                      </span>
                    </td>
                    <td>{renderCategories(item.preferences)}</td>
                    <td>
                      <span className="ans-date">{formatDate(item.createdAt, localeCode)}</span>
                    </td>
                    <td className="ans-col-actions">
                      <SubscriberActions
                        item={item}
                        t={t}
                        busy={actionId === item.id}
                        onEditPrefs={() => openEditPrefs(item)}
                        onSendPersonal={() => openPersonalEmail(item)}
                        onBlock={() => setConfirm({ kind: 'block', item })}
                        onUnblock={() => handleUnblock(item)}
                        onDelete={() => setConfirm({ kind: 'delete', item })}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* CARDS (mobile) */}
          <div className="ans-cards">
            {items.map((item) => (
              <article key={item.id} className="ans-card">
                <header className="ans-card-header">
                  <div className="ans-card-text">
                    <h4 className="ans-card-name">{item.name}</h4>
                    <p className="ans-card-email">{item.email}</p>
                  </div>
                  <span className={`ans-badge ans-badge--${item.status}`}>
                    {t(`subscribers.statuses.${item.status}`)}
                  </span>
                </header>

                <div className="ans-card-meta">
                  <div className="ans-card-meta-row">
                    <span className="ans-card-meta-label">
                      {t('subscribers.columns.categories')}:
                    </span>
                    {renderCategories(item.preferences)}
                  </div>
                  <div className="ans-card-meta-row">
                    <span className="ans-card-meta-label">
                      {t('subscribers.columns.createdAt')}:
                    </span>
                    <span className="ans-date">{formatDate(item.createdAt, localeCode)}</span>
                  </div>
                </div>

                <footer className="ans-card-footer">
                  <SubscriberActions
                    item={item}
                    t={t}
                    busy={actionId === item.id}
                    onBlock={() => setConfirm({ kind: 'block', item })}
                    onUnblock={() => handleUnblock(item)}
                    onDelete={() => setConfirm({ kind: 'delete', item })}
                  />
                </footer>
              </article>
            ))}
          </div>

          {/* PAGINATION */}
          {pagination.totalPages > 1 && (
            <div className="ans-pagination">
              <button
                type="button"
                className="ans-page-btn"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page <= 1}
              >
                <span className="ans-icon">
                  <ChevronLeft />
                </span>
                <span>{t('subscribers.prev')}</span>
              </button>
              <span className="ans-page-info">
                {t('subscribers.pageInfo', {
                  current: page,
                  total: pagination.totalPages,
                  count: pagination.total,
                })}
              </span>
              <button
                type="button"
                className="ans-page-btn"
                onClick={() => setPage((p) => Math.min(p + 1, pagination.totalPages))}
                disabled={page >= pagination.totalPages}
              >
                <span>{t('subscribers.next')}</span>
                <span className="ans-icon">
                  <ChevronRight />
                </span>
              </button>
            </div>
          )}
        </>
      )}

      {/* EDIT PREFERENCES MODAL */}
      {editPrefs &&
        createPortal(
          <div
            className="ans-modal-overlay"
            role="dialog"
            aria-modal="true"
            onClick={() => !isModalBusy && setEditPrefs(null)}
          >
            <div className="ans-modal" onClick={(e) => e.stopPropagation()}>
              <h3 className="ans-modal-title">{t('subscribers.editPrefs.title')}</h3>
              <p className="ans-modal-body">
                {t('subscribers.editPrefs.description')}{' '}
                <strong>{editPrefs.item.name}</strong> ({editPrefs.item.email})
              </p>
              <div className="ans-prefs-grid">
                {CATEGORY_OPTIONS.map((cat) => {
                  const checked = editPrefs.prefs.has(cat);
                  return (
                    <label
                      key={cat}
                      className={`ans-prefs-chip ${checked ? 'ans-prefs-chip--on' : ''}`}
                    >
                      <input
                        type="checkbox"
                        className="ans-prefs-input"
                        checked={checked}
                        onChange={() => togglePref(cat)}
                      />
                      <span className="ans-prefs-box" aria-hidden="true">
                        {checked && (
                          <span className="ans-prefs-check">
                            <Check />
                          </span>
                        )}
                      </span>
                      <span className="ans-prefs-label">
                        {t(`editor.categories.${cat}`, { defaultValue: cat })}
                      </span>
                    </label>
                  );
                })}
              </div>
              <div className="ans-modal-actions">
                <button
                  type="button"
                  className="ans-btn-secondary"
                  onClick={() => setEditPrefs(null)}
                  disabled={isModalBusy}
                >
                  {t('subscribers.editPrefs.cancel')}
                </button>
                <button
                  type="button"
                  className="ans-btn-primary"
                  onClick={savePrefs}
                  disabled={isModalBusy}
                >
                  {t('subscribers.editPrefs.save')}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* PERSONAL EMAIL MODAL */}
      {personalEmail &&
        createPortal(
          <div
            className="ans-modal-overlay"
            role="dialog"
            aria-modal="true"
            onClick={() => !isModalBusy && setPersonalEmail(null)}
          >
            <div className="ans-modal ans-modal--wide" onClick={(e) => e.stopPropagation()}>
              <h3 className="ans-modal-title">{t('subscribers.sendPersonal.title')}</h3>
              <p className="ans-modal-body">
                {t('subscribers.sendPersonal.description', {
                  name: personalEmail.item.name,
                  email: personalEmail.item.email,
                })}
              </p>
              {personalEmail.item.status !== 'active' && (
                <div className="ans-personal-warn">
                  {t('subscribers.sendPersonal.blockedNotice')}
                </div>
              )}
              <div className="ans-personal-field">
                <label className="ans-personal-label">
                  {t('subscribers.sendPersonal.subjectLabel')}
                </label>
                <input
                  type="text"
                  className={`ans-personal-input ${personalEmail.errors.title ? 'ans-personal-input--error' : ''}`}
                  placeholder={t('subscribers.sendPersonal.subjectPlaceholder')}
                  value={personalEmail.title}
                  onChange={(e) =>
                    setPersonalEmail((p) => ({
                      ...p,
                      title: e.target.value,
                      errors: { ...p.errors, title: null },
                    }))
                  }
                  maxLength={500}
                />
                {personalEmail.errors.title && (
                  <span className="ans-personal-error">{personalEmail.errors.title}</span>
                )}
              </div>
              <div className="ans-personal-field">
                <label className="ans-personal-label">
                  {t('subscribers.sendPersonal.bodyLabel')}
                </label>
                <NewsletterEditorRichText
                  value={personalEmail.body}
                  onChange={(html) =>
                    setPersonalEmail((p) => ({
                      ...p,
                      body: html,
                      errors: { ...p.errors, body: null },
                    }))
                  }
                  placeholder={t('subscribers.sendPersonal.bodyPlaceholder')}
                />
                {personalEmail.errors.body && (
                  <span className="ans-personal-error">{personalEmail.errors.body}</span>
                )}
              </div>

              <div className="ans-personal-field">
                <label className="ans-personal-label">
                  {t('subscribers.sendPersonal.imagesLabel')}
                </label>
                <NewsletterImageUploader
                  value={personalEmail.images}
                  onChange={(images) =>
                    setPersonalEmail((p) => ({ ...p, images }))
                  }
                  max={5}
                  storagePath="newsletters/personal"
                />
              </div>
              <div className="ans-modal-actions">
                <button
                  type="button"
                  className="ans-btn-secondary"
                  onClick={() => setPersonalEmail(null)}
                  disabled={isModalBusy}
                >
                  {t('subscribers.sendPersonal.cancel')}
                </button>
                <button
                  type="button"
                  className="ans-btn-primary"
                  onClick={sendPersonal}
                  disabled={isModalBusy || personalEmail.item.status !== 'active'}
                >
                  {t('subscribers.sendPersonal.send')}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* CONFIRM MODAL */}
      {confirm &&
        createPortal(
          <div
            className="ans-modal-overlay"
            role="dialog"
            aria-modal="true"
            onClick={() => actionId !== confirm.item.id && setConfirm(null)}
          >
            <div className="ans-modal" onClick={(e) => e.stopPropagation()}>
              <h3 className="ans-modal-title">
                {confirm.kind === 'delete'
                  ? t('subscribers.confirm.deleteTitle')
                  : t('subscribers.confirm.blockTitle')}
              </h3>
              <p className="ans-modal-body">
                {confirm.kind === 'delete'
                  ? t('subscribers.confirm.deleteBody', {
                      name: confirm.item.name,
                      email: confirm.item.email,
                    })
                  : t('subscribers.confirm.blockBody', {
                      name: confirm.item.name,
                      email: confirm.item.email,
                    })}
              </p>
              <div className="ans-modal-actions">
                <button
                  type="button"
                  className="ans-btn-secondary"
                  onClick={() => setConfirm(null)}
                  disabled={actionId === confirm.item.id}
                >
                  {t('subscribers.confirm.cancel')}
                </button>
                <button
                  type="button"
                  className="ans-btn-danger"
                  onClick={handleConfirmAction}
                  disabled={actionId === confirm.item.id}
                >
                  {t('subscribers.confirm.confirm')}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

const SubscriberActions = ({ item, t, busy, onEditPrefs, onSendPersonal, onBlock, onUnblock, onDelete }) => (
  <div className="ans-actions">
    <button
      type="button"
      className="ans-action-btn ans-action-btn--prefs"
      title={t('subscribers.actions.editPrefs')}
      aria-label={t('subscribers.actions.editPrefs')}
      onClick={onEditPrefs}
      disabled={busy}
    >
      <span className="ans-icon">
        <Tag />
      </span>
    </button>
    <button
      type="button"
      className="ans-action-btn ans-action-btn--send"
      title={t('subscribers.actions.sendPersonal')}
      aria-label={t('subscribers.actions.sendPersonal')}
      onClick={onSendPersonal}
      disabled={busy}
    >
      <span className="ans-icon">
        <Send />
      </span>
    </button>
    {item.status === 'blocked' ? (
      <button
        type="button"
        className="ans-action-btn ans-action-btn--unblock"
        title={t('subscribers.actions.unblock')}
        aria-label={t('subscribers.actions.unblock')}
        onClick={onUnblock}
        disabled={busy}
      >
        <span className="ans-icon">
          <CheckCircle2 />
        </span>
      </button>
    ) : (
      <button
        type="button"
        className="ans-action-btn ans-action-btn--block"
        title={t('subscribers.actions.block')}
        aria-label={t('subscribers.actions.block')}
        onClick={onBlock}
        disabled={busy}
      >
        <span className="ans-icon">
          <Ban />
        </span>
      </button>
    )}
    <button
      type="button"
      className="ans-action-btn ans-action-btn--delete"
      title={t('subscribers.actions.delete')}
      aria-label={t('subscribers.actions.delete')}
      onClick={onDelete}
      disabled={busy}
    >
      <span className="ans-icon">
        <Trash2 />
      </span>
    </button>
  </div>
);
