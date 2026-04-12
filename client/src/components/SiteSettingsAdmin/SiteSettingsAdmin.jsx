import { useState, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { LocalizedLink as Link } from '../LocalizedLink/LocalizedLink';
import { ArrowLeft, Settings, Snowflake, BookOpen, Gift, Shield, Bug, MessageSquare, HardDrive, Cloud, UserCog, ScrollText } from 'lucide-react';
import { toast } from 'react-toastify';
import { useSiteSettingsAdminContext } from '../contexts/SiteSettingsAdminContext';
import SettingsAdminSection from './SettingsAdminSection/SettingsAdminSection';
import SettingsAdminToggle from './SettingsAdminToggle/SettingsAdminToggle';
import SnowfallConfig from './SnowfallConfig/SnowfallConfig';
import GreetingConfig from './GreetingConfig/GreetingConfig';
import ArticleLimitConfig from './ArticleLimitConfig/ArticleLimitConfig';
import SmsConfig from './SmsConfig/SmsConfig';
import IpManagementConfig from './IpManagementConfig/IpManagementConfig';
import { IpManagementProvider } from '../contexts/IpManagementContext';
import ErrorLogsConfig from './ErrorLogsConfig/ErrorLogsConfig';
import ScrollToTop from '../ScrollToTop/ScrollToTop';
import './siteSettingsAdmin.css';

const CloudStorageManager = lazy(() => import('./CloudStorageManager/CloudStorageManager'));
const GoogleDriveManager = lazy(() => import('./GoogleDriveManager/GoogleDriveManager'));
const UserManagement = lazy(() => import('./UserManagement/UserManagement'));
const AdminUserActionLogs = lazy(() => import('./AdminUserActionLogs/AdminUserActionLogs'));

const SiteSettingsAdmin = () => {
    const { t } = useTranslation('admin');
    const { settings, isLoading, loadingKeys, updateSetting } = useSiteSettingsAdminContext();
    const [openCard, setOpenCard] = useState(null);

    const handleToggle = async (key, value) => {
        const result = await updateSetting(key, value);
        if (result.success) {
            toast.success(t('siteSettingsAdmin.saveSuccess'));
        } else {
            toast.error(t('siteSettingsAdmin.saveError'));
        }
    };

    const toggleCard = (cardId) => {
        setOpenCard((prev) => (prev === cardId ? null : cardId));
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
            <div className="ssa-bg-grid" />
            <div className="ssa-bg-glow ssa-bg-glow--tl" />
            <div className="ssa-bg-glow ssa-bg-glow--br" />

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

                {/* Settings grid */}
                <div className="ssa-grid">
                    {/* Cloud Storage */}
                    <SettingsAdminSection
                        id="cloudStorage"
                        title={t('cloudStorage.title')}
                        description={t('cloudStorage.description')}
                        icon={<HardDrive size={24} />}
                        color="#d4a853"
                        isOpen={openCard === 'cloudStorage'}
                        onToggle={() => toggleCard('cloudStorage')}
                    >
                        <Suspense fallback={<div className="ssa-loading"><div className="ssa-loading-spinner" /></div>}>
                            <CloudStorageManager />
                        </Suspense>
                    </SettingsAdminSection>

                    {/* Google Drive */}
                    <SettingsAdminSection
                        id="googleDrive"
                        title={t('googleDrive.title')}
                        description={t('googleDrive.description')}
                        icon={<Cloud size={24} />}
                        color="#4285f4"
                        isOpen={openCard === 'googleDrive'}
                        onToggle={() => toggleCard('googleDrive')}
                    >
                        <Suspense fallback={<div className="ssa-loading"><div className="ssa-loading-spinner" /></div>}>
                            <GoogleDriveManager />
                        </Suspense>
                    </SettingsAdminSection>

                    {/* Snowfall */}
                    <SettingsAdminSection
                        id="snowfall"
                        title={t('siteSettingsAdmin.snowfall')}
                        description={t('siteSettingsAdmin.snowfallDesc')}
                        icon={<Snowflake size={24} />}
                        color="#38bdf8"
                        isOpen={openCard === 'snowfall'}
                        onToggle={() => toggleCard('snowfall')}
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

                    {/* Article Limit */}
                    <SettingsAdminSection
                        id="articleLimit"
                        title={t('siteSettingsAdmin.articleLimit')}
                        description={t('siteSettingsAdmin.articleLimitDesc')}
                        icon={<BookOpen size={24} />}
                        color="#f59e0b"
                        isOpen={openCard === 'articleLimit'}
                        onToggle={() => toggleCard('articleLimit')}
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

                    {/* Christmas Greeting */}
                    <SettingsAdminSection
                        id="christmasGreeting"
                        title={t('siteSettingsAdmin.christmasGreeting')}
                        description={t('siteSettingsAdmin.christmasGreetingDesc')}
                        icon={<Gift size={24} />}
                        color="#ef4444"
                        isOpen={openCard === 'christmasGreeting'}
                        onToggle={() => toggleCard('christmasGreeting')}
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

                    {/* SMS Settings */}
                    <SettingsAdminSection
                        id="smsSettings"
                        title={t('siteSettingsAdmin.smsConfig.title')}
                        description={t('siteSettingsAdmin.smsConfig.desc')}
                        icon={<MessageSquare size={24} />}
                        color="#0d9488"
                        isOpen={openCard === 'smsSettings'}
                        onToggle={() => toggleCard('smsSettings')}
                    >
                        <SmsConfig />
                    </SettingsAdminSection>

                    {/* IP Management */}
                    <SettingsAdminSection
                        id="ipManagement"
                        title={t('siteSettingsAdmin.ipManagement.title')}
                        description={t('siteSettingsAdmin.ipManagement.description')}
                        icon={<Shield size={24} />}
                        color="#8b5cf6"
                        isOpen={openCard === 'ipManagement'}
                        onToggle={() => toggleCard('ipManagement')}
                    >
                        <IpManagementProvider>
                            <IpManagementConfig />
                        </IpManagementProvider>
                    </SettingsAdminSection>

                    {/* User Management */}
                    <SettingsAdminSection
                        id="userManagement"
                        title={t('userManagement.title', 'Управление на потребители')}
                        description={t('userManagement.description', 'Регистрирай нови потребители или изпращай линкове за смяна на парола')}
                        icon={<UserCog size={24} />}
                        color="#06b6d4"
                        isOpen={openCard === 'userManagement'}
                        onToggle={() => toggleCard('userManagement')}
                    >
                        <Suspense fallback={<div className="ssa-loading"><div className="ssa-loading-spinner" /></div>}>
                            <UserManagement />
                        </Suspense>
                    </SettingsAdminSection>

                    {/* Admin User Action Logs (audit log) */}
                    <SettingsAdminSection
                        id="adminUserActionLogs"
                        title={t('adminUserActionLogs.title', 'Лог на админ действия')}
                        description={t('adminUserActionLogs.description', 'Преглед на всички admin действия по потребителите (1 година retention)')}
                        icon={<ScrollText size={24} />}
                        color="#a855f7"
                        isOpen={openCard === 'adminUserActionLogs'}
                        onToggle={() => toggleCard('adminUserActionLogs')}
                    >
                        <Suspense fallback={<div className="ssa-loading"><div className="ssa-loading-spinner" /></div>}>
                            <AdminUserActionLogs />
                        </Suspense>
                    </SettingsAdminSection>

                    {/* Error Logs */}
                    <SettingsAdminSection
                        id="errorLogs"
                        title={t('siteSettingsAdmin.errorLogs.title')}
                        description={t('siteSettingsAdmin.errorLogs.description')}
                        icon={<Bug size={24} />}
                        color="#ef4444"
                        isOpen={openCard === 'errorLogs'}
                        onToggle={() => toggleCard('errorLogs')}
                    >
                        <ErrorLogsConfig />
                    </SettingsAdminSection>
                </div>
            </div>

            <ScrollToTop />
        </div>
    );
};

export default SiteSettingsAdmin;
