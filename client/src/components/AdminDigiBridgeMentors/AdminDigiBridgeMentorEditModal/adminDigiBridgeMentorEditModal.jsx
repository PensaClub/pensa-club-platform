// src/components/AdminDigiBridgeMentors/AdminDigiBridgeMentorEditModal/AdminDigiBridgeMentorEditModal.jsx

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import './adminDigiBridgeMentorEditModal.css';

export const AdminDigiBridgeMentorEditModal = ({ mentor, onClose, onSave }) => {
  const { t } = useTranslation();

  const STORAGE_KEY = `mentor_edit_draft_${mentor.id}`;

  // Функция за зареждане на данни от sessionStorage
  const loadDraftData = () => {
    try {
      const savedDraft = sessionStorage.getItem(STORAGE_KEY);
      if (savedDraft) {
        return JSON.parse(savedDraft);
      }
    } catch (error) {
      console.error('Error loading draft data:', error);
    }
    return null;
  };

  // Инициализация на формата - или от sessionStorage, или от mentor данните
  const [formData, setFormData] = useState(() => {
    const draftData = loadDraftData();
    if (draftData) {
      return draftData;
    }
    return {
      name: mentor.name || '',
      email: mentor.email || '',
      phone: mentor.phone || '',
      age: mentor.age || '',
      country: mentor.country || 'BG',
      specialization: mentor.specialization || '',
      education: mentor.education || '',
      experience: mentor.experience || '',
      motivation: mentor.motivation || '',
      availability: mentor.availability || '',
      languages: mentor.languages || [],
      viber: mentor.viber || '',
      facebook: mentor.facebook || '',
      linkedin: mentor.linkedin || '',
      otherContact: mentor.otherContact || '',
      priorityContact: mentor.priorityContact || '',
      adminNotes: mentor.adminNotes || ''
    };
  });

  const [loading, setLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const specializations = [
    'Digital Security',
    'Social Media',
    'Online Banking',
    'E-Commerce',
    'Media Literacy',
    'Communication Tools'
  ];
  const countryOptions = [
    { code: 'BG', name: '🇧🇬 България' },
    { code: 'DE', name: '🇩🇪 Германия' },
    { code: 'AT', name: '🇦🇹 Австрия' },
    { code: 'GR', name: '🇬🇷 Гърция' },
    { code: 'RO', name: '🇷🇴 Румъния' },
    { code: 'RS', name: '🇷🇸 Сърбия' },
    { code: 'MK', name: '🇲🇰 Северна Македония' },
    { code: 'TR', name: '🇹🇷 Турция' },
    { code: 'OTHER', name: '🌍 Друга' }
  ];
  const availableLanguages = ['bg', 'en', 'de', 'fr', 'es', 'ru'];
  const priorityOptions = ['email', 'phone', 'viber', 'facebook', 'linkedin'];

  // Запазване на данните в sessionStorage при всяка промяна
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
      setHasUnsavedChanges(true);
    } catch (error) {
      console.error('Error saving draft data:', error);
    }
  }, [formData, STORAGE_KEY]);

  // Функция за изчистване на draft данните
  const clearDraftData = () => {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error clearing draft data:', error);
    }
  };

  // Cleanup при unmount
  useEffect(() => {
    return () => {
      // Не трием автоматично при unmount, защото може да се върнем назад
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLanguageToggle = (lang) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter(l => l !== lang)
        : [...prev.languages, lang]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Валидация
    if (!formData.name || !formData.email || !formData.phone || !formData.specialization) {
      toast.error(t('AdminDigiBridgeMentors.EditModal.fillRequiredFields'));
      return;
    }

    // Email валидация
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error(t('AdminDigiBridgeMentors.EditModal.invalidEmail'));
      return;
    }

    setLoading(true);

    try {
      // Тук ще викаме API функцията за update
      // await updateMentor(mentor.id, formData);

      toast.success(t('AdminDigiBridgeMentors.EditModal.successMessage'));

      // ВАЖНО: Изчистваме draft данните след успешен save
      clearDraftData();

      onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error updating mentor:', error);
      toast.error(t('AdminDigiBridgeMentors.EditModal.errorMessage'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      const confirmLeave = window.confirm(t('AdminDigiBridgeMentors.EditModal.confirmLeave'));
      if (!confirmLeave) return;
    }

    // Питаме дали да запазим draft
    if (hasUnsavedChanges) {
      const keepDraft = window.confirm(t('AdminDigiBridgeMentors.EditModal.keepDraft'));
      if (!keepDraft) {
        clearDraftData();
      }
    }

    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
      handleCancel();
    }
  };

  // Показваме indicator ако има draft данни
  const hasDraft = loadDraftData() !== null;

  return (
    <div className="admin-digibridge-mentor-edit-modal-overlay" onClick={handleBackdropClick}>
      <div
        className="admin-digibridge-mentor-edit-modal"
        onClick={(e) => e.stopPropagation()}
      >

        {/* HEADER */}
        <div className="admin-digibridge-mentor-edit-modal-header">
          <div>
            <h2 className="admin-digibridge-mentor-edit-modal-title">
              {t('AdminDigiBridgeMentors.EditModal.title')}
              {hasDraft && (
                <span className="admin-digibridge-mentor-edit-modal-draft-badge">
                  {t('AdminDigiBridgeMentors.EditModal.draftRestored')}
                </span>
              )}
            </h2>
            <p className="admin-digibridge-mentor-edit-modal-subtitle">
              {t('AdminDigiBridgeMentors.EditModal.editingMentor')}: <strong>{mentor.name}</strong>
            </p>
          </div>
          <button
            className="admin-digibridge-mentor-edit-modal-close"
            onClick={handleCancel}
            disabled={loading}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* FORM */}
        <form className="admin-digibridge-mentor-edit-modal-form" onSubmit={handleSubmit}>

          {/* BASIC INFO */}
          <div className="admin-digibridge-mentor-edit-modal-section">
            <h3 className="admin-digibridge-mentor-edit-modal-section-title">
              {t('AdminDigiBridgeMentors.EditModal.basicInfo')}
            </h3>

            <div className="admin-digibridge-mentor-edit-modal-row">
              <div className="admin-digibridge-mentor-edit-modal-field">
                <label className="admin-digibridge-mentor-edit-modal-label">
                  {t('AdminDigiBridgeMentors.EditModal.nameLabel')} <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="admin-digibridge-mentor-edit-modal-input"
                  disabled={loading}
                />
              </div>

              <div className="admin-digibridge-mentor-edit-modal-field">
                <label className="admin-digibridge-mentor-edit-modal-label">
                  {t('AdminDigiBridgeMentors.EditModal.ageLabel')} <span className="required">*</span>
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  min="18"
                  max="99"
                  className="admin-digibridge-mentor-edit-modal-input"
                  disabled={loading}
                />
              </div>
              <div className="admin-digibridge-mentor-edit-modal-field">
                <label className="admin-digibridge-mentor-edit-modal-label">
                  {t('AdminDigiBridgeMentors.EditModal.countryLabel')} <span className="required">*</span>
                </label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="admin-digibridge-mentor-edit-modal-select"
                  disabled={loading}
                >
                  {countryOptions.map(country => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="admin-digibridge-mentor-edit-modal-field">
              <label className="admin-digibridge-mentor-edit-modal-label">
                {t('AdminDigiBridgeMentors.EditModal.specializationLabel')} <span className="required">*</span>
              </label>
              <select
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                className="admin-digibridge-mentor-edit-modal-select"
                disabled={loading}
              >
                <option value="">{t('AdminDigiBridgeMentors.EditModal.selectSpecialization')}</option>
                {specializations.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>
          </div>

          {/* CONTACT INFO */}
          <div className="admin-digibridge-mentor-edit-modal-section">
            <h3 className="admin-digibridge-mentor-edit-modal-section-title">
              {t('AdminDigiBridgeMentors.EditModal.contactInfo')}
            </h3>

            <div className="admin-digibridge-mentor-edit-modal-row">
              <div className="admin-digibridge-mentor-edit-modal-field">
                <label className="admin-digibridge-mentor-edit-modal-label">
                  Email <span className="required">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="admin-digibridge-mentor-edit-modal-input"
                  disabled={loading}
                />
              </div>

              <div className="admin-digibridge-mentor-edit-modal-field">
                <label className="admin-digibridge-mentor-edit-modal-label">
                  {t('AdminDigiBridgeMentors.EditModal.phoneLabel')} <span className="required">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="admin-digibridge-mentor-edit-modal-input"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="admin-digibridge-mentor-edit-modal-row">
              <div className="admin-digibridge-mentor-edit-modal-field">
                <label className="admin-digibridge-mentor-edit-modal-label">
                  Viber
                </label>
                <input
                  type="tel"
                  name="viber"
                  value={formData.viber}
                  onChange={handleChange}
                  className="admin-digibridge-mentor-edit-modal-input"
                  disabled={loading}
                />
              </div>

              <div className="admin-digibridge-mentor-edit-modal-field">
                <label className="admin-digibridge-mentor-edit-modal-label">
                  Facebook
                </label>
                <input
                  type="text"
                  name="facebook"
                  value={formData.facebook}
                  onChange={handleChange}
                  className="admin-digibridge-mentor-edit-modal-input"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="admin-digibridge-mentor-edit-modal-row">
              <div className="admin-digibridge-mentor-edit-modal-field">
                <label className="admin-digibridge-mentor-edit-modal-label">
                  LinkedIn
                </label>
                <input
                  type="text"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleChange}
                  className="admin-digibridge-mentor-edit-modal-input"
                  disabled={loading}
                />
              </div>

              <div className="admin-digibridge-mentor-edit-modal-field">
                <label className="admin-digibridge-mentor-edit-modal-label">
                  {t('AdminDigiBridgeMentors.EditModal.otherContactLabel')}
                </label>
                <input
                  type="text"
                  name="otherContact"
                  value={formData.otherContact}
                  onChange={handleChange}
                  className="admin-digibridge-mentor-edit-modal-input"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="admin-digibridge-mentor-edit-modal-field">
              <label className="admin-digibridge-mentor-edit-modal-label">
                {t('AdminDigiBridgeMentors.EditModal.priorityContactLabel')}
              </label>
              <select
                name="priorityContact"
                value={formData.priorityContact}
                onChange={handleChange}
                className="admin-digibridge-mentor-edit-modal-select"
                disabled={loading}
              >
                <option value="">{t('AdminDigiBridgeMentors.EditModal.selectPriorityContact')}</option>
                {priorityOptions.map(option => (
                  <option key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* EDUCATION & EXPERIENCE */}
          <div className="admin-digibridge-mentor-edit-modal-section">
            <h3 className="admin-digibridge-mentor-edit-modal-section-title">
              {t('AdminDigiBridgeMentors.EditModal.educationExperience')}
            </h3>

            <div className="admin-digibridge-mentor-edit-modal-field">
              <label className="admin-digibridge-mentor-edit-modal-label">
                {t('AdminDigiBridgeMentors.EditModal.educationLabel')}
              </label>
              <textarea
                name="education"
                value={formData.education}
                onChange={handleChange}
                rows="3"
                className="admin-digibridge-mentor-edit-modal-textarea"
                disabled={loading}
              />
            </div>

            <div className="admin-digibridge-mentor-edit-modal-field">
              <label className="admin-digibridge-mentor-edit-modal-label">
                {t('AdminDigiBridgeMentors.EditModal.experienceLabel')}
              </label>
              <textarea
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                rows="3"
                className="admin-digibridge-mentor-edit-modal-textarea"
                disabled={loading}
              />
            </div>
          </div>

          {/* AVAILABILITY & LANGUAGES */}
          <div className="admin-digibridge-mentor-edit-modal-section">
            <h3 className="admin-digibridge-mentor-edit-modal-section-title">
              {t('AdminDigiBridgeMentors.EditModal.availabilityLanguages')}
            </h3>

            <div className="admin-digibridge-mentor-edit-modal-field">
              <label className="admin-digibridge-mentor-edit-modal-label">
                {t('AdminDigiBridgeMentors.EditModal.availabilityLabel')}
              </label>
              <input
                type="text"
                name="availability"
                value={formData.availability}
                onChange={handleChange}
                className="admin-digibridge-mentor-edit-modal-input"
                disabled={loading}
              />
            </div>

            <div className="admin-digibridge-mentor-edit-modal-field">
              <label className="admin-digibridge-mentor-edit-modal-label">
                {t('AdminDigiBridgeMentors.EditModal.languagesLabel')}
              </label>
              <div className="admin-digibridge-mentor-edit-modal-languages-grid">
                {availableLanguages.map(lang => (
                  <label key={lang} className="admin-digibridge-mentor-edit-modal-checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.languages.includes(lang)}
                      onChange={() => handleLanguageToggle(lang)}
                      disabled={loading}
                    />
                    <span>{lang.toUpperCase()}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* MOTIVATION */}
          <div className="admin-digibridge-mentor-edit-modal-section">
            <h3 className="admin-digibridge-mentor-edit-modal-section-title">
              {t('AdminDigiBridgeMentors.EditModal.motivation')}
            </h3>

            <div className="admin-digibridge-mentor-edit-modal-field">
              <label className="admin-digibridge-mentor-edit-modal-label">
                {t('AdminDigiBridgeMentors.EditModal.motivationLabel')}
              </label>
              <textarea
                name="motivation"
                value={formData.motivation}
                onChange={handleChange}
                rows="4"
                className="admin-digibridge-mentor-edit-modal-textarea"
                disabled={loading}
              />
            </div>
          </div>

          {/* ADMIN NOTES */}
          <div className="admin-digibridge-mentor-edit-modal-section">
            <h3 className="admin-digibridge-mentor-edit-modal-section-title admin-digibridge-mentor-edit-modal-section-title-admin">
              {t('AdminDigiBridgeMentors.EditModal.adminNotes')}
            </h3>

            <div className="admin-digibridge-mentor-edit-modal-field">
              <label className="admin-digibridge-mentor-edit-modal-label">
                {t('AdminDigiBridgeMentors.EditModal.adminNotesLabel')}
              </label>
              <textarea
                name="adminNotes"
                value={formData.adminNotes}
                onChange={handleChange}
                rows="3"
                className="admin-digibridge-mentor-edit-modal-textarea"
                placeholder={t('AdminDigiBridgeMentors.EditModal.adminNotesPlaceholder')}
                disabled={loading}
              />
            </div>
          </div>

          {/* BUTTONS */}
          <div className="admin-digibridge-mentor-edit-modal-actions">
            <button
              type="button"
              className="admin-digibridge-mentor-edit-modal-button admin-digibridge-mentor-edit-modal-button-cancel"
              onClick={handleCancel}
              disabled={loading}
            >
              {t('AdminDigiBridgeMentors.EditModal.cancelButton')}
            </button>
            <button
              type="submit"
              className="admin-digibridge-mentor-edit-modal-button admin-digibridge-mentor-edit-modal-button-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="admin-digibridge-mentor-edit-modal-spinner"></div>
                  {t('AdminDigiBridgeMentors.EditModal.savingButton')}
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <polyline points="17 21 17 13 7 13 7 21" />
                    <polyline points="7 3 7 8 15 8" />
                  </svg>
                  {t('AdminDigiBridgeMentors.EditModal.saveButton')}
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};