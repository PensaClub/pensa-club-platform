import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import './studentDashboardHeader.css';

const StudentDashboardHeader = ({ user, dashboardData }) => {
  const { t } = useTranslation('student-dashboard');
  const navigate = useNavigate();

  // Извличане на данни
  const firstName = user?.details?.firstName || '';
  const lastName = user?.details?.lastName || '';
  const username = user?.details?.username || '';
  const email = user?.email || '';
  const avatar = user?.details?.imageURL || null;
  
  // Името за показване
  const displayName = firstName && lastName 
    ? `${firstName} ${lastName}` 
    : username || email?.split('@')[0] || t('studentDashboardHeader.student');

  // Кредити
  const totalCredits = dashboardData?.totalCredits || dashboardData?.totalCreditsEarned || 0;
  
  // Изчисляване на ниво
  const getLevelInfo = (credits) => {
    if (credits >= 301) {
      return {
        level: 'master',
        label: t('studentDashboardHeader.levelMaster'),
        icon: '💎',
        color: '#b9f2ff',
        min: 301,
        max: null,
        progress: 100
      };
    } else if (credits >= 151) {
      return {
        level: 'expert',
        label: t('studentDashboardHeader.levelExpert'),
        icon: '🥇',
        color: '#ffd700',
        min: 151,
        max: 300,
        progress: ((credits - 151) / (300 - 151)) * 100
      };
    } else if (credits >= 51) {
      return {
        level: 'intermediate',
        label: t('studentDashboardHeader.levelIntermediate'),
        icon: '🥈',
        color: '#c0c0c0',
        min: 51,
        max: 150,
        progress: ((credits - 51) / (150 - 51)) * 100
      };
    } else {
      return {
        level: 'beginner',
        label: t('studentDashboardHeader.levelBeginner'),
        icon: '🥉',
        color: '#cd7f32',
        min: 0,
        max: 50,
        progress: (credits / 50) * 100
      };
    }
  };

  const levelInfo = getLevelInfo(totalCredits);
  const creditsToNext = levelInfo.max ? levelInfo.max - totalCredits + 1 : 0;

  // Default avatar SVG
  const defaultAvatar = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );

  return (
    <div className="sdbh-container">
      <div className="sdbh-left">
        {/* Avatar */}
        <div className="sdbh-avatar-wrapper">
          <div 
            className="sdbh-avatar"
            style={{ borderColor: levelInfo.color }}
          >
            {avatar ? (
              <img src={avatar} alt={displayName} />
            ) : (
              <div className="sdbh-avatar-placeholder">
                {defaultAvatar}
              </div>
            )}
          </div>
          <div 
            className="sdbh-level-badge"
            style={{ background: levelInfo.color }}
          >
            <span>{levelInfo.icon}</span>
          </div>
        </div>

        {/* User Info */}
        <div className="sdbh-info">
          <h1 className="sdbh-name">{displayName}</h1>
          <p className="sdbh-email">{email}</p>
          
          {/* Level */}
          <div className="sdbh-level-container">
            <div className="sdbh-level-text">
              <span 
                className="sdbh-level-label"
                style={{ color: levelInfo.color }}
              >
                {levelInfo.icon} {levelInfo.label}
              </span>
              {levelInfo.max && (
                <span className="sdbh-level-progress-text">
                  {totalCredits} / {levelInfo.max} {t('studentDashboardHeader.credits').toLowerCase()}
                </span>
              )}
            </div>
            
            {/* Progress bar */}
            {levelInfo.max && (
              <div className="sdbh-progress-bar">
                <div 
                  className="sdbh-progress-fill"
                  style={{ 
                    width: `${Math.min(levelInfo.progress, 100)}%`,
                    background: levelInfo.color 
                  }}
                />
              </div>
            )}
            
            {levelInfo.max && (
              <p className="sdbh-next-level">
                {t('studentDashboardHeader.progressToNextLevel')}: {creditsToNext} {t('studentDashboardHeader.credits').toLowerCase()}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="sdbh-right">
        {/* Total Credits Card */}
        <div className="sdbh-credits-card">
          <div className="sdbh-credits-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <div className="sdbh-credits-value">{totalCredits.toLocaleString()}</div>
          <div className="sdbh-credits-label">{t('studentDashboardHeader.totalCredits')}</div>
        </div>

        {/* Edit Profile Button */}
        <button 
          className="sdbh-edit-button"
          onClick={() => navigate('/profile/data')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          {t('studentDashboardHeader.editProfile')}
        </button>
      </div>
    </div>
  );
};

export default StudentDashboardHeader;