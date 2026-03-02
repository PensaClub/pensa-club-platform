import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPhone,
  faEnvelope,
  faMapMarkerAlt,
  faClock,
  faGlobe,
  faPaperPlane,
  faUser,
  faComment,
  faCheckCircle,
  faExclamationTriangle,
  faCopy,
  faHeartbeat,
  faDumbbell,
  faTrophy,
  faFire,
  faBolt,
  faRocket,
  faStopwatch,
  faThumbsUp,
  faUsers,
  faCalendarAlt,
  faInfoCircle,
  faShieldAlt,
  faAmbulance,
  faPhoneAlt,
  faEnvelopeOpen,
  faLocationArrow,
  faShareAlt,
  faFlag
} from '@fortawesome/free-solid-svg-icons';
import './sportsContacts.css';
import { faFacebook, faInstagram, faTwitter, faYoutube } from '@fortawesome/free-brands-svg-icons';

export const SportsContacts = ({ club }) => {
  const { t, i18n } = useTranslation('clubs');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    contactReason: 'general'
  });
  const [formStatus, setFormStatus] = useState(null);
  const [copiedItems, setCopiedItems] = useState({});

  if (!club?.name) {
    return null;
  }

  const contacts = club.contacts || {};
  const location = club.location || {};
  const workingHours = contacts.workingHours || {};
  const socialMedia = contacts.socialMedia || {};

  const hasContactContent = 
    contacts.phone ||
    contacts.mobile ||
    contacts.email ||
    contacts.website ||
    location.address ||
    Object.keys(socialMedia).some(key => socialMedia[key]);

  if (!hasContactContent) {
    return null;
  }

  const getContactReasons = () => [
    { value: 'general', label: t('clubs.SportsContacts.contactReasons.general'), icon: faInfoCircle },
    { value: 'membership', label: t('clubs.SportsContacts.contactReasons.membership'), icon: faUsers },
    { value: 'training', label: t('clubs.SportsContacts.contactReasons.training'), icon: faDumbbell },
    { value: 'events', label: t('clubs.SportsContacts.contactReasons.events'), icon: faTrophy },
    { value: 'facilities', label: t('clubs.SportsContacts.contactReasons.facilities'), icon: faFlag },
    { value: 'emergency', label: t('clubs.SportsContacts.contactReasons.emergency'), icon: faAmbulance }
  ];

  const getWorkingDays = () => [
    { key: 'monday', label: t('clubs.SportsContacts.workingDays.monday') },
    { key: 'tuesday', label: t('clubs.SportsContacts.workingDays.tuesday') },
    { key: 'wednesday', label: t('clubs.SportsContacts.workingDays.wednesday') },
    { key: 'thursday', label: t('clubs.SportsContacts.workingDays.thursday') },
    { key: 'friday', label: t('clubs.SportsContacts.workingDays.friday') },
    { key: 'saturday', label: t('clubs.SportsContacts.workingDays.saturday') },
    { key: 'sunday', label: t('clubs.SportsContacts.workingDays.sunday') }
  ];

  const getSocialPlatforms = () => [
    { key: 'facebook', label: 'Facebook', icon: faFacebook, color: '#1877f2' },
    { key: 'instagram', label: 'Instagram', icon: faInstagram, color: '#e4405f' },
    { key: 'youtube', label: 'YouTube', icon: faYoutube, color: '#ff0000' },
    { key: 'twitter', label: 'Twitter', icon: faTwitter, color: '#1da1f2' }
  ];

  const contactReasons = getContactReasons();
  const workingDays = getWorkingDays();
  const socialPlatforms = getSocialPlatforms();

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItems(prev => ({
        ...prev,
        [type]: true
      }));
      setTimeout(() => {
        setCopiedItems(prev => {
          const newState = { ...prev };
          delete newState[type];
          return newState;
        });
      }, 2000);
    } catch (error) {
      console.error('Copy error:', error);
      alert(t('clubs.SportsContacts.messages.copyError'));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormStatus('sending');

    setTimeout(() => {
      setFormStatus('success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        contactReason: 'general'
      });
      
      setTimeout(() => {
        setFormStatus(null);
      }, 5000);
    }, 2000);
  };

  const handleCall = (phone) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleEmail = (email) => {
    window.open(`mailto:${email}`, '_self');
  };

  const handleWebsite = (website) => {
    const url = website.startsWith('http') ? website : `https://${website}`;
    window.open(url, '_blank');
  };

  const handleSocialMedia = (platform, url) => {
    const fullUrl = url.startsWith('http') ? url : `https://${url}`;
    window.open(fullUrl, '_blank');
  };

  const handleDirections = () => {
    if (location.coordinates) {
      const coords = `${location.coordinates.lat},${location.coordinates.lng}`;
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${coords}`, '_blank');
    } else if (location.address) {
      const address = encodeURIComponent(`${location.address}, ${location.city || t('clubs.SportsContacts.defaultCountry')}`);
      window.open(`https://www.google.com/maps/search/${address}`, '_blank');
    }
  };

  return (
    <section id="sports-contacts" className="sports-contacts-section">
      <div className="sports-contacts-container">
        
        <div className="sports-contacts-header">
          <div className="sports-contacts-badge">
            <FontAwesomeIcon icon={faRocket} />
            <span>{t('clubs.SportsContacts.header.badge')}</span>
          </div>
          <h2 className="sports-contacts-title">
            <FontAwesomeIcon icon={faBolt} className="sports-contacts-title-icon" />
            {t('clubs.SportsContacts.header.title')}
          </h2>
          <p className="sports-contacts-subtitle">
            {t('clubs.SportsContacts.header.subtitle')}
          </p>
        </div>

        <div className="sports-contacts-quick">
          {contacts.phone && (
            <div className="sports-contacts-quick-card phone">
              <div className="sports-contacts-quick-icon">
                <FontAwesomeIcon icon={faPhone} />
                <div className="sports-contacts-icon-pulse"></div>
              </div>
              <div className="sports-contacts-quick-info">
                <h3>{t('clubs.SportsContacts.quickCards.phone.title')}</h3>
                <p>{contacts.phone}</p>
                <span className="sports-contacts-quick-note">{t('clubs.SportsContacts.quickCards.phone.note')}</span>
              </div>
              <div className="sports-contacts-quick-actions">
                <button 
                  className="sports-contacts-action-btn primary"
                  onClick={() => handleCall(contacts.phone)}
                >
                  <FontAwesomeIcon icon={faPhoneAlt} />
                  {t('clubs.SportsContacts.actions.call')}
                </button>
                <button 
                  className={`sports-contacts-copy-btn ${copiedItems['phone'] ? 'copied' : ''}`}
                  onClick={() => copyToClipboard(contacts.phone, 'phone')}
                >
                  <FontAwesomeIcon icon={copiedItems['phone'] ? faCheckCircle : faCopy} />
                </button>
              </div>
            </div>
          )}

          {contacts.email && (
            <div className="sports-contacts-quick-card email">
              <div className="sports-contacts-quick-icon">
                <FontAwesomeIcon icon={faEnvelope} />
                <div className="sports-contacts-icon-pulse"></div>
              </div>
              <div className="sports-contacts-quick-info">
                <h3>{t('clubs.SportsContacts.quickCards.email.title')}</h3>
                <p>{contacts.email}</p>
                <span className="sports-contacts-quick-note">{t('clubs.SportsContacts.quickCards.email.note')}</span>
              </div>
              <div className="sports-contacts-quick-actions">
                <button 
                  className="sports-contacts-action-btn primary"
                  onClick={() => handleEmail(contacts.email)}
                >
                  <FontAwesomeIcon icon={faEnvelopeOpen} />
                  {t('clubs.SportsContacts.actions.send')}
                </button>
                <button 
                  className={`sports-contacts-copy-btn ${copiedItems['email'] ? 'copied' : ''}`}
                  onClick={() => copyToClipboard(contacts.email, 'email')}
                >
                  <FontAwesomeIcon icon={copiedItems['email'] ? faCheckCircle : faCopy} />
                </button>
              </div>
            </div>
          )}

          {location.address && (
            <div className="sports-contacts-quick-card location">
              <div className="sports-contacts-quick-icon">
                <FontAwesomeIcon icon={faMapMarkerAlt} />
                <div className="sports-contacts-icon-pulse"></div>
              </div>
              <div className="sports-contacts-quick-info">
                <h3>{t('clubs.SportsContacts.quickCards.location.title')}</h3>
                <p>{location.address}</p>
                <span className="sports-contacts-quick-note">{location.city}</span>
              </div>
              <div className="sports-contacts-quick-actions">
                <button 
                  className="sports-contacts-action-btn primary"
                  onClick={handleDirections}
                >
                  <FontAwesomeIcon icon={faLocationArrow} />
                  {t('clubs.SportsContacts.actions.directions')}
                </button>
                <button 
                  className={`sports-contacts-copy-btn ${copiedItems['address'] ? 'copied' : ''}`}
                  onClick={() => copyToClipboard(`${location.address}, ${location.city || ''}`, 'address')}
                >
                  <FontAwesomeIcon icon={copiedItems['address'] ? faCheckCircle : faCopy} />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="sports-contacts-main">
          
          <div className="sports-contacts-form-section">
            <div className="sports-contacts-form-header">
              <FontAwesomeIcon icon={faFire} />
              <h3>{t('clubs.SportsContacts.form.title')}</h3>
              <p>{t('clubs.SportsContacts.form.subtitle')}</p>
            </div>

            <form className="sports-contacts-form" onSubmit={handleSubmit}>
              <div className="sports-contacts-form-row">
                <div className="sports-contacts-form-group">
                  <label htmlFor="name">
                    <FontAwesomeIcon icon={faUser} />
                    {t('clubs.SportsContacts.form.fields.name.label')} *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder={t('clubs.SportsContacts.form.fields.name.placeholder')}
                  />
                </div>
                
                <div className="sports-contacts-form-group">
                  <label htmlFor="email">
                    <FontAwesomeIcon icon={faEnvelope} />
                    {t('clubs.SportsContacts.form.fields.email.label')} *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder={t('clubs.SportsContacts.form.fields.email.placeholder')}
                  />
                </div>
              </div>

              <div className="sports-contacts-form-row">
                <div className="sports-contacts-form-group">
                  <label htmlFor="phone">
                    <FontAwesomeIcon icon={faPhone} />
                    {t('clubs.SportsContacts.form.fields.phone.label')}
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder={t('clubs.SportsContacts.form.fields.phone.placeholder')}
                  />
                </div>
                
                <div className="sports-contacts-form-group">
                  <label htmlFor="contactReason">
                    <FontAwesomeIcon icon={faFlag} />
                    {t('clubs.SportsContacts.form.fields.reason.label')}
                  </label>
                  <select
                    id="contactReason"
                    name="contactReason"
                    value={formData.contactReason}
                    onChange={handleInputChange}
                  >
                    {contactReasons.map(reason => (
                      <option key={reason.value} value={reason.value}>
                        {reason.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="sports-contacts-form-group">
                <label htmlFor="subject">
                  <FontAwesomeIcon icon={faComment} />
                  {t('clubs.SportsContacts.form.fields.subject.label')}
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder={t('clubs.SportsContacts.form.fields.subject.placeholder')}
                />
              </div>

              <div className="sports-contacts-form-group">
                <label htmlFor="message">
                  <FontAwesomeIcon icon={faComment} />
                  {t('clubs.SportsContacts.form.fields.message.label')} *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={5}
                  placeholder={t('clubs.SportsContacts.form.fields.message.placeholder')}
                />
              </div>

              <button 
                type="submit" 
                className={`sports-contacts-submit-btn ${formStatus ? formStatus : ''}`}
                disabled={formStatus === 'sending'}
              >
                {formStatus === 'sending' && (
                  <>
                    <FontAwesomeIcon icon={faStopwatch} className="spin" />
                    {t('clubs.SportsContacts.form.status.sending')}
                  </>
                )}
                {formStatus === 'success' && (
                  <>
                    <FontAwesomeIcon icon={faCheckCircle} />
                    {t('clubs.SportsContacts.form.status.success')}
                  </>
                )}
                {!formStatus && (
                  <>
                    <FontAwesomeIcon icon={faPaperPlane} />
                    {t('clubs.SportsContacts.form.submit')}
                    <div className="sports-contacts-btn-energy"></div>
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="sports-contacts-info-section">
            
            {Object.keys(workingHours).length > 0 && (
              <div className="sports-contacts-info-card">
                <div className="sports-contacts-info-header">
                  <FontAwesomeIcon icon={faClock} />
                  <h4>{t('clubs.SportsContacts.info.workingHours.title')}</h4>
                </div>
                <div className="sports-contacts-hours-list">
                  {workingDays.map(day => {
                    const hours = workingHours[day.key];
                    if (!hours) return null;
                    
                    return (
                      <div key={day.key} className="sports-contacts-hours-item">
                        <span className="sports-contacts-day">{day.label}</span>
                        <span className="sports-contacts-time">
                          {hours === 'closed' ? t('clubs.SportsContacts.info.workingHours.closed') : hours}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="sports-contacts-info-card">
              <div className="sports-contacts-info-header">
                <FontAwesomeIcon icon={faInfoCircle} />
                <h4>{t('clubs.SportsContacts.info.additional.title')}</h4>
              </div>
              <div className="sports-contacts-extra-info">
                {contacts.mobile && (
                  <div className="sports-contacts-extra-item">
                    <FontAwesomeIcon icon={faPhoneAlt} />
                    <div>
                      <strong>{t('clubs.SportsContacts.info.additional.mobile')}:</strong>
                      <span>{contacts.mobile}</span>
                    </div>
                    <button onClick={() => handleCall(contacts.mobile)}>
                      <FontAwesomeIcon icon={faPhone} />
                    </button>
                  </div>
                )}
                
                {contacts.website && (
                  <div className="sports-contacts-extra-item">
                    <FontAwesomeIcon icon={faGlobe} />
                    <div>
                      <strong>{t('clubs.SportsContacts.info.additional.website')}:</strong>
                      <span>{contacts.website}</span>
                    </div>
                    <button onClick={() => handleWebsite(contacts.website)}>
                      <FontAwesomeIcon icon={faGlobe} />
                    </button>
                  </div>
                )}

                {location.venue?.capacity && (
                  <div className="sports-contacts-extra-item">
                    <FontAwesomeIcon icon={faUsers} />
                    <div>
                      <strong>{t('clubs.SportsContacts.info.additional.capacity')}:</strong>
                      <span>{location.venue.capacity} {t('clubs.SportsContacts.info.additional.people')}</span>
                    </div>
                  </div>
                )}

                {club.membership?.totalMembers && (
                  <div className="sports-contacts-extra-item">
                    <FontAwesomeIcon icon={faTrophy} />
                    <div>
                      <strong>{t('clubs.SportsContacts.info.additional.activeMembers')}:</strong>
                      <span>{club.membership.totalMembers}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {Object.keys(socialMedia).some(key => socialMedia[key]) && (
              <div className="sports-contacts-info-card">
                <div className="sports-contacts-info-header">
                  <FontAwesomeIcon icon={faShareAlt} />
                  <h4>{t('clubs.SportsContacts.info.social.title')}</h4>
                </div>
                <div className="sports-contacts-social-grid">
                  {socialPlatforms.map(platform => {
                    const url = socialMedia[platform.key];
                    if (!url) return null;
                    
                    return (
                      <button
                        key={platform.key}
                        className="sports-contacts-social-btn"
                        style={{ '--social-color': platform.color }}
                        onClick={() => handleSocialMedia(platform.key, url)}
                      >
                        <FontAwesomeIcon icon={platform.icon} />
                        <span>{platform.label}</span>
                        <div className="sports-contacts-social-pulse"></div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="sports-contacts-info-card emergency">
              <div className="sports-contacts-info-header">
                <FontAwesomeIcon icon={faAmbulance} />
                <h4>{t('clubs.SportsContacts.info.emergency.title')}</h4>
              </div>
              <div className="sports-contacts-emergency-info">
                <div className="sports-contacts-emergency-item">
                  <FontAwesomeIcon icon={faShieldAlt} />
                  <div>
                    <strong>{t('clubs.SportsContacts.info.emergency.general')}:</strong>
                    <span>{t('clubs.SportsContacts.info.emergency.generalNumber')}</span>
                  </div>
                  <button onClick={() => handleCall(t('clubs.SportsContacts.info.emergency.generalNumber'))}>
                    <FontAwesomeIcon icon={faPhone} />
                  </button>
                </div>
                
                {contacts.phone && (
                  <div className="sports-contacts-emergency-item">
                    <FontAwesomeIcon icon={faHeartbeat} />
                    <div>
                      <strong>{t('clubs.SportsContacts.info.emergency.club')}:</strong>
                      <span>{contacts.phone}</span>
                    </div>
                    <button onClick={() => handleCall(contacts.phone)}>
                      <FontAwesomeIcon icon={faPhone} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="sports-contacts-cta">
          <div className="sports-contacts-cta-content">
            <FontAwesomeIcon icon={faTrophy} className="sports-contacts-cta-icon" />
            <h3>{t('clubs.SportsContacts.cta.title')}</h3>
            <p>{t('clubs.SportsContacts.cta.subtitle')}</p>
            <div className="sports-contacts-cta-buttons">
              <button 
                className="sports-contacts-cta-btn primary"
                onClick={() => handleCall(contacts.phone || contacts.mobile)}
              >
                <FontAwesomeIcon icon={faRocket} />
                {t('clubs.SportsContacts.cta.startNow')}
                <div className="sports-contacts-btn-energy"></div>
              </button>
              <button 
                className="sports-contacts-cta-btn secondary"
                onClick={handleDirections}
              >
                <FontAwesomeIcon icon={faLocationArrow} />
                {t('clubs.SportsContacts.cta.visitUs')}
              </button>
            </div>
          </div>
          
          <div className="sports-contacts-cta-stats">
            <div className="sports-contacts-cta-stat">
              <span className="sports-contacts-cta-stat-number">
                {club.stats?.yearsActive || '10'}+
              </span>
              <span className="sports-contacts-cta-stat-label">{t('clubs.SportsContacts.cta.stats.yearsExperience')}</span>
            </div>
            <div className="sports-contacts-cta-stat">
              <span className="sports-contacts-cta-stat-number">
                {club.membership?.totalMembers || '100'}+
              </span>
              <span className="sports-contacts-cta-stat-label">{t('clubs.SportsContacts.cta.stats.happyMembers')}</span>
            </div>
            <div className="sports-contacts-cta-stat">
              <span className="sports-contacts-cta-stat-number">
                {club.stats?.programs || '15'}+
              </span>
              <span className="sports-contacts-cta-stat-label">{t('clubs.SportsContacts.cta.stats.programs')}</span>
            </div>
          </div>
          
          <div className="sports-contacts-cta-bg-elements">
            <FontAwesomeIcon icon={faDumbbell} className="sports-contacts-bg-icon" />
            <FontAwesomeIcon icon={faHeartbeat} className="sports-contacts-bg-icon" />
            <FontAwesomeIcon icon={faBolt} className="sports-contacts-bg-icon" />
            <FontAwesomeIcon icon={faFire} className="sports-contacts-bg-icon" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default SportsContacts;