// src/components/AdminReAction/AdminReActionEmailModal/AdminReActionEmailModal.jsx

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './adminReActionEmailModal.css';
import { useReAction } from '../../contexts/ReActionProvider';

export const AdminReActionEmailModal = ({ request, onClose }) => {
    const { t } = useTranslation('reaction');
    const { sendEmail } = useReAction();

    const [subject, setSubject] = useState(t('admin.emailModal.subjectDefault'));
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
            const response = await sendEmail({
                to: request.contactEmail,
                subject,
                message,
                requestId: request.id,
            });

            setResult(response?.success ? 'success' : 'error');
            if (response?.success) {
                setTimeout(() => onClose(), 2000);
            }
        } catch {
            setResult('error');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="araem-overlay" onClick={handleBackdropClick}>
            <div className="araem-modal">
                {/* CLOSE */}
                <button className="araem-close" onClick={onClose} aria-label="Close">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>

                {/* HEADER */}
                <div className="araem-header">
                    <h2 className="araem-title">{t('admin.emailModal.title')}</h2>
                </div>

                {/* CONTENT */}
                <div className="araem-content">
                    {/* TO */}
                    <div className="araem-field">
                        <label className="araem-label">{t('admin.emailModal.to')}</label>
                        <input
                            type="text"
                            className="araem-input araem-input--readonly"
                            value={request.contactEmail}
                            readOnly
                        />
                    </div>

                    {/* SUBJECT */}
                    <div className="araem-field">
                        <label className="araem-label">{t('admin.emailModal.subject')}</label>
                        <input
                            type="text"
                            className="araem-input"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                        />
                    </div>

                    {/* MESSAGE */}
                    <div className="araem-field">
                        <label className="araem-label">{t('admin.emailModal.message')}</label>
                        <textarea
                            className="araem-textarea"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder={t('admin.emailModal.messagePlaceholder')}
                            rows="6"
                        />
                    </div>

                    {/* RESULT MESSAGE */}
                    {result === 'success' && (
                        <div className="araem-result araem-result--success">
                            {t('admin.emailModal.success')}
                        </div>
                    )}
                    {result === 'error' && (
                        <div className="araem-result araem-result--error">
                            {t('admin.emailModal.error')}
                        </div>
                    )}
                </div>

                {/* ACTIONS */}
                <div className="araem-actions">
                    <button className="araem-btn araem-btn--cancel" onClick={onClose}>
                        {t('admin.emailModal.cancel')}
                    </button>
                    <button
                        className="araem-btn araem-btn--send"
                        onClick={handleSend}
                        disabled={isSending || !message.trim() || !subject.trim()}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="22" y1="2" x2="11" y2="13" />
                            <polygon points="22 2 15 22 11 13 2 9 22 2" />
                        </svg>
                        {isSending ? t('admin.emailModal.sending') : t('admin.emailModal.send')}
                    </button>
                </div>
            </div>
        </div>
    );
};
