import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useReAction } from '../../contexts/ReActionProvider';
import './mentorReActionAssignments.css';

export const MentorReActionAssignments = () => {
    const { t } = useTranslation('reaction');
    const { getMentorAssignments, confirmAssignment, reportProblem } = useReAction();

    const [assignments, setAssignments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [reportModal, setReportModal] = useState(null);
    const [reportMessage, setReportMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchAssignments = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await getMentorAssignments();
            setAssignments(res?.assignments || []);
        } catch (error) {
            console.error('Error fetching assignments:', error);
        } finally {
            setIsLoading(false);
        }
    }, [getMentorAssignments]);

    useEffect(() => {
        fetchAssignments();
    }, [fetchAssignments]);

    const handleConfirm = async (id) => {
        setIsSubmitting(true);
        try {
            await confirmAssignment(id);
            await fetchAssignments();
        } catch (error) {
            console.error('Error confirming assignment:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReportSubmit = async () => {
        if (!reportMessage.trim() || !reportModal) return;
        setIsSubmitting(true);
        try {
            await reportProblem(reportModal, { message: reportMessage });
            setReportModal(null);
            setReportMessage('');
            await fetchAssignments();
        } catch (error) {
            console.error('Error reporting problem:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('bg-BG', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    const getStatusLabel = (status) => {
        const labels = {
            mentor_assigned: t('mentor.assignments.statusAssigned', 'Assigned'),
            confirmed: t('mentor.assignments.statusConfirmed', 'Confirmed'),
        };
        return labels[status] || status;
    };

    const getStatusClass = (status) => {
        if (status === 'confirmed') return 'mraa-status--confirmed';
        if (status === 'mentor_assigned') return 'mraa-status--assigned';
        return '';
    };

    if (isLoading) {
        return (
            <div className="mraa-loading">
                <div className="mraa-spinner" />
                <p>{t('mentor.assignments.loading', 'Loading assignments...')}</p>
            </div>
        );
    }

    if (assignments.length === 0) {
        return (
            <div className="mraa-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <p>{t('mentor.assignments.empty', 'You have no assigned visits.')}</p>
            </div>
        );
    }

    return (
        <div className="mraa">
            <div className="mraa-cards">
                {assignments.map((assignment) => (
                    <div key={assignment.id} className="mraa-card">
                        <div className="mraa-card-header">
                            <div className="mraa-card-date">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                    <line x1="16" y1="2" x2="16" y2="6" />
                                    <line x1="8" y1="2" x2="8" y2="6" />
                                    <line x1="3" y1="10" x2="21" y2="10" />
                                </svg>
                                {formatDate(assignment.preferredDate)}
                            </div>
                            <span className={`mraa-status ${getStatusClass(assignment.status)}`}>
                                {getStatusLabel(assignment.status)}
                            </span>
                        </div>

                        <div className="mraa-card-body">
                            <h3 className="mraa-club-name">{assignment.clubName}</h3>
                            <p className="mraa-city">
                                <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                                </svg>
                                {assignment.city}
                            </p>

                            {assignment.topic && (
                                <span className="mraa-topic-badge">
                                    {t(`form.topicOptions.${assignment.topic}`, assignment.topic)}
                                </span>
                            )}

                            {assignment.participantsCount && (
                                <p className="mraa-participants">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                                        <circle cx="9" cy="7" r="4" />
                                        <path d="M23 21v-2a4 4 0 00-3-3.87" />
                                        <path d="M16 3.13a4 4 0 010 7.75" />
                                    </svg>
                                    {t('mentor.assignments.expectedParticipants', 'Expected participants')}: {assignment.participantsCount}
                                </p>
                            )}

                            {/* Contact Info */}
                            <div className="mraa-contact">
                                <h4>{t('mentor.assignments.contact', 'Contact')}</h4>
                                {assignment.contactName && (
                                    <p className="mraa-contact-item">{assignment.contactName}</p>
                                )}
                                {assignment.contactPhone && (
                                    <a href={`tel:${assignment.contactPhone}`} className="mraa-contact-link">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                                        </svg>
                                        {assignment.contactPhone}
                                    </a>
                                )}
                                {assignment.contactEmail && (
                                    <a href={`mailto:${assignment.contactEmail}`} className="mraa-contact-link">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                            <polyline points="22,6 12,13 2,6" />
                                        </svg>
                                        {assignment.contactEmail}
                                    </a>
                                )}
                            </div>

                            {assignment.notes && (
                                <div className="mraa-notes">
                                    <h4>{t('mentor.assignments.notes', 'Notes')}</h4>
                                    <p>{assignment.notes}</p>
                                </div>
                            )}
                        </div>

                        <div className="mraa-card-actions">
                            {assignment.status === 'mentor_assigned' && (
                                <button
                                    className="mraa-btn mraa-btn--confirm"
                                    onClick={() => handleConfirm(assignment.id)}
                                    disabled={isSubmitting}
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                    {t('mentor.assignments.confirm', 'Confirm')}
                                </button>
                            )}
                            <button
                                className="mraa-btn mraa-btn--report"
                                onClick={() => setReportModal(assignment.id)}
                                disabled={isSubmitting}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                                    <line x1="12" y1="9" x2="12" y2="13" />
                                    <line x1="12" y1="17" x2="12.01" y2="17" />
                                </svg>
                                {t('mentor.assignments.reportProblem', 'Report problem')}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Report Problem Modal */}
            {reportModal && (
                <div className="mraa-modal-overlay" onClick={() => setReportModal(null)}>
                    <div className="mraa-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>{t('mentor.assignments.reportTitle', 'Report a problem')}</h3>
                        <textarea
                            className="mraa-modal-textarea"
                            value={reportMessage}
                            onChange={(e) => setReportMessage(e.target.value)}
                            placeholder={t('mentor.assignments.reportPlaceholder', 'Describe the problem...')}
                            rows={4}
                        />
                        <div className="mraa-modal-actions">
                            <button
                                className="mraa-btn mraa-btn--cancel"
                                onClick={() => { setReportModal(null); setReportMessage(''); }}
                            >
                                {t('mentor.assignments.cancel', 'Cancel')}
                            </button>
                            <button
                                className="mraa-btn mraa-btn--submit"
                                onClick={handleReportSubmit}
                                disabled={!reportMessage.trim() || isSubmitting}
                            >
                                {t('mentor.assignments.send', 'Send')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
