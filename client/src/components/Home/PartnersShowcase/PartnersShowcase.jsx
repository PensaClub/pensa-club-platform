// Home/PartnersShowcase/PartnersShowcase.jsx

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Crown, ExternalLink } from 'lucide-react';
import { partnersData } from './partnersData';
import './partnersShowcase.css';

export const PartnersShowcase = () => {
  const { t } = useTranslation('home');
  const sectionRef = useRef(null);
  const marqueeRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const mainPartners = partnersData.filter(p => p.tier === 'main');
  const allPartners = partnersData;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section className="pshw-section" ref={sectionRef}>
      {/* Background decorations */}
      <div className="pshw-bg">
        <div className="pshw-dot-pattern"></div>
        <div className="pshw-blob pshw-blob-1"></div>
        <div className="pshw-blob pshw-blob-2"></div>
      </div>

      <div className="pshw-container">
        {/* Header */}
        <div className={`pshw-header ${isVisible ? 'pshw-visible' : ''}`}>
          <span className="pshw-label">{t('partners.label', { defaultValue: 'Партньори' })}</span>
          <h2 className="pshw-title">
            {t('partners.title', { defaultValue: 'Нашите партньори' })}
          </h2>
          <p className="pshw-subtitle">
            {t('partners.subtitle', { defaultValue: 'Заедно изграждаме мост между поколенията в дигиталния свят' })}
          </p>
        </div>

        {/* Spotlight - Main Partners */}
        <div className={`pshw-spotlight ${isVisible ? 'pshw-visible' : ''}`}>
          {mainPartners.map((partner, index) => (
            
             <a key={partner.id}
              href={partner.url}
              target="_blank"
              rel="noopener noreferrer"
              className="pshw-spotlight-card"
              style={{ '--pshw-delay': `${index * 0.2}s` }}
            >
              <div className="pshw-spotlight-shimmer"></div>
              {/* <div className="pshw-spotlight-border"></div> */}

              <div className="pshw-spotlight-inner">
                <div className="pshw-spotlight-badge">
                  <Crown size={14} />
                  <span>{t('partners.mainPartner', { defaultValue: 'Главен партньор' })}</span>
                </div>

                <div className="pshw-spotlight-logo-wrap">
                  <img
                    src={partner.logo}
                    alt={partner.alt}
                    className="pshw-spotlight-logo"
                    loading="lazy"
                    decoding="async"
                  />
                </div>

                <h3 className="pshw-spotlight-name">{partner.name}</h3>
                <p className="pshw-spotlight-desc">
                  {t(partner.descriptionKey, { defaultValue: '' })}
                </p>

                <span className="pshw-spotlight-link">
                  {t('partners.visitSite', { defaultValue: 'Посетете сайта' })}
                  <ExternalLink size={14} />
                </span>
              </div>
            </a>
          ))}
        </div>

        {/* Marquee - All Partners */}
        <div
          className={`pshw-marquee-wrapper ${isVisible ? 'pshw-visible' : ''}`}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="pshw-marquee-fade pshw-marquee-fade-left"></div>
          <div className="pshw-marquee-fade pshw-marquee-fade-right"></div>

          <div
            className={`pshw-marquee-track ${isPaused ? 'pshw-paused' : ''}`}
            ref={marqueeRef}
          >
            {[...allPartners, ...allPartners].map((partner, index) => (
              
                <a key={`${partner.id}-${index}`}
                href={partner.url}
                target="_blank"
                rel="noopener noreferrer"
                className="pshw-marquee-item"
                title={partner.name}
              >
                <img
                  src={partner.logo}
                  alt={partner.alt}
                  className="pshw-marquee-logo"
                  loading="lazy"
                  decoding="async"
                />
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};