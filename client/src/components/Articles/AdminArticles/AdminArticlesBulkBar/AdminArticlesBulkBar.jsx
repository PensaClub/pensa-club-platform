import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './adminArticlesBulkBar.css';

/**
 * AdminArticlesBulkBar — sticky-top bar that appears when at least one item
 * is selected on the admin articles list (Phase 3). Prefix `aabb-`.
 *
 * Props:
 *   selectedCount       — number of currently selected ids
 *   pageCount           — number of items currently shown on the page
 *   totalMatching       — number of items matching the active filters across
 *                         all pages (used by the "select all matching" CTA)
 *   allOnPageSelected   — whether every visible item is in selectedIds
 *   onSelectAllOnPage   — callback to toggle "select all on this page"
 *   onSelectAllMatching — optional; when present the bar shows the second
 *                         CTA after page-level select. Pass null to hide.
 *   onClearSelection    — clear the selection
 *   onAction(action)    — fired when the user picks one of the action btns
 *                         (action = 'delete'|'archive'|'publish'|'draft')
 *   busy                — disables every action while a bulk request runs
 */
const AdminArticlesBulkBar = ({
  selectedCount = 0,
  pageCount = 0,
  totalMatching = 0,
  allOnPageSelected = false,
  onSelectAllOnPage,
  onSelectAllMatching = null,
  onClearSelection,
  onAction,
  busy = false,
}) => {
  const { t } = useTranslation('adminArticles');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuWrapRef = useRef(null);

  // Close the mobile actions dropdown on outside click / Esc.
  useEffect(() => {
    if (!menuOpen) return undefined;
    const onClick = (e) => {
      if (menuWrapRef.current && !menuWrapRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const visible = selectedCount > 0;

  const handleAction = (action) => {
    if (busy) return;
    setMenuOpen(false);
    onAction?.(action);
  };

  // Show the "select all matching" CTA only when:
  // - the consumer wired the callback,
  // - all on the page are picked,
  // - and there is a meaningful difference (totalMatching > pageCount).
  const showSelectAllMatching = Boolean(
    onSelectAllMatching && allOnPageSelected && totalMatching > selectedCount && totalMatching > pageCount
  );

  return (
    <div
      className={`aabb-wrap ${visible ? 'aabb-visible' : ''}`}
      role="region"
      aria-label={t('bulk.actionsMenu')}
      aria-hidden={!visible}
    >
      <div className="aabb-inner">
        <div className="aabb-summary">
          <span className="aabb-count">
            {t('bulk.selected', { count: selectedCount })}
          </span>
          <span className="aabb-divider" aria-hidden="true">|</span>
          <button
            type="button"
            className="aabb-link"
            onClick={onSelectAllOnPage}
            disabled={busy || pageCount === 0}
          >
            {t('bulk.selectAllOnPage')}
          </button>
          {showSelectAllMatching && (
            <button
              type="button"
              className="aabb-link"
              onClick={onSelectAllMatching}
              disabled={busy}
            >
              {t('bulk.selectAllMatching', { count: totalMatching })}
            </button>
          )}
          <button
            type="button"
            className="aabb-link aabb-link-danger"
            onClick={onClearSelection}
            disabled={busy}
          >
            {t('bulk.clearSelection')}
          </button>
        </div>

        {/* Desktop / wide tablets — inline buttons */}
        <div className="aabb-actions aabb-actions-inline">
          <button
            type="button"
            className="aabb-btn aabb-btn-publish"
            onClick={() => handleAction('publish')}
            disabled={busy}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" stroke="currentColor" strokeWidth="1.6" />
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
            </svg>
            <span>{t('bulk.actions.publish')}</span>
          </button>
          <button
            type="button"
            className="aabb-btn aabb-btn-archive"
            onClick={() => handleAction('archive')}
            disabled={busy}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M21 8H3M21 8v12a1 1 0 01-1 1H4a1 1 0 01-1-1V8M21 8l-2-4H5L3 8M10 12h4" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
            </svg>
            <span>{t('bulk.actions.archive')}</span>
          </button>
          <button
            type="button"
            className="aabb-btn aabb-btn-draft"
            onClick={() => handleAction('draft')}
            disabled={busy}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
              <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
            </svg>
            <span>{t('bulk.actions.draft')}</span>
          </button>
          <button
            type="button"
            className="aabb-btn aabb-btn-delete"
            onClick={() => handleAction('delete')}
            disabled={busy}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M6 6l1 14a2 2 0 002 2h6a2 2 0 002-2l1-14M10 11v6M14 11v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>{t('bulk.actions.delete')}</span>
          </button>
        </div>

        {/* Mobile — collapsed dropdown */}
        <div className="aabb-actions aabb-actions-mobile" ref={menuWrapRef}>
          <button
            type="button"
            className="aabb-btn aabb-btn-menu"
            onClick={() => setMenuOpen((v) => !v)}
            disabled={busy}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="5" cy="12" r="1.5" fill="currentColor" />
              <circle cx="12" cy="12" r="1.5" fill="currentColor" />
              <circle cx="19" cy="12" r="1.5" fill="currentColor" />
            </svg>
            <span>{t('bulk.actionsMenu')}</span>
          </button>
          {menuOpen && (
            <div className="aabb-menu" role="menu">
              <button
                type="button"
                role="menuitem"
                className="aabb-menu-item"
                onClick={() => handleAction('publish')}
                disabled={busy}
              >
                {t('bulk.actions.publish')}
              </button>
              <button
                type="button"
                role="menuitem"
                className="aabb-menu-item"
                onClick={() => handleAction('archive')}
                disabled={busy}
              >
                {t('bulk.actions.archive')}
              </button>
              <button
                type="button"
                role="menuitem"
                className="aabb-menu-item"
                onClick={() => handleAction('draft')}
                disabled={busy}
              >
                {t('bulk.actions.draft')}
              </button>
              <button
                type="button"
                role="menuitem"
                className="aabb-menu-item aabb-menu-item-danger"
                onClick={() => handleAction('delete')}
                disabled={busy}
              >
                {t('bulk.actions.delete')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminArticlesBulkBar;
