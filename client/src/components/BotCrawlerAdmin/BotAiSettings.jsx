import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Save, Sparkles, RotateCcw, Play, Loader2, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { useCrawlerContext } from '../contexts/CrawlerContext';
import { notify } from '../../utils/notify.jsx';
import './botAiSettings.css';

/**
 * BotAiSettings — prefix `bcai-`. Phase 4 LLM scoring controls for a single
 * bot: on/off toggle, model picker, prompts editor, cost cap, daily stats,
 * and a live "Test on sample" button that shows the exact prompt + response
 * before flipping AI scoring on for real findings.
 */
const BotAiSettings = ({ bot, onChanged }) => {
  const { t } = useTranslation('botCrawler');
  const {
    updateBot,
    getLlmModels,
    testLlmScoring,
    resetLlmCounters,
    listFindings,
  } = useCrawlerContext();

  const [form, setForm] = useState(() => buildFormFromBot(bot));
  const [models, setModels] = useState([]);
  const [defaultPrompt, setDefaultPrompt] = useState('');
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [resetting, setResetting] = useState(false);
  const [recentFindings, setRecentFindings] = useState([]);
  const [pickedFindingId, setPickedFindingId] = useState('');

  useEffect(() => { setForm(buildFormFromBot(bot)); }, [bot]);

  // Load model catalog + the system-prompt default once.
  useEffect(() => {
    (async () => {
      try {
        const data = await getLlmModels();
        setModels(Array.isArray(data?.items) ? data.items : []);
        if (data?.defaultSystemPrompt) setDefaultPrompt(data.defaultSystemPrompt);
      } catch { /* ignored */ }
    })();
  }, [getLlmModels]);

  // Pull recent findings so admin can pick one to test against. Limit kept
  // generous so dropdown is useful but not unwieldy. No status filter — admin
  // may want to test on a dismissed finding to verify AI agreement, or on
  // a used one to recheck after prompt edits.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await listFindings({ botId: bot.id, page: 1, limit: 50 });
        if (!cancelled) setRecentFindings(Array.isArray(data?.items) ? data.items : []);
      } catch { /* ignored */ }
    })();
    return () => { cancelled = true; };
  }, [bot.id, listFindings]);

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));
  const usingCustomPrompt = !!form.llmSystemPrompt;

  const selectedModelMeta = useMemo(
    () => models.find((m) => m.id === form.llmModel) || null,
    [models, form.llmModel],
  );

  // Estimate "we have $X left today" — defensive against null.
  const costToday = Number(bot.llmCostToday) || 0;
  const costCap = Number(form.llmDailyCostCap) || 0;
  const costPercent = costCap > 0 ? Math.min(100, Math.round((costToday / costCap) * 100)) : 0;
  const costColor = costPercent >= 90 ? '#ef4444' : costPercent >= 60 ? '#f59e0b' : '#10b981';

  const handleSave = async (e) => {
    e?.preventDefault();
    setSaving(true);
    try {
      await updateBot(bot.id, {
        useLlm: form.useLlm,
        llmModel: form.llmModel,
        llmMinScore: parseInt(form.llmMinScore, 10),
        llmAutoDismiss: form.llmAutoDismiss,
        llmTemperature: Number(form.llmTemperature),
        llmMaxTokens: parseInt(form.llmMaxTokens, 10),
        llmSystemPrompt: form.llmSystemPrompt || null,
        llmExtraInstructions: form.llmExtraInstructions || null,
        llmDailyCostCap: Number(form.llmDailyCostCap),
      });
      notify('success', null, t('toast.botUpdated'));
      onChanged?.();
    } catch {
      // toasted by context
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefaults = () => {
    if (!defaultPrompt) return;
    update('llmSystemPrompt', null);
  };

  const handleResetCounters = async () => {
    setResetting(true);
    try {
      await resetLlmCounters(bot.id);
      notify('success', null, t('ai.toast.countersReset'));
      onChanged?.();
    } catch { /* toasted */ } finally {
      setResetting(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const overrides = {
        llmModel: form.llmModel,
        llmTemperature: Number(form.llmTemperature),
        llmMaxTokens: parseInt(form.llmMaxTokens, 10),
        llmSystemPrompt: form.llmSystemPrompt || null,
        llmExtraInstructions: form.llmExtraInstructions || null,
      };
      const payload = pickedFindingId
        ? { findingId: parseInt(pickedFindingId, 10), overrides }
        : { overrides };
      const res = await testLlmScoring(bot.id, payload);
      setTestResult(res);
      onChanged?.(); // counters changed
    } catch { /* toasted */ } finally {
      setTesting(false);
    }
  };

  return (
    <div className="bcai-wrap">
      <form className="bcai-form" onSubmit={handleSave}>
        {/* ── Master toggle ───────────────────────────────────── */}
        <div className="bcai-section bcai-section-master">
          <label className="bcai-toggle">
            <input
              type="checkbox"
              checked={form.useLlm}
              onChange={(e) => update('useLlm', e.target.checked)}
            />
            <Sparkles size={18} aria-hidden="true" />
            <span className="bcai-toggle-label">{t('ai.master.label')}</span>
          </label>
          <p className="bcai-section-desc">{t('ai.master.desc')}</p>
        </div>

        {/* ── Model + cost cap ──────────────────────────────── */}
        <div className="bcai-section">
          <h3 className="bcai-section-title">{t('ai.model.title')}</h3>

          <label className="bcai-field">
            <span className="bcai-label">{t('ai.fields.model')}</span>
            <select
              className="bcai-input"
              value={form.llmModel}
              onChange={(e) => update('llmModel', e.target.value)}
            >
              {models.length === 0 && <option value={form.llmModel}>{form.llmModel}</option>}
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label} (${m.inputPricePer1M}/1M in, ${m.outputPricePer1M}/1M out)
                </option>
              ))}
            </select>
          </label>

          <div className="bcai-field-row">
            <label className="bcai-field bcai-field-half">
              <span className="bcai-label">{t('ai.fields.dailyCostCap')}</span>
              <div className="bcai-input-with-prefix">
                <span className="bcai-input-prefix">$</span>
                <input
                  type="number"
                  className="bcai-input"
                  min={0}
                  step={0.5}
                  value={form.llmDailyCostCap}
                  onChange={(e) => update('llmDailyCostCap', e.target.value)}
                />
              </div>
              <span className="bcai-help">{t('ai.help.dailyCostCap')}</span>
            </label>
            <label className="bcai-field bcai-field-half">
              <span className="bcai-label">{t('ai.fields.maxTokens')}</span>
              <input
                type="number"
                className="bcai-input"
                min={50}
                max={2000}
                step={50}
                value={form.llmMaxTokens}
                onChange={(e) => update('llmMaxTokens', e.target.value)}
              />
              <span className="bcai-help">{t('ai.help.maxTokens')}</span>
            </label>
          </div>

          <label className="bcai-field">
            <span className="bcai-label">
              {t('ai.fields.temperature')}: <strong>{Number(form.llmTemperature).toFixed(2)}</strong>
            </span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={form.llmTemperature}
              onChange={(e) => update('llmTemperature', e.target.value)}
              className="bcai-range"
            />
            <span className="bcai-help">{t('ai.help.temperature')}</span>
          </label>
        </div>

        {/* ── Min score + auto-dismiss ─────────────────────── */}
        <div className="bcai-section">
          <h3 className="bcai-section-title">{t('ai.scoring.title')}</h3>

          <label className="bcai-field">
            <span className="bcai-label">
              {t('ai.fields.minScore')}: <strong>{form.llmMinScore}</strong>
            </span>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={form.llmMinScore}
              onChange={(e) => update('llmMinScore', e.target.value)}
              className="bcai-range"
            />
            <span className="bcai-help">{t('ai.help.minScore')}</span>
          </label>

          <label className="bcai-checkbox">
            <input
              type="checkbox"
              checked={form.llmAutoDismiss}
              onChange={(e) => update('llmAutoDismiss', e.target.checked)}
            />
            <span>{t('ai.fields.autoDismiss')}</span>
          </label>
          <p className="bcai-help">{t('ai.help.autoDismiss')}</p>
        </div>

        {/* ── Prompts editor ────────────────────────────────── */}
        <div className="bcai-section">
          <div className="bcai-section-title-row">
            <h3 className="bcai-section-title">{t('ai.prompt.title')}</h3>
            {usingCustomPrompt && (
              <button
                type="button"
                className="bcai-btn bcai-btn-ghost"
                onClick={handleResetToDefaults}
                title={t('ai.prompt.resetToDefault')}
              >
                <RotateCcw size={14} aria-hidden="true" />
                <span>{t('ai.prompt.resetToDefault')}</span>
              </button>
            )}
          </div>

          <label className="bcai-field">
            <span className="bcai-label">{t('ai.fields.systemPrompt')}</span>
            <textarea
              className="bcai-textarea"
              rows={12}
              value={form.llmSystemPrompt ?? defaultPrompt}
              onChange={(e) => update('llmSystemPrompt', e.target.value)}
              placeholder={defaultPrompt}
            />
            <span className="bcai-help">{t('ai.help.systemPrompt')}</span>
          </label>

          <label className="bcai-field">
            <span className="bcai-label">{t('ai.fields.extraInstructions')}</span>
            <textarea
              className="bcai-textarea"
              rows={5}
              value={form.llmExtraInstructions || ''}
              onChange={(e) => update('llmExtraInstructions', e.target.value)}
              placeholder={t('ai.placeholder.extraInstructions')}
            />
            <span className="bcai-help">{t('ai.help.extraInstructions')}</span>
          </label>
        </div>

        {/* ── Live test ─────────────────────────────────────── */}
        <div className="bcai-section bcai-section-test">
          <h3 className="bcai-section-title">{t('ai.test.title')}</h3>
          <p className="bcai-section-desc">{t('ai.test.desc')}</p>

          <div className="bcai-test-controls">
            <label className="bcai-field bcai-field-grow">
              <span className="bcai-label">{t('ai.test.pickFinding')}</span>
              <select
                className="bcai-input"
                value={pickedFindingId}
                onChange={(e) => setPickedFindingId(e.target.value)}
              >
                <option value="">{t('ai.test.useSample')}</option>
                {recentFindings.map((f) => (
                  <option key={f.id} value={f.id}>
                    {(f.title || '(no title)').slice(0, 80)}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              className="bcai-btn bcai-btn-primary"
              onClick={handleTest}
              disabled={testing}
            >
              {testing ? (
                <>
                  <Loader2 size={14} className="bcai-spin" aria-hidden="true" />
                  <span>{t('ai.test.running')}</span>
                </>
              ) : (
                <>
                  <Play size={14} aria-hidden="true" />
                  <span>{t('ai.test.run')}</span>
                </>
              )}
            </button>
          </div>

          {testResult && (
            <div className={`bcai-test-result ${testResult.error ? 'bcai-test-error' : ''}`}>
              <div className="bcai-test-row">
                {testResult.error ? (
                  <>
                    <AlertCircle size={18} aria-hidden="true" />
                    <strong>{t('ai.test.error')}: {testResult.error}</strong>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} aria-hidden="true" />
                    <strong>{t('ai.test.score')}: {testResult.score ?? '—'}</strong>
                  </>
                )}
              </div>
              {testResult.reasoning && (
                <div className="bcai-test-block">
                  <span className="bcai-test-block-label">{t('ai.test.reasoning')}:</span>
                  <p>{testResult.reasoning}</p>
                </div>
              )}
              <div className="bcai-test-stats">
                <span>{t('ai.test.tokensIn')}: <strong>{testResult.tokensIn}</strong></span>
                <span>{t('ai.test.tokensOut')}: <strong>{testResult.tokensOut}</strong></span>
                <span>{t('ai.test.cost')}: <strong>${(testResult.costUsd || 0).toFixed(4)}</strong></span>
              </div>
              {testResult.systemPromptPreview && (
                <details className="bcai-test-block">
                  <summary>{t('ai.test.showPrompt')}</summary>
                  <pre className="bcai-test-pre">{testResult.systemPromptPreview}</pre>
                  <hr />
                  <pre className="bcai-test-pre">{testResult.userPromptPreview}</pre>
                </details>
              )}
            </div>
          )}
        </div>

        {/* ── Save button ───────────────────────────────────── */}
        <div className="bcai-actions">
          <button
            type="submit"
            className="bcai-btn bcai-btn-primary bcai-btn-large"
            disabled={saving}
          >
            <Save size={16} aria-hidden="true" />
            <span>{saving ? '...' : t('card.actions.save')}</span>
          </button>
        </div>
      </form>

      {/* ── Live stats panel ─────────────────────────────── */}
      <aside className="bcai-stats">
        <h3 className="bcai-stats-title">{t('ai.stats.title')}</h3>
        <div className="bcai-stat-row">
          <span className="bcai-stat-label">{t('ai.stats.tokensIn')}</span>
          <span className="bcai-stat-value">{(bot.llmTokensInToday ?? 0).toLocaleString()}</span>
        </div>
        <div className="bcai-stat-row">
          <span className="bcai-stat-label">{t('ai.stats.tokensOut')}</span>
          <span className="bcai-stat-value">{(bot.llmTokensOutToday ?? 0).toLocaleString()}</span>
        </div>
        <div className="bcai-stat-row">
          <span className="bcai-stat-label">{t('ai.stats.costToday')}</span>
          <span className="bcai-stat-value">${costToday.toFixed(4)} / ${costCap.toFixed(2)}</span>
        </div>
        <div className="bcai-stat-bar">
          <div className="bcai-stat-bar-fill" style={{ width: `${costPercent}%`, background: costColor }} />
        </div>
        <button
          type="button"
          className="bcai-btn bcai-btn-ghost bcai-stats-reset"
          onClick={handleResetCounters}
          disabled={resetting}
        >
          <RefreshCw size={14} aria-hidden="true" />
          <span>{t('ai.stats.reset')}</span>
        </button>
        {selectedModelMeta && (
          <div className="bcai-stat-model-info">
            <span className="bcai-stat-model-label">{t('ai.stats.modelInfo')}</span>
            <span>${selectedModelMeta.inputPricePer1M}/1M input</span>
            <span>${selectedModelMeta.outputPricePer1M}/1M output</span>
          </div>
        )}
      </aside>
    </div>
  );
};

const buildFormFromBot = (bot) => ({
  useLlm: !!bot.useLlm,
  llmModel: bot.llmModel || 'claude-haiku-4-5',
  llmMinScore: bot.llmMinScore ?? 40,
  llmAutoDismiss: bot.llmAutoDismiss !== false,
  llmTemperature: bot.llmTemperature ?? 0,
  llmMaxTokens: bot.llmMaxTokens ?? 300,
  llmSystemPrompt: bot.llmSystemPrompt || null,
  llmExtraInstructions: bot.llmExtraInstructions || null,
  llmDailyCostCap: bot.llmDailyCostCap ?? 1.0,
});

export default BotAiSettings;
