import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { bg, enUS } from 'date-fns/locale';
import './applicationsList.css';
import { ApplicationDetails } from '../ApplicationDetails/ApplicationDetails';

export const ApplicationsList = ({ applications, onRefresh, isLoading }) => {
    const { t, i18n } = useTranslation();
    const [sortField, setSortField] = useState('appliedAt');
    const [sortDirection, setSortDirection] = useState('desc');
    const [viewMode, setViewMode] = useState('table'); // 'table' или 'cards'
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const currentLocale = i18n.language === 'bg' ? bg : enUS;

    // Сортиране на данните
    const sortedApplications = [...applications].sort((a, b) => {
        let aValue = a[sortField];
        let bValue = b[sortField];

        if (sortField === 'appliedAt') {
            aValue = new Date(aValue);
            bValue = new Date(bValue);
        } else if (sortField === 'name') {
            aValue = `${a.firstName} ${a.lastName}`.toLowerCase();
            bValue = `${b.firstName} ${b.lastName}`.toLowerCase();
        } else if (typeof aValue === 'string') {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
        }

        if (sortDirection === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
    };

    const getSortIcon = (field) => {
        if (sortField !== field) return '↕️';
        return sortDirection === 'asc' ? '⬆️' : '⬇️';
    };

    const handleContact = (application) => {
        const subject = encodeURIComponent(t('applications.email.subject', {
            projectId: application.projectId
        }));
        const body = encodeURIComponent(t('applications.email.body', {
            name: `${application.firstName} ${application.lastName}`,
            projectId: application.projectId
        }));

        window.open(`mailto:${application.email}?subject=${subject}&body=${body}`);
    };

    const handleView = (application) => {
        setSelectedApplication(application);
        setIsDetailsModalOpen(true);
    };

    if (isLoading) {
        return (
            <div className="applications-list-loading">
                <div className="loading-spinner"></div>
                <p>{t('applications.list.loading')}</p>
            </div>
        );
    }

    if (applications.length === 0) {
        return (
            <div className="applications-list-empty">
                <div className="empty-icon">📋</div>
                <h3>{t('applications.list.empty.title')}</h3>
                <p>{t('applications.list.empty.description')}</p>
                <button onClick={onRefresh} className="refresh-btn-empty">
                    <span>🔄</span>
                    {t('applications.actions.refresh')}
                </button>
            </div>
        );
    }

    return (
        <div className="applications-list">
            {/* Header Controls */}
            <div className="list-header">
                <div className="list-info">
                    <h3 className="list-title">{t('applications.list.title')}</h3>
                    <p className="list-count">
                        {t('applications.list.count', { count: applications.length })}
                    </p>
                </div>

                <div className="list-controls">
                    {/* View Mode Toggle - Mobile */}
                    <div className="view-toggle mobile-only">
                        <button
                            className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
                            onClick={() => setViewMode('table')}
                            title={t('applications.list.viewTable')}
                        >
                            📊
                        </button>
                        <button
                            className={`view-btn ${viewMode === 'cards' ? 'active' : ''}`}
                            onClick={() => setViewMode('cards')}
                            title={t('applications.list.viewCards')}
                        >
                            📇
                        </button>
                    </div>

                    <button onClick={onRefresh} className="refresh-btn-small">
                        🔄
                    </button>
                </div>
            </div>

            {/* Desktop Table View */}
            <div className={`table-container ${viewMode === 'table' ? 'active' : ''} desktop-only`}>
                <table className="applications-table">
                    <thead>
                        <tr>
                            <th
                                onClick={() => handleSort('name')}
                                className="sortable"
                            >
                                {t('applications.table.name')} {getSortIcon('name')}
                            </th>
                            <th
                                onClick={() => handleSort('email')}
                                className="sortable"
                            >
                                {t('applications.table.email')} {getSortIcon('email')}
                            </th>
                            <th>{t('applications.table.phone')}</th>
                            <th
                                onClick={() => handleSort('projectId')}
                                className="sortable"
                            >
                                {t('applications.table.project')} {getSortIcon('projectId')}
                            </th>
                            <th
                                onClick={() => handleSort('appliedAt')}
                                className="sortable"
                            >
                                {t('applications.table.date')} {getSortIcon('appliedAt')}
                            </th>
                            <th>{t('applications.table.actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedApplications.map(application => (
                            <tr key={application.id} className="table-row">
                                <td>
                                    <div className="name-cell">
                                        <div className="avatar-apply">
                                            {application.firstName[0]}{application.lastName[0]}
                                        </div>
                                        <div className="name-info">
                                            <div className="full-name">
                                                {application.firstName} {application.lastName}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <a
                                        href={`mailto:${application.email}`}
                                        className="email-link"
                                        title={t('applications.actions.sendEmail')}
                                    >
                                        {application.email}
                                    </a>
                                </td>
                                <td>
                                    {application.phone ? (
                                        <a href={`tel:${application.phone}`} className="phone-link">
                                            {application.phone}
                                        </a>
                                    ) : (
                                        <span className="no-phone">{t('applications.table.noPhone')}</span>
                                    )}
                                </td>
                                <td>
                                    <span className="project-tag">{application.projectId}</span>
                                </td>
                                <td>
                                    <div className="date-cell">
                                        <div className="date">
                                            {format(new Date(application.appliedAt), 'dd.MM.yyyy', { locale: currentLocale })}
                                        </div>
                                        <div className="time">
                                            {format(new Date(application.appliedAt), 'HH:mm', { locale: currentLocale })}
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className="actions">
                                        <button
                                            onClick={() => handleView(application)}
                                            className="action-btn view-btn"
                                            title={t('applications.actions.view')}
                                        >
                                            👁️
                                        </button>
                                        <button
                                            onClick={() => handleContact(application)}
                                            className="action-btn contact-btn"
                                            title={t('applications.actions.contact')}
                                        >
                                            ✉️
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards View */}
            <div className={`cards-container ${viewMode === 'cards' ? 'active' : ''} mobile-only`}>
                {sortedApplications.map(application => (
                    <div key={application.id} className="application-card">
                        <div className="card-header">
                            <div className="card-avatar">
                                {application.firstName[0]}{application.lastName[0]}
                            </div>
                            <div className="card-main-info">
                                <h4 className="card-name">
                                    {application.firstName} {application.lastName}
                                </h4>
                                <p className="card-email">{application.email}</p>
                            </div>
                            <div className="card-date">
                                {format(new Date(application.appliedAt), 'dd.MM', { locale: currentLocale })}
                            </div>
                        </div>

                        <div className="card-body">
                            <div className="card-info-row">
                                <span className="info-label">{t('applications.table.project')}:</span>
                                <span className="project-tag-small">{application.projectId}</span>
                            </div>

                            {application.phone && (
                                <div className="card-info-row">
                                    <span className="info-label">{t('applications.table.phone')}:</span>
                                    <a href={`tel:${application.phone}`} className="phone-link-small">
                                        {application.phone}
                                    </a>
                                </div>
                            )}
                        </div>

                        <div className="card-actions">
                            <button
                                onClick={() => handleView(application)}
                                className="card-action-btn view"
                            >
                                👁️ {t('applications.actions.view')}
                            </button>
                            <button
                                onClick={() => handleContact(application)}
                                className="card-action-btn contact"
                            >
                                ✉️ {t('applications.actions.contact')}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <ApplicationDetails
                application={selectedApplication}
                isOpen={isDetailsModalOpen}
                onClose={() => {
                    setIsDetailsModalOpen(false);
                    setSelectedApplication(null);
                }}
                onContact={handleContact}
            />
        </div>
    );
};