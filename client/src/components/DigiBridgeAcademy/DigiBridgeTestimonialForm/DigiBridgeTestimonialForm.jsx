import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import './digiBridgeTestimonialForm.css';

export const DigiBridgeTestimonialForm = () => {
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    email: '',
    text: '',
    rating: 5,
    consent: false,
  });
  
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleRatingChange = (rating) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Валидация
    if (!formData.name || !formData.role || !formData.email || !formData.text) {
      toast.error(t('digiBridge.testimonialForm.fillAllFields'));
      return;
    }

    if (!formData.consent) {
      toast.error(t('digiBridge.testimonialForm.consentRequired'));
      return;
    }

    setLoading(true);

    try {
      // ТУК ЩЕ ДОБАВИМ API CALL КОГАТО Е ГОТОВ
      // await academyService.submitTestimonial(formData);
      
      // ЗА СЕГА - просто симулираме успех
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success(t('digiBridge.testimonialForm.successMessage'));
      
      // Изчистване на формата
      setFormData({
        name: '',
        role: '',
        email: '',
        text: '',
        rating: 5,
        consent: false,
      });

    } catch (error) {
      console.error('Error submitting testimonial:', error);
      toast.error(t('digiBridge.testimonialForm.errorMessage'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="digibridge-testimonial-form">
      <div className="digibridge-testimonial-form-container">
        
        <div className="digibridge-testimonial-form-header">
          <div className="digibridge-testimonial-form-icon">✨</div>
          <h2 className="digibridge-testimonial-form-title">
            {t('digiBridge.testimonialForm.title')}
          </h2>
          <p className="digibridge-testimonial-form-subtitle">
            {t('digiBridge.testimonialForm.subtitle')}
          </p>
        </div>

        <form className="digibridge-testimonial-form-form" onSubmit={handleSubmit}>
          
          <div className="digibridge-testimonial-form-row">
            <div className="digibridge-testimonial-form-field">
              <label className="digibridge-testimonial-form-label">
                {t('digiBridge.testimonialForm.nameLabel')} <span className="required">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={t('digiBridge.testimonialForm.namePlaceholder')}
                className="digibridge-testimonial-form-input"
                disabled={loading}
              />
            </div>

            <div className="digibridge-testimonial-form-field">
              <label className="digibridge-testimonial-form-label">
                {t('digiBridge.testimonialForm.roleLabel')} <span className="required">*</span>
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="digibridge-testimonial-form-input"
                disabled={loading}
              >
                <option value="">{t('digiBridge.testimonialForm.roleSelect')}</option>
                <option value="participant">{t('digiBridge.testimonialForm.roleParticipant')}</option>
                <option value="mentor">{t('digiBridge.testimonialForm.roleMentor')}</option>
              </select>
            </div>
          </div>

          <div className="digibridge-testimonial-form-field">
            <label className="digibridge-testimonial-form-label">
              {t('digiBridge.testimonialForm.emailLabel')} <span className="required">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={t('digiBridge.testimonialForm.emailPlaceholder')}
              className="digibridge-testimonial-form-input"
              disabled={loading}
            />
            <small className="digibridge-testimonial-form-hint">
              {t('digiBridge.testimonialForm.emailHint')}
            </small>
          </div>

          <div className="digibridge-testimonial-form-field">
            <label className="digibridge-testimonial-form-label">
              {t('digiBridge.testimonialForm.ratingLabel')} <span className="required">*</span>
            </label>
            <div className="digibridge-testimonial-form-rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`digibridge-testimonial-form-star ${star <= formData.rating ? 'active' : ''}`}
                  onClick={() => handleRatingChange(star)}
                  disabled={loading}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div className="digibridge-testimonial-form-field">
            <label className="digibridge-testimonial-form-label">
              {t('digiBridge.testimonialForm.textLabel')} <span className="required">*</span>
            </label>
            <textarea
              name="text"
              value={formData.text}
              onChange={handleChange}
              placeholder={t('digiBridge.testimonialForm.textPlaceholder')}
              className="digibridge-testimonial-form-textarea"
              rows="6"
              maxLength="500"
              disabled={loading}
            />
            <small className="digibridge-testimonial-form-char-count">
              {formData.text.length}/500
            </small>
          </div>

          <div className="digibridge-testimonial-form-consent">
            <label className="digibridge-testimonial-form-checkbox">
              <input
                type="checkbox"
                name="consent"
                checked={formData.consent}
                onChange={handleChange}
                disabled={loading}
              />
              <span>{t('digiBridge.testimonialForm.consentText')}</span>
            </label>
          </div>

          <button
            type="submit"
            className="digibridge-testimonial-form-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="digibridge-testimonial-form-spinner"></div>
                {t('digiBridge.testimonialForm.sendingButton')}
              </>
            ) : (
              t('digiBridge.testimonialForm.sendButton')
            )}
          </button>

        </form>

      </div>
    </section>
  );
};