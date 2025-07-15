import React from 'react';
import { useTranslation } from 'react-i18next';
import './sponsorsPartners.css';

export const SponsorsPartners = ({ sponsors = [], partners = [] }) => {
    const { t } = useTranslation();

    // Проверка дали има данни
    const hasSponsors = sponsors && sponsors.length > 0 && sponsors.some(sponsor => sponsor.visible !== false);
    const hasPartners = partners && partners.length > 0 && partners.some(partner => partner.visible !== false);

    if (!hasSponsors && !hasPartners) {
        return null;
    }

    const visibleSponsors = sponsors.filter(sponsor => sponsor.visible !== false);
    const visiblePartners = partners.filter(partner => partner.visible !== false);

    return (
        <div className="sponsors-partners-component">
            <div className="sponsors-partners-container">
                
                {/* Sponsors Section */}
                {hasSponsors && (
                    <div className="sponsors-section">
                        <h3 className="sponsors-partners-subtitle">
                            <span className="subtitle-icon">💰</span>
                            {t('projectView.sponsorsPartners.sponsors')}
                        </h3>
                        
                        <div className="sponsors-grid">
                            {visibleSponsors.map((sponsor, index) => (
                                <div key={sponsor.id || index} className="sponsor-card">
                                    {sponsor.logo && (
                                        <div className="sponsor-logo">
                                            <img 
                                                src={sponsor.logo} 
                                                alt={sponsor.name}
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'flex';
                                                }}
                                            />
                                            <div className="sponsor-logo-fallback" style={{display: 'none'}}>
                                                <span className="logo-initials">
                                                    {sponsor.name.split(' ').map(n => n[0]).join('')}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div className="sponsor-content">
                                        <h4 className="sponsor-name">{sponsor.name}</h4>
                                        
                                        {sponsor.type && (
                                            <span className="sponsor-type">{sponsor.type}</span>
                                        )}
                                        
                                        {sponsor.amount && (
                                            <div className="sponsor-amount">
                                                <span className="amount-icon">💵</span>
                                                <span className="amount-value">
                                                    {parseInt(sponsor.amount).toLocaleString()} {sponsor.currency || 'BGN'}
                                                </span>
                                            </div>
                                        )}
                                        
                                        {sponsor.website && (
                                            <a 
                                                href={sponsor.website} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="sponsor-website"
                                            >
                                                <span className="website-icon">🌐</span>
                                                {t('projectView.sponsorsPartners.visitWebsite')}
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Partners Section */}
                {hasPartners && (
                    <div className="partners-section">
                        <h3 className="sponsors-partners-subtitle">
                            <span className="subtitle-icon">🤝</span>
                            {t('projectView.sponsorsPartners.partners')}
                        </h3>
                        
                        <div className="partners-grid">
                            {visiblePartners.map((partner, index) => (
                                <div key={partner.id || index} className="partner-card">
                                    {partner.logo && (
                                        <div className="partner-logo">
                                            <img 
                                                src={partner.logo} 
                                                alt={partner.name}
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'flex';
                                                }}
                                            />
                                            <div className="partner-logo-fallback" style={{display: 'none'}}>
                                                <span className="logo-initials">
                                                    {partner.name.split(' ').map(n => n[0]).join('')}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div className="partner-content">
                                        <h4 className="partner-name">{partner.name}</h4>
                                        
                                        {partner.type && (
                                            <span className="partner-type">{partner.type}</span>
                                        )}
                                        
                                        {partner.description && (
                                            <p className="partner-description">{partner.description}</p>
                                        )}
                                        
                                        {partner.website && (
                                            <a 
                                                href={partner.website} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="partner-website"
                                            >
                                                <span className="website-icon">🌐</span>
                                                {t('projectView.sponsorsPartners.visitWebsite')}
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};