// src/components/AdminDigiBridgeMentors/AdminDigiBridgeMentorFilters/AdminDigiBridgeMentorFilters.jsx

import React from 'react';
import { useTranslation } from 'react-i18next';
import './adminDigiBridgeMentorFilters.css';

export const AdminDigiBridgeMentorFilters = ({ filters, setFilters, mentorsCount }) => {
  const { t } = useTranslation('digibridge');

  const specializations = [
    { value: 'all', label: t('AdminDigiBridgeMentors.Filters.allSpecializations') },
    { value: 'Digital Security', label: t('AdminDigiBridgeMentors.Filters.digitalSecurity') },
    { value: 'Media Literacy', label: t('AdminDigiBridgeMentors.Filters.mediaLiteracy') },
    { value: 'Social Media', label: t('AdminDigiBridgeMentors.Filters.socialMedia') },
    { value: 'Online Banking', label: t('AdminDigiBridgeMentors.Filters.onlineBanking') },
    { value: 'Basic Computer Skills', label: t('AdminDigiBridgeMentors.Filters.basicSkills') }
  ];

  const statuses = [
    { value: 'all', label: t('AdminDigiBridgeMentors.Filters.allStatuses') },
    { value: 'online', label: t('AdminDigiBridgeMentors.Filters.online') },
    { value: 'offline', label: t('AdminDigiBridgeMentors.Filters.offline') }
  ];

  const sortOptions = [
    { value: 'name', label: t('AdminDigiBridgeMentors.Filters.sortByName') },
    { value: 'students', label: t('AdminDigiBridgeMentors.Filters.sortByStudents') },
    { value: 'rating', label: t('AdminDigiBridgeMentors.Filters.sortByRating') },
    { value: 'date', label: t('AdminDigiBridgeMentors.Filters.sortByDate') }
  ];

  const handleSearchChange = (e) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
  };

  const handleSpecializationChange = (e) => {
    setFilters(prev => ({ ...prev, specialization: e.target.value }));
  };

  const handleStatusChange = (e) => {
    setFilters(prev => ({ ...prev, status: e.target.value }));
  };

  const handleSortChange = (e) => {
    setFilters(prev => ({ ...prev, sortBy: e.target.value }));
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      specialization: 'all',
      status: 'all',
      sortBy: 'name'
    });
  };

  const hasActiveFilters = 
    filters.search !== '' || 
    filters.specialization !== 'all' || 
    filters.status !== 'all' || 
    filters.sortBy !== 'name';

  return (
    <div className="admin-digibridge-mentor-filters">
      
      <div className="admin-digibridge-mentor-filters-container">
        
        {/* SEARCH */}
        <div className="admin-digibridge-mentor-filters-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder={t('AdminDigiBridgeMentors.Filters.searchPlaceholder')}
            value={filters.search}
            onChange={handleSearchChange}
          />
          {filters.search && (
            <button 
              className="admin-digibridge-mentor-filters-clear-search"
              onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>

        {/* SPECIALIZATION */}
        <div className="admin-digibridge-mentor-filters-select-wrapper">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
          <select 
            value={filters.specialization} 
            onChange={handleSpecializationChange}
            className="admin-digibridge-mentor-filters-select"
          >
            {specializations.map(spec => (
              <option key={spec.value} value={spec.value}>
                {spec.label}
              </option>
            ))}
          </select>
        </div>

        {/* STATUS */}
        <div className="admin-digibridge-mentor-filters-select-wrapper">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2"/>
          </svg>
          <select 
            value={filters.status} 
            onChange={handleStatusChange}
            className="admin-digibridge-mentor-filters-select"
          >
            {statuses.map(status => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        {/* SORT */}
        <div className="admin-digibridge-mentor-filters-select-wrapper">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="4" y1="6" x2="16" y2="6"/>
            <line x1="4" y1="12" x2="13" y2="12"/>
            <line x1="4" y1="18" x2="10" y2="18"/>
          </svg>
          <select 
            value={filters.sortBy} 
            onChange={handleSortChange}
            className="admin-digibridge-mentor-filters-select"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* CLEAR FILTERS */}
        {hasActiveFilters && (
          <button 
            className="admin-digibridge-mentor-filters-clear-btn"
            onClick={handleClearFilters}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            {t('AdminDigiBridgeMentors.Filters.clearFilters')}
          </button>
        )}

      </div>

      {/* RESULTS COUNT */}
      <div className="admin-digibridge-mentor-filters-results">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="8.5" cy="7" r="4"/>
          <polyline points="17 11 19 13 23 9"/>
        </svg>
        <span>
          {t('AdminDigiBridgeMentors.Filters.resultsCount', { count: mentorsCount })}
        </span>
      </div>

    </div>
  );
};