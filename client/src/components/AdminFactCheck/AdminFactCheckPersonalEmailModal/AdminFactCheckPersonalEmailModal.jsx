import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useClubContext } from '../../contexts/ClubContext';
import './adminFactCheckPersonalEmailModal.css';

export const AdminFactCheckPersonalEmailModal = ({ signal, onClose }) => {
    const { t } = useTranslation('factcheck');
    const { sendPersonalEmail } = useClubContext();

    const [subject, setSubject] = useState(t('admin.personalEmailModal.subjectDefault'));
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [result, setResult] = useState(null); // 'success' | 'error'

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    const handleSend = async () => {
        if (!message.trim() || !subject.trim()) return;

        setIsSending(true);
        setResult(null);

        try {
            const success = await sendPersonalEmail({
                from: 'pensa.club@gmail.com',
                to: signal.reporterEmail,
                subject,
                message,
            });

            setResult(success ? 'success' : 'error');
            if (success) {
                setTimeout(() => onClose(), 2000);
            }
        } catch {
            setResult('error');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="afcpem-overlay" onClick={handleBackdropClick}>
            <div className="afcpem-modal">
                {/* CLOSE */}
                <button className="afcpem-close" onClick={onClose} aria-label="Close">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>

                {/* HEADER */}
                <div className="afcpem-header">
                    <h2 className="afcpem-title">{t('admin.personalEmailModal.title')}</h2>
                </div>

                {/* CONTENT */}
                <div className="afcpem-content">
                    {/* TO */}
                    <div className="afcpem-field">
                        <label className="afcpem-label">{t('admin.personalEmailModal.to')}</label>
                        <input
                            type="text"
                            className="afcpem-input afcpem-input--readonly"
                            value={signal.reporterEmail}
                            readOnly
                        />
                    </div>

                    {/* SUBJECT */}
                    <div className="afcpem-field">
                        <label className="afcpem-label">{t('admin.personalEmailModal.subject')}</label>
                        <input
                            type="text"
                            className="afcpem-input"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                        />
                    </div>

                    {/* MESSAGE */}
                    <div className="afcpem-field">
                        <label className="afcpem-label">{t('admin.personalEmailModal.message')}</label>
                        <textarea
                            className="afcpem-textarea"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder={t('admin.personalEmailModal.messagePlaceholder')}
                            rows="6"
                        />
                    </div>

                    {/* RESULT MESSAGE */}
                    {result === 'success' && (
                        <div className="afcpem-result afcpem-result--success">
                            {t('admin.personalEmailModal.success')}
                        </div>
                    )}
                    {result === 'error' && (
                        <div className="afcpem-result afcpem-result--error">
                            {t('admin.personalEmailModal.error')}
                        </div>
                    )}
                </div>

                {/* ACTIONS */}
                <div className="afcpem-actions">
                    <button className="afcpem-btn afcpem-btn--cancel" onClick={onClose}>
                        {t('admin.moduleModal.cancel')}
                    </button>
                    <button
                        className="afcpem-btn afcpem-btn--send"
                        onClick={handleSend}
                        disabled={isSending || !message.trim() || !subject.trim()}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="22" y1="2" x2="11" y2="13" />
                            <polygon points="22 2 15 22 11 13 2 9 22 2" />
                        </svg>
                        {isSending ? t('admin.personalEmailModal.sending') : t('admin.personalEmailModal.send')}
                    </button>
                </div>
            </div>
        </div>
    );
};
