// client/src/components/DigiMentorPanel/MentorMeetings/AddMeetingModal.jsx

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAcademy } from '../../contexts/AcademyProvider';
import './addMeetingModal.css';

export const AddMeetingModal = ({ onClose, onSuccess }) => {
  const { t } = useTranslation();
  const { createMentorMeeting, getMentorStudents } = useAcademy();
  
  const [students, setStudents] = useState([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    studentId: '',
    scheduledDate: '',
    scheduledTime: '',
    plannedDuration: 60,
    meetingType: 'viber',
    notes: ''
  });

  useState(() => {
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
      setErrorMessage(t('addMeetingModal.errors.titleRequired'));
      return;
    }
    if (!formData.scheduledDate) {
      setErrorMessage(t('addMeetingModal.errors.dateRequired'));
      return;
    }
    if (!formData.scheduledTime) {
      setErrorMessage(t('addMeetingModal.errors.timeRequired'));
      return;
    }

    setIsSaving(true);
    setErrorMessage('');

    try {
      const result = await createMentorMeeting(formData);
      if (result.success) {
        onSuccess?.();
      } else {
        setErrorMessage(result.message || t('addMeetingModal.errors.saveFailed'));
      }
    } catch (error) {
      console.error('Error creating meeting:', error);
      setErrorMessage(t('addMeetingModal.errors.saveFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="add-meeting-modal-overlay" onClick={onClose}>
      <div className="add-meeting-modal" onClick={(e) => e.stopPropagation()}>
        <div className="add-meeting-modal-header">
          <h2 className="add-meeting-modal-title">{t('addMeetingModal.title')}</h2>
          <button className="add-meeting-modal-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 18L18 6M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {errorMessage && (
          <div className="add-meeting-modal-error">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p>{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="add-meeting-modal-form">
          {/* TITLE */}
          <div className="add-meeting-modal-field">
            <label className="add-meeting-modal-label">
              {t('addMeetingModal.fields.title')} <span className="add-meeting-modal-required">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder={t('addMeetingModal.placeholders.title')}
              className="add-meeting-modal-input"
              required
            />
          </div>

          {/* MEETING TYPE */}
          <div className="add-meeting-modal-field">
            <label className="add-meeting-modal-label">
              {t('addMeetingModal.fields.meetingType')} <span className="add-meeting-modal-required">*</span>
            </label>
            <select
              name="meetingType"
              value={formData.meetingType}
              onChange={handleChange}
              className="add-meeting-modal-select"
              required
            >
              <option value="viber">{t('addMeetingModal.meetingTypes.viber')}</option>
              <option value="google_meet">{t('addMeetingModal.meetingTypes.google_meet')}</option>
              <option value="phone">{t('addMeetingModal.meetingTypes.phone')}</option>
              <option value="in_person">{t('addMeetingModal.meetingTypes.in_person')}</option>
              <option value="other">{t('addMeetingModal.meetingTypes.other')}</option>
            </select>
          </div>

          {/* STUDENT */}
          <div className="add-meeting-modal-field">
            <label className="add-meeting-modal-label">
              {t('addMeetingModal.fields.student')}
            </label>
            {isLoadingStudents ? (
              <div className="add-meeting-modal-loading">
                {t('addMeetingModal.loadingStudents')}
              </div>
            ) : (
              <select
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                className="add-meeting-modal-select"
              >
                <option value="">{t('addMeetingModal.placeholders.student')}</option>
                {students.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* DATE & TIME */}
          <div className="add-meeting-modal-row">
            <div className="add-meeting-modal-field">
              <label className="add-meeting-modal-label">
                {t('addMeetingModal.fields.date')} <span className="add-meeting-modal-required">*</span>
              </label>
              <input
                type="date"
                name="scheduledDate"
                value={formData.scheduledDate}
                onChange={handleChange}
                className="add-meeting-modal-input"
                required
              />
            </div>

            <div className="add-meeting-modal-field">
              <label className="add-meeting-modal-label">
                {t('addMeetingModal.fields.time')} <span className="add-meeting-modal-required">*</span>
              </label>
              <input
                type="time"
                name="scheduledTime"
                value={formData.scheduledTime}
                onChange={handleChange}
                className="add-meeting-modal-input"
                required
              />
            </div>
          </div>

          {/* DURATION */}
          <div className="add-meeting-modal-field">
            <label className="add-meeting-modal-label">
              {t('addMeetingModal.fields.duration')} ({t('addMeetingModal.minutes')})
            </label>
            <input
              type="number"
              name="plannedDuration"
              value={formData.plannedDuration}
              onChange={handleChange}
              min="15"
              step="15"
              className="add-meeting-modal-input"
            />
          </div>

          {/* NOTES */}
          <div className="add-meeting-modal-field">
            <label className="add-meeting-modal-label">
              {t('addMeetingModal.fields.notes')}
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder={t('addMeetingModal.placeholders.notes')}
              rows="3"
              className="add-meeting-modal-textarea"
            />
          </div>

          {/* BUTTONS */}
          <div className="add-meeting-modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="add-meeting-modal-btn add-meeting-modal-btn-cancel"
              disabled={isSaving}
            >
              {t('addMeetingModal.cancel')}
            </button>
            <button
              type="submit"
              className="add-meeting-modal-btn add-meeting-modal-btn-submit"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <svg className="add-meeting-modal-spinner" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2V6M12 18V22M6 12H2M22 12H18M19.07 19.07L16.24 16.24M19.07 4.93L16.24 7.76M4.93 19.07L7.76 16.24M4.93 4.93L7.76 7.76" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {t('addMeetingModal.saving')}
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {t('addMeetingModal.save')}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};