import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAcademy } from '../contexts/AcademyProvider';
import { toast } from 'react-toastify';
import './pendingApplications.css';

export const PendingApplications = ({ applications, onRefresh }) => {
  const { t } = useTranslation();
  const { approveStudentApplication, rejectStudentApplication } = useAcademy();
  
  const [selectedApp, setSelectedApp] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApproveClick = (app) => {
    setSelectedApp(app);
    setShowApproveModal(true);
  };

  const handleRejectClick = (app) => {
    setSelectedApp(app);
    setShowRejectModal(true);
    setRejectionReason('');
  };

  const handleApprove = async () => {
    if (!selectedApp) return;
    
    setIsProcessing(true);
    try {
      await approveStudentApplication(selectedApp.id);
      setShowApproveModal(false);
      setSelectedApp(null);
      onRefresh();
    } catch (error) {
      console.error('Error approving application:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedApp || !rejectionReason.trim()) {
      toast.error(t('pendingApplications.rejectReasonRequired'));
      return;
    }

    if (rejectionReason.trim().length < 10) {
      toast.error(t('pendingApplications.rejectReasonTooShort'));
      return;
    }
    
    setIsProcessing(true);
    try {
      await rejectStudentApplication(selectedApp.id, rejectionReason.trim());
      setShowRejectModal(false);
      setSelectedApp(null);
      setRejectionReason('');
      onRefresh();
    } catch (error) {
      console.error('Error rejecting application:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (applications.length === 0) {
    return (
      <div className="pending-applications-empty">
        <div className="pending-applications-empty-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h3 className="pending-applications-empty-title">{t('pendingApplications.noApplications')}</h3>
        <p className="pending-applications-empty-text">{t('pendingApplications.noApplicationsDesc')}</p>
      </div>
    );
  }

  return (
    <div className="pending-applications">
      <div className="pending-applications-list">
        {applications.map((app) => (
          <div key={app.id} className="pending-applications-card">
            <div className="pending-applications-card-header">
              <div className="pending-applications-card-avatar">
                <img 
                  src={app.userAvatar || '/images/homePage/user-it.png'} 
                  alt={app.userName}
                  onError={(e) => {
                    e.target.src = '/images/homePage/user-it.png';
                  }}
                />
              </div>
              <div className="pending-applications-card-info">
                <h3 className="pending-applications-card-name">{app.userName}</h3>
                <p className="pending-applications-card-email">{app.userEmail}</p>
                {app.userPhone && (
                  <p className="pending-applications-card-phone">{app.userPhone}</p>
                )}
              </div>
              <div className="pending-applications-card-date">
                <span className="pending-applications-card-date-label">{t('pendingApplications.appliedOn')}</span>
                <span className="pending-applications-card-date-value">
                  {new Date(app.createdAt).toLocaleDateString('bg-BG', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>

            <div className="pending-applications-card-actions">
              <button
                className="pending-applications-btn pending-applications-btn-approve"
                onClick={() => handleApproveClick(app)}
                disabled={isProcessing}
              >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>{t('pendingApplications.approve')}</span>
              </button>

              <button
                className="pending-applications-btn pending-applications-btn-reject"
                onClick={() => handleRejectClick(app)}
                disabled={isProcessing}
              >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 14L12 12M12 12L14 10M12 12L10 10M12 12L14 14M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>{t('pendingApplications.reject')}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* APPROVE MODAL */}
      {showApproveModal && selectedApp && (
        <div className="pending-applications-modal-overlay" onClick={() => !isProcessing && setShowApproveModal(false)}>
          <div className="pending-applications-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pending-applications-modal-header">
              <h3 className="pending-applications-modal-title">{t('pendingApplications.confirmApprove')}</h3>
              <button 
                className="pending-applications-modal-close"
                onClick={() => setShowApproveModal(false)}
                disabled={isProcessing}
              >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <div className="pending-applications-modal-body">
              <p className="pending-applications-modal-text">
                {t('pendingApplications.approveConfirmText', { name: selectedApp.userName })}
              </p>
            </div>
            <div className="pending-applications-modal-footer">
              <button
                className="pending-applications-modal-btn pending-applications-modal-btn-cancel"
                onClick={() => setShowApproveModal(false)}
                disabled={isProcessing}
              >
                {t('pendingApplications.cancel')}
              </button>
              <button
                className="pending-applications-modal-btn pending-applications-modal-btn-confirm"
                onClick={handleApprove}
                disabled={isProcessing}
              >
                {isProcessing ? t('pendingApplications.processing') : t('pendingApplications.confirmApproveBtn')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {showRejectModal && selectedApp && (
        <div className="pending-applications-modal-overlay" onClick={() => !isProcessing && setShowRejectModal(false)}>
          <div className="pending-applications-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pending-applications-modal-header">
              <h3 className="pending-applications-modal-title">{t('pendingApplications.confirmReject')}</h3>
              <button 
                className="pending-applications-modal-close"
                onClick={() => setShowRejectModal(false)}
                disabled={isProcessing}
              >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <div className="pending-applications-modal-body">
              <p className="pending-applications-modal-text">
                {t('pendingApplications.rejectConfirmText', { name: selectedApp.userName })}
              </p>
              <div className="pending-applications-modal-form">
                <label className="pending-applications-modal-label">
                  {t('pendingApplications.rejectionReason')}
                </label>
                <textarea
                  className="pending-applications-modal-textarea"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder={t('pendingApplications.rejectionReasonPlaceholder')}
                  rows={4}
                  disabled={isProcessing}
                  maxLength={500}
                />
                <span className="pending-applications-modal-char-count">
                  {rejectionReason.length}/500
                </span>
              </div>
            </div>
            <div className="pending-applications-modal-footer">
              <button
                className="pending-applications-modal-btn pending-applications-modal-btn-cancel"
                onClick={() => setShowRejectModal(false)}
                disabled={isProcessing}
              >
                {t('pendingApplications.cancel')}
              </button>
              <button
                className="pending-applications-modal-btn pending-applications-modal-btn-danger"
                onClick={handleReject}
                disabled={isProcessing || rejectionReason.trim().length < 10}
              >
                {isProcessing ? t('pendingApplications.processing') : t('pendingApplications.confirmRejectBtn')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};