import React from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import './eliteMembershipPage.css';

export const EliteMembershipPage = () => {
  const { t } = useTranslation();

  const benefits = [
    {
      icon: '👑',
      title: t('eliteMembership.benefits.exclusive.title'),
      description: t('eliteMembership.benefits.exclusive.description')
    },
    {
      icon: '⚡',
      title: t('eliteMembership.benefits.priority.title'),
      description: t('eliteMembership.benefits.priority.description')
    },
    {
      icon: '💎',
      title: t('eliteMembership.benefits.premium.title'),
      description: t('eliteMembership.benefits.premium.description')
    },
    {
      icon: '🎯',
      title: t('eliteMembership.benefits.personalized.title'),
      description: t('eliteMembership.benefits.personalized.description')
    },
    {
      icon: '🌟',
      title: t('eliteMembership.benefits.special.title'),
      description: t('eliteMembership.benefits.special.description')
    },
    {
      icon: '🔒',
      title: t('eliteMembership.benefits.secure.title'),
      description: t('eliteMembership.benefits.secure.description')
    }
  ];

  const locations = [
    {
      category: t('eliteMembership.locations.healthcare.category'),
      places: [
        t('eliteMembership.locations.healthcare.place1'),
        t('eliteMembership.locations.healthcare.place2'),
        t('eliteMembership.locations.healthcare.place3'),
        t('eliteMembership.locations.healthcare.place4')
      ]
    },
    {
      category: t('eliteMembership.locations.culture.category'),
      places: [
        t('eliteMembership.locations.culture.place1'),
        t('eliteMembership.locations.culture.place2'),
        t('eliteMembership.locations.culture.place3'),
        t('eliteMembership.locations.culture.place4')
      ]
    },
    {
      category: t('eliteMembership.locations.shopping.category'),
      places: [
        t('eliteMembership.locations.shopping.place1'),
        t('eliteMembership.locations.shopping.place2'),
        t('eliteMembership.locations.shopping.place3'),
        t('eliteMembership.locations.shopping.place4')
      ]
    },
    {
      category: t('eliteMembership.locations.recreation.category'),
      places: [
        t('eliteMembership.locations.recreation.place1'),
        t('eliteMembership.locations.recreation.place2'),
        t('eliteMembership.locations.recreation.place3'),
        t('eliteMembership.locations.recreation.place4')
      ]
    }
  ];

  const requirements = [
    t('eliteMembership.requirements.age'),
    t('eliteMembership.requirements.membership'),
    t('eliteMembership.requirements.activity'),
    t('eliteMembership.requirements.recommendation')
  ];

  return (
    <>
      <Helmet>
        <title>{t('eliteMembership.meta.title')} | Pensa Club</title>
        <meta name="description" content={t('eliteMembership.meta.description')} />
        <meta name="keywords" content={t('eliteMembership.meta.keywords')} />
      </Helmet>

      <div className="pec-main-wrapper">
        {/* Hero Section */}
        <section className="pec-hero-section">
          <div className="pec-hero-bg">
            <div className="pec-pattern-overlay"></div>
            <div className="pec-gradient-overlay"></div>
          </div>
          
          <div className="container">
            <div className="pec-hero-content">
              <div className="pec-brand-logo">
                <div className="pec-logo-circle">PE</div>
                <div className="pec-sparkle-icon">✨</div>
              </div>
              
              <h1 className="pec-main-title">
                <span className="pec-title-primary">Pensa Elite</span>
                <span className="pec-title-secondary">Membership</span>
              </h1>
              
              <p className="pec-hero-description">
                {t('eliteMembership.hero.subtitle')}
              </p>

              {/* Coming Soon Badge */}
              <div className="pec-status-badge">
                <div className="pec-badge-emoji">🚀</div>
                <div className="pec-badge-info">
                  <div className="pec-badge-heading">{t('eliteMembership.comingSoon.title')}</div>
                  <div className="pec-badge-subtext">{t('eliteMembership.comingSoon.subtitle')}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Update Notice */}
        <section className="pec-notice-section">
          <div className="container">
            <div className="pec-notification-card">
              <div className="pec-notice-emoji">⚙️</div>
              <div className="pec-notice-details">
                <h3 className="pec-notice-heading">{t('eliteMembership.notice.title')}</h3>
                <p className="pec-notice-message">{t('eliteMembership.notice.text')}</p>
                <div className="pec-timeline-badge">
                  <span className="pec-timeline-label">{t('eliteMembership.notice.timeline')}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="pec-benefits-section">
          <div className="container">
            <div className="pec-section-intro">
              <h2 className="pec-section-heading">{t('eliteMembership.benefits.title')}</h2>
              <p className="pec-section-desc">{t('eliteMembership.benefits.subtitle')}</p>
            </div>

            <div className="pec-benefits-container">
              {benefits.map((benefit, index) => (
                <div key={index} className="pec-benefit-item">
                  <div className="pec-benefit-emoji">{benefit.icon}</div>
                  <h3 className="pec-benefit-heading">{benefit.title}</h3>
                  <p className="pec-benefit-text">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Locations Section */}
        <section className="pec-locations-section">
          <div className="container">
            <div className="pec-section-intro">
              <h2 className="pec-section-heading">{t('eliteMembership.locations.title')}</h2>
              <p className="pec-section-desc">{t('eliteMembership.locations.subtitle')}</p>
            </div>

            <div className="pec-locations-container">
              {locations.map((location, index) => (
                <div key={index} className="pec-location-group">
                  <h3 className="pec-group-title">{location.category}</h3>
                  <ul className="pec-places-collection">
                    {Array.isArray(location.places) ? (
                      location.places.map((place, placeIndex) => (
                        <li key={placeIndex} className="pec-place-entry">
                          <span className="pec-location-pin">📍</span>
                          <span className="pec-place-label">{place}</span>
                        </li>
                      ))
                    ) : (
                      <li className="pec-place-entry">
                        <span className="pec-location-pin">📍</span>
                        <span className="pec-place-label">{location.places}</span>
                      </li>
                    )}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Requirements Section */}
        <section className="pec-requirements-section">
          <div className="container">
            <div className="pec-requirements-layout">
              <div className="pec-requirements-info">
                <h2 className="pec-section-heading">{t('eliteMembership.requirements.title')}</h2>
                <p className="pec-section-desc">{t('eliteMembership.requirements.subtitle')}</p>
                
                <ul className="pec-criteria-list">
                  {requirements.map((requirement, index) => (
                    <li key={index} className="pec-criteria-entry">
                      <span className="pec-checkmark-circle">✓</span>
                      <span className="pec-criteria-label">{requirement}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pec-card-showcase">
                <div className="pec-membership-card">
                  <div className="pec-card-design">
                    <div className="pec-card-chip-element"></div>
                    <div className="pec-card-brand">PE</div>
                    <div className="pec-card-digits">•••• •••• •••• ELITE</div>
                    <div className="pec-cardholder-name">EXCLUSIVE MEMBER</div>
                    <div className="pec-expiry-date">12/27</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Application Section */}
        <section className="pec-application-section">
          <div className="container">
            <div className="pec-application-wrapper">
              <div className="pec-application-intro">
                <h2 className="pec-application-heading">{t('eliteMembership.application.title')}</h2>
                <p className="pec-application-desc">{t('eliteMembership.application.subtitle')}</p>
              </div>

              <div className="pec-process-steps">
                <div className="pec-single-step">
                  <div className="pec-step-counter">1</div>
                  <div className="pec-step-info">
                    <h4 className="pec-step-heading">{t('eliteMembership.application.steps.step1.title')}</h4>
                    <p className="pec-step-details">{t('eliteMembership.application.steps.step1.description')}</p>
                  </div>
                </div>

                <div className="pec-single-step">
                  <div className="pec-step-counter">2</div>
                  <div className="pec-step-info">
                    <h4 className="pec-step-heading">{t('eliteMembership.application.steps.step2.title')}</h4>
                    <p className="pec-step-details">{t('eliteMembership.application.steps.step2.description')}</p>
                  </div>
                </div>

                <div className="pec-single-step">
                  <div className="pec-step-counter">3</div>
                  <div className="pec-step-info">
                    <h4 className="pec-step-heading">{t('eliteMembership.application.steps.step3.title')}</h4>
                    <p className="pec-step-details">{t('eliteMembership.application.steps.step3.description')}</p>
                  </div>
                </div>
              </div>

              <div className="pec-cta-section">
                <button className="pec-apply-button" disabled>
                  <span className="pec-button-emoji">🔒</span>
                  <span className="pec-button-label">{t('eliteMembership.application.comingSoon')}</span>
                </button>
                
                <div className="pec-notification-area">
                  <p className="pec-notify-message">{t('eliteMembership.application.notify.text')}</p>
                  <Link to="/contact" className="pec-notify-cta">
                    {t('eliteMembership.application.notify.link')}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Back to Home */}
        <section className="pec-footer-section">
          <div className="container">
            <Link to="/" className="pec-home-navigation">
              <span className="pec-arrow-back">←</span>
              <span className="pec-nav-label">{t('eliteMembership.backToHome')}</span>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
};

export default EliteMembershipPage;