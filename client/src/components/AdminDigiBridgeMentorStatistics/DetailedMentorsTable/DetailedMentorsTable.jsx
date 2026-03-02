// src/components/AdminDigiBridgeMentorStatistics/DetailedMentorsTable/DetailedMentorsTable.jsx

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import './detailedMentorsTable.css';

export const DetailedMentorsTable = ({ mentors }) => {
  const { t } = useTranslation('digibridge');
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
          aValue = a.specialization || '';
          bValue = b.specialization || '';
          break;
        case 'students':
          aValue = a.studentsCount || 0;
          bValue = b.studentsCount || 0;
          break;
        case 'courses':
          aValue = a.courses?.length || 0;
          bValue = b.courses?.length || 0;
          break;
        case 'rating':
          aValue = a.rating || 0;
          bValue = b.rating || 0;
          break;
        case 'sessions':
          aValue = a.sessionsCount || 0;
          bValue = b.sessionsCount || 0;
          break;
        case 'onlineHours':
          aValue = a.firebaseStats?.totalOnlineHours || 0;
          bValue = b.firebaseStats?.totalOnlineHours || 0;
          break;
        case 'responseTime':
          aValue = a.firebaseStats?.averageResponseTime || 0;
          bValue = b.firebaseStats?.averageResponseTime || 0;
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

      {/* DESKTOP TABLE */}
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
              <th onClick={() => handleSort('sessions')} className="detailed-mentors-table-th sortable center">
                <div className="detailed-mentors-table-th-content">
                  {t('DetailedMentorsTable.sessions')}
                  <SortIcon columnKey="sessions" />
                </div>
              </th>
              
              {/* ✅ ONLINE HOURS COLUMN */}
              <th onClick={() => handleSort('onlineHours')} className="detailed-mentors-table-th sortable center">
                <div className="detailed-mentors-table-th-content">
                  {t('DetailedMentorsTable.onlineHours')}
                  <SortIcon columnKey="onlineHours" />
                </div>
              </th>

              {/* ✅ RESPONSE TIME COLUMN */}
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
            {sortedMentors.map((mentor) => {
              const onlineHours = mentor.firebaseStats?.totalOnlineHours || 0;
              const responseTime = mentor.firebaseStats?.averageResponseTime || 0;
              const responseUnit = mentor.firebaseStats?.averageResponseUnit || 'sec';

              // ✅ Динамични класове за response time badge
              let responseClass = 'slow';
              if (responseUnit === 'sec') {
                if (responseTime <= 10) responseClass = 'excellent';
                else if (responseTime <= 30) responseClass = 'good';
                else if (responseTime <= 60) responseClass = 'average';
              } else {
                // минути
                if (responseTime <= 1) responseClass = 'excellent';
                else if (responseTime <= 3) responseClass = 'good';
                else if (responseTime <= 5) responseClass = 'average';
              }

              return (
                <tr key={mentor.id} className="detailed-mentors-table-row">
                  <td className="detailed-mentors-table-td">
                    <div className="detailed-mentors-table-mentor-cell">
                      <img
                        src={mentor.photoUrl || "/images/homePage/user-it.png"}
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
                      {mentor.specialization || 'N/A'}
                    </span>
                  </td>
                  <td className="detailed-mentors-table-td detailed-mentors-table-td-center">
                    <strong>{mentor.studentsCount || 0}</strong>
                  </td>
                  <td className="detailed-mentors-table-td detailed-mentors-table-td-center">
                    <strong>{mentor.courses?.length || 0}</strong>
                  </td>
                  <td className="detailed-mentors-table-td detailed-mentors-table-td-center">
                    <div className="detailed-mentors-table-rating">
                      <span className="detailed-mentors-table-rating-star">⭐</span>
                      <strong>{mentor.rating ? parseFloat(mentor.rating).toFixed(1) : '0.0'}</strong>
                    </div>
                  </td>
                  <td className="detailed-mentors-table-td detailed-mentors-table-td-center">
                    <strong>{mentor.sessionsCount || 0}</strong>
                  </td>

                  {/* ✅ ONLINE HOURS CELL */}
                  <td className="detailed-mentors-table-td detailed-mentors-table-td-center">
                    <strong>{onlineHours.toFixed(2)}</strong>
                    <span className="detailed-mentors-table-unit"> ч</span>
                  </td>

                  {/* ✅ RESPONSE TIME CELL - ДИНАМИЧНО */}
                  <td className="detailed-mentors-table-td detailed-mentors-table-td-center">
                    {responseTime > 0 ? (
                      <span className={`detailed-mentors-table-response-badge ${responseClass}`}>
                        {responseTime} {responseUnit === 'sec' ? 'сек' : 'мин'}
                      </span>
                    ) : (
                      <span className="detailed-mentors-table-no-data">N/A</span>
                    )}
                  </td>

                  <td className="detailed-mentors-table-td detailed-mentors-table-td-center">
                    <span className={`detailed-mentors-table-status-badge ${mentor.isOnline ? 'online' : 'offline'}`}>
                      {mentor.isOnline ? t('DetailedMentorsTable.online') : t('DetailedMentorsTable.offline')}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* MOBILE VIEW */}
      <div className="detailed-mentors-table-mobile">
        {sortedMentors.map((mentor) => {
          const onlineHours = mentor.firebaseStats?.totalOnlineHours || 0;
          const responseTime = mentor.firebaseStats?.averageResponseTime || 0;
          const responseUnit = mentor.firebaseStats?.averageResponseUnit || 'sec';

          let responseClass = 'slow';
          if (responseUnit === 'sec') {
            if (responseTime <= 10) responseClass = 'excellent';
            else if (responseTime <= 30) responseClass = 'good';
            else if (responseTime <= 60) responseClass = 'average';
          } else {
            if (responseTime <= 1) responseClass = 'excellent';
            else if (responseTime <= 3) responseClass = 'good';
            else if (responseTime <= 5) responseClass = 'average';
          }

          return (
            <div key={mentor.id} className="detailed-mentors-table-card">
              <div className="detailed-mentors-table-card-header">
                <img
                  src={mentor.photoUrl || "/images/homePage/user-it.png"}
                  alt={mentor.name}
                  className="detailed-mentors-table-card-avatar"
                  onError={(e) => {
                    e.target.src = "/images/homePage/user-it.png";
                  }}
                />
                <div className="detailed-mentors-table-card-info">
                  <h3 className="detailed-mentors-table-card-name">{mentor.name}</h3>
                  <p className="detailed-mentors-table-card-spec">{mentor.specialization || 'N/A'}</p>
                </div>
                <span className={`detailed-mentors-table-status-badge ${mentor.isOnline ? 'online' : 'offline'}`}>
                  {mentor.isOnline ? t('DetailedMentorsTable.online') : t('DetailedMentorsTable.offline')}
                </span>
              </div>

              <div className="detailed-mentors-table-card-body">
                <div className="detailed-mentors-table-card-row">
                  <span className="detailed-mentors-table-card-label">{t('DetailedMentorsTable.students')}:</span>
                  <strong>{mentor.studentsCount || 0}</strong>
                </div>
                <div className="detailed-mentors-table-card-row">
                  <span className="detailed-mentors-table-card-label">{t('DetailedMentorsTable.courses')}:</span>
                  <strong>{mentor.courses?.length || 0}</strong>
                </div>
                <div className="detailed-mentors-table-card-row">
                  <span className="detailed-mentors-table-card-label">{t('DetailedMentorsTable.rating')}:</span>
                  <div className="detailed-mentors-table-rating">
                    <span className="detailed-mentors-table-rating-star">⭐</span>
                    <strong>{mentor.rating ? parseFloat(mentor.rating).toFixed(1) : '0.0'}</strong>
                  </div>
                </div>
                <div className="detailed-mentors-table-card-row">
                  <span className="detailed-mentors-table-card-label">{t('DetailedMentorsTable.sessions')}:</span>
                  <strong>{mentor.sessionsCount || 0}</strong>
                </div>

                {/* ✅ ONLINE HOURS ROW */}
                <div className="detailed-mentors-table-card-row">
                  <span className="detailed-mentors-table-card-label">{t('DetailedMentorsTable.onlineHours')}:</span>
                  <strong>{onlineHours.toFixed(2)} ч</strong>
                </div>

                {/* ✅ RESPONSE TIME ROW - ДИНАМИЧНО */}
                <div className="detailed-mentors-table-card-row">
                  <span className="detailed-mentors-table-card-label">{t('DetailedMentorsTable.responseTime')}:</span>
                  {responseTime > 0 ? (
                    <span className={`detailed-mentors-table-response-badge ${responseClass}`}>
                      {responseTime} {responseUnit === 'sec' ? 'сек' : 'мин'}
                    </span>
                  ) : (
                    <span className="detailed-mentors-table-no-data">N/A</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};