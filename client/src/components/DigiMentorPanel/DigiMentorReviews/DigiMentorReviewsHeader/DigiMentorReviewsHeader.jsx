// client/src/components/DigiMentorPanel/DigiMentorReviews/DigiMentorReviewsHeader/DigiMentorReviewsHeader.jsx

import { useTranslation } from 'react-i18next';
import './digiMentorReviewsHeader.css';

export const DigiMentorReviewsHeader = ({ stats }) => {
  const { t } = useTranslation();

  if (!stats) return null;

  const { totalReviews, averageRating, ratingDistribution } = stats;

  // Calculate percentage for each rating
  const getPercentage = (count) => {
    if (totalReviews === 0) return 0;
    return Math.round((count / totalReviews) * 100);
  };

  // Render stars based on rating
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        // Full star
        stars.push(
          <svg key={i} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
          </svg>
        );
      } else if (i === fullStars + 1 && hasHalfStar) {
        // Half star
        stars.push(
          <svg key={i} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id={`half-star-${i}`}>
                <stop offset="50%" stopColor="currentColor"/>
                <stop offset="50%" stopColor="transparent"/>
              </linearGradient>
            </defs>
            <path 
              d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" 
              fill={`url(#half-star-${i})`}
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        );
      } else {
        // Empty star
        stars.push(
          <svg key={i} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        );
      }
    }

    return stars;
  };

  return (
    <div className="digi-mentor-reviews-header">
      <div className="digi-mentor-reviews-header-container">
        
        {/* LEFT SIDE - Overall Rating */}
        <div className="digi-mentor-reviews-header-overall">
          <div className="digi-mentor-reviews-header-rating-number">
            {averageRating.toFixed(1)}
          </div>
          <div className="digi-mentor-reviews-header-stars">
            {renderStars(averageRating)}
          </div>
          <div className="digi-mentor-reviews-header-total">
            {t('digiMentorReviewsHeader.basedOn', { count: totalReviews })}
          </div>
        </div>

        {/* RIGHT SIDE - Rating Distribution */}
        <div className="digi-mentor-reviews-header-distribution">
          <h3 className="digi-mentor-reviews-header-distribution-title">
            {t('digiMentorReviewsHeader.distributionTitle')}
          </h3>
          
          <div className="digi-mentor-reviews-header-distribution-list">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = ratingDistribution[rating] || 0;
              const percentage = getPercentage(count);

              return (
                <div key={rating} className="digi-mentor-reviews-header-distribution-item">
                  <div className="digi-mentor-reviews-header-distribution-label">
                    <span className="digi-mentor-reviews-header-distribution-stars">
                      {rating}
                      <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                      </svg>
                    </span>
                  </div>
                  
                  <div className="digi-mentor-reviews-header-distribution-bar">
                    <div 
                      className="digi-mentor-reviews-header-distribution-fill"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  
                  <div className="digi-mentor-reviews-header-distribution-count">
                    {count}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};