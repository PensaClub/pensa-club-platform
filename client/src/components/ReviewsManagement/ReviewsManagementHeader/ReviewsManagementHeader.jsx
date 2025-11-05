// src/components/ReviewsManagement/ReviewsManagementHeader/ReviewsManagementHeader.jsx

import React from 'react';
import { useTranslation } from 'react-i18next';
import './reviewsManagementHeader.css';

export const ReviewsManagementHeader = ({ filters, onFilterChange }) => {
  const { t } = useTranslation();

  return (
    <div className="reviews-management-pensa-club-header">
      <div className="reviews-management-pensa-club-header-container">
        
        {/* Search Bar */}
        <div className="reviews-management-pensa-club-header-search">
          <div className="reviews-management-pensa-club-header-search-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>
          <input
            type="text"
            className="reviews-management-pensa-club-header-search-input"
            placeholder={t('headerReviewsManagement.searchReviews')}
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
          />
          {filters.search && (
            <button
              className="reviews-management-pensa-club-header-search-clear"
              onClick={() => onFilterChange('search', '')}
              aria-label="Clear search"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="reviews-management-pensa-club-header-filters">
          
          {/* Status Filter */}
          <div className="reviews-management-pensa-club-header-filter-group">
            <label className="reviews-management-pensa-club-header-filter-label">
              {t('headerReviewsManagement.filterByStatus')}
            </label>
            <select
              className="reviews-management-pensa-club-header-filter-select"
              value={filters.status}
              onChange={(e) => onFilterChange('status', e.target.value)}
            >
              <option value="all">{t('headerReviewsManagement.allReviews')}</option>
              <option value="pending">{t('headerReviewsManagement.pendingReviews')}</option>
              <option value="approved">{t('headerReviewsManagement.approvedReviews')}</option>
              <option value="rejected">{t('headerReviewsManagement.rejectedReviews')}</option>
            </select>
          </div>

          {/* Type Filter */}
          <div className="reviews-management-pensa-club-header-filter-group">
            <label className="reviews-management-pensa-club-header-filter-label">
              {t('headerReviewsManagement.filterByType')}
            </label>
            <select
              className="reviews-management-pensa-club-header-filter-select"
              value={filters.type}
              onChange={(e) => onFilterChange('type', e.target.value)}
            >
              <option value="all">{t('headerReviewsManagement.allTypes')}</option>
              <option value="academy">{t('headerReviewsManagement.academyReviews')}</option>
              <option value="mentor">{t('headerReviewsManagement.mentorReviews')}</option>
              <option value="course">{t('headerReviewsManagement.courseReviews')}</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          {(filters.status !== 'all' || filters.type !== 'all' || filters.search) && (
            <button
              className="reviews-management-pensa-club-header-clear-filters"
              onClick={() => {
                onFilterChange('status', 'all');
                onFilterChange('type', 'all');
                onFilterChange('search', '');
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              {t('headerReviewsManagement.clearFilters')}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};