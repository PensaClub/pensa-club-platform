import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { X, RefreshCw, Trash2, AlertTriangle, CheckCircle, PlayCircle, Info } from 'lucide-react';
import { toast } from 'react-toastify';
import { useStorage } from '../../contexts/StorageProvider';
import './syncReportModal.css';

const SyncReportModal = ({ onClose }) => {
    const { t } = useTranslation('admin');
    const {
        getSyncStatus,
        syncStorage,
        deleteOrphan,
        deleteSyncErrorFile,
    } = useStorage();

    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState(null);
    const [running, setRunning] = useState(false);
    const [deleting, setDeleting] = useState({}); // key -> bool

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getSyncStatus();
            setStatus(data);
        } catch (err) {
            toast.error(t('cloudStorage.syncReport.loadError'));
        } finally {
            setLoading(false);
        }
    }, [getSyncStatus, t]);

    useEffect(() => {
        load();
    }, [load]);

    const handleRunSync = async () => {
        setRunning(true);
        try {
            await syncStorage();
            await load();
        } catch (err) {
            // syncStorage already toasts / throws; no extra handling
        } finally {
            setRunning(false);
        }
    };

    const handleDeleteOrphan = async (orphan) => {
        if (!window.confirm(t('cloudStorage.syncReport.confirmDeleteOrphan'))) return;
        const key = `${orphan.table}#${orphan.id}`;
        setDeleting((d) => ({ ...d, [key]: true }));
        try {
            await deleteOrphan(orphan.table, orphan.id);
            toast.success(t('cloudStorage.syncReport.orphanDeleted'));
            setStatus((s) => {
                if (!s?.lastSyncResult) return s;
                return {
                    ...s,
                    lastSyncResult: {
                        ...s.lastSyncResult,
                        orphans: (s.lastSyncResult.orphans || []).filter(
                            (o) => !(o.table === orphan.table && o.id === orphan.id)
                        ),
                    },
                };
            });
        } catch (err) {
            toast.error(t('cloudStorage.syncReport.deleteOrphanError'));
        } finally {
            setDeleting((d) => {
                const next = { ...d };
                delete next[key];
                return next;
            });
        }
    };

    const handleDeleteErrorFile = async (errorItem) => {
        if (!window.confirm(t('cloudStorage.syncReport.confirmDeleteErrorFile'))) return;
        const key = `err:${errorItem.file}`;
        setDeleting((d) => ({ ...d, [key]: true }));
        try {
            await deleteSyncErrorFile(errorItem.file);
            toast.success(t('cloudStorage.syncReport.errorFileDeleted'));
            setStatus((s) => {
                if (!s?.lastSyncResult) return s;
                return {
                    ...s,
                    lastSyncResult: {
                        ...s.lastSyncResult,
                        errors: (s.lastSyncResult.errors || []).filter(
                            (e) => e.file !== errorItem.file
                        ),
                    },
                };
            });
        } catch (err) {
            toast.error(t('cloudStorage.syncReport.deleteErrorFileError'));
        } finally {
            setDeleting((d) => {
                const next = { ...d };
                delete next[key];
                return next;
            });
        }
    };

    const formatDate = (iso) => {
        if (!iso) return '—';
        try {
            return new Date(iso).toLocaleString();
        } catch {
            return iso;
        }
    };

    const result = status?.lastSyncResult;
    const orphans = result?.orphans || [];
    const errors = result?.errors || [];
    const syncedCount = result?.synced ?? 0;

    return (
        <div className="csr-overlay" onClick={onClose}>
            <div className="csr-modal" onClick={(e) => e.stopPropagation()}>
                <div className="csr-header">
                    <h3 className="csr-title">{t('cloudStorage.syncReport.title')}</h3>
                    <button className="csr-close" onClick={onClose} aria-label="Close">
                        <X size={20} />
                    </button>
                </div>

                <div className="csr-body">
                    {loading && !status && (
                        <div className="csr-loading">
                            <RefreshCw size={20} className="csr-spin" />
                            <span>{t('cloudStorage.syncReport.loading')}</span>
                        </div>
                    )}

                    {!loading && !result && (
                        <div className="csr-empty">
                            <AlertTriangle size={32} />
                            <p>{t('cloudStorage.syncReport.noData')}</p>
                        </div>
                    )}

                    {status && (
                        <>
                            {/* Intro banner — explains what this report actually is */}
                            <div className="csr-intro">
                                <Info size={18} className="csr-intro-icon" />
                                <p className="csr-intro-text">
                                    {t('cloudStorage.syncReport.intro')}
                                </p>
                            </div>

                            <div className="csr-meta">
                                <div className="csr-meta-row">
                                    <span className="csr-meta-label">{t('cloudStorage.syncReport.lastSyncAt')}</span>
                                    <span className="csr-meta-value">{formatDate(status.lastSyncTime)}</span>
                                </div>
                                <div className="csr-meta-row">
                                    <span className="csr-meta-label">{t('cloudStorage.syncReport.nextSync')}</span>
                                    <span className="csr-meta-value">{formatDate(status.nextScheduledSync)}</span>
                                </div>
                                {status.syncInProgress && (
                                    <div className="csr-meta-row csr-meta-row--progress">
                                        <RefreshCw size={14} className="csr-spin" />
                                        <span>{t('cloudStorage.syncReport.inProgress')}</span>
                                    </div>
                                )}
                            </div>

                            {result && (
                                <div className="csr-summary">
                                    <div
                                        className="csr-summary-card csr-summary-card--success"
                                        title={t('cloudStorage.syncReport.syncedExplain')}
                                    >
                                        <CheckCircle size={18} />
                                        <div className="csr-summary-text">
                                            <div className="csr-summary-count">{syncedCount}</div>
                                            <div className="csr-summary-label">{t('cloudStorage.syncReport.synced')}</div>
                                            <div className="csr-summary-hint">{t('cloudStorage.syncReport.syncedExplain')}</div>
                                        </div>
                                    </div>
                                    <div
                                        className="csr-summary-card csr-summary-card--warning"
                                        title={t('cloudStorage.syncReport.orphansExplain')}
                                    >
                                        <AlertTriangle size={18} />
                                        <div className="csr-summary-text">
                                            <div className="csr-summary-count">{orphans.length}</div>
                                            <div className="csr-summary-label">{t('cloudStorage.syncReport.orphans')}</div>
                                            <div className="csr-summary-hint">{t('cloudStorage.syncReport.orphansExplain')}</div>
                                        </div>
                                    </div>
                                    <div
                                        className="csr-summary-card csr-summary-card--danger"
                                        title={t('cloudStorage.syncReport.errorsExplain')}
                                    >
                                        <AlertTriangle size={18} />
                                        <div className="csr-summary-text">
                                            <div className="csr-summary-count">{errors.length}</div>
                                            <div className="csr-summary-label">{t('cloudStorage.syncReport.errors')}</div>
                                            <div className="csr-summary-hint">{t('cloudStorage.syncReport.errorsExplain')}</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {result && orphans.length > 0 && (
                                <div className="csr-section">
                                    <h4 className="csr-section-title">
                                        {t('cloudStorage.syncReport.orphans')} ({orphans.length})
                                    </h4>
                                    <div className="csr-explain csr-explain--warning">
                                        <Info size={14} />
                                        <span>{t('cloudStorage.syncReport.orphansExplain')}</span>
                                    </div>
                                    <div className="csr-table-wrap">
                                        <table className="csr-table">
                                            <thead>
                                                <tr>
                                                    <th>{t('cloudStorage.syncReport.colTable')}</th>
                                                    <th>{t('cloudStorage.syncReport.colId')}</th>
                                                    <th>{t('cloudStorage.syncReport.colFileName')}</th>
                                                    <th>{t('cloudStorage.syncReport.colExpectedPath')}</th>
                                                    <th className="csr-col-action"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {orphans.map((o) => {
                                                    const key = `${o.table}#${o.id}`;
                                                    return (
                                                        <tr key={key}>
                                                            <td className="csr-cell-table">{o.table}</td>
                                                            <td>{o.id}</td>
                                                            <td className="csr-cell-file">{o.fileName}</td>
                                                            <td className="csr-cell-path">{o.expectedPath}</td>
                                                            <td className="csr-col-action">
                                                                <button
                                                                    className="csr-btn csr-btn--danger csr-btn--sm"
                                                                    onClick={() => handleDeleteOrphan(o)}
                                                                    disabled={!!deleting[key]}
                                                                >
                                                                    <Trash2 size={14} />
                                                                    {t('cloudStorage.syncReport.deleteOrphanBtn')}
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {result && errors.length > 0 && (
                                <div className="csr-section">
                                    <h4 className="csr-section-title">
                                        {t('cloudStorage.syncReport.errors')} ({errors.length})
                                    </h4>
                                    <div className="csr-explain csr-explain--danger">
                                        <Info size={14} />
                                        <span>{t('cloudStorage.syncReport.errorsExplain')}</span>
                                    </div>
                                    <div className="csr-table-wrap">
                                        <table className="csr-table">
                                            <thead>
                                                <tr>
                                                    <th>{t('cloudStorage.syncReport.colErrorFile')}</th>
                                                    <th>{t('cloudStorage.syncReport.colErrorReason')}</th>
                                                    <th className="csr-col-action"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {errors.map((e) => {
                                                    const key = `err:${e.file}`;
                                                    return (
                                                        <tr key={key}>
                                                            <td className="csr-cell-path">{e.file}</td>
                                                            <td className="csr-cell-reason">{e.error}</td>
                                                            <td className="csr-col-action">
                                                                <button
                                                                    className="csr-btn csr-btn--danger csr-btn--sm"
                                                                    onClick={() => handleDeleteErrorFile(e)}
                                                                    disabled={!!deleting[key]}
                                                                >
                                                                    <Trash2 size={14} />
                                                                    {t('cloudStorage.syncReport.deleteErrorFileBtn')}
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {result && orphans.length === 0 && errors.length === 0 && (
                                <div className="csr-all-clear">
                                    <CheckCircle size={28} />
                                    <span>{t('cloudStorage.syncReport.orphansNone')} · {t('cloudStorage.syncReport.errorsNone')}</span>
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="csr-footer">
                    <button className="csr-btn csr-btn--ghost" onClick={load} disabled={loading}>
                        <RefreshCw size={16} className={loading ? 'csr-spin' : ''} />
                        {t('cloudStorage.syncReport.refresh')}
                    </button>
                    <button
                        className="csr-btn csr-btn--primary"
                        onClick={handleRunSync}
                        disabled={running || status?.syncInProgress}
                    >
                        <PlayCircle size={16} />
                        {running
                            ? t('cloudStorage.syncReport.runningSync')
                            : t('cloudStorage.syncReport.runSync')}
                    </button>
                    <button className="csr-btn csr-btn--ghost" onClick={onClose}>
                        {t('cloudStorage.syncReport.close')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SyncReportModal;
