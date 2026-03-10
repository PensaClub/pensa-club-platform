import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useFactCheck } from '../../contexts/FactCheckProvider';
import './factCheckSignalForm.css';

const SOURCE_TYPES = [
  'website', 'internet', 'newspapers', 'news_tv',
  'friends', 'email', 'phone', 'anonymous_call', 'other',
];

const MIN_CLAIM_LENGTH = 10;
const SIGNAL_RATE_KEY = 'fc_signal_submissions';
const SIGNAL_RATE_LIMIT = 3;
const SIGNAL_RATE_WINDOW = 60 * 60 * 1000; // 1 hour

const getClientSubmissions = () => {
  try {
    const raw = localStorage.getItem(SIGNAL_RATE_KEY);
    if (!raw) return [];
    const timestamps = JSON.parse(raw);
    const cutoff = Date.now() - SIGNAL_RATE_WINDOW;
    return timestamps.filter((ts) => ts > cutoff);
  } catch {
    return [];
  }
};

const recordClientSubmission = () => {
  const submissions = getClientSubmissions();
  submissions.push(Date.now());
  localStorage.setItem(SIGNAL_RATE_KEY, JSON.stringify(submissions));
};

const FactCheckSignalForm = () => {
  const { t } = useTranslation('factcheck');
  const { submitSignal, isLoading } = useFactCheck();
  const formRenderedAt = useRef(Date.now());

  const [formData, setFormData] = useState({
    claimText: '',
    sourceType: '',
    city: '',
    reporterEmail: '',
    isConfidential: false,
  });
  const [honeypot, setHoneypot] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [errorVisible, setErrorVisible] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // Auto-dismiss toast after 5 seconds
  useEffect(() => {
    if (!error) { setErrorVisible(false); return; }
    setErrorVisible(true);
    const timer = setTimeout(() => setErrorVisible(false), 4500);
    const clearTimer = setTimeout(() => setError(''), 5000);
    return () => { clearTimeout(timer); clearTimeout(clearTimer); };
  }, [error]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear field error on change
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const errors = {};

    if (!formData.claimText.trim()) {
      errors.claimText = t('signalForm.errors.claimRequired');
    } else if (formData.claimText.trim().length < MIN_CLAIM_LENGTH) {
      errors.claimText = t('signalForm.errors.claimTooShort', { min: MIN_CLAIM_LENGTH });
    }

    if (!formData.sourceType) {
      errors.sourceType = t('signalForm.errors.sourceRequired');
    }

    if (formData.reporterEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.reporterEmail)) {
      errors.reporterEmail = t('signalForm.errors.invalidEmail');
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    // Client-side rate limit check (survives server restarts)
    const recentSubmissions = getClientSubmissions();
    if (recentSubmissions.length >= SIGNAL_RATE_LIMIT) {
      const oldestInWindow = Math.min(...recentSubmissions);
      const resetAt = oldestInWindow + SIGNAL_RATE_WINDOW;
      const minutes = Math.ceil((resetAt - Date.now()) / 60000);
      setError(t('signalForm.errors.tooManyRequests', { minutes }));
      return;
    }

    try {
      const result = await submitSignal({
        ...formData,
        _hp: honeypot,
        _t: formRenderedAt.current,
      });

      // Rate limit — requester returns { error: true, status: 429, remainingMinutes }
      if (result?.error && result?.status === 429) {
        const minutes = result.remainingMinutes || 60;
        setError(t('signalForm.errors.tooManyRequests', { minutes }));
        return;
      }

      recordClientSubmission();
      setSubmitted(true);
    } catch (err) {
      // Zod validation errors — thrown by requester when !response.ok
      if (err?.details?.length) {
        const serverFieldErrors = {};
        const fieldMap = {
          claimText: 'claimText',
          sourceType: 'sourceType',
          reporterEmail: 'reporterEmail',
          city: 'city',
        };
        err.details.forEach((d) => {
          const key = fieldMap[d.field];
          if (key) serverFieldErrors[key] = d.message;
        });
        if (Object.keys(serverFieldErrors).length > 0) {
          setFieldErrors(serverFieldErrors);
          return;
        }
      }

      setError(t('signalForm.errors.generic'));
    }
  };

  const handleReset = () => {
    setFormData({ claimText: '', sourceType: '', city: '', reporterEmail: '', isConfidential: false });
    setHoneypot('');
    formRenderedAt.current = Date.now();
    setSubmitted(false);
    setError('');
    setFieldErrors({});
  };

  if (submitted) {
    return (
      <section className="fcsf" id="signal-form">
        <div className="fcsf-container">
          <div className="fcsf-success">
            <div className="fcsf-success-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h3>{t('signalForm.successTitle')}</h3>
            <p>{t('signalForm.successDesc')}</p>
            <button className="fcsf-btn fcsf-btn--secondary" onClick={handleReset}>
              {t('signalForm.sendAnother')}
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="fcsf" id="signal-form">
      <div className="fcsf-container">
        <div className="fcsf-header">
          <h2 className="fcsf-title">{t('signalForm.title')}</h2>
          <p className="fcsf-subtitle">{t('signalForm.subtitle')}</p>
        </div>

        <form className="fcsf-form" onSubmit={handleSubmit}>
          {/* Honeypot — hidden from humans, bots fill it */}
          <div className="fcsf-hp" aria-hidden="true" tabIndex={-1}>
            <input
              type="text"
              name="website"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              autoComplete="off"
              tabIndex={-1}
            />
          </div>

          {/* Claim text */}
          <div className="fcsf-field">
            <label className="fcsf-label">{t('signalForm.claimLabel')} *</label>
            <textarea
              name="claimText"
              className={`fcsf-textarea ${fieldErrors.claimText ? 'fcsf-input--error' : ''}`}
              placeholder={t('signalForm.claimPlaceholder')}
              value={formData.claimText}
              onChange={handleChange}
              rows={4}
            />
            {fieldErrors.claimText && <span className="fcsf-field-error">{fieldErrors.claimText}</span>}
          </div>

          {/* Source type */}
          <div className="fcsf-field">
            <label className="fcsf-label">{t('signalForm.sourceLabel')} *</label>
            <select
              name="sourceType"
              className={`fcsf-select ${fieldErrors.sourceType ? 'fcsf-input--error' : ''}`}
              value={formData.sourceType}
              onChange={handleChange}
            >
              <option value="">{t('signalForm.sourcePlaceholder')}</option>
              {SOURCE_TYPES.map((st) => (
                <option key={st} value={st}>{t(`sourceTypes.${st}`)}</option>
              ))}
            </select>
            {fieldErrors.sourceType && <span className="fcsf-field-error">{fieldErrors.sourceType}</span>}
          </div>

          {/* City + Email row */}
          <div className="fcsf-row">
            <div className="fcsf-field">
              <label className="fcsf-label">{t('signalForm.cityLabel')}</label>
              <input
                type="text"
                name="city"
                className="fcsf-input"
                placeholder={t('signalForm.cityPlaceholder')}
                value={formData.city}
                onChange={handleChange}
              />
            </div>
            <div className="fcsf-field">
              <label className="fcsf-label">{t('signalForm.emailLabel')}</label>
              <input
                type="email"
                name="reporterEmail"
                className={`fcsf-input ${fieldErrors.reporterEmail ? 'fcsf-input--error' : ''}`}
                placeholder={t('signalForm.emailPlaceholder')}
                value={formData.reporterEmail}
                onChange={handleChange}
              />
              {fieldErrors.reporterEmail && <span className="fcsf-field-error">{fieldErrors.reporterEmail}</span>}
            </div>
          </div>

          {/* Confidential */}
          <label className="fcsf-checkbox">
            <input
              type="checkbox"
              name="isConfidential"
              checked={formData.isConfidential}
              onChange={handleChange}
            />
            <span className="fcsf-checkbox-box"></span>
            <span className="fcsf-checkbox-text">
              <strong>{t('signalForm.confidentialLabel')}</strong>
              <br />
              <span className="fcsf-checkbox-hint">{t('signalForm.confidentialDesc')}</span>
            </span>
          </label>

          <button type="submit" className="fcsf-btn fcsf-btn--primary" disabled={isLoading}>
            {isLoading ? t('signalForm.submitting') : t('signalForm.submit')}
          </button>
        </form>

        {/* Toast notification */}
        {error && (
          <div className={`fcsf-toast ${errorVisible ? 'fcsf-toast--visible' : 'fcsf-toast--hidden'}`}>
            <svg className="fcsf-toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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

export default FactCheckSignalForm;
