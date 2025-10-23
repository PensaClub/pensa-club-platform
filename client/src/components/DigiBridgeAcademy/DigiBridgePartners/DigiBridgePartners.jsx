import React from 'react';
import { useTranslation } from 'react-i18next';
import './digiBridgePartners.css';

export const DigiBridgePartners = () => {
    const { t } = useTranslation();

    const partners = [
        {
            id: 1,
            name: 'Civic Innovation Fund',
            description: t('digiBridge.partners.cif.description'),
            logo: '/images/partners/CIF_logo_white_rgb.png',
            url: 'https://thecivics.eu/',
            type: 'main',
            bgColor: '#1a1a2e', // Тъмен фон за белото CIF лого
        },
        {
            id: 2,
            name: t('digiBridge.partners.coalition.name'),
            description: t('digiBridge.partners.coalition.description'),
            logo: '/images/partners/logo-coalition-fina.png',
            url: 'https://www.gramoten.li/',
            type: 'main',
            bgColor: '#ffffff', // Бял фон за цветното лого
        },
        {
            id: 3,
            name: 'Austausch',
            description: t('digiBridge.partners.austausch.description'),
            logo: '/images/partners/Logo-austausch.svg',
            url: 'https://austausch.org/',
            type: 'partner',
            bgColor: '#ffffff',
        },
        {
            id: 4,
            name: 'Pensa Foundation',
            description: t('digiBridge.partners.pensa.description'),
            logo: '/images/homePage/logo-2.png',
            url: 'https://pensa.club/',
            type: 'partner',
            bgColor: '#ffffff',
        },
    ];

    const mainPartners = partners.filter(p => p.type === 'main');
    const otherPartners = partners.filter(p => p.type === 'partner');

    return (
        <section className="digibridge-partners">
            <div className="digibridge-partners-container">

                {/* Header */}
                <div className="digibridge-partners-header">
                    <span className="digibridge-partners-label">
                        {t('digiBridge.partners.label')}
                    </span>
                    <h2 className="digibridge-partners-title">
                        {t('digiBridge.partners.title')}
                    </h2>
                    <p className="digibridge-partners-subtitle">
                        {t('digiBridge.partners.subtitle')}
                    </p>
                </div>

                {/* Main Partners */}
                <div className="digibridge-partners-main">
                    {mainPartners.map((partner) => (

                        <a key={partner.id}
                            href={partner.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="digibridge-partners-card digibridge-partners-card-main"
                        >
                            <div
                                className="digibridge-partners-logo-wrapper"
                                style={{ backgroundColor: partner.bgColor }}
                            >
                                {partner.logo ? (
                                    <img
                                        src={partner.logo}
                                        alt={partner.name}
                                        className="digibridge-partners-logo"
                                    />
                                ) : (
                                    <div className="digibridge-partners-logo-placeholder">
                                        {partner.name}
                                    </div>
                                )}
                            </div>
                            <div className="digibridge-partners-info">
                                <h3 className="digibridge-partners-name">{partner.name}</h3>
                                <p className="digibridge-partners-description">{partner.description}</p>
                            </div>
                            <div className="digibridge-partners-link-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                    <polyline points="15 3 21 3 21 9" />
                                    <line x1="10" y1="14" x2="21" y2="3" />
                                </svg>
                            </div>
                        </a>
                    ))}
                </div>

                {/* Other Partners */}
                <div className="digibridge-partners-other">
                    <h3 className="digibridge-partners-section-title">
                        {t('digiBridge.partners.projectPartners')}
                    </h3>
                    <div className="digibridge-partners-grid">
                        {otherPartners.map((partner) => (

                            <a key={partner.id}
                                href={partner.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="digibridge-partners-card digibridge-partners-card-small"
                            >
                                <div
                                    className="digibridge-partners-logo-wrapper-small"
                                    style={{ backgroundColor: partner.bgColor }}
                                >
                                    {partner.logo ? (
                                        <img
                                            src={partner.logo}
                                            alt={partner.name}
                                            className="digibridge-partners-logo-small"
                                        />
                                    ) : (
                                        <div className="digibridge-partners-logo-placeholder-small">
                                            {partner.name.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div className="digibridge-partners-info-small">
                                    <h4 className="digibridge-partners-name-small">{partner.name}</h4>
                                    <p className="digibridge-partners-description-small">{partner.description}</p>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>

                {/* EU Support Badge */}
                <div className="digibridge-partners-eu-badge">
                    <img
                        src="/images/partners/logo-eu--en.svg"
                        alt="European Union Logo"
                        className="digibridge-partners-eu-logo"
                    />
                    <div className="digibridge-partners-eu-text">
                        <p className="digibridge-partners-eu-title">{t('digiBridge.partners.euSupport.title')}</p>
                        <p className="digibridge-partners-eu-description">{t('digiBridge.partners.euSupport.description')}</p>
                    </div>
                </div>

            </div>
        </section>
    );
};