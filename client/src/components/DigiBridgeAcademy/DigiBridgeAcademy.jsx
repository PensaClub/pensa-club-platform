import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { DigiBridgeHeader } from './DigiBridgeHeader/DigiBridgeHeader';
import { DigiBridgeHero } from './DigiBridgeHero/DigiBridgeHero';
import './digiBridgeAcademy.css';
import { DigiBridgeAbout } from './DigiBridgeAbout/DigiBridgeAbout';
import { DigiBridgeHowItWorks } from './DigiBridgeHowItWorks/DigiBridgeHowItWorks';
import { DigiBridgeFeatures } from './DigiBridgeFeatures/DigiBridgeFeatures';
import { DigiBridgeMentors } from './DigiBridgeMentors/DigiBridgeMentors';
import { DigiBridgeTestimonials } from './DigiBridgeTestimonials/DigiBridgeTestimonials';
import { DigiBridgeCTA } from './DigiBridgeCTA/DigiBridgeCTA';
import { DigiBridgePartners } from './DigiBridgePartners/DigiBridgePartners';
import { DigiBridgeFAQ } from './DigiBridgeFAQ/DigiBridgeFAQ';
import { DigiBridgeTestimonialForm } from './DigiBridgeTestimonialForm/DigiBridgeTestimonialForm';

export const DigiBridgeAcademy = () => {
  const { t } = useTranslation();
  const location = useLocation();

  // Scroll to top при навигация
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <HelmetProvider>
      <div className="digibridge-academy-wrapper">
        {/* SEO Meta Tags */}
        <Helmet>
          <title>{t('digiBridge.meta.title')}</title>
          <meta name="description" content={t('digiBridge.meta.description')} />
          <meta name="keywords" content={t('digiBridge.meta.keywords')} />
          <meta property="og:title" content={t('digiBridge.meta.title')} />
          <meta property="og:description" content={t('digiBridge.meta.description')} />
          <meta property="og:type" content="website" />
          <meta name="twitter:card" content="summary_large_image" />
          <link rel="canonical" href="https://pensa.club/academy" />
        </Helmet>

        <DigiBridgeHeader />
        <DigiBridgeHero />

        <DigiBridgeAbout />
        <DigiBridgeHowItWorks />
        <DigiBridgeFeatures />
        <DigiBridgeMentors />
        <DigiBridgeTestimonials />
        <DigiBridgeCTA />
        <DigiBridgePartners />
        <DigiBridgeFAQ />
        <DigiBridgeTestimonialForm />
      </div>
    </HelmetProvider>
  );
};