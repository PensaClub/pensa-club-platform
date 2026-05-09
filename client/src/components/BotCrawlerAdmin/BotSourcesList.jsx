import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HelpCircle,
  Loader2,
  ShieldAlert,
  Clock,
} from 'lucide-react';
import { useCrawlerContext } from '../contexts/CrawlerContext';
import { notify } from '../../utils/notify.jsx';
import AddSourceModal from './AddSourceModal';
import DeleteConfirmModal from '../Articles/AdminArticles/DeleteConfirmModal/DeleteConfirmModal';
import './botSourcesList.css';

/**
 * Map a backend validationStatus to a UI variant. Anything we don't
 * recognize falls back to "unknown" (gray) instead of crashing.
 */
const STATUS_META = {
  ok: { variant: 'ok', Icon: CheckCircle2 },
  unreachable: { variant: 'error', Icon: XCircle },
  no_rss: { variant: 'warn', Icon: AlertTriangle },
  parser_error: { variant: 'error', Icon: XCircle },
  blocked_by_robots: { variant: 'warn', Icon: ShieldAlert },
  unknown: { variant: 'unknown', Icon: HelpCircle },
};

const formatDate = (value, locale) => {
  if (!value) return '';
  try {
    return new Date(value).toLocaleString(locale || undefined);
  } catch {
    return String(value);
  }
};

const ValidationPill = ({ status, lastValidatedAt, t, locale }) => {
  const key = STATUS_META[status] ? status : 'unknown';
  const meta = STATUS_META[key];
  const { Icon } = meta;
  const tooltip = lastValidatedAt
    ? t('source.validation.lastValidatedAt', { time: formatDate(lastValidatedAt, locale) })
    : t('source.validation.neverValidated');
  return (
    <span
      className={`bcsl-pill bcsl-pill-${meta.variant}`}
      title={tooltip}
    >
      <Icon size={12} aria-hidden="true" />
      <span>{t(`source.validation.status.${key}`)}</span>
      {key === 'ok' && lastValidatedAt && (
        <Clock size={11} aria-hidden="true" className="bcsl-pill-clock" />
      )}
    </span>
  );
};

