import React from 'react';
import { useTranslation } from 'react-i18next';
import './projectsHeaderAdmin.css';

export const ProjectsHeaderAdmin = ({ 
  totalCount, 
  viewMode, 
  onViewModeChange,
  isLoading 
}) => {
  const { t } = useTranslation('content');

  return (
    <div className="projects-header-admin-container">
      <div className="projects-header-admin-content">
        <div className="projects-header-admin-title-section">
          <h1 className="projects-header-admin-main-title">
            <svg className="projects-header-admin-icon" viewBox="0 0 24 24" fill="none">
              <path d="M19 21L12 16L5 21V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H17C17.5304 3 18.0391 3.21071 18.4142 3.58579C18.7893 3.96086 19 4.46957 19 5V21Z" stroke="currentColor" strokeWidth="2"/>
            </svg>
            {t('projects.admin.title')}
          </h1>
          <p className="projects-header-admin-subtitle">
            {t('projects.admin.subtitle')}
          </p>
        </div>

        <div className="projects-header-admin-stats">
          <div className="projects-header-admin-stat-card">
            <span className="projects-header-admin-stat-number">
              {isLoading ? '...' : totalCount}
            </span>
            <span className="projects-header-admin-stat-label">
              {viewMode === 'projects' 
                ? t('projects.admin.totalProjects') 
                : t('projects.admin.totalDrafts')
              }
            </span>
          </div>
        </div>
      </div>

      <div className="projects-header-admin-view-mode-toggle">
        <button
          className={`projects-header-admin-toggle-btn ${viewMode === 'projects' ? 'active' : ''}`}
          onClick={() => onViewModeChange('projects')}
        >
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
          </svg>
          {t('projects.admin.publishedProjects')}
        </button>
        
        <button
          className={`projects-header-admin-toggle-btn ${viewMode === 'drafts' ? 'active' : ''}`}
          onClick={() => onViewModeChange('drafts')}
        >
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2"/>
            <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.43741 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="currentColor" strokeWidth="2"/>
          </svg>
          {t('projects.admin.draftProjects')}
        </button>
      </div>
    </div>
  );
};