import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAcademy } from '../../contexts/AcademyProvider';
import { useAuthContext } from '../../contexts/UserContext';
import { toast } from 'react-toastify';
import './mentorDetailModal.css';

export const MentorDetailModal = ({ mentor, onClose }) => {
    const { t } = useTranslation(['digibridge-mentor', 'digibridge']);
    const { getApprovedMentorReviews, getMentorReviewStats, applyForMentor } = useAcademy();
    const { isAuthentication, isMentor, isAdmin } = useAuthContext();

    const [reviews, setReviews] = useState([]);
    const [reviewStats, setReviewStats] = useState(null);
    const [isLoadingReviews, setIsLoadingReviews] = useState(false);
    const [isApplying, setIsApplying] = useState(false);
    const [hasApplied, setHasApplied] = useState(false);

    useEffect(() => {
        fetchReviews();
        fetchReviewStats();
        checkApplicationStatus();
    }, [mentor.id]);

    const fetchReviews = async () => {
        setIsLoadingReviews(true);
        try {
            const response = await getApprovedMentorReviews(mentor.id, 5);
            if (response.success) {
                setReviews(response.reviews || []);
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setIsLoadingReviews(false);
        }
    };

    const fetchReviewStats = async () => {
        try {
            const response = await getMentorReviewStats(mentor.id);
            if (response.success) {
                setReviewStats(response.stats);
            }
        } catch (error) {
            console.error('Error fetching review stats:', error);
        }
    };

    const checkApplicationStatus = () => {
        // Check localStorage for existing application
        const appliedMentors = JSON.parse(localStorage.getItem('appliedMentors') || '[]');
        const hasAppliedToMentor = appliedMentors.some(app => app.mentorId === mentor.id);
        setHasApplied(hasAppliedToMentor);
    };

    const handleApply = async () => {
        if (!isAuthentication) {
            toast.error('Моля влезте в профила си, за да кандидатствате');
            return;
        }

        if (isMentor) {
            toast.warning(t('mentorModal.cannotApplyAsMentor'));
            return;
        }

        if (isAdmin) {
            toast.warning(t('mentorModal.cannotApplyAsAdmin'));
            return;
        }

        // if (hasApplied) {
        //   toast.info(t('mentorModal.alreadyApplied'));
        //   return;
        // }

        setIsApplying(true);
        try {
            const response = await applyForMentor(mentor.id);

            if (response.success) {
                // Save to localStorage
                const appliedMentors = JSON.parse(localStorage.getItem('appliedMentors') || '[]');
                appliedMentors.push({
                    mentorId: mentor.id,
                    mentorName: mentor.name,
                    timestamp: Date.now(),
                    applicationId: response.application?.id || response.id
                });
                localStorage.setItem('appliedMentors', JSON.stringify(appliedMentors));

                setHasApplied(true);
                toast.success(t('mentorModal.applicationSuccess'));
            }
        } catch (error) {
            console.error('Error applying for mentor:', error);
            toast.error(t('mentorModal.applicationError'));
        } finally {
            setIsApplying(false);
        }
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const formatLanguages = (langs) => {
        if (!langs || langs.length === 0) return t('mentorModal.noLanguages');

        const languageMap = {
            'bg': 'Български',
            'en': 'English',
            'de': 'Deutsch',
            'fr': 'Français',
            'es': 'Español'
        };

        return langs.map(lang => languageMap[lang] || lang).join(', ');
    };

    const isButtonDisabled = !isAuthentication || isMentor || isAdmin || isApplying;

    const getButtonText = () => {
        if (!isAuthentication) return t('mentorModal.selectMentor');
        // if (hasApplied) return t('mentorModal.alreadyApplied');
        if (isMentor) return t('mentorModal.cannotApplyAsMentor');
        if (isAdmin) return t('mentorModal.cannotApplyAsAdmin');
        if (isApplying) return t('mentorModal.applying');
        return t('mentorModal.selectMentor');
    };

    return (
        <div className="mentor-modal-overlay" onClick={handleOverlayClick}>
            <div className="mentor-modal-container">

                {/* CLOSE BUTTON */}
                <button className="mentor-modal-close" onClick={onClose}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                </button>

                {/* HEADER */}
                <div className="mentor-modal-header">
                    <div className="mentor-modal-avatar">
                        <img src={mentor.photoUrl} alt={mentor.name} />
                        <div className={`mentor-modal-badge ${mentor.isOnline ? 'available' : 'busy'}`}>
                            {mentor.isOnline && <span className="mentor-modal-badge-dot"></span>}
                            {t(`digiBridge.mentorsPage.card.${mentor.isOnline ? 'available' : 'busy'}`)}
                        </div>
                    </div>

                    <div className="mentor-modal-header-info">
                        <h2 className="mentor-modal-name">{mentor.name}</h2>
                        <p className="mentor-modal-age">{mentor.age} {t('digiBridge.mentorsPage.card.years')}</p>

                        <div className="mentor-modal-specialization">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                <path d="M2 17l10 5 10-5" />
                                <path d="M2 12l10 5 10-5" />
                            </svg>
                            <span>{mentor.specialization}</span>
                        </div>
                    </div>
                </div>

                {/* STATS ROW */}
                <div className="mentor-modal-stats">
                    <div className="mentor-modal-stat">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                        </svg>
                        <div>
                            <span className="mentor-modal-stat-value">{mentor.studentsCount || 0}</span>
                            <span className="mentor-modal-stat-label">{t('digiBridge.mentorsPage.card.students')}</span>
                        </div>
                    </div>

                    <div className="mentor-modal-stat">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                        <div>
                            <span className="mentor-modal-stat-value">{parseInt(mentor.reviewsAvgRating || 0).toFixed(1)}</span>
                            <span className="mentor-modal-stat-label">{t('mentorModal.rating')}</span>
                        </div>
                    </div>

                    <div className="mentor-modal-stat">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M8 10H16M8 14H11M6 20L3 17V7C3 5.89543 3.89543 5 5 5H19C20.1046 5 21 5.89543 21 7V15C21 16.1046 20.1046 17 19 17H9L6 20Z" />
                        </svg>
                        <div>
                            <span className="mentor-modal-stat-value">{mentor.reviewsCount || 0}</span>
                            <span className="mentor-modal-stat-label">{t('mentorModal.reviews')}</span>
                        </div>
                    </div>

                    <div className="mentor-modal-stat">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                        <div>
                            <span className="mentor-modal-stat-value">{mentor.sessionsCount || 0}</span>
                            <span className="mentor-modal-stat-label">{t('mentorModal.sessions')}</span>
                        </div>
                    </div>
                </div>

                {/* CONTENT */}
                <div className="mentor-modal-content">

                    {/* BIO */}
                    {mentor.bio && (
                        <div className="mentor-modal-section">
                            <h3 className="mentor-modal-section-title">{t('mentorModal.about')}</h3>
                            <p className="mentor-modal-bio">{mentor.bio}</p>
                        </div>
                    )}

                    {/* EXPERIENCE & EDUCATION */}
                    <div className="mentor-modal-section">
                        <h3 className="mentor-modal-section-title">{t('mentorModal.experience')}</h3>
                        <div className="mentor-modal-info-grid">
                            {mentor.education && (
                                <div className="mentor-modal-info-item">
                                    <span className="mentor-modal-info-label">{t('mentorModal.education')}:</span>
                                    <span className="mentor-modal-info-value">{mentor.education}</span>
                                </div>
                            )}
                            {mentor.experience && (
                                <div className="mentor-modal-info-item">
                                    <span className="mentor-modal-info-label">{t('mentorModal.yearsExperience')}:</span>
                                    <span className="mentor-modal-info-value">{mentor.experience}</span>
                                </div>
                            )}
                            {mentor.availability && (
                                <div className="mentor-modal-info-item">
                                    <span className="mentor-modal-info-label">{t('mentorModal.availability')}:</span>
                                    <span className="mentor-modal-info-value">{mentor.availability}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* LANGUAGES */}
                    {mentor.languages && mentor.languages.length > 0 && (
                        <div className="mentor-modal-section">
                            <h3 className="mentor-modal-section-title">{t('mentorModal.languages')}</h3>
                            <p className="mentor-modal-languages">{formatLanguages(mentor.languages)}</p>
                        </div>
                    )}

                    {/* REVIEWS */}
                    {reviews.length > 0 && (
                        <div className="mentor-modal-section">
                            <h3 className="mentor-modal-section-title">{t('mentorModal.reviews')}</h3>
                            <div className="mentor-modal-reviews">
                                {reviews.map((review) => (
                                    <div key={review.id} className="mentor-modal-review">
                                        <div className="mentor-modal-review-header">
                                            <span className="mentor-modal-review-name">{review.name}</span>
                                            <div className="mentor-modal-review-rating">
                                                {'⭐'.repeat(review.rating)}
                                            </div>
                                        </div>
                                        <p className="mentor-modal-review-text">{review.text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>

                {/* FOOTER */}
                <div className="mentor-modal-footer">
                    <button className="mentor-modal-btn mentor-modal-btn-secondary" onClick={onClose}>
                        {t('mentorModal.close')}
                    </button>
                    <button
                        className="mentor-modal-btn mentor-modal-btn-primary"
                        onClick={handleApply}
                        disabled={isButtonDisabled}
                    >
                        {getButtonText()}
                    </button>
                </div>

            </div>
        </div>
    );
};