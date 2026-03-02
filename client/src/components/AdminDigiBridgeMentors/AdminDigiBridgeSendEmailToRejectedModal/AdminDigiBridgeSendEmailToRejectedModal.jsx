// src/components/AdminDigiBridgeMentors/AdminDigiBridgeSendEmailToRejectedModal/AdminDigiBridgeSendEmailToRejectedModal.jsx

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import './adminDigiBridgeSendEmailToRejectedModal.css';
import { useAcademy } from '../../contexts/AcademyProvider';

export const AdminDigiBridgeSendEmailToRejectedModal = ({ application, onClose }) => {
  const { t } = useTranslation('digibridge');
  const { sendPersonalEmail } = useAcademy();
  
  const [formData, setFormData] = useState({
    subject: '',
    message: ''
  });
  
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Валидация
    if (!formData.subject || !formData.message) {
      toast.error(t('AdminDigiBridgeMentors.SendEmailModal.fillAllFields'));
      return;
    }

    setLoading(true);

    try {
      // Форматиране на съобщението
      const emailMessage = `
Здравейте ${application.name},

${formData.message}

---
Изпратено от DigiBridge Academy Admin Panel
      `.trim();

      // ПРАВИЛНИЯТ ФОРМАТ - подаваме ОБЕКТ
      const success = await sendPersonalEmail({
        from: 'info@pensa.club',
        to: application.email,
        subject: formData.subject,
        message: emailMessage
      });

      if (success) {
        toast.success(t('AdminDigiBridgeMentors.SendEmailModal.successMessage'));
        
        // Изчистване на формата
        setFormData({
          subject: '',
          message: ''
        });

        // Затваряне на модала след 2 секунди
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        toast.error(t('AdminDigiBridgeMentors.SendEmailModal.errorMessage'));
      }

    } catch (error) {
      console.error('Error sending email:', error);
      toast.error(t('AdminDigiBridgeMentors.SendEmailModal.errorMessage'));
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  };

  return (
    <div className="admin-digibridge-send-email-rejected-modal-overlay" onClick={handleBackdropClick}>
      <div className="admin-digibridge-send-email-rejected-modal">
        
        {/* HEADER */}
        <div className="admin-digibridge-send-email-rejected-modal-header">
          <div>
            <h2 className="admin-digibridge-send-email-rejected-modal-title">
              {t('AdminDigiBridgeMentors.SendEmailModal.title')}
            </h2>
            <p className="admin-digibridge-send-email-rejected-modal-subtitle">
              {t('AdminDigiBridgeMentors.SendEmailModal.sendingTo')}: <strong>{application.name}</strong> ({application.email})
            </p>
          </div>
          <button 
            className="admin-digibridge-send-email-rejected-modal-close"
            onClick={onClose}
            aria-label="Close"
            disabled={loading}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* FORM */}
        <form className="admin-digibridge-send-email-rejected-modal-form" onSubmit={handleSubmit}>
          
          {/* SUBJECT */}
          <div className="admin-digibridge-send-email-rejected-modal-field">
            <label className="admin-digibridge-send-email-rejected-modal-label">
              {t('AdminDigiBridgeMentors.SendEmailModal.subjectLabel')} <span className="required">*</span>
            </label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder={t('AdminDigiBridgeMentors.SendEmailModal.subjectPlaceholder')}
              className="admin-digibridge-send-email-rejected-modal-input"
              disabled={loading}
            />
          </div>

          {/* MESSAGE */}
          <div className="admin-digibridge-send-email-rejected-modal-field">
            <label className="admin-digibridge-send-email-rejected-modal-label">
              {t('AdminDigiBridgeMentors.SendEmailModal.messageLabel')} <span className="required">*</span>
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder={t('AdminDigiBridgeMentors.SendEmailModal.messagePlaceholder')}
              className="admin-digibridge-send-email-rejected-modal-textarea"
              rows="8"
              disabled={loading}
            />
          </div>

          {/* BUTTONS */}
          <div className="admin-digibridge-send-email-rejected-modal-actions">
            <button
              type="button"
              className="admin-digibridge-send-email-rejected-modal-button admin-digibridge-send-email-rejected-modal-button-cancel"
              onClick={onClose}
              disabled={loading}
            >
              {t('AdminDigiBridgeMentors.SendEmailModal.cancelButton')}
            </button>
            <button
              type="submit"
              className="admin-digibridge-send-email-rejected-modal-button admin-digibridge-send-email-rejected-modal-button-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="admin-digibridge-send-email-rejected-modal-spinner"></div>
                  {t('AdminDigiBridgeMentors.SendEmailModal.sendingButton')}
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="22" y1="2" x2="11" y2="13"/>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                  {t('AdminDigiBridgeMentors.SendEmailModal.sendButton')}
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};