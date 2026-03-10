import { useTranslation } from 'react-i18next';
import { LocalizedLink as Link } from '../LocalizedLink/LocalizedLink';
import { ArrowLeft, Settings } from 'lucide-react';
import { toast } from 'react-toastify';
import { useSiteSettingsAdminContext } from '../contexts/SiteSettingsAdminContext';
import SettingsAdminSection from './SettingsAdminSection/SettingsAdminSection';
import SettingsAdminToggle from './SettingsAdminToggle/SettingsAdminToggle';
import SnowfallConfig from './SnowfallConfig/SnowfallConfig';
import GreetingConfig from './GreetingConfig/GreetingConfig';
import ArticleLimitConfig from './ArticleLimitConfig/ArticleLimitConfig';
import IpManagementConfig from './IpManagementConfig/IpManagementConfig';
import { IpManagementProvider } from '../contexts/IpManagementContext';
import ScrollToTop from '../ScrollToTop/ScrollToTop';
import './siteSettingsAdmin.css';

const SiteSettingsAdmin = () => {
    const { t } = useTranslation('admin');
    const { settings, isLoading, loadingKeys, updateSetting } = useSiteSettingsAdminContext();

    const handleToggle = async (key, value) => {
        const result = await updateSetting(key, value);
        if (result.success) {
            toast.success(t('siteSettingsAdmin.saveSuccess'));
        } else {
            toast.error(t('siteSettingsAdmin.saveError'));
        }
    };

    if (isLoading) {
        return (
            <div className="ssa-page">
                <div className="ssa-container">
                    <div className="ssa-loading">
                        <div className="ssa-loading-spinner" />
                        <p className="ssa-loading-text">{t('siteSettingsAdmin.loading')}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="ssa-page">
            {/* Background pattern */}
            <div className="ssa-bg-pattern" />
            <div className="ssa-bg-corner ssa-bg-corner--tl" />
            <div className="ssa-bg-corner ssa-bg-corner--br" />

            <div className="ssa-container">
                {/* Back link */}
                <Link to="/profile" className="ssa-back-link">
                    <ArrowLeft size={16} />
                    <span>{t('siteSettingsAdmin.backToProfile')}</span>
                </Link>

                {/* Page header */}
                <div className="ssa-header">
                    <div className="ssa-header-icon">
                        <Settings size={26} />
                    </div>
                    <div className="ssa-header-text">
                        <h1 className="ssa-title">{t('siteSettingsAdmin.title')}</h1>
                        <p className="ssa-subtitle">{t('siteSettingsAdmin.subtitle')}</p>
                    </div>
                </div>

                {/* Settings sections */}
                <div className="ssa-sections">
                    {/* Snowfall Section */}
                    <SettingsAdminSection
                        title={t('siteSettingsAdmin.snowfall')}
                        icon="❄️"
                        description={t('siteSettingsAdmin.snowfallDesc')}
                    >
                        <SettingsAdminToggle
                            settingKey="snowfall_enabled"
                            title={t('siteSettingsAdmin.snowfall')}
                            description={t('siteSettingsAdmin.snowfallDesc')}
                            icon="❄️"
                            value={settings.snowfall_enabled || false}
                            onChange={handleToggle}
                            isLoading={loadingKeys.snowfall_enabled || false}
                        />
                        {settings.snowfall_enabled && <SnowfallConfig />}
                    </SettingsAdminSection>

                    {/* Article Limit Section */}
                    <SettingsAdminSection
                        title={t('siteSettingsAdmin.articleLimit')}
                        icon="📖"
                        description={t('siteSettingsAdmin.articleLimitDesc')}
                    >
                        <SettingsAdminToggle
                            settingKey="article_limit_enabled"
                            title={t('siteSettingsAdmin.articleLimit')}
                            description={t('siteSettingsAdmin.articleLimitDesc')}
                            icon="📖"
                            value={settings.article_limit_enabled ?? true}
                            onChange={handleToggle}
                            isLoading={loadingKeys.article_limit_enabled || false}
                        />
                        {settings.article_limit_enabled && <ArticleLimitConfig />}
                    </SettingsAdminSection>

                    {/* Christmas Greeting Section */}
                    <SettingsAdminSection
                        title={t('siteSettingsAdmin.christmasGreeting')}
                        icon="🎅"
                        description={t('siteSettingsAdmin.christmasGreetingDesc')}
                    >
                        <SettingsAdminToggle
                            settingKey="christmas_greeting_enabled"
                            title={t('siteSettingsAdmin.christmasGreeting')}
                            description={t('siteSettingsAdmin.christmasGreetingDesc')}
                            icon="🎅"
                            value={settings.christmas_greeting_enabled || false}
                            onChange={handleToggle}
                            isLoading={loadingKeys.christmas_greeting_enabled || false}
                        />
                        {settings.christmas_greeting_enabled && <GreetingConfig />}
                    </SettingsAdminSection>

                    {/* IP Management Section */}
                    <SettingsAdminSection
                        title={t('siteSettingsAdmin.ipManagement.title')}
                        icon="🛡️"
                        description={t('siteSettingsAdmin.ipManagement.description')}
                    >
                        <IpManagementProvider>
                            <IpManagementConfig />
                        </IpManagementProvider>
                    </SettingsAdminSection>
                </div>
            </div>

            <ScrollToTop />
        </div>
    );
};

export default SiteSettingsAdmin;
