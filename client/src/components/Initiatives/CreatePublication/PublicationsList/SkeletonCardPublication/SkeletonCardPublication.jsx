


import React from 'react';
import './skeletonCardPublication.css';

export const SkeletonCardPublication = () => {
  return (
    <div className="skeleton-publication-card">
      <div className="skeleton-publication-image"></div>
      <div className="skeleton-publication-content">
        <div className="skeleton-publication-meta">
          <div className="skeleton-publication-date"></div>
          <div className="skeleton-publication-read-time"></div>
        </div>
        <div className="skeleton-publication-title"></div>
        <div className="skeleton-publication-description"></div>
        <div className="skeleton-publication-description"></div>
        <div className="skeleton-publication-stats">
          <div className="skeleton-publication-stat"></div>
          <div className="skeleton-publication-stat"></div>
        </div>
      </div>
    </div>
  );
};
