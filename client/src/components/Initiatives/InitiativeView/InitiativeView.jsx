
import { useState, useEffect } from 'react';
import { useParams, Link, NavLink } from 'react-router-dom';
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

export const InitiativeView = () => {
    const { slug } = useParams();
    const { t } = useTranslation();
    const { getInitiativeById } = useInitiativeContext();
    const [initiative, setInitiative] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showMap, setShowMap] = useState(true);
     const { trackInitiative } = useAnalytics();

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

    // Разделяне на shortDescription - САМО ако initiative съществува
    const getDescriptionParts = (description) => {
        if (!description) return { firstSentence: '', restSentences: '' };
        
        const sentences = description.split(/(?<=[.!?])\s+/);
        const firstSentence = sentences[0] || '';
        const restSentences = sentences.slice(1).join(' ');
        return { firstSentence, restSentences };
    };

    const handleSmoothScroll = (e) => {
        e.preventDefault();
        const targetId = e.currentTarget.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    };

    // Трансформиране на проектите в формат подходящ за картата
    const transformProjectsForMap = (projects) => {
        if (!projects) return [];

        const transformedProjects = projects
            .filter(project => project.coordinates)
            .map((project) => ({
                id: project.id,
                title: project.title,
                shortDescription: project.description,
                category: "Проект",
                status: project.status,
                location: {
                    address: `${project.title}`,
                    coordinates: project.coordinates
                },
                link: project.link
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

    // ПРЕМЕСТИ ТУК - след проверките за initiative
    const { firstSentence, restSentences } = getDescriptionParts(initiative.shortDescription);
    const projectsForMap = transformProjectsForMap(initiative.projects);

    return (
        <div className="initiative-view">
            {/* Hero Section */}
            <div className="initiative-hero">
                <div className="initiative-hero-image">
                    <img
                        src={initiative.mainImage?.src || ''}
                        alt={initiative.mainImage?.alt || initiative.title}
                        className="hero-image"
                    />
                </div>

                <div className="initiative-hero-content">
                    <div className="initiative-header">
                        <h1 className="initiative-title">{initiative.title}</h1>

                        <div className="initiative-description">
                            <p className="first-sentence">{firstSentence}</p>

                            {/* Navigation Links */}
                            <div className="initiative-nav">
                                <a href="#sections" onClick={handleSmoothScroll} className="nav-link">
                                    <span className="nav-icon">📖</span>
                                    {t('initiatives.view.stories')}
                                </a>
                                <a href="#projects" onClick={handleSmoothScroll} className="nav-link">
                                    <span className="nav-icon">🚀</span>
                                    {t('initiatives.view.projects')}
                                </a>
                                <a href="#contact" onClick={handleSmoothScroll} className="nav-link">
                                    <span className="nav-icon">📞</span>
                                    {t('initiatives.view.contact')}
                                </a>
                                {/* Показваме коментарите в навигацията само ако са разрешени */}
                                {initiative.commentsEnabled && (
                                    <a href="#comments" onClick={handleSmoothScroll} className="nav-link">
                                        <span className="nav-icon">💬</span>
                                        {t('initiatives.view.comments')}
                                        {initiative.commentsCount > 0 && (
                                            <span className="comments-count">({initiative.commentsCount})</span>
                                        )}
                                    </a>
                                )}
                            </div>

                            {restSentences && (
                                <p className="rest-sentences">{restSentences}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="initiative-content">
                {/* Sections - със защитена проверка */}
                {initiative.sections && Array.isArray(initiative.sections) && initiative.sections.length > 0 && (
                    <section id="sections" className="initiative-sections">
                        <h2 className="section-title">
                            {t('initiatives.view.aboutInitiative')}
                        </h2>

                        <div className="sections-grid">
                            {initiative.sections.map((section, index) => (
                                <div key={`section-${section.id || section.titleSlug || index}`} className="content-section">
                                    <div className="section-content">
                                        <h3 className="section-heading">{section.title}</h3>
                                        <p className="section-text">{section.content}</p>
                                    </div>

                                    {/* ОПРАВЕНА проверка за image array */}
                                    {section.image && Array.isArray(section.image) && section.image.length > 0 && (
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
                                🗺️ {t('initiatives.view.showMap', 'Покажи картата')}
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
                    <section className="projects-grid-section">
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

                {/* Contact Section */}
                <ContactSection
                    contact={initiative.contact}
                    additionalContacts={initiative.additionalContacts}
                />

                {/* Comments Section - показваме винаги, компонентът сам решава какво да покаже */}
                <Comments
                    initiativeId={initiative.slug || initiative.id}
                    commentsEnabled={initiative.commentsEnabled}
                />
            </div>
        </div>
    );
};