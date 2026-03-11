// components/Projects/ProjectPreview/ProjectPreview.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useLocalizedNavigate } from '../../../../hooks/useLocalizedNavigate';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowLeft, faEdit, faImage, faEye, faExclamationTriangle,
    faSave, faShare, faCheckCircle, faLink, faExternalLinkAlt
} from '@fortawesome/free-solid-svg-icons';

// Styles
import './projectPreview.css';
import { useInitiativeContext } from '../../../contexts/InitiativeProvider';
import { useAuthContext } from '../../../contexts/UserContext';
import { getLocationFromCoordinates } from '../../../../utils/getLocationFromCoordinates';
import { renderSlateContent } from '../../../../utils/slateRenderer.jsx';
import { Milestones } from '../../InitiativeView/Milestones/Milestones';
import { ProjectBudget } from '../../InitiativeView/ProjectBudget/ProjectBudget';
import { SponsorsPartners } from '../../InitiativeView/SponsorsPartners/SponsorsPartners';
import { notify } from '../../../../utils/notify.jsx';
import ScrollToTop from '../../../ScrollToTop/ScrollToTop';

export const ProjectPreview = () => {
    const { t } = useTranslation('content');
    const navigate = useLocalizedNavigate();
    const location = useLocation();
    const { toggleProjectDraftStatus } = useInitiativeContext();
    const { isAuthentication } = useAuthContext();

    // Get preview data from navigation state
    const previewData = location.state?.previewData;
    const [locationText, setLocationText] = useState('');
    const [activeSection, setActiveSection] = useState('overview');

    // Redirect if no preview data
    useEffect(() => {
        if (!previewData) {
            notify('error', t('projects.preview.noDataError'));
            navigate('/projects-create');
        }
    }, [previewData, navigate, t]);

    // Load location text
    useEffect(() => {
        const loadLocation = async () => {
            if (previewData?.location?.[0]?.coordinates) {
                const coords = previewData.location[0].coordinates;
                if (coords.lat != null && coords.lng != null) {
                    const location = await getLocationFromCoordinates(coords.lat, coords.lng);
                    setLocationText(location);
                }
            }
        };

        if (previewData) {
            loadLocation();
        }
    }, [previewData]);

    // Handle navigation back to form
    const handleBackToForm = () => {
        // Запазваме данните в localStorage преди да се върнем
        try {
            const dataToSave = {
                ...previewData,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem('project_draft', JSON.stringify(dataToSave));
            localStorage.setItem('project_draft_timestamp', new Date().toISOString());
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }

        // Връщаме се към формата
        const editIdParam = previewData?.editId ? `?editId=${previewData.editId}&mode=edit` : '';
        const draftIdParam = previewData?.draftId && !previewData?.editId ? `?draftId=${previewData.draftId}` : '';

        navigate(`/projects-create${editIdParam || draftIdParam}`, {
            state: { formData: previewData }
        });
    };

    // Handle publishing draft
    const handlePublishDraft = async () => {
        if (!previewData?.draftId) {
            notify('error', t('projects.preview.noDraftError'));
            return;
        }

        try {
            const result = await toggleProjectDraftStatus(previewData.draftId);

            notify('success', t('projects.preview.publishedSuccessfully'));
            navigate('/projects');
        } catch (error) {
            console.error('Error publishing draft:', error);
            notify('error', t('projects.preview.publishError'));
        }
    };

    // File type icon helper
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

    // Content renderer helper
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

    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            setActiveSection(sectionId);
        }
    };

    // Проверка дали да се показва секцията с участници
    const shouldShowParticipants = (project) => {
        return (project.currentParticipants && project.currentParticipants > 0) ||
               (project.maxParticipants && project.maxParticipants > 0);
    };

    if (!previewData) {
        return (
            <div className="pp-loading">
                <FontAwesomeIcon icon={faExclamationTriangle} size="3x" />
                <p>{t('projects.preview.noDataError')}</p>
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>{t('projects.preview.title')} - {previewData.title} | Pensa Club</title>
                <meta name="description" content={t('projects.preview.description')} />
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>

            <div className="pp-container">
                {/* Preview Header */}
                <div className="pp-header">
                    <div className="container">
                        <div className="pp-header-content">
                            <div className="pp-header-left">
                                <button
                                    className="pp-back-btn"
                                    onClick={handleBackToForm}
                                >
                                    <FontAwesomeIcon icon={faArrowLeft} />
                                    {t('projects.preview.backToForm')}
                                </button>

                                <div className="pp-header-info">
                                    <h1 className="pp-header-title">
                                        <FontAwesomeIcon icon={faEye} />
                                        {t('projects.preview.previewMode')}
                                    </h1>
                                    <p className="pp-header-subtitle">
                                        {t('projects.preview.previewDescription')}
                                    </p>
                                </div>
                            </div>

                            <div className="pp-header-actions">
                                <button
                                    className="pp-action-btn edit"
                                    onClick={handleBackToForm}
                                >
                                    <FontAwesomeIcon icon={faEdit} />
                                    {t('projects.preview.editProject')}
                                </button>

                                {previewData.draftId && (
                                    <button
                                        className="pp-action-btn publish"
                                        onClick={handlePublishDraft}
                                    >
                                        <FontAwesomeIcon icon={faShare} />
                                        {t('projects.preview.publishProject')}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Hero Section - Same as ProjectView */}
                <section className="pp-hero">
                    <div className="pp-hero-background">
                        {previewData.mainImage?.src ? (
                            <img
                                src={previewData.mainImage.src}
                                alt={previewData.mainImage.alt || previewData.title}
                                className="pp-hero-image"
                            />
                        ) : (
                            <div className="pp-hero-placeholder">
                                <FontAwesomeIcon icon={faImage} size="4x" />
                                <p>Няма главно изображение</p>
                            </div>
                        )}
                        <div className="pp-hero-overlay"></div>
                    </div>

                    <div className="pp-hero-content">
                        <div className="container">
                            <div className="pp-breadcrumb">
                                <span className="pp-breadcrumb-current">
                                    {t('projects.preview.previewMode')} - {previewData.title}
                                </span>
                            </div>

                            <div className="pp-hero-main">
                                <div className="pp-hero-text">
                                    <div className="pp-badges">
                                        {previewData.logo && (
                                            <div className="pp-logo">
                                                <img src={previewData.logo} alt={`${previewData.title} logo`} />
                                            </div>
                                        )}
                                        {previewData.status && (
                                            <span className={`pp-status ${previewData.status}`}>
                                                {t(`projectView.status.${previewData.status}`)}
                                            </span>
                                        )}
                                        {previewData.priority && (
                                            <span className={`pp-priority ${previewData.priority}`}>
                                                {t(`projectView.priority.${previewData.priority}`)} {t('projectView.priorityLabel')}
                                            </span>
                                        )}
                                    </div>

                                    <h1 className="pp-title">{previewData.title}</h1>

                                    {(previewData.fullDescription || previewData.shortDescription) && (
                                        <div className="pp-description">
                                            {renderContent(previewData.fullDescription || previewData.shortDescription)}
                                        </div>
                                    )}

                                    <div className="pp-meta">
                                        {(previewData.timeline?.startDate || previewData.timeline?.endDate) && (
                                            <div className="pp-meta-item pp-meta-timeline">
                                                <span className="pp-meta-label">{t('projectView.meta.timeline')}:</span>
                                                <div className="pp-meta-timeline-dates">
                                                    {previewData.timeline?.startDate && (
                                                        <span className="pp-timeline-start">
                                                            {new Date(previewData.timeline.startDate).toLocaleDateString('bg-BG')}
                                                        </span>
                                                    )}
                                                    {previewData.timeline?.startDate && previewData.timeline?.endDate && (
                                                        <span className="pp-timeline-separator">-</span>
                                                    )}
                                                    {previewData.timeline?.endDate && (
                                                        <span className="pp-timeline-end">
                                                            {new Date(previewData.timeline.endDate).toLocaleDateString('bg-BG')}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {previewData.category && (
                                            <div className="pp-meta-item">
                                                <span className="pp-meta-label">{t('projectView.meta.category')}:</span>
                                                <span className="pp-meta-value">{previewData.category}</span>
                                            </div>
                                        )}

                                        {previewData.location && (
                                            <div className="pp-meta-item">
                                                <span className="pp-meta-label">{t('projectView.meta.location')}:</span>
                                                <span className="pp-meta-value">
                                                    {locationText || t('location.loading')}
                                                </span>
                                            </div>
                                        )}

                                        {shouldShowParticipants(previewData) && (
                                            <div className="pp-meta-item">
                                                <span className="pp-meta-label">{t('projectView.meta.participants')}:</span>
                                                <span className="pp-meta-value">
                                                    {previewData.currentParticipants || 0} / {previewData.maxParticipants || '∞'}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Stats Card */}
                                {(previewData.budget || previewData.timeline || previewData.team) && (
                                    <div className="pp-stats-card">
                                        {previewData.budget?.funded && previewData.budget?.total && (
                                            <div className="pp-stats-item">
                                                <div className="pp-stats-number">
                                                    {Math.round((previewData.budget.funded / previewData.budget.total) * 100)}%
                                                </div>
                                                <div className="pp-stats-label">{t('projectView.stats.funded')}</div>
                                            </div>
                                        )}

                                        {previewData.timeline?.estimatedDuration && (
                                            <div className="pp-stats-item">
                                                <div className="pp-stats-number">{previewData.timeline.estimatedDuration}</div>
                                                <div className="pp-stats-label">{t('projectView.stats.duration')}</div>
                                            </div>
                                        )}

                                        {previewData.team?.length && (
                                            <div className="pp-stats-item">
                                                <div className="pp-stats-number">{previewData.team.length}</div>
                                                <div className="pp-stats-label">{t('projectView.stats.team')}</div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Navigation */}
                <nav className="pp-nav">
                    <div className="container">
                        <div className="pp-nav-links">
                            {previewData.sections?.map((section, index) => (
                                <button
                                    key={section.titleSlug || `section-${index}`}
                                    className={`pp-nav-link ${activeSection === (section.titleSlug || `section-${index}`) ? 'active' : ''}`}
                                    onClick={() => scrollToSection(section.titleSlug || `section-${index}`)}
                                >
                                    {section.title}
                                </button>
                            ))}

                            {previewData.downloadMaterials?.length > 0 && (
                                <button
                                    key="download-materials"
                                    className={`pp-nav-link ${activeSection === 'download-materials' ? 'active' : ''}`}
                                    onClick={() => scrollToSection('download-materials')}
                                >
                                    {t('projectView.navigation.downloadMaterials')}
                                </button>
                            )}

                            {(previewData.budget?.goal || previewData.budget?.total || previewData.budget?.funded) && (
                                <button
                                    key="budget"
                                    className={`pp-nav-link ${activeSection === 'budget' ? 'active' : ''}`}
                                    onClick={() => scrollToSection('budget')}
                                >
                                    {t('projectView.navigation.budget')}
                                </button>
                            )}

                            {((previewData.sponsors && previewData.sponsors.length > 0) ||
                                (previewData.partners && previewData.partners.length > 0)) && (
                                    <button
                                        key="sponsors-partners"
                                        className={`pp-nav-link ${activeSection === 'sponsors-partners' ? 'active' : ''}`}
                                        onClick={() => scrollToSection('sponsors-partners')}
                                    >
                                        {t('projectView.navigation.sponsorsPartners')}
                                    </button>
                                )}

                            {previewData.milestones?.length > 0 && (
                                <button
                                    key="milestones"
                                    className={`pp-nav-link ${activeSection === 'milestones' ? 'active' : ''}`}
                                    onClick={() => scrollToSection('milestones')}
                                >
                                    {t('projectView.navigation.milestones')}
                                </button>
                            )}

                            {previewData.usefulLinks?.length > 0 && (
                                <button
                                    key="useful-links"
                                    className={`pp-nav-link ${activeSection === 'useful-links' ? 'active' : ''}`}
                                    onClick={() => scrollToSection('useful-links')}
                                >
                                    {t('projectView.navigation.usefulLinks')}
                                </button>
                            )}

                            {previewData.team?.length > 0 && (
                                <button
                                    key="team"
                                    className={`pp-nav-link ${activeSection === 'team' ? 'active' : ''}`}
                                    onClick={() => scrollToSection('team')}
                                >
                                    {t('projectView.navigation.team')}
                                </button>
                            )}

                            {previewData.contact?.name && (
                                <button
                                    key="contact"
                                    className={`pp-nav-link ${activeSection === 'contact' ? 'active' : ''}`}
                                    onClick={() => scrollToSection('contact')}
                                >
                                    {t('projectView.navigation.contact')}
                                </button>
                            )}
                        </div>
                    </div>
                </nav>

                {/* Content Sections */}
                <div className="pp-content">
                    <div className="container">
                        {/* Project Sections */}
                        {previewData.sections?.map((section, index) => (
                            <section
                                key={section.titleSlug || `section-${index}`}
                                id={section.titleSlug || `section-${index}`}
                                className={`pp-section ${index % 2 === 0 ? 'pp-section-left' : 'pp-section-right'}`}
                            >
                                <div className="pp-section-content">
                                    <div className="pp-section-text">
                                        <h2 className="pp-section-title">{section.title}</h2>
                                        <div className="pp-section-description slate-content" data-editor="slate">
                                            {renderContent(section.content)}
                                        </div>
                                    </div>

                                    {(section.image?.src || (section.images && section.images.length > 0)) && (
                                        <div className="pp-section-image">
                                            <img
                                                src={section.image?.src || section.images[0]?.src}
                                                alt={section.image?.alt || section.images[0]?.alt || section.title}
                                            />
                                            {(section.image?.caption || section.images?.[0]?.caption) && (
                                                <div className="pp-image-caption">
                                                    {section.image?.caption || section.images[0]?.caption}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </section>
                        ))}

                        {/* Download Materials Section */}
                        {previewData.downloadMaterials?.length > 0 && (
                            <section id="download-materials" className="pp-section pp-download-section">
                                <h2 className="pp-section-title">{t('projectView.sections.downloadMaterials')}</h2>

                                <div className="pp-download-grid">
                                    {previewData.downloadMaterials.map((material, index) => (
                                        <div key={index} className="pp-download-card">
                                            <div className="pp-download-card-preview">
                                                {material.image ? (
                                                    <img
                                                        src={material.image.src}
                                                        alt={material.image.alt || material.title}
                                                        className="pp-download-preview-image"
                                                    />
                                                ) : (
                                                    <div className="pp-download-preview-placeholder">
                                                        <span className="pp-file-type-icon">
                                                            {getFileTypeIcon(material.fileType)}
                                                        </span>
                                                        <span className="pp-file-extension">{material.fileType?.toUpperCase()}</span>
                                                    </div>
                                                )}

                                                <div className="pp-download-card-overlay">
                                                    <span className="pp-download-overlay-icon">⬇</span>
                                                </div>
                                            </div>

                                            <div className="pp-download-card-content">
                                                <h3 className="pp-download-card-title">{material.title}</h3>

                                                {material.description && (
                                                    <p className="pp-download-card-description">
                                                        {material.description}
                                                    </p>
                                                )}

                                                <div className="pp-download-card-meta">
                                                    <div className="pp-download-meta-items">
                                                        <span className="pp-download-meta-item">
                                                            <span className="pp-meta-icon">📄</span>
                                                            <span className="pp-meta-value-dl">{material.fileType?.toUpperCase()}</span>
                                                        </span>

                                                        {material.fileSize && (
                                                            <span className="pp-download-meta-item">
                                                                <span className="pp-meta-icon">💾</span>
                                                                <span className="pp-meta-value-dl">{material.fileSize} MB</span>
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="pp-download-btn preview-disabled">
                                                        <span className="pp-download-btn-icon">⬇</span>
                                                        {t('projectView.downloadMaterials.download')}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Budget Section */}
                        {(previewData.budget?.goal || previewData.budget?.total || previewData.budget?.funded) && (
                            <section id="budget" className="pp-section pp-budget-section">
                                <h2 className="pp-section-title">{t('projectView.sections.budget')}</h2>
                                <ProjectBudget
                                    budget={previewData.budget}
                                    currency={previewData.budget?.currency || 'BGN'}
                                />
                            </section>
                        )}

                        {/* Sponsors and Partners Section */}
                        {((previewData.sponsors && previewData.sponsors.length > 0) ||
                            (previewData.partners && previewData.partners.length > 0)) && (
                                <section id="sponsors-partners" className="pp-section pp-sponsors-section">
                                    <h2 className="pp-section-title">{t('projectView.sections.sponsorsPartners')}</h2>
                                    <SponsorsPartners
                                        sponsors={previewData.sponsors}
                                        partners={previewData.partners}
                                    />
                                </section>
                            )}

                        {/* Milestones Section */}
                        {previewData.milestones?.length > 0 && (
                            <section id="milestones" className="pp-section pp-milestones-section">
                                <h2 className="pp-section-title">{t('projectView.sections.milestones')}</h2>
                                <Milestones milestones={previewData.milestones} />
                            </section>
                        )}

                        {/* Useful Links Section */}
                        {previewData.usefulLinks?.length > 0 && (
                            <section id="useful-links" className="pp-section pp-useful-links-section">
                                <h2 className="pp-section-title">{t('projectView.sections.usefulLinks')}</h2>
                                <div className="pp-useful-links-grid">
                                    {previewData.usefulLinks.map((link, index) => (
                                        <a key={index} href={link.url} target="_blank" rel="noopener noreferrer" className="pp-useful-link-card">
                                            <div className="pp-useful-link-icon">
                                                <FontAwesomeIcon icon={faExternalLinkAlt} />
                                            </div>
                                            <div className="pp-useful-link-info">
                                                <span className="pp-useful-link-label">{link.label || link.url}</span>
                                                <span className="pp-useful-link-url">{link.url}</span>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Team Section */}
                        {previewData.team?.length > 0 && (
                            <section id="team" className="pp-section pp-team-section">
                                <h2 className="pp-section-title">{t('projectView.sections.team')}</h2>
                                <div className="pp-team-grid">
                                    {previewData.team.map((member, index) => (
                                        <div key={index} className="pp-team-member">
                                            {member.image && (
                                                <div className="pp-member-image">
                                                    <img src={member.image} alt={member.name} />
                                                </div>
                                            )}
                                            <div className="pp-member-info">
                                                <h3 className="pp-member-name">{member.name}</h3>
                                                {member.role && (
                                                    <p className="pp-member-position">{member.role}</p>
                                                )}
                                                <div className="pp-member-contact">
                                                    {member.email && (
                                                        <span className="pp-contact-link">
                                                            {member.email}
                                                        </span>
                                                    )}
                                                    {member.phone && (
                                                        <span className="pp-contact-link">
                                                            {member.phone}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Contact Section */}
                        {previewData.contact?.name && (
                            <section id="contact" className="pp-section pp-contact-section">
                                <h2 className="pp-section-title">{t('projectView.sections.contact')}</h2>

                                <div className="pp-contact-content">
                                    <div className="pp-contact-card">
                                        <div className="pp-contact-person">
                                            {previewData.contact.image && (
                                                <div className="pp-contact-photo">
                                                    <img
                                                        src={previewData.contact.image}
                                                        alt={previewData.contact.name}
                                                    />
                                                </div>
                                            )}

                                            <div className="pp-contact-details">
                                                <h3 className="pp-contact-name">{previewData.contact.name}</h3>
                                                {previewData.contact.role && (
                                                    <p className="pp-contact-role">{previewData.contact.role}</p>
                                                )}
                                                <span className="pp-contact-label">{t('projectView.contact.projectContact')}</span>
                                            </div>
                                        </div>

                                        <div className="pp-contact-info">
                                            {previewData.contact.email && (
                                                <div className="pp-contact-item">
                                                    <div className="pp-contact-item-header">
                                                        <span className="pp-contact-item-icon">✉</span>
                                                        <span className="pp-contact-item-label">{t('projectView.contact.email')}</span>
                                                    </div>
                                                    <span className="pp-contact-item-value">
                                                        {previewData.contact.email}
                                                    </span>
                                                </div>
                                            )}

                                            {previewData.contact.phone && (
                                                <div className="pp-contact-item">
                                                    <div className="pp-contact-item-header">
                                                        <span className="pp-contact-item-icon">📞</span>
                                                        <span className="pp-contact-item-label">{t('projectView.contact.phone')}</span>
                                                    </div>
                                                    <span className="pp-contact-item-value">
                                                        {previewData.contact.phone}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}
                    </div>
                </div>
                <ScrollToTop />
            </div>
        </>
    );
};

export default ProjectPreview;
