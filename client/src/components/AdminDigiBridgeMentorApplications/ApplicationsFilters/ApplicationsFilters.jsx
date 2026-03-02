// src/components/AdminDigiBridgeMentorApplications/ApplicationsFilters/ApplicationsFilters.jsx

import { useTranslation } from 'react-i18next';
import './applicationsFilters.css';

export const ApplicationsFilters = ({ filters, onFilterChange }) => {
  const { t } = useTranslation('digibridge');

  const handleSearchChange = (e) => {
    onFilterChange({
      ...filters,
      search: e.target.value
    });
  };

  const handleSpecializationChange = (e) => {
    onFilterChange({
      ...filters,
      specialization: e.target.value
    });
  };

  const handleSortChange = (e) => {
    onFilterChange({
      ...filters,
      sortBy: e.target.value
    });
  };

  const clearFilters = () => {
    onFilterChange({
      search: '',
      specialization: 'all',
      sortBy: 'newest'
    });
  };

  const hasActiveFilters = 
    filters.search !== '' || 
    filters.specialization !== 'all' || 
    filters.sortBy !== 'newest';

  return (
    <div className="applications-filters">
      <div className="applications-filters-container">
        {/* SEARCH */}
        <div className="applications-filters-search">
          <svg 
            className="applications-filters-search-icon" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={filters.search}
            onChange={handleSearchChange}
            placeholder={t('ApplicationsFilters.searchPlaceholder')}
            className="applications-filters-search-input"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange({ ...filters, search: '' })}
              className="applications-filters-search-clear"
              aria-label="Clear search"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* SPECIALIZATION */}
        <div className="applications-filters-select-wrapper">
          <label className="applications-filters-label">
            {t('ApplicationsFilters.specializationLabel')}
          </label>
          <select
            value={filters.specialization}
            onChange={handleSpecializationChange}
            className="applications-filters-select"
          >
            <option value="all">{t('ApplicationsFilters.specializationAll')}</option>
            <option value="Digital Security">{t('ApplicationsFilters.digitalSecurity')}</option>
            <option value="Social Media">{t('ApplicationsFilters.socialMedia')}</option>
            <option value="Online Banking">{t('ApplicationsFilters.onlineBanking')}</option>
            <option value="Media Literacy">{t('ApplicationsFilters.mediaLiteracy')}</option>
            <option value="E-Government">{t('ApplicationsFilters.eGovernment')}</option>
          </select>
          <svg 
            className="applications-filters-select-arrow" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>

        {/* SORT BY */}
        <div className="applications-filters-select-wrapper">
          <label className="applications-filters-label">
            {t('ApplicationsFilters.sortByLabel')}
          </label>
          <select
            value={filters.sortBy}
            onChange={handleSortChange}
            className="applications-filters-select"
          >
            <option value="newest">{t('ApplicationsFilters.sortNewest')}</option>
            <option value="oldest">{t('ApplicationsFilters.sortOldest')}</option>
            <option value="name">{t('ApplicationsFilters.sortName')}</option>
          </select>
          <svg 
            className="applications-filters-select-arrow" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>

        {/* CLEAR FILTERS BUTTON */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="applications-filters-clear-btn"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            {t('ApplicationsFilters.clearFilters')}
          </button>
        )}
      </div>
    </div>
  );
};