import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowLeft,
    faShare,
    faHeart,
    faMapMarkerAlt,
    faExclamationTriangle,
    faUsers,
    faInfoCircle,
    faRunning,
    faCalendarAlt,
    faCrown,
    faMapPin,
    faEnvelope,
    faTimes,
    faBars,
    faArrowUp,
    faTheaterMasks,
    faMusic,
    faHome,
    faHistory,
    faCamera,
    faHandsHelping,
    faLightbulb,
    faHandshake,
    faHeadset,
    faImages,
    faChartLine,
    faNetworkWired,
    faHeartbeat,
    faProjectDiagram,
    faDumbbell,
    faTrophy,
    faLeaf,
    faWeight,
    faStopwatch,
    faAward,
    faMedkit,
    faAppleAlt,
    faWalking,
    faBicycle,
    faUserMd
} from '@fortawesome/free-solid-svg-icons';

import './clubView.css';
import GeneralTemplate from './templates/GeneralTemplate';
import { useClubContext } from '../../contexts/ClubContext';
import ScrollToTop from '../../ScrollToTop/ScrollToTop';
import CulturalTemplate from './templates/CulturalTemplate';
import TraditionalTemplate from './templates/TraditionalTemplate';
import SocialTemplate from './templates/SocialTemplate';
import SportsTemplate from './templates/SportsTemplate';
import ShareModal from './components/ShareModal/ShareModal';
import { useAuthContext } from '../../contexts/UserContext';

export const ClubView = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { 
        getClubBySlug,
         currentClub,
         isLoading, 
        toggleBookmarkClub,
        isBookmarkedClub } = useClubContext();
