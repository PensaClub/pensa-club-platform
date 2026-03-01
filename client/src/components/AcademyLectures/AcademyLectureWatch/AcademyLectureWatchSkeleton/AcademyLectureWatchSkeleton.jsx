import React from 'react';
import './academyLectureWatchSkeleton.css';

const AcademyLectureWatchSkeleton = () => {
  return (
    <div className="alwsk">
      {/* Header */}
      <div className="alwsk-header">
        <div className="alwsk-header-left">
          <div className="alwsk-bone alwsk-back-btn"></div>
          <div className="alwsk-bone alwsk-header-title"></div>
        </div>
        <div className="alwsk-header-right">
          <div className="alwsk-bone alwsk-theater-btn"></div>
          <div className="alwsk-bone alwsk-youtube-btn"></div>
        </div>
      </div>

      {/* Content */}
      <div className="alwsk-content">
        {/* Video */}
        <div className="alwsk-video-section">
          <div className="alwsk-bone alwsk-video"></div>

          {/* Video Info */}
          <div className="alwsk-video-info">
            <div className="alwsk-video-meta">
              <div className="alwsk-lecturer">
                <div className="alwsk-bone alwsk-lecturer-avatar"></div>
                <div className="alwsk-bone alwsk-lecturer-name"></div>
              </div>
              <div className="alwsk-meta-items">
                <div className="alwsk-bone alwsk-meta-item"></div>
                <div className="alwsk-bone alwsk-meta-item"></div>
                <div className="alwsk-bone alwsk-meta-item"></div>
              </div>
            </div>
            <div className="alwsk-bone alwsk-test-btn"></div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="alwsk-description">
        <div className="alwsk-description-content">
          <div className="alwsk-bone alwsk-desc-title"></div>
          <div className="alwsk-bone alwsk-desc-line"></div>
          <div className="alwsk-bone alwsk-desc-line"></div>
          <div className="alwsk-bone alwsk-desc-line-short"></div>
          <div className="alwsk-tags">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="alwsk-bone alwsk-tag"></div>
            ))}
          </div>
        </div>
        <div className="alwsk-bone alwsk-course-card"></div>
      </div>
    </div>
  );
};

export default AcademyLectureWatchSkeleton;
