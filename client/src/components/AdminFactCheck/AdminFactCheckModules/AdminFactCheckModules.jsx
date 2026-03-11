// src/components/AdminFactCheck/AdminFactCheckModules/AdminFactCheckModules.jsx

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './adminFactCheckModules.css';
import { useFactCheck } from '../../contexts/FactCheckProvider';
import { AdminFactCheckModuleModal } from '../AdminFactCheckModuleModal/AdminFactCheckModuleModal';

export const AdminFactCheckModules = ({ modules, onRefresh, pendingSignalData, pendingEditModule, onPendingSignalHandled, onPendingEditModuleHandled, onSignalResponseCreated }) => {
    const { t } = useTranslation('factcheck');
    const { createModule, updateModule, deleteModule, publishModule, hideModule } = useFactCheck();

    const [activeFilter, setActiveFilter] = useState('all');
    const [selectedModule, setSelectedModule] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [isCreateMode, setIsCreateMode] = useState(false);
    const [createInitialData, setCreateInitialData] = useState(null);
    const [linkedSignalData, setLinkedSignalData] = useState(null);

    // Auto-open modal when signal data comes in
    useEffect(() => {
        if (pendingSignalData) {
            setLinkedSignalData(pendingSignalData);
            setSelectedModule(null);
            setIsCreateMode(true);
            setCreateInitialData({ claimText: pendingSignalData.claimText });
            setModalOpen(true);
            onPendingSignalHandled();
        }
    }, [pendingSignalData, onPendingSignalHandled]);

    // Auto-open modal when edit module comes in
    useEffect(() => {
        if (pendingEditModule) {
            setSelectedModule(pendingEditModule);
            setIsCreateMode(false);
            setCreateInitialData(null);
            setModalOpen(true);
            onPendingEditModuleHandled();
        }
    }, [pendingEditModule, onPendingEditModuleHandled]);

    // ===================================
    // STATUS FILTERS
    // ===================================

    const filterOptions = [
        { key: 'all', label: t('admin.modules.filterAll') },
        { key: 'draft', label: t('admin.modules.filterDraft') },
        { key: 'published', label: t('admin.modules.filterPublished') },
        { key: 'hidden', label: t('admin.modules.filterHidden') },
    ];

    // ===================================
    // FILTERED MODULES
    // ===================================

    const filteredModules = useMemo(() => {
        if (activeFilter === 'all') return modules;
        return modules.filter((m) => m.status === activeFilter);
    }, [modules, activeFilter]);

    // ===================================
    // COLOR HELPERS
    // ===================================

    const getStatusColor = (status) => {
        switch (status) {
            case 'draft': return '#6b7280';
            case 'published': return '#16a34a';
            case 'hidden': return '#ea580c';
            default: return '#6b7280';
        }
    };

    const getVerdictColor = (verdict) => {
        switch (verdict) {
            case 'true': return '#2563eb';
            case 'false': return '#dc2626';
            case 'misleading': return '#ea580c';
            case 'partially_true': return '#16a34a';
            case 'unconfirmed': return '#eab308';
            default: return '#6b7280';
        }
    };

    // ===================================
    // FORMAT DATE
    // ===================================

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('bg-BG', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    // ===================================
    // TRUNCATE
    // ===================================

    const truncate = (text, maxLength = 70) => {
        if (!text) return '-';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    // ===================================
    // HANDLERS
    // ===================================

    const handleCreateClick = () => {
        setSelectedModule(null);
        setIsCreateMode(true);
        setCreateInitialData(null);
        setModalOpen(true);
    };

    const handleModuleClick = (module) => {
        setSelectedModule(module);
        setIsCreateMode(false);
        setCreateInitialData(null);
        setModalOpen(true);
    };

    const handleSave = async (moduleData) => {
        if (isCreateMode) {
            const result = await createModule(moduleData);
            // Auto-link signal if this was created from a signal
            if (linkedSignalData && result?.module?.id) {
                onSignalResponseCreated(linkedSignalData.id, result.module.id);
            }
        } else {
            await updateModule(selectedModule.id, moduleData);
        }
        setModalOpen(false);
        setSelectedModule(null);
        setCreateInitialData(null);
        setLinkedSignalData(null);
        onRefresh();
    };

    const handleDelete = async (id) => {
        try {
            await deleteModule(id);
            setModalOpen(false);
            setSelectedModule(null);
            onRefresh();
        } catch (error) {
            console.error('Error deleting module:', error);
        }
    };

    const handlePublish = async (e, id) => {
        e.stopPropagation();
        try {
            await publishModule(id);
            onRefresh();
        } catch (error) {
            console.error('Error publishing module:', error);
        }
    };

    const handleHide = async (e, id) => {
        e.stopPropagation();
        try {
            await hideModule(id);
            onRefresh();
        } catch (error) {
            console.error('Error hiding module:', error);
        }
    };

    // ===================================
    // RENDER
    // ===================================

    return (
        <div className="afcm">
            {/* HEADER */}
            <div className="afcm-header">
                <h2 className="afcm-title">{t('admin.modules.title')}</h2>
                <button className="afcm-create-btn" onClick={handleCreateClick}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    {t('admin.modules.createNew')}
                </button>
            </div>

            {/* FILTER BAR */}
            <div className="afcm-filters">
                {filterOptions.map((filter) => (
                    <button
                        key={filter.key}
                        className={`afcm-filter-btn ${activeFilter === filter.key ? 'afcm-filter-btn--active' : ''}`}
                        onClick={() => setActiveFilter(filter.key)}
                        style={
                            activeFilter === filter.key && filter.key !== 'all'
                                ? { '--afcm-filter-color': getStatusColor(filter.key) }
                                : {}
                        }
                    >
                        {filter.key !== 'all' && (
                            <span
                                className="afcm-filter-dot"
                                style={{ backgroundColor: getStatusColor(filter.key) }}
                            ></span>
                        )}
                        {filter.label}
                        <span className="afcm-filter-count">
                            {filter.key === 'all'
                                ? modules.length
                                : modules.filter((m) => m.status === filter.key).length}
                        </span>
                    </button>
                ))}
            </div>

            {/* MODULES TABLE */}
            {filteredModules.length > 0 ? (
                <div className="afcm-table-wrapper">
                    <table className="afcm-table">
                        <thead>
                            <tr>
                                <th>{t('admin.signalModal.claim')}</th>
                                <th>{t('admin.moduleModal.verdict')}</th>
                                <th>{t('admin.moduleModal.category')}</th>
                                <th>{t('admin.moduleModal.status')}</th>
                                <th>{t('detail.views')}</th>
                                <th>{t('detail.checkedOn')}</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredModules.map((module) => (
                                <tr
                                    key={module.id}
                                    className="afcm-row"
                                    onClick={() => handleModuleClick(module)}
                                >
                                    <td className="afcm-cell-claim">
                                        {truncate(module.claimText)}
                                    </td>
                                    <td>
                                        <span
                                            className="afcm-verdict-badge"
                                            style={{
                                                backgroundColor: `${getVerdictColor(module.verdict)}15`,
                                                color: getVerdictColor(module.verdict),
                                                borderColor: `${getVerdictColor(module.verdict)}30`,
                                            }}
                                        >
                                            {t(`verdicts.${module.verdict}`, module.verdict)}
                                        </span>
                                    </td>
                                    <td className="afcm-cell-category">
                                        {module.category || '-'}
                                    </td>
                                    <td>
                                        <span
                                            className="afcm-status-badge"
                                            style={{
                                                backgroundColor: `${getStatusColor(module.status)}15`,
                                                color: getStatusColor(module.status),
                                                borderColor: `${getStatusColor(module.status)}30`,
                                            }}
                                        >
                                            {t(`admin.moduleStatuses.${module.status}`, module.status)}
                                        </span>
                                    </td>
                                    <td className="afcm-cell-views">
                                        {module.viewsCount || 0}
                                    </td>
                                    <td className="afcm-cell-date">
                                        {formatDate(module.createdAt)}
                                    </td>
                                    <td className="afcm-cell-actions">
                                        {module.status === 'draft' && (
                                            <button
                                                className="afcm-action-btn afcm-action-btn--publish"
                                                onClick={(e) => handlePublish(e, module.id)}
                                                title={t('admin.moduleModal.publish')}
                                            >
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                            </button>
                                        )}
                                        {module.status === 'published' && (
                                            <button
                                                className="afcm-action-btn afcm-action-btn--hide"
                                                onClick={(e) => handleHide(e, module.id)}
                                                title={t('admin.moduleModal.hide')}
                                            >
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                                                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                                                    <line x1="1" y1="1" x2="23" y2="23" />
                                                </svg>
                                            </button>
                                        )}
                                        {module.status === 'hidden' && (
                                            <button
                                                className="afcm-action-btn afcm-action-btn--publish"
                                                onClick={(e) => handlePublish(e, module.id)}
                                                title={t('admin.moduleModal.publish')}
                                            >
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                    <circle cx="12" cy="12" r="3" />
                                                </svg>
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="afcm-empty">
                    <div className="afcm-empty-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <line x1="3" y1="9" x2="21" y2="9" />
                            <line x1="9" y1="21" x2="9" y2="9" />
                        </svg>
                    </div>
                    <h3>{t('admin.modules.empty')}</h3>
                </div>
            )}

            {/* MODAL */}
            {modalOpen && (
                <AdminFactCheckModuleModal
                    module={isCreateMode ? null : selectedModule}
                    initialData={isCreateMode ? createInitialData : null}
                    onClose={() => {
                        setModalOpen(false);
                        setSelectedModule(null);
                        setCreateInitialData(null);
                        setLinkedSignalData(null);
                    }}
                    onSave={handleSave}
                    onDelete={handleDelete}
                />
            )}
        </div>
    );
};