const {isAuthentication } = useAuthContext();
    const [club, setClub] = useState(null);
    const [notFound, setNotFound] = useState(false);
    const [isFavorited, setIsFavorited] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [activeSection, setActiveSection] = useState('');
    const [showBackToTop, setShowBackToTop] = useState(false);
    const [showQuickNav, setShowQuickNav] = useState(false);
    const [navCollapsed, setNavCollapsed] = useState(true);
    const [availableNavItems, setAvailableNavItems] = useState([]);

    const allNavItems = useMemo(() => [
        { id: 'general-club-hero', label: t('clubs.ClubView.navigation.home'), icon: faUsers },
        { id: 'general-club-about', label: t('clubs.ClubView.navigation.aboutClub'), icon: faInfoCircle },
        { id: 'general-activities', label: t('clubs.ClubView.navigation.activities'), icon: faRunning },
        { id: 'general-events', label: t('clubs.ClubView.navigation.events'), icon: faCalendarAlt },
        { id: 'general-management', label: t('clubs.ClubView.navigation.management'), icon: faCrown },
        { id: 'club-pensioners-specific', label: t('clubs.ClubView.navigation.pensionersServices'), icon: faUserMd },
        { id: 'general-location', label: t('clubs.ClubView.navigation.location'), icon: faMapPin },
        { id: 'general-contact', label: t('clubs.ClubView.navigation.contacts'), icon: faEnvelope },
        { id: 'cultural-hero', label: t('clubs.ClubView.navigation.home'), icon: faTheaterMasks },
        { id: 'cultural-about', label: t('clubs.ClubView.navigation.aboutClub'), icon: faInfoCircle },
        { id: 'cultural-activities', label: t('clubs.ClubView.navigation.activities'), icon: faRunning },
        { id: 'cultural-events', label: t('clubs.ClubView.navigation.events'), icon: faCalendarAlt },
        { id: 'cultural-management', label: t('clubs.ClubView.navigation.management'), icon: faCrown },
        { id: 'cultural-gallery', label: t('clubs.ClubView.navigation.gallery'), icon: faCamera },
        { id: 'cultural-location', label: t('clubs.ClubView.navigation.location'), icon: faMapPin },
        { id: 'cultural-contacts', label: t('clubs.ClubView.navigation.contacts'), icon: faEnvelope },
        { id: 'traditional-hero', label: t('clubs.ClubView.navigation.home'), icon: faHome },
        { id: 'traditional-about', label: t('clubs.ClubView.navigation.aboutClub'), icon: faHistory },
        { id: 'traditional-traditions', label: t('clubs.ClubView.navigation.traditions'), icon: faCrown },
        { id: 'traditional-folklore', label: t('clubs.ClubView.navigation.folklore'), icon: faMusic },
        { id: 'traditional-performances', label: t('clubs.ClubView.navigation.performances'), icon: faTheaterMasks },
        { id: 'traditional-costumes', label: t('clubs.ClubView.navigation.costumes'), icon: faUsers },
        { id: 'traditional-music', label: t('clubs.ClubView.navigation.music'), icon: faMusic },
        { id: 'traditional-calendar', label: t('clubs.ClubView.navigation.calendar'), icon: faCalendarAlt },
        { id: 'traditional-gallery', label: t('clubs.ClubView.navigation.gallery'), icon: faCamera },
        { id: 'traditional-contacts', label: t('clubs.ClubView.navigation.contacts'), icon: faEnvelope },
        { id: 'traditional-location', label: t('clubs.ClubView.navigation.location'), icon: faMapPin },
        { id: 'social-hero', label: t('clubs.ClubView.navigation.home'), icon: faHeart },
        { id: 'social-about', label: t('clubs.ClubView.navigation.aboutClub'), icon: faInfoCircle },
        { id: 'social-projects', label: t('clubs.ClubView.navigation.projects'), icon: faLightbulb },
        { id: 'social-volunteering', label: t('clubs.ClubView.navigation.volunteering'), icon: faHandsHelping },
        { id: 'social-support', label: t('clubs.ClubView.navigation.support'), icon: faHeartbeat },
        { id: 'community-events', label: t('clubs.ClubView.navigation.events'), icon: faCalendarAlt },
        { id: 'social-gallery', label: t('clubs.ClubView.navigation.gallery'), icon: faImages },
        { id: 'social-partnerships', label: t('clubs.ClubView.navigation.partners'), icon: faHandshake },
        { id: 'social-location', label: t('clubs.ClubView.navigation.location'), icon: faMapPin },
        { id: 'social-contacts', label: t('clubs.ClubView.navigation.contacts'), icon: faHeadset },
        { id: 'sports-hero', label: t('clubs.ClubView.navigation.home'), icon: faRunning },
        { id: 'sports-about', label: t('clubs.ClubView.navigation.aboutClub'), icon: faInfoCircle },
        { id: 'fitness-programs', label: t('clubs.ClubView.navigation.fitnessPrograms'), icon: faDumbbell },
        { id: 'health-activities', label: t('clubs.ClubView.navigation.healthActivities'), icon: faHeartbeat },
        { id: 'wellness-services', label: t('clubs.ClubView.navigation.wellnessServices'), icon: faLeaf },
        { id: 'sport-events', label: t('clubs.ClubView.navigation.sportsEvents'), icon: faTrophy },
        { id: 'sports-health-tracking', label: t('clubs.ClubView.navigation.progressTracking'), icon: faChartLine },
        { id: 'sports-gallery', label: t('clubs.ClubView.navigation.gallery'), icon: faImages },
        { id: 'sports-partners', label: t('clubs.ClubView.navigation.partners'), icon: faHandshake },
        { id: 'sports-location', label: t('clubs.ClubView.navigation.location'), icon: faMapPin },
        { id: 'sports-contacts', label: t('clubs.ClubView.navigation.contacts'), icon: faHeadset }
    ], [t]);

    const generateSEOData = (club) => {
        if (!club) return {};

        const title = t('clubs.ClubView.seo.clubTitle', { clubName: club.name, city: club.location.city });
        const description = club.shortDescription || club.fullDescription?.substring(0, 160) ||
            t('clubs.ClubView.seo.clubDescription', {
                city: club.location.city,
                activity: t(`clubs.ClubView.seo.activities.${club.category}`, { defaultValue: t('clubs.ClubView.seo.activities.general') })
            });

        const keywords = [
            t('clubs.ClubView.seo.keywords.clubForPensioners'),
            t('clubs.ClubView.seo.keywords.pensionersClub'),
            club.location.city,
            club.location.region,
            club.category,
            ...(club.metadata?.tags || []),
            t('clubs.ClubView.seo.keywords.activePensioners'),
            t('clubs.ClubView.seo.keywords.socialActivities'),
            t('clubs.ClubView.seo.keywords.thirdAge')
        ].join(', ');

        const canonicalUrl = `${window.location.origin}/clubs/${club.slug}`;

        return {
            title,
            description,
            keywords,
            canonicalUrl,
            ogTitle: title,
            ogDescription: description,
            ogUrl: canonicalUrl,
            ogImage: club.mainImage || club.logo || `${window.location.origin}/default-club-image.jpg`,
            ogType: 'website',
            twitterCard: 'summary_large_image',
            schemaOrg: {
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": club.name,
                "description": description,
                "url": canonicalUrl,
                "logo": club.logo,
                "image": club.mainImage,
                "address": {
                    "@type": "PostalAddress",
                    "streetAddress": club.location.address,
                    "addressLocality": club.location.city,
                    "addressRegion": club.location.region,
                    "postalCode": club.location.postalCode,
                    "addressCountry": "BG"
                },
                "contactPoint": {
                    "@type": "ContactPoint",
                    "telephone": club.contacts?.phone,
                    "email": club.contacts?.email,
                    "contactType": "customer support"
                },
                "foundingDate": club.foundedYear ? `${club.foundedYear}-01-01` : undefined,
                "memberOf": {
                    "@type": "Organization",
                    "name": t('clubs.ClubView.seo.organizationName')
                },
                "aggregateRating": club.metadata?.rating ? {
                    "@type": "AggregateRating",
                    "ratingValue": club.metadata.rating,
                    "ratingCount": club.metadata.views || 1
                } : undefined
            }
        };
    };

    const updateAvailableNavItems = () => {
        const existingSections = allNavItems.filter(item => {
            const element = document.getElementById(item.id);
            return element !== null;
        });

        setAvailableNavItems(existingSections);

        if (existingSections.length > 0 && !activeSection) {
            setActiveSection(existingSections[0].id);
        }
    };

    const findActiveSection = () => {
        const scrollPosition = window.scrollY + 250;

        for (let i = availableNavItems.length - 1; i >= 0; i--) {
            const item = availableNavItems[i];
            const element = document.getElementById(item.id);

            if (element) {
                const { offsetTop } = element;
                if (scrollPosition >= offsetTop) {
                    setActiveSection(item.id);
                    break;
                }
            }
        }
    };

    useEffect(() => {
        const loadClub = async () => {
            if (!slug) {
                setNotFound(true);
                return;
            }

            try {
                const clubData = await getClubBySlug(slug);
                if (clubData) {
                    setClub(clubData);
                    setNotFound(false);

                    // const favorites = JSON.parse(localStorage.getItem('favoriteClubs') || '[]');
                    // setIsFavorited(favorites.includes(clubData.id));
                } else {
                    setNotFound(true);
                }
            } catch (error) {
                console.error('Грешка при зареждане на клуб:', error);
                setNotFound(true);
            }
        };

        loadClub();
    }, [slug]);

    useEffect(() => {
        const checkSections = () => {
            setTimeout(() => {
                updateAvailableNavItems();
            }, 200);
        };

        checkSections();

        if (club) {
            checkSections();
        }
    }, [club, allNavItems]);

    useEffect(() => {
        if (availableNavItems.length === 0) return;

        const handleScroll = () => {
            setShowBackToTop(window.scrollY > 300);
            findActiveSection();
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [availableNavItems]);

    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            const yOffset = -120;
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;

            window.scrollTo({
                top: y,
                behavior: 'smooth'
            });

            setActiveSection(sectionId);
            setShowQuickNav(false);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const getTemplate = (club) => {
        if (!club) return null;

        const templateType = club.template || club.category || 'general';

        switch (templateType) {
            case 'cultural':
                return <CulturalTemplate club={club} />;
            case 'traditional':
                return <TraditionalTemplate club={club} />;
            case 'social':
                return <SocialTemplate club={club} />;
            case 'sports':
                return <SportsTemplate club={club} />;
            case 'general':
            default:
                return <GeneralTemplate club={club} />;
        }
    };

    const handleBack = () => {
        navigate('/clubs');
    };

    const handleShare = async () => {
        if (navigator.share && club) {
            try {
                await navigator.share({
                    title: club.name,
                    text: club.shortDescription,
                    url: window.location.href,
                });
            } catch (err) {
                if (err.name !== 'AbortError') {
                    setShowShareModal(true);
                }
            }
        } else {
            setShowShareModal(true);
        }
    };

    // const handleFavorite = () => {
    //     if (!club) return;

    //     const favorites = JSON.parse(localStorage.getItem('favoriteClubs') || '[]');

    //     if (isFavorited) {
    //         const newFavorites = favorites.filter(id => id !== club.id);
    //         localStorage.setItem('favoriteClubs', JSON.stringify(newFavorites));
    //         setIsFavorited(false);
    //     } else {
    //         const newFavorites = [...favorites, club.id];
    //         localStorage.setItem('favoriteClubs', JSON.stringify(newFavorites));
    //         setIsFavorited(true);
    //     }
    // };

    const seoData = club ? generateSEOData(club) : {};

    if (isLoading) {
        return (
            <>
                <Helmet>
                    <title>{t('clubs.ClubView.loading.title')}</title>
                    <meta name="description" content={t('clubs.ClubView.loading.description')} />
                </Helmet>
                <div className="club-view-loading">
                    <div className="club-view-loading-content">
                        <div className="loading-spinner-large"></div>
                        <p>{t('clubs.ClubView.loading.text')}</p>
                    </div>
                </div>
            </>
        );
    }

    if (notFound || !club) {
        return (
            <>
                <Helmet>
                    <title>{t('clubs.ClubView.notFound.title')}</title>
                    <meta name="description" content={t('clubs.ClubView.notFound.description')} />
                    <meta name="robots" content="noindex, nofollow" />
                </Helmet>
                <div className="club-view-not-found">
                    <div className="not-found-content">
                        <FontAwesomeIcon icon={faExclamationTriangle} className="not-found-icon" />
                        <h2>{t('clubs.ClubView.notFound.heading')}</h2>
                        <p>{t('clubs.ClubView.notFound.message')}</p>
                        <button onClick={handleBack} className="back-to-clubs-btn">
                            <FontAwesomeIcon icon={faArrowLeft} />
                            {t('clubs.ClubView.notFound.backButton')}
                        </button>
                    </div>
                </div>
            </>
        );
    }

    return (
        <div className="club-view-container">
            <Helmet>
                <title>{seoData.title}</title>
                <meta name="description" content={seoData.description} />
                <meta name="keywords" content={seoData.keywords} />
                <link rel="canonical" href={seoData.canonicalUrl} />
                <meta property="og:title" content={seoData.ogTitle} />
                <meta property="og:description" content={seoData.ogDescription} />
                <meta property="og:url" content={seoData.ogUrl} />
                <meta property="og:type" content={seoData.ogType} />
                <meta property="og:image" content={seoData.ogImage} />
                <meta property="og:image:width" content="1200" />
                <meta property="og:image:height" content="630" />
                <meta property="og:locale" content="bg_BG" />
                <meta property="og:site_name" content="Pensa Club" />
                <meta name="twitter:card" content={seoData.twitterCard} />
                <meta name="twitter:title" content={seoData.ogTitle} />
                <meta name="twitter:description" content={seoData.ogDescription} />
                <meta name="twitter:image" content={seoData.ogImage} />
                <meta name="author" content={club.name} />
                <meta name="publisher" content="Pensa Club" />
                <meta name="robots" content="index, follow, max-image-preview:large" />
                <meta name="googlebot" content="index, follow" />
                <meta name="geo.region" content={`BG-${club.location.region}`} />
                <meta name="geo.placename" content={club.location.city} />
                {club.location.coordinates && (
                    <>
                        <meta name="geo.position" content={`${club.location.coordinates.lat};${club.location.coordinates.lng}`} />
                        <meta name="ICBM" content={`${club.location.coordinates.lat}, ${club.location.coordinates.lng}`} />
                    </>
                )}
                <script type="application/ld+json">
                    {JSON.stringify(seoData.schemaOrg)}
                </script>
                <meta name="theme-color" content="#2563eb" />
                <meta name="msapplication-TileColor" content="#2563eb" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
                <meta name="format-detection" content="telephone=yes" />
                <meta name="format-detection" content="address=yes" />
                {club.mainImage && (
                    <link rel="preload" as="image" href={club.mainImage} />
                )}
                <link rel="alternate" hrefLang="bg" href={seoData.canonicalUrl} />
                <link rel="alternate" hrefLang="x-default" href={seoData.canonicalUrl} />
            </Helmet>

            <div className="club-view-header">
                <div className="club-view-header-content">
                    <button onClick={handleBack} className="club-back-btn">
                        <FontAwesomeIcon icon={faArrowLeft} />
                        <span>{t('clubs.ClubView.actions.allClubs')}</span>
                    </button>

                    <div className="club-header-info">
                        <h1 className="club-header-title">{club.name}</h1>
                        <div className="club-header-location">
                            <FontAwesomeIcon icon={faMapMarkerAlt} />
                            <span>{club.location.city}</span>
                        </div>
                    </div>

                    <div className="club-header-actions">
                        {isAuthentication  && (
                        <button
                            onClick={() => toggleBookmarkClub(club.id)}
                            className={`club-action-btn ${isBookmarkedClub(club.id) ? 'favorited' : ''}`}
                            title={isBookmarkedClub(club.id) ? t('clubs.ClubView.actions.removeFromFavorites') : t('clubs.ClubView.actions.addToFavorites')}
                        >
                            <FontAwesomeIcon icon={faHeart} />
                        </button>
                        )}
                        <button
                            onClick={handleShare}
                            className="club-action-btn"
                            title={t('clubs.ClubView.actions.shareClub')}
                        >
                            <FontAwesomeIcon icon={faShare} />
                        </button>
                    </div>
                </div>
            </div>

            <main className="club-view-main">
                {getTemplate(club)}
            </main>

            {availableNavItems.length > 0 && (
                <nav className={`club-nav-sidebar ${navCollapsed ? 'club-collapsed' : 'club-expanded'}`}>
                    <button
                        className="club-nav-toggle-btn"
                        onClick={() => setNavCollapsed(!navCollapsed)}
                    >
                        <FontAwesomeIcon icon={navCollapsed ? faBars : faTimes} />
                    </button>

                    <div className="club-nav-items">
                        {availableNavItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => scrollToSection(item.id)}
                                className={`club-nav-item ${activeSection === item.id ? 'club-active' : ''}`}
                                title={item.label}
                            >
                                <FontAwesomeIcon icon={item.icon} />
                                {!navCollapsed && <span>{item.label}</span>}
                            </button>
                        ))}
                    </div>
                </nav>
            )}

            {availableNavItems.length > 0 && (
                <div className="club-mobile-nav-fab">
                    <button
                        className={`club-nav-fab ${showQuickNav ? 'club-fab-active' : ''}`}
                        onClick={() => setShowQuickNav(!showQuickNav)}
                    >
                        <FontAwesomeIcon icon={showQuickNav ? faTimes : faBars} />
                    </button>

                    {showQuickNav && (
                        <>
                            <div className="club-nav-backdrop" onClick={() => setShowQuickNav(false)}></div>
                            <div className="club-mobile-nav-panel">
                                <div className="club-panel-header">
                                    <h3>{t('clubs.ClubView.navigation.title')}</h3>
                                    <button onClick={() => setShowQuickNav(false)}>
                                        <FontAwesomeIcon icon={faTimes} />
                                    </button>
                                </div>
                                <div className="club-panel-items">
                                    {availableNavItems.map(item => (
                                        <button
                                            key={item.id}
                                            onClick={() => scrollToSection(item.id)}
                                            className={`club-panel-item ${activeSection === item.id ? 'club-panel-active' : ''}`}
                                        >
                                            <FontAwesomeIcon icon={item.icon} />
                                            <span>{item.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}

            {showBackToTop && (
                <button onClick={scrollToTop} className="club-back-to-top">
                    <FontAwesomeIcon icon={faArrowUp} />
                </button>
            )}

            {showShareModal && (
                <ShareModal
                    isOpen={showShareModal}
                    onClose={() => setShowShareModal(false)}
                    club={club}
                />
            )}
        </div>
    );
};

export default ClubView;