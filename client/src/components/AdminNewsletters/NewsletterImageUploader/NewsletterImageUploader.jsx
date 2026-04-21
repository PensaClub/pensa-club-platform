// src/components/AdminNewsletters/NewsletterImageUploader/NewsletterImageUploader.jsx
// Prefix: aniu-

import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, X, ImagePlus, Loader2 } from 'lucide-react';
import {
  uploadFileWithProgress,
  compressImage,
  allowedImageTypes,
} from '../../Articles/articleUtils/file-utils';
import { deleteFileFromStorage } from '../../Articles/articleUtils/file-delete-utils';
import { notify } from '../../../utils/notify.jsx';
import './newsletterImageUploader.css';

const DEFAULT_PATH = 'newsletters/blocks';

export const NewsletterImageUploader = ({
  value = [],
  onChange,
  max = 5,
  storagePath = DEFAULT_PATH,
}) => {
  const { t } = useTranslation('adminNewsletters');
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState({}); // {tempId: 0..100}

  const images = Array.isArray(value) ? value : [];
  const slotsLeft = Math.max(0, max - images.length);

  const handlePick = () => {
    if (slotsLeft <= 0 || fileRef.current === null) return;
    fileRef.current.click();
  };

  const handleFiles = async (event) => {
    const files = Array.from(event.target.files || []);
    if (fileRef.current) fileRef.current.value = '';
    if (files.length === 0) return;

    const valid = files
      .filter((f) => allowedImageTypes.includes(f.type))
      .slice(0, slotsLeft);

    if (valid.length < files.length) {
      notify('error', null, t('imageUploader.invalidType'));
    }
    if (valid.length === 0) return;

    const uploadOne = async (file) => {
      const tempId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      setUploading((u) => ({ ...u, [tempId]: 0 }));
      try {
        const compressed = await compressImage(file);
        const url = await uploadFileWithProgress(compressed, storagePath, (p) =>
          setUploading((u) => ({ ...u, [tempId]: p })),
        );
        return url;
      } catch (e) {
        notify('error', null, t('imageUploader.uploadError'));
        return null;
      } finally {
        setUploading((u) => {
          const copy = { ...u };
          delete copy[tempId];
          return copy;
        });
      }
    };

    const results = await Promise.all(valid.map(uploadOne));
    const urls = results.filter(Boolean);
    if (urls.length > 0) onChange?.([...images, ...urls]);
  };

  const removeImage = async (idx) => {
    const url = images[idx];
    const next = images.filter((_, i) => i !== idx);
    onChange?.(next);
    // Delete from storage in background — non-blocking
    if (url) deleteFileFromStorage(url);
  };

  const isUploading = Object.keys(uploading).length > 0;

  return (
    <div className="aniu-root">
      <input
        ref={fileRef}
        type="file"
        accept={allowedImageTypes.join(',')}
        multiple
        className="aniu-file-input"
        onChange={handleFiles}
      />

      <div className="aniu-grid">
        {images.map((url, idx) => (
          <div key={url} className="aniu-thumb">
            <img src={url} alt="" />
            <button
              type="button"
              className="aniu-thumb-remove"
              onClick={() => removeImage(idx)}
              aria-label={t('imageUploader.remove')}
              title={t('imageUploader.remove')}
            >
              <span className="aniu-icon">
                <X />
              </span>
            </button>
          </div>
        ))}

        {Object.entries(uploading).map(([id, progress]) => (
          <div key={id} className="aniu-thumb aniu-thumb--uploading">
            <span className="aniu-uploading-icon">
              <Loader2 />
            </span>
            <span className="aniu-progress">{Math.round(progress)}%</span>
          </div>
        ))}

        {slotsLeft > 0 && (
          <button
            type="button"
            className="aniu-add"
            onClick={handlePick}
            disabled={isUploading}
            aria-label={t('imageUploader.add')}
          >
            <span className="aniu-add-icon">
              <ImagePlus />
            </span>
            <span className="aniu-add-label">
              {t('imageUploader.addLabel', { left: slotsLeft })}
            </span>
          </button>
        )}
      </div>

      <p className="aniu-hint">
        {t('imageUploader.hint', { used: images.length, max })}
      </p>
    </div>
  );
};
