import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './mentorReAction.css';
import { useReAction } from '../contexts/ReActionProvider';
import SEOHead from '../SEO/SEOHead';
import { MentorReActionCalendar } from './MentorReActionCalendar/MentorReActionCalendar';
import { MentorReActionAssignments } from './MentorReActionAssignments/MentorReActionAssignments';
import { MentorReActionHistory } from './MentorReActionHistory/MentorReActionHistory';
import { MentorReActionResources } from './MentorReActionResources/MentorReActionResources';

const MentorReAction = () => {
    const { t } = useTranslation('reaction');
    const location = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname]);

    const [activeTab, setActiveTab] = useState('calendar');

    const tabs = [
        {
            key: 'calendar',
            label: t('mentor.tabs.calendar', 'My Schedule'),
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
            ),
        },
        {
            key: 'assignments',
            label: t('mentor.tabs.assignments', 'Assigned Visits'),
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                    <path d="M9 14l2 2 4-4" />
                </svg>
            ),
        },
        {
            key: 'history',
            label: t('mentor.tabs.history', 'History'),
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                </svg>
            ),
        },
        {
            key: 'resources',
            label: t('mentor.tabs.resources', 'Resources'),
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5C4 18.1193 5.11929 17 6.5 17H20" />
                    <path d="M4 19.5C4 20.8807 5.11929 22 6.5 22H20V2H6.5C5.11929 2 4 3.11929 4 4.5V19.5Z" />
                    <line x1="8" y1="6" x2="16" y2="6" />
                    <line x1="8" y1="10" x2="14" y2="10" />
                </svg>
            ),
        },
    ];

    return (
        <div className="mra">
            <SEOHead
                title={`${t('mentor.title', 'ReAction Program - Mentor')} | Pensa Club`}
                description="Mentor dashboard for ReAction Program"
                noindex={true}
            />

            {/* HERO */}
            <div className="mra-hero">
                <Link to="/profile" className="mra-back-link">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                    {t('mentor.backToProfile')}
                </Link>
                <div className="mra-hero-content">
                    <div className="mra-hero-badge">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                        {t('mentor.badge', 'Mentor Panel')}
                    </div>
                    <h1>{t('mentor.heroTitle', 'My Dashboard')}</h1>
                    <p>{t('mentor.heroSubtitle', 'Manage your schedule, assigned visits and feedback.')}</p>
                </div>
            </div>

            {/* TABS */}
            <div className="mra-tabs">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        className={`mra-tab ${activeTab === tab.key ? 'mra-tab--active' : ''}`}
                        onClick={() => setActiveTab(tab.key)}
                    >
                        {tab.icon}
                        <span className="mra-tab-label">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* TAB CONTENT */}
            <div className="mra-content">
                {activeTab === 'calendar' && <MentorReActionCalendar />}
                {activeTab === 'assignments' && <MentorReActionAssignments />}
                {activeTab === 'history' && <MentorReActionHistory />}
                {activeTab === 'resources' && <MentorReActionResources />}
            </div>
        </div>
    );
};

export default MentorReAction;
