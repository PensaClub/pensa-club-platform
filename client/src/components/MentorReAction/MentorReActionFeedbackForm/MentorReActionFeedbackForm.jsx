import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useReAction } from '../../contexts/ReActionProvider';
import './mentorReActionFeedbackForm.css';

export const MentorReActionFeedbackForm = ({ visitRequestId, onSuccess }) => {
    const { t } = useTranslation('reaction');
    const { submitFeedback } = useReAction();

    const [formData, setFormData] = useState({
        participantsActual: '',
        topicsCovered: '',
        challenges: '',
        highlights: '',
        recommendations: '',
        rating: 0,
    });

    const [hoverRating, setHoverRating] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleRatingClick = (rating) => {
        setFormData((prev) => ({ ...prev, rating }));
        setError('');
    };

    const validate = () => {
        if (!formData.rating && !formData.participantsActual) {
            setError(t('mentor.feedback.validationError', 'Please provide at least a rating or actual participants count.'));
            return false;
        }
        if (formData.participantsActual && (isNaN(formData.participantsActual) || Number(formData.participantsActual) < 0)) {
            setError(t('mentor.feedback.participantsError', 'Please enter a valid number of participants.'));
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        try {
            await submitFeedback({
                visitRequestId,
                participantsActual: formData.participantsActual ? Number(formData.participantsActual) : undefined,
                topicsCovered: formData.topicsCovered || undefined,
                challenges: formData.challenges || undefined,
                highlights: formData.highlights || undefined,
                recommendations: formData.recommendations || undefined,
                rating: formData.rating || undefined,
            });
            setIsSuccess(true);
            if (onSuccess) {
                setTimeout(() => onSuccess(), 2000);
            }
        } catch (err) {
            setError(t('mentor.feedback.submitError', 'An error occurred. Please try again.'));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="mraff-success">
                <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <h3>{t('mentor.feedback.successTitle', 'Thank you for your feedback!')}</h3>
                <p>{t('mentor.feedback.successMessage', 'Your feedback helps us improve the program.')}</p>
            </div>
        );
    }

    return (
        <form className="mraff" onSubmit={handleSubmit}>
            <h2 className="mraff-title">{t('mentor.feedback.title', 'Post-visit Feedback')}</h2>

            {/* Rating */}
            <div className="mraff-field">
                <label className="mraff-label">{t('mentor.feedback.rating', 'Rating')}</label>
                <div className="mraff-stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            className="mraff-star-btn"
                            onClick={() => handleRatingClick(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                        >
                            <svg
                                viewBox="0 0 24 24"
                                fill={(hoverRating || formData.rating) >= star ? '#f59e0b' : 'none'}
                                stroke={(hoverRating || formData.rating) >= star ? '#f59e0b' : '#d1d5db'}
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                        </button>
                    ))}
                </div>
            </div>

            {/* Participants Actual */}
            <div className="mraff-field">
                <label className="mraff-label" htmlFor="participantsActual">
                    {t('mentor.feedback.participantsActual', 'Actual number of participants')}
                </label>
                <input
                    type="number"
                    id="participantsActual"
                    name="participantsActual"
                    className="mraff-input"
                    value={formData.participantsActual}
                    onChange={handleChange}
                    min="0"
                    placeholder="0"
                />
            </div>

            {/* Topics Covered */}
            <div className="mraff-field">
                <label className="mraff-label" htmlFor="topicsCovered">
                    {t('mentor.feedback.topicsCovered', 'Topics discussed')}
                </label>
                <textarea
                    id="topicsCovered"
                    name="topicsCovered"
                    className="mraff-textarea"
                    value={formData.topicsCovered}
                    onChange={handleChange}
                    rows={3}
                    placeholder={t('mentor.feedback.topicsCoveredPlaceholder', 'What topics were discussed during the visit?')}
                />
            </div>

            {/* Challenges */}
            <div className="mraff-field">
                <label className="mraff-label" htmlFor="challenges">
                    {t('mentor.feedback.challenges', 'Challenges')}
                </label>
                <textarea
                    id="challenges"
                    name="challenges"
                    className="mraff-textarea"
                    value={formData.challenges}
                    onChange={handleChange}
                    rows={3}
                    placeholder={t('mentor.feedback.challengesPlaceholder', 'Were there any challenges?')}
                />
            </div>

            {/* Highlights */}
            <div className="mraff-field">
                <label className="mraff-label" htmlFor="highlights">
                    {t('mentor.feedback.highlights', 'Best moments')}
                </label>
                <textarea
                    id="highlights"
                    name="highlights"
                    className="mraff-textarea"
                    value={formData.highlights}
                    onChange={handleChange}
                    rows={3}
                    placeholder={t('mentor.feedback.highlightsPlaceholder', 'What were the best moments?')}
                />
            </div>

            {/* Recommendations */}
            <div className="mraff-field">
                <label className="mraff-label" htmlFor="recommendations">
                    {t('mentor.feedback.recommendations', 'Recommendations for next visits')}
                </label>
                <textarea
                    id="recommendations"
                    name="recommendations"
                    className="mraff-textarea"
                    value={formData.recommendations}
                    onChange={handleChange}
                    rows={3}
                    placeholder={t('mentor.feedback.recommendationsPlaceholder', 'Any recommendations for future visits?')}
                />
            </div>

            {error && <p className="mraff-error">{error}</p>}

            <button
                type="submit"
                className="mraff-submit"
                disabled={isSubmitting}
            >
                {isSubmitting
                    ? t('mentor.feedback.submitting', 'Submitting...')
                    : t('mentor.feedback.submit', 'Submit feedback')
                }
            </button>
        </form>
    );
};
