// src/components/AdminDigiBridgeStudents/AdminDgStudentDetailsModal/AdminDgStudentDetailsModal.jsx

import {  useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import './adminDgStudentDetailsModal.css';

export const AdminDgStudentDetailsModal = ({ student, onClose }) => {
  const { t } = useTranslation();

//   if (!student) return null;

  const formatDate = (dateString) => {
    if (!dateString) return t('notAvailable');
    const date = new Date(dateString);
    return date.toLocaleDateString('bg-BG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

   const handleBackdropClick = useCallback((e) => {
    if (e.target.classList.contains('adminDgStudentDetailsModal-overlay')) {
      onClose();
    }
  }, [onClose]);

//    // ✅ ESC KEY + BODY SCROLL
//   useEffect(() => {
//     const handleEscKey = (e) => {
//       if (e.key === 'Escape') {
//         onClose();
//       }
//     };

//     document.addEventListener('keydown', handleEscKey);
//     document.body.style.overflow = 'hidden';

//     return () => {
//       document.removeEventListener('keydown', handleEscKey);
//       document.body.style.overflow = 'unset';
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

  return (
    <div className="adminDgStudentDetailsModal-overlay" onClick={handleBackdropClick}>
      <div className="adminDgStudentDetailsModal-container">
        {/* Header */}
        <div className="adminDgStudentDetailsModal-header">
          <h2 className="adminDgStudentDetailsModal-title">
            {t('adminDgStudentDetailsModal.title')}
          </h2>
          <button
            className="adminDgStudentDetailsModal-closeBtn"
            onClick={onClose}
            type="button"
            aria-label="Close"
          >
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="adminDgStudentDetailsModal-content">
          {/* Student Profile Section */}
          <div className="adminDgStudentDetailsModal-section adminDgStudentDetailsModal-profileSection">
            <div className="adminDgStudentDetailsModal-avatarWrapper">
              {student?.avatar ? (
                <img 
                  src={student?.avatar} 
                  alt={student?.name}
                  className="adminDgStudentDetailsModal-avatar"
                />
              ) : (
                <div className="adminDgStudentDetailsModal-avatarPlaceholder">
                  {student?.name.charAt(0)?.toUpperCase() || '?'}
                </div>
              )}
            </div>
            <div className="adminDgStudentDetailsModal-profileInfo">
              <h3 className="adminDgStudentDetailsModal-studentName">{student?.name}</h3>
              <p className="adminDgStudentDetailsModal-studentEmail">{student?.email}</p>
              {student?.phone && (
                <p className="adminDgStudentDetailsModal-studentPhone">
                  <svg width="16" height="16" viewBox="0 0 16 16">
                    <path d="M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.568 17.568 0 0 0 4.168 6.608 17.569 17.569 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.678.678 0 0 0-.58-.122l-2.19.547a1.745 1.745 0 0 1-1.657-.459L5.482 8.062a1.745 1.745 0 0 1-.46-1.657l.548-2.19a.678.678 0 0 0-.122-.58L3.654 1.328z" fill="currentColor"/>
                  </svg>
                  {student?.phone}
                </p>
              )}
            </div>
            <div className="adminDgStudentDetailsModal-statusBadge">
              <span className={`adminDgStudentDetailsModal-status adminDgStudentDetailsModal-status--${student?.status}`}>
                {t(`adminDigiBridgeStudents.table.${student?.status}`)}
              </span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="adminDgStudentDetailsModal-statsGrid">
            <div className="adminDgStudentDetailsModal-statCard">
              <div className="adminDgStudentDetailsModal-statIcon" style={{ background: '#eff6ff', color: '#2563eb' }}>
                ⭐
              </div>
              <div className="adminDgStudentDetailsModal-statInfo">
                <div className="adminDgStudentDetailsModal-statValue">{student?.totalCreditsEarned || 0}</div>
                <div className="adminDgStudentDetailsModal-statLabel">
                  {t('adminDgStudentDetailsModal.totalCredits')}
                </div>
              </div>
            </div>

            <div className="adminDgStudentDetailsModal-statCard">
              <div className="adminDgStudentDetailsModal-statIcon" style={{ background: '#f0fdfa', color: '#14b8a6' }}>
                📅
              </div>
              <div className="adminDgStudentDetailsModal-statInfo">
                <div className="adminDgStudentDetailsModal-statValue">{student?.attendanceRate || 0}%</div>
                <div className="adminDgStudentDetailsModal-statLabel">
                  {t('adminDgStudentDetailsModal.attendanceRate')}
                </div>
              </div>
            </div>
          </div>

          {/* Mentor Section */}
          <div className="adminDgStudentDetailsModal-section">
            <h4 className="adminDgStudentDetailsModal-sectionTitle">
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path d="M9 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm0 9c-3 0-9 1.5-9 4.5V17h18v-1.5c0-3-6-4.5-9-4.5z" fill="currentColor"/>
              </svg>
              {t('adminDgStudentDetailsModal.currentMentor')}
            </h4>
            {student?.currentMentor ? (
              <div className="adminDgStudentDetailsModal-mentorCard">
                <div className="adminDgStudentDetailsModal-mentorAvatar">
                  {student?.currentMentor?.photoUrl ? (
                    <img src={student?.currentMentor?.photoUrl} alt={student?.currentMentor?.name} />
                  ) : (
                    <div className="adminDgStudentDetailsModal-mentorAvatarPlaceholder">
                      {student?.currentMentor?.name?.charAt(0)?.toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="adminDgStudentDetailsModal-mentorInfo">
                  <div className="adminDgStudentDetailsModal-mentorName">
                    {student?.currentMentor?.name}
                  </div>
                  <div className="adminDgStudentDetailsModal-mentorRole">
                    {t('adminDgStudentDetailsModal.mentor')}
                  </div>
                </div>
              </div>
            ) : (
              <div className="adminDgStudentDetailsModal-noMentor">
                <svg width="48" height="48" viewBox="0 0 48 48">
                  <path d="M24 8c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm0 18c-6 0-18 3-18 9v3h36v-3c0-6-12-9-18-9z" fill="currentColor" opacity="0.3"/>
                </svg>
                <p>{t('adminDgStudentDetailsModal.noMentorAssigned')}</p>
              </div>
            )}
          </div>

          {/* Additional Info */}
          <div className="adminDgStudentDetailsModal-section">
            <h4 className="adminDgStudentDetailsModal-sectionTitle">
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path d="M14 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H4V4h10v12z" fill="currentColor"/>
                <path d="M6 6h6v2H6zm0 3h6v2H6zm0 3h4v2H6z" fill="currentColor"/>
              </svg>
              {t('adminDgStudentDetailsModal.additionalInfo')}
            </h4>
            <div className="adminDgStudentDetailsModal-infoGrid">
              <div className="adminDgStudentDetailsModal-infoRow">
                <span className="adminDgStudentDetailsModal-infoLabel">
                  {t('adminDgStudentDetailsModal.registrationDate')}:
                </span>
                <span className="adminDgStudentDetailsModal-infoValue">
                  {formatDate(student?.registrationDate)}
                </span>
              </div>
              <div className="adminDgStudentDetailsModal-infoRow">
                <span className="adminDgStudentDetailsModal-infoLabel">
                  {t('adminDgStudentDetailsModal.lastActive')}:
                </span>
                <span className="adminDgStudentDetailsModal-infoValue">
                  {formatDate(student?.lastActiveAt)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="adminDgStudentDetailsModal-footer">
          <button
            className="adminDgStudentDetailsModal-btnSecondary"
            onClick={onClose}
            type="button"
          >
            {t('adminDgStudentDetailsModal.close')}
          </button>
        </div>
      </div>
    </div>
  );
};