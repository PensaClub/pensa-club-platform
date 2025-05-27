import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './initiativeCard.css';
import { useTranslation } from 'react-i18next';
import { useAnalytics } from '../../../contexts/AnalyticsContext';

import { BookmarkIcon, ViewIcon } from '../../Icons/InitiativeIcons';

export const InitiativeCard = ({ initiative, isBookmarked, onBookmarkToggle, index }) => {
  const { t } = useTranslation();
  const { getViewCount, loadArticleViewCounts } = useAnalytics();

  useEffect(() => {
    if (initiative) {
      loadArticleViewCounts([initiative.id]);
    }
  }, [initiative?.id]);

  const handleBookmarkClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onBookmarkToggle(initiative.id);
  };

  // Цветове за линиите (ротация)
  const getColorClass = (index) => {
    const colors = ['init-color-blue', 'init-color-purple', 'init-color-teal'];
    return colors[index % colors.length];
  };

  return (
    <div className="init-card-container">
      {/* Bookmark Button */}
      <button 
        className={`init-bookmark-btn ${isBookmarked ? 'init-bookmarked' : ''}`}
        onClick={handleBookmarkClick}
        aria-label={isBookmarked ? 'Премахни от запазени' : 'Запази за по-късно'}
      >
        <BookmarkIcon />
      </button>

      {/* Main Image */}
      <div className="init-card-image-wrapper">
        <Link to={`/initiatives/${initiative.slug}`}>
          <img
            src={initiative.mainImage.src}
            alt={initiative.mainImage.alt}
            className="init-card-image"
          />
        </Link>
        
        {/* Цветна линия под снимката */}
        <div className={`init-color-bar ${getColorClass(index)}`}></div>
        
        {/* Category Badge */}
        <div className="init-category-badge">
          {initiative.category.toUpperCase()}
        </div>
      </div>

      {/* Card Content */}
      <div className="init-card-content">
        {/* Title */}
        <Link to={`/initiatives/${initiative.slug}`} className="init-title-link">
          <h3 className="init-card-title">{initiative.title}</h3>
        </Link>

        {/* Description */}
        <p className="init-card-description">
          {initiative.shortDescription}
        </p>

        {/* Read More Link */}
        <Link to={`/initiatives/${initiative.slug}`} className="init-read-more">
          <svg width="6" height="10" viewBox="0 0 6 10" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L5 5L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Read more
        </Link>
      </div>

      {/* View Counter */}
      <div className="init-view-counter">
        <ViewIcon />
        <span>{getViewCount(initiative.id)}</span>
      </div>
    </div>
  );
};