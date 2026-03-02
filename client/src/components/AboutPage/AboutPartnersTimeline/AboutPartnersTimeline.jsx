// AboutPage/AboutPartnersTimeline/AboutPartnersTimeline.jsx

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ExternalLink, Award, Star } from 'lucide-react';
import { partnersData } from '../../Home/PartnersShowcase/partnersData';
import './aboutPartnersTimeline.css';

export const AboutPartnersTimeline = () => {
  const { t } = useTranslation('home');
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [visibleNodes, setVisibleNodes] = useState(new Set());
  const nodeRefs = useRef([]);

  // Main първи, после standard
  const orderedPartners = [
    ...partnersData.filter(p => p.tier === 'main'),
    ...partnersData.filter(p => p.tier === 'standard')
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.05 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => {
      if (sectionRef.current) observer.unobserve(sectionRef.current);
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const index = entry.target.dataset.index;
            setVisibleNodes(prev => new Set([...prev, index]));
          }
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -50px 0px' }
    );

    nodeRefs.current.forEach(ref => {
      if (ref) observer.observe(ref);
    });

    return () => {
      nodeRefs.current.forEach(ref => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, [isVisible]);

  return (
    <section className="abtl-section" ref={sectionRef}>
      <div className="abtl-container">
        {/* Header */}
        <div className={`abtl-header ${isVisible ? 'abtl-visible' : ''}`}>
          <span className="abtl-label">
            {t('partners.label', { defaultValue: 'Партньори' })}
          </span>
          <h2 className="abtl-title">
            {t('partners.aboutTitle', { defaultValue: 'Партньори и подкрепа' })}
          </h2>
          <p className="abtl-description">
            {t('partners.aboutSubtitle', { defaultValue: 'Организациите, които вярват в нашата мисия и ни подкрепят в изграждането на дигитален мост между поколенията' })}
          </p>
        </div>

        {/* Timeline */}
        <div className="abtl-timeline">
          <div className="abtl-line"></div>

          {orderedPartners.map((partner, index) => {
            const isMain = partner.tier === 'main';
            const side = index % 2 === 0 ? 'left' : 'right';
            const nodeVisible = visibleNodes.has(String(index));

            return (
              <div
                key={partner.id}
                className={`abtl-node abtl-node-${side} ${isMain ? 'abtl-node-main' : ''} ${nodeVisible ? 'abtl-node-visible' : ''}`}
                ref={el => nodeRefs.current[index] = el}
                data-index={index}
              >
                {/* Marker on the line */}
                <div className={`abtl-marker ${isMain ? 'abtl-marker-main' : ''}`}>
                  <div className="abtl-marker-dot">
                    {isMain ? <Award size={14} /> : <Star size={10} />}
                  </div>
                  {isMain && <div className="abtl-marker-ring"></div>}
                </div>

                {/* Connector line */}
                <div className="abtl-connector"></div>

                {/* Card */}
                
                 <a href={partner.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`abtl-card ${isMain ? 'abtl-card-main' : ''}`}
                >
                  {isMain && <div className="abtl-card-accent"></div>}

                  <div className="abtl-card-inner">
                    {isMain && (
                      <span className="abtl-badge">
                        <Award size={12} />
                        {t('partners.mainPartner', { defaultValue: 'Главен партньор' })}
                      </span>
                    )}

                    <div className="abtl-card-logo">
                      <img src={partner.logo} alt={partner.alt} loading="lazy" />
                    </div>

                    <h3 className="abtl-card-name">{partner.name}</h3>

                    <p className="abtl-card-desc">
                      {t(partner.descriptionKey, { defaultValue: '' })}
                    </p>

                    <span className="abtl-card-link">
                      {t('partners.visitSite', { defaultValue: 'Посетете сайта' })}
                      <ExternalLink size={13} />
                    </span>
                  </div>
                </a>
              </div>
            );
          })}

          {/* End dot */}
          <div className={`abtl-end-dot ${isVisible ? 'abtl-visible' : ''}`}></div>
        </div>
      </div>
    </section>
  );
};

export default AboutPartnersTimeline;