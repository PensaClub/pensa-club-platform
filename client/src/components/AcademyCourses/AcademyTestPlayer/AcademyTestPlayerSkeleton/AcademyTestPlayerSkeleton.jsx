import React from 'react';
import './academyTestPlayerSkeleton.css';

const AcademyTestPlayerSkeleton = () => {
  return (
    <div className="atpsk">
      {/* Header */}
      <div className="atpsk-header">
        <div className="atpsk-header-left">
          <div className="atpsk-bone atpsk-back-btn"></div>
          <div className="atpsk-header-info">
            <div className="atpsk-bone atpsk-header-title"></div>
            <div className="atpsk-bone atpsk-header-meta"></div>
          </div>
        </div>
        <div className="atpsk-header-right">
          <div className="atpsk-bone atpsk-timer"></div>
          <div className="atpsk-bone atpsk-progress"></div>
        </div>
      </div>

      {/* Main */}
      <div className="atpsk-main">
        <div className="atpsk-container">
          {/* Sidebar */}
          <div className="atpsk-sidebar">
            <div className="atpsk-bone atpsk-sidebar-title"></div>
            <div className="atpsk-sidebar-grid">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="atpsk-bone atpsk-sidebar-item"></div>
              ))}
            </div>
            <div className="atpsk-sidebar-legend">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="atpsk-bone atpsk-legend-item"></div>
              ))}
            </div>
          </div>

          {/* Question Card */}
          <div className="atpsk-question">
            <div className="atpsk-question-header">
              <div className="atpsk-bone atpsk-q-number"></div>
              <div className="atpsk-bone atpsk-q-points"></div>
              <div className="atpsk-bone atpsk-q-type"></div>
            </div>
            <div className="atpsk-bone atpsk-q-text"></div>
            <div className="atpsk-bone atpsk-q-text-short"></div>
            <div className="atpsk-answers">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="atpsk-bone atpsk-answer"></div>
              ))}
            </div>
            <div className="atpsk-nav">
              <div className="atpsk-bone atpsk-nav-btn"></div>
              <div className="atpsk-bone atpsk-nav-btn"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="atpsk-footer">
        <div className="atpsk-footer-info">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="atpsk-bone atpsk-footer-item"></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AcademyTestPlayerSkeleton;
