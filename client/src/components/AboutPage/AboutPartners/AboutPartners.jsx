// AboutPage/AboutPartners/AboutPartners.jsx

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ExternalLink, Award } from 'lucide-react';
import { partnersData } from '../../Home/PartnersShowcase/partnersData';
import './aboutPartners.css';

export const AboutPartners = () => {
  const { t } = useTranslation();
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
    <section className="abpg-section" ref={sectionRef}>
      <div className="abpg-container">
        {/* Header */}
        <div className={`abpg-header ${isVisible ? 'abpg-visible' : ''}`}>
          <span className="abpg-label">
            {t('partners.label', { defaultValue: 'Партньори' })}
          </span>
          <h2 className="abpg-title">
            {t('partners.aboutTitle', { defaultValue: 'Партньори и подкрепа' })}
          </h2>
          <p className="abpg-description">
            {t('partners.aboutSubtitle', { defaultValue: 'Организациите, които вярват в нашата мисия и ни подкрепят в изграждането на дигитален мост между поколенията' })}
          </p>
        </div>

        {/* Main Partners */}
        <div className={`abpg-main-partners ${isVisible ? 'abpg-visible' : ''}`}>
          {mainPartners.map((partner, index) => (
            
           <a   key={partner.id}
              href={partner.url}
              target="_blank"
              rel="noopener noreferrer"
              className="abpg-main-card"
              style={{ '--abpg-delay': `${index * 0.15}s` }}
            >
              <div className="abpg-main-accent"></div>
              
              <div className="abpg-main-content">
                <div className="abpg-main-left">
                  <div className="abpg-main-badge">
                    <Award size={13} />
                    <span>{t('partners.mainPartner', { defaultValue: 'Главен партньор' })}</span>
                  </div>
                  <div className="abpg-main-logo-wrap">
                    <img src={partner.logo} alt={partner.alt} loading="lazy" />
                  </div>
                </div>

                <div className="abpg-main-right">
                  <h3 className="abpg-main-name">{partner.name}</h3>
                  <p className="abpg-main-desc">
                    {t(partner.descriptionKey, { defaultValue: '' })}
                  </p>
                  <span className="abpg-main-link">
                    {t('partners.visitSite', { defaultValue: 'Посетете сайта' })}
                    <ExternalLink size={14} />
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Standard Partners Grid */}
        <div className={`abpg-grid ${isVisible ? 'abpg-visible' : ''}`}>
          {standardPartners.map((partner, index) => (
            
             <a key={partner.id}
              href={partner.url}
              target="_blank"
              rel="noopener noreferrer"
              className="abpg-card"
              style={{ '--abpg-delay': `${(index + 2) * 0.1}s` }}
            >
              <div className="abpg-card-logo">
                <img src={partner.logo} alt={partner.alt} loading="lazy" />
              </div>
              <div className="abpg-card-info">
                <h4 className="abpg-card-name">{partner.name}</h4>
                <p className="abpg-card-desc">
                  {t(partner.descriptionKey, { defaultValue: '' })}
                </p>
              </div>
              <span className="abpg-card-arrow">
                <ExternalLink size={14} />
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutPartners;