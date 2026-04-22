// src/components/SiteSettingsAdmin/NewsletterTemplateConfig/NewsletterTemplateConfig.jsx
// Prefix: ntc-
//
// Shared email-template editor (logo, colors, signature, header/footer HTML).
// Used in:
//   - AdminNewsletters → tab „Шаблони" (new tab, Phase 7.7)
//   - SiteSettingsAdmin → as a Section (Phase 7.8)
//
// Backend: GET /admin/email-template, PUT /admin/email-template

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Loader2,
  Save,
  RotateCcw,
  Image as ImageIcon,
  Palette,
  FileText,
  PenLine,
  Undo2,
  RefreshCw,
} from 'lucide-react';
import { useCommunityContext } from '../../contexts/CommunityContext';
import { notify } from '../../../utils/notify.jsx';
import './newsletterTemplateConfig.css';

const FIELDS = [
  'headerHtml',
  'footerHtml',
  'logoUrl',
  'primaryColor',
  'secondaryColor',
  'signature',
];

const sanitizeHex = (val) => {
  if (!val) return '';
  const v = String(val).trim();
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v)) return v;
  return v;
};

export const NewsletterTemplateConfig = () => {
  const { t } = useTranslation('emailTemplateSettings');
  const { getAdminEmailTemplate, updateAdminEmailTemplate } =
    useCommunityContext();

  const [loaded, setLoaded] = useState(null); // server snapshot
  const [form, setForm] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const fetchTemplate = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAdminEmailTemplate();
      const item = data?.item || {};
      setLoaded(item);
      setForm({
        headerHtml: item.headerHtml || '',
        footerHtml: item.footerHtml || '',
        logoUrl: item.logoUrl || '',
        primaryColor: item.primaryColor || '',
        secondaryColor: item.secondaryColor || '',
        signature: item.signature || '',
      });
    } catch {
      /* notified in provider */
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchTemplate();
  }, [fetchTemplate]);

  const isDirty = useMemo(() => {
    if (!form || !loaded) return false;
    return FIELDS.some((f) => (form[f] || '') !== (loaded[f] || ''));
  }, [form, loaded]);

  const defaults = loaded?.defaults || {};
  const effective = (field) => form?.[field]?.trim?.() || defaults[field] || '';

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleResetField = (field) => {
    setForm((prev) => ({ ...prev, [field]: '' }));
  };

  const handleReset = () => {
    if (!loaded) return;
    setForm({
      headerHtml: loaded.headerHtml || '',
      footerHtml: loaded.footerHtml || '',
      logoUrl: loaded.logoUrl || '',
      primaryColor: loaded.primaryColor || '',
      secondaryColor: loaded.secondaryColor || '',
      signature: loaded.signature || '',
    });
  };

  // Wipe all stored overrides → revert to baked-in Pensa defaults.
  // Sends a PUT with all fields empty, so the backend stores nulls and
  // wrapNewsletter falls back to its hardcoded defaults on next render.
  const handleResetToDefaults = async () => {
    setIsResetting(true);
    try {
      const payload = FIELDS.reduce((acc, f) => ({ ...acc, [f]: '' }), {});
      const res = await updateAdminEmailTemplate(payload);
      const item = res?.item;
      if (item) {
        setLoaded(item);
        setForm({
          headerHtml: '',
          footerHtml: '',
          logoUrl: '',
          primaryColor: '',
          secondaryColor: '',
          signature: '',
        });
      }
      notify('success', null, t('messages.resetDone'));
      setShowResetConfirm(false);
    } catch (err) {
      const msg = err?.message || t('messages.saveError');
      notify('error', null, msg);
    } finally {
      setIsResetting(false);
    }
  };

  const handleSave = async () => {
    if (!form) return;
    const payload = {};
    FIELDS.forEach((f) => {
      payload[f] = form[f]?.trim?.() || '';
    });
    // Validate hex colors at client side
    for (const key of ['primaryColor', 'secondaryColor']) {
      const v = payload[key];
      if (v && !/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v)) {
        notify('error', null, t('messages.invalidColor', { field: key }));
        return;
      }
    }
    setIsSaving(true);
    try {
      const res = await updateAdminEmailTemplate(payload);
      const item = res?.item;
      if (item) {
        setLoaded(item);
        setForm({
          headerHtml: item.headerHtml || '',
          footerHtml: item.footerHtml || '',
          logoUrl: item.logoUrl || '',
          primaryColor: item.primaryColor || '',
          secondaryColor: item.secondaryColor || '',
          signature: item.signature || '',
        });
      }
      notify('success', null, t('messages.saved'));
    } catch (err) {
      const msg = err?.message || t('messages.saveError');
      notify('error', null, msg);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !form) {
    return (
      <div className="ntc-state">
        <span className="ntc-state-icon ntc-spin">
          <Loader2 />
        </span>
        <span>{t('messages.loading')}</span>
      </div>
    );
  }

  const primaryEff = effective('primaryColor') || '#E26020';
  const secondaryEff = effective('secondaryColor') || '#14b8a6';

  // Split signature into first line + rest for visual preview
  const signatureLines = (effective('signature') || '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  return (
    <div className="ntc-root">
      <div className="ntc-grid">
        {/* ── FORM ───────────────────────────────────────── */}
        <div className="ntc-form">
          {/* Logo URL */}
          <label className="ntc-field">
            <span className="ntc-label">
              <ImageIcon />
              <span>{t('fields.logoUrl')}</span>
            </span>
            <div className="ntc-field-row">
              <input
                type="url"
                className="ntc-input"
                value={form.logoUrl}
                onChange={(e) => handleChange('logoUrl', e.target.value)}
                placeholder={defaults.logoUrl || 'https://...'}
              />
              {form.logoUrl && (
                <button
                  type="button"
                  className="ntc-inline-reset"
                  onClick={() => handleResetField('logoUrl')}
                  title={t('actions.resetField')}
                >
                  <Undo2 />
                </button>
              )}
            </div>
            <span className="ntc-hint">{t('fields.logoUrlHint')}</span>
          </label>

          {/* Colors */}
          <div className="ntc-colors">
            <label className="ntc-field">
              <span className="ntc-label">
                <Palette />
                <span>{t('fields.primaryColor')}</span>
              </span>
              <div className="ntc-color-row">
                <input
                  type="color"
                  className="ntc-color-swatch"
                  value={sanitizeHex(form.primaryColor) || defaults.primaryColor || '#E26020'}
                  onChange={(e) => handleChange('primaryColor', e.target.value)}
                />
                <input
                  type="text"
                  className="ntc-input"
                  value={form.primaryColor}
                  onChange={(e) => handleChange('primaryColor', e.target.value)}
                  placeholder={defaults.primaryColor || '#E26020'}
                />
                {form.primaryColor && (
                  <button
                    type="button"
                    className="ntc-inline-reset"
                    onClick={() => handleResetField('primaryColor')}
                    title={t('actions.resetField')}
                  >
                    <Undo2 />
                  </button>
                )}
              </div>
            </label>
            <label className="ntc-field">
              <span className="ntc-label">
                <Palette />
                <span>{t('fields.secondaryColor')}</span>
              </span>
              <div className="ntc-color-row">
                <input
                  type="color"
                  className="ntc-color-swatch"
                  value={sanitizeHex(form.secondaryColor) || defaults.secondaryColor || '#14b8a6'}
                  onChange={(e) => handleChange('secondaryColor', e.target.value)}
                />
                <input
                  type="text"
                  className="ntc-input"
                  value={form.secondaryColor}
                  onChange={(e) => handleChange('secondaryColor', e.target.value)}
                  placeholder={defaults.secondaryColor || '#14b8a6'}
                />
                {form.secondaryColor && (
                  <button
                    type="button"
                    className="ntc-inline-reset"
                    onClick={() => handleResetField('secondaryColor')}
                    title={t('actions.resetField')}
                  >
                    <Undo2 />
                  </button>
                )}
              </div>
            </label>
          </div>

          {/* Signature */}
          <label className="ntc-field">
            <span className="ntc-label">
              <PenLine />
              <span>{t('fields.signature')}</span>
            </span>
            <textarea
              className="ntc-textarea"
              rows={3}
              value={form.signature}
              onChange={(e) => handleChange('signature', e.target.value)}
              placeholder={defaults.signature || 'С уважение,\nЕкипът на Pensa Club'}
            />
            <span className="ntc-hint">{t('fields.signatureHint')}</span>
          </label>

          {/* Header HTML */}
          <label className="ntc-field">
            <span className="ntc-label">
              <FileText />
              <span>{t('fields.headerHtml')}</span>
            </span>
            <textarea
              className="ntc-textarea ntc-textarea--code"
              rows={4}
              value={form.headerHtml}
              onChange={(e) => handleChange('headerHtml', e.target.value)}
              placeholder={t('fields.headerHtmlPlaceholder')}
            />
            <span className="ntc-hint">{t('fields.headerHtmlHint')}</span>
          </label>

          {/* Footer HTML */}
          <label className="ntc-field">
            <span className="ntc-label">
              <FileText />
              <span>{t('fields.footerHtml')}</span>
            </span>
            <textarea
              className="ntc-textarea ntc-textarea--code"
              rows={4}
              value={form.footerHtml}
              onChange={(e) => handleChange('footerHtml', e.target.value)}
              placeholder={t('fields.footerHtmlPlaceholder')}
            />
            <span className="ntc-hint">{t('fields.footerHtmlHint')}</span>
          </label>

          <div className="ntc-actions">
            <button
              type="button"
              className="ntc-btn ntc-btn--danger-ghost"
              onClick={() => setShowResetConfirm(true)}
              disabled={isSaving || isResetting}
              title={t('actions.resetAllHint')}
            >
              <RefreshCw />
              <span>{t('actions.resetAll')}</span>
            </button>
            <button
              type="button"
              className="ntc-btn ntc-btn--ghost"
              onClick={handleReset}
              disabled={!isDirty || isSaving || isResetting}
            >
              <RotateCcw />
              <span>{t('actions.revert')}</span>
            </button>
            <button
              type="button"
              className="ntc-btn ntc-btn--primary"
              onClick={handleSave}
              disabled={!isDirty || isSaving || isResetting}
            >
              {isSaving ? <Loader2 className="ntc-spin" /> : <Save />}
              <span>{isSaving ? t('actions.saving') : t('actions.save')}</span>
            </button>
          </div>

          {showResetConfirm && (
            <div className="ntc-confirm">
              <p className="ntc-confirm-text">{t('actions.resetConfirmBody')}</p>
              <div className="ntc-confirm-actions">
                <button
                  type="button"
                  className="ntc-btn ntc-btn--ghost"
                  onClick={() => setShowResetConfirm(false)}
                  disabled={isResetting}
                >
                  <span>{t('actions.cancel')}</span>
                </button>
                <button
                  type="button"
                  className="ntc-btn ntc-btn--danger"
                  onClick={handleResetToDefaults}
                  disabled={isResetting}
                >
                  {isResetting ? <Loader2 className="ntc-spin" /> : <RefreshCw />}
                  <span>{isResetting ? t('actions.resetting') : t('actions.resetConfirm')}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── PREVIEW ───────────────────────────────────── */}
        <aside className="ntc-preview">
          <h4 className="ntc-preview-title">{t('preview.title')}</h4>

          <div className="ntc-preview-card">
            {/* Header (dark gradient, as in the real wrapNewsletter) */}
            <div className="ntc-pre-header">
              {effective('logoUrl') && (
                <img
                  src={effective('logoUrl')}
                  alt="Pensa Club"
                  className="ntc-pre-logo"
                />
              )}
              <p className="ntc-pre-kicker">
                {t('preview.kicker')}
              </p>
              <p className="ntc-pre-title">{t('preview.sampleTitle')}</p>
            </div>

            {effective('headerHtml') && (
              <div
                className="ntc-pre-extra"
                dangerouslySetInnerHTML={{ __html: effective('headerHtml') }}
              />
            )}

            <div className="ntc-pre-body">
              <p
                className="ntc-pre-para"
                style={{ borderLeftColor: primaryEff }}
              >
                {t('preview.sampleBody')}
              </p>
              <a
                className="ntc-pre-link"
                style={{ color: primaryEff }}
                href="#preview"
                onClick={(e) => e.preventDefault()}
              >
                {t('preview.sampleLink')}
              </a>
            </div>

            {signatureLines.length > 0 && (
              <div className="ntc-pre-sig">
                {signatureLines.map((line, i) => (
                  <p
                    key={i}
                    className={i === 0 ? 'ntc-pre-sig-first' : 'ntc-pre-sig-rest'}
                    style={i === 0 ? {} : { color: primaryEff }}
                  >
                    {line}
                  </p>
                ))}
              </div>
            )}

            {effective('footerHtml') && (
              <div
                className="ntc-pre-extra ntc-pre-extra--footer"
                dangerouslySetInnerHTML={{ __html: effective('footerHtml') }}
              />
            )}

            <div className="ntc-pre-footer">
              <span style={{ color: primaryEff }}>
                {t('preview.unsubscribe')}
              </span>
              {' · '}
              <span>© {new Date().getFullYear()} Pensa Club</span>
            </div>
          </div>

          <div className="ntc-pre-swatches">
            <span
              className="ntc-pre-swatch"
              style={{ background: primaryEff }}
              title={`Primary: ${primaryEff}`}
            />
            <span
              className="ntc-pre-swatch"
              style={{ background: secondaryEff }}
              title={`Secondary: ${secondaryEff}`}
            />
          </div>
        </aside>
      </div>
    </div>
  );
};
