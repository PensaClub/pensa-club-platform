
import React, { useState } from 'react';
import './InitiativesSearchAdmin.css';
import { useTranslation } from 'react-i18next';

export const InitiativesSearchAdmin = ({ onSearch, onFilterChange, totalCount }) => {
  const { t } = useTranslation();
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
    <div className="initiatives-search-container">
      <div className="search-header">
        <h2 className="search-title">Инициативи</h2>
        <div className="search-count">
          <span className="count-number">{totalCount}</span>
          <span className="count-text">общо инициативи</span>
        </div>
      </div>

      <div className="search-controls">
        <div className="search-input-wrapper">
          <svg className="search-icon" viewBox="0 0 24 24" fill="none">
            <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" 
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Търси по заглавие, автор или ключови думи..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          {searchTerm && (
            <button 
              className="clear-search"
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

        <div className="search-filters">
          <select 
            className="filter-select status-filter"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="all">Всички статуси</option>
            <option value="published">Публикувани</option>
            <option value="draft">Чернови</option>
            <option value="archived">Архивирани</option>
          </select>

          <select 
            className="filter-select sort-filter"
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
          >
            <option value="newest">Най-нови</option>
            <option value="oldest">Най-стари</option>
            <option value="mostViewed">Най-гледани</option>
            <option value="mostLiked">Най-харесвани</option>
          </select>
        </div>
      </div>
    </div>
  );
};