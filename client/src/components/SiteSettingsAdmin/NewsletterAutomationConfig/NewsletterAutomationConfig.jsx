// src/components/SiteSettingsAdmin/NewsletterAutomationConfig/NewsletterAutomationConfig.jsx
// Prefix: nac-
//
// Shared cron-management UI. Used in:
//   - AdminNewsletters → tab „Автоматични" (above the existing per-cron cards)
//   - SiteSettingsAdmin → as a Section
//
// Backend: GET /admin/cron, PUT /admin/cron/:key

import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Save,
  Clock,
  AlertTriangle,
  PauseCircle,
  Users,
} from 'lucide-react';
import { useCommunityContext } from '../../contexts/CommunityContext';
import { notify } from '../../../utils/notify.jsx';
import './newsletterAutomationConfig.css';

// Predefined cron schedule options. Admin can also enter a custom cron string.
const SCHEDULE_PRESETS = [
  { value: '*/15 * * * *', labelKey: 'every15Min' },
  { value: '0 * * * *', labelKey: 'everyHour' },
  { value: '0 9 * * *', labelKey: 'daily9am' },
  { value: '0 10 * * *', labelKey: 'daily10am' },
  { value: '0 10 * * 1', labelKey: 'monday10am' },
  { value: '0 9 1 * *', labelKey: 'monthly1st9am' },
  { value: 'custom', labelKey: 'custom' },
];

const formatDateTime = (value, locale) => {
  if (!value) return null;
  try {
    return new Intl.DateTimeFormat(locale || 'bg-BG', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value));
  } catch {
    return String(value);
  }
};