const BotSourcesList = ({ botId }) => {
  const { t, i18n } = useTranslation('botCrawler');
  const {
    listSources, createSource, updateSource, deleteSource, revalidateSource,
  } = useCrawlerContext();
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletePending, setDeletePending] = useState(false);
  // Track per-source revalidation spinners so multiple rows can run in parallel.
  const [revalidatingIds, setRevalidatingIds] = useState(() => new Set());

  const locale = i18n?.language || 'bg';

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await listSources(botId);
    const list = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
    setSources(list);
    setLoading(false);
  }, [botId, listSources]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleSave = async (payload) => {
    try {
      await createSource(botId, payload);
      notify('success', null, t('toast.sourceAdded'));
      setAddOpen(false);
      refresh();
    } catch {
      // toasted by context
    }
  };

  const handleEditSave = async (payload) => {
    if (!editTarget) return;
    try {
      await updateSource(editTarget.id, payload);
      notify('success', null, t('toast.sourceUpdated'));
      setEditTarget(null);
      refresh();
    } catch {
      // toasted by context
    }
  };

  const handleToggleActive = async (source) => {
    const next = !source.active;
    setSources((prev) => prev.map((s) => (s.id === source.id ? { ...s, active: next } : s)));
    try {
      await updateSource(source.id, { active: next });
    } catch {
      setSources((prev) => prev.map((s) => (s.id === source.id ? { ...s, active: !next } : s)));
    }
  };

  const handleRevalidate = async (source) => {
    if (revalidatingIds.has(source.id)) return;
    setRevalidatingIds((prev) => {
      const next = new Set(prev);
      next.add(source.id);
      return next;
    });
    try {
      const response = await revalidateSource(source.id);
      // Backend returns { item, validation } on success. Update only this row.
      const updated = response?.item;
      if (updated && updated.id) {
        setSources((prev) => prev.map((s) => (s.id === updated.id ? { ...s, ...updated } : s)));
      } else {
        // Fallback: refresh whole list if shape differs.
        refresh();
      }
    } finally {
      setRevalidatingIds((prev) => {
        const next = new Set(prev);
        next.delete(source.id);
        return next;
      });
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeletePending(true);
    try {
      await deleteSource(deleteTarget.id);
      setSources((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      // toasted
    } finally {
      setDeletePending(false);
    }
  };

  const rows = useMemo(() => sources, [sources]);

  return (
    <div className="bcsl-wrap">
      <div className="bcsl-toolbar">
        <button type="button" className="bcsl-btn bcsl-btn-primary" onClick={() => setAddOpen(true)}>
          <Plus size={16} aria-hidden="true" />
          <span>{t('source.add', 'Добави източник')}</span>
        </button>
      </div>

      {loading ? (
        <div className="bcsl-empty">…</div>
      ) : rows.length === 0 ? (
        <div className="bcsl-empty">
          <p className="bcsl-empty-text">{t('source.empty')}</p>
        </div>
      ) : (
        <ul className="bcsl-list">
          {rows.map((source) => {
            const status = source.validationStatus || 'unknown';
            const isRevalidating = revalidatingIds.has(source.id);
            const robotsBlocked = source.robotsAllowed === false;

            return (
              <li key={source.id} className="bcsl-row">
                <div className="bcsl-row-main">
                  <div className="bcsl-name-row">
                    <div className="bcsl-name">{source.name}</div>
                    <ValidationPill
                      status={status}
                      lastValidatedAt={source.lastValidatedAt}
                      t={t}
                      locale={locale}
                    />
                    {robotsBlocked && (
                      <span
                        className="bcsl-robots-warn"
                        title={t('source.validation.robotsBlocked')}
                      >
                        <ShieldAlert size={12} aria-hidden="true" />
                      </span>
                    )}
                  </div>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bcsl-url"
                  >
                    <span>{source.url}</span>
                    <ExternalLink size={12} aria-hidden="true" />
                  </a>
                  {source.validationMessage && (
                    <p className="bcsl-validation-msg">{source.validationMessage}</p>
                  )}
                  {source.sourceType && (
                    <span className="bcsl-tag">{t(`source.type.${source.sourceType}`, source.sourceType)}</span>
                  )}
                </div>
                <div className="bcsl-row-actions">
                  <label className="bcsl-toggle">
                    <input
                      type="checkbox"
                      checked={!!source.active}
                      onChange={() => handleToggleActive(source)}
                    />
                    <span className="bcsl-toggle-slider" />
                    <span className="bcsl-toggle-label">{t('source.fields.active')}</span>
                  </label>
                  <button
                    type="button"
                    className="bcsl-btn bcsl-btn-icon"
                    onClick={() => handleRevalidate(source)}
                    aria-label={t('source.validation.revalidate')}
                    title={t('source.validation.revalidate')}
                    disabled={isRevalidating}
                  >
                    {isRevalidating ? (
                      <Loader2 size={16} className="bcsl-spin" aria-hidden="true" />
                    ) : (
                      <RefreshCw size={16} aria-hidden="true" />
                    )}
                  </button>
                  <button
                    type="button"
                    className="bcsl-btn bcsl-btn-icon"
                    onClick={() => setEditTarget(source)}
                    aria-label={t('card.actions.edit')}
                    title={t('card.actions.edit')}
                  >
                    <Pencil size={16} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="bcsl-btn bcsl-btn-danger"
                    onClick={() => setDeleteTarget(source)}
                    aria-label={t('card.actions.delete')}
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <AddSourceModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSave={handleSave}
      />

      <AddSourceModal
        open={!!editTarget}
        source={editTarget}
        onClose={() => setEditTarget(null)}
        onSave={handleEditSave}
      />

      <DeleteConfirmModal
        open={!!deleteTarget}
        title={t('confirm.deleteSource.title')}
        message={t('confirm.deleteSource.message', { name: deleteTarget?.name || '' })}
        cancelLabel={t('card.actions.cancel', 'Cancel')}
        confirmLabel={t('card.actions.delete')}
        loading={deletePending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default BotSourcesList;
