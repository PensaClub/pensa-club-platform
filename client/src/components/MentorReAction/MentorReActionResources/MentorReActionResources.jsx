import React from 'react';
import { useTranslation } from 'react-i18next';
import { LocalizedLink as Link } from '../../LocalizedLink/LocalizedLink';
import './mentorReActionResources.css';

export const MentorReActionResources = () => {
    const { t } = useTranslation('reaction');

    const topicResources = [
        {
            title: t('mentor.resources.fakeNewsTitle', 'Recognizing false information'),
            description: t('mentor.resources.fakeNewsDesc', 'Materials and modules for identifying fake news and misinformation.'),
            link: '/fact-check',
            linkText: t('mentor.resources.fakeNewsLink', 'Go to FactCheck'),
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 12l2 2 4-4" />
                    <path d="M12 3l8 4v5c0 5.55-3.84 10.74-8 12-4.16-1.26-8-6.45-8-12V7l8-4z" />
                </svg>
            ),
        },
        {
            title: t('mentor.resources.voterRightsTitle', 'Voter rights'),
            description: t('mentor.resources.voterRightsDesc', 'Information about voter rights, registration, and participation in elections.'),
            link: null,
            linkText: t('mentor.resources.comingSoon', 'Coming soon'),
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                    <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
            ),
        },
        {
            title: t('mentor.resources.electionProcessTitle', 'How the election process works'),
            description: t('mentor.resources.electionProcessDesc', 'A guide to understanding the election process, from registration to vote counting.'),
            link: null,
            linkText: t('mentor.resources.comingSoon', 'Coming soon'),
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 00-3-3.87" />
                    <path d="M16 3.13a4 4 0 010 7.75" />
                </svg>
            ),
        },
    ];

    return (
        <div className="mrar">
            {/* Section 1: Topic Materials */}
            <section className="mrar-section">
                <h2 className="mrar-section-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 19.5C4 18.1193 5.11929 17 6.5 17H20" />
                        <path d="M4 19.5C4 20.8807 5.11929 22 6.5 22H20V2H6.5C5.11929 2 4 3.11929 4 4.5V19.5Z" />
                    </svg>
                    {t('mentor.resources.topicMaterials', 'Materials by topic')}
                </h2>
                <div className="mrar-cards">
                    {topicResources.map((resource, index) => (
                        <div key={index} className="mrar-card">
                            <div className="mrar-card-icon">{resource.icon}</div>
                            <h3 className="mrar-card-title">{resource.title}</h3>
                            <p className="mrar-card-desc">{resource.description}</p>
                            {resource.link ? (
                                <Link to={resource.link} className="mrar-card-link">
                                    {resource.linkText}
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="5" y1="12" x2="19" y2="12" />
                                        <polyline points="12 5 19 12 12 19" />
                                    </svg>
                                </Link>
                            ) : (
                                <span className="mrar-card-coming-soon">{resource.linkText}</span>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* Section 2: Mentor Guide */}
            <section className="mrar-section">
                <h2 className="mrar-section-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 16v-4" />
                        <path d="M12 8h.01" />
                    </svg>
                    {t('mentor.resources.guideTitle', 'Mentor guide')}
                </h2>
                <div className="mrar-guide">
                    <div className="mrar-guide-item">
                        <h4>{t('mentor.resources.guidePrepTitle', 'Preparation')}</h4>
                        <p>{t('mentor.resources.guidePrepText', 'Review the topic materials before each visit. Prepare simple, clear examples that resonate with the audience. Bring printed handouts when possible.')}</p>
                    </div>
                    <div className="mrar-guide-item">
                        <h4>{t('mentor.resources.guideConductTitle', 'During the visit')}</h4>
                        <p>{t('mentor.resources.guideConductText', 'Start with introductions and set a friendly tone. Encourage questions and discussions. Use real-world examples. Keep the session interactive — avoid long lectures.')}</p>
                    </div>
                    <div className="mrar-guide-item">
                        <h4>{t('mentor.resources.guideAfterTitle', 'After the visit')}</h4>
                        <p>{t('mentor.resources.guideAfterText', 'Submit your feedback through the History tab. Note any challenges or special requests for the team. Share any observations that could improve future visits.')}</p>
                    </div>
                </div>
            </section>

            {/* Section 3: Contact */}
            <section className="mrar-section">
                <h2 className="mrar-section-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                    </svg>
                    {t('mentor.resources.contactTitle', 'Contact the team')}
                </h2>
                <div className="mrar-contact-card">
                    <p className="mrar-contact-desc">
                        {t('mentor.resources.contactDesc', 'For questions, urgent issues, or suggestions, reach out to the PENSA team.')}
                    </p>
                    <div className="mrar-contact-info">
                        <a href="mailto:info@pensa.club" className="mrar-contact-link">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                <polyline points="22,6 12,13 2,6" />
                            </svg>
                            info@pensa.club
                        </a>
                        <a href="tel:+359888123456" className="mrar-contact-link">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                            </svg>
                            {t('mentor.resources.contactPhone', '+359 888 123 456')}
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
};
