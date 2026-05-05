// UsefulLinkRow — prefix `.aulr-`, namespace 'content'.
//
// Renders a single useful-link in edit mode. URL change with debounce
// (500ms) triggers a metadata fetch through the article context. Returned
// metadata fills label/description/image only when the user hasn't
// manually overridden those fields (we track that via per-field "dirty"
// flags inside the row's local state).

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp, faArrowDown, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { useArticleContext } from '../../../../contexts/ArticleContext';
import UsefulLinkImagePicker from '../UsefulLinkImagePicker/UsefulLinkImagePicker';
import './usefulLinkRow.css';

const URL_FETCH_DEBOUNCE_MS = 500;

// Cheap URL validity check — full validation happens server-side; we just
// avoid hitting the metadata endpoint for obviously broken inputs.
const looksLikeUrl = (value) => {
  if (!value || typeof value !== 'string') return false;
  const v = value.trim();
  if (!v) return false;
  try {
    // Allow bare hostnames by prepending https:// for the check.
    const candidate = /^https?:\/\//i.test(v) ? v : `https://${v}`;
    const u = new URL(candidate);
    return !!u.hostname && u.hostname.includes('.');
  } catch {
    return false;
  }
};

const UsefulLinkRow = ({
  link,
  index,
  total,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
}) => {
  const { t } = useTranslation('content');
  const { getUrlMetadata } = useArticleContext() || {};

  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [urlError, setUrlError] = useState(false);

  const debounceTimerRef = useRef(null);
  const lastFetchedUrlRef = useRef(null);
  const inFlightRef = useRef(null);
  // Snapshot the link at fetch dispatch time so the async callback can
  // check what was empty AT THAT MOMENT — not what the (possibly stale)
  // closure captured. This is what lets "clear field → change URL → refetch"
  // populate the cleared field correctly.
  const linkAtFetchRef = useRef(link);
  linkAtFetchRef.current = link;

  const triggerMetadataFetch = useCallback(async (rawUrl) => {
    const trimmed = (rawUrl || '').trim();
    if (!trimmed) return;
    if (!looksLikeUrl(trimmed)) {
      setUrlError(true);
      return;
    }
    setUrlError(false);

    if (lastFetchedUrlRef.current === trimmed) return;
    if (typeof getUrlMetadata !== 'function') return;

    lastFetchedUrlRef.current = trimmed;
    inFlightRef.current = trimmed;
    setIsFetching(true);
    setFetchError(false);

    try {
      const result = await getUrlMetadata(trimmed);
      // Stale-response guard — drop the result if the user has typed
      // a different URL while we were waiting.
      if (inFlightRef.current !== trimmed) return;

      if (result && result.success) {
        const current = linkAtFetchRef.current;
        const partial = { fetchedAt: new Date().toISOString() };

        // If we're about to overwrite a Firebase-mirrored OG image with a
        // different one (URL changed → new mirror), schedule deletion of the
        // old mirror so we don't accumulate orphans in Storage.
        const isFirebase = (u) => typeof u === 'string' && u.includes('firebasestorage.googleapis.com');
        if (
          result.image &&
          isFirebase(current.ogImage) &&
          current.ogImage !== result.image
        ) {
          import('../../../articleUtils/file-delete-utils')
            .then(({ deleteFileFromStorage }) => deleteFileFromStorage(current.ogImage))
            .catch((err) => console.warn('Failed to delete previous OG mirror:', err));
        }

        // Always persist the og:image on the link itself — needed for the
        // "Премахни" → fallback-to-OG flow across reloads.
        if (result.image) partial.ogImage = result.image;
        // Label/description: only fill when EMPTY. Lets the user clear a
        // field and change URL to get fresh metadata, while preserving any
        // value the user has manually typed.
        if (!current.label && result.title) {
          partial.label = result.title;
        }
        if (!current.description && result.description) {
          partial.description = result.description;
        }
        // Image: refresh on new URL when the user hasn't picked their own.
        // Preserve URL/upload choices (imageSource is the source-of-truth).
        if (result.image && (!current.image || current.imageSource === 'og' || current.imageSource === 'none')) {
          partial.image = result.image;
          partial.imageSource = 'og';
        }
        if (Object.keys(partial).length > 1) {
          onUpdate(partial);
        }
        setFetchError(false);
      } else {
        setFetchError(true);
      }
    } catch (e) {
      if (inFlightRef.current === trimmed) setFetchError(true);
    } finally {
      if (inFlightRef.current === trimmed) {
        setIsFetching(false);
        inFlightRef.current = null;
      }
    }
  }, [getUrlMetadata, onUpdate]);

  const handleUrlChange = useCallback((e) => {
    const value = e.target.value;
    onUpdate({ url: value });
    setUrlError(false);
    setFetchError(false);

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    if (!value.trim()) {
      // Clearing the URL invalidates the dedupe guard so re-pasting the same
      // URL afterwards triggers a fresh fetch instead of being skipped.
      lastFetchedUrlRef.current = null;
      return;
    }
    debounceTimerRef.current = setTimeout(() => {
      triggerMetadataFetch(value);
    }, URL_FETCH_DEBOUNCE_MS);
  }, [onUpdate, triggerMetadataFetch]);

  const handleUrlBlur = useCallback((e) => {
    // On blur, fire immediately if the debounce hasn't run yet.
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    triggerMetadataFetch(e.target.value);
  }, [triggerMetadataFetch]);

  const handleLabelChange = useCallback((e) => {
    onUpdate({ label: e.target.value });
  }, [onUpdate]);

  const handleDescriptionChange = useCallback((e) => {
    onUpdate({ description: e.target.value });
  }, [onUpdate]);

  const handleImagePickerChange = useCallback((partial) => {
    onUpdate(partial);
  }, [onUpdate]);

  // Cleanup pending debounce on unmount.
  useEffect(() => () => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
  }, []);

  // If the row mounts in edit mode without a persisted ogImage but the
  // current image is OG, copy it across so removing the manual image later
  // can fall back to it. (Backfill for older rows that were saved before
  // the ogImage field existed.)
  useEffect(() => {
    if (!link.ogImage && link.imageSource === 'og' && link.image) {
      onUpdate({ ogImage: link.image });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isFirst = index === 0;
  const isLast = index === total - 1;
  const indexLabel = useMemo(() => `#${index + 1}`, [index]);

  return (
    <div className="aulr-row">
      <div className="aulr-header">
        <span className="aulr-index">{indexLabel}</span>
        <div className="aulr-actions">
          <button
            type="button"
            className="aulr-icon-btn"
            onClick={onMoveUp}
            disabled={isFirst}
            title={t('usefulLinks.moveUp')}
            aria-label={t('usefulLinks.moveUp')}
          >
            <FontAwesomeIcon icon={faArrowUp} />
          </button>
          <button
            type="button"
            className="aulr-icon-btn"
            onClick={onMoveDown}
            disabled={isLast}
            title={t('usefulLinks.moveDown')}
            aria-label={t('usefulLinks.moveDown')}
          >
            <FontAwesomeIcon icon={faArrowDown} />
          </button>
          <button
            type="button"
            className="aulr-icon-btn aulr-remove"
            onClick={onRemove}
            title={t('usefulLinks.removeBtn')}
            aria-label={t('usefulLinks.removeBtn')}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
      </div>

      <div className="aulr-field">
        <label htmlFor={`aulr-url-${index}`}>{t('usefulLinks.urlLabel')}</label>
        <input
          id={`aulr-url-${index}`}
          type="text"
          className="aulr-input-large"
          value={link.url || ''}
          onChange={handleUrlChange}
          onBlur={handleUrlBlur}
          placeholder={t('usefulLinks.urlPlaceholder')}
        />
        {urlError && (
          <div className="aulr-error-msg">{t('usefulLinks.invalidUrl')}</div>
        )}
        {isFetching && (
          <div className="aulr-fetch-status">
            <span className="aulr-spinner" />
            <span>{t('usefulLinks.fetching')}</span>
          </div>
        )}
        {!isFetching && fetchError && (
          <div className="aulr-fetch-status aulr-error">
            <span>{t('usefulLinks.fetchFailed')}</span>
          </div>
        )}
      </div>

      <div className="aulr-field">
        <label htmlFor={`aulr-label-${index}`}>{t('usefulLinks.labelLabel')}</label>
        <input
          id={`aulr-label-${index}`}
          type="text"
          value={link.label || ''}
          onChange={handleLabelChange}
        />
      </div>

      <div className="aulr-field">
        <label htmlFor={`aulr-desc-${index}`}>{t('usefulLinks.descriptionLabel')}</label>
        <textarea
          id={`aulr-desc-${index}`}
          value={link.description || ''}
          onChange={handleDescriptionChange}
        />
      </div>

      <div className="aulr-field">
        <UsefulLinkImagePicker
          image={link.image || null}
          imageSource={link.imageSource || 'none'}
          ogImage={link.ogImage || null}
          onChange={handleImagePickerChange}
        />
      </div>
    </div>
  );
};

export default UsefulLinkRow;
