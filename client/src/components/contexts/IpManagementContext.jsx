import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useAuthContext } from './UserContext';
import ipManagementServiceFactory from '../Services/ipManagementServiceFactory';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

const IpManagementContext = createContext();

export const IpManagementProvider = ({ children }) => {
    const { token, isAdmin } = useAuthContext();
    const { t } = useTranslation('admin');

    const ipService = useMemo(() => ipManagementServiceFactory(token), [token]);

    const [visits, setVisits] = useState([]);
    const [blockedIps, setBlockedIps] = useState([]);
    const [whitelist, setWhitelist] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // ===================================
    // VISITS
    // ===================================

    const fetchVisits = useCallback(async (search = '') => {
        setIsLoading(true);
        try {
            const params = { limit: 100 };
            if (search) params.search = search;
            const result = await ipService.getVisits(params);
            setVisits(result?.visits || []);
        } catch (err) {
            console.error('Failed to fetch IP visits:', err);
        } finally {
            setIsLoading(false);
        }
    }, [ipService]);

    // ===================================
    // BLOCKED
    // ===================================

    const fetchBlockedIps = useCallback(async () => {
        try {
            const result = await ipService.getBlocked();
            setBlockedIps(result?.blockedIps || []);
        } catch (err) {
            console.error('Failed to fetch blocked IPs:', err);
        }
    }, [ipService]);

    const blockIp = useCallback(async (ipAddress, reason, password) => {
        if (!isAdmin) {
            toast.error('Unauthorized');
            return { success: false };
        }
        try {
            await ipService.blockIp(ipAddress, reason || null, password || null);
            toast.success(t('siteSettingsAdmin.ipManagement.blocked'));
            await Promise.all([fetchVisits(), fetchBlockedIps(), fetchWhitelist()]);
            return { success: true };
        } catch (err) {
            const msg = err?.message || '';
            if (msg.includes('Password is required')) {
                return { success: false, requiresPassword: true };
            } else if (msg.includes('Invalid password')) {
                toast.error(t('siteSettingsAdmin.ipManagement.invalidPassword'));
                return { success: false };
            } else if (msg.includes('already blocked')) {
                toast.error(t('siteSettingsAdmin.ipManagement.alreadyBlocked'));
            } else if (msg.includes('Invalid IP')) {
                toast.error(t('siteSettingsAdmin.ipManagement.invalidIp'));
            } else {
                toast.error(t('siteSettingsAdmin.ipManagement.blockError'));
            }
            return { success: false };
        }
    }, [isAdmin, ipService, fetchVisits, fetchBlockedIps, t]);

    const unblockIp = useCallback(async (id, password) => {
        try {
            await ipService.unblockIp(id, password || null);
            toast.success(t('siteSettingsAdmin.ipManagement.unblocked'));
            await Promise.all([fetchBlockedIps(), fetchVisits()]);
            return true;
        } catch (err) {
            const msg = err?.message || '';
            if (msg.includes('Invalid password')) {
                toast.error(t('siteSettingsAdmin.ipManagement.invalidPassword'));
            } else {
                toast.error(t('siteSettingsAdmin.ipManagement.unblockError'));
            }
            return false;
        }
    }, [ipService, fetchBlockedIps, fetchVisits, t]);

    // ===================================
    // WHITELIST
    // ===================================

    const fetchWhitelist = useCallback(async () => {
        try {
            const result = await ipService.getWhitelist();
            setWhitelist(result?.whitelist || []);
        } catch (err) {
            console.error('Failed to fetch whitelist:', err);
        }
    }, [ipService]);

    const addToWhitelist = useCallback(async (ipAddress, label) => {
        if (!isAdmin) {
            toast.error('Unauthorized');
            return false;
        }
        try {
            await ipService.addToWhitelist(ipAddress, label || null);
            toast.success(t('siteSettingsAdmin.ipManagement.whitelistAdded'));
            await Promise.all([fetchWhitelist(), fetchBlockedIps(), fetchVisits()]);
            return true;
        } catch (err) {
            const msg = err?.message || '';
            if (msg.includes('already whitelisted')) {
                toast.error(t('siteSettingsAdmin.ipManagement.alreadyWhitelisted'));
            } else if (msg.includes('Invalid IP')) {
                toast.error(t('siteSettingsAdmin.ipManagement.invalidIp'));
            } else {
                toast.error(t('siteSettingsAdmin.ipManagement.whitelistAddError'));
            }
            return false;
        }
    }, [isAdmin, ipService, fetchWhitelist, fetchBlockedIps, fetchVisits, t]);

    const removeFromWhitelist = useCallback(async (id, password) => {
        try {
            await ipService.removeFromWhitelist(id, password || null);
            toast.success(t('siteSettingsAdmin.ipManagement.whitelistRemoved'));
            await fetchWhitelist();
            return { success: true };
        } catch (err) {
            const msg = err?.message || '';
            if (msg.includes('Password is required')) {
                return { success: false, requiresPassword: true };
            } else if (msg.includes('Invalid password')) {
                toast.error(t('siteSettingsAdmin.ipManagement.invalidPassword'));
                return { success: false };
            } else {
                toast.error(t('siteSettingsAdmin.ipManagement.whitelistRemoveError'));
                return { success: false };
            }
        }
    }, [ipService, fetchWhitelist, t]);

    const blockFromWhitelist = useCallback(async (id, reason, password) => {
        if (!isAdmin) {
            toast.error('Unauthorized');
            return { success: false };
        }
        try {
            await ipService.blockFromWhitelist(id, reason || null, password || null);
            toast.success(t('siteSettingsAdmin.ipManagement.whitelistBlockedSuccess'));
            await Promise.all([fetchWhitelist(), fetchBlockedIps(), fetchVisits()]);
            return { success: true };
        } catch (err) {
            const msg = err?.message || '';
            if (msg.includes('Password is required')) {
                return { success: false, requiresPassword: true };
            } else if (msg.includes('Invalid password')) {
                toast.error(t('siteSettingsAdmin.ipManagement.invalidPassword'));
                return { success: false };
            } else {
                toast.error(t('siteSettingsAdmin.ipManagement.blockError'));
                return { success: false };
            }
        }
    }, [isAdmin, ipService, fetchWhitelist, fetchBlockedIps, fetchVisits, t]);

    // ===================================
    // HELPERS
    // ===================================

    const isBlocked = useCallback((ip) => {
        return blockedIps.some((b) => b.ipAddress === ip);
    }, [blockedIps]);

    // ===================================
    // CONTEXT VALUE
    // ===================================

    const contextValue = useMemo(() => ({
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
    }), [visits, blockedIps, whitelist, isLoading, fetchVisits, fetchBlockedIps, fetchWhitelist, blockIp, unblockIp, addToWhitelist, removeFromWhitelist, blockFromWhitelist, isBlocked]);

    return (
        <IpManagementContext.Provider value={contextValue}>
            {children}
        </IpManagementContext.Provider>
    );
};

export const useIpManagement = () => {
    const context = useContext(IpManagementContext);
    if (!context) {
        throw new Error('useIpManagement must be used within IpManagementProvider');
    }
    return context;
};

export default IpManagementContext;
