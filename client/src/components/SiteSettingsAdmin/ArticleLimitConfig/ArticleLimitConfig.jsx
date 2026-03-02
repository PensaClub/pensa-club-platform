import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { RotateCcw, Save } from 'lucide-react';
import { useSiteSettingsAdminContext } from '../../contexts/SiteSettingsAdminContext';
import SettingsAdminSlider from '../SettingsAdminSlider/SettingsAdminSlider';
import './articleLimitConfig.css';

const DEFAULTS = {
    article_limit_max_reads: 1,
    article_limit_window_hours: 24,
};

const KEYS = Object.keys(DEFAULTS);

const ArticleLimitConfig = () => {
    const { t } = useTranslation('admin');
    const { settings, updateSettings } = useSiteSettingsAdminContext();
    const [local, setLocal] = useState({});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const initial = {};
        KEYS.forEach((key) => {
            initial[key] = settings[key] ?? DEFAULTS[key];
        });
        setLocal(initial);
    }, [settings]);

    const handleChange = (key, value) => {
        setLocal((prev) => ({ ...prev, [key]: value }));
    };

    const hasChanges = useMemo(() => {
        return KEYS.some((key) => {
            const saved = settings[key] ?? DEFAULTS[key];
            return local[key] !== undefined && local[key] !== saved;
        });
    }, [local, settings]);

    const handleSave = async () => {
        setIsSaving(true);
        const result = await updateSettings(local);
        setIsSaving(false);
        if (result.success) {
            toast.success(t('siteSettingsAdmin.articleLimitConfig.saved'));
        } else {
            toast.error(t('siteSettingsAdmin.articleLimitConfig.error'));
        }
    };

    const handleReset = () => {
        setLocal({ ...DEFAULTS });
    };

    return (
        <div className="alc-wrapper">
            <h4 className="alc-title">
                <span className="alc-title-icon">📊</span>
                {t('siteSettingsAdmin.articleLimitConfig.title')}
            </h4>

            <div className="alc-controls">
                <SettingsAdminSlider
                    label={t('siteSettingsAdmin.articleLimitConfig.maxReads')}
                    value={local.article_limit_max_reads ?? DEFAULTS.article_limit_max_reads}
                    onChange={(v) => handleChange('article_limit_max_reads', v)}
                    min={1}
                    max={20}
                    step={1}
                />
                <SettingsAdminSlider
                    label={t('siteSettingsAdmin.articleLimitConfig.windowHours')}
                    value={local.article_limit_window_hours ?? DEFAULTS.article_limit_window_hours}
                    onChange={(v) => handleChange('article_limit_window_hours', v)}
                    min={1}
                    max={72}
                    step={1}
                    unit="ч"
                />
            </div>

            <div className="alc-actions">
                <button className="alc-btn alc-btn--reset" onClick={handleReset} type="button">
                    <RotateCcw size={14} />
                    {t('siteSettingsAdmin.articleLimitConfig.reset')}
                </button>
                <button
                    className={`alc-btn alc-btn--save ${hasChanges ? 'alc-btn--active' : ''}`}
                    onClick={handleSave}
                    disabled={!hasChanges || isSaving}
                    type="button"
                >
                    <Save size={14} />
                    {isSaving ? t('siteSettingsAdmin.saving') : t('siteSettingsAdmin.articleLimitConfig.save')}
                </button>
            </div>
        </div>
    );
};

export default ArticleLimitConfig;
