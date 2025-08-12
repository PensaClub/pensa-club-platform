// components/SportsContacts/SportsContacts.jsx
import { useState } from 'react';
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

  // Проверяваме дали има необходимите данни
  if (!club?.name) {
    return null;
  }

  const contacts = club.contacts || {};
  const location = club.location || {};
  const workingHours = contacts.workingHours || {};
  const socialMedia = contacts.socialMedia || {};

  // Проверяваме дали има РЕАЛНО съдържание за показване
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

  // Contact reasons for sports club
  const contactReasons = [
    { value: 'general', label: 'Обща информация', icon: faInfoCircle },
    { value: 'membership', label: 'Членство и цени', icon: faUsers },
    { value: 'training', label: 'Тренировки и програми', icon: faDumbbell },
    { value: 'events', label: 'События и състезания', icon: faTrophy },
    { value: 'facilities', label: 'Съоръжения и оборудване', icon: faFlag },
    { value: 'emergency', label: 'Спешни въпроси', icon: faAmbulance }
  ];

  // Working hours days
  const workingDays = [
    { key: 'monday', label: 'Понеделник' },
    { key: 'tuesday', label: 'Вторник' },
    { key: 'wednesday', label: 'Сряда' },
    { key: 'thursday', label: 'Четвъртък' },
    { key: 'friday', label: 'Петък' },
    { key: 'saturday', label: 'Събота' },
    { key: 'sunday', label: 'Неделя' }
  ];

  // Social media platforms
  const socialPlatforms = [
    { key: 'facebook', label: 'Facebook', icon: faFacebook, color: '#1877f2' },
    { key: 'instagram', label: 'Instagram', icon: faInstagram, color: '#e4405f' },
    { key: 'youtube', label: 'YouTube', icon: faYoutube, color: '#ff0000' },
    { key: 'twitter', label: 'Twitter', icon: faTwitter, color: '#1da1f2' }
  ];

  // Copy to clipboard function
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
      console.error('Грешка при копиране:', error);
      alert('Грешка при копиране. Моля опитайте отново.');
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormStatus('sending');

    // Simulate form submission
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

  // Handle quick actions
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
      const address = encodeURIComponent(`${location.address}, ${location.city || 'България'}`);
      window.open(`https://www.google.com/maps/search/${address}`, '_blank');
    }
  };

  return (
    <section id="sports-contacts" className="sports-contacts-section">
      <div className="sports-contacts-container">
        
        {/* Header */}
        <div className="sports-contacts-header">
          <div className="sports-contacts-badge">
            <FontAwesomeIcon icon={faRocket} />
            <span>Връзка</span>
          </div>
          <h2 className="sports-contacts-title">
            <FontAwesomeIcon icon={faBolt} className="sports-contacts-title-icon" />
            Свържете се с нас
          </h2>
          <p className="sports-contacts-subtitle">
            Готови сме да отговорим на всички ваши въпроси за спорт, тренировки и членство
          </p>
        </div>

        {/* Quick Contact Cards */}
        <div className="sports-contacts-quick">
          {contacts.phone && (
            <div className="sports-contacts-quick-card phone">
              <div className="sports-contacts-quick-icon">
                <FontAwesomeIcon icon={faPhone} />
                <div className="sports-contacts-icon-pulse"></div>
              </div>
              <div className="sports-contacts-quick-info">
                <h3>Обадете се</h3>
                <p>{contacts.phone}</p>
                <span className="sports-contacts-quick-note">Директна линия</span>
              </div>
              <div className="sports-contacts-quick-actions">
                <button 
                  className="sports-contacts-action-btn primary"
                  onClick={() => handleCall(contacts.phone)}
                >
                  <FontAwesomeIcon icon={faPhoneAlt} />
                  Обади се
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
                <h3>Изпратете имейл</h3>
                <p>{contacts.email}</p>
                <span className="sports-contacts-quick-note">24/7 достъпност</span>
              </div>
              <div className="sports-contacts-quick-actions">
                <button 
                  className="sports-contacts-action-btn primary"
                  onClick={() => handleEmail(contacts.email)}
                >
                  <FontAwesomeIcon icon={faEnvelopeOpen} />
                  Изпрати
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
                <h3>Посетете ни</h3>
                <p>{location.address}</p>
                <span className="sports-contacts-quick-note">{location.city}</span>
              </div>
              <div className="sports-contacts-quick-actions">
                <button 
                  className="sports-contacts-action-btn primary"
                  onClick={handleDirections}
                >
                  <FontAwesomeIcon icon={faLocationArrow} />
                  Маршрут
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

        {/* Main Content Grid */}
        <div className="sports-contacts-main">
          
          {/* Contact Form */}
          <div className="sports-contacts-form-section">
            <div className="sports-contacts-form-header">
              <FontAwesomeIcon icon={faFire} />
              <h3>Изпратете съобщение</h3>
              <p>Попълнете формата и ще се свържем с вас възможно най-скоро</p>
            </div>

            <form className="sports-contacts-form" onSubmit={handleSubmit}>
              <div className="sports-contacts-form-row">
                <div className="sports-contacts-form-group">
                  <label htmlFor="name">
                    <FontAwesomeIcon icon={faUser} />
                    Вашето име *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Въведете вашето име"
                  />
                </div>
                
                <div className="sports-contacts-form-group">
                  <label htmlFor="email">
                    <FontAwesomeIcon icon={faEnvelope} />
                    Имейл адрес *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div className="sports-contacts-form-row">
                <div className="sports-contacts-form-group">
                  <label htmlFor="phone">
                    <FontAwesomeIcon icon={faPhone} />
                    Телефон
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+359 ..."
                  />
                </div>
                
                <div className="sports-contacts-form-group">
                  <label htmlFor="contactReason">
                    <FontAwesomeIcon icon={faFlag} />
                    Причина за контакт
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
                  Заглавие на съобщението
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="Кратко заглавие на вашия въпрос"
                />
              </div>

              <div className="sports-contacts-form-group">
                <label htmlFor="message">
                  <FontAwesomeIcon icon={faComment} />
                  Съобщение *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={5}
                  placeholder="Опишете вашия въпрос или заявка подробно..."
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
                    Изпращане...
                  </>
                )}
                {formStatus === 'success' && (
                  <>
                    <FontAwesomeIcon icon={faCheckCircle} />
                    Изпратено успешно!
                  </>
                )}
                {!formStatus && (
                  <>
                    <FontAwesomeIcon icon={faPaperPlane} />
                    Изпрати съобщението
                    <div className="sports-contacts-btn-energy"></div>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Contact Info Sidebar */}
          <div className="sports-contacts-info-section">
            
            {/* Working Hours */}
            {Object.keys(workingHours).length > 0 && (
              <div className="sports-contacts-info-card">
                <div className="sports-contacts-info-header">
                  <FontAwesomeIcon icon={faClock} />
                  <h4>Работно време</h4>
                </div>
                <div className="sports-contacts-hours-list">
                  {workingDays.map(day => {
                    const hours = workingHours[day.key];
                    if (!hours) return null;
                    
                    return (
                      <div key={day.key} className="sports-contacts-hours-item">
                        <span className="sports-contacts-day">{day.label}</span>
                        <span className="sports-contacts-time">
                          {hours === 'closed' ? 'Затворено' : hours}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Additional Contact Info */}
            <div className="sports-contacts-info-card">
              <div className="sports-contacts-info-header">
                <FontAwesomeIcon icon={faInfoCircle} />
                <h4>Допълнителна информация</h4>
              </div>
              <div className="sports-contacts-extra-info">
                {contacts.mobile && (
                  <div className="sports-contacts-extra-item">
                    <FontAwesomeIcon icon={faPhoneAlt} />
                    <div>
                      <strong>Мобилен:</strong>
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
                      <strong>Уебсайт:</strong>
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
                      <strong>Капацитет:</strong>
                      <span>{location.venue.capacity} души</span>
                    </div>
                  </div>
                )}

                {club.membership?.totalMembers && (
                  <div className="sports-contacts-extra-item">
                    <FontAwesomeIcon icon={faTrophy} />
                    <div>
                      <strong>Активни членове:</strong>
                      <span>{club.membership.totalMembers}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Social Media */}
            {Object.keys(socialMedia).some(key => socialMedia[key]) && (
              <div className="sports-contacts-info-card">
                <div className="sports-contacts-info-header">
                  <FontAwesomeIcon icon={faShareAlt} />
                  <h4>Последвайте ни</h4>
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

            {/* Emergency Info */}
            <div className="sports-contacts-info-card emergency">
              <div className="sports-contacts-info-header">
                <FontAwesomeIcon icon={faAmbulance} />
                <h4>Спешна информация</h4>
              </div>
              <div className="sports-contacts-emergency-info">
                <div className="sports-contacts-emergency-item">
                  <FontAwesomeIcon icon={faShieldAlt} />
                  <div>
                    <strong>Спешна помощ:</strong>
                    <span>150</span>
                  </div>
                  <button onClick={() => handleCall('150')}>
                    <FontAwesomeIcon icon={faPhone} />
                  </button>
                </div>
                
                {contacts.phone && (
                  <div className="sports-contacts-emergency-item">
                    <FontAwesomeIcon icon={faHeartbeat} />
                    <div>
                      <strong>Клуб спешно:</strong>
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

        {/* Bottom CTA */}
        <div className="sports-contacts-cta">
          <div className="sports-contacts-cta-content">
            <FontAwesomeIcon icon={faTrophy} className="sports-contacts-cta-icon" />
            <h3>Готови за нови предизвикателства?</h3>
            <p>
              Присъединете се към нашата спортна общност и започнете вашето фитнес пътешествие днес!
            </p>
            <div className="sports-contacts-cta-buttons">
              <button 
                className="sports-contacts-cta-btn primary"
                onClick={() => handleCall(contacts.phone || contacts.mobile)}
              >
                <FontAwesomeIcon icon={faRocket} />
                Започнете сега
                <div className="sports-contacts-btn-energy"></div>
              </button>
              <button 
                className="sports-contacts-cta-btn secondary"
                onClick={handleDirections}
              >
                <FontAwesomeIcon icon={faLocationArrow} />
                Посетете ни
              </button>
            </div>
          </div>
          
          <div className="sports-contacts-cta-stats">
            <div className="sports-contacts-cta-stat">
              <span className="sports-contacts-cta-stat-number">
                {club.stats?.yearsActive || '10'}+
              </span>
              <span className="sports-contacts-cta-stat-label">Години опит</span>
            </div>
            <div className="sports-contacts-cta-stat">
              <span className="sports-contacts-cta-stat-number">
                {club.membership?.totalMembers || '100'}+
              </span>
              <span className="sports-contacts-cta-stat-label">Доволни членове</span>
            </div>
            <div className="sports-contacts-cta-stat">
              <span className="sports-contacts-cta-stat-number">
                {club.stats?.programs || '15'}+
              </span>
              <span className="sports-contacts-cta-stat-label">Програми</span>
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