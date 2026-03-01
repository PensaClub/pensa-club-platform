import React from 'react';
import './academyLectureTestSkeleton.css';

const AcademyLectureTestSkeleton = () => {
  return (
    <div className="altsk">
      {/* Header */}
      <div className="altsk-header">
        <div className="altsk-header-left">
          <div className="altsk-bone altsk-back-btn"></div>
          <div className="altsk-header-info">
            <div className="altsk-bone altsk-header-title"></div>
            <div className="altsk-bone altsk-header-meta"></div>
          </div>
        </div>
        <div className="altsk-header-right">
          <div className="altsk-bone altsk-timer"></div>
          <div className="altsk-bone altsk-progress"></div>
        </div>
      </div>

      {/* Main */}
      <div className="altsk-main">
        <div className="altsk-container">
          {/* Sidebar */}
          <div className="altsk-sidebar">
            <div className="altsk-bone altsk-sidebar-title"></div>
            <div className="altsk-sidebar-grid">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="altsk-bone altsk-sidebar-item"></div>
              ))}
            </div>
            <div className="altsk-sidebar-legend">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="altsk-bone altsk-legend-item"></div>
              ))}
            </div>
          </div>

          {/* Question Card */}
          <div className="altsk-question">
            <div className="altsk-question-header">
              <div className="altsk-bone altsk-q-number"></div>
              <div className="altsk-bone altsk-q-points"></div>
              <div className="altsk-bone altsk-q-type"></div>
            </div>
            <div className="altsk-bone altsk-q-text"></div>
            <div className="altsk-bone altsk-q-text-short"></div>
            <div className="altsk-answers">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="altsk-bone altsk-answer"></div>
              ))}
            </div>
            <div className="altsk-nav">
              <div className="altsk-bone altsk-nav-btn"></div>
              <div className="altsk-bone altsk-nav-btn"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="altsk-footer">
        <div className="altsk-footer-info">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="altsk-bone altsk-footer-item"></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AcademyLectureTestSkeleton;
