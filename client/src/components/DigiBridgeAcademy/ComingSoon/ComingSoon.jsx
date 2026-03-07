import React from 'react';
import { useTranslation } from 'react-i18next';
import { LocalizedLink as Link } from '../../LocalizedLink/LocalizedLink';
import { TextZoom } from '../../TextZoom/TextZoom';
import './comingSoon.css';

const ComingSoon = ({ pageKey }) => {
    const { t } = useTranslation('digibridge');
    const pageName = pageKey ? t(`digiBridge.header.nav.${pageKey}`) : '';

    return (
        <div className="dbcs-wrapper">
            <TextZoom />
            <div className="dbcs-grid-pattern" />
            <div className="dbcs-glow dbcs-glow--1" />
            <div className="dbcs-glow dbcs-glow--2" />
            <div className="dbcs-glow dbcs-glow--3" />

            <div className="dbcs-content">
                {pageName && <span className="dbcs-page-label">{pageName}</span>}

                <div className="dbcs-icon-container">
                    <div className="dbcs-icon-ring dbcs-icon-ring--outer" />
                    <div className="dbcs-icon-ring dbcs-icon-ring--inner" />
                    <div className="dbcs-icon">
                        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M32 8C18.745 8 8 18.745 8 32s10.745 24 24 24 24-10.745 24-24S45.255 8 32 8z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                            <path d="M32 16v16l11 6.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                </div>

                <h1 className="dbcs-title">
                    {t('comingSoon.title')}
                </h1>
                <p className="dbcs-subtitle">
                    {t('comingSoon.subtitle')}
                </p>

                <div className="dbcs-actions">
                    <Link to="/academy" className="dbcs-btn dbcs-btn--primary">
                        {t('comingSoon.backToAcademy')}
                    </Link>
                </div>

                <p className="dbcs-stay-tuned">{t('comingSoon.stayTuned')}</p>
                <div className="dbcs-dots">
                    <span className="dbcs-dot" />
                    <span className="dbcs-dot" />
                    <span className="dbcs-dot" />
                </div>
            </div>
        </div>
    );
};

export default ComingSoon;
