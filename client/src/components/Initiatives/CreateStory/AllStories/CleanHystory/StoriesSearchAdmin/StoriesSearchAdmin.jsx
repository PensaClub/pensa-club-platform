import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './storiesSearchAdmin.css';

export const StoriesSearchAdmin = ({
    onSearch,
    onFilterChange,
    totalCount,
    viewMode
}) => {
    const { t } = useTranslation('content');
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        category: 'all',
        sortBy: 'newest' // newest, oldest, updated, published, likes, views
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
        <div className="stories-search-admin-container">
            <div className="stories-search-admin-search-section">
                <div className="stories-search-admin-input-wrapper">
                    <svg className="stories-search-admin-search-icon" viewBox="0 0 24 24" fill="none">
                        <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                        <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <input
                        type="text"
                        className="stories-search-admin-input"
                        placeholder={t('stories.admin.searchPlaceholder')}
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                    {searchTerm && (
                        <button
                            className="stories-search-admin-clear-btn"
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

            <div className="stories-search-admin-filters-section">
                {/* Category Filter */}
                <div className="stories-search-admin-filter-group">
                    <label className="stories-search-admin-filter-label">
                        {t('stories.admin.filters.category')}
                    </label>
                    <select
                        className="stories-search-admin-filter-select"
                        value={filters.category}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                    >
                        <option value="all">{t('stories.admin.filters.allCategories')}</option>
                        <option value="personal">{t('stories.categories.personal')}</option>
                        <option value="community">{t('stories.categories.community')}</option>
                        <option value="educational">{t('stories.categories.educational')}</option>
                        <option value="inspirational">{t('stories.categories.inspirational')}</option>
                        <option value="case-study">{t('stories.categories.caseStudy')}</option>
                        <option value="testimonial">{t('stories.categories.testimonial')}</option>
                        <option value="other">{t('stories.categories.other')}</option>
                    </select>
                </div>

                <div className="stories-search-admin-filter-group">
                    <label className="stories-search-admin-filter-label">
                        {t('stories.admin.filters.sortBy')}
                    </label>
                    <select
                        className="stories-search-admin-filter-select"
                        value={filters.sortBy}
                        onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    >
                        <option value="newest">{t('stories.admin.filters.newest')}</option>
                        <option value="oldest">{t('stories.admin.filters.oldest')}</option>
                        <option value="updated">{t('stories.admin.filters.updated')}</option>
                        <option value="published">{t('stories.admin.filters.published')}</option>
                        <option value="likes">{t('stories.admin.filters.likes')}</option>
                        <option value="views">{t('stories.admin.filters.views')}</option>
                    </select>
                </div>
            </div>

            <div className="stories-search-admin-results-summary">
                <div className="stories-search-admin-results-count">
                    {t('stories.admin.resultsCount', { count: totalCount })}
                </div>
            </div>
        </div>
    );

};
