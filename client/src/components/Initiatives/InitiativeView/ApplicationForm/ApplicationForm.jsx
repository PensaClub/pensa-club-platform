import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../../../contexts/UserContext';
import { useInitiativeContext } from '../../../contexts/InitiativeProvider';
import './applicationForm.css';

export const ApplicationForm = ({ project, onSubmit }) => {
  const { t } = useTranslation('content');
  const { profileData, isAuthentication } = useAuthContext();
  const { recentApplications } = useInitiativeContext();
  const [isLoading, setIsLoading] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [formData, setFormData] = useState({
    firstName: profileData?.details?.firstName || '',
    lastName: profileData?.details?.lastName || '',
    email: profileData?.email || '',
    phone: profileData?.details?.phone || '',
    isAnonymous: false
  });

  useEffect(() => {
    if (profileData?.email && recentApplications) {
      const userApplication = recentApplications.find(app => app.email === profileData.email);
      setHasApplied(!!userApplication);
    }
  }, [profileData?.email, recentApplications]);

  // Валидация на полетата
  const validateField = (name, value) => {
    switch (name) {
      case 'firstName':
        if (!value.trim()) {
          return t('applicationForm.validation.firstNameRequired');
        }
        if (value.trim().length < 2) {
          return t('applicationForm.validation.firstNameTooShort');
        }
        return '';

      case 'lastName':
        if (!value.trim()) {
          return t('applicationForm.validation.lastNameRequired');
        }
        if (value.trim().length < 2) {
          return t('applicationForm.validation.lastNameTooShort');
        }
        return '';

      case 'email':
        if (!value.trim()) {
          return t('applicationForm.validation.emailRequired');
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return t('applicationForm.validation.emailInvalid');
        }
        return '';

      case 'phone':
        if (!value.trim()) {
          return t('applicationForm.validation.phoneRequired');
        }
        // Проверка за валиден телефонен номер (поне 9 цифри)
        const phoneRegex = /^[+]?[\d\s()-]{9,}$/;
        if (!phoneRegex.test(value)) {
          return t('applicationForm.validation.phoneInvalid');
        }
        return '';

      default:
        return '';
    }
  };

  // Валидация на всички полета
  const validateForm = () => {
    const newErrors = {};
    
    newErrors.firstName = validateField('firstName', formData.firstName);
    newErrors.lastName = validateField('lastName', formData.lastName);
    newErrors.email = validateField('email', formData.email);
    newErrors.phone = validateField('phone', formData.phone);

    // Премахваме празните грешки
    Object.keys(newErrors).forEach(key => {
      if (!newErrors[key]) delete newErrors[key];
    });

    return newErrors;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Валидираме полето при промяна, ако вече е било докоснато
    if (touched[name]) {
      const error = validateField(name, newValue);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthentication) {
      alert(t('applicationForm.alerts.loginRequired'));
      return;
    }

    if (hasApplied) {
      alert(t('applicationForm.alerts.alreadyApplied'));
      return;
    }

    // Маркираме всички полета като докоснати
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      phone: true
    });

    // Валидираме формата
    const formErrors = validateForm();
    
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      
      // Показваме алерт с първата грешка
      const firstError = Object.values(formErrors)[0];
      alert(firstError);
      
      // Скролваме до първото невалидно поле
      const firstErrorField = Object.keys(formErrors)[0];
      const element = document.getElementById(firstErrorField);
      if (element) {
        element.focus();
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      
      return;
    }

    setIsLoading(true);
    
    try {
      const applicationData = {
        projectId: project.id,
        ...formData,
        appliedAt: new Date().toISOString()
      };

      await onSubmit(applicationData);
      setHasApplied(true);
      
    } catch (error) {
      console.error('Application failed:', error);
      alert(t('applicationForm.alerts.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const currentLang = t('applicationForm.dateLocale');
    return new Date(dateString).toLocaleDateString(currentLang, {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const sortedApplications = recentApplications ? 
    [...recentApplications].sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt)) : [];

  if (!isAuthentication) {
    return (
      <div className="application-form-container" id="application-form">
        <div className="application-form-header">
          <h2 className="application-form-title">{t('applicationForm.loginRequired.title')}</h2>
          <p className="application-form-subtitle">
            {t('applicationForm.loginRequired.subtitle')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="application-form-container" id="application-form">
      {hasApplied && (
        <div className="application-form-success">
          ✅ {t('applicationForm.success.message')}
        </div>
      )}

      <div className="application-form-header">
        <h2 className="application-form-title">
          {hasApplied ? t('applicationForm.titles.yourApplication') : t('applicationForm.titles.applyForProject')}
        </h2>
        <p className="application-form-subtitle">
          {hasApplied 
            ? t('applicationForm.subtitles.successfullyApplied', { projectTitle: project.title })
            : t('applicationForm.subtitles.fillForm', { projectTitle: project.title })
          }
        </p>
      </div>

      {!hasApplied && (
        <form className="application-form-form" onSubmit={handleSubmit} noValidate>
          <div className="application-form-row">
            <div className="application-form-field">
              <label htmlFor="firstName" className="application-form-label required">
                {t('applicationForm.fields.firstName')}
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={`application-form-input ${errors.firstName && touched.firstName ? 'error' : ''}`}
                required
                disabled={isLoading}
              />
              {errors.firstName && touched.firstName && (
                <span className="application-form-error">{errors.firstName}</span>
              )}
            </div>

            <div className="application-form-field">
              <label htmlFor="lastName" className="application-form-label required">
                {t('applicationForm.fields.lastName')}
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={`application-form-input ${errors.lastName && touched.lastName ? 'error' : ''}`}
                required
                disabled={isLoading}
              />
              {errors.lastName && touched.lastName && (
                <span className="application-form-error">{errors.lastName}</span>
              )}
            </div>
          </div>

          <div className="application-form-row">
            <div className="application-form-field">
              <label htmlFor="email" className="application-form-label required">
                {t('applicationForm.fields.email')}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={`application-form-input ${errors.email && touched.email ? 'error' : ''}`}
                required
                disabled={isLoading}
              />
              {errors.email && touched.email && (
                <span className="application-form-error">{errors.email}</span>
              )}
            </div>

            <div className="application-form-field">
              <label htmlFor="phone" className="application-form-label required">
                {t('applicationForm.fields.phone')}
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={`application-form-input ${errors.phone && touched.phone ? 'error' : ''}`}
                placeholder={t('applicationForm.placeholders.phone')}
                required
                disabled={isLoading}
              />
              {errors.phone && touched.phone && (
                <span className="application-form-error">{errors.phone}</span>
              )}
            </div>
          </div>

          <div className="application-form-field full-width">
            <div className="application-form-checkbox-container">
              <label className="application-form-checkbox">
                <input
                  type="checkbox"
                  name="isAnonymous"
                  checked={formData.isAnonymous}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                <span className="application-form-checkbox-mark"></span>
              </label>
              <label htmlFor="isAnonymous" className="application-form-checkbox-label">
                {t('applicationForm.fields.anonymous')}
              </label>
            </div>
          </div>

          <div className="application-form-actions">
            <button 
              type="submit" 
              className="application-form-btn application-form-btn-submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="application-form-loading">
                  ⏳ {t('applicationForm.buttons.submitting')}
                </span>
              ) : (
                `📤 ${t('applicationForm.buttons.submit')}`
              )}
            </button>
          </div>
        </form>
      )}

      <div className="application-form-recent-applications">
        <h3 className="application-form-recent-title">
          {t('applicationForm.recentApplications.title', { count: sortedApplications?.length || 0 })}
        </h3>
        
        {sortedApplications && sortedApplications.length > 0 ? (
          <div className="application-form-recent-list">
            {sortedApplications.slice(0, 5).map((application, index) => (
              <div key={application.id || index} className="application-form-recent-item">
                <span className="application-form-recent-user">
                  {application.isAnonymous 
                    ? t('applicationForm.recentApplications.anonymousUser') 
                    : `${application.firstName} ${application.lastName}`
                  }
                </span>
                <span className="application-form-recent-date">
                  {formatDate(application.appliedAt)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="application-form-recent-empty">
            {t('applicationForm.recentApplications.empty')} 🚀
          </div>
        )}
      </div>
    </div>
  );
};