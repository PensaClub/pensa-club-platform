import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useReAction } from '../contexts/ReActionProvider';
import { useTheme } from '../contexts/ThemeContext';
import { TextZoom } from '../TextZoom/TextZoom';
import SEOHead from '../SEO/SEOHead';
import ReActionHero from './ReActionHero/ReActionHero';
import ReActionBookingForm from './ReActionBookingForm/ReActionBookingForm';
import ReActionHowItWorks from './ReActionHowItWorks/ReActionHowItWorks';
import ReActionFAQ from './ReActionFAQ/ReActionFAQ';
import ReActionTestimonials from './ReActionTestimonials/ReActionTestimonials';
import ReActionPartners from './ReActionPartners/ReActionPartners';
import './reActionProgram.css';

const ReActionProgram = () => {
  const { t } = useTranslation('reaction');
  const location = useLocation();
  const { getPublicStats, getTestimonials } = useReAction();
  const { theme, toggleTheme } = useTheme();
  const prevThemeRef = useRef(theme);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Default to light theme on this page
  useEffect(() => {
    const isRefresh = localStorage.getItem('rap-page-active') === 'true';

    if (!isRefresh) {
      localStorage.setItem('rap-prev-theme', theme);
      const savedRapTheme = localStorage.getItem('rap-theme') || 'light';
      localStorage.setItem('rap-theme', savedRapTheme);
      if (theme !== savedRapTheme) {
        toggleTheme();
      }
    }
    localStorage.setItem('rap-page-active', 'true');

    return () => {
      localStorage.removeItem('rap-page-active');
      const prevTheme = localStorage.getItem('rap-prev-theme');
      if (prevTheme) {
        localStorage.removeItem('rap-prev-theme');
        const currentTheme = document.documentElement.getAttribute('data-theme');
        if (currentTheme !== prevTheme) {
          toggleTheme();
        }
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Track theme changes while on page
  useEffect(() => {
    if (localStorage.getItem('rap-page-active') === 'true') {
      localStorage.setItem('rap-theme', theme);
    }
  }, [theme]);

  const [stats, setStats] = useState(null);
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    const loadInitialData = async () => {
      const [statsData, testimonialsData] = await Promise.all([
        getPublicStats(),
        getTestimonials(),
      ]);
      setStats(statsData);
      setTestimonials(testimonialsData);
    };
    loadInitialData();
  }, []);

  return (
    <div className="rap">
      <SEOHead
        title={t('seo.title')}
        description={t('seo.description')}
        keywords={t('seo.keywords')}
        image="/images/partners/BFFW-20Logo-Prink2.svg"
      />
      <TextZoom />
      <ReActionHero stats={stats} />
      <ReActionBookingForm />
      <ReActionHowItWorks />
      <ReActionFAQ />
      <ReActionTestimonials testimonials={testimonials} />
      <ReActionPartners />
    </div>
  );
};

export default ReActionProgram;
