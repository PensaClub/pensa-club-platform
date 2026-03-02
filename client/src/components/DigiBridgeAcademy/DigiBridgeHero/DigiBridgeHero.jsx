import React, { useEffect, useState } from 'react';
import { LocalizedLink as Link } from '../../LocalizedLink/LocalizedLink';
import { useTranslation } from 'react-i18next';
import './digiBridgeHero.css';

export const DigiBridgeHero = () => {
    const { t } = useTranslation('digibridge');
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    return (
        <section className="dbh-hero">
            {/* Tech Grid Background */}
            <div className="dbh-hero-grid"></div>
            
            {/* Glowing Orbs */}
            <div className="dbh-hero-glow dbh-hero-glow--1"></div>
            <div className="dbh-hero-glow dbh-hero-glow--2"></div>
            <div className="dbh-hero-glow dbh-hero-glow--3"></div>

            {/* Floating Particles */}
            <div className="dbh-hero-particles">
                {[...Array(20)].map((_, i) => (
                    <div 
                        key={i} 
                        className="dbh-hero-particle"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${15 + Math.random() * 10}s`
                        }}
                    ></div>
                ))}
            </div>

            <div className="dbh-hero-container">
                {/* Left Content */}
                <div className={`dbh-hero-content ${isVisible ? 'dbh-hero-content--visible' : ''}`}>
                    <div className="dbh-hero-badge">
                        <span className="dbh-hero-badge-icon">🎓</span>
                        <span>{t('digiBridge.hero.badge', 'Безплатно обучение')}</span>
                    </div>
                    
                    <h1 className="dbh-hero-title">
                        {t('digiBridge.hero.titlePart1', 'Дигитална грамотност')}
                        <span className="dbh-hero-title-highlight">
                            {t('digiBridge.hero.titlePart2', ' за всички')}
                        </span>
                    </h1>
                    
                    <p className="dbh-hero-subtitle">
                        {t('digiBridge.hero.subtitle', 'Научете се да използвате технологиите уверено с помощта на наши обучени ментори. Безплатно, достъпно и с много търпение.')}
                    </p>
                    
                    <div className="dbh-hero-actions">
                        <Link to="/academy/courses" className="dbh-hero-btn dbh-hero-btn--primary">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                                <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                            </svg>
                            {t('digiBridge.hero.startLearning', 'Започни обучение')}
                        </Link>
                        <Link to="/academy/become-mentor" className="dbh-hero-btn dbh-hero-btn--outline">
                            {t('digiBridge.hero.becomeMentor', 'Стани ментор')}
                        </Link>
                    </div>

                    {/* Trust Badges */}
                    <div className="dbh-hero-trust">
                        <div className="dbh-hero-trust-item">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                <polyline points="22 4 12 14.01 9 11.01"/>
                            </svg>
                            <span>{t('digiBridge.hero.trust1', '100% Безплатно')}</span>
                        </div>
                        <div className="dbh-hero-trust-item">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                <circle cx="9" cy="7" r="4"/>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                            </svg>
                            <span>{t('digiBridge.hero.trust2', 'Обучени ментори')}</span>
                        </div>
                        <div className="dbh-hero-trust-item">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                            <span>{t('digiBridge.hero.trust3', 'Сигурно и лесно')}</span>
                        </div>
                    </div>
                </div>

                {/* Right Visual */}
                <div className={`dbh-hero-visual ${isVisible ? 'dbh-hero-visual--visible' : ''}`}>
                    <div className="dbh-hero-img-container">
                        <div className="dbh-hero-img-frame">
                            <img 
                                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&q=80" 
                                alt="Digital Learning"
                                className="dbh-hero-img"
                            />
                            <div className="dbh-hero-img-overlay"></div>
                        </div>
                        
                        {/* Floating Cards */}
                        <div className="dbh-hero-float-card dbh-hero-float-card--1">
                            <div className="dbh-hero-float-icon">📱</div>
                            <div className="dbh-hero-float-text">
                                <span className="dbh-hero-float-title">Мобилни устройства</span>
                                <span className="dbh-hero-float-sub">Лесни уроци</span>
                            </div>
                        </div>
                        
                        <div className="dbh-hero-float-card dbh-hero-float-card--2">
                            <div className="dbh-hero-float-icon">🔒</div>
                            <div className="dbh-hero-float-text">
                                <span className="dbh-hero-float-title">Онлайн сигурност</span>
                                <span className="dbh-hero-float-sub">Защитете се</span>
                            </div>
                        </div>
                        
                        <div className="dbh-hero-float-card dbh-hero-float-card--3">
                            <div className="dbh-hero-float-icon">💬</div>
                            <div className="dbh-hero-float-text">
                                <span className="dbh-hero-float-title">Видео разговори</span>
                                <span className="dbh-hero-float-sub">С близките</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Wave */}
            <div className="dbh-hero-wave">
                <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
                    <path d="M0,60 C360,120 1080,0 1440,60 L1440,120 L0,120 Z" fill="#0f172a"/>
                </svg>
            </div>
        </section>
    );
};