import { useState, useContext, useEffect } from 'react';
import { useLocalizedNavigate } from '../../../hooks/useLocalizedNavigate';
import { useTranslation } from 'react-i18next';
import { UserContext } from '../../contexts/UserContext';
import { useAcademy } from '../../contexts/AcademyProvider';

import './digiBridgeBecomeMentor.css';
import { toast } from 'react-toastify';
import { uploadMentorPhoto, uploadMentorCV } from '../../firebase/firebaseMentorStorage';
import { DigiBridgeHeader } from '../../DigiBridgeAcademy/DigiBridgeHeader/DigiBridgeHeader';
import { useLocation } from 'react-router-dom';
const FORM_STORAGE_KEY = 'digibridge_mentor_application_form';

export const DigiBridgeBecomeMentor = () => {
  const { t } = useTranslation('digibridge');
  const navigate = useLocalizedNavigate();
  const { isAuthentication, profileData } = useContext(UserContext);
  const { applyAsMentor } = useAcademy();
  const location  = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const loadSavedData = () => {
    try {
      const saved = localStorage.getItem(FORM_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading saved form data:', error);
    }
    return null;
  };

  const savedData = loadSavedData();

  const [formData, setFormData] = useState({
    name: savedData?.name || profileData?.details?.username || '',
    email: savedData?.email || profileData?.email || '',
    phone: savedData?.phone || '',
    age: savedData?.age || '',
    country: savedData?.country || 'BG',
    education: savedData?.education || '',
    specialization: savedData?.specialization || '',
    experience: savedData?.experience || '',
    motivation: savedData?.motivation || '',
    availability: savedData?.availability || '',
    languages: savedData?.languages || [],
    viber: savedData?.viber || '',
    facebook: savedData?.facebook || '',
    linkedin: savedData?.linkedin || '',
    otherContact: savedData?.otherContact || '',
    priorityContact: savedData?.priorityContact || 'email',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [photo, setPhoto] = useState(null);
  const [photoUrl, setPhotoUrl] = useState(savedData?.photoUrl || null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoProgress, setPhotoProgress] = useState(0);
  const [photoError, setPhotoError] = useState('');

  const [cv, setCv] = useState(null);
  const [cvUrl, setCvUrl] = useState(savedData?.cvUrl || null);
  const [cvOriginalName, setCvOriginalName] = useState(savedData?.cvOriginalName || '');
  const [cvStoragePath, setCvStoragePath] = useState(savedData?.cvStoragePath || '');
  const [cvUploading, setCvUploading] = useState(false);
  const [cvProgress, setCvProgress] = useState(0);
  const [cvError, setCvError] = useState('');

  const specializations = [
    'Digital Security',
    'Media Literacy',
    'Online Banking',
    'Social Media',
    'Email & Communication',
    'E-Government Services',
    t('digiBridge.becomeMentor.specialization.other')
  ];
  const countryOptions = [
    { code: 'BG', name: '🇧🇬 България', flag: '🇧🇬' },
    { code: 'DE', name: '🇩🇪 Германия', flag: '🇩🇪' },
    { code: 'AT', name: '🇦🇹 Австрия', flag: '🇦🇹' },
    { code: 'GR', name: '🇬🇷 Гърция', flag: '🇬🇷' },
    { code: 'RO', name: '🇷🇴 Румъния', flag: '🇷🇴' },
    { code: 'RS', name: '🇷🇸 Сърбия', flag: '🇷🇸' },
    { code: 'MK', name: '🇲🇰 Северна Македония', flag: '🇲🇰' },
    { code: 'TR', name: '🇹🇷 Турция', flag: '🇹🇷' },
    { code: 'OTHER', name: '🌍 Друга', flag: '🌍' },
  ];
  const availabilityOptions = [
    'Flexible',
    'Weekdays',
    'Weekends',
    'Evenings'
  ];

  const languageOptions = [
    { code: 'bg', name: 'Български' },
    { code: 'en', name: 'English' },
    { code: 'de', name: 'Deutsch' }
  ];

  useEffect(() => {
    const dataToSave = {
      ...formData,
      photoUrl,
      cvUrl,
      cvOriginalName,
      cvStoragePath,
    };

    try {
      localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Error saving form data:', error);
    }
  }, [formData, photoUrl, cvUrl, cvOriginalName, cvStoragePath]);

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedFormats.includes(file.type)) {
      setPhotoError(t('digiBridge.becomeMentor.photo.formatError'));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('Снимката не трябва да е по-голяма от 5MB');
      return;
    }

    setPhotoError('');
    setPhotoUploading(true);
    setPhotoProgress(0);

    try {
      const result = await uploadMentorPhoto(file, (progress) => {
        setPhotoProgress(progress);
      });

      setPhoto(file);
      setPhotoUrl(result.url);
      setPhotoUploading(false);
      toast.success('Снимката е качена успешно!');
    } catch (error) {
      console.error('Error uploading photo:', error);
      setPhotoError(t('digiBridge.becomeMentor.photo.error'));
      setPhotoUploading(false);
    }
  };

  const handleCvChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedFormats = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

    if (!allowedFormats.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      setCvError(t('digiBridge.becomeMentor.cv.formatError'));
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setCvError('CV не трябва да е по-голямо от 10MB');
      return;
    }

    setCvError('');
    setCvUploading(true);
    setCvProgress(0);

    try {
      const result = await uploadMentorCV(file, (progress) => {
        setCvProgress(progress);
      });

      setCv(file);
      setCvUrl(result.url);
      setCvOriginalName(result.originalName);
      setCvStoragePath(result.storagePath);
      setCvUploading(false);
      toast.success('CV е качено успешно!');
    } catch (error) {
      console.error('Error uploading CV:', error);
      setCvError(t('digiBridge.becomeMentor.cv.error'));
      setCvUploading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleLanguageToggle = (langCode) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(langCode)
        ? prev.languages.filter(l => l !== langCode)
        : [...prev.languages, langCode]
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // САМО ЗАДЪЛЖИТЕЛНИТЕ ПОЛЕТА
    if (!formData.name.trim()) newErrors.name = t('digiBridge.becomeMentor.errors.nameRequired');
    if (!formData.email.trim()) newErrors.email = t('digiBridge.becomeMentor.errors.emailRequired');
    if (!formData.phone.trim()) newErrors.phone = 'Телефонът е задължителен';
    if (!formData.age) newErrors.age = t('digiBridge.becomeMentor.errors.ageRequired');
if (!formData.country) newErrors.country = t('digiBridge.becomeMentor.errors.countryRequired');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = t('digiBridge.becomeMentor.errors.emailInvalid');
    }

    if (formData.age && (formData.age < 16 || formData.age > 100)) {
      newErrors.age = t('digiBridge.becomeMentor.errors.ageInvalid');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error(t('digiBridge.becomeMentor.errors.fillRequired'));
      return;
    }

    setIsSubmitting(true);

    try {
      const applicationData = {
        ...formData,
        photoUrl: photoUrl || null,
        cvUrl: cvUrl || null,
        cvOriginalName: cvOriginalName || null,
        cvStoragePath: cvStoragePath || null,
      };

      await applyAsMentor(applicationData);

      localStorage.removeItem(FORM_STORAGE_KEY);

      toast.success(t('digiBridge.becomeMentor.success'));
      navigate('/academy');

    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error(t('digiBridge.becomeMentor.errors.submitError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthentication) {
    return (
      <>
        <DigiBridgeHeader />
        <div className="become-mentor-page">
          <div className="become-mentor-auth-required">
            <div className="become-mentor-auth-card">
              <div className="become-mentor-auth-icon">🔒</div>
              <h2>{t('digiBridge.becomeMentor.authRequired.title')}</h2>
              <p>{t('digiBridge.becomeMentor.authRequired.description')}</p>
              <div className="become-mentor-auth-actions">
                <button
                  className="become-mentor-auth-btn become-mentor-auth-btn-primary"
                  onClick={() => navigate('/sign-up?view=login')}
                >
                  {t('digiBridge.becomeMentor.authRequired.login')}
                </button>
                <button
                  className="become-mentor-auth-btn become-mentor-auth-btn-secondary"
                  onClick={() => navigate('/sign-up?view=register')}
                >
                  {t('digiBridge.becomeMentor.authRequired.register')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <DigiBridgeHeader />

      <div className="become-mentor-page">

        <section className="become-mentor-hero">
          <div className="become-mentor-hero-content">
            <h1 className="become-mentor-hero-title">
              {t('digiBridge.becomeMentor.hero.title')}
            </h1>
            <p className="become-mentor-hero-subtitle">
              {t('digiBridge.becomeMentor.hero.subtitle')}
            </p>
          </div>
        </section>

        <section className="become-mentor-intro-section">
          <div className="become-mentor-intro-container">
            <div className="become-mentor-intro-icon">🎓</div>
            <h2>{t('digiBridge.becomeMentor.intro.title')}</h2>
            <p className="become-mentor-intro-text">
              {t('digiBridge.becomeMentor.intro.description')}
            </p>

            <div className="become-mentor-intro-benefits">
              <div className="become-mentor-intro-benefit">
                <div className="become-mentor-benefit-icon">💡</div>
                <h3>{t('digiBridge.becomeMentor.benefits.benefit1.title')}</h3>
                <p>{t('digiBridge.becomeMentor.benefits.benefit1.description')}</p>
              </div>
              <div className="become-mentor-intro-benefit">
                <div className="become-mentor-benefit-icon">🤝</div>
                <h3>{t('digiBridge.becomeMentor.benefits.benefit2.title')}</h3>
                <p>{t('digiBridge.becomeMentor.benefits.benefit2.description')}</p>
              </div>
              <div className="become-mentor-intro-benefit">
                <div className="become-mentor-benefit-icon">🌟</div>
                <h3>{t('digiBridge.becomeMentor.benefits.benefit3.title')}</h3>
                <p>{t('digiBridge.becomeMentor.benefits.benefit3.description')}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="become-mentor-form-section">
          <div className="become-mentor-form-container">

            <div className="become-mentor-form-intro">
              <h2>{t('digiBridge.becomeMentor.form.title')}</h2>
              <p>{t('digiBridge.becomeMentor.form.subtitle')}</p>
            </div>

            <form className="become-mentor-application-form" onSubmit={handleSubmit}>

              {/* СНИМКА */}
              <div className="become-mentor-form-section">
                <h3 className="become-mentor-form-section-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  {t('digiBridge.becomeMentor.photo.label')}
                </h3>

                <div className="become-mentor-photo-upload">
                  {photoUrl ? (
                    <div className="become-mentor-photo-preview">
                      <img src={photoUrl} alt="Preview" />
                    </div>
                  ) : (
                    <div className="become-mentor-photo-placeholder">
                      📷
                    </div>
                  )}

                  <div className="become-mentor-photo-actions">
                    <input
                      type="file"
                      id="become-mentor-photo-input"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handlePhotoChange}
                      style={{ display: 'none' }}
                      disabled={photoUploading}
                    />

                    <label htmlFor="become-mentor-photo-input">
                      <button
                        type="button"
                        className="become-mentor-photo-btn"
                        onClick={() => document.getElementById('become-mentor-photo-input').click()}
                        disabled={photoUploading}
                      >
                        {photoUploading ? (
                          <>
                            <div className="become-mentor-btn-spinner"></div>
                            {t('digiBridge.becomeMentor.photo.uploading')}
                          </>
                        ) : photoUrl ? (
                          <>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                              <polyline points="17 8 12 3 7 8" />
                              <line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                            {t('digiBridge.becomeMentor.photo.change')}
                          </>
                        ) : (
                          <>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                              <polyline points="17 8 12 3 7 8" />
                              <line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                            {t('digiBridge.becomeMentor.photo.upload')}
                          </>
                        )}
                      </button>
                    </label>

                    {photoUploading && (
                      <div className="become-mentor-photo-progress">
                        <div
                          className="become-mentor-photo-progress-bar"
                          style={{ width: `${photoProgress}%` }}
                        />
                      </div>
                    )}

                    {photoError && (
                      <p className="become-mentor-photo-error">{photoError}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* ЛИЧНА ИНФОРМАЦИЯ */}
              <div className="become-mentor-form-section">
                <h3 className="become-mentor-form-section-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  {t('digiBridge.becomeMentor.sections.personalInfo')}
                </h3>

                <div className="become-mentor-form-grid">
                  <div className="become-mentor-form-field">
                    <label>
                      {t('digiBridge.becomeMentor.form.name')}
                      <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={errors.name ? 'become-mentor-input-error' : ''}
                      placeholder={t('digiBridge.becomeMentor.form.namePlaceholder')}
                    />
                    {errors.name && <span className="become-mentor-field-error">{errors.name}</span>}
                  </div>

                  <div className="become-mentor-form-field">
                    <label>
                      {t('digiBridge.becomeMentor.form.age')}
                      <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      className={errors.age ? 'become-mentor-input-error' : ''}
                      min="16"
                      max="100"
                    />
                    {errors.age && <span className="become-mentor-field-error">{errors.age}</span>}
                  </div>
                  <div className="become-mentor-form-field">
                    <label>
                      {t('digiBridge.becomeMentor.form.country')}
                      <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className={errors.country ? 'become-mentor-input-error' : ''}
                    >
                      {countryOptions.map(country => (
                        <option key={country.code} value={country.code}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                    {errors.country && <span className="become-mentor-field-error">{errors.country}</span>}
                  </div>
                  <div className="become-mentor-form-field">
                    <label>
                      {t('digiBridge.becomeMentor.form.email')}
                      <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={errors.email ? 'become-mentor-input-error' : ''}
                      placeholder="example@email.com"
                    />
                    {errors.email && <span className="become-mentor-field-error">{errors.email}</span>}
                  </div>

                  <div className="become-mentor-form-field">
                    <label>
                      {t('digiBridge.becomeMentor.contactMethods.phone')}
                      <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={errors.phone ? 'become-mentor-input-error' : ''}
                      placeholder="+359 888 123 456"
                    />
                    {errors.phone && <span className="become-mentor-field-error">{errors.phone}</span>}
                  </div>
                </div>
              </div>

              {/* НАЧИНИ ЗА ВРЪЗКА */}
              <div className="become-mentor-form-section">
                <h3 className="become-mentor-form-section-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  {t('digiBridge.becomeMentor.contactMethods.title')}
                </h3>

                <div className="become-mentor-contact-methods">
                  <div className="become-mentor-contact-field become-mentor-contact-field-optional">
                    <label>{t('digiBridge.becomeMentor.contactMethods.viber')}</label>
                    <input
                      type="text"
                      name="viber"
                      value={formData.viber}
                      onChange={handleInputChange}
                      placeholder="+359 888 123 456"
                    />
                  </div>

                  <div className="become-mentor-contact-field become-mentor-contact-field-optional">
                    <label>{t('digiBridge.becomeMentor.contactMethods.facebook')}</label>
                    <input
                      type="text"
                      name="facebook"
                      value={formData.facebook}
                      onChange={handleInputChange}
                      placeholder="facebook.com/yourprofile"
                    />
                  </div>

                  <div className="become-mentor-contact-field become-mentor-contact-field-optional">
                    <label>{t('digiBridge.becomeMentor.contactMethods.linkedin')}</label>
                    <input
                      type="text"
                      name="linkedin"
                      value={formData.linkedin}
                      onChange={handleInputChange}
                      placeholder="linkedin.com/in/yourprofile"
                    />
                  </div>

                  <div className="become-mentor-contact-field become-mentor-contact-field-optional">
                    <label>{t('digiBridge.becomeMentor.contactMethods.other')}</label>
                    <input
                      type="text"
                      name="otherContact"
                      value={formData.otherContact}
                      onChange={handleInputChange}
                      placeholder={t('digiBridge.becomeMentor.contactMethods.otherPlaceholder')}
                    />
                  </div>
                </div>
              </div>

              {/* ОБРАЗОВАНИЕ И ОПИТ */}
              <div className="become-mentor-form-section">
                <h3 className="become-mentor-form-section-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                    <path d="M6 12v5c3 3 9 3 12 0v-5" />
                  </svg>
                  {t('digiBridge.becomeMentor.sections.education')}
                </h3>

                <div className="become-mentor-form-grid">
                  <div className="become-mentor-form-field become-mentor-form-field-full">
                    <label>{t('digiBridge.becomeMentor.form.education')}</label>
                    <input
                      type="text"
                      name="education"
                      value={formData.education}
                      onChange={handleInputChange}
                      placeholder={t('digiBridge.becomeMentor.form.educationPlaceholder')}
                    />
                  </div>

                  <div className="become-mentor-form-field">
                    <label>{t('digiBridge.becomeMentor.form.specialization')}</label>
                    <select
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleInputChange}
                    >
                      <option value="">{t('digiBridge.becomeMentor.form.specializationPlaceholder')}</option>
                      {specializations.map(spec => (
                        <option key={spec} value={spec}>{spec}</option>
                      ))}
                    </select>
                  </div>

                  <div className="become-mentor-form-field">
                    <label>{t('digiBridge.becomeMentor.form.experience')}</label>
                    <input
                      type="text"
                      name="experience"
                      value={formData.experience}
                      onChange={handleInputChange}
                      placeholder={t('digiBridge.becomeMentor.form.experiencePlaceholder')}
                    />
                  </div>

                  <div className="become-mentor-form-field become-mentor-form-field-full">
                    <label>{t('digiBridge.becomeMentor.form.motivation')}</label>
                    <textarea
                      name="motivation"
                      value={formData.motivation}
                      onChange={handleInputChange}
                      rows="5"
                      maxLength="500"
                      placeholder={t('digiBridge.becomeMentor.form.motivationPlaceholder')}
                    />
                    <div className="become-mentor-textarea-counter">{formData.motivation.length}/500</div>
                  </div>
                </div>
              </div>

              {/* ГРАФИК И ЕЗИЦИ */}
              <div className="become-mentor-form-section">
                <h3 className="become-mentor-form-section-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  {t('digiBridge.becomeMentor.sections.schedule')}
                </h3>

                <div className="become-mentor-form-grid">
                  <div className="become-mentor-form-field">
                    <label>{t('digiBridge.becomeMentor.form.schedule')}</label>
                    <select
                      name="availability"
                      value={formData.availability}
                      onChange={handleInputChange}
                    >
                      <option value="">{t('digiBridge.becomeMentor.form.schedulePlaceholder')}</option>
                      {availabilityOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                    <p className="become-mentor-field-helper">
                      {t('digiBridge.becomeMentor.form.scheduleHelper')}
                    </p>
                  </div>

                  <div className="become-mentor-form-field become-mentor-form-field-full">
                    <label>{t('digiBridge.becomeMentor.form.languages')}</label>
                    <div className="become-mentor-language-checkboxes">
                      {languageOptions.map(lang => (
                        <label key={lang.code} className="become-mentor-language-checkbox">
                          <input
                            type="checkbox"
                            checked={formData.languages.includes(lang.code)}
                            onChange={() => handleLanguageToggle(lang.code)}
                          />
                          <span>{lang.name}</span>
                        </label>
                      ))}
                    </div>
                    <p className="become-mentor-field-helper">
                      {t('digiBridge.becomeMentor.form.languagesHelper')}
                    </p>
                  </div>
                </div>
              </div>

              {/* CV UPLOAD */}
              <div className="become-mentor-form-section">
                <h3 className="become-mentor-form-section-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                  {t('digiBridge.becomeMentor.cv.label')}
                  <span style={{ color: '#9ca3af', fontSize: '0.9rem', fontWeight: 500 }}>
                    ({t('digiBridge.becomeMentor.cv.optional')})
                  </span>
                </h3>

                <div className="become-mentor-cv-upload">
                  {!cvUrl ? (
                    <>
                      <input
                        type="file"
                        id="become-mentor-cv-input"
                        className="become-mentor-cv-input"
                        accept=".pdf,.doc,.docx,.txt"
                        onChange={handleCvChange}
                        disabled={cvUploading}
                      />

                      <label htmlFor="become-mentor-cv-input" className="become-mentor-cv-label">
                        {cvUploading ? (
                          <>
                            <div className="become-mentor-btn-spinner"></div>
                            {t('digiBridge.becomeMentor.cv.uploading')}
                          </>
                        ) : (
                          <>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                              <polyline points="17 8 12 3 7 8" />
                              <line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                            {t('digiBridge.becomeMentor.cv.upload')}
                          </>
                        )}
                      </label>
                    </>
                  ) : (
                    <div className="become-mentor-cv-file-info">
                      <div className="become-mentor-cv-file-details">
                        <div className="become-mentor-cv-file-icon">
                          {cvOriginalName.endsWith('.pdf') ? 'PDF' : 'DOC'}
                        </div>
                        <div className="become-mentor-cv-file-name">{cvOriginalName}</div>
                      </div>
                      <button
                        type="button"
                        className="become-mentor-cv-change-btn"
                        onClick={() => {
                          setCvUrl(null);
                          setCv(null);
                          setCvOriginalName('');
                          setCvStoragePath('');
                        }}
                      >
                        {t('digiBridge.becomeMentor.cv.change')}
                      </button>
                    </div>
                  )}

                  {cvUploading && (
                    <div className="become-mentor-cv-progress">
                      <div
                        className="become-mentor-cv-progress-bar"
                        style={{ width: `${cvProgress}%` }}
                      />
                    </div>
                  )}

                  {cvError && (
                    <p className="become-mentor-cv-error">{cvError}</p>
                  )}
                </div>
              </div>

              {/* SUBMIT */}
              <div className="become-mentor-form-submit">
                <button
                  type="submit"
                  className="become-mentor-submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="become-mentor-btn-spinner"></div>
                      {t('digiBridge.becomeMentor.form.submitting')}
                    </>
                  ) : (
                    <>
                      {t('digiBridge.becomeMentor.form.submit')}
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </>
                  )}
                </button>
                <p className="become-mentor-form-submit-note">
                  {t('digiBridge.becomeMentor.form.submitNote')}
                </p>
              </div>
            </form>
          </div>
        </section>
      </div>
    </>
  );
};

export default DigiBridgeBecomeMentor;