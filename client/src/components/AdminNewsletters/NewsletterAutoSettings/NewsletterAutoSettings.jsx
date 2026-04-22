// src/components/AdminNewsletters/NewsletterAutoSettings/NewsletterAutoSettings.jsx
// Prefix: ana-

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import {
  CalendarClock,
  Repeat,
  CheckCircle2,
  Zap,
  Eye,
  Send,
  Loader2,
  X,
  Plus,
  Trash2,
  Sparkles,
  BarChart3,
} from 'lucide-react';
import { useCommunityContext } from '../../contexts/CommunityContext';
import { notify } from '../../../utils/notify.jsx';
import { NewsletterEditorRichText } from '../NewsletterEditor/NewsletterEditorRichText/NewsletterEditorRichText';
import { NewsletterImageUploader } from '../NewsletterImageUploader/NewsletterImageUploader';
import { NewsletterContentPicker } from '../NewsletterContentPicker/NewsletterContentPicker';
import './newsletterAutoSettings.css';

const ITEMS = [
  { key: 'weekly', icon: CalendarClock },
  { key: 'scheduled', icon: Repeat },
  { key: 'event', icon: Zap },
  { key: 'monthly', icon: BarChart3 },
];

const MONTHLY_LIMIT_OPTIONS = [3, 5, 10];

const buildMonthOptions = (count = 6) => {
  const now = new Date();
  const out = [];
  for (let i = 1; i <= count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    out.push({ value, year: d.getFullYear(), month: d.getMonth() });
  }
  return out;
};

const CATEGORY_OPTIONS = [
  'seminars',
  'courses',
  'articles',
  'initiatives',
  'clubs',
  'games',
  'platform',
];

