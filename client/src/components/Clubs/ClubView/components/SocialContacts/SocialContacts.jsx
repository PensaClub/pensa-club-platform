import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPhone,
  faEnvelope,
  faMapMarkerAlt,
  faComments,
  faUser,
  faUserTie,
  faHeadset,
  faQuestionCircle,
  faClock,
  faCalendarAlt,
  faExclamationTriangle,
  faInfoCircle,
  faCheckCircle,
  faTimes,
  faChevronDown,
  faChevronUp,
  faShare,
  faCopy,
  faExternalLinkAlt,
  faPaperPlane,
  faHandsHelping,
  faHeart,
  faShieldAlt,
  faUsers,
  faLightbulb,
  faFileAlt
} from '@fortawesome/free-solid-svg-icons';
import { 
  faFacebook,
  faTwitter,
  faInstagram,
  faLinkedin,
  faYoutube
} from '@fortawesome/free-brands-svg-icons';
import './socialContacts.css';

export const SocialContacts = ({ club }) => {
  const { t } = useTranslation();
  const [showContactForm, setShowContactForm] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    type: 'general'
  });
  const [contactStatus, setContactStatus] = useState(null);
  const [copiedText, setCopiedText] = useState('');

  if (!club?.contacts && 
      !club?.location?.address && 
      !club?.socialMedia &&
      !club?.management?.board) {
    return null;
  }

  const contacts = club.contacts || {};
  const location = club.location || {};
  const socialMedia = club.socialMedia || {};
  const management = club.management || {};
  const board = management.board || [];

  if (!contacts.phone && !contacts.email && !location.address && 
      Object.keys(socialMedia).length === 0) {
    return null;
  }

  const getContactTypes = () => [
    { key: 'general', label: t('clubs.SocialContacts.contactTypes.general'), icon: faQuestionCircle },
    { key: 'membership', label: t('clubs.SocialContacts.contactTypes.membership'), icon: faUsers },
    { key: 'services', label: t('clubs.SocialContacts.contactTypes.services'), icon: faHandsHelping },
    { key: 'events', label: t('clubs.SocialContacts.contactTypes.events'), icon: faCalendarAlt },
    { key: 'support', label: t('clubs.SocialContacts.contactTypes.support'), icon: faHeart },
    { key: 'other', label: t('clubs.SocialContacts.contactTypes.other'), icon: faComments }
  ];

  const contactTypes = getContactTypes();

  const getDefaultFaq = () => [
    {
      question: t('clubs.SocialContacts.defaultFaq.membership.question'),
      answer: t('clubs.SocialContacts.defaultFaq.membership.answer')
    },
    {
      question: t('clubs.SocialContacts.defaultFaq.services.question'),
      answer: t('clubs.SocialContacts.defaultFaq.services.answer')
    },
    {
      question: t('clubs.SocialContacts.defaultFaq.hours.question'),
      answer: t('clubs.SocialContacts.defaultFaq.hours.answer')
    }
  ];

  const faqData = club.faq || getDefaultFaq();

  const getSocialLinks = () => [
    { key: 'facebook', icon: faFacebook, color: '#1877f2', url: socialMedia.facebook, label: 'Facebook' },
    { key: 'instagram', icon: faInstagram, color: '#e4405f', url: socialMedia.instagram, label: 'Instagram' },
    { key: 'youtube', icon: faYoutube, color: '#ff0000', url: socialMedia.youtube, label: 'YouTube' },
    { key: 'linkedin', icon: faLinkedin, color: '#0077b5', url: socialMedia.linkedin, label: 'LinkedIn' },
    { key: 'twitter', icon: faTwitter, color: '#1da1f2', url: socialMedia.twitter, label: 'Twitter' }
  ].filter(link => link.url);

  const socialLinks = getSocialLinks();

  const getDefaultWorkingHours = () => [
    { day: t('clubs.SocialContacts.workingHours.monday'), hours: '9:00 - 17:00' },
    { day: t('clubs.SocialContacts.workingHours.tuesday'), hours: '9:00 - 17:00' },
    { day: t('clubs.SocialContacts.workingHours.wednesday'), hours: '9:00 - 17:00' },
    { day: t('clubs.SocialContacts.workingHours.thursday'), hours: '9:00 - 17:00' },
    { day: t('clubs.SocialContacts.workingHours.friday'), hours: '9:00 - 17:00' }
  ];

  const workingHours = contacts.workingHours || location.workingHours || getDefaultWorkingHours();

  const copyToClipboard = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(label);
      setTimeout(() => setCopiedText(''), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const handleContactChange = (field, value) => {
    setContactForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setContactStatus('sending');

    if (contacts.email) {
      const contactType = contactTypes.find(t => t.key === contactForm.type);
      const subject = encodeURIComponent(`${contactForm.subject} - ${contactType?.label}`);
      const body = encodeURIComponent(t('clubs.SocialContacts.emailTemplate', {
        name: contactForm.name,
        email: contactForm.email,
        phone: contactForm.phone,
        type: contactType?.label,
        subject: contactForm.subject,
        message: contactForm.message,
        clubName: club.name
      }));
      
      try {
        window.location.href = `mailto:${contacts.email}?subject=${subject}&body=${body}`;
        setContactStatus('sent');
        setTimeout(() => {
          setShowContactForm(false);
          setContactStatus(null);
          setContactForm({
            name: '',
            email: '',
            phone: '',
            subject: '',
            message: '',
            type: 'general'
          });
        }, 2000);
      } catch (error) {
        setContactStatus('error');
      }
    } else {
      setContactStatus('error');
    }
  };

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const getCopyLabel = (type) => {
    return t(`clubs.SocialContacts.copyLabels.${type}`);
  };

  const getCopySuccessMessage = (label) => {
    return t('clubs.SocialContacts.copySuccess', { item: label });
  };

  return (
    <section id="social-contacts" className="social-contacts-section">
      <div className="social-contacts-container">
        
        <div className="social-contacts-header">
          <div className="social-contacts-header-content">
            <div className="social-contacts-badge">
              <FontAwesomeIcon icon={faHeadset} />
              <span>{t('clubs.SocialContacts.header.badge')}</span>
            </div>
            <h2 className="social-contacts-title">
              {t('clubs.SocialContacts.header.title')}
            </h2>
            <p className="social-contacts-subtitle">
              {t('clubs.SocialContacts.header.subtitle')}
            </p>
          </div>
          
          <div className="social-contacts-quick">
            {contacts.phone && (
              <a href={`tel:${contacts.phone}`} className="social-contacts-quick-btn">
                <FontAwesomeIcon icon={faPhone} />
                <span>{t('clubs.SocialContacts.quickActions.call')}</span>
              </a>
            )}
            <button 
              onClick={() => setShowContactForm(true)}
              className="social-contacts-quick-btn primary"
            >
              <FontAwesomeIcon icon={faComments} />
              <span>{t('clubs.SocialContacts.quickActions.writeToUs')}</span>
            </button>
          </div>
        </div>

        <div className="social-contacts-methods">
          
          <div className="social-contacts-primary">
            <h3 className="social-contacts-section-title">
              <FontAwesomeIcon icon={faPhone} />
              {t('clubs.SocialContacts.sections.primaryContacts')}
            </h3>
            
            <div className="social-contacts-cards">
              {contacts.phone && (
                <div className="social-contacts-card">
                  <div className="social-contacts-card-icon">
                    <FontAwesomeIcon icon={faPhone} />
                  </div>
                  <div className="social-contacts-card-content">
                    <h4>{t('clubs.SocialContacts.contact.phone')}</h4>
                    <div className="social-contacts-card-value">
                      <a href={`tel:${contacts.phone}`}>{contacts.phone}</a>
                      <button 
                        onClick={() => copyToClipboard(contacts.phone, getCopyLabel('phone'))}
                        className="social-contacts-copy-btn"
                        title={t('clubs.SocialContacts.tooltips.copyPhone')}
                      >
                        <FontAwesomeIcon icon={copiedText === getCopyLabel('phone') ? faCheckCircle : faCopy} />
                      </button>
                    </div>
                    <p>{t('clubs.SocialContacts.contact.phoneDescription')}</p>
                  </div>
                </div>
              )}

              {contacts.email && (
                <div className="social-contacts-card">
                  <div className="social-contacts-card-icon">
                    <FontAwesomeIcon icon={faEnvelope} />
                  </div>
                  <div className="social-contacts-card-content">
                    <h4>{t('clubs.SocialContacts.contact.email')}</h4>
                    <div className="social-contacts-card-value">
                      <a href={`mailto:${contacts.email}`}>{contacts.email}</a>
                      <button 
                        onClick={() => copyToClipboard(contacts.email, getCopyLabel('email'))}
                        className="social-contacts-copy-btn"
                        title={t('clubs.SocialContacts.tooltips.copyEmail')}
                      >
                        <FontAwesomeIcon icon={copiedText === getCopyLabel('email') ? faCheckCircle : faCopy} />
                      </button>
                    </div>
                    <p>{t('clubs.SocialContacts.contact.emailDescription')}</p>
                  </div>
                </div>
              )}

              {(location.address || contacts.address) && (
                <div className="social-contacts-card">
                  <div className="social-contacts-card-icon">
                    <FontAwesomeIcon icon={faMapMarkerAlt} />
                  </div>
                  <div className="social-contacts-card-content">
                    <h4>{t('clubs.SocialContacts.contact.address')}</h4>
                    <div className="social-contacts-card-value">
                      <span>{location.address || contacts.address}</span>
                      <button 
                        onClick={() => copyToClipboard(location.address || contacts.address, getCopyLabel('address'))}
                        className="social-contacts-copy-btn"
                        title={t('clubs.SocialContacts.tooltips.copyAddress')}
                      >
                        <FontAwesomeIcon icon={copiedText === getCopyLabel('address') ? faCheckCircle : faCopy} />
                      </button>
                    </div>
                    <p>{t('clubs.SocialContacts.contact.addressDescription')}</p>
                  </div>
                </div>
              )}
            </div>

            {copiedText && (
              <div className="social-contacts-copy-success">
                <FontAwesomeIcon icon={faCheckCircle} />
                <span>{getCopySuccessMessage(copiedText)}</span>
              </div>
            )}
          </div>

          <div className="social-contacts-additional">
            
            {workingHours.length > 0 && (
              <div className="social-contacts-hours">
                <h4>
                  <FontAwesomeIcon icon={faClock} />
                  {t('clubs.SocialContacts.sections.workingHours')}
                </h4>
                <div className="social-contacts-hours-list">
                  {workingHours.map((schedule, index) => (
                    <div key={index} className="social-contacts-hours-item">
                      <span className="social-contacts-day">{schedule.day}</span>
                      <span className="social-contacts-time">{schedule.hours}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {board.length > 0 && (
              <div className="social-contacts-team">
                <h4>
                  <FontAwesomeIcon icon={faUserTie} />
                  {t('clubs.SocialContacts.sections.keyContacts')}
                </h4>
                <div className="social-contacts-team-list">
                  {board.slice(0, 3).map((member, index) => (
                    <div key={index} className="social-contacts-team-member">
                      <div className="social-contacts-member-info">
                        <h5>{member.name}</h5>
                        <span>{member.role}</span>
                      </div>
                      {member.phone && (
                        <a href={`tel:${member.phone}`} className="social-contacts-member-action">
                          <FontAwesomeIcon icon={faPhone} />
                        </a>
                      )}
                      {member.email && (
                        <a href={`mailto:${member.email}`} className="social-contacts-member-action">
                          <FontAwesomeIcon icon={faEnvelope} />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {socialLinks.length > 0 && (
              <div className="social-contacts-social">
                <h4>
                  <FontAwesomeIcon icon={faShare} />
                  {t('clubs.SocialContacts.sections.socialMedia')}
                </h4>
                <div className="social-contacts-social-links">
                  {socialLinks.map(link => (
                    <a 
                      key={link.key}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-contacts-social-link"
                      style={{ '--social-color': link.color }}
                      title={link.label}
                    >
                      <FontAwesomeIcon icon={link.icon} />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {faqData.length > 0 && (
          <div className="social-contacts-faq">
            <h3 className="social-contacts-section-title">
              <FontAwesomeIcon icon={faQuestionCircle} />
              {t('clubs.SocialContacts.sections.faq')}
            </h3>
            
            <div className="social-contacts-faq-list">
              {faqData.map((faq, index) => (
                <div key={index} className="social-contacts-faq-item">
                  <button 
                    onClick={() => toggleFaq(index)}
                    className="social-contacts-faq-question"
                  >
                    <span>{faq.question}</span>
                    <FontAwesomeIcon 
                      icon={expandedFaq === index ? faChevronUp : faChevronDown} 
                    />
                  </button>
                  {expandedFaq === index && (
                    <div className="social-contacts-faq-answer">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {showContactForm && (
          <div className="social-contacts-modal" onClick={() => setShowContactForm(false)}>
            <div className="social-contacts-modal-content" onClick={(e) => e.stopPropagation()}>
              <button 
                className="social-contacts-modal-close" 
                onClick={() => setShowContactForm(false)}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
              
              <div className="social-contacts-modal-header">
                <FontAwesomeIcon icon={faComments} />
                <h3>{t('clubs.SocialContacts.form.title')}</h3>
                <p>{t('clubs.SocialContacts.form.subtitle')}</p>
              </div>
              
              {contactStatus === 'sent' ? (
                <div className="social-contacts-form-success">
                  <FontAwesomeIcon icon={faCheckCircle} />
                  <h4>{t('clubs.SocialContacts.form.success.title')}</h4>
                  <p>{t('clubs.SocialContacts.form.success.message')}</p>
                </div>
              ) : contactStatus === 'error' ? (
                <div className="social-contacts-form-error">
                  <FontAwesomeIcon icon={faTimes} />
                  <h4>{t('clubs.SocialContacts.form.error.title')}</h4>
                  <p>{t('clubs.SocialContacts.form.error.message')}</p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="social-contacts-form">
                  <div className="social-contacts-form-row">
                    <div className="social-contacts-form-group">
                      <label htmlFor="contact-name">
                        <FontAwesomeIcon icon={faUser} />
                        {t('clubs.SocialContacts.form.name')} *
                      </label>
                      <input
                        type="text"
                        id="contact-name"
                        value={contactForm.name}
                        onChange={(e) => handleContactChange('name', e.target.value)}
                        required
                        placeholder={t('clubs.SocialContacts.form.namePlaceholder')}
                      />
                    </div>
                    
                    <div className="social-contacts-form-group">
                      <label htmlFor="contact-email">
                        <FontAwesomeIcon icon={faEnvelope} />
                        {t('clubs.SocialContacts.form.email')} *
                      </label>
                      <input
                        type="email"
                        id="contact-email"
                        value={contactForm.email}
                        onChange={(e) => handleContactChange('email', e.target.value)}
                        required
                        placeholder={t('clubs.SocialContacts.form.emailPlaceholder')}
                      />
                    </div>
                  </div>
                  
                  <div className="social-contacts-form-row">
                    <div className="social-contacts-form-group">
                      <label htmlFor="contact-phone">
                        <FontAwesomeIcon icon={faPhone} />
                        {t('clubs.SocialContacts.form.phone')}
                      </label>
                      <input
                        type="tel"
                        id="contact-phone"
                        value={contactForm.phone}
                        onChange={(e) => handleContactChange('phone', e.target.value)}
                        placeholder={t('clubs.SocialContacts.form.phonePlaceholder')}
                      />
                    </div>
                    
                    <div className="social-contacts-form-group">
                      <label htmlFor="contact-type">
                        <FontAwesomeIcon icon={faFileAlt} />
                        {t('clubs.SocialContacts.form.type')} *
                      </label>
                      <select
                        id="contact-type"
                        value={contactForm.type}
                        onChange={(e) => handleContactChange('type', e.target.value)}
                        required
                      >
                        {contactTypes.map(type => (
                          <option key={type.key} value={type.key}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="social-contacts-form-group">
                    <label htmlFor="contact-subject">
                      <FontAwesomeIcon icon={faLightbulb} />
                      {t('clubs.SocialContacts.form.subject')} *
                    </label>
                    <input
                      type="text"
                      id="contact-subject"
                      value={contactForm.subject}
                      onChange={(e) => handleContactChange('subject', e.target.value)}
                      required
                      placeholder={t('clubs.SocialContacts.form.subjectPlaceholder')}
                    />
                  </div>
                  
                  <div className="social-contacts-form-group">
                    <label htmlFor="contact-message">
                      <FontAwesomeIcon icon={faComments} />
                      {t('clubs.SocialContacts.form.message')} *
                    </label>
                    <textarea
                      id="contact-message"
                      value={contactForm.message}
                      onChange={(e) => handleContactChange('message', e.target.value)}
                      required
                      placeholder={t('clubs.SocialContacts.form.messagePlaceholder')}
                      rows="5"
                    />
                  </div>
                  
                  <div className="social-contacts-form-actions">
                    <button 
                      type="submit" 
                      className="social-contacts-submit-btn"
                      disabled={contactStatus === 'sending'}
                    >
                      <FontAwesomeIcon icon={faPaperPlane} />
                      {contactStatus === 'sending' ? 
                        t('clubs.SocialContacts.form.sending') : 
                        t('clubs.SocialContacts.form.submit')}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setShowContactForm(false)}
                      className="social-contacts-cancel-btn"
                    >
                      {t('clubs.SocialContacts.form.cancel')}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default SocialContacts;