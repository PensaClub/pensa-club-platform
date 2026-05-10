import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Trash2, Save, X, Eraser, EyeOff, CheckSquare, AlertTriangle } from 'lucide-react';
import { useCrawlerContext } from '../contexts/CrawlerContext';
import { useLocalizedNavigate } from '../../hooks/useLocalizedNavigate';
import { notify } from '../../utils/notify.jsx';
import DeleteConfirmModal from '../Articles/AdminArticles/DeleteConfirmModal/DeleteConfirmModal';
import './botSettings.css';

const STATUS_OPTIONS = ['active', 'paused', 'archived'];

/**
 * BotSettings — prefix `bcs-`. Inline (non-modal) edit form for a bot.
 * Mirrors BotEditModal field-set but with an explicit Save button and a
 * dangerous "Delete bot" CTA at the bottom.
 */
const BotSettings = ({ bot, onChanged }) => {
  const { t } = useTranslation('botCrawler');
  const { updateBot, deleteBot, clearBotFindings, bulkClearFindings } = useCrawlerContext();
  const navigate = useLocalizedNavigate();

  const [form, setForm] = useState(() => ({
    name: bot.name || '',
    description: bot.description || '',
    scheduleCron: bot.scheduleCron || '0 * * * *',
    keywords: Array.isArray(bot.criteria?.keywords) ? [...bot.criteria.keywords] : [],
    match: bot.criteria?.match || 'any',
    caseSensitive: !!bot.criteria?.caseSensitive,
    status: bot.status || 'active',
    useLlm: !!bot.useLlm,
    lookBackDays: Number.isFinite(bot.lookBackDays) ? String(bot.lookBackDays) : '',
  }));
  const [keywordInput, setKeywordInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePending, setDeletePending] = useState(false);
  const [clearOpen, setClearOpen] = useState(false);
  const [clearPending, setClearPending] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(null); // 'dismissed' | 'used' | null
  const [bulkPending, setBulkPending] = useState(false);
  const [usedMonths, setUsedMonths] = useState(6);

  useEffect(() => {
    setForm({
      name: bot.name || '',
      description: bot.description || '',
      scheduleCron: bot.scheduleCron || '0 * * * *',
      keywords: Array.isArray(bot.criteria?.keywords) ? [...bot.criteria.keywords] : [],
      match: bot.criteria?.match || 'any',
      caseSensitive: !!bot.criteria?.caseSensitive,
      status: bot.status || 'active',
      useLlm: !!bot.useLlm,
      lookBackDays: Number.isFinite(bot.lookBackDays) ? String(bot.lookBackDays) : '',
    });
  }, [bot]);

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const addKeyword = () => {
    const v = keywordInput.trim();
    if (!v) return;
    if (!form.keywords.includes(v)) {
      setForm((prev) => ({ ...prev, keywords: [...prev.keywords, v] }));
    }
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

  const handleSave = async (e) => {
    e?.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      scheduleCron: form.scheduleCron.trim() || null,
      criteria: {
        keywords: form.keywords,
        match: form.match,
        caseSensitive: form.caseSensitive,
      },
      status: form.status,
      useLlm: form.useLlm,
      lookBackDays: form.lookBackDays === '' ? null : parseInt(form.lookBackDays, 10),
    };
    try {
      await updateBot(bot.id, payload);
      notify('success', null, t('toast.botUpdated'));
      onChanged?.();
    } catch {
      // toasted by context
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    setDeletePending(true);
    try {
      await deleteBot(bot.id);
      notify('success', null, t('toast.botDeleted'));
      navigate('/admin/bot-crawler');
    } catch {
      // toasted
    } finally {
      setDeletePending(false);
    }
  };

  const confirmClear = async () => {
    setClearPending(true);
    try {
      const res = await clearBotFindings(bot.id);
      notify('success', null, t('toast.findingsCleared', { count: res?.deleted || 0 }));
      setClearOpen(false);
      onChanged?.();
    } catch {
      // toasted
    } finally {
      setClearPending(false);
    }
  };

  const confirmBulk = async () => {
    if (!bulkOpen) return;
    setBulkPending(true);
    try {
      const payload = bulkOpen === 'used'
        ? { mode: 'used-older-than', monthsOld: parseInt(usedMonths, 10) || 6 }
        : { mode: 'dismissed' };
      const res = await bulkClearFindings(bot.id, payload);
      notify('success', null, t('toast.findingsCleared', { count: res?.deleted || 0 }));
      setBulkOpen(null);
      onChanged?.();
    } catch {
      // toasted
    } finally {
      setBulkPending(false);
    }
  };

  return (
    <div className="bcs-wrap">
      <form className="bcs-form" onSubmit={handleSave}>
        <label className="bcs-field">
          <span className="bcs-label">{t('bot.fields.name')}</span>
          <input
            type="text"
            className="bcs-input"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            required
            maxLength={200}
          />
        </label>

        <label className="bcs-field">
          <span className="bcs-label">{t('bot.fields.description')}</span>
          <textarea
            className="bcs-textarea"
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            rows={3}
            maxLength={1000}
          />
        </label>

        <label className="bcs-field">
          <span className="bcs-label">{t('bot.fields.schedule')}</span>
          <input
            type="text"
            className="bcs-input"
            value={form.scheduleCron}
            onChange={(e) => update('scheduleCron', e.target.value)}
            placeholder="0 * * * *"
          />
          <span className="bcs-help">{t('bot.scheduleHelp')}</span>
        </label>

        <div className="bcs-field">
          <span className="bcs-label">{t('bot.fields.keywords')}</span>
          <div className="bcs-chips">
            {form.keywords.map((kw) => (
              <span key={kw} className="bcs-chip">
                <span className="bcs-chip-text">{kw}</span>
                <button
                  type="button"
                  className="bcs-chip-remove"
                  onClick={() => removeKeyword(kw)}
                  aria-label={`remove ${kw}`}
                >
                  <X size={12} aria-hidden="true" />
                </button>
              </span>
            ))}
            <input
              type="text"
              className="bcs-chip-input"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyDown={handleKeywordKey}
              onBlur={addKeyword}
            />
          </div>
        </div>

        <fieldset className="bcs-field bcs-fieldset">
          <legend className="bcs-label">{t('bot.fields.match')}</legend>
          <div className="bcs-radio-row">
            <label className="bcs-radio">
              <input
                type="radio"
                name="bcs-match"
                checked={form.match === 'any'}
                onChange={() => update('match', 'any')}
              />
              <span>{t('bot.match.any')}</span>
            </label>
            <label className="bcs-radio">
              <input
                type="radio"
                name="bcs-match"
                checked={form.match === 'all'}
                onChange={() => update('match', 'all')}
              />
              <span>{t('bot.match.all')}</span>
            </label>
          </div>
        </fieldset>

        <label className="bcs-checkbox">
          <input
            type="checkbox"
            checked={form.caseSensitive}
            onChange={(e) => update('caseSensitive', e.target.checked)}
          />
          <span>{t('bot.fields.caseSensitive')}</span>
        </label>

        <label className="bcs-field">
          <span className="bcs-label">{t('bot.fields.lookBackDays')}</span>
          <select
            className="bcs-input"
            value={form.lookBackDays}
            onChange={(e) => update('lookBackDays', e.target.value)}
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
          <span className="bcs-help">{t('bot.help.lookBackDays')}</span>
        </label>

        <label className="bcs-field">
          <span className="bcs-label">{t('bot.fields.status')}</span>
          <select
            className="bcs-input"
            value={form.status}
            onChange={(e) => update('status', e.target.value)}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{t(`card.status.${s}`)}</option>
            ))}
          </select>
        </label>

        <label className="bcs-checkbox">
          <input
            type="checkbox"
            checked={form.useLlm}
            onChange={(e) => update('useLlm', e.target.checked)}
          />
          <span>{t('bot.fields.useLlm')}</span>
        </label>

        <div className="bcs-actions">
          <button type="submit" className="bcs-btn bcs-btn-primary" disabled={saving || !form.name.trim()}>
            <Save size={16} aria-hidden="true" />
            <span>{saving ? '...' : t('card.actions.save', 'Save')}</span>
          </button>
        </div>
      </form>

      <div className="bcs-cleanup-zone">
        <div className="bcs-cleanup-title">{t('cleanup.zone.title')}</div>
        <p className="bcs-cleanup-desc">{t('cleanup.zone.desc')}</p>

        <div className="bcs-cleanup-buttons">
          <button
            type="button"
            className="bcs-btn bcs-btn-soft"
            onClick={() => setBulkOpen('dismissed')}
            title={t('cleanup.dismissed.help')}
          >
            <EyeOff size={16} aria-hidden="true" />
            <span>{t('cleanup.dismissed.button')}</span>
          </button>

          <div className="bcs-cleanup-row">
            <button
              type="button"
              className="bcs-btn bcs-btn-soft"
              onClick={() => setBulkOpen('used')}
              title={t('cleanup.used.help')}
            >
              <CheckSquare size={16} aria-hidden="true" />
              <span>{t('cleanup.used.button', { months: usedMonths })}</span>
            </button>
            <label className="bcs-cleanup-months">
              <span className="bcs-cleanup-months-label">{t('cleanup.used.monthsLabel')}</span>
              <input
                type="number"
                className="bcs-cleanup-months-input"
                min={1}
                max={120}
                value={usedMonths}
                onChange={(e) => setUsedMonths(e.target.value)}
              />
            </label>
          </div>

          <button
            type="button"
            className="bcs-btn bcs-btn-warn"
            onClick={() => setClearOpen(true)}
            title={t('confirm.clearFindings.help')}
          >
            <Eraser size={16} aria-hidden="true" />
            <span>{t('card.actions.clearFindings')}</span>
          </button>
        </div>
      </div>

      <div className="bcs-danger-zone">
        <h3 className="bcs-danger-title">{t('confirm.deleteBot.title')}</h3>
        <p className="bcs-danger-desc">{t('confirm.deleteBot.message', { name: bot.name })}</p>
        <button
          type="button"
          className="bcs-btn bcs-btn-danger"
          onClick={() => setDeleteOpen(true)}
        >
          <Trash2 size={16} aria-hidden="true" />
          <span>{t('card.actions.delete')}</span>
        </button>
      </div>

      <DeleteConfirmModal
        open={deleteOpen}
        title={t('confirm.deleteBot.title')}
        message={t('confirm.deleteBot.message', { name: bot.name })}
        cancelLabel={t('card.actions.cancel', 'Cancel')}
        confirmLabel={t('card.actions.delete')}
        loading={deletePending}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={confirmDelete}
      />

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

      <DeleteConfirmModal
        open={bulkOpen === 'dismissed'}
        variant="primary"
        title={t('cleanup.dismissed.confirmTitle')}
        message={t('cleanup.dismissed.confirmMessage')}
        cancelLabel={t('card.actions.cancel', 'Cancel')}
        confirmLabel={t('cleanup.dismissed.button')}
        loading={bulkPending}
        onCancel={() => setBulkOpen(null)}
        onConfirm={confirmBulk}
      />

      <DeleteConfirmModal
        open={bulkOpen === 'used'}
        variant="primary"
        title={t('cleanup.used.confirmTitle')}
        message={t('cleanup.used.confirmMessage', { months: usedMonths })}
        cancelLabel={t('card.actions.cancel', 'Cancel')}
        confirmLabel={t('cleanup.used.confirmButton')}
        loading={bulkPending}
        onCancel={() => setBulkOpen(null)}
        onConfirm={confirmBulk}
      />
    </div>
  );
};

export default BotSettings;
