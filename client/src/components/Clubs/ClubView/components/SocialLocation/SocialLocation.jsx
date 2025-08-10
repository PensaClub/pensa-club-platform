import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMapMarkerAlt,
  faMap,
  faDirections,
  faMapPin,
  faCar,
  faWalking,
  faBus,
  faParking,
  faPhone,
  faEnvelope,
  faClock,
  faCalendarAlt,
  faInfoCircle,
  faExternalLinkAlt,
  faExpand,
  faCompress,
  faLocationArrow,
  faEye,
  faEyeSlash,
  faCopy,
  faCheckCircle,
  faHome,
  faBuilding
} from '@fortawesome/free-solid-svg-icons';
import './socialLocation.css';

export const SocialLocation = ({ club }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeInfoSection, setActiveInfoSection] = useState('address');
  const [copiedText, setCopiedText] = useState('');

  // Проверяваме дали има необходимите данни
  if (!club?.location?.address && 
      !club?.contacts?.address &&
      !club?.address) {
    return null;
  }

  // Събираме location данни
  const location = club.location || {};
  const contacts = club.contacts || {};
  const address = location.address || contacts.address || club.address;
  const coordinates = location.coordinates || {};
  const neighborhood = location.neighborhood || location.area;
  const city = location.city || 'София';
  const postalCode = location.postalCode || location.zip;

  // Ако няма адрес, не показваме компонента
  if (!address) {
    return null;
  }

  // Working hours (ако са налични)
  const workingHours = location.workingHours || club.workingHours;

  // Helper функции
  const copyToClipboard = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(label);
      setTimeout(() => setCopiedText(''), 2000);
    } catch (err) {
      console.error('Неуспешно копиране:', err);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const getDirections = () => {
    const query = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${query}`, '_blank');
  };

  const openInMaps = () => {
    const query = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  return (
    <section id="social-location" className="social-location-section">
      <div className="social-location-container">
        
        {/* Header */}
        <div className="social-location-header">
          <div className="social-location-header-content">
            <div className="social-location-badge">
              <FontAwesomeIcon icon={faMapMarkerAlt} />
              <span>Нашето местоположение</span>
            </div>
            <h2 className="social-location-title">
              Лесно ни намерете
            </h2>
            <p className="social-location-subtitle">
              Разгледайте нашето местоположение и как можете да стигнете до нас
            </p>
          </div>
          
          {/* Quick Actions */}
          <div className="social-location-quick-actions">
            <button 
              onClick={getDirections}
              className="social-location-quick-btn primary"
            >
              <FontAwesomeIcon icon={faDirections} />
              <span>Навигация</span>
            </button>
            <button 
              onClick={openInMaps}
              className="social-location-quick-btn secondary"
            >
              <FontAwesomeIcon icon={faExternalLinkAlt} />
              <span>Google Maps</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="social-location-content">
          
          {/* Map Section */}
          <div className={`social-location-map-section ${isFullscreen ? 'fullscreen' : ''}`}>
            <div className="social-location-map-controls">
              <div className="social-location-map-title">
                <FontAwesomeIcon icon={faMap} />
                <span>Местоположение</span>
              </div>
              
              <button 
                onClick={toggleFullscreen}
                className="social-location-fullscreen-btn"
              >
                <FontAwesomeIcon icon={isFullscreen ? faCompress : faExpand} />
              </button>
            </div>
            
            <div className="social-location-map-container">
              <div className="social-location-map-placeholder">
                <div className="social-location-map-pin">
                  <FontAwesomeIcon icon={faMapMarkerAlt} />
                </div>
                <div className="social-location-map-info">
                  <h3>{club.name}</h3>
                  <p>{address}</p>
                  <button onClick={openInMaps} className="social-location-map-link">
                    <FontAwesomeIcon icon={faExternalLinkAlt} />
                    <span>Отвори в Google Maps</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div className="social-location-info-section">
            
            {/* Info Tabs */}
            <div className="social-location-info-tabs">
              <button 
                onClick={() => setActiveInfoSection('address')}
                className={`social-location-info-tab ${activeInfoSection === 'address' ? 'active' : ''}`}
              >
                <FontAwesomeIcon icon={faMapPin} />
                <span>Адрес</span>
              </button>
              <button 
                onClick={() => setActiveInfoSection('contact')}
                className={`social-location-info-tab ${activeInfoSection === 'contact' ? 'active' : ''}`}
              >
                <FontAwesomeIcon icon={faPhone} />
                <span>Контакти</span>
              </button>
              {workingHours && (
                <button 
                  onClick={() => setActiveInfoSection('hours')}
                  className={`social-location-info-tab ${activeInfoSection === 'hours' ? 'active' : ''}`}
                >
                  <FontAwesomeIcon icon={faClock} />
                  <span>Работно време</span>
                </button>
              )}
            </div>

            {/* Address Info */}
            {activeInfoSection === 'address' && (
              <div className="social-location-address-info">
                <div className="social-location-address-card">
                  <div className="social-location-address-header">
                    <FontAwesomeIcon icon={faMapMarkerAlt} />
                    <h3>Нашият адрес</h3>
                  </div>
                  
                  <div className="social-location-address-details">
                    <div className="social-location-address-line">
                      <strong>{address}</strong>
                      <button 
                        onClick={() => copyToClipboard(address, 'адрес')}
                        className="social-location-copy-btn"
                        title="Копирай адреса"
                      >
                        <FontAwesomeIcon icon={copiedText === 'адрес' ? faCheckCircle : faCopy} />
                      </button>
                    </div>
                    {neighborhood && (
                      <div className="social-location-address-line">
                        {neighborhood}, {city}
                      </div>
                    )}
                    {postalCode && (
                      <div className="social-location-address-line">
                        {postalCode}
                      </div>
                    )}
                  </div>
                  
                  <div className="social-location-address-actions">
                    <button onClick={getDirections} className="social-location-action-btn">
                      <FontAwesomeIcon icon={faDirections} />
                      <span>Навигация</span>
                    </button>
                    {coordinates.lat && coordinates.lng && (
                      <button 
                        onClick={() => copyToClipboard(`${coordinates.lat}, ${coordinates.lng}`, 'координати')}
                        className="social-location-action-btn"
                      >
                        <FontAwesomeIcon icon={copiedText === 'координати' ? faCheckCircle : faLocationArrow} />
                        <span>Копирай координати</span>
                      </button>
                    )}
                  </div>
                  
                  {copiedText && (
                    <div className="social-location-copy-success">
                      <FontAwesomeIcon icon={faCheckCircle} />
                      <span>Копирахте {copiedText}!</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Contact Info */}
            {activeInfoSection === 'contact' && (
              <div className="social-location-contact-info">
                <div className="social-location-contact-card">
                  <div className="social-location-contact-header">
                    <FontAwesomeIcon icon={faPhone} />
                    <h3>Свържете се с нас</h3>
                  </div>
                  
                  {contacts.phone && (
                    <div className="social-location-contact-item">
                      <div className="social-location-contact-main">
                        <FontAwesomeIcon icon={faPhone} />
                        <div className="social-location-contact-details">
                          <span className="social-location-contact-label">Телефон</span>
                          <a href={`tel:${contacts.phone}`} className="social-location-contact-value">
                            {contacts.phone}
                          </a>
                        </div>
                      </div>
                      <button 
                        onClick={() => copyToClipboard(contacts.phone, 'телефон')}
                        className="social-location-copy-btn"
                        title="Копирай телефона"
                      >
                        <FontAwesomeIcon icon={copiedText === 'телефон' ? faCheckCircle : faCopy} />
                      </button>
                    </div>
                  )}
                  
                  {contacts.email && (
                    <div className="social-location-contact-item">
                      <div className="social-location-contact-main">
                        <FontAwesomeIcon icon={faEnvelope} />
                        <div className="social-location-contact-details">
                          <span className="social-location-contact-label">Имейл</span>
                          <a href={`mailto:${contacts.email}`} className="social-location-contact-value">
                            {contacts.email}
                          </a>
                        </div>
                      </div>
                      <button 
                        onClick={() => copyToClipboard(contacts.email, 'имейл')}
                        className="social-location-copy-btn"
                        title="Копирай имейла"
                      >
                        <FontAwesomeIcon icon={copiedText === 'имейл' ? faCheckCircle : faCopy} />
                      </button>
                    </div>
                  )}
                  
                  {copiedText && (
                    <div className="social-location-copy-success">
                      <FontAwesomeIcon icon={faCheckCircle} />
                      <span>Копирахте {copiedText}!</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Working Hours */}
            {activeInfoSection === 'hours' && workingHours && (
              <div className="social-location-hours-info">
                <div className="social-location-hours-card">
                  <div className="social-location-hours-header">
                    <FontAwesomeIcon icon={faClock} />
                    <h3>Работно време</h3>
                  </div>
                  
                  <div className="social-location-hours-list">
                    {workingHours.map((schedule, index) => (
                      <div key={index} className="social-location-hours-item">
                        <span className="social-location-day">{schedule.day}</span>
                        <span className="social-location-hours">{schedule.hours}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="social-location-hours-note">
                    <FontAwesomeIcon icon={faInfoCircle} />
                    <p>Моля, свържете се с нас преди посещение за актуална информация</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialLocation;