import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './approvedApplications.css';

export const ApprovedApplications = ({ applications }) => {
  const { t } = useTranslation('digibridge-mentor');
  
  const [selectedApp, setSelectedApp] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const handleDetailsClick = (app) => {
    setSelectedApp(app);
    setShowDetailsModal(true);
  };

  if (applications.length === 0) {
    return (
      <div className="approved-applications-empty">
        <div className="approved-applications-empty-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 20H22V18C22 16.3431 20.6569 15 19 15C18.0444 15 17.1931 15.4468 16.6438 16.1429M17 20H7M17 20V18C17 17.3438 16.8736 16.717 16.6438 16.1429M7 20H2V18C2 16.3431 3.34315 15 5 15C5.95561 15 6.80686 15.4468 7.35625 16.1429M7 20V18C7 17.3438 7.12642 16.717 7.35625 16.1429M7.35625 16.1429C8.0935 14.301 9.89482 13 12 13C14.1052 13 15.9065 14.301 16.6438 16.1429M15 7C15 8.65685 13.6569 10 12 10C10.3431 10 9 8.65685 9 7C9 5.34315 10.3431 4 12 4C13.6569 4 15 5.34315 15 7ZM21 10C21 11.1046 20.1046 12 19 12C17.8954 12 17 11.1046 17 10C17 8.89543 17.8954 8 19 8C20.1046 8 21 8.89543 21 10ZM7 10C7 11.1046 6.10457 12 5 12C3.89543 12 3 11.1046 3 10C3 8.89543 3.89543 8 5 8C6.10457 8 7 8.89543 7 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h3 className="approved-applications-empty-title">{t('approvedApplications.noApplications')}</h3>
        <p className="approved-applications-empty-text">{t('approvedApplications.noApplicationsDesc')}</p>
      </div>
    );
  }

  return (
    <div className="approved-applications">
      <div className="approved-applications-stats">
        <div className="approved-applications-stat-card">
          <div className="approved-applications-stat-icon approved-applications-stat-icon-students">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 20H22V18C22 16.3431 20.6569 15 19 15C18.0444 15 17.1931 15.4468 16.6438 16.1429M17 20H7M17 20V18C17 17.3438 16.8736 16.717 16.6438 16.1429M7 20H2V18C2 16.3431 3.34315 15 5 15C5.95561 15 6.80686 15.4468 7.35625 16.1429M7 20V18C7 17.3438 7.12642 16.717 7.35625 16.1429M7.35625 16.1429C8.0935 14.301 9.89482 13 12 13C14.1052 13 15.9065 14.301 16.6438 16.1429M15 7C15 8.65685 13.6569 10 12 10C10.3431 10 9 8.65685 9 7C9 5.34315 10.3431 4 12 4C13.6569 4 15 5.34315 15 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="approved-applications-stat-content">
            <div className="approved-applications-stat-label">{t('approvedApplications.totalStudents')}</div>
            <div className="approved-applications-stat-value">{applications.length}</div>
          </div>
        </div>
      </div>

      <div className="approved-applications-list">
        {applications.map((app) => (
          <div key={app.id} className="approved-applications-card">
            <div className="approved-applications-card-header">
              <div className="approved-applications-card-avatar">
                <img 
                  src={app.userAvatar || '/images/homePage/user-it.png'} 
                  alt={app.userName}
                  onError={(e) => {
                    e.target.src = '/images/homePage/user-it.png';
                  }}
                />
                <div className="approved-applications-card-badge">
                  {t('approvedApplications.active')}
                </div>
              </div>
              <div className="approved-applications-card-info">
                <h3 className="approved-applications-card-name">{app.userName}</h3>
                <p className="approved-applications-card-email">{app.userEmail}</p>
                {app.userPhone && (
                  <p className="approved-applications-card-phone">{app.userPhone}</p>
                )}
              </div>
              <div className="approved-applications-card-dates">
                <div className="approved-applications-card-date">
                  <span className="approved-applications-card-date-label">{t('approvedApplications.approvedOn')}</span>
                  <span className="approved-applications-card-date-value">
                    {new Date(app.approvedAt).toLocaleDateString('bg-BG', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="approved-applications-card-date">
                  <span className="approved-applications-card-date-label">{t('approvedApplications.studentSince')}</span>
                  <span className="approved-applications-card-date-value">
                    {Math.floor((new Date() - new Date(app.approvedAt)) / (1000 * 60 * 60 * 24))} {t('approvedApplications.days')}
                  </span>
                </div>
              </div>
            </div>

            <div className="approved-applications-card-actions">
              <button
                className="approved-applications-btn approved-applications-btn-details"
                onClick={() => handleDetailsClick(app)}
              >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 16H12V12H11M12 8H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>{t('approvedApplications.viewDetails')}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* DETAILS MODAL */}
      {showDetailsModal && selectedApp && (
        <div className="approved-applications-modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="approved-applications-modal" onClick={(e) => e.stopPropagation()}>
            <div className="approved-applications-modal-header">
              <h3 className="approved-applications-modal-title">{t('approvedApplications.studentDetails')}</h3>
              <button 
                className="approved-applications-modal-close"
                onClick={() => setShowDetailsModal(false)}
              >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <div className="approved-applications-modal-body">
              <div className="approved-applications-modal-avatar-section">
                <img 
                  src={selectedApp.userAvatar || '/images/homePage/user-it.png'} 
                  alt={selectedApp.userName}
                  className="approved-applications-modal-avatar"
                  onError={(e) => {
                    e.target.src = '/images/homePage/user-it.png';
                  }}
                />
                <div className="approved-applications-modal-status">
                  <span className="approved-applications-modal-status-badge">
                    {t('approvedApplications.activeStudent')}
                  </span>
                </div>
              </div>

              <div className="approved-applications-modal-details">
                <div className="approved-applications-modal-detail">
                  <span className="approved-applications-modal-detail-label">{t('approvedApplications.studentName')}:</span>
                  <span className="approved-applications-modal-detail-value">{selectedApp.userName}</span>
                </div>
                <div className="approved-applications-modal-detail">
                  <span className="approved-applications-modal-detail-label">{t('approvedApplications.email')}:</span>
                  <span className="approved-applications-modal-detail-value">{selectedApp.userEmail}</span>
                </div>
                {selectedApp.userPhone && (
                  <div className="approved-applications-modal-detail">
                    <span className="approved-applications-modal-detail-label">{t('approvedApplications.phone')}:</span>
                    <span className="approved-applications-modal-detail-value">{selectedApp.userPhone}</span>
                  </div>
                )}
                <div className="approved-applications-modal-detail">
                  <span className="approved-applications-modal-detail-label">{t('approvedApplications.appliedOn')}:</span>
                  <span className="approved-applications-modal-detail-value">
                    {new Date(selectedApp.createdAt).toLocaleDateString('bg-BG', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div className="approved-applications-modal-detail">
                  <span className="approved-applications-modal-detail-label">{t('approvedApplications.approvedOn')}:</span>
                  <span className="approved-applications-modal-detail-value">
                    {new Date(selectedApp.approvedAt).toLocaleDateString('bg-BG', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div className="approved-applications-modal-detail">
                  <span className="approved-applications-modal-detail-label">{t('approvedApplications.studentFor')}:</span>
                  <span className="approved-applications-modal-detail-value">
                    {Math.floor((new Date() - new Date(selectedApp.approvedAt)) / (1000 * 60 * 60 * 24))} {t('approvedApplications.days')}
                  </span>
                </div>
              </div>

              <div className="approved-applications-modal-info">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 16H12V12H11M12 8H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>{t('approvedApplications.infoText')}</span>
              </div>
            </div>
            <div className="approved-applications-modal-footer">
              <button
                className="approved-applications-modal-btn approved-applications-modal-btn-primary"
                onClick={() => setShowDetailsModal(false)}
              >
                {t('approvedApplications.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};