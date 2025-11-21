// client/src/components/DigiMentorPanel/MentorProfileEdit/MentorProfileEdit.jsx

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAcademy } from '../../contexts/AcademyProvider';
import { Loader } from '../../Loader/Loader';
import './mentorProfileEdit.css';

export const MentorProfileEdit = () => {
  const { t } = useTranslation();
  const { getMentorProfile, updateMentorProfile, isLoading } = useAcademy();

  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    age: '',
    specialization: '',
    education: '',
    experience: '',
    motivation: '',
    availability: '',
    languages: '',
    viber: '',
    facebook: '',
    linkedin: '',
    otherContact: '',
    priorityContact: 'email'
  });
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const result = await getMentorProfile();
      if (result.success) {
        setProfile(result.mentor);
        setFormData({
          age: result.mentor.age || '',
          specialization: result.mentor.specialization || '',
          education: result.mentor.education || '',
          experience: result.mentor.experience || '',
          motivation: result.mentor.motivation || '',
          availability: result.mentor.availability || '',
          languages: result.mentor.languages || '',
          viber: result.mentor.viber || '',
          facebook: result.mentor.facebook || '',
          linkedin: result.mentor.linkedin || '',
          otherContact: result.mentor.otherContact || '',
          priorityContact: result.mentor.priorityContact || 'email'
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setErrorMessage(t('mentorProfileEdit.errorFetch'));
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
    setIsSaving(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const result = await updateMentorProfile(formData);
      if (result.success) {
        setSuccessMessage(t('mentorProfileEdit.successSave'));
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        setErrorMessage(result.message || t('mentorProfileEdit.errorSave'));
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrorMessage(t('mentorProfileEdit.errorSave'));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !profile) {
    return <Loader />;
  }

  return (
    <div className="mentor-profile-edit">
      <div className="mentor-profile-edit-header">
        <h2 className="mentor-profile-edit-title">{t('mentorProfileEdit.title')}</h2>
        <p className="mentor-profile-edit-subtitle">{t('mentorProfileEdit.subtitle')}</p>
      </div>

      {/* SUCCESS MESSAGE */}
      {successMessage && (
        <div className="mentor-profile-edit-message mentor-profile-edit-message-success">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p>{successMessage}</p>
        </div>
      )}

      {/* ERROR MESSAGE */}
      {errorMessage && (
        <div className="mentor-profile-edit-message mentor-profile-edit-message-error">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p>{errorMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mentor-profile-edit-form">
        {/* READONLY SECTION */}
        <div className="mentor-profile-edit-section">
          <div className="mentor-profile-edit-section-header">
            <h3 className="mentor-profile-edit-section-title">
              {t('mentorProfileEdit.readonlySection.title')}
            </h3>
            <p className="mentor-profile-edit-section-description">
              {t('mentorProfileEdit.readonlySection.description')}
            </p>
          </div>

          <div className="mentor-profile-edit-readonly">
            {/* PHOTO */}
            <div className="mentor-profile-edit-field">
              <label className="mentor-profile-edit-label">
                {t('mentorProfileEdit.fields.photo')}
              </label>
              <div className="mentor-profile-edit-photo">
                {profile.photoUrl ? (
                  <img src={profile.photoUrl} alt={profile.name} />
                ) : (
                  <div className="mentor-profile-edit-photo-placeholder">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17 20C17 18.3431 14.7614 17 12 17C9.23858 17 7 18.3431 7 20M12 14C10.3431 14 9 12.6569 9 11C9 9.34315 10.3431 8 12 8C13.6569 8 15 9.34315 15 11C15 12.6569 13.6569 14 12 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* NAME */}
            <div className="mentor-profile-edit-field">
              <label className="mentor-profile-edit-label">
                {t('mentorProfileEdit.fields.name')}
              </label>
              <input
                type="text"
                value={profile.name || ''}
                disabled
                className="mentor-profile-edit-input mentor-profile-edit-input-disabled"
              />
            </div>

            {/* EMAIL */}
            <div className="mentor-profile-edit-field">
              <label className="mentor-profile-edit-label">
                {t('mentorProfileEdit.fields.email')}
              </label>
              <input
                type="email"
                value={profile.email || ''}
                disabled
                className="mentor-profile-edit-input mentor-profile-edit-input-disabled"
              />
            </div>

            {/* PHONE */}
            <div className="mentor-profile-edit-field">
              <label className="mentor-profile-edit-label">
                {t('mentorProfileEdit.fields.phone')}
              </label>
              <input
                type="tel"
                value={profile.phone || ''}
                disabled
                className="mentor-profile-edit-input mentor-profile-edit-input-disabled"
              />
            </div>
          </div>
        </div>

        {/* EDITABLE SECTION */}
        <div className="mentor-profile-edit-section">
          <div className="mentor-profile-edit-section-header">
            <h3 className="mentor-profile-edit-section-title">
              {t('mentorProfileEdit.editableSection.title')}
            </h3>
            <p className="mentor-profile-edit-section-description">
              {t('mentorProfileEdit.editableSection.description')}
            </p>
          </div>

          <div className="mentor-profile-edit-grid">
            {/* AGE */}
            <div className="mentor-profile-edit-field">
              <label className="mentor-profile-edit-label">
                {t('mentorProfileEdit.fields.age')}
              </label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                min="18"
                max="100"
                className="mentor-profile-edit-input"
              />
            </div>

            {/* SPECIALIZATION */}
            <div className="mentor-profile-edit-field">
              <label className="mentor-profile-edit-label">
                {t('mentorProfileEdit.fields.specialization')}
              </label>
              <input
                type="text"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                className="mentor-profile-edit-input"
              />
            </div>

            {/* EDUCATION */}
            <div className="mentor-profile-edit-field mentor-profile-edit-field-full">
              <label className="mentor-profile-edit-label">
                {t('mentorProfileEdit.fields.education')}
              </label>
              <textarea
                name="education"
                value={formData.education}
                onChange={handleChange}
                rows="3"
                className="mentor-profile-edit-textarea"
              />
            </div>

            {/* EXPERIENCE */}
            <div className="mentor-profile-edit-field mentor-profile-edit-field-full">
              <label className="mentor-profile-edit-label">
                {t('mentorProfileEdit.fields.experience')}
              </label>
              <textarea
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                rows="3"
                className="mentor-profile-edit-textarea"
              />
            </div>

            {/* MOTIVATION */}
            <div className="mentor-profile-edit-field mentor-profile-edit-field-full">
              <label className="mentor-profile-edit-label">
                {t('mentorProfileEdit.fields.motivation')}
              </label>
              <textarea
                name="motivation"
                value={formData.motivation}
                onChange={handleChange}
                rows="3"
                className="mentor-profile-edit-textarea"
              />
            </div>

            {/* AVAILABILITY */}
            <div className="mentor-profile-edit-field">
              <label className="mentor-profile-edit-label">
                {t('mentorProfileEdit.fields.availability')}
              </label>
              <input
                type="text"
                name="availability"
                value={formData.availability}
                onChange={handleChange}
                placeholder={t('mentorProfileEdit.placeholders.availability')}
                className="mentor-profile-edit-input"
              />
            </div>

            {/* LANGUAGES */}
            <div className="mentor-profile-edit-field">
              <label className="mentor-profile-edit-label">
                {t('mentorProfileEdit.fields.languages')}
              </label>
              <input
                type="text"
                name="languages"
                value={formData.languages}
                onChange={handleChange}
                placeholder={t('mentorProfileEdit.placeholders.languages')}
                className="mentor-profile-edit-input"
              />
            </div>

            {/* VIBER */}
            <div className="mentor-profile-edit-field">
              <label className="mentor-profile-edit-label">
                {t('mentorProfileEdit.fields.viber')}
              </label>
              <input
                type="text"
                name="viber"
                value={formData.viber}
                onChange={handleChange}
                className="mentor-profile-edit-input"
              />
            </div>

            {/* FACEBOOK */}
            <div className="mentor-profile-edit-field">
              <label className="mentor-profile-edit-label">
                {t('mentorProfileEdit.fields.facebook')}
              </label>
              <input
                type="text"
                name="facebook"
                value={formData.facebook}
                onChange={handleChange}
                className="mentor-profile-edit-input"
              />
            </div>

            {/* LINKEDIN */}
            <div className="mentor-profile-edit-field">
              <label className="mentor-profile-edit-label">
                {t('mentorProfileEdit.fields.linkedin')}
              </label>
              <input
                type="text"
                name="linkedin"
                value={formData.linkedin}
                onChange={handleChange}
                className="mentor-profile-edit-input"
              />
            </div>

            {/* OTHER CONTACT */}
            <div className="mentor-profile-edit-field">
              <label className="mentor-profile-edit-label">
                {t('mentorProfileEdit.fields.otherContact')}
              </label>
              <input
                type="text"
                name="otherContact"
                value={formData.otherContact}
                onChange={handleChange}
                className="mentor-profile-edit-input"
              />
            </div>

            {/* PRIORITY CONTACT */}
            <div className="mentor-profile-edit-field">
              <label className="mentor-profile-edit-label">
                {t('mentorProfileEdit.fields.priorityContact')}
              </label>
              <select
                name="priorityContact"
                value={formData.priorityContact}
                onChange={handleChange}
                className="mentor-profile-edit-select"
              >
                <option value="email">{t('mentorProfileEdit.priorityOptions.email')}</option>
                <option value="viber">{t('mentorProfileEdit.priorityOptions.viber')}</option>
                <option value="phone">{t('mentorProfileEdit.priorityOptions.phone')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="mentor-profile-edit-footer">
          <button
            type="submit"
            disabled={isSaving}
            className="mentor-profile-edit-submit"
          >
            {isSaving ? (
              <>
                <svg className="mentor-profile-edit-spinner" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2V6M12 18V22M6 12H2M22 12H18M19.07 19.07L16.24 16.24M19.07 4.93L16.24 7.76M4.93 19.07L7.76 16.24M4.93 4.93L7.76 7.76" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {t('mentorProfileEdit.saving')}
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16L21 8V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M17 21V13H7V21M7 3V8H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {t('mentorProfileEdit.saveChanges')}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};