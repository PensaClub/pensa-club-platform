import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEnvelope,
  faPaperPlane,
  faUser,
  faComments,
  faCheckCircle,
  faExclamationTriangle,
  faSpinner,
  faGlobe
} from '@fortawesome/free-solid-svg-icons';
import './aboutContact.css';
import { useClubContext } from '../../contexts/ClubContext';

export const AboutContact = () => {
  const { t } = useTranslation();
  const { sendPersonalEmail } = useClubContext();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [formStatus, setFormStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormStatus({ type: '', message: '' });

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setFormStatus({
        type: 'error',
        message: t('about.contact.form.validation.required')
      });
      setIsSubmitting(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setFormStatus({
        type: 'error',
        message: t('about.contact.form.validation.invalidEmail')
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const success = await sendPersonalEmail({
        from: formData.email,
        to: 'info@pensa.club',
        subject: formData.subject || `Съобщение от ${formData.name}`,
        message: `Име: ${formData.name}\nИмейл: ${formData.email}\n\n${formData.message}`
      });

      if (success) {
        setFormStatus({
          type: 'success',
          message: t('about.contact.form.messages.success')
        });

        setTimeout(() => {
          setFormData({
            name: '',
            email: '',
            subject: '',
            message: ''
          });
          setFormStatus({ type: '', message: '' });
        }, 3000);
      } else {
        setFormStatus({
          type: 'error',
          message: t('about.contact.form.messages.error')
        });
      }
    } catch (error) {
      console.error('Грешка при изпращане на контактна форма:', error);
      setFormStatus({
        type: 'error',
        message: t('about.contact.form.messages.error')
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="aboutcontact-section">
      <div className="aboutcontact-container">
        <div className="aboutcontact-header">
          <span className="aboutcontact-label">{t('about.contact.label')}</span>
          <h2 className="aboutcontact-title">{t('about.contact.title')}</h2>
          <p className="aboutcontact-description">
            {t('about.contact.description')}
          </p>
        </div>

        <div className="aboutcontact-content">
          <div className="aboutcontact-info">
            <div className="aboutcontact-info-item">
              <div className="aboutcontact-info-icon">
                <FontAwesomeIcon icon={faEnvelope} />
              </div>
              <div className="aboutcontact-info-text">
                <h4>{t('about.contact.info.email')}</h4>
                <a href="mailto:info@pensa.club">info@pensa.club</a>
              </div>
            </div>

            <div className="aboutcontact-info-item">
              <div className="aboutcontact-info-icon">
                <FontAwesomeIcon icon={faGlobe} />
              </div>
              <div className="aboutcontact-info-text">
                <h4>{t('about.contact.info.website')}</h4>
                <a href="https://pensa.club" target="_blank" rel="noopener noreferrer">pensa.club</a>
              </div>
            </div>
          </div>

          <div className="aboutcontact-form-wrapper">
            <form onSubmit={handleSubmit} className="aboutcontact-form">
              <div className="aboutcontact-form-row">
                <div className="aboutcontact-form-field">
                  <label htmlFor="aboutcontact-name">{t('about.contact.form.fields.name')} *</label>
                  <div className="aboutcontact-input-wrapper">
                    <FontAwesomeIcon icon={faUser} className="aboutcontact-field-icon" />
                    <input
                      type="text"
                      id="aboutcontact-name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder={t('about.contact.form.placeholders.name')}
                      required
                    />
                  </div>
                </div>

                <div className="aboutcontact-form-field">
                  <label htmlFor="aboutcontact-email">{t('about.contact.form.fields.email')} *</label>
                  <div className="aboutcontact-input-wrapper">
                    <FontAwesomeIcon icon={faEnvelope} className="aboutcontact-field-icon" />
                    <input
                      type="email"
                      id="aboutcontact-email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder={t('about.contact.form.placeholders.email')}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="aboutcontact-form-field">
                <label htmlFor="aboutcontact-subject">{t('about.contact.form.fields.subject')}</label>
                <div className="aboutcontact-input-wrapper">
                  <FontAwesomeIcon icon={faComments} className="aboutcontact-field-icon" />
                  <input
                    type="text"
                    id="aboutcontact-subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder={t('about.contact.form.placeholders.subject')}
                  />
                </div>
              </div>

              <div className="aboutcontact-form-field">
                <label htmlFor="aboutcontact-message">{t('about.contact.form.fields.message')} *</label>
                <div className="aboutcontact-input-wrapper">
                  <FontAwesomeIcon icon={faComments} className="aboutcontact-field-icon" />
                  <textarea
                    id="aboutcontact-message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder={t('about.contact.form.placeholders.message')}
                    rows="6"
                    required
                  ></textarea>
                </div>
              </div>

              {formStatus.message && (
                <div className={`aboutcontact-form-alert aboutcontact-form-alert-${formStatus.type}`}>
                  <FontAwesomeIcon
                    icon={formStatus.type === 'success' ? faCheckCircle : faExclamationTriangle}
                  />
                  <span>{formStatus.message}</span>
                </div>
              )}

              <button
                type="submit"
                className="aboutcontact-submit-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} className="aboutcontact-spinning" />
                    {t('about.contact.form.submitting')}
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faPaperPlane} />
                    {t('about.contact.form.submit')}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutContact;