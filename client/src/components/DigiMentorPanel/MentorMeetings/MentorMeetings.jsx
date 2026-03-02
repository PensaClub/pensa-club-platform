// client/src/components/DigiMentorPanel/MentorMeetings/MentorMeetings.jsx

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { bg, enUS, de } from 'date-fns/locale';
import { useAcademy } from '../../contexts/AcademyProvider';
// import { AddMeetingModal } from './AddMeetingModal';
// import { CompleteMeetingModal } from './CompleteMeetingModal';
// import { EditMeetingModal } from './EditMeetingModal';
import './mentorMeetings.css';
import { AddMeetingModal } from './AddMeetingModal';
import { EditMeetingModal } from './EditMeetingModal';
import { CompleteMeetingModal } from './CompleteMeetingModal';

export const MentorMeetings = ({ meetings = [], onRefresh }) => {
  const { t, i18n } = useTranslation('digibridge-mentor');
  const [activeTab, setActiveTab] = useState('scheduled'); // scheduled | completed
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
const { cancelMentorMeeting } = useAcademy();
  const getLocale = () => {
    switch (i18n.language) {
      case 'bg': return bg;
      case 'de': return de;
      default: return enUS;
    }
  };

  const getMeetingTypeIcon = (type) => {
    switch (type) {
      case 'viber':
        return (
          <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        );
      case 'google_meet':
        return (
          <path d="M15 10L19 14M19 10L15 14M21 16.92V7.08C21 6.48 20.6 6 20.08 6H8C6.9 6 6 6.9 6 8V16C6 17.1 6.9 18 8 18H20.08C20.6 18 21 17.52 21 16.92ZM3 6V18M3 12H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        );
      case 'phone':
        return (
          <path d="M22 16.92V19.92C22 20.49 21.56 20.99 20.99 21C9.28 20.98 2.01 13.72 2 2.01C2 1.45 2.5 1 3.07 1H6.07C6.64 1 7.14 1.45 7.14 2.02C7.14 3.11 7.34 4.16 7.72 5.14C7.86 5.51 7.75 5.93 7.47 6.21L5.9 7.78C7.43 10.81 10.2 13.58 13.23 15.11L14.79 13.54C15.08 13.26 15.5 13.15 15.87 13.29C16.85 13.67 17.9 13.87 18.99 13.87C19.56 13.87 20.01 14.37 20.01 14.94V17.94C20.01 18.51 19.56 19.01 18.99 19.01H16.99" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        );
      case 'in_person':
        return (
          <path d="M17 20C17 18.3431 14.7614 17 12 17C9.23858 17 7 18.3431 7 20M12 14C10.3431 14 9 12.6569 9 11C9 9.34315 10.3431 8 12 8C13.6569 8 15 9.34315 15 11C15 12.6569 13.6569 14 12 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        );
      default:
        return (
          <path d="M8 7V3M16 7V3M7 11H17M5 21H19C20.1046 21 21 20.1046 21 19V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V19C3 20.1046 3.89543 21 5 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        );
    }
  };

  const getMeetingTypeColor = (type) => {
    switch (type) {
      case 'viber': return 'purple';
      case 'google_meet': return 'blue';
      case 'phone': return 'green';
      case 'in_person': return 'orange';
      default: return 'gray';
    }
  };

  const filteredMeetings = meetings.filter(meeting => meeting.status === activeTab);

  const handleAddMeeting = () => {
    setShowAddModal(true);
  };

  const handleEditMeeting = (meeting) => {
    setSelectedMeeting(meeting);
    setShowEditModal(true);
  };

  const handleCompleteMeeting = (meeting) => {
    setSelectedMeeting(meeting);
    setShowCompleteModal(true);
  };

    const handleCancelMeeting = async (meetingId) => {
    if (window.confirm(t('mentorMeetings.confirmCancel'))) {
      try {
        const result = await cancelMentorMeeting(meetingId);
        if (result.success) {
          onRefresh?.();
        }
      } catch (error) {
        console.error('Error canceling meeting:', error);
        alert(t('mentorMeetings.errorCancel'));
      }
    }
  };

  if (!meetings || meetings.length === 0) {
    return (
      <div className="mentor-meetings">
        <div className="mentor-meetings-header">
          <h2 className="mentor-meetings-title">{t('mentorMeetings.title')}</h2>
          <button className="mentor-meetings-add-btn" onClick={handleAddMeeting}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {t('mentorMeetings.addMeeting')}
          </button>
        </div>
        <div className="mentor-meetings-empty">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 7V3M16 7V3M7 11H17M5 21H19C20.1046 21 21 20.1046 21 19V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V19C3 20.1046 3.89543 21 5 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p>{t('mentorMeetings.noMeetings')}</p>
        </div>

        {showAddModal && (
          <AddMeetingModal
            onClose={() => setShowAddModal(false)}
            onSuccess={() => {
              setShowAddModal(false);
              onRefresh?.();
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="mentor-meetings">
      <div className="mentor-meetings-header">
        <h2 className="mentor-meetings-title">{t('mentorMeetings.title')}</h2>
        <button className="mentor-meetings-add-btn" onClick={handleAddMeeting}>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {t('mentorMeetings.addMeeting')}
        </button>
      </div>

      {/* TABS */}
      <div className="mentor-meetings-tabs">
        <button
          className={`mentor-meetings-tab ${activeTab === 'scheduled' ? 'mentor-meetings-tab-active' : ''}`}
          onClick={() => setActiveTab('scheduled')}
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {t('mentorMeetings.tabs.scheduled')}
          <span className="mentor-meetings-tab-badge">
            {meetings.filter(m => m.status === 'scheduled').length}
          </span>
        </button>
        <button
          className={`mentor-meetings-tab ${activeTab === 'completed' ? 'mentor-meetings-tab-active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {t('mentorMeetings.tabs.completed')}
          <span className="mentor-meetings-tab-badge">
            {meetings.filter(m => m.status === 'completed').length}
          </span>
        </button>
      </div>

      {/* MEETINGS LIST */}
      {filteredMeetings.length === 0 ? (
        <div className="mentor-meetings-no-results">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 7V3M16 7V3M7 11H17M5 21H19C20.1046 21 21 20.1046 21 19V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V19C3 20.1046 3.89543 21 5 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p>{t(`mentorMeetings.noResults.${activeTab}`)}</p>
        </div>
      ) : (
        <div className="mentor-meetings-list">
          {filteredMeetings.map((meeting) => (
            <div key={meeting.id} className="mentor-meetings-card">
              <div className="mentor-meetings-card-header">
                <div className={`mentor-meetings-type-icon mentor-meetings-type-icon-${getMeetingTypeColor(meeting.meetingType)}`}>
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {getMeetingTypeIcon(meeting.meetingType)}
                  </svg>
                </div>
                <div className="mentor-meetings-card-title-section">
                  <h3 className="mentor-meetings-card-title">{meeting.title}</h3>
                  <span className="mentor-meetings-type-label">
                    {t(`mentorMeetings.types.${meeting.meetingType}`)}
                  </span>
                </div>
              </div>

              <div className="mentor-meetings-card-body">
                {meeting.studentName && (
                  <div className="mentor-meetings-info-item">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17 20C17 18.3431 14.7614 17 12 17C9.23858 17 7 18.3431 7 20M12 14C10.3431 14 9 12.6569 9 11C9 9.34315 10.3431 8 12 8C13.6569 8 15 9.34315 15 11C15 12.6569 13.6569 14 12 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>{meeting.studentName}</span>
                  </div>
                )}

                <div className="mentor-meetings-info-row">
                  <div className="mentor-meetings-info-item">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 7V3M16 7V3M7 11H17M5 21H19C20.1046 21 21 20.1046 21 19V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V19C3 20.1046 3.89543 21 5 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>{format(new Date(meeting.scheduledDate), 'PPP', { locale: getLocale() })}</span>
                  </div>
                  <div className="mentor-meetings-info-item">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>{meeting.scheduledTime}</span>
                  </div>
                </div>

                <div className="mentor-meetings-info-item">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 6V12L16 14M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>
                    {meeting.status === 'completed' && meeting.actualDuration
                      ? `${meeting.actualDuration} ${t('mentorMeetings.minutes')} (${t('mentorMeetings.actual')})`
                      : `${meeting.plannedDuration} ${t('mentorMeetings.minutes')}`
                    }
                  </span>
                </div>

                {meeting.notes && (
                  <div className="mentor-meetings-notes">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5M12 12H15M12 16H15M9 12H9.01M9 16H9.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <p>{meeting.notes}</p>
                  </div>
                )}
              </div>

              <div className="mentor-meetings-card-footer">
                {meeting.status === 'scheduled' ? (
                  <>
                    <button
                      className="mentor-meetings-btn mentor-meetings-btn-primary"
                      onClick={() => handleCompleteMeeting(meeting)}
                    >
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {t('mentorMeetings.markComplete')}
                    </button>
                    <button
                      className="mentor-meetings-btn mentor-meetings-btn-secondary"
                      onClick={() => handleEditMeeting(meeting)}
                    >
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11 5H6C4.89543 5 4 5.89543 4 7V18C4 19.1046 4.89543 20 6 20H17C18.1046 20 19 19.1046 19 18V13M17.5858 3.58579C18.3668 2.80474 19.6332 2.80474 20.4142 3.58579C21.1953 4.36683 21.1953 5.63316 20.4142 6.41421L11.8284 15H9L9 12.1716L17.5858 3.58579Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {t('mentorMeetings.edit')}
                    </button>
                    <button
                      className="mentor-meetings-btn mentor-meetings-btn-danger"
                      onClick={() => handleCancelMeeting(meeting.id)}
                    >
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 18L18 6M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {t('mentorMeetings.cancel')}
                    </button>
                  </>
                ) : (
                  <div className="mentor-meetings-completed-badge">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {t('mentorMeetings.completed')}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODALS */}
      {showAddModal && (
        <AddMeetingModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            onRefresh?.();
          }}
        />
      )}

      {showEditModal && selectedMeeting && (
        <EditMeetingModal
          meeting={selectedMeeting}
          onClose={() => {
            setShowEditModal(false);
            setSelectedMeeting(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedMeeting(null);
            onRefresh?.();
          }}
        />
      )}

      {showCompleteModal && selectedMeeting && (
        <CompleteMeetingModal
          meeting={selectedMeeting}
          onClose={() => {
            setShowCompleteModal(false);
            setSelectedMeeting(null);
          }}
          onSuccess={() => {
            setShowCompleteModal(false);
            setSelectedMeeting(null);
            onRefresh?.();
          }}
        />
      )}
    </div>
  );
};