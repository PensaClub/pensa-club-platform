import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ExternalLink, FilePlus, EyeOff, Check, Search } from 'lucide-react';
import { LocalizedLink } from '../LocalizedLink/LocalizedLink';
import { useCrawlerContext } from '../contexts/CrawlerContext';
import { notify } from '../../utils/notify.jsx';
import { getResizedUrl } from '../../utils/firebaseImageResize';
import './findingsList.css';

const STATUS_FILTERS = ['new', 'reviewed', 'dismissed', 'used'];
const ORDER_OPTIONS = ['published_desc', 'published_asc', 'found_desc'];
const PAGE_SIZE = 20;

const FindingsList = ({ botId }) => {
  const { t, i18n } = useTranslation('botCrawler');
  const { listFindings, updateFindingStatus, listSources } = useCrawlerContext();

  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: PAGE_SIZE, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('new');
  const [orderBy, setOrderBy] = useState('published_desc');
  const [sourceFilter, setSourceFilter] = useState(''); // empty = all
  const [sources, setSources] = useState([]);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const debounceRef = useRef(null);

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
    setLoading(false);
  }, [botId, listFindings, page, statusFilter, debouncedSearch, orderBy, sourceFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
              {t(`findings.filters.${s}`)}
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
            return (
              <li key={f.id} className="bcfl-card">
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
                  <h3 className="bcfl-title">{f.title || '(no title)'}</h3>
                  {f.description && (
                    <p className="bcfl-desc">{truncate(f.description, 280)}</p>
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
