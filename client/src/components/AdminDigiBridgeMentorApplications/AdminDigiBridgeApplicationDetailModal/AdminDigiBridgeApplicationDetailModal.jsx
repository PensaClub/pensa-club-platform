// src/components/AdminDigiBridgeMentorApplications/AdminDigiBridgeApplicationDetailModal/AdminDigiBridgeApplicationDetailModal.jsx

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './adminDigiBridgeApplicationDetailModal.css';

export const AdminDigiBridgeApplicationDetailModal = ({
    application,
    onClose,
    onApprove,
    onReject,
    onSendEmail
}) => {
    const { t } = useTranslation();
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('bg-BG', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getLanguageName = (code) => {
        const languages = {
            'bg': t('AdminDigiBridgeApplicationDetailModal.langBulgarian'),
            'en': t('AdminDigiBridgeApplicationDetailModal.langEnglish'),
            'de': t('AdminDigiBridgeApplicationDetailModal.langGerman'),
            'fr': t('AdminDigiBridgeApplicationDetailModal.langFrench'),
            'es': t('AdminDigiBridgeApplicationDetailModal.langSpanish'),
            'it': t('AdminDigiBridgeApplicationDetailModal.langItalian')
        };
        return languages[code] || code;
    };
    const getCountryName = (code) => {
        const countries = {
            'BG': '🇧🇬 България',
            'DE': '🇩🇪 Германия',
            'AT': '🇦🇹 Австрия',
            'GR': '🇬🇷 Гърция',
            'RO': '🇷🇴 Румъния',
            'RS': '🇷🇸 Сърбия',
            'MK': '🇲🇰 Северна Македония',
            'TR': '🇹🇷 Турция',
            'OTHER': '🌍 Друга'
        };
        return countries[code] || code;
    };
    const handleApprove = async () => {
        if (window.confirm(t('AdminDigiBridgeApplicationDetailModal.confirmApprove'))) {
            setIsSubmitting(true);
            try {
                await onApprove(application.id);
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            alert(t('AdminDigiBridgeApplicationDetailModal.rejectionReasonRequired'));
            return;
        }

        if (window.confirm(t('AdminDigiBridgeApplicationDetailModal.confirmReject'))) {
            setIsSubmitting(true);
            try {
                await onReject(application.id, rejectionReason);
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="admin-digibridge-application-detail-modal-overlay" onClick={handleBackdropClick}>
            <div className="admin-digibridge-application-detail-modal">
                {/* CLOSE BUTTON */}
                <button
                    className="admin-digibridge-application-detail-modal-close"
                    onClick={onClose}
                    aria-label="Close"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>

                {/* HEADER */}
                <div className="admin-digibridge-application-detail-modal-header">
                    <img
                        src={application.photoUrl}
                        alt={application.name}
                        className="admin-digibridge-application-detail-modal-photo"
                        onError={(e) => {
                            e.target.src = "/images/homePage/user-it.png";
                        }}
                    />
                    <div className="admin-digibridge-application-detail-modal-header-info">
                        <h2>{application.name}</h2>
                        <div className="admin-digibridge-application-detail-modal-specialization">
                            <span className="admin-digibridge-application-detail-modal-spec-icon">🎓</span>
                            {application.specialization}
                        </div>
                        <div className="admin-digibridge-application-detail-modal-date">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                <line x1="16" y1="2" x2="16" y2="6" />
                                <line x1="8" y1="2" x2="8" y2="6" />
                                <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                            {t('AdminDigiBridgeApplicationDetailModal.appliedOn')}: {formatDate(application.createdAt)}
                        </div>
                    </div>
                </div>

                {/* CONTENT */}
                <div className="admin-digibridge-application-detail-modal-content">

                    {/* CONTACT INFO */}
                    <div className="admin-digibridge-application-detail-modal-section">
                        <h3 className="admin-digibridge-application-detail-modal-section-title">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                            {t('AdminDigiBridgeApplicationDetailModal.contactInfo')}
                        </h3>
                        <div className="admin-digibridge-application-detail-modal-grid">
                            <div className="admin-digibridge-application-detail-modal-field">
                                <label>{t('AdminDigiBridgeApplicationDetailModal.email')}:</label>
                                <span>{application.email}</span>
                            </div>
                            <div className="admin-digibridge-application-detail-modal-field">
                                <label>{t('AdminDigiBridgeApplicationDetailModal.phone')}:</label>
                                <span>{application.phone}</span>
                            </div>
                            <div className="admin-digibridge-application-detail-modal-field">
                                <label>{t('AdminDigiBridgeApplicationDetailModal.age')}:</label>
                                <span>{application.age} {t('AdminDigiBridgeApplicationDetailModal.years')}</span>
                            </div>
                            <div className="admin-digibridge-application-detail-modal-field">
                                <label>{t('AdminDigiBridgeApplicationDetailModal.country')}:</label>
                                <span>{getCountryName(application.country)}</span>
                            </div>
                            <div className="admin-digibridge-application-detail-modal-field">
                                <label>{t('AdminDigiBridgeApplicationDetailModal.languages')}:</label>
                                <span>{application.languages.map(getLanguageName).join(', ')}</span>
                            </div>
                        </div>
                    </div>
                    <div className="admin-digibridge-application-detail-modal-field">
                        <label>{t('AdminDigiBridgeApplicationDetailModal.priorityContact')}:</label>
                        <span>
                            {application.priorityContact === 'email' && `📧 ${t('AdminDigiBridgeApplicationDetailModal.email')}`}
                            {application.priorityContact === 'phone' && `📱 ${t('AdminDigiBridgeApplicationDetailModal.phone')}`}
                            {application.priorityContact === 'viber' && '📞 Viber'}
                            {application.priorityContact === 'facebook' && '💬 Facebook'}
                            {application.priorityContact === 'linkedin' && '💼 LinkedIn'}
                        </span>
                    </div>
                    {/* EDUCATION */}
                    <div className="admin-digibridge-application-detail-modal-section">
                        <h3 className="admin-digibridge-application-detail-modal-section-title">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                                <path d="M6 12v5c3 3 9 3 12 0v-5" />
                            </svg>
                            {t('AdminDigiBridgeApplicationDetailModal.education')}
                        </h3>
                        <p className="admin-digibridge-application-detail-modal-text">{application.education}</p>
                    </div>

                    {/* EXPERIENCE */}
                    <div className="admin-digibridge-application-detail-modal-section">
                        <h3 className="admin-digibridge-application-detail-modal-section-title">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                            </svg>
                            {t('AdminDigiBridgeApplicationDetailModal.experience')}
                        </h3>
                        <p className="admin-digibridge-application-detail-modal-text">{application.experience}</p>
                    </div>

                    {/* MOTIVATION */}
                    <div className="admin-digibridge-application-detail-modal-section">
                        <h3 className="admin-digibridge-application-detail-modal-section-title">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
                            {t('AdminDigiBridgeApplicationDetailModal.motivation')}
                        </h3>
                        <p className="admin-digibridge-application-detail-modal-text">{application.motivation}</p>
                    </div>

                    {/* AVAILABILITY */}
                    <div className="admin-digibridge-application-detail-modal-section">
                        <h3 className="admin-digibridge-application-detail-modal-section-title">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                            </svg>
                            {t('AdminDigiBridgeApplicationDetailModal.availability')}
                        </h3>
                        <p className="admin-digibridge-application-detail-modal-text">{application.availability}</p>
                    </div>

                    {/* SOCIAL MEDIA */}
                    <div className="admin-digibridge-application-detail-modal-section">
                        <h3 className="admin-digibridge-application-detail-modal-section-title">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                            </svg>
                            {t('AdminDigiBridgeApplicationDetailModal.socialMedia')}
                        </h3>
                        <div className="admin-digibridge-application-detail-modal-social">
                            {application.viber && (
                                <div className="admin-digibridge-application-detail-modal-social-item">
                                    <strong>Viber:</strong> {application.viber}
                                </div>
                            )}
                            {application.facebook && (
                                <div className="admin-digibridge-application-detail-modal-social-item">
                                    <strong>Facebook:</strong> {application.facebook}
                                </div>
                            )}
                            {application.linkedin && (
                                <div className="admin-digibridge-application-detail-modal-social-item">
                                    <strong>LinkedIn:</strong> {application.linkedin}
                                </div>
                            )}
                            {application.otherContact && (
                                <div className="admin-digibridge-application-detail-modal-social-item">
                                    <strong>{t('AdminDigiBridgeApplicationDetailModal.other')}:</strong> {application.otherContact}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* CV */}
                    {application.cvUrl && (
                        <div className="admin-digibridge-application-detail-modal-section">
                            <h3 className="admin-digibridge-application-detail-modal-section-title">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                    <line x1="16" y1="13" x2="8" y2="13" />
                                    <line x1="16" y1="17" x2="8" y2="17" />
                                    <polyline points="10 9 9 9 8 9" />
                                </svg>
                                {t('AdminDigiBridgeApplicationDetailModal.cv')}
                            </h3>
                            <a
                                href={application.cvUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="admin-digibridge-application-detail-modal-cv-link"
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="7 10 12 15 17 10" />
                                    <line x1="12" y1="15" x2="12" y2="3" />
                                </svg>
                                {application.cvOriginalName || t('AdminDigiBridgeApplicationDetailModal.downloadCV')}
                            </a>
                        </div>
                    )}

                    {/* REJECT FORM */}
                    {showRejectForm && (
                        <div className="admin-digibridge-application-detail-modal-section admin-digibridge-application-detail-modal-reject-section">
                            <h3 className="admin-digibridge-application-detail-modal-section-title">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                    <line x1="12" y1="9" x2="12" y2="13" />
                                    <line x1="12" y1="17" x2="12.01" y2="17" />
                                </svg>
                                {t('AdminDigiBridgeApplicationDetailModal.rejectionReason')}
                            </h3>
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder={t('AdminDigiBridgeApplicationDetailModal.rejectionReasonPlaceholder')}
                                className="admin-digibridge-application-detail-modal-textarea"
                                rows="4"
                            />
                        </div>
                    )}
                </div>

                {/* ACTIONS */}
                <div className="admin-digibridge-application-detail-modal-actions">
                    <button
                        onClick={onSendEmail}
                        className="admin-digibridge-application-detail-modal-btn admin-digibridge-application-detail-modal-btn-email"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                            <polyline points="22,6 12,13 2,6" />
                        </svg>
                        {t('AdminDigiBridgeApplicationDetailModal.sendEmail')}
                    </button>

                    {!showRejectForm ? (
                        <>
                            <button
                                onClick={handleApprove}
                                disabled={isSubmitting}
                                className="admin-digibridge-application-detail-modal-btn admin-digibridge-application-detail-modal-btn-approve"
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                                {isSubmitting ? t('AdminDigiBridgeApplicationDetailModal.approving') : t('AdminDigiBridgeApplicationDetailModal.approve')}
                            </button>

                            <button
                                onClick={() => setShowRejectForm(true)}
                                className="admin-digibridge-application-detail-modal-btn admin-digibridge-application-detail-modal-btn-reject"
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                                {t('AdminDigiBridgeApplicationDetailModal.reject')}
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => {
                                    setShowRejectForm(false);
                                    setRejectionReason('');
                                }}
                                className="admin-digibridge-application-detail-modal-btn admin-digibridge-application-detail-modal-btn-cancel"
                            >
                                {t('AdminDigiBridgeApplicationDetailModal.cancel')}
                            </button>

                            <button
                                onClick={handleReject}
                                disabled={isSubmitting || !rejectionReason.trim()}
                                className="admin-digibridge-application-detail-modal-btn admin-digibridge-application-detail-modal-btn-reject"
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                                {isSubmitting ? t('AdminDigiBridgeApplicationDetailModal.rejecting') : t('AdminDigiBridgeApplicationDetailModal.confirmRejectBtn')}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};