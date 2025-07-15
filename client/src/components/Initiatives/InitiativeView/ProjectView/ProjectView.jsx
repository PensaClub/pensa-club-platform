/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';
import './projectView.css';
import { useInitiativeContext } from '../../../contexts/InitiativeProvider';
import { useAuthContext } from '../../../contexts/UserContext';
import { BookmarkIcon } from '../../Icons/InitiativeIcons';
import { StoriesPublications } from '../StoriesPublications/StoriesPublications';
import { Comments } from '../Comments/Comments';
import { ApplicationForm } from '../ApplicationForm/ApplicationForm';
// Добави import за утилитите
import { renderSlateContent } from '../../../../utils/slateRenderer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage } from '@fortawesome/free-solid-svg-icons';
import { getLocationFromCoordinates } from '../../../../utils/getLocationFromCoordinates';
import { ProjectBudget } from '../ProjectBudget/ProjectBudget';
import { SponsorsPartners } from '../SponsorsPartners/SponsorsPartners';
import { Milestones } from '../Milestones/Milestones';

export const ProjectView = () => {
    const { slug } = useParams();
    const { t } = useTranslation();
    const {
        getProjectById,
        currentProject,
        isLoading,
        getProjectComments,
        getProjectApplications,
        applyToProject,
        isBookmarkedProject,
        toggleBookmarkProjects,
        recentApplications,
        hasUserAppliedToProject
    } = useInitiativeContext();

    const { isAuthentication, profileData } = useAuthContext();
    const [activeSection, setActiveSection] = useState('overview');
    const [commentsCount, setCommentsCount] = useState(0);
    const applicationsLoadedRef = useRef(false);
    const [locationText, setLocationText] = useState('');
    const isDeadlinePassed = useCallback(() => {
        if (!currentProject?.applicationDeadline) return false;

        const deadline = new Date(currentProject.applicationDeadline);
        const now = new Date();
        return now > deadline;
    }, [currentProject?.applicationDeadline]);
    // Проверяваме дали потребителят вече е кандидатствал
    const hasUserApplied = hasUserAppliedToProject(currentProject?.id);
    const deadlinePassed = isDeadlinePassed();

    useEffect(() => {
        const loadLocation = async () => {
            if (currentProject?.location?.[0]?.coordinates) {
                const coords = currentProject.location[0].coordinates;
                const location = await getLocationFromCoordinates(coords.lat, coords.lng);
                setLocationText(location);
            }
        };

        if (currentProject) {
            loadLocation();
        }
    }, [currentProject]);

    useEffect(() => {
        if (slug) {
            getProjectById(slug);
        }
    }, [slug]);

    useEffect(() => {
        if (currentProject?.id && commentsCount === 0) {
            loadCommentsCount();
        }
    }, [currentProject?.id]);

    // Зареждаме кандидатурите за проекта - само веднъж
    useEffect(() => {
        if (currentProject?.id && !applicationsLoadedRef.current) {
            getProjectApplications(currentProject.id);
            applicationsLoadedRef.current = true;
        }
    }, [currentProject?.id]);

    useEffect(() => {
        applicationsLoadedRef.current = false;
    }, [currentProject?.id]);

    useEffect(() => {
        const navLinks = document.querySelector('.project-view-nav-links');
        if (!navLinks) return;

        let isDown = false;
        let startX;
        let scrollLeft;

        const handleMouseDown = (e) => {
            isDown = true;
            navLinks.style.cursor = 'grabbing';
            startX = e.pageX - navLinks.offsetLeft;
            scrollLeft = navLinks.scrollLeft;
        };

        const handleMouseLeave = () => {
            isDown = false;
            navLinks.style.cursor = 'grab';
        };

        const handleMouseUp = () => {
            isDown = false;
            navLinks.style.cursor = 'grab';
        };

        const handleMouseMove = (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - navLinks.offsetLeft;
            const walk = (x - startX) * 1;
            navLinks.scrollLeft = scrollLeft - walk;
        };

        navLinks.addEventListener('mousedown', handleMouseDown);
        navLinks.addEventListener('mouseleave', handleMouseLeave);
        navLinks.addEventListener('mouseup', handleMouseUp);
        navLinks.addEventListener('mousemove', handleMouseMove);

        return () => {
            navLinks.removeEventListener('mousedown', handleMouseDown);
            navLinks.removeEventListener('mouseleave', handleMouseLeave);
            navLinks.removeEventListener('mouseup', handleMouseUp);
            navLinks.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    const loadCommentsCount = async () => {
        if (currentProject?.id) {
            try {
                const projectComments = await getProjectComments(currentProject.id || currentProject.slug);;
                setCommentsCount(projectComments.length);
            } catch (error) {
                console.error('Error loading comments count:', error);
                setCommentsCount(0);
            }
        }
    };

    const handleCommentsChange = (newCount) => {
        setCommentsCount(newCount);
    };

    const handleApplicationSubmit = async (applicationData) => {
        try {
            const result = await applyToProject(currentProject.id, applicationData);

            if (result.success) {

                // console.log('Application submitted successfully:', result);
            }
        } catch (error) {
            console.error('Application failed:', error);
        }
    };

    const scrollToApplicationForm = () => {
        if (!isAuthentication) {
            alert(t('projectView.messages.loginRequired'));
            return;
        }

        const element = document.getElementById('application-form');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            setActiveSection('application-form');
        }
    };

    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            setActiveSection(sectionId);
        }
    };

    const getFileTypeIcon = (fileType) => {
        const icons = {
            'pdf': '📄',
            'doc': '📝',
            'docx': '📝',
            'xls': '📊',
            'xlsx': '📊',
            'ppt': '📽️',
            'pptx': '📽️',
            'zip': '📦',
            'rar': '📦',
            'jpg': '🖼️',
            'jpeg': '🖼️',
            'png': '🖼️',
            'gif': '🖼️',
            'mp4': '🎬',
            'avi': '🎬',
            'mov': '🎬',
            'mp3': '🎵',
            'wav': '🎵',
            'txt': '📄',
            'rtf': '📄'
        };

        return icons[fileType?.toLowerCase()] || '📁';
    };

    // ФУНКЦИЯ ЗА РЕНДЕРИРАНЕ НА СЪДЪРЖАНИЕ
    const renderContent = (content) => {
        if (!content) {
            return <p>Няма съдържание</p>;
        }

        // Ако е string (HTML или обикновен текст)
        if (typeof content === 'string') {
            // Ако изглежда като HTML
            if (content.includes('<') && content.includes('>')) {
                return <div dangerouslySetInnerHTML={{ __html: content }} />;
            }
            // Ако е обикновен текст
            return <p>{content}</p>;
        }

        // Ако е Slate.js структура (array)
        if (Array.isArray(content)) {
            return renderSlateContent(content);
        }

        // Ако е обект, опитай се да го обработиш като Slate.js
        if (typeof content === 'object') {
            try {
                return renderSlateContent(content);
            } catch (error) {
                console.warn('Failed to render content as Slate:', error);
                return <p>{JSON.stringify(content)}</p>;
            }
        }

        // Fallback
        return <p>{String(content)}</p>;
    };

    if (isLoading || !currentProject) {
        return <div className="project-view-loading">{t('projectView.loading')}</div>;
    }
    const getProjectMetaImage = () => {
        if (currentProject?.mainImage?.src) {
            return currentProject.mainImage.src;
        }
        return 'https://www.pensa.club/default-project-image.jpg'; // fallback image
    };
    const getProjectDescription = () => {
        let description = '';

        if (currentProject?.fullDescription) {
            // Ако е HTML, махаме таговете
            if (typeof currentProject.fullDescription === 'string') {
                description = currentProject.fullDescription.replace(/<[^>]*>/g, '');
            }
        } else if (currentProject?.shortDescription) {
            if (typeof currentProject.shortDescription === 'string') {
                description = currentProject.shortDescription.replace(/<[^>]*>/g, '');
            }
        }

        // Ограничаваме до 160 символа за мета описанието
        return description.substring(0, 160) || 'Проект от Pensa Club за пенсионери в България';
    };
    const getProjectStructuredData = () => {
        if (!currentProject) return null;

        return {
            "@context": "https://schema.org",
            "@type": "Project",
            "name": currentProject.title,
            "description": getProjectDescription(),
            "image": getProjectMetaImage(),
            "url": `https://www.pensa.club/projects/${slug}`,
            "funder": "Pensa Club"
        };
    };

    // ЗАЩИТЕНИ ПРОВЕРКИ
    const canApply = currentProject?.applicationStatus === 'open' &&
        (currentProject.currentParticipants || 0) < (currentProject.maxParticipants || Infinity) &&
        !deadlinePassed

    return (
        <>
            <Helmet>
                <title>{currentProject?.title ? `${currentProject.title} | Pensa Club` : 'Проект | Pensa Club'}</title>
                <meta name="description" content={getProjectDescription()} />

                {/* Open Graph метаданни */}
                <meta property="og:title" content={currentProject?.title || 'Проект | Pensa Club'} />
                <meta property="og:description" content={getProjectDescription()} />
                <meta property="og:image" content={getProjectMetaImage()} />
                <meta property="og:url" content={`https://www.pensa.club/projects/${slug}`} />
                <meta property="og:type" content="article" />
                <meta property="og:site_name" content="Pensa Club" />

                {/* Допълнителни метаданни за проекти */}
                {currentProject?.category && (
                    <meta property="article:section" content={currentProject.category} />
                )}

                {currentProject?.timeline?.startDate && (
                    <meta property="article:published_time" content={currentProject.timeline.startDate} />
                )}
                <script type="application/ld+json">
                    {JSON.stringify(getProjectStructuredData())}
                </script>
                {/* Twitter Card */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={currentProject?.title || 'Проект | Pensa Club'} />
                <meta name="twitter:description" content={getProjectDescription()} />
                <meta name="twitter:image" content={getProjectMetaImage()} />
            </Helmet>
            <div className="project-view-container">
                {/* Hero Section */}
                <section className="project-view-hero">
                    <div className="project-view-hero-background">
                        {/* ПОПРАВЕНА ПРОВЕРКА ЗА MAIN IMAGE */}
                        {currentProject.mainImage?.src ? (
                            <img
                                src={currentProject.mainImage.src}
                                alt={currentProject.mainImage.alt || currentProject.title}
                                className="project-view-hero-image"
                            />
                        ) : (
                            <div className="project-view-hero-placeholder">
                                <FontAwesomeIcon icon={faImage} size="4x" />
                                <p>Няма главно изображение</p>
                            </div>
                        )}
                        <div className="project-view-hero-overlay"></div>
                    </div>

                    <div className="project-view-hero-content">
                        <div className="container">
                            {/* Breadcrumb */}
                            <div className="project-view-breadcrumb">
                                <Link to="/initiatives" className="project-view-breadcrumb-link">
                                    {t('projectView.breadcrumb.initiatives')}
                                </Link>
                                <span className="project-view-breadcrumb-separator">›</span>
                                {/* ЗАЩИТЕНА ПРОВЕРКА ЗА INITIATIVE SLUG */}
                                {currentProject.initiativeSlug && (
                                    <>
                                        <Link
                                            to={`/initiatives/${currentProject.initiativeSlug}`}
                                            className="project-view-breadcrumb-link"
                                        >
                                            {t('projectView.breadcrumb.backToInitiative')}
                                        </Link>
                                        <span className="project-view-breadcrumb-separator">›</span>
                                    </>
                                )}
                                <span className="project-view-breadcrumb-current">{currentProject.title}</span>
                            </div>

                            <div className="project-view-hero-main">
                                <div className="project-view-hero-text">
                                    <div className="project-view-badges">
                                        {currentProject.logo && (
                                            <div className="project-view-logo">
                                                <img src={currentProject.logo} alt={`${currentProject.title} logo`} />
                                            </div>
                                        )}
                                        {currentProject.status && (
                                            <span className={`project-view-status ${currentProject.status}`}>
                                                {t(`projectView.status.${currentProject.status}`)}
                                            </span>
                                        )}
                                        {currentProject.priority && (
                                            <span className={`project-view-priority ${currentProject.priority}`}>
                                                {t(`projectView.priority.${currentProject.priority}`)} {t('projectView.priorityLabel')}
                                            </span>
                                        )}
                                    </div>

                                    <h1 className="project-view-title">{currentProject.title}</h1>

                                    {/* ЗАЩИТЕНА ПРОВЕРКА ЗА ОПИСАНИЕ */}
                                    {(currentProject.fullDescription || currentProject.shortDescription) && (
                                        <div className="project-view-description">
                                            {renderContent(currentProject.fullDescription || currentProject.shortDescription)}
                                        </div>
                                    )}

                                    <div className="project-view-meta">
                                        {/* Timeline dates като meta item */}
                                        {(currentProject.timeline?.startDate || currentProject.timeline?.endDate) && (
                                            <div className="project-view-meta-item project-view-meta-timeline">
                                                <span className="project-view-meta-label">{t('projectView.meta.timeline')}:</span>
                                                <div className="project-view-meta-timeline-dates">
                                                    {currentProject.timeline?.startDate && (
                                                        <span className="project-view-timeline-start">
                                                            {new Date(currentProject.timeline.startDate).toLocaleDateString('bg-BG')}
                                                        </span>
                                                    )}
                                                    {currentProject.timeline?.startDate && currentProject.timeline?.endDate && (
                                                        <span className="project-view-timeline-separator">-</span>
                                                    )}
                                                    {currentProject.timeline?.endDate && (
                                                        <span className="project-view-timeline-end">
                                                            {new Date(currentProject.timeline.endDate).toLocaleDateString('bg-BG')}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                        {currentProject.category && (
                                            <div className="project-view-meta-item">
                                                <span className="project-view-meta-label">{t('projectView.meta.category')}:</span>
                                                <span className="project-view-meta-value">{currentProject.category}</span>
                                            </div>
                                        )}

                                        {/* ЗАЩИТЕНА ПРОВЕРКА ЗА LOCATION */}
                                        {currentProject.location && (
                                            <div className="project-view-meta-item">
                                                <span className="project-view-meta-label">{t('projectView.meta.location')}:</span>
                                                <span className="project-view-meta-value">
                                                    {locationText || t('location.loading')}
                                                </span>
                                            </div>
                                        )}

                                        {/* ЗАЩИТЕНА ПРОВЕРКА ЗА PARTICIPANTS */}
                                        {(currentProject.currentParticipants !== undefined || currentProject.maxParticipants !== undefined) && (
                                            <div className="project-view-meta-item">
                                                <span className="project-view-meta-label">{t('projectView.meta.participants')}:</span>
                                                <span className="project-view-meta-value">
                                                    {currentProject.currentParticipants || 0} / {currentProject.maxParticipants || '∞'}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="project-view-actions">
                                        {isAuthentication && (
                                            <button
                                                className={`project-view-btn-apply ${hasUserApplied ? 'applied' : ''} ${deadlinePassed ? 'deadline-passed' : ''}`}
                                                onClick={scrollToApplicationForm}
                                                disabled={hasUserApplied || deadlinePassed || !canApply}
                                            >
                                                {hasUserApplied
                                                    ? t('projectView.buttons.alreadyApplied')
                                                    : deadlinePassed
                                                        ? t('projectView.buttons.deadlinePassed')
                                                        : t('projectView.buttons.apply')
                                                }
                                            </button>
                                        )}

                                        {isBookmarkedProject && (
                                            <button
                                                className={`project-view-btn-bookmark ${isBookmarkedProject(currentProject.id) ? 'bookmarked' : ''}`}
                                                onClick={() => toggleBookmarkProjects(currentProject.id)}
                                            >
                                                <BookmarkIcon />
                                                {t('projectView.buttons.bookmark')}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* ЗАЩИТЕНА ПРОВЕРКА ЗА STATS */}
                                {(currentProject.budget || currentProject.timeline || currentProject.team) && (
                                    <div className="project-view-stats-card">
                                        {currentProject.budget?.funded && currentProject.budget?.total && (
                                            <div className="project-view-stats-item">
                                                <div className="project-view-stats-number">
                                                    {Math.round((currentProject.budget.funded / currentProject.budget.total) * 100)}%
                                                </div>
                                                <div className="project-view-stats-label">{t('projectView.stats.funded')}</div>
                                            </div>
                                        )}

                                        {currentProject.timeline?.estimatedDuration && (
                                            <div className="project-view-stats-item">
                                                <div className="project-view-stats-number">{currentProject.timeline.estimatedDuration}</div>
                                                <div className="project-view-stats-label">{t('projectView.stats.duration')}</div>
                                            </div>
                                        )}

                                        {currentProject.team?.length && (
                                            <div className="project-view-stats-item">
                                                <div className="project-view-stats-number">{currentProject.team.length}</div>
                                                <div className="project-view-stats-label">{t('projectView.stats.team')}</div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                        </div>
                        {/* Показваме deadline информация ако има */}
                        {currentProject?.applicationDeadline && !hasUserApplied && (
                            <div className="project-view-deadline-info">
                                <span className={`deadline-status ${deadlinePassed ? 'passed' : 'active'}`}>
                                    {deadlinePassed
                                        ? `Крайният срок изтече: ${new Date(currentProject.applicationDeadline).toLocaleDateString('bg-BG')}`
                                        : `Краен срок: ${new Date(currentProject.applicationDeadline).toLocaleDateString('bg-BG')}`
                                    }
                                </span>
                            </div>
                        )}
                    </div>
                </section>

                {/* Navigation */}
                <nav className="project-view-nav">
                    <div className="container">
                        <div className="project-view-nav-links">
                            {currentProject.sections?.map((section) => (
                                <button
                                    key={section.titleSlug}
                                    className={`project-view-nav-link ${activeSection === section.titleSlug ? 'active' : ''}`}
                                    onClick={() => scrollToSection(section.titleSlug)}
                                >
                                    {section.title}
                                </button>
                            ))}

                            {currentProject.publications?.length > 0 && (
                                <button
                                    className={`project-view-nav-link ${activeSection === 'publications' ? 'active' : ''}`}
                                    onClick={() => scrollToSection('publications')}
                                >
                                    {t('projectView.navigation.publications')}
                                </button>
                            )}

                            {currentProject.downloadMaterials?.length > 0 && (
                                <button
                                    className={`project-view-nav-link ${activeSection === 'download-materials' ? 'active' : ''}`}
                                    onClick={() => scrollToSection('download-materials')}
                                >
                                    {t('projectView.navigation.downloadMaterials')}
                                </button>
                            )}
                            {(currentProject.budget?.goal || currentProject.budget?.total || currentProject.budget?.funded) && (
                                <button
                                    className={`project-view-nav-link ${activeSection === 'budget' ? 'active' : ''}`}
                                    onClick={() => scrollToSection('budget')}
                                >
                                    {t('projectView.navigation.budget')}
                                </button>
                            )}
                            {((currentProject.sponsors && currentProject.sponsors.length > 0) ||
                                (currentProject.partners && currentProject.partners.length > 0)) && (
                                    <button
                                        className={`project-view-nav-link ${activeSection === 'sponsors-partners' ? 'active' : ''}`}
                                        onClick={() => scrollToSection('sponsors-partners')}
                                    >
                                        {t('projectView.navigation.sponsorsPartners')}
                                    </button>
                                )}
                            {currentProject.team?.length > 0 && (
                                <button
                                    className={`project-view-nav-link ${activeSection === 'team' ? 'active' : ''}`}
                                    onClick={() => scrollToSection('team')}
                                >
                                    {t('projectView.navigation.team')}
                                </button>
                            )}
                            {currentProject.contact?.name && (
                                <button
                                    className={`project-view-nav-link ${activeSection === 'contact' ? 'active' : ''}`}
                                    onClick={() => scrollToSection('contact')}
                                >
                                    {t('projectView.navigation.contact')}
                                </button>
                            )}
                            {isAuthentication && (
                                <button
                                    className={`project-view-nav-link ${activeSection === 'application-form' ? 'active' : ''}`}
                                    onClick={() => scrollToSection('application-form')}
                                >
                                    {t('projectView.navigation.applications')}
                                </button>
                            )}

                            <button
                                className={`project-view-nav-link ${activeSection === 'comments' ? 'active' : ''}`}
                                onClick={() => scrollToSection('comments')}
                            >
                                {t('projectView.navigation.comments')} ({commentsCount})
                            </button>
                        </div>
                    </div>
                </nav>

                {/* Content Sections */}
                <div className="project-view-content">
                    <div className="container">
                        {/* Project Sections */}
                        {currentProject.sections?.map((section, index) => (
                            <section
                                key={section.titleSlug}
                                id={section.titleSlug}
                                className={`project-view-section ${index % 2 === 0 ? 'project-view-section-left' : 'project-view-section-right'}`}
                            >
                                <div className="project-view-section-content">
                                    <div className="project-view-section-text">
                                        <h2 className="project-view-section-title">{section.title}</h2>
                                        <div className="project-view-section-description slate-content" data-editor="slate">
                                            {renderContent(section.content)}
                                        </div>
                                    </div>

                                    {/* ЗАЩИТЕНА ПРОВЕРКА ЗА SECTION IMAGE */}
                                    {(section.image?.src || (section.images && section.images.length > 0)) && (
                                        <div className="project-view-section-image">
                                            <img
                                                src={section.image?.src || section.images[0]?.src}
                                                alt={section.image?.alt || section.images[0]?.alt || section.title}
                                            />
                                            {(section.image?.caption || section.images?.[0]?.caption) && (
                                                <div className="project-view-image-caption">
                                                    {section.image?.caption || section.images[0]?.caption}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </section>
                        ))}

                        {/* Publications */}
                        {currentProject.publications?.length > 0 && (
                            <section id="publications" className="project-view-section project-view-publications-section">
                                <h2 className="project-view-section-title">{t('projectView.sections.publications')}</h2>
                                <StoriesPublications
                                    stories={[]}
                                    publications={currentProject.publications}
                                    showViewAll={false}
                                    showInProjectView={true}
                                />
                            </section>
                        )}
                        {/* Download Materials Section */}
                        {currentProject.downloadMaterials?.length > 0 && (
                            <section id="download-materials" className="project-view-section project-view-download-section">
                                <h2 className="project-view-section-title">{t('projectView.sections.downloadMaterials')}</h2>

                                <div className="project-view-download-grid">
                                    {currentProject.downloadMaterials.map((material) => (
                                        <div key={material.id} className="project-view-download-card">
                                            <div className="download-card-preview">
                                                {material.image ? (
                                                    <img
                                                        src={material.image.src}
                                                        alt={material.image.alt || material.title}
                                                        className="download-preview-image"
                                                    />
                                                ) : (
                                                    <div className="download-preview-placeholder">
                                                        <span className="file-type-icon">
                                                            {getFileTypeIcon(material.fileType)}
                                                        </span>
                                                        <span className="file-extension">{material.fileType?.toUpperCase()}</span>
                                                    </div>
                                                )}

                                                <div className="download-card-overlay">
                                                    <span className="download-overlay-icon">⬇</span>
                                                </div>
                                            </div>

                                            <div className="download-card-content">
                                                <h3 className="download-card-title">{material.title}</h3>

                                                {material.description && (
                                                    <p className="download-card-description">
                                                        {material.description}
                                                    </p>
                                                )}

                                                <div className="download-card-meta">
                                                    <div className="download-meta-items">
                                                        <span className="download-meta-item">
                                                            <span className="meta-icon">📄</span>
                                                            <span className="meta-value">{material.fileType?.toUpperCase()}</span>
                                                        </span>

                                                        {material.fileSize && (
                                                            <span className="download-meta-item">
                                                                <span className="meta-icon">💾</span>
                                                                <span className="meta-value">{material.fileSize} MB</span>
                                                            </span>
                                                        )}
                                                    </div>

                                                    <a
                                                        href={material.downloadUrl}
                                                        className="download-card-button"
                                                        download
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <span className="download-button-icon">⬇</span>
                                                        {t('projectView.downloadMaterials.download')}
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                        {/* Budget Section */}
                        {(currentProject.budget?.goal || currentProject.budget?.total || currentProject.budget?.funded) && (
                            <section id="budget" className="project-view-section project-view-budget-section">
                                <h2 className="project-view-section-title">{t('projectView.sections.budget')}</h2>
                                <ProjectBudget
                                    budget={currentProject.budget}
                                    currency={currentProject.budget?.currency || 'BGN'}
                                />
                            </section>
                        )}
                        {/* Sponsors and Partners Section */}
                        {((currentProject.sponsors && currentProject.sponsors.length > 0) ||
                            (currentProject.partners && currentProject.partners.length > 0)) && (
                                <section id="sponsors-partners" className="project-view-section project-view-sponsors-partners-section">
                                    <h2 className="project-view-section-title">{t('projectView.sections.sponsorsPartners')}</h2>
                                    <SponsorsPartners
                                        sponsors={currentProject.sponsors}
                                        partners={currentProject.partners}
                                    />
                                </section>
                            )}
                        {/* Milestones Section */}
                        {currentProject.milestones?.length > 0 && (
                            <section id="milestones" className="project-view-section project-view-milestones-section">
                                <h2 className="project-view-section-title">{t('projectView.sections.milestones')}</h2>
                                <Milestones milestones={currentProject.milestones} />
                            </section>
                        )}
                        {/* Team Section */}
                        {currentProject.team?.length > 0 && (
                            <section id="team" className="project-view-section project-view-team-section">
                                <h2 className="project-view-section-title">{t('projectView.sections.team')}</h2>
                                <div className="project-view-team-grid">
                                    {currentProject.team.map((member, index) => (
                                        <div key={index} className="project-view-team-member">
                                            {member.image && (
                                                <div className="project-view-member-image">
                                                    <img src={member.image} alt={member.name} />
                                                </div>
                                            )}
                                            <div className="project-view-member-info">
                                                <h3 className="project-view-member-name">{member.name}</h3>
                                                {member.role && (
                                                    <p className="project-view-member-position">{member.role}</p>
                                                )}
                                                <div className="project-view-member-contact">
                                                    {member.email && (
                                                        <a href={`mailto:${member.email}`} className="project-view-contact-link">
                                                            {member.email}
                                                        </a>
                                                    )}
                                                    {member.phone && (
                                                        <a href={`tel:${member.phone}`} className="project-view-contact-link">
                                                            {member.phone}
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                        {/* Contact Section */}
                        {currentProject.contact?.name && (
                            <section id="contact" className="project-view-section project-view-contact-section">
                                <h2 className="project-view-section-title">{t('projectView.sections.contact')}</h2>

                                <div className="project-view-contact-content">
                                    <div className="project-view-contact-card">
                                        <div className="project-view-contact-person">
                                            {currentProject.contact.image && (
                                                <div className="project-view-contact-photo">
                                                    <img
                                                        src={currentProject.contact.image}
                                                        alt={currentProject.contact.name}
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                            e.target.nextSibling.style.display = 'flex';
                                                        }}
                                                    />
                                                    <div className="project-view-contact-initials" style={{ display: 'none' }}>
                                                        {currentProject.contact.name.split(' ').map(n => n[0]).join('')}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="project-view-contact-details">
                                                <h3 className="project-view-contact-name">{currentProject.contact.name}</h3>
                                                {currentProject.contact.role && (
                                                    <p className="project-view-contact-role">{currentProject.contact.role}</p>
                                                )}
                                                <span className="project-view-contact-label">{t('projectView.contact.projectContact')}</span>
                                            </div>
                                        </div>

                                        <div className="project-view-contact-info">
                                            {currentProject.contact.email && (
                                                <div className="project-view-contact-item">
                                                    <div className="contact-item-header">
                                                        <span className="contact-item-icon">✉</span>
                                                        <span className="contact-item-label">{t('projectView.contact.email')}</span>
                                                    </div>
                                                    <a
                                                        href={`mailto:${currentProject.contact.email}`}
                                                        className="contact-item-value"
                                                    >
                                                        {currentProject.contact.email}
                                                    </a>
                                                </div>
                                            )}

                                            {currentProject.contact.phone && (
                                                <div className="project-view-contact-item">
                                                    <div className="contact-item-header">
                                                        <span className="contact-item-icon">📞</span>
                                                        <span className="contact-item-label">{t('projectView.contact.phone')}</span>
                                                    </div>
                                                    <a
                                                        href={`tel:${currentProject.contact.phone}`}
                                                        className="contact-item-value"
                                                    >
                                                        {currentProject.contact.phone}
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}
                        {/* Application Form Section - Винаги видима */}
                        {isAuthentication && !deadlinePassed && (
                            <section id="application-form" className="project-view-section">
                                <ApplicationForm
                                    project={currentProject}
                                    onSubmit={handleApplicationSubmit}
                                />
                            </section>
                        )}
                        {/* Или показваме съобщение ако deadline е изминал */}
                        {isAuthentication && deadlinePassed && (
                            <section id="application-form" className="project-view-section">
                                <div className="application-deadline-message">
                                    <h3>Кандидатстването е затворено</h3>
                                    <p>Крайният срок за кандидатстване за този проект е изминал на {new Date(currentProject.applicationDeadline).toLocaleDateString('bg-BG')}.</p>
                                </div>
                            </section>
                        )}
                        {/* Comments Section */}
                        <section id="comments" className="project-view-section project-view-comments-section">
                            <Comments
                                entityId={currentProject.id || currentProject.slug}
                                entityType="project"
                                commentsEnabled={currentProject.commentsEnabled}
                                onCommentsChange={handleCommentsChange}
                            />
                        </section>
                    </div>
                </div>
            </div>
        </>
    );
};