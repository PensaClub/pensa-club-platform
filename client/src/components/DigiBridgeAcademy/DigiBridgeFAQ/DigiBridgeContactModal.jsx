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

        if (!formData.name || !formData.email || !formData.subject || !formData.message) {
            toast.error(t('digiBridge.contact.fillAllFields', 'Моля, попълнете всички полета'));
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            toast.error(t('digiBridge.contact.invalidEmail', 'Невалиден имейл адрес'));
            return;
        }

        setLoading(true);

        try {
            const emailMessage = `
Име: ${formData.name}
Email: ${formData.email}

Съобщение:
${formData.message}

---
Изпратено от DigiBridge Contact Form
            `.trim();

            const success = await sendPersonalEmail({
                from: formData.email,
                to: 'info@pensa.club',
                subject: formData.subject,
                message: emailMessage
            });

            if (success) {
                toast.success(t('digiBridge.contact.successMessage', 'Съобщението е изпратено успешно!'));
                setFormData({ name: '', email: '', subject: '', message: '' });
                setTimeout(() => { onClose(); }, 2000);
            } else {
                toast.error(t('digiBridge.contact.errorMessage', 'Грешка при изпращане'));
            }
        } catch (error) {
            console.error('Error sending email:', error);
            toast.error(t('digiBridge.contact.errorMessage', 'Грешка при изпращане'));
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
        <div className="dbcm-overlay" onClick={handleBackdropClick}>
            <div className="dbcm-modal">
                {/* Header */}
                <div className="dbcm-header">
                    <div className="dbcm-header-content">
                        <div className="dbcm-header-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                <polyline points="22,6 12,13 2,6"/>
                            </svg>
                        </div>
                        <h2 className="dbcm-title">
                            {t('digiBridge.contact.modalTitle', 'Свържете се с нас')}
                        </h2>
                    </div>
                    <button className="dbcm-close" onClick={onClose} aria-label="Close">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>

                <p className="dbcm-description">
                    {t('digiBridge.contact.modalDescription', 'Попълнете формата и ще ви отговорим възможно най-скоро')}
                </p>

                {/* Form */}
                <form className="dbcm-form" onSubmit={handleSubmit}>
                    <div className="dbcm-row">
                        <div className="dbcm-field">
                            <label className="dbcm-label">
                                {t('digiBridge.contact.nameLabel', 'Име')}
                                <span className="dbcm-required">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder={t('digiBridge.contact.namePlaceholder', 'Вашето име')}
                                className="dbcm-input"
                                disabled={loading}
                            />
                        </div>

                        <div className="dbcm-field">
                            <label className="dbcm-label">
                                {t('digiBridge.contact.emailLabel', 'Имейл')}
                                <span className="dbcm-required">*</span>
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder={t('digiBridge.contact.emailPlaceholder', 'email@example.com')}
                                className="dbcm-input"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="dbcm-field">
                        <label className="dbcm-label">
                            {t('digiBridge.contact.subjectLabel', 'Тема')}
                            <span className="dbcm-required">*</span>
                        </label>
                        <input
                            type="text"
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            placeholder={t('digiBridge.contact.subjectPlaceholder', 'Относно...')}
                            className="dbcm-input"
                            disabled={loading}
                        />
                    </div>

                    <div className="dbcm-field">
                        <label className="dbcm-label">
                            {t('digiBridge.contact.messageLabel', 'Съобщение')}
                            <span className="dbcm-required">*</span>
                        </label>
                        <textarea
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            placeholder={t('digiBridge.contact.messagePlaceholder', 'Вашето съобщение...')}
                            className="dbcm-textarea"
                            rows="5"
                            disabled={loading}
                        />
                    </div>

                    {/* Actions */}
                    <div className="dbcm-actions">
                        <button
                            type="button"
                            className="dbcm-btn dbcm-btn--cancel"
                            onClick={onClose}
                            disabled={loading}
                        >
                            {t('digiBridge.contact.cancelButton', 'Отказ')}
                        </button>
                        <button
                            type="submit"
                            className="dbcm-btn dbcm-btn--submit"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <div className="dbcm-spinner"></div>
                                    {t('digiBridge.contact.sendingButton', 'Изпращане...')}
                                </>
                            ) : (
                                <>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <line x1="22" y1="2" x2="11" y2="13"/>
                                        <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                                    </svg>
                                    {t('digiBridge.contact.sendButton', 'Изпрати')}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};