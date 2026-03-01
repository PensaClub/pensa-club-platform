import React from 'react';
import './academyLecturesSkeleton.css';

const AcademyLecturesSkeleton = () => {
  return (
    <div className="alsk">
      {/* Hero Skeleton */}
      <div className="alsk-hero">
        <div className="alsk-hero-content">
          <div className="alsk-bone alsk-hero-badge"></div>
          <div className="alsk-bone alsk-hero-title"></div>
          <div className="alsk-bone alsk-hero-subtitle"></div>
          <div className="alsk-hero-stats">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="alsk-bone alsk-hero-stat"></div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="alsk-main">
        {/* Filters Row */}
        <div className="alsk-filters">
          <div className="alsk-filters-tabs">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="alsk-bone alsk-filter-tab"></div>
            ))}
          </div>
          <div className="alsk-bone alsk-filter-search"></div>
          <div className="alsk-bone alsk-filter-sort"></div>
        </div>

        {/* Categories Row */}
        <div className="alsk-categories">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="alsk-bone alsk-category"></div>
          ))}
        </div>

        {/* Grid */}
        <div className="alsk-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="alsk-card">
              <div className="alsk-bone alsk-card-thumb"></div>
              <div className="alsk-card-body">
                <div className="alsk-bone alsk-card-category"></div>
                <div className="alsk-bone alsk-card-title"></div>
                <div className="alsk-bone alsk-card-desc"></div>
                <div className="alsk-bone alsk-card-desc-short"></div>
                <div className="alsk-card-footer">
                  <div className="alsk-bone alsk-card-avatar"></div>
                  <div className="alsk-bone alsk-card-meta"></div>
                </div>
                <div className="alsk-bone alsk-card-btn"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AcademyLecturesSkeleton;
