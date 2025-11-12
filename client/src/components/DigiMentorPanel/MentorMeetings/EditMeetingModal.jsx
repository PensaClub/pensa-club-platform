// client/src/components/DigiMentorPanel/MentorMeetings/EditMeetingModal.jsx

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAcademy } from '../../contexts/AcademyProvider';
import './editMeetingModal.css';

export const EditMeetingModal = ({ meeting, onClose, onSuccess }) => {
  const { t } = useTranslation();
  const { updateMentorMeeting, getMentorStudents } = useAcademy();
  
  const [students, setStudents] = useState([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    title: meeting?.title || '',
    studentId: meeting?.studentId || '',
    scheduledDate: meeting?.scheduledDate || '',
    scheduledTime: meeting?.scheduledTime || '',
    plannedDuration: meeting?.plannedDuration || 60,
    meetingType: meeting?.meetingType || 'viber',
    notes: meeting?.notes || ''
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const result = await getMentorStudents();
      if (result.success) {
        setStudents(result.students || []);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setIsLoadingStudents(false);
    }
  };

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
    if (!formData.title.trim()) {
      setErrorMessage(t('editMeetingModal.errors.titleRequired'));
      return;
    }
    if (!formData.scheduledDate) {
      setErrorMessage(t('editMeetingModal.errors.dateRequired'));
      return;
    }
    if (!formData.scheduledTime) {
      setErrorMessage(t('editMeetingModal.errors.timeRequired'));
      return;
    }

    setIsSaving(true);
    setErrorMessage('');

    try {
      const result = await updateMentorMeeting(meeting.id, formData);
      if (result.success) {
        onSuccess?.();
      } else {
        setErrorMessage(result.message || t('editMeetingModal.errors.saveFailed'));
      }
    } catch (error) {
      console.error('Error updating meeting:', error);
      setErrorMessage(t('editMeetingModal.errors.saveFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="edit-meeting-modal-overlay" onClick={onClose}>
      <div className="edit-meeting-modal" onClick={(e) => e.stopPropagation()}>
        <div className="edit-meeting-modal-header">
          <h2 className="edit-meeting-modal-title">{t('editMeetingModal.title')}</h2>
          <button className="edit-meeting-modal-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 18L18 6M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {errorMessage && (
          <div className="edit-meeting-modal-error">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p>{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="edit-meeting-modal-form">
          {/* TITLE */}
          <div className="edit-meeting-modal-field">
            <label className="edit-meeting-modal-label">
              {t('editMeetingModal.fields.title')} <span className="edit-meeting-modal-required">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder={t('editMeetingModal.placeholders.title')}
              className="edit-meeting-modal-input"
              required
            />
          </div>

          {/* MEETING TYPE */}
          <div className="edit-meeting-modal-field">
            <label className="edit-meeting-modal-label">
              {t('editMeetingModal.fields.meetingType')} <span className="edit-meeting-modal-required">*</span>
            </label>
            <select
              name="meetingType"
              value={formData.meetingType}
              onChange={handleChange}
              className="edit-meeting-modal-select"
              required
            >
              <option value="viber">{t('editMeetingModal.meetingTypes.viber')}</option>
              <option value="google_meet">{t('editMeetingModal.meetingTypes.google_meet')}</option>
              <option value="phone">{t('editMeetingModal.meetingTypes.phone')}</option>
              <option value="in_person">{t('editMeetingModal.meetingTypes.in_person')}</option>
              <option value="other">{t('editMeetingModal.meetingTypes.other')}</option>
            </select>
          </div>

          {/* STUDENT */}
          <div className="edit-meeting-modal-field">
            <label className="edit-meeting-modal-label">
              {t('editMeetingModal.fields.student')}
            </label>
            {isLoadingStudents ? (
              <div className="edit-meeting-modal-loading">
                {t('editMeetingModal.loadingStudents')}
              </div>
            ) : (
              <select
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                className="edit-meeting-modal-select"
              >
                <option value="">{t('editMeetingModal.placeholders.student')}</option>
                {students.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* DATE & TIME */}
          <div className="edit-meeting-modal-row">
            <div className="edit-meeting-modal-field">
              <label className="edit-meeting-modal-label">
                {t('editMeetingModal.fields.date')} <span className="edit-meeting-modal-required">*</span>
              </label>
              <input
                type="date"
                name="scheduledDate"
                value={formData.scheduledDate}
                onChange={handleChange}
                className="edit-meeting-modal-input"
                required
              />
            </div>

            <div className="edit-meeting-modal-field">
              <label className="edit-meeting-modal-label">
                {t('editMeetingModal.fields.time')} <span className="edit-meeting-modal-required">*</span>
              </label>
              <input
                type="time"
                name="scheduledTime"
                value={formData.scheduledTime}
                onChange={handleChange}
                className="edit-meeting-modal-input"
                required
              />
            </div>
          </div>

          {/* DURATION */}
          <div className="edit-meeting-modal-field">
            <label className="edit-meeting-modal-label">
              {t('editMeetingModal.fields.duration')} ({t('editMeetingModal.minutes')})
            </label>
            <input
              type="number"
              name="plannedDuration"
              value={formData.plannedDuration}
              onChange={handleChange}
              min="15"
              step="15"
              className="edit-meeting-modal-input"
            />
          </div>

          {/* NOTES */}
          <div className="edit-meeting-modal-field">
            <label className="edit-meeting-modal-label">
              {t('editMeetingModal.fields.notes')}
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder={t('editMeetingModal.placeholders.notes')}
              rows="3"
              className="edit-meeting-modal-textarea"
            />
          </div>

          {/* BUTTONS */}
          <div className="edit-meeting-modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="edit-meeting-modal-btn edit-meeting-modal-btn-cancel"
              disabled={isSaving}
            >
              {t('editMeetingModal.cancel')}
            </button>
            <button
              type="submit"
              className="edit-meeting-modal-btn edit-meeting-modal-btn-submit"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <svg className="edit-meeting-modal-spinner" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2V6M12 18V22M6 12H2M22 12H18M19.07 19.07L16.24 16.24M19.07 4.93L16.24 7.76M4.93 19.07L7.76 16.24M4.93 4.93L7.76 7.76" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {t('editMeetingModal.saving')}
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16L21 8V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M17 21V13H7V21M7 3V8H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {t('editMeetingModal.save')}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};