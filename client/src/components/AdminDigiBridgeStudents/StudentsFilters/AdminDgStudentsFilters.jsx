// src/components/AdminDigiBridgeStudents/AdminDgStudentsFilters/AdminDgStudentsFilters.jsx

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './adminDgStudentsFilters.css';

export const AdminDgStudentsFilters = ({ filters, onFilterChange, totalResults }) => {
  const { t } = useTranslation('digibridge-students');
  const [showFilters, setShowFilters] = useState(false);

  const statusOptions = [
    { value: 'all', label: t('adminDigiBridgeStudents.filters.allStatuses') },
    { value: 'active', label: t('adminDigiBridgeStudents.filters.active') },
    { value: 'inactive', label: t('adminDigiBridgeStudents.filters.inactive') },
    { value: 'suspended', label: t('adminDigiBridgeStudents.filters.suspended') }
  ];

  const mentorOptions = [
    { value: 'all', label: t('adminDigiBridgeStudents.filters.allMentors') },
    { value: 'with-mentor', label: t('adminDigiBridgeStudents.filters.withMentor') },
    { value: 'without-mentor', label: t('adminDigiBridgeStudents.filters.withoutMentor') }
  ];

  const sortOptions = [
    { value: 'newest', label: t('adminDigiBridgeStudents.filters.newest') },
    { value: 'oldest', label: t('adminDigiBridgeStudents.filters.oldest') },
    { value: 'name-asc', label: t('adminDigiBridgeStudents.filters.nameAsc') },
    { value: 'name-desc', label: t('adminDigiBridgeStudents.filters.nameDesc') },
    { value: 'credits-high', label: t('adminDigiBridgeStudents.filters.creditsHigh') },
    { value: 'credits-low', label: t('adminDigiBridgeStudents.filters.creditsLow') }
  ];

  const handleClearFilters = () => {
    onFilterChange({
      search: '',
      status: 'all',
      mentorId: 'all',
      sortBy: 'newest'
    });
  };

  const hasActiveFilters = 
    filters.search !== '' || 
    filters.status !== 'all' || 
    filters.mentorId !== 'all' || 
    filters.sortBy !== 'newest';

  return (
    <div className="adminDgStudentsFilters-container">
      {/* Search Bar + Toggle */}
      <div className="adminDgStudentsFilters-top">
        <div className="adminDgStudentsFilters-searchWrapper">
          <svg className="adminDgStudentsFilters-searchIcon" width="18" height="18" viewBox="0 0 18 18">
            <path 
              d="M12.5 11h-.79l-.28-.27A6.471 6.471 0 0 0 13 6.5 6.5 6.5 0 1 0 6.5 13c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L17.49 16l-4.99-5zm-6 0C4.01 11 2 8.99 2 6.5S4.01 2 6.5 2 11 4.01 11 6.5 8.99 11 6.5 11z" 
              fill="currentColor"
            />
          </svg>
          <input
            type="text"
            className="adminDgStudentsFilters-searchInput"
            placeholder={t('adminDigiBridgeStudents.filters.searchPlaceholder')}
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
          />
          {filters.search && (
            <button
              className="adminDgStudentsFilters-clearSearch"
              onClick={() => onFilterChange({ search: '' })}
              type="button"
            >
              <svg width="14" height="14" viewBox="0 0 14 14">
                <path d="M14 1.41L12.59 0L7 5.59L1.41 0L0 1.41L5.59 7L0 12.59L1.41 14L7 8.41L12.59 14L14 12.59L8.41 7L14 1.41Z" fill="currentColor"/>
              </svg>
            </button>
          )}
        </div>

        <button
          className={`adminDgStudentsFilters-toggleBtn ${showFilters ? 'adminDgStudentsFilters-toggleBtn--active' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
          type="button"
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path d="M7 12h4v-2H7v2zm-4-5h12V5H3v2zm6 9h2v-2H9v2zM1 3v2h16V3H1z" fill="currentColor"/>
          </svg>
          <span className="adminDgStudentsFilters-toggleText">{t('adminDigiBridgeStudents.filters.filters')}</span>
          {hasActiveFilters && <span className="adminDgStudentsFilters-filterBadge"></span>}
        </button>
      </div>

      {/* Filters Panel */}
      <div className={`adminDgStudentsFilters-panel ${showFilters ? 'adminDgStudentsFilters-panel--open' : ''}`}>
        <div className="adminDgStudentsFilters-grid">
          {/* Status Filter */}
          <div className="adminDgStudentsFilters-filterGroup">
            <label className="adminDgStudentsFilters-filterLabel">
              {t('adminDigiBridgeStudents.filters.status')}
            </label>
            <select
              className="adminDgStudentsFilters-filterSelect"
              value={filters.status}
              onChange={(e) => onFilterChange({ status: e.target.value })}
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Mentor Filter */}
          <div className="adminDgStudentsFilters-filterGroup">
            <label className="adminDgStudentsFilters-filterLabel">
              {t('adminDigiBridgeStudents.filters.mentor')}
            </label>
            <select
              className="adminDgStudentsFilters-filterSelect"
              value={filters.mentorId}
              onChange={(e) => onFilterChange({ mentorId: e.target.value })}
            >
              {mentorOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Filter */}
          <div className="adminDgStudentsFilters-filterGroup">
            <label className="adminDgStudentsFilters-filterLabel">
              {t('adminDigiBridgeStudents.filters.sortBy')}
            </label>
            <select
              className="adminDgStudentsFilters-filterSelect"
              value={filters.sortBy}
              onChange={(e) => onFilterChange({ sortBy: e.target.value })}
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Button */}
          {hasActiveFilters && (
            <div className="adminDgStudentsFilters-filterGroup adminDgStudentsFilters-filterActions">
              <button
                className="adminDgStudentsFilters-clearFiltersBtn"
                onClick={handleClearFilters}
                type="button"
              >
                <svg width="16" height="16" viewBox="0 0 16 16">
                  <path d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm4 10.9L10.9 12 8 9.1 5.1 12 4 10.9 6.9 8 4 5.1 5.1 4 8 6.9 10.9 4 12 5.1 9.1 8 12 10.9z" fill="currentColor"/>
                </svg>
                {t('adminDigiBridgeStudents.filters.clearAll')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="adminDgStudentsFilters-results">
        <span className="adminDgStudentsFilters-resultsCount">
          {t('adminDigiBridgeStudents.filters.showing')} <strong>{totalResults}</strong> {t('adminDigiBridgeStudents.filters.students')}
        </span>
      </div>
    </div>
  );
};