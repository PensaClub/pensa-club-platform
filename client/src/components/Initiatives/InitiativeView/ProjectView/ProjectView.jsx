/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './projectView.css';
import { useInitiativeContext } from '../../../contexts/InitiativeProvider';
import { useAuthContext } from '../../../contexts/UserContext';
import { useClubContext } from '../../../contexts/ClubContext';
import { BookmarkIcon } from '../../Icons/InitiativeIcons';
import { StoriesPublications } from '../StoriesPublications/StoriesPublications';
import { Comments } from '../Comments/Comments';
import { ApplicationForm } from '../ApplicationForm/ApplicationForm';
import { renderSlateContent } from '../../../../utils/slateRenderer.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage } from '@fortawesome/free-solid-svg-icons';
import { getLocationFromCoordinates } from '../../../../utils/getLocationFromCoordinates';
import { ProjectBudget } from '../ProjectBudget/ProjectBudget';
import { SponsorsPartners } from '../SponsorsPartners/SponsorsPartners';
import { Milestones } from '../Milestones/Milestones';
import ScrollToTop from '../../../ScrollToTop/ScrollToTop';
import ProjectGallery from '../ProjectGallery/ProjectGallery';
import { TextZoom } from '../../../TextZoom/TextZoom.jsx';
import SEOHead from '../../../SEO/SEOHead.jsx';

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
    const { sendPersonalEmail } = useClubContext();

    const [activeSection, setActiveSection] = useState('overview');
    const [commentsCount, setCommentsCount] = useState(0);
    const applicationsLoadedRef = useRef(false);
    const [locationText, setLocationText] = useState('');

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

    const isDeadlinePassed = useCallback(() => {
        if (!currentProject?.applicationDeadline) return false;
        const deadline = new Date(currentProject.applicationDeadline);
        const now = new Date();
        return now > deadline;
    }, [currentProject?.applicationDeadline]);

    const hasUserApplied = hasUserAppliedToProject(currentProject?.id);
    const deadlinePassed = isDeadlinePassed();

    // Email Modal Functions
    const openEmailModal = (name, email) => {
        setEmailRecipient({ name, email });
        setEmailForm({
            from: profileData?.email || '',
            to: email,
            subject: `Запитване относно проект: ${currentProject.title}`,
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

    const sortedSections = useMemo(() => {
        if (!currentProject?.sections) return [];
        return [...currentProject.sections].sort((a, b) => a.id - b.id);
    }, [currentProject?.sections]);

    const loadCommentsCount = async () => {
        if (currentProject?.id) {
            try {
                const projectComments = await getProjectComments(currentProject.id || currentProject.slug);
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
                // Success
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

    const renderContent = (content) => {
        if (!content) {
            return <p>Няма съдържание</p>;
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
    // ✅ META DATA (ДИНАМИЧЕН SEO)
    const metaData = useMemo(() => {
        if (!currentProject) {
            return {
                title: 'Проект | Pensa Club',
                description: 'Зареждане на проект...',
                keywords: 'проект, Pensa Club',
                image: '/images/iniciatives/iniciatives-2.jpg',
                author: 'Pensa Foundation',
                section: null,
                tags: []
            };
        }

        // Description - извличане от fullDescription или shortDescription
        let description = '';
        if (currentProject.fullDescription) {
            if (typeof currentProject.fullDescription === 'string') {
                description = currentProject.fullDescription.replace(/<[^>]*>/g, '');
            }
        } else if (currentProject.shortDescription) {
            if (typeof currentProject.shortDescription === 'string') {
                description = currentProject.shortDescription.replace(/<[^>]*>/g, '');
            }
        }
        description = description.substring(0, 160) || 'Проект от Pensa Club за пенсионери в България';

        // Keywords
        const baseKeywords = [
            'проект',
            'Pensa Club',
            'пенсионери',
            'дигитална грамотност'
        ];

        if (currentProject.category) {
            baseKeywords.push(currentProject.category.toLowerCase());
        }

        if (currentProject.tags && Array.isArray(currentProject.tags)) {
            baseKeywords.push(...currentProject.tags.map(tag => tag.toLowerCase()));
        }

        // Image
        const image = currentProject.mainImage?.src || '/images/iniciatives/iniciatives-2.jpg';

        // Author - от contact или default
        const author = currentProject.contact?.name || 'Pensa Foundation';

        // Section - category
        const section = currentProject.category || null;

        // Tags
        const tags = currentProject.tags || [];

        return {
            title: `${currentProject.title} | Pensa Club`,
            description,
            keywords: baseKeywords.join(', '),
            image,
            author,
            section,
            tags
        };
    }, [currentProject]);

    // ✅ STRUCTURED DATA - PROJECT/CREATIVEWORK
    const structuredData = useMemo(() => {
        if (!currentProject) return null;

        return {
            "@context": "https://schema.org",
            "@type": "CreativeWork",
            "name": currentProject.title,
            "description": metaData.description,
            "image": metaData.image,
            "url": `https://pensa.club/projects/${slug}`,
            "author": {
                "@type": currentProject.contact?.name ? "Person" : "Organization",
                "name": currentProject.contact?.name || "Pensa Club"
            },
            "creator": {
                "@type": "Organization",
                "name": "Pensa Club",
                "url": "https://pensa.club"
            },
            "publisher": {
                "@type": "Organization",
                "name": "Pensa Foundation",
                "logo": {
                    "@type": "ImageObject",
                    "url": "https://pensa.club/logo.png"
                }
            },
            ...(currentProject.timeline?.startDate && {
                "datePublished": currentProject.timeline.startDate
            }),
            ...(currentProject.timeline?.endDate && {
                "dateModified": currentProject.timeline.endDate
            }),
            ...(currentProject.category && {
                "genre": currentProject.category
            }),
            ...(currentProject.tags && {
                "keywords": currentProject.tags.join(', ')
            }),
            ...(currentProject.budget?.total && {
                "offers": {
                    "@type": "Offer",
                    "price": currentProject.budget.total,
                    "priceCurrency": currentProject.budget.currency || "BGN"
                }
            }),
            ...(locationText && {
                "contentLocation": {
                    "@type": "Place",
                    "name": locationText
                }
            }),
            "inLanguage": "bg"
        };
    }, [currentProject, metaData, slug, locationText]);
    if (isLoading || !currentProject) {
        return <div className="project-view-loading">{t('projectView.loading')}</div>;
    }

    const canApply = currentProject?.applicationStatus === 'open' &&
        (currentProject.currentParticipants || 0) < (currentProject.maxParticipants || Infinity) &&
        !deadlinePassed;

    return (
        <>
            <SEOHead
                title={metaData.title}
                description={metaData.description}
                keywords={metaData.keywords}
                image={metaData.image}
                type="article"
                publishedTime={currentProject?.timeline?.startDate}
                modifiedTime={currentProject?.timeline?.endDate || currentProject?.updatedAt}
                author={metaData.author}
                section={metaData.section}
                tags={metaData.tags}
                structuredData={structuredData}
            />
            <div className="project-view-container">
                {/* Hero Section */}
                <section className="project-view-hero">
                    <div className="project-view-hero-background">
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
                            <div className="project-view-breadcrumb">
                                <Link to="/initiatives" className="project-view-breadcrumb-link">
                                    {t('projectView.breadcrumb.initiatives')}
                                </Link>
                                <span className="project-view-breadcrumb-separator">›</span>
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

                                    {(currentProject.fullDescription || currentProject.shortDescription) && (
                                        <div className="project-view-description">
                                            {renderContent(currentProject.fullDescription || currentProject.shortDescription)}
                                        </div>
                                    )}

                                    <div className="project-view-meta">
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

                                        {currentProject.location && (
                                            <div className="project-view-meta-item">
                                                <span className="project-view-meta-label">{t('projectView.meta.location')}:</span>
                                                <span className="project-view-meta-value">
                                                    {locationText || t('location.loading')}
                                                </span>
                                            </div>
                                        )}

                                        {(currentProject.currentParticipants !== undefined || currentProject.maxParticipants !== undefined) && (
                                            <div className="project-view-meta-item">
                                                {currentProject.currentParticipants && <span className="project-view-meta-label">{t('projectView.meta.participants')}:</span>}
                                                {currentProject.currentParticipants && <span className="project-view-meta-value">
                                                    {currentProject.currentParticipants || 0} / {currentProject.maxParticipants || '∞'}
                                                </span>}
                                            </div>
                                        )}

                                        {currentProject.beneficiaries?.totalCount && currentProject.beneficiaries.totalCount > 0 && (
                                            <div className="project-view-meta-item">
                                                <span className="project-view-meta-label">{t('projectView.meta.beneficiaries')}:</span>
                                                <span className="project-view-meta-value">
                                                    {currentProject.beneficiaries.totalCount}
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

                                {(() => {
                                    const hasBudget = currentProject.budget?.funded && currentProject.budget?.total &&
                                        Number(currentProject.budget.funded) > 0 && Number(currentProject.budget.total) > 0;

                                    const hasDuration = currentProject.timeline?.estimatedDuration &&
                                        currentProject.timeline.estimatedDuration !== null &&
                                        currentProject.timeline.estimatedDuration !== '' &&
                                        currentProject.timeline.estimatedDuration !== '0' &&
                                        String(currentProject.timeline.estimatedDuration).trim() !== '';

                                    const hasTeam = currentProject.team &&
                                        Array.isArray(currentProject.team) &&
                                        currentProject.team.length > 0;

                                    return (hasBudget || hasDuration || hasTeam) ? (
                                        <div className="project-view-stats-card">
                                            {hasBudget && (
                                                <div className="project-view-stats-item">
                                                    <div className="project-view-stats-number">
                                                        {Math.round((Number(currentProject.budget.funded) / Number(currentProject.budget.total)) * 100)}%
                                                    </div>
                                                    <div className="project-view-stats-label">{t('projectView.stats.funded')}</div>
                                                </div>
                                            )}

                                            {hasDuration && (
                                                <div className="project-view-stats-item">
                                                    <div className="project-view-stats-number">{currentProject.timeline.estimatedDuration}</div>
                                                    <div className="project-view-stats-label">{t('projectView.stats.duration')}</div>
                                                </div>
                                            )}

                                            {hasTeam && (
                                                <div className="project-view-stats-item">
                                                    <div className="project-view-stats-number">{currentProject.team.length}</div>
                                                    <div className="project-view-stats-label">{t('projectView.stats.team')}</div>
                                                </div>
                                            )}
                                        </div>
                                    ) : null;
                                })()}
                            </div>

                        </div>
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
                            {sortedSections?.map((section) => (
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
                        {sortedSections?.map((section, index) => (
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
                        {/* Gallery Section */}
                        {currentProject.gallery?.length > 0 && (
                            <section id="gallery" className="project-view-section project-view-gallery-section">
                                <h2 className="project-view-section-title">{t('projectView.sections.gallery')}</h2>
                                <ProjectGallery
                                    gallery={currentProject.gallery}
                                    title={t('projectView.gallery.title')}
                                />
                            </section>
                        )}
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


                                                    <a href={material.downloadUrl}
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
                                                        <button
                                                            onClick={() => openEmailModal(member.name, member.email)}
                                                            className="project-view-contact-button"
                                                        >
                                                            {member.email}
                                                        </button>
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
                                                    <button
                                                        onClick={() => openEmailModal(
                                                            currentProject.contact.name,
                                                            currentProject.contact.email
                                                        )}
                                                        className="contact-item-button-project"
                                                    >
                                                        {currentProject.contact.email}
                                                    </button>
                                                </div>
                                            )}

                                            {currentProject.contact.phone && (
                                                <div className="project-view-contact-item">
                                                    <div className="contact-item-header">
                                                        <span className="contact-item-icon">📞</span>
                                                        <span className="contact-item-label">{t('projectView.contact.phone')}</span>
                                                    </div>

                                                    <a href={`tel:${currentProject.contact.phone}`}
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
                        {/* Application Form Section */}
                        {isAuthentication && !deadlinePassed && currentProject?.applicationStatus === 'open' && (
                            <section id="application-form" className="project-view-section">
                                <ApplicationForm
                                    project={currentProject}
                                    onSubmit={handleApplicationSubmit}
                                />
                            </section>
                        )}
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

                <ScrollToTop />
                <TextZoom />
            </div>
        </>
    );
};