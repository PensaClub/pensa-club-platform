import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPhone,
  faEnvelope,
  faMapMarkerAlt,
  faClock,
  faGlobe,
  faUser,
  faUsers,
  faMobile,
  faPaperPlane,
  faTimes,
  faCheck,
  faExclamationTriangle,
  faCopy,
  faCheckCircle
} from '@fortawesome/free-solid-svg-icons';
import './traditionalContacts.css';

export const TraditionalContacts = ({ club }) => {
  const { t, i18n } = useTranslation();
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [formStatus, setFormStatus] = useState(null);
  const [copiedItems, setCopiedItems] = useState({});

  if (!club?.name) {
    return null;
  }

  const contacts = club.contacts || {};
  const location = club.location || {};
  const management = club.management || {};
  const board = management.board || [];
  const workingHours = contacts.workingHours || {};
  const socialMedia = contacts.socialMedia || {};

  const hasContactContent = 
    contacts.phone ||
    contacts.mobile ||
    contacts.email ||
    contacts.website ||
    location.address ||
    board.length > 0 ||
    Object.keys(workingHours).length > 0 ||
    Object.keys(socialMedia).length > 0;

  if (!hasContactContent) {
    return null;
  }

  const copyToClipboard = async (text, type, id = 'main') => {
    try {
      await navigator.clipboard.writeText(text);
      
      const copyId = `${type}-${id}`;
      setCopiedItems(prev => ({
        ...prev,
        [copyId]: true
      }));
      
      setTimeout(() => {
        setCopiedItems(prev => {
          const newState = { ...prev };
          delete newState[copyId];
          return newState;
        });
      }, 2000);
      
    } catch (error) {
      console.error('Copy error:', error);
      alert(t('clubs.TraditionalContacts.messages.copyError'));
    }
  };

  const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    return phone.replace(/(\d{2})(\d{3})(\d{3})/, '$1 $2 $3');
  };

  const getDayName = (day) => {
    return t(`clubs.TraditionalContacts.days.${day}`, { defaultValue: day });
  };

  const getSocialIcon = (platform) => {
    return faGlobe;
  };

  const isCurrentlyOpen = () => {
    if (Object.keys(workingHours).length === 0) return null;
    
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const currentTime = now.getHours() * 100 + now.getMinutes();
    
    const todayHours = workingHours[currentDay];
    if (!todayHours || todayHours === 'closed') return false;
    
    const [openTime, closeTime] = todayHours.split('-');
    const openHour = parseInt(openTime.split(':')[0]) * 100 + parseInt(openTime.split(':')[1] || '0');
    const closeHour = parseInt(closeTime.split(':')[0]) * 100 + parseInt(closeTime.split(':')[1] || '0');
    
    return currentTime >= openHour && currentTime <= closeHour;
  };

  const openContactForm = () => {
    setIsContactFormOpen(true);
  };

  const closeContactForm = () => {
    setIsContactFormOpen(false);
    setContactForm({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    });
    setFormStatus(null);
  };

  const handleFormChange = (field, value) => {
    setContactForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setFormStatus('sending');

    const subject = encodeURIComponent(contactForm.subject || t('clubs.TraditionalContacts.form.defaultSubject', { name: contactForm.name }));
    const body = encodeURIComponent(t('clubs.TraditionalContacts.form.emailBody', {
      name: contactForm.name,
      email: contactForm.email,
      phone: contactForm.phone || t('clubs.TraditionalContacts.form.notSpecified'),
      message: contactForm.message,
      clubName: club.name
    }));
    
    const mailtoLink = `mailto:${contacts.email}?subject=${subject}&body=${body}`;
    
    try {
      window.location.href = mailtoLink;
      setFormStatus('sent');
      setTimeout(() => {
        closeContactForm();
      }, 2000);
    } catch (error) {
      setFormStatus('error');
    }
  };

  const handleCallPhone = (phone) => {
    window.open(`tel:${phone}`);
  };

  const handleSendEmail = (email) => {
    window.open(`mailto:${email}`);
  };

  const handleOpenWebsite = (website) => {
    const url = website.startsWith('http') ? website : `https://${website}`;
    window.open(url, '_blank');
  };

  const handleOpenMap = () => {
    if (location.address) {
      const query = encodeURIComponent(`${location.address}, ${location.city || ''}`);
      window.open(`https://www.google.com/maps/search/${query}`, '_blank');
    }
  };

  const currentlyOpen = isCurrentlyOpen();

  return (
    <section id="traditional-contacts" className="traditional-contacts-main-section">
      <div className="traditional-contacts-container">
        
        <div className="traditional-contacts-header">
          <div className="traditional-contacts-badge">
            <FontAwesomeIcon icon={faPhone} />
            <span>{t('clubs.TraditionalContacts.header.badge')}</span>
          </div>
          <h2 className="traditional-contacts-title">{t('clubs.TraditionalContacts.header.title')}</h2>
          <p className="traditional-contacts-subtitle">
            {t('clubs.TraditionalContacts.header.subtitle')}
          </p>
        </div>

        <div className="traditional-contacts-main-grid">
          
          <div className="traditional-contacts-section">
            <div className="traditional-contacts-section-header">
              <FontAwesomeIcon icon={faPhone} />
              <h3>{t('clubs.TraditionalContacts.main.title')}</h3>
              <p>{t('clubs.TraditionalContacts.main.subtitle')}</p>
            </div>
            
            <div className="traditional-contacts-info-grid">
              
              {contacts.phone && (
                <div className="traditional-contacts-info-card">
                  <div className="traditional-contacts-info-icon">
                    <FontAwesomeIcon icon={faPhone} />
                  </div>
                  <div className="traditional-contacts-info-content">
                    <h4>{t('clubs.TraditionalContacts.contactTypes.phone')}</h4>
                    <p>{formatPhoneNumber(contacts.phone)}</p>
                    <div className="traditional-contacts-action-buttons">
                      <button 
                        className="traditional-contacts-action-btn primary"
                        onClick={() => handleCallPhone(contacts.phone)}
                      >
                        <FontAwesomeIcon icon={faPhone} />
                        {t('clubs.TraditionalContacts.actions.call')}
                      </button>
                      <button 
                        className={`traditional-contacts-copy-btn ${copiedItems['phone-main'] ? 'copied' : ''}`}
                        onClick={() => copyToClipboard(contacts.phone, 'phone', 'main')}
                        title={t('clubs.TraditionalContacts.actions.copyPhone')}
                      >
                        <FontAwesomeIcon icon={copiedItems['phone-main'] ? faCheckCircle : faCopy} />
                        {copiedItems['phone-main'] ? t('clubs.TraditionalContacts.actions.copied') : t('clubs.TraditionalContacts.actions.copy')}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {contacts.mobile && (
                <div className="traditional-contacts-info-card">
                  <div className="traditional-contacts-info-icon">
                    <FontAwesomeIcon icon={faMobile} />
                  </div>
                  <div className="traditional-contacts-info-content">
                    <h4>{t('clubs.TraditionalContacts.contactTypes.mobile')}</h4>
                    <p>{formatPhoneNumber(contacts.mobile)}</p>
                    <div className="traditional-contacts-action-buttons">
                      <button 
                        className="traditional-contacts-action-btn primary"
                        onClick={() => handleCallPhone(contacts.mobile)}
                      >
                        <FontAwesomeIcon icon={faPhone} />
                        {t('clubs.TraditionalContacts.actions.call')}
                      </button>
                      <button 
                        className={`traditional-contacts-copy-btn ${copiedItems['mobile-main'] ? 'copied' : ''}`}
                        onClick={() => copyToClipboard(contacts.mobile, 'mobile', 'main')}
                        title={t('clubs.TraditionalContacts.actions.copyMobile')}
                      >
                        <FontAwesomeIcon icon={copiedItems['mobile-main'] ? faCheckCircle : faCopy} />
                        {copiedItems['mobile-main'] ? t('clubs.TraditionalContacts.actions.copied') : t('clubs.TraditionalContacts.actions.copy')}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {contacts.email && (
                <div className="traditional-contacts-info-card">
                  <div className="traditional-contacts-info-icon">
                    <FontAwesomeIcon icon={faEnvelope} />
                  </div>
                  <div className="traditional-contacts-info-content">
                    <h4>{t('clubs.TraditionalContacts.contactTypes.email')}</h4>
                    <p>{contacts.email}</p>
                    <div className="traditional-contacts-action-buttons">
                      <button 
                        className="traditional-contacts-action-btn primary"
                        onClick={() => handleSendEmail(contacts.email)}
                      >
                        <FontAwesomeIcon icon={faEnvelope} />
                        {t('clubs.TraditionalContacts.actions.sendEmail')}
                      </button>
                      <button 
                        className={`traditional-contacts-copy-btn ${copiedItems['email-main'] ? 'copied' : ''}`}
                        onClick={() => copyToClipboard(contacts.email, 'email', 'main')}
                        title={t('clubs.TraditionalContacts.actions.copyEmail')}
                      >
                        <FontAwesomeIcon icon={copiedItems['email-main'] ? faCheckCircle : faCopy} />
                        {copiedItems['email-main'] ? t('clubs.TraditionalContacts.actions.copied') : t('clubs.TraditionalContacts.actions.copy')}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {contacts.website && (
                <div className="traditional-contacts-info-card">
                  <div className="traditional-contacts-info-icon">
                    <FontAwesomeIcon icon={faGlobe} />
                  </div>
                  <div className="traditional-contacts-info-content">
                    <h4>{t('clubs.TraditionalContacts.contactTypes.website')}</h4>
                    <p>{contacts.website}</p>
                    <div className="traditional-contacts-action-buttons">
                      <button 
                        className="traditional-contacts-action-btn primary"
                        onClick={() => handleOpenWebsite(contacts.website)}
                      >
                        <FontAwesomeIcon icon={faGlobe} />
                        {t('clubs.TraditionalContacts.actions.visit')}
                      </button>
                      <button 
                        className={`traditional-contacts-copy-btn ${copiedItems['website-main'] ? 'copied' : ''}`}
                        onClick={() => copyToClipboard(contacts.website, 'website', 'main')}
                        title={t('clubs.TraditionalContacts.actions.copyWebsite')}
                      >
                        <FontAwesomeIcon icon={copiedItems['website-main'] ? faCheckCircle : faCopy} />
                        {copiedItems['website-main'] ? t('clubs.TraditionalContacts.actions.copied') : t('clubs.TraditionalContacts.actions.copy')}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {location.address && (
                <div className="traditional-contacts-info-card full-width">
                  <div className="traditional-contacts-info-icon">
                    <FontAwesomeIcon icon={faMapMarkerAlt} />
                  </div>
                  <div className="traditional-contacts-info-content">
                    <h4>{t('clubs.TraditionalContacts.contactTypes.address')}</h4>
                    <p>
                      {location.address}
                      {location.city && `, ${location.city}`}
                      {location.postalCode && ` ${location.postalCode}`}
                    </p>
                    <div className="traditional-contacts-action-buttons">
                      <button 
                        className="traditional-contacts-action-btn primary"
                        onClick={handleOpenMap}
                      >
                        <FontAwesomeIcon icon={faMapMarkerAlt} />
                        {t('clubs.TraditionalContacts.actions.showOnMap')}
                      </button>
                      <button 
                        className={`traditional-contacts-copy-btn ${copiedItems['address-main'] ? 'copied' : ''}`}
                        onClick={() => copyToClipboard(`${location.address}${location.city ? `, ${location.city}` : ''}${location.postalCode ? ` ${location.postalCode}` : ''}`, 'address', 'main')}
                        title={t('clubs.TraditionalContacts.actions.copyAddress')}
                      >
                        <FontAwesomeIcon icon={copiedItems['address-main'] ? faCheckCircle : faCopy} />
                        {copiedItems['address-main'] ? t('clubs.TraditionalContacts.actions.copied') : t('clubs.TraditionalContacts.actions.copy')}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {Object.keys(workingHours).length > 0 && (
            <div className="traditional-contacts-section">
              <div className="traditional-contacts-section-header">
                <FontAwesomeIcon icon={faClock} />
                <h3>{t('clubs.TraditionalContacts.workingHours.title')}</h3>
                <p>{t('clubs.TraditionalContacts.workingHours.subtitle')}</p>
                {currentlyOpen !== null && (
                  <div className={`traditional-contacts-status ${currentlyOpen ? 'open' : 'closed'}`}>
                    {currentlyOpen ? 
                      t('clubs.TraditionalContacts.workingHours.currentlyOpen') : 
                      t('clubs.TraditionalContacts.workingHours.currentlyClosed')
                    }
                  </div>
                )}
              </div>
              
              <div className="traditional-contacts-hours">
                {Object.entries(workingHours).map(([day, hours]) => (
                  <div key={day} className="traditional-contacts-hours-item">
                    <div className="traditional-contacts-day">
                      {getDayName(day)}
                    </div>
                    <div className="traditional-contacts-time">
                      {hours === 'closed' ? t('clubs.TraditionalContacts.workingHours.closed') : hours}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {board.length > 0 && (
            <div className="traditional-contacts-section">
              <div className="traditional-contacts-section-header">
                <FontAwesomeIcon icon={faUsers} />
                <h3>{t('clubs.TraditionalContacts.management.title')}</h3>
                <p>{t('clubs.TraditionalContacts.management.subtitle')}</p>
              </div>
              
              <div className="traditional-contacts-board">
                {board.map((member, index) => (
                  <div key={index} className="traditional-contacts-board-member">
                    {member.avatar && (
                      <div className="traditional-contacts-member-avatar">
                        <img src={member.avatar} alt={member.name} />
                      </div>
                    )}
                    <div className="traditional-contacts-member-info">
                      <h4>{member.name}</h4>
                      <div className="traditional-contacts-member-role">{member.role}</div>
                      {member.bio && (
                        <p>{member.bio}</p>
                      )}
                      <div className="traditional-contacts-member-contacts">
                        {member.phone && (
                          <div className="traditional-contacts-member-contact-row">
                            <button 
                              className="traditional-contacts-member-btn"
                              onClick={() => handleCallPhone(member.phone)}
                            >
                              <FontAwesomeIcon icon={faPhone} />
                              {formatPhoneNumber(member.phone)}
                            </button>
                            <button 
                              className={`traditional-contacts-member-copy-btn ${copiedItems[`phone-${index}`] ? 'copied' : ''}`}
                              onClick={() => copyToClipboard(member.phone, 'phone', index)}
                              title={t('clubs.TraditionalContacts.actions.copyPhone')}
                            >
                              <FontAwesomeIcon icon={copiedItems[`phone-${index}`] ? faCheckCircle : faCopy} />
                            </button>
                          </div>
                        )}
                        {member.email && (
                          <div className="traditional-contacts-member-contact-row">
                            <button 
                              className="traditional-contacts-member-btn"
                              onClick={() => handleSendEmail(member.email)}
                            >
                              <FontAwesomeIcon icon={faEnvelope} />
                              {member.email}
                            </button>
                            <button 
                              className={`traditional-contacts-member-copy-btn ${copiedItems[`email-${index}`] ? 'copied' : ''}`}
                              onClick={() => copyToClipboard(member.email, 'email', index)}
                              title={t('clubs.TraditionalContacts.actions.copyEmail')}
                            >
                              <FontAwesomeIcon icon={copiedItems[`email-${index}`] ? faCheckCircle : faCopy} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {Object.keys(socialMedia).length > 0 && (
            <div className="traditional-contacts-section">
              <div className="traditional-contacts-section-header">
                <FontAwesomeIcon icon={faGlobe} />
                <h3>{t('clubs.TraditionalContacts.socialMedia.title')}</h3>
                <p>{t('clubs.TraditionalContacts.socialMedia.subtitle')}</p>
              </div>
              
              <div className="traditional-contacts-social">
                {Object.entries(socialMedia).map(([platform, url]) => (
                  <a 
                    key={platform}
                    href={url.startsWith('http') ? url : `https://${url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="traditional-contacts-social-link"
                  >
                    <FontAwesomeIcon icon={getSocialIcon(platform)} />
                    <span>{platform.charAt(0).toUpperCase() + platform.slice(1)}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {contacts.email && (
            <div className="traditional-contacts-section">
              <div className="traditional-contacts-cta">
                <div className="traditional-contacts-cta-content">
                  <h3>{t('clubs.TraditionalContacts.cta.title')}</h3>
                  <p>{t('clubs.TraditionalContacts.cta.subtitle')}</p>
                  <button 
                    className="traditional-contacts-cta-btn"
                    onClick={openContactForm}
                  >
                    <FontAwesomeIcon icon={faPaperPlane} />
                    {t('clubs.TraditionalContacts.cta.contactUs')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {isContactFormOpen && (
        <div className="traditional-contacts-form-modal">
          <div className="traditional-contacts-form-modal-overlay" onClick={closeContactForm}></div>
          <div className="traditional-contacts-form-modal-container">
            <button className="traditional-contacts-form-modal-close" onClick={closeContactForm}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            
            <div className="traditional-contacts-form-header">
              <FontAwesomeIcon icon={faPaperPlane} />
              <h3>{t('clubs.TraditionalContacts.form.title', { clubName: club.name })}</h3>
              <p>{t('clubs.TraditionalContacts.form.subtitle')}</p>
            </div>
            
            {formStatus === 'sent' ? (
              <div className="traditional-contacts-form-success">
                <FontAwesomeIcon icon={faCheck} />
                <h4>{t('clubs.TraditionalContacts.form.success.title')}</h4>
                <p>{t('clubs.TraditionalContacts.form.success.message')}</p>
              </div>
            ) : formStatus === 'error' ? (
              <div className="traditional-contacts-form-error">
                <FontAwesomeIcon icon={faExclamationTriangle} />
                <h4>{t('clubs.TraditionalContacts.form.error.title')}</h4>
                <p>{t('clubs.TraditionalContacts.form.error.message')}</p>
                <button 
                  className="traditional-contacts-retry-btn"
                  onClick={() => setFormStatus(null)}
                >
                  {t('clubs.TraditionalContacts.form.error.retry')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="traditional-contacts-form">
                <div className="traditional-contacts-form-row">
                  <div className="traditional-contacts-form-group">
                    <label htmlFor="name">
                      <FontAwesomeIcon icon={faUser} />
                      {t('clubs.TraditionalContacts.form.fields.name')} *
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={contactForm.name}
                      onChange={(e) => handleFormChange('name', e.target.value)}
                      required
                      placeholder={t('clubs.TraditionalContacts.form.placeholders.name')}
                    />
                  </div>
                  
                  <div className="traditional-contacts-form-group">
                    <label htmlFor="email">
                      <FontAwesomeIcon icon={faEnvelope} />
                      {t('clubs.TraditionalContacts.form.fields.email')} *
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={contactForm.email}
                      onChange={(e) => handleFormChange('email', e.target.value)}
                      required
                      placeholder={t('clubs.TraditionalContacts.form.placeholders.email')}
                    />
                  </div>
                </div>
                
                <div className="traditional-contacts-form-row">
                  <div className="traditional-contacts-form-group">
                    <label htmlFor="phone">
                      <FontAwesomeIcon icon={faPhone} />
                      {t('clubs.TraditionalContacts.form.fields.phone')}
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={contactForm.phone}
                      onChange={(e) => handleFormChange('phone', e.target.value)}
                      placeholder={t('clubs.TraditionalContacts.form.placeholders.phone')}
                    />
                  </div>
                  
                  <div className="traditional-contacts-form-group">
                    <label htmlFor="subject">
                      <FontAwesomeIcon icon={faEnvelope} />
                      {t('clubs.TraditionalContacts.form.fields.subject')}
                    </label>
                    <input
                      type="text"
                      id="subject"
                      value={contactForm.subject}
                      onChange={(e) => handleFormChange('subject', e.target.value)}
                      placeholder={t('clubs.TraditionalContacts.form.placeholders.subject')}
                    />
                  </div>
                </div>
                
                <div className="traditional-contacts-form-group">
                  <label htmlFor="message">
                    <FontAwesomeIcon icon={faPaperPlane} />
                    {t('clubs.TraditionalContacts.form.fields.message')} *
                  </label>
                  <textarea
                    id="message"
                    value={contactForm.message}
                    onChange={(e) => handleFormChange('message', e.target.value)}
                    required
                    placeholder={t('clubs.TraditionalContacts.form.placeholders.message')}
                    rows="5"
                  />
                </div>
                
                <div className="traditional-contacts-form-actions">
                  <button 
                    type="submit" 
                    className="traditional-contacts-submit-btn"
                    disabled={formStatus === 'sending'}
                  >
                    <FontAwesomeIcon icon={faPaperPlane} />
                    {formStatus === 'sending' ? 
                      t('clubs.TraditionalContacts.form.sending') : 
                      t('clubs.TraditionalContacts.form.submit')
                    }
                  </button>
                  <button 
                    type="button" 
                    onClick={closeContactForm}
                    className="traditional-contacts-cancel-btn"
                  >
                    {t('clubs.TraditionalContacts.form.cancel')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default TraditionalContacts;