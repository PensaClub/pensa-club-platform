// src/components/SiteSettingsAdmin/AdminUserActionLogs/AdminUserActionLogs.jsx
// Prefix: aual-

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useAdminContext } from '../../contexts/AdminContext';
import {
    Search, FileDown, RefreshCw, ChevronLeft, ChevronRight, X,
    CheckCircle, XCircle, Eye, Filter, Calendar, Mail, User,
    Loader2, AlertCircle, Info,
} from 'lucide-react';
import './adminUserActionLogs.css';

const ACTION_TYPES = [
    { key: '', label: 'Всички' },
    { key: 'lookup_user', label: 'Търсене' },
    { key: 'invite_user', label: 'Покана' },
    { key: 'send_reset_link', label: 'Изпратен reset' },
    { key: 'reset_completed', label: 'Успешен reset' },
    { key: 'reset_failed', label: 'Неуспешен reset' },
];

const SUCCESS_OPTIONS = [
    { key: '', label: 'Всички' },
    { key: 'true', label: 'Успешни' },
    { key: 'false', label: 'Неуспешни' },
];

const PAGE_LIMIT = 20;

const AdminUserActionLogs = () => {
    const { t } = useTranslation('admin');
    const { getUserActionLogs, downloadUserActionLogsPdf } = useAdminContext();
    const [isExporting, setIsExporting] = useState(false);

    // Data
    const [logs, setLogs] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, limit: PAGE_LIMIT });
    const [isLoading, setIsLoading] = useState(false);

    // Filters
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [adminEmail, setAdminEmail] = useState('');
    const [targetEmail, setTargetEmail] = useState('');
    const [actionType, setActionType] = useState('');
    const [success, setSuccess] = useState('');
    const [appliedFilters, setAppliedFilters] = useState({});

    // Details modal
    const [detailsModal, setDetailsModal] = useState(null);

    // Filters open/closed (mobile)
    const [filtersOpen, setFiltersOpen] = useState(false);

    // ─── Fetch logs ───

    const fetchLogs = useCallback(async (page = 1, filters = appliedFilters) => {
        setIsLoading(true);
        try {
            const params = {
                page,
                limit: PAGE_LIMIT,
                ...filters,
            };
            const response = await getUserActionLogs(params);
            setLogs(response?.data || []);
            setPagination(response?.pagination || { page: 1, totalPages: 1, total: 0, limit: PAGE_LIMIT });
        } catch {
            // toast already shown by provider
        } finally {
            setIsLoading(false);
        }
    }, [getUserActionLogs, appliedFilters]);

    useEffect(() => {
        fetchLogs(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ─── Apply / clear filters ───

    const handleApplyFilters = () => {
        const filters = {};
        if (dateFrom) filters.dateFrom = dateFrom;
        if (dateTo) filters.dateTo = dateTo;
        if (adminEmail.trim()) filters.adminEmail = adminEmail.trim();
        if (targetEmail.trim()) filters.targetEmail = targetEmail.trim();
        if (actionType) filters.actionType = actionType;
        if (success !== '') filters.success = success;
        setAppliedFilters(filters);
        fetchLogs(1, filters);
        setFiltersOpen(false);
    };

    const handleClearFilters = () => {
        setDateFrom('');
        setDateTo('');
        setAdminEmail('');
        setTargetEmail('');
        setActionType('');
        setSuccess('');
        setAppliedFilters({});
        fetchLogs(1, {});
    };

    const handleRefresh = () => {
        fetchLogs(pagination.page);
    };

    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > pagination.totalPages) return;
        fetchLogs(newPage);
    };

    // ─── PDF export — fetch with auth header, then trigger download via blob ───

    const handleExportPdf = async () => {
        setIsExporting(true);
        try {
            await downloadUserActionLogsPdf(appliedFilters);
        } catch {
            // toast already shown by context
        } finally {
            setIsExporting(false);
        }
    };

    // ─── Helpers ───

    const formatDate = (isoStr) => {
        if (!isoStr) return '—';
        try {
            return new Date(isoStr).toLocaleString('bg-BG', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
            });
        } catch {
            return isoStr;
        }
    };

    const getActionLabel = (actionTypeValue) => {
        const found = ACTION_TYPES.find((a) => a.key === actionTypeValue);
        return found ? t(`adminUserActionLogs.actionTypes.${actionTypeValue}`, found.label) : actionTypeValue;
    };

    const getActionClass = (actionTypeValue) => {
        const map = {
            lookup_user: 'aual-action-lookup',
            invite_user: 'aual-action-invite',
            send_reset_link: 'aual-action-reset',
            reset_completed: 'aual-action-success',
            reset_failed: 'aual-action-failed',
        };
        return `aual-action-badge ${map[actionTypeValue] || ''}`;
    };

    // Stats calculation
    const successCount = logs.filter((l) => l.success).length;
    const failedCount = logs.filter((l) => !l.success).length;

    // =========================================================
    //                       RENDER
    // =========================================================

    return (
        <div className="aual-wrapper">
            {/* Header with toolbar */}
            <div className="aual-header">
                <div className="aual-header-info">
                    <h3 className="aual-title">
                        {t('adminUserActionLogs.title', 'Лог на админ действия')}
                    </h3>
                    <div className="aual-stats">
                        <span className="aual-stat aual-stat-total">
                            {t('adminUserActionLogs.total', 'Общо')}: <strong>{pagination.total}</strong>
                        </span>
                        <span className="aual-stat aual-stat-success">
                            <CheckCircle size={11} /> {successCount}
                        </span>
                        <span className="aual-stat aual-stat-failed">
                            <XCircle size={11} /> {failedCount}
                        </span>
                    </div>
                </div>

                <div className="aual-header-actions">
                    <button
                        className="aual-btn aual-btn-icon"
                        onClick={() => setFiltersOpen(!filtersOpen)}
                        title={t('adminUserActionLogs.toggleFilters', 'Филтри')}
                    >
                        <Filter size={14} />
                    </button>
                    <button
                        className="aual-btn aual-btn-icon"
                        onClick={handleRefresh}
                        disabled={isLoading}
                        title={t('adminUserActionLogs.refresh', 'Презареди')}
                    >
                        <RefreshCw size={14} className={isLoading ? 'aual-spin' : ''} />
                    </button>
                    <button
                        className="aual-btn aual-btn-primary"
                        onClick={handleExportPdf}
                        disabled={pagination.total === 0 || isExporting}
                    >
                        {isExporting ? (
                            <Loader2 size={14} className="aual-spin" />
                        ) : (
                            <FileDown size={14} />
                        )}
                        <span>{t('adminUserActionLogs.exportPdf', 'Експорт PDF')}</span>
                    </button>
                </div>
            </div>

            {/* Filters bar */}
            {filtersOpen && (
                <div className="aual-filters">
                    <div className="aual-filters-grid">
                        <div className="aual-filter-field">
                            <label className="aual-filter-label">
                                <Calendar size={12} /> {t('adminUserActionLogs.dateFrom', 'От дата')}
                            </label>
                            <input
                                type="date"
                                className="aual-input"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                            />
                        </div>

                        <div className="aual-filter-field">
                            <label className="aual-filter-label">
                                <Calendar size={12} /> {t('adminUserActionLogs.dateTo', 'До дата')}
                            </label>
                            <input
                                type="date"
                                className="aual-input"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                            />
                        </div>

                        <div className="aual-filter-field">
                            <label className="aual-filter-label">
                                <Mail size={12} /> {t('adminUserActionLogs.adminEmail', 'Имейл на admin')}
                            </label>
                            <input
                                type="text"
                                className="aual-input"
                                placeholder="admin@..."
                                value={adminEmail}
                                onChange={(e) => setAdminEmail(e.target.value)}
                            />
                        </div>

                        <div className="aual-filter-field">
                            <label className="aual-filter-label">
                                <User size={12} /> {t('adminUserActionLogs.targetEmail', 'Имейл на target')}
                            </label>
                            <input
                                type="text"
                                className="aual-input"
                                placeholder="user@..."
                                value={targetEmail}
                                onChange={(e) => setTargetEmail(e.target.value)}
                            />
                        </div>

                        <div className="aual-filter-field">
                            <label className="aual-filter-label">
                                {t('adminUserActionLogs.actionType', 'Тип действие')}
                            </label>
                            <select
                                className="aual-input"
                                value={actionType}
                                onChange={(e) => setActionType(e.target.value)}
                            >
                                {ACTION_TYPES.map((a) => (
                                    <option key={a.key} value={a.key}>
                                        {t(`adminUserActionLogs.actionTypes.${a.key || 'all'}`, a.label)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="aual-filter-field">
                            <label className="aual-filter-label">
                                {t('adminUserActionLogs.statusFilter', 'Статус')}
                            </label>
                            <select
                                className="aual-input"
                                value={success}
                                onChange={(e) => setSuccess(e.target.value)}
                            >
                                {SUCCESS_OPTIONS.map((s) => (
                                    <option key={s.key} value={s.key}>
                                        {t(`adminUserActionLogs.statusOptions.${s.key || 'all'}`, s.label)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="aual-filters-actions">
                        <button className="aual-btn aual-btn-secondary" onClick={handleClearFilters}>
                            <X size={14} /> <span>{t('adminUserActionLogs.clearFilters', 'Изчисти')}</span>
                        </button>
                        <button className="aual-btn aual-btn-primary" onClick={handleApplyFilters}>
                            <Search size={14} /> <span>{t('adminUserActionLogs.applyFilters', 'Приложи')}</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Loading state */}
            {isLoading && logs.length === 0 ? (
                <div className="aual-loading">
                    <Loader2 size={24} className="aual-spin" />
                    <span>{t('adminUserActionLogs.loading', 'Зареждане...')}</span>
                </div>
            ) : logs.length === 0 ? (
                <div className="aual-empty">
                    <Info size={32} />
                    <p>{t('adminUserActionLogs.noLogs', 'Няма записи за тези филтри')}</p>
                </div>
            ) : (
                <>
                    {/* Logs table */}
                    <div className="aual-table-wrap">
                        <table className="aual-table">
                            <thead>
                                <tr>
                                    <th>{t('adminUserActionLogs.col.date', 'Дата')}</th>
                                    <th>{t('adminUserActionLogs.col.action', 'Действие')}</th>
                                    <th>{t('adminUserActionLogs.col.admin', 'Admin')}</th>
                                    <th>{t('adminUserActionLogs.col.target', 'Target')}</th>
                                    <th className="aual-col-ip">{t('adminUserActionLogs.col.ip', 'IP')}</th>
                                    <th className="aual-col-status">{t('adminUserActionLogs.col.status', 'Статус')}</th>
                                    <th className="aual-col-actions">{t('adminUserActionLogs.col.details', 'Детайли')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log) => (
                                    <tr key={log.id} className={`aual-row ${!log.success ? 'aual-row-failed' : ''}`}>
                                        <td className="aual-cell-date">{formatDate(log.created_at)}</td>
                                        <td>
                                            <span className={getActionClass(log.actionType)}>
                                                {getActionLabel(log.actionType)}
                                            </span>
                                        </td>
                                        <td className="aual-cell-email">
                                            {log.admin?.email || `#${log.adminId}`}
                                        </td>
                                        <td className="aual-cell-email">{log.targetEmail}</td>
                                        <td className="aual-cell-ip">{log.ipAddress || '—'}</td>
                                        <td className="aual-cell-status">
                                            {log.success ? (
                                                <CheckCircle size={14} className="aual-icon-success" />
                                            ) : (
                                                <XCircle size={14} className="aual-icon-failed" />
                                            )}
                                        </td>
                                        <td className="aual-cell-actions">
                                            <button
                                                className="aual-btn-details"
                                                onClick={() => setDetailsModal(log)}
                                                title={t('adminUserActionLogs.viewDetails', 'Виж детайли')}
                                            >
                                                <Eye size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="aual-pagination">
                            <button
                                className="aual-pagination-btn"
                                onClick={() => handlePageChange(pagination.page - 1)}
                                disabled={pagination.page <= 1 || isLoading}
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span className="aual-pagination-info">
                                {pagination.page} / {pagination.totalPages}
                            </span>
                            <button
                                className="aual-pagination-btn"
                                onClick={() => handlePageChange(pagination.page + 1)}
                                disabled={pagination.page >= pagination.totalPages || isLoading}
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Details modal — rendered via Portal to escape parent containers
                that have backdrop-filter / transform / etc. (which create new
                containing blocks for position: fixed elements) */}
            {detailsModal && createPortal(
                <div className="aual-modal-overlay" onClick={() => setDetailsModal(null)}>
                    <div className="aual-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="aual-modal-header">
                            <h4>{t('adminUserActionLogs.detailsTitle', 'Детайли за действие')}</h4>
                            <button className="aual-modal-close" onClick={() => setDetailsModal(null)}>
                                <X size={18} />
                            </button>
                        </div>
                        <div className="aual-modal-body">
                            <div className="aual-detail-row">
                                <strong>ID:</strong> #{detailsModal.id}
                            </div>
                            <div className="aual-detail-row">
                                <strong>{t('adminUserActionLogs.col.date', 'Дата')}:</strong>{' '}
                                {formatDate(detailsModal.created_at)}
                            </div>
                            <div className="aual-detail-row">
                                <strong>{t('adminUserActionLogs.col.action', 'Действие')}:</strong>{' '}
                                <span className={getActionClass(detailsModal.actionType)}>
                                    {getActionLabel(detailsModal.actionType)}
                                </span>
                            </div>
                            <div className="aual-detail-row">
                                <strong>{t('adminUserActionLogs.col.admin', 'Admin')}:</strong>{' '}
                                {detailsModal.admin?.email}
                                {detailsModal.admin?.details?.firstName && (
                                    <span className="aual-detail-meta">
                                        {' '}
                                        ({detailsModal.admin.details.firstName} {detailsModal.admin.details.lastName})
                                    </span>
                                )}
                            </div>
                            <div className="aual-detail-row">
                                <strong>{t('adminUserActionLogs.col.target', 'Target')}:</strong>{' '}
                                {detailsModal.targetEmail}
                                {detailsModal.targetUserId && (
                                    <span className="aual-detail-meta"> (User ID: #{detailsModal.targetUserId})</span>
                                )}
                            </div>
                            <div className="aual-detail-row">
                                <strong>IP:</strong> {detailsModal.ipAddress || '—'}
                            </div>
                            <div className="aual-detail-row">
                                <strong>User Agent:</strong>{' '}
                                <code className="aual-detail-code">{detailsModal.userAgent || '—'}</code>
                            </div>
                            <div className="aual-detail-row">
                                <strong>{t('adminUserActionLogs.col.status', 'Статус')}:</strong>{' '}
                                {detailsModal.success ? (
                                    <span className="aual-status-success">
                                        <CheckCircle size={12} /> {t('adminUserActionLogs.success', 'Успех')}
                                    </span>
                                ) : (
                                    <span className="aual-status-failed">
                                        <XCircle size={12} /> {t('adminUserActionLogs.failed', 'Неуспех')}
                                    </span>
                                )}
                            </div>
                            {detailsModal.details && (
                                <div className="aual-detail-row">
                                    <strong>{t('adminUserActionLogs.detailsJson', 'Допълнителна информация')}:</strong>
                                    <pre className="aual-detail-json">
                                        {JSON.stringify(detailsModal.details, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default AdminUserActionLogs;
