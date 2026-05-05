// UsefulLinkImagePicker — prefix `.aulip-`, namespace 'content'.
//
// Three modes for choosing the image that represents a useful link:
//   1. og     — uses the og:image returned by the backend metadata endpoint
//   2. url    — user pastes an external image URL
//   3. upload — user uploads a file to Firebase Storage
//
// `imageSource` on the parent useful-link object tracks which mode was
// last chosen so the server / view layer can reason about it later.

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { uploadFileWithProgress } from '../../../articleUtils/file-utils';
import { deleteFileFromStorage } from '../../../articleUtils/file-delete-utils';
import './usefulLinkImagePicker.css';

const MODES = {
  OG: 'og',
  URL: 'url',
  UPLOAD: 'upload',
};

const isFirebaseUrl = (url) =>
  typeof url === 'string' && url.includes('firebasestorage.googleapis.com');

// Form preview uses the ORIGINAL URL — Firebase resize variants are
// generated async and would 404 immediately after upload.
const renderPreviewSrc = (url) => url || '';

const safeDeleteFirebase = (url) => {
  if (!isFirebaseUrl(url)) return;
  deleteFileFromStorage(url).catch((err) => {
    console.warn('Failed to delete previous useful-link image from Firebase:', err);
  });
};

const UsefulLinkImagePicker = ({
  image,            // current image URL or null
  imageSource,      // 'og' | 'url' | 'upload' | 'none'
  ogImage,          // last og:image fetched (read-only fallback for OG mode)
  onChange,         // (partial) => void  — partial of { image, imageSource }
}) => {
  const { t } = useTranslation('content');
  const fileInputRef = useRef(null);

  // Pick the initial active tab. If we already have an image, prefer the
  // matching mode; otherwise default to OG (auto) since that's the cheapest.
  const initialMode = (() => {
    if (imageSource === MODES.URL) return MODES.URL;
    if (imageSource === MODES.UPLOAD) return MODES.UPLOAD;
    return MODES.OG;
  })();

  const [mode, setMode] = useState(initialMode);
  const [externalUrl, setExternalUrl] = useState(
    imageSource === MODES.URL ? (image || '') : ''
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [previewError, setPreviewError] = useState(false);

  // Reset error flag whenever the image we're previewing changes.
  useEffect(() => {
    setPreviewError(false);
  }, [image, ogImage, mode]);

  // Keep externalUrl in sync if parent updates from outside (e.g. draft restore).
  useEffect(() => {
    if (imageSource === MODES.URL && image) {
      setExternalUrl(image);
    }
  }, [imageSource, image]);

  const handleModeChange = useCallback((nextMode) => {
    setMode(nextMode);

    // If we're abandoning a Firebase upload (switching away from Upload mode
    // when the current image is a Firebase URL we own) — delete the file.
    const leavingUpload = imageSource === MODES.UPLOAD && nextMode !== MODES.UPLOAD;
    if (leavingUpload) safeDeleteFirebase(image);

    if (nextMode === MODES.OG) {
      onChange({
        image: ogImage || null,
        imageSource: ogImage ? MODES.OG : 'none',
      });
    } else if (nextMode === MODES.URL) {
      onChange({
        image: externalUrl || null,
        imageSource: externalUrl ? MODES.URL : 'none',
      });
    } else if (nextMode === MODES.UPLOAD) {
      const keepUploaded = imageSource === MODES.UPLOAD && image ? image : null;
      onChange({
        image: keepUploaded,
        imageSource: keepUploaded ? MODES.UPLOAD : 'none',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ogImage, externalUrl, imageSource, image, onChange]);

  const handleExternalUrlChange = useCallback((e) => {
    const value = e.target.value;
    setExternalUrl(value);
    onChange({
      image: value.trim() || null,
      imageSource: value.trim() ? MODES.URL : 'none',
    });
  }, [onChange]);

  const handleRemoveImage = useCallback(() => {
    // Always delete the user's own upload from Firebase if applicable.
    if (imageSource === MODES.UPLOAD) safeDeleteFirebase(image);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setExternalUrl('');
    const fromUserChoice = imageSource === MODES.URL || imageSource === MODES.UPLOAD;
    if (fromUserChoice && ogImage) {
      // Removing a URL/upload choice → fall back to the saved OG image.
      setMode(MODES.OG);
      onChange({ image: ogImage, imageSource: MODES.OG });
    } else {
      // OG mode (or no fallback) → clear image AND ogImage. The mirrored
      // OG file in Firebase is now an orphan, so delete it too.
      if (image && image !== ogImage) safeDeleteFirebase(image);
      safeDeleteFirebase(ogImage);
      onChange({ image: null, ogImage: null, imageSource: 'none' });
    }
  }, [image, imageSource, ogImage, onChange]);

  const handleUseOg = useCallback(() => {
    if (ogImage) {
      onChange({ image: ogImage, imageSource: MODES.OG });
    }
  }, [ogImage, onChange]);

  const uploadFile = useCallback(async (file) => {
    if (!file || !file.type || !file.type.startsWith('image/')) return;
    // If replacing an existing Firebase upload, remove the old file first.
    const previousFirebase = imageSource === MODES.UPLOAD ? image : null;
    setIsUploading(true);
    setUploadProgress(0);
    try {
      const safeName = file.name?.replace(/[^a-zA-Z0-9._-]/g, '_') || 'image';
      const path = `articles/useful-links/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;
      const url = await uploadFileWithProgress(file, path, (progress) => {
        setUploadProgress(progress);
      });
      if (previousFirebase && previousFirebase !== url) safeDeleteFirebase(previousFirebase);
      onChange({ image: url, imageSource: MODES.UPLOAD });
    } catch (err) {
      console.error('Useful link image upload failed:', err);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [image, imageSource, onChange]);

  const handleFileInputChange = useCallback((e) => {
    const file = e.target.files && e.target.files[0];
    if (file) uploadFile(file);
  }, [uploadFile]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) uploadFile(file);
  }, [uploadFile]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const previewUrl = image ? renderPreviewSrc(image) : '';

  return (
    <div className="aulip-wrapper">
      <div className="aulip-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={mode === MODES.OG}
          className={`aulip-tab ${mode === MODES.OG ? 'aulip-tab-active' : ''}`}
          onClick={() => handleModeChange(MODES.OG)}
        >
          {t('usefulLinks.image.modeOg')}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === MODES.URL}
          className={`aulip-tab ${mode === MODES.URL ? 'aulip-tab-active' : ''}`}
          onClick={() => handleModeChange(MODES.URL)}
        >
          {t('usefulLinks.image.modeUrl')}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === MODES.UPLOAD}
          className={`aulip-tab ${mode === MODES.UPLOAD ? 'aulip-tab-active' : ''}`}
          onClick={() => handleModeChange(MODES.UPLOAD)}
        >
          {t('usefulLinks.image.modeUpload')}
        </button>
      </div>

      <div className="aulip-body">
        {mode === MODES.OG && (
          <>
            {ogImage ? (
              <>
                <div className="aulip-preview">
                  <img src={renderPreviewSrc(ogImage)} alt="og preview" loading="lazy" />
                  <span className="aulip-badge">{t('usefulLinks.image.autoBadge')}</span>
                </div>
                <div className="aulip-preview-actions">
                  {imageSource !== MODES.OG && (
                    <button
                      type="button"
                      className="aulip-btn"
                      onClick={handleUseOg}
                    >
                      {t('usefulLinks.image.changeBtn')}
                    </button>
                  )}
                  {image && (
                    <button
                      type="button"
                      className="aulip-btn aulip-btn-danger"
                      onClick={handleRemoveImage}
                    >
                      {t('usefulLinks.image.removeBtn')}
                    </button>
                  )}
                </div>
              </>
            ) : (
              <p className="aulip-empty">{t('usefulLinks.image.uploadHint')}</p>
            )}
          </>
        )}

        {mode === MODES.URL && (
          <>
            <input
              type="text"
              className="aulip-input"
              value={externalUrl}
              onChange={handleExternalUrlChange}
              placeholder={t('usefulLinks.image.urlPlaceholder')}
            />
            {previewUrl && (
              <>
                <div className="aulip-preview">
                  {previewError ? (
                    <div className="aulip-preview-error">
                      {t('usefulLinks.image.previewError', 'Изображението не се зарежда (грешен URL, hotlink или mixed content).')}
                    </div>
                  ) : (
                    <img
                      src={previewUrl}
                      alt="url preview"
                      loading="lazy"
                      onError={() => setPreviewError(true)}
                    />
                  )}
                </div>
                <div className="aulip-preview-actions">
                  <button
                    type="button"
                    className="aulip-btn aulip-btn-danger"
                    onClick={handleRemoveImage}
                  >
                    {t('usefulLinks.image.removeBtn')}
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {mode === MODES.UPLOAD && (
          <>
            <div
              className={`aulip-dropzone ${isDragging ? 'aulip-dropzone-active' : ''}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
            >
              <p>{t('usefulLinks.image.uploadHint')}</p>
              <span className="aulip-file-label">
                {t('usefulLinks.image.modeUpload')}
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="aulip-file-input"
                onChange={handleFileInputChange}
              />
            </div>

            {isUploading && (
              <>
                <div className="aulip-progress">
                  <div
                    className="aulip-progress-bar"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <span className="aulip-progress-text">
                  {uploadProgress.toFixed(0)}%
                </span>
              </>
            )}

            {previewUrl && !isUploading && (
              <>
                <div className="aulip-preview">
                  {previewError ? (
                    <div className="aulip-preview-error">
                      {t('usefulLinks.image.previewError', 'Изображението не се зарежда (грешен URL, hotlink или mixed content).')}
                    </div>
                  ) : (
                    <img
                      src={previewUrl}
                      alt="upload preview"
                      loading="lazy"
                      onError={() => setPreviewError(true)}
                    />
                  )}
                </div>
                <div className="aulip-preview-actions">
                  <button
                    type="button"
                    className="aulip-btn aulip-btn-danger"
                    onClick={handleRemoveImage}
                  >
                    {t('usefulLinks.image.removeBtn')}
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UsefulLinkImagePicker;
