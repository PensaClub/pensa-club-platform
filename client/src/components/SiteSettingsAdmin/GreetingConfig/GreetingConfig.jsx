import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { RotateCcw, Save } from 'lucide-react';
import { useSiteSettingsAdminContext } from '../../contexts/SiteSettingsAdminContext';
import SettingsAdminTextInput from '../SettingsAdminTextInput/SettingsAdminTextInput';
import SettingsAdminColorPicker from '../SettingsAdminColorPicker/SettingsAdminColorPicker';
import './greetingConfig.css';

const COLOR_DEFAULTS = {
    greeting_primary_color: '#FFD700',
    greeting_bg_color: '#0B3D0B',
    greeting_text_color: '#FFF8DC',
    greeting_accent_color: '#C41E3A',
};

const VIDEO_DEFAULT = '/videos/christmas.mp4';

const TEXT_KEYS = [
    'greeting_title_bg', 'greeting_title_en', 'greeting_title_de',
    'greeting_subtitle_bg', 'greeting_subtitle_en', 'greeting_subtitle_de',
];

const ALL_KEYS = [...TEXT_KEYS, ...Object.keys(COLOR_DEFAULTS), 'greeting_video_url'];

const FLAGS = { bg: '🇧🇬', en: '🇬🇧', de: '🇩🇪' };
const LANG_LABELS = { bg: 'Български', en: 'English', de: 'Deutsch' };

// Simple lighten/darken functions for CSS variables
const lightenColor = (hex, amount = 40) => {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, (num >> 16) + amount);
    const g = Math.min(255, ((num >> 8) & 0x00FF) + amount);
    const b = Math.min(255, (num & 0x0000FF) + amount);
    return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
};

const darkenColor = (hex, amount = 80) => {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.max(0, (num >> 16) - amount);
    const g = Math.max(0, ((num >> 8) & 0x00FF) - amount);
    const b = Math.max(0, (num & 0x0000FF) - amount);
    return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
};

