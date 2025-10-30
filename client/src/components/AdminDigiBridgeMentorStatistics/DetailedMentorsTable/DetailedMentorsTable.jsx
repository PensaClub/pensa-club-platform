// src/components/AdminDigiBridgeMentorStatistics/DetailedMentorsTable/DetailedMentorsTable.jsx

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import './detailedMentorsTable.css';

export const DetailedMentorsTable = ({ mentors }) => {
  const { t } = useTranslation();
  const [sortConfig, setSortConfig] = useState({ key: 'rating', direction: 'desc' });

  const sortedMentors = useMemo(() => {
    const sorted = [...mentors];
    
    sorted.sort((a, b) => {
      let aValue, bValue;

      switch (sortConfig.key) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'specialization':
          aValue = a.specialization;
          bValue = b.specialization;
          break;
        case 'students':
          aValue = a.studentsCount;
          bValue = b.studentsCount;
          break;
        case 'courses':
          aValue = a.courses.completed;
          bValue = b.courses.completed;
          break;
        case 'rating':
          aValue = a.rating;
          bValue = b.rating;
          break;
        case 'onlineHours':
          aValue = a.onlineTime.thisMonth;
          bValue = b.onlineTime.thisMonth;
          break;
        case 'responseTime':
          aValue = a.quality.responseTime;
          bValue = b.quality.responseTime;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [mentors, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M7 15l5 5 5-5M7 9l5-5 5 5" />
        </svg>
      );
    }
    
    if (sortConfig.direction === 'asc') {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M7 15l5-5 5 5" />
        </svg>
      );
    }
    
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M7 9l5 5 5-5" />
      </svg>
    );
  };

  return (
    <div className="detailed-mentors-table">
      <div className="detailed-mentors-table-header">
        <h2 className="detailed-mentors-table-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
            <path d="M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z" />
            <line x1="9" y1="12" x2="15" y2="12" />
            <line x1="9" y1="16" x2="15" y2="16" />
          </svg>
          {t('DetailedMentorsTable.title')}
        </h2>
        <p className="detailed-mentors-table-subtitle">
          {t('DetailedMentorsTable.subtitle', { count: mentors.length })}
        </p>
      </div>

      <div className="detailed-mentors-table-wrapper">
        <table className="detailed-mentors-table-content">
          <thead>
            <tr>
              <th onClick={() => handleSort('name')} className="detailed-mentors-table-th sortable">
                <div className="detailed-mentors-table-th-content">
                  {t('DetailedMentorsTable.name')}
                  <SortIcon columnKey="name" />
                </div>
              </th>
              <th onClick={() => handleSort('specialization')} className="detailed-mentors-table-th sortable">
                <div className="detailed-mentors-table-th-content">
                  {t('DetailedMentorsTable.specialization')}
                  <SortIcon columnKey="specialization" />
                </div>
              </th>
              <th onClick={() => handleSort('students')} className="detailed-mentors-table-th sortable center">
                <div className="detailed-mentors-table-th-content">
                  {t('DetailedMentorsTable.students')}
                  <SortIcon columnKey="students" />
                </div>
              </th>
              <th onClick={() => handleSort('courses')} className="detailed-mentors-table-th sortable center">
                <div className="detailed-mentors-table-th-content">
                  {t('DetailedMentorsTable.courses')}
                  <SortIcon columnKey="courses" />
                </div>
              </th>
              <th onClick={() => handleSort('rating')} className="detailed-mentors-table-th sortable center">
                <div className="detailed-mentors-table-th-content">
                  {t('DetailedMentorsTable.rating')}
                  <SortIcon columnKey="rating" />
                </div>
              </th>
              <th onClick={() => handleSort('onlineHours')} className="detailed-mentors-table-th sortable center">
                <div className="detailed-mentors-table-th-content">
                  {t('DetailedMentorsTable.onlineHours')}
                  <SortIcon columnKey="onlineHours" />
                </div>
              </th>
              <th onClick={() => handleSort('responseTime')} className="detailed-mentors-table-th sortable center">
                <div className="detailed-mentors-table-th-content">
                  {t('DetailedMentorsTable.responseTime')}
                  <SortIcon columnKey="responseTime" />
                </div>
              </th>
              <th className="detailed-mentors-table-th center">
                <div className="detailed-mentors-table-th-content">
                  {t('DetailedMentorsTable.status')}
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedMentors.map((mentor) => (
              <tr key={mentor.id} className="detailed-mentors-table-row">
                <td className="detailed-mentors-table-td">
                  <div className="detailed-mentors-table-mentor-cell">
                    <img
                      src={mentor.photoUrl}
                      alt={mentor.name}
                      className="detailed-mentors-table-avatar"
                      onError={(e) => {
                        e.target.src = "/images/homePage/user-it.png";
                      }}
                    />
                    <span className="detailed-mentors-table-name">{mentor.name}</span>
                  </div>
                </td>
                <td className="detailed-mentors-table-td">
                  <span className="detailed-mentors-table-specialization">
                    {mentor.specialization}
                  </span>
                </td>
                <td className="detailed-mentors-table-td detailed-mentors-table-td-center">
                  <strong>{mentor.studentsCount}</strong>
                </td>
                <td className="detailed-mentors-table-td detailed-mentors-table-td-center">
                  <strong>{mentor.courses.completed}</strong>
                </td>
                <td className="detailed-mentors-table-td detailed-mentors-table-td-center">
                  <div className="detailed-mentors-table-rating">
                    <span className="detailed-mentors-table-rating-star">⭐</span>
                    <strong>{mentor.rating}</strong>
                  </div>
                </td>
                <td className="detailed-mentors-table-td detailed-mentors-table-td-center">
                  <strong>{mentor.onlineTime.thisMonth}</strong>
                  <span className="detailed-mentors-table-unit">ч</span>
                </td>
                <td className="detailed-mentors-table-td detailed-mentors-table-td-center">
                  <span className={`detailed-mentors-table-response-badge ${
                    mentor.quality.responseTime <= 10 ? 'excellent' :
                    mentor.quality.responseTime <= 15 ? 'good' :
                    mentor.quality.responseTime <= 20 ? 'average' : 'slow'
                  }`}>
                    {mentor.quality.responseTime} мин
                  </span>
                </td>
                <td className="detailed-mentors-table-td detailed-mentors-table-td-center">
                  <span className={`detailed-mentors-table-status-badge ${mentor.isOnline ? 'online' : 'offline'}`}>
                    {mentor.isOnline ? t('DetailedMentorsTable.online') : t('DetailedMentorsTable.offline')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="detailed-mentors-table-mobile">
        {sortedMentors.map((mentor) => (
          <div key={mentor.id} className="detailed-mentors-table-card">
            <div className="detailed-mentors-table-card-header">
              <img
                src={mentor.photoUrl}
                alt={mentor.name}
                className="detailed-mentors-table-card-avatar"
                onError={(e) => {
                  e.target.src = "/images/homePage/user-it.png";
                }}
              />
              <div className="detailed-mentors-table-card-info">
                <h3 className="detailed-mentors-table-card-name">{mentor.name}</h3>
                <p className="detailed-mentors-table-card-spec">{mentor.specialization}</p>
              </div>
              <span className={`detailed-mentors-table-status-badge ${mentor.isOnline ? 'online' : 'offline'}`}>
                {mentor.isOnline ? t('DetailedMentorsTable.online') : t('DetailedMentorsTable.offline')}
              </span>
            </div>

            <div className="detailed-mentors-table-card-body">
              <div className="detailed-mentors-table-card-row">
                <span className="detailed-mentors-table-card-label">{t('DetailedMentorsTable.students')}:</span>
                <strong>{mentor.studentsCount}</strong>
              </div>
              <div className="detailed-mentors-table-card-row">
                <span className="detailed-mentors-table-card-label">{t('DetailedMentorsTable.courses')}:</span>
                <strong>{mentor.courses.completed}</strong>
              </div>
              <div className="detailed-mentors-table-card-row">
                <span className="detailed-mentors-table-card-label">{t('DetailedMentorsTable.rating')}:</span>
                <div className="detailed-mentors-table-rating">
                  <span className="detailed-mentors-table-rating-star">⭐</span>
                  <strong>{mentor.rating}</strong>
                </div>
              </div>
              <div className="detailed-mentors-table-card-row">
                <span className="detailed-mentors-table-card-label">{t('DetailedMentorsTable.onlineHours')}:</span>
                <strong>{mentor.onlineTime.thisMonth} ч</strong>
              </div>
              <div className="detailed-mentors-table-card-row">
                <span className="detailed-mentors-table-card-label">{t('DetailedMentorsTable.responseTime')}:</span>
                <span className={`detailed-mentors-table-response-badge ${
                  mentor.quality.responseTime <= 10 ? 'excellent' :
                  mentor.quality.responseTime <= 15 ? 'good' :
                  mentor.quality.responseTime <= 20 ? 'average' : 'slow'
                }`}>
                  {mentor.quality.responseTime} мин
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};