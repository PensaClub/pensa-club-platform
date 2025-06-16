import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './initiativePreview.css';
import '../../InitiativeView/initiativeView.css';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faArrowLeft, faCalendar, faUsers, faHandshake, 
    faTrophy, faTag, faQuestionCircle, faMapMarkerAlt,
    faEnvelope, faPhone, faGlobe, faUser
} from '@fortawesome/free-solid-svg-icons';
import { 
    faFacebook, faInstagram, faLinkedin, faTwitter 
} from '@fortawesome/free-brands-svg-icons';
import { getDescriptionParts,handleSmoothScroll,renderSlateContent } from '../../../../utils/slateRenderer';

// Import helpers

export const InitiativePreview = ({ values, onBackToEdit }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [showMap, setShowMap] = useState(false);

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
                    Назад към формата
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
                            <FontAwesomeIcon icon={faUser} size="4x" />
                            <p>Няма главно изображение</p>
                        </div>
                    )}
                </div>

                <div className="initiative-hero-content">
                    <div className="initiative-header">
                        {/* Logo Display */}
                        {values.logo && (
                            <div className="initiative-logo">
                                <img src={values.logo} alt="Initiative Logo" />
                            </div>
                        )}

                        <h1 className="initiative-title">
                            {values.title || 'Без заглавие'}
                        </h1>

                        <div className="initiative-description">
                            <p className="first-sentence">{firstSentence}</p>

                            {/* Navigation Links */}
                            <div className="initiative-nav">
                                {values.sections?.length > 0 && (
                                    <a href="#sections" onClick={handleSmoothScroll} className="nav-link">
                                        <span className="nav-icon">📖</span>
                                        Секции
                                    </a>
                                )}
                                {(values.startDate || values.milestones?.length > 0) && (
                                    <a href="#timeline" onClick={handleSmoothScroll} className="nav-link">
                                        <span className="nav-icon">⏰</span>
                                        Времева линия
                                    </a>
                                )}
                                {(values.partners?.length > 0 || values.sponsors?.length > 0) && (
                                    <a href="#partners-sponsors" onClick={handleSmoothScroll} className="nav-link">
                                        <span className="nav-icon">🤝</span>
                                        Партньори и спонсори
                                    </a>
                                )}
                                {values.kpis?.length > 0 && (
                                    <a href="#progress-results" onClick={handleSmoothScroll} className="nav-link">
                                        <span className="nav-icon">📊</span>
                                        Прогрес и резултати
                                    </a>
                                )}
                                {(values.responsible?.name || values.contact?.name) && (
                                    <a href="#contact" onClick={handleSmoothScroll} className="nav-link">
                                        <span className="nav-icon">📞</span>
                                        Контакт
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
                {/* Detailed Description */}
                {values.detailedDescription && (
                    <section className="detailed-description-section">
                        <h2 className="section-title">Подробно описание</h2>
                        <div className="detailed-content slate-content" data-editor="slate">
                            {renderSlateContent(values.detailedDescription)}
                        </div>
                    </section>
                )}

                {/* Timeline Section */}
                {(values.startDate || values.endDate || values.milestones?.length > 0) && (
                    <section id="timeline" className="timeline-section">
                        <h2 className="section-title">
                            <FontAwesomeIcon icon={faCalendar} />
                            Времева линия
                        </h2>

                        <div className="timeline-content">
                            {(values.startDate || values.endDate) && (
                                <div className="timeline-dates">
                                    {values.startDate && (
                                        <div className="timeline-date">
                                            <strong>Начало:</strong> {new Date(values.startDate).toLocaleDateString('bg-BG')}
                                        </div>
                                    )}
                                    {values.endDate && (
                                        <div className="timeline-date">
                                            <strong>Край:</strong> {new Date(values.endDate).toLocaleDateString('bg-BG')}
                                        </div>
                                    )}
                                </div>
                            )}

                            {values.milestones?.length > 0 && (
                                <div className="milestones-preview">
                                    <h3>Ключови етапи</h3>
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
                {(values.targetAge?.length > 0 || values.targetAudience?.length > 0 || values.expectedBudget) && (
                    <section className="target-scope-section">
                        <h2 className="section-title">
                            <FontAwesomeIcon icon={faUsers} />
                            Целева група и обхват
                        </h2>

                        <div className="target-scope-content">
                            {values.targetAge?.length > 0 && (
                                <div className="target-item">
                                    <h4>Целева възраст:</h4>
                                    <div className="target-tags">
                                        {values.targetAge.map((age, index) => (
                                            <span key={index} className="target-tag age-tag">{age}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {values.targetAudience?.length > 0 && (
                                <div className="target-item">
                                    <h4>Целева аудитория:</h4>
                                    <div className="target-tags">
                                        {values.targetAudience.map((audience, index) => (
                                            <span key={index} className="target-tag audience-tag">{audience}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {values.expectedBudget && (
                                <div className="target-item">
                                    <h4>Очакван бюджет:</h4>
                                    <div className="budget-display">
                                        {parseInt(values.expectedBudget).toLocaleString()} {values.currency}
                                    </div>
                                </div>
                            )}

                            {values.fundingSources?.length > 0 && (
                                <div className="target-item">
                                    <h4>Източници на финансиране:</h4>
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

                {/* Sections */}
                {values.sections?.length > 0 && (
                    <section id="sections" className="initiative-sections">
                        <h2 className="section-title">Секции на инициативата</h2>

                        <div className="sections-grid">
                            {values.sections.map((section, index) => (
                                <div key={index} className="content-section">
                                    <div className="section-content">
                                        <h3 className="section-heading">{section.title}</h3>
                                        <div className="section-text slate-content" data-editor="slate">
                                            {renderSlateContent(section.content)}
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

                {/* Partners & Sponsors */}
                {(values.partners?.length > 0 || values.sponsors?.length > 0) && (
                    <section id="partners-sponsors" className="partners-sponsors-section">
                        <h2 className="section-title">
                            <FontAwesomeIcon icon={faHandshake} />
                            Партньори и спонсори
                        </h2>

                        {values.partners?.length > 0 && (
                            <div className="partners-preview">
                                <h3>Партньори</h3>
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
                                                        Посети сайта
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
                                <h3>Спонсори</h3>
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
                                                        Посети сайта
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

                {/* Progress & Results */}
                {(values.kpis?.length > 0 || values.expectedResults || values.progressReport) && (
                    <section id="progress-results" className="progress-results-section">
                        <h2 className="section-title">
                            <FontAwesomeIcon icon={faTrophy} />
                            Прогрес и резултати
                        </h2>

                        {values.kpis?.length > 0 && (
                            <div className="kpis-preview">
                                <h3>Ключови показатели (KPIs)</h3>
                                <div className="kpis-grid">
                                    {values.kpis.map((kpi, index) => (
                                        <div key={index} className="kpi-preview-card">
                                            <h4>{kpi.name}</h4>
                                            <div className="kpi-target">Цел: {kpi.target}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {values.expectedResults && (
                            <div className="expected-results-preview">
                                <h3>Очаквани резултати</h3>
                                <div className="results-content slate-content" data-editor="slate">
                                    {renderSlateContent(values.expectedResults)}
                                </div>
                            </div>
                        )}

                        {values.progressReport && (
                            <div className="progress-report-preview">
                                <h3>Отчет за напредъка</h3>
                                <div className="report-content slate-content" data-editor="slate">
                                    {renderSlateContent(values.progressReport)}
                                </div>
                            </div>
                        )}
                    </section>
                )}

                {/* Gallery */}
                {values.gallery?.length > 0 && (
                    <section className="gallery-section">
                        <h2 className="section-title">Галерия</h2>
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
                {values.downloadMaterials?.length > 0 && (
                    <section className="download-materials">
                        <h2 className="section-title">Материали за изтегляне</h2>
                        <div className="materials-grid">
                            {values.downloadMaterials.map((material, index) => (
                                <div key={index} className="material-card">
                                    <div className="material-preview">
                                        {material.image?.src ? (
                                            <img src={material.image.src} alt={material.image.alt} />
                                        ) : (
                                            <div className="material-icon">
                                                {material.fileType === 'pdf' ? '📄' : '📁'}
                                            </div>
                                        )}
                                    </div>
                                    <div className="material-info">
                                        <h3 className="material-title">{material.title}</h3>
                                        {material.description && (
                                            <p className="material-description">{material.description}</p>
                                        )}
                                        <div className="material-meta">
                                            <span className="file-type">{material.fileType?.toUpperCase()}</span>
                                            <span className="file-size">{material.fileSize}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* FAQ */}
                {values.faq?.length > 0 && (
                    <section className="faq-section">
                        <h2 className="section-title">
                            <FontAwesomeIcon icon={faQuestionCircle} />
                            Често задавани въпроси
                        </h2>
                        <div className="faq-list">
                            {values.faq.map((faqItem, index) => (
                                <div key={index} className="faq-item-preview">
                                    <h4 className="faq-question">❓ {faqItem.question}</h4>
                                    <p className="faq-answer">{faqItem.answer}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Tags */}
                {values.tags?.length > 0 && (
                    <section className="tags-section">
                        <h2 className="section-title">
                            <FontAwesomeIcon icon={faTag} />
                            Тагове
                        </h2>
                        <div className="tags-display">
                            {values.tags.map((tag, index) => (
                                <span key={index} className="tag-preview">{tag}</span>
                            ))}
                        </div>
                    </section>
                )}

                {/* Contact Section */}
                {(values.responsible?.name || values.contact?.name || values.organization?.name) && (
                    <section id="contact" className="contact-section">
                        <h2 className="section-title">Контакт</h2>

                        {/* Main Contact */}
                        {(values.responsible?.name || values.contact?.name) && (
                            <div className="contact-card">
                                <div className="contact-image">
                                    {values.contact?.image ? (
                                        <img src={values.contact.image} alt="Contact" />
                                    ) : (
                                        <div className="contact-avatar">
                                            {(values.responsible?.name || values.contact?.name)?.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div className="contact-info">
                                    <h3 className="contact-name">
                                        {values.responsible?.name || values.contact?.name}
                                    </h3>
                                    <p className="contact-position">
                                        {values.responsible?.position || values.contact?.position}
                                    </p>
                                    <div className="contact-details">
                                        {(values.responsible?.email || values.contact?.email) && (
                                            <div className="contact-item">
                                                <FontAwesomeIcon icon={faEnvelope} className="contact-icon" />
                                                <a href={`mailto:${values.responsible?.email || values.contact?.email}`}>
                                                    {values.responsible?.email || values.contact?.email}
                                                </a>
                                            </div>
                                        )}
                                        {(values.responsible?.phone || values.contact?.phone) && (
                                            <div className="contact-item">
                                                <FontAwesomeIcon icon={faPhone} className="contact-icon" />
                                                <a href={`tel:${values.responsible?.phone || values.contact?.phone}`}>
                                                    {values.responsible?.phone || values.contact?.phone}
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
                                <h3>Организация</h3>
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
                                <h3>Социални мрежи</h3>
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

                        {/* Additional Contacts */}
                        {values.additionalContacts?.length > 0 && (
                            <div className="additional-contacts">
                                <h4>Допълнителни контакти</h4>
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
            </div>
        </div>
    );
};