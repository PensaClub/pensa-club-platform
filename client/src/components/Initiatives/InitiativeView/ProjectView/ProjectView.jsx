/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

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
        recentApplications
    } = useInitiativeContext();

    const { isAuthentication, profileData } = useAuthContext();
    const [activeSection, setActiveSection] = useState('overview');
    const [commentsCount, setCommentsCount] = useState(0);
    const applicationsLoadedRef = useRef(false);

    // Проверяваме дали потребителят вече е кандидатствал
    const hasUserApplied = recentApplications?.some(app => app.email === profileData?.email);

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
            console.log('Application submitted successfully:', result);
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

    // ЗАЩИТЕНИ ПРОВЕРКИ
    const canApply = currentProject.applicationStatus === 'open' &&
        (currentProject.currentParticipants || 0) < (currentProject.maxParticipants || Infinity);

    return (
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
                                                {Array.isArray(currentProject.location)
                                                    ? currentProject.location[0]?.address
                                                    : currentProject.location.address}
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
                                    {isAuthentication && canApply && (
                                        <button
                                            className="project-view-btn-apply"
                                            onClick={scrollToApplicationForm}
                                        >
                                            {hasUserApplied ? t('projectView.buttons.alreadyApplied') : t('projectView.buttons.apply')}
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

                        {currentProject.team?.length > 0 && (
                            <button
                                className={`project-view-nav-link ${activeSection === 'team' ? 'active' : ''}`}
                                onClick={() => scrollToSection('team')}
                            >
                                {t('projectView.navigation.team')}
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
                            />
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
                                            {member.position && (
                                                <p className="project-view-member-position">{member.position}</p>
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

                    {/* Application Form Section - Винаги видима */}
                    {isAuthentication && (
                        <section id="application-form" className="project-view-section">
                            <ApplicationForm
                                project={currentProject}
                                onSubmit={handleApplicationSubmit}
                            />
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
    );
};