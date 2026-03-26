import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSiteSettingsAdminContext } from '../../contexts/SiteSettingsAdminContext';
import { toast } from 'react-toastify';
import './smsConfig.css';

const KEYS = {
    enabled: 'sms_enabled',
    reminder24h: 'sms_reminder_24h',
    reminder1h: 'sms_reminder_1h',
    onRegistration: 'sms_on_registration',
    reminderTemplate: 'sms_reminder_template',
    registrationTemplate: 'sms_registration_template',
};

const DEFAULTS = {
    enabled: true,
    reminder24h: true,
    reminder1h: true,
    onRegistration: true,
    reminderTemplate: 'Напомняне: {timeLabel} имате семинар "{title}" {location} на {date}. - PensaClub',
    registrationTemplate: 'Записахте се за семинар "{title}" на {date}{location}. Очакваме ви! - PensaClub',
};

const SmsConfig = () => {
    const { t } = useTranslation('admin');
    const { settings, updateSettings, loadingKeys } = useSiteSettingsAdminContext();

    const [form, setForm] = useState({
        enabled: settings[KEYS.enabled] ?? DEFAULTS.enabled,
        reminder24h: settings[KEYS.reminder24h] ?? DEFAULTS.reminder24h,
        reminder1h: settings[KEYS.reminder1h] ?? DEFAULTS.reminder1h,
        onRegistration: settings[KEYS.onRegistration] ?? DEFAULTS.onRegistration,
        reminderTemplate: settings[KEYS.reminderTemplate] ?? DEFAULTS.reminderTemplate,
        registrationTemplate: settings[KEYS.registrationTemplate] ?? DEFAULTS.registrationTemplate,
    });

    const [saving, setSaving] = useState(false);

    const hasChanges = useMemo(() => {
        return form.enabled !== (settings[KEYS.enabled] ?? DEFAULTS.enabled) ||
            form.reminder24h !== (settings[KEYS.reminder24h] ?? DEFAULTS.reminder24h) ||
            form.reminder1h !== (settings[KEYS.reminder1h] ?? DEFAULTS.reminder1h) ||
            form.onRegistration !== (settings[KEYS.onRegistration] ?? DEFAULTS.onRegistration) ||
            form.reminderTemplate !== (settings[KEYS.reminderTemplate] ?? DEFAULTS.reminderTemplate) ||
            form.registrationTemplate !== (settings[KEYS.registrationTemplate] ?? DEFAULTS.registrationTemplate);
    }, [form, settings]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateSettings({
                [KEYS.enabled]: form.enabled,
                [KEYS.reminder24h]: form.reminder24h,
                [KEYS.reminder1h]: form.reminder1h,
                [KEYS.onRegistration]: form.onRegistration,
                [KEYS.reminderTemplate]: form.reminderTemplate,
                [KEYS.registrationTemplate]: form.registrationTemplate,
            });
            toast.success(t('siteSettingsAdmin.smsConfig.saved', 'Настройките са запазени'));
        } catch (err) {
            toast.error(t('siteSettingsAdmin.smsConfig.error', 'Грешка при запазване'));
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        setForm({
            enabled: settings[KEYS.enabled] ?? DEFAULTS.enabled,
            reminder24h: settings[KEYS.reminder24h] ?? DEFAULTS.reminder24h,
            reminder1h: settings[KEYS.reminder1h] ?? DEFAULTS.reminder1h,
            onRegistration: settings[KEYS.onRegistration] ?? DEFAULTS.onRegistration,
            reminderTemplate: settings[KEYS.reminderTemplate] ?? DEFAULTS.reminderTemplate,
            registrationTemplate: settings[KEYS.registrationTemplate] ?? DEFAULTS.registrationTemplate,
        });
    };

    return (
        <div className="smsc-container">
            <h3 className="smsc-title">{t('siteSettingsAdmin.smsConfig.title', 'SMS Настройки')}</h3>
            <p className="smsc-desc">{t('siteSettingsAdmin.smsConfig.desc', 'Управление на SMS напомняния за семинари')}</p>

            <div className="smsc-toggles">
                <label className="smsc-toggle">
                    <input type="checkbox" checked={form.enabled} onChange={(e) => setForm(prev => ({ ...prev, enabled: e.target.checked }))} />
                    <span className="smsc-toggle-slider" />
                    <span className="smsc-toggle-label">{t('siteSettingsAdmin.smsConfig.enabled', 'SMS известия активни')}</span>
                </label>

                <label className="smsc-toggle">
                    <input type="checkbox" checked={form.reminder24h} onChange={(e) => setForm(prev => ({ ...prev, reminder24h: e.target.checked }))} disabled={!form.enabled} />
                    <span className="smsc-toggle-slider" />
                    <span className="smsc-toggle-label">{t('siteSettingsAdmin.smsConfig.reminder24h', 'Напомняне 24ч преди')}</span>
                </label>

                <label className="smsc-toggle">
                    <input type="checkbox" checked={form.reminder1h} onChange={(e) => setForm(prev => ({ ...prev, reminder1h: e.target.checked }))} disabled={!form.enabled} />
                    <span className="smsc-toggle-slider" />
                    <span className="smsc-toggle-label">{t('siteSettingsAdmin.smsConfig.reminder1h', 'Напомняне 1ч преди')}</span>
                </label>

                <label className="smsc-toggle">
                    <input type="checkbox" checked={form.onRegistration} onChange={(e) => setForm(prev => ({ ...prev, onRegistration: e.target.checked }))} disabled={!form.enabled} />
                    <span className="smsc-toggle-slider" />
                    <span className="smsc-toggle-label">{t('siteSettingsAdmin.smsConfig.onRegistration', 'SMS при записване')}</span>
                </label>
            </div>

            <div className="smsc-templates">
                <div className="smsc-field">
                    <label className="smsc-field-label">{t('siteSettingsAdmin.smsConfig.reminderTemplate', 'Шаблон за напомняне')}</label>
                    <textarea className="smsc-textarea" value={form.reminderTemplate} onChange={(e) => setForm(prev => ({ ...prev, reminderTemplate: e.target.value }))} rows={3} disabled={!form.enabled} />
                    <span className="smsc-hint">{t('siteSettingsAdmin.smsConfig.templateHint', 'Променливи: {title}, {date}, {location}, {timeLabel}')}</span>
                </div>

                <div className="smsc-field">
                    <label className="smsc-field-label">{t('siteSettingsAdmin.smsConfig.registrationTemplate', 'Шаблон при записване')}</label>
                    <textarea className="smsc-textarea" value={form.registrationTemplate} onChange={(e) => setForm(prev => ({ ...prev, registrationTemplate: e.target.value }))} rows={3} disabled={!form.enabled} />
                    <span className="smsc-hint">{t('siteSettingsAdmin.smsConfig.templateHint', 'Променливи: {title}, {date}, {location}')}</span>
                </div>
            </div>

            {hasChanges && (
                <div className="smsc-actions">
                    <button className="smsc-btn smsc-btn-reset" onClick={handleReset} disabled={saving}>Отказ</button>
                    <button className="smsc-btn smsc-btn-save" onClick={handleSave} disabled={saving}>{saving ? 'Запазване...' : 'Запази'}</button>
                </div>
            )}
        </div>
    );
};

export default SmsConfig;
