import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAcademy } from '../contexts/AcademyProvider';
import './rejectedApplications.css';

export const RejectedApplications = ({ applications, onRefresh }) => {
  const { t } = useTranslation();
  const { reapproveStudentApplication, deleteStudentApplication } = useAcademy();
  
  const [selectedApp, setSelectedApp] = useState(null);
  const [showReapproveModal, setShowReapproveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleReapproveClick = (app) => {
    setSelectedApp(app);
    setShowReapproveModal(true);
  };

  const handleDeleteClick = (app) => {
    setSelectedApp(app);
    setShowDeleteModal(true);
  };

  const handleDetailsClick = (app) => {
    setSelectedApp(app);
    setShowDetailsModal(true);
  };

  const handleReapprove = async () => {
    if (!selectedApp) return;
    
    setIsProcessing(true);
    try {
      await reapproveStudentApplication(selectedApp.id);
      setShowReapproveModal(false);
      setSelectedApp(null);
      onRefresh();
    } catch (error) {
      console.error('Error re-approving application:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedApp) return;
    
    setIsProcessing(true);
    try {
      await deleteStudentApplication(selectedApp.id);
      setShowDeleteModal(false);
      setSelectedApp(null);
      onRefresh();
    } catch (error) {
      console.error('Error deleting application:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (applications.length === 0) {
    return (
      <div className="rejected-applications-empty">
        <div className="rejected-applications-empty-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h3 className="rejected-applications-empty-title">{t('rejectedApplications.noApplications')}</h3>
        <p className="rejected-applications-empty-text">{t('rejectedApplications.noApplicationsDesc')}</p>
      </div>
    );
  }

  return (
    <div className="rejected-applications">
      <div className="rejected-applications-list">
        {applications.map((app) => (
          <div key={app.id} className="rejected-applications-card">
            <div className="rejected-applications-card-header">
              <div className="rejected-applications-card-avatar">
                <img 
                  src={app.userAvatar || '/images/homePage/user-it.png'} 
                  alt={app.userName}
                  onError={(e) => {
                    e.target.src = '/images/homePage/user-it.png';
                  }}
                />
                <div className="rejected-applications-card-badge">
                  {t('rejectedApplications.rejected')}
                </div>
              </div>
              <div className="rejected-applications-card-info">
                <h3 className="rejected-applications-card-name">{app.userName}</h3>
                <p className="rejected-applications-card-email">{app.userEmail}</p>
                {app.userPhone && (
                  <p className="rejected-applications-card-phone">{app.userPhone}</p>
                )}
              </div>
              <div className="rejected-applications-card-dates">
                <div className="rejected-applications-card-date">
                  <span className="rejected-applications-card-date-label">{t('rejectedApplications.appliedOn')}</span>
                  <span className="rejected-applications-card-date-value">
                    {new Date(app.createdAt).toLocaleDateString('bg-BG', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="rejected-applications-card-date">
                  <span className="rejected-applications-card-date-label">{t('rejectedApplications.rejectedOn')}</span>
                  <span className="rejected-applications-card-date-value">
                    {new Date(app.rejectedAt).toLocaleDateString('bg-BG', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>

            {app.rejectionReason && (
              <div className="rejected-applications-card-reason">
                <span className="rejected-applications-card-reason-label">{t('rejectedApplications.reason')}:</span>
                <p className="rejected-applications-card-reason-text">{app.rejectionReason}</p>
              </div>
            )}

            <div className="rejected-applications-card-actions">
              <button
                className="rejected-applications-btn rejected-applications-btn-details"
                onClick={() => handleDetailsClick(app)}
              >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 16H12V12H11M12 8H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>{t('rejectedApplications.details')}</span>
              </button>

              <button
                className="rejected-applications-btn rejected-applications-btn-reapprove"
                onClick={() => handleReapproveClick(app)}
                disabled={isProcessing}
              >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 4V9H4.58152M19.9381 11C19.446 7.05369 16.0796 4 12 4C8.64262 4 5.76829 6.06817 4.58152 9M4.58152 9H9M20 20V15H19.4185M19.4185 15C18.2317 17.9318 15.3574 20 12 20C7.92038 20 4.55399 16.9463 4.06189 13M19.4185 15H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>{t('rejectedApplications.reapprove')}</span>
              </button>

              <button
                className="rejected-applications-btn rejected-applications-btn-delete"
                onClick={() => handleDeleteClick(app)}
                disabled={isProcessing}
              >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 7L18.1327 19.1425C18.0579 20.1891 17.187 21 16.1378 21H7.86224C6.81296 21 5.94208 20.1891 5.86732 19.1425L5 7M10 11V17M14 11V17M15 7V4C15 3.44772 14.5523 3 14 3H10C9.44772 3 9 3.44772 9 4V7M4 7H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>{t('rejectedApplications.delete')}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* DETAILS MODAL */}
      {showDetailsModal && selectedApp && (
        <div className="rejected-applications-modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="rejected-applications-modal" onClick={(e) => e.stopPropagation()}>
            <div className="rejected-applications-modal-header">
              <h3 className="rejected-applications-modal-title">{t('rejectedApplications.applicationDetails')}</h3>
              <button 
                className="rejected-applications-modal-close"
                onClick={() => setShowDetailsModal(false)}
              >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <div className="rejected-applications-modal-body">
              <div className="rejected-applications-modal-detail">
                <span className="rejected-applications-modal-detail-label">{t('rejectedApplications.studentName')}:</span>
                <span className="rejected-applications-modal-detail-value">{selectedApp.userName}</span>
              </div>
              <div className="rejected-applications-modal-detail">
                <span className="rejected-applications-modal-detail-label">{t('rejectedApplications.email')}:</span>
                <span className="rejected-applications-modal-detail-value">{selectedApp.userEmail}</span>
              </div>
              {selectedApp.userPhone && (
                <div className="rejected-applications-modal-detail">
                  <span className="rejected-applications-modal-detail-label">{t('rejectedApplications.phone')}:</span>
                  <span className="rejected-applications-modal-detail-value">{selectedApp.userPhone}</span>
                </div>
              )}
              <div className="rejected-applications-modal-detail">
                <span className="rejected-applications-modal-detail-label">{t('rejectedApplications.appliedOn')}:</span>
                <span className="rejected-applications-modal-detail-value">
                  {new Date(selectedApp.createdAt).toLocaleDateString('bg-BG', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <div className="rejected-applications-modal-detail">
                <span className="rejected-applications-modal-detail-label">{t('rejectedApplications.rejectedOn')}:</span>
                <span className="rejected-applications-modal-detail-value">
                  {new Date(selectedApp.rejectedAt).toLocaleDateString('bg-BG', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              {selectedApp.rejectionReason && (
                <div className="rejected-applications-modal-detail rejected-applications-modal-detail-full">
                  <span className="rejected-applications-modal-detail-label">{t('rejectedApplications.rejectionReason')}:</span>
                  <p className="rejected-applications-modal-detail-reason">{selectedApp.rejectionReason}</p>
                </div>
              )}
            </div>
            <div className="rejected-applications-modal-footer">
              <button
                className="rejected-applications-modal-btn rejected-applications-modal-btn-secondary"
                onClick={() => setShowDetailsModal(false)}
              >
                {t('rejectedApplications.close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REAPPROVE MODAL */}
      {showReapproveModal && selectedApp && (
        <div className="rejected-applications-modal-overlay" onClick={() => !isProcessing && setShowReapproveModal(false)}>
          <div className="rejected-applications-modal" onClick={(e) => e.stopPropagation()}>
            <div className="rejected-applications-modal-header">
              <h3 className="rejected-applications-modal-title">{t('rejectedApplications.confirmReapprove')}</h3>
              <button 
                className="rejected-applications-modal-close"
                onClick={() => setShowReapproveModal(false)}
                disabled={isProcessing}
              >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <div className="rejected-applications-modal-body">
              <p className="rejected-applications-modal-text">
                {t('rejectedApplications.reapproveConfirmText', { name: selectedApp.userName })}
              </p>
            </div>
            <div className="rejected-applications-modal-footer">
              <button
                className="rejected-applications-modal-btn rejected-applications-modal-btn-cancel"
                onClick={() => setShowReapproveModal(false)}
                disabled={isProcessing}
              >
                {t('rejectedApplications.cancel')}
              </button>
              <button
                className="rejected-applications-modal-btn rejected-applications-modal-btn-confirm"
                onClick={handleReapprove}
                disabled={isProcessing}
              >
                {isProcessing ? t('rejectedApplications.processing') : t('rejectedApplications.confirmReapproveBtn')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {showDeleteModal && selectedApp && (
        <div className="rejected-applications-modal-overlay" onClick={() => !isProcessing && setShowDeleteModal(false)}>
          <div className="rejected-applications-modal" onClick={(e) => e.stopPropagation()}>
            <div className="rejected-applications-modal-header">
              <h3 className="rejected-applications-modal-title">{t('rejectedApplications.confirmDelete')}</h3>
              <button 
                className="rejected-applications-modal-close"
                onClick={() => setShowDeleteModal(false)}
                disabled={isProcessing}
              >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <div className="rejected-applications-modal-body">
              <p className="rejected-applications-modal-text">
                {t('rejectedApplications.deleteConfirmText', { name: selectedApp.userName })}
              </p>
              <div className="rejected-applications-modal-warning">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 9V11M12 15H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0377 2.66667 10.2679 4L3.33975 16C2.56995 17.3333 3.53223 19 5.07183 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>{t('rejectedApplications.deleteWarning')}</span>
              </div>
            </div>
            <div className="rejected-applications-modal-footer">
              <button
                className="rejected-applications-modal-btn rejected-applications-modal-btn-cancel"
                onClick={() => setShowDeleteModal(false)}
                disabled={isProcessing}
              >
                {t('rejectedApplications.cancel')}
              </button>
              <button
                className="rejected-applications-modal-btn rejected-applications-modal-btn-danger"
                onClick={handleDelete}
                disabled={isProcessing}
              >
                {isProcessing ? t('rejectedApplications.processing') : t('rejectedApplications.confirmDeleteBtn')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};