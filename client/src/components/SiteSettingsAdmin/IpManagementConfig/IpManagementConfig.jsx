import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Ban, ShieldOff, ShieldCheck, Trash2, Plus, Search, Check, X, Lock, LockOpen } from 'lucide-react';
import { useIpManagement } from '../../contexts/IpManagementContext';
import './ipManagementConfig.css';

const IpManagementConfig = () => {
    const { t } = useTranslation('admin');
    const {
        visits,
        blockedIps,
        whitelist,
        isLoading,
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

    // Visits tab — inline block form
    const [blockingIp, setBlockingIp] = useState(null);
    const [blockReason, setBlockReason] = useState('');

    // Blocked tab — manual block form
    const [manualBlockIp, setManualBlockIp] = useState('');
    const [manualBlockReason, setManualBlockReason] = useState('');

    // Whitelist tab — add form
    const [manualWhitelistIp, setManualWhitelistIp] = useState('');
    const [manualWhitelistLabel, setManualWhitelistLabel] = useState('');

    // Whitelist tab — action forms (remove / block) — always require password
    const [whitelistAction, setWhitelistAction] = useState(null); // { id, type: 'remove' | 'block' }
    const [whitelistActionReason, setWhitelistActionReason] = useState('');
    const [whitelistActionPassword, setWhitelistActionPassword] = useState('');

    // ===================================
    // INITIAL LOAD
    // ===================================

    useEffect(() => {
        fetchVisits();
        fetchBlockedIps();
        fetchWhitelist();
    }, [fetchVisits, fetchBlockedIps, fetchWhitelist]);

    // ===================================
    // HANDLERS — VISITS TAB
    // ===================================

    const handleBlock = async (ipAddress, reason) => {
        if (!window.confirm(t('siteSettingsAdmin.ipManagement.confirmBlock', { ip: ipAddress }))) return;
        const result = await blockIp(ipAddress, reason);
        if (result.success) {
            setBlockingIp(null);
            setBlockReason('');
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchVisits(search);
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

    // ===================================
    // RENDER
    // ===================================

    return (
        <div className="imc">
            {/* TABS */}
            <div className="imc-tabs">
                <button
                    className={`imc-tab ${activeTab === 'visits' ? 'imc-tab--active' : ''}`}
                    onClick={() => setActiveTab('visits')}
                >
                    {t('siteSettingsAdmin.ipManagement.tabVisits')}
                    <span className="imc-tab-badge">{visits.length}</span>
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

            {/* ═══════════════════════════════════ */}
            {/* VISITS TAB                          */}
            {/* ═══════════════════════════════════ */}
            {activeTab === 'visits' && (
                <div className="imc-panel">
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
                                                        <button className="imc-icon-btn imc-icon-btn--confirm" onClick={() => handleBlock(visit.ipAddress, blockReason)} title={t('siteSettingsAdmin.ipManagement.confirm')}>
                                                            <Check size={15} />
                                                        </button>
                                                        <button className="imc-icon-btn imc-icon-btn--cancel" onClick={() => { setBlockingIp(null); setBlockReason(''); }} title={t('admin.cancel')}>
                                                            <X size={15} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button className="imc-icon-btn imc-icon-btn--block" onClick={() => setBlockingIp(visit.ipAddress)} title={t('siteSettingsAdmin.ipManagement.block')}>
                                                        <Ban size={15} />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
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
                                    {whitelist.map((entry) => (
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
                    ) : (
                        <div className="imc-empty">{t('siteSettingsAdmin.ipManagement.noWhitelist')}</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default IpManagementConfig;
