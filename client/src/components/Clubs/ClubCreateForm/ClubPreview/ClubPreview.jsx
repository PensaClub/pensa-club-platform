// src/components/Clubs/ClubCreateForm/ClubPreview/ClubPreview.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowLeft,
    faUsers,
    faInfoCircle,
    faRunning,
    faCalendarAlt,
    faCrown,
    faMapPin,
    faEnvelope,
    faMapMarkerAlt,
    faBars,
    faTimes,
    faArrowUp,
    faHome,
    faTheaterMasks,
    faMusic,
    faHistory,
    faCamera,
    faHandsHelping,
    faLightbulb,
    faHeartbeat,
    faHeart,
    faImages,
    faHandshake,
    faHeadset,
    faDumbbell,
    faTrophy,
    faLeaf,
    faChartLine
} from '@fortawesome/free-solid-svg-icons';

import './clubPreview.css';
// Импортираме темплейтите от ClubView
import CulturalTemplate from '../../ClubView/templates/CulturalTemplate';
import TraditionalTemplate from '../../ClubView/templates/TraditionalTemplate';
import SocialTemplate from '../../ClubView/templates/SocialTemplate';
import SportsTemplate from '../../ClubView/templates/SportsTemplate';
import GeneralTemplate from '../../ClubView/templates/GeneralTemplate';

