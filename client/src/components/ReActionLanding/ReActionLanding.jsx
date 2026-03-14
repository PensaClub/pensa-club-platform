import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useReAction } from '../contexts/ReActionProvider';
import { useTheme } from '../contexts/ThemeContext';
import SEOHead from '../SEO/SEOHead';
import ReActionLandingHero from './ReActionLandingHero/ReActionLandingHero';
import ReActionLandingAbout from './ReActionLandingAbout/ReActionLandingAbout';
import ReActionLandingLinks from './ReActionLandingLinks/ReActionLandingLinks';
import ReActionLandingGallery from './ReActionLandingGallery/ReActionLandingGallery';
import ReActionLandingTestimonials from './ReActionLandingTestimonials/ReActionLandingTestimonials';
import ReActionLandingPartners from './ReActionLandingPartners/ReActionLandingPartners';
import { TextZoom } from '../TextZoom/TextZoom';
import ScrollToTop from '../ScrollToTop/ScrollToTop';
import './reActionLanding.css';

const ReActionLanding = () => {
    const { t } = useTranslation('reaction');
    const location = useLocation();
    const { getGallery, getPublicStats, getTestimonials } = useReAction();
    const { theme, toggleTheme } = useTheme();

    const [galleryItems, setGalleryItems] = useState([]);
    const [testimonials, setTestimonials] = useState([]);
    const [stats, setStats] = useState({ visitsCompleted: 0, clubsReached: 0, citiesCovered: 0 });

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname]);

    // Theme management — default to light
    useEffect(() => {
        const isRefresh = localStorage.getItem('ral-page-active') === 'true';

        if (!isRefresh) {
            localStorage.setItem('ral-prev-theme', theme);
            const savedTheme = localStorage.getItem('ral-theme') || 'light';
            localStorage.setItem('ral-theme', savedTheme);
            if (theme !== savedTheme) {
                toggleTheme();
            }
        }
        localStorage.setItem('ral-page-active', 'true');

        return () => {
            localStorage.removeItem('ral-page-active');
            const prevTheme = localStorage.getItem('ral-prev-theme');
            if (prevTheme) {
                localStorage.removeItem('ral-prev-theme');
                const currentTheme = document.documentElement.getAttribute('data-theme');
                if (currentTheme !== prevTheme) {
                    toggleTheme();
                }
            }
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (localStorage.getItem('ral-page-active') === 'true') {
            localStorage.setItem('ral-theme', theme);
        }
    }, [theme]);

    // Fetch data
    useEffect(() => {
        const fetchData = async () => {
            const [gallery, statsData, testimonialsData] = await Promise.all([
                getGallery(),
                getPublicStats(),
                getTestimonials(),
            ]);
            setGalleryItems(gallery);
            setStats(statsData);
            setTestimonials(testimonialsData);
        };
        fetchData();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className="ral">
            <SEOHead
                title={`${t('hub.hero.title', 'Програма ReАкция')} | Pensa Club`}
                description={t('hub.hero.subtitle', 'Безплатни менторски посещения за медийна грамотност')}
            />

            <ReActionLandingHero stats={stats} galleryItems={galleryItems} />
            <ReActionLandingAbout />
            <ReActionLandingLinks />
            <ReActionLandingGallery items={galleryItems} />
            <ReActionLandingTestimonials testimonials={testimonials} galleryItems={galleryItems} />
            <ReActionLandingPartners />

            <TextZoom />
            <ScrollToTop />
        </div>
    );
};

export default ReActionLanding;
