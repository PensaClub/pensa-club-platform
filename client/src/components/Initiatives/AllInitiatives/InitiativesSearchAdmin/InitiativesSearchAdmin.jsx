// components/AdminDashboard/AllInitiatives/InitiativesSearchAdmin/InitiativesSearchAdmin.js
import React, { useState } from 'react';
import './InitiativesSearchAdmin.css';
import { useTranslation } from 'react-i18next';

export const InitiativesSearchAdmin = ({ onSearch, onFilterChange, totalCount, viewMode, onViewModeChange }) => {
  const { t } = useTranslation('content');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    sortBy: 'newest'
  });

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="initiatives-search-admin">
      <div className="search-header-admin">
        <h2 className="search-title-admin">{t('initiatives.admin.title')}</h2>
        
        {/* Toggle между инициативи и чернови */}
        <div className="view-mode-toggle">
          <button 
            className={`mode-btn ${viewMode === 'initiatives' ? 'active' : ''}`}
            onClick={() => onViewModeChange('initiatives')}
          >
            {t('initiatives.admin.published')}
          </button>
          <button 
            className={`mode-btn ${viewMode === 'drafts' ? 'active' : ''}`}
            onClick={() => onViewModeChange('drafts')}
          >
            {t('initiatives.admin.drafts')}
          </button>
        </div>

        <div className="search-count-admin">
          <span className="count-number">{totalCount}</span>
          <span className="count-text">
            {viewMode === 'initiatives' ? t('initiatives.admin.initiatives') : t('initiatives.admin.drafts')}
          </span>
        </div>
      </div>

      <div className="search-controls-admin">
        <div className="search-input-wrapper-admin">
          <svg className="search-icon-admin" viewBox="0 0 24 24" fill="none">
            <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" 
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <input
            type="text"
            className="search-input-admin"
            placeholder={t('initiatives.admin.searchPlaceholder')}
            value={searchTerm}
            onChange={handleSearchChange}
          />
          {searchTerm && (
            <button 
              className="clear-search-admin"
              onClick={() => {
                setSearchTerm('');
                onSearch('');
              }}
            >
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          )}
        </div>

        <div className="search-filters-admin">
          {viewMode === 'initiatives' && (
            <select 
              className="filter-select-admin"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="all">{t('initiatives.admin.filters.allStatuses')}</option>
              <option value="active">{t('initiatives.admin.filters.active')}</option>
              <option value="completed">{t('initiatives.admin.filters.completed')}</option>
              <option value="paused">{t('initiatives.admin.filters.paused')}</option>
            </select>
          )}

          <select 
            className="filter-select-admin sort-filter"
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
          >
            <option value="newest">{t('initiatives.admin.filters.newest')}</option>
            <option value="oldest">{t('initiatives.admin.filters.oldest')}</option>
            <option value="updated">{t('initiatives.admin.filters.lastUpdated')}</option>
            <option value="title">{t('initiatives.admin.filters.byTitle')}</option>
          </select>
        </div>
      </div>
    </div>
  );
};