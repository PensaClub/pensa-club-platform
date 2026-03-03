import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { LocalizedLink as Link } from '../LocalizedLink/LocalizedLink';
import useUsefulLinksForm from '../hooks/useUsefulLinksForm';
import { Loader } from '../Loader/Loader';
import './usefulLinksCreateForm.css';

const DEFAULT_CATEGORIES = [
  'general', 'health', 'finance', 'government', 'education',
  'entertainment', 'technology', 'social', 'transport', 'communication',
];

const UsefulLinksCreateForm = () => {
  const { t } = useTranslation('useful-links');
  const {
    isEditMode,
    formData,
    isLoading,
    isSaving,
    isUploading,
    errors,
    imagePreview,
    updateField,
    handleSubmit,
    handleImageSelect,
    handleRemoveImage,
    resetForm,
  } = useUsefulLinksForm();

  const fileInputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const isCustomCategory = formData.category && !DEFAULT_CATEGORIES.includes(formData.category);
  const [showCustomInput, setShowCustomInput] = useState(isCustomCategory);
  const [customCategory, setCustomCategory] = useState(isCustomCategory ? formData.category : '');

  const handleCategoryChange = (value) => {
    if (value === '__other__') {
      setShowCustomInput(true);
      setCustomCategory('');
      updateField('category', '');
    } else {
      setShowCustomInput(false);
      setCustomCategory('');
      updateField('category', value);
    }
  };

  const handleCustomCategoryChange = (value) => {
    setCustomCategory(value);
    const slug = value
      .toLowerCase()
      .trim()
      .replace(/[^a-zа-яёії0-9\s-]/gi, '')
      .replace(/[\s-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    updateField('category', slug || '');
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) handleImageSelect(file);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImageSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  if (isLoading) return <Loader />;

  return (
    <div className="ulcf-page">
      <div className="ulcf-container">
        <div className="ulcf-header">
          <Link to="/admin/useful-links" className="ulcf-back-link">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
            {t('admin.actions.back')}
          </Link>
          <h1 className="ulcf-title">
            {isEditMode ? t('admin.editTitle') : t('admin.createTitle')}
          </h1>
        </div>

        <form className="ulcf-form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          {/* Title fields */}
          <div className="ulcf-section">
            <h2 className="ulcf-section-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              {t('admin.fields.title')}
            </h2>
            <div className="ulcf-field-group">
              <div className="ulcf-field">
                <label className="ulcf-label">{t('admin.fields.title')} *</label>
                <input
                  type="text"
                  className={`ulcf-input ${errors.title ? 'ulcf-input-error' : ''}`}
                  value={formData.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="Заглавие на български"
                />
                {errors.title && <span className="ulcf-error">{errors.title}</span>}
              </div>
              <div className="ulcf-field">
                <label className="ulcf-label">{t('admin.fields.titleEn')}</label>
                <input
                  type="text"
                  className="ulcf-input"
                  value={formData.titleEn}
                  onChange={(e) => updateField('titleEn', e.target.value)}
                  placeholder="Title in English"
                />
              </div>
              <div className="ulcf-field">
                <label className="ulcf-label">{t('admin.fields.titleDe')}</label>
                <input
                  type="text"
                  className="ulcf-input"
                  value={formData.titleDe}
                  onChange={(e) => updateField('titleDe', e.target.value)}
                  placeholder="Titel auf Deutsch"
                />
              </div>
            </div>
          </div>

          {/* Description fields */}
          <div className="ulcf-section">
            <h2 className="ulcf-section-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="17" y1="10" x2="3" y2="10" />
                <line x1="21" y1="6" x2="3" y2="6" />
                <line x1="21" y1="14" x2="3" y2="14" />
                <line x1="17" y1="18" x2="3" y2="18" />
              </svg>
              {t('admin.fields.description')}
            </h2>
            <div className="ulcf-field-group">
              <div className="ulcf-field">
                <label className="ulcf-label">{t('admin.fields.description')}</label>
                <textarea
                  className="ulcf-textarea"
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Описание на български"
                  rows="3"
                />
              </div>
              <div className="ulcf-field">
                <label className="ulcf-label">{t('admin.fields.descriptionEn')}</label>
                <textarea
                  className="ulcf-textarea"
                  value={formData.descriptionEn}
                  onChange={(e) => updateField('descriptionEn', e.target.value)}
                  placeholder="Description in English"
                  rows="3"
                />
              </div>
              <div className="ulcf-field">
                <label className="ulcf-label">{t('admin.fields.descriptionDe')}</label>
                <textarea
                  className="ulcf-textarea"
                  value={formData.descriptionDe}
                  onChange={(e) => updateField('descriptionDe', e.target.value)}
                  placeholder="Beschreibung auf Deutsch"
                  rows="3"
                />
              </div>
            </div>
          </div>

          {/* URL */}
          <div className="ulcf-section">
            <h2 className="ulcf-section-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              URL
            </h2>
            <div className="ulcf-field">
              <label className="ulcf-label">{t('admin.fields.url')} *</label>
              <input
                type="url"
                className={`ulcf-input ${errors.url ? 'ulcf-input-error' : ''}`}
                value={formData.url}
                onChange={(e) => updateField('url', e.target.value)}
                placeholder="https://example.com"
              />
              {errors.url && <span className="ulcf-error">{errors.url}</span>}
            </div>
          </div>

          {/* Image Upload */}
          <div className="ulcf-section">
            <h2 className="ulcf-section-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              {t('admin.fields.image', { defaultValue: 'Снимка' })}
            </h2>

            {imagePreview ? (
              <div className="ulcf-image-preview-container">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="ulcf-image-preview"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <button
                  type="button"
                  className="ulcf-image-remove-btn"
                  onClick={handleRemoveImage}
                  title={t('admin.actions.removeImage', { defaultValue: 'Премахни снимката' })}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="ulcf-image-change-btn"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {t('admin.actions.changeImage', { defaultValue: 'Смени снимката' })}
                </button>
              </div>
            ) : (
              <div
                className={`ulcf-dropzone ${isDragOver ? 'ulcf-dropzone-active' : ''}`}
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <p className="ulcf-dropzone-text">
                  {t('admin.fields.dropzoneText', { defaultValue: 'Плъзнете снимка тук или кликнете за избор' })}
                </p>
                <span className="ulcf-dropzone-hint">
                  JPG, PNG, WebP — {t('admin.fields.maxSize', { defaultValue: 'макс. 10MB' })}
                </span>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileInputChange}
              style={{ display: 'none' }}
            />
          </div>

          {/* Settings */}
          <div className="ulcf-section">
            <h2 className="ulcf-section-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
              {t('admin.fields.category')}
            </h2>
            <div className="ulcf-field-row">
              <div className="ulcf-field">
                <label className="ulcf-label">{t('admin.fields.category')}</label>
                <select
                  className="ulcf-select"
                  value={showCustomInput ? '__other__' : formData.category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                >
                  {DEFAULT_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{t(`categories.${cat}`)}</option>
                  ))}
                  <option value="__other__">{t('categories.other')}</option>
                </select>
                {showCustomInput && (
                  <input
                    type="text"
                    className={`ulcf-input ulcf-custom-category-input ${errors.category ? 'ulcf-input-error' : ''}`}
                    value={customCategory}
                    onChange={(e) => handleCustomCategoryChange(e.target.value)}
                    placeholder={t('admin.fields.customCategoryPlaceholder')}
                    autoFocus
                  />
                )}
                {errors.category && <span className="ulcf-error">{errors.category}</span>}
              </div>
              <div className="ulcf-field">
                <label className="ulcf-label">{t('admin.fields.displayOrder')}</label>
                <input
                  type="number"
                  className="ulcf-input"
                  value={formData.displayOrder}
                  onChange={(e) => updateField('displayOrder', parseInt(e.target.value) || 0)}
                  min="0"
                />
              </div>
              <div className="ulcf-field">
                <label className="ulcf-label">{t('admin.fields.isActive')}</label>
                <label className="ulcf-toggle">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => updateField('isActive', e.target.checked)}
                  />
                  <span className="ulcf-toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="ulcf-actions">
            <button
              type="button"
              className="ulcf-btn ulcf-btn-secondary"
              onClick={resetForm}
            >
              {t('admin.actions.cancel')}
            </button>
            <button
              type="submit"
              className="ulcf-btn ulcf-btn-primary"
              disabled={isSaving || isUploading}
            >
              {(isSaving || isUploading)
                ? (isUploading
                  ? t('admin.actions.uploading', { defaultValue: 'Качване...' })
                  : '...')
                : isEditMode
                  ? t('admin.actions.save')
                  : t('admin.actions.create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UsefulLinksCreateForm;
