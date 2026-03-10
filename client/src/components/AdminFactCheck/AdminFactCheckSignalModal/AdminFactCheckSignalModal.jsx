// src/components/AdminFactCheck/AdminFactCheckSignalModal/AdminFactCheckSignalModal.jsx

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './adminFactCheckSignalModal.css';

export const AdminFactCheckSignalModal = ({ signal, modules, onClose, onSave, onDelete, onCreateResponse }) => {
    const { t } = useTranslation('factcheck');

    const [status, setStatus] = useState(signal.status || 'new');
    const [adminNotes, setAdminNotes] = useState(signal.adminNotes || '');
    const [relatedModuleId, setRelatedModuleId] = useState(signal.relatedModuleId || '');
    const [isSaving, setIsSaving] = useState(false);

    // ===================================
    // FORMAT DATE
    // ===================================

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('bg-BG', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // ===================================
    // STATUS COLOR
    // ===================================

    const getStatusColor = (s) => {
        switch (s) {
            case 'new': return '#3b82f6';
            case 'in_review': return '#ea580c';
            case 'resolved': return '#16a34a';
            case 'dismissed': return '#6b7280';
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

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSave(signal.id, {
                status,
                adminNotes,
                relatedModuleId: relatedModuleId || null,
            });
        } catch (error) {
            console.error('Error saving signal:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm(t('admin.signalModal.confirmDelete'))) {
            await onDelete(signal.id);
        }
    };

    // ===================================
    // RENDER
    // ===================================

    return (
        <div className="afcsm-overlay" onClick={handleBackdropClick}>
            <div className="afcsm-modal">
                {/* CLOSE BUTTON */}
                <button className="afcsm-close" onClick={onClose} aria-label="Close">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>

                {/* HEADER */}
                <div className="afcsm-header">
                    <h2 className="afcsm-title">{t('admin.signalModal.title')}</h2>
                    <span className="afcsm-date">{formatDate(signal.createdAt)}</span>
                </div>

                {/* CONTENT */}
                <div className="afcsm-content">
                    {/* CLAIM TEXT */}
                    <div className="afcsm-section">
                        <label className="afcsm-label">{t('admin.signalModal.claim')}</label>
                        <div className="afcsm-claim-text">{signal.claimText}</div>
                    </div>

                    {/* INFO GRID */}
                    <div className="afcsm-info-grid">
                        <div className="afcsm-info-item">
                            <label className="afcsm-label">{t('admin.signalModal.source')}</label>
                            <span className="afcsm-info-value">
                                {t(`sourceTypes.${signal.sourceType}`, signal.sourceType)}
                            </span>
                        </div>

                        <div className="afcsm-info-item">
                            <label className="afcsm-label">{t('admin.signalModal.city')}</label>
                            <span className="afcsm-info-value">{signal.city || '-'}</span>
                        </div>

                        <div className="afcsm-info-item">
                            <label className="afcsm-label">{t('admin.signalModal.email')}</label>
                            <span className="afcsm-info-value">{signal.reporterEmail || '-'}</span>
                        </div>

                        <div className="afcsm-info-item">
                            <label className="afcsm-label">{t('admin.signalModal.confidential')}</label>
                            <span className={`afcsm-info-value ${signal.confidential ? 'afcsm-info-value--warn' : ''}`}>
                                {signal.confidential ? t('admin.signalModal.yes') : t('admin.signalModal.no')}
                            </span>
                        </div>
                    </div>

                    {/* EDITABLE FIELDS */}
                    <div className="afcsm-divider"></div>

                    {/* STATUS */}
                    <div className="afcsm-field">
                        <label className="afcsm-label">{t('admin.signalModal.status')}</label>
                        <div className="afcsm-select-wrapper">
                            <select
                                className="afcsm-select"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                style={{ borderColor: `${getStatusColor(status)}40` }}
                            >
                                <option value="new">{t('admin.signalStatuses.new')}</option>
                                <option value="in_review">{t('admin.signalStatuses.in_review')}</option>
                                <option value="resolved">{t('admin.signalStatuses.resolved')}</option>
                                <option value="dismissed">{t('admin.signalStatuses.dismissed')}</option>
                            </select>
                            <span
                                className="afcsm-status-indicator"
                                style={{ backgroundColor: getStatusColor(status) }}
                            ></span>
                        </div>
                    </div>

                    {/* ADMIN NOTES */}
                    <div className="afcsm-field">
                        <label className="afcsm-label">{t('admin.signalModal.adminNotes')}</label>
                        <textarea
                            className="afcsm-textarea"
                            value={adminNotes}
                            onChange={(e) => setAdminNotes(e.target.value)}
                            placeholder={t('admin.signalModal.adminNotesPlaceholder')}
                            rows="4"
                        />
                    </div>

                    {/* RELATED MODULE */}
                    <div className="afcsm-field">
                        <label className="afcsm-label">{t('admin.signalModal.relatedModule')}</label>
                        <select
                            className="afcsm-select"
                            value={relatedModuleId}
                            onChange={(e) => setRelatedModuleId(e.target.value)}
                        >
                            <option value="">{t('admin.signalModal.none')}</option>
                            {modules && modules.map((m) => (
                                <option key={m.id} value={m.id}>
                                    {m.claimText ? m.claimText.substring(0, 60) : `Module #${m.id}`}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* ACTIONS */}
                <div className="afcsm-actions">
                    <button
                        className="afcsm-btn afcsm-btn--delete"
                        onClick={handleDelete}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                        {t('admin.signalModal.delete')}
                    </button>

                    <button
                        className="afcsm-btn afcsm-btn--create-response"
                        onClick={() => onCreateResponse(signal)}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="12" y1="18" x2="12" y2="12" />
                            <line x1="9" y1="15" x2="15" y2="15" />
                        </svg>
                        {t('admin.signalModal.createResponse')}
                    </button>

                    <button
                        className="afcsm-btn afcsm-btn--save"
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                            <polyline points="17 21 17 13 7 13 7 21" />
                            <polyline points="7 3 7 8 15 8" />
                        </svg>
                        {isSaving ? '...' : t('admin.signalModal.save')}
                    </button>
                </div>
            </div>
        </div>
    );
};
