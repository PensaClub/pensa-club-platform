import React from 'react';
import './academyLessonPlayerSkeleton.css';

const AcademyLessonPlayerSkeleton = () => {
  return (
    <div className="lpsk">
      {/* Background */}
      <div className="lpsk-bg"></div>

      <div className="lpsk-container">
        {/* Video Player */}
        <div className="lpsk-player">
          <div className="lpsk-bone lpsk-video"></div>
        </div>

        {/* Nav Bar */}
        <div className="lpsk-nav-bar">
          <div className="lpsk-bone lpsk-nav-back"></div>
          <div className="lpsk-bone lpsk-nav-title"></div>
          <div className="lpsk-bone lpsk-nav-sidebar-btn"></div>
        </div>

        {/* Info Section */}
        <div className="lpsk-info">
          <div className="lpsk-info-content">
            {/* Header */}
            <div className="lpsk-info-header">
              <div className="lpsk-info-meta">
                <div className="lpsk-bone lpsk-type-badge"></div>
                <div className="lpsk-bone lpsk-duration"></div>
                <div className="lpsk-bone lpsk-credits"></div>
              </div>
              <div className="lpsk-bone lpsk-module-badge"></div>
              <div className="lpsk-bone lpsk-lesson-title"></div>

              {/* Progress bar */}
              <div className="lpsk-progress">
                <div className="lpsk-bone lpsk-progress-bar"></div>
                <div className="lpsk-bone lpsk-progress-text"></div>
              </div>
            </div>

            {/* Body */}
            <div className="lpsk-info-body">
              <div className="lpsk-bone lpsk-desc-line"></div>
              <div className="lpsk-bone lpsk-desc-line"></div>
              <div className="lpsk-bone lpsk-desc-line-short"></div>

              {/* Mentor */}
              <div className="lpsk-mentor">
                <div className="lpsk-bone lpsk-mentor-avatar"></div>
                <div className="lpsk-mentor-info">
                  <div className="lpsk-bone lpsk-mentor-name"></div>
                  <div className="lpsk-bone lpsk-mentor-role"></div>
                </div>
              </div>

              {/* Actions */}
              <div className="lpsk-actions">
                <div className="lpsk-bone lpsk-complete-btn"></div>
                <div className="lpsk-bone lpsk-test-btn"></div>
              </div>

              {/* Materials */}
              <div className="lpsk-materials">
                <div className="lpsk-bone lpsk-materials-title"></div>
                <div className="lpsk-materials-list">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="lpsk-bone lpsk-material-item"></div>
                  ))}
                </div>
              </div>

              {/* Nav */}
              <div className="lpsk-lesson-nav">
                <div className="lpsk-bone lpsk-lesson-nav-btn"></div>
                <div className="lpsk-bone lpsk-lesson-nav-btn"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcademyLessonPlayerSkeleton;
