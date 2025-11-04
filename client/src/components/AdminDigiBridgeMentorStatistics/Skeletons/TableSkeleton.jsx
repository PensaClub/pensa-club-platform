// src/components/AdminDigiBridgeMentorStatistics/Skeletons/TableSkeleton.jsx

import React from 'react';
import './tableSkeleton.css';

export const TableSkeleton = ({ rows = 5 }) => {
  return (
    <div className="table-skeleton">
      <div className="table-skeleton-header">
        <div className="table-skeleton-text table-skeleton-title"></div>
        <div className="table-skeleton-text table-skeleton-subtitle"></div>
      </div>

      {/* DESKTOP TABLE */}
      <div className="table-skeleton-wrapper">
        <table className="table-skeleton-content">
          <thead>
            <tr>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                <th key={i} className="table-skeleton-th">
                  <div className="table-skeleton-text table-skeleton-th-text"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex} className="table-skeleton-row">
                {/* Avatar + Name Cell */}
                <td className="table-skeleton-td">
                  <div className="table-skeleton-avatar-cell">
                    <div className="table-skeleton-avatar"></div>
                    <div className="table-skeleton-text table-skeleton-name"></div>
                  </div>
                </td>
                {/* Other Cells */}
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <td key={i} className="table-skeleton-td">
                    <div className="table-skeleton-text table-skeleton-cell"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MOBILE CARDS */}
      <div className="table-skeleton-mobile">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="table-skeleton-card">
            <div className="table-skeleton-card-header">
              <div className="table-skeleton-avatar"></div>
              <div className="table-skeleton-card-info">
                <div className="table-skeleton-text table-skeleton-card-name"></div>
                <div className="table-skeleton-text table-skeleton-card-spec"></div>
              </div>
              <div className="table-skeleton-text table-skeleton-card-badge"></div>
            </div>
            <div className="table-skeleton-card-body">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="table-skeleton-card-row">
                  <div className="table-skeleton-text table-skeleton-card-label"></div>
                  <div className="table-skeleton-text table-skeleton-card-value"></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};