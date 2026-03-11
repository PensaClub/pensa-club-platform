// src/components/AdminFactCheck/AdminFactCheckSignals/AdminFactCheckSignals.jsx

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import './adminFactCheckSignals.css';
import { useFactCheck } from '../../contexts/FactCheckProvider';
import { AdminFactCheckSignalModal } from '../AdminFactCheckSignalModal/AdminFactCheckSignalModal';
import { AdminFactCheckPersonalEmailModal } from '../AdminFactCheckPersonalEmailModal/AdminFactCheckPersonalEmailModal';

export const AdminFactCheckSignals = ({ signals, modules, onRefresh, onCreateResponse, onEditResponse }) => {
    const { t } = useTranslation('factcheck');
    const { updateSignal, deleteSignal } = useFactCheck();

    const [activeFilter, setActiveFilter] = useState('all');
    const [selectedSignal, setSelectedSignal] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [emailModalSignal, setEmailModalSignal] = useState(null);

    // ===================================
    // STATUS FILTERS
    // ===================================

    const filterOptions = [
        { key: 'all', label: t('admin.signals.filterAll') },
        { key: 'new', label: t('admin.signals.filterNew') },
        { key: 'in_review', label: t('admin.signals.filterInReview') },
        { key: 'resolved', label: t('admin.signals.filterResolved') },
        { key: 'dismissed', label: t('admin.signals.filterDismissed') },
    ];

    // ===================================
    // FILTERED SIGNALS
    // ===================================

    const filteredSignals = useMemo(() => {
        if (activeFilter === 'all') return signals;
        return signals.filter((s) => s.status === activeFilter);
    }, [signals, activeFilter]);

    // ===================================
    // STATUS BADGE COLORS
    // ===================================

    const getStatusColor = (status) => {
        switch (status) {
            case 'new': return '#3b82f6';
            case 'in_review': return '#ea580c';
            case 'resolved': return '#16a34a';
            case 'dismissed': return '#6b7280';
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
    // HANDLERS
    // ===================================

    const handleSignalClick = (signal) => {
        setSelectedSignal(signal);
        setModalOpen(true);
    };

    const handleSave = async (id, data) => {
        try {
            await updateSignal(id, data);
            setModalOpen(false);
            setSelectedSignal(null);
            onRefresh();
        } catch (error) {
            console.error('Error saving signal:', error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteSignal(id);
            setModalOpen(false);
            setSelectedSignal(null);
            onRefresh();
        } catch (error) {
            console.error('Error deleting signal:', error);
        }
    };

    // ===================================
    // TRUNCATE TEXT
    // ===================================

    const truncate = (text, maxLength = 80) => {
        if (!text) return '-';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    // ===================================
    // RENDER
    // ===================================

    return (
        <div className="afcs">
            {/* HEADER */}
            <div className="afcs-header">
                <h2 className="afcs-title">{t('admin.signals.title')}</h2>
            </div>

            {/* FILTER BAR */}
            <div className="afcs-filters">
                {filterOptions.map((filter) => (
                    <button
                        key={filter.key}
                        className={`afcs-filter-btn ${activeFilter === filter.key ? 'afcs-filter-btn--active' : ''}`}
                        onClick={() => setActiveFilter(filter.key)}
                        style={
                            activeFilter === filter.key && filter.key !== 'all'
                                ? { '--afcs-filter-color': getStatusColor(filter.key) }
                                : {}
                        }
                    >
                        {filter.key !== 'all' && (
                            <span
                                className="afcs-filter-dot"
                                style={{ backgroundColor: getStatusColor(filter.key) }}
                            ></span>
                        )}
                        {filter.label}
                        <span className="afcs-filter-count">
                            {filter.key === 'all'
                                ? signals.length
                                : signals.filter((s) => s.status === filter.key).length}
                        </span>
                    </button>
                ))}
            </div>

            {/* SIGNALS TABLE */}
            {filteredSignals.length > 0 ? (
                <div className="afcs-table-wrapper">
                    <table className="afcs-table">
                        <thead>
                            <tr>
                                <th>{t('admin.signalModal.claim')}</th>
                                <th>{t('admin.signalModal.source')}</th>
                                <th>{t('admin.signalModal.city')}</th>
                                <th>{t('admin.signalModal.status')}</th>
                                <th>{t('detail.checkedOn')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSignals.map((signal) => (
                                <tr
                                    key={signal.id}
                                    className="afcs-row"
                                    onClick={() => handleSignalClick(signal)}
                                >
                                    <td className="afcs-cell-claim">
                                        <span>{truncate(signal.claimText)}</span>
                                        {signal.notes && (
                                            <span className="afcs-indicator afcs-indicator--notes" title="Има забележки">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                                </svg>
                                            </span>
                                        )}
                                        {signal.reporterEmail && (
                                            <span className="afcs-indicator afcs-indicator--email" title={signal.reporterEmail}>
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                                    <polyline points="22,6 12,13 2,6" />
                                                </svg>
                                            </span>
                                        )}
                                    </td>
                                    <td className="afcs-cell-source">
                                        {t(`sourceTypes.${signal.sourceType}`, signal.sourceType)}
                                    </td>
                                    <td className="afcs-cell-city">
                                        {signal.city || '-'}
                                    </td>
                                    <td>
                                        <span
                                            className="afcs-status-badge"
                                            style={{
                                                backgroundColor: `${getStatusColor(signal.status)}15`,
                                                color: getStatusColor(signal.status),
                                                borderColor: `${getStatusColor(signal.status)}30`,
                                            }}
                                        >
                                            {t(`admin.signalStatuses.${signal.status}`, signal.status)}
                                        </span>
                                    </td>
                                    <td className="afcs-cell-date">
                                        {formatDate(signal.createdAt)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="afcs-empty">
                    <div className="afcs-empty-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                        </svg>
                    </div>
                    <h3>{t('admin.signals.empty')}</h3>
                </div>
            )}

            {/* MODAL */}
            {modalOpen && selectedSignal && (
                <AdminFactCheckSignalModal
                    signal={selectedSignal}
                    modules={modules}
                    onClose={() => {
                        setModalOpen(false);
                        setSelectedSignal(null);
                    }}
                    onSave={handleSave}
                    onDelete={handleDelete}
                    onCreateResponse={(signal) => {
                        setModalOpen(false);
                        setSelectedSignal(null);
                        onCreateResponse(signal);
                    }}
                    onEditResponse={(module) => {
                        setModalOpen(false);
                        setSelectedSignal(null);
                        onEditResponse(module);
                    }}
                    onSendEmail={(signal) => {
                        setEmailModalSignal(signal);
                    }}
                />
            )}

            {/* EMAIL MODAL */}
            {emailModalSignal && (
                <AdminFactCheckPersonalEmailModal
                    signal={emailModalSignal}
                    onClose={() => setEmailModalSignal(null)}
                />
            )}
        </div>
    );
};
