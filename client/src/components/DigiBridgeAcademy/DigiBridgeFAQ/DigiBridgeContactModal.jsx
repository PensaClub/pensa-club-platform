import React, { useState } from 'react';

import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import './digiBridgeContactModal.css';
import { useClubContext } from '../../contexts/ClubContext';
export const DigiBridgeContactModal = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { sendPersonalEmail } = useClubContext();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
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
  if (!formData.name || !formData.email || !formData.subject || !formData.message) {
    toast.error(t('digiBridge.contact.fillAllFields'));
    return;
  }

  // Email валидация
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.email)) {
    toast.error(t('digiBridge.contact.invalidEmail'));
    return;
  }

  setLoading(true);

  try {
    // Форматиране на съобщението
    const emailMessage = `
Име: ${formData.name}
Email: ${formData.email}

Съобщение:
${formData.message}

---
Изпратено от DigiBridge Contact Form
    `.trim();

    // ПРАВИЛНИЯТ ФОРМАТ - подаваме ОБЕКТ, не отделни параметри!
    const success = await sendPersonalEmail({
      from: formData.email,
      to: 'info@pensa.club',
      subject: formData.subject,
      message: emailMessage
    });

    if (success) {
      toast.success(t('digiBridge.contact.successMessage'));
      
      // Изчистване на формата
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });

      // Затваряне на модала след 2 секунди
      setTimeout(() => {
        onClose();
      }, 2000);
    } else {
      toast.error(t('digiBridge.contact.errorMessage'));
    }

  } catch (error) {
    console.error('Error sending email:', error);
    toast.error(t('digiBridge.contact.errorMessage'));
  } finally {
    setLoading(false);
  }
};

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="digibridge-contact-modal-overlay" onClick={handleBackdropClick}>
      <div className="digibridge-contact-modal">
        
        {/* Header */}
        <div className="digibridge-contact-modal-header">
          <h2 className="digibridge-contact-modal-title">
            {t('digiBridge.contact.modalTitle')}
          </h2>
          <button 
            className="digibridge-contact-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <p className="digibridge-contact-modal-description">
          {t('digiBridge.contact.modalDescription')}
        </p>

        {/* Form */}
        <form className="digibridge-contact-modal-form" onSubmit={handleSubmit}>
          
          <div className="digibridge-contact-modal-row">
            <div className="digibridge-contact-modal-field">
              <label className="digibridge-contact-modal-label">
                {t('digiBridge.contact.nameLabel')} <span className="required">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={t('digiBridge.contact.namePlaceholder')}
                className="digibridge-contact-modal-input"
                disabled={loading}
              />
            </div>

            <div className="digibridge-contact-modal-field">
              <label className="digibridge-contact-modal-label">
                {t('digiBridge.contact.emailLabel')} <span className="required">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={t('digiBridge.contact.emailPlaceholder')}
                className="digibridge-contact-modal-input"
                disabled={loading}
              />
            </div>
          </div>

          <div className="digibridge-contact-modal-field">
            <label className="digibridge-contact-modal-label">
              {t('digiBridge.contact.subjectLabel')} <span className="required">*</span>
            </label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder={t('digiBridge.contact.subjectPlaceholder')}
              className="digibridge-contact-modal-input"
              disabled={loading}
            />
          </div>

          <div className="digibridge-contact-modal-field">
            <label className="digibridge-contact-modal-label">
              {t('digiBridge.contact.messageLabel')} <span className="required">*</span>
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder={t('digiBridge.contact.messagePlaceholder')}
              className="digibridge-contact-modal-textarea"
              rows="6"
              disabled={loading}
            />
          </div>

          {/* Buttons */}
          <div className="digibridge-contact-modal-actions">
            <button
              type="button"
              className="digibridge-contact-modal-button digibridge-contact-modal-button-cancel"
              onClick={onClose}
              disabled={loading}
            >
              {t('digiBridge.contact.cancelButton')}
            </button>
            <button
              type="submit"
              className="digibridge-contact-modal-button digibridge-contact-modal-button-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="digibridge-contact-modal-spinner"></div>
                  {t('digiBridge.contact.sendingButton')}
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="22" y1="2" x2="11" y2="13"/>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                  {t('digiBridge.contact.sendButton')}
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};