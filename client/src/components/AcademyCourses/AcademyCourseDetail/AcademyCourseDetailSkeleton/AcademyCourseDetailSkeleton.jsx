import React from 'react';
import './academyCourseDetailSkeleton.css';

const AcademyCourseDetailSkeleton = () => {
  return (
    <div className="acdsk">
      {/* Top Bar */}
      <div className="acdsk-topbar">
        <div className="acdsk-bone acdsk-topbar-back"></div>
      </div>

      {/* Hero */}
      <div className="acdsk-hero">
        <div className="acdsk-hero-container">
          <div className="acdsk-bone acdsk-breadcrumb"></div>

          <div className="acdsk-hero-content">
            {/* Left - Info */}
            <div className="acdsk-hero-info">
              <div className="acdsk-badges">
                <div className="acdsk-bone acdsk-badge"></div>
                <div className="acdsk-bone acdsk-badge-sm"></div>
              </div>
              <div className="acdsk-bone acdsk-hero-title"></div>
              <div className="acdsk-bone acdsk-hero-desc"></div>
              <div className="acdsk-bone acdsk-hero-desc-short"></div>

              <div className="acdsk-hero-stats">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="acdsk-bone acdsk-hero-stat"></div>
                ))}
              </div>

              <div className="acdsk-hero-instructors">
                <div className="acdsk-bone acdsk-instructor-avatar"></div>
                <div className="acdsk-instructor-info">
                  <div className="acdsk-bone acdsk-instructor-label"></div>
                  <div className="acdsk-bone acdsk-instructor-name"></div>
                </div>
              </div>
            </div>

            {/* Right - Preview Card */}
            <div className="acdsk-hero-card">
              <div className="acdsk-bone acdsk-card-preview"></div>
              <div className="acdsk-card-content">
                <div className="acdsk-bone acdsk-card-price"></div>
                <div className="acdsk-bone acdsk-card-cta"></div>
                <div className="acdsk-card-features">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="acdsk-bone acdsk-card-feature"></div>
                  ))}
                </div>
                <div className="acdsk-bone acdsk-card-guarantee"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="acdsk-content">
        {/* Curriculum */}
        <div className="acdsk-curriculum">
          <div className="acdsk-section-header">
            <div className="acdsk-bone acdsk-section-title"></div>
          </div>
          <div className="acdsk-curriculum-summary">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="acdsk-bone acdsk-curriculum-tag"></div>
            ))}
          </div>

          {/* Modules */}
          {[...Array(3)].map((_, i) => (
            <div key={i} className="acdsk-module">
              <div className="acdsk-module-header">
                <div className="acdsk-bone acdsk-module-number"></div>
                <div className="acdsk-module-info">
                  <div className="acdsk-bone acdsk-module-title"></div>
                  <div className="acdsk-bone acdsk-module-meta"></div>
                </div>
                <div className="acdsk-bone acdsk-module-toggle"></div>
              </div>
              {i === 0 && (
                <div className="acdsk-module-lessons">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="acdsk-bone acdsk-lesson"></div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* About Grid */}
        <div className="acdsk-about-grid">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="acdsk-about-card">
              <div className="acdsk-bone acdsk-about-title"></div>
              <div className="acdsk-bone acdsk-about-text"></div>
              <div className="acdsk-bone acdsk-about-text"></div>
              <div className="acdsk-bone acdsk-about-text-short"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AcademyCourseDetailSkeleton;
