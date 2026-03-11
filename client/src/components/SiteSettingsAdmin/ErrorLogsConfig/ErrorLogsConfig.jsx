import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Trash2, Download, RefreshCw, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, AlertTriangle, Calendar, ArrowDown, ArrowUp } from 'lucide-react';
import { errorLoggingServiceFactory } from '../../Services/errorLoggingServiceFactory';
import { toast } from 'react-toastify';
import './errorLogsConfig.css';

const ErrorLogsConfig = () => {
    const { t } = useTranslation('admin');
    const [service] = useState(() => errorLoggingServiceFactory());
    const [logs, setLogs] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [expandedLogId, setExpandedLogId] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [period, setPeriod] = useState('all');
    const [sort, setSort] = useState('newest');

    const fetchLogs = useCallback(async (searchVal, page, periodVal, sortVal) => {
        setIsLoading(true);
        try {
            const params = { page, limit: 20 };
            if (searchVal) params.search = searchVal;
            if (periodVal && periodVal !== 'all') params.period = periodVal;
            if (sortVal && sortVal !== 'newest') params.sort = sortVal;
            const result = await service.getErrorLogs(params);
            setLogs(result.logs || []);
            setPagination(result.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 });
        } catch (err) {
            console.error('Error fetching logs:', err);
        } finally {
            setIsLoading(false);
        }
    }, [service]);

    useEffect(() => { fetchLogs('', 1, 'all', 'newest'); }, [fetchLogs]);

    const handleExport = async () => {
        try {
            const data = await service.exportErrorLogs();
            const blob = new Blob([JSON.stringify(data.logs || data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `error-logs-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success(t('siteSettingsAdmin.errorLogs.exportSuccess'));
        } catch (err) {
            toast.error(t('siteSettingsAdmin.errorLogs.exportError'));
        }
    };

    const handleClearAll = async () => {
        if (!window.confirm(t('siteSettingsAdmin.errorLogs.confirmClearAll'))) return;
        try {
            await service.clearAllErrorLogs();
            toast.success(t('siteSettingsAdmin.errorLogs.clearSuccess'));
            fetchLogs(search, 1, period, sort);
        } catch (err) {
            toast.error(t('siteSettingsAdmin.errorLogs.clearError'));
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('bg-BG', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit',
        });
    };

    const truncate = (text, max) => {
        if (!text) return '-';
        return text.length > max ? text.substring(0, max) + '...' : text;
    };

    return (
        <div className="elc">
            {/* TOOLBAR */}
            <div className="elc-toolbar">
                <form className="elc-search" onSubmit={(e) => { e.preventDefault(); fetchLogs(search, 1, period, sort); }}>
                    <input type="text" className="elc-search-input" placeholder={t('siteSettingsAdmin.errorLogs.searchPlaceholder')} value={search} onChange={(e) => setSearch(e.target.value)} />
                    <button type="submit" className="elc-search-btn"><Search size={16} /></button>
                </form>
                <div className="elc-actions-bar">
                    <button className="elc-action-btn elc-action-btn--export" onClick={handleExport} title={t('siteSettingsAdmin.errorLogs.export')}>
                        <Download size={16} />
                        <span className="elc-btn-label">{t('siteSettingsAdmin.errorLogs.export')}</span>
                    </button>
                    {logs.length > 0 && (
                        <button className="elc-action-btn elc-action-btn--clear" onClick={handleClearAll} title={t('siteSettingsAdmin.errorLogs.clearAll')}>
                            <Trash2 size={16} />
                            <span className="elc-btn-label">{t('siteSettingsAdmin.errorLogs.clearAll')}</span>
                        </button>
                    )}
                    <button className={`elc-action-btn elc-action-btn--refresh ${isRefreshing ? 'elc-spinning' : ''}`} onClick={() => { setIsRefreshing(true); fetchLogs(search, pagination.page, period, sort).finally(() => setIsRefreshing(false)); }}>
                        <RefreshCw size={16} />
                    </button>
                </div>
            </div>

            {/* FILTERS */}
            <div className="elc-filters">
                <div className="elc-period-filters">
                    {[
                        { key: 'all', label: t('siteSettingsAdmin.errorLogs.periodAll') },
                        { key: 'today', label: t('siteSettingsAdmin.errorLogs.periodToday') },
                        { key: 'week', label: t('siteSettingsAdmin.errorLogs.periodWeek') },
                        { key: 'month', label: t('siteSettingsAdmin.errorLogs.periodMonth') },
                    ].map((p) => (
                        <button
                            key={p.key}
                            className={`elc-filter-btn ${period === p.key ? 'elc-filter-btn--active' : ''}`}
                            onClick={() => { setPeriod(p.key); fetchLogs(search, 1, p.key, sort); }}
                        >
                            {p.key === 'today' && <Calendar size={13} />}
                            <span className="elc-filter-label">{p.label}</span>
                        </button>
                    ))}
                </div>
                <div className="elc-sort-btns">
                    <button
                        className={`elc-sort-btn ${sort === 'newest' ? 'elc-sort-btn--active' : ''}`}
                        onClick={() => { setSort('newest'); fetchLogs(search, 1, period, 'newest'); }}
                    >
                        <ArrowDown size={13} />
                        <span className="elc-filter-label">{t('siteSettingsAdmin.errorLogs.sortNewest')}</span>
                    </button>
                    <button
                        className={`elc-sort-btn ${sort === 'oldest' ? 'elc-sort-btn--active' : ''}`}
                        onClick={() => { setSort('oldest'); fetchLogs(search, 1, period, 'oldest'); }}
                    >
                        <ArrowUp size={13} />
                        <span className="elc-filter-label">{t('siteSettingsAdmin.errorLogs.sortOldest')}</span>
                    </button>
                </div>
            </div>

            {/* TABLE */}
            {isLoading ? (
                <div className="elc-loading">{t('siteSettingsAdmin.loading')}</div>
            ) : logs.length > 0 ? (
                <>
                    <div className="elc-table-wrapper">
                        <table className="elc-table">
                            <thead>
                                <tr>
                                    <th>{t('siteSettingsAdmin.errorLogs.timestamp')}</th>
                                    <th>{t('siteSettingsAdmin.errorLogs.errorMessage')}</th>
                                    <th>{t('siteSettingsAdmin.errorLogs.url')}</th>
                                    <th className="elc-th-browser">{t('siteSettingsAdmin.errorLogs.browser')}</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log) => (
                                    <React.Fragment key={log.id}>
                                        <tr className={`elc-row ${expandedLogId === log.id ? 'elc-row--expanded' : ''}`} onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}>
                                            <td className="elc-cell-date">{formatDate(log.createdAt)}</td>
                                            <td className="elc-cell-message">
                                                <span className="elc-error-icon"><AlertTriangle size={14} /></span>
                                                {truncate(log.errorMessage, 80)}
                                            </td>
                                            <td className="elc-cell-url">{truncate(log.url, 50)}</td>
                                            <td className="elc-cell-ua">{truncate(log.userAgent, 40)}</td>
                                            <td className="elc-cell-toggle">
                                                {expandedLogId === log.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                            </td>
                                        </tr>
                                        {expandedLogId === log.id && (
                                            <tr className="elc-detail-row">
                                                <td colSpan="5">
                                                    <div className="elc-detail">
                                                        <div className="elc-detail-section">
                                                            <h4>{t('siteSettingsAdmin.errorLogs.errorMessage')}</h4>
                                                            <pre className="elc-pre">{log.errorMessage}</pre>
                                                        </div>
                                                        {log.errorStack && (
                                                            <div className="elc-detail-section">
                                                                <h4>{t('siteSettingsAdmin.errorLogs.stackTrace')}</h4>
                                                                <pre className="elc-pre">{log.errorStack}</pre>
                                                            </div>
                                                        )}
                                                        {log.componentStack && (
                                                            <div className="elc-detail-section">
                                                                <h4>{t('siteSettingsAdmin.errorLogs.componentStack')}</h4>
                                                                <pre className="elc-pre">{log.componentStack}</pre>
                                                            </div>
                                                        )}
                                                        <div className="elc-detail-meta">
                                                            <div><strong>URL:</strong> {log.url || '-'}</div>
                                                            <div><strong>IP:</strong> {log.ipAddress || '-'}</div>
                                                            <div><strong>{t('siteSettingsAdmin.errorLogs.browser')}:</strong> {log.userAgent || '-'}</div>
                                                            <div><strong>{t('siteSettingsAdmin.errorLogs.timestamp')}:</strong> {formatDate(log.createdAt)}</div>
                                                        </div>
                                                        <button className="elc-delete-btn" onClick={(e) => { e.stopPropagation(); if (window.confirm(t('siteSettingsAdmin.errorLogs.confirmDelete'))) { service.deleteErrorLog(log.id).then(() => { toast.success(t('siteSettingsAdmin.errorLogs.deleteSuccess')); fetchLogs(search, pagination.page, period, sort); }); } }}>
                                                            <Trash2 size={14} />
                                                            {t('siteSettingsAdmin.errorLogs.delete')}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINATION */}
                    {pagination.totalPages > 1 && (
                        <div className="elc-pagination">
                            <button className="elc-page-btn" onClick={() => fetchLogs(search, pagination.page - 1, period, sort)} disabled={pagination.page <= 1}>
                                <ChevronLeft size={16} />
                            </button>
                            <span className="elc-page-info">{pagination.page} / {pagination.totalPages}</span>
                            <button className="elc-page-btn" onClick={() => fetchLogs(search, pagination.page + 1, period, sort)} disabled={pagination.page >= pagination.totalPages}>
                                <ChevronRight size={16} />
                            </button>
                            <span className="elc-page-total">({pagination.total} {t('siteSettingsAdmin.errorLogs.totalRecords')})</span>
                        </div>
                    )}
                </>
            ) : (
                <div className="elc-empty">
                    <AlertTriangle size={24} />
                    <p>{t('siteSettingsAdmin.errorLogs.noLogs')}</p>
                </div>
            )}
        </div>
    );
};

export default ErrorLogsConfig;
