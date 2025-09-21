import React from 'react';
import { useTranslation } from 'react-i18next';
import './publicationStoriesFilters.css';

export const PublicationStoriesFilters = ({
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  selectedCategory,
  setSelectedCategory,
  contentCount,
  contentType = 'stories'
}) => {
  const { t } = useTranslation();

  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'oldest', label: 'Oldest' },
    { value: 'mostViewed', label: 'Most Viewed' },
    { value: 'alphabetical', label: 'A-Z' }
  ];

  return (
    <div className="ps-filters-new">
      <div className="ps-filters-group">
        {/* Results Count */}
        <div className="ps-results-badge">
          {contentCount}
        </div>

        {/* Sort Dropdown */}
        <select
          className="ps-filter-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          {sortOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* View Toggle */}
        <div className="ps-view-toggle">
          <button
            className={`ps-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            title="Grid View"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
              <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
              <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
              <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </button>
          <button
            className={`ps-view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            title="List View"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <line x1="8" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2"/>
              <line x1="8" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2"/>
              <line x1="8" y1="18" x2="21" y2="18" stroke="currentColor" strokeWidth="2"/>
              <line x1="3" y1="6" x2="3.01" y2="6" stroke="currentColor" strokeWidth="2"/>
              <line x1="3" y1="12" x2="3.01" y2="12" stroke="currentColor" strokeWidth="2"/>
              <line x1="3" y1="18" x2="3.01" y2="18" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
