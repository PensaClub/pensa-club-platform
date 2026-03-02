import React from 'react';
import { useTranslation } from 'react-i18next';
import './storiesHeaderAdmin.css';

export const StoriesHeaderAdmin = ({
  totalCount,
  viewMode,
  onViewModeChange,
  isLoading
}) => {
  const { t } = useTranslation('content');

  return (
    <div className="stories-header-admin-container">
      <div className="stories-header-admin-content">
        <div className="stories-header-admin-title-section">
          <h1 className="stories-header-admin-main-title">
            <svg className="stories-header-admin-icon" viewBox="0 0 24 24" fill="none">
              <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" />
              <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" />
              <path d="M16 13H8" stroke="currentColor" strokeWidth="2" />
              <path d="M16 17H8" stroke="currentColor" strokeWidth="2" />
              <path d="M10 9H8" stroke="currentColor" strokeWidth="2" />
            </svg>
            {t('stories.admin.title')}
          </h1>
          <p className="stories-header-admin-subtitle">
            {t('stories.admin.subtitle')}
          </p>
        </div>

        {/* Keep the stats section but make it invisible in create mode */}
        <div className="stories-header-admin-stats">
          <div className={`stories-header-admin-stat-card ${viewMode === 'create' ? 'invisible' : ''}`}>
            <span className="stories-header-admin-stat-number">
              {isLoading ? '...' : totalCount}
            </span>
            <span className="stories-header-admin-stat-label">
              {viewMode === 'stories'
                ? t('stories.admin.totalStories')
                : t('stories.admin.totalDrafts')
              }
            </span>
          </div>
        </div>
      </div>

      <div className="stories-header-admin-view-mode-toggle">
        <button
          className={`stories-header-admin-toggle-btn ${viewMode === 'stories' ? 'active' : ''}`}
          onClick={() => onViewModeChange('stories')}
        >
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" />
            <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" />
            <path d="M16 13H8" stroke="currentColor" strokeWidth="2" />
            <path d="M16 17H8" stroke="currentColor" strokeWidth="2" />
            <path d="M10 9H8" stroke="currentColor" strokeWidth="2" />
          </svg>
          {t('stories.admin.published')}
        </button>

        <button
          className={`stories-header-admin-toggle-btn ${viewMode === 'drafts' ? 'active' : ''}`}
          onClick={() => onViewModeChange('drafts')}
        >
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" />
            <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.43741 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="currentColor" strokeWidth="2" />
          </svg>
          {t('stories.admin.drafts')}
        </button>

        <button
          className={`stories-header-admin-toggle-btn ${viewMode === 'create' ? 'active' : ''}`}
          onClick={() => onViewModeChange('create')}
        >
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {t('stories.admin.createStory')}
        </button>
      </div>
    </div>
  );
};
