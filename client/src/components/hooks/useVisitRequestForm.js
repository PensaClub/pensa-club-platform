import { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

const RATE_KEY = 'reaction_submissions';
const RATE_LIMIT = 3;
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour

const getClientSubmissions = () => {
  try {
    const raw = localStorage.getItem(RATE_KEY);
    if (!raw) return [];
    const timestamps = JSON.parse(raw);
    const cutoff = Date.now() - RATE_WINDOW;
    return timestamps.filter((ts) => ts > cutoff);
  } catch {
    return [];
  }
};

const recordClientSubmission = () => {
  const submissions = getClientSubmissions();
  submissions.push(Date.now());
  localStorage.setItem(RATE_KEY, JSON.stringify(submissions));
};

const useVisitRequestForm = (initialData = {}) => {
  const { t } = useTranslation('reaction');
  const formRenderedAt = useRef(Date.now());

  const [formData, setFormData] = useState({
    clubName: '',
    city: '',
    participantsCount: '',
    topic: '',
    topicOther: '',
    preferredDate: '',
    contactName: '',
    contactPhone: '',
    contactEmail: initialData.contactEmail || '',
    notes: '',
  });

  const [honeypot, setHoneypot] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [trackingCode, setTrackingCode] = useState('');

  const validateField = useCallback((name, value) => {
    switch (name) {
      case 'clubName':
        if (!value.trim()) return t('form.errors.clubNameRequired');
        if (value.trim().length < 3) return t('form.errors.clubNameTooShort');
        return '';
      case 'city':
        if (!value.trim()) return t('form.errors.cityRequired');
        return '';
      case 'participantsCount':
        if (!value) return t('form.errors.participantsRequired');
        if (isNaN(value) || Number(value) < 1) return t('form.errors.participantsInvalid');
        return '';
      case 'topic':
        if (!value) return t('form.errors.topicRequired');
        return '';
      case 'topicOther':
        if (!value.trim()) return t('form.errors.topicOtherRequired');
        return '';
      case 'preferredDate':
        if (!value) return t('form.errors.dateRequired');
        return '';
      case 'contactName':
        if (!value.trim()) return t('form.errors.contactNameRequired');
        return '';
      case 'contactPhone':
        if (!value.trim()) return t('form.errors.contactPhoneRequired');
        if (!/^[\d\s\+\-()]{7,20}$/.test(value.trim())) return t('form.errors.contactPhoneInvalid');
        return '';
      case 'contactEmail':
        if (!value.trim()) return t('form.errors.contactEmailRequired');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return t('form.errors.contactEmailInvalid');
        return '';
      default:
        return '';
    }
  }, [t]);

  const validateForm = useCallback(() => {
    const errors = {};
    const requiredFields = ['clubName', 'city', 'participantsCount', 'topic', 'contactName', 'contactPhone', 'contactEmail', 'preferredDate'];

    requiredFields.forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) errors[field] = error;
    });

    if (formData.topic === 'other') {
      const otherError = validateField('topicOther', formData.topicOther);
      if (otherError) errors.topicOther = otherError;
    }

    return errors;
  }, [formData, validateField]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  }, [fieldErrors]);

  const handleDateSelect = useCallback((date) => {
    setFormData((prev) => ({ ...prev, preferredDate: date }));
    if (fieldErrors.preferredDate) {
      setFieldErrors((prev) => ({ ...prev, preferredDate: '' }));
    }
  }, [fieldErrors]);

  const handleSubmit = useCallback(async (submitFn) => {
    setFieldErrors({});

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return { success: false, reason: 'validation' };
    }

    // Honeypot check
    if (honeypot) {
      // Silently fail for bots
      setSubmitted(true);
      return { success: false, reason: 'honeypot' };
    }

    // Timestamp check (form must be rendered for at least 3 seconds)
    const elapsed = Date.now() - formRenderedAt.current;
    if (elapsed < 3000) {
      setSubmitted(true);
      return { success: false, reason: 'timestamp' };
    }

    // Client-side rate limit
    const recentSubmissions = getClientSubmissions();
    if (recentSubmissions.length >= RATE_LIMIT) {
      const oldestInWindow = Math.min(...recentSubmissions);
      const resetAt = oldestInWindow + RATE_WINDOW;
      const minutes = Math.ceil((resetAt - Date.now()) / 60000);
      return { success: false, reason: 'rateLimit', minutes };
    }

    setSubmitting(true);
    try {
      const result = await submitFn({
        ...formData,
        participantsCount: Number(formData.participantsCount),
        _hp: honeypot,
        _t: formRenderedAt.current,
      });

      // Rate limit response from server
      if (result?.error && result?.status === 429) {
        const minutes = result.remainingMinutes || 60;
        return { success: false, reason: 'rateLimit', minutes };
      }

      recordClientSubmission();
      setTrackingCode(result?.trackingCode || '');
      setSubmitted(true);
      return { success: true };
    } catch (err) {
      // Duplicate request error (409)
      if (err?.error === 'duplicateRequest' || err?.status === 409) {
        return { success: false, reason: 'duplicateRequest', trackingCode: err?.trackingCode };
      }
      // Zod validation errors
      if (err?.details?.length) {
        const serverFieldErrors = {};
        err.details.forEach((d) => {
          if (d.field) serverFieldErrors[d.field] = d.message;
        });
        if (Object.keys(serverFieldErrors).length > 0) {
          setFieldErrors(serverFieldErrors);
          return { success: false, reason: 'serverValidation' };
        }
      }
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, [formData, honeypot, validateForm]);

  const resetForm = useCallback(() => {
    setFormData({
      clubName: '',
      city: '',
      participantsCount: '',
      topic: '',
      topicOther: '',
      preferredDate: '',
      contactName: '',
      contactPhone: '',
      contactEmail: '',
      notes: '',
    });
    setHoneypot('');
    formRenderedAt.current = Date.now();
    setSubmitted(false);
    setSubmitting(false);
    setTrackingCode('');
    setFieldErrors({});
  }, []);

  return {
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
  };
};

export default useVisitRequestForm;
