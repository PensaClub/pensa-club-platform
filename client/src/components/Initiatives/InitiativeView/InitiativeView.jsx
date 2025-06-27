import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import './initiativeView.css';
import { useTranslation } from 'react-i18next';
import { useInitiativeContext } from '../../contexts/InitiativeProvider';
import { Loader } from '../../Loader/Loader';
import { StoriesPublications } from './StoriesPublications/StoriesPublications';
import { InitiativesMap } from '../InitiativesList/InitiativesMap/InitiativesMap';
import { ProjectCard } from './ProjectCard/ProjectCard';
import { ContactSection } from './ContactSection/ContactSection';
import { Comments } from './Comments/Comments';
import { truncateText } from '../../../utils/truncateText';
import { useAnalytics } from '../../contexts/AnalyticsContext';
import ImageSlider from '../../Articles/ArticleView/ImageSlider/ImageSlider';
// Import вашите съществуващи утилити
import { getDescriptionParts, handleSmoothScroll, renderSlateContent } from '../../../utils/slateRenderer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCalendar, faUsers, faHandshake, faTrophy, faTag,
    faQuestionCircle, faMapMarkerAlt, faEnvelope, faPhone,
    faGlobe, faUser, faBullseye, faMoneyBillWave, faImage,
    faBuilding, faChartLine
} from '@fortawesome/free-solid-svg-icons';
import {
    faFacebook, faInstagram, faLinkedin, faTwitter
} from '@fortawesome/free-brands-svg-icons';

