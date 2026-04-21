import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useLocalizedNavigate } from '../../../hooks/useLocalizedNavigate';
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
import SEOHead from '../../SEO/SEOHead';
import { useTrackContentView } from '../../hooks/useTrackContentView';

export const ClubView = () => {
    const { slug } = useParams();
    const navigate = useLocalizedNavigate();
    const { t } = useTranslation('clubs');
    const {
        getClubBySlug,
        currentClub,
        isLoading,
        toggleBookmarkClub,
        isBookmarkedClub } = useClubContext();
    const { isAuthentication } = useAuthContext();
    const [club, setClub] = useState(null);
    useTrackContentView('club', club?.id);
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

    // ✅ META DATA - ДИНАМИЧНИ META TAGS
    const metaData = useMemo(() => {
        if (!club) {
            return {
                title: 'Клуб | Pensa Club',
                description: 'Зареждане на информация за клуба...',
                keywords: 'клуб, пенсионери, Pensa Club',
                image: '/images/iniciatives/iniciatives-2.jpg',
                author: 'Pensa Foundation'
            };
        }

        // Title
        const title = `${club.name} - ${club.location?.city || 'България'} | Pensa Club`;

        // Description
        const description = club.shortDescription
            ? club.shortDescription.substring(0, 160)
            : club.fullDescription?.substring(0, 160) || `Клуб за пенсионери ${club.name} в ${club.location?.city}. Присъединете се към нашата общност.`;

        // Keywords
        const baseKeywords = [
            'клуб за пенсионери',
            club.name,
            club.location?.city,
            club.location?.region,
            club.category,
            'Pensa Club',
            'активни пенсионери',
            'социални дейности',
            'трета възраст'
        ];

        if (club.metadata?.tags && Array.isArray(club.metadata.tags)) {
            baseKeywords.push(...club.metadata.tags);
        }

        const keywords = baseKeywords.filter(Boolean).join(', ');

        // Image
        const image = club.mainImage || club.logo || '/images/iniciatives/iniciatives-2.jpg';

        // Author
        const author = club.name;

        return {
            title,
            description,
            keywords,
            image,
            author
        };
    }, [club]);

    // ✅ STRUCTURED DATA - ORGANIZATION SCHEMA
    const structuredData = useMemo(() => {
        if (!club) return null;

        return {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": club.name,
            "description": metaData.description,
            "url": `https://pensa.club/clubs/${club.slug}`,
            "logo": club.logo,
            "image": club.mainImage || club.logo,
            "address": {
                "@type": "PostalAddress",
                "streetAddress": club.location?.address,
                "addressLocality": club.location?.city,
                "addressRegion": club.location?.region,
                "postalCode": club.location?.postalCode,
                "addressCountry": "BG"
            },
            ...(club.location?.coordinates && {
                "geo": {
                    "@type": "GeoCoordinates",
                    "latitude": club.location.coordinates.lat,
                    "longitude": club.location.coordinates.lng
                }
            }),
            ...(club.contacts?.phone && {
                "contactPoint": {
                    "@type": "ContactPoint",
                    "telephone": club.contacts.phone,
                    "email": club.contacts?.email,
                    "contactType": "customer support"
                }
            }),
            ...(club.foundedYear && {
                "foundingDate": `${club.foundedYear}-01-01`
            }),
            "memberOf": {
                "@type": "Organization",
                "name": "Pensa Club"
            },
            ...(club.metadata?.rating && {
                "aggregateRating": {
                    "@type": "AggregateRating",
                    "ratingValue": club.metadata.rating,
                    "ratingCount": club.metadata.views || 1
                }
            }),
            "inLanguage": "bg"
        };
    }, [club, metaData]);

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


    if (isLoading) {
        return (
            <>
                <SEOHead
                    title={t('clubs.ClubView.loading.title', { defaultValue: 'Зареждане на клуб...' })}
                    description={t('clubs.ClubView.loading.description', { defaultValue: 'Моля, изчакайте. Зареждаме информацията за клуба.' })}
                    keywords="клуб, пенсионери, Pensa Club"
                    noindex={true}
                />
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
                <SEOHead
                    title={t('clubs.ClubView.notFound.title', { defaultValue: 'Клубът не е намерен' })}
                    description={t('clubs.ClubView.notFound.description', { defaultValue: 'Търсеният клуб не е намерен в нашата система.' })}
                    keywords="клуб, пенсионери, Pensa Club"
                    noindex={true}
                />
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
            <SEOHead
                title={metaData.title}
                description={metaData.description}
                keywords={metaData.keywords}
                image={metaData.image}
                type="website"
                author={metaData.author}
                structuredData={structuredData}
            />

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
                        {isAuthentication && (
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