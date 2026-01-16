import React from 'react';
import { useTranslation } from 'react-i18next';
import './digiBridgeHowItWorks.css';

export const DigiBridgeHowItWorks = () => {
    const { t } = useTranslation();

    const steps = [
        {
            number: '01',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
            ),
            title: t('digiBridge.howItWorks.step1.title', 'Регистрирайте се'),
            description: t('digiBridge.howItWorks.step1.description', 'Създайте безплатен профил за минути'),
            color: '#6366f1'
        },
        {
            number: '02',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                    <path d="M8 7h8M8 11h6"/>
                </svg>
            ),
            title: t('digiBridge.howItWorks.step2.title', 'Изберете курс'),
            description: t('digiBridge.howItWorks.step2.description', 'Разгледайте нашите безплатни курсове'),
            color: '#0ea5e9'
        },
        {
            number: '03',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
            ),
            title: t('digiBridge.howItWorks.step3.title', 'Свържете се с ментор'),
            description: t('digiBridge.howItWorks.step3.description', 'Намерете вашия перфектен ментор'),
            color: '#8b5cf6'
        },
        {
            number: '04',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
            ),
            title: t('digiBridge.howItWorks.step4.title', 'Учете и растете'),
            description: t('digiBridge.howItWorks.step4.description', 'Развийте дигиталните си умения'),
            color: '#10b981'
        },
    ];

    return (
        <section className="dbhiw-section">
            {/* Background Elements */}
            <div className="dbhiw-grid"></div>
            <div className="dbhiw-glow dbhiw-glow--1"></div>
            <div className="dbhiw-glow dbhiw-glow--2"></div>

            <div className="dbhiw-container">
                {/* Header */}
                <div className="dbhiw-header">
                    <span className="dbhiw-label">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12 6 12 12 16 14"/>
                        </svg>
                        {t('digiBridge.howItWorks.label', 'Процес')}
                    </span>
                    <h2 className="dbhiw-title">
                        {t('digiBridge.howItWorks.titlePart1', 'Как ')}
                        <span className="dbhiw-title-highlight">
                            {t('digiBridge.howItWorks.titlePart2', 'работи')}
                        </span>
                        {t('digiBridge.howItWorks.titlePart3', '?')}
                    </h2>
                    <p className="dbhiw-subtitle">
                        {t('digiBridge.howItWorks.subtitle', 'Четири прости стъпки към дигиталната грамотност')}
                    </p>
                </div>

                {/* Steps */}
                <div className="dbhiw-steps">
                    {/* Connection Line */}
                    <div className="dbhiw-line">
                        <div className="dbhiw-line-progress"></div>
                    </div>

                    {steps.map((step, index) => (
                        <div 
                            key={index} 
                            className="dbhiw-step"
                            style={{ '--step-color': step.color }}
                        >
                            {/* Step Number Badge */}
                            <div className="dbhiw-step-number">
                                <span>{step.number}</span>
                            </div>

                            {/* Icon */}
                            <div className="dbhiw-step-icon">
                                {step.icon}
                            </div>

                            {/* Content */}
                            <div className="dbhiw-step-content">
                                <h3 className="dbhiw-step-title">{step.title}</h3>
                                <p className="dbhiw-step-desc">{step.description}</p>
                            </div>

                            {/* Decorative dot */}
                            <div className="dbhiw-step-dot"></div>
                        </div>
                    ))}
                </div>

                {/* Bottom CTA */}
                <div className="dbhiw-cta">
                    <p className="dbhiw-cta-text">
                        {t('digiBridge.howItWorks.ctaText', 'Готови ли сте да започнете?')}
                    </p>
                    <a href="/academy/courses" className="dbhiw-cta-btn">
                        {t('digiBridge.howItWorks.ctaButton', 'Започнете сега')}
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                    </a>
                </div>
            </div>
        </section>
    );
};