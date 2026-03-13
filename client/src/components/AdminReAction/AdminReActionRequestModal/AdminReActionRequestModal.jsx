// src/components/AdminReAction/AdminReActionRequestModal/AdminReActionRequestModal.jsx

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Info } from 'lucide-react';
import './adminReActionRequestModal.css';
import { useReAction } from '../../contexts/ReActionProvider';

export const AdminReActionRequestModal = ({ request, onClose, onSave, onSendEmail, onRefresh }) => {
    const { t } = useTranslation('reaction');
    const { getMentorsForDate, deleteRequest } = useReAction();

    const [status, setStatus] = useState(request.status || 'new');
    const [adminNotes, setAdminNotes] = useState(request.adminNotes || '');
    const [cancelReason, setCancelReason] = useState(request.cancelReason || '');
    const [isSaving, setIsSaving] = useState(false);
    const [showTechInfo, setShowTechInfo] = useState(false);

    // Mentor assignment
    const [showMentorPicker, setShowMentorPicker] = useState(false);
    const [availableMentors, setAvailableMentors] = useState([]);
    const [mentorsLoading, setMentorsLoading] = useState(false);
    const [assignedMentor, setAssignedMentor] = useState(
        request.assignedMentor
            ? { id: request.assignedMentor.id, name: request.assignedMentor.name, email: request.assignedMentor.email, phone: request.assignedMentor.phone, country: request.assignedMentor.country }
            : null
    );

    // ===================================
    // FORMAT DATE
    // ===================================

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('bg-BG', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatDateShort = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('bg-BG', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    // ===================================
    // STATUS COLOR
    // ===================================

    const getStatusColor = (s) => {
        switch (s) {
            case 'new': return '#d97706';
            case 'reviewing': return '#3b82f6';
            case 'mentor_assigned': return '#7c3aed';
            case 'confirmed': return '#16a34a';
            case 'completed': return '#6b7280';
            case 'cancelled': return '#dc2626';
            default: return '#6b7280';
        }
    };

    // ===================================
    // HANDLERS
    // ===================================

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const data = {
                status,
                adminNotes,
            };
            if (status === 'cancelled') {
                data.cancelReason = cancelReason;
            }
            if (assignedMentor) {
                data.assignedMentorId = assignedMentor.id;
            }
            await onSave(request.id, data);
        } catch (error) {
            console.error('Error saving request:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm(t('admin.requestModal.confirmDelete'))) {
            try {
                await deleteRequest(request.id);
                onClose();
                onRefresh();
            } catch (error) {
                console.error('Error deleting request:', error);
            }
        }
    };

    // ===================================
    // MENTOR PICKER
    // ===================================

    const handleLoadMentors = async () => {
        setShowMentorPicker(true);
        setMentorsLoading(true);
        try {
            const res = await getMentorsForDate(request.preferredDate);
            setAvailableMentors(res?.mentors || []);
        } catch (error) {
            console.error('Error loading mentors:', error);
        } finally {
            setMentorsLoading(false);
        }
    };

    const handleAssignMentor = (mentor) => {
        setAssignedMentor(mentor);
        setShowMentorPicker(false);
        if (status === 'new' || status === 'reviewing') {
            setStatus('mentor_assigned');
        }
    };

    // ===================================
    // RENDER
    // ===================================

    return (
        <div className="ararm-overlay" onClick={handleBackdropClick}>
            <div className="ararm-modal">
                {/* CLOSE BUTTON */}
                <button className="ararm-close" onClick={onClose} aria-label="Close">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>

                {/* HEADER */}
                <div className="ararm-header">
                    <div className="ararm-title-row">
                        <h2 className="ararm-title">
                            {t('admin.requestModal.title')} #{request.id}
                        </h2>
                        <button
                            className={`ararm-tech-toggle ${showTechInfo ? 'ararm-tech-toggle--active' : ''}`}
                            onClick={() => setShowTechInfo(!showTechInfo)}
                            title={t('admin.requestModal.technicalInfo')}
                        >
                            <Info size={18} />
                        </button>
                    </div>
                    <span className="ararm-date">{formatDate(request.createdAt)}</span>

                    {/* TECHNICAL INFO PANEL */}
                    {showTechInfo && (
                        <div className="ararm-tech-panel">
                            <div className="ararm-tech-row">
                                <span className="ararm-tech-label">{t('admin.requestModal.ipAddress')}:</span>
                                <span className="ararm-tech-value">{request.ipAddress || t('admin.requestModal.noData')}</span>
                            </div>
                            <div className="ararm-tech-row">
                                <span className="ararm-tech-label">{t('admin.requestModal.userAgent')}:</span>
                                <span className="ararm-tech-value ararm-tech-value--ua">{request.userAgent || t('admin.requestModal.noData')}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* REGISTERED USER BADGE */}
                {request.user && (
                    <div className="ararm-user-badge">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                        {t('admin.requestModal.registeredUser')}: {request.user.email}
                    </div>
                )}

                {/* CONTENT */}
                <div className="ararm-content">
                    {/* CLUB INFO */}
                    <div className="ararm-section">
                        <label className="ararm-label">{t('admin.requestModal.clubInfo')}</label>
                        <div className="ararm-claim-text">
                            <div className="ararm-info-row">
                                <strong>{t('admin.requestModal.clubName')}:</strong> {request.clubName}
                            </div>
                            <div className="ararm-info-row">
                                <strong>{t('admin.requestModal.city')}:</strong> {request.city || '-'}
                            </div>
                            <div className="ararm-info-row">
                                <strong>{t('admin.requestModal.participants')}:</strong> {request.participantsCount || '-'}
                            </div>
                            <div className="ararm-info-row">
                                <strong>{t('admin.requestModal.topic')}:</strong> {request.topic || '-'}
                            </div>
                            <div className="ararm-info-row">
                                <strong>{t('admin.requestModal.preferredDate')}:</strong> {formatDateShort(request.preferredDate)}
                            </div>
                        </div>
                    </div>

                    {/* CONTACT INFO */}
                    <div className="ararm-info-grid">
                        <div className="ararm-info-item">
                            <label className="ararm-label">{t('admin.requestModal.contactName')}</label>
                            <span className="ararm-info-value">{request.contactName || '-'}</span>
                        </div>
                        <div className="ararm-info-item">
                            <label className="ararm-label">{t('admin.requestModal.phone')}</label>
                            <span className="ararm-info-value">{request.contactPhone || '-'}</span>
                        </div>
                        <div className="ararm-info-item">
                            <label className="ararm-label">{t('admin.requestModal.email')}</label>
                            <span className="ararm-info-value">
                                {request.contactEmail ? (
                                    <a href={`mailto:${request.contactEmail}`} className="ararm-email-link">
                                        {request.contactEmail}
                                    </a>
                                ) : '-'}
                            </span>
                        </div>
                    </div>

                    {/* CLUB NOTES */}
                    {request.notes && (
                        <div className="ararm-section">
                            <label className="ararm-label">{t('admin.requestModal.clubNotes')}</label>
                            <div className="ararm-reporter-notes">{request.notes}</div>
                        </div>
                    )}

                    {/* REPORTED PROBLEM */}
                    {request.reportedProblem && (
                        <div className="ararm-problem">
                            <div className="ararm-problem-header">
                                <span className="ararm-problem-icon">🚨</span>
                                <label className="ararm-label">{t('admin.requestModal.reportedProblem')}</label>
                                {request.reportedProblemAt && (
                                    <span className="ararm-problem-date">
                                        {new Date(request.reportedProblemAt).toLocaleDateString('bg-BG', {
                                            day: '2-digit', month: '2-digit', year: 'numeric',
                                            hour: '2-digit', minute: '2-digit',
                                        })}
                                    </span>
                                )}
                            </div>
                            <div className="ararm-problem-text">{request.reportedProblem}</div>
                        </div>
                    )}

                    <div className="ararm-divider"></div>

                    {/* STATUS */}
                    <div className="ararm-field">
                        <label className="ararm-label">{t('admin.requestModal.status')}</label>
                        <div className="ararm-select-wrapper">
                            <select
                                className="ararm-select"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                style={{ borderColor: `${getStatusColor(status)}40` }}
                            >
                                <option value="new">{t('admin.statuses.new')}</option>
                                <option value="reviewing">{t('admin.statuses.reviewing')}</option>
                                <option value="mentor_assigned">{t('admin.statuses.mentor_assigned')}</option>
                                <option value="confirmed">{t('admin.statuses.confirmed')}</option>
                                <option value="completed">{t('admin.statuses.completed')}</option>
                                <option value="cancelled">{t('admin.statuses.cancelled')}</option>
                            </select>
                            <span
                                className="ararm-status-indicator"
                                style={{ backgroundColor: getStatusColor(status) }}
                            ></span>
                        </div>
                    </div>

                    {/* MENTOR ASSIGNMENT */}
                    <div className="ararm-field">
                        <label className="ararm-label">{t('admin.requestModal.mentor')}</label>
                        {assignedMentor ? (
                            <div className="ararm-mentor-assigned">
                                <div className="ararm-mentor-card">
                                    <div className="ararm-mentor-card-icon">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                            <circle cx="12" cy="7" r="4" />
                                        </svg>
                                    </div>
                                    <div className="ararm-mentor-card-info">
                                        <span className="ararm-mentor-card-name">{assignedMentor.name}</span>
                                        {assignedMentor.email && (
                                            <span className="ararm-mentor-card-detail">{assignedMentor.email}</span>
                                        )}
                                        {assignedMentor.phone && (
                                            <span className="ararm-mentor-card-detail">{assignedMentor.phone}</span>
                                        )}
                                        {assignedMentor.city && (
                                            <span className="ararm-mentor-card-detail">{assignedMentor.city}</span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    className="ararm-mentor-change-btn"
                                    onClick={handleLoadMentors}
                                >
                                    {t('admin.requestModal.changeMentor')}
                                </button>
                            </div>
                        ) : (
                            <button
                                className="ararm-mentor-assign-btn"
                                onClick={handleLoadMentors}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                    <circle cx="8.5" cy="7" r="4" />
                                    <line x1="20" y1="8" x2="20" y2="14" />
                                    <line x1="23" y1="11" x2="17" y2="11" />
                                </svg>
                                {t('admin.requestModal.assignMentor')}
                            </button>
                        )}

                        {/* MENTOR PICKER */}
                        {showMentorPicker && (
                            <div className="ararm-mentor-picker">
                                {mentorsLoading ? (
                                    <div className="ararm-mentor-picker-loading">
                                        <div className="ararm-mentor-picker-spinner"></div>
                                    </div>
                                ) : availableMentors.length > 0 ? (
                                    <div className="ararm-mentor-list">
                                        {availableMentors.map((mentor) => (
                                            <div
                                                key={mentor.id}
                                                className="ararm-mentor-option"
                                                onClick={() => handleAssignMentor(mentor)}
                                            >
                                                <div className="ararm-mentor-option-info">
                                                    <span className="ararm-mentor-option-name">{mentor.name}</span>
                                                    <span className="ararm-mentor-option-detail">
                                                        {mentor.email} {mentor.phone && `| ${mentor.phone}`}
                                                    </span>
                                                    {mentor.city && (
                                                        <span className="ararm-mentor-option-city">
                                                            {mentor.city}
                                                            {mentor.city === request.city && (
                                                                <span className="ararm-mentor-match-badge">
                                                                    {t('admin.requestModal.matchesCity')}
                                                                </span>
                                                            )}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="ararm-mentor-picker-empty">
                                        {t('admin.requestModal.noMentorsAvailable')}
                                    </p>
                                )}
                                <button
                                    className="ararm-mentor-picker-close"
                                    onClick={() => setShowMentorPicker(false)}
                                >
                                    {t('admin.requestModal.cancel')}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* ADMIN NOTES */}
                    <div className="ararm-field">
                        <label className="ararm-label">{t('admin.requestModal.adminNotes')}</label>
                        <textarea
                            className="ararm-textarea"
                            value={adminNotes}
                            onChange={(e) => setAdminNotes(e.target.value)}
                            placeholder={t('admin.requestModal.adminNotesPlaceholder')}
                            rows="4"
                        />
                    </div>

                    {/* CANCEL REASON */}
                    {status === 'cancelled' && (
                        <div className="ararm-field">
                            <label className="ararm-label">{t('admin.requestModal.cancelReason')}</label>
                            <textarea
                                className="ararm-textarea"
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                placeholder={t('admin.requestModal.cancelReasonPlaceholder')}
                                rows="3"
                            />
                        </div>
                    )}

                    {/* FEEDBACK (read-only, if completed) */}
                    {request.status === 'completed' && request.feedback && (
                        <div className="ararm-section">
                            <label className="ararm-label">{t('admin.requestModal.feedback')}</label>
                            <div className="ararm-feedback">
                                {request.feedback.rating && (
                                    <div className="ararm-feedback-rating">
                                        {'★'.repeat(request.feedback.rating)}{'☆'.repeat(5 - request.feedback.rating)}
                                    </div>
                                )}
                                {request.feedback.comment && (
                                    <p className="ararm-feedback-comment">{request.feedback.comment}</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* ACTIONS */}
                <div className="ararm-actions">
                    <button
                        className="ararm-btn ararm-btn--delete"
                        onClick={handleDelete}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                        {t('admin.requestModal.delete')}
                    </button>

                    {request.contactEmail && (
                        <button
                            className="ararm-btn ararm-btn--email"
                            onClick={() => onSendEmail(request)}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                <polyline points="22,6 12,13 2,6" />
                            </svg>
                            {t('admin.requestModal.sendEmail')}
                        </button>
                    )}

                    <button
                        className="ararm-btn ararm-btn--save"
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                            <polyline points="17 21 17 13 7 13 7 21" />
                            <polyline points="7 3 7 8 15 8" />
                        </svg>
                        {isSaving ? '...' : t('admin.requestModal.save')}
                    </button>
                </div>
            </div>
        </div>
    );
};
