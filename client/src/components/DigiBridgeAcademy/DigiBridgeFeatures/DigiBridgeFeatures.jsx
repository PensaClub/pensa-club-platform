import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './digiBridgeFeatures.css';

export const DigiBridgeFeatures = () => {
    const { t } = useTranslation();

    const features = [
        {
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                    <path d="M8 7h8M8 11h6M8 15h4"/>
                </svg>
            ),
            title: t('digiBridge.features.courses.title', 'Курсове'),
            description: t('digiBridge.features.courses.description', 'Структурирани уроци по дигитална грамотност за всички нива'),
            link: '/academy/courses',
            color: '#6366f1',
        },
        {
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
            ),
            title: t('digiBridge.features.mentors.title', 'Ментори'),
            description: t('digiBridge.features.mentors.description', 'Обучени млади хора, готови да помогнат с търпение'),
            link: '/academy/mentors',
            color: '#0ea5e9',
        },
        {
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                    <line x1="8" y1="21" x2="16" y2="21"/>
                    <line x1="12" y1="17" x2="12" y2="21"/>
                    <path d="M6 8h.01M9 8h.01"/>
                </svg>
            ),
            title: t('digiBridge.features.events.title', 'Лекции'),
            description: t('digiBridge.features.events.description', 'Живи и записани лекции по актуални теми'),
            link: '/academy/lectures',
            color: '#8b5cf6',
        },
        {
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                </svg>
            ),
            title: t('digiBridge.features.library.title', 'Библиотека'),
            description: t('digiBridge.features.library.description', 'Ресурси и материали за самостоятелно учене'),
            link: '/academy/library',
            color: '#10b981',
        },
    ];

    return (
        <section className="dbf-section">
            {/* Background */}
            <div className="dbf-glow dbf-glow--1"></div>
            <div className="dbf-glow dbf-glow--2"></div>

            <div className="dbf-container">
                {/* Header */}
                <div className="dbf-header">
                    <span className="dbf-label">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polygon points="12 2 2 7 12 12 22 7 12 2"/>
                            <polyline points="2 17 12 22 22 17"/>
                            <polyline points="2 12 12 17 22 12"/>
                        </svg>
                        {t('digiBridge.features.label', 'Възможности')}
                    </span>
                    <h2 className="dbf-title">
                        {t('digiBridge.features.titlePart1', 'Какво ')}
                        <span className="dbf-title-highlight">
                            {t('digiBridge.features.titlePart2', 'предлагаме')}
                        </span>
                    </h2>
                    <p className="dbf-subtitle">
                        {t('digiBridge.features.subtitle', 'Разнообразни ресурси и инструменти за вашето дигитално обучение')}
                    </p>
                </div>

                {/* Features Grid */}
                <div className="dbf-grid">
                    {features.map((feature, index) => (
                        <Link 
                            key={index} 
                            to={feature.link} 
                            className="dbf-card"
                            style={{ '--card-color': feature.color }}
                        >
                            {/* Glow effect on hover */}
                            <div className="dbf-card-glow"></div>
                            
                            {/* Icon */}
                            <div className="dbf-card-icon">
                                {feature.icon}
                            </div>

                            {/* Content */}
                            <div className="dbf-card-content">
                                <h3 className="dbf-card-title">{feature.title}</h3>
                                <p className="dbf-card-desc">{feature.description}</p>
                            </div>

                            {/* Arrow */}
                            <div className="dbf-card-arrow">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M5 12h14M12 5l7 7-7 7"/>
                                </svg>
                            </div>

                            {/* Corner decoration */}
                            <div className="dbf-card-corner"></div>
                        </Link>
                    ))}
                </div>

                {/* Bottom Stats */}
                <div className="dbf-stats">
                    <div className="dbf-stat">
                        <span className="dbf-stat-number">100%</span>
                        <span className="dbf-stat-label">{t('digiBridge.features.stat1', 'Безплатно')}</span>
                    </div>
                    <div className="dbf-stat-divider"></div>
                    <div className="dbf-stat">
                        <span className="dbf-stat-number">24/7</span>
                        <span className="dbf-stat-label">{t('digiBridge.features.stat2', 'Достъпно')}</span>
                    </div>
                    <div className="dbf-stat-divider"></div>
                    <div className="dbf-stat">
                        <span className="dbf-stat-number">3</span>
                        <span className="dbf-stat-label">{t('digiBridge.features.stat3', 'Езика')}</span>
                    </div>
                </div>
            </div>
        </section>
    );
};