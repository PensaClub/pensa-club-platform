// src/components/AdminNewsletters/NewsletterEditor/NewsletterPreview/NewsletterPreview.jsx
// Prefix: anpv- (AdminNewsletters → Preview)

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { X, Monitor, Smartphone, Send, Users, Loader2 } from 'lucide-react';
import { useCommunityContext } from '../../../contexts/CommunityContext';
import { UserContext } from '../../../contexts/UserContext';
import { useContext } from 'react';
import { notify } from '../../../../utils/notify.jsx';
import './newsletterPreview.css';

export const NewsletterPreview = ({
  isOpen,
  onClose,
  draft,
  canSendTest,
  onEnsureSaved,
}) => {
  const { t } = useTranslation('adminNewsletters');
  const { previewNewsletter, getNewsletterRecipientCount, sendTestNewsletter } =
    useCommunityContext();
  const userCtx = useContext(UserContext);
  const adminEmail = userCtx?.userEmail || '';

  const [html, setHtml] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [viewport, setViewport] = useState('desktop');
  const [recipients, setRecipients] = useState(null);
  const [customEmail, setCustomEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  const categories = useMemo(
    () => (Array.isArray(draft?.targetCategories) ? draft.targetCategories : null),
    [draft?.targetCategories],
  );

  const fetchPreview = useCallback(async () => {
    if (!isOpen) return;
    setIsLoading(true);
    try {
      const res = await previewNewsletter({
        title: draft?.title || '',
        body: draft?.body || '',
        platformUpdates: draft?.platformUpdates || '',
      });
      setHtml(res?.html || '');
    } catch {
      notify('error', null, t('editor.messages.previewError'));
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, draft?.title, draft?.body, draft?.platformUpdates]);

  const fetchRecipients = useCallback(async () => {
    if (!isOpen) return;
    try {
      const res = await getNewsletterRecipientCount(categories);
      setRecipients(res?.count ?? 0);
    } catch {
      setRecipients(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, categories]);

  useEffect(() => {
    fetchPreview();
  }, [fetchPreview]);

  useEffect(() => {
    fetchRecipients();
  }, [fetchRecipients]);

  useEffect(() => {
    if (!isOpen) {
      setHtml('');
      setViewport('desktop');
      setRecipients(null);
      setCustomEmail('');
      setEmailError('');
    }
  }, [isOpen]);

  const handleSendTest = async () => {
    const trimmedCustom = customEmail.trim();
    if (trimmedCustom) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedCustom)) {
        setEmailError(t('editor.preview.invalidEmail'));
        return;
      }
    }
    setEmailError('');
    setIsSending(true);
    try {
      // Ensure the draft exists before sending — auto-save if needed
      let draftId = draft?.id;
      if (!draftId && onEnsureSaved) {
        draftId = await onEnsureSaved();
      }
      if (!draftId) {
        notify('error', null, t('editor.messages.needSaveFirst'));
        return;
      }
      const res = await sendTestNewsletter(draftId, trimmedCustom || undefined);
      notify(
        'success',
        null,
        t('editor.messages.testSent', { email: res?.to || trimmedCustom || adminEmail }),
      );
    } catch {
      notify('error', null, t('editor.messages.testSendError'));
    } finally {
      setIsSending(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  if (!isOpen) return null;

  const recipientsLabel = (() => {
    if (recipients === null) return '—';
    if (!categories || categories.length === 0) {
      return `${t('editor.preview.recipients', { count: recipients })} · ${t('editor.preview.recipientsAll')}`;
    }
    const catLabels = categories
      .map((c) => t(`editor.categories.${c}`, { defaultValue: c }))
      .join(', ');
    return `${t('editor.preview.recipients', { count: recipients })} · ${t(
      'editor.preview.recipientsFilter',
      { categories: catLabels },
    )}`;
  })();

  return createPortal(
    <div
      className="anpv-overlay"
      role="dialog"
      aria-modal="true"
      onClick={handleBackdropClick}
    >
      <div className="anpv-modal">
        {/* HEADER */}
        <div className="anpv-header">
          <div className="anpv-header-text">
            <h2 className="anpv-title">{t('editor.preview.heading')}</h2>
            <p className="anpv-subtitle">{t('editor.preview.description')}</p>
          </div>
          <button
            type="button"
            className="anpv-close"
            onClick={onClose}
            aria-label={t('editor.preview.close')}
          >
            <span className="anpv-icon">
              <X />
            </span>
          </button>
        </div>

        {/* TOOLBAR */}
        <div className="anpv-toolbar">
          <div className="anpv-recipients">
            <span className="anpv-recipients-icon">
              <Users />
            </span>
            <span className="anpv-recipients-text">{recipientsLabel}</span>
          </div>

          <div className="anpv-viewport-toggle">
            <button
              type="button"
              className={`anpv-vp-btn ${viewport === 'desktop' ? 'anpv-vp-btn--active' : ''}`}
              onClick={() => setViewport('desktop')}
            >
              <span className="anpv-icon">
                <Monitor />
              </span>
              <span className="anpv-vp-label">{t('editor.preview.desktop')}</span>
            </button>
            <button
              type="button"
              className={`anpv-vp-btn ${viewport === 'mobile' ? 'anpv-vp-btn--active' : ''}`}
              onClick={() => setViewport('mobile')}
            >
              <span className="anpv-icon">
                <Smartphone />
              </span>
              <span className="anpv-vp-label">{t('editor.preview.mobile')}</span>
            </button>
          </div>
        </div>

        {/* STAGE */}
        <div className={`anpv-stage anpv-stage--${viewport}`}>
          {isLoading ? (
            <div className="anpv-state">
              <span className="anpv-state-icon">
                <Loader2 />
              </span>
              <span>{t('editor.preview.loading')}</span>
            </div>
          ) : html ? (
            <iframe
              title="Newsletter preview"
              className="anpv-iframe"
              srcDoc={html}
              sandbox="allow-same-origin"
            />
          ) : (
            <div className="anpv-state">
              <span>{t('editor.preview.empty')}</span>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="anpv-footer">
          <div className="anpv-send-email">
            <label className="anpv-send-label" htmlFor="anpv-custom-email">
              {t('editor.preview.customEmailLabel')}
            </label>
            <input
              id="anpv-custom-email"
              type="email"
              className={`anpv-send-input ${emailError ? 'anpv-send-input--error' : ''}`}
              placeholder={adminEmail || t('editor.preview.customEmailPlaceholder')}
              value={customEmail}
              onChange={(e) => {
                setCustomEmail(e.target.value);
                if (emailError) setEmailError('');
              }}
            />
            {emailError && (
              <span className="anpv-send-error">{emailError}</span>
            )}
            <span className="anpv-send-note">
              {t('editor.preview.testNote')}
            </span>
          </div>
          <div className="anpv-footer-actions">
            <button
              type="button"
              className="anpv-btn anpv-btn--ghost"
              onClick={onClose}
            >
              <span className="anpv-btn-label">{t('editor.preview.close')}</span>
            </button>
            <button
              type="button"
              className="anpv-btn anpv-btn--primary"
              onClick={handleSendTest}
              disabled={isSending}
            >
              <span className="anpv-icon">
                <Send />
              </span>
              <span className="anpv-btn-label">{t('editor.preview.sendTest')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};