export const InitiativeView = () => {
    const { slug } = useParams();
    const { t } = useTranslation();
    const { getInitiativeById } = useInitiativeContext();
    const [initiative, setInitiative] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showMap, setShowMap] = useState(true);
    const { trackInitiative } = useAnalytics();
    const [openFaqIndex, setOpenFaqIndex] = useState(null);
    const [activeSection, setActiveSection] = useState('detailed-description');
    const sectionsRef = useRef(new Map());

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

    // Функция за рендериране на снимки с или без slider
    const renderImages = (images, className = "") => {
        if (!images || images.length === 0) return null;

        if (images.length === 1) {
            // Една снимка = обикновен img
            return (
                <img
                    src={images[0].src}
                    alt={images[0].alt}
                    className={className}
                />
            );
        } else {
            // Повече снимки = slider
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
                // Проверка за coordinates директно в проекта
                return project.coordinates &&
                    project.coordinates.lat &&
                    project.coordinates.lng;
            })
            .map((project) => ({
                id: project.id,
                title: project.title,
                // Използвай description вместо shortDescription
                shortDescription: project.description,
                category: "Проект",
                status: project.status,
                location: {
                    // Използвай coordinates директно от проекта
                    address: project.address || "",
                    coordinates: project.coordinates
                },
                link: `/projects/${project.slug}`
            }));

        return transformedProjects;
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

    return (
        <div className="initiative-view">
            {/* Hero Section */}
            <div className="initiative-hero">
                <div className="initiative-hero-image">
                    {initiative.mainImage?.src ? (
                        <img
                            src={initiative.mainImage.src}
                            alt={initiative.mainImage.alt || initiative.title}
                            className="hero-image"
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
                        {/* Initiative Logo */}
                        {initiative.logo && (
                            <div className="initiative-logo">
                                <img src={initiative.logo} alt="Initiative Logo" />
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

            {/* NEW: Sticky Navigation */}
            <nav className="initiative-sticky-nav">
                <div className="container">
                    <div className="sticky-nav-links">
                        {initiative.detailedDescription && (
                            <a
                                href="#detailed-description"
                                onClick={handleSmoothScroll}
                                className={`sticky-nav-link ${activeSection === 'detailed-description' ? 'active' : ''}`}
                            >
                                {t('initiatives.view.navigation.description')}
                            </a>
                        )}

                        {initiative.sections && initiative.sections.length > 0 && (
                            <a
                                href="#sections"
                                onClick={handleSmoothScroll}
                                className={`sticky-nav-link ${activeSection === 'sections' ? 'active' : ''}`}
                            >
                                {t('initiatives.view.navigation.sections')}
                            </a>
                        )}
                        {((initiative.stories && initiative.stories.length > 0) || (initiative.publications && initiative.publications.length > 0)) && (
                            <a
                                href='#stories'
                                onClick={handleSmoothScroll}
                                className={`sticky-nav-link ${(activeSection === 'stories') ? 'active' : ''}`}
                            >
                                {t('initiatives.view.navigation.publications')}
                            </a>
                        )}
                        {initiative.projects?.length > 0 && (
                            <a
                                href={projectsForMap.length > 0 ? "#projects" : "#projects-grid"}
                                onClick={handleSmoothScroll}
                                className={`sticky-nav-link ${(activeSection === 'projects' || activeSection === 'projects-grid') ? 'active' : ''}`}
                            >
                                {t('initiatives.view.navigation.projects')}
                            </a>
                        )}

                        {(initiative.startDate || initiative.endDate || initiative.milestones?.length > 0) && (
                            <a
                                href="#timeline"
                                onClick={handleSmoothScroll}
                                className={`sticky-nav-link ${activeSection === 'timeline' ? 'active' : ''}`}
                            >
                                {t('initiatives.view.navigation.timeline')}
                            </a>
                        )}

                        {(initiative.targetAge?.length > 0 || initiative.targetAudience?.length > 0 || initiative.expectedBudget) && (
                            <a
                                href="#target-scope"
                                onClick={handleSmoothScroll}
                                className={`sticky-nav-link ${activeSection === 'target-scope' ? 'active' : ''}`}
                            >
                                {t('initiatives.view.navigation.audience')}
                            </a>
                        )}

                        {(initiative.kpis?.length > 0 || initiative.expectedResults || initiative.progressReport) && (
                            <a
                                href="#progress-results"
                                onClick={handleSmoothScroll}
                                className={`sticky-nav-link ${activeSection === 'progress-results' ? 'active' : ''}`}
                            >
                                {t('initiatives.view.navigation.results')}
                            </a>
                        )}

                        {(initiative.partners?.length > 0 || initiative.sponsors?.length > 0) && (
                            <a
                                href="#partners-sponsors"
                                onClick={handleSmoothScroll}
                                className={`sticky-nav-link ${activeSection === 'partners-sponsors' ? 'active' : ''}`}
                            >
                                {t('initiatives.view.navigation.partners')}
                            </a>
                        )}

                        <a
                            href="#contact"
                            onClick={handleSmoothScroll}
                            className={`sticky-nav-link ${activeSection === 'contact' ? 'active' : ''}`}
                        >
                            {t('initiatives.view.navigation.contact')}
                        </a>

                        {initiative.faq?.length > 0 && (
                            <a
                                href="#faq"
                                onClick={handleSmoothScroll}
                                className={`sticky-nav-link ${activeSection === 'faq' ? 'active' : ''}`}
                            >
                                {t('initiatives.view.navigation.faq')}
                            </a>
                        )}

                        {initiative.commentsEnabled && (
                            <a
                                href="#comments"
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

                {/* 📖 NEW: Detailed Description */}
                {initiative.detailedDescription && (
                    <section id="detailed-description" className="detailed-description-section">
                        <h2 className="section-title">{t('initiatives.view.sectionTitles.detailedDescription')}</h2>
                        <div className="detailed-content slate-content" data-editor="slate">
                            {(() => {
                                // Ако няма съдържание
                                if (!initiative.detailedDescription) {
                                    return <p>{t('initiatives.view.placeholders.noContent')}</p>
                                }

                                // Ако е string (HTML или обикновен текст)
                                if (typeof initiative.detailedDescription === 'string') {
                                    // Ако изглежда като HTML
                                    if (initiative.detailedDescription.includes('<') && initiative.detailedDescription.includes('>')) {
                                        return <div dangerouslySetInnerHTML={{ __html: initiative.detailedDescription }} />;
                                    }
                                    // Ако е обикновен текст
                                    return <p>{initiative.detailedDescription}</p>;
                                }

                                // Ако е Slate.js структура (array)
                                if (Array.isArray(initiative.detailedDescription)) {
                                    return renderSlateContent(initiative.detailedDescription);
                                }

                                // Ако е обект, опитай се да го обработиш като Slate.js
                                if (typeof initiative.detailedDescription === 'object') {
                                    try {
                                        return renderSlateContent(initiative.detailedDescription);
                                    } catch (error) {
                                        console.warn('Failed to render detailed description as Slate:', error);
                                        return <p>{JSON.stringify(initiative.detailedDescription)}</p>;
                                    }
                                }

                                // Fallback
                                return <p>{String(initiative.detailedDescription)}</p>;
                            })()}
                        </div>
                    </section>
                )}

                {/* EXISTING: Sections - остават същите, но с подобрена Slate.js поддръжка */}

                {initiative.sections && Array.isArray(initiative.sections) && initiative.sections.length > 0 && (
                    <section id="sections" className="initiative-sections">
                        <h2 className="section-title">
                            {t('initiatives.view.aboutInitiative')}
                        </h2>

                        <div className="sections-grid">
                            {initiative.sections.map((section, index) => (
                                <div key={`section-${section.id || section.titleSlug || index}`} className="content-section">
                                    <div className="section-content-initiative">
                                        <h3 className="section-heading">{section.title}</h3>
                                        <div className="section-text slate-content" data-editor="slate">
                                            {/* Умна проверка за типа на съдържанието */}
                                            {(() => {
                                                // Ако няма съдържание
                                                if (!section.content) {
                                                    return <p>{t('initiatives.view.placeholders.noContent')}</p>;
                                                }

                                                // Ако е string (HTML или обикновен текст)
                                                if (typeof section.content === 'string') {
                                                    // Ако изглежда като HTML
                                                    if (section.content.includes('<') && section.content.includes('>')) {
                                                        return <div dangerouslySetInnerHTML={{ __html: section.content }} />;
                                                    }
                                                    // Ако е обикновен текст
                                                    return <p>{section.content}</p>;
                                                }

                                                // Ако е Slate.js структура (array)
                                                if (Array.isArray(section.content)) {
                                                    return renderSlateContent(section.content);
                                                }

                                                // Ако е обект, опитай се да го обработиш като Slate.js
                                                if (typeof section.content === 'object') {
                                                    try {
                                                        return renderSlateContent(section.content);
                                                    } catch (error) {
                                                        console.warn('Failed to render section content as Slate:', error);
                                                        return <p>{JSON.stringify(section.content)}</p>;
                                                    }
                                                }

                                                // Fallback
                                                return <p>{String(section.content)}</p>;
                                            })()}
                                        </div>
                                    </div>

                                    {/* Поддръжка за нови images структури */}
                                    {section.images?.length > 0 && (
                                        <div className="section-image">
                                            {renderImages(section.images, "section-slider")}
                                        </div>
                                    )}
                                    {/* Fallback за стари image структури */}
                                    {!section.images && section.image && Array.isArray(section.image) && section.image.length > 0 && (
                                        <div className="section-image">
                                            <img
                                                src={section.image[0].src}
                                                alt={section.image[0].alt || section.title}
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* 🖼️ NEW: Gallery */}
                {initiative.gallery?.length > 0 && (
                    <section id="gallery" className="gallery-section">
                        <h2 className="section-title">{t('initiatives.view.sectionTitles.gallery')}</h2>
                        <div className="gallery-grid">
                            {initiative.gallery.map((image, index) => (
                                <div key={index} className="gallery-item">
                                    <img src={image.src} alt={image.alt} />
                                    {image.caption && (
                                        <p className="gallery-caption">{image.caption}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* EXISTING: Download Materials - остават същите */}
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
                                            <img src={material.image.src} alt={material.image.alt} />
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

                {/* EXISTING: Stories & Publications - остават същите */}
                {((initiative.stories && initiative.stories.length > 0) || (initiative.publications && initiative.publications.length > 0)) && (
                    <StoriesPublications
                        stories={initiative.stories || []}
                        publications={initiative.publications || []}
                    />
                )}

                {/* EXISTING: Projects Map Section - остава същата */}
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

                {/* EXISTING: Projects Grid - остава същата */}
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

                {/* ⏰ NEW: Timeline Section */}
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

                {/* 🎯 NEW: Target Scope */}
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
                {/* 🏆 NEW: Progress & Results */}
                {(initiative.kpis?.length > 0 || initiative.expectedResults || initiative.progressReport) && (
                    <section id="progress-results" className="progress-results-section">
                        <h2 className="section-title">
                            <FontAwesomeIcon icon={faTrophy} />
                            {t('initiatives.view.sectionTitles.progressResults')}
                        </h2>

                        {initiative.kpis?.length > 0 && (
                            <div className="kpis-preview">
                                <h3>{t('initiatives.view.progressResults.kpis')}</h3>
                                <div className="kpis-grid">
                                    {initiative.kpis.map((kpi, index) => (
                                        <div key={index} className="kpi-preview-card">
                                            <h4>{kpi.name}</h4>
                                            <div className="kpi-target">{t('initiatives.view.progressResults.target')} {kpi.target}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {initiative.expectedResults && (
                            <div className="expected-results-preview">
                                <h3>{t('initiatives.view.progressResults.expectedResults')}</h3>
                                <div className="results-content slate-content" data-editor="slate">
                                    {(() => {
                                        // Ако няма съдържание
                                        if (!initiative.expectedResults) {
                                            return <p>{t('initiatives.view.placeholders.noContent')}</p>
                                        }

                                        // Ако е string (HTML или обикновен текст)
                                        if (typeof initiative.expectedResults === 'string') {
                                            // Ако изглежда като HTML
                                            if (initiative.expectedResults.includes('<') && initiative.expectedResults.includes('>')) {
                                                return <div dangerouslySetInnerHTML={{ __html: initiative.expectedResults }} />;
                                            }
                                            // Ако е обикновен текст
                                            return <p>{initiative.expectedResults}</p>;
                                        }

                                        // Ако е Slate.js структура (array)
                                        if (Array.isArray(initiative.expectedResults)) {
                                            return renderSlateContent(initiative.expectedResults);
                                        }

                                        // Ако е обект, опитай се да го обработиш като Slate.js
                                        if (typeof initiative.expectedResults === 'object') {
                                            try {
                                                return renderSlateContent(initiative.expectedResults);
                                            } catch (error) {
                                                console.warn('Failed to render expected results as Slate:', error);
                                                return <p>{JSON.stringify(initiative.expectedResults)}</p>;
                                            }
                                        }

                                        // Fallback
                                        return <p>{String(initiative.expectedResults)}</p>;
                                    })()}
                                </div>
                            </div>
                        )}

                        {initiative.progressReport && (
                            <div className="progress-report-preview">
                                <h3>{t('initiatives.view.progressResults.progressReport')}</h3>
                                <div className="report-content slate-content" data-editor="slate">
                                    {(() => {
                                        // Ако няма съдържание
                                        if (!initiative.progressReport) {
                                            return <p>{t('initiatives.view.placeholders.noContent')}</p>
                                        }

                                        // Ако е string (HTML или обикновен текст)
                                        if (typeof initiative.progressReport === 'string') {
                                            // Ако изглежда като HTML
                                            if (initiative.progressReport.includes('<') && initiative.progressReport.includes('>')) {
                                                return <div dangerouslySetInnerHTML={{ __html: initiative.progressReport }} />;
                                            }
                                            // Ако е обикновен текст
                                            return <p>{initiative.progressReport}</p>;
                                        }

                                        // Ако е Slate.js структура (array)
                                        if (Array.isArray(initiative.progressReport)) {
                                            return renderSlateContent(initiative.progressReport);
                                        }

                                        // Ако е обект, опитай се да го обработиш като Slate.js
                                        if (typeof initiative.progressReport === 'object') {
                                            try {
                                                return renderSlateContent(initiative.progressReport);
                                            } catch (error) {
                                                console.warn('Failed to render progress report as Slate:', error);
                                                return <p>{JSON.stringify(initiative.progressReport)}</p>;
                                            }
                                        }

                                        // Fallback
                                        return <p>{String(initiative.progressReport)}</p>;
                                    })()}
                                </div>
                            </div>
                        )}
                    </section>
                )}

                {/* 🤝 NEW: Partners & Sponsors */}
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
                                                    <img src={partner.logo} alt={partner.name} />
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
                                                    <img src={sponsor.logo} alt={sponsor.name} />
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

                {/* 🏢 NEW: Organization Information */}
                {(initiative.responsible?.name || initiative.organization?.name || Object.values(initiative.socialMedia || {}).some(link => link)) && (
                    <section className="organization-contact-section">
                        {t('initiatives.view.sectionTitles.organizationInfo')}

                        {/* Responsible Person */}
                        {initiative.responsible?.name && (
                            <div className="responsible-preview">
                                <h3>{t('initiatives.view.organization.responsiblePerson')}</h3>
                                <div className="responsible-info">
                                    <h4>{initiative.responsible.name}</h4>
                                    {initiative.responsible.position && (
                                        <p className="responsible-position">{initiative.responsible.position}</p>
                                    )}
                                    <div className="responsible-contacts">
                                        {initiative.responsible.email && (
                                            <div className="contact-item">
                                                <FontAwesomeIcon icon={faEnvelope} className="contact-icon" />
                                                <a href={`mailto:${initiative.responsible.email}`}>
                                                    {initiative.responsible.email}
                                                </a>
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
                        )}

                        {/* Organization */}
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

                        {/* Social Media */}
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
                    </section>
                )}

                {/* EXISTING: Contact Section - остава същата */}
                <ContactSection
                    contact={initiative.contact}
                    additionalContacts={initiative.additionalContacts}
                />

                {/* 🏷️ NEW: Tags */}
                {initiative.tags?.length > 0 && (
                    <section className="tags-section">
                        <h2 className="section-title">
                            <FontAwesomeIcon icon={faTag} />
                            <h2 className="section-title">{t('initiatives.view.sectionTitles.tags')}</h2>   
                        </h2>
                        <div className="tags-display">
                            {initiative.tags.map((tag, index) => (
                                <span key={index} className="tag-preview">{tag}</span>
                            ))}
                        </div>
                    </section>
                )}

                {/* ❓ NEW: FAQ */}
                {initiative.faq?.length > 0 && (
                    <section id="faq" className="faq-section">
                        <h2 className="section-title">
                            <FontAwesomeIcon icon={faQuestionCircle} />
                            <h2 className="section-title">{t('initiatives.view.sectionTitles.faq')}</h2>
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

                {/* EXISTING: Comments Section - остава същата */}
                <Comments
                    initiativeId={initiative.id || initiative.slug}
                    commentsEnabled={initiative.commentsEnabled}
                />
            </div>
        </div >
    );
};