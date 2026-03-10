// src/components/AdminFactCheck/AdminFactCheckModuleModal/AdminFactCheckModuleModal.jsx

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './adminFactCheckModuleModal.css';

export const AdminFactCheckModuleModal = ({ module, initialData, onClose, onSave, onDelete }) => {
    const { t } = useTranslation('factcheck');
    const isEditMode = !!module;

    // ===================================
    // FORM STATE
    // ===================================

    const [formData, setFormData] = useState({
        verdict: module?.verdict || 'false',
        category: module?.category || '',
        claimText: module?.claimText || initialData?.claimText || '',
        verification: module?.verification || '',
        sourceUrl: module?.sourceUrl || '',
        sourceName: module?.sourceName || '',
        whySpreads: module?.whySpreads || '',
        howToReact: module?.howToReact || '',
        pdfUrl: module?.pdfUrl || '',
        status: module?.status || 'draft',
    });

    const [isSaving, setIsSaving] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});

    // ===================================
    // VERDICT COLORS
    // ===================================

    const getVerdictColor = (verdict) => {
        switch (verdict) {
            case 'true': return '#2563eb';
            case 'false': return '#dc2626';
            case 'misleading': return '#ea580c';
            case 'partially_true': return '#16a34a';
            default: return '#6b7280';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'draft': return '#6b7280';
            case 'published': return '#16a34a';
            case 'hidden': return '#ea580c';
            default: return '#6b7280';
        }
    };

    // ===================================
    // HANDLERS
    // ===================================

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (fieldErrors[field]) {
            setFieldErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        setFieldErrors({});
        try {
            await onSave(formData);
        } catch (error) {
            if (error?.details && Array.isArray(error.details)) {
                const errors = {};
                error.details.forEach((d) => { if (d.field) errors[d.field] = t(`admin.moduleModal.fieldErrors.${d.field}`, d.message); });
                setFieldErrors(errors);
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm(t('admin.moduleModal.confirmDelete'))) {
            await onDelete(module.id);
        }
    };

    // ===================================
    // RENDER
    // ===================================

    return (
        <div className="afcmm-overlay" onClick={handleBackdropClick}>
            <div className="afcmm-modal">
                {/* CLOSE BUTTON */}
                <button className="afcmm-close" onClick={onClose} aria-label="Close">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>

                {/* HEADER */}
                <div className="afcmm-header">
                    <h2 className="afcmm-title">
                        {isEditMode ? t('admin.moduleModal.editTitle') : t('admin.moduleModal.createTitle')}
                    </h2>
                </div>

                {/* CONTENT */}
                <div className="afcmm-content">
                    {/* VERDICT + STATUS ROW */}
                    <div className="afcmm-row-2col">
                        <div className="afcmm-field">
                            <label className="afcmm-label">{t('admin.moduleModal.verdict')}</label>
                            <div className="afcmm-select-wrapper">
                                <select
                                    className="afcmm-select"
                                    value={formData.verdict}
                                    onChange={(e) => handleChange('verdict', e.target.value)}
                                    style={{ borderColor: `${getVerdictColor(formData.verdict)}40` }}
                                >
                                    <option value="true">{t('verdicts.true')}</option>
                                    <option value="false">{t('verdicts.false')}</option>
                                    <option value="misleading">{t('verdicts.misleading')}</option>
                                    <option value="partially_true">{t('verdicts.partially_true')}</option>
                                </select>
                                <span
                                    className="afcmm-indicator"
                                    style={{ backgroundColor: getVerdictColor(formData.verdict) }}
                                ></span>
                            </div>
                        </div>

                        <div className="afcmm-field">
                            <label className="afcmm-label">{t('admin.moduleModal.status')}</label>
                            <div className="afcmm-select-wrapper">
                                <select
                                    className="afcmm-select"
                                    value={formData.status}
                                    onChange={(e) => handleChange('status', e.target.value)}
                                    style={{ borderColor: `${getStatusColor(formData.status)}40` }}
                                >
                                    <option value="draft">{t('admin.moduleStatuses.draft')}</option>
                                    <option value="published">{t('admin.moduleStatuses.published')}</option>
                                    <option value="hidden">{t('admin.moduleStatuses.hidden')}</option>
                                </select>
                                <span
                                    className="afcmm-indicator"
                                    style={{ backgroundColor: getStatusColor(formData.status) }}
                                ></span>
                            </div>
                        </div>
                    </div>

                    {/* CATEGORY */}
                    <div className="afcmm-field">
                        <label className="afcmm-label">{t('admin.moduleModal.category')}</label>
                        <input
                            className={`afcmm-input ${fieldErrors.category ? 'afcmm-input--error' : ''}`}
                            type="text"
                            value={formData.category}
                            onChange={(e) => handleChange('category', e.target.value)}
                            placeholder={t('admin.moduleModal.categoryPlaceholder')}
                        />
                        {fieldErrors.category && <span className="afcmm-field-error">{fieldErrors.category}</span>}
                    </div>

                    {/* CLAIM TEXT */}
                    <div className="afcmm-field">
                        <label className="afcmm-label">{t('admin.moduleModal.claimText')}</label>
                        <textarea
                            className={`afcmm-textarea ${fieldErrors.claimText ? 'afcmm-input--error' : ''}`}
                            value={formData.claimText}
                            onChange={(e) => handleChange('claimText', e.target.value)}
                            placeholder={t('admin.moduleModal.claimPlaceholder')}
                            rows="3"
                        />
                        {fieldErrors.claimText && <span className="afcmm-field-error">{fieldErrors.claimText}</span>}
                    </div>

                    {/* VERIFICATION */}
                    <div className="afcmm-field">
                        <label className="afcmm-label">{t('admin.moduleModal.verification')}</label>
                        <textarea
                            className={`afcmm-textarea ${fieldErrors.verification ? 'afcmm-input--error' : ''}`}
                            value={formData.verification}
                            onChange={(e) => handleChange('verification', e.target.value)}
                            placeholder={t('admin.moduleModal.verificationPlaceholder')}
                            rows="4"
                        />
                        {fieldErrors.verification && <span className="afcmm-field-error">{fieldErrors.verification}</span>}
                    </div>

                    {/* SOURCE URL + SOURCE NAME */}
                    <div className="afcmm-row-2col">
                        <div className="afcmm-field">
                            <label className="afcmm-label">{t('admin.moduleModal.sourceUrl')}</label>
                            <input
                                className={`afcmm-input ${fieldErrors.sourceUrl ? 'afcmm-input--error' : ''}`}
                                type="url"
                                value={formData.sourceUrl}
                                onChange={(e) => handleChange('sourceUrl', e.target.value)}
                                placeholder="https://..."
                            />
                            {fieldErrors.sourceUrl && <span className="afcmm-field-error">{fieldErrors.sourceUrl}</span>}
                        </div>

                        <div className="afcmm-field">
                            <label className="afcmm-label">{t('admin.moduleModal.sourceName')}</label>
                            <input
                                className={`afcmm-input ${fieldErrors.sourceName ? 'afcmm-input--error' : ''}`}
                                type="text"
                                value={formData.sourceName}
                                onChange={(e) => handleChange('sourceName', e.target.value)}
                                placeholder={t('admin.moduleModal.sourceNamePlaceholder')}
                            />
                            {fieldErrors.sourceName && <span className="afcmm-field-error">{fieldErrors.sourceName}</span>}
                        </div>
                    </div>

                    {/* WHY SPREADS */}
                    <div className="afcmm-field">
                        <label className="afcmm-label">{t('admin.moduleModal.whySpreads')}</label>
                        <textarea
                            className={`afcmm-textarea ${fieldErrors.whySpreads ? 'afcmm-input--error' : ''}`}
                            value={formData.whySpreads}
                            onChange={(e) => handleChange('whySpreads', e.target.value)}
                            placeholder={t('admin.moduleModal.whySpreadsPlaceholder')}
                            rows="3"
                        />
                        {fieldErrors.whySpreads && <span className="afcmm-field-error">{fieldErrors.whySpreads}</span>}
                    </div>

                    {/* HOW TO REACT */}
                    <div className="afcmm-field">
                        <label className="afcmm-label">{t('admin.moduleModal.howToReact')}</label>
                        <textarea
                            className={`afcmm-textarea ${fieldErrors.howToReact ? 'afcmm-input--error' : ''}`}
                            value={formData.howToReact}
                            onChange={(e) => handleChange('howToReact', e.target.value)}
                            placeholder={t('admin.moduleModal.howToReactPlaceholder')}
                            rows="3"
                        />
                        {fieldErrors.howToReact && <span className="afcmm-field-error">{fieldErrors.howToReact}</span>}
                    </div>

                    {/* PDF URL */}
                    <div className="afcmm-field">
                        <label className="afcmm-label">{t('admin.moduleModal.pdfUrl')}</label>
                        <input
                            className={`afcmm-input ${fieldErrors.pdfUrl ? 'afcmm-input--error' : ''}`}
                            type="url"
                            value={formData.pdfUrl}
                            onChange={(e) => handleChange('pdfUrl', e.target.value)}
                            placeholder="https://..."
                        />
                        {fieldErrors.pdfUrl && <span className="afcmm-field-error">{fieldErrors.pdfUrl}</span>}
                    </div>
                </div>

                {/* ACTIONS */}
                <div className="afcmm-actions">
                    {isEditMode && (
                        <button
                            className="afcmm-btn afcmm-btn--delete"
                            onClick={handleDelete}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                            {t('admin.moduleModal.delete')}
                        </button>
                    )}

                    <div className="afcmm-actions-right">
                        <button
                            className="afcmm-btn afcmm-btn--cancel"
                            onClick={onClose}
                        >
                            {t('admin.moduleModal.cancel')}
                        </button>

                        <button
                            className="afcmm-btn afcmm-btn--save"
                            onClick={handleSave}
                            disabled={isSaving || !formData.claimText.trim()}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                                <polyline points="17 21 17 13 7 13 7 21" />
                                <polyline points="7 3 7 8 15 8" />
                            </svg>
                            {isSaving
                                ? '...'
                                : isEditMode
                                    ? t('admin.moduleModal.save')
                                    : t('admin.moduleModal.create')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
