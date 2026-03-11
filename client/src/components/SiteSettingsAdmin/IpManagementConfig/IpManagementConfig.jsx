import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Ban, ShieldOff, ShieldCheck, Trash2, Plus, Search, Check, X, Lock, LockOpen, ChevronLeft, ChevronRight, Eye, Globe, Calendar, RefreshCw, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useIpManagement } from '../../contexts/IpManagementContext';
import './ipManagementConfig.css';

const IpManagementConfig = () => {
    const { t } = useTranslation('admin');
    const {
        visits,
        visitsPagination,
        stats,
        blockedIps,
        whitelist,
        isLoading,
        fetchStats,
        fetchVisits,
        fetchBlockedIps,
        fetchWhitelist,
        blockIp,
        unblockIp,
        addToWhitelist,
        removeFromWhitelist,
        blockFromWhitelist,
        isBlocked,
    } = useIpManagement();

    const [activeTab, setActiveTab] = useState('visits');
    const [search, setSearch] = useState('');
    const [period, setPeriod] = useState('all');
    const [sort, setSort] = useState('');
    const [whitelistSort, setWhitelistSort] = useState('');

    // Visits tab — inline block form
    const [blockingIp, setBlockingIp] = useState(null);
    const [blockReason, setBlockReason] = useState('');
    const [blockPassword, setBlockPassword] = useState('');
    const [needsPassword, setNeedsPassword] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Blocked tab — manual block form
    const [manualBlockIp, setManualBlockIp] = useState('');
    const [manualBlockReason, setManualBlockReason] = useState('');

    // Whitelist tab — add form
    const [manualWhitelistIp, setManualWhitelistIp] = useState('');
    const [manualWhitelistLabel, setManualWhitelistLabel] = useState('');

    // Whitelist tab — action forms (remove / block) — always require password
    const [whitelistAction, setWhitelistAction] = useState(null);
    const [whitelistActionReason, setWhitelistActionReason] = useState('');
    const [whitelistActionPassword, setWhitelistActionPassword] = useState('');

    // ===================================
    // INITIAL LOAD
    // ===================================

    useEffect(() => {
        fetchStats();
        fetchVisits('', '', 1);
        fetchBlockedIps();
        fetchWhitelist();
    }, [fetchStats, fetchVisits, fetchBlockedIps, fetchWhitelist]);

    // ===================================
    // HANDLERS — VISITS TAB
    // ===================================

    const handleBlock = async (ipAddress, reason, password) => {
        if (!needsPassword && !window.confirm(t('siteSettingsAdmin.ipManagement.confirmBlock', { ip: ipAddress }))) return;
        const result = await blockIp(ipAddress, reason, password);
        if (result.success) {
            setBlockingIp(null);
            setBlockReason('');
            setBlockPassword('');
            setNeedsPassword(false);
        } else if (result.requiresPassword) {
            setNeedsPassword(true);
        }
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await Promise.all([fetchStats(), fetchVisits(search, period, visitsPagination.page, sort), fetchBlockedIps(), fetchWhitelist()]);
        setIsRefreshing(false);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchVisits(search, period, 1, sort);
    };

    const handlePeriodChange = (newPeriod) => {
        setPeriod(newPeriod);
        fetchVisits(search, newPeriod, 1, sort);
    };

    const handleSortChange = (newSort) => {
        const nextSort = sort === newSort ? '' : newSort;
        setSort(nextSort);
        fetchVisits(search, period, 1, nextSort);
    };

    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > visitsPagination.totalPages) return;
        fetchVisits(search, period, newPage, sort);
    };

    // ===================================
    // HANDLERS — BLOCKED TAB
    // ===================================

    const handleManualBlock = (e) => {
        e.preventDefault();
        if (!manualBlockIp.trim()) return;
        handleManualBlockSubmit(manualBlockIp.trim(), manualBlockReason);
    };

    const handleManualBlockSubmit = async (ip, reason) => {
        if (!window.confirm(t('siteSettingsAdmin.ipManagement.confirmBlock', { ip }))) return;
        const result = await blockIp(ip, reason);
        if (result.success) {
            setManualBlockIp('');
            setManualBlockReason('');
        }
    };

    const handleUnblock = async (id) => {
        if (!window.confirm(t('siteSettingsAdmin.ipManagement.confirmUnblock'))) return;
        await unblockIp(id);
    };

    // ===================================
    // HANDLERS — WHITELIST TAB
    // ===================================

    const handleAddToWhitelist = async (e) => {
        e.preventDefault();
        if (!manualWhitelistIp.trim()) return;
        const success = await addToWhitelist(manualWhitelistIp.trim(), manualWhitelistLabel.trim());
        if (success) {
            setManualWhitelistIp('');
            setManualWhitelistLabel('');
        }
    };

    const resetWhitelistAction = () => {
        setWhitelistAction(null);
        setWhitelistActionReason('');
        setWhitelistActionPassword('');
    };

    const handleWhitelistRemove = (entry) => {
        setWhitelistAction({ id: entry.id, type: 'remove' });
        setWhitelistActionPassword('');
    };

    const handleWhitelistBlock = (entry) => {
        setWhitelistAction({ id: entry.id, type: 'block' });
        setWhitelistActionReason('');
        setWhitelistActionPassword('');
    };

    const handleWhitelistActionConfirm = async () => {
        if (!whitelistAction || !whitelistActionPassword.trim()) return;

        let result;
        if (whitelistAction.type === 'remove') {
            result = await removeFromWhitelist(whitelistAction.id, whitelistActionPassword);
        } else {
            result = await blockFromWhitelist(whitelistAction.id, whitelistActionReason, whitelistActionPassword);
        }

        if (result.success) {
            resetWhitelistAction();
        }
    };

    // ===================================
    // FORMAT
    // ===================================

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('bg-BG', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const truncateUA = (ua, max = 60) => {
        if (!ua) return '-';
        return ua.length > max ? ua.substring(0, max) + '...' : ua;
    };

    const periods = [
        { key: 'today', label: t('siteSettingsAdmin.ipManagement.periodToday') },
        { key: 'week', label: t('siteSettingsAdmin.ipManagement.periodWeek') },
        { key: 'month', label: t('siteSettingsAdmin.ipManagement.periodMonth') },
        { key: 'all', label: t('siteSettingsAdmin.ipManagement.periodAll') },
    ];

    const handleWhitelistSortChange = (newSort) => {
        setWhitelistSort((prev) => (prev === newSort ? '' : newSort));
    };

    const sortedWhitelist = [...whitelist].sort((a, b) => {
        if (whitelistSort === 'ip-asc') return a.ipAddress.localeCompare(b.ipAddress);
        if (whitelistSort === 'ip-desc') return b.ipAddress.localeCompare(a.ipAddress);
        if (whitelistSort === 'label-asc') return (a.label || '').localeCompare(b.label || '');
        if (whitelistSort === 'label-desc') return (b.label || '').localeCompare(a.label || '');
        if (whitelistSort === 'system') return (b.isSystem ? 1 : 0) - (a.isSystem ? 1 : 0);
        if (whitelistSort === 'custom') return (a.isSystem ? 1 : 0) - (b.isSystem ? 1 : 0);
        return 0;
    });

    // ===================================
    // RENDER
    // ===================================

    return (
        <div className="imc">
            {/* STATS CARDS */}
            {stats && (
                <div className="imc-stats">
                    <div className="imc-stat-card imc-stat-card--today">
                        <div className="imc-stat-icon">
                            <Eye size={18} />
                        </div>
                        <div className="imc-stat-data">
                            <span className="imc-stat-value">{stats.today?.uniqueIps ?? 0}</span>
                            <span className="imc-stat-label">{t('siteSettingsAdmin.ipManagement.statsToday')}</span>
                        </div>
                        <div className="imc-stat-visits">{stats.today?.totalVisits ?? 0} {t('siteSettingsAdmin.ipManagement.statsVisits')}</div>
                    </div>
                    <div className="imc-stat-card imc-stat-card--week">
                        <div className="imc-stat-icon">
                            <Calendar size={18} />
                        </div>
                        <div className="imc-stat-data">
                            <span className="imc-stat-value">{stats.week?.uniqueIps ?? 0}</span>
                            <span className="imc-stat-label">{t('siteSettingsAdmin.ipManagement.statsWeek')}</span>
                        </div>
                        <div className="imc-stat-visits">{stats.week?.totalVisits ?? 0} {t('siteSettingsAdmin.ipManagement.statsVisits')}</div>
                    </div>
                    <div className="imc-stat-card imc-stat-card--month">
                        <div className="imc-stat-icon">
                            <Globe size={18} />
                        </div>
                        <div className="imc-stat-data">
                            <span className="imc-stat-value">{stats.month?.uniqueIps ?? 0}</span>
                            <span className="imc-stat-label">{t('siteSettingsAdmin.ipManagement.statsMonth')}</span>
                        </div>
                        <div className="imc-stat-visits">{stats.month?.totalVisits ?? 0} {t('siteSettingsAdmin.ipManagement.statsVisits')}</div>
                    </div>
                </div>
            )}

            {/* TABS */}
            <div className="imc-tabs-row">
                <div className="imc-tabs">
                    <button
                        className={`imc-tab ${activeTab === 'visits' ? 'imc-tab--active' : ''}`}
                        onClick={() => setActiveTab('visits')}
                    >
                        {t('siteSettingsAdmin.ipManagement.tabVisits')}
                        <span className="imc-tab-badge">{visitsPagination.total || visits.length}</span>
                    </button>
                    <button
                        className={`imc-tab ${activeTab === 'blocked' ? 'imc-tab--active' : ''}`}
                        onClick={() => setActiveTab('blocked')}
                    >
                        {t('siteSettingsAdmin.ipManagement.tabBlocked')}
                        {blockedIps.length > 0 && <span className="imc-tab-badge imc-tab-badge--red">{blockedIps.length}</span>}
                    </button>
                    <button
                        className={`imc-tab ${activeTab === 'whitelist' ? 'imc-tab--active' : ''}`}
                        onClick={() => setActiveTab('whitelist')}
                    >
                        {t('siteSettingsAdmin.ipManagement.tabWhitelist')}
                        <span className="imc-tab-badge imc-tab-badge--green">{whitelist.length}</span>
                    </button>
                </div>
                <button
                    className={`imc-refresh-btn ${isRefreshing ? 'imc-refresh-btn--spinning' : ''}`}
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    title={t('siteSettingsAdmin.ipManagement.refresh')}
                >
                    <RefreshCw size={16} />
                </button>
            </div>

            {/* ═══════════════════════════════════ */}
            {/* VISITS TAB                          */}
            {/* ═══════════════════════════════════ */}
            {activeTab === 'visits' && (
                <div className="imc-panel">
                    {/* Period filter + Sort */}
                    <div className="imc-toolbar">
                        <div className="imc-filters">
                            {periods.map((p) => (
                                <button
                                    key={p.key}
                                    className={`imc-filter-btn ${period === p.key ? 'imc-filter-btn--active' : ''}`}
                                    onClick={() => handlePeriodChange(p.key)}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                        <div className="imc-sort">
                            <button
                                className={`imc-sort-btn ${sort === '' || sort === 'recent' ? 'imc-sort-btn--active' : ''}`}
                                onClick={() => handleSortChange('recent')}
                                title={t('siteSettingsAdmin.ipManagement.sortRecent')}
                            >
                                <Calendar size={14} />
                                {t('siteSettingsAdmin.ipManagement.sortRecent')}
                            </button>
                            <button
                                className={`imc-sort-btn ${sort === 'visits-desc' ? 'imc-sort-btn--active' : ''}`}
                                onClick={() => handleSortChange('visits-desc')}
                                title={t('siteSettingsAdmin.ipManagement.sortMost')}
                            >
                                <ArrowDown size={14} />
                                {t('siteSettingsAdmin.ipManagement.visits')}
                            </button>
                            <button
                                className={`imc-sort-btn ${sort === 'visits-asc' ? 'imc-sort-btn--active' : ''}`}
                                onClick={() => handleSortChange('visits-asc')}
                                title={t('siteSettingsAdmin.ipManagement.sortLeast')}
                            >
                                <ArrowUp size={14} />
                                {t('siteSettingsAdmin.ipManagement.visits')}
                            </button>
                        </div>
                    </div>

                    <form className="imc-search" onSubmit={handleSearch}>
                        <input
                            type="text"
                            className="imc-search-input"
                            placeholder={t('siteSettingsAdmin.ipManagement.searchPlaceholder')}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <button type="submit" className="imc-search-btn">
                            <Search size={18} />
                        </button>
                    </form>

                    {isLoading ? (
                        <div className="imc-loading">{t('siteSettingsAdmin.loading')}</div>
                    ) : visits.length > 0 ? (
                        <>
                            <div className="imc-table-wrapper">
                                <table className="imc-table">
                                    <thead>
                                        <tr>
                                            <th>{t('siteSettingsAdmin.ipManagement.ip')}</th>
                                            <th>{t('siteSettingsAdmin.ipManagement.visits')}</th>
                                            <th>{t('siteSettingsAdmin.ipManagement.lastVisit')}</th>
                                            <th>{t('siteSettingsAdmin.ipManagement.browser')}</th>
                                            <th>{t('siteSettingsAdmin.ipManagement.actions')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {visits.map((visit) => (
                                            <tr key={visit.id} className={visit.isWhitelisted ? 'imc-row--whitelisted' : ''}>
                                                <td className="imc-cell-ip">
                                                    <span className="imc-ip">{visit.ipAddress}</span>
                                                    {visit.isWhitelisted && (
                                                        <span className="imc-shield" title={t('siteSettingsAdmin.ipManagement.whitelisted')}>
                                                            <ShieldCheck size={16} />
                                                        </span>
                                                    )}
                                                    {isBlocked(visit.ipAddress) && (
                                                        <span className="imc-blocked-badge">{t('siteSettingsAdmin.ipManagement.statusBlocked')}</span>
                                                    )}
                                                </td>
                                                <td className="imc-cell-count">{visit.visitCount}</td>
                                                <td className="imc-cell-date">{formatDate(visit.lastVisitedAt)}</td>
                                                <td className="imc-cell-ua" title={visit.userAgent || ''}>
                                                    {truncateUA(visit.userAgent)}
                                                </td>
                                                <td className="imc-cell-actions">
                                                    {isBlocked(visit.ipAddress) ? (
                                                        <span className="imc-already-blocked">{t('siteSettingsAdmin.ipManagement.statusBlocked')}</span>
                                                    ) : blockingIp === visit.ipAddress ? (
                                                        <div className="imc-block-form">
                                                            <input
                                                                type="text"
                                                                className="imc-reason-input"
                                                                placeholder={t('siteSettingsAdmin.ipManagement.reasonPlaceholder')}
                                                                value={blockReason}
                                                                onChange={(e) => setBlockReason(e.target.value)}
                                                            />
                                                            {needsPassword && (
                                                                <input
                                                                    type="password"
                                                                    className="imc-password-input"
                                                                    placeholder={t('siteSettingsAdmin.ipManagement.passwordPlaceholder')}
                                                                    value={blockPassword}
                                                                    onChange={(e) => setBlockPassword(e.target.value)}
                                                                    autoComplete="off"
                                                                />
                                                            )}
                                                            <button className="imc-icon-btn imc-icon-btn--confirm" onClick={() => handleBlock(visit.ipAddress, blockReason, blockPassword)} disabled={needsPassword && !blockPassword.trim()} title={t('siteSettingsAdmin.ipManagement.confirm')}>
                                                                <Check size={15} />
                                                            </button>
                                                            <button className="imc-icon-btn imc-icon-btn--cancel" onClick={() => { setBlockingIp(null); setBlockReason(''); setBlockPassword(''); setNeedsPassword(false); }} title={t('admin.cancel')}>
                                                                <X size={15} />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="imc-actions-group">
                                                            {!visit.isWhitelisted && (
                                                                <button className="imc-icon-btn imc-icon-btn--whitelist" onClick={() => addToWhitelist(visit.ipAddress)} title={t('siteSettingsAdmin.ipManagement.addToWhitelist')}>
                                                                    <ShieldCheck size={15} />
                                                                </button>
                                                            )}
                                                            <button className="imc-icon-btn imc-icon-btn--block" onClick={() => setBlockingIp(visit.ipAddress)} title={t('siteSettingsAdmin.ipManagement.block')}>
                                                                <Ban size={15} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {visitsPagination.totalPages > 1 && (
                                <div className="imc-pagination">
                                    <button
                                        className="imc-page-btn"
                                        onClick={() => handlePageChange(visitsPagination.page - 1)}
                                        disabled={visitsPagination.page <= 1}
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    <span className="imc-page-info">
                                        {visitsPagination.page} / {visitsPagination.totalPages}
                                    </span>
                                    <button
                                        className="imc-page-btn"
                                        onClick={() => handlePageChange(visitsPagination.page + 1)}
                                        disabled={visitsPagination.page >= visitsPagination.totalPages}
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                    <span className="imc-page-total">
                                        ({visitsPagination.total} {t('siteSettingsAdmin.ipManagement.totalRecords')})
                                    </span>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="imc-empty">{t('siteSettingsAdmin.ipManagement.noVisits')}</div>
                    )}
                </div>
            )}

            {/* ═══════════════════════════════════ */}
            {/* BLOCKED TAB                         */}
            {/* ═══════════════════════════════════ */}
            {activeTab === 'blocked' && (
                <div className="imc-panel">
                    <form className="imc-manual-form" onSubmit={handleManualBlock}>
                        <div className="imc-manual-form-title">{t('siteSettingsAdmin.ipManagement.manualBlock')}</div>
                        <div className="imc-manual-form-row">
                            <input
                                type="text"
                                className="imc-manual-input"
                                placeholder={t('siteSettingsAdmin.ipManagement.ipPlaceholder')}
                                value={manualBlockIp}
                                onChange={(e) => setManualBlockIp(e.target.value)}
                            />
                            <input
                                type="text"
                                className="imc-manual-input imc-manual-input--reason"
                                placeholder={t('siteSettingsAdmin.ipManagement.reasonPlaceholder')}
                                value={manualBlockReason}
                                onChange={(e) => setManualBlockReason(e.target.value)}
                            />
                            <button type="submit" className="imc-icon-btn imc-icon-btn--block" disabled={!manualBlockIp.trim()} title={t('siteSettingsAdmin.ipManagement.block')}>
                                <Ban size={16} />
                            </button>
                        </div>
                    </form>

                    {blockedIps.length > 0 ? (
                        <div className="imc-table-wrapper">
                            <table className="imc-table">
                                <thead>
                                    <tr>
                                        <th>{t('siteSettingsAdmin.ipManagement.ip')}</th>
                                        <th>{t('siteSettingsAdmin.ipManagement.reason')}</th>
                                        <th>{t('siteSettingsAdmin.ipManagement.blockedAt')}</th>
                                        <th>{t('siteSettingsAdmin.ipManagement.actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {blockedIps.map((entry) => (
                                        <tr key={entry.id}>
                                            <td className="imc-cell-ip">
                                                <span className="imc-ip">{entry.ipAddress}</span>
                                            </td>
                                            <td className="imc-cell-reason">{entry.reason || '-'}</td>
                                            <td className="imc-cell-date">{formatDate(entry.blockedAt)}</td>
                                            <td className="imc-cell-actions">
                                                <button className="imc-icon-btn imc-icon-btn--unblock" onClick={() => handleUnblock(entry.id)} title={t('siteSettingsAdmin.ipManagement.unblock')}>
                                                    <LockOpen size={15} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="imc-empty">{t('siteSettingsAdmin.ipManagement.noBlocked')}</div>
                    )}
                </div>
            )}

            {/* ═══════════════════════════════════ */}
            {/* WHITELIST TAB                       */}
            {/* ═══════════════════════════════════ */}
            {activeTab === 'whitelist' && (
                <div className="imc-panel">
                    <form className="imc-manual-form" onSubmit={handleAddToWhitelist}>
                        <div className="imc-manual-form-title">{t('siteSettingsAdmin.ipManagement.addToWhitelist')}</div>
                        <div className="imc-manual-form-row">
                            <input
                                type="text"
                                className="imc-manual-input"
                                placeholder={t('siteSettingsAdmin.ipManagement.ipPlaceholder')}
                                value={manualWhitelistIp}
                                onChange={(e) => setManualWhitelistIp(e.target.value)}
                            />
                            <input
                                type="text"
                                className="imc-manual-input imc-manual-input--reason"
                                placeholder={t('siteSettingsAdmin.ipManagement.labelPlaceholder')}
                                value={manualWhitelistLabel}
                                onChange={(e) => setManualWhitelistLabel(e.target.value)}
                            />
                            <button type="submit" className="imc-icon-btn imc-icon-btn--whitelist" disabled={!manualWhitelistIp.trim()} title={t('siteSettingsAdmin.ipManagement.add')}>
                                <Plus size={16} />
                            </button>
                        </div>
                    </form>

                    {whitelist.length > 0 ? (
                        <>
                        <div className="imc-sort">
                            <button
                                className={`imc-sort-btn ${whitelistSort === 'ip-asc' ? 'imc-sort-btn--active' : ''}`}
                                onClick={() => handleWhitelistSortChange('ip-asc')}
                                title="IP A→Z"
                            >
                                <ArrowUp size={14} /> IP
                            </button>
                            <button
                                className={`imc-sort-btn ${whitelistSort === 'ip-desc' ? 'imc-sort-btn--active' : ''}`}
                                onClick={() => handleWhitelistSortChange('ip-desc')}
                                title="IP Z→A"
                            >
                                <ArrowDown size={14} /> IP
                            </button>
                            <button
                                className={`imc-sort-btn ${whitelistSort === 'label-asc' ? 'imc-sort-btn--active' : ''}`}
                                onClick={() => handleWhitelistSortChange('label-asc')}
                                title={t('siteSettingsAdmin.ipManagement.label') + ' A→Z'}
                            >
                                <ArrowUp size={14} /> {t('siteSettingsAdmin.ipManagement.label')}
                            </button>
                            <button
                                className={`imc-sort-btn ${whitelistSort === 'system' ? 'imc-sort-btn--active' : ''}`}
                                onClick={() => handleWhitelistSortChange('system')}
                                title={t('siteSettingsAdmin.ipManagement.system')}
                            >
                                <ShieldCheck size={14} /> {t('siteSettingsAdmin.ipManagement.system')}
                            </button>
                        </div>
                        <div className="imc-table-wrapper">
                            <table className="imc-table">
                                <thead>
                                    <tr>
                                        <th>{t('siteSettingsAdmin.ipManagement.ip')}</th>
                                        <th>{t('siteSettingsAdmin.ipManagement.label')}</th>
                                        <th>{t('siteSettingsAdmin.ipManagement.type')}</th>
                                        <th>{t('siteSettingsAdmin.ipManagement.actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedWhitelist.map((entry) => (
                                        <tr key={entry.id} className={entry.isSystem ? 'imc-row--system' : ''}>
                                            <td className="imc-cell-ip">
                                                <span className="imc-ip">{entry.ipAddress}</span>
                                                {entry.isSystem && (
                                                    <span className="imc-shield" title={t('siteSettingsAdmin.ipManagement.systemIp')}>
                                                        <ShieldCheck size={16} />
                                                    </span>
                                                )}
                                            </td>
                                            <td className="imc-cell-label">{entry.label || '-'}</td>
                                            <td className="imc-cell-type">
                                                {entry.isSystem ? (
                                                    <span className="imc-system-badge">{t('siteSettingsAdmin.ipManagement.system')}</span>
                                                ) : (
                                                    <span className="imc-custom-badge">{t('siteSettingsAdmin.ipManagement.custom')}</span>
                                                )}
                                            </td>
                                            <td className="imc-cell-actions">
                                                {whitelistAction?.id === entry.id ? (
                                                    <div className="imc-action-form">
                                                        {whitelistAction.type === 'block' && (
                                                            <input
                                                                type="text"
                                                                className="imc-reason-input"
                                                                placeholder={t('siteSettingsAdmin.ipManagement.reasonPlaceholder')}
                                                                value={whitelistActionReason}
                                                                onChange={(e) => setWhitelistActionReason(e.target.value)}
                                                            />
                                                        )}
                                                        <input
                                                            type="password"
                                                            className="imc-password-input"
                                                            placeholder={t('siteSettingsAdmin.ipManagement.passwordPlaceholder')}
                                                            value={whitelistActionPassword}
                                                            onChange={(e) => setWhitelistActionPassword(e.target.value)}
                                                            autoComplete="off"
                                                        />
                                                        <button
                                                            className="imc-icon-btn imc-icon-btn--confirm"
                                                            onClick={handleWhitelistActionConfirm}
                                                            disabled={!whitelistActionPassword.trim()}
                                                            title={t('siteSettingsAdmin.ipManagement.confirm')}
                                                        >
                                                            <Check size={15} />
                                                        </button>
                                                        <button className="imc-icon-btn imc-icon-btn--cancel" onClick={resetWhitelistAction} title={t('admin.cancel')}>
                                                            <X size={15} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="imc-actions-group">
                                                        <button className="imc-icon-btn imc-icon-btn--remove" onClick={() => handleWhitelistRemove(entry)} title={t('siteSettingsAdmin.ipManagement.remove')}>
                                                            <Trash2 size={15} />
                                                        </button>
                                                        <button className="imc-icon-btn imc-icon-btn--block" onClick={() => handleWhitelistBlock(entry)} title={t('siteSettingsAdmin.ipManagement.block')}>
                                                            <Ban size={15} />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        </>
                    ) : (
                        <div className="imc-empty">{t('siteSettingsAdmin.ipManagement.noWhitelist')}</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default IpManagementConfig;
