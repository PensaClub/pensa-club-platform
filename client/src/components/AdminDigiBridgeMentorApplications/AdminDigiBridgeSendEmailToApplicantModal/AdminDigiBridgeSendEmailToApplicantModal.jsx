// src/components/AdminDigiBridgeMentorApplications/AdminDigiBridgeSendEmailToApplicantModal/AdminDigiBridgeSendEmailToApplicantModal.jsx

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAcademy } from '../../contexts/AcademyProvider';
import { toast } from 'react-toastify';
import './adminDigiBridgeSendEmailToApplicantModal.css';

export const AdminDigiBridgeSendEmailToApplicantModal = ({ 
  application, 
  onClose 
}) => {
  const { t } = useTranslation('digibridge');
  const { sendPersonalEmail } = useAcademy();

  const [formData, setFormData] = useState({
    subject: '',
    message: ''
  });
  const [isSending, setIsSending] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.subject.trim() || !formData.message.trim()) {
      toast.error(t('AdminDigiBridgeSendEmailToApplicantModal.fillAllFields'));
      return;
    }

    setIsSending(true);
    try {
      await sendPersonalEmail({
        to: application.email,
        subject: formData.subject,
        message: formData.message,
        recipientName: application.name
      });

      toast.success(t('AdminDigiBridgeSendEmailToApplicantModal.successMessage'));
      onClose();
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error(t('AdminDigiBridgeSendEmailToApplicantModal.errorMessage'));
    } finally {
      setIsSending(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isSending) {
      onClose();
    }
  };

  // Quick message templates
  const templates = [
    {
      key: 'welcome',
      subject: t('AdminDigiBridgeSendEmailToApplicantModal.templateWelcomeSubject'),
      message: t('AdminDigiBridgeSendEmailToApplicantModal.templateWelcomeMessage', { name: application.name })
    },
    {
      key: 'moreInfo',
      subject: t('AdminDigiBridgeSendEmailToApplicantModal.templateMoreInfoSubject'),
      message: t('AdminDigiBridgeSendEmailToApplicantModal.templateMoreInfoMessage', { name: application.name })
    },
    {
      key: 'interview',
      subject: t('AdminDigiBridgeSendEmailToApplicantModal.templateInterviewSubject'),
      message: t('AdminDigiBridgeSendEmailToApplicantModal.templateInterviewMessage', { name: application.name })
    }
  ];

  const applyTemplate = (template) => {
    setFormData({
      subject: template.subject,
      message: template.message
    });
  };

  return (
    <div 
      className="admin-digibridge-send-email-to-applicant-modal-overlay" 
      onClick={handleBackdropClick}
    >
      <div className="admin-digibridge-send-email-to-applicant-modal">
        {/* CLOSE BUTTON */}
        <button 
          className="admin-digibridge-send-email-to-applicant-modal-close"
          onClick={onClose}
          disabled={isSending}
          aria-label="Close"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* HEADER */}
        <div className="admin-digibridge-send-email-to-applicant-modal-header">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
          <h2>{t('AdminDigiBridgeSendEmailToApplicantModal.title')}</h2>
        </div>

        {/* RECIPIENT INFO */}
        <div className="admin-digibridge-send-email-to-applicant-modal-recipient">
          <div className="admin-digibridge-send-email-to-applicant-modal-recipient-info">
            <img
              src={application.photoUrl}
              alt={application.name}
              className="admin-digibridge-send-email-to-applicant-modal-recipient-photo"
              onError={(e) => {
                e.target.src = "/images/homePage/user-it.png";
              }}
            />
            <div className="admin-digibridge-send-email-to-applicant-modal-recipient-details">
              <span className="admin-digibridge-send-email-to-applicant-modal-recipient-label">
                {t('AdminDigiBridgeSendEmailToApplicantModal.sendingTo')}:
              </span>
              <span className="admin-digibridge-send-email-to-applicant-modal-recipient-name">
                {application.name}
              </span>
              <span className="admin-digibridge-send-email-to-applicant-modal-recipient-email">
                {application.email}
              </span>
            </div>
          </div>
        </div>

        {/* TEMPLATES */}
        <div className="admin-digibridge-send-email-to-applicant-modal-templates">
          <label className="admin-digibridge-send-email-to-applicant-modal-templates-label">
            {t('AdminDigiBridgeSendEmailToApplicantModal.quickTemplates')}:
          </label>
          <div className="admin-digibridge-send-email-to-applicant-modal-templates-grid">
            {templates.map(template => (
              <button
                key={template.key}
                type="button"
                onClick={() => applyTemplate(template)}
                className="admin-digibridge-send-email-to-applicant-modal-template-btn"
                disabled={isSending}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
                {t(`AdminDigiBridgeSendEmailToApplicantModal.template${template.key.charAt(0).toUpperCase() + template.key.slice(1)}Name`)}
              </button>
            ))}
          </div>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="admin-digibridge-send-email-to-applicant-modal-form">
          {/* SUBJECT */}
          <div className="admin-digibridge-send-email-to-applicant-modal-field">
            <label className="admin-digibridge-send-email-to-applicant-modal-label">
              {t('AdminDigiBridgeSendEmailToApplicantModal.subjectLabel')} <span className="required">*</span>
            </label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              placeholder={t('AdminDigiBridgeSendEmailToApplicantModal.subjectPlaceholder')}
              className="admin-digibridge-send-email-to-applicant-modal-input"
              disabled={isSending}
              required
            />
          </div>

          {/* MESSAGE */}
          <div className="admin-digibridge-send-email-to-applicant-modal-field">
            <label className="admin-digibridge-send-email-to-applicant-modal-label">
              {t('AdminDigiBridgeSendEmailToApplicantModal.messageLabel')} <span className="required">*</span>
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder={t('AdminDigiBridgeSendEmailToApplicantModal.messagePlaceholder')}
              className="admin-digibridge-send-email-to-applicant-modal-textarea"
              rows="10"
              disabled={isSending}
              required
            />
          </div>

          {/* ACTIONS */}
          <div className="admin-digibridge-send-email-to-applicant-modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="admin-digibridge-send-email-to-applicant-modal-btn admin-digibridge-send-email-to-applicant-modal-btn-cancel"
              disabled={isSending}
            >
              {t('AdminDigiBridgeSendEmailToApplicantModal.cancelButton')}
            </button>

            <button
              type="submit"
              className="admin-digibridge-send-email-to-applicant-modal-btn admin-digibridge-send-email-to-applicant-modal-btn-send"
              disabled={isSending}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
              {isSending 
                ? t('AdminDigiBridgeSendEmailToApplicantModal.sendingButton') 
                : t('AdminDigiBridgeSendEmailToApplicantModal.sendButton')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};