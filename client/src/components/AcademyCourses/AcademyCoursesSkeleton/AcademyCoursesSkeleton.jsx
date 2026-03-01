import React from 'react';
import './academyCoursesSkeleton.css';

const AcademyCoursesSkeleton = () => {
  return (
    <div className="acsk">
      {/* Hero Skeleton */}
      <div className="acsk-hero">
        <div className="acsk-hero-content">
          <div className="acsk-bone acsk-hero-badge"></div>
          <div className="acsk-bone acsk-hero-title"></div>
          <div className="acsk-bone acsk-hero-subtitle"></div>
          <div className="acsk-hero-stats">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="acsk-bone acsk-hero-stat"></div>
            ))}
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="acsk-main">
        {/* Section Header */}
        <div className="acsk-section-header">
          <div className="acsk-bone acsk-section-title"></div>
          <div className="acsk-bone acsk-section-subtitle"></div>
        </div>

        {/* Program Tracks */}
        <div className="acsk-tracks">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="acsk-bone acsk-track"></div>
          ))}
        </div>

        {/* Courses Grid */}
        <div className="acsk-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="acsk-card">
              <div className="acsk-bone acsk-card-image"></div>
              <div className="acsk-card-body">
                <div className="acsk-card-badges">
                  <div className="acsk-bone acsk-card-badge"></div>
                  <div className="acsk-bone acsk-card-badge-sm"></div>
                </div>
                <div className="acsk-bone acsk-card-title"></div>
                <div className="acsk-bone acsk-card-desc"></div>
                <div className="acsk-bone acsk-card-desc-short"></div>
                <div className="acsk-card-stats">
                  <div className="acsk-bone acsk-card-stat"></div>
                  <div className="acsk-bone acsk-card-stat"></div>
                  <div className="acsk-bone acsk-card-stat"></div>
                </div>
                <div className="acsk-bone acsk-card-btn"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AcademyCoursesSkeleton;
