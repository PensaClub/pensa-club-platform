// src/components/AcademyCourses/AcademyCoursesList/AcademyCoursesList.jsx

import { useState, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import './academyCoursesList.css';
import { AcademyCourseCard } from '../AcademyCourseCard/AcademyCourseCard';

// Debounce hook
const useDebounce = (value, delay = 400) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

export const AcademyCoursesList = ({
  courses = [],
  pagination = {},
  isLoading = false,
  program = null,
  onClose = null,
  // Controlled filter values (from URL)
  difficulty = '',
  search = '',
  sortBy = '',
  // Callback to update filters (updates URL in parent)
  onFilterChange
}) => {
  const { t } = useTranslation('academy');

  // Local search input (debounced before sending to parent)
  const [searchInput, setSearchInput] = useState(search || '');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const debouncedSearch = useDebounce(searchInput, 400);
  const prevDebouncedRef = useRef(search || '');
  const isInitialMount = useRef(true);

  // Sync search input when URL changes externally (back/forward, shared link)
  useEffect(() => {
    setSearchInput(search || '');
    prevDebouncedRef.current = search || '';
  }, [search]);

  // Trigger server search when debounced value changes (not on initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (debouncedSearch !== prevDebouncedRef.current) {
      prevDebouncedRef.current = debouncedSearch;
      onFilterChange({ search: debouncedSearch });
    }
  }, [debouncedSearch, onFilterChange]);

  // Current filter/sort values
  const activeFilter = difficulty || 'all';
  const activeSort = sortBy || 'popular';

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
    { value: 'name', label: t('academyCoursesList.sort.alphabetical'), icon: '🔤' },
    { value: 'rating', label: t('academyCoursesList.sort.rating'), icon: '⭐' }
  ];

  const currentSortLabel = sortOptions.find(s => s.value === activeSort)?.label || sortOptions[0].label;

  // Pagination data
  const currentPage = pagination.page || 1;
  const totalPages = pagination.totalPages || 1;
  const totalResults = pagination.total || courses.length;

  // Generate page numbers: 1 ... 3 4 5 ... 10
  const getPageNumbers = useCallback(() => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  }, [currentPage, totalPages]);

  // Handlers
  const handleFilterChange = useCallback((value) => {
    onFilterChange({ difficulty: value === 'all' ? '' : value });
  }, [onFilterChange]);

  const handleSortChange = useCallback((value) => {
    onFilterChange({ sortBy: value === 'popular' ? '' : value });
    setShowSortMenu(false);
  }, [onFilterChange]);

  const handlePageChange = useCallback((page) => {
    onFilterChange({ page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [onFilterChange]);

  const handleClearFilters = useCallback(() => {
    setSearchInput('');
    prevDebouncedRef.current = '';
    onFilterChange({ difficulty: '', search: '', sortBy: '', page: 1 });
  }, [onFilterChange]);

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

  const hasActiveFilters = activeFilter !== 'all' || searchInput.trim() || activeSort !== 'popular';
  const isSearching = searchInput !== debouncedSearch;

  return (
    <div
      className="academyCoursesList"
      style={program ? { '--accent-color': program.primary } : {}}
    >
      {/* Header (only if category is selected) */}
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
                {totalResults} {totalResults === 1
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
            {filters.map(f => (
              <button
                key={f.value}
                className={`academyCoursesList-filter ${activeFilter === f.value ? 'is-active' : ''}`}
                onClick={() => handleFilterChange(f.value)}
              >
                {f.label}
              </button>
            ))}
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
                    className={`academyCoursesList-sort-option ${activeSort === option.value ? 'is-active' : ''}`}
                    onClick={() => handleSortChange(option.value)}
                  >
                    <span className="academyCoursesList-sort-option-icon">{option.icon}</span>
                    {option.label}
                    {activeSort === option.value && (
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
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          {isSearching && (
            <div className="academyCoursesList-search-spinner" />
          )}
          {searchInput && !isSearching && (
            <button
              className="academyCoursesList-search-clear"
              onClick={() => {
                setSearchInput('');
                prevDebouncedRef.current = '';
                onFilterChange({ search: '' });
              }}
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
          {totalResults} {totalResults === 1
            ? t('academyCoursesList.resultSingle')
            : t('academyCoursesList.resultPlural')
          }
        </span>

        {/* Active Filters Tags */}
        {hasActiveFilters && (
          <div className="academyCoursesList-results-tags">
            {activeFilter !== 'all' && (
              <span className="academyCoursesList-results-tag">
                {filters.find(f => f.value === activeFilter)?.label}
                <button onClick={() => handleFilterChange('all')}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
            {searchInput && (
              <span className="academyCoursesList-results-tag">
                &quot;{searchInput}&quot;
                <button onClick={() => {
                  setSearchInput('');
                  prevDebouncedRef.current = '';
                  onFilterChange({ search: '' });
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
            {activeSort !== 'popular' && (
              <span className="academyCoursesList-results-tag">
                {sortOptions.find(s => s.value === activeSort)?.icon} {currentSortLabel}
                <button onClick={() => handleSortChange('popular')}>
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
      {isLoading ? (
        <div className="academyCoursesList-loading">
          <div className="academyCoursesList-loading-spinner">
            <div className="academyCoursesList-loading-ring"></div>
            <div className="academyCoursesList-loading-ring"></div>
            <div className="academyCoursesList-loading-ring"></div>
          </div>
          <p className="academyCoursesList-loading-text">
            {t('academyCourses.loading', 'Зареждане...')}
          </p>
        </div>
      ) : courses.length > 0 ? (
        <div className="academyCoursesList-grid">
          {courses.map((course, index) => (
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

      {/* Pagination */}
      {totalPages > 1 && !isLoading && (
        <div className="academyCoursesList-pagination">
          <button
            className="academyCoursesList-page-btn academyCoursesList-page-arrow"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>

          <div className="academyCoursesList-page-numbers">
            {getPageNumbers().map((pageNum, idx) =>
              pageNum === '...' ? (
                <span key={`dots-${idx}`} className="academyCoursesList-page-dots">...</span>
              ) : (
                <button
                  key={pageNum}
                  className={`academyCoursesList-page-btn ${currentPage === pageNum ? 'is-active' : ''}`}
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </button>
              )
            )}
          </div>

          <button
            className="academyCoursesList-page-btn academyCoursesList-page-arrow"
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};