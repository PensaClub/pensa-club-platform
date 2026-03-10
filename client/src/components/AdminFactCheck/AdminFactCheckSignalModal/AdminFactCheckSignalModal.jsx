// src/components/AdminFactCheck/AdminFactCheckSignalModal/AdminFactCheckSignalModal.jsx

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Ban, LockOpen, Check, X } from 'lucide-react';
import { useAuthContext } from '../../contexts/UserContext';
import { useIpManagement } from '../../contexts/IpManagementContext';
import './adminFactCheckSignalModal.css';

export const AdminFactCheckSignalModal = ({ signal, modules, onClose, onSave, onDelete, onCreateResponse, onSendEmail }) => {
    const { t } = useTranslation('factcheck');
    const { isAdmin } = useAuthContext();
    const { blockIp, unblockIp, isBlocked, blockedIps } = useIpManagement();

    const [status, setStatus] = useState(signal.status || 'new');
    const [adminNotes, setAdminNotes] = useState(signal.adminNotes || '');
    const [relatedModuleId, setRelatedModuleId] = useState(signal.relatedModuleId || '');
    const [isSaving, setIsSaving] = useState(false);
    const [showTechInfo, setShowTechInfo] = useState(false);
    const [ipActionLoading, setIpActionLoading] = useState(false);
    const [ipAction, setIpAction] = useState(null); // 'block' | 'unblock' | null
    const [ipActionPassword, setIpActionPassword] = useState('');

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

    const resetIpAction = () => {
        setIpAction(null);
        setIpActionPassword('');
    };

    const handleIpActionConfirm = async () => {
        if (!signal.ipAddress || !ipActionPassword.trim()) return;
        setIpActionLoading(true);
        if (ipAction === 'block') {
            const result = await blockIp(signal.ipAddress, t('admin.signalModal.blockedFromSignal'), ipActionPassword);
            if (result.success) resetIpAction();
        } else if (ipAction === 'unblock') {
            const entry = blockedIps.find((b) => b.ipAddress === signal.ipAddress);
            if (entry) {
                const result = await unblockIp(entry.id, ipActionPassword);
                if (result) resetIpAction();
            }
        }
        setIpActionLoading(false);
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
                    <div className="afcsm-title-row">
                        <h2 className="afcsm-title">{t('admin.signalModal.title')}</h2>
                        <button
                            className={`afcsm-tech-toggle ${showTechInfo ? 'afcsm-tech-toggle--active' : ''}`}
                            onClick={() => setShowTechInfo(!showTechInfo)}
                            title={t('admin.signalModal.technicalInfo')}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="16" x2="12" y2="12" />
                                <line x1="12" y1="8" x2="12.01" y2="8" />
                            </svg>
                        </button>
                    </div>
                    <span className="afcsm-date">{formatDate(signal.createdAt)}</span>

                    {/* TECHNICAL INFO PANEL */}
                    {showTechInfo && (
                        <div className="afcsm-tech-panel">
                            <div className="afcsm-tech-row">
                                <span className="afcsm-tech-label">{t('admin.signalModal.ipAddress')}:</span>
                                <span className="afcsm-tech-value">{signal.ipAddress || t('admin.signalModal.noData')}</span>
                                {signal.ipAddress && isBlocked(signal.ipAddress) && (
                                    <span className="afcsm-ip-blocked-badge">{t('admin.signalModal.blocked')}</span>
                                )}
                                {signal.ipAddress && isAdmin && !ipAction && (
                                    isBlocked(signal.ipAddress) ? (
                                        <button
                                            className="afcsm-ip-btn afcsm-ip-btn--unblock"
                                            onClick={() => setIpAction('unblock')}
                                            title={t('admin.signalModal.unblockIp')}
                                        >
                                            <LockOpen size={14} />
                                        </button>
                                    ) : (
                                        <button
                                            className="afcsm-ip-btn afcsm-ip-btn--block"
                                            onClick={() => setIpAction('block')}
                                            title={t('admin.signalModal.blockIp')}
                                        >
                                            <Ban size={14} />
                                        </button>
                                    )
                                )}
                            </div>
                            {ipAction && (
                                <div className="afcsm-ip-action-form">
                                    <input
                                        type="password"
                                        className="afcsm-ip-password-input"
                                        placeholder={t('admin.signalModal.passwordPlaceholder')}
                                        value={ipActionPassword}
                                        onChange={(e) => setIpActionPassword(e.target.value)}
                                        autoComplete="off"
                                    />
                                    <button
                                        className="afcsm-ip-btn afcsm-ip-btn--confirm"
                                        onClick={handleIpActionConfirm}
                                        disabled={!ipActionPassword.trim() || ipActionLoading}
                                        title={t('admin.signalModal.confirm')}
                                    >
                                        <Check size={14} />
                                    </button>
                                    <button
                                        className="afcsm-ip-btn afcsm-ip-btn--cancel"
                                        onClick={resetIpAction}
                                        title={t('admin.signalModal.cancel')}
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            )}
                            <div className="afcsm-tech-row">
                                <span className="afcsm-tech-label">{t('admin.signalModal.userAgent')}:</span>
                                <span className="afcsm-tech-value afcsm-tech-value--ua">{signal.userAgent || t('admin.signalModal.noData')}</span>
                            </div>
                        </div>
                    )}
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

                    {/* REPORTER NOTES */}
                    {signal.notes && (
                        <div className="afcsm-section">
                            <label className="afcsm-label">{t('admin.signalModal.reporterNotes')}</label>
                            <div className="afcsm-reporter-notes">{signal.notes}</div>
                        </div>
                    )}

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

                    {signal.reporterEmail && (
                        <button
                            className="afcsm-btn afcsm-btn--email"
                            onClick={() => onSendEmail(signal)}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                <polyline points="22,6 12,13 2,6" />
                            </svg>
                            {t('admin.signalModal.sendEmail')}
                        </button>
                    )}

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
