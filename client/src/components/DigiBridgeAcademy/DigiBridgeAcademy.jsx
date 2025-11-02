import React, { useEffect, useState } from 'react';
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
import { useAcademy } from '../contexts/AcademyProvider';

export const DigiBridgeAcademy = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { fetchStats } = useAcademy(); 

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const data = await fetchStats(); 
       
        setStats(data);
      } catch (error) {
        console.error('Error fetching academy stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [fetchStats]);

  return (
    <HelmetProvider>
      <div className="digibridge-academy-wrapper">
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

        <DigiBridgeAbout stats={stats} loading={loading} />
        <DigiBridgeHowItWorks />
        <DigiBridgeFeatures />
        <DigiBridgeMentors stats={stats} loading={loading} />
        <DigiBridgeTestimonials />
        <DigiBridgeCTA />
        <DigiBridgePartners />
        <DigiBridgeFAQ />
        <DigiBridgeTestimonialForm />
      </div>
    </HelmetProvider>
  );
};