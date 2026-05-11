import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ExternalLink, FilePlus, EyeOff, Check, Search, Eye, X as XIcon, Sparkles } from 'lucide-react';
import { LocalizedLink } from '../LocalizedLink/LocalizedLink';
import { useCrawlerContext } from '../contexts/CrawlerContext';
import { notify } from '../../utils/notify.jsx';
import { getResizedUrl } from '../../utils/firebaseImageResize';
import './findingsList.css';

const STATUS_FILTERS = ['new', 'reviewed', 'dismissed', 'used'];
const ORDER_OPTIONS = ['published_desc', 'published_asc', 'found_desc', 'relevance_desc'];
const PAGE_SIZE = 20;

const FindingsList = ({ botId }) => {
  const { t, i18n } = useTranslation('botCrawler');
  const { listFindings, updateFindingStatus, bulkUpdateFindingStatus, listSources } = useCrawlerContext();

  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: PAGE_SIZE, total: 0, totalPages: 0 });
  const [counts, setCounts] = useState({ new: 0, reviewed: 0, dismissed: 0, used: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('new');
  const [orderBy, setOrderBy] = useState('published_desc');
  const [sourceFilter, setSourceFilter] = useState(''); // empty = all
  const [sources, setSources] = useState([]);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const debounceRef = useRef(null);
  // Selected finding ids for bulk operations. Cleared whenever the visible
  // result set changes (filter / search / sort / source / page).
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [bulkPending, setBulkPending] = useState(false);

  // Debounce search 300ms.
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => debounceRef.current && clearTimeout(debounceRef.current);
  }, [searchInput]);

  // Load sources for the source-filter dropdown. Only meaningful when scoped
  // to a single bot — the cross-bot view doesn't have one source list.
  useEffect(() => {
    if (!botId) { setSources([]); return; }
    let cancelled = false;
    (async () => {
      try {
        const data = await listSources(botId);
        const list = Array.isArray(data) ? data : (Array.isArray(data?.items) ? data.items : []);
        if (!cancelled) setSources(list);
      } catch {
        if (!cancelled) setSources([]);
      }
    })();
    return () => { cancelled = true; };
  }, [botId, listSources]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = {
      page,
      limit: PAGE_SIZE,
      status: statusFilter,
      order: orderBy,
    };
    if (botId) params.botId = botId;
    if (sourceFilter) params.sourceId = sourceFilter;
    if (debouncedSearch) params.search = debouncedSearch;
    const response = await listFindings(params);
    setItems(Array.isArray(response?.items) ? response.items : []);
    setPagination(response?.pagination || { page: 1, limit: PAGE_SIZE, total: 0, totalPages: 0 });
    if (response?.counts) {
      setCounts({
        new: response.counts.new || 0,
        reviewed: response.counts.reviewed || 0,
        dismissed: response.counts.dismissed || 0,
        used: response.counts.used || 0,
        total: response.counts.total || 0,
      });
    }
    setLoading(false);
  }, [botId, listFindings, page, statusFilter, debouncedSearch, orderBy, sourceFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Reset selection any time the visible page changes — old ids may not be
  // on the page any more, and silent persistence would surprise the admin.
  useEffect(() => {
    setSelectedIds(new Set());
  }, [statusFilter, sourceFilter, debouncedSearch, orderBy, page]);

  const handleStatus = async (finding, nextStatus, toastKey) => {
    // Optimistic: remove from current view immediately.
    const prevItems = items;
    setItems((curr) => curr.filter((f) => f.id !== finding.id));
    try {
      await updateFindingStatus(finding.id, { status: nextStatus });
      if (toastKey) notify('success', null, t(toastKey));
    } catch {
      // Revert on failure.
      setItems(prevItems);
    }
  };

  const toggleOne = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const allOnPageSelected = items.length > 0 && items.every((f) => selectedIds.has(f.id));
  const someOnPageSelected = items.some((f) => selectedIds.has(f.id));

  const toggleAllOnPage = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allOnPageSelected) {
        // Deselect all visible
        items.forEach((f) => next.delete(f.id));
      } else {
        items.forEach((f) => next.add(f.id));
      }
      return next;
    });
  };

  const handleBulkStatus = async (nextStatus, toastKey) => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    setBulkPending(true);
    const prevItems = items;
    // Optimistic — drop them from view if the new status no longer matches
    // the active filter.
    if (nextStatus !== statusFilter) {
      setItems((curr) => curr.filter((f) => !selectedIds.has(f.id)));
    }
    try {
      const res = await bulkUpdateFindingStatus({ ids, status: nextStatus });
      notify('success', null, t(toastKey, { count: res?.updated ?? ids.length }));
      setSelectedIds(new Set());
      // Refetch counts so the chips reflect the new totals.
      fetchData();
    } catch {
      setItems(prevItems);
    } finally {
      setBulkPending(false);
    }
  };

  const clearSelection = () => setSelectedIds(new Set());

  const formatDate = (iso) => {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleString(i18n.language === 'bg' ? 'bg-BG' : i18n.language, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  const truncate = (s, n) => {
    if (!s) return '';
    return s.length > n ? `${s.slice(0, n).trim()}…` : s;
  };

  const totalPages = pagination?.totalPages || 0;

  const resolvedImage = useMemo(() => (url) => {
    if (!url) return null;
    if (url.includes('firebasestorage.googleapis.com')) {
      return getResizedUrl(url, 600);
    }
    return url;
  }, []);

  return (
    <div className="bcfl-wrap">
      <div className="bcfl-total-row">
        <span className="bcfl-total-label">{t('findings.totalLabel')}:</span>
        <span className="bcfl-total-value">{counts.total}</span>
      </div>
      <div className="bcfl-toolbar">
        <div className="bcfl-chips" role="tablist">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              type="button"
              role="tab"
              aria-selected={statusFilter === s}
              className={`bcfl-chip${statusFilter === s ? ' bcfl-chip-active' : ''}`}
              onClick={() => { setStatusFilter(s); setPage(1); }}
            >
              <span className="bcfl-chip-label">{t(`findings.filters.${s}`)}</span>
              <span className="bcfl-chip-count">{counts[s] ?? 0}</span>
            </button>
          ))}
        </div>
        <div className="bcfl-search">
          <Search size={16} aria-hidden="true" className="bcfl-search-icon" />
          <input
            type="search"
            className="bcfl-search-input"
            placeholder={t('findings.searchPlaceholder')}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
      </div>

      <div className="bcfl-controls">
        <label className="bcfl-control">
          <span className="bcfl-control-label">{t('findings.orderBy.label')}</span>
          <select
            className="bcfl-select"
            value={orderBy}
            onChange={(e) => { setOrderBy(e.target.value); setPage(1); }}
          >
            {ORDER_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{t(`findings.orderBy.${opt}`)}</option>
            ))}
          </select>
        </label>
        {botId && sources.length > 0 && (
          <label className="bcfl-control">
            <span className="bcfl-control-label">{t('findings.sourceFilter.label')}</span>
            <select
              className="bcfl-select"
              value={sourceFilter}
              onChange={(e) => { setSourceFilter(e.target.value); setPage(1); }}
            >
              <option value="">{t('findings.sourceFilter.all')}</option>
              {sources.map((s) => (
                <option key={s.id} value={s.id}>{s.name || s.url}</option>
              ))}
            </select>
          </label>
        )}
      </div>

      {!loading && items.length > 0 && (
        <div className="bcfl-select-row">
          <label className="bcfl-select-all">
            <input
              type="checkbox"
              checked={allOnPageSelected}
              ref={(el) => { if (el) el.indeterminate = !allOnPageSelected && someOnPageSelected; }}
              onChange={toggleAllOnPage}
            />
            <span>{t('findings.bulk.selectAll')}</span>
          </label>
          {selectedIds.size > 0 && (
            <span className="bcfl-select-count">{t('findings.bulk.selected', { count: selectedIds.size })}</span>
          )}
        </div>
      )}

      {selectedIds.size > 0 && (
        <div className="bcfl-bulk-bar" role="toolbar" aria-label={t('findings.bulk.barLabel')}>
          <span className="bcfl-bulk-count">{t('findings.bulk.selected', { count: selectedIds.size })}</span>
          <div className="bcfl-bulk-buttons">
            <button
              type="button"
              className="bcfl-bulk-btn"
              onClick={() => handleBulkStatus('reviewed', 'toast.bulkReviewed')}
              disabled={bulkPending}
            >
              <Eye size={14} aria-hidden="true" />
              <span>{t('findings.bulk.markReviewed')}</span>
            </button>
            <button
              type="button"
              className="bcfl-bulk-btn"
              onClick={() => handleBulkStatus('dismissed', 'toast.bulkDismissed')}
              disabled={bulkPending}
            >
              <EyeOff size={14} aria-hidden="true" />
              <span>{t('findings.bulk.markDismissed')}</span>
            </button>
            <button
              type="button"
              className="bcfl-bulk-btn bcfl-bulk-btn-success"
              onClick={() => handleBulkStatus('used', 'toast.bulkUsed')}
              disabled={bulkPending}
            >
              <Check size={14} aria-hidden="true" />
              <span>{t('findings.bulk.markUsed')}</span>
            </button>
            <button
              type="button"
              className="bcfl-bulk-btn bcfl-bulk-btn-ghost"
              onClick={clearSelection}
              disabled={bulkPending}
            >
              <XIcon size={14} aria-hidden="true" />
              <span>{t('findings.bulk.clearSelection')}</span>
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="bcfl-empty">…</div>
      ) : items.length === 0 ? (
        <div className="bcfl-empty">
          <p className="bcfl-empty-text">{t('findings.empty')}</p>
        </div>
      ) : (
        <ul className="bcfl-list">
          {items.map((f) => {
            const img = resolvedImage(f.imageUrl);
            const isSelected = selectedIds.has(f.id);
            return (
              <li key={f.id} className={`bcfl-card${isSelected ? ' bcfl-card-selected' : ''}`}>
                <label className="bcfl-card-check" aria-label={t('findings.bulk.selectItem')}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleOne(f.id)}
                  />
                </label>
                {img && (
                  <div className="bcfl-thumb-wrap">
                    <img
                      src={img}
                      alt=""
                      className="bcfl-thumb"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <div className="bcfl-body">
                  <div className="bcfl-title-row">
                    <h3 className="bcfl-title">{f.title || '(no title)'}</h3>
                    {Number.isFinite(f.relevanceScore) && (
                      <span
                        className={`bcfl-score bcfl-score-${
                          f.relevanceScore >= 80 ? 'high'
                          : f.relevanceScore >= 50 ? 'mid'
                          : 'low'
                        }`}
                        title={f.llmReasoning || ''}
                      >
                        AI: {f.relevanceScore}
                      </span>
                    )}
                  </div>
                  {f.description && (
                    <p className="bcfl-desc">{truncate(f.description, 280)}</p>
                  )}
                  {f.llmReasoning && (
                    <p className="bcfl-reasoning" title={f.llmReasoning}>
                      <Sparkles size={12} aria-hidden="true" /> {truncate(f.llmReasoning, 200)}
                    </p>
                  )}
                  <div className="bcfl-meta">
                    {f.source?.name && <span className="bcfl-source">{f.source.name}</span>}
                    {f.publishedAt && <span className="bcfl-date">{formatDate(f.publishedAt)}</span>}
                    {!f.publishedAt && f.foundAt && (
                      <span className="bcfl-date bcfl-date-fallback" title={t('findings.card.foundAtTooltip')}>
                        {t('findings.card.foundOn', { time: formatDate(f.foundAt) })}
                      </span>
                    )}
                  </div>
                  <div className="bcfl-actions">
                    <a
                      href={f.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bcfl-btn bcfl-btn-secondary"
                    >
                      <ExternalLink size={14} aria-hidden="true" />
                      <span>{t('findings.card.open')}</span>
                    </a>
                    <LocalizedLink
                      to={`/profile/article-create?fromFinding=${f.id}`}
                      className="bcfl-btn bcfl-btn-primary"
                    >
                      <FilePlus size={14} aria-hidden="true" />
                      <span>{t('findings.card.startArticle')}</span>
                    </LocalizedLink>
                    <button
                      type="button"
                      className="bcfl-btn bcfl-btn-secondary"
                      onClick={() => handleStatus(f, 'dismissed', 'toast.findingDismissed')}
                    >
                      <EyeOff size={14} aria-hidden="true" />
                      <span>{t('findings.card.dismiss')}</span>
                    </button>
                    <button
                      type="button"
                      className="bcfl-btn bcfl-btn-success"
                      onClick={() => handleStatus(f, 'used', 'toast.findingUsed')}
                    >
                      <Check size={14} aria-hidden="true" />
                      <span>{t('findings.card.used')}</span>
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {totalPages > 1 && (
        <div className="bcfl-pagination">
          <button
            type="button"
            className="bcfl-page-btn"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            ‹
          </button>
          <span className="bcfl-page-info">{page} / {totalPages}</span>
          <button
            type="button"
            className="bcfl-page-btn"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
};

export default FindingsList;
