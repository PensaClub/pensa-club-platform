// BotEditModal — prefix `bcem-`. React portal modal for create/edit bot.
//
// Phase 1: friendly schedule picker (no raw cron unless the user asks for it),
// inline help text on every technical field, no jargon shown by default.

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { X, HelpCircle, Eraser } from 'lucide-react';
import { useCrawlerContext } from '../contexts/CrawlerContext';
import { notify } from '../../utils/notify.jsx';
import DeleteConfirmModal from '../Articles/AdminArticles/DeleteConfirmModal/DeleteConfirmModal';
import { SCHEDULE_MODES, buildCron, parseCron, summarize } from './cronHelpers';
import './botEditModal.css';

const STATUS_OPTIONS = ['active', 'paused', 'archived'];
const MINUTE_PRESETS = [5, 10, 15, 30];
const HOUR_PRESETS = [1, 2, 3, 6, 12];
const WEEKDAYS = [1, 2, 3, 4, 5, 6, 0]; // Mon..Sun (0 = Sunday in cron)
const CLEANUP_DAYS = ['daily', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

const DEFAULT_FORM = {
    name: '',
    description: '',
    schedule: { mode: SCHEDULE_MODES.HOURS, every: 1, hour: 9, minute: 0, days: [1, 2, 3, 4, 5], cron: '0 * * * *' },
    keywords: [],
    match: 'any',
    caseSensitive: false,
    status: 'active',
    useLlm: false,
    lookBackDays: '',
    cleanupEnabled: true,
    cleanupDay: 'daily',
    cleanupBatchSize: 100,
    cleanupHour: 3,
    notificationEmails: [],
};

// Tiny help bubble. Keeps tooltip text inline so screen readers and touch users
// can read it too — not just hover users.
const Hint = ({ text }) => (
    <span className="bcem-hint" title={text}>
        <HelpCircle size={14} aria-hidden="true" />
        <span className="bcem-hint-text">{text}</span>
    </span>
);

const BotEditModal = ({ open, bot, onClose, onSave, onChanged }) => {
    const { t } = useTranslation('botCrawler');
    const { clearBotFindings } = useCrawlerContext();
    const [form, setForm] = useState(DEFAULT_FORM);
    const [keywordInput, setKeywordInput] = useState('');
    const [emailInput, setEmailInput] = useState('');
    const [emailError, setEmailError] = useState('');
    const [saving, setSaving] = useState(false);
    const [clearOpen, setClearOpen] = useState(false);
    const [clearPending, setClearPending] = useState(false);
    const firstFieldRef = useRef(null);

    const isEdit = !!bot;

    const confirmClear = async () => {
        if (!bot) return;
        setClearPending(true);
        try {
            const res = await clearBotFindings(bot.id);
            notify('success', null, t('toast.findingsCleared', { count: res?.deleted || 0 }));
            setClearOpen(false);
            onChanged?.();
        } catch {
            // toasted by context
        } finally {
            setClearPending(false);
        }
    };

    useEffect(() => {
        if (!open) return;
        if (bot) {
            setForm({
                name: bot.name || '',
                description: bot.description || '',
                schedule: parseCron(bot.scheduleCron),
                keywords: Array.isArray(bot.criteria?.keywords) ? [...bot.criteria.keywords] : [],
                match: bot.criteria?.match || 'any',
                caseSensitive: !!bot.criteria?.caseSensitive,
                status: bot.status || 'active',
                useLlm: !!bot.useLlm,
                lookBackDays: Number.isFinite(bot.lookBackDays) ? String(bot.lookBackDays) : '',
                cleanupEnabled: bot.cleanupEnabled !== false,
                cleanupDay: bot.cleanupDay || 'daily',
                cleanupBatchSize: bot.cleanupBatchSize ?? 100,
                cleanupHour: bot.cleanupHour ?? 3,
                notificationEmails: Array.isArray(bot.notificationEmails) ? [...bot.notificationEmails] : [],
            });
        } else {
            setForm(DEFAULT_FORM);
        }
        setKeywordInput('');
        const id = window.requestAnimationFrame(() => firstFieldRef.current?.focus());
        return () => window.cancelAnimationFrame(id);
    }, [open, bot?.id]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (!open) return undefined;
        const handler = (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                if (!saving) onClose?.();
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [open, saving, onClose]);

    const cronString = useMemo(() => buildCron(form.schedule), [form.schedule]);
    const summaryText = useMemo(() => summarize(form.schedule, t), [form.schedule, t]);

    if (!open) return null;

    const updateField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));
    const updateSchedule = (patch) => setForm((prev) => ({
        ...prev,
        schedule: { ...prev.schedule, ...patch },
    }));

    const addKeyword = () => {
        const v = keywordInput.trim();
        if (!v) return;
        if (form.keywords.includes(v)) { setKeywordInput(''); return; }
        setForm((prev) => ({ ...prev, keywords: [...prev.keywords, v] }));
        setKeywordInput('');
    };

    const removeKeyword = (kw) => {
        setForm((prev) => ({ ...prev, keywords: prev.keywords.filter((k) => k !== kw) }));
    };

    const handleKeywordKey = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addKeyword();
        } else if (e.key === 'Backspace' && !keywordInput && form.keywords.length > 0) {
            removeKeyword(form.keywords[form.keywords.length - 1]);
        }
    };

    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const addEmail = () => {
        const v = emailInput.trim().toLowerCase();
        if (!v) return;
        if (!EMAIL_RE.test(v)) {
            setEmailError(t('bot.notifications.invalidEmail'));
            return;
        }
        if ((form.notificationEmails || []).includes(v)) { setEmailInput(''); setEmailError(''); return; }
        setForm((prev) => ({ ...prev, notificationEmails: [...(prev.notificationEmails || []), v] }));
        setEmailInput('');
        setEmailError('');
    };

    const removeEmail = (em) => {
        setForm((prev) => ({ ...prev, notificationEmails: (prev.notificationEmails || []).filter((e) => e !== em) }));
    };

    const handleEmailKey = (e) => {
        if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
            e.preventDefault();
            addEmail();
        } else if (e.key === 'Backspace' && !emailInput && (form.notificationEmails || []).length > 0) {
            removeEmail(form.notificationEmails[form.notificationEmails.length - 1]);
        }
    };

    const toggleDay = (d) => {
        const cur = new Set(form.schedule.days || []);
        if (cur.has(d)) cur.delete(d); else cur.add(d);
        updateSchedule({ days: Array.from(cur).sort() });
    };

    const handleSubmit = async (e) => {
        e?.preventDefault();
        if (!form.name.trim()) return;
        setSaving(true);
        const payload = {
            name: form.name.trim(),
            description: form.description.trim() || null,
            scheduleCron: cronString,
            criteria: {
                keywords: form.keywords,
                match: form.match,
                caseSensitive: form.caseSensitive,
            },
            status: form.status,
            useLlm: form.useLlm,
            lookBackDays: form.lookBackDays === '' ? null : parseInt(form.lookBackDays, 10),
            cleanupEnabled: form.cleanupEnabled,
            cleanupDay: form.cleanupDay,
            cleanupBatchSize: parseInt(form.cleanupBatchSize, 10) || 100,
            cleanupHour: parseInt(form.cleanupHour, 10) || 3,
            notificationEmails: form.notificationEmails || [],
        };
        try {
            await onSave?.(payload);
        } finally {
            setSaving(false);
        }
    };

    const titleId = 'bcem-title';
    const m = form.schedule.mode;

    return createPortal((
        <div
            className="bcem-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            onClick={(e) => { if (e.target === e.currentTarget && !saving) onClose?.(); }}
        >
            <div className="bcem-card" onClick={(e) => e.stopPropagation()}>
                <div className="bcem-head">
                    <h2 id={titleId} className="bcem-title">
                        {bot ? t('card.actions.edit') : t('page.newBot')}
                    </h2>
                    <button
                        type="button"
                        className="bcem-close"
                        onClick={() => !saving && onClose?.()}
                        aria-label={t('card.actions.cancel', 'Close')}
                    >
                        <X size={20} aria-hidden="true" />
                    </button>
                </div>

                <form className="bcem-form" onSubmit={handleSubmit}>
                    {/* ── Basic ─────────────────────────────────────────── */}
                    <div className="bcem-section-title">{t('bot.section.basic')}</div>

                    <label className="bcem-field">
                        <span className="bcem-label">
                            {t('bot.fields.name')}
                            <Hint text={t('bot.help.name')} />
                        </span>
                        <input
                            ref={firstFieldRef}
                            type="text"
                            className="bcem-input"
                            value={form.name}
                            onChange={(e) => updateField('name', e.target.value)}
                            required
                            maxLength={200}
                            placeholder={t('bot.placeholder.name')}
                        />
                    </label>

                    <label className="bcem-field">
                        <span className="bcem-label">
                            {t('bot.fields.description')}
                            <Hint text={t('bot.help.description')} />
                        </span>
                        <textarea
                            className="bcem-textarea"
                            value={form.description}
                            onChange={(e) => updateField('description', e.target.value)}
                            rows={3}
                            maxLength={1000}
                            placeholder={t('bot.placeholder.description')}
                        />
                    </label>

                    {/* ── Schedule ──────────────────────────────────────── */}
                    <div className="bcem-section-title">{t('bot.section.schedule')}</div>

                    <fieldset className="bcem-field bcem-fieldset">
                        <legend className="bcem-label">
                            {t('bot.fields.scheduleMode')}
                            <Hint text={t('bot.help.schedule')} />
                        </legend>
                        <div className="bcem-mode-row">
                            {Object.values(SCHEDULE_MODES).map((mode) => (
                                <label key={mode} className={`bcem-mode-pill ${m === mode ? 'bcem-mode-pill-active' : ''}`}>
                                    <input
                                        type="radio"
                                        name="scheduleMode"
                                        value={mode}
                                        checked={m === mode}
                                        onChange={() => updateSchedule({ mode })}
                                    />
                                    <span>{t(`bot.scheduleMode.${mode}`)}</span>
                                </label>
                            ))}
                        </div>
                    </fieldset>

                    {m === SCHEDULE_MODES.MINUTES && (
                        <label className="bcem-field">
                            <span className="bcem-label">{t('bot.fields.everyMinutes')}</span>
                            <select
                                className="bcem-input"
                                value={form.schedule.every || 30}
                                onChange={(e) => updateSchedule({ every: parseInt(e.target.value, 10) })}
                            >
                                {MINUTE_PRESETS.map((n) => (
                                    <option key={n} value={n}>{t('bot.everyMinutes', { count: n })}</option>
                                ))}
                            </select>
                        </label>
                    )}

                    {m === SCHEDULE_MODES.HOURS && (
                        <label className="bcem-field">
                            <span className="bcem-label">{t('bot.fields.everyHours')}</span>
                            <select
                                className="bcem-input"
                                value={form.schedule.every || 1}
                                onChange={(e) => updateSchedule({ every: parseInt(e.target.value, 10) })}
                            >
                                {HOUR_PRESETS.map((n) => (
                                    <option key={n} value={n}>{t('bot.everyHours', { count: n })}</option>
                                ))}
                            </select>
                        </label>
                    )}

                    {(m === SCHEDULE_MODES.DAILY || m === SCHEDULE_MODES.WEEKLY) && (
                        <div className="bcem-field-row">
                            <label className="bcem-field bcem-field-half">
                                <span className="bcem-label">{t('bot.fields.hour')}</span>
                                <select
                                    className="bcem-input"
                                    value={form.schedule.hour ?? 9}
                                    onChange={(e) => updateSchedule({ hour: parseInt(e.target.value, 10) })}
                                >
                                    {Array.from({ length: 24 }, (_, i) => (
                                        <option key={i} value={i}>{String(i).padStart(2, '0')}</option>
                                    ))}
                                </select>
                            </label>
                            <label className="bcem-field bcem-field-half">
                                <span className="bcem-label">{t('bot.fields.minute')}</span>
                                <select
                                    className="bcem-input"
                                    value={form.schedule.minute ?? 0}
                                    onChange={(e) => updateSchedule({ minute: parseInt(e.target.value, 10) })}
                                >
                                    {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((mm) => (
                                        <option key={mm} value={mm}>{String(mm).padStart(2, '0')}</option>
                                    ))}
                                </select>
                            </label>
                        </div>
                    )}

                    {m === SCHEDULE_MODES.WEEKLY && (
                        <fieldset className="bcem-field bcem-fieldset">
                            <legend className="bcem-label">{t('bot.fields.days')}</legend>
                            <div className="bcem-days-row">
                                {WEEKDAYS.map((d) => (
                                    <button
                                        key={d}
                                        type="button"
                                        className={`bcem-day-pill ${(form.schedule.days || []).includes(d) ? 'bcem-day-pill-active' : ''}`}
                                        onClick={() => toggleDay(d)}
                                        aria-pressed={(form.schedule.days || []).includes(d)}
                                    >
                                        {t(`bot.weekday.${d}`)}
                                    </button>
                                ))}
                            </div>
                        </fieldset>
                    )}

                    {m === SCHEDULE_MODES.CUSTOM && (
                        <label className="bcem-field">
                            <span className="bcem-label">
                                {t('bot.fields.cronRaw')}
                                <Hint text={t('bot.help.cron')} />
                            </span>
                            <input
                                type="text"
                                className="bcem-input bcem-input-mono"
                                value={form.schedule.cron || ''}
                                onChange={(e) => updateSchedule({ cron: e.target.value })}
                                placeholder="0 * * * *"
                            />
                        </label>
                    )}

                    <div className="bcem-summary">
                        <span className="bcem-summary-label">{t('bot.scheduleSummaryLabel')}</span>
                        <span className="bcem-summary-text">{summaryText}</span>
                        <span className="bcem-summary-cron">cron: {cronString}</span>
                    </div>

                    <label className="bcem-field">
                        <span className="bcem-label">
                            {t('bot.fields.lookBackDays')}
                            <Hint text={t('bot.help.lookBackDays')} />
                        </span>
                        <select
                            className="bcem-input"
                            value={form.lookBackDays}
                            onChange={(e) => updateField('lookBackDays', e.target.value)}
                        >
                            <option value="">{t('bot.lookBack.unlimited')}</option>
                            <option value="1">{t('bot.lookBack.day1')}</option>
                            <option value="3">{t('bot.lookBack.days3')}</option>
                            <option value="7">{t('bot.lookBack.days7')}</option>
                            <option value="14">{t('bot.lookBack.days14')}</option>
                            <option value="30">{t('bot.lookBack.days30')}</option>
                            <option value="90">{t('bot.lookBack.days90')}</option>
                            <option value="180">{t('bot.lookBack.days180')}</option>
                            <option value="365">{t('bot.lookBack.days365')}</option>
                        </select>
                    </label>

                    {/* ── Criteria ──────────────────────────────────────── */}
                    <div className="bcem-section-title">{t('bot.section.criteria')}</div>

                    <div className="bcem-field">
                        <span className="bcem-label">
                            {t('bot.fields.keywords')}
                            <Hint text={t('bot.help.keywords')} />
                        </span>
                        <div className="bcem-chips">
                            {form.keywords.map((kw) => (
                                <span key={kw} className="bcem-chip">
                                    <span className="bcem-chip-text">{kw}</span>
                                    <button
                                        type="button"
                                        className="bcem-chip-remove"
                                        onClick={() => removeKeyword(kw)}
                                        aria-label={`remove ${kw}`}
                                    >
                                        <X size={12} aria-hidden="true" />
                                    </button>
                                </span>
                            ))}
                            <input
                                type="text"
                                className="bcem-chip-input"
                                value={keywordInput}
                                onChange={(e) => setKeywordInput(e.target.value)}
                                onKeyDown={handleKeywordKey}
                                onBlur={addKeyword}
                                placeholder={t('bot.placeholder.keyword')}
                            />
                        </div>
                    </div>

                    <fieldset className="bcem-field bcem-fieldset">
                        <legend className="bcem-label">
                            {t('bot.fields.match')}
                            <Hint text={t('bot.help.match')} />
                        </legend>
                        <div className="bcem-radio-row">
                            <label className="bcem-radio">
                                <input type="radio" name="match" value="any" checked={form.match === 'any'} onChange={() => updateField('match', 'any')} />
                                <span>{t('bot.match.any')}</span>
                            </label>
                            <label className="bcem-radio">
                                <input type="radio" name="match" value="all" checked={form.match === 'all'} onChange={() => updateField('match', 'all')} />
                                <span>{t('bot.match.all')}</span>
                            </label>
                        </div>
                    </fieldset>

                    <label className="bcem-checkbox">
                        <input
                            type="checkbox"
                            checked={form.caseSensitive}
                            onChange={(e) => updateField('caseSensitive', e.target.checked)}
                        />
                        <span>
                            {t('bot.fields.caseSensitive')}
                            <Hint text={t('bot.help.caseSensitive')} />
                        </span>
                    </label>

                    {/* ── Auto cleanup ──────────────────────────────────── */}
                    <div className="bcem-section-title">{t('bot.section.cleanup')}</div>

                    <label className="bcem-checkbox">
                        <input
                            type="checkbox"
                            checked={form.cleanupEnabled}
                            onChange={(e) => updateField('cleanupEnabled', e.target.checked)}
                        />
                        <span>
                            {t('bot.fields.cleanupEnabled')}
                            <Hint text={t('bot.help.cleanupEnabled')} />
                        </span>
                    </label>

                    <div className="bcem-field-row">
                        <label className="bcem-field bcem-field-half">
                            <span className="bcem-label">
                                {t('bot.fields.cleanupDay')}
                                <Hint text={t('bot.help.cleanupDay')} />
                            </span>
                            <select
                                className="bcem-input"
                                value={form.cleanupDay}
                                onChange={(e) => updateField('cleanupDay', e.target.value)}
                                disabled={!form.cleanupEnabled}
                            >
                                {CLEANUP_DAYS.map((d) => (
                                    <option key={d} value={d}>{t(`bot.cleanupDay.${d}`)}</option>
                                ))}
                            </select>
                        </label>
                        <label className="bcem-field bcem-field-half">
                            <span className="bcem-label">
                                {t('bot.fields.cleanupHour')}
                                <Hint text={t('bot.help.cleanupHour')} />
                            </span>
                            <select
                                className="bcem-input"
                                value={form.cleanupHour}
                                onChange={(e) => updateField('cleanupHour', parseInt(e.target.value, 10))}
                                disabled={!form.cleanupEnabled}
                            >
                                {Array.from({ length: 24 }, (_, h) => (
                                    <option key={h} value={h}>{`${String(h).padStart(2, '0')}:00`}</option>
                                ))}
                            </select>
                        </label>
                    </div>

                    <label className="bcem-field">
                        <span className="bcem-label">
                            {t('bot.fields.cleanupBatchSize')}
                            <Hint text={t('bot.help.cleanupBatchSize')} />
                        </span>
                        <input
                            type="number"
                            className="bcem-input"
                            min={10}
                            max={10000}
                            step={10}
                            value={form.cleanupBatchSize}
                            onChange={(e) => updateField('cleanupBatchSize', e.target.value)}
                            disabled={!form.cleanupEnabled}
                        />
                    </label>

                    {form.cleanupEnabled && (
                        <div className="bcem-cleanup-summary">
                            {t('bot.cleanupSummary', {
                                day: t(`bot.cleanupDay.${form.cleanupDay}`),
                                time: `${String(form.cleanupHour).padStart(2, '0')}:00`,
                                count: parseInt(form.cleanupBatchSize, 10) || 100,
                            })}
                        </div>
                    )}

                    {/* ── Notifications ─────────────────────────────────── */}
                    <div className="bcem-section-title">{t('bot.section.notifications')}</div>

                    <div className="bcem-field">
                        <span className="bcem-label">
                            {t('bot.fields.notificationEmails')}
                            <Hint text={t('bot.help.notificationEmails')} />
                        </span>
                        <div className="bcem-chips">
                            {(form.notificationEmails || []).map((em) => (
                                <span key={em} className="bcem-chip">
                                    <span className="bcem-chip-text">{em}</span>
                                    <button
                                        type="button"
                                        className="bcem-chip-remove"
                                        onClick={() => removeEmail(em)}
                                        aria-label={`remove ${em}`}
                                    >
                                        <X size={12} aria-hidden="true" />
                                    </button>
                                </span>
                            ))}
                            <input
                                type="email"
                                className="bcem-chip-input"
                                value={emailInput}
                                onChange={(e) => { setEmailInput(e.target.value); setEmailError(''); }}
                                onKeyDown={handleEmailKey}
                                onBlur={addEmail}
                                placeholder={t('bot.placeholder.email')}
                            />
                        </div>
                        {emailError && <div className="bcem-email-error">{emailError}</div>}
                        {(!form.notificationEmails || form.notificationEmails.length === 0) && (
                            <div className="bcem-emails-fallback-hint">
                                {t('bot.notifications.fallbackHint')}
                            </div>
                        )}
                    </div>

                    {/* ── State ─────────────────────────────────────────── */}
                    <div className="bcem-section-title">{t('bot.section.state')}</div>

                    <label className="bcem-field">
                        <span className="bcem-label">
                            {t('bot.fields.status')}
                            <Hint text={t('bot.help.status')} />
                        </span>
                        <select
                            className="bcem-input"
                            value={form.status}
                            onChange={(e) => updateField('status', e.target.value)}
                        >
                            {STATUS_OPTIONS.map((s) => (
                                <option key={s} value={s}>{t(`card.status.${s}`)}</option>
                            ))}
                        </select>
                    </label>

                    <label className="bcem-checkbox">
                        <input
                            type="checkbox"
                            checked={form.useLlm}
                            onChange={(e) => updateField('useLlm', e.target.checked)}
                        />
                        <span>
                            {t('bot.fields.useLlm')}
                            <Hint text={t('bot.help.useLlm')} />
                        </span>
                    </label>

                    {isEdit && (
                        <div className="bcem-clear-row">
                            <button
                                type="button"
                                className="bcem-btn bcem-btn-warn"
                                onClick={() => setClearOpen(true)}
                                disabled={saving || clearPending}
                                title={t('confirm.clearFindings.help')}
                            >
                                <Eraser size={14} aria-hidden="true" />
                                <span>{t('card.actions.clearFindings')}</span>
                            </button>
                            <span className="bcem-clear-help">
                                {t('confirm.clearFindings.help')}
                            </span>
                        </div>
                    )}

                    <div className="bcem-actions">
                        <button
                            type="button"
                            className="bcem-btn bcem-btn-cancel"
                            onClick={() => !saving && onClose?.()}
                            disabled={saving}
                        >
                            {t('card.actions.cancel', 'Cancel')}
                        </button>
                        <button
                            type="submit"
                            className="bcem-btn bcem-btn-primary"
                            disabled={saving || !form.name.trim()}
                        >
                            {saving ? '...' : t('card.actions.save', 'Save')}
                        </button>
                    </div>
                </form>
            </div>

            <DeleteConfirmModal
                open={clearOpen}
                variant="primary"
                title={t('confirm.clearFindings.title')}
                message={t('confirm.clearFindings.message')}
                cancelLabel={t('card.actions.cancel', 'Cancel')}
                confirmLabel={t('card.actions.clearFindings')}
                loading={clearPending}
                onCancel={() => setClearOpen(false)}
                onConfirm={confirmClear}
            />
        </div>
    ), document.body);
};

export default BotEditModal;
