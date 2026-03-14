import { useState, useEffect } from 'react';
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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Default to light theme, shared across all ReAction pages (ra- prefix)
  useEffect(() => {
    const isRefresh = localStorage.getItem('ra-page-active') === 'true';

    if (!isRefresh) {
      localStorage.setItem('ra-prev-theme', theme);
      const savedTheme = localStorage.getItem('ra-theme') || 'light';
      localStorage.setItem('ra-theme', savedTheme);
      if (theme !== savedTheme) {
        toggleTheme();
      }
    }
    localStorage.setItem('ra-page-active', 'true');

    return () => {
      localStorage.removeItem('ra-page-active');
      const prevTheme = localStorage.getItem('ra-prev-theme');
      if (prevTheme) {
        localStorage.removeItem('ra-prev-theme');
        const currentTheme = document.documentElement.getAttribute('data-theme');
        if (currentTheme !== prevTheme) {
          toggleTheme();
        }
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Track theme changes while on page
  useEffect(() => {
    if (localStorage.getItem('ra-page-active') === 'true') {
      localStorage.setItem('ra-theme', theme);
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
        title={t('seo.title', 'Заяви менторско посещение — Програма ReАкция | Pensa Club')}
        description={t('seo.description', 'Заявете безплатно менторско посещение за вашия пенсионерски клуб. Обучени ментори ще проведат разговор за медийна грамотност и дигитални умения.')}
        keywords={t('seo.keywords', 'заяви посещение, менторско посещение, пенсионерски клуб, медийна грамотност, дигитална грамотност, дезинформация, безплатно обучение, Програма ReАкция')}
        image="/images/reaction/reaction-og.jpg"
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: t('seo.title', 'Заяви менторско посещение — Програма ReАкция'),
          description: t('seo.description', 'Заявете безплатно менторско посещение за вашия пенсионерски клуб.'),
          url: 'https://pensa.club/reaction/book',
          image: 'https://pensa.club/images/reaction/reaction-og.jpg',
        }}
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
