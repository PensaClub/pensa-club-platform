import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { bg, enUS } from 'date-fns/locale';
import { useInitiativeContext } from '../../../contexts/InitiativeProvider';
import './ProjectDetailsModal.css';

export const ProjectDetailsModal = ({ 
  projectId, 
  isOpen, 
  onClose,
  applicationsCount = 0
}) => {
  const { t, i18n } = useTranslation();
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const { getProjectById } = useInitiativeContext();
  const currentLocale = i18n.language === 'bg' ? bg : enUS;

  // Зареждаме проекта при отваряне
  useEffect(() => {
    if (isOpen && projectId) {
      loadProjectDetails();
    }
  }, [isOpen, projectId]);

  // Escape key за затваряне
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const loadProjectDetails = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const projectData = await getProjectById(projectId);
      setProject(projectData);
    } catch (error) {
      console.error('Error loading project details:', error);
      setError(error.message || t('projectDetails.loadError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleViewProject = () => {
    if (project?.slug || project?.id) {
      const projectUrl = `/projects/${project.slug || project.id}`;
      window.open(projectUrl, '_blank');
    }
  };

  const copyProjectId = () => {
    navigator.clipboard.writeText(projectId);
  };

  if (!isOpen) return null;

  return (
    <div className="project-details-modal-overlay" onClick={handleBackdropClick}>
      <div className="project-details-modal">
        {/* Header */}
        <div className="project-details-modal-header">
          <div className="project-details-modal-header-main">
            <div className="project-details-modal-icon">
              🚀
            </div>
            <div className="project-details-modal-header-info">
              <h2 className="project-details-modal-title">
                {project?.title || projectId}
              </h2>
              <p className="project-details-modal-subtitle">
                {t('projectDetails.applicationsCount', { count: applicationsCount })}
              </p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="project-details-modal-close-btn"
            title={t('projectDetails.close')}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="project-details-modal-content">
          {isLoading ? (
            <div className="project-details-modal-loading">
              <div className="project-details-modal-spinner"></div>
              <p>{t('projectDetails.loading')}</p>
            </div>
          ) : error ? (
            <div className="project-details-modal-error">
              <div className="project-details-modal-error-icon">⚠️</div>
              <h3>{t('projectDetails.errorTitle')}</h3>
              <p>{error}</p>
              <button 
                onClick={loadProjectDetails}
                className="project-details-modal-retry-btn"
              >
                {t('projectDetails.retry')}
              </button>
            </div>
          ) : project ? (
            <>
              {/* Project Info */}
              <div className="project-details-modal-section">
                <h3 className="project-details-modal-section-title">
                  <span className="project-details-modal-section-icon">📋</span>
                  {t('projectDetails.projectInfo')}
                </h3>
                
                <div className="project-details-modal-info-grid">
                  <div className="project-details-modal-info-card">
                    <div className="project-details-modal-info-label">
                      {t('projectDetails.projectId')}
                    </div>
                    <div className="project-details-modal-info-value">
                      <span>{projectId}</span>
                      <button 
                        onClick={copyProjectId}
                        className="project-details-modal-copy-btn"
                        title={t('projectDetails.copyId')}
                      >
                        📋
                      </button>
                    </div>
                  </div>

                  {project.status && (
                    <div className="project-details-modal-info-card">
                      <div className="project-details-modal-info-label">
                        {t('projectDetails.status')}
                      </div>
                      <div className="project-details-modal-info-value">
                        <span className={`project-details-modal-status-badge ${project.status}`}>
                          {t(`projectDetails.statusTypes.${project.status}`, project.status)}
                        </span>
                      </div>
                    </div>
                  )}

                  {project.category && (
                    <div className="project-details-modal-info-card">
                      <div className="project-details-modal-info-label">
                        {t('projectDetails.category')}
                      </div>
                      <div className="project-details-modal-info-value">
                        <span className="project-details-modal-category-tag">
                          {project.category}
                        </span>
                      </div>
                    </div>
                  )}

                  {(project.currentParticipants !== undefined || project.maxParticipants !== undefined) && (
                    <div className="project-details-modal-info-card">
                      <div className="project-details-modal-info-label">
                        {t('projectDetails.participants')}
                      </div>
                      <div className="project-details-modal-info-value">
                        <span>
                          {project.currentParticipants || 0} / {project.maxParticipants || '∞'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              {(project.shortDescription || project.fullDescription) && (
                <div className="project-details-modal-section">
                  <h3 className="project-details-modal-section-title">
                    <span className="project-details-modal-section-icon">📝</span>
                    {t('projectDetails.description')}
                  </h3>
                  <div className="project-details-modal-description">
                    {project.shortDescription || project.fullDescription}
                  </div>
                </div>
              )}

              {/* Timeline */}
              {project.timeline && (
                <div className="project-details-modal-section">
                  <h3 className="project-details-modal-section-title">
                    <span className="project-details-modal-section-icon">📅</span>
                    {t('projectDetails.timeline')}
                  </h3>
                  <div className="project-details-modal-timeline">
                    {project.timeline.startDate && (
                      <div className="project-details-modal-timeline-item">
                        <span className="project-details-modal-timeline-label">
                          {t('projectDetails.startDate')}:
                        </span>
                        <span className="project-details-modal-timeline-value">
                          {format(new Date(project.timeline.startDate), 'dd MMMM yyyy', { locale: currentLocale })}
                        </span>
                      </div>
                    )}
                    
                    {project.timeline.endDate && (
                      <div className="project-details-modal-timeline-item">
                        <span className="project-details-modal-timeline-label">
                          {t('projectDetails.endDate')}:
                        </span>
                        <span className="project-details-modal-timeline-value">
                          {format(new Date(project.timeline.endDate), 'dd MMMM yyyy', { locale: currentLocale })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Team */}
              {project.team && project.team.length > 0 && (
                <div className="project-details-modal-section">
                  <h3 className="project-details-modal-section-title">
                    <span className="project-details-modal-section-icon">👥</span>
                    {t('projectDetails.team')} ({project.team.length})
                  </h3>
                  <div className="project-details-modal-team-list">
                    {project.team.slice(0, 4).map((member, index) => (
                      <div key={index} className="project-details-modal-team-member">
                        <div className="project-details-modal-member-avatar">
                          {member.name ? member.name[0] : '👤'}
                        </div>
                        <div className="project-details-modal-member-info">
                          <div className="project-details-modal-member-name">
                            {member.name || t('projectDetails.anonymousMember')}
                          </div>
                          {member.position && (
                            <div className="project-details-modal-member-position">
                              {member.position}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {project.team.length > 4 && (
                      <div className="project-details-modal-team-more">
                        +{project.team.length - 4} {t('projectDetails.moreMembers')}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="project-details-modal-no-data">
              <div className="project-details-modal-no-data-icon">📁</div>
              <h3>{t('projectDetails.noData')}</h3>
              <p>{t('projectDetails.noDataDescription')}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="project-details-modal-footer">
          <button 
            onClick={onClose}
            className="project-details-modal-btn-secondary"
          >
            {t('projectDetails.close')}
          </button>
          
          {project && (
            <button 
              onClick={handleViewProject}
              className="project-details-modal-btn-primary"
            >
              <span className="project-details-modal-btn-icon">🔗</span>
              {t('projectDetails.viewProject')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};