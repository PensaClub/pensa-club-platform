// src/components/AcademyCourses/AcademyCoursesList/AcademyCoursesList.jsx

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './academyCoursesList.css';
import { AcademyCourseCard } from '../AcademyCourseCard/AcademyCourseCard';

// Debounce hook
const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  
  return debouncedValue;
};

export const AcademyCoursesList = ({ 
  program = null, 
  courses = [], 
  onClose = null,
  showViewAll = false 
}) => {
  const { t } = useTranslation();
  const [filter, setFilter] = useState('all');
  const [searchValue, setSearchValue] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [showSortMenu, setShowSortMenu] = useState(false);
  
  // Debounce search for better performance
  const debouncedSearch = useDebounce(searchValue, 300);

  // Helper to get course level
  const getCourseLevel = (course) => {
    return course.difficultyLevel || course.level || 'beginner';
  };

  // Filter options
  const filters = [
    { value: 'all', label: t('academyCoursesList.filters.all') },
    { value: 'beginner', label: t('academyCoursesList.filters.beginner') },
    { value: 'intermediate', label: t('academyCoursesList.filters.intermediate') },
    { value: 'advanced', label: t('academyCoursesList.filters.advanced') }
  ];

  // Sort options
  const sortOptions = [
    { value: 'popular', label: t('academyCoursesList.sort.popular'), icon: '🔥' },
    { value: 'newest', label: t('academyCoursesList.sort.newest'), icon: '✨' },
    { value: 'alphabetical', label: t('academyCoursesList.sort.alphabetical'), icon: '🔤' },
    { value: 'rating', label: t('academyCoursesList.sort.rating'), icon: '⭐' },
    { value: 'duration', label: t('academyCoursesList.sort.duration'), icon: '⏱️' }
  ];

  // Get current sort label
  const currentSortLabel = sortOptions.find(s => s.value === sortBy)?.label || sortOptions[0].label;

  // Filtered and sorted courses
  const filteredCourses = useMemo(() => {
    let result = [...courses];

    // Filter by level
    if (filter !== 'all') {
      result = result.filter(course => getCourseLevel(course) === filter);
    }

    // Filter by search
    if (debouncedSearch.trim()) {
      const searchLower = debouncedSearch.toLowerCase().trim();
      result = result.filter(course => {
        const name = (course.name || '').toLowerCase();
        const description = (course.shortDescription || course.description || '').toLowerCase();
        const category = (course.category || '').toLowerCase();
        const tags = (course.tags || []).join(' ').toLowerCase();
        return name.includes(searchLower) || 
               description.includes(searchLower) || 
               category.includes(searchLower) ||
               tags.includes(searchLower);
      });
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
      case 'alphabetical':
        result.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'bg'));
        break;
      case 'rating':
        result.sort((a, b) => (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0));
        break;
      case 'duration':
        result.sort((a, b) => (a.estimatedHours || 0) - (b.estimatedHours || 0));
        break;
      case 'popular':
      default:
        result.sort((a, b) => (b.enrolledCount || 0) - (a.enrolledCount || 0));
        break;
    }

    return result;
  }, [courses, filter, debouncedSearch, sortBy]);

  // Get count for each filter
  const getFilterCount = useCallback((filterValue) => {
    let result = [...courses];
    
    if (debouncedSearch.trim()) {
      const searchLower = debouncedSearch.toLowerCase().trim();
      result = result.filter(course => {
        const name = (course.name || '').toLowerCase();
        const description = (course.shortDescription || course.description || '').toLowerCase();
        const category = (course.category || '').toLowerCase();
        const tags = (course.tags || []).join(' ').toLowerCase();
        return name.includes(searchLower) || 
               description.includes(searchLower) || 
               category.includes(searchLower) ||
               tags.includes(searchLower);
      });
    }

    if (filterValue === 'all') return result.length;
    return result.filter(course => getCourseLevel(course) === filterValue).length;
  }, [courses, debouncedSearch]);

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    setFilter('all');
    setSearchValue('');
    setSortBy('popular');
  }, []);

  // Close sort menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.academyCoursesList-sort')) {
        setShowSortMenu(false);
      }
    };
    
    if (showSortMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showSortMenu]);

  const hasActiveFilters = filter !== 'all' || debouncedSearch.trim() || sortBy !== 'popular';
  const isSearching = searchValue !== debouncedSearch;

  return (
    <div 
      className="academyCoursesList"
      style={program ? { '--accent-color': program.primary } : {}}
    >
      {/* Header (only if program is selected) */}
      {program && (
        <div className="academyCoursesList-header">
          <div className="academyCoursesList-header-info">
            <div 
              className="academyCoursesList-header-icon"
              style={{ background: program.gradient }}
            >
              {program.icon}
            </div>
            <div className="academyCoursesList-header-text">
              <h3 className="academyCoursesList-header-title">{program.name}</h3>
              <p className="academyCoursesList-header-count">
                {courses.length} {courses.length === 1 
                  ? t('academyCoursesList.course') 
                  : t('academyCoursesList.courses')
                }
              </p>
            </div>
          </div>

          <button 
            className="academyCoursesList-header-close"
            onClick={onClose}
            aria-label={t('academyCoursesList.close')}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Filters Row */}
      <div className="academyCoursesList-filters">
        <div className="academyCoursesList-filters-left">
          {/* Level Pills */}
          <div className="academyCoursesList-filters-pills">
            {filters.map(f => {
              const count = getFilterCount(f.value);
              if (f.value !== 'all' && count === 0) return null;
              
              return (
                <button
                  key={f.value}
                  className={`academyCoursesList-filter ${filter === f.value ? 'is-active' : ''}`}
                  onClick={() => setFilter(f.value)}
                >
                  {f.label}
                  {f.value !== 'all' && (
                    <span className="academyCoursesList-filter-count">{count}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Sort Dropdown */}
          <div className="academyCoursesList-sort">
            <button 
              className="academyCoursesList-sort-trigger"
              onClick={() => setShowSortMenu(!showSortMenu)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M6 12h12M9 18h6" />
              </svg>
              {currentSortLabel}
              <svg 
                className={`academyCoursesList-sort-arrow ${showSortMenu ? 'is-open' : ''}`}
                width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            
            {showSortMenu && (
              <div className="academyCoursesList-sort-menu">
                {sortOptions.map(option => (
                  <button
                    key={option.value}
                    className={`academyCoursesList-sort-option ${sortBy === option.value ? 'is-active' : ''}`}
                    onClick={() => {
                      setSortBy(option.value);
                      setShowSortMenu(false);
                    }}
                  >
                    <span className="academyCoursesList-sort-option-icon">{option.icon}</span>
                    {option.label}
                    {sortBy === option.value && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Search */}
        <div className={`academyCoursesList-search ${isSearching ? 'is-searching' : ''}`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input 
            type="text" 
            placeholder={t('academyCoursesList.searchPlaceholder')}
            className="academyCoursesList-search-input"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
          {isSearching && (
            <div className="academyCoursesList-search-spinner" />
          )}
          {searchValue && !isSearching && (
            <button 
              className="academyCoursesList-search-clear"
              onClick={() => setSearchValue('')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Results Info */}
      <div className="academyCoursesList-results">
        <span className="academyCoursesList-results-count">
          {filteredCourses.length} {filteredCourses.length === 1 
            ? t('academyCoursesList.resultSingle') 
            : t('academyCoursesList.resultPlural')
          }
        </span>
        
        {/* Active Filters Tags */}
        {hasActiveFilters && (
          <div className="academyCoursesList-results-tags">
            {filter !== 'all' && (
              <span className="academyCoursesList-results-tag">
                {filters.find(f => f.value === filter)?.label}
                <button onClick={() => setFilter('all')}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
            {debouncedSearch && (
              <span className="academyCoursesList-results-tag">
                "{debouncedSearch}"
                <button onClick={() => setSearchValue('')}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
            {sortBy !== 'popular' && (
              <span className="academyCoursesList-results-tag">
                {sortOptions.find(s => s.value === sortBy)?.icon} {currentSortLabel}
                <button onClick={() => setSortBy('popular')}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
            <button 
              className="academyCoursesList-results-clear"
              onClick={handleClearFilters}
            >
              {t('academyCoursesList.clearAll')}
            </button>
          </div>
        )}
      </div>

      {/* Courses Grid */}
      {filteredCourses.length > 0 ? (
        <div className="academyCoursesList-grid">
          {filteredCourses.map((course, index) => (
            <AcademyCourseCard 
              key={course.id || index}
              course={course}
              accentColor={program?.primary || '#ff6347'}
              index={index}
            />
          ))}
        </div>
      ) : (
        <div className="academyCoursesList-empty">
          <div className="academyCoursesList-empty-icon">🔍</div>
          <h4 className="academyCoursesList-empty-title">
            {t('academyCoursesList.noResultsTitle')}
          </h4>
          <p className="academyCoursesList-empty-text">
            {t('academyCoursesList.noResultsText')}
          </p>
          {hasActiveFilters && (
            <button 
              className="academyCoursesList-empty-reset"
              onClick={handleClearFilters}
            >
              {t('academyCoursesList.resetFilter')}
            </button>
          )}
        </div>
      )}

      {/* View All Button */}
      {showViewAll && filteredCourses.length > 0 && (
        <div className="academyCoursesList-viewAll">
          <button className="academyCoursesList-viewAll-btn">
            {t('academyCoursesList.viewAllCourses')}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};