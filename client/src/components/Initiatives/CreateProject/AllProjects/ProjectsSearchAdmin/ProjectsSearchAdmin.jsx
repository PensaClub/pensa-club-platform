import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './projectsSearchAdmin.css';

export const ProjectsSearchAdmin = ({
    onSearch,
    onFilterChange,
    totalCount,
    viewMode
}) => {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        status: 'all',
        category: 'all',
        priority: 'all',
        sortBy: 'newest'
    });

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        onSearch(value);
    };

    const handleFilterChange = (filterKey, value) => {
        const newFilters = { ...filters, [filterKey]: value };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    return (
        <div className="projects-search-admin-container">
            <div className="projects-search-admin-search-section">
                <div className="projects-search-admin-input-wrapper">
                    <svg className="projects-search-admin-search-icon" viewBox="0 0 24 24" fill="none">
                        <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                        <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    <input
                        type="text"
                        placeholder={t('projects.admin.searchPlaceholder')}
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="projects-search-admin-input"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                onSearch('');
                            }}
                            className="projects-search-admin-clear-btn"
                        >
                            <svg viewBox="0 0 24 24" fill="none">
                                <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" />
                                <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            <div className="projects-search-admin-filters-section">
                {viewMode === 'projects' && (
                    <div className="projects-search-admin-filter-group">
                        <label className="projects-search-admin-filter-label">{t('projects.admin.filterByStatus')}</label>
                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="projects-search-admin-filter-select"
                        >
                            <option value="all">{t('projects.admin.allStatuses')}</option>
                            <option value="active">{t('projects.admin.statusActive')}</option>
                            <option value="planning">{t('projects.admin.statusPlanning')}</option>
                            <option value="completed">{t('projects.admin.statusCompleted')}</option>
                            <option value="paused">{t('projects.admin.statusPaused')}</option>
                        </select>
                    </div>
                )}

                <div className="projects-search-admin-filter-group">
                    <label className="projects-search-admin-filter-label">{t('projects.admin.filterByCategory')}</label>
                    <select
                        value={filters.category}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                        className="projects-search-admin-filter-select"
                    >
                        <option value="all">{t('projects.admin.allCategories')}</option>
                        <option value="">{t('projects.create.selectCategory')}</option>
                        <option value="Дигитализация">{t('projects.categories.digitalization')}</option>
                        <option value="Образование">{t('projects.categories.education')}</option>
                        <option value="Здравеопазване">{t('projects.categories.healthcare')}</option>
                        <option value="Околна среда">{t('projects.categories.environment')}</option>
                        <option value="Социални дейности">{t('projects.categories.social')}</option>
                        <option value="Култура">{t('projects.categories.culture')}</option>
                        <option value="Спорт">{t('projects.categories.sports')}</option>
                    </select>
                </div>

                <div className="projects-search-admin-filter-group">
                    <label className="projects-search-admin-filter-label">{t('projects.admin.filterByPriority')}</label>
                    <select
                        value={filters.priority}
                        onChange={(e) => handleFilterChange('priority', e.target.value)}
                        className="projects-search-admin-filter-select"
                    >
                        <option value="all">{t('projects.admin.allPriorities')}</option>
                        <option value="high">{t('projects.admin.priorityHigh')}</option>
                        <option value="medium">{t('projects.admin.priorityMedium')}</option>
                        <option value="low">{t('projects.admin.priorityLow')}</option>
                    </select>
                </div>

                <div className="projects-search-admin-filter-group">
                    <label className="projects-search-admin-filter-label">{t('projects.admin.sortBy')}</label>
                    <select
                        value={filters.sortBy}
                        onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                        className="projects-search-admin-filter-select"
                    >
                        <option value="newest">{t('projects.admin.sortNewest')}</option>
                        <option value="oldest">{t('projects.admin.sortOldest')}</option>
                        <option value="updated">{t('projects.admin.sortUpdated')}</option>
                        <option value="title">{t('projects.admin.sortTitle')}</option>
                        <option value="deadline">{t('projects.admin.sortDeadline')}</option>
                    </select>
                </div>
            </div>

            <div className="projects-search-admin-results-summary">
                <span className="projects-search-admin-results-count">
                    {totalCount} {viewMode === 'projects' ? t('projects.admin.projectsFound') : t('projects.admin.draftsFound')}
                </span>
            </div>
        </div>
    );
};