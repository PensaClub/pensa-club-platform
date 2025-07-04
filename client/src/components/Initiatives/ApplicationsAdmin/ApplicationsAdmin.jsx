import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './applicationsAdmin.css';
import { useInitiativeContext } from '../../contexts/InitiativeProvider';
import { ApplicationsList } from './ApplicationsList/ApplicationsList';
import { ApplicationsFilters } from './ApplicationsFilters/ApplicationsFilters';
import { ApplicationsStatistics } from './ApplicationsStatistics/ApplicationsStatistics';
import { ApplicationsExport } from './ApplicationsExport/ApplicationsExport';
import { ApplicationsCommunication } from './ApplicationsCommunication/ApplicationsCommunication';

export const ApplicationsAdmin = ({ setApplicationsStats }) => {
    const { t } = useTranslation();
    const [applications, setApplications] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('list');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // Нов state
    const [stats, setStats] = useState({
        total: 0,
        thisWeek: 0,
        thisMonth: 0,
        projects: 0
    });
    const [filteredApplications, setFilteredApplications] = useState([]);
    const { getAllApplications } = useInitiativeContext();

    useEffect(() => {
        loadApplications();
    }, []);

    const loadApplications = async () => {
        setIsLoading(true);
        try {
            const data = await getAllApplications();
            setApplications(data);
            calculateStats(data);
        } catch (error) {
            console.error('Error loading applications:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const calculateStats = (data) => {
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const thisWeek = data.filter(app =>
            new Date(app.appliedAt) >= weekAgo
        ).length;

        const thisMonth = data.filter(app =>
            new Date(app.appliedAt) >= monthAgo
        ).length;

        const uniqueProjects = [...new Set(data.map(app => app.projectId))].length;

        const statsData = {
            total: data.length,
            thisWeek,
            thisMonth,
            projects: uniqueProjects
        };

        setStats(statsData);

        if (setApplicationsStats) {
            setApplicationsStats({
                total: data.length,
                pending: 0,
                approved: 0,
                rejected: 0
            });
        }
        
    };

    const tabs = [
        {
            id: 'list',
            label: t('applications.tabs.list'),
            icon: '📋',
            count: stats.total
        },
        {
            id: 'statistics',
            label: t('applications.tabs.statistics'),
            icon: '📊',
            count: null
        },
        {
            id: 'export',
            label: t('applications.tabs.export'),
            icon: '📤',
            count: null
        },
         {
        id: 'communication',
        label: t('applications.tabs.communication'),
        icon: '✉️',
        count: null
    }
    ];

    const refreshData = () => {
        loadApplications();
    };

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        setMobileMenuOpen(false); // Затваряме мобилното меню
    };

    const activeTabData = tabs.find(tab => tab.id === activeTab);

    return (
        <div className="applications-admin">
            {/* Header Section */}
            <div className="applications-header">
                <div className="header-content">
                    <div className="header-main">
                        <h1 className="applications-title">
                            <span className="title-icon">🎯</span>
                            {t('applications.title')}
                        </h1>
                        <p className="applications-subtitle">
                            {t('applications.subtitle', { count: stats.total })}
                        </p>
                    </div>

                    <div className="header-actions">
                        <button
                            onClick={refreshData}
                            className="refresh-btn"
                            disabled={isLoading}
                        >
                            <span className="btn-icon">🔄</span>
                            {t('applications.actions.refresh')}
                        </button>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="quick-stats">
                    <div className="stat-card primary">
                        <div className="stat-icon-apply
                        ">👥</div>
                        <div className="stat-content">
                            <div className="stat-number">{stats.total}</div>
                            <div className="stat-label">{t('applications.stats.total')}</div>
                        </div>
                    </div>

                    <div className="stat-card success">
                        <div className="stat-icon-apply
                        ">📅</div>
                        <div className="stat-content">
                            <div className="stat-number">{stats.thisWeek}</div>
                            <div className="stat-label">{t('applications.stats.thisWeek')}</div>
                        </div>
                    </div>

                    <div className="stat-card warning">
                        <div className="stat-icon-apply
                        ">📆</div>
                        <div className="stat-content">
                            <div className="stat-number">{stats.thisMonth}</div>
                            <div className="stat-label">{t('applications.stats.thisMonth')}</div>
                        </div>
                    </div>

                    <div className="stat-card info">
                        <div className="stat-icon-apply
                        ">🚀</div>
                        <div className="stat-content">
                            <div className="stat-number">{stats.projects}</div>
                            <div className="stat-label">{t('applications.stats.projects')}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab Navigation - Desktop */}
            <div className="applications-tabs desktop-tabs">
                <div className="tabs-container">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => handleTabChange(tab.id)}
                        >
                            <span className="tab-icon">{tab.icon}</span>
                            <span className="tab-label">{tab.label}</span>
                            {tab.count !== null && (
                                <span className="tab-count">{tab.count}</span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Navigation - Mobile */}
            <div className="applications-tabs mobile-tabs">
                <div className="mobile-tab-container">
                    <button
                        className="mobile-tab-trigger"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        <span className="mobile-tab-icon">{activeTabData?.icon}</span>
                        <span className="mobile-tab-label">{activeTabData?.label}</span>
                        {activeTabData?.count !== null && (
                            <span className="mobile-tab-count">{activeTabData.count}</span>
                        )}
                        <span className={`mobile-dropdown-arrow ${mobileMenuOpen ? 'open' : ''}`}>
                            <svg width="16" height="16" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
                                <path d="M765.7 486.8L314.9 134.7A7.97 7.97 0 0 0 302 141v77.3c0 4.9 2.3 9.6 6.1 12.6l360 281.1-360 281.1c-3.9 3-6.1 7.7-6.1 12.6V883c0 6.7 7.7 10.4 12.9 6.3l450.8-352.1a31.96 31.96 0 0 0 0-50.4z" />
                            </svg>
                        </span>
                    </button>

                    {mobileMenuOpen && (
                        <div className="mobile-tab-dropdown">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    className={`mobile-tab-option ${activeTab === tab.id ? 'active' : ''}`}
                                    onClick={() => handleTabChange(tab.id)}
                                >
                                    <span className="tab-icon">{tab.icon}</span>
                                    <span className="tab-label">{tab.label}</span>
                                    {tab.count !== null && (
                                        <span className="tab-count">{tab.count}</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Content Area */}
            <div className="applications-content">
                {isLoading ? (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p className="loading-text">{t('applications.loading')}</p>
                    </div>
                ) : (
                    <div className="content-wrapper">
                        {activeTab === 'list' && (
                            <>
                                <ApplicationsFilters
                                    applications={applications}
                                    onFilteredData={setFilteredApplications}
                                    onFiltersChange={(filters) => {}}
                                />
                                <ApplicationsList
                                   applications={filteredApplications} 
                                    onRefresh={refreshData}
                                    isLoading={isLoading}
                                />
                            </>
                        )}

                        {activeTab === 'statistics' && (
                            <ApplicationsStatistics applications={applications} />
                        )}

                        {activeTab === 'export' && (
                            <ApplicationsExport
                                applications={applications}
                                filteredApplications={filteredApplications}
                                onRefresh={refreshData}
                            />
                        )}
                        {activeTab === 'communication' && (
                            <ApplicationsCommunication
                                applications={applications}
                                filteredApplications={filteredApplications}
                                onRefresh={refreshData}
                            />
                        )}
                    </div>
                )}
            </div>

        </div>
    );
};