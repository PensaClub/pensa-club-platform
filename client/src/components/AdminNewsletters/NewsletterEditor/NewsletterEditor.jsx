// src/components/AdminNewsletters/NewsletterEditor/NewsletterEditor.jsx
// Prefix: ane-

import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import {
  FileText,
  Save,
  CalendarClock,
  Send,
  ArrowLeft,
  CircleAlert,
  Loader2,
  CheckCircle2,
  Sparkles,
  Eye,
  AlertTriangle,
} from 'lucide-react';
import { useCommunityContext } from '../../contexts/CommunityContext';
import { notify } from '../../../utils/notify.jsx';
import { NewsletterEditorRichText } from './NewsletterEditorRichText/NewsletterEditorRichText';
import { NewsletterTargetAudience } from './NewsletterTargetAudience/NewsletterTargetAudience';
import { AddContentModal } from './AddContentModal/AddContentModal';
import { NewsletterPreview } from './NewsletterPreview/NewsletterPreview';
import './newsletterEditor.css';

const AUTOSAVE_DELAY_MS = 30000; // 30s
const emptyDraft = {
  id: null,
  title: '',
  subject: '',
  body: '',
  targetCategories: null,
  platformUpdates: '',
  status: 'draft',
  scheduledAt: null,
};

const toDateTimeLocal = (isoString) => {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    if (Number.isNaN(d.getTime())) return '';
    const tzOffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
  } catch {
    return '';
  }
};

const fromDateTimeLocal = (value) => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
};

