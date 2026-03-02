import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Send, Mail, Loader } from 'lucide-react';
import { useAcademy } from '../../contexts/AcademyProvider';
import { useAuthContext } from '../../contexts/UserContext';
import './sendEmailModal.css';

const SendEmailModal = ({ isOpen, onClose, recipientEmail, recipientName }) => {
  const { t } = useTranslation('digibridge-students');
  const { sendPersonalEmail } = useAcademy();
  const { profileData } = useAuthContext();

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const senderEmail = profileData?.email || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!subject.trim() || !message.trim()) return;

    setIsLoading(true);
    try {
      const success = await sendPersonalEmail({
        from: senderEmail,
        to: recipientEmail,
        subject: subject.trim(),
        message: message.trim()
      });

      if (success) {
        setSubject('');
        setMessage('');
        onClose();
      }
    } catch (error) {
      console.error('Error sending email:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="sem-overlay" onClick={handleBackdropClick}>
      <div className="sem-modal">
        <div className="sem-header">
          <div className="sem-header-title">
            <Mail className="sem-header-icon" />
            <h3>{t('sendEmailModal.title')}</h3>
          </div>
          <button className="sem-close-btn" onClick={onClose} disabled={isLoading}>
            <X />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="sem-form">
          <div className="sem-recipient">
            <span className="sem-recipient-label">{t('sendEmailModal.to')}:</span>
            <span className="sem-recipient-value">{recipientName} ({recipientEmail})</span>
          </div>

          <div className="sem-field">
            <label htmlFor="sem-subject">{t('sendEmailModal.subject')}</label>
            <input
              id="sem-subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={t('sendEmailModal.subjectPlaceholder')}
              disabled={isLoading}
              required
            />
          </div>

          <div className="sem-field">
            <label htmlFor="sem-message">{t('sendEmailModal.message')}</label>
            <textarea
              id="sem-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t('sendEmailModal.messagePlaceholder')}
              rows={6}
              disabled={isLoading}
              required
            />
          </div>

          <div className="sem-actions">
            <button 
              type="button" 
              className="sem-cancel-btn" 
              onClick={onClose}
              disabled={isLoading}
            >
              {t('sendEmailModal.cancel')}
            </button>
            <button 
              type="submit" 
              className="sem-submit-btn"
              disabled={isLoading || !subject.trim() || !message.trim()}
            >
              {isLoading ? (
                <>
                  <Loader className="sem-spinner" />
                  {t('sendEmailModal.sending')}
                </>
              ) : (
                <>
                  <Send />
                  {t('sendEmailModal.send')}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SendEmailModal;