// src/components/AdminDigiBridgeMentorStatistics/Skeletons/ChartSkeleton.jsx

import React from 'react';
import './chartSkeleton.css';

export const ChartSkeleton = ({ height = '450px' }) => {
  return (
    <div className="chart-skeleton" style={{ minHeight: height }}>
      <div className="chart-skeleton-header">
        <div className="chart-skeleton-text chart-skeleton-title"></div>
        <div className="chart-skeleton-text chart-skeleton-subtitle"></div>
      </div>
      <div className="chart-skeleton-body">
        <div className="chart-skeleton-placeholder">
          <svg viewBox="0 0 400 280" fill="none">
            {/* Grid lines */}
            <line x1="40" y1="40" x2="360" y2="40" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="40" y1="90" x2="360" y2="90" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="40" y1="140" x2="360" y2="140" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="40" y1="190" x2="360" y2="190" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="40" y1="240" x2="360" y2="240" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4 4" />
            
            {/* Animated bars */}
            <rect x="60" y="140" width="35" height="100" rx="4" className="chart-skeleton-bar" />
            <rect x="115" y="100" width="35" height="140" rx="4" className="chart-skeleton-bar" style={{ animationDelay: '0.15s' }} />
            <rect x="170" y="120" width="35" height="120" rx="4" className="chart-skeleton-bar" style={{ animationDelay: '0.3s' }} />
            <rect x="225" y="80" width="35" height="160" rx="4" className="chart-skeleton-bar" style={{ animationDelay: '0.45s' }} />
            <rect x="280" y="110" width="35" height="130" rx="4" className="chart-skeleton-bar" style={{ animationDelay: '0.6s' }} />
          </svg>
        </div>
      </div>
    </div>
  );
};