export const NewsletterAutoSettings = () => {
  const { t } = useTranslation('adminNewsletters');
  const {
    getEventBatchPreview,
    runEventBatchNow,
    getNewsletterQueue,
    addNewsletterQueueItem,
    deleteNewsletterQueueItem,
    getMonthlyReportPreview,
    runMonthlyReportNow,
  } = useCommunityContext();
  const [preview, setPreview] = useState(null);
  const [weeklyPending, setWeeklyPending] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  // Add-manual form state
  const [addForm, setAddForm] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  // Monthly report state
  const monthOptions = buildMonthOptions(6);
  const [monthlySelectedMonth, setMonthlySelectedMonth] = useState(
    monthOptions[0]?.value || '',
  );
  const [monthlyLimit, setMonthlyLimit] = useState(3);
  const [monthlyPreview, setMonthlyPreview] = useState(null);
  const [isMonthlyLoading, setIsMonthlyLoading] = useState(false);
  const [showMonthlyPreview, setShowMonthlyPreview] = useState(false);
  const [showMonthlyConfirm, setShowMonthlyConfirm] = useState(false);
  const [isMonthlySending, setIsMonthlySending] = useState(false);

  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [pre, weekly] = await Promise.all([
        getEventBatchPreview().catch(() => null),
        getNewsletterQueue('weekly_pending').catch(() => ({ items: [] })),
      ]);
      setPreview(pre || { pendingCount: 0, items: [], html: '' });
      setWeeklyPending(weekly?.items || []);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const handleRunNow = async () => {
    setIsSending(true);
    try {
      await runEventBatchNow();
      notify('success', null, t('autoSettings.runNowStarted'));
      setShowConfirm(false);
      setTimeout(refreshAll, 2000);
    } catch {
      notify('error', null, t('autoSettings.runNowError'));
    } finally {
      setIsSending(false);
    }
  };

  const handleLoadMonthlyPreview = async () => {
    setIsMonthlyLoading(true);
    try {
      const data = await getMonthlyReportPreview({
        month: monthlySelectedMonth,
        limit: monthlyLimit,
      });
      setMonthlyPreview(data);
      setShowMonthlyPreview(true);
    } catch {
      notify('error', null, t('autoSettings.monthlyPreviewError'));
    } finally {
      setIsMonthlyLoading(false);
    }
  };

  const handleRunMonthlyNow = async () => {
    setIsMonthlySending(true);
    try {
      await runMonthlyReportNow({
        month: monthlySelectedMonth,
        limit: monthlyLimit,
      });
      notify('success', null, t('autoSettings.monthlyRunStarted'));
      setShowMonthlyConfirm(false);
    } catch {
      notify('error', null, t('autoSettings.monthlyRunError'));
    } finally {
      setIsMonthlySending(false);
    }
  };

  const handleRemoveItem = async (id) => {
    setRemovingId(id);
    try {
      await deleteNewsletterQueueItem(id);
      notify('success', null, t('autoSettings.itemRemoved'));
      await refreshAll();
    } catch {
      notify('error', null, t('autoSettings.queueError'));
    } finally {
      setRemovingId(null);
    }
  };

  const openAddModal = (status) => {
    setAddForm({
      status,
      category: 'platform',
      title: '',
      description: '',
      url: '',
      images: [], // Firebase URLs — first is used as thumbnail
      errors: {},
    });
  };

  const handlePickFromPlatform = (picked) => {
    setAddForm((f) => ({
      ...f,
      title: picked.title || f.title,
      description: picked.description
        ? `<p>${picked.description}</p>`
        : f.description,
      url: picked.url || f.url,
      images: picked.thumbnail ? [picked.thumbnail] : f.images,
      category: picked.category || f.category,
      errors: {},
    }));
  };

  const submitAddItem = async () => {
    if (!addForm) return;
    const errors = {};
    if (!addForm.title.trim()) errors.title = true;
    if (Object.keys(errors).length > 0) {
      setAddForm((f) => ({ ...f, errors }));
      return;
    }
    setIsSubmitting(true);
    try {
      const imgs = Array.isArray(addForm.images) ? addForm.images : [];
      await addNewsletterQueueItem({
        status: addForm.status,
        category: addForm.category,
        title: addForm.title.trim(),
        description: addForm.description?.trim() || null,
        url: addForm.url.trim() || null,
        thumbnail: imgs[0] || null,
      });
      notify('success', null, t('autoSettings.itemAdded'));
      setAddForm(null);
      await refreshAll();
    } catch {
      notify('error', null, t('autoSettings.queueError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="ana-root">
      <header className="ana-header">
        <h2 className="ana-title">{t('autoSettings.title')}</h2>
        <p className="ana-subtitle">{t('autoSettings.subtitle')}</p>
      </header>

      <div className="ana-list">
        {ITEMS.map(({ key, icon: Icon }) => {
          const isEvent = key === 'event';
          const isWeekly = key === 'weekly';
          const isMonthly = key === 'monthly';

          return (
            <div key={key} className="ana-card">
              <div className="ana-card-head">
                <span className="ana-card-icon">
                  <Icon />
                </span>
                <div className="ana-card-text">
                  <h3 className="ana-card-title">{t(`autoSettings.${key}Title`)}</h3>
                  <p className="ana-card-schedule">{t(`autoSettings.${key}Schedule`)}</p>
                </div>
                <span className="ana-status">
                  <span className="ana-status-icon">
                    <CheckCircle2 />
                  </span>
                  <span className="ana-status-text">{t('autoSettings.active')}</span>
                </span>
              </div>
              <p className="ana-card-desc">{t(`autoSettings.${key}Desc`)}</p>

              {/* DAILY EVENT PANEL */}
              {isEvent && (
                <div className="ana-event-panel">
                  {isLoading ? (
                    <div className="ana-loading">
                      <span className="ana-loading-icon">
                        <Loader2 />
                      </span>
                      <span className="ana-loading-label">
                        {t('autoSettings.pendingLabel')}
                      </span>
                    </div>
                  ) : preview && preview.pendingCount > 0 ? (
                    <>
                      <div className="ana-pending-head">
                        <span className="ana-pending-label">
                          {t('autoSettings.pendingLabel')}
                        </span>
                        <span className="ana-pending-count">{preview.pendingCount}</span>
                      </div>
                      <ul className="ana-pending-list">
                        {preview.items.slice(0, 10).map((it) => (
                          <li key={`${it.type}-${it.id}`} className="ana-pending-item">
                            <span className="ana-pending-type">
                              {t(`autoSettings.typeLabels.${it.type}`, {
                                defaultValue: it.type,
                              })}
                            </span>
                            <span className="ana-pending-title">
                              {it.referenceTitle || '—'}
                            </span>
                            <button
                              type="button"
                              className="ana-pending-remove"
                              title={t('autoSettings.removeItem')}
                              aria-label={t('autoSettings.removeItem')}
                              onClick={() => handleRemoveItem(it.id)}
                              disabled={removingId === it.id}
                            >
                              <span className="ana-event-btn-icon">
                                <Trash2 />
                              </span>
                            </button>
                          </li>
                        ))}
                        {preview.items.length > 10 && (
                          <li className="ana-pending-more">
                            + {preview.items.length - 10}…
                          </li>
                        )}
                      </ul>
                      <div className="ana-event-actions">
                        <button
                          type="button"
                          className="ana-event-btn ana-event-btn--ghost"
                          onClick={() => setShowPreview(true)}
                        >
                          <span className="ana-event-btn-icon">
                            <Eye />
                          </span>
                          <span className="ana-event-btn-label">
                            {t('autoSettings.viewPreview')}
                          </span>
                        </button>
                        <button
                          type="button"
                          className="ana-event-btn ana-event-btn--ghost"
                          onClick={() => openAddModal('pending')}
                        >
                          <span className="ana-event-btn-icon">
                            <Plus />
                          </span>
                          <span className="ana-event-btn-label">
                            {t('autoSettings.addManual')}
                          </span>
                        </button>
                        <button
                          type="button"
                          className="ana-event-btn ana-event-btn--primary"
                          onClick={() => setShowConfirm(true)}
                          disabled={isSending}
                        >
                          <span className="ana-event-btn-icon">
                            <Send />
                          </span>
                          <span className="ana-event-btn-label">
                            {t('autoSettings.runNow')}
                          </span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="ana-pending-empty">
                        {t('autoSettings.pendingEmpty')}
                      </p>
                      <div className="ana-event-actions">
                        <button
                          type="button"
                          className="ana-event-btn ana-event-btn--ghost"
                          onClick={() => openAddModal('pending')}
                        >
                          <span className="ana-event-btn-icon">
                            <Plus />
                          </span>
                          <span className="ana-event-btn-label">
                            {t('autoSettings.addManual')}
                          </span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* WEEKLY MANUAL QUEUE PANEL */}
              {isWeekly && (
                <div className="ana-event-panel">
                  {weeklyPending.length > 0 ? (
                    <>
                      <div className="ana-pending-head">
                        <span className="ana-pending-label">
                          {t('autoSettings.weeklyPendingLabel')}
                        </span>
                        <span className="ana-pending-count">{weeklyPending.length}</span>
                      </div>
                      <ul className="ana-pending-list">
                        {weeklyPending.map((it) => (
                          <li key={it.id} className="ana-pending-item">
                            <span className="ana-pending-type">
                              {t(`editor.categories.${it.category}`, {
                                defaultValue: it.category,
                              })}
                            </span>
                            <span className="ana-pending-title">
                              {it.referenceTitle || '—'}
                            </span>
                            <button
                              type="button"
                              className="ana-pending-remove"
                              title={t('autoSettings.removeItem')}
                              aria-label={t('autoSettings.removeItem')}
                              onClick={() => handleRemoveItem(it.id)}
                              disabled={removingId === it.id}
                            >
                              <span className="ana-event-btn-icon">
                                <Trash2 />
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <p className="ana-pending-empty">
                      {t('autoSettings.weeklyPendingEmpty')}
                    </p>
                  )}
                  <div className="ana-event-actions">
                    <button
                      type="button"
                      className="ana-event-btn ana-event-btn--ghost"
                      onClick={() => openAddModal('weekly_pending')}
                    >
                      <span className="ana-event-btn-icon">
                        <Plus />
                      </span>
                      <span className="ana-event-btn-label">
                        {t('autoSettings.addManual')}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* MONTHLY REPORT PANEL */}
              {isMonthly && (
                <div className="ana-event-panel">
                  <div className="ana-monthly-controls">
                    <label className="ana-monthly-label">
                      <span className="ana-monthly-label-text">
                        {t('autoSettings.monthlyMonthLabel')}
                      </span>
                      <select
                        className="ana-form-select"
                        value={monthlySelectedMonth}
                        onChange={(e) => setMonthlySelectedMonth(e.target.value)}
                      >
                        {monthOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {t(`autoSettings.monthNames.${opt.month}`, {
                              defaultValue: opt.value,
                            })}{' '}
                            {opt.year}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="ana-monthly-label">
                      <span className="ana-monthly-label-text">
                        {t('autoSettings.monthlyLimitLabel')}
                      </span>
                      <select
                        className="ana-form-select"
                        value={monthlyLimit}
                        onChange={(e) =>
                          setMonthlyLimit(Number(e.target.value) || 3)
                        }
                      >
                        {MONTHLY_LIMIT_OPTIONS.map((n) => (
                          <option key={n} value={n}>
                            {t('autoSettings.monthlyLimitOption', { count: n })}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <div className="ana-event-actions">
                    <button
                      type="button"
                      className="ana-event-btn ana-event-btn--ghost"
                      onClick={handleLoadMonthlyPreview}
                      disabled={isMonthlyLoading}
                    >
                      <span className="ana-event-btn-icon">
                        {isMonthlyLoading ? <Loader2 /> : <Eye />}
                      </span>
                      <span className="ana-event-btn-label">
                        {t('autoSettings.monthlyPreview')}
                      </span>
                    </button>
                    <button
                      type="button"
                      className="ana-event-btn ana-event-btn--primary"
                      onClick={() => setShowMonthlyConfirm(true)}
                      disabled={isMonthlySending}
                    >
                      <span className="ana-event-btn-icon">
                        <Send />
                      </span>
                      <span className="ana-event-btn-label">
                        {t('autoSettings.monthlyRunNow')}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* PREVIEW MODAL */}
      {showPreview && preview?.html &&
        createPortal(
          <div
            className="ana-modal-overlay"
            role="dialog"
            aria-modal="true"
            onClick={() => setShowPreview(false)}
          >
            <div className="ana-modal" onClick={(e) => e.stopPropagation()}>
              <div className="ana-modal-head">
                <h3 className="ana-modal-title">{t('autoSettings.previewTitle')}</h3>
                <button
                  type="button"
                  className="ana-modal-close"
                  onClick={() => setShowPreview(false)}
                  aria-label={t('autoSettings.previewClose')}
                >
                  <span className="ana-event-btn-icon">
                    <X />
                  </span>
                </button>
              </div>
              <iframe
                title="Event batch preview"
                className="ana-modal-iframe"
                srcDoc={preview.html}
                sandbox="allow-same-origin"
              />
              <div className="ana-modal-foot">
                <button
                  type="button"
                  className="ana-event-btn ana-event-btn--ghost"
                  onClick={() => setShowPreview(false)}
                >
                  <span className="ana-event-btn-label">
                    {t('autoSettings.previewClose')}
                  </span>
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* CONFIRM SEND MODAL */}
      {showConfirm &&
        createPortal(
          <div
            className="ana-modal-overlay"
            role="dialog"
            aria-modal="true"
            onClick={() => !isSending && setShowConfirm(false)}
          >
            <div
              className="ana-modal ana-modal--narrow"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="ana-modal-title">
                {t('autoSettings.runNowConfirmTitle')}
              </h3>
              <p className="ana-modal-body">
                {t('autoSettings.runNowConfirmBody', {
                  count: preview?.pendingCount || 0,
                })}
              </p>
              <div className="ana-modal-actions">
                <button
                  type="button"
                  className="ana-event-btn ana-event-btn--ghost"
                  onClick={() => setShowConfirm(false)}
                  disabled={isSending}
                >
                  <span className="ana-event-btn-label">
                    {t('autoSettings.runNowConfirmCancel')}
                  </span>
                </button>
                <button
                  type="button"
                  className="ana-event-btn ana-event-btn--danger"
                  onClick={handleRunNow}
                  disabled={isSending}
                >
                  <span className="ana-event-btn-label">
                    {t('autoSettings.runNowConfirmOk')}
                  </span>
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* ADD MANUAL ITEM MODAL */}
      {addForm &&
        createPortal(
          <div
            className="ana-modal-overlay"
            role="dialog"
            aria-modal="true"
            onClick={() => !isSubmitting && setAddForm(null)}
          >
            <div
              className="ana-modal ana-modal--form"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="ana-modal-head">
                <div>
                  <h3 className="ana-modal-title">{t('autoSettings.addManualTitle')}</h3>
                  <p className="ana-modal-body">
                    {t('autoSettings.addManualSubtitle')}
                  </p>
                </div>
                <button
                  type="button"
                  className="ana-modal-close"
                  onClick={() => !isSubmitting && setAddForm(null)}
                  aria-label={t('autoSettings.cancelManual')}
                >
                  <span className="ana-event-btn-icon">
                    <X />
                  </span>
                </button>
              </div>

              <div className="ana-modal-body-scroll">
                <div className="ana-pick-row">
                  <button
                    type="button"
                    className="ana-event-btn ana-event-btn--ghost"
                    onClick={() => setPickerOpen(true)}
                  >
                    <span className="ana-event-btn-icon">
                      <Sparkles />
                    </span>
                    <span className="ana-event-btn-label">
                      {t('autoSettings.pickFromPlatform')}
                    </span>
                  </button>
                </div>

                <div className="ana-form-grid">
                  <div className="ana-form-field">
                    <label className="ana-form-label">
                      {t('autoSettings.targetLabel')}
                    </label>
                    <select
                      className="ana-form-select"
                      value={addForm.status}
                      onChange={(e) =>
                        setAddForm((f) => ({ ...f, status: e.target.value }))
                      }
                    >
                      <option value="pending">{t('autoSettings.targetDaily')}</option>
                      <option value="weekly_pending">
                        {t('autoSettings.targetWeekly')}
                      </option>
                    </select>
                  </div>

                  <div className="ana-form-field">
                    <label className="ana-form-label">
                      {t('autoSettings.categoryLabel')}
                    </label>
                    <select
                      className="ana-form-select"
                      value={addForm.category}
                      onChange={(e) =>
                        setAddForm((f) => ({ ...f, category: e.target.value }))
                      }
                    >
                      {CATEGORY_OPTIONS.map((c) => (
                        <option key={c} value={c}>
                          {t(`editor.categories.${c}`, { defaultValue: c })}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="ana-form-field">
                  <label className="ana-form-label">
                    {t('autoSettings.titleLabel')} *
                  </label>
                  <input
                    type="text"
                    className={`ana-form-input ${addForm.errors.title ? 'ana-form-input--error' : ''}`}
                    placeholder={t('autoSettings.titlePlaceholder')}
                    value={addForm.title}
                    onChange={(e) =>
                      setAddForm((f) => ({
                        ...f,
                        title: e.target.value,
                        errors: { ...f.errors, title: null },
                      }))
                    }
                    maxLength={500}
                  />
                </div>

                <div className="ana-form-field">
                  <label className="ana-form-label">
                    {t('autoSettings.descriptionLabel')}
                  </label>
                  <NewsletterEditorRichText
                    value={addForm.description}
                    onChange={(html) =>
                      setAddForm((f) => ({ ...f, description: html }))
                    }
                    placeholder={t('autoSettings.descriptionPlaceholder')}
                  />
                </div>

                <div className="ana-form-field">
                  <label className="ana-form-label">
                    {t('autoSettings.urlLabel')}
                  </label>
                  <input
                    type="url"
                    className="ana-form-input"
                    placeholder={t('autoSettings.urlPlaceholder')}
                    value={addForm.url}
                    onChange={(e) =>
                      setAddForm((f) => ({ ...f, url: e.target.value }))
                    }
                  />
                </div>

                <div className="ana-form-field">
                  <label className="ana-form-label">
                    {t('autoSettings.thumbnailLabel')}
                  </label>
                  <NewsletterImageUploader
                    value={addForm.images}
                    onChange={(images) =>
                      setAddForm((f) => ({ ...f, images }))
                    }
                    max={1}
                    storagePath="newsletters/queue"
                  />
                </div>
              </div>

              <div className="ana-modal-foot">
                <button
                  type="button"
                  className="ana-event-btn ana-event-btn--ghost"
                  onClick={() => setAddForm(null)}
                  disabled={isSubmitting}
                >
                  <span className="ana-event-btn-label">
                    {t('autoSettings.cancelManual')}
                  </span>
                </button>
                <button
                  type="button"
                  className="ana-event-btn ana-event-btn--primary"
                  onClick={submitAddItem}
                  disabled={isSubmitting}
                >
                  <span className="ana-event-btn-label">
                    {t('autoSettings.saveManual')}
                  </span>
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* MONTHLY PREVIEW MODAL */}
      {showMonthlyPreview && monthlyPreview?.html &&
        createPortal(
          <div
            className="ana-modal-overlay"
            role="dialog"
            aria-modal="true"
            onClick={() => setShowMonthlyPreview(false)}
          >
            <div className="ana-modal" onClick={(e) => e.stopPropagation()}>
              <div className="ana-modal-head">
                <h3 className="ana-modal-title">
                  {t('autoSettings.monthlyPreviewTitle', {
                    month: monthlyPreview.monthLabel || '',
                  })}
                </h3>
                <button
                  type="button"
                  className="ana-modal-close"
                  onClick={() => setShowMonthlyPreview(false)}
                  aria-label={t('autoSettings.previewClose')}
                >
                  <span className="ana-event-btn-icon">
                    <X />
                  </span>
                </button>
              </div>
              <iframe
                title="Monthly report preview"
                className="ana-modal-iframe"
                srcDoc={monthlyPreview.html}
                sandbox="allow-same-origin"
              />
              <div className="ana-modal-foot">
                <button
                  type="button"
                  className="ana-event-btn ana-event-btn--ghost"
                  onClick={() => setShowMonthlyPreview(false)}
                >
                  <span className="ana-event-btn-label">
                    {t('autoSettings.previewClose')}
                  </span>
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* MONTHLY CONFIRM MODAL */}
      {showMonthlyConfirm &&
        createPortal(
          <div
            className="ana-modal-overlay"
            role="dialog"
            aria-modal="true"
            onClick={() => !isMonthlySending && setShowMonthlyConfirm(false)}
          >
            <div
              className="ana-modal ana-modal--narrow"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="ana-modal-title">
                {t('autoSettings.monthlyRunConfirmTitle')}
              </h3>
              <p className="ana-modal-body">
                {t('autoSettings.monthlyRunConfirmBody', {
                  count: monthlyPreview?.recipientCount || 0,
                })}
              </p>
              <div className="ana-modal-actions">
                <button
                  type="button"
                  className="ana-event-btn ana-event-btn--ghost"
                  onClick={() => setShowMonthlyConfirm(false)}
                  disabled={isMonthlySending}
                >
                  <span className="ana-event-btn-label">
                    {t('autoSettings.runNowConfirmCancel')}
                  </span>
                </button>
                <button
                  type="button"
                  className="ana-event-btn ana-event-btn--danger"
                  onClick={handleRunMonthlyNow}
                  disabled={isMonthlySending}
                >
                  <span className="ana-event-btn-label">
                    {t('autoSettings.runNowConfirmOk')}
                  </span>
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* PLATFORM CONTENT PICKER */}
      <NewsletterContentPicker
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={handlePickFromPlatform}
      />
    </div>
  );
};
