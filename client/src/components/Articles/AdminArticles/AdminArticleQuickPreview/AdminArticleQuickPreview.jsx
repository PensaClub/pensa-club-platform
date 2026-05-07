import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { LocalizedLink } from '../../../LocalizedLink/LocalizedLink';
import { localePath } from '../../../../utils/languageUtils';
import { getResizedUrl } from '../../../../utils/firebaseImageResize';
import { useArticleContext } from '../../../contexts/ArticleContext';
import { useAnalytics } from '../../../contexts/AnalyticsContext';
import UsefulLinksDisplay from '../../ArticleView/UsefulLinksDisplay/UsefulLinksDisplay';
import './adminArticleQuickPreview.css';

/**
 * AdminArticleQuickPreview — slide-in panel from the right that lets the
 * admin scan an article without leaving the list. Prefix `aaqp-`.
 *
 * On mobile, falls back to a full-screen modal (CSS-driven).
 *
 * Props:
 *   open      — whether the panel is visible
 *   article   — the lightweight article object the list already holds. We
 *               will only re-fetch via `getArticleById` if `sections` are
 *               missing (the paginated GET trims them to keep the payload
 *               small in some setups).
 *   onClose   — close callback (X button, Esc, overlay click)
 */
const AdminArticleQuickPreview = ({ open, article, onClose }) => {
  const { t, i18n } = useTranslation('adminArticles');
  const { getArticleById } = useArticleContext();
  const { getViewCount } = useAnalytics();

  // Local state for the (optionally) hydrated article. Starts from the prop
  // so we render instantly with whatever the list already has.
  const [hydrated, setHydrated] = useState(article || null);
  const [loading, setLoading] = useState(false);

  // Reset hydrated state when the incoming article changes.
  useEffect(() => {
    setHydrated(article || null);
  }, [article]);

  // If the list-row article is missing rich content (sections), fetch the
  // full record so the preview is meaningful.
  useEffect(() => {
    if (!open || !article?.id) return undefined;
    const needsHydrate = !Array.isArray(article.sections) || article.sections.length === 0;
    if (!needsHydrate) return undefined;
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const full = await getArticleById(article.id);
        if (!cancelled && full) setHydrated(full);
      } catch {
        // Silent — we still show whatever we have.
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, article?.id]);

  // Close on Esc.
  useEffect(() => {
    if (!open) return undefined;
    const handler = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose?.();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Body scroll lock while open.
  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // Status helpers (match card logic).
  const status = hydrated?.status || 'published';
  const isScheduled = useMemo(() => {
    if (status !== 'published' || !hydrated?.publishDate) return false;
    return new Date(hydrated.publishDate).getTime() > Date.now();
  }, [status, hydrated?.publishDate]);
  const effectiveStatus = isScheduled ? 'scheduled' : status;

  // Image source pick (same fallback chain as the card).
  const imageSrc = useMemo(() => {
    if (!hydrated?.mainImage) return '';
    if (hydrated.mainImage.type === 'video') return hydrated.mainImage.thumbnail || '';
    if (Array.isArray(hydrated.mainImage.sources) && hydrated.mainImage.sources.length > 0) {
      return hydrated.mainImage.sources[0] || '';
    }
    return '';
  }, [hydrated?.mainImage]);

  const formatDate = (dateString) => {
    if (!dateString) return t('card.noDate');
    try {
      return new Date(dateString).toLocaleDateString(i18n.language || 'bg', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const viewCount = (() => {
    try {
      const c = getViewCount?.(hydrated?.id);
      return Number.isFinite(c) ? c : 0;
    } catch {
      return 0;
    }
  })();

  if (!open || !hydrated) return null;

  const tags = Array.isArray(hydrated.tags) ? hydrated.tags : [];
  const sections = Array.isArray(hydrated.sections) ? hydrated.sections : [];
  const usefulLinks = Array.isArray(hydrated.usefulLinks) ? hydrated.usefulLinks : [];

  // Render via Portal so the fixed-positioned overlay escapes any ancestor
  // that has `contain`, `transform`, or `filter` — those break `position: fixed`
  // anchoring to the viewport.
  return createPortal((
    <div
      className="aaqp-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="aaqp-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className="aaqp-panel" onClick={(e) => e.stopPropagation()}>
        <div className="aaqp-head">
          <div className="aaqp-head-text">
            <span className="aaqp-eyebrow">{t('quickPreview.title')}</span>
            <h2 id="aaqp-title" className="aaqp-title">{hydrated.title}</h2>
          </div>
          <button
            type="button"
            className="aaqp-close"
            onClick={onClose}
            aria-label={t('quickPreview.close')}
            title={t('quickPreview.close')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="aaqp-body">
          {imageSrc && (
            <div className="aaqp-image-wrap">
              <img
                src={getResizedUrl(imageSrc, 600)}
                alt={hydrated.title || ''}
                className="aaqp-image"
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  if (e.target.src !== imageSrc) e.target.src = imageSrc;
                }}
              />
              <span className={`aaqp-status-pill aaqp-status-pill-${effectiveStatus}`}>
                {t(`card.statusBadge.${effectiveStatus}`)}
              </span>
            </div>
          )}

          <div className="aaqp-meta">
            {hydrated.author && (
              <span className="aaqp-meta-item">
                {t('quickPreview.byAuthor', { name: hydrated.author })}
              </span>
            )}
            {hydrated.publishDate && (
              <span className="aaqp-meta-item">{formatDate(hydrated.publishDate)}</span>
            )}
            <span className="aaqp-meta-item">
              {t('quickPreview.viewsLabel', { count: viewCount })}
            </span>
          </div>

          {hydrated.summary && (
            <div
              className="aaqp-summary"
              /* Summary may contain limited HTML formatting from the editor. */
              dangerouslySetInnerHTML={{ __html: hydrated.summary }}
            />
          )}

          {tags.length > 0 && (
            <div className="aaqp-section">
              <h3 className="aaqp-section-title">{t('quickPreview.tagsLabel')}</h3>
              <div className="aaqp-tags">
                {tags.map((tag, idx) => (
                  <span key={idx} className="aaqp-tag">{tag}</span>
                ))}
              </div>
            </div>
          )}

          {loading && sections.length === 0 && (
            <div className="aaqp-skeleton">
              <div className="aaqp-skeleton-line" />
              <div className="aaqp-skeleton-line aaqp-skeleton-line-short" />
              <div className="aaqp-skeleton-line" />
            </div>
          )}

          {sections.length > 0 && (
            <div className="aaqp-section">
              <h3 className="aaqp-section-title">{t('quickPreview.sectionsLabel')}</h3>
              <div className="aaqp-sections">
                {sections.map((section, idx) => (
                  <div key={section.id || idx} className="aaqp-section-block">
                    {section.title && <h4 className="aaqp-section-block-title">{section.title}</h4>}
                    {section.content && (
                      <div
                        className="aaqp-section-content"
                        dangerouslySetInnerHTML={{ __html: section.content }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {usefulLinks.length > 0 && (
            <div className="aaqp-section">
              <h3 className="aaqp-section-title">{t('quickPreview.linksLabel')}</h3>
              <UsefulLinksDisplay usefulLinks={usefulLinks} />
            </div>
          )}

          {!loading && sections.length === 0 && !hydrated.summary && (
            <p className="aaqp-empty">{t('quickPreview.noContent')}</p>
          )}
        </div>

        <div className="aaqp-foot">
          <LocalizedLink
            to={`/profile/article-edit/${hydrated.id}`}
            className="aaqp-btn aaqp-btn-primary"
            onClick={onClose}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor" />
            </svg>
            <span>{t('quickPreview.edit')}</span>
          </LocalizedLink>
          {hydrated.slug && (
            <a
              href={localePath(`/articles/${hydrated.slug}`, i18n.language)}
              target="_blank"
              rel="noopener noreferrer"
              className="aaqp-btn aaqp-btn-secondary"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>{t('quickPreview.openExternal')}</span>
            </a>
          )}
        </div>
      </div>
    </div>
  ), document.body);
};

export default AdminArticleQuickPreview;