export const NewsletterAutomationConfig = () => {
  const { t, i18n } = useTranslation('cronSettings');
  const { getAdminCrons, updateAdminCron } = useCommunityContext();

  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [edits, setEdits] = useState({}); // { [key]: { enabled, schedule } }
  const [savingKey, setSavingKey] = useState(null);

  const localeCode = (() => {
    const map = { bg: 'bg-BG', en: 'en-US', de: 'de-DE' };
    return map[i18n.language] || 'bg-BG';
  })();

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAdminCrons();
      setItems(data?.items || []);
      setEdits({});
    } catch {
      // notify already done in context wrapper
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const getEdited = (item) => ({
    enabled: edits[item.key]?.enabled ?? item.enabled,
    schedule: edits[item.key]?.schedule ?? item.schedule,
    preset:
      edits[item.key]?.preset ??
      (SCHEDULE_PRESETS.find((p) => p.value === item.schedule)?.value || 'custom'),
  });

  const isDirty = (item) => {
    const e = edits[item.key];
    if (!e) return false;
    return (
      (e.enabled !== undefined && e.enabled !== item.enabled) ||
      (e.schedule !== undefined && e.schedule !== item.schedule)
    );
  };

  const handleToggle = (item, value) => {
    setEdits((prev) => ({
      ...prev,
      [item.key]: { ...prev[item.key], enabled: value },
    }));
  };

  const handlePresetChange = (item, presetValue) => {
    setEdits((prev) => ({
      ...prev,
      [item.key]: {
        ...prev[item.key],
        preset: presetValue,
        schedule: presetValue === 'custom' ? prev[item.key]?.schedule || item.schedule : presetValue,
      },
    }));
  };

  const handleScheduleChange = (item, value) => {
    setEdits((prev) => ({
      ...prev,
      [item.key]: { ...prev[item.key], schedule: value, preset: 'custom' },
    }));
  };

  const handleSave = async (item) => {
    const e = getEdited(item);
    setSavingKey(item.key);
    try {
      const payload = { enabled: e.enabled, schedule: e.schedule };
      const res = await updateAdminCron(item.key, payload);
      const updated = res?.item;
      if (updated) {
        setItems((prev) => prev.map((it) => (it.key === item.key ? updated : it)));
        setEdits((prev) => {
          const next = { ...prev };
          delete next[item.key];
          return next;
        });
      }
      notify('success', null, t('messages.saved', { name: item.key }));
    } catch (err) {
      const msg = err?.message || t('messages.saveError');
      notify('error', null, msg);
    } finally {
      setSavingKey(null);
    }
  };

  if (isLoading) {
    return (
      <div className="nac-state">
        <span className="nac-state-icon nac-spin">
          <Loader2 />
        </span>
        <span>{t('messages.loading')}</span>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <p className="nac-empty">{t('messages.empty')}</p>
    );
  }

  return (
    <div className="nac-root">
      <ul className="nac-list">
        {items.map((item) => {
          const e = getEdited(item);
          const dirty = isDirty(item);
          const lastRun = item.lastRunAt
            ? formatDateTime(item.lastRunAt, localeCode)
            : null;
          const status = item.lastRunStatus;
          return (
            <li key={item.key} className="nac-item">
              <div className="nac-item-head">
                <div className="nac-item-text">
                  <h4 className="nac-item-title">
                    {t(`crons.${item.key}.title`, { defaultValue: item.key })}
                  </h4>
                  <p className="nac-item-desc">
                    {t(`crons.${item.key}.desc`, {
                      defaultValue: item.description || '',
                    })}
                  </p>
                </div>
                <label className="nac-toggle">
                  <input
                    type="checkbox"
                    checked={!!e.enabled}
                    onChange={(ev) => handleToggle(item, ev.target.checked)}
                  />
                  <span className="nac-toggle-track">
                    <span className="nac-toggle-thumb" />
                  </span>
                  <span className="nac-toggle-text">
                    {e.enabled ? t('toggle.on') : t('toggle.off')}
                  </span>
                </label>
              </div>

              <div className="nac-row">
                <label className="nac-field">
                  <span className="nac-label">{t('schedule.preset')}</span>
                  <select
                    className="nac-select"
                    value={e.preset}
                    onChange={(ev) => handlePresetChange(item, ev.target.value)}
                  >
                    {SCHEDULE_PRESETS.map((p) => (
                      <option key={p.value} value={p.value}>
                        {t(`schedule.presets.${p.labelKey}`)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="nac-field">
                  <span className="nac-label">{t('schedule.expression')}</span>
                  <input
                    type="text"
                    className="nac-input"
                    value={e.schedule}
                    onChange={(ev) => handleScheduleChange(item, ev.target.value)}
                    placeholder="0 10 * * 1"
                  />
                </label>
                <span className="nac-tz">{item.timezone}</span>
              </div>

              <div className="nac-status">
                {lastRun ? (
                  <>
                    <span className={`nac-status-badge nac-status-badge--${status || 'unknown'}`}>
                      {status === 'success' && <CheckCircle2 />}
                      {status === 'failed' && <XCircle />}
                      {status === 'skipped' && <PauseCircle />}
                      {!status && <AlertTriangle />}
                      <span>
                        {status
                          ? t(`status.${status}`, { defaultValue: status })
                          : t('status.unknown')}
                      </span>
                    </span>
                    <span className="nac-status-time">
                      <Clock />
                      <span>{lastRun}</span>
                    </span>
                    {typeof item.lastRunSubscribers === 'number' && (
                      <span className="nac-status-recipients">
                        <Users />
                        <span>
                          {t('lastRun.recipients', { count: item.lastRunSubscribers })}
                        </span>
                      </span>
                    )}
                  </>
                ) : (
                  <span className="nac-status-time">{t('lastRun.never')}</span>
                )}
              </div>

              {item.lastRunError && (
                <p className="nac-error">{item.lastRunError}</p>
              )}

              <div className="nac-actions">
                <button
                  type="button"
                  className="nac-save-btn"
                  onClick={() => handleSave(item)}
                  disabled={!dirty || savingKey === item.key}
                >
                  <span className="nac-save-icon">
                    {savingKey === item.key ? (
                      <Loader2 className="nac-spin" />
                    ) : (
                      <Save />
                    )}
                  </span>
                  <span className="nac-save-label">
                    {savingKey === item.key
                      ? t('actions.saving')
                      : dirty
                      ? t('actions.save')
                      : t('actions.saved')}
                  </span>
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <p className="nac-hint">{t('messages.scheduleHint')}</p>
    </div>
  );
};
