// src/components/AdminDigiBridgeMentorStatistics/Skeletons/OverviewCardsSkeleton.jsx

import React from 'react';
import './overviewCardsSkeleton.css';

export const OverviewCardsSkeleton = () => {
  return (
    <div className="overview-cards-skeleton">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="overview-cards-skeleton-card">
          <div className="overview-cards-skeleton-content">
            <div className="overview-cards-skeleton-icon"></div>
            <div className="overview-cards-skeleton-text-group">
              <div className="overview-cards-skeleton-text overview-cards-skeleton-title"></div>
              <div className="overview-cards-skeleton-text overview-cards-skeleton-value"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};