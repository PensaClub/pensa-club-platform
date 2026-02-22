import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { siteSettingsServiceFactory } from '../Services/siteSettingsService';

const SiteSettingsAdminContext = createContext({});

export const SiteSettingsAdminProvider = ({ children }) => {
    const [settings, setSettings] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [loadingKeys, setLoadingKeys] = useState({});

    const siteSettingsService = siteSettingsServiceFactory();

    const fetchSettings = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await siteSettingsService.getAll();
            setSettings(result.settings || {});
        } catch (err) {
            console.error('Failed to load site settings:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const updateSetting = useCallback(async (key, value) => {
        setLoadingKeys((prev) => ({ ...prev, [key]: true }));
        try {
            const result = await siteSettingsService.update({ [key]: value });
            setSettings(result.settings || {});
            return { success: true };
        } catch (err) {
            console.error('Failed to update setting:', err);
            return { success: false, error: err.message };
        } finally {
            setLoadingKeys((prev) => ({ ...prev, [key]: false }));
        }
    }, []);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const contextValue = {
        settings,
        isLoading,
        loadingKeys,
        updateSetting,
        fetchSettings,
    };

    return (
        <SiteSettingsAdminContext.Provider value={contextValue}>
            {children}
        </SiteSettingsAdminContext.Provider>
    );
};

export const useSiteSettingsAdminContext = () => {
    return useContext(SiteSettingsAdminContext);
};

export default SiteSettingsAdminContext;
