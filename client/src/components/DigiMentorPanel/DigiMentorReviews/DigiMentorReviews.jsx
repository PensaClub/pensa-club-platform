// client/src/components/DigiMentorPanel/DigiMentorReviews/DigiMentorReviews.jsx

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../../contexts/UserContext';
import { useAcademy } from '../../contexts/AcademyProvider';
import { Loader } from '../../Loader/Loader';
// import { DigiMentorReviewsHeader } from './DigiMentorReviewsHeader/DigiMentorReviewsHeader';
// import { DigiMentorReviewsFilters } from './DigiMentorReviewsFilters/DigiMentorReviewsFilters';
// import { DigiMentorReviewCard } from './DigiMentorReviewCard/DigiMentorReviewCard';
import { mockMentorReviewsData } from '../data/mockMentorReviews';
import './digiMentorReviews.css';
import { DigiMentorReviewsHeader } from './DigiMentorReviewsHeader/DigiMentorReviewsHeader';
import { DigiMentorReviewsFilters } from './DigiMentorReviewsFilters/DigiMentorReviewsFilters';
import { DigiMentorReviewCard } from './DigiMentorReviewCard/DigiMentorReviewCard';

export const DigiMentorReviews = () => {
  const { t } = useTranslation();
  const { profileData } = useAuthContext();
  const { getApprovedMentorReviews, getMentorReviewStats } = useAcademy();

  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [allReviews, setAllReviews] = useState([]);
  const [displayedReviews, setDisplayedReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  
  // Filters & Search
  const [selectedRating, setSelectedRating] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination
  const [visibleCount, setVisibleCount] = useState(6);
  const REVIEWS_PER_LOAD = 6;

  useEffect(() => {
    fetchReviewsData();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [allReviews, selectedRating, sortBy, searchQuery]);

  useEffect(() => {
    setDisplayedReviews(filteredReviews.slice(0, visibleCount));
  }, [filteredReviews, visibleCount]);

  const fetchReviewsData = async () => {
    setIsLoading(true);
    try {
      // 🔥 TEMPORARY: Using mock data
      // TODO: Replace with real API call when backend is ready
      // const mentorId = profileData?.mentorId || profileData?.id;
      // const [statsData, reviewsData] = await Promise.all([
      //   getMentorReviewStats(mentorId),
      //   getApprovedMentorReviews(mentorId, 100)
      // ]);

      const statsData = mockMentorReviewsData.stats;
      const reviewsData = mockMentorReviewsData.reviews;

      setStats(statsData);
      setAllReviews(reviewsData);
      setFilteredReviews(reviewsData);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...allReviews];

    // Apply rating filter
    if (selectedRating !== 'all') {
      filtered = filtered.filter(review => review.rating === parseInt(selectedRating));
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(review =>
        review.name.toLowerCase().includes(query) ||
        review.text.toLowerCase().includes(query) ||
        review.role.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.approvedAt || b.createdAt) - new Date(a.approvedAt || a.createdAt);
        case 'oldest':
          return new Date(a.approvedAt || a.createdAt) - new Date(b.approvedAt || b.createdAt);
        case 'highest':
          return b.rating - a.rating;
        case 'lowest':
          return a.rating - b.rating;
        default:
          return 0;
      }
    });

    setFilteredReviews(filtered);
    setVisibleCount(REVIEWS_PER_LOAD); // Reset to initial count when filters change
  };

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + REVIEWS_PER_LOAD);
  };

  const handleFilterChange = (rating) => {
    setSelectedRating(rating);
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
  };

  if (isLoading) {
    return <Loader />;
  }

  const hasMore = displayedReviews.length < filteredReviews.length;

  return (
    <div className="digi-mentor-reviews">
      {/* PAGE HEADER */}
      <div className="digi-mentor-reviews-page-header">
        <h1 className="digi-mentor-reviews-page-title">
          {t('digiMentorReviews.pageTitle')}
        </h1>
        <p className="digi-mentor-reviews-page-subtitle">
          {t('digiMentorReviews.pageSubtitle')}
        </p>
      </div>

      {/* STATS HEADER */}
      {stats && <DigiMentorReviewsHeader stats={stats} />}

      {/* FILTERS */}
      <DigiMentorReviewsFilters
        selectedRating={selectedRating}
        sortBy={sortBy}
        searchQuery={searchQuery}
        onRatingChange={handleFilterChange}
        onSortChange={handleSortChange}
        onSearchChange={handleSearchChange}
        totalResults={filteredReviews.length}
      />

      {/* REVIEWS LIST */}
      <div className="digi-mentor-reviews-list">
        {displayedReviews.length === 0 ? (
          <div className="digi-mentor-reviews-empty">
            <div className="digi-mentor-reviews-empty-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="digi-mentor-reviews-empty-title">
              {searchQuery || selectedRating !== 'all' 
                ? t('digiMentorReviews.noResultsTitle')
                : t('digiMentorReviews.noReviewsTitle')
              }
            </h3>
            <p className="digi-mentor-reviews-empty-text">
              {searchQuery || selectedRating !== 'all'
                ? t('digiMentorReviews.noResultsText')
                : t('digiMentorReviews.noReviewsText')
              }
            </p>
          </div>
        ) : (
          <>
            <div className="digi-mentor-reviews-grid">
              {displayedReviews.map(review => (
                <DigiMentorReviewCard key={review.id} review={review} />
              ))}
            </div>

            {/* LOAD MORE BUTTON */}
            {hasMore && (
              <div className="digi-mentor-reviews-load-more">
                <button
                  className="digi-mentor-reviews-load-more-btn"
                  onClick={handleLoadMore}
                >
                  {t('digiMentorReviews.loadMore')}
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 9L12 16L5 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <p className="digi-mentor-reviews-load-more-info">
                  {t('digiMentorReviews.showingCount', {
                    visible: displayedReviews.length,
                    total: filteredReviews.length
                  })}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};