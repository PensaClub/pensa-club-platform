import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { format, formatDistanceToNow } from 'date-fns';
import { bg, enUS } from 'date-fns/locale';
import { useInitiativeContext } from '../../../contexts/InitiativeProvider';
import './applicationDetails.css';

export const ApplicationDetails = ({ 
  application, 
  isOpen, 
  onClose,
  onContact
}) => {
  const { t, i18n } = useTranslation();
  const [applicationHistory, setApplicationHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [projectDetails, setProjectDetails] = useState(null);

  const { getAllApplications, getProjectById } = useInitiativeContext();
  const currentLocale = i18n.language === 'bg' ? bg : enUS;

  // Зареждаме данни при отваряне на модала
  useEffect(() => {
    if (isOpen && application) {
      loadApplicationHistory();
      loadProjectDetails();
      loadUserProfile();
    }
  }, [isOpen, application]);

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

  const loadApplicationHistory = async () => {
    if (!application) return;
    
    setIsLoadingHistory(true);
    try {
      const allApplications = await getAllApplications();
      
      // Намираме всички кандидатури от същия email
      const userApplications = allApplications.filter(app => 
        app.email === application.email && app.id !== application.id
      );
      
      // Сортираме по дата
      const sortedHistory = userApplications.sort((a, b) => 
        new Date(b.appliedAt) - new Date(a.appliedAt)
      );
      
      setApplicationHistory(sortedHistory);
    } catch (error) {
      console.error('Error loading application history:', error);
      setApplicationHistory([]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const loadProjectDetails = async () => {
    if (!application?.projectId) return;
    
    try {
      const project = await getProjectById(application.projectId);
      setProjectDetails(project);
    } catch (error) {
      console.error('Error loading project details:', error);
      setProjectDetails(null);
    }
  };

  const loadUserProfile = async () => {
    // TODO: Добави когато имаме user profile endpoint
    // За сега ще покажем статична информация
    setUserProfile({
      hasProfile: false,
      joinedDate: null,
      totalApplications: applicationHistory.length + 1
    });
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleContactClick = () => {
    if (onContact) {
      onContact(application);
    }
    onClose();
  };

  const copyEmail = () => {
    navigator.clipboard.writeText(application.email);
    // TODO: Добави toast notification
  };

  const copyPhone = () => {
    if (application.phone) {
      navigator.clipboard.writeText(application.phone);
    }
  };

  if (!isOpen || !application) return null;

  return (
    <div className="applications-details-overlay" onClick={handleBackdropClick}>
      <div className="applications-details-modal">
        {/* Header */}
        <div className="applications-details-header">
          <div className="applications-details-header-main">
            <div className="applications-details-avatar-large">
              {application.firstName[0]}{application.lastName[0]}
            </div>
            <div className="applications-details-header-info">
              <h2 className="applications-details-name">
                {application.firstName} {application.lastName}
              </h2>
              <p className="applications-details-email-header">
                {application.email}
              </p>
              <div className="applications-details-meta">
                <span className="applications-details-date">
                  {t('applications.details.appliedOn')} {format(new Date(application.appliedAt), 'dd MMMM yyyy', { locale: currentLocale })}
                </span>
                <span className="applications-details-separator">•</span>
                <span className="applications-details-time-ago">
                  {formatDistanceToNow(new Date(application.appliedAt), { addSuffix: true, locale: currentLocale })}
                </span>
              </div>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="applications-details-close-btn"
            title={t('applications.details.close')}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="applications-details-content">
          {/* Main Info */}
          <div className="applications-details-section">
            <h3 className="applications-details-section-title">
              <span className="applications-details-section-icon">📋</span>
              {t('applications.details.applicationInfo')}
            </h3>
            
            <div className="applications-details-info-grid">
              <div className="applications-details-info-card">
                <div className="applications-details-info-label">
                  {t('applications.table.email')}
                </div>
                <div className="applications-details-info-value">
                  <span>{application.email}</span>
                  <button 
                    onClick={copyEmail}
                    className="applications-details-copy-btn"
                    title={t('applications.details.copyEmail')}
                  >
                    📋
                  </button>
                </div>
              </div>

              <div className="applications-details-info-card">
                <div className="applications-details-info-label">
                  {t('applications.table.phone')}
                </div>
                <div className="applications-details-info-value">
                  {application.phone ? (
                    <>
                      <span>{application.phone}</span>
                      <button 
                        onClick={copyPhone}
                        className="applications-details-copy-btn"
                        title={t('applications.details.copyPhone')}
                      >
                        📋
                      </button>
                    </>
                  ) : (
                    <span className="applications-details-no-data">
                      {t('applications.table.noPhone')}
                    </span>
                  )}
                </div>
              </div>

              <div className="applications-details-info-card">
                <div className="applications-details-info-label">
                  {t('applications.table.project')}
                </div>
                <div className="applications-details-info-value">
                  <span className="applications-details-project-tag">
                    {application.projectId}
                  </span>
                  {projectDetails && (
                    <button 
                      className="applications-details-project-link"
                      title={t('applications.details.viewProject')}
                    >
                      🔗
                    </button>
                  )}
                </div>
              </div>

              <div className="applications-details-info-card">
                <div className="applications-details-info-label">
                  {t('applications.details.anonymous')}
                </div>
                <div className="applications-details-info-value">
                  <span className={`applications-details-anonymous-badge ${application.isAnonymous ? 'yes' : 'no'}`}>
                    {application.isAnonymous ? t('applications.details.yes') : t('applications.details.no')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Application History */}
          {applicationHistory.length > 0 && (
            <div className="applications-details-section">
              <h3 className="applications-details-section-title">
                <span className="applications-details-section-icon">📚</span>
                {t('applications.details.applicationHistory')}
                <span className="applications-details-history-count">
                  {applicationHistory.length}
                </span>
              </h3>
              
              <div className="applications-details-history-list">
                {isLoadingHistory ? (
                  <div className="applications-details-history-loading">
                    <div className="applications-details-loading-spinner"></div>
                    <span>{t('applications.details.loadingHistory')}</span>
                  </div>
                ) : (
                  applicationHistory.slice(0, 5).map((historyItem, index) => (
                    <div key={historyItem.id} className="applications-details-history-item">
                      <div className="applications-details-history-icon">📝</div>
                      <div className="applications-details-history-content">
                        <div className="applications-details-history-project">
                          {historyItem.projectId}
                        </div>
                        <div className="applications-details-history-date">
                          {format(new Date(historyItem.appliedAt), 'dd.MM.yyyy HH:mm', { locale: currentLocale })}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                
                {applicationHistory.length > 5 && (
                  <div className="applications-details-history-more">
                    {t('applications.details.moreApplications', { 
                      count: applicationHistory.length - 5 
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* User Profile Info */}
          <div className="applications-details-section">
            <h3 className="applications-details-section-title">
              <span className="applications-details-section-icon">👤</span>
              {t('applications.details.userProfile')}
            </h3>
            
            <div className="applications-details-profile-info">
              <div className="applications-details-profile-stat">
                <span className="applications-details-profile-stat-label">
                  {t('applications.details.totalApplications')}
                </span>
                <span className="applications-details-profile-stat-value">
                  {applicationHistory.length + 1}
                </span>
              </div>
              
              <div className="applications-details-profile-stat">
                <span className="applications-details-profile-stat-label">
                  {t('applications.details.profileStatus')}
                </span>
                <span className="applications-details-profile-stat-value">
                  {userProfile?.hasProfile ? 
                    t('applications.details.hasProfile') : 
                    t('applications.details.noProfile')
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="applications-details-footer">
          <button 
            onClick={onClose}
            className="applications-details-btn-secondary"
          >
            {t('applications.details.close')}
          </button>
          
          <button 
            onClick={handleContactClick}
            className="applications-details-btn-primary"
          >
            <span className="applications-details-btn-icon">✉️</span>
            {t('applications.actions.contact')}
          </button>
        </div>
      </div>
    </div>
  );
};