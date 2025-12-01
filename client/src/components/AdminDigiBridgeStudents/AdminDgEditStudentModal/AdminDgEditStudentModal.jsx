// src/components/AdminDigiBridgeStudents/AdminDgEditStudentModal/AdminDgEditStudentModal.jsx

import { useEffect, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './adminDgEditStudentModal.css';

export const AdminDgEditStudentModal = ({ student, onClose, onSave }) => {
  if (!student) return null;

  const { t } = useTranslation();
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: student?.name || '',
    email: student?.email || '',
    phone: student?.phone || '',
    status: student?.status || 'active'
  });

  const handleBackdropClick = useCallback((e) => {
    if (e.target.classList.contains('adminDgEditStudentModal-overlay')) {
      onClose();
    }
  }, [onClose]);

  const validateForm = () => {
    const newErrors = {};

    // ✅ Name - ЗАДЪЛЖИТЕЛНО
    if (!formData.name.trim()) {
      newErrors.name = t('adminDgEditStudentModal.errors.nameRequired');
    }

    // ✅ Email - ЗАДЪЛЖИТЕЛНО + ВАЛИДЕН ФОРМАТ
    if (!formData.email.trim()) {
      newErrors.email = t('adminDgEditStudentModal.errors.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('adminDgEditStudentModal.errors.emailInvalid');
    }

    // ✅ Phone - ОПЦИОНАЛНО, НО АКО ИМА - ВАЛИДЕН ФОРМАТ
    if (formData.phone && formData.phone.trim() && !/^\+?[\d\s\-()]+$/.test(formData.phone)) {
      newErrors.phone = t('adminDgEditStudentModal.errors.phoneInvalid');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setSaving(true);
    try {
      await onSave(student.id, formData);
    } catch (error) {
      console.error('Error saving student:', error);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape' && !saving) {
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
    <div className="adminDgEditStudentModal-overlay" onClick={handleBackdropClick}>
      <div className="adminDgEditStudentModal-container">
        {/* Header */}
        <div className="adminDgEditStudentModal-header">
          <h2 className="adminDgEditStudentModal-title">
            {t('adminDgEditStudentModal.title')}
          </h2>
          <button
            className="adminDgEditStudentModal-closeBtn"
            onClick={onClose}
            disabled={saving}
            type="button"
            aria-label="Close"
          >
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="adminDgEditStudentModal-form">
          <div className="adminDgEditStudentModal-content">
            {/* Student Avatar */}
            <div className="adminDgEditStudentModal-avatarSection">
              <div className="adminDgEditStudentModal-avatar">
                {student?.avatar ? (
                  <img src={student.avatar} alt={student?.name || 'Student'} />
                ) : (
                  <div className="adminDgEditStudentModal-avatarPlaceholder">
                    {student?.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                )}
              </div>
              <div className="adminDgEditStudentModal-avatarInfo">
                <p className="adminDgEditStudentModal-avatarLabel">{t('adminDgEditStudentModal.currentAvatar')}</p>
                <p className="adminDgEditStudentModal-avatarHint">{t('adminDgEditStudentModal.avatarHint')}</p>
              </div>
            </div>

            {/* Name Field */}
            <div className="adminDgEditStudentModal-field">
              <label className="adminDgEditStudentModal-label">
                {t('adminDgEditStudentModal.name')} <span className="adminDgEditStudentModal-required">*</span>
              </label>
              <input
                type="text"
                className={`adminDgEditStudentModal-input ${errors.name ? 'adminDgEditStudentModal-input--error' : ''}`}
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder={t('adminDgEditStudentModal.namePlaceholder')}
                disabled={saving}
              />
              {errors.name && (
                <span className="adminDgEditStudentModal-error">{errors.name}</span>
              )}
            </div>

            {/* Email Field */}
            <div className="adminDgEditStudentModal-field">
              <label className="adminDgEditStudentModal-label">
                {t('adminDgEditStudentModal.email')} <span className="adminDgEditStudentModal-required">*</span>
              </label>
              <input
                type="email"
                className={`adminDgEditStudentModal-input ${errors.email ? 'adminDgEditStudentModal-input--error' : ''}`}
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder={t('adminDgEditStudentModal.emailPlaceholder')}
                disabled={saving}
              />
              {errors.email && (
                <span className="adminDgEditStudentModal-error">{errors.email}</span>
              )}
            </div>

            {/* Phone Field */}
            <div className="adminDgEditStudentModal-field">
              <label className="adminDgEditStudentModal-label">
                {t('adminDgEditStudentModal.phone')}
              </label>
              <input
                type="tel"
                className={`adminDgEditStudentModal-input ${errors.phone ? 'adminDgEditStudentModal-input--error' : ''}`}
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder={t('adminDgEditStudentModal.phonePlaceholder')}
                disabled={saving}
              />
              {errors.phone && (
                <span className="adminDgEditStudentModal-error">{errors.phone}</span>
              )}
            </div>

            {/* Status Field */}
            <div className="adminDgEditStudentModal-field">
              <label className="adminDgEditStudentModal-label">
                {t('adminDgEditStudentModal.status')} <span className="adminDgEditStudentModal-required">*</span>
              </label>
              <select
                className="adminDgEditStudentModal-select"
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                disabled={saving}
              >
                <option value="active">{t('adminDigiBridgeStudents.table.active')}</option>
                <option value="inactive">{t('adminDigiBridgeStudents.table.inactive')}</option>
                <option value="suspended">{t('adminDigiBridgeStudents.table.suspended')}</option>
              </select>
            </div>
          </div>

          {/* Footer */}
          <div className="adminDgEditStudentModal-footer">
            <button
              className="adminDgEditStudentModal-btnCancel"
              onClick={onClose}
              disabled={saving}
              type="button"
            >
              {t('common.cancel')}
            </button>
            <button
              className="adminDgEditStudentModal-btnSave"
              type="submit"
              disabled={saving}
            >
              {saving ? (
                <>
                  <div className="adminDgEditStudentModal-spinner"></div>
                  {t('adminDgEditStudentModal.saving')}
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 18 18">
                    <path d="M13.5 0h-12C.67 0 0 .67 0 1.5v15c0 .83.67 1.5 1.5 1.5h15c.83 0 1.5-.67 1.5-1.5v-12L13.5 0zM9 16.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zm2.25-9.75h-7.5v-5.25h7.5v5.25z" fill="currentColor"/>
                  </svg>
                  {t('adminDgEditStudentModal.save')}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};