import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './adminArticlesToolbar.css';

const SORT_OPTIONS = ['updatedAt', 'publishDate', 'createdAt', 'title', 'author', 'views'];
const STATUS_OPTIONS = ['all', 'draft', 'published', 'archived'];
const PAGE_SIZE_OPTIONS = [6, 12, 24, 48];

/**
 * AdminArticlesToolbar — search/sort/filter/view-toggle/items-per-page.
 *
 * Search input is debounced (300ms) so we don't fire a network request on
 * every keystroke. Other controls fire immediately.
 *
 * Authors / Tags dropdowns are populated from the parent (the parent collects
 * unique values across the current dataset; on the server we'd need a
 * dedicated endpoint, but for Phase 2 we derive from the current page items
 * + a "free-text" fallback by typing in the input). Phase 3 may upgrade
 * these to async typeahead.
 */
const AdminArticlesToolbar = ({
  filters,
  onChange,
  authorOptions = [],
  tagOptions = [],
  viewMode,
  onViewModeChange,
  totalCount,
}) => {
  const { t } = useTranslation('adminArticles');

  // Debounced search box. We keep a local "draft" string and only push it up
  // after 300ms of stillness. If `filters.search` changes externally (e.g.
  // "clear filters" button), we resync.
  const [searchDraft, setSearchDraft] = useState(filters.search || '');
  const lastEmittedRef = useRef(filters.search || '');

  useEffect(() => {
    if ((filters.search || '') !== lastEmittedRef.current) {
      setSearchDraft(filters.search || '');
      lastEmittedRef.current = filters.search || '';
    }
  }, [filters.search]);

  useEffect(() => {
    const handle = setTimeout(() => {
      if (searchDraft !== lastEmittedRef.current) {
        lastEmittedRef.current = searchDraft;
        onChange({ search: searchDraft });
      }
    }, 300);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchDraft]);

  const [filtersOpen, setFiltersOpen] = useState(false);

  const hasActiveFilters = Boolean(
    (filters.search && filters.search.trim()) ||
    (filters.status && filters.status !== 'all') ||
    filters.author ||
    filters.tag ||
    filters.dateFrom ||
    filters.dateTo
  );

  const clearAll = () => {
    setSearchDraft('');
    onChange({
      search: '',
      status: 'all',
      author: '',
      tag: '',
      dateFrom: '',
      dateTo: '',
    });
  };

  return (
    <div className="aat-wrap">
      {/* Top row: search + view toggle */}
      <div className="aat-top-row">
        <div className="aat-search-wrap">
          <svg className="aat-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            className="aat-search-input"
            placeholder={t('toolbar.searchPlaceholder')}
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
          />
          {searchDraft && (
            <button
              type="button"
              className="aat-search-clear"
              onClick={() => setSearchDraft('')}
              aria-label={t('toolbar.clearFilters')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>

        <div className="aat-view-toggle" role="group" aria-label={t('toolbar.viewMode.grid')}>
          <button
            type="button"
            className={`aat-view-btn ${viewMode === 'grid' ? 'aat-view-btn-active' : ''}`}
            onClick={() => onViewModeChange('grid')}
            aria-label={t('toolbar.viewMode.grid')}
            title={t('toolbar.viewMode.grid')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>
          <button
            type="button"
            className={`aat-view-btn ${viewMode === 'list' ? 'aat-view-btn-active' : ''}`}
            onClick={() => onViewModeChange('list')}
            aria-label={t('toolbar.viewMode.list')}
            title={t('toolbar.viewMode.list')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <button
          type="button"
          className={`aat-filters-toggle ${filtersOpen ? 'aat-filters-toggle-open' : ''} ${hasActiveFilters ? 'aat-filters-toggle-active' : ''}`}
          onClick={() => setFiltersOpen((v) => !v)}
          aria-expanded={filtersOpen}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M3 6h18M6 12h12M10 18h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span>{t('toolbar.filters')}</span>
          {hasActiveFilters && <span className="aat-filters-toggle-dot" />}
        </button>
      </div>

      {/* Status pills — always visible */}
      <div className="aat-status-row" role="tablist" aria-label={t('toolbar.status.all')}>
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            type="button"
            role="tab"
            aria-selected={filters.status === s}
            className={`aat-chip ${filters.status === s ? 'aat-chip-active' : ''}`}
            onClick={() => onChange({ status: s })}
          >
            {t(`toolbar.status.${s}`)}
          </button>
        ))}

        {totalCount !== undefined && (
          <span className="aat-total-inline">{t('page.totalCount', { count: totalCount })}</span>
        )}
      </div>

      {/* Collapsible advanced row */}
      <div className={`aat-advanced ${filtersOpen ? 'aat-advanced-open' : ''}`}>
        <div className="aat-field">
          <label className="aat-field-label">{t('toolbar.sortBy')}</label>
          <div className="aat-sort-buttons">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                className={`aat-sort-btn ${filters.sort === opt ? 'aat-sort-btn-active' : ''}`}
                onClick={() => onChange({ sort: opt })}
              >
                {t(`toolbar.sortOptions.${opt}`)}
              </button>
            ))}
            <button
              type="button"
              className="aat-order-btn"
              onClick={() => onChange({ order: filters.order === 'asc' ? 'desc' : 'asc' })}
              title={filters.order === 'asc' ? t('toolbar.order.asc') : t('toolbar.order.desc')}
              aria-label={filters.order === 'asc' ? t('toolbar.order.asc') : t('toolbar.order.desc')}
            >
              {filters.order === 'asc' ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 19V5M5 12l7-7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="aat-field-row">
          <div className="aat-field">
            <label className="aat-field-label" htmlFor="aat-author">{t('toolbar.author.label')}</label>
            <input
              id="aat-author"
              type="text"
              list="aat-author-list"
              className="aat-input"
              placeholder={t('toolbar.author.placeholder')}
              value={filters.author || ''}
              onChange={(e) => onChange({ author: e.target.value })}
            />
            {authorOptions.length > 0 && (
              <datalist id="aat-author-list">
                {authorOptions.map((a, i) => (
                  <option key={i} value={a} />
                ))}
              </datalist>
            )}
          </div>

          <div className="aat-field">
            <label className="aat-field-label" htmlFor="aat-tag">{t('toolbar.tag.label')}</label>
            <input
              id="aat-tag"
              type="text"
              list="aat-tag-list"
              className="aat-input"
              placeholder={t('toolbar.tag.placeholder')}
              value={filters.tag || ''}
              onChange={(e) => onChange({ tag: e.target.value })}
            />
            {tagOptions.length > 0 && (
              <datalist id="aat-tag-list">
                {tagOptions.map((tg, i) => (
                  <option key={i} value={tg} />
                ))}
              </datalist>
            )}
          </div>
        </div>

        <div className="aat-field-row">
          <div className="aat-field">
            <label className="aat-field-label" htmlFor="aat-date-from">{t('toolbar.dateFrom')}</label>
            <input
              id="aat-date-from"
              type="date"
              className="aat-input"
              value={filters.dateFrom || ''}
              onChange={(e) => onChange({ dateFrom: e.target.value })}
            />
          </div>
          <div className="aat-field">
            <label className="aat-field-label" htmlFor="aat-date-to">{t('toolbar.dateTo')}</label>
            <input
              id="aat-date-to"
              type="date"
              className="aat-input"
              value={filters.dateTo || ''}
              onChange={(e) => onChange({ dateTo: e.target.value })}
            />
          </div>

          <div className="aat-field">
            <label className="aat-field-label" htmlFor="aat-limit">{t('toolbar.itemsPerPage')}</label>
            <select
              id="aat-limit"
              className="aat-input aat-select"
              value={filters.limit}
              onChange={(e) => onChange({ limit: parseInt(e.target.value, 10) || 6 })}
            >
              {PAGE_SIZE_OPTIONS.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <button type="button" className="aat-clear-btn" onClick={clearAll}>
            {t('toolbar.clearFilters')}
          </button>
        )}
      </div>
    </div>
  );
};

export default AdminArticlesToolbar;
