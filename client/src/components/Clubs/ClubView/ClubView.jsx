import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
    faBicycle
} from '@fortawesome/free-solid-svg-icons';

import './clubView.css';
import GeneralTemplate from './templates/GeneralTemplate';
import { useClubContext } from '../../contexts/ClubContext';
import ScrollToTop from '../../ScrollToTop/ScrollToTop';
import CulturalTemplate from './templates/CulturalTemplate';
import TraditionalTemplate from './templates/TraditionalTemplate';
import SocialTemplate from './templates/SocialTemplate';
import SportsTemplate from './templates/SportsTemplate';

export const ClubView = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { getClubBySlug, currentClub, isLoading } = useClubContext();
    const [club, setClub] = useState(null);
    const [notFound, setNotFound] = useState(false);
    const [isFavorited, setIsFavorited] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [activeSection, setActiveSection] = useState('');
    const [showBackToTop, setShowBackToTop] = useState(false);
    const [showQuickNav, setShowQuickNav] = useState(false);
    const [navCollapsed, setNavCollapsed] = useState(true);
    const [availableNavItems, setAvailableNavItems] = useState([]);

    // Всички възможни навигационни елементи с техните конфигурации
    const allNavItems = [
        // General template
        { id: 'club-hero', label: 'Начало', icon: faUsers },
        { id: 'club-about', label: 'За клуба', icon: faInfoCircle },
        { id: 'club-activities', label: 'Дейности', icon: faRunning },
        { id: 'club-events', label: 'Събития', icon: faCalendarAlt },
        { id: 'club-management', label: 'Ръководство', icon: faCrown },
        { id: 'club-location', label: 'Локация', icon: faMapPin },
        { id: 'club-contact', label: 'Контакти', icon: faEnvelope },

        // Cultural template  
        { id: 'cultural-hero', label: 'Начало', icon: faTheaterMasks },
        { id: 'cultural-about', label: 'За клуба', icon: faInfoCircle },
        { id: 'cultural-activities', label: 'Дейности', icon: faRunning },
        { id: 'cultural-events', label: 'Събития', icon: faCalendarAlt },
        { id: 'cultural-management', label: 'Ръководство', icon: faCrown },
        { id: 'cultural-gallery', label: 'Галерия', icon: faCamera },
        { id: 'cultural-location', label: 'Локация', icon: faMapPin },
        { id: 'cultural-contacts', label: 'Контакти', icon: faEnvelope },

        // Traditional template
        { id: 'traditional-hero', label: 'Начало', icon: faHome },
        { id: 'traditional-about', label: 'За клуба', icon: faHistory },
        { id: 'traditional-traditions', label: 'Традиции', icon: faCrown },
        { id: 'traditional-folklore', label: 'Фолклор', icon: faMusic },
        { id: 'traditional-performances', label: 'Изпълнения', icon: faTheaterMasks },
        { id: 'traditional-costumes', label: 'Носии', icon: faUsers },
        { id: 'traditional-music', label: 'Музика', icon: faMusic },
        { id: 'traditional-calendar', label: 'Календар', icon: faCalendarAlt },
        { id: 'traditional-gallery', label: 'Галерия', icon: faCamera },
        { id: 'traditional-contacts', label: 'Контакти', icon: faEnvelope },
        { id: 'traditional-location', label: 'Локация', icon: faMapPin },
        // Social template
        { id: 'social-hero', label: 'Начало', icon: faHeart },
        { id: 'social-about', label: 'За клуба', icon: faInfoCircle },
        { id: 'social-projects', label: 'Проекти', icon: faLightbulb },
        { id: 'social-volunteering', label: 'Доброволчество', icon: faHandsHelping },
        { id: 'social-support', label: 'Подкрепа', icon: faHeartbeat },
        { id: 'community-events', label: 'Събития', icon: faCalendarAlt },
        { id: 'social-gallery', label: 'Галерия', icon: faImages },
        { id: 'social-partnerships', label: 'Партньори', icon: faHandshake },
        { id: 'social-location', label: 'Локация', icon: faMapPin },
        { id: 'social-contacts', label: 'Контакти', icon: faHeadset },
        // Sports/Active template
        { id: 'sports-hero', label: 'Начало', icon: faRunning },
        { id: 'sports-about', label: 'За клуба', icon: faInfoCircle },
        { id: 'fitness-programs', label: 'Фитнес програми', icon: faDumbbell },
        { id: 'health-activities', label: 'Здравни дейности', icon: faHeartbeat },
        { id: 'wellness-services', label: 'Wellness услуги', icon: faLeaf },
        { id: 'sport-events', label: 'Спортни събития', icon: faTrophy },
        { id: 'health-tracking', label: 'Следене прогрес', icon: faChartLine },
        { id: 'sports-gallery', label: 'Галерия', icon: faImages },
        { id: 'fitness-partners', label: 'Партньори', icon: faHandshake },
        { id: 'sports-location', label: 'Локация', icon: faMapPin },
        { id: 'sports-contacts', label: 'Контакти', icon: faHeadset }
    ];

    // Функция за проверка на налични секции в DOM
    const updateAvailableNavItems = () => {
        const existingSections = allNavItems.filter(item => {
            const element = document.getElementById(item.id);
            return element !== null;
        });

        setAvailableNavItems(existingSections);

        // Задаваме първата налична секция като активна ако няма активна
        if (existingSections.length > 0 && !activeSection) {
            setActiveSection(existingSections[0].id);
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

                    // Проверяваме дали е в любими (от localStorage)
                    const favorites = JSON.parse(localStorage.getItem('favoriteClubs') || '[]');
                    setIsFavorited(favorites.includes(clubData.id));

                    // SEO: Обновяваме title на страницата
                    document.title = `${clubData.name} - Pensa Club`;
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
        // Изчакваме малко преди да проверим DOM-а за секциите
        const checkSections = () => {
            setTimeout(() => {
                updateAvailableNavItems();
            }, 100);
        };

        checkSections();

        // Проверяваме отново когато се промени клуба
        if (club) {
            checkSections();
        }
    }, [club]);

    useEffect(() => {
        if (availableNavItems.length === 0) return;

        const observerOptions = {
            root: null,
            rootMargin: '-20% 0px -60% 0px',
            threshold: 0.1
        };

        const observerCallback = (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id);
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);

        // Наблюдаваме само наличните секции
        availableNavItems.forEach(item => {
            const element = document.getElementById(item.id);
            if (element) {
                observer.observe(element);
            }
        });

        const handleScroll = () => {
            setShowBackToTop(window.scrollY > 300);
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            observer.disconnect();
            window.removeEventListener('scroll', handleScroll);
        };
    }, [availableNavItems]);

    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            const yOffset = -100;
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;

            window.scrollTo({
                top: y,
                behavior: 'smooth'
            });

            setShowQuickNav(false);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Избираме правилния темплейт според категорията
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

    const handleFavorite = () => {
        if (!club) return;

        const favorites = JSON.parse(localStorage.getItem('favoriteClubs') || '[]');

        if (isFavorited) {
            // Премахваме от любими
            const newFavorites = favorites.filter(id => id !== club.id);
            localStorage.setItem('favoriteClubs', JSON.stringify(newFavorites));
            setIsFavorited(false);
        } else {
            // Добавяме в любими
            const newFavorites = [...favorites, club.id];
            localStorage.setItem('favoriteClubs', JSON.stringify(newFavorites));
            setIsFavorited(true);
        }
    };

    // Loading състояние
    if (isLoading) {
        return (
            <div className="club-view-loading">
                <div className="club-view-loading-content">
                    <div className="loading-spinner-large"></div>
                    <p>Зареждане на клуба...</p>
                </div>
            </div>
        );
    }

    // Клубът не е намерен
    if (notFound || !club) {
        return (
            <div className="club-view-not-found">
                <div className="not-found-content">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="not-found-icon" />
                    <h2>Клубът не беше намерен</h2>
                    <p>Съжаляваме, но клубът който търсите не съществува или е бил премахнат.</p>
                    <button onClick={handleBack} className="back-to-clubs-btn">
                        <FontAwesomeIcon icon={faArrowLeft} />
                        Обратно към клубовете
                    </button>
                </div>
            </div>
        );
    }

    // Основният markup
    return (
        <div className="club-view-container">
            {/* Фиксиран header с навигация */}
            <div className="club-view-header">
                <div className="club-view-header-content">
                    <button onClick={handleBack} className="club-back-btn">
                        <FontAwesomeIcon icon={faArrowLeft} />
                        <span>Всички клубове</span>
                    </button>

                    <div className="club-header-info">
                        <h1 className="club-header-title">{club.name}</h1>
                        <div className="club-header-location">
                            <FontAwesomeIcon icon={faMapMarkerAlt} />
                            <span>{club.location.city}</span>
                        </div>
                    </div>

                    <div className="club-header-actions">
                        <button
                            onClick={handleFavorite}
                            className={`club-action-btn ${isFavorited ? 'favorited' : ''}`}
                            title={isFavorited ? 'Премахни от любими' : 'Добави в любими'}
                        >
                            <FontAwesomeIcon icon={faHeart} />
                        </button>

                        <button
                            onClick={handleShare}
                            className="club-action-btn"
                            title="Сподели клуба"
                        >
                            <FontAwesomeIcon icon={faShare} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Основното съдържание */}
            <main className="club-view-main">
                {getTemplate(club)}
            </main>

            {/* Desktop Navigation - Collapsible Sidebar - показва само налични секции */}
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

            {/* Mobile Navigation FAB - показва само налични секции */}
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
                                    <h3>Навигация</h3>
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

            {showShareModal && (
                <ShareModal
                    isOpen={showShareModal}
                    onClose={() => setShowShareModal(false)}
                    club={club}
                />
            )}
            <ScrollToTop />
        </div>
    );
};

export default ClubView;