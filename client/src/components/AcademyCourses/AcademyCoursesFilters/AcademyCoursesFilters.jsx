// src/components/AcademyCourses/AcademyCoursesFilters/AcademyCoursesFilters.jsx

import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './academyCoursesFilters.css';

export const AcademyCoursesFilters = ({ 
  categories = [], 
  filters, 
  onFilterChange, 
  onSearch 
}) => {
  const { t } = useTranslation('academy');
  const [searchValue, setSearchValue] = useState(filters.search || '');

  // Синхронизирай searchValue когато filters.search се промени отвън (напр. при clear)
  useEffect(() => {
    setSearchValue(filters.search || '');
  }, [filters.search]);

  const levels = [
    { value: 'beginner', label: t('academyCoursesFilters.levels.beginner') },
    { value: 'intermediate', label: t('academyCoursesFilters.levels.intermediate') },
    { value: 'advanced', label: t('academyCoursesFilters.levels.advanced') }
  ];

  const sortOptions = [
    { value: 'popular', label: t('academyCoursesFilters.sort.popular') },
    { value: 'newest', label: t('academyCoursesFilters.sort.newest') },
    { value: 'alphabetical', label: t('academyCoursesFilters.sort.alphabetical') }
  ];

  // Real-time търсене при писане
  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    setSearchValue(value);
    onSearch(value);
  }, [onSearch]);

  const handleSearchKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      onSearch(searchValue);
    }
  }, [searchValue, onSearch]);

  const clearSearch = useCallback(() => {
    setSearchValue('');
    onSearch('');
  }, [onSearch]);

  const hasActiveFilters = filters.category || filters.level || filters.search;

  const clearAllFilters = useCallback(() => {
    setSearchValue('');
    onFilterChange('category', '');
    onFilterChange('level', '');
    onFilterChange('sort', 'popular');
    onSearch('');
  }, [onFilterChange, onSearch]);

  // Normalize category data
  const normalizeCategory = (cat, index) => {
    if (typeof cat === 'string') {
      return { slug: cat, name: cat, id: index };
    }
    return {
      slug: cat.slug || cat.id || cat.name || index,
      name: cat.name || cat.title || cat.slug || 'Unknown',
      id: cat.id || index
    };
  };

  const normalizedCategories = categories.map(normalizeCategory);

  return (
    <div className="academyCoursesFilters">
      <div className="academyCoursesFilters-card">
        <div className="academyCoursesFilters-container">
          {/* Search */}
          <div className="academyCoursesFilters-search">
            <div className="academyCoursesFilters-search-wrapper">
              <div className="academyCoursesFilters-search-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </div>
              <input
                type="text"
                className="academyCoursesFilters-search-input"
                placeholder={t('academyCoursesFilters.searchPlaceholder')}
                value={searchValue}
                onChange={handleSearchChange}
                onKeyDown={handleSearchKeyDown}
              />
              {searchValue && (
                <button 
                  className="academyCoursesFilters-search-clear"
                  onClick={clearSearch}
                  aria-label={t('academyCoursesFilters.clearSearch')}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Filters Row */}
          <div className="academyCoursesFilters-row">
            {/* Category Filter */}
            {normalizedCategories.length > 0 && (
              <div className="academyCoursesFilters-item" data-type="category">
                <div className="academyCoursesFilters-item-inner">
                  <div className="academyCoursesFilters-item-content">
                    <div className="academyCoursesFilters-item-icon">📁</div>
                    <div className="academyCoursesFilters-select-box">
                      <span className="academyCoursesFilters-select-label">
                        {t('academyCoursesFilters.categoryLabel')}
                      </span>
                      <select
                        className="academyCoursesFilters-select"
                        value={filters.category || ''}
                        onChange={(e) => onFilterChange('category', e.target.value)}
                      >
                        <option value="">{t('academyCoursesFilters.allCategories')}</option>
                        {normalizedCategories.map(cat => (
                          <option key={cat.id} value={cat.slug}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                      <div className="academyCoursesFilters-select-arrow">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Level Filter */}
            <div className="academyCoursesFilters-item" data-type="level">
              <div className="academyCoursesFilters-item-inner">
                <div className="academyCoursesFilters-item-content">
                  <div className="academyCoursesFilters-item-icon">📊</div>
                  <div className="academyCoursesFilters-select-box">
                    <span className="academyCoursesFilters-select-label">
                      {t('academyCoursesFilters.levelLabel')}
                    </span>
                    <select
                      className="academyCoursesFilters-select"
                      value={filters.level || ''}
                      onChange={(e) => onFilterChange('level', e.target.value)}
                    >
                      <option value="">{t('academyCoursesFilters.allLevels')}</option>
                      {levels.map(level => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                    <div className="academyCoursesFilters-select-arrow">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sort */}
            <div className="academyCoursesFilters-item" data-type="sort">
              <div className="academyCoursesFilters-item-inner">
                <div className="academyCoursesFilters-item-content">
                  <div className="academyCoursesFilters-item-icon">🔄</div>
                  <div className="academyCoursesFilters-select-box">
                    <span className="academyCoursesFilters-select-label">
                      {t('academyCoursesFilters.sortLabel')}
                    </span>
                    <select
                      className="academyCoursesFilters-select"
                      value={filters.sort || 'popular'}
                      onChange={(e) => onFilterChange('sort', e.target.value)}
                    >
                      {sortOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <div className="academyCoursesFilters-select-arrow">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button 
                className="academyCoursesFilters-clear"
                onClick={clearAllFilters}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
                {t('academyCoursesFilters.clearAll')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};