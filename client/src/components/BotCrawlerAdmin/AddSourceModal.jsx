import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import {
  X,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from 'lucide-react';
import { useCrawlerContext } from '../contexts/CrawlerContext';
import './addSourceModal.css';

const SOURCE_TYPES = ['auto', 'rss', 'html'];

const SELECTOR_FIELDS = ['item', 'title', 'link', 'image', 'description', 'published'];

const EMPTY_SELECTORS = {
  item: '',
  title: '',
  link: '',
  image: '',
  description: '',
  published: '',
};

const DEFAULT_FORM = {
  name: '',
  url: '',
  sourceType: 'auto',
  active: true,
  robotsCrawlDelay: 0,
  maxPages: 1,
};

/**
 * Trim every string in a selectors object and drop empty values, so we
 * never send `{ image: '' }` to the backend.
 */
const cleanSelectors = (selectors) => {
  if (!selectors || typeof selectors !== 'object') return null;
  const out = {};
  for (const key of SELECTOR_FIELDS) {
    const v = selectors[key];
    if (typeof v === 'string' && v.trim()) out[key] = v.trim();
  }
  return Object.keys(out).length ? out : null;
};

/**
 * Try to derive a sensible default name from the validation result so
 * the user doesn't have to type one.
 */
const suggestName = (validation, url) => {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return validation?.resolvedFeedUrl || '';
  }
};

/**
 * AddSourceModal — prefix `bcasm-`. React-portal modal for adding a
 * new source to a bot, Phase 2 with inline validation + preview.
 *
 * Flow:
 *  1. User pastes a URL and clicks "Тествай".
 *  2. Backend returns detectedType, robots status, samples.
 *  3. UI renders a green/yellow/red result card.
 *  4. "Save source" is enabled on success (or admin can save anyway).
 *  5. Advanced section lets the user override sourceType, edit selectors
 *     for HTML pages, and re-test before saving.
 */
