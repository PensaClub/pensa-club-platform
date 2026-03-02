// src/components/AdminDigiBridgeStudents/AdminDgStudentsFilters/AdminDgStudentsFilters.jsx

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAcademy } from '../../contexts/AcademyProvider';
import './adminDgStudentsFilters.css';

export const AdminDgStudentsFilters = ({ filters, onFilterChange, totalResults }) => {
  const { t } = useTranslation('digibridge-students');
  const { getApprovedMentors } = useAcademy();

  const [mentors, setMentors] = useState([]);
  const [loadingMentors, setLoadingMentors] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Fetch mentors for filter dropdown
  useEffect(() => {
    const fetchMentors = async () => {
      setLoadingMentors(true);
      try {
        const data = await getApprovedMentors();
        setMentors(Array.isArray(data) ? data : data?.mentors || []);
      } catch (error) {
        console.error('Error fetching mentors:', error);
        setMentors([]);
      } finally {
        setLoadingMentors(false);
      }
    };

    fetchMentors();
  }, [getApprovedMentors]);

  // Handle search input
  const handleSearchChange = useCallback((e) => {
    onFilterChange({ search: e.target.value });
  }, [onFilterChange]);

  // Handle status filter
  const handleStatusChange = useCallback((e) => {
    onFilterChange({ status: e.target.value });
  }, [onFilterChange]);

  // Handle mentor filter
  const handleMentorChange = useCallback((e) => {
    onFilterChange({ mentorId: e.target.value });
  }, [onFilterChange]);

  // Handle sort change
  const handleSortChange = useCallback((e) => {
    onFilterChange({ sortBy: e.target.value });
  }, [onFilterChange]);

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    onFilterChange({
      search: '',
      status: 'all',
      mentorId: '',
      sortBy: 'newest'
    });
  }, [onFilterChange]);

  // Check if any filter is active
  const hasActiveFilters = 
    filters.search || 
    filters.status !== 'all' || 
    filters.mentorId || 
    filters.sortBy !== 'newest';

  // Count active filters
  const activeFilterCount = [
    filters.search,
    filters.status !== 'all',
    filters.mentorId,
    filters.sortBy !== 'newest'
  ].filter(Boolean).length;

  return (
    <div className="adminDgStudentsFilters">
      {/* Search Bar - Always Visible */}
      <div className="adminDgStudentsFilters-searchRow">
        <div className="adminDgStudentsFilters-searchWrapper">
          <svg className="adminDgStudentsFilters-searchIcon" width="20" height="20" viewBox="0 0 20 20">
            <path d="M14.5 13h-.79l-.28-.27C14.41 11.59 15 10.11 15 8.5 15 4.91 12.09 2 8.5 2S2 4.91 2 8.5 4.91 15 8.5 15c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L19.49 18l-4.99-5zm-6 0C6.01 13 4 10.99 4 8.5S6.01 4 8.5 4 13 6.01 13 8.5 10.99 13 8.5 13z" fill="currentColor"/>
          </svg>
          <input
            type="text"
            className="adminDgStudentsFilters-searchInput"
            placeholder={t('adminDgStudentsFilters.searchPlaceholder')}
            value={filters.search || ''}
            onChange={handleSearchChange}
          />
          {filters.search && (
            <button
              className="adminDgStudentsFilters-clearSearch"
              onClick={() => onFilterChange({ search: '' })}
              type="button"
              aria-label="Clear search"
            >
              <svg width="16" height="16" viewBox="0 0 16 16">
                <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="2" fill="none"/>
              </svg>
            </button>
          )}
        </div>

        {/* Toggle Filters Button - Mobile */}
        <button
          className={`adminDgStudentsFilters-toggleBtn ${isExpanded ? 'adminDgStudentsFilters-toggleBtn--active' : ''}`}
          onClick={() => setIsExpanded(!isExpanded)}
          type="button"
        >
          <svg width="20" height="20" viewBox="0 0 20 20">
            <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
          </svg>
          <span>{t('adminDgStudentsFilters.filters')}</span>
          {activeFilterCount > 0 && (
            <span className="adminDgStudentsFilters-badge">{activeFilterCount}</span>
          )}
        </button>
      </div>

      {/* Filters Row - Expandable on Mobile */}
      <div className={`adminDgStudentsFilters-filtersRow ${isExpanded ? 'adminDgStudentsFilters-filtersRow--expanded' : ''}`}>
        {/* Status Filter */}
        <div className="adminDgStudentsFilters-filterGroup">
          <label className="adminDgStudentsFilters-label">
            {t('adminDgStudentsFilters.status')}
          </label>
          <select
            className="adminDgStudentsFilters-select"
            value={filters.status || 'all'}
            onChange={handleStatusChange}
          >
            <option value="all">{t('adminDgStudentsFilters.statusOptions.all')}</option>
            <option value="active">{t('adminDgStudentsFilters.statusOptions.active')}</option>
            <option value="inactive">{t('adminDgStudentsFilters.statusOptions.inactive')}</option>
            <option value="suspended">{t('adminDgStudentsFilters.statusOptions.suspended')}</option>
          </select>
        </div>

        {/* Mentor Filter */}
        <div className="adminDgStudentsFilters-filterGroup">
          <label className="adminDgStudentsFilters-label">
            {t('adminDgStudentsFilters.mentor')}
          </label>
          <select
            className="adminDgStudentsFilters-select"
            value={filters.mentorId || ''}
            onChange={handleMentorChange}
            disabled={loadingMentors}
          >
            <option value="">{t('adminDgStudentsFilters.allMentors')}</option>
            <option value="none">{t('adminDgStudentsFilters.noMentor')}</option>
            {mentors.map((mentor) => (
              <option key={mentor.id} value={mentor.id}>
                {mentor.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sort By */}
        <div className="adminDgStudentsFilters-filterGroup">
          <label className="adminDgStudentsFilters-label">
            {t('adminDgStudentsFilters.sortBy')}
          </label>
          <select
            className="adminDgStudentsFilters-select"
            value={filters.sortBy || 'newest'}
            onChange={handleSortChange}
          >
            <option value="newest">{t('adminDgStudentsFilters.sortOptions.newest')}</option>
            <option value="oldest">{t('adminDgStudentsFilters.sortOptions.oldest')}</option>
            <option value="name">{t('adminDgStudentsFilters.sortOptions.name')}</option>
            <option value="credits">{t('adminDgStudentsFilters.sortOptions.credits')}</option>
            <option value="attendance">{t('adminDgStudentsFilters.sortOptions.attendance')}</option>
          </select>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            className="adminDgStudentsFilters-clearBtn"
            onClick={handleClearFilters}
            type="button"
          >
            <svg width="16" height="16" viewBox="0 0 16 16">
              <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="2" fill="none"/>
            </svg>
            {t('adminDgStudentsFilters.clearAll')}
          </button>
        )}
      </div>

      {/* Results Count */}
      <div className="adminDgStudentsFilters-results">
        <span className="adminDgStudentsFilters-resultsText">
          {totalResults !== undefined && (
            <>
              <strong>{totalResults}</strong> {t('adminDgStudentsFilters.studentsFound')}
            </>
          )}
        </span>
        
        {/* Active Filters Tags */}
        {hasActiveFilters && (
          <div className="adminDgStudentsFilters-activeTags">
            {filters.status && filters.status !== 'all' && (
              <span className="adminDgStudentsFilters-tag adminDgStudentsFilters-tag--status">
                {t(`adminDgStudentsFilters.statusOptions.${filters.status}`)}
                <button
                  onClick={() => onFilterChange({ status: 'all' })}
                  type="button"
                  aria-label="Remove filter"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12">
                    <path d="M9 3L3 9M3 3l6 6" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  </svg>
                </button>
              </span>
            )}
            {filters.mentorId && (
              <span className="adminDgStudentsFilters-tag adminDgStudentsFilters-tag--mentor">
                {filters.mentorId === 'none' 
                  ? t('adminDgStudentsFilters.noMentor')
                  : mentors.find(m => m.id === filters.mentorId)?.name || t('adminDgStudentsFilters.mentor')
                }
                <button
                  onClick={() => onFilterChange({ mentorId: '' })}
                  type="button"
                  aria-label="Remove filter"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12">
                    <path d="M9 3L3 9M3 3l6 6" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  </svg>
                </button>
              </span>
            )}
            {filters.sortBy && filters.sortBy !== 'newest' && (
              <span className="adminDgStudentsFilters-tag adminDgStudentsFilters-tag--sort">
                {t(`adminDgStudentsFilters.sortOptions.${filters.sortBy}`)}
                <button
                  onClick={() => onFilterChange({ sortBy: 'newest' })}
                  type="button"
                  aria-label="Remove filter"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12">
                    <path d="M9 3L3 9M3 3l6 6" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  </svg>
                </button>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};