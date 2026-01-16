import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuthContext } from '../../contexts/UserContext';
import { useAcademy } from '../../contexts/AcademyProvider';
import './digiBridgeTestimonialForm.css';

export const DigiBridgeTestimonialForm = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { isAuthentication, profileData, setRedirectAfterLogin } = useAuthContext();
    const { createAcademyReview, checkUserAcademyReviewStatus } = useAcademy();
    
    const [formData, setFormData] = useState({
        name: '',
        role: '',
        email: '',
        text: '',
        rating: 5,
        consent: false,
    });
    
    const [loading, setLoading] = useState(false);
    const [hasReviewed, setHasReviewed] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(true);

    useEffect(() => {
        if (isAuthentication && profileData) {
            setFormData(prev => ({
                ...prev,
                name: profileData.details?.firstName && profileData.details?.lastName 
                    ? `${profileData.details.firstName} ${profileData.details.lastName}`
                    : profileData.details?.username || '',
                email: profileData.email || ''
            }));
            checkReviewStatus();
        } else {
            setCheckingStatus(false);
        }
    }, [isAuthentication, profileData]);

    const checkReviewStatus = async () => {
        try {
            setCheckingStatus(true);
            const response = await checkUserAcademyReviewStatus();
            const hasReview = response?.hasReview || false;
            setHasReviewed(hasReview);
        } catch (error) {
            console.error('Error checking review status:', error);
        } finally {
            setCheckingStatus(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleRatingChange = (rating) => {
        setFormData(prev => ({ ...prev, rating }));
    };

    const handleLoginClick = () => {
        setRedirectAfterLogin(window.location.pathname);
        navigate('/sign-up?view=login');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.role || !formData.email) {
            toast.error(t('digiBridge.testimonialForm.fillAllFields', 'Моля, попълнете всички задължителни полета'));
            return;
        }

        if (!formData.consent) {
            toast.error(t('digiBridge.testimonialForm.consentRequired', 'Моля, дайте съгласие за публикуване'));
            return;
        }

        setLoading(true);

        try {
            await createAcademyReview({
                name: formData.name,
                role: formData.role,
                email: formData.email,
                text: formData.text,
                rating: formData.rating,
            });

            toast.success(t('digiBridge.testimonialForm.successMessage', 'Благодарим за вашия отзив!'));
            
            setFormData({
                name: profileData.details?.firstName && profileData.details?.lastName 
                    ? `${profileData.details.firstName} ${profileData.details.lastName}`
                    : profileData.details?.username || '',
                role: '',
                email: profileData.email || '',
                text: '',
                rating: 5,
                consent: false,
            });
            
            setHasReviewed(true);

        } catch (error) {
            console.error('Error submitting testimonial:', error);
            toast.error(t('digiBridge.testimonialForm.errorMessage', 'Грешка при изпращане'));
        } finally {
            setLoading(false);
        }
    };

    // Login Required State
    if (!isAuthentication) {
        return (
            <section className="dbtf-section">
                <div className="dbtf-glow dbtf-glow--1"></div>
                <div className="dbtf-glow dbtf-glow--2"></div>
                
                <div className="dbtf-container">
                    <div className="dbtf-state-card">
                        <div className="dbtf-state-icon dbtf-state-icon--lock">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                        </div>
                        <h3 className="dbtf-state-title">
                            {t('digiBridge.testimonialForm.loginRequired', 'Влезте в профила си')}
                        </h3>
                        <p className="dbtf-state-desc">
                            {t('digiBridge.testimonialForm.loginRequiredMessage', 'За да споделите вашия отзив, моля влезте в профила си')}
                        </p>
                        <button className="dbtf-state-btn" onClick={handleLoginClick}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                                <polyline points="10 17 15 12 10 7"/>
                                <line x1="15" y1="12" x2="3" y2="12"/>
                            </svg>
                            {t('digiBridge.testimonialForm.loginButton', 'Вход в профила')}
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    // Loading State
    if (checkingStatus) {
        return (
            <section className="dbtf-section">
                <div className="dbtf-glow dbtf-glow--1"></div>
                <div className="dbtf-glow dbtf-glow--2"></div>
                
                <div className="dbtf-container">
                    <div className="dbtf-state-card">
                        <div className="dbtf-spinner"></div>
                        <p className="dbtf-state-desc">
                            {t('digiBridge.testimonialForm.checking', 'Зареждане...')}
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    // Already Reviewed State
    if (hasReviewed) {
        return (
            <section className="dbtf-section">
                <div className="dbtf-glow dbtf-glow--1"></div>
                <div className="dbtf-glow dbtf-glow--2"></div>
                
                <div className="dbtf-container">
                    <div className="dbtf-state-card">
                        <div className="dbtf-state-icon dbtf-state-icon--success">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                <polyline points="22 4 12 14.01 9 11.01"/>
                            </svg>
                        </div>
                        <h3 className="dbtf-state-title">
                            {t('digiBridge.testimonialForm.alreadyReviewed', 'Благодарим!')}
                        </h3>
                        <p className="dbtf-state-desc">
                            {t('digiBridge.testimonialForm.alreadyReviewedMessage', 'Вече сте споделили вашия отзив. Благодарим ви за обратната връзка!')}
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    // Main Form
    return (
        <section className="dbtf-section">
            {/* Background */}
            <div className="dbtf-glow dbtf-glow--1"></div>
            <div className="dbtf-glow dbtf-glow--2"></div>
            <div className="dbtf-grid"></div>

            <div className="dbtf-container">
                <div className="dbtf-card">
                    {/* Header */}
                    <div className="dbtf-header">
                        <div className="dbtf-header-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                            </svg>
                        </div>
                        <h2 className="dbtf-title">
                            {t('digiBridge.testimonialForm.titlePart1', 'Споделете вашия ')}
                            <span className="dbtf-title-highlight">
                                {t('digiBridge.testimonialForm.titlePart2', 'отзив')}
                            </span>
                        </h2>
                        <p className="dbtf-subtitle">
                            {t('digiBridge.testimonialForm.subtitle', 'Вашето мнение е важно за нас и помага на други хора да научат за програмата')}
                        </p>
                    </div>

                    {/* Form */}
                    <form className="dbtf-form" onSubmit={handleSubmit}>
                        {/* Name & Role Row */}
                        <div className="dbtf-row">
                            <div className="dbtf-field">
                                <label className="dbtf-label">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                        <circle cx="12" cy="7" r="4"/>
                                    </svg>
                                    {t('digiBridge.testimonialForm.nameLabel', 'Име')}
                                    <span className="dbtf-required">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder={t('digiBridge.testimonialForm.namePlaceholder', 'Вашето име')}
                                    className="dbtf-input"
                                    disabled={loading}
                                />
                            </div>

                            <div className="dbtf-field">
                                <label className="dbtf-label">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                        <circle cx="9" cy="7" r="4"/>
                                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                                    </svg>
                                    {t('digiBridge.testimonialForm.roleLabel', 'Роля')}
                                    <span className="dbtf-required">*</span>
                                </label>
                                <div className="dbtf-select-wrapper">
                                    <select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleChange}
                                        className="dbtf-select"
                                        disabled={loading}
                                    >
                                        <option value="">{t('digiBridge.testimonialForm.roleSelect', 'Изберете роля')}</option>
                                        <option value="participant">{t('digiBridge.testimonialForm.roleParticipant', 'Участник')}</option>
                                        <option value="mentor">{t('digiBridge.testimonialForm.roleMentor', 'Ментор')}</option>
                                    </select>
                                    <svg className="dbtf-select-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="6 9 12 15 18 9"/>
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Email */}
                        <div className="dbtf-field">
                            <label className="dbtf-label">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                    <polyline points="22,6 12,13 2,6"/>
                                </svg>
                                {t('digiBridge.testimonialForm.emailLabel', 'Имейл')}
                                <span className="dbtf-required">*</span>
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder={t('digiBridge.testimonialForm.emailPlaceholder', 'email@example.com')}
                                className="dbtf-input dbtf-input--readonly"
                                disabled={loading}
                                readOnly
                            />
                            <span className="dbtf-hint">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10"/>
                                    <path d="M12 16v-4M12 8h.01"/>
                                </svg>
                                {t('digiBridge.testimonialForm.emailHint', 'Имейлът няма да бъде показван публично')}
                            </span>
                        </div>

                        {/* Rating */}
                        <div className="dbtf-field">
                            <label className="dbtf-label">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                                </svg>
                                {t('digiBridge.testimonialForm.ratingLabel', 'Оценка')}
                                <span className="dbtf-required">*</span>
                            </label>
                            <div className="dbtf-rating">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        className={`dbtf-star ${star <= formData.rating ? 'dbtf-star--active' : ''}`}
                                        onClick={() => handleRatingChange(star)}
                                        disabled={loading}
                                        aria-label={`Rate ${star} stars`}
                                    >
                                        <svg viewBox="0 0 24 24" fill={star <= formData.rating ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
                                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                                        </svg>
                                    </button>
                                ))}
                                <span className="dbtf-rating-text">
                                    {formData.rating}/5
                                </span>
                            </div>
                        </div>

                        {/* Text */}
                        <div className="dbtf-field">
                            <label className="dbtf-label">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                                </svg>
                                {t('digiBridge.testimonialForm.textLabel', 'Вашият отзив')}
                            </label>
                            <textarea
                                name="text"
                                value={formData.text}
                                onChange={handleChange}
                                placeholder={t('digiBridge.testimonialForm.textPlaceholder', 'Споделете вашия опит с DigiBridge Academy...')}
                                className="dbtf-textarea"
                                rows="5"
                                maxLength="500"
                                disabled={loading}
                            />
                            <div className="dbtf-char-count">
                                <span className={formData.text.length >= 450 ? 'dbtf-char-count--warning' : ''}>
                                    {formData.text.length}
                                </span>
                                /500
                            </div>
                        </div>

                        {/* Consent */}
                        <div className="dbtf-consent">
                            <label className="dbtf-checkbox">
                                <input
                                    type="checkbox"
                                    name="consent"
                                    checked={formData.consent}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                                <span className="dbtf-checkbox-box">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                        <polyline points="20 6 9 17 4 12"/>
                                    </svg>
                                </span>
                                <span className="dbtf-checkbox-text">
                                    {t('digiBridge.testimonialForm.consentText', 'Съгласен/а съм отзивът ми да бъде публикуван на сайта')}
                                </span>
                            </label>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            className="dbtf-submit"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <div className="dbtf-spinner dbtf-spinner--small"></div>
                                    {t('digiBridge.testimonialForm.sendingButton', 'Изпращане...')}
                                </>
                            ) : (
                                <>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="22" y1="2" x2="11" y2="13"/>
                                        <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                                    </svg>
                                    {t('digiBridge.testimonialForm.sendButton', 'Изпрати отзив')}
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
};