import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../../contexts/UserContext';
import { useReAction } from '../../contexts/ReActionProvider';
import useVisitRequestForm from '../../hooks/useVisitRequestForm';
import ReActionCalendar from '../ReActionCalendar/ReActionCalendar';
import './reActionBookingForm.css';

const TOPIC_OPTIONS = ['fake_news', 'voter_rights', 'election_process', 'other'];

const ReActionBookingForm = () => {
  const { t } = useTranslation('reaction');
  const { isAuthentication, userEmail } = useAuthContext();
  const { submitRequest, isLoading } = useReAction();
  const {
    formData,
    honeypot,
    setHoneypot,
    fieldErrors,
    submitted,
    submitting,
    trackingCode,
    handleChange,
    handleDateSelect,
    handleSubmit,
    resetForm,
  } = useVisitRequestForm({
    contactEmail: isAuthentication ? userEmail : '',
  });

  const [error, setError] = useState('');
  const [errorVisible, setErrorVisible] = useState(false);
  const [duplicateInfo, setDuplicateInfo] = useState(null);

  // Auto-dismiss toast after 5 seconds
  useEffect(() => {
    if (!error) { setErrorVisible(false); return; }
    setErrorVisible(true);
    const timer = setTimeout(() => setErrorVisible(false), 4500);
    const clearTimer = setTimeout(() => setError(''), 5000);
    return () => { clearTimeout(timer); clearTimeout(clearTimer); };
  }, [error]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setDuplicateInfo(null);

    try {
      const result = await handleSubmit(submitRequest);
      if (!result.success) {
        if (result.reason === 'duplicateRequest') {
          setDuplicateInfo({ trackingCode: result.trackingCode || '' });
        } else if (result.reason === 'rateLimit') {
          setError(t('form.errors.tooManyRequests', { minutes: result.minutes }));
        } else if (result.reason === 'validation' || result.reason === 'serverValidation') {
          // Field errors are already set by the hook
        }
        // honeypot/timestamp silently succeed
      }
    } catch {
      setError(t('form.errors.generic'));
    }
  };

  if (submitted) {
    return (
      <section className="rabf" id="booking-form">
        <div className="rabf-container">
          <div className="rabf-success">
            <div className="rabf-success-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h3>{t('form.successTitle')}</h3>
            <p>{t('form.successMessage')}</p>
            {trackingCode && (
              <div className="rabf-tracking">
                <span className="rabf-tracking-label">{t('form.successTrackingCode')}</span>
                <span className="rabf-tracking-code">{trackingCode}</span>
                <span className="rabf-tracking-hint">{t('form.successTrackingHint')}</span>
              </div>
            )}
            <div className="rabf-success-actions">
              <Link to="/reaction/track" className="rabf-btn rabf-btn--primary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                {t('form.trackRequest')}
              </Link>
              <button className="rabf-btn rabf-btn--secondary" onClick={resetForm}>
                {t('form.sendAnother')}
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rabf" id="booking-form">
      <div className="rabf-container">
        <div className="rabf-header">
          <h2 className="rabf-title">{t('form.title')}</h2>
          <p className="rabf-subtitle">{t('form.subtitle')}</p>
        </div>

        <form className="rabf-form" onSubmit={onSubmit}>
          {/* Honeypot */}
          <div className="rabf-hp" aria-hidden="true" tabIndex={-1}>
            <input
              type="text"
              name="website"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              autoComplete="off"
              tabIndex={-1}
            />
          </div>

          {/* Club Name + City */}
          <div className="rabf-row">
            <div className="rabf-field">
              <label className="rabf-label">{t('form.clubName')} *</label>
              <input
                type="text"
                name="clubName"
                className={`rabf-input ${fieldErrors.clubName ? 'rabf-input--error' : ''}`}
                placeholder={t('form.clubNamePlaceholder')}
                value={formData.clubName}
                onChange={handleChange}
              />
              {fieldErrors.clubName && <span className="rabf-field-error">{fieldErrors.clubName}</span>}
            </div>
            <div className="rabf-field">
              <label className="rabf-label">{t('form.city')} *</label>
              <input
                type="text"
                name="city"
                className={`rabf-input ${fieldErrors.city ? 'rabf-input--error' : ''}`}
                placeholder={t('form.cityPlaceholder')}
                value={formData.city}
                onChange={handleChange}
              />
              {fieldErrors.city && <span className="rabf-field-error">{fieldErrors.city}</span>}
            </div>
          </div>

          {/* Participants + Topic */}
          <div className="rabf-row">
            <div className="rabf-field">
              <label className="rabf-label">{t('form.participantsCount')} *</label>
              <input
                type="number"
                name="participantsCount"
                className={`rabf-input ${fieldErrors.participantsCount ? 'rabf-input--error' : ''}`}
                placeholder={t('form.participantsCountPlaceholder')}
                value={formData.participantsCount}
                onChange={handleChange}
                min="1"
              />
              {fieldErrors.participantsCount && <span className="rabf-field-error">{fieldErrors.participantsCount}</span>}
            </div>
            <div className="rabf-field">
              <label className="rabf-label">{t('form.topic')} *</label>
              <select
                name="topic"
                className={`rabf-select ${fieldErrors.topic ? 'rabf-input--error' : ''}`}
                value={formData.topic}
                onChange={handleChange}
              >
                <option value="">{t('form.topicPlaceholder')}</option>
                {TOPIC_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{t(`form.topicOptions.${opt}`)}</option>
                ))}
              </select>
              {fieldErrors.topic && <span className="rabf-field-error">{fieldErrors.topic}</span>}
            </div>
          </div>

          {/* Topic Other */}
          {formData.topic === 'other' && (
            <div className="rabf-field">
              <label className="rabf-label">{t('form.topicOther')} *</label>
              <input
                type="text"
                name="topicOther"
                className={`rabf-input ${fieldErrors.topicOther ? 'rabf-input--error' : ''}`}
                placeholder={t('form.topicOtherPlaceholder')}
                value={formData.topicOther}
                onChange={handleChange}
              />
              {fieldErrors.topicOther && <span className="rabf-field-error">{fieldErrors.topicOther}</span>}
            </div>
          )}

          {/* Preferred Date — Calendar */}
          <div className="rabf-field">
            <label className="rabf-label">{t('form.preferredDate')} *</label>
            <ReActionCalendar
              selectedDate={formData.preferredDate}
              onDateSelect={handleDateSelect}
            />
            {fieldErrors.preferredDate && <span className="rabf-field-error">{fieldErrors.preferredDate}</span>}
          </div>

          {/* Contact Name + Phone */}
          <div className="rabf-row">
            <div className="rabf-field">
              <label className="rabf-label">{t('form.contactName')} *</label>
              <input
                type="text"
                name="contactName"
                className={`rabf-input ${fieldErrors.contactName ? 'rabf-input--error' : ''}`}
                placeholder={t('form.contactNamePlaceholder')}
                value={formData.contactName}
                onChange={handleChange}
              />
              {fieldErrors.contactName && <span className="rabf-field-error">{fieldErrors.contactName}</span>}
            </div>
            <div className="rabf-field">
              <label className="rabf-label">{t('form.contactPhone')} *</label>
              <input
                type="tel"
                name="contactPhone"
                className={`rabf-input ${fieldErrors.contactPhone ? 'rabf-input--error' : ''}`}
                placeholder={t('form.contactPhonePlaceholder')}
                value={formData.contactPhone}
                onChange={handleChange}
              />
              {fieldErrors.contactPhone && <span className="rabf-field-error">{fieldErrors.contactPhone}</span>}
            </div>
          </div>

          {/* Email */}
          <div className="rabf-field">
            <label className="rabf-label">{t('form.contactEmail')} *</label>
            <input
              type="email"
              name="contactEmail"
              className={`rabf-input ${fieldErrors.contactEmail ? 'rabf-input--error' : ''}`}
              placeholder={t('form.contactEmailPlaceholder')}
              value={formData.contactEmail}
              onChange={handleChange}
            />
            {isAuthentication && userEmail && formData.contactEmail === userEmail && (
              <span className="rabf-field-hint">{t('form.usingProfileEmail')}</span>
            )}
            {fieldErrors.contactEmail && <span className="rabf-field-error">{fieldErrors.contactEmail}</span>}
          </div>

          {/* Notes */}
          <div className="rabf-field">
            <label className="rabf-label">{t('form.notes')}</label>
            <textarea
              name="notes"
              className="rabf-textarea"
              placeholder={t('form.notesPlaceholder')}
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              maxLength={1000}
            />
          </div>

          {/* Duplicate request banner */}
          {duplicateInfo && (
            <div className="rabf-duplicate">
              <div className="rabf-duplicate-text">
                {t('form.errors.duplicateRequest', { trackingCode: duplicateInfo.trackingCode })}
              </div>
              <div className="rabf-duplicate-actions">
                <Link to={`/reaction/track/${duplicateInfo.trackingCode}`} className="rabf-duplicate-link">
                  {t('form.trackRequest')}
                </Link>
                {isAuthentication && (
                  <Link to="/reaction/my" className="rabf-duplicate-link">
                    {t('form.errors.manageRequests')}
                  </Link>
                )}
              </div>
            </div>
          )}

          <button
            type="submit"
            className="rabf-btn rabf-btn--primary"
            disabled={submitting || isLoading}
          >
            {submitting ? t('form.submitting') : t('form.submit')}
          </button>
        </form>

        {/* Toast notification */}
        {error && (
          <div className={`rabf-toast ${errorVisible ? 'rabf-toast--visible' : 'rabf-toast--hidden'}`}>
            <svg className="rabf-toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}
      </div>
    </section>
  );
};

export default ReActionBookingForm;
