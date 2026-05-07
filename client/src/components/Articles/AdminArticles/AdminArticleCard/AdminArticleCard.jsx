import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { LocalizedLink } from '../../../LocalizedLink/LocalizedLink';
import { useLocalizedNavigate } from '../../../../hooks/useLocalizedNavigate';
import { localePath } from '../../../../utils/languageUtils';
import { getResizedUrl } from '../../../../utils/firebaseImageResize';
import { useAnalytics } from '../../../contexts/AnalyticsContext';
import { formatRelative } from '../adminArticlesUtils';
import './adminArticleCard.css';

/**
 * AdminArticleCard — grid card variant for the admin articles list.
 * Phase 2 deliverable; Phase 3 layered selection mode + quick preview.
 *
 * Click on the card body navigates to /profile/article-edit/:id when no
 * selection is active. When `selectionMode` is true, clicking the body
 * toggles selection instead. Action buttons stop propagation so they don't
 * trigger that navigation.
 */
const AdminArticleCardImpl = ({
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

  const isExternalUrl = (url) => {
    if (!url) return false;
    if (url.includes('firebasestorage.googleapis.com')) return false;
    if (url.startsWith('/default-article-image')) return false;
    return url.startsWith('http://') || url.startsWith('https://');
  };

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
  const isExternalResource = isExternalUrl(rawImage);

  const formatDate = (dateString) => {
    if (!dateString) return t('card.noDate');
    const opts = { year: 'numeric', month: 'long', day: 'numeric' };
    try {
      return new Date(dateString).toLocaleDateString(i18n.language || 'bg', opts);
    } catch {
      return dateString;
    }
  };

  const truncateText = (text, max = 120) => {
    if (!text) return '';
    const plain = String(text).replace(/<[^>]*>?/gm, '');
    if (plain.length <= max) return plain;
    return plain.substr(0, max) + '...';
  };

  const navigateToEdit = () => {
    navigate(`/profile/article-edit/${article.id}`);
  };

  const handleCardClick = () => {
    if (busy) return;
    if (selectionMode) {
      onSelect?.(article.id);
      return;
    }
    navigateToEdit();
  };

  const handleCardKey = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick();
    }
  };

  const stop = (e) => e.stopPropagation();

  // Visibility toggle decisions
  const toggleAction = status === 'published' ? 'archived' : 'published';
  const toggleLabel = toggleAction === 'archived' ? t('card.archiveBtn') : t('card.publishBtn');

  // Tags
  const tags = Array.isArray(article.tags) ? article.tags : [];

  // Richness counters
  const sectionsCount = Array.isArray(article.sections) ? article.sections.length : 0;
  const linksCount = Array.isArray(article.usefulLinks) ? article.usefulLinks.length : 0;
  let imagesCount = 0;
  if (article.mainImage) {
    if (Array.isArray(article.mainImage.sources)) imagesCount += article.mainImage.sources.length;
    else if (article.mainImage.thumbnail) imagesCount += 1;
  }
  if (Array.isArray(article.sections)) {
    article.sections.forEach((s) => {
      if (Array.isArray(s.sectionImages)) imagesCount += s.sectionImages.length;
    });
  }

  // Last edited line
  const editorName = article.lastEditor?.username
    || (typeof article.updatedBy === 'string' ? article.updatedBy : null);
  const editorWhen = article.updatedAt;
  const editedRelative = editorWhen ? formatRelative(editorWhen, t, i18n.language) : null;

  // View count
  const viewCount = (() => {
    try {
      const c = getViewCount?.(article.id);
      return Number.isFinite(c) ? c : '—';
    } catch {
      return '—';
    }
  })();

  const cardClassName = [
    'aac-card',
    `aac-status-${effectiveStatus}`,
    busy ? 'aac-busy' : '',
    selectionMode ? 'aac-selection-mode' : '',
    isSelected ? 'aac-selected' : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      className={cardClassName}
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleCardKey}
      aria-label={article.title}
      aria-pressed={selectionMode ? isSelected : undefined}
    >
      {/* Selection checkbox layer — visible on hover, on touch devices, or
       * whenever selection mode is active (so clicks remain easy). */}
      <label
        className="aac-select-wrap"
        onClick={stop}
        title={t('card.selectArticle')}
      >
        <input
          type="checkbox"
          className="aac-select"
          checked={isSelected}
          onChange={() => onSelect?.(article.id)}
          onClick={stop}
          aria-label={t('card.selectArticle')}
        />
      </label>

      <div className="aac-image-wrap">
        <img
          src={getResizedUrl(imageSrc, 600)}
          alt={article.title || ''}
          className="aac-thumb"
          loading="lazy"
          decoding="async"
          onError={(e) => {
            if (e.target.src !== imageSrc) e.target.src = imageSrc;
          }}
        />

        {/* Status pill */}
        <span className={`aac-status-pill aac-status-pill-${effectiveStatus}`}>
          {t(`card.statusBadge.${effectiveStatus}`)}
        </span>

        <div className="aac-image-badges">
          {article.mainImage?.type === 'slider' && Array.isArray(article.mainImage.sources) && article.mainImage.sources.length > 1 && (
            <span className="aac-badge aac-badge-slider">
              {t('card.slider', { count: article.mainImage.sources.length })}
            </span>
          )}
          {article.mainImage?.type === 'video' && (
            <span className="aac-badge aac-badge-video">{t('card.video')}</span>
          )}
          {isExternalResource && (
            <span className="aac-badge aac-badge-external">{t('card.externalSource')}</span>
          )}
        </div>
      </div>

      <div className="aac-body">
        <h3 className="aac-title">{article.title}</h3>

        <div className="aac-meta">
          <span className="aac-meta-item" title={article.author || ''}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 12a4 4 0 100-8 4 4 0 000 8zM4 20c0-3.314 3.582-6 8-6s8 2.686 8 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {article.author || t('card.noAuthor')}
          </span>
          <span className="aac-meta-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />
              <path d="M3 9h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            {formatDate(article.publishDate)}
          </span>
          <span className="aac-meta-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" stroke="currentColor" strokeWidth="1.6" />
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
            </svg>
            {t('card.viewsLabel', { count: viewCount === '—' ? 0 : viewCount })}
          </span>
        </div>

        <p className="aac-summary">{truncateText(article.summary, 120)}</p>

        {(editorName || editedRelative) && (
          <div className="aac-edited">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor" />
            </svg>
            <span title={formatDate(editorWhen)}>
              {t('card.lastEditedByRelative', {
                name: editorName || t('card.noAuthor'),
                relative: editedRelative,
              })}
            </span>
          </div>
        )}

        {tags.length > 0 && (
          <div className="aac-tags">
            {tags.slice(0, 3).map((tag, idx) => (
              <span key={idx} className="aac-tag">{tag}</span>
            ))}
            {tags.length > 3 && (
              <span className="aac-tag aac-tag-more">
                {t('card.tagsMore', { count: tags.length - 3 })}
              </span>
            )}
          </div>
        )}

        <div className="aac-richness">
          <span className={`aac-richness-item ${sectionsCount === 0 ? 'aac-richness-faded' : ''}`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
              <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.6" />
            </svg>
            {sectionsCount}
          </span>
          <span className={`aac-richness-item ${imagesCount === 0 ? 'aac-richness-faded' : ''}`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.6" />
              <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
              <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="1.6" />
            </svg>
            {imagesCount}
          </span>
          <span className={`aac-richness-item ${linksCount === 0 ? 'aac-richness-faded' : ''}`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M10 13a5 5 0 007.07 0l3-3a5 5 0 00-7.07-7.07l-1 1M14 11a5 5 0 00-7.07 0l-3 3a5 5 0 007.07 7.07l1-1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            {linksCount}
          </span>
        </div>

        <div className="aac-actions" onClick={stop}>
          <LocalizedLink
            to={`/profile/article-edit/${article.id}`}
            className="aac-action aac-action-edit"
            onClick={stop}
            title={t('card.editBtn')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor" />
            </svg>
            <span>{t('card.editBtn')}</span>
          </LocalizedLink>

          <button
            type="button"
            className={`aac-action aac-action-toggle ${toggleAction === 'archived' ? 'aac-action-toggle-archive' : 'aac-action-toggle-publish'}`}
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
            <span>{toggleLabel}</span>
          </button>

          <button
            type="button"
            className="aac-action aac-action-quick"
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
            <span>{t('card.quickPreviewBtn')}</span>
          </button>

          <a
            href={localePath(`/articles/${article.slug}`, i18n.language)}
            target="_blank"
            rel="noopener noreferrer"
            className="aac-action aac-action-preview"
            onClick={stop}
            title={t('card.previewBtn')}
            aria-label={t('card.previewBtn')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>{t('card.previewBtn')}</span>
          </a>

          <button
            type="button"
            className="aac-action aac-action-delete"
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
            <span>{t('card.deleteBtn')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Memoize to avoid re-rendering every card when only selection changes for
// other rows. We do an explicit comparison on the props that actually
// affect this card.
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

const AdminArticleCard = memo(AdminArticleCardImpl, propsEqual);
export default AdminArticleCard;
