import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import './digiBridgeBecomeMentor.css';
import { UserContext } from '../../contexts/UserContext';
import { useAcademy } from '../../contexts/AcademyProvider';
import { DigiBridgeHeader } from '../../DigiBridgeAcademy/DigiBridgeHeader/DigiBridgeHeader';

export const DigiBridgeBecomeMentor = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthentication } = useContext(UserContext);
  const { applyAsMentor, isLoading } = useAcademy();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    education: '',
    specialization: '',
    experience: '',
    motivation: '',
    availability: '',
    languages: [],
    cv: null
  });

  const [errors, setErrors] = useState({});

  // Ако не е логнат
  if (!isAuthentication) {
    return (
      <>
        <Helmet>
          <title>{t('digiBridge.becomeMentor.meta.title')}</title>
          <meta name="description" content={t('digiBridge.becomeMentor.meta.description')} />
        </Helmet>
        
        <div className="become-mentor-page">
          <DigiBridgeHeader />
          
          <div className="become-mentor-auth-required">
            <div className="auth-required-card">
              <div className="auth-required-icon">{t('digiBridge.becomeMentor.authRequired.icon')}</div>
              <h2>{t('digiBridge.becomeMentor.authRequired.title')}</h2>
              <p>{t('digiBridge.becomeMentor.authRequired.description')}</p>
              <div className="auth-required-actions">
                <button 
                  className="auth-btn auth-btn-primary"
                  onClick={() => navigate('/login')}
                >
                  {t('digiBridge.becomeMentor.authRequired.loginButton')}
                </button>
                <button 
                  className="auth-btn auth-btn-secondary"
                  onClick={() => navigate('/register')}
                >
                  {t('digiBridge.becomeMentor.authRequired.registerButton')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  const specializations = [
    'Digital Security',
    'Media Literacy',
    'Social Media',
    'Online Banking',
    'Basic Computer Skills',
    'Advanced Digital Skills'
  ];

  const languageOptions = ['Български', 'English', 'Deutsch', 'Français'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleLanguageToggle = (lang) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter(l => l !== lang)
        : [...prev.languages, lang]
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5000000) { // 5MB
        toast.error(t('digiBridge.becomeMentor.form.errors.fileTooBig'));
        return;
      }
      setFormData(prev => ({ ...prev, cv: file }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = t('digiBridge.becomeMentor.form.errors.name');
    if (!formData.email.trim()) newErrors.email = t('digiBridge.becomeMentor.form.errors.email');
    if (!formData.phone.trim()) newErrors.phone = t('digiBridge.becomeMentor.form.errors.phone');
    if (!formData.age || formData.age < 18) newErrors.age = t('digiBridge.becomeMentor.form.errors.age');
    if (!formData.education.trim()) newErrors.education = t('digiBridge.becomeMentor.form.errors.education');
    if (!formData.specialization) newErrors.specialization = t('digiBridge.becomeMentor.form.errors.specialization');
    if (!formData.experience.trim()) newErrors.experience = t('digiBridge.becomeMentor.form.errors.experience');
    if (!formData.motivation.trim() || formData.motivation.length < 50) {
      newErrors.motivation = t('digiBridge.becomeMentor.form.errors.motivation');
    }
    if (!formData.availability.trim()) newErrors.availability = t('digiBridge.becomeMentor.form.errors.availability');
    if (formData.languages.length === 0) newErrors.languages = t('digiBridge.becomeMentor.form.errors.languages');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      toast.error(t('digiBridge.becomeMentor.form.errors.fillAll'));
      return;
    }

    try {
      await applyAsMentor(formData);
      navigate('/academy/mentors');
    } catch (error) {
      console.error('Error applying as mentor:', error);
    }
  };

  return (
    <>
      <Helmet>
        <title>{t('digiBridge.becomeMentor.meta.title')}</title>
        <meta name="description" content={t('digiBridge.becomeMentor.meta.description')} />
      </Helmet>

      <div className="become-mentor-page">
        <DigiBridgeHeader />

        {/* HERO */}
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

        {/* INTRO */}
        <section className="become-mentor-intro-section">
          <div className="become-mentor-intro-container">
            <div className="intro-icon">{t('digiBridge.becomeMentor.intro.icon')}</div>
            <h2>{t('digiBridge.becomeMentor.intro.title')}</h2>
            <p className="intro-text">
              {t('digiBridge.becomeMentor.intro.description')}
            </p>
            <div className="intro-benefits">
              <div className="intro-benefit">
                <div className="benefit-icon">{t('digiBridge.becomeMentor.intro.benefits.change.icon')}</div>
                <h3>{t('digiBridge.becomeMentor.intro.benefits.change.title')}</h3>
                <p>{t('digiBridge.becomeMentor.intro.benefits.change.description')}</p>
              </div>
              <div className="intro-benefit">
                <div className="benefit-icon">{t('digiBridge.becomeMentor.intro.benefits.community.icon')}</div>
                <h3>{t('digiBridge.becomeMentor.intro.benefits.community.title')}</h3>
                <p>{t('digiBridge.becomeMentor.intro.benefits.community.description')}</p>
              </div>
              <div className="intro-benefit">
                <div className="benefit-icon">{t('digiBridge.becomeMentor.intro.benefits.development.icon')}</div>
                <h3>{t('digiBridge.becomeMentor.intro.benefits.development.title')}</h3>
                <p>{t('digiBridge.becomeMentor.intro.benefits.development.description')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* FORM */}
        <section className="become-mentor-form-section">
          <div className="become-mentor-form-container">
            
            <div className="mentor-form-intro">
              <h2>{t('digiBridge.becomeMentor.form.title')}</h2>
              <p>{t('digiBridge.becomeMentor.form.subtitle')}</p>
            </div>

            <form onSubmit={handleSubmit} className="mentor-application-form">
              
              {/* Personal Info */}
              <div className="form-section">
                <h3 className="form-section-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  {t('digiBridge.becomeMentor.form.sections.personal')}
                </h3>
                
                <div className="form-grid">
                  <div className="form-field">
                    <label>{t('digiBridge.becomeMentor.form.fields.name.label')} *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={errors.name ? 'error' : ''}
                      placeholder={t('digiBridge.becomeMentor.form.fields.name.placeholder')}
                    />
                    {errors.name && <span className="field-error">{errors.name}</span>}
                  </div>

                  <div className="form-field">
                    <label>{t('digiBridge.becomeMentor.form.fields.email.label')} *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={errors.email ? 'error' : ''}
                      placeholder={t('digiBridge.becomeMentor.form.fields.email.placeholder')}
                    />
                    {errors.email && <span className="field-error">{errors.email}</span>}
                  </div>

                  <div className="form-field">
                    <label>{t('digiBridge.becomeMentor.form.fields.phone.label')} *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={errors.phone ? 'error' : ''}
                      placeholder={t('digiBridge.becomeMentor.form.fields.phone.placeholder')}
                    />
                    {errors.phone && <span className="field-error">{errors.phone}</span>}
                  </div>

                  <div className="form-field">
                    <label>{t('digiBridge.becomeMentor.form.fields.age.label')} *</label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleChange}
                      className={errors.age ? 'error' : ''}
                      placeholder={t('digiBridge.becomeMentor.form.fields.age.placeholder')}
                      min="18"
                    />
                    {errors.age && <span className="field-error">{errors.age}</span>}
                  </div>
                </div>
              </div>

              {/* Professional Info */}
              <div className="form-section">
                <h3 className="form-section-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                  </svg>
                  {t('digiBridge.becomeMentor.form.sections.professional')}
                </h3>
                
                <div className="form-grid">
                  <div className="form-field form-field-full">
                    <label>{t('digiBridge.becomeMentor.form.fields.education.label')} *</label>
                    <input
                      type="text"
                      name="education"
                      value={formData.education}
                      onChange={handleChange}
                      className={errors.education ? 'error' : ''}
                      placeholder={t('digiBridge.becomeMentor.form.fields.education.placeholder')}
                    />
                    {errors.education && <span className="field-error">{errors.education}</span>}
                  </div>

                  <div className="form-field">
                    <label>{t('digiBridge.becomeMentor.form.fields.specialization.label')} *</label>
                    <select
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleChange}
                      className={errors.specialization ? 'error' : ''}
                    >
                      <option value="">{t('digiBridge.becomeMentor.form.fields.specialization.placeholder')}</option>
                      {specializations.map(spec => (
                        <option key={spec} value={spec}>{spec}</option>
                      ))}
                    </select>
                    {errors.specialization && <span className="field-error">{errors.specialization}</span>}
                  </div>

                  <div className="form-field">
                    <label>{t('digiBridge.becomeMentor.form.fields.experience.label')} *</label>
                    <input
                      type="text"
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      className={errors.experience ? 'error' : ''}
                      placeholder={t('digiBridge.becomeMentor.form.fields.experience.placeholder')}
                    />
                    {errors.experience && <span className="field-error">{errors.experience}</span>}
                  </div>

                  <div className="form-field form-field-full">
                    <label>{t('digiBridge.becomeMentor.form.fields.availability.label')} *</label>
                    <input
                      type="text"
                      name="availability"
                      value={formData.availability}
                      onChange={handleChange}
                      className={errors.availability ? 'error' : ''}
                      placeholder={t('digiBridge.becomeMentor.form.fields.availability.placeholder')}
                    />
                    {errors.availability && <span className="field-error">{errors.availability}</span>}
                  </div>
                </div>
              </div>

              {/* Languages */}
              <div className="form-section">
                <h3 className="form-section-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                  </svg>
                  {t('digiBridge.becomeMentor.form.sections.languages')} *
                </h3>
                
                <div className="language-checkboxes">
                  {languageOptions.map(lang => (
                    <label key={lang} className="language-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.languages.includes(lang)}
                        onChange={() => handleLanguageToggle(lang)}
                      />
                      <span>{lang}</span>
                    </label>
                  ))}
                </div>
                {errors.languages && <span className="field-error">{errors.languages}</span>}
              </div>

              {/* Motivation */}
              <div className="form-section">
                <h3 className="form-section-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                  {t('digiBridge.becomeMentor.form.sections.motivation')} *
                </h3>
                
                <div className="form-field form-field-full">
                  <textarea
                    name="motivation"
                    value={formData.motivation}
                    onChange={handleChange}
                    className={errors.motivation ? 'error' : ''}
                    placeholder={t('digiBridge.becomeMentor.form.fields.motivation.placeholder')}
                    rows="6"
                  />
                  <div className="textarea-counter">
                    {formData.motivation.length} / 50 {t('digiBridge.becomeMentor.form.counter')}
                  </div>
                  {errors.motivation && <span className="field-error">{errors.motivation}</span>}
                </div>
              </div>

              {/* CV Upload */}
              <div className="form-section">
                <h3 className="form-section-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  {t('digiBridge.becomeMentor.form.sections.cv')}
                </h3>
                
                <div className="file-upload">
                  <input
                    type="file"
                    id="cv-upload"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="file-input"
                  />
                  <label htmlFor="cv-upload" className="file-upload-label">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    <span>
                      {formData.cv ? formData.cv.name : t('digiBridge.becomeMentor.form.fields.cv.placeholder')}
                    </span>
                  </label>
                </div>
              </div>

              {/* Submit */}
              <div className="form-submit">
                <button 
                  type="submit" 
                  className="mentor-submit-btn"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="btn-spinner"></span>
                      {t('digiBridge.becomeMentor.form.submitting')}
                    </>
                  ) : (
                    <>
                      {t('digiBridge.becomeMentor.form.submitButton')}
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </>
                  )}
                </button>
                <p className="form-submit-note">
                  {t('digiBridge.becomeMentor.form.note')}
                </p>
              </div>

            </form>
          </div>
        </section>

      </div>
    </>
  );
};