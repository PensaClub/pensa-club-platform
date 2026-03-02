// client/src/components/DigiMentorPanel/MentorMeetings/CompleteMeetingModal.jsx

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAcademy } from '../../contexts/AcademyProvider';
import './completeMeetingModal.css';

export const CompleteMeetingModal = ({ meeting, onClose, onSuccess }) => {
  const { t } = useTranslation('digibridge-mentor');
  const { completeMentorMeeting } = useAcademy();
  
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    actualDuration: meeting?.plannedDuration || 60,
    completionNotes: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.actualDuration || formData.actualDuration <= 0) {
      setErrorMessage(t('completeMeetingModal.errors.durationRequired'));
      return;
    }

    setIsSaving(true);
    setErrorMessage('');

    try {
      const result = await completeMentorMeeting(meeting.id, formData);
      if (result.success) {
        onSuccess?.();
      } else {
        setErrorMessage(result.message || t('completeMeetingModal.errors.saveFailed'));
      }
    } catch (error) {
      console.error('Error completing meeting:', error);
      setErrorMessage(t('completeMeetingModal.errors.saveFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="complete-meeting-modal-overlay" onClick={onClose}>
      <div className="complete-meeting-modal" onClick={(e) => e.stopPropagation()}>
        <div className="complete-meeting-modal-header">
          <h2 className="complete-meeting-modal-title">{t('completeMeetingModal.title')}</h2>
          <button className="complete-meeting-modal-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 18L18 6M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* MEETING INFO */}
        <div className="complete-meeting-modal-info">
          <div className="complete-meeting-modal-info-item">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 7V3M16 7V3M7 11H17M5 21H19C20.1046 21 21 20.1046 21 19V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V19C3 20.1046 3.89543 21 5 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div>
              <span className="complete-meeting-modal-info-label">{t('completeMeetingModal.meetingTitle')}</span>
              <span className="complete-meeting-modal-info-value">{meeting?.title}</span>
            </div>
          </div>

          {meeting?.studentName && (
            <div className="complete-meeting-modal-info-item">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 20C17 18.3431 14.7614 17 12 17C9.23858 17 7 18.3431 7 20M12 14C10.3431 14 9 12.6569 9 11C9 9.34315 10.3431 8 12 8C13.6569 8 15 9.34315 15 11C15 12.6569 13.6569 14 12 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div>
                <span className="complete-meeting-modal-info-label">{t('completeMeetingModal.student')}</span>
                <span className="complete-meeting-modal-info-value">{meeting?.studentName}</span>
              </div>
            </div>
          )}

          <div className="complete-meeting-modal-info-item">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 6V12L16 14M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div>
              <span className="complete-meeting-modal-info-label">{t('completeMeetingModal.plannedDuration')}</span>
              <span className="complete-meeting-modal-info-value">{meeting?.plannedDuration} {t('completeMeetingModal.minutes')}</span>
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="complete-meeting-modal-error">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p>{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="complete-meeting-modal-form">
          {/* ACTUAL DURATION */}
          <div className="complete-meeting-modal-field">
            <label className="complete-meeting-modal-label">
              {t('completeMeetingModal.fields.actualDuration')} ({t('completeMeetingModal.minutes')}) <span className="complete-meeting-modal-required">*</span>
            </label>
            <input
              type="number"
              name="actualDuration"
              value={formData.actualDuration}
              onChange={handleChange}
              min="1"
              step="5"
              className="complete-meeting-modal-input"
              required
            />
            <p className="complete-meeting-modal-hint">
              {t('completeMeetingModal.hints.actualDuration')}
            </p>
          </div>

          {/* COMPLETION NOTES */}
          <div className="complete-meeting-modal-field">
            <label className="complete-meeting-modal-label">
              {t('completeMeetingModal.fields.completionNotes')}
            </label>
            <textarea
              name="completionNotes"
              value={formData.completionNotes}
              onChange={handleChange}
              placeholder={t('completeMeetingModal.placeholders.completionNotes')}
              rows="5"
              className="complete-meeting-modal-textarea"
            />
            <p className="complete-meeting-modal-hint">
              {t('completeMeetingModal.hints.completionNotes')}
            </p>
          </div>

          {/* BUTTONS */}
          <div className="complete-meeting-modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="complete-meeting-modal-btn complete-meeting-modal-btn-cancel"
              disabled={isSaving}
            >
              {t('completeMeetingModal.cancel')}
            </button>
            <button
              type="submit"
              className="complete-meeting-modal-btn complete-meeting-modal-btn-submit"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <svg className="complete-meeting-modal-spinner" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2V6M12 18V22M6 12H2M22 12H18M19.07 19.07L16.24 16.24M19.07 4.93L16.24 7.76M4.93 19.07L7.76 16.24M4.93 4.93L7.76 7.76" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {t('completeMeetingModal.saving')}
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {t('completeMeetingModal.complete')}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};