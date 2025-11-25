// src/components/AdminDigiBridgeStudents/AdminDgDeleteStudentConfirm/AdminDgDeleteStudentConfirm.jsx

import { useEffect, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './adminDgDeleteStudentConfirm.css';

export const AdminDgDeleteStudentConfirm = ({ student, onClose, onConfirm }) => {
  if (!student) return null;

  const { t } = useTranslation();
  const [deleting, setDeleting] = useState(false);

  const handleBackdropClick = useCallback((e) => {
    if (e.target.classList.contains('adminDgDeleteStudentConfirm-overlay')) {
      onClose();
    }
  }, [onClose]);

  const handleConfirm = async () => {
    setDeleting(true);
    try {
      await onConfirm();
    } catch (error) {
      console.error('Error deleting student:', error);
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape' && !deleting) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="adminDgDeleteStudentConfirm-overlay" onClick={handleBackdropClick}>
      <div className="adminDgDeleteStudentConfirm-container">
        {/* Icon */}
        <div className="adminDgDeleteStudentConfirm-iconWrapper">
          <div className="adminDgDeleteStudentConfirm-icon">
            <svg width="48" height="48" viewBox="0 0 48 48">
              <path d="M24 4C12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20S35.05 4 24 4zm2 30h-4v-4h4v4zm0-8h-4V14h4v12z" fill="currentColor"/>
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="adminDgDeleteStudentConfirm-content">
          <h2 className="adminDgDeleteStudentConfirm-title">
            {t('adminDgDeleteStudentConfirm.title')}
          </h2>
          <p className="adminDgDeleteStudentConfirm-message">
            {t('adminDgDeleteStudentConfirm.message')} <strong>{student.name}</strong>?
          </p>
          <p className="adminDgDeleteStudentConfirm-warning">
            {t('adminDgDeleteStudentConfirm.warning')}
          </p>

          {/* Student Info */}
          <div className="adminDgDeleteStudentConfirm-studentCard">
            <div className="adminDgDeleteStudentConfirm-studentAvatar">
              {student.avatar ? (
                <img src={student.avatar} alt={student.name} />
              ) : (
                <div className="adminDgDeleteStudentConfirm-avatarPlaceholder">
                  {student.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
              )}
            </div>
            <div className="adminDgDeleteStudentConfirm-studentInfo">
              <div className="adminDgDeleteStudentConfirm-studentName">{student.name}</div>
              <div className="adminDgDeleteStudentConfirm-studentEmail">{student.email}</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="adminDgDeleteStudentConfirm-actions">
          <button
            className="adminDgDeleteStudentConfirm-btnCancel"
            onClick={onClose}
            disabled={deleting}
            type="button"
          >
            {t('common.cancel')}
          </button>
          <button
            className="adminDgDeleteStudentConfirm-btnDelete"
            onClick={handleConfirm}
            disabled={deleting}
            type="button"
          >
            {deleting ? (
              <>
                <div className="adminDgDeleteStudentConfirm-spinner"></div>
                {t('adminDgDeleteStudentConfirm.deleting')}
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path d="M4.5 5.5A.5.5 0 0 1 5 6v9a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 0a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v9a.5.5 0 0 0 1 0V6z" fill="currentColor"/>
                  <path d="M14.5 3a1 1 0 0 1-1 1H13v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1z" fill="currentColor"/>
                </svg>
                {t('adminDgDeleteStudentConfirm.delete')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};