const ClubPreview = ({ formData, onClose, isPreviewMode = true }) => {
    const { t } = useTranslation();
    const [activeSection, setActiveSection] = useState('');
    const [showBackToTop, setShowBackToTop] = useState(false);
    const [navCollapsed, setNavCollapsed] = useState(true);
    const [availableNavItems, setAvailableNavItems] = useState([]);

    // Навигационни елементи - същите като в ClubView
    const allNavItems = useMemo(() => [
        // General template
        { id: 'general-club-hero', label: t('clubs.ClubView.navigation.home'), icon: faUsers },
        { id: 'general-club-about', label: t('clubs.ClubView.navigation.aboutClub'), icon: faInfoCircle },
        { id: 'general-activities', label: t('clubs.ClubView.navigation.activities'), icon: faRunning },
        { id: 'general-events', label: t('clubs.ClubView.navigation.events'), icon: faCalendarAlt },
        { id: 'general-management', label: t('clubs.ClubView.navigation.management'), icon: faCrown },
        { id: 'general-location', label: t('clubs.ClubView.navigation.location'), icon: faMapPin },
        { id: 'general-contact', label: t('clubs.ClubView.navigation.contacts'), icon: faEnvelope },

        // Cultural template
        { id: 'cultural-hero', label: t('clubs.ClubView.navigation.home'), icon: faTheaterMasks },
        { id: 'cultural-about', label: t('clubs.ClubView.navigation.aboutClub'), icon: faInfoCircle },
        { id: 'cultural-activities', label: t('clubs.ClubView.navigation.activities'), icon: faRunning },
        { id: 'cultural-events', label: t('clubs.ClubView.navigation.events'), icon: faCalendarAlt },
        { id: 'cultural-management', label: t('clubs.ClubView.navigation.management'), icon: faCrown },
        { id: 'cultural-gallery', label: t('clubs.ClubView.navigation.gallery'), icon: faCamera },
        { id: 'cultural-location', label: t('clubs.ClubView.navigation.location'), icon: faMapPin },
        { id: 'cultural-contacts', label: t('clubs.ClubView.navigation.contacts'), icon: faEnvelope },

        // Traditional template
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

        // Social template
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

        // Sports template
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

    // Преобразуваме formData в club обект съвместим с темплейтите
    const previewClub = useMemo(() => {
        if (!formData) return null;

        return {
            // Основна информация
            id: 'preview',
            slug: 'preview',
            name: formData.name || t('clubForm.preview.defaultName'),
            shortDescription: formData.shortDescription || '',
            fullDescription: formData.fullDescription || '',
            foundedYear: formData.foundedYear || new Date().getFullYear(),
            status: formData.status || 'active',
            category: formData.category || 'general',
            template: formData.template || formData.category || 'general',

            // Медия
            logo: formData.logo || '',
            mainImage: formData.mainImage || '',
            gallery: formData.gallery || [],
            media: {
                videos: formData.media?.videos || [],
                virtualTour: formData.media?.virtualTour || '',
                audioFiles: formData.media?.audioFiles || []
            },

            // Местоположение - директно копиране със запазване на структурата
            location: {
                address: formData.location?.address || '',
                city: formData.location?.city || '',
                municipality: formData.location?.municipality || '',
                region: formData.location?.region || '',
                postalCode: formData.location?.postalCode || '',
                coordinates: {
                    lat: formData.location?.coordinates?.lat || 0,
                    lng: formData.location?.coordinates?.lng || 0
                },
                venue: {
                    type: formData.location?.venue?.type || 'municipal',
                    size: formData.location?.venue?.size || '',
                    capacity: formData.location?.venue?.capacity || 0,
                    facilities: formData.location?.venue?.facilities || [],
                    accessibility: formData.location?.venue?.accessibility || false
                }
            },

            // Членство - директно копиране
            membership: {
                totalMembers: formData.membership?.totalMembers || 0,
                ageGroups: formData.membership?.ageGroups || {
                    "под-60": 0,
                    "60-70": 0,
                    "70-80": 0,
                    "80+": 0
                },
                membershipFee: formData.membership?.membershipFee || { monthly: 0, yearly: 0, currency: 'BGN' },
                requirements: formData.membership?.requirements || [],
                benefits: formData.membership?.benefits || []
            },

            // Членове
            members: formData.members || [],

            // Управление
            management: {
                board: formData.management?.board || []
            },

            // Контакти - адаптирам структурата
            contacts: {
                phone: formData.contacts?.basic?.phone || formData.contacts?.phone || '',
                mobile: formData.contacts?.basic?.mobile || formData.contacts?.mobile || '',
                email: formData.contacts?.basic?.email || formData.contacts?.email || '',
                website: formData.contacts?.website?.url || formData.contacts?.website || '',
                socialMedia: {
                    facebook: formData.contacts?.socialMedia?.facebook || '',
                    instagram: formData.contacts?.socialMedia?.instagram || '',
                    youtube: formData.contacts?.socialMedia?.youtube || '',
                    twitter: formData.contacts?.socialMedia?.twitter || '',
                    linkedin: formData.contacts?.socialMedia?.linkedin || ''
                },
                workingHours: formData.contacts?.workingHours || {
                    monday: '', tuesday: '', wednesday: '', thursday: '',
                    friday: '', saturday: '', sunday: ''
                }
            },

            // Дейности - адаптирам структурата от activities.list към activities с подкатегории
            activities: {
                regular: formData.activities?.regular || [],
                events: formData.activities?.events || [],
                trips: formData.activities?.trips || [],
                courses: formData.activities?.courses || []
            },

            // Финанси
            finances: {
                budget: formData.finances?.budget || { yearly: 0, currency: 'BGN' },
                funding: formData.finances?.funding || [],
                sponsors: formData.finances?.sponsors || []
            },

            // Регионална информация
            regionalInfo: formData.regionalInfo || {
                isCentralClub: false,
                centralClubId: '',
                affiliatedClubs: [],
                coverageArea: '',
                regionalRole: 'local'
            },

            // Постижения
            achievements: formData.achievements || {
                awards: [],
                certificates: [],
                recognitions: []
            },

            // Социално въздействие
            socialImpact: formData.socialImpact || {
                volunteering: [],
                communityProjects: [],
                partnerships: []
            },

            // Специфични за пенсионери
            pensionersSpecific: formData.pensionersSpecific || {},

            // Статистики - генерирам базови статистики
            stats: {
                totalMembers: formData.members?.length || 0,
                programs: formData.activities?.list?.length || 0,
                events: formData.activities?.list?.filter(a => a.type === 'event')?.length || 0,
                yearsActive: formData.foundedYear ? new Date().getFullYear() - formData.foundedYear : 0,
                performances: 0,
                projectsBeneficiaries: 0,
                donationsDistributed: 0,
                competitions: 0,
                avgWeeklyWorkouts: 0
            },

            // Настройки
            preferences: formData.preferences || {
                showFinances: false,
                showMembersList: false,
                allowOnlineRegistration: false,
                showContactForm: false,
                enableCalendar: false,
                showTestimonials: false,
                publicGallery: false,
                showStatistics: false,
                allowComments: false,
                showNewsSection: false
            },

            // Метаданни
            metadata: {
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                createdBy: 'preview',
                isVerified: false,
                isPublic: false,
                tags: [],
                rating: 0,
                views: 0,
                followers: 0
            },

            // Preview specific флаг
            isPreview: true
        };
    }, [formData, t]);

    // Избиране на темплейт
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

    // Навигационна логика - същата като в ClubView
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

    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            const container = isPreviewMode 
                ? document.querySelector('.club-preview-modal-content')
                : window;

            if (isPreviewMode) {
                const containerRect = document.querySelector('.club-preview-modal-content').getBoundingClientRect();
                const elementRect = element.getBoundingClientRect();
                const scrollTop = document.querySelector('.club-preview-modal-content').scrollTop;
                const targetScrollTop = scrollTop + elementRect.top - containerRect.top - 120;

                document.querySelector('.club-preview-modal-content').scrollTo({
                    top: targetScrollTop,
                    behavior: 'smooth'
                });
            } else {
                const yOffset = -120;
                const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                
                window.scrollTo({
                    top: y,
                    behavior: 'smooth'
                });
            }

            setActiveSection(sectionId);
        }
    };

    const scrollToTop = () => {
        if (isPreviewMode) {
            document.querySelector('.club-preview-modal-content')?.scrollTo({ 
                top: 0, 
                behavior: 'smooth' 
            });
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Effects
    useEffect(() => {
        if (previewClub) {
            setTimeout(() => {
                updateAvailableNavItems();
            }, 300);
        }
    }, [previewClub, allNavItems]);

    useEffect(() => {
        const handleScroll = () => {
            const scrollY = isPreviewMode 
                ? document.querySelector('.club-preview-modal-content')?.scrollTop || 0
                : window.scrollY;
                
            setShowBackToTop(scrollY > 300);
        };

        const scrollContainer = isPreviewMode 
            ? document.querySelector('.club-preview-modal-content')
            : window;

        if (scrollContainer) {
            scrollContainer.addEventListener('scroll', handleScroll);
            return () => scrollContainer.removeEventListener('scroll', handleScroll);
        }
    }, [isPreviewMode]);

    if (!previewClub) {
        return (
            <div className="club-preview-loading">
                <div className="loading-spinner"></div>
                <p>{t('clubForm.preview.loading')}</p>
            </div>
        );
    }

    return (
        <div className={`club-preview-container ${isPreviewMode ? 'preview-mode' : ''}`}>
            
            {/* Preview Header */}
            <div className="club-preview-header">
                <div className="club-preview-header-content">
                    <button onClick={onClose} className="club-preview-back-btn">
                        <FontAwesomeIcon icon={faArrowLeft} />
                        <span>{t('clubForm.preview.backToForm')}</span>
                    </button>

                    <div className="club-preview-info">
                        <div className="club-preview-badge">
                            {t('clubForm.preview.badge')}
                        </div>
                        
                        <div className="club-header-info">
                            <h1 className="club-header-title">{previewClub.name}</h1>
                            <div className="club-header-location">
                                <FontAwesomeIcon icon={faMapMarkerAlt} />
                                <span>{previewClub.location.city || t('clubForm.preview.noLocation')}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="club-preview-main">
                {getTemplate(previewClub)}
            </main>

            {/* Navigation Sidebar */}
            {availableNavItems.length > 0 && (
                <nav className={`club-nav-sidebar preview-nav ${navCollapsed ? 'club-collapsed' : 'club-expanded'}`}>
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

            {/* Back to Top */}
            {showBackToTop && (
                <button onClick={scrollToTop} className="club-back-to-top preview-back-to-top">
                    <FontAwesomeIcon icon={faArrowUp} />
                </button>
            )}
        </div>
    );
};

export default ClubPreview;