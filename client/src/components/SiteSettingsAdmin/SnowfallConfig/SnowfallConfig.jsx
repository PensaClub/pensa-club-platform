import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { RotateCcw, Save } from 'lucide-react';
import { useSiteSettingsAdminContext } from '../../contexts/SiteSettingsAdminContext';
import SettingsAdminSlider from '../SettingsAdminSlider/SettingsAdminSlider';
import SettingsAdminColorPicker from '../SettingsAdminColorPicker/SettingsAdminColorPicker';
import './snowfallConfig.css';

const DEFAULTS = {
    snowfall_count: 50,
    snowfall_min_size: 10,
    snowfall_max_size: 30,
    snowfall_min_duration: 8,
    snowfall_max_duration: 20,
    snowfall_opacity: 0.8,
    snowfall_color: '#ffffff',
};

const KEYS = Object.keys(DEFAULTS);

const SnowfallConfig = () => {
    const { t } = useTranslation();
    const { settings, updateSettings } = useSiteSettingsAdminContext();
    const [local, setLocal] = useState({});
    const [isSaving, setIsSaving] = useState(false);

    // Initialize local state from context settings
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

    // Check if any value differs from saved settings
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
            toast.success(t('siteSettingsAdmin.snowfallConfig.saved'));
        } else {
            toast.error(t('siteSettingsAdmin.snowfallConfig.error'));
        }
    };

    const handleReset = () => {
        setLocal({ ...DEFAULTS });
    };

    return (
        <div className="sfc-wrapper">
            <h4 className="sfc-title">
                <span className="sfc-title-icon">❄️</span>
                {t('siteSettingsAdmin.snowfallConfig.title')}
            </h4>

            <div className="sfc-controls">
                <SettingsAdminSlider
                    label={t('siteSettingsAdmin.snowfallConfig.count')}
                    value={local.snowfall_count ?? DEFAULTS.snowfall_count}
                    onChange={(v) => handleChange('snowfall_count', v)}
                    min={5}
                    max={200}
                    step={5}
                />
                <SettingsAdminSlider
                    label={t('siteSettingsAdmin.snowfallConfig.minSize')}
                    value={local.snowfall_min_size ?? DEFAULTS.snowfall_min_size}
                    onChange={(v) => handleChange('snowfall_min_size', v)}
                    min={5}
                    max={30}
                    step={1}
                    unit="px"
                />
                <SettingsAdminSlider
                    label={t('siteSettingsAdmin.snowfallConfig.maxSize')}
                    value={local.snowfall_max_size ?? DEFAULTS.snowfall_max_size}
                    onChange={(v) => handleChange('snowfall_max_size', v)}
                    min={15}
                    max={60}
                    step={1}
                    unit="px"
                />
                <SettingsAdminSlider
                    label={t('siteSettingsAdmin.snowfallConfig.minDuration')}
                    value={local.snowfall_min_duration ?? DEFAULTS.snowfall_min_duration}
                    onChange={(v) => handleChange('snowfall_min_duration', v)}
                    min={3}
                    max={15}
                    step={1}
                    unit="s"
                />
                <SettingsAdminSlider
                    label={t('siteSettingsAdmin.snowfallConfig.maxDuration')}
                    value={local.snowfall_max_duration ?? DEFAULTS.snowfall_max_duration}
                    onChange={(v) => handleChange('snowfall_max_duration', v)}
                    min={10}
                    max={40}
                    step={1}
                    unit="s"
                />
                <SettingsAdminSlider
                    label={t('siteSettingsAdmin.snowfallConfig.opacity')}
                    value={local.snowfall_opacity ?? DEFAULTS.snowfall_opacity}
                    onChange={(v) => handleChange('snowfall_opacity', v)}
                    min={0.1}
                    max={1}
                    step={0.1}
                />
                <SettingsAdminColorPicker
                    label={t('siteSettingsAdmin.snowfallConfig.color')}
                    value={local.snowfall_color ?? DEFAULTS.snowfall_color}
                    onChange={(v) => handleChange('snowfall_color', v)}
                />
            </div>

            <div className="sfc-actions">
                <button className="sfc-btn sfc-btn--reset" onClick={handleReset} type="button">
                    <RotateCcw size={14} />
                    {t('siteSettingsAdmin.snowfallConfig.reset')}
                </button>
                <button
                    className={`sfc-btn sfc-btn--save ${hasChanges ? 'sfc-btn--active' : ''}`}
                    onClick={handleSave}
                    disabled={!hasChanges || isSaving}
                    type="button"
                >
                    <Save size={14} />
                    {isSaving ? t('siteSettingsAdmin.saving') : t('siteSettingsAdmin.snowfallConfig.save')}
                </button>
            </div>
        </div>
    );
};

export default SnowfallConfig;
