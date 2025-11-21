// client/src/components/DigiMentorPanel/DigiMentorReviews/DigiMentorReviewsFilters/DigiMentorReviewsFilters.jsx

import { useTranslation } from 'react-i18next';
import './digiMentorReviewsFilters.css';

export const DigiMentorReviewsFilters = ({
  selectedRating,
  sortBy,
  searchQuery,
  onRatingChange,
  onSortChange,
  onSearchChange,
  totalResults
}) => {
  const { t } = useTranslation();

  const ratingFilters = [
    { value: 'all', label: t('digiMentorReviewsFilters.allRatings'), icon: '⭐' },
    { value: '5', label: t('digiMentorReviewsFilters.fiveStars'), stars: 5 },
    { value: '4', label: t('digiMentorReviewsFilters.fourStars'), stars: 4 },
    { value: '3', label: t('digiMentorReviewsFilters.threeStars'), stars: 3 },
    { value: '2', label: t('digiMentorReviewsFilters.twoStars'), stars: 2 },
    { value: '1', label: t('digiMentorReviewsFilters.oneStar'), stars: 1 }
  ];

  const sortOptions = [
    { value: 'newest', label: t('digiMentorReviewsFilters.sortNewest') },
    { value: 'oldest', label: t('digiMentorReviewsFilters.sortOldest') },
    { value: 'highest', label: t('digiMentorReviewsFilters.sortHighest') },
    { value: 'lowest', label: t('digiMentorReviewsFilters.sortLowest') }
  ];

  const renderStars = (count) => {
    return Array.from({ length: count }, (_, i) => (
      <svg key={i} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
      </svg>
    ));
  };

  return (
    <div className="digi-mentor-reviews-filters">
      <div className="digi-mentor-reviews-filters-container">
        
        {/* SEARCH BAR */}
        <div className="digi-mentor-reviews-filters-search">
          <div className="digi-mentor-reviews-filters-search-wrapper">
            <svg className="digi-mentor-reviews-filters-search-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <input
              type="text"
              className="digi-mentor-reviews-filters-search-input"
              placeholder={t('digiMentorReviewsFilters.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            {searchQuery && (
              <button
                className="digi-mentor-reviews-filters-search-clear"
                onClick={() => onSearchChange('')}
                aria-label={t('digiMentorReviewsFilters.clearSearch')}
              >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* RATING FILTERS */}
        <div className="digi-mentor-reviews-filters-rating">
          <label className="digi-mentor-reviews-filters-label">
            {t('digiMentorReviewsFilters.filterByRating')}
          </label>
          <div className="digi-mentor-reviews-filters-rating-pills">
            {ratingFilters.map((filter) => (
              <button
                key={filter.value}
                className={`digi-mentor-reviews-filters-pill ${
                  selectedRating === filter.value ? 'digi-mentor-reviews-filters-pill-active' : ''
                }`}
                onClick={() => onRatingChange(filter.value)}
              >
                {filter.icon ? (
                  <span className="digi-mentor-reviews-filters-pill-icon">{filter.icon}</span>
                ) : (
                  <span className="digi-mentor-reviews-filters-pill-stars">
                    {renderStars(filter.stars)}
                  </span>
                )}
                <span className="digi-mentor-reviews-filters-pill-text">{filter.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* SORT & RESULTS COUNT */}
        <div className="digi-mentor-reviews-filters-actions">
          <div className="digi-mentor-reviews-filters-sort">
            <label className="digi-mentor-reviews-filters-label">
              {t('digiMentorReviewsFilters.sortBy')}
            </label>
            <div className="digi-mentor-reviews-filters-sort-wrapper">
              <select
                className="digi-mentor-reviews-filters-select"
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value)}
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <svg className="digi-mentor-reviews-filters-select-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 9L12 16L5 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          <div className="digi-mentor-reviews-filters-results">
            <span className="digi-mentor-reviews-filters-results-count">{totalResults}</span>
            <span className="digi-mentor-reviews-filters-results-text">
              {totalResults === 1 
                ? t('digiMentorReviewsFilters.resultSingular')
                : t('digiMentorReviewsFilters.resultPlural')
              }
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};