export const NewsletterEditor = ({ draftId, onDraftChange, onBackToList }) => {
  const { t, ready } = useTranslation('adminNewsletters');
  const {
    getAdminNewsletterById,
    createNewsletter,
    updateNewsletter,
    scheduleNewsletter,
    sendNewsletterNow,
    getNewsletterRecipientCount,
  } = useCommunityContext();

  const [draft, setDraft] = useState(emptyDraft);
  const [scheduleInput, setScheduleInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [errors, setErrors] = useState({});
  const [nowTick, setNowTick] = useState(Date.now());

  const autosaveTimerRef = useRef(null);
  const draftRef = useRef(draft);
  const justSavedIdRef = useRef(null);
  const richTextRef = useRef(null);
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [sendConfirm, setSendConfirm] = useState(null); // { count } | null
  const [isSendingNow, setIsSendingNow] = useState(false);
  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  // Tick for "saved Xs ago" label
  useEffect(() => {
    if (!lastSavedAt) return undefined;
    const i = setInterval(() => setNowTick(Date.now()), 15000);
    return () => clearInterval(i);
  }, [lastSavedAt]);

  // Load existing draft when draftId changes
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!draftId) {
        setDraft(emptyDraft);
        setScheduleInput('');
        setDirty(false);
        setErrors({});
        setLastSavedAt(null);
        return;
      }
      if (justSavedIdRef.current === draftId) {
        justSavedIdRef.current = null;
        return;
      }
      setIsLoading(true);
      try {
        const res = await getAdminNewsletterById(draftId);
        if (cancelled) return;
        const n = res?.newsletter || {};
        setDraft({
          id: n.id,
          title: n.title || '',
          subject: n.subject || '',
          body: n.body || '',
          targetCategories: Array.isArray(n.targetCategories) ? n.targetCategories : null,
          platformUpdates: n.platformUpdates || '',
          status: n.status || 'draft',
          scheduledAt: n.scheduledAt || null,
        });
        setScheduleInput(toDateTimeLocal(n.scheduledAt));
        setDirty(false);
        setErrors({});
        setLastSavedAt(null);
      } catch {
        if (!cancelled) notify('error', null, t('editor.messages.loadError'));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftId]);

  const updateField = (patch) => {
    setDraft((d) => ({ ...d, ...patch }));
    setDirty(true);
  };

  const persist = useCallback(
    async ({ silent = false } = {}) => {
      const current = draftRef.current;
      const payload = {
        title: current.title,
        subject: current.subject || null,
        body: current.body || '',
        targetCategories: current.targetCategories,
        platformUpdates: current.platformUpdates || null,
      };

      setIsSaving(true);
      try {
        let saved;
        if (current.id) {
          const res = await updateNewsletter(current.id, payload);
          saved = res?.newsletter;
          if (!silent) notify('success', null, t('editor.messages.updated'));
        } else {
          if (!payload.title?.trim()) {
            setErrors({ title: t('editor.validation.titleRequired') });
            return null;
          }
          const res = await createNewsletter(payload);
          saved = res?.newsletter;
          if (!silent) notify('success', null, t('editor.messages.created'));
        }
        if (saved) {
          setDraft((d) => ({
            ...d,
            id: saved.id,
            status: saved.status,
            scheduledAt: saved.scheduledAt || null,
          }));
          if (saved.id && onDraftChange) {
            justSavedIdRef.current = saved.id;
            onDraftChange(saved.id);
          }
        }
        setLastSavedAt(Date.now());
        setDirty(false);
        setErrors({});
        return saved;
      } catch {
        if (!silent) notify('error', null, t('editor.messages.saveError'));
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [createNewsletter, updateNewsletter, t]
  );

  // Auto-save every 30s when dirty and title is valid
  useEffect(() => {
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    if (!dirty) return undefined;
    if (!draft.title?.trim()) return undefined;
    autosaveTimerRef.current = setTimeout(() => {
      persist({ silent: true });
    }, AUTOSAVE_DELAY_MS);
    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    };
  }, [dirty, draft.title, persist]);

  const validate = () => {
    const next = {};
    if (!draft.title?.trim()) next.title = t('editor.validation.titleRequired');
    if (!draft.body?.trim()) next.body = t('editor.validation.bodyRequired');
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSaveDraft = async () => {
    if (!draft.title?.trim()) {
      setErrors({ title: t('editor.validation.titleRequired') });
      return;
    }
    await persist({ silent: false });
  };

  const handleOpenSendNow = async () => {
    if (!validate()) return;
    let saved = draft;
    if (dirty || !draft.id) {
      const res = await persist({ silent: true });
      saved = res || draft;
    }
    if (!saved?.id) {
      notify('error', null, t('editor.actions.sendNowNeedSave'));
      return;
    }
    try {
      const countRes = await getNewsletterRecipientCount(
        Array.isArray(draft.targetCategories) ? draft.targetCategories : null,
      );
      setSendConfirm({ count: countRes?.count ?? 0 });
    } catch {
      setSendConfirm({ count: 0 });
    }
  };

  const handleConfirmSendNow = async () => {
    if (!draft.id) return;
    setIsSendingNow(true);
    try {
      await sendNewsletterNow(draft.id);
      notify('success', null, t('editor.messages.sendStarted'));
      setSendConfirm(null);
      if (onBackToList) onBackToList();
    } catch {
      notify('error', null, t('editor.messages.sendError'));
    } finally {
      setIsSendingNow(false);
    }
  };

  const handleSchedule = async () => {
    if (!validate()) return;
    if (!scheduleInput) {
      setErrors((e) => ({ ...e, scheduledAt: t('editor.validation.scheduleRequired') }));
      return;
    }
    const iso = fromDateTimeLocal(scheduleInput);
    if (!iso || new Date(iso).getTime() <= Date.now()) {
      setErrors((e) => ({ ...e, scheduledAt: t('editor.validation.scheduleFuture') }));
      return;
    }

    const saved = await persist({ silent: true });
    const id = saved?.id || draft.id;
    if (!id) return;

    setIsScheduling(true);
    try {
      const res = await scheduleNewsletter(id, iso);
      const updated = res?.newsletter;
      if (updated) {
        setDraft((d) => ({
          ...d,
          status: updated.status,
          scheduledAt: updated.scheduledAt,
        }));
      }
      notify('success', null, t('editor.messages.scheduled'));
      if (onBackToList) onBackToList();
    } catch {
      notify('error', null, t('editor.messages.saveError'));
    } finally {
      setIsScheduling(false);
    }
  };

  const formatSavedAgo = (totalSeconds) => {
    if (totalSeconds < 60) {
      return t('editor.status.saved', {
        value: totalSeconds,
        unit: t('editor.status.unitSec'),
      });
    }
    if (totalSeconds < 3600) {
      return t('editor.status.saved', {
        value: Math.floor(totalSeconds / 60),
        unit: t('editor.status.unitMin'),
      });
    }
    if (totalSeconds < 86400) {
      return t('editor.status.saved', {
        value: Math.floor(totalSeconds / 3600),
        unit: t('editor.status.unitHour'),
      });
    }
    return t('editor.status.saved', {
      value: Math.floor(totalSeconds / 86400),
      unit: t('editor.status.unitDay'),
    });
  };

  const savedLabel = (() => {
    if (isSaving) return t('editor.status.saving');
    if (dirty && (draft.id || lastSavedAt)) return t('editor.status.dirty');
    if (!lastSavedAt) return t('editor.status.idle');
    const seconds = Math.max(1, Math.floor((nowTick - lastSavedAt) / 1000));
    if (seconds < 5) return t('editor.status.savedJustNow');
    return formatSavedAgo(seconds);
  })();
  const isDirtyState = dirty && (draft.id || lastSavedAt) && !isSaving;

  const isEdit = Boolean(draft.id);

  if (!ready || isLoading) {
    return (
      <div className="ane-loading">
        <span className="ane-loading-icon">
          <Loader2 />
        </span>
        <span>{ready ? t('list.loading') : '…'}</span>
      </div>
    );
  }

  return (
    <div className="ane-root">
      {/* HEADER */}
      <div className="ane-header">
        <div className="ane-header-title-row">
          {onBackToList && (
            <button type="button" className="ane-back-btn" onClick={onBackToList}>
              <span className="ane-icon">
                <ArrowLeft />
              </span>
              <span>{t('editor.actions.back')}</span>
            </button>
          )}
          <div className="ane-header-info">
            <h2 className="ane-heading">
              <span className="ane-heading-icon">
                <FileText />
              </span>
              {isEdit ? t('editor.editTitle') : t('editor.newTitle')}
            </h2>
            <p className="ane-heading-sub">{t('editor.subtitle')}</p>
          </div>
        </div>

        <div
          className={`ane-status-pill ${isDirtyState ? 'ane-status-pill--dirty' : ''}`}
          aria-live="polite"
        >
          {isSaving ? (
            <span className="ane-status-icon ane-status-icon--spin">
              <Loader2 />
            </span>
          ) : isDirtyState ? (
            <span className="ane-status-icon ane-status-icon--warn">
              <AlertTriangle />
            </span>
          ) : lastSavedAt ? (
            <span className="ane-status-icon ane-status-icon--success">
              <CheckCircle2 />
            </span>
          ) : (
            <span className="ane-status-icon">
              <CircleAlert />
            </span>
          )}
          <span className="ane-status-text">{savedLabel}</span>
        </div>
      </div>

      {/* BODY */}
      <div className="ane-grid">
        {/* Left — main content */}
        <div className="ane-col ane-col--main">
          <div className="ane-field">
            <label className="ane-label" htmlFor="ane-title">
              {t('editor.fields.title')}
            </label>
            <input
              id="ane-title"
              type="text"
              className={`ane-input ${errors.title ? 'ane-input--error' : ''}`}
              placeholder={t('editor.fields.titlePlaceholder')}
              value={draft.title}
              onChange={(e) => {
                updateField({ title: e.target.value });
                if (errors.title) setErrors((er) => ({ ...er, title: null }));
              }}
              maxLength={500}
            />
            <div className="ane-hint-row">
              <span className="ane-hint">{t('editor.fields.titleHint')}</span>
              {errors.title && <span className="ane-error">{errors.title}</span>}
            </div>
          </div>

          <div className="ane-field">
            <label className="ane-label" htmlFor="ane-subject">
              {t('editor.fields.subject')}
            </label>
            <input
              id="ane-subject"
              type="text"
              className="ane-input"
              placeholder={t('editor.fields.subjectPlaceholder')}
              value={draft.subject}
              onChange={(e) => updateField({ subject: e.target.value })}
              maxLength={500}
            />
            <div className="ane-hint-row">
              <span className="ane-hint">{t('editor.fields.subjectHint')}</span>
            </div>
          </div>

          <div className="ane-field">
            <div className="ane-label-row">
              <label className="ane-label">{t('editor.fields.body')}</label>
              <button
                type="button"
                className="ane-insert-btn"
                onClick={() => setIsContentModalOpen(true)}
              >
                <span className="ane-icon">
                  <Sparkles />
                </span>
                <span className="ane-insert-btn-label">
                  {t('editor.toolbar.insertContent')}
                </span>
              </button>
            </div>
            <NewsletterEditorRichText
              ref={richTextRef}
              value={draft.body}
              onChange={(html) => {
                updateField({ body: html });
                if (errors.body) setErrors((er) => ({ ...er, body: null }));
              }}
              placeholder={t('editor.fields.bodyPlaceholder')}
            />
            {errors.body && <span className="ane-error ane-error--block">{errors.body}</span>}
          </div>

          <div className="ane-field">
            <label className="ane-label" htmlFor="ane-platform">
              {t('editor.fields.platformUpdates')}
            </label>
            <textarea
              id="ane-platform"
              className="ane-textarea"
              placeholder={t('editor.fields.platformUpdatesPlaceholder')}
              value={draft.platformUpdates}
              onChange={(e) => updateField({ platformUpdates: e.target.value })}
              rows={4}
            />
            <span className="ane-hint">
              {t('editor.fields.platformUpdatesHint')}
            </span>
          </div>

          {/* Dirty warning above footer — visible only when there are unsaved edits */}
          {isDirtyState && (
            <div className="ane-dirty-banner" role="status">
              <span className="ane-dirty-icon">
                <AlertTriangle />
              </span>
              <span className="ane-dirty-text">{t('editor.status.dirtyHint')}</span>
            </div>
          )}

          {/* Footer actions — directly under form */}
          <div className="ane-footer">
            <button
              type="button"
              className="ane-btn ane-btn--ghost"
              onClick={handleSaveDraft}
              disabled={isSaving}
            >
              <span className="ane-icon">
                <Save />
              </span>
              <span>{t('editor.actions.saveDraft')}</span>
            </button>

            <button
              type="button"
              className="ane-btn ane-btn--ghost"
              onClick={() => setIsPreviewOpen(true)}
            >
              <span className="ane-icon">
                <Eye />
              </span>
              <span>{t('editor.actions.preview')}</span>
            </button>

            <button
              type="button"
              className="ane-btn ane-btn--primary"
              onClick={handleSchedule}
              disabled={isSaving || isScheduling}
            >
              <span className="ane-icon">
                <CalendarClock />
              </span>
              <span>{t('editor.actions.schedule')}</span>
            </button>

            <button
              type="button"
              className="ane-btn ane-btn--accent"
              onClick={handleOpenSendNow}
              disabled={isSaving || isScheduling || isSendingNow}
            >
              <span className="ane-icon">
                <Send />
              </span>
              <span>{t('editor.actions.sendNow')}</span>
            </button>
          </div>
        </div>

        {/* Right — sidebar */}
        <aside className="ane-col ane-col--side">
          <div className="ane-side-card">
            <h3 className="ane-side-title">{t('editor.fields.targetAudience')}</h3>
            <NewsletterTargetAudience
              value={draft.targetCategories}
              onChange={(v) => updateField({ targetCategories: v })}
            />
          </div>

          <div className="ane-side-card">
            <h3 className="ane-side-title">{t('editor.fields.scheduledAt')}</h3>
            <input
              type="datetime-local"
              className={`ane-input ${errors.scheduledAt ? 'ane-input--error' : ''}`}
              value={scheduleInput}
              onChange={(e) => {
                setScheduleInput(e.target.value);
                if (errors.scheduledAt) setErrors((er) => ({ ...er, scheduledAt: null }));
              }}
            />
            <span className="ane-hint">{t('editor.fields.scheduledAtHint')}</span>
            {errors.scheduledAt && (
              <span className="ane-error ane-error--block">{errors.scheduledAt}</span>
            )}
          </div>
        </aside>
      </div>

      <AddContentModal
        isOpen={isContentModalOpen}
        onClose={() => setIsContentModalOpen(false)}
        onInsert={(html) => {
          richTextRef.current?.insertContent(html);
          setDirty(true);
          notify('success', null, t('editor.addContent.inserted'));
        }}
      />

      <NewsletterPreview
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        draft={draft}
        canSendTest={Boolean(draft.id)}
        onEnsureSaved={async () => {
          if (!draft.title?.trim()) {
            setErrors({ title: t('editor.validation.titleRequired') });
            return null;
          }
          if (draft.id && !dirty) return draft.id;
          const saved = await persist({ silent: true });
          return saved?.id || draft.id || null;
        }}
      />

      {sendConfirm &&
        createPortal(
          <div
            className="anl-modal-overlay"
            role="dialog"
            aria-modal="true"
            onClick={() => !isSendingNow && setSendConfirm(null)}
          >
            <div className="anl-modal" onClick={(e) => e.stopPropagation()}>
              <h3 className="anl-modal-title">
                {t('editor.sendNowConfirm.title')}
              </h3>
              <p className="anl-modal-body">
                {t('editor.sendNowConfirm.body', { count: sendConfirm.count })}
              </p>
              <div className="anl-modal-actions">
                <button
                  type="button"
                  className="anl-btn-secondary"
                  onClick={() => setSendConfirm(null)}
                  disabled={isSendingNow}
                >
                  {t('editor.sendNowConfirm.cancel')}
                </button>
                <button
                  type="button"
                  className="anl-btn-danger"
                  onClick={handleConfirmSendNow}
                  disabled={isSendingNow}
                >
                  {t('editor.sendNowConfirm.confirm')}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};
