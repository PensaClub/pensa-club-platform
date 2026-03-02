// src/components/AdminDigiBridgeStudents/AdminDgChangeMentorModal/AdminDgChangeMentorModal.jsx

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAcademy } from '../../contexts/AcademyProvider';
import './adminDgChangeMentorModal.css';

export const AdminDgChangeMentorModal = ({ student, onClose, onAssign }) => {
  const { t } = useTranslation('digibridge-students');
  const { getAllMentors } = useAcademy();

  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMentor, setSelectedMentor] = useState(null);

  // Fetch mentors on mount
  useEffect(() => {
    const fetchMentors = async () => {
      setLoading(true);
      try {
        // ✅ Използваме getAllMentors с филтър за активни ментори
        const response = await getAllMentors({ status: 'active', limit: 100 });
        
        // ✅ Обработваме response-а правилно
        if (response?.success && response?.mentors) {
          setMentors(response.mentors);
        } else if (Array.isArray(response)) {
          setMentors(response);
        } else if (response?.mentors) {
          setMentors(response.mentors);
        } else {
          setMentors([]);
        }
      } catch (error) {
        console.error('Error fetching mentors:', error);
        setMentors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMentors();
  }, [getAllMentors]);

  // Filter mentors by search
  const filteredMentors = mentors.filter(mentor => {
    if (!searchTerm.trim()) return true;
    const search = searchTerm.toLowerCase();
    return (
      mentor.name?.toLowerCase().includes(search) ||
      mentor.email?.toLowerCase().includes(search) ||
      mentor.specialization?.toLowerCase().includes(search)
    );
  });

  // Backdrop click handler
  const handleBackdropClick = useCallback((e) => {
    if (e.target.classList.contains('adminDgChangeMentorModal-overlay')) {
      onClose();
    }
  }, [onClose]);

  // ESC key handler
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape' && !assigning) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [assigning, onClose]);

  // Handle assign
  const handleAssign = async () => {
    if (!selectedMentor) return;

    setAssigning(true);
    try {
      await onAssign(student.id, selectedMentor.id);
    } catch (error) {
      console.error('Error assigning mentor:', error);
    } finally {
      setAssigning(false);
    }
  };

  // Check if mentor is current
  const isCurrentMentor = (mentorId) => {
    return student?.currentMentor?.id === mentorId;
  };

  if (!student) return null;

  return (
    <div className="adminDgChangeMentorModal-overlay" onClick={handleBackdropClick}>
      <div className="adminDgChangeMentorModal-container">
        {/* Header */}
        <div className="adminDgChangeMentorModal-header">
          <h2 className="adminDgChangeMentorModal-title">
            {t('adminDgChangeMentorModal.title')}
          </h2>
          <button
            className="adminDgChangeMentorModal-closeBtn"
            onClick={onClose}
            disabled={assigning}
            type="button"
            aria-label="Close"
          >
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="adminDgChangeMentorModal-content">
          {/* Student Info */}
          <div className="adminDgChangeMentorModal-studentInfo">
            <div className="adminDgChangeMentorModal-studentAvatar">
              {student.avatar ? (
                <img src={student.avatar} alt={student.name} />
              ) : (
                <div className="adminDgChangeMentorModal-avatarPlaceholder">
                  {student.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
              )}
            </div>
            <div className="adminDgChangeMentorModal-studentDetails">
              <div className="adminDgChangeMentorModal-studentName">{student.name}</div>
              <div className="adminDgChangeMentorModal-studentEmail">{student.email}</div>
            </div>
          </div>

          {/* Current Mentor */}
          {student.currentMentor && (
            <div className="adminDgChangeMentorModal-currentMentor">
              <span className="adminDgChangeMentorModal-currentLabel">
                {t('adminDgChangeMentorModal.currentMentor')}:
              </span>
              <div className="adminDgChangeMentorModal-currentMentorCard">
                <div className="adminDgChangeMentorModal-mentorAvatar">
                  {student.currentMentor.photoUrl ? (
                    <img src={student.currentMentor.photoUrl} alt={student.currentMentor.name} />
                  ) : (
                    <div className="adminDgChangeMentorModal-mentorAvatarPlaceholder">
                      {student.currentMentor.name?.charAt(0)?.toUpperCase()}
                    </div>
                  )}
                </div>
                <span className="adminDgChangeMentorModal-currentMentorName">
                  {student.currentMentor.name}
                </span>
              </div>
            </div>
          )}

          {/* Search */}
          <div className="adminDgChangeMentorModal-search">
            <svg className="adminDgChangeMentorModal-searchIcon" width="18" height="18" viewBox="0 0 18 18">
              <path d="M12.5 11h-.79l-.28-.27C12.41 9.59 13 8.11 13 6.5 13 2.91 10.09 0 6.5 0S0 2.91 0 6.5 2.91 13 6.5 13c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L17.49 16l-4.99-5zm-6 0C4.01 11 2 8.99 2 6.5S4.01 2 6.5 2 11 4.01 11 6.5 8.99 11 6.5 11z" fill="currentColor"/>
            </svg>
            <input
              type="text"
              className="adminDgChangeMentorModal-searchInput"
              placeholder={t('adminDgChangeMentorModal.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={loading || assigning}
            />
            {searchTerm && (
              <button
                className="adminDgChangeMentorModal-clearSearch"
                onClick={() => setSearchTerm('')}
                type="button"
              >
                <svg width="16" height="16" viewBox="0 0 16 16">
                  <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="2" fill="none"/>
                </svg>
              </button>
            )}
          </div>

          {/* Mentors List */}
          <div className="adminDgChangeMentorModal-mentorsList">
            {loading ? (
              <div className="adminDgChangeMentorModal-loading">
                <div className="adminDgChangeMentorModal-spinner"></div>
                <span>{t('common.loading')}</span>
              </div>
            ) : filteredMentors.length === 0 ? (
              <div className="adminDgChangeMentorModal-empty">
                <svg width="48" height="48" viewBox="0 0 48 48">
                  <path d="M24 8c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm0 18c-6 0-18 3-18 9v3h36v-3c0-6-12-9-18-9z" fill="currentColor" opacity="0.3"/>
                </svg>
                <span>{t('adminDgChangeMentorModal.noMentorsFound')}</span>
              </div>
            ) : (
              filteredMentors.map((mentor) => (
                <div
                  key={mentor.id}
                  className={`adminDgChangeMentorModal-mentorCard ${
                    selectedMentor?.id === mentor.id ? 'adminDgChangeMentorModal-mentorCard--selected' : ''
                  } ${isCurrentMentor(mentor.id) ? 'adminDgChangeMentorModal-mentorCard--current' : ''}`}
                  onClick={() => !isCurrentMentor(mentor.id) && setSelectedMentor(mentor)}
                >
                  <div className="adminDgChangeMentorModal-mentorAvatar">
                    {mentor.photoUrl ? (
                      <img src={mentor.photoUrl} alt={mentor.name} />
                    ) : (
                      <div className="adminDgChangeMentorModal-mentorAvatarPlaceholder">
                        {mentor.name?.charAt(0)?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="adminDgChangeMentorModal-mentorInfo">
                    <div className="adminDgChangeMentorModal-mentorName">
                      {mentor.name}
                      {isCurrentMentor(mentor.id) && (
                        <span className="adminDgChangeMentorModal-currentBadge">
                          {t('adminDgChangeMentorModal.current')}
                        </span>
                      )}
                    </div>
                    <div className="adminDgChangeMentorModal-mentorMeta">
                      {mentor.specialization && (
                        <span className="adminDgChangeMentorModal-specialization">
                          {mentor.specialization}
                        </span>
                      )}
                      <span className="adminDgChangeMentorModal-students">
                        {mentor.studentsCount || 0} {t('adminDgChangeMentorModal.students')}
                      </span>
                    </div>
                  </div>
                  {selectedMentor?.id === mentor.id && (
                    <div className="adminDgChangeMentorModal-checkmark">
                      <svg width="20" height="20" viewBox="0 0 20 20">
                        <path d="M16 5L8 13l-4-4" stroke="currentColor" strokeWidth="2" fill="none"/>
                      </svg>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="adminDgChangeMentorModal-footer">
          <button
            className="adminDgChangeMentorModal-btnCancel"
            onClick={onClose}
            disabled={assigning}
            type="button"
          >
            {t('common.cancel')}
          </button>
          <button
            className="adminDgChangeMentorModal-btnAssign"
            onClick={handleAssign}
            disabled={!selectedMentor || assigning}
            type="button"
          >
            {assigning ? (
              <>
                <div className="adminDgChangeMentorModal-btnSpinner"></div>
                {t('adminDgChangeMentorModal.assigning')}
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path d="M9 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm0 9c-3 0-9 1.5-9 4.5V17h18v-1.5c0-3-6-4.5-9-4.5z" fill="currentColor"/>
                </svg>
                {t('adminDgChangeMentorModal.assign')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};