const AddSourceModal = ({ open, onClose, onSave, source = null }) => {
  const { t } = useTranslation('botCrawler');
  const { validateSourceUrl } = useCrawlerContext();

  const isEdit = !!source;

  const [form, setForm] = useState(DEFAULT_FORM);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [selectorMode, setSelectorMode] = useState('auto'); // 'auto' | 'custom'
  const [selectors, setSelectors] = useState(EMPTY_SELECTORS);
  const [validation, setValidation] = useState(null); // last response body (ok or err)
  const [validating, setValidating] = useState(false);
  const [saving, setSaving] = useState(false);
  const firstFieldRef = useRef(null);

  // Hydrate from `source` when editing; reset to defaults when adding new.
  useEffect(() => {
    if (!open) return undefined;
    if (isEdit) {
      setForm({
        name: source.name || '',
        url: source.url || '',
        sourceType: source.sourceType || 'auto',
        active: source.active !== false,
        robotsCrawlDelay: source.robotsCrawlDelay || 0,
        maxPages: source.maxPages || 1,
      });
      const hasSelectors = source.htmlSelectors
        && typeof source.htmlSelectors === 'object'
        && Object.keys(source.htmlSelectors).length;
      setSelectorMode(hasSelectors ? 'custom' : 'auto');
      setSelectors(hasSelectors ? { ...EMPTY_SELECTORS, ...source.htmlSelectors } : EMPTY_SELECTORS);
      setAdvancedOpen(true); // open advanced by default in edit mode
    } else {
      setForm(DEFAULT_FORM);
      setSelectorMode('auto');
      setSelectors(EMPTY_SELECTORS);
      setAdvancedOpen(false);
    }
    setValidation(null);
    setValidating(false);
    setSaving(false);
    const id = window.requestAnimationFrame(() => firstFieldRef.current?.focus());
    return () => window.cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, source?.id]);

  useEffect(() => {
    if (!open) return undefined;
    const handler = (e) => {
      if (e.key === 'Escape' && !saving && !validating) {
        e.preventDefault();
        onClose?.();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, saving, validating, onClose]);

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const detectedType = validation?.detectedType || null;
  const isHtml = detectedType === 'html' || form.sourceType === 'html';

  const validationOk = !!validation && validation.ok === true;

  const canSave = useMemo(() => {
    if (saving || validating) return false;
    if (!form.url.trim()) return false;
    return true;
  }, [saving, validating, form.url]);

  // The "Save source" primary button is enabled only after a successful
  // validation. The "Save without validating" escape hatch always works
  // once a URL is filled.
  const canSavePrimary = canSave && validationOk;

  const runValidation = async (overrideSelectors = null) => {
    if (!form.url.trim()) return;
    setValidating(true);
    setValidation(null);
    try {
      const payload = {
        url: form.url.trim(),
        sourceType: form.sourceType || 'auto',
      };
      const cleaned = cleanSelectors(overrideSelectors ?? (selectorMode === 'custom' ? selectors : null));
      if (cleaned) payload.htmlSelectors = cleaned;
      const result = await validateSourceUrl(payload);
      setValidation(result || { ok: false, code: 'NETWORK_ERROR' });

      // If the backend returned discovered selectors and we're in auto
      // mode, seed the editor with them so toggling "Custom" shows them.
      if (result?.ok && result?.selectors && selectorMode === 'auto') {
        setSelectors({ ...EMPTY_SELECTORS, ...result.selectors });
      }

      // Auto-fill the name field on first successful validation.
      if (result?.ok && !form.name.trim()) {
        const suggested = suggestName(result, form.url.trim());
        if (suggested) update('name', suggested);
      }
    } finally {
      setValidating(false);
    }
  };

  const buildPayload = () => {
    const mp = parseInt(form.maxPages, 10);
    const payload = {
      name: form.name.trim() || suggestName(validation, form.url.trim()) || form.url.trim(),
      url: form.url.trim(),
      sourceType: form.sourceType || 'auto',
      active: form.active,
      robotsCrawlDelay: Number.isFinite(Number(form.robotsCrawlDelay))
        ? Number(form.robotsCrawlDelay)
        : 0,
      maxPages: Number.isFinite(mp) && mp >= 1 ? Math.min(mp, 50) : 1,
    };
    if (isHtml) {
      const cleaned = cleanSelectors(selectorMode === 'custom' ? selectors : (validation?.selectors || null));
      if (cleaned) payload.htmlSelectors = cleaned;
    }
    return payload;
  };

  const submit = async (skipValidation = false) => {
    if (!form.url.trim()) return;
    if (!skipValidation && !validationOk) return;
    setSaving(true);
    try {
      await onSave?.(buildPayload());
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!canSavePrimary) return;
    submit(false);
  };

  if (!open) return null;

  return createPortal((
    <div
      className="bcasm-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bcasm-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !saving && !validating) onClose?.();
      }}
    >
      <div className="bcasm-card" onClick={(e) => e.stopPropagation()}>
        <div className="bcasm-head">
          <h2 id="bcasm-title" className="bcasm-title">
            {isEdit ? t('source.edit', 'Редактирай източник') : t('source.add', 'Добави източник')}
          </h2>
          <button
            type="button"
            className="bcasm-close"
            onClick={() => !saving && !validating && onClose?.()}
            aria-label="Close"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <form className="bcasm-form" onSubmit={handleSubmit}>
          {/* ---------------- Step 1: URL + Test ---------------- */}
          <label className="bcasm-field">
            <span className="bcasm-label">{t('source.fields.url')}</span>
            <div className="bcasm-url-row">
              <input
                ref={firstFieldRef}
                type="url"
                className="bcasm-input bcasm-url-input"
                value={form.url}
                onChange={(e) => {
                  update('url', e.target.value);
                  // Invalidate previous validation when URL changes.
                  if (validation) setValidation(null);
                }}
                placeholder="https://example.com/feed.xml"
                required
              />
              <button
                type="button"
                className="bcasm-btn bcasm-btn-secondary bcasm-test-btn"
                onClick={() => runValidation()}
                disabled={validating || saving || !form.url.trim()}
              >
                {validating ? (
                  <>
                    <Loader2 size={16} className="bcasm-spin" aria-hidden="true" />
                    <span>{t('source.validation.loading')}</span>
                  </>
                ) : (
                  <span>{t('source.validation.button')}</span>
                )}
              </button>
            </div>
          </label>

          {/* ---------------- Validation result card ---------------- */}
          {validation && (
            <ValidationResultCard
              t={t}
              validation={validation}
            />
          )}

          {/* ---------------- Advanced settings ---------------- */}
          <button
            type="button"
            className="bcasm-advanced-toggle"
            onClick={() => setAdvancedOpen((v) => !v)}
            aria-expanded={advancedOpen}
          >
            {advancedOpen ? <ChevronUp size={16} aria-hidden="true" /> : <ChevronDown size={16} aria-hidden="true" />}
            <span>{t('source.advancedSettings')}</span>
          </button>

          {advancedOpen && (
            <div className="bcasm-advanced">
              <label className="bcasm-field">
                <span className="bcasm-label">{t('source.fields.name')}</span>
                <input
                  type="text"
                  className="bcasm-input"
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  maxLength={200}
                  placeholder={suggestName(validation, form.url) || ''}
                />
              </label>

              <fieldset className="bcasm-field bcasm-fieldset">
                <legend className="bcasm-label">{t('source.fields.sourceType')}</legend>
                <div className="bcasm-radio-row">
                  {SOURCE_TYPES.map((type) => (
                    <label key={type} className="bcasm-radio">
                      <input
                        type="radio"
                        name="sourceType"
                        value={type}
                        checked={form.sourceType === type}
                        onChange={() => update('sourceType', type)}
                      />
                      <span>{t(`source.type.${type}`)}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              {/* Selector editor — only meaningful for HTML sources. */}
              {isHtml && (
                <SelectorEditor
                  t={t}
                  mode={selectorMode}
                  setMode={setSelectorMode}
                  selectors={selectors}
                  setSelectors={setSelectors}
                  detectedSelectors={validation?.selectors || null}
                  onRetest={() => runValidation(selectors)}
                  validating={validating}
                />
              )}

              <label className="bcasm-field">
                <span className="bcasm-label">{t('source.fields.robotsCrawlDelay')}</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  className="bcasm-input"
                  value={form.robotsCrawlDelay}
                  onChange={(e) => update('robotsCrawlDelay', e.target.value)}
                />
              </label>

              <label className="bcasm-field">
                <span className="bcasm-label">{t('source.fields.maxPages')}</span>
                <input
                  type="number"
                  min="1"
                  max="50"
                  step="1"
                  className="bcasm-input"
                  value={form.maxPages}
                  onChange={(e) => update('maxPages', e.target.value)}
                />
                <span className="bcasm-help">{t('source.help.maxPages')}</span>
              </label>

              <label className="bcasm-checkbox">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => update('active', e.target.checked)}
                />
                <span>{t('source.fields.active')}</span>
              </label>
            </div>
          )}

          {/* ---------------- Actions ---------------- */}
          <div className="bcasm-actions">
            <button
              type="button"
              className="bcasm-btn bcasm-btn-cancel"
              onClick={() => !saving && !validating && onClose?.()}
              disabled={saving || validating}
            >
              {t('card.actions.cancel', 'Cancel')}
            </button>
            {!validationOk && form.url.trim() && (
              <button
                type="button"
                className="bcasm-btn bcasm-btn-ghost"
                onClick={() => submit(true)}
                disabled={saving || validating}
                title={t('source.validation.saveAnyway')}
              >
                {t('source.validation.saveAnyway')}
              </button>
            )}
            <button
              type="submit"
              className="bcasm-btn bcasm-btn-primary"
              disabled={!canSavePrimary}
            >
              {saving ? '...' : t('card.actions.save', 'Save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  ), document.body);
};

/**
 * Renders the colored validation result card. Green when ok + robots
 * allowed, yellow when ok + robots blocked (still proceedable), red
 * when the backend rejected the URL outright.
 */
const ValidationResultCard = ({ t, validation }) => {
  if (!validation) return null;

  const isError = validation.ok !== true;
  const robotsAllowed = validation?.robots?.allowed !== false;
  const isWarning = !isError && !robotsAllowed;
  const variant = isError ? 'error' : isWarning ? 'warning' : 'success';

  const Icon = variant === 'success' ? CheckCircle2 : variant === 'warning' ? AlertTriangle : XCircle;

  const code = validation?.code || (validation?.robots?.allowed === false ? 'BLOCKED_BY_ROBOTS' : null);
  const codeLabel = code ? t(`source.validation.errorCode.${code}`, code) : null;

  return (
    <div className={`bcasm-result bcasm-result-${variant}`} role="status">
      <div className="bcasm-result-head">
        <Icon size={18} aria-hidden="true" />
        <span className="bcasm-result-title">
          {isError
            ? (codeLabel || validation?.message || t('toast.error'))
            : isWarning
              ? t('source.validation.robotsWarning')
              : t('source.validation.status.ok')}
        </span>
      </div>

      {!isError && (
        <div className="bcasm-result-body">
          {validation?.detectedType && (
            <div className="bcasm-result-row">
              <span className="bcasm-result-label">{t('source.fields.sourceType')}:</span>
              <span className="bcasm-result-value">
                {t(`source.validation.detectedType.${validation.detectedType}`, validation.detectedType)}
              </span>
            </div>
          )}

          {validation?.resolvedFeedUrl && (
            <div className="bcasm-result-row">
              <span className="bcasm-result-label">RSS:</span>
              <a
                href={validation.resolvedFeedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bcasm-result-link"
              >
                <span>{validation.resolvedFeedUrl}</span>
                <ExternalLink size={12} aria-hidden="true" />
              </a>
            </div>
          )}

          <div className="bcasm-result-row">
            <span className="bcasm-result-label">robots.txt:</span>
            <span className="bcasm-result-value">
              {robotsAllowed
                ? t('source.validation.robotsAllowed')
                : t('source.validation.robotsBlocked')}
            </span>
          </div>

          {Number(validation?.robots?.crawlDelay) > 0 && (
            <div className="bcasm-result-row">
              <span className="bcasm-result-label">{t('source.fields.robotsCrawlDelay')}:</span>
              <span className="bcasm-result-value">
                {t('source.validation.crawlDelay', { seconds: validation.robots.crawlDelay })}
              </span>
            </div>
          )}

          <SamplesPreview t={t} samples={validation?.samples || []} />
        </div>
      )}

      {isError && validation?.message && codeLabel !== validation.message && (
        <div className="bcasm-result-body">
          <p className="bcasm-result-message">{validation.message}</p>
        </div>
      )}
    </div>
  );
};

/**
 * Compact list of the first N samples — thumbnail + title + source link.
 */
const SamplesPreview = ({ t, samples }) => {
  const items = Array.isArray(samples) ? samples.slice(0, 3) : [];
  return (
    <div className="bcasm-samples">
      <div className="bcasm-samples-title">{t('source.validation.samplesTitle')}</div>
      {items.length === 0 ? (
        <p className="bcasm-samples-empty">{t('source.validation.noSamples')}</p>
      ) : (
        <ul className="bcasm-samples-list">
          {items.map((sample, idx) => (
            <li key={`${sample.link || ''}-${idx}`} className="bcasm-sample">
              <div className="bcasm-sample-thumb">
                {sample.image ? (
                  <img
                    src={sample.image}
                    alt=""
                    loading="lazy"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                ) : null}
              </div>
              <div className="bcasm-sample-text">
                <div className="bcasm-sample-title">{sample.title || '—'}</div>
                {sample.link && (
                  <a
                    href={sample.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bcasm-sample-link"
                  >
                    <span>{sample.link}</span>
                    <ExternalLink size={11} aria-hidden="true" />
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

/**
 * CSS-selector editor for HTML sources. Two modes:
 *  - Auto-detect: read-only display of selectors returned by validation.
 *  - Custom: user-editable inputs for each field.
 * "Re-test" button re-runs validation with the current custom selectors.
 */
const SelectorEditor = ({
  t, mode, setMode, selectors, setSelectors, detectedSelectors, onRetest, validating,
}) => {
  const updateField = (field, value) => {
    setSelectors((prev) => ({ ...prev, [field]: value }));
  };

  const display = mode === 'auto' ? (detectedSelectors || EMPTY_SELECTORS) : selectors;

  return (
    <div className="bcasm-selectors">
      <div className="bcasm-selectors-head">
        <span className="bcasm-label">{t('source.selectors.title')}</span>
        <p className="bcasm-selectors-help">{t('source.selectors.help')}</p>
      </div>

      <div className="bcasm-selectors-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'auto'}
          className={`bcasm-tab ${mode === 'auto' ? 'bcasm-tab-active' : ''}`}
          onClick={() => setMode('auto')}
        >
          {t('source.selectors.modeAuto')}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'custom'}
          className={`bcasm-tab ${mode === 'custom' ? 'bcasm-tab-active' : ''}`}
          onClick={() => {
            setMode('custom');
            // Seed custom inputs from auto-detected on first switch.
            if (detectedSelectors) {
              setSelectors((prev) => {
                const next = { ...prev };
                let changed = false;
                for (const k of SELECTOR_FIELDS) {
                  if (!next[k] && detectedSelectors[k]) {
                    next[k] = detectedSelectors[k];
                    changed = true;
                  }
                }
                return changed ? next : prev;
              });
            }
          }}
        >
          {t('source.selectors.modeCustom')}
        </button>
      </div>

      <div className="bcasm-selectors-grid">
        {SELECTOR_FIELDS.map((field) => (
          <label key={field} className="bcasm-field">
            <span className="bcasm-label-sm">{t(`source.selectors.field.${field}`)}</span>
            <input
              type="text"
              className="bcasm-input bcasm-input-sm"
              value={display[field] || ''}
              onChange={(e) => updateField(field, e.target.value)}
              placeholder={t(`source.selectors.placeholder.${field}`)}
              readOnly={mode === 'auto'}
              disabled={mode === 'auto' && !detectedSelectors?.[field]}
            />
          </label>
        ))}
      </div>

      {mode === 'custom' && (
        <button
          type="button"
          className="bcasm-btn bcasm-btn-secondary bcasm-retest-btn"
          onClick={onRetest}
          disabled={validating}
        >
          {validating ? (
            <>
              <Loader2 size={14} className="bcasm-spin" aria-hidden="true" />
              <span>{t('source.validation.loading')}</span>
            </>
          ) : (
            <span>{t('source.selectors.retest')}</span>
          )}
        </button>
      )}
    </div>
  );
};

export default AddSourceModal;
