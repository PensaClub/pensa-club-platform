// AboutPage/AboutPartnersCards/AboutPartnersCards.jsx

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ExternalLink, Award, Sparkles } from 'lucide-react';
import { partnersData } from '../../Home/PartnersShowcase/partnersData';
import './aboutPartnersCards.css';

export const AboutPartnersCards = () => {
    const { t } = useTranslation('home');
    const sectionRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    const mainPartners = partnersData.filter(p => p.tier === 'main');
    const standardPartners = partnersData.filter(p => p.tier === 'standard');

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) setIsVisible(true);
            },
            { threshold: 0.1 }
        );

        if (sectionRef.current) observer.observe(sectionRef.current);
        return () => {
            if (sectionRef.current) observer.unobserve(sectionRef.current);
        };
    }, []);

    return (
        <section className="abpc-section" ref={sectionRef}>
            <div className="abpc-container">
                {/* Header */}
                <div className={`abpc-header ${isVisible ? 'abpc-visible' : ''}`}>
                    <span className="abpc-label">
                        {t('partners.label', { defaultValue: 'Партньори' })}
                    </span>
                    <h2 className="abpc-title">
                        {t('partners.aboutTitle', { defaultValue: 'Партньори и подкрепа' })}
                    </h2>
                    <p className="abpc-description">
                        {t('partners.aboutSubtitle', { defaultValue: 'Организациите, които вярват в нашата мисия и ни подкрепят в изграждането на дигитален мост между поколенията' })}
                    </p>
                </div>

                {/* Bento Grid */}
                <div className={`abpc-bento ${isVisible ? 'abpc-visible' : ''}`}>

                    {/* Main Partners — large cells */}
                    {mainPartners.map((partner, index) => (

                        <a key={partner.id}
                            href={partner.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="abpc-cell abpc-cell-main"
                            style={{ '--abpc-delay': `${index * 0.12}s` }}
                        >
                            <div className="abpc-cell-bg"></div>
                            <div className="abpc-cell-shine"></div>

                            <div className="abpc-cell-content">
                                <span className="abpc-main-badge">
                                    <Award size={12} />
                                    {t('partners.mainPartner', { defaultValue: 'Главен партньор' })}
                                </span>

                                <div className="abpc-cell-logo abpc-cell-logo-main">
                                    <img src={partner.logo} alt={partner.alt} loading="lazy" />
                                </div>

                                <h3 className="abpc-cell-name abpc-cell-name-main">{partner.name}</h3>

                                <p className="abpc-cell-desc">
                                    {t(partner.descriptionKey, { defaultValue: '' })}
                                </p>

                                <span className="abpc-cell-link">
                                    {t('partners.visitSite', { defaultValue: 'Посетете сайта' })}
                                    <ExternalLink size={13} />
                                </span>
                            </div>

                            <div className="abpc-cell-corner abpc-cell-corner-tl"></div>
                            <div className="abpc-cell-corner abpc-cell-corner-br"></div>
                        </a>
                    ))}

                    {/* Standard Partners — compact cells */}
                    {standardPartners.map((partner, index) => (

                        <a key={partner.id}
                            href={partner.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="abpc-cell abpc-cell-standard"
                            style={{ '--abpc-delay': `${(index + 2) * 0.08}s` }}
                        >
                            <div className="abpc-cell-content">
                                <div className="abpc-cell-logo">
                                    <img src={partner.logo} alt={partner.alt} loading="lazy" />
                                </div>

                                <h4 className="abpc-cell-name">{partner.name}</h4>

                                {/* Hover overlay with description */}
                                <div className="abpc-cell-overlay">
                                    <Sparkles size={16} className="abpc-overlay-icon" />
                                    <p className="abpc-overlay-desc">
                                        {t(partner.descriptionKey, { defaultValue: '' })}
                                    </p>
                                    <span className="abpc-overlay-link">
                                        {t('partners.visitSite', { defaultValue: 'Посетете сайта' })}
                                        <ExternalLink size={12} />
                                    </span>
                                </div>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default AboutPartnersCards;