import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('clubs');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeInfoSection, setActiveInfoSection] = useState('address');
  const [copiedText, setCopiedText] = useState('');

  if (!club?.location?.address && 
      !club?.contacts?.address &&
      !club?.address) {
    return null;
  }

  const location = club.location || {};
  const contacts = club.contacts || {};
  const address = location.address || contacts.address || club.address;
  const coordinates = location.coordinates || {};
  const neighborhood = location.neighborhood || location.area;
  const city = location.city || t('clubs.SocialLocation.defaultCity');
  const postalCode = location.postalCode || location.zip;

  if (!address) {
    return null;
  }

  const workingHours = location.workingHours || club.workingHours;

  const copyToClipboard = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(label);
      setTimeout(() => setCopiedText(''), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
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

  const getCopyLabel = (type) => {
    return t(`clubs.SocialLocation.copyLabels.${type}`);
  };

  const getCopySuccessMessage = (label) => {
    return t('clubs.SocialLocation.copySuccess', { item: label });
  };

  return (
    <section id="social-location" className="social-location-section">
      <div className="social-location-container">
        
        <div className="social-location-header">
          <div className="social-location-header-content">
            <div className="social-location-badge">
              <FontAwesomeIcon icon={faMapMarkerAlt} />
              <span>{t('clubs.SocialLocation.header.badge')}</span>
            </div>
            <h2 className="social-location-title">
              {t('clubs.SocialLocation.header.title')}
            </h2>
            <p className="social-location-subtitle">
              {t('clubs.SocialLocation.header.subtitle')}
            </p>
          </div>
          
          <div className="social-location-quick-actions">
            <button 
              onClick={getDirections}
              className="social-location-quick-btn primary"
            >
              <FontAwesomeIcon icon={faDirections} />
              <span>{t('clubs.SocialLocation.actions.directions')}</span>
            </button>
            <button 
              onClick={openInMaps}
              className="social-location-quick-btn secondary"
            >
              <FontAwesomeIcon icon={faExternalLinkAlt} />
              <span>{t('clubs.SocialLocation.actions.googleMaps')}</span>
            </button>
          </div>
        </div>

        <div className="social-location-content">
          
          <div className={`social-location-map-section ${isFullscreen ? 'fullscreen' : ''}`}>
            <div className="social-location-map-controls">
              <div className="social-location-map-title">
                <FontAwesomeIcon icon={faMap} />
                <span>{t('clubs.SocialLocation.map.title')}</span>
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
                    <span>{t('clubs.SocialLocation.map.openInMaps')}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="social-location-info-section">
            
            <div className="social-location-info-tabs">
              <button 
                onClick={() => setActiveInfoSection('address')}
                className={`social-location-info-tab ${activeInfoSection === 'address' ? 'active' : ''}`}
              >
                <FontAwesomeIcon icon={faMapPin} />
                <span>{t('clubs.SocialLocation.tabs.address')}</span>
              </button>
              <button 
                onClick={() => setActiveInfoSection('contact')}
                className={`social-location-info-tab ${activeInfoSection === 'contact' ? 'active' : ''}`}
              >
                <FontAwesomeIcon icon={faPhone} />
                <span>{t('clubs.SocialLocation.tabs.contact')}</span>
              </button>
              {workingHours && (
                <button 
                  onClick={() => setActiveInfoSection('hours')}
                  className={`social-location-info-tab ${activeInfoSection === 'hours' ? 'active' : ''}`}
                >
                  <FontAwesomeIcon icon={faClock} />
                  <span>{t('clubs.SocialLocation.tabs.hours')}</span>
                </button>
              )}
            </div>

            {activeInfoSection === 'address' && (
              <div className="social-location-address-info">
                <div className="social-location-address-card">
                  <div className="social-location-address-header">
                    <FontAwesomeIcon icon={faMapMarkerAlt} />
                    <h3>{t('clubs.SocialLocation.address.title')}</h3>
                  </div>
                  
                  <div className="social-location-address-details">
                    <div className="social-location-address-line">
                      <strong>{address}</strong>
                      <button 
                        onClick={() => copyToClipboard(address, getCopyLabel('address'))}
                        className="social-location-copy-btn"
                        title={t('clubs.SocialLocation.tooltips.copyAddress')}
                      >
                        <FontAwesomeIcon icon={copiedText === getCopyLabel('address') ? faCheckCircle : faCopy} />
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
                      <span>{t('clubs.SocialLocation.actions.directions')}</span>
                    </button>
                    {coordinates.lat && coordinates.lng && (
                      <button 
                        onClick={() => copyToClipboard(`${coordinates.lat}, ${coordinates.lng}`, getCopyLabel('coordinates'))}
                        className="social-location-action-btn"
                      >
                        <FontAwesomeIcon icon={copiedText === getCopyLabel('coordinates') ? faCheckCircle : faLocationArrow} />
                        <span>{t('clubs.SocialLocation.actions.copyCoordinates')}</span>
                      </button>
                    )}
                  </div>
                  
                  {copiedText && (
                    <div className="social-location-copy-success">
                      <FontAwesomeIcon icon={faCheckCircle} />
                      <span>{getCopySuccessMessage(copiedText)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeInfoSection === 'contact' && (
              <div className="social-location-contact-info">
                <div className="social-location-contact-card">
                  <div className="social-location-contact-header">
                    <FontAwesomeIcon icon={faPhone} />
                    <h3>{t('clubs.SocialLocation.contact.title')}</h3>
                  </div>
                  
                  {contacts.phone && (
                    <div className="social-location-contact-item">
                      <div className="social-location-contact-main">
                        <FontAwesomeIcon icon={faPhone} />
                        <div className="social-location-contact-details">
                          <span className="social-location-contact-label">{t('clubs.SocialLocation.contact.phone')}</span>
                          <a href={`tel:${contacts.phone}`} className="social-location-contact-value">
                            {contacts.phone}
                          </a>
                        </div>
                      </div>
                      <button 
                        onClick={() => copyToClipboard(contacts.phone, getCopyLabel('phone'))}
                        className="social-location-copy-btn"
                        title={t('clubs.SocialLocation.tooltips.copyPhone')}
                      >
                        <FontAwesomeIcon icon={copiedText === getCopyLabel('phone') ? faCheckCircle : faCopy} />
                      </button>
                    </div>
                  )}
                  
                  {contacts.email && (
                    <div className="social-location-contact-item">
                      <div className="social-location-contact-main">
                        <FontAwesomeIcon icon={faEnvelope} />
                        <div className="social-location-contact-details">
                          <span className="social-location-contact-label">{t('clubs.SocialLocation.contact.email')}</span>
                          <a href={`mailto:${contacts.email}`} className="social-location-contact-value">
                            {contacts.email}
                          </a>
                        </div>
                      </div>
                      <button 
                        onClick={() => copyToClipboard(contacts.email, getCopyLabel('email'))}
                        className="social-location-copy-btn"
                        title={t('clubs.SocialLocation.tooltips.copyEmail')}
                      >
                        <FontAwesomeIcon icon={copiedText === getCopyLabel('email') ? faCheckCircle : faCopy} />
                      </button>
                    </div>
                  )}
                  
                  {copiedText && (
                    <div className="social-location-copy-success">
                      <FontAwesomeIcon icon={faCheckCircle} />
                      <span>{getCopySuccessMessage(copiedText)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeInfoSection === 'hours' && workingHours && (
              <div className="social-location-hours-info">
                <div className="social-location-hours-card">
                  <div className="social-location-hours-header">
                    <FontAwesomeIcon icon={faClock} />
                    <h3>{t('clubs.SocialLocation.hours.title')}</h3>
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
                    <p>{t('clubs.SocialLocation.hours.note')}</p>
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