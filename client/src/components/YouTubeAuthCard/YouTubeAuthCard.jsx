// src/components/YouTubeAuthCard/YouTubeAuthCard.jsx
// Prefix: yac-

import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, AlertTriangle, XCircle, Link as LinkIcon, Unlink, RefreshCw, Youtube, Info, ChevronDown, Trash2, Wrench } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAcademyCourses } from '../contexts/AcademyCoursesProvider';
import './youTubeAuthCard.css';

const STATUS = {
    CONNECTED: 'connected',
    EXPIRING: 'expiring',
    DISCONNECTED: 'disconnected',
    LOADING: 'loading',
};

const EXPIRY_WARN_HOURS = 24;

const formatDate = (iso, locale) => {
    if (!iso) return null;
    try {
        const localeMap = { bg: 'bg-BG', en: 'en-GB', de: 'de-DE' };
        return new Date(iso).toLocaleString(localeMap[locale] || 'bg-BG', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    } catch {
        return null;
    }
};

const YouTubeAuthCard = ({ variant = 'card' }) => {
    const { t, i18n } = useTranslation('youTubeAuthCard');
    const { getYouTubeStatus, disconnectYouTube, deleteFromYouTube } = useAcademyCourses();

    const [status, setStatus] = useState(STATUS.LOADING);
    const [statusData, setStatusData] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [helpOpen, setHelpOpen] = useState(false);
    const [orphanOpen, setOrphanOpen] = useState(false);
    const [orphanInput, setOrphanInput] = useState('');
    const [orphanLoading, setOrphanLoading] = useState(false);

    const extractYouTubeId = (input) => {
        if (!input) return null;
        const trimmed = input.trim();
        // If 11-char ID, accept directly
        if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
        const match = trimmed.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
        return match ? match[1] : null;
    };

    const handleOrphanDelete = async () => {
        const id = extractYouTubeId(orphanInput);
        if (!id) {
            toast.error(t('orphan.invalidInput'));
            return;
        }
        if (!window.confirm(t('orphan.confirm', { id }))) return;
        setOrphanLoading(true);
        try {
            const result = await deleteFromYouTube(id);
            if (result?.success) {
                toast.success(t('orphan.deleted'));
                setOrphanInput('');
            } else if (result?.code === 'NOT_FOUND') {
                toast.info(t('orphan.notFound'));
                setOrphanInput('');
            } else if (result?.code === 'FORBIDDEN') {
                toast.error(t('orphan.notOwner'));
            } else if (result?.code === 'INSUFFICIENT_SCOPES') {
                toast.error(t('orphan.scopeError'));
            } else {
                toast.error(result?.message || t('orphan.unknownError'));
            }
        } catch {
            toast.error(t('orphan.unknownError'));
        } finally {
            setOrphanLoading(false);
        }
    };

    const computeStatus = useCallback((data) => {
        if (!data?.connected) return STATUS.DISCONNECTED;
        if (data.expiresAt && !data.hasRefreshToken) {
            const expires = new Date(data.expiresAt).getTime();
            const now = Date.now();
            const hoursLeft = (expires - now) / (1000 * 60 * 60);
            if (hoursLeft < EXPIRY_WARN_HOURS) return STATUS.EXPIRING;
        }
        return STATUS.CONNECTED;
    }, []);

    const loadStatus = useCallback(async () => {
        setStatus(STATUS.LOADING);
        try {
            const data = await getYouTubeStatus();
            setStatusData(data);
            setStatus(computeStatus(data));
        } catch {
            setStatus(STATUS.DISCONNECTED);
            setStatusData(null);
        }
    }, [getYouTubeStatus, computeStatus]);

    useEffect(() => {
        loadStatus();
        const params = new URLSearchParams(window.location.search);
        if (params.get('youtube') === 'connected') {
            toast.success(t('toast.connected'));
            params.delete('youtube');
            const newUrl = window.location.pathname + (params.toString() ? `?${params.toString()}` : '');
            window.history.replaceState({}, '', newUrl);
        }
    }, [loadStatus, t]);

    const handleConnect = () => {
        window.location.href = '/api/youtube/auth';
    };

    const handleDisconnect = async () => {
        if (!window.confirm(t('confirm.disconnect'))) return;
        setActionLoading(true);
        try {
            await disconnectYouTube();
            toast.success(t('toast.disconnected'));
            await loadStatus();
        } catch {
            toast.error(t('toast.disconnectError'));
        } finally {
            setActionLoading(false);
        }
    };

    const handleRefresh = async () => {
        setActionLoading(true);
        await loadStatus();
        setActionLoading(false);
    };

    const lastRefreshed = formatDate(statusData?.lastRefreshedAt, i18n.language);
    const expiresAt = formatDate(statusData?.expiresAt, i18n.language);

    const renderStatusBadge = () => {
        switch (status) {
            case STATUS.CONNECTED:
                return (
                    <div className="yac-badge yac-badge--ok">
                        <CheckCircle2 size={16} />
                        <span>{t('status.connected')}</span>
                    </div>
                );
            case STATUS.EXPIRING:
                return (
                    <div className="yac-badge yac-badge--warn">
                        <AlertTriangle size={16} />
                        <span>{t('status.expiring')}</span>
                    </div>
                );
            case STATUS.DISCONNECTED:
                return (
                    <div className="yac-badge yac-badge--err">
                        <XCircle size={16} />
                        <span>{t('status.disconnected')}</span>
                    </div>
                );
            default:
                return (
                    <div className="yac-badge yac-badge--loading">
                        <RefreshCw size={16} className="yac-spin" />
                        <span>{t('status.loading')}</span>
                    </div>
                );
        }
    };

    return (
        <div className={`yac-root yac-root--${variant}`}>
            <div className="yac-head">
                <div className="yac-head-left">
                    <div className="yac-icon-box">
                        <Youtube size={22} />
                    </div>
                    <div className="yac-head-text">
                        <h3 className="yac-title">{t('title')}</h3>
                        <p className="yac-subtitle">{t('subtitle')}</p>
                    </div>
                </div>
                {renderStatusBadge()}
            </div>

            <button
                type="button"
                className={`yac-help-toggle ${helpOpen ? 'yac-help-toggle--open' : ''}`}
                onClick={() => setHelpOpen((o) => !o)}
                aria-expanded={helpOpen}
            >
                <Info size={14} />
                <span>{helpOpen ? t('help.hide') : t('help.show')}</span>
                <ChevronDown size={14} className="yac-help-chevron" />
            </button>

            {helpOpen && (
                <div className="yac-help-box">
                    <h4 className="yac-help-title">{t('help.whyTitle')}</h4>
                    <p className="yac-help-text">{t('help.whyText')}</p>

                    <h4 className="yac-help-title">{t('help.howTitle')}</h4>
                    <ol className="yac-help-list">
                        <li>{t('help.step1')}</li>
                        <li>{t('help.step2')}</li>
                        <li>{t('help.step3')}</li>
                        <li>{t('help.step4')}</li>
                    </ol>

                    <h4 className="yac-help-title">{t('help.permsTitle')}</h4>
                    <ul className="yac-help-list">
                        <li>{t('help.perm1')}</li>
                        <li>{t('help.perm2')}</li>
                    </ul>

                    <h4 className="yac-help-title">{t('help.notesTitle')}</h4>
                    <ul className="yac-help-list">
                        <li>{t('help.note1')}</li>
                        <li>{t('help.note2')}</li>
                        <li>{t('help.note3')}</li>
                    </ul>
                </div>
            )}

            {status !== STATUS.LOADING && (
                <div className="yac-meta">
                    {statusData?.connected && (
                        <>
                            {lastRefreshed && (
                                <div className="yac-meta-row">
                                    <span className="yac-meta-label">{t('meta.lastRefreshed')}:</span>
                                    <span className="yac-meta-value">{lastRefreshed}</span>
                                </div>
                            )}
                            {expiresAt && (
                                <div className="yac-meta-row">
                                    <span className="yac-meta-label">{t('meta.expiresAt')}:</span>
                                    <span className="yac-meta-value">{expiresAt}</span>
                                </div>
                            )}
                            {statusData.hasRefreshToken && (
                                <div className="yac-meta-row yac-meta-row--note">
                                    <span className="yac-meta-value">{t('meta.autoRefresh')}</span>
                                </div>
                            )}
                        </>
                    )}
                    {!statusData?.connected && (
                        <div className="yac-meta-row yac-meta-row--note">
                            <span className="yac-meta-value">{t('meta.notConnectedHint')}</span>
                        </div>
                    )}
                </div>
            )}

            <div className="yac-actions">
                <button
                    type="button"
                    className="yac-btn yac-btn--ghost"
                    onClick={handleRefresh}
                    disabled={actionLoading || status === STATUS.LOADING}
                    title={t('actions.refresh')}
                >
                    <RefreshCw size={14} className={actionLoading ? 'yac-spin' : ''} />
                    <span>{t('actions.refresh')}</span>
                </button>

                {(status === STATUS.DISCONNECTED || status === STATUS.EXPIRING) && (
                    <button
                        type="button"
                        className="yac-btn yac-btn--primary"
                        onClick={handleConnect}
                        disabled={actionLoading}
                    >
                        <LinkIcon size={14} />
                        <span>{status === STATUS.EXPIRING ? t('actions.reconnect') : t('actions.connect')}</span>
                    </button>
                )}

                {status === STATUS.CONNECTED && (
                    <button
                        type="button"
                        className="yac-btn yac-btn--danger"
                        onClick={handleDisconnect}
                        disabled={actionLoading}
                    >
                        <Unlink size={14} />
                        <span>{t('actions.disconnect')}</span>
                    </button>
                )}
            </div>

            {status === STATUS.CONNECTED && (
                <>
                    <button
                        type="button"
                        className={`yac-help-toggle ${orphanOpen ? 'yac-help-toggle--open' : ''}`}
                        onClick={() => setOrphanOpen((o) => !o)}
                        aria-expanded={orphanOpen}
                    >
                        <Wrench size={14} />
                        <span>{t('orphan.toggle')}</span>
                        <ChevronDown size={14} className="yac-help-chevron" />
                    </button>

                    {orphanOpen && (
                        <div className="yac-orphan-box">
                            <p className="yac-orphan-desc">{t('orphan.description')}</p>
                            <div className="yac-orphan-row">
                                <input
                                    type="text"
                                    className="yac-orphan-input"
                                    value={orphanInput}
                                    onChange={(e) => setOrphanInput(e.target.value)}
                                    placeholder={t('orphan.placeholder')}
                                    disabled={orphanLoading}
                                />
                                <button
                                    type="button"
                                    className="yac-btn yac-btn--danger"
                                    onClick={handleOrphanDelete}
                                    disabled={orphanLoading || !orphanInput.trim()}
                                >
                                    <Trash2 size={14} />
                                    <span>{orphanLoading ? t('orphan.deleting') : t('orphan.deleteBtn')}</span>
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default YouTubeAuthCard;
