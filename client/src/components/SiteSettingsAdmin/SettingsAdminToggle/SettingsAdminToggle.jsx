import { useTranslation } from 'react-i18next';
import { Check, X } from 'lucide-react';
import './settingsAdminToggle.css';

const SettingsAdminToggle = ({ settingKey, title, description, icon, value, onChange, isLoading }) => {
    const { t } = useTranslation('admin');

    const handleToggle = () => {
        if (!isLoading) {
            onChange(settingKey, !value);
        }
    };

    return (
        <div className={`sat-card ${value ? 'sat-card--on' : ''}`}>
            {/* Left: accent bar */}
            <div className={`sat-accent ${value ? 'sat-accent--on' : ''}`} />

            {/* Content */}
            <div className="sat-body">
                <div className="sat-row">
                    <div className="sat-info">
                        {icon && <span className="sat-icon">{icon}</span>}
                        <div className="sat-text">
                            <div className="sat-title-row">
                                <h4 className="sat-title">{title}</h4>
                                <span className={`sat-badge ${value ? 'sat-badge--on' : 'sat-badge--off'}`}>
                                    {value ? t('siteSettingsAdmin.enabled') : t('siteSettingsAdmin.disabled')}
                                </span>
                            </div>
                            <p className="sat-desc">{description}</p>
                        </div>
                    </div>

                    {/* Toggle */}
                    <button
                        className={`sat-switch ${value ? 'sat-switch--on' : ''} ${isLoading ? 'sat-switch--loading' : ''}`}
                        onClick={handleToggle}
                        disabled={isLoading}
                        aria-label={`${title}: ${value ? t('siteSettingsAdmin.enabled') : t('siteSettingsAdmin.disabled')}`}
                        role="switch"
                        aria-checked={value}
                    >
                        <span className="sat-switch-track">
                            {/* Track labels */}
                            <span className="sat-switch-label sat-switch-label--on">
                                <Check size={11} strokeWidth={3} />
                            </span>
                            <span className="sat-switch-label sat-switch-label--off">
                                <X size={11} strokeWidth={3} />
                            </span>
                            {/* Thumb */}
                            <span className="sat-switch-thumb">
                                {isLoading ? (
                                    <span className="sat-switch-spinner" />
                                ) : value ? (
                                    <Check size={13} strokeWidth={3} />
                                ) : (
                                    <X size={13} strokeWidth={2.5} />
                                )}
                            </span>
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsAdminToggle;
