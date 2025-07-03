import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './initiativePreview.css';
import '../../InitiativeView/initiativeView.css';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowLeft, faCalendar, faUsers, faHandshake, faTrophy, faTag,
    faQuestionCircle, faMapMarkerAlt, faEnvelope, faPhone,
    faGlobe, faUser, faBullseye, faMoneyBillWave, faImage,
    faBuilding, faChartLine
} from '@fortawesome/free-solid-svg-icons';
import {
    faFacebook, faInstagram, faLinkedin, faTwitter
} from '@fortawesome/free-brands-svg-icons';
import { getDescriptionParts, renderSlateContent } from '../../../../utils/slateRenderer';
import { truncateText } from '../../../../utils/truncateText';

export const InitiativePreview = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const values = location.state?.previewData || {};
    const [showMap, setShowMap] = useState(true);
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
            'detailed-description', 'sections', 'timeline', 'target-scope',
            'progress-results', 'partners-sponsors', 'contact', 'faq', 'gallery'
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
    }, []);

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

    const onBackToEdit = () => {
        navigate('/initiatives/create', {
            state: { formData: values }
        });
    };

    const { firstSentence, restSentences } = getDescriptionParts(values.shortDescription);

    return (
        <div className="initiative-view initiative-preview">
            {/* Preview Header */}
            <div className="preview-header">
                <button
                    className="back-to-edit-btn"
                    onClick={onBackToEdit}
                >
                    <FontAwesomeIcon icon={faArrowLeft} />
                    {t('initiatives.preview.backToForm')}
                </button>
                <div className="preview-badge">
                    📝 PREVIEW MODE
                </div>
            </div>

            {/* Hero Section */}
            <div className="initiative-hero">
                <div className="initiative-hero-image">
                    {values.mainImage?.src ? (
                        <img
                            src={values.mainImage.src}
                            alt={values.mainImage.alt || values.title}
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
                        {values.logo && (
                            <div className="initiative-logo">
                                <img src={values.logo} alt="Initiative Logo" />
                            </div>
                        )}

                        <h1 className="initiative-title">{values.title || 'Без заглавие'}</h1>

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
                        {values.detailedDescription && (

                            <a href="#detailed-description"
                                onClick={handleSmoothScroll}
                                className={`sticky-nav-link ${activeSection === 'detailed-description' ? 'active' : ''}`}
                            >
                                {t('initiatives.view.navigation.description')}
                            </a>
                        )}

                        {values.sections && values.sections.length > 0 && (

                            <a href="#sections"
                                onClick={handleSmoothScroll}
                                className={`sticky-nav-link ${activeSection === 'sections' ? 'active' : ''}`}
                            >
                                {t('initiatives.view.navigation.sections')}
                            </a>
                        )}

                        {(values.startDate || values.endDate || values.milestones?.length > 0) && (

                            <a href="#timeline"
                                onClick={handleSmoothScroll}
                                className={`sticky-nav-link ${activeSection === 'timeline' ? 'active' : ''}`}
                            >
                                {t('initiatives.view.navigation.timeline')}
                            </a>
                        )}

                        {(values.targetAge?.length > 0 || values.targetAudience?.length > 0 || values.expectedBudget) && (

                            <a href="#target-scope"
                                onClick={handleSmoothScroll}
                                className={`sticky-nav-link ${activeSection === 'target-scope' ? 'active' : ''}`}
                            >
                                {t('initiatives.view.navigation.audience')}
                            </a>
                        )}

                        {(values.kpis?.length > 0 || values.expectedResults || values.progressReport) && (

                            <a href="#progress-results"
                                onClick={handleSmoothScroll}
                                className={`sticky-nav-link ${activeSection === 'progress-results' ? 'active' : ''}`}
                            >
                                {t('initiatives.view.navigation.results')}
                            </a>
                        )}

                        {(values.partners?.length > 0 || values.sponsors?.length > 0) && (

                            <a href="#partners-sponsors"
                                onClick={handleSmoothScroll}
                                className={`sticky-nav-link ${activeSection === 'partners-sponsors' ? 'active' : ''}`}
                            >
                                {t('initiatives.view.navigation.partners')}
                            </a>
                        )}
                        {(values.contact?.name !== "") && (
                            <a href="#contact"
                                onClick={handleSmoothScroll}
                                className={`sticky-nav-link ${activeSection === 'contact' ? 'active' : ''}`}
                            >
                                {t('initiatives.view.navigation.contact')}
                            </a>
                        )}
                        {values.faq?.length > 0 && (

                            <a href="#faq"
                                onClick={handleSmoothScroll}
                                className={`sticky-nav-link ${activeSection === 'faq' ? 'active' : ''}`}
                            >
                                {t('initiatives.view.navigation.faq')}
                            </a>
                        )}
                    </div>
                </div>
            </nav>

            <div className="initiative-content">

                {/* Detailed Description */}
                {values.detailedDescription && (
                    <section id="detailed-description" className="detailed-description-section">
                        <h2 className="section-title">{t('initiatives.view.sectionTitles.detailedDescription')}</h2>
                        <div className="detailed-content slate-content" data-editor="slate">
                            {(() => {
                                if (!values.detailedDescription) {
                                    return <p>{t('initiatives.view.placeholders.noContent')}</p>
                                }

                                if (typeof values.detailedDescription === 'string') {
                                    if (values.detailedDescription.includes('<') && values.detailedDescription.includes('>')) {
                                        return <div dangerouslySetInnerHTML={{ __html: values.detailedDescription }} />;
                                    }
                                    return <p>{values.detailedDescription}</p>;
                                }

                                if (Array.isArray(values.detailedDescription)) {
                                    return renderSlateContent(values.detailedDescription);
                                }

                                if (typeof values.detailedDescription === 'object') {
                                    try {
                                        return renderSlateContent(values.detailedDescription);
                                    } catch (error) {
                                        console.warn('Failed to render detailed description as Slate:', error);
                                        return <p>{JSON.stringify(values.detailedDescription)}</p>;
                                    }
                                }

                                return <p>{String(values.detailedDescription)}</p>;
                            })()}
                        </div>
                    </section>
                )}

                {/* Sections */}
                {values.sections && Array.isArray(values.sections) && values.sections.length > 0 && (
                    <section id="sections" className="initiative-sections">
                        <h2 className="section-title">
                            {t('initiatives.view.aboutInitiative')}
                        </h2>

                        <div className="sections-grid">
                            {values.sections.map((section, index) => (
                                <div key={`section-${section.id || section.titleSlug || index}`} className="content-section">
                                    <div className="section-content-initiative">
                                        <h3 className="section-heading">{section.title}</h3>
                                        <div className="section-text slate-content" data-editor="slate">
                                            {(() => {
                                                if (!section.content) {
                                                    return <p>{t('initiatives.view.placeholders.noContent')}</p>;
                                                }

                                                if (typeof section.content === 'string') {
                                                    if (section.content.includes('<') && section.content.includes('>')) {
                                                        return <div dangerouslySetInnerHTML={{ __html: section.content }} />;
                                                    }
                                                    return <p>{section.content}</p>;
                                                }

                                                if (Array.isArray(section.content)) {
                                                    return renderSlateContent(section.content);
                                                }

                                                if (typeof section.content === 'object') {
                                                    try {
                                                        return renderSlateContent(section.content);
                                                    } catch (error) {
                                                        console.warn('Failed to render section content as Slate:', error);
                                                        return <p>{JSON.stringify(section.content)}</p>;
                                                    }
                                                }

                                                return <p>{String(section.content)}</p>;
                                            })()}
                                        </div>
                                    </div>

                                    {section.images?.length > 0 && (
                                        <div className="section-image">
                                            <img
                                                src={section.images[0].src}
                                                alt={section.images[0].alt || section.title}
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Gallery */}
                {values.gallery?.length > 0 && (
                    <section id="gallery" className="gallery-section">
                        <h2 className="section-title">{t('initiatives.view.sectionTitles.gallery')}</h2>
                        <div className="gallery-grid">
                            {values.gallery.map((image, index) => (
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

                {/* Download Materials */}
                {values.downloadMaterials && Array.isArray(values.downloadMaterials) && values.downloadMaterials.length > 0 && (
                    <section className="download-materials">
                        <h2 className="section-title">
                            {t('initiatives.view.downloadMaterials')}
                        </h2>

                        <div className="materials-grid">
                            {values.downloadMaterials.map((material) => (
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

                {/* Timeline Section */}
                {(values.startDate || values.endDate || values.milestones?.length > 0) && (
                    <section id="timeline" className="timeline-section">
                        <h2 className="section-title">
                            <FontAwesomeIcon icon={faCalendar} />
                            {t('initiatives.view.sectionTitles.timeline')}
                        </h2>

                        <div className="timeline-content">
                            {(values.startDate || values.endDate) && (
                                <div className="timeline-dates">
                                    {values.startDate && (
                                        <div className="timeline-date">
                                            <strong>{t('initiatives.view.timeline.startDate')}</strong> {new Date(values.startDate).toLocaleDateString('bg-BG')}
                                        </div>
                                    )}
                                    {values.endDate && (
                                        <div className="timeline-date">
                                            <strong>{t('initiatives.view.timeline.endDate')}</strong> {new Date(values.endDate).toLocaleDateString('bg-BG')}
                                        </div>
                                    )}
                                </div>
                            )}

                            {values.milestones?.length > 0 && (
                                <div className="milestones-preview">
                                    <h3>{t('initiatives.view.timeline.milestones')}</h3>
                                    <div className="milestones-list">
                                        {values.milestones.map((milestone, index) => (
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
                {(values.targetAge?.length > 0 || values.targetAudience?.length > 0 || values.expectedBudget || values.customAudience) && (
                    <section id="target-scope" className="target-scope-section">
                        <h2 className="section-title">
                            <FontAwesomeIcon icon={faBullseye} />
                            {t('initiatives.view.sectionTitles.targetScope')}
                        </h2>

                        <div className="target-scope-content">
                            {values.targetAge?.length > 0 && (
                                <div className="target-item">
                                    <h4>{t('initiatives.view.targetScope.targetAge')}</h4>
                                    <div className="target-tags">
                                        {values.targetAge.map((age, index) => (
                                            <span key={index} className="target-tag age-tag">{age}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {values.targetAudience?.length > 0 && (
                                <div className="target-item">
                                    <h4>{t('initiatives.view.targetScope.targetAudience')}</h4>
                                    <div className="target-tags">
                                        {values.targetAudience.map((audience, index) => (
                                            <span key={index} className="target-tag audience-tag">{audience}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {values.customAudience && (
                                <div className="target-item">
                                    <h4>{t('initiatives.view.targetScope.customAudience')}</h4>
                                    <p className="custom-audience-text">{values.customAudience}</p>
                                </div>
                            )}

                            {values.expectedBudget && (
                                <div className="target-item">
                                    <h4>{t('initiatives.view.targetScope.expectedBudget')}</h4>
                                    <div className="budget-display">
                                        <FontAwesomeIcon icon={faMoneyBillWave} />
                                        {parseInt(values.expectedBudget).toLocaleString()} {values.currency || 'BGN'}
                                    </div>
                                </div>
                            )}

                            {values.fundingSources?.length > 0 && (
                                <div className="target-item">
                                    <h4>{t('initiatives.view.targetScope.fundingSources')}</h4>
                                    <div className="target-tags">
                                        {values.fundingSources.map((source, index) => (
                                            <span key={index} className="target-tag funding-tag">{source}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* Progress & Results */}
                {(values.kpis?.length > 0 || values.expectedResults || values.progressReport) && (
                    <section id="progress-results" className="progress-results-section">
                        <h2 className="section-title">
                            <FontAwesomeIcon icon={faTrophy} />
                            {t('initiatives.view.sectionTitles.progressResults')}
                        </h2>

                        {values.kpis?.length > 0 && (
                            <div className="kpis-preview">
                                <h3>{t('initiatives.view.progressResults.kpis')}</h3>
                                <div className="kpis-grid">
                                    {values.kpis.map((kpi, index) => (
                                        <div key={index} className="kpi-preview-card">
                                            <h4>{kpi.name}</h4>
                                            <div className="kpi-target">{t('initiatives.view.progressResults.target')} {kpi.target}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {values.expectedResults && (
                            <div className="expected-results-preview">
                                <h3>{t('initiatives.view.progressResults.expectedResults')}</h3>
                                <div className="results-content slate-content" data-editor="slate">
                                    {(() => {
                                        if (!values.expectedResults) {
                                            return <p>{t('initiatives.view.placeholders.noContent')}</p>
                                        }

                                        if (typeof values.expectedResults === 'string') {
                                            if (values.expectedResults.includes('<') && values.expectedResults.includes('>')) {
                                                return <div dangerouslySetInnerHTML={{ __html: values.expectedResults }} />;
                                            }
                                            return <p>{values.expectedResults}</p>;
                                        }

                                        if (Array.isArray(values.expectedResults)) {
                                            return renderSlateContent(values.expectedResults);
                                        }

                                        if (typeof values.expectedResults === 'object') {
                                            try {
                                                return renderSlateContent(values.expectedResults);
                                            } catch (error) {
                                                console.warn('Failed to render expected results as Slate:', error);
                                                return <p>{JSON.stringify(values.expectedResults)}</p>;
                                            }
                                        }

                                        return <p>{String(values.expectedResults)}</p>;
                                    })()}
                                </div>
                            </div>
                        )}

                        {values.progressReport && (
                            <div className="progress-report-preview">
                                <h3>{t('initiatives.view.progressResults.progressReport')}</h3>
                                <div className="report-content slate-content" data-editor="slate">
                                    {(() => {
                                        if (!values.progressReport) {
                                            return <p>{t('initiatives.view.placeholders.noContent')}</p>
                                        }

                                        if (typeof values.progressReport === 'string') {
                                            if (values.progressReport.includes('<') && values.progressReport.includes('>')) {
                                                return <div dangerouslySetInnerHTML={{ __html: values.progressReport }} />;
                                            }
                                            return <p>{values.progressReport}</p>;
                                        }

                                        if (Array.isArray(values.progressReport)) {
                                            return renderSlateContent(values.progressReport);
                                        }

                                        if (typeof values.progressReport === 'object') {
                                            try {
                                                return renderSlateContent(values.progressReport);
                                            } catch (error) {
                                                console.warn('Failed to render progress report as Slate:', error);
                                                return <p>{JSON.stringify(values.progressReport)}</p>;
                                            }
                                        }

                                        return <p>{String(values.progressReport)}</p>;
                                    })()}
                                </div>
                            </div>
                        )}
                    </section>
                )}

                {/* Partners & Sponsors */}
                {(values.partners?.length > 0 || values.sponsors?.length > 0) && (
                    <section id="partners-sponsors" className="partners-sponsors-section">
                        <h2 className="section-title">
                            <FontAwesomeIcon icon={faHandshake} />
                            {t('initiatives.view.sectionTitles.partnersSponsors')}
                        </h2>

                        {values.partners?.length > 0 && (
                            <div className="partners-preview">
                                <h3>{t('initiatives.view.partnersSponsors.partners')}</h3>
                                <div className="partners-grid">
                                    {values.partners.filter(partner => partner.visible !== false).map((partner, index) => (
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

                        {values.sponsors?.length > 0 && (
                            <div className="sponsors-preview">
                                <h3>{t('initiatives.view.partnersSponsors.sponsors')}</h3>
                                <div className="sponsors-grid">
                                    {values.sponsors.filter(sponsor => sponsor.visible !== false).map((sponsor, index) => (
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

                {/* Organization Information */}
                {(values.responsible?.name || values.organization?.name || Object.values(values.socialMedia || {}).some(link => link)) && (
                    <section className="organization-contact-section">
                        {/* Responsible Person */}
                        {values.responsible?.name && (
                            <div className="responsible-preview">
                                <h3>{t('initiatives.view.organization.responsiblePerson')}</h3>
                                <div className="responsible-info">
                                    <h4>{values.responsible.name}</h4>
                                    {values.responsible.position && (
                                        <p className="responsible-position">{values.responsible.position}</p>
                                    )}
                                    <div className="responsible-contacts">
                                        {values.responsible.email && (
                                            <div className="contact-item">
                                                <FontAwesomeIcon icon={faEnvelope} className="contact-icon" />
                                                <a href={`mailto:${values.responsible.email}`}>
                                                    {values.responsible.email}
                                                </a>
                                            </div>
                                        )}
                                        {values.responsible.phone && (
                                            <div className="contact-item">
                                                <FontAwesomeIcon icon={faPhone} className="contact-icon" />
                                                <a href={`tel:${values.responsible.phone}`}>
                                                    {values.responsible.phone}
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Organization */}
                        {values.organization?.name && (
                            <div className="organization-preview">
                                <h3 className='organization-title-h3'>
                                    <FontAwesomeIcon icon={faBuilding} />
                                    {t('initiatives.view.organization.organization')}
                                </h3>
                                <div className="organization-info">
                                    <h4>{values.organization.name}</h4>
                                    {values.organization.website && (
                                        <a href={values.organization.website} target="_blank" rel="noopener noreferrer">
                                            <FontAwesomeIcon icon={faGlobe} /> {values.organization.website}
                                        </a>
                                    )}
                                    {values.organization.address && (
                                        <p>
                                            <FontAwesomeIcon icon={faMapMarkerAlt} /> {values.organization.address}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Social Media */}
                        {Object.values(values.socialMedia || {}).some(link => link) && (
                            <div className="social-media-preview">
                                <h3>{t('initiatives.view.organization.socialMedia')}</h3>
                                <div className="social-links">
                                    {values.socialMedia?.facebook && (
                                        <a href={values.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="social-link facebook">
                                            <FontAwesomeIcon icon={faFacebook} />
                                        </a>
                                    )}
                                    {values.socialMedia?.instagram && (
                                        <a href={values.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="social-link instagram">
                                            <FontAwesomeIcon icon={faInstagram} />
                                        </a>
                                    )}
                                    {values.socialMedia?.linkedin && (
                                        <a href={values.socialMedia.linkedin} target="_blank" rel="noopener noreferrer" className="social-link linkedin">
                                            <FontAwesomeIcon icon={faLinkedin} />
                                        </a>
                                    )}
                                    {values.socialMedia?.twitter && (
                                        <a href={values.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="social-link twitter">
                                            <FontAwesomeIcon icon={faTwitter} />
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}
                    </section>
                )}

                {/* Contact Section */}
                {(values.contact?.name || values.additionalContacts?.length > 0) && (
                    <section id="contact" className="contact-section">
                        <h2 className="section-title">{t('initiatives.view.sectionTitles.contact')}</h2>

                        {values.contact?.name && (
                            <div className="contact-card">
                                <div className="contact-image">
                                    {values.contact.image ? (
                                        <img src={values.contact.image} alt={values.contact.name} />
                                    ) : (
                                        <div className="contact-avatar">
                                            {values.contact.name?.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div className="contact-info">
                                    <h3 className="contact-name">{values.contact.name}</h3>
                                    {values.contact.position && (
                                        <p className="contact-position">{values.contact.position}</p>
                                    )}
                                    <div className="contact-details">
                                        {values.contact.email && (
                                            <div className="contact-item">
                                                <FontAwesomeIcon icon={faEnvelope} className="contact-icon" />
                                                <a href={`mailto:${values.contact.email}`}>
                                                    {values.contact.email}
                                                </a>
                                            </div>
                                        )}
                                        {values.contact.phone && (
                                            <div className="contact-item">
                                                <FontAwesomeIcon icon={faPhone} className="contact-icon" />
                                                <a href={`tel:${values.contact.phone}`}>
                                                    {values.contact.phone}
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {values.additionalContacts?.length > 0 && (
                            <div className="additional-contacts">
                                <h4>{t('initiatives.view.contact.additionalContacts')}</h4>
                                <div className="contacts-grid">
                                    {values.additionalContacts.map((contact, index) => (
                                        <div key={index} className="additional-contact">
                                            <div className="contact-name">{contact.name}</div>
                                            {contact.position && (
                                                <div className="contact-position">{contact.position}</div>
                                            )}
                                            {contact.email && (
                                                <a href={`mailto:${contact.email}`} className="contact-email">
                                                    {contact.email}
                                                </a>
                                            )}
                                            {contact.phone && (
                                                <a href={`tel:${contact.phone}`} className="contact-phone">
                                                    {contact.phone}
                                                </a>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>
                )}

                {/* Tags */}
                {values.tags?.length > 0 && (
                    <section className="tags-section">
                        <h2 className="section-title">
                            <FontAwesomeIcon icon={faTag} />
                            {t('initiatives.view.sectionTitles.tags')}
                        </h2>
                        <div className="tags-display">
                            {values.tags.map((tag, index) => (
                                <span key={index} className="tag-preview">{tag}</span>
                            ))}
                        </div>
                    </section>
                )}

                {/* FAQ */}
                {values.faq?.length > 0 && (
                    <section id="faq" className="faq-section">
                        <h2 className="section-title">
                            <FontAwesomeIcon icon={faQuestionCircle} />
                            {t('initiatives.view.sectionTitles.faq')}
                        </h2>
                        <div className="faq-list">
                            {values.faq.map((faqItem, index) => (
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
            </div>
        </div>
    );
};