const GreetingConfig = () => {
    const { t, i18n } = useTranslation('admin');
    const { settings, updateSettings } = useSiteSettingsAdminContext();
    const [local, setLocal] = useState({});
    const [isSaving, setIsSaving] = useState(false);

    // Initialize local state from context
    useEffect(() => {
        const initial = {};
        TEXT_KEYS.forEach((key) => {
            initial[key] = settings[key] ?? '';
        });
        Object.entries(COLOR_DEFAULTS).forEach(([key, def]) => {
            initial[key] = settings[key] ?? def;
        });
        initial.greeting_video_url = settings.greeting_video_url ?? VIDEO_DEFAULT;
        setLocal(initial);
    }, [settings]);

    const handleChange = (key, value) => {
        setLocal((prev) => ({ ...prev, [key]: value }));
    };

    const hasChanges = useMemo(() => {
        return ALL_KEYS.some((key) => {
            const saved = settings[key] ?? (COLOR_DEFAULTS[key] || '');
            return local[key] !== undefined && local[key] !== saved;
        });
    }, [local, settings]);

    const handleSave = async () => {
        setIsSaving(true);
        const result = await updateSettings(local);
        setIsSaving(false);
        if (result.success) {
            toast.success(t('siteSettingsAdmin.greetingConfig.saved'));
        } else {
            toast.error(t('siteSettingsAdmin.greetingConfig.error'));
        }
    };

    const handleReset = () => {
        const reset = {};
        // Reset texts to i18n defaults
        const textDefaults = {
            greeting_title_bg: t('christmasGreeting.title', { lng: 'bg' }),
            greeting_title_en: t('christmasGreeting.title', { lng: 'en' }),
            greeting_title_de: t('christmasGreeting.title', { lng: 'de' }),
            greeting_subtitle_bg: t('christmasGreeting.subtitle', { lng: 'bg' }),
            greeting_subtitle_en: t('christmasGreeting.subtitle', { lng: 'en' }),
            greeting_subtitle_de: t('christmasGreeting.subtitle', { lng: 'de' }),
        };
        TEXT_KEYS.forEach((key) => (reset[key] = textDefaults[key] || ''));
        Object.entries(COLOR_DEFAULTS).forEach(([key, def]) => (reset[key] = def));
        reset.greeting_video_url = VIDEO_DEFAULT;
        setLocal(reset);
    };

    // Preview values
    const currentLang = i18n.language || 'bg';
    const previewTitle = local[`greeting_title_${currentLang}`] || t('christmasGreeting.title');
    const previewSubtitle = local[`greeting_subtitle_${currentLang}`] || t('christmasGreeting.subtitle');
    const primaryColor = local.greeting_primary_color || COLOR_DEFAULTS.greeting_primary_color;
    const bgColor = local.greeting_bg_color || COLOR_DEFAULTS.greeting_bg_color;
    const textColor = local.greeting_text_color || COLOR_DEFAULTS.greeting_text_color;
    const accentColor = local.greeting_accent_color || COLOR_DEFAULTS.greeting_accent_color;

    return (
        <div className="gc-wrapper">
            {/* Texts Section */}
            <div className="gc-section">
                <h4 className="gc-section-title">
                    <span className="gc-section-icon">📝</span>
                    {t('siteSettingsAdmin.greetingConfig.texts')}
                </h4>

                <div className="gc-group">
                    <span className="gc-group-label">{t('siteSettingsAdmin.greetingConfig.titleLabel')}</span>
                    {['bg', 'en', 'de'].map((lang) => (
                        <SettingsAdminTextInput
                            key={`title_${lang}`}
                            label={LANG_LABELS[lang]}
                            flag={FLAGS[lang]}
                            value={local[`greeting_title_${lang}`] ?? ''}
                            onChange={(v) => handleChange(`greeting_title_${lang}`, v)}
                            placeholder={t('siteSettingsAdmin.greetingConfig.titlePlaceholder')}
                        />
                    ))}
                </div>

                <div className="gc-group">
                    <span className="gc-group-label">{t('siteSettingsAdmin.greetingConfig.subtitleLabel')}</span>
                    {['bg', 'en', 'de'].map((lang) => (
                        <SettingsAdminTextInput
                            key={`subtitle_${lang}`}
                            label={LANG_LABELS[lang]}
                            flag={FLAGS[lang]}
                            value={local[`greeting_subtitle_${lang}`] ?? ''}
                            onChange={(v) => handleChange(`greeting_subtitle_${lang}`, v)}
                            placeholder={t('siteSettingsAdmin.greetingConfig.subtitlePlaceholder')}
                        />
                    ))}
                </div>
            </div>

            {/* Video Section */}
            <div className="gc-section">
                <h4 className="gc-section-title">
                    <span className="gc-section-icon">🎬</span>
                    {t('siteSettingsAdmin.greetingConfig.videoLabel')}
                </h4>
                <SettingsAdminTextInput
                    label="URL"
                    flag="🎬"
                    value={local.greeting_video_url ?? VIDEO_DEFAULT}
                    onChange={(v) => handleChange('greeting_video_url', v)}
                    placeholder="/videos/christmas.mp4"
                />
            </div>

            {/* Colors Section */}
            <div className="gc-section">
                <h4 className="gc-section-title">
                    <span className="gc-section-icon">🎨</span>
                    {t('siteSettingsAdmin.greetingConfig.colors')}
                </h4>

                <div className="gc-controls">
                    <SettingsAdminColorPicker
                        label={t('siteSettingsAdmin.greetingConfig.primaryColor')}
                        value={local.greeting_primary_color ?? COLOR_DEFAULTS.greeting_primary_color}
                        onChange={(v) => handleChange('greeting_primary_color', v)}
                    />
                    <SettingsAdminColorPicker
                        label={t('siteSettingsAdmin.greetingConfig.bgColor')}
                        value={local.greeting_bg_color ?? COLOR_DEFAULTS.greeting_bg_color}
                        onChange={(v) => handleChange('greeting_bg_color', v)}
                    />
                    <SettingsAdminColorPicker
                        label={t('siteSettingsAdmin.greetingConfig.textColor')}
                        value={local.greeting_text_color ?? COLOR_DEFAULTS.greeting_text_color}
                        onChange={(v) => handleChange('greeting_text_color', v)}
                    />
                    <SettingsAdminColorPicker
                        label={t('siteSettingsAdmin.greetingConfig.accentColor')}
                        value={local.greeting_accent_color ?? COLOR_DEFAULTS.greeting_accent_color}
                        onChange={(v) => handleChange('greeting_accent_color', v)}
                    />
                </div>
            </div>

            {/* Preview Section */}
            <div className="gc-section">
                <h4 className="gc-section-title">
                    <span className="gc-section-icon">👁️</span>
                    {t('siteSettingsAdmin.greetingConfig.preview')}
                </h4>

                <div className="gc-preview-frame">
                    <div
                        className="gc-preview"
                        style={{
                            '--gpv-primary': primaryColor,
                            '--gpv-primary-light': lightenColor(primaryColor),
                            '--gpv-bg': bgColor,
                            '--gpv-text': textColor,
                            '--gpv-accent': accentColor,
                            '--gpv-accent-deep': darkenColor(accentColor),
                        }}
                    >
                        {/* Decoration top */}
                        <div className="gc-preview-deco-top">
                            <span>🎄</span>
                            <span className="gc-preview-star">⭐</span>
                            <span>🎄</span>
                        </div>

                        {/* Video placeholder */}
                        <div className="gc-preview-video">
                            <span className="gc-preview-video-icon">📹</span>
                            <span className="gc-preview-video-text">
                                {t('siteSettingsAdmin.greetingConfig.videoPlaceholder')}
                            </span>
                        </div>

                        {/* Text */}
                        <div className="gc-preview-text">
                            <h3 className="gc-preview-title">{previewTitle}</h3>
                            <p className="gc-preview-subtitle">{previewSubtitle}</p>
                            <div className="gc-preview-ornaments">
                                <span>🎁</span>
                                <span>🔔</span>
                                <span>🎁</span>
                            </div>
                        </div>

                        {/* Button */}
                        <div className="gc-preview-btn-wrap">
                            <div className="gc-preview-btn">
                                {t('siteSettingsAdmin.greetingConfig.continueButton')}
                            </div>
                        </div>

                        {/* Garland */}
                        <div className="gc-preview-garland" />
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="gc-actions">
                <button className="gc-btn gc-btn--reset" onClick={handleReset} type="button">
                    <RotateCcw size={14} />
                    {t('siteSettingsAdmin.greetingConfig.reset')}
                </button>
                <button
                    className={`gc-btn gc-btn--save ${hasChanges ? 'gc-btn--active' : ''}`}
                    onClick={handleSave}
                    disabled={!hasChanges || isSaving}
                    type="button"
                >
                    <Save size={14} />
                    {isSaving ? t('siteSettingsAdmin.saving') : t('siteSettingsAdmin.greetingConfig.save')}
                </button>
            </div>
        </div>
    );
};

export default GreetingConfig;
