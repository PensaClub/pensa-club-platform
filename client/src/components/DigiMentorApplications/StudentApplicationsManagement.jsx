import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAcademy } from '../contexts/AcademyProvider';

import './studentApplicationsManagement.css';
import { PendingApplications } from './PendingApplications';
import { RejectedApplications } from './RejectedApplications';
import { ApprovedApplications } from './ApprovedApplications';

export const StudentApplicationsManagement = () => {
  const { t } = useTranslation('digibridge-mentor');
  const { getStudentApplications } = useAcademy();
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const response = await getStudentApplications();
      if (response.success) {
        setApplications(response.applications || []);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const pendingApps = applications.filter(app => app.status === 'pending');
  const rejectedApps = applications.filter(app => app.status === 'rejected');
  const approvedApps = applications.filter(app => app.status === 'approved');

  return (
    <div className="student-applications-management">
      <div className="student-applications-management-header">
        <h1 className="student-applications-management-title">{t('studentApplications.title')}</h1>
        <p className="student-applications-management-subtitle">
          {t('studentApplications.subtitle')}
        </p>
      </div>

      <div className="student-applications-management-tabs">
        <button
          className={`student-applications-management-tab-button ${activeTab === 'pending' ? 'student-applications-management-tab-button-active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          <span className="student-applications-management-tab-text">{t('studentApplications.tabs.pending')}</span>
          {pendingApps.length > 0 && (
            <span className="student-applications-management-tab-badge">{pendingApps.length}</span>
          )}
        </button>

        <button
          className={`student-applications-management-tab-button ${activeTab === 'rejected' ? 'student-applications-management-tab-button-active' : ''}`}
          onClick={() => setActiveTab('rejected')}
        >
          <span className="student-applications-management-tab-text">{t('studentApplications.tabs.rejected')}</span>
          {rejectedApps.length > 0 && (
            <span className="student-applications-management-tab-badge student-applications-management-tab-badge-rejected">{rejectedApps.length}</span>
          )}
        </button>

        <button
          className={`student-applications-management-tab-button ${activeTab === 'approved' ? 'student-applications-management-tab-button-active' : ''}`}
          onClick={() => setActiveTab('approved')}
        >
          <span className="student-applications-management-tab-text">{t('studentApplications.tabs.approved')}</span>
          {approvedApps.length > 0 && (
            <span className="student-applications-management-tab-badge student-applications-management-tab-badge-approved">{approvedApps.length}</span>
          )}
        </button>
      </div>

      <div className="student-applications-management-content">
        {isLoading ? (
          <div className="student-applications-management-loading">
            <div className="student-applications-management-spinner"></div>
            <p className="student-applications-management-loading-text">{t('studentApplications.loading')}</p>
          </div>
        ) : (
          <>
            {activeTab === 'pending' && (
              <PendingApplications
                applications={pendingApps}
                onRefresh={fetchApplications}
              />
            )}

            {activeTab === 'rejected' && (
              <RejectedApplications
                applications={rejectedApps}
                onRefresh={fetchApplications}
              />
            )}

            {activeTab === 'approved' && (
              <ApprovedApplications
                applications={approvedApps}
                onRefresh={fetchApplications}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};