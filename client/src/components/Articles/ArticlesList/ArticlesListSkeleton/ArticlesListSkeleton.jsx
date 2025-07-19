import React from 'react';
import './articlesListSkeleton.css';

const ArticlesListSkeleton = () => {
  return (
    <div className="als-skeleton-container">
      {/* Hero Skeleton */}
      <div className="als-hero-skeleton">
        <div className="als-hero-content">
          <div className="als-skeleton als-hero-title"></div>
          <div className="als-skeleton als-hero-subtitle"></div>
        </div>
      </div>

      <div className="als-content-with-sidebar">
        {/* Sidebar Skeleton */}
        <div className="als-sidebar-skeleton">
          <div className="als-skeleton als-promo-card">
            <div className="als-skeleton als-promo-header"></div>
            <div className="als-skeleton als-promo-body"></div>
            <div className="als-skeleton als-promo-footer"></div>
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="als-main-content">
          {/* Featured Article Skeleton */}
          <div className="als-featured-skeleton">
            <div className="als-skeleton als-featured-image"></div>
            <div className="als-featured-content">
              <div className="als-skeleton als-featured-title"></div>
              <div className="als-skeleton als-featured-subtitle"></div>
              <div className="als-skeleton als-featured-description"></div>
              <div className="als-skeleton als-featured-description-short"></div>
            </div>
          </div>

          {/* Divider Skeleton */}
          <div className="als-skeleton als-divider"></div>

          {/* Slider Section Skeleton */}
          <div className="als-slider-skeleton">
            <div className="als-skeleton als-section-title"></div>
            <div className="als-slider-cards">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="als-skeleton als-slider-card">
                  <div className="als-skeleton als-card-image"></div>
                  <div className="als-skeleton als-card-title"></div>
                  <div className="als-skeleton als-card-text"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Divider Skeleton */}
          <div className="als-skeleton als-divider"></div>

          {/* All Articles Header Skeleton */}
          <div className="als-articles-header-skeleton">
            <div className="als-skeleton als-section-title-small"></div>
            <div className="als-skeleton als-search-box"></div>
          </div>

          {/* Articles Grid Skeleton */}
          <div className="als-articles-grid-skeleton">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="als-skeleton als-article-card">
                <div className="als-skeleton als-article-image"></div>
                <div className="als-article-content">
                  <div className="als-skeleton als-article-title"></div>
                  <div className="als-skeleton als-article-text"></div>
                  <div className="als-skeleton als-article-text-short"></div>
                  <div className="als-skeleton als-article-meta"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticlesListSkeleton;