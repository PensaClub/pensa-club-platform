// src/components/AdminFactCheck/AdminFactCheck.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './adminFactCheck.css';
import { useFactCheck } from '../contexts/FactCheckProvider';
import SEOHead from '../SEO/SEOHead';
import { AdminFactCheckStats } from './AdminFactCheckStats/AdminFactCheckStats';
import { AdminFactCheckSignals } from './AdminFactCheckSignals/AdminFactCheckSignals';
import { AdminFactCheckModules } from './AdminFactCheckModules/AdminFactCheckModules';

export const AdminFactCheck = () => {
    const { t } = useTranslation('factcheck');
    const location = useLocation();
    const { getAdminSignals, getAdminModules, updateSignal } = useFactCheck();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname]);

    const [activeTab, setActiveTab] = useState('signals');
    const [signals, setSignals] = useState([]);
    const [modules, setModules] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [pendingSignalData, setPendingSignalData] = useState(null);
    const [pendingEditModule, setPendingEditModule] = useState(null);

    // ===================================
    // FETCH DATA
    // ===================================

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [signalsRes, modulesRes] = await Promise.all([
                getAdminSignals({ limit: 100 }),
                getAdminModules({ limit: 100 }),
            ]);
            setSignals(signalsRes?.signals || []);
            setModules(modulesRes?.modules || []);
        } catch (error) {
            console.error('Error fetching admin fact-check data:', error);
        } finally {
            setIsLoading(false);
        }
    }, [getAdminSignals, getAdminModules]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // ===================================
    // CREATE RESPONSE FROM SIGNAL
    // ===================================

    const handleCreateResponse = (signal) => {
        setPendingSignalData(signal);
        setPendingEditModule(null);
        setActiveTab('modules');
    };

    const handleEditResponse = (module) => {
        setPendingEditModule(module);
        setPendingSignalData(null);
        setActiveTab('modules');
    };

    const handleSignalResponseCreated = async (signalId, moduleId) => {
        try {
            await updateSignal(signalId, {
                status: 'resolved',
                relatedModuleId: moduleId,
            });
            setPendingSignalData(null);
            fetchData();
        } catch (error) {
            console.error('Error linking signal to module:', error);
        }
    };

    // ===================================
    // RENDER
    // ===================================

    return (
        <div className="afc">
            <SEOHead
                title={`${t('admin.title')} | Pensa Club`}
                description="Admin panel for fact-check management"
                noindex={true}
            />
            {/* HERO */}
            <div className="afc-hero">
                <div className="afc-hero-content">
                    <h1>{t('admin.title')}</h1>
                    <p>FactCheck Admin Panel</p>
                </div>
            </div>

            {/* STATS */}
            <AdminFactCheckStats modules={modules} signals={signals} />

            {/* TABS */}
            <div className="afc-tabs">
                <button
                    className={`afc-tab ${activeTab === 'signals' ? 'afc-tab--active' : ''}`}
                    onClick={() => setActiveTab('signals')}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                    </svg>
                    {t('admin.tabSignals')}
                    {signals.length > 0 && (
                        <span className="afc-tab-badge">{signals.length}</span>
                    )}
                </button>
                <button
                    className={`afc-tab ${activeTab === 'modules' ? 'afc-tab--active' : ''}`}
                    onClick={() => setActiveTab('modules')}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <line x1="3" y1="9" x2="21" y2="9" />
                        <line x1="9" y1="21" x2="9" y2="9" />
                    </svg>
                    {t('admin.tabModules')}
                    {modules.length > 0 && (
                        <span className="afc-tab-badge">{modules.length}</span>
                    )}
                </button>
            </div>

            {/* TAB CONTENT */}
            <div className="afc-content">
                {isLoading ? (
                    <div className="afc-loading">
                        <div className="afc-spinner"></div>
                        <p>{t('filters.searchPlaceholder') || 'Loading...'}</p>
                    </div>
                ) : (
                    <>
                        {activeTab === 'signals' && (
                            <AdminFactCheckSignals
                                signals={signals}
                                modules={modules}
                                onRefresh={fetchData}
                                onCreateResponse={handleCreateResponse}
                                onEditResponse={handleEditResponse}
                            />
                        )}
                        {activeTab === 'modules' && (
                            <AdminFactCheckModules
                                modules={modules}
                                onRefresh={fetchData}
                                pendingSignalData={pendingSignalData}
                                pendingEditModule={pendingEditModule}
                                onPendingSignalHandled={() => setPendingSignalData(null)}
                                onPendingEditModuleHandled={() => setPendingEditModule(null)}
                                onSignalResponseCreated={handleSignalResponseCreated}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
