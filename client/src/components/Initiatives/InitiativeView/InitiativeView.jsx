import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { LocalizedLink as Link } from '../../LocalizedLink/LocalizedLink';
import './initiativeView.css';
import { useTranslation } from 'react-i18next';
import { useInitiativeContext } from '../../contexts/InitiativeProvider';
import { useAuthContext } from '../../contexts/UserContext';
import { useClubContext } from '../../contexts/ClubContext';
import { Loader } from '../../Loader/Loader';
import { StoriesPublications } from './StoriesPublications/StoriesPublications';
import { InitiativesMap } from '../InitiativesList/InitiativesMap/InitiativesMap';
import { ProjectCard } from './ProjectCard/ProjectCard';
import { ContactSection } from './ContactSection/ContactSection';
import { Comments } from './Comments/Comments';
import { truncateText } from '../../../utils/truncateText';
import { useAnalytics } from '../../contexts/AnalyticsContext';
import { useTrackContentView } from '../../hooks/useTrackContentView';
import ImageSlider from '../../Articles/ArticleView/ImageSlider/ImageSlider';
import { getDescriptionParts, renderSlateContent } from '../../../utils/slateRenderer.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCalendar, faHandshake, faTrophy, faTag,
    faQuestionCircle, faMapMarkerAlt, faEnvelope, faPhone,
    faGlobe, faBullseye, faMoneyBillWave, faImage,
    faBuilding
} from '@fortawesome/free-solid-svg-icons';
import {
    faFacebook, faInstagram, faLinkedin, faTwitter
} from '@fortawesome/free-brands-svg-icons';
import { TextZoom } from '../../TextZoom/TextZoom.jsx';
import SEOHead from '../../SEO/SEOHead.jsx';
import { getResizedUrl } from '../../../utils/firebaseImageResize';

export const InitiativeView = () => {
    const { slug } = useParams();
    const { t } = useTranslation('content');
    const { getInitiativeById } = useInitiativeContext();
    const { profileData, isAuthentication } = useAuthContext();
    const { sendPersonalEmail } = useClubContext();

    const [initiative, setInitiative] = useState(null);
    useTrackContentView('initiative', initiative?.id);
    const [isLoading, setIsLoading] = useState(true);
    const [showMap, setShowMap] = useState(true);
    const { trackInitiative } = useAnalytics();
    const [openFaqIndex, setOpenFaqIndex] = useState(null);
    const [activeSection, setActiveSection] = useState('detailed-description');
    const sectionsRef = useRef(new Map());

    // Email Modal States
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [emailRecipient, setEmailRecipient] = useState({ name: '', email: '' });
    const [emailForm, setEmailForm] = useState({
        from: '',
        to: '',
        subject: '',
        message: ''
    });
    const [emailStatus, setEmailStatus] = useState({ type: '', message: '' });
    const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);

    // Email Modal Functions
    const openEmailModal = (name, email) => {
        setEmailRecipient({ name, email });
        setEmailForm({
            from: profileData?.email || '',
            to: email,
            subject: `Запитване относно инициатива: ${initiative.title}`,
            message: ''
        });
        setEmailStatus({ type: '', message: '' });
        setIsEmailModalOpen(true);
    };

    const closeEmailModal = () => {
        setIsEmailModalOpen(false);
        setEmailForm({
            from: '',
            to: '',
            subject: '',
            message: ''
        });
        setEmailStatus({ type: '', message: '' });
    };

    const handleEmailFormChange = (e) => {
        const { name, value } = e.target;
        setEmailForm(prev => ({ ...prev, [name]: value }));
        if (emailStatus.type === 'error') {
            setEmailStatus({ type: '', message: '' });
        }
    };

    const handleEmailSubmit = async (e) => {
        e.preventDefault();

        if (!emailForm.from.trim() || !emailForm.to.trim() || !emailForm.subject.trim() || !emailForm.message.trim()) {
            setEmailStatus({
                type: 'error',
                message: 'Моля, попълнете всички полета'
            });
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailForm.from)) {
            setEmailStatus({
                type: 'error',
                message: 'Моля, въведете валиден имейл адрес в полето "От"'
            });
            return;
        }
        if (!emailRegex.test(emailForm.to)) {
            setEmailStatus({
                type: 'error',
                message: 'Моля, въведете валиден имейл адрес в полето "До"'
            });
            return;
        }

        setIsSubmittingEmail(true);

        try {
            const success = await sendPersonalEmail({
                from: emailForm.from,
                to: emailForm.to,
                subject: emailForm.subject,
                message: emailForm.message
            });

            if (success) {
                setEmailStatus({
                    type: 'success',
                    message: 'Съобщението е изпратено успешно!'
                });
                setTimeout(() => {
                    closeEmailModal();
                }, 2000);
            } else {
                setEmailStatus({
                    type: 'error',
                    message: 'Възникна грешка при изпращането!'
                });
            }
        } catch (error) {
            console.error('Error sending email:', error);
            setEmailStatus({
                type: 'error',
                message: 'Възникна грешка при изпращането!'
            });
        } finally {
            setIsSubmittingEmail(false);
        }
    };
    // ✅ META DATA - ДИНАМИЧНИ META TAGS
    const metaData = useMemo(() => {
        if (!initiative) {
            return {
                title: 'Инициатива | Pensa Club',
                description: 'Зареждане на инициатива...',
                keywords: 'инициатива, Pensa Club',
                image: '/images/iniciatives/iniciatives-2.jpg',
                author: 'Pensa Foundation',
                section: null,
                tags: [],
                publishedTime: null,
                modifiedTime: null
            };
        }

        // Description - от shortDescription или detailedDescription
        let description = '';
        if (initiative.shortDescription) {
            description = typeof initiative.shortDescription === 'string'
                ? initiative.shortDescription.replace(/<[^>]*>/g, '')
                : '';
        } else if (initiative.detailedDescription) {
            const detailedText = typeof initiative.detailedDescription === 'string'
                ? initiative.detailedDescription.replace(/<[^>]*>/g, '')
                : '';
            description = detailedText;
        }
        description = description.substring(0, 160).trim() || 'Инициатива от Pensa Club за дигитална грамотност и социално включване на пенсионери.';

        // Keywords
        const baseKeywords = [
            'инициатива',
            'Pensa Club',
            'пенсионери',
            'дигитална грамотност',
            'социално включване'
        ];

        if (initiative.category) {
            baseKeywords.push(initiative.category.toLowerCase());
        }

        if (initiative.tags && Array.isArray(initiative.tags)) {
            baseKeywords.push(...initiative.tags.map(tag => tag.toLowerCase()));
        }

        const image = initiative.mainImage?.src || '/images/iniciatives/iniciatives-2.jpg';
        const author = initiative.responsible?.name || initiative.organization?.name || 'Pensa Foundation';
        const section = initiative.category || null;
        const tags = initiative.tags || [];
        const publishedTime = initiative.startDate || initiative.createdAt || null;
        const modifiedTime = initiative.endDate || initiative.updatedAt || publishedTime;

        return {
            title: `${initiative.title} | Pensa Club`,
            description,
            keywords: baseKeywords.join(', '),
            image,
            author,
            section,
            tags,
            publishedTime,
            modifiedTime
        };
    }, [initiative]);

    // ✅ STRUCTURED DATA - EVENT SCHEMA
    const structuredData = useMemo(() => {
        if (!initiative) return null;

        // Event status mapping
        const eventStatusMap = {
            'active': 'https://schema.org/EventScheduled',
            'completed': 'https://schema.org/EventScheduled', // или EventCompleted ако има
            'upcoming': 'https://schema.org/EventScheduled',
            'cancelled': 'https://schema.org/EventCancelled',
            'postponed': 'https://schema.org/EventPostponed'
        };

        const eventStatus = eventStatusMap[initiative.status] || 'https://schema.org/EventScheduled';

        // Location
        let location = null;
        if (initiative.location && initiative.location.length > 0) {
            const firstLocation = initiative.location[0];
            location = {
                "@type": "Place",
                "name": firstLocation.address || "Различни локации",
                ...(firstLocation.coordinates && {
                    "geo": {
                        "@type": "GeoCoordinates",
                        "latitude": firstLocation.coordinates.lat,
                        "longitude": firstLocation.coordinates.lng
                    }
                }),
                "address": {
                    "@type": "PostalAddress",
                    "addressCountry": "BG"
                }
            };
        }

        return {
            "@context": "https://schema.org",
            "@type": "Event",
            "name": initiative.title,
            "description": metaData.description,
            "image": metaData.image,
            "url": `https://pensa.club/initiatives/${slug}`,
            ...(initiative.startDate && {
                "startDate": initiative.startDate
            }),
            ...(initiative.endDate && {
                "endDate": initiative.endDate
            }),
            "eventStatus": eventStatus,
            "eventAttendanceMode": "https://schema.org/MixedEventAttendanceMode",
            "organizer": {
                "@type": "Organization",
                "name": initiative.organization?.name || "Pensa Club",
                "url": initiative.organization?.website || "https://pensa.club",
                ...(initiative.organization?.address && {
                    "address": {
                        "@type": "PostalAddress",
                        "streetAddress": initiative.organization.address,
                        "addressCountry": "BG"
                    }
                })
            },
            ...(location && { "location": location }),
            ...(initiative.expectedBudget && {
                "offers": {
                    "@type": "Offer",
                    "price": initiative.expectedBudget,
                    "priceCurrency": initiative.currency || "BGN",
                    "availability": "https://schema.org/InStock"
                }
            }),
            ...(initiative.category && {
                "genre": initiative.category
            }),
            ...(initiative.tags && {
                "keywords": initiative.tags.join(', ')
            }),
            "inLanguage": "bg"
        };
    }, [initiative, metaData, slug]);

    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }, []);

    useEffect(() => {
        const fetchInitiative = async () => {
            setIsLoading(true);
            try {
                const data = await getInitiativeById(slug);

                setInitiative(data);
                if (data) {
                    trackInitiative(data.id, data.title);
                }
            } catch (error) {
                console.error('Error fetching initiative:', error);
                setInitiative(null);
            } finally {
                setIsLoading(false);
            }
        };

        if (slug) {
            fetchInitiative();
        }
    }, [slug, getInitiativeById]);

    useEffect(() => {
        const observerOptions = {
            root: null,
            rootMargin: '-20% 0px -60% 0px',
            threshold: 0.1
        };

        const observerCallback = (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const sectionId = entry.target.id;
                    setActiveSection(sectionId);
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);

        const sectionIds = [
            'detailed-description', 'sections', 'stories', 'projects', 'projects-grid', 'timeline', 'target-scope',
            'progress-results', 'partners-sponsors', 'contact', 'faq', 'comments'
        ];

        sectionIds.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                observer.observe(element);
                sectionsRef.current.set(id, element);
            }
        });

        return () => {
            sectionsRef.current.forEach((element) => {
                observer.unobserve(element);
            });
            sectionsRef.current.clear();
        };
    }, [initiative]);

    const renderImages = (images, className = "") => {
        if (!images || images.length === 0) return null;

        if (images.length === 1) {
            return (
                <img
                    src={getResizedUrl(images[0].src, 1200)}
                    alt={images[0].alt}
                    className={className}
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                        if (images[0].src && e.target.src !== images[0].src) e.target.src = images[0].src;
                    }}
                />
            );
        } else {
            return (
                <div className={`image-slider-container ${className}`}>
                    <ImageSlider images={images} />
                </div>
            );
        }
    };

    const toggleFaq = (index) => {
        setOpenFaqIndex(openFaqIndex === index ? null : index);
    };

    const handleSmoothScroll = (e) => {
        e.preventDefault();
        const targetId = e.currentTarget.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
            setActiveSection(targetId);
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    };

    const transformProjectsForMap = (projects) => {
        if (!projects) return [];

        const transformedProjects = projects
            .filter(project => {
                return project.coordinates &&
                    project.coordinates.lat &&
                    project.coordinates.lng;
            })
            .map((project) => ({
                id: project.id,
                title: project.title,
                shortDescription: project.description,
                category: "Проект",
                status: project.status,
                location: {
                    address: project.address || "",
                    coordinates: project.coordinates
                },
                link: `/projects/${project.slug}`
            }));

        return transformedProjects;
    };

    const renderContent = (content) => {
        if (!content) {
            return <p>{t('initiatives.view.placeholders.noContent')}</p>;
        }

        if (typeof content === 'string') {
            if (content.includes('<') && content.includes('>')) {
                return <div dangerouslySetInnerHTML={{ __html: content }} />;
            }
            return <p>{content}</p>;
        }

        if (Array.isArray(content)) {
            return renderSlateContent(content);
        }

        if (typeof content === 'object') {
            try {
                return renderSlateContent(content);
            } catch (error) {
                console.warn('Failed to render content as Slate:', error);
                return <p>{JSON.stringify(content)}</p>;
            }
        }

        return <p>{String(content)}</p>;
    };

    if (isLoading) {
        return <Loader />;
    }

    if (!initiative) {
        return (
            <div className="initiative-not-found">
                <h1>{t('initiatives.view.notFound')}</h1>
                <Link to="/initiatives" className="back-link">
                    {t('initiatives.view.backToList')}
                </Link>
            </div>
        );
    }

    const { firstSentence, restSentences } = getDescriptionParts(initiative.shortDescription);
    const projectsForMap = transformProjectsForMap(initiative.projects);

    // Helper функции за валидация
    const hasRealContent = (content) => {
        if (!content) return false;

        if (typeof content === 'string') {
            const textOnly = content.replace(/<[^>]*>/g, '').trim();
            return textOnly.length > 0;
        }

        if (Array.isArray(content)) {
            return content.length > 0;
        }

        return !!content;
    };

    const hasValidKpis = (kpis) => {
        if (!kpis || !Array.isArray(kpis) || kpis.length === 0) return false;
        return kpis.some(kpi =>
            (kpi.name && kpi.name !== null && kpi.name.trim() !== '') ||
            (kpi.target && kpi.target !== null && String(kpi.target).trim() !== '')
        );
    };

    // Check if Progress & Results section has any data
    const hasKpis = hasValidKpis(initiative.kpis);
    const hasExpectedResults = hasRealContent(initiative.expectedResults);
    const hasProgressReport = hasRealContent(initiative.progressReport);
    const hasProgressResultsData = hasKpis || hasExpectedResults || hasProgressReport;

    return (
        <>
            {/* ✅ SEO HEAD */}
            {initiative && (
                <SEOHead
                    title={metaData.title}
                    description={metaData.description}
                    keywords={metaData.keywords}
                    image={metaData.image}
                    type="article"
                    publishedTime={metaData.publishedTime}
                    modifiedTime={metaData.modifiedTime}
                    author={metaData.author}
                    section={metaData.section}
                    tags={metaData.tags}
                    structuredData={structuredData}
                />
            )}
            <div className="initiative-view">
                {/* Hero Section */}
                <div className="initiative-hero">
                    <div className="initiative-hero-image">
                        {initiative.mainImage?.src ? (
                            <img
                                src={getResizedUrl(initiative.mainImage.src, 1200)}
                                alt={initiative.mainImage.alt || initiative.title}
                                className="hero-image"
                                decoding="async"
                                onError={(e) => {
                                    if (e.target.src !== initiative.mainImage.src) e.target.src = initiative.mainImage.src;
                                }}
                            />
                        ) : (
                            <div className="hero-placeholder">
                                <FontAwesomeIcon icon={faImage} size="4x" />
                                <p>Няма главно изображение</p>
                            </div>
                        )}
                    </div>

                    <div className="initiative-hero-content">
                        <div className="initiative-header">
                            {initiative.logo && (
                                <div className="initiative-logo">
                                    <img
                                        src={getResizedUrl(initiative.logo, 200)}
                                        alt="Initiative Logo"
                                        loading="lazy"
                                        decoding="async"
                                        onError={(e) => {
                                            if (e.target.src !== initiative.logo) e.target.src = initiative.logo;
                                        }}
                                    />
                                </div>
                            )}

                            <h1 className="initiative-title">{initiative.title}</h1>

                            <div className="initiative-description">
                                <p className="first-sentence">{firstSentence}</p>

                                {restSentences && (
                                    <p className="rest-sentences">{restSentences}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sticky Navigation */}
                <nav className="initiative-sticky-nav">
                    <div className="container">
                        <div className="sticky-nav-links">
                            {initiative.detailedDescription && (

                                <a href="#detailed-description"
                                    onClick={handleSmoothScroll}
                                    className={`sticky-nav-link ${activeSection === 'detailed-description' ? 'active' : ''}`}
                                >
                                    {t('initiatives.view.navigation.description')}
                                </a>
                            )}

                            {initiative.sections && initiative.sections.length > 0 && (

                                <a href="#sections"
                                    onClick={handleSmoothScroll}
                                    className={`sticky-nav-link ${activeSection === 'sections' ? 'active' : ''}`}
                                >
                                    {t('initiatives.view.navigation.sections')}
                                </a>
                            )}
                            {((initiative.stories && initiative.stories.length > 0) || (initiative.publications && initiative.publications.length > 0)) && (

                                <a href='#stories'
                                    onClick={handleSmoothScroll}
                                    className={`sticky-nav-link ${(activeSection === 'stories') ? 'active' : ''}`}
                                >
                                    {t('initiatives.view.navigation.publications')}
                                </a>
                            )}
                            {initiative.projects?.length > 0 && (

                                <a href={projectsForMap.length > 0 ? "#projects" : "#projects-grid"}
                                    onClick={handleSmoothScroll}
                                    className={`sticky-nav-link ${(activeSection === 'projects' || activeSection === 'projects-grid') ? 'active' : ''}`}
                                >
                                    {t('initiatives.view.navigation.projects')}
                                </a>
                            )}

                            {(initiative.startDate || initiative.endDate || initiative.milestones?.length > 0) && (

                                <a href="#timeline"
                                    onClick={handleSmoothScroll}
                                    className={`sticky-nav-link ${activeSection === 'timeline' ? 'active' : ''}`}
                                >
                                    {t('initiatives.view.navigation.timeline')}
                                </a>
                            )}

                            {(initiative.targetAge?.length > 0 || initiative.targetAudience?.length > 0 || initiative.expectedBudget) && (

                                <a href="#target-scope"
                                    onClick={handleSmoothScroll}
                                    className={`sticky-nav-link ${activeSection === 'target-scope' ? 'active' : ''}`}
                                >
                                    {t('initiatives.view.navigation.audience')}
                                </a>
                            )}

                            {hasProgressResultsData && (

                                <a href="#progress-results"
                                    onClick={handleSmoothScroll}
                                    className={`sticky-nav-link ${activeSection === 'progress-results' ? 'active' : ''}`}
                                >
                                    {t('initiatives.view.navigation.results')}
                                </a>
                            )}

                            {(initiative.partners?.length > 0 || initiative.sponsors?.length > 0) && (

                                <a href="#partners-sponsors"
                                    onClick={handleSmoothScroll}
                                    className={`sticky-nav-link ${activeSection === 'partners-sponsors' ? 'active' : ''}`}
                                >
                                    {t('initiatives.view.navigation.partners')}
                                </a>
                            )}
                            {(initiative.contact?.name !== "") && (
                                <a href="#contact"
                                    onClick={handleSmoothScroll}
                                    className={`sticky-nav-link ${activeSection === 'contact' ? 'active' : ''}`}
                                >
                                    {t('initiatives.view.navigation.contact')}
                                </a>
                            )}
                            {initiative.faq?.length > 0 && (

                                <a href="#faq"
                                    onClick={handleSmoothScroll}
                                    className={`sticky-nav-link ${activeSection === 'faq' ? 'active' : ''}`}
                                >
                                    {t('initiatives.view.navigation.faq')}
                                </a>
                            )}

                            {initiative.commentsEnabled && (

                                <a href="#comments"
                                    onClick={handleSmoothScroll}
                                    className={`sticky-nav-link ${activeSection === 'comments' ? 'active' : ''}`}
                                >
                                    {t('initiatives.view.navigation.comments')}
                                </a>
                            )}
                        </div>
                    </div>
                </nav >

                <div className="initiative-content"></div>
                <div className="initiative-content">

                    {/* Detailed Description */}
                    {initiative.detailedDescription && (
                        <section id="detailed-description" className="detailed-description-section">
                            <h2 className="section-title">{t('initiatives.view.sectionTitles.detailedDescription')}</h2>
                            <div className="detailed-content slate-content" data-editor="slate">
                                {renderContent(initiative.detailedDescription)}
                            </div>
                        </section>
                    )}

                    {/* Sections */}
                    {initiative.sections && Array.isArray(initiative.sections) && initiative.sections.length > 0 && (
                        <section id="sections" className="initiative-sections">
                            <h2 className="section-title">
                                {t('initiatives.view.aboutInitiative')}
                            </h2>

                            <div className="sections-grid">
                                {initiative.sections.map((section, index) => {
                                    const hasImages = (section.images && section.images.length > 0) ||
                                        (section.image && Array.isArray(section.image) && section.image.length > 0);

                                    return (
                                        <div
                                            key={`section-${section.id || section.titleSlug || index}`}
                                            className={`content-section ${!hasImages ? 'no-image' : ''}`}
                                        >
                                            <div className="section-content-initiative">
                                                <h3 className="section-heading">{section.title}</h3>
                                                <div className="section-text slate-content" data-editor="slate">
                                                    {renderContent(section.content)}
                                                </div>
                                            </div>

                                            {section.images?.length > 0 && (
                                                <div className="section-image">
                                                    {renderImages(section.images, "section-slider")}
                                                </div>
                                            )}
                                            {!section.images && section.image && Array.isArray(section.image) && section.image.length > 0 && (
                                                <div className="section-image">
                                                    <img
                                                        src={getResizedUrl(section.image[0].src, 1200)}
                                                        alt={section.image[0].alt || section.title}
                                                        loading="lazy"
                                                        decoding="async"
                                                        onError={(e) => {
                                                            if (e.target.src !== section.image[0].src) e.target.src = section.image[0].src;
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    )}

                    {/* Gallery */}
                    {initiative.gallery?.length > 0 && (
                        <section id="gallery" className="gallery-section">
                            <h2 className="section-title">{t('initiatives.view.sectionTitles.gallery')}</h2>
                            <div className="gallery-grid">
                                {initiative.gallery.map((image, index) => (
                                    <div key={index} className="gallery-item">
                                        <img
                                            src={getResizedUrl(image.src, 600)}
                                            alt={image.alt}
                                            loading="lazy"
                                            decoding="async"
                                            onError={(e) => {
                                                if (image.src && e.target.src !== image.src) e.target.src = image.src;
                                            }}
                                        />
                                        {image.caption && (
                                            <p className="gallery-caption">{image.caption}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Download Materials */}
                    {initiative.downloadMaterials && Array.isArray(initiative.downloadMaterials) && initiative.downloadMaterials.length > 0 && (
                        <section className="download-materials">
                            <h2 className="section-title">
                                {t('initiatives.view.downloadMaterials')}
                            </h2>

                            <div className="materials-grid">
                                {initiative.downloadMaterials.map((material) => (
                                    <div key={`download-material-${material.id || material.titleSlug}`} className="material-card">
                                        <div className="material-preview">
                                            {material.image ? (
                                                <img
                                                    src={getResizedUrl(material.image.src, 200)}
                                                    alt={material.image.alt}
                                                    loading="lazy"
                                                    decoding="async"
                                                    onError={(e) => {
                                                        if (material.image.src && e.target.src !== material.image.src) e.target.src = material.image.src;
                                                    }}
                                                />
                                            ) : (
                                                <div className="material-icon">
                                                    {material.fileType === 'pdf' ? '📄' : '📁'}
                                                </div>
                                            )}
                                        </div>

                                        <div className="material-info">
                                            <h3 className="material-title">{material.title}</h3>
                                            <p className="material-description">{truncateText(material.description, 40)}</p>

                                            <div className="material-meta">
                                                <span className="file-type">{material.fileType?.toUpperCase()}</span>
                                                <span className="file-size">{material.fileSize}</span>
                                            </div>

                                            <a href={material.downloadUrl}
                                                className="download-btn"
                                                download
                                            >
                                                <span className="download-icon">⬇️</span>
                                                {t('initiatives.view.download')}
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Stories & Publications */}
                    {((initiative.stories && initiative.stories.length > 0) || (initiative.publications && initiative.publications.length > 0)) && (
                        <StoriesPublications
                            stories={initiative.stories || []}
                            publications={initiative.publications || []}
                        />
                    )}

                    {/* Projects Map Section */}
                    {projectsForMap.length > 0 && (
                        <section id="projects" className="projects-section">
                            <h2 className="section-title">
                                {t('initiatives.view.projectsOnMap')}
                            </h2>

                            {!showMap && (
                                <button
                                    onClick={() => setShowMap(true)}
                                    className="show-map-btn"
                                >
                                    🗺️ {t('initiatives.view.showMap')}
                                </button>
                            )}

                            {showMap && (
                                <InitiativesMap
                                    initiatives={projectsForMap}
                                    onHide={() => setShowMap(false)}
                                />
                            )}
                        </section>
                    )}

                    {/* Projects Grid */}
                    {initiative.projects && Array.isArray(initiative.projects) && initiative.projects.length > 0 && (
                        <section id="projects-grid" className="projects-grid-section">
                            <h2 className="section-title">
                                {t('initiatives.view.projectsOverview')}
                            </h2>

                            <div className="projects-grid">
                                {initiative.projects.map((project) => (
                                    <ProjectCard key={`initiative-project-${project.id || project.titleSlug}`} project={project} />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Timeline Section */}
                    {(initiative.startDate || initiative.endDate || initiative.milestones?.length > 0) && (
                        <section id="timeline" className="timeline-section">
                            <h2 className="section-title">
                                <FontAwesomeIcon icon={faCalendar} />
                                {t('initiatives.view.sectionTitles.timeline')}
                            </h2>

                            <div className="timeline-content">
                                {(initiative.startDate || initiative.endDate) && (
                                    <div className="timeline-dates">
                                        {initiative.startDate && (
                                            <div className="timeline-date">
                                                <strong>{t('initiatives.view.timeline.startDate')}</strong> {new Date(initiative.startDate).toLocaleDateString('bg-BG')}
                                            </div>
                                        )}
                                        {initiative.endDate && (
                                            <div className="timeline-date">
                                                <strong>{t('initiatives.view.timeline.endDate')}</strong> {new Date(initiative.endDate).toLocaleDateString('bg-BG')}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {initiative.milestones?.length > 0 && (
                                    <div className="milestones-preview">
                                        <h3>{t('initiatives.view.timeline.milestones')}</h3>
                                        <div className="milestones-list">
                                            {initiative.milestones.map((milestone, index) => (
                                                <div key={index} className="milestone-preview-item">
                                                    <div className="milestone-date">
                                                        {milestone.date && new Date(milestone.date).toLocaleDateString('bg-BG')}
                                                    </div>
                                                    <div className="milestone-description">
                                                        {milestone.description}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    {/* Target Scope */}
                    {(initiative.targetAge?.length > 0 || initiative.targetAudience?.length > 0 || initiative.expectedBudget || initiative.customAudience) && (
                        <section id="target-scope" className="target-scope-section">
                            <h2 className="section-title">
                                <FontAwesomeIcon icon={faBullseye} />
                                {t('initiatives.view.sectionTitles.targetScope')}
                            </h2>

                            <div className="target-scope-content">
                                {initiative.targetAge?.length > 0 && (
                                    <div className="target-item">
                                        <h4>{t('initiatives.view.targetScope.targetAge')}</h4>
                                        <div className="target-tags">
                                            {initiative.targetAge.map((age, index) => (
                                                <span key={index} className="target-tag age-tag">{age}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {initiative.targetAudience?.length > 0 && (
                                    <div className="target-item">
                                        <h4>{t('initiatives.view.targetScope.targetAudience')}</h4>
                                        <div className="target-tags">
                                            {initiative.targetAudience.map((audience, index) => (
                                                <span key={index} className="target-tag audience-tag">{audience}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {initiative.customAudience && (
                                    <div className="target-item">
                                        <h4>{t('initiatives.view.targetScope.customAudience')}</h4>
                                        <p className="custom-audience-text">{initiative.customAudience}</p>
                                    </div>
                                )}

                                {initiative.expectedBudget && (
                                    <div className="target-item">
                                        <h4>{t('initiatives.view.targetScope.expectedBudget')}</h4>
                                        <div className="budget-display">
                                            <FontAwesomeIcon icon={faMoneyBillWave} />
                                            {parseInt(initiative.expectedBudget).toLocaleString()} {initiative.currency || 'BGN'}
                                        </div>
                                    </div>
                                )}

                                {initiative.fundingSources?.length > 0 && (
                                    <div className="target-item">
                                        <h4>{t('initiatives.view.targetScope.fundingSources')}</h4>
                                        <div className="target-tags">
                                            {initiative.fundingSources.map((source, index) => (
                                                <span key={index} className="target-tag funding-tag">{source}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    {/* Progress & Results - Conditional Rendering */}
                    {hasProgressResultsData && (
                        <section id="progress-results" className="progress-results-section">
                            <h2 className="section-title">
                                <FontAwesomeIcon icon={faTrophy} />
                                {t('initiatives.view.sectionTitles.progressResults')}
                            </h2>

                            {hasKpis && (
                                <div className="kpis-preview">
                                    <h3>{t('initiatives.view.progressResults.kpis')}</h3>
                                    <div className="kpis-grid">
                                        {initiative.kpis.filter(kpi =>
                                            (kpi.name && kpi.name !== null && kpi.name.trim() !== '') ||
                                            (kpi.target && kpi.target !== null && String(kpi.target).trim() !== '')
                                        ).map((kpi, index) => (
                                            <div key={index} className="kpi-preview-card">
                                                <h4>{kpi.name}</h4>
                                                <div className="kpi-target">{t('initiatives.view.progressResults.target')} {kpi.target}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {hasExpectedResults && (
                                <div className="expected-results-preview">
                                    <h3>{t('initiatives.view.progressResults.expectedResults')}</h3>
                                    <div className="results-content slate-content" data-editor="slate">
                                        {renderContent(initiative.expectedResults)}
                                    </div>
                                </div>
                            )}

                            {hasProgressReport && (
                                <div className="progress-report-preview">
                                    <h3>{t('initiatives.view.progressResults.progressReport')}</h3>
                                    <div className="report-content slate-content" data-editor="slate">
                                        {renderContent(initiative.progressReport)}
                                    </div>
                                </div>
                            )}
                        </section>
                    )}

                    {/* Partners & Sponsors */}
                    {(initiative.partners?.length > 0 || initiative.sponsors?.length > 0) && (
                        <section id="partners-sponsors" className="partners-sponsors-section">
                            <h2 className="section-title">
                                <FontAwesomeIcon icon={faHandshake} />
                                {t('initiatives.view.sectionTitles.partnersSponsors')}
                            </h2>

                            {initiative.partners?.length > 0 && (
                                <div className="partners-preview">
                                    <h3>{t('initiatives.view.partnersSponsors.partners')}</h3>
                                    <div className="partners-grid">
                                        {initiative.partners.filter(partner => partner.visible !== false).map((partner, index) => (
                                            <div key={index} className="partner-preview-card">
                                                {partner.logo && (
                                                    <div className="partner-logo">
                                                        <img
                                                            src={getResizedUrl(partner.logo, 200)}
                                                            alt={partner.name}
                                                            loading="lazy"
                                                            decoding="async"
                                                            onError={(e) => {
                                                                if (e.target.src !== partner.logo) e.target.src = partner.logo;
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                                <div className="partner-info">
                                                    <h4>{partner.name}</h4>
                                                    <p className="partner-type">{partner.type}</p>
                                                    {partner.description && (
                                                        <p className="partner-description">{partner.description}</p>
                                                    )}
                                                    {partner.website && (
                                                        <a href={partner.website} target="_blank" rel="noopener noreferrer" className="partner-website">
                                                            {t('initiatives.view.partnersSponsors.visitWebsite')}
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {initiative.sponsors?.length > 0 && (
                                <div className="sponsors-preview">
                                    <h3>{t('initiatives.view.partnersSponsors.sponsors')}</h3>
                                    <div className="sponsors-grid">
                                        {initiative.sponsors.filter(sponsor => sponsor.visible !== false).map((sponsor, index) => (
                                            <div key={index} className="sponsor-preview-card">
                                                {sponsor.logo && (
                                                    <div className="sponsor-logo">
                                                        <img
                                                            src={getResizedUrl(sponsor.logo, 200)}
                                                            alt={sponsor.name}
                                                            loading="lazy"
                                                            decoding="async"
                                                            onError={(e) => {
                                                                if (e.target.src !== sponsor.logo) e.target.src = sponsor.logo;
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                                <div className="sponsor-info">
                                                    <h4>{sponsor.name}</h4>
                                                    <p className="sponsor-type">{sponsor.type}</p>
                                                    {sponsor.amount && (
                                                        <p className="sponsor-amount">
                                                            {parseInt(sponsor.amount).toLocaleString()} {sponsor.currency || 'BGN'}
                                                        </p>
                                                    )}
                                                    {sponsor.website && (
                                                        <a href={sponsor.website} target="_blank" rel="noopener noreferrer" className="sponsor-website">
                                                            {t('initiatives.view.partnersSponsors.visitWebsite')}
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </section>
                    )}

                    {/* Organization Information */}
                    {(initiative.responsible?.name || initiative.organization?.name || Object.values(initiative.socialMedia || {}).some(link => link)) && (
                        <section className="organization-contact-section">
                            <h2 className="section-title">{t('initiatives.view.sectionTitles.organizationInfo')}</h2>
                            <div className="organization-contact-content">
                                {initiative.responsible?.name && (
                                    <div className="responsible-preview">
                                        <h3>{t('initiatives.view.organization.responsiblePerson')}</h3>
                                        <div className="responsible-card">
                                            {/* Image Section */}
                                            <div className="responsible-image-section">
                                                {initiative.responsible.image ? (
                                                    <img
                                                        src={getResizedUrl(initiative.responsible.image, 600)}
                                                        alt={initiative.responsible.name}
                                                        className="responsible-photo"
                                                        loading="lazy"
                                                        decoding="async"
                                                        onError={(e) => {
                                                            if (e.target.src !== initiative.responsible.image) e.target.src = initiative.responsible.image;
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="responsible-avatar">
                                                        {initiative.responsible.name.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Info Section */}
                                            <div className="responsible-info">
                                                <h4>{initiative.responsible.name}</h4>

                                                {/* Position and Role */}
                                                <div className="responsible-roles">
                                                    {initiative.responsible.position && (
                                                        <p className="responsible-position">{initiative.responsible.position}</p>
                                                    )}
                                                    {initiative.responsible.role && (
                                                        <p className="responsible-role">
                                                            <span className="role-label">Роля:</span> {initiative.responsible.role}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Contacts */}
                                                <div className="responsible-contacts">
                                                    {initiative.responsible.email && (
                                                        <div className="contact-item">
                                                            <FontAwesomeIcon icon={faEnvelope} className="contact-icon" />
                                                            <button
                                                                onClick={() => openEmailModal(initiative.responsible.name, initiative.responsible.email)}
                                                                className="contact-email-button"
                                                            >
                                                                {initiative.responsible.email}
                                                            </button>
                                                        </div>
                                                    )}
                                                    {initiative.responsible.phone && (
                                                        <div className="contact-item">
                                                            <FontAwesomeIcon icon={faPhone} className="contact-icon" />
                                                            <a href={`tel:${initiative.responsible.phone}`}>
                                                                {initiative.responsible.phone}
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {initiative.organization?.name && (
                                    <div className="organization-preview">
                                        <h3 className='organization-title-h3'>
                                            <FontAwesomeIcon icon={faBuilding} />
                                            {t('initiatives.view.organization.organization')}
                                        </h3>
                                        <div className="organization-info">
                                            <h4>{initiative.organization.name}</h4>
                                            {initiative.organization.website && (
                                                <a href={initiative.organization.website} target="_blank" rel="noopener noreferrer">
                                                    <FontAwesomeIcon icon={faGlobe} /> {initiative.organization.website}
                                                </a>
                                            )}
                                            {initiative.organization.address && (
                                                <p>
                                                    <FontAwesomeIcon icon={faMapMarkerAlt} /> {initiative.organization.address}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {Object.values(initiative.socialMedia || {}).some(link => link) && (
                                    <div className="social-media-preview">
                                        <h3>{t('initiatives.view.organization.socialMedia')}</h3>
                                        <div className="social-links">
                                            {initiative.socialMedia?.facebook && (
                                                <a href={initiative.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="social-link facebook">
                                                    <FontAwesomeIcon icon={faFacebook} />
                                                </a>
                                            )}
                                            {initiative.socialMedia?.instagram && (
                                                <a href={initiative.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="social-link instagram">
                                                    <FontAwesomeIcon icon={faInstagram} />
                                                </a>
                                            )}
                                            {initiative.socialMedia?.linkedin && (
                                                <a href={initiative.socialMedia.linkedin} target="_blank" rel="noopener noreferrer" className="social-link linkedin">
                                                    <FontAwesomeIcon icon={faLinkedin} />
                                                </a>
                                            )}
                                            {initiative.socialMedia?.twitter && (
                                                <a href={initiative.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="social-link twitter">
                                                    <FontAwesomeIcon icon={faTwitter} />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    {/* Contact Section */}
                    <ContactSection
                        contact={initiative.contact}
                        additionalContacts={initiative.additionalContacts}
                        openEmailModal={openEmailModal}
                    />

                    {/* Tags */}
                    {initiative.tags?.length > 0 && (
                        <section className="tags-section">
                            <h2 className="section-title">
                                <FontAwesomeIcon icon={faTag} />
                                {t('initiatives.view.sectionTitles.tags')}
                            </h2>
                            <div className="tags-display">
                                {initiative.tags.map((tag, index) => (
                                    <span key={index} className="tag-preview">{tag}</span>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* FAQ */}
                    {initiative.faq?.length > 0 && (
                        <section id="faq" className="faq-section">
                            <h2 className="section-title">
                                <FontAwesomeIcon icon={faQuestionCircle} />
                                {t('initiatives.view.sectionTitles.faq')}
                            </h2>
                            <div className="faq-list">
                                {initiative.faq.map((faqItem, index) => (
                                    <div key={index} className="faq-item-view">
                                        <h4
                                            className="faq-question"
                                            onClick={() => toggleFaq(index)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            ❓ {faqItem.question}
                                        </h4>
                                        <p className={`faq-answer ${openFaqIndex === index ? 'show' : ''}`}>
                                            {faqItem.answer}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Comments Section */}
                    <Comments
                        initiativeId={initiative.id || initiative.slug}
                        commentsEnabled={initiative.commentsEnabled}
                    />
                </div>

                {/* Email Modal */}
                {isEmailModalOpen && (
                    <div className="email-modal-overlay" onClick={closeEmailModal}>
                        <div className="email-modal-container" onClick={(e) => e.stopPropagation()}>
                            <div className="email-modal-header">
                                <h3>Изпрати имейл до {emailRecipient.name}</h3>
                                <button
                                    className="email-modal-close"
                                    onClick={closeEmailModal}
                                    aria-label="Затвори"
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handleEmailSubmit} className="email-modal-form">
                                <div className="email-form-group">
                                    <label htmlFor="emailFrom">
                                        От (Вашият имейл)
                                        <span className="required">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        id="emailFrom"
                                        name="from"
                                        value={emailForm.from}
                                        onChange={handleEmailFormChange}
                                        placeholder="your-email@example.com"
                                        required
                                        disabled={!isAuthentication}
                                    />
                                    {!isAuthentication && (
                                        <small className="email-form-hint">
                                            Влезте в профила си, за да изпратите имейл
                                        </small>
                                    )}
                                </div>

                                <div className="email-form-group">
                                    <label htmlFor="emailTo">
                                        До
                                        <span className="required">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        id="emailTo"
                                        name="to"
                                        value={emailForm.to}
                                        readOnly
                                        className="email-readonly"
                                    />
                                </div>

                                <div className="email-form-group">
                                    <label htmlFor="emailSubject">
                                        Относно
                                        <span className="required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="emailSubject"
                                        name="subject"
                                        value={emailForm.subject}
                                        onChange={handleEmailFormChange}
                                        placeholder="Относно..."
                                        required
                                        maxLength={200}
                                    />
                                </div>

                                <div className="email-form-group">
                                    <label htmlFor="emailMessage">
                                        Съобщение
                                        <span className="required">*</span>
                                    </label>
                                    <textarea
                                        id="emailMessage"
                                        name="message"
                                        value={emailForm.message}
                                        onChange={handleEmailFormChange}
                                        placeholder="Напишете вашето съобщение тук..."
                                        required
                                        rows={8}
                                        maxLength={2000}
                                    />
                                    <small className="email-char-count">
                                        {emailForm.message.length}/2000 символа
                                    </small>
                                </div>

                                {emailStatus.message && (
                                    <div className={`email-status-message ${emailStatus.type}`}>
                                        {emailStatus.message}
                                    </div>
                                )}

                                <div className="email-modal-actions">
                                    <button
                                        type="button"
                                        onClick={closeEmailModal}
                                        className="email-btn-cancel"
                                        disabled={isSubmittingEmail}
                                    >
                                        Отказ
                                    </button>
                                    <button
                                        type="submit"
                                        className="email-btn-submit"
                                        disabled={isSubmittingEmail || !isAuthentication}
                                    >
                                        {isSubmittingEmail ? 'Изпращане...' : 'Изпрати'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
                <TextZoom />
            </div >
        </>
    );
};