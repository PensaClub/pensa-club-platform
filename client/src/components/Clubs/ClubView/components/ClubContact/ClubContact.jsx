import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEnvelope,
  faPhone,
  faClock,
  faMapMarkerAlt,
  faPaperPlane,
  faUser,
  faTag,
  faComments,
  faCheckCircle,
  faExclamationTriangle,
  faSpinner,
  faCalendarAlt,
  faQuestionCircle,
  faTimes,
  faInfoCircle,
  faRoute,
  faShare,
  faHeadset,
  faBusinessTime,
  faMobileAlt,
  faGlobe,
  faLocationDot,
  faHandshake,
  faUserFriends,
  faChevronDown,
  faChevronUp
} from '@fortawesome/free-solid-svg-icons';
import {
  faFacebook,
  faInstagram,
  faYoutube,
  faTwitter,
  faLinkedin
} from '@fortawesome/free-brands-svg-icons';
import './clubContact.css';

export const ClubContact = ({ club }) => {
  const { t, i18n } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'membership',
    message: '',
    preferredContact: 'email'
  });
  const [formStatus, setFormStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);
  const [showHoursModal, setShowHoursModal] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  console.log("club", club);
  
  // ПРОВЕРКА ЗА ДАННИ
  if (!club?.contacts || (!club.contacts.phone && !club.contacts.email)) {
    return null;
  }

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

    if (!formData.name || !formData.email || !formData.message) {
      setFormStatus({
        type: 'error',
        message: t('clubs.ClubContact.form.validation.required')
      });
      setIsSubmitting(false);
      return;
    }

    // Изпращане на имейл чрез mailto
    const recipientEmail = club.contacts.email;
    const subject = encodeURIComponent(`${getSubjectLabel(formData.subject)} - ${formData.name}`);
    const body = encodeURIComponent(t('clubs.ClubContact.form.emailBody', {
      name: formData.name,
      email: formData.email,
      phone: formData.phone || t('clubs.ClubContact.form.notSpecified'),
      preferredContact: formData.preferredContact === 'email' ? t('clubs.ClubContact.form.email') : t('clubs.ClubContact.form.phone'),
      subject: getSubjectLabel(formData.subject),
      message: formData.message,
      clubName: club.name,
      date: new Date().toLocaleDateString(i18n.language === 'bg' ? 'bg-BG' : i18n.language === 'en' ? 'en-US' : 'de-DE')
    }));

    try {
      // Симулация на изпращане
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Отваряне на mailto
      if (recipientEmail) {
        window.location.href = `mailto:${recipientEmail}?subject=${subject}&body=${body}`;
      }

      setFormStatus({
        type: 'success',
        message: t('clubs.ClubContact.form.messages.success')
      });

      // Изчистване на формата след успех
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: 'membership',
          message: '',
          preferredContact: 'email'
        });
        setFormStatus({ type: '', message: '' });
      }, 3000);

    } catch (error) {
      setFormStatus({
        type: 'error',
        message: t('clubs.ClubContact.form.messages.error')
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSubjectLabel = (subject) => {
    return t(`clubs.ClubContact.form.subjects.${subject}`);
  };

  const getSocialIcon = (platform) => {
    const icons = {
      'facebook': faFacebook,
      'instagram': faInstagram,
      'youtube': faYoutube,
      'twitter': faTwitter,
      'linkedin': faLinkedin
    };
    return icons[platform.toLowerCase()] || faGlobe;
  };

  const getSocialUrl = (platform, handle) => {
    // Проверка за null/undefined/празен string
    if (!handle || typeof handle !== 'string') return '#';

    if (handle.startsWith('http')) return handle;

    const urls = {
      'facebook': `https://${handle}`,
      'instagram': `https://instagram.com/${handle.replace('@', '')}`,
      'youtube': `https://youtube.com/${handle}`,
      'twitter': `https://twitter.com/${handle.replace('@', '')}`,
      'linkedin': `https://linkedin.com/company/${handle}`
    };

    return urls[platform.toLowerCase()] || `https://${handle}`;
  };

  const getTodayHours = () => {
    if (!club.contacts?.workingHours || typeof club.contacts.workingHours !== 'object') {
      return t('clubs.ClubContact.workingHours.notSpecified');
    }

    const today = new Date().getDay();
    const dayIndex = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][today];

    let hours;

    // Проверява дали има нова структура с days
    if (club.contacts.workingHours.days && club.contacts.workingHours.days[dayIndex]) {
      const dayData = club.contacts.workingHours.days[dayIndex];
      if (dayData.enabled && dayData.open && dayData.close) {
        hours = `${dayData.open}-${dayData.close}`;
      } else {
        hours = 'closed';
      }
    } else {
      // Legacy структура
      hours = club.contacts.workingHours[dayIndex];
    }

    // Проверяваме дали часовете са string или валидна стойност
    if (!hours || typeof hours !== 'string') {
      return 'closed';
    }

    return hours;
  };

  const getTodayName = () => {
    const today = new Date().getDay();
    const dayIndex = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][today];
    return t(`clubs.ClubContact.days.${dayIndex}`);
  };

  const getDayName = (day) => {
    return t(`clubs.ClubContact.days.${day}`);
  };

  const handleShare = () => {
    const text = t('clubs.ClubContact.actions.shareText', { clubName: club.name });
    const contactInfo = `📞 ${club.contacts.phone || ''} 📧 ${club.contacts.email || ''}`;

    if (navigator.share) {
      navigator.share({
        title: text,
        text: `${text}\n${contactInfo}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(`${text}\n${contactInfo}\n${window.location.href}`);
      alert(t('clubs.ClubContact.messages.contactInfoCopied'));
    }
  };

  // FAQ данни
  const getFaqData = () => [
    {
      question: t('clubs.ClubContact.faq.questions.howToBecomeMember'),
      answer: t('clubs.ClubContact.faq.answers.howToBecomeMember')
    },
    {
      question: t('clubs.ClubContact.faq.questions.membershipCost'),
      answer: club.membership?.membershipFee ?
        t('clubs.ClubContact.faq.answers.membershipCostWithPrices', {
          monthly: club.membership.membershipFee.monthly,
          currency: club.membership.membershipFee.currency,
          yearly: club.membership.membershipFee.yearly
        }) :
        t('clubs.ClubContact.faq.answers.membershipCostGeneral')
    },
    {
      question: t('clubs.ClubContact.faq.questions.membershipRequirements'),
      answer: club.membership?.requirements?.length > 0 ?
        club.membership.requirements.join(', ') :
        t('clubs.ClubContact.faq.answers.membershipRequirements')
    },
    {
      question: t('clubs.ClubContact.faq.questions.membershipBenefits'),
      answer: club.membership?.benefits?.length > 0 ?
        club.membership.benefits.join(', ') :
        t('clubs.ClubContact.faq.answers.membershipBenefits')
    },
    {
      question: t('clubs.ClubContact.faq.questions.visitBeforeMembership'),
      answer: t('clubs.ClubContact.faq.answers.visitBeforeMembership')
    }
  ];

  const faqData = getFaqData();

  return (
    <section id="general-contact" className="general-contact-main">
      <div className="general-contact-container">

        {/* Header */}
        <div className="general-contact-header">
          <div className="general-contact-badge">
            <FontAwesomeIcon icon={faHeadset} />
            <span>{t('clubs.ClubContact.header.badge')}</span>
          </div>
          <h2 className="general-contact-title">{t('clubs.ClubContact.header.title')}</h2>
          <p className="general-contact-subtitle">
            {t('clubs.ClubContact.header.subtitle')}
          </p>

          {/* Quick actions */}
          <div className="general-contact-actions">
            <button
              className="general-quick-action faq"
              onClick={() => setShowFAQ(true)}
            >
              <FontAwesomeIcon icon={faQuestionCircle} />
              {t('clubs.ClubContact.actions.faq')}
            </button>
            <button
              className="general-quick-action share"
              onClick={handleShare}
            >
              <FontAwesomeIcon icon={faShare} />
              {t('clubs.ClubContact.actions.share')}
            </button>
          </div>
        </div>

        <div className="general-contact-layout">

          {/* Contact Methods */}
          <div className="general-contact-methods">

            {/* Primary Contact */}
            <div className="general-contact-card primary">
              <div className="general-card-header">
                <FontAwesomeIcon icon={faHeadset} />
                <h3>{t('clubs.ClubContact.contactMethods.primary.title')}</h3>
              </div>

              <div className="general-contact-options">
                {club.contacts.phone && (
                  <a href={`tel:${club.contacts.phone}`} className="general-contact-option phone">
                    <div className="general-option-icon">
                      <FontAwesomeIcon icon={faPhone} />
                    </div>
                    <div className="general-option-content">
                      <span className="general-option-label">{t('clubs.ClubContact.contactMethods.phone.label')}</span>
                      <span className="general-option-value">{club.contacts.phone}</span>
                      <span className="general-option-desc">{t('clubs.ClubContact.contactMethods.phone.description')}</span>
                    </div>
                  </a>
                )}

                {club.contacts.mobile && club.contacts.mobile !== club.contacts.phone && (
                  <a href={`tel:${club.contacts.mobile}`} className="general-contact-option mobile">
                    <div className="general-option-icon">
                      <FontAwesomeIcon icon={faMobileAlt} />
                    </div>
                    <div className="general-option-content">
                      <span className="general-option-label">{t('clubs.ClubContact.contactMethods.mobile.label')}</span>
                      <span className="general-option-value">{club.contacts.mobile}</span>
                      <span className="general-option-desc">{t('clubs.ClubContact.contactMethods.mobile.description')}</span>
                    </div>
                  </a>
                )}

                {club.contacts.email && (
                  <a href={`mailto:${club.contacts.email}`} className="general-contact-option email">
                    <div className="general-option-icon">
                      <FontAwesomeIcon icon={faEnvelope} />
                    </div>
                    <div className="general-option-content">
                      <span className="general-option-label">{t('clubs.ClubContact.contactMethods.email.label')}</span>
                      <span className="general-option-value">{club.contacts.email}</span>
                      <span className="general-option-desc">{t('clubs.ClubContact.contactMethods.email.description')}</span>
                    </div>
                  </a>
                )}

                {club.contacts.website && (
                  <a href={club.contacts.website} target="_blank" rel="noopener noreferrer" className="general-contact-option website">
                    <div className="general-option-icon">
                      <FontAwesomeIcon icon={faGlobe} />
                    </div>
                    <div className="general-option-content">
                      <span className="general-option-label">{t('clubs.ClubContact.contactMethods.website.label')}</span>
                      <span className="general-option-value">{club.contacts.website}</span>
                      <span className="general-option-desc">{t('clubs.ClubContact.contactMethods.website.description')}</span>
                    </div>
                  </a>
                )}
              </div>
            </div>

            {/* Working Hours */}
            {club.contacts?.workingHours && Object.keys(club.contacts.workingHours).length > 0 && (
              <div className="general-contact-card hours">
                <div className="general-card-header">
                  <FontAwesomeIcon icon={faBusinessTime} />
                  <h3>{t('clubs.ClubContact.workingHours.title')}</h3>
                  <button
                    className="general-card-action"
                    onClick={() => setShowHoursModal(true)}
                    title={t('clubs.ClubContact.workingHours.detailed')}
                  >
                    <FontAwesomeIcon icon={faInfoCircle} />
                  </button>
                </div>

                <div className="general-today-status">
                  <div className="general-today-info">
                    <span className="general-today-label">{getTodayName()}</span>
                    <span className={`general-today-hours ${getTodayHours() === 'closed' ? 'closed' : 'open'}`}>
                      {getTodayHours() === 'closed' ? t('clubs.ClubContact.workingHours.closed') : getTodayHours()}
                    </span>
                  </div>

                  {getTodayHours() !== 'closed' && (
                    <div className="general-status-indicator open">
                      <div className="general-status-dot"></div>
                      <span>{t('clubs.ClubContact.workingHours.openNow')}</span>
                    </div>
                  )}

                  {getTodayHours() === 'closed' && (
                    <div className="general-status-indicator closed">
                      <div className="general-status-dot"></div>
                      <span>{t('clubs.ClubContact.workingHours.closed')}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Location */}
            {club.location && (
              <div className="general-contact-card location">
                <div className="general-card-header">
                  <FontAwesomeIcon icon={faLocationDot} />
                  <h3>{t('clubs.ClubContact.location.title')}</h3>
                </div>

                <div className="general-location-info">
                  <div className="general-address">
                    <FontAwesomeIcon icon={faMapMarkerAlt} />
                    <div>
                      <span className="general-address-line">{club.location.address}</span>
                      <span className="general-city-line">{club.location.city}{club.location.region && `, ${club.location.region}`}</span>
                    </div>
                  </div>

                  <div className="general-location-actions">
                    
                    <a  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${club.location.address}, ${club.location.city}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="general-location-btn maps"
                    >
                      <FontAwesomeIcon icon={faMapMarkerAlt} />
                      Google Maps
                    </a>

                    {club.location.coordinates && (
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${club.location.coordinates.lat},${club.location.coordinates.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="general-location-btn directions"
                      >
                        <FontAwesomeIcon icon={faRoute} />
                        {t('clubs.ClubContact.location.directions')}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

          
            {/* Social Media */}
            {club.contacts?.socialMedia && Object.keys(club.contacts.socialMedia).length > 0 && (
              <div className="general-contact-card social">
                <div className="general-card-header">
                  <FontAwesomeIcon icon={faUserFriends} />
                  <h3>{t('clubs.ClubContact.socialMedia.title')}</h3>
                </div>

                <div className="general-social-links">
                  {Object.entries(club.contacts.socialMedia)
                    .filter(([platform, handle]) => handle && typeof handle === 'string' && handle.trim() !== '') // Филтрирай null/undefined/празни
                    .map(([platform, handle]) => (
                      <a key={platform}
                        href={getSocialUrl(platform, handle)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`general-social-link ${platform.toLowerCase()}`}
                      >
                        <FontAwesomeIcon icon={getSocialIcon(platform)} />
                        <span>{platform}</span>
                      </a>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Contact Form - показва се само ако showContactForm е true */}
          {club.preferences?.showContactForm && (
            <div className="general-contact-form-section">
              <div className="general-form-wrapper">
                <div className="general-form-header">
                  <h3>
                    <FontAwesomeIcon icon={faPaperPlane} />
                    {t('clubs.ClubContact.form.title')}
                  </h3>
                  <p>{t('clubs.ClubContact.form.subtitle')}</p>
                </div>

                <form onSubmit={handleSubmit} className="general-contact-form">
                  <div className="general-form-grid">
                    <div className="general-form-field">
                      <label htmlFor="name">{t('clubs.ClubContact.form.fields.name')} *</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder={t('clubs.ClubContact.form.placeholders.name')}
                        required
                      />
                      <FontAwesomeIcon icon={faUser} className="general-field-icon" />
                    </div>

                    <div className="general-form-field">
                      <label htmlFor="email">{t('clubs.ClubContact.form.fields.email')} *</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder={t('clubs.ClubContact.form.placeholders.email')}
                        required
                      />
                      <FontAwesomeIcon icon={faEnvelope} className="general-field-icon" />
                    </div>

                    <div className="general-form-field">
                      <label htmlFor="phone">{t('clubs.ClubContact.form.fields.phone')}</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder={t('clubs.ClubContact.form.placeholders.phone')}
                      />
                      <FontAwesomeIcon icon={faPhone} className="general-field-icon" />
                    </div>

                    <div className="general-form-field">
                      <label htmlFor="preferredContact">{t('clubs.ClubContact.form.fields.preferredContact')}</label>
                      <select
                        id="preferredContact"
                        name="preferredContact"
                        value={formData.preferredContact}
                        onChange={handleInputChange}
                      >
                        <option value="email">{t('clubs.ClubContact.form.email')}</option>
                        <option value="phone">{t('clubs.ClubContact.form.phone')}</option>
                      </select>
                      <FontAwesomeIcon icon={faHandshake} className="general-field-icon" />
                    </div>
                  </div>

                  <div className="general-form-field">
                    <label htmlFor="subject">{t('clubs.ClubContact.form.fields.subject')}</label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                    >
                      <option value="membership">{t('clubs.ClubContact.form.subjects.membership')}</option>
                      <option value="activities">{t('clubs.ClubContact.form.subjects.activities')}</option>
                      <option value="events">{t('clubs.ClubContact.form.subjects.events')}</option>
                      <option value="volunteer">{t('clubs.ClubContact.form.subjects.volunteer')}</option>
                      <option value="partnership">{t('clubs.ClubContact.form.subjects.partnership')}</option>
                      <option value="donation">{t('clubs.ClubContact.form.subjects.donation')}</option>
                      <option value="general">{t('clubs.ClubContact.form.subjects.general')}</option>
                      <option value="complaint">{t('clubs.ClubContact.form.subjects.complaint')}</option>
                    </select>
                    <FontAwesomeIcon icon={faTag} className="general-field-icon" />
                  </div>

                  <div className="general-form-field">
                    <label htmlFor="message">{t('clubs.ClubContact.form.fields.message')} *</label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder={t('clubs.ClubContact.form.placeholders.message')}
                      rows="5"
                      required
                    ></textarea>
                    <FontAwesomeIcon icon={faComments} className="general-field-icon" />
                  </div>

                  {formStatus.message && (
                    <div className={`general-form-alert ${formStatus.type}`}>
                      <FontAwesomeIcon
                        icon={formStatus.type === 'success' ? faCheckCircle : faExclamationTriangle}
                      />
                      <span>{formStatus.message}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="general-submit-button"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} className="general-spinning" />
                        {t('clubs.ClubContact.form.submitting')}
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faPaperPlane} />
                        {t('clubs.ClubContact.form.submit')}
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FAQ Modal */}
      {showFAQ && (
        <div className="general-modal-overlay" onClick={() => setShowFAQ(false)}>
          <div className="general-modal" onClick={(e) => e.stopPropagation()}>
            <div className="general-modal-header">
              <h3>
                <FontAwesomeIcon icon={faQuestionCircle} />
                {t('clubs.ClubContact.faq.title')}
              </h3>
              <button className="general-modal-close" onClick={() => setShowFAQ(false)}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className="general-modal-content">
              <div className="general-faq-list">
                {faqData.map((faq, index) => (
                  <div key={index} className="general-faq-item">
                    <button
                      className="general-faq-question"
                      onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                    >
                      <span>{faq.question}</span>
                      <FontAwesomeIcon
                        icon={expandedFAQ === index ? faChevronUp : faChevronDown}
                      />
                    </button>

                    {expandedFAQ === index && (
                      <div className="general-faq-answer">
                        <p>{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="general-faq-footer">
                <p>{t('clubs.ClubContact.faq.footer.question')}</p>
                <button
                  className="general-contact-us-btn"
                  onClick={() => setShowFAQ(false)}
                >
                  <FontAwesomeIcon icon={faEnvelope} />
                  {t('clubs.ClubContact.faq.footer.contactUs')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Working Hours Modal */}
      {showHoursModal && club.contacts?.workingHours && (
        <div className="general-modal-overlay" onClick={() => setShowHoursModal(false)}>
          <div className="general-modal" onClick={(e) => e.stopPropagation()}>
            <div className="general-modal-header">
              <h3>
                <FontAwesomeIcon icon={faBusinessTime} />
                {t('clubs.ClubContact.workingHours.detailed')}
              </h3>
              <button className="general-modal-close" onClick={() => setShowHoursModal(false)}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className="general-modal-content">
              <div className="general-hours-detailed">
                {(() => {
                  const workingHours = club.contacts.workingHours;
                  let hoursEntries = [];

                  // Определяме дните на седмицата в правилен ред
                  const daysOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

                  // Ако има нова структура с days обекти
                  if (workingHours.days && typeof workingHours.days === 'object') {
                    hoursEntries = daysOrder.map(day => {
                      const dayData = workingHours.days[day];
                      let hours;

                      if (dayData && typeof dayData === 'object' && dayData.enabled && dayData.open && dayData.close) {
                        hours = `${dayData.open}-${dayData.close}`;
                      } else {
                        hours = 'closed';
                      }

                      return [day, hours];
                    }).filter(([day, hours]) => day && hours !== undefined);
                  } else {
                    // Legacy структура - директно string стойности
                    hoursEntries = daysOrder.map(day => {
                      const hours = workingHours[day];
                      return [day, hours || 'closed'];
                    }).filter(([day, hours]) => day && typeof hours === 'string');
                  }

                  return hoursEntries.map(([day, hours]) => {
                    const today = new Date().getDay();
                    const dayIndex = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][today];
                    const isToday = day === dayIndex;

                    return (
                      <div key={day} className={`general-hours-row ${isToday ? 'today' : ''}`}>
                        <div className="general-hours-day">
                          <FontAwesomeIcon icon={faCalendarAlt} />
                          <span>{getDayName(day)}</span>
                          {isToday && <span className="general-today-badge">{t('clubs.ClubContact.workingHours.today')}</span>}
                        </div>
                        <div className={`general-hours-time ${hours === 'closed' ? 'closed' : 'open'}`}>
                          {hours === 'closed' ?
                            t('clubs.ClubContact.workingHours.closed') :
                            (hours || t('clubs.ClubContact.workingHours.notSpecified'))
                          }
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>

              <div className="general-hours-note">
                <FontAwesomeIcon icon={faInfoCircle} />
                <p>{t('clubs.ClubContact.workingHours.note')}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ClubContact;