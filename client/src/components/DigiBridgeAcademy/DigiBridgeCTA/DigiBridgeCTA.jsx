import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './digiBridgeCTA.css';

export const DigiBridgeCTA = () => {
    const { t } = useTranslation();

    return (
        <section className="dbc-section">
            {/* Background Elements */}
            <div className="dbc-grid"></div>
            <div className="dbc-glow dbc-glow--1"></div>
            <div className="dbc-glow dbc-glow--2"></div>
            <div className="dbc-glow dbc-glow--3"></div>

            {/* Floating Particles */}
            <div className="dbc-particles">
                {[...Array(15)].map((_, i) => (
                    <div 
                        key={i} 
                        className="dbc-particle"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${10 + Math.random() * 10}s`
                        }}
                    ></div>
                ))}
            </div>

            <div className="dbc-container">
                <div className="dbc-content">
                    {/* Badge */}
                    <div className="dbc-badge">
                        <span className="dbc-badge-dot"></span>
                        <span className="dbc-badge-text">{t('digiBridge.cta.badge', 'Започнете днес')}</span>
                    </div>

                    {/* Title */}
                    <h2 className="dbc-title">
                        {t('digiBridge.cta.titlePart1', 'Готови ли сте за ')}
                        <span className="dbc-title-highlight">
                            {t('digiBridge.cta.titlePart2', 'дигиталното бъдеще')}
                        </span>
                        {t('digiBridge.cta.titlePart3', '?')}
                    </h2>

                    {/* Description */}
                    <p className="dbc-description">
                        {t('digiBridge.cta.description', 'Присъединете се към хилядите участници, които вече подобряват дигиталните си умения с помощта на нашите ментори.')}
                    </p>

                    {/* Actions */}
                    <div className="dbc-actions">
                        <Link to="/academy/courses" className="dbc-btn dbc-btn--primary">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                                <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                            </svg>
                            <span>{t('digiBridge.cta.startLearning', 'Започни обучение')}</span>
                        </Link>

                        <Link to="/academy/become-mentor" className="dbc-btn dbc-btn--outline">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                <circle cx="9" cy="7" r="4"/>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                            </svg>
                            <span>{t('digiBridge.cta.becomeMentor', 'Стани ментор')}</span>
                        </Link>
                    </div>

                    {/* Features */}
                    <div className="dbc-features">
                        <div className="dbc-feature">
                            <div className="dbc-feature-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <polyline points="20 6 9 17 4 12"/>
                                </svg>
                            </div>
                            <span>{t('digiBridge.cta.feature1', '100% безплатно')}</span>
                        </div>
                        <div className="dbc-feature">
                            <div className="dbc-feature-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <polyline points="20 6 9 17 4 12"/>
                                </svg>
                            </div>
                            <span>{t('digiBridge.cta.feature2', 'Обучени ментори')}</span>
                        </div>
                        <div className="dbc-feature">
                            <div className="dbc-feature-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <polyline points="20 6 9 17 4 12"/>
                                </svg>
                            </div>
                            <span>{t('digiBridge.cta.feature3', 'Гъвкав график')}</span>
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div className="dbc-stats">
                        <div className="dbc-stat">
                            <span className="dbc-stat-number">500+</span>
                            <span className="dbc-stat-label">{t('digiBridge.cta.stat1', 'Участници')}</span>
                        </div>
                        <div className="dbc-stat-divider"></div>
                        <div className="dbc-stat">
                            <span className="dbc-stat-number">50+</span>
                            <span className="dbc-stat-label">{t('digiBridge.cta.stat2', 'Ментори')}</span>
                        </div>
                        <div className="dbc-stat-divider"></div>
                        <div className="dbc-stat">
                            <span className="dbc-stat-number">3</span>
                            <span className="dbc-stat-label">{t('digiBridge.cta.stat3', 'Държави')}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Decorative Border Lines */}
            <div className="dbc-border-top"></div>
            <div className="dbc-border-bottom"></div>
        </section>
    );
};