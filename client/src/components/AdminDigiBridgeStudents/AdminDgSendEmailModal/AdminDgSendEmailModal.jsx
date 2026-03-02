// src/components/AdminDigiBridgeStudents/AdminDgSendEmailModal/AdminDgSendEmailModal.jsx

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAcademy } from '../../contexts/AcademyProvider';
import './adminDgSendEmailModal.css';

export const AdminDgSendEmailModal = ({ student, onClose, onSuccess }) => {
  const { t } = useTranslation('digibridge-students');
  const { sendPersonalEmail } = useAcademy();

  const [formData, setFormData] = useState({
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [charCount, setCharCount] = useState(0);

  const MAX_MESSAGE_LENGTH = 2000;
  const ACADEMY_EMAIL = 'academy@pensa.club'; // Официален имейл на академията

  // Update char count
  useEffect(() => {
    setCharCount(formData.message.length);
  }, [formData.message]);

  // Backdrop click handler
  const handleBackdropClick = useCallback((e) => {
    if (e.target.classList.contains('adminDgSendEmailModal-overlay')) {
      onClose();
    }
  }, [onClose]);

  // ESC key handler
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape' && !sending) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [sending, onClose]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Limit message length
    if (name === 'message' && value.length > MAX_MESSAGE_LENGTH) {
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error on change
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.subject.trim()) {
      newErrors.subject = t('adminDgSendEmailModal.errors.subjectRequired');
    } else if (formData.subject.trim().length < 3) {
      newErrors.subject = t('adminDgSendEmailModal.errors.subjectTooShort');
    }

    if (!formData.message.trim()) {
      newErrors.message = t('adminDgSendEmailModal.errors.messageRequired');
    } else if (formData.message.trim().length < 10) {
      newErrors.message = t('adminDgSendEmailModal.errors.messageTooShort');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle send
  const handleSend = async () => {
    if (!validateForm()) return;

    setSending(true);
    try {
      // ✅ Използваме sendPersonalEmail с правилния формат
      const success = await sendPersonalEmail({
        from: ACADEMY_EMAIL,
        to: student.email,
        subject: formData.subject.trim(),
        message: formData.message.trim()
      });

      if (success) {
        onSuccess?.(); // Опционален callback за успех
        onClose();
      }
    } catch (error) {
      console.error('Error sending email:', error);
    } finally {
      setSending(false);
    }
  };

  // Email templates
  const templates = [
    { 
      key: 'welcome', 
      label: t('adminDgSendEmailModal.templates.welcome'),
      subject: t('adminDgSendEmailModal.templateContent.welcome.subject'),
      message: t('adminDgSendEmailModal.templateContent.welcome.message', { name: student?.name })
    },
    { 
      key: 'reminder', 
      label: t('adminDgSendEmailModal.templates.reminder'),
      subject: t('adminDgSendEmailModal.templateContent.reminder.subject'),
      message: t('adminDgSendEmailModal.templateContent.reminder.message', { name: student?.name })
    },
    { 
      key: 'inactive', 
      label: t('adminDgSendEmailModal.templates.inactive'),
      subject: t('adminDgSendEmailModal.templateContent.inactive.subject'),
      message: t('adminDgSendEmailModal.templateContent.inactive.message', { name: student?.name })
    }
  ];

  // Apply template
  const applyTemplate = (template) => {
    setFormData({
      subject: template.subject,
      message: template.message
    });
    setErrors({});
  };

  if (!student) return null;

  return (
    <div className="adminDgSendEmailModal-overlay" onClick={handleBackdropClick}>
      <div className="adminDgSendEmailModal-container">
        {/* Header */}
        <div className="adminDgSendEmailModal-header">
          <div className="adminDgSendEmailModal-headerIcon">
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" fill="currentColor"/>
            </svg>
          </div>
          <h2 className="adminDgSendEmailModal-title">
            {t('adminDgSendEmailModal.title')}
          </h2>
          <button
            className="adminDgSendEmailModal-closeBtn"
            onClick={onClose}
            disabled={sending}
            type="button"
            aria-label="Close"
          >
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="adminDgSendEmailModal-content">
          {/* Recipient Info */}
          <div className="adminDgSendEmailModal-recipient">
            <span className="adminDgSendEmailModal-recipientLabel">
              {t('adminDgSendEmailModal.to')}:
            </span>
            <div className="adminDgSendEmailModal-recipientInfo">
              <div className="adminDgSendEmailModal-recipientAvatar">
                {student.avatar ? (
                  <img src={student.avatar} alt={student.name} />
                ) : (
                  <div className="adminDgSendEmailModal-avatarPlaceholder">
                    {student.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                )}
              </div>
              <div className="adminDgSendEmailModal-recipientDetails">
                <div className="adminDgSendEmailModal-recipientName">{student.name}</div>
                <div className="adminDgSendEmailModal-recipientEmail">{student.email}</div>
              </div>
            </div>
          </div>

          {/* Quick Templates */}
          <div className="adminDgSendEmailModal-templates">
            <span className="adminDgSendEmailModal-templatesLabel">
              {t('adminDgSendEmailModal.quickTemplates')}:
            </span>
            <div className="adminDgSendEmailModal-templateBtns">
              {templates.map((template) => (
                <button
                  key={template.key}
                  className="adminDgSendEmailModal-templateBtn"
                  onClick={() => applyTemplate(template)}
                  disabled={sending}
                  type="button"
                >
                  {template.label}
                </button>
              ))}
            </div>
          </div>

          {/* Subject Field */}
          <div className="adminDgSendEmailModal-field">
            <label className="adminDgSendEmailModal-label">
              {t('adminDgSendEmailModal.subject')} <span className="adminDgSendEmailModal-required">*</span>
            </label>
            <input
              type="text"
              name="subject"
              className={`adminDgSendEmailModal-input ${errors.subject ? 'adminDgSendEmailModal-input--error' : ''}`}
              placeholder={t('adminDgSendEmailModal.subjectPlaceholder')}
              value={formData.subject}
              onChange={handleChange}
              disabled={sending}
              maxLength={150}
            />
            {errors.subject && (
              <span className="adminDgSendEmailModal-error">{errors.subject}</span>
            )}
          </div>

          {/* Message Field */}
          <div className="adminDgSendEmailModal-field">
            <label className="adminDgSendEmailModal-label">
              {t('adminDgSendEmailModal.message')} <span className="adminDgSendEmailModal-required">*</span>
            </label>
            <textarea
              name="message"
              className={`adminDgSendEmailModal-textarea ${errors.message ? 'adminDgSendEmailModal-textarea--error' : ''}`}
              placeholder={t('adminDgSendEmailModal.messagePlaceholder')}
              value={formData.message}
              onChange={handleChange}
              disabled={sending}
              rows={8}
            />
            <div className="adminDgSendEmailModal-textareaFooter">
              {errors.message && (
                <span className="adminDgSendEmailModal-error">{errors.message}</span>
              )}
              <span className={`adminDgSendEmailModal-charCount ${charCount > MAX_MESSAGE_LENGTH * 0.9 ? 'adminDgSendEmailModal-charCount--warning' : ''}`}>
                {charCount}/{MAX_MESSAGE_LENGTH}
              </span>
            </div>
          </div>

          {/* Info Note */}
          <div className="adminDgSendEmailModal-note">
            <svg width="16" height="16" viewBox="0 0 16 16">
              <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 11a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm1-3.5a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-4a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v4z" fill="currentColor"/>
            </svg>
            <span>{t('adminDgSendEmailModal.note')}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="adminDgSendEmailModal-footer">
          <button
            className="adminDgSendEmailModal-btnCancel"
            onClick={onClose}
            disabled={sending}
            type="button"
          >
            {t('common.cancel')}
          </button>
          <button
            className="adminDgSendEmailModal-btnSend"
            onClick={handleSend}
            disabled={sending || !formData.subject.trim() || !formData.message.trim()}
            type="button"
          >
            {sending ? (
              <>
                <div className="adminDgSendEmailModal-btnSpinner"></div>
                {t('adminDgSendEmailModal.sending')}
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path d="M1.5 15.5l15-6.5-15-6.5v5l10.5 1.5-10.5 1.5z" fill="currentColor"/>
                </svg>
                {t('adminDgSendEmailModal.send')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};