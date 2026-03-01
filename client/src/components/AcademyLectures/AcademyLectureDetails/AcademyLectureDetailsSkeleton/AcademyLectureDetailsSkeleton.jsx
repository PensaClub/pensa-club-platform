import React from 'react';
import './academyLectureDetailsSkeleton.css';

const AcademyLectureDetailsSkeleton = () => {
  return (
    <div className="aldsk">
      {/* Hero */}
      <div className="aldsk-hero">
        <div className="aldsk-hero-content">
          <div className="aldsk-bone aldsk-breadcrumb"></div>
          <div className="aldsk-bone aldsk-status"></div>
          <div className="aldsk-bone aldsk-category"></div>
          <div className="aldsk-bone aldsk-title"></div>
          <div className="aldsk-bone aldsk-description"></div>
          <div className="aldsk-bone aldsk-description-short"></div>
          <div className="aldsk-meta">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aldsk-bone aldsk-meta-item"></div>
            ))}
          </div>
          <div className="aldsk-quick-stats">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aldsk-bone aldsk-quick-stat"></div>
            ))}
          </div>
        </div>

        {/* Floating Action Card */}
        <div className="aldsk-action-card">
          <div className="aldsk-bone aldsk-action-countdown"></div>
          <div className="aldsk-bone aldsk-action-spots"></div>
          <div className="aldsk-bone aldsk-action-btn"></div>
          <div className="aldsk-bone aldsk-action-secondary"></div>
          <div className="aldsk-action-credits">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="aldsk-bone aldsk-credit-row"></div>
            ))}
          </div>
          <div className="aldsk-bone aldsk-action-share"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="aldsk-main">
        <div className="aldsk-container">
          {/* Content */}
          <div className="aldsk-content">
            {/* Tabs */}
            <div className="aldsk-tabs">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="aldsk-bone aldsk-tab"></div>
              ))}
            </div>

            {/* Tab Content */}
            <div className="aldsk-tab-content">
              <div className="aldsk-section">
                <div className="aldsk-bone aldsk-section-title"></div>
                <div className="aldsk-bone aldsk-text-line"></div>
                <div className="aldsk-bone aldsk-text-line"></div>
                <div className="aldsk-bone aldsk-text-line-short"></div>
              </div>
              <div className="aldsk-section">
                <div className="aldsk-bone aldsk-section-title"></div>
                <div className="aldsk-learn-grid">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="aldsk-bone aldsk-learn-item"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="aldsk-sidebar">
            <div className="aldsk-sidebar-card">
              <div className="aldsk-bone aldsk-sidebar-label"></div>
              <div className="aldsk-bone aldsk-sidebar-avatar"></div>
              <div className="aldsk-bone aldsk-sidebar-name"></div>
              <div className="aldsk-bone aldsk-sidebar-spec"></div>
            </div>
            <div className="aldsk-sidebar-card">
              <div className="aldsk-bone aldsk-sidebar-label"></div>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="aldsk-bone aldsk-info-row"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcademyLectureDetailsSkeleton;
