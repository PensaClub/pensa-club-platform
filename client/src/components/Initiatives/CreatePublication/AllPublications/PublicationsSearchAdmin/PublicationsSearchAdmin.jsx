import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './publicationsSearchAdmin.css';

export const PublicationsSearchAdmin = ({
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

    const clearSearch = () => {
        setSearchTerm('');
        onSearch('');
    };

    return (
        <div className="publications-search-admin-container">
            <div className="publications-search-admin-search-section">
                <div className="publications-search-admin-input-wrapper">
                    <svg className="publications-search-admin-search-icon" viewBox="0 0 24 24" fill="none">
                        <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                        <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <input
                        type="text"
                        className="publications-search-admin-input"
                        placeholder={t('publications.admin.searchPlaceholder')}
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                    {searchTerm && (
                        <button
                            className="publications-search-admin-clear-btn"
                            onClick={clearSearch}
                        >
                            <svg viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                <path d="M15 9L9 15M9 9L15 15" stroke="currentColor" strokeWidth="2" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            <div className="publications-search-admin-filters-section">
                <div className="publications-search-admin-filter-group">
                    <label className="publications-search-admin-filter-label">
                        {t('publications.admin.filters.status')}
                    </label>
                    <select
                        className="publications-search-admin-filter-select"
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                    >
                        <option value="all">{t('publications.admin.filters.allStatuses')}</option>
                        {viewMode === 'publications' && (
                            <>
                                <option value="active">{t('publications.admin.filters.active')}</option>
                                <option value="completed">{t('publications.admin.filters.completed')}</option>
                                <option value="paused">{t('publications.admin.filters.paused')}</option>
                            </>
                        )}
                    </select>
                </div>

                <div className="publications-search-admin-filter-group">
                    <label className="publications-search-admin-filter-label">
                        {t('publications.admin.filters.category')}
                    </label>
                    <select
                        className="publications-search-admin-filter-select"
                        value={filters.category}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                    >
                        <option value="all">{t('publications.admin.filters.allCategories')}</option>
                        <option value="Ръководства">{t('publications.admin.filters.guides')}</option>
                        <option value="Наръчници">{t('publications.admin.filters.manuals')}</option>
                        <option value="Здраве">{t('publications.admin.filters.health')}</option>
                        <option value="Образование">{t('publications.admin.filters.education')}</option>
                    </select>
                </div>

                <div className="publications-search-admin-filter-group">
                    <label className="publications-search-admin-filter-label">
                        {t('publications.admin.filters.sortBy')}
                    </label>
                    <select
                        className="publications-search-admin-filter-select"
                        value={filters.sortBy}
                        onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    >
                        <option value="newest">{t('publications.admin.filters.newest')}</option>
                        <option value="oldest">{t('publications.admin.filters.oldest')}</option>
                        <option value="updated">{t('publications.admin.filters.updated')}</option>
                        <option value="title">{t('publications.admin.filters.title')}</option>
                    </select>
                </div>
            </div>

            <div className="publications-search-admin-results-summary">
                <div className="publications-search-admin-results-count">
                    {t('publications.admin.resultsCount', { count: totalCount })}
                </div>
            </div>
        </div>
    );
};
