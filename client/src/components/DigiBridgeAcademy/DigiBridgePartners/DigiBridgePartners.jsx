import React from 'react';
import { useTranslation } from 'react-i18next';
import './digiBridgePartners.css';

export const DigiBridgePartners = () => {
    const { t } = useTranslation();

    const partners = [
        {
            id: 1,
            name: 'Civic Innovation Fund',
            description: t('digiBridge.partners.cif.description', 'Фонд за граждански иновации - подкрепя проекти за демократично участие'),
            logo: '/images/partners/CIF_logo_white_rgb.png',
            url: 'https://thecivics.eu/',
            type: 'main',
            logoBg: 'dark',
        },
        {
            id: 2,
            name: t('digiBridge.partners.coalition.name', 'Национална коалиция за дигитални умения'),
            description: t('digiBridge.partners.coalition.description', 'Обединява усилията за повишаване на дигиталната грамотност'),
            logo: '/images/partners/logo-coalition-fina.png',
            url: 'https://www.gramoten.li/',
            type: 'main',
            logoBg: 'light',
        },
        {
            id: 3,
            name: 'Austausch',
            description: t('digiBridge.partners.austausch.description', 'Немска организация за международен обмен и сътрудничество'),
            logo: '/images/partners/Logo-austausch.svg',
            url: 'https://austausch.org/',
            type: 'partner',
            logoBg: 'light',
        },
        {
            id: 4,
            name: 'Pensa Foundation',
            description: t('digiBridge.partners.pensa.description', 'Българска фондация за подкрепа на възрастни хора'),
            logo: '/images/homePage/logo-2.png',
            url: 'https://pensa.club/',
            type: 'partner',
            logoBg: 'light',
        },
    ];

    const mainPartners = partners.filter(p => p.type === 'main');
    const otherPartners = partners.filter(p => p.type === 'partner');

    return (
        <section className="dbp-section">
            {/* Background */}
            <div className="dbp-glow dbp-glow--1"></div>
            <div className="dbp-glow dbp-glow--2"></div>

            <div className="dbp-container">
                {/* Header */}
                <div className="dbp-header">
                    <span className="dbp-label">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                            <circle cx="9" cy="7" r="4"/>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                        </svg>
                        {t('digiBridge.partners.label', 'Партньори')}
                    </span>
                    <h2 className="dbp-title">
                        {t('digiBridge.partners.titlePart1', 'Нашите ')}
                        <span className="dbp-title-highlight">
                            {t('digiBridge.partners.titlePart2', 'партньори')}
                        </span>
                    </h2>
                    <p className="dbp-subtitle">
                        {t('digiBridge.partners.subtitle', 'Работим заедно с водещи организации за развитие на дигиталната грамотност')}
                    </p>
                </div>

                {/* Main Partners */}
                <div className="dbp-main">
                    {mainPartners.map((partner) => (
                        <a 
                            key={partner.id}
                            href={partner.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="dbp-card dbp-card--main"
                        >
                            <div className="dbp-card-glow"></div>
                            
                            <div className={`dbp-card-logo ${partner.logoBg === 'dark' ? 'dbp-card-logo--dark' : 'dbp-card-logo--light'}`}>
                                {partner.logo ? (
                                    <img src={partner.logo} alt={partner.name} />
                                ) : (
                                    <span className="dbp-card-logo-text">{partner.name}</span>
                                )}
                            </div>
                            
                            <div className="dbp-card-info">
                                <h3 className="dbp-card-name">{partner.name}</h3>
                                <p className="dbp-card-desc">{partner.description}</p>
                            </div>
                            
                            <div className="dbp-card-arrow">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                                    <polyline points="15 3 21 3 21 9"/>
                                    <line x1="10" y1="14" x2="21" y2="3"/>
                                </svg>
                            </div>
                        </a>
                    ))}
                </div>

                {/* Other Partners */}
                <div className="dbp-other">
                    <h3 className="dbp-other-title">
                        <span className="dbp-other-title-line"></span>
                        {t('digiBridge.partners.projectPartners', 'Проектни партньори')}
                        <span className="dbp-other-title-line"></span>
                    </h3>
                    
                    <div className="dbp-grid">
                        {otherPartners.map((partner) => (
                            <a 
                                key={partner.id}
                                href={partner.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="dbp-card dbp-card--small"
                            >
                                <div className={`dbp-card-logo-small ${partner.logoBg === 'dark' ? 'dbp-card-logo--dark' : 'dbp-card-logo--light'}`}>
                                    {partner.logo ? (
                                        <img src={partner.logo} alt={partner.name} />
                                    ) : (
                                        <span>{partner.name.charAt(0)}</span>
                                    )}
                                </div>
                                
                                <div className="dbp-card-info-small">
                                    <h4 className="dbp-card-name-small">{partner.name}</h4>
                                    <p className="dbp-card-desc-small">{partner.description}</p>
                                </div>
                                
                                <div className="dbp-card-arrow-small">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M5 12h14M12 5l7 7-7 7"/>
                                    </svg>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>

                {/* EU Support Badge */}
                <div className="dbp-eu">
                    <div className="dbp-eu-icon">
                        <img
                            src="/images/partners/logo-eu--en.svg"
                            alt="European Union Logo"
                            className="dbp-eu-logo"
                        />
                    </div>
                    <div className="dbp-eu-content">
                        <h4 className="dbp-eu-title">
                            {t('digiBridge.partners.euSupport.title', 'Финансирано от Европейския съюз')}
                        </h4>
                        <p className="dbp-eu-desc">
                            {t('digiBridge.partners.euSupport.description', 'Този проект е финансиран с подкрепата на Европейската комисия чрез програма CERV.')}
                        </p>
                    </div>
                    <div className="dbp-eu-badge">
                        <span className="dbp-eu-badge-text">CERV</span>
                        <span className="dbp-eu-badge-year">2024-2026</span>
                    </div>
                </div>
            </div>
        </section>
    );
};