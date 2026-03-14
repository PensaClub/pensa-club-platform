// src/components/AdminReAction/AdminReAction.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './adminReAction.css';
import { useReAction } from '../contexts/ReActionProvider';
import { useTheme } from '../contexts/ThemeContext';
import SEOHead from '../SEO/SEOHead';
import { AdminReActionCalendar } from './AdminReActionCalendar/AdminReActionCalendar';
import { AdminReActionRequests } from './AdminReActionRequests/AdminReActionRequests';
import { AdminReActionStats } from './AdminReActionStats/AdminReActionStats';
import { AdminReActionTestimonials } from './AdminReActionTestimonials/AdminReActionTestimonials';
import { AdminReActionGallery } from './AdminReActionGallery/AdminReActionGallery';
import { AdminReActionRequestModal } from './AdminReActionRequestModal/AdminReActionRequestModal';
import { AdminReActionEmailModal } from './AdminReActionEmailModal/AdminReActionEmailModal';

const AdminReAction = () => {
    const { t } = useTranslation('reaction');
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const { getAdminRequests, getAdminStats, getAdminRequestById, updateRequest } = useReAction();
    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname]);

    // Default to light theme, shared across all ReAction pages (ra- prefix)
    useEffect(() => {
        const isRefresh = localStorage.getItem('ra-page-active') === 'true';

        if (!isRefresh) {
            localStorage.setItem('ra-prev-theme', theme);
            const savedTheme = localStorage.getItem('ra-theme') || 'light';
            localStorage.setItem('ra-theme', savedTheme);
            if (theme !== savedTheme) {
                toggleTheme();
            }
        }
        localStorage.setItem('ra-page-active', 'true');

        return () => {
            localStorage.removeItem('ra-page-active');
            const prevTheme = localStorage.getItem('ra-prev-theme');
            if (prevTheme) {
                localStorage.removeItem('ra-prev-theme');
                const currentTheme = document.documentElement.getAttribute('data-theme');
                if (currentTheme !== prevTheme) {
                    toggleTheme();
                }
            }
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (localStorage.getItem('ra-page-active') === 'true') {
            localStorage.setItem('ra-theme', theme);
        }
    }, [theme]);

    const [activeTab, setActiveTab] = useState('calendar');
    const [stats, setStats] = useState(null);
    const [requestsCount, setRequestsCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    // Deep-link to specific request from notification
    const [deepLinkRequest, setDeepLinkRequest] = useState(null);
    const [emailModalRequest, setEmailModalRequest] = useState(null);

    useEffect(() => {
        const requestId = searchParams.get('requestId');
        if (requestId) {
            searchParams.delete('requestId');
            setSearchParams(searchParams, { replace: true });
            (async () => {
                try {
                    const res = await getAdminRequestById(requestId);
                    if (res?.request) {
                        setDeepLinkRequest(res.request);
                    }
                } catch (error) {
                    console.error('Error fetching request from notification:', error);
                }
            })();
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // ===================================
    // FETCH DATA
    // ===================================

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [statsRes, requestsRes] = await Promise.all([
                getAdminStats(),
                getAdminRequests({ limit: 1 }),
            ]);
            setStats(statsRes?.stats || null);
            setRequestsCount(requestsRes?.pagination?.total || 0);
        } catch (error) {
            console.error('Error fetching admin ReAction data:', error);
        } finally {
            setIsLoading(false);
        }
    }, [getAdminStats, getAdminRequests]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // ===================================
    // RENDER
    // ===================================

    return (
        <div className="ara">
            <SEOHead
                title={`${t('admin.title')} | Pensa Club`}
                description="Admin panel for ReAction program management"
                noindex={true}
            />
            {/* HERO */}
            <div className="ara-hero">
                <Link to="/profile" className="ara-back-link">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                    {t('admin.backToProfile')}
                </Link>
                <div className="ara-hero-content">
                    <h1>{t('admin.title')}</h1>
                    <p>{t('admin.subtitle')}</p>
                </div>
            </div>

            {/* TABS */}
            <div className="ara-tabs">
                <button
                    className={`ara-tab ${activeTab === 'calendar' ? 'ara-tab--active' : ''}`}
                    onClick={() => setActiveTab('calendar')}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    {t('admin.tabCalendar')}
                </button>
                <button
                    className={`ara-tab ${activeTab === 'requests' ? 'ara-tab--active' : ''}`}
                    onClick={() => setActiveTab('requests')}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="8" y1="6" x2="21" y2="6" />
                        <line x1="8" y1="12" x2="21" y2="12" />
                        <line x1="8" y1="18" x2="21" y2="18" />
                        <line x1="3" y1="6" x2="3.01" y2="6" />
                        <line x1="3" y1="12" x2="3.01" y2="12" />
                        <line x1="3" y1="18" x2="3.01" y2="18" />
                    </svg>
                    {t('admin.tabRequests')}
                    {requestsCount > 0 && (
                        <span className="ara-tab-badge">{requestsCount}</span>
                    )}
                </button>
                <button
                    className={`ara-tab ${activeTab === 'stats' ? 'ara-tab--active' : ''}`}
                    onClick={() => setActiveTab('stats')}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="20" x2="18" y2="10" />
                        <line x1="12" y1="20" x2="12" y2="4" />
                        <line x1="6" y1="20" x2="6" y2="14" />
                    </svg>
                    {t('admin.tabStats')}
                </button>
                <button
                    className={`ara-tab ${activeTab === 'testimonials' ? 'ara-tab--active' : ''}`}
                    onClick={() => setActiveTab('testimonials')}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    {t('admin.tabTestimonials')}
                </button>
                <button
                    className={`ara-tab ${activeTab === 'gallery' ? 'ara-tab--active' : ''}`}
                    onClick={() => setActiveTab('gallery')}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                    </svg>
                    {t('admin.tabGallery')}
                </button>
            </div>

            {/* TAB CONTENT */}
            <div className="ara-content">
                {isLoading ? (
                    <div className="ara-loading">
                        <div className="ara-spinner"></div>
                        <p>{t('admin.loading')}</p>
                    </div>
                ) : (
                    <>
                        {activeTab === 'calendar' && (
                            <AdminReActionCalendar onRefresh={fetchData} />
                        )}
                        {activeTab === 'requests' && (
                            <AdminReActionRequests onRefresh={fetchData} />
                        )}
                        {activeTab === 'stats' && (
                            <AdminReActionStats stats={stats} />
                        )}
                        {activeTab === 'testimonials' && (
                            <AdminReActionTestimonials onRefresh={fetchData} />
                        )}
                        {activeTab === 'gallery' && (
                            <AdminReActionGallery />
                        )}
                    </>
                )}
            </div>

            {/* DEEP-LINK REQUEST MODAL (from notification) */}
            {deepLinkRequest && (
                <AdminReActionRequestModal
                    request={deepLinkRequest}
                    onClose={() => setDeepLinkRequest(null)}
                    onSave={async (id, data) => {
                        try {
                            await updateRequest(id, data);
                            setDeepLinkRequest(null);
                            fetchData();
                        } catch (error) {
                            console.error('Error saving request:', error);
                        }
                    }}
                    onSendEmail={(request) => setEmailModalRequest(request)}
                    onRefresh={fetchData}
                />
            )}

            {/* EMAIL MODAL */}
            {emailModalRequest && (
                <AdminReActionEmailModal
                    request={emailModalRequest}
                    onClose={() => setEmailModalRequest(null)}
                />
            )}
        </div>
    );
};

export default AdminReAction;
