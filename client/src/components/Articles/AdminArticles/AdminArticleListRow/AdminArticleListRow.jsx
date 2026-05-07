import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { LocalizedLink } from '../../../LocalizedLink/LocalizedLink';
import { useLocalizedNavigate } from '../../../../hooks/useLocalizedNavigate';
import { localePath } from '../../../../utils/languageUtils';
import { getResizedUrl } from '../../../../utils/firebaseImageResize';
import { useAnalytics } from '../../../contexts/AnalyticsContext';
import { formatRelative } from '../adminArticlesUtils';
import './adminArticleListRow.css';

/**
 * AdminArticleListRow — denser horizontal row variant. Same actions as the
 * card; better scan-density for power users. Phase 3 added selection mode +
 * quick preview button.
 */
const AdminArticleListRowImpl = ({
  article,
  onDeleteRequest,
  onToggleVisibility,
  onQuickPreview,
  onSelect,
  isSelected = false,
  selectionMode = false,
  busy = false,
}) => {
  const { t, i18n } = useTranslation('adminArticles');
  const navigate = useLocalizedNavigate();
  const { getViewCount } = useAnalytics();

  const status = article.status || 'published';
  const isScheduled = useMemo(() => {
    if (status !== 'published' || !article.publishDate) return false;
    return new Date(article.publishDate).getTime() > Date.now();
  }, [status, article.publishDate]);
  const effectiveStatus = isScheduled ? 'scheduled' : status;

  const getImageSource = () => {
    if (!article.mainImage) return '';
    if (article.mainImage.type === 'video') return article.mainImage.thumbnail || '';
    if (Array.isArray(article.mainImage.sources) && article.mainImage.sources.length > 0) {
      return article.mainImage.sources[0] || '';
    }
    return '';
  };
  const rawImage = getImageSource();
  const imageSrc = rawImage || '/default-article-image.jpg';

  const formatDate = (dateString) => {
    if (!dateString) return t('card.noDate');
    try {
      return new Date(dateString).toLocaleDateString(i18n.language || 'bg', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const navigateToEdit = () => {
    navigate(`/profile/article-edit/${article.id}`);
  };

  const handleClick = () => {
    if (busy) return;
    if (selectionMode) {
      onSelect?.(article.id);
      return;
    }
    navigateToEdit();
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  const stop = (e) => e.stopPropagation();

  const toggleAction = status === 'published' ? 'archived' : 'published';
  const toggleLabel = toggleAction === 'archived' ? t('card.archiveBtn') : t('card.publishBtn');

  const editorName = article.lastEditor?.username
    || (typeof article.updatedBy === 'string' ? article.updatedBy : null);
  const editedRelative = article.updatedAt ? formatRelative(article.updatedAt, t, i18n.language) : null;

  const viewCount = (() => {
    try {
      const c = getViewCount?.(article.id);
      return Number.isFinite(c) ? c : 0;
    } catch {
      return 0;
    }
  })();

  const rowClassName = [
    'aalr-row',
    `aalr-status-${effectiveStatus}`,
    busy ? 'aalr-busy' : '',
    selectionMode ? 'aalr-selection-mode' : '',
    isSelected ? 'aalr-selected' : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      className={rowClassName}
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKey}
      aria-label={article.title}
      aria-pressed={selectionMode ? isSelected : undefined}
    >
      {/* Selection checkbox — leading slot. Visible always on touch, on
       * hover/focus on desktop, and when the page is in selection mode. */}
      <label
        className="aalr-select-wrap"
        onClick={stop}
        title={t('card.selectArticle')}
      >
        <input
          type="checkbox"
          className="aalr-select"
          checked={isSelected}
          onChange={() => onSelect?.(article.id)}
          onClick={stop}
          aria-label={t('card.selectArticle')}
        />
      </label>

      <div className="aalr-thumb-wrap">
        <img
          src={getResizedUrl(imageSrc, 600)}
          alt={article.title || ''}
          className="aalr-thumb"
          loading="lazy"
          decoding="async"
          onError={(e) => {
            if (e.target.src !== imageSrc) e.target.src = imageSrc;
          }}
        />
      </div>

      <div className="aalr-body">
        <div className="aalr-title-row">
          <h3 className="aalr-title">{article.title}</h3>
          <span className={`aalr-status-pill aalr-status-pill-${effectiveStatus}`}>
            {t(`card.statusBadge.${effectiveStatus}`)}
          </span>
        </div>
        <div className="aalr-meta">
          <span className="aalr-meta-item">{article.author || t('card.noAuthor')}</span>
          <span className="aalr-meta-sep">•</span>
          <span className="aalr-meta-item">{formatDate(article.publishDate)}</span>
          <span className="aalr-meta-sep">•</span>
          <span className="aalr-meta-item">{t('card.viewsLabel', { count: viewCount })}</span>
          {editorName && (
            <>
              <span className="aalr-meta-sep">•</span>
              <span className="aalr-meta-item aalr-meta-edited" title={article.updatedAt ? new Date(article.updatedAt).toLocaleString(i18n.language) : ''}>
                {t('card.lastEditedByRelative', {
                  name: editorName,
                  relative: editedRelative || '',
                })}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="aalr-actions" onClick={stop}>
        <LocalizedLink
          to={`/profile/article-edit/${article.id}`}
          className="aalr-action aalr-action-edit"
          onClick={stop}
          title={t('card.editBtn')}
          aria-label={t('card.editBtn')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor" />
          </svg>
        </LocalizedLink>

        <button
          type="button"
          className={`aalr-action ${toggleAction === 'archived' ? 'aalr-action-archive' : 'aalr-action-publish'}`}
          onClick={(e) => {
            stop(e);
            onToggleVisibility?.(article, toggleAction);
          }}
          disabled={busy}
          title={toggleLabel}
          aria-label={toggleLabel}
        >
          {toggleAction === 'archived' ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M17.94 17.94A10.06 10.06 0 0112 20c-7 0-10-8-10-8a18 18 0 014.06-5.94M9.9 4.24A10.05 10.05 0 0112 4c7 0 10 8 10 8a18.07 18.07 0 01-2.16 3.19M1 1l22 22M14.12 14.12a3 3 0 11-4.24-4.24" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" stroke="currentColor" strokeWidth="1.6" />
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          )}
        </button>

        <button
          type="button"
          className="aalr-action aalr-action-quick"
          onClick={(e) => {
            stop(e);
            onQuickPreview?.(article);
          }}
          disabled={busy}
          title={t('card.quickPreviewBtn')}
          aria-label={t('card.quickPreviewBtn')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" stroke="currentColor" strokeWidth="1.6" />
            <circle cx="12" cy="12" r="3.2" fill="currentColor" />
          </svg>
        </button>

        <a
          href={localePath(`/articles/${article.slug}`, i18n.language)}
          target="_blank"
          rel="noopener noreferrer"
          className="aalr-action aalr-action-preview"
          onClick={stop}
          title={t('card.previewBtn')}
          aria-label={t('card.previewBtn')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>

        <button
          type="button"
          className="aalr-action aalr-action-delete"
          onClick={(e) => {
            stop(e);
            onDeleteRequest?.(article);
          }}
          disabled={busy}
          title={t('card.deleteBtn')}
          aria-label={t('card.deleteBtn')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M6 6l1 14a2 2 0 002 2h6a2 2 0 002-2l1-14M10 11v6M14 11v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
};

const propsEqual = (a, b) => (
  a.article === b.article
  && a.busy === b.busy
  && a.isSelected === b.isSelected
  && a.selectionMode === b.selectionMode
  && a.onDeleteRequest === b.onDeleteRequest
  && a.onToggleVisibility === b.onToggleVisibility
  && a.onQuickPreview === b.onQuickPreview
  && a.onSelect === b.onSelect
);

const AdminArticleListRow = memo(AdminArticleListRowImpl, propsEqual);
export default AdminArticleListRow;
