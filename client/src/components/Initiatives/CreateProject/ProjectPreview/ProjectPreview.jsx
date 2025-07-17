// components/Projects/ProjectPreview/ProjectPreview.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faArrowLeft, faEdit, faImage, faEye, faExclamationTriangle,
    faSave, faShare, faCheckCircle
} from '@fortawesome/free-solid-svg-icons';

// Styles
import './projectPreview.css';
import { useInitiativeContext } from '../../../contexts/InitiativeProvider';
import { useAuthContext } from '../../../contexts/UserContext';
import { getLocationFromCoordinates } from '../../../../utils/getLocationFromCoordinates';
import { renderSlateContent } from '../../../../utils/slateRenderer';
import { Milestones } from '../../InitiativeView/Milestones/Milestones';
import { ProjectBudget } from '../../InitiativeView/ProjectBudget/ProjectBudget';
import { SponsorsPartners } from '../../InitiativeView/SponsorsPartners/SponsorsPartners';
import { notify } from '../../../../utils/notify';
import ScrollToTop from '../../../ScrollToTop/ScrollToTop';

export const ProjectPreview = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const { toggleProjectDraftStatus, deleteDraftProject } = useInitiativeContext();
    const { isAuthentication } = useAuthContext();

    // Get preview data from navigation state
    const previewData = location.state?.previewData;
    const [locationText, setLocationText] = useState('');
    const [activeSection, setActiveSection] = useState('overview');

    // Redirect if no preview data
    useEffect(() => {
        if (!previewData) {
            notify('error', t('projects.preview.noDataError'));
            navigate('/profile/project-create');
        }
    }, [previewData, navigate, t]);

    // Load location text
    useEffect(() => {
        const loadLocation = async () => {
            if (previewData?.location?.[0]?.coordinates) {
                const coords = previewData.location[0].coordinates;
                const location = await getLocationFromCoordinates(coords.lat, coords.lng);
                setLocationText(location);
            }
        };

        if (previewData) {
            loadLocation();
        }
    }, [previewData]);

    // Handle navigation back to form
    const handleBackToForm = () => {
        navigate('/profile/projects-create', {
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
            
            // Delete draft after publishing
            try {
                await deleteDraftProject(previewData.draftId);
            } catch (deleteError) {
                console.warn('Could not delete draft:', deleteError);
            }

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

    if (!previewData) {
        return (
            <div className="project-preview-loading">
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

            <div className="project-preview-container">
                {/* Preview Header */}
                <div className="project-preview-header">
                    <div className="container">
                        <div className="project-preview-header-content">
                            <div className="project-preview-header-left">
                                <button
                                    className="project-preview-back-btn"
                                    onClick={handleBackToForm}
                                >
                                    <FontAwesomeIcon icon={faArrowLeft} />
                                    {t('projects.preview.backToForm')}
                                </button>
                                
                                <div className="project-preview-header-info">
                                    <h1 className="project-preview-header-title">
                                        <FontAwesomeIcon icon={faEye} />
                                        {t('projects.preview.previewMode')}
                                    </h1>
                                    <p className="project-preview-header-subtitle">
                                        {t('projects.preview.previewDescription')}
                                    </p>
                                </div>
                            </div>

                            <div className="project-preview-header-actions">
                                <button
                                    className="project-preview-action-btn edit"
                                    onClick={handleBackToForm}
                                >
                                    <FontAwesomeIcon icon={faEdit} />
                                    {t('projects.preview.editProject')}
                                </button>

                                {previewData.draftId && (
                                    <button
                                        className="project-preview-action-btn publish"
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
                <section className="project-view-hero">
                    <div className="project-view-hero-background">
                        {previewData.mainImage?.src ? (
                            <img
                                src={previewData.mainImage.src}
                                alt={previewData.mainImage.alt || previewData.title}
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
                                <span className="project-view-breadcrumb-current">
                                    {t('projects.preview.previewMode')} - {previewData.title}
                                </span>
                            </div>

                            <div className="project-view-hero-main">
                                <div className="project-view-hero-text">
                                    <div className="project-view-badges">
                                        {previewData.logo && (
                                            <div className="project-view-logo">
                                                <img src={previewData.logo} alt={`${previewData.title} logo`} />
                                            </div>
                                        )}
                                        {previewData.status && (
                                            <span className={`project-view-status ${previewData.status}`}>
                                                {t(`projectView.status.${previewData.status}`)}
                                            </span>
                                        )}
                                        {previewData.priority && (
                                            <span className={`project-view-priority ${previewData.priority}`}>
                                                {t(`projectView.priority.${previewData.priority}`)} {t('projectView.priorityLabel')}
                                            </span>
                                        )}
                                    </div>

                                    <h1 className="project-view-title">{previewData.title}</h1>

                                    {(previewData.fullDescription || previewData.shortDescription) && (
                                        <div className="project-view-description">
                                            {renderContent(previewData.fullDescription || previewData.shortDescription)}
                                        </div>
                                    )}

                                    <div className="project-view-meta">
                                        {(previewData.timeline?.startDate || previewData.timeline?.endDate) && (
                                            <div className="project-view-meta-item project-view-meta-timeline">
                                                <span className="project-view-meta-label">{t('projectView.meta.timeline')}:</span>
                                                <div className="project-view-meta-timeline-dates">
                                                    {previewData.timeline?.startDate && (
                                                        <span className="project-view-timeline-start">
                                                            {new Date(previewData.timeline.startDate).toLocaleDateString('bg-BG')}
                                                        </span>
                                                    )}
                                                    {previewData.timeline?.startDate && previewData.timeline?.endDate && (
                                                        <span className="project-view-timeline-separator">-</span>
                                                    )}
                                                    {previewData.timeline?.endDate && (
                                                        <span className="project-view-timeline-end">
                                                            {new Date(previewData.timeline.endDate).toLocaleDateString('bg-BG')}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {previewData.category && (
                                            <div className="project-view-meta-item">
                                                <span className="project-view-meta-label">{t('projectView.meta.category')}:</span>
                                                <span className="project-view-meta-value">{previewData.category}</span>
                                            </div>
                                        )}

                                        {previewData.location && (
                                            <div className="project-view-meta-item">
                                                <span className="project-view-meta-label">{t('projectView.meta.location')}:</span>
                                                <span className="project-view-meta-value">
                                                    {locationText || t('location.loading')}
                                                </span>
                                            </div>
                                        )}

                                        {(previewData.currentParticipants !== undefined || previewData.maxParticipants !== undefined) && (
                                            <div className="project-view-meta-item">
                                                <span className="project-view-meta-label">{t('projectView.meta.participants')}:</span>
                                                <span className="project-view-meta-value">
                                                    {previewData.currentParticipants || 0} / {previewData.maxParticipants || '∞'}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Stats Card */}
                                {(previewData.budget || previewData.timeline || previewData.team) && (
                                    <div className="project-view-stats-card">
                                        {previewData.budget?.funded && previewData.budget?.total && (
                                            <div className="project-view-stats-item">
                                                <div className="project-view-stats-number">
                                                    {Math.round((previewData.budget.funded / previewData.budget.total) * 100)}%
                                                </div>
                                                <div className="project-view-stats-label">{t('projectView.stats.funded')}</div>
                                            </div>
                                        )}

                                        {previewData.timeline?.estimatedDuration && (
                                            <div className="project-view-stats-item">
                                                <div className="project-view-stats-number">{previewData.timeline.estimatedDuration}</div>
                                                <div className="project-view-stats-label">{t('projectView.stats.duration')}</div>
                                            </div>
                                        )}

                                        {previewData.team?.length && (
                                            <div className="project-view-stats-item">
                                                <div className="project-view-stats-number">{previewData.team.length}</div>
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
                            {previewData.sections?.map((section) => (
                                <button
                                    key={section.titleSlug}
                                    className={`project-view-nav-link ${activeSection === section.titleSlug ? 'active' : ''}`}
                                    onClick={() => scrollToSection(section.titleSlug)}
                                >
                                    {section.title}
                                </button>
                            ))}

                            {previewData.downloadMaterials?.length > 0 && (
                                <button
                                    className={`project-view-nav-link ${activeSection === 'download-materials' ? 'active' : ''}`}
                                    onClick={() => scrollToSection('download-materials')}
                                >
                                    {t('projectView.navigation.downloadMaterials')}
                                </button>
                            )}

                            {(previewData.budget?.goal || previewData.budget?.total || previewData.budget?.funded) && (
                                <button
                                    className={`project-view-nav-link ${activeSection === 'budget' ? 'active' : ''}`}
                                    onClick={() => scrollToSection('budget')}
                                >
                                    {t('projectView.navigation.budget')}
                                </button>
                            )}

                            {((previewData.sponsors && previewData.sponsors.length > 0) ||
                                (previewData.partners && previewData.partners.length > 0)) && (
                                    <button
                                        className={`project-view-nav-link ${activeSection === 'sponsors-partners' ? 'active' : ''}`}
                                        onClick={() => scrollToSection('sponsors-partners')}
                                    >
                                        {t('projectView.navigation.sponsorsPartners')}
                                    </button>
                                )}

                            {previewData.team?.length > 0 && (
                                <button
                                    className={`project-view-nav-link ${activeSection === 'team' ? 'active' : ''}`}
                                    onClick={() => scrollToSection('team')}
                                >
                                    {t('projectView.navigation.team')}
                                </button>
                            )}

                            {previewData.contact?.name && (
                                <button
                                    className={`project-view-nav-link ${activeSection === 'contact' ? 'active' : ''}`}
                                    onClick={() => scrollToSection('contact')}
                                >
                                    {t('projectView.navigation.contact')}
                                </button>
                            )}
                        </div>
                    </div>
                </nav>

                {/* Content Sections */}
                <div className="project-view-content">
                    <div className="container">
                        {/* Project Sections */}
                        {previewData.sections?.map((section, index) => (
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

                        {/* Download Materials Section */}
                        {previewData.downloadMaterials?.length > 0 && (
                            <section id="download-materials" className="project-view-section project-view-download-section">
                                <h2 className="project-view-section-title">{t('projectView.sections.downloadMaterials')}</h2>

                                <div className="project-view-download-grid">
                                    {previewData.downloadMaterials.map((material, index) => (
                                        <div key={index} className="project-view-download-card">
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

                                                    <div className="download-card-button preview-disabled">
                                                        <span className="download-button-icon">⬇</span>
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
                            <section id="budget" className="project-view-section project-view-budget-section">
                                <h2 className="project-view-section-title">{t('projectView.sections.budget')}</h2>
                                <ProjectBudget
                                    budget={previewData.budget}
                                    currency={previewData.budget?.currency || 'BGN'}
                                />
                            </section>
                        )}

                        {/* Sponsors and Partners Section */}
                        {((previewData.sponsors && previewData.sponsors.length > 0) ||
                            (previewData.partners && previewData.partners.length > 0)) && (
                                <section id="sponsors-partners" className="project-view-section project-view-sponsors-partners-section">
                                    <h2 className="project-view-section-title">{t('projectView.sections.sponsorsPartners')}</h2>
                                    <SponsorsPartners
                                        sponsors={previewData.sponsors}
                                        partners={previewData.partners}
                                    />
                                </section>
                            )}

                        {/* Milestones Section */}
                        {previewData.milestones?.length > 0 && (
                            <section id="milestones" className="project-view-section project-view-milestones-section">
                                <h2 className="project-view-section-title">{t('projectView.sections.milestones')}</h2>
                                <Milestones milestones={previewData.milestones} />
                            </section>
                        )}

                        {/* Team Section */}
                        {previewData.team?.length > 0 && (
                            <section id="team" className="project-view-section project-view-team-section">
                                <h2 className="project-view-section-title">{t('projectView.sections.team')}</h2>
                                <div className="project-view-team-grid">
                                    {previewData.team.map((member, index) => (
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
                                                        <span className="project-view-contact-link">
                                                            {member.email}
                                                        </span>
                                                    )}
                                                    {member.phone && (
                                                        <span className="project-view-contact-link">
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
                            <section id="contact" className="project-view-section project-view-contact-section">
                                <h2 className="project-view-section-title">{t('projectView.sections.contact')}</h2>

                                <div className="project-view-contact-content">
                                    <div className="project-view-contact-card">
                                        <div className="project-view-contact-person">
                                            {previewData.contact.image && (
                                                <div className="project-view-contact-photo">
                                                    <img
                                                        src={previewData.contact.image}
                                                        alt={previewData.contact.name}
                                                    />
                                                </div>
                                            )}

                                            <div className="project-view-contact-details">
                                                <h3 className="project-view-contact-name">{previewData.contact.name}</h3>
                                                {previewData.contact.role && (
                                                    <p className="project-view-contact-role">{previewData.contact.role}</p>
                                                )}
                                                <span className="project-view-contact-label">{t('projectView.contact.projectContact')}</span>
                                            </div>
                                        </div>

                                        <div className="project-view-contact-info">
                                            {previewData.contact.email && (
                                                <div className="project-view-contact-item">
                                                    <div className="contact-item-header">
                                                        <span className="contact-item-icon">✉</span>
                                                        <span className="contact-item-label">{t('projectView.contact.email')}</span>
                                                    </div>
                                                    <span className="contact-item-value">
                                                        {previewData.contact.email}
                                                    </span>
                                                </div>
                                            )}

                                            {previewData.contact.phone && (
                                                <div className="project-view-contact-item">
                                                    <div className="contact-item-header">
                                                        <span className="contact-item-icon">📞</span>
                                                        <span className="contact-item-label">{t('projectView.contact.phone')}</span>
                                                    </div>
                                                    <span className="contact-item-value">
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