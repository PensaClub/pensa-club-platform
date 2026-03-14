import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useReAction } from '../../contexts/ReActionProvider';
import { MentorReActionFeedbackForm } from '../MentorReActionFeedbackForm/MentorReActionFeedbackForm';
import './mentorReActionHistory.css';

export const MentorReActionHistory = () => {
    const { t } = useTranslation('reaction');
    const { getMentorHistory } = useReAction();

    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [feedbackForVisit, setFeedbackForVisit] = useState(null);
    const [expandedFeedback, setExpandedFeedback] = useState({});

    const fetchHistory = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await getMentorHistory();
            setHistory(res?.history || []);
        } catch (error) {
            console.error('Error fetching history:', error);
        } finally {
            setIsLoading(false);
        }
    }, [getMentorHistory]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('bg-BG', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <svg
                    key={i}
                    className={`mrah-star ${i <= rating ? 'mrah-star--filled' : 'mrah-star--empty'}`}
                    viewBox="0 0 24 24"
                    fill={i <= rating ? '#f59e0b' : 'none'}
                    stroke={i <= rating ? '#f59e0b' : '#d1d5db'}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
            );
        }
        return stars;
    };

    const toggleFeedbackExpand = (id) => {
        setExpandedFeedback((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const handleFeedbackSubmitted = () => {
        setFeedbackForVisit(null);
        fetchHistory();
    };

    if (isLoading) {
        return (
            <div className="mrah-loading">
                <div className="mrah-spinner" />
                <p>{t('mentor.history.loading', 'Loading history...')}</p>
            </div>
        );
    }

    if (feedbackForVisit) {
        return (
            <div className="mrah">
                <button
                    className="mrah-back-btn"
                    onClick={() => setFeedbackForVisit(null)}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                    {t('mentor.history.backToHistory', 'Back to history')}
                </button>
                <MentorReActionFeedbackForm
                    visitRequestId={feedbackForVisit}
                    onSuccess={handleFeedbackSubmitted}
                />
            </div>
        );
    }

    if (history.length === 0) {
        return (
            <div className="mrah-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                </svg>
                <p>{t('mentor.history.empty', 'You have no completed visits yet.')}</p>
            </div>
        );
    }

    return (
        <div className="mrah">
            <div className="mrah-table-wrapper">
                <table className="mrah-table">
                    <thead>
                        <tr>
                            <th>{t('mentor.history.date', 'Date')}</th>
                            <th>{t('mentor.history.club', 'Club')}</th>
                            <th>{t('mentor.history.city', 'City')}</th>
                            <th>{t('mentor.history.topic', 'Topic')}</th>
                            <th>{t('mentor.history.participants', 'Participants')}</th>
                            <th>{t('mentor.history.rating', 'Rating')}</th>
                            <th>{t('mentor.history.feedback', 'Feedback')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.map((visit) => (
                            <React.Fragment key={visit.id}>
                                <tr className="mrah-row">
                                    <td className="mrah-td-date">
                                        {formatDate(visit.preferredDate)}
                                    </td>
                                    <td className="mrah-td-club">{visit.clubName}</td>
                                    <td className="mrah-td-city">{visit.city}</td>
                                    <td className="mrah-td-topic">
                                        <span className="mrah-topic-badge">
                                            {t(`form.topicOptions.${visit.topic}`, visit.topic)}
                                        </span>
                                    </td>
                                    <td className="mrah-td-participants">
                                        {visit.feedback?.participantsActual || visit.participantsCount || '-'}
                                    </td>
                                    <td className="mrah-td-rating">
                                        {visit.feedback?.rating ? (
                                            <div className="mrah-stars">
                                                {renderStars(visit.feedback.rating)}
                                            </div>
                                        ) : (
                                            <span className="mrah-no-rating">-</span>
                                        )}
                                    </td>
                                    <td className="mrah-td-feedback">
                                        {visit.feedback ? (
                                            <button
                                                className="mrah-feedback-toggle"
                                                onClick={() => toggleFeedbackExpand(visit.id)}
                                            >
                                                {expandedFeedback[visit.id]
                                                    ? t('mentor.history.collapse', 'Hide')
                                                    : t('mentor.history.expand', 'Show details')
                                                }
                                            </button>
                                        ) : (
                                            <button
                                                className="mrah-add-feedback-btn"
                                                onClick={() => setFeedbackForVisit(visit.id)}
                                            >
                                                {t('mentor.history.addFeedback', 'Add feedback')}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                                {visit.feedback && expandedFeedback[visit.id] && (
                                    <tr className="mrah-expanded-row">
                                        <td colSpan="7">
                                            <div className="mrah-feedback-details">
                                                {visit.feedback.topicsCovered && (
                                                    <div className="mrah-feedback-field">
                                                        <strong>{t('mentor.history.topicsCovered', 'Topics covered')}:</strong>
                                                        <p>{visit.feedback.topicsCovered}</p>
                                                    </div>
                                                )}
                                                {visit.feedback.challenges && (
                                                    <div className="mrah-feedback-field">
                                                        <strong>{t('mentor.history.challenges', 'Challenges')}:</strong>
                                                        <p>{visit.feedback.challenges}</p>
                                                    </div>
                                                )}
                                                {visit.feedback.highlights && (
                                                    <div className="mrah-feedback-field">
                                                        <strong>{t('mentor.history.highlights', 'Highlights')}:</strong>
                                                        <p>{visit.feedback.highlights}</p>
                                                    </div>
                                                )}
                                                {visit.feedback.recommendations && (
                                                    <div className="mrah-feedback-field">
                                                        <strong>{t('mentor.history.recommendations', 'Recommendations')}:</strong>
                                                        <p>{visit.feedback.recommendations}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className="mrah-mobile-cards">
                {history.map((visit) => (
                    <div key={visit.id} className="mrah-mobile-card">
                        <div className="mrah-mobile-card-header">
                            <span className="mrah-mobile-date">
                                {formatDate(visit.preferredDate)}
                            </span>
                            {visit.feedback?.rating && (
                                <div className="mrah-stars mrah-stars--small">
                                    {renderStars(visit.feedback.rating)}
                                </div>
                            )}
                        </div>
                        <h4 className="mrah-mobile-club">{visit.clubName}</h4>
                        <p className="mrah-mobile-city">{visit.city}</p>
                        <span className="mrah-topic-badge">
                            {t(`form.topicOptions.${visit.topic}`, visit.topic)}
                        </span>
                        <p className="mrah-mobile-participants">
                            {t('mentor.history.participants', 'Participants')}: {visit.feedback?.participantsActual || visit.participantsCount || '-'}
                        </p>
                        {visit.feedback ? (
                            <>
                                <button
                                    className="mrah-feedback-toggle"
                                    onClick={() => toggleFeedbackExpand(visit.id)}
                                >
                                    {expandedFeedback[visit.id]
                                        ? t('mentor.history.collapse', 'Hide')
                                        : t('mentor.history.expand', 'Show details')
                                    }
                                </button>
                                {expandedFeedback[visit.id] && (
                                    <div className="mrah-feedback-details">
                                        {visit.feedback.topicsCovered && (
                                            <div className="mrah-feedback-field">
                                                <strong>{t('mentor.history.topicsCovered', 'Topics covered')}:</strong>
                                                <p>{visit.feedback.topicsCovered}</p>
                                            </div>
                                        )}
                                        {visit.feedback.challenges && (
                                            <div className="mrah-feedback-field">
                                                <strong>{t('mentor.history.challenges', 'Challenges')}:</strong>
                                                <p>{visit.feedback.challenges}</p>
                                            </div>
                                        )}
                                        {visit.feedback.highlights && (
                                            <div className="mrah-feedback-field">
                                                <strong>{t('mentor.history.highlights', 'Highlights')}:</strong>
                                                <p>{visit.feedback.highlights}</p>
                                            </div>
                                        )}
                                        {visit.feedback.recommendations && (
                                            <div className="mrah-feedback-field">
                                                <strong>{t('mentor.history.recommendations', 'Recommendations')}:</strong>
                                                <p>{visit.feedback.recommendations}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        ) : (
                            <button
                                className="mrah-add-feedback-btn"
                                onClick={() => setFeedbackForVisit(visit.id)}
                            >
                                {t('mentor.history.addFeedback', 'Add feedback')}
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
