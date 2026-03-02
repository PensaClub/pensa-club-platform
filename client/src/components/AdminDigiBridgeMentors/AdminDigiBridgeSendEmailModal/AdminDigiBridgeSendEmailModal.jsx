// src/components/AdminDigiBridgeMentors/AdminDigiBridgeSendEmailModal/AdminDigiBridgeSendEmailModal.jsx

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import './adminDigiBridgeSendEmailModal.css';
import { useAcademy } from '../../contexts/AcademyProvider';

export const AdminDigiBridgeSendEmailModal = ({ mentor, onClose }) => {
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
Здравейте ${mentor.name},

${formData.message}

---
Изпратено от DigiBridge Academy
      `.trim();

      // ПРАВИЛНИЯТ ФОРМАТ - подаваме ОБЕКТ
      const success = await sendPersonalEmail({
        from: 'info@pensa.club',
        to: mentor.email,
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
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="admin-digibridge-send-email-modal-overlay" onClick={handleBackdropClick}>
      <div className="admin-digibridge-send-email-modal">
        
        {/* HEADER */}
        <div className="admin-digibridge-send-email-modal-header">
          <div>
            <h2 className="admin-digibridge-send-email-modal-title">
              {t('AdminDigiBridgeMentors.SendEmailModal.title')}
            </h2>
            <p className="admin-digibridge-send-email-modal-subtitle">
              {t('AdminDigiBridgeMentors.SendEmailModal.sendingTo')}: <strong>{mentor.name}</strong> ({mentor.email})
            </p>
          </div>
          <button 
            className="admin-digibridge-send-email-modal-close"
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
        <form className="admin-digibridge-send-email-modal-form" onSubmit={handleSubmit}>
          
          {/* SUBJECT */}
          <div className="admin-digibridge-send-email-modal-field">
            <label className="admin-digibridge-send-email-modal-label">
              {t('AdminDigiBridgeMentors.SendEmailModal.subjectLabel')} <span className="required">*</span>
            </label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder={t('AdminDigiBridgeMentors.SendEmailModal.subjectPlaceholder')}
              className="admin-digibridge-send-email-modal-input"
              disabled={loading}
            />
          </div>

          {/* MESSAGE */}
          <div className="admin-digibridge-send-email-modal-field">
            <label className="admin-digibridge-send-email-modal-label">
              {t('AdminDigiBridgeMentors.SendEmailModal.messageLabel')} <span className="required">*</span>
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder={t('AdminDigiBridgeMentors.SendEmailModal.messagePlaceholder')}
              className="admin-digibridge-send-email-modal-textarea"
              rows="8"
              disabled={loading}
            />
          </div>

          {/* BUTTONS */}
          <div className="admin-digibridge-send-email-modal-actions">
            <button
              type="button"
              className="admin-digibridge-send-email-modal-button admin-digibridge-send-email-modal-button-cancel"
              onClick={onClose}
              disabled={loading}
            >
              {t('AdminDigiBridgeMentors.SendEmailModal.cancelButton')}
            </button>
            <button
              type="submit"
              className="admin-digibridge-send-email-modal-button admin-digibridge-send-email-modal-button-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="admin-digibridge-send-email-modal-spinner"></div>
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