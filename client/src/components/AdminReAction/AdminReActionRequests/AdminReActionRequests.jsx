// src/components/AdminReAction/AdminReActionRequests/AdminReActionRequests.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import './adminReActionRequests.css';
import { useReAction } from '../../contexts/ReActionProvider';
import { AdminReActionRequestModal } from '../AdminReActionRequestModal/AdminReActionRequestModal';
import { AdminReActionEmailModal } from '../AdminReActionEmailModal/AdminReActionEmailModal';

export const AdminReActionRequests = ({ onRefresh }) => {
    const { t } = useTranslation('reaction');
    const { getAdminRequests, updateRequest, exportCSV } = useReAction();

    const [requests, setRequests] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [emailModalRequest, setEmailModalRequest] = useState(null);

    // Filters
    const [statusFilter, setStatusFilter] = useState('');
    const [citySearch, setCitySearch] = useState('');
    const [mentorFilter, setMentorFilter] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [topicFilter, setTopicFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const limit = 20;

    // ===================================
    // FETCH REQUESTS
    // ===================================

    const fetchRequests = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = { page, limit };
            if (statusFilter) params.status = statusFilter;
            if (citySearch.trim()) params.city = citySearch.trim();
            if (mentorFilter) params.mentorId = mentorFilter;
            if (dateFrom) params.dateFrom = dateFrom;
            if (dateTo) params.dateTo = dateTo;
            if (topicFilter) params.topic = topicFilter;
            if (searchQuery.trim()) params.search = searchQuery.trim();

            const res = await getAdminRequests(params);
            setRequests(res?.requests || []);
            setTotal(res?.pagination?.total || 0);
        } catch (error) {
            console.error('Error fetching requests:', error);
        } finally {
            setIsLoading(false);
        }
    }, [getAdminRequests, page, statusFilter, citySearch, mentorFilter, dateFrom, dateTo, topicFilter, searchQuery]);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    // ===================================
    // STATUS COLORS
    // ===================================

    const getStatusColor = (status) => {
        switch (status) {
            case 'new': return '#d97706';
            case 'reviewing': return '#3b82f6';
            case 'mentor_assigned': return '#7c3aed';
            case 'confirmed': return '#16a34a';
            case 'completed': return '#6b7280';
            case 'cancelled': return '#dc2626';
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

    const truncate = (text, maxLength = 60) => {
        if (!text) return '-';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    // ===================================
    // HANDLERS
    // ===================================

    const handleRowClick = (request) => {
        setSelectedRequest(request);
        setModalOpen(true);
    };

    const handleSave = async (id, data) => {
        try {
            await updateRequest(id, data);
            setModalOpen(false);
            setSelectedRequest(null);
            fetchRequests();
            onRefresh();
        } catch (error) {
            console.error('Error saving request:', error);
        }
    };

    const handleClearFilters = () => {
        setStatusFilter('');
        setCitySearch('');
        setMentorFilter('');
        setDateFrom('');
        setDateTo('');
        setTopicFilter('');
        setSearchQuery('');
        setPage(1);
    };

    const handleExportCSV = async () => {
        try {
            const params = {};
            if (statusFilter) params.status = statusFilter;
            if (citySearch.trim()) params.city = citySearch.trim();
            if (dateFrom) params.dateFrom = dateFrom;
            if (dateTo) params.dateTo = dateTo;
            if (topicFilter) params.topic = topicFilter;
            await exportCSV(params);
        } catch (error) {
            console.error('Error exporting CSV:', error);
        }
    };

    const hasActiveFilters = statusFilter || citySearch || mentorFilter || dateFrom || dateTo || topicFilter || searchQuery;

    const totalPages = Math.ceil(total / limit);

    // ===================================
    // STATUS OPTIONS
    // ===================================

    const statusOptions = [
        { value: '', label: t('admin.requests.allStatuses') },
        { value: 'new', label: t('admin.statuses.new') },
        { value: 'reviewing', label: t('admin.statuses.reviewing') },
        { value: 'mentor_assigned', label: t('admin.statuses.mentor_assigned') },
        { value: 'confirmed', label: t('admin.statuses.confirmed') },
        { value: 'completed', label: t('admin.statuses.completed') },
        { value: 'cancelled', label: t('admin.statuses.cancelled') },
    ];

    // ===================================
    // RENDER
    // ===================================

    return (
        <div className="arar">
            {/* HEADER */}
            <div className="arar-header">
                <h2 className="arar-title">{t('admin.requests.title')}</h2>
                <button className="arar-export-btn" onClick={handleExportCSV}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    {t('admin.requests.exportCSV')}
                </button>
            </div>

            {/* FILTER BAR */}
            <div className="arar-filters">
                <select
                    className="arar-filter-select"
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                >
                    {statusOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>

                <input
                    type="text"
                    className="arar-filter-input"
                    placeholder={t('admin.requests.citySearch')}
                    value={citySearch}
                    onChange={(e) => { setCitySearch(e.target.value); setPage(1); }}
                />

                <input
                    type="text"
                    className="arar-filter-input"
                    placeholder={t('admin.requests.search')}
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                />

                <input
                    type="date"
                    className="arar-filter-input arar-filter-input--date"
                    value={dateFrom}
                    onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                    placeholder={t('admin.requests.dateFrom')}
                />

                <input
                    type="date"
                    className="arar-filter-input arar-filter-input--date"
                    value={dateTo}
                    onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                    placeholder={t('admin.requests.dateTo')}
                />

                {hasActiveFilters && (
                    <button className="arar-clear-btn" onClick={handleClearFilters}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                        {t('admin.requests.clearFilters')}
                    </button>
                )}
            </div>

            {/* TABLE */}
            {isLoading ? (
                <div className="arar-loading">
                    <div className="arar-spinner"></div>
                </div>
            ) : requests.length > 0 ? (
                <>
                    <div className="arar-table-wrapper">
                        <table className="arar-table">
                            <thead>
                                <tr>
                                    <th>{t('admin.requests.colDate')}</th>
                                    <th>{t('admin.requests.colClub')}</th>
                                    <th>{t('admin.requests.colCity')}</th>
                                    <th>{t('admin.requests.colTopic')}</th>
                                    <th>{t('admin.requests.colStatus')}</th>
                                    <th>{t('admin.requests.colMentor')}</th>
                                    <th>{t('admin.requests.colActions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.map((req) => (
                                    <tr
                                        key={req.id}
                                        className="arar-row"
                                        onClick={() => handleRowClick(req)}
                                    >
                                        <td className="arar-cell-date">{formatDate(req.preferredDate)}</td>
                                        <td className="arar-cell-club">{truncate(req.clubName, 40)}</td>
                                        <td className="arar-cell-city">{req.city || '-'}</td>
                                        <td className="arar-cell-topic">{truncate(req.topic, 40)}</td>
                                        <td>
                                            <span
                                                className="arar-status-badge"
                                                style={{
                                                    backgroundColor: `${getStatusColor(req.status)}15`,
                                                    color: getStatusColor(req.status),
                                                    borderColor: `${getStatusColor(req.status)}30`,
                                                }}
                                            >
                                                {t(`admin.statuses.${req.status}`, req.status)}
                                            </span>
                                        </td>
                                        <td className="arar-cell-mentor">{req.assignedMentor?.name || '-'}</td>
                                        <td className="arar-cell-actions">
                                            <button
                                                className="arar-action-btn"
                                                onClick={(e) => { e.stopPropagation(); handleRowClick(req); }}
                                                title={t('admin.requests.view')}
                                            >
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                    <circle cx="12" cy="12" r="3" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* MOBILE CARDS */}
                    <div className="arar-cards">
                        {requests.map((req) => (
                            <div
                                key={req.id}
                                className="arar-card"
                                onClick={() => handleRowClick(req)}
                            >
                                <div className="arar-card-header">
                                    <span className="arar-card-date">{formatDate(req.preferredDate)}</span>
                                    <span
                                        className="arar-status-badge"
                                        style={{
                                            backgroundColor: `${getStatusColor(req.status)}15`,
                                            color: getStatusColor(req.status),
                                            borderColor: `${getStatusColor(req.status)}30`,
                                        }}
                                    >
                                        {t(`admin.statuses.${req.status}`, req.status)}
                                    </span>
                                </div>
                                <div className="arar-card-club">{req.clubName}</div>
                                <div className="arar-card-meta">
                                    <span>{req.city || '-'}</span>
                                    {req.topic && <span>{truncate(req.topic, 30)}</span>}
                                </div>
                                {req.assignedMentor?.name && (
                                    <div className="arar-card-mentor">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                            <circle cx="12" cy="7" r="4" />
                                        </svg>
                                        {req.assignedMentor.name}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* PAGINATION */}
                    {totalPages > 1 && (
                        <div className="arar-pagination">
                            <button
                                className="arar-page-btn"
                                onClick={() => setPage(Math.max(1, page - 1))}
                                disabled={page === 1}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="15 18 9 12 15 6" />
                                </svg>
                            </button>
                            <span className="arar-page-info">
                                {page} / {totalPages}
                            </span>
                            <button
                                className="arar-page-btn"
                                onClick={() => setPage(Math.min(totalPages, page + 1))}
                                disabled={page === totalPages}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="9 18 15 12 9 6" />
                                </svg>
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="arar-empty">
                    <div className="arar-empty-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <line x1="8" y1="6" x2="21" y2="6" />
                            <line x1="8" y1="12" x2="21" y2="12" />
                            <line x1="8" y1="18" x2="21" y2="18" />
                            <line x1="3" y1="6" x2="3.01" y2="6" />
                            <line x1="3" y1="12" x2="3.01" y2="12" />
                            <line x1="3" y1="18" x2="3.01" y2="18" />
                        </svg>
                    </div>
                    <h3>{t('admin.requests.empty')}</h3>
                </div>
            )}

            {/* MODAL */}
            {modalOpen && selectedRequest && (
                <AdminReActionRequestModal
                    request={selectedRequest}
                    onClose={() => {
                        setModalOpen(false);
                        setSelectedRequest(null);
                    }}
                    onSave={handleSave}
                    onSendEmail={(request) => {
                        setEmailModalRequest(request);
                    }}
                    onRefresh={() => {
                        fetchRequests();
                        onRefresh();
                    }}
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
