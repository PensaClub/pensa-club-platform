import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMapMarkerAlt,
  faDirections,
  faBus,
  faCar,
  faWalking,
  faPhoneAlt,
  faInfoCircle,
  faMapPin,
  faClock,
  faExpand,
  faCompress,
  faRoute,
  faLocationDot,
  faBuilding,
  faEnvelope,
  faTimes,
  faShare,
  faDownload,
  faPrint,
  faParking,
  faWifi,
  faRestroom,
  faCoffee,
  faElevator,
  faUserFriends,
  faCalendarAlt,
  faExternalLinkAlt,
  faUniversalAccess,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import 'leaflet/dist/leaflet.css';
import './clubLocation.css';

// Фиксираме иконите на Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Персонализирана икона за клуба
const createClubIcon = (isMain = false) => {
  return L.divIcon({
    className: `general-custom-marker ${isMain ? 'main-club' : 'other-club'}`,
    html: `
      <div class="general-marker-icon">
        <i class="fas fa-users"></i>
      </div>
    `,
    iconSize: [50, 50],
    iconAnchor: [25, 50],
    popupAnchor: [0, -50]
  });
};

// Компонент за изцентроване на картата
const MapController = ({ center, zoom }) => {
  const map = useMap();

  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom);
    }
  }, [map, center, zoom]);

  return null;
};

export const ClubLocation = ({ club }) => {
  const { t } = useTranslation('clubs');
  const [mapExpanded, setMapExpanded] = useState(false);
  const [selectedTransport, setSelectedTransport] = useState('walking');
  const [showVenueModal, setShowVenueModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  // Проверки за различни секции
  const hasCoordinates = club?.location?.coordinates?.lat && club?.location?.coordinates?.lng;
  const hasAddress = club?.location?.address || club?.location?.city;
  const hasWorkingHours = club?.contacts?.workingHours && 
    Object.entries(club.contacts.workingHours).some(([day, hours]) => typeof hours === 'string' && hours);
  const hasContacts = club?.contacts && (club.contacts.phone || club.contacts.email);
  const hasVenueInfo = club?.location?.venue && (
    club.location.venue.size || 
    club.location.venue.capacity || 
    club.location.venue.facilities?.length > 0 ||
    club.location.venue.accessibility !== undefined
  );

  // Ако няма нищо за показване, скриваме компонента
  if (!hasCoordinates && !hasAddress && !hasWorkingHours && !hasContacts && !hasVenueInfo) {
    return null;
  }

  const getTransportOptions = () => [
    {
      id: 'walking',
      icon: faWalking,
      label: t('clubs.ClubLocation.transport.walking.label'),
      time: t('clubs.ClubLocation.transport.walking.time'),
      info: t('clubs.ClubLocation.transport.walking.info'),
      color: '#10b981',
      description: t('clubs.ClubLocation.transport.walking.description')
    },
    {
      id: 'bus',
      icon: faBus,
      label: t('clubs.ClubLocation.transport.bus.label'),
      time: t('clubs.ClubLocation.transport.bus.time'),
      info: t('clubs.ClubLocation.transport.bus.info'),
      color: '#3b82f6',
      description: t('clubs.ClubLocation.transport.bus.description')
    },
    {
      id: 'car',
      icon: faCar,
      label: t('clubs.ClubLocation.transport.car.label'),
      time: t('clubs.ClubLocation.transport.car.time'),
      info: t('clubs.ClubLocation.transport.car.info'),
      color: '#f59e0b',
      description: t('clubs.ClubLocation.transport.car.description')
    }
  ];

  const transportOptions = getTransportOptions();

  // Координати на клуба - използваме Sofia като fallback
  const clubPosition = hasCoordinates 
    ? [club.location.coordinates.lat, club.location.coordinates.lng]
    : [42.6977, 23.3219]; // София център

  const getGoogleMapsUrl = () => {
    if (hasCoordinates) {
      return `https://www.google.com/maps/search/?api=1&query=${club.location.coordinates.lat},${club.location.coordinates.lng}`;
    } else if (hasAddress) {
      const address = `${club.location.address || ''}, ${club.location.city || ''}, Bulgaria`;
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    }
    return null;
  };

  const getDirectionsUrl = () => {
    if (hasCoordinates) {
      const coords = club.location.coordinates;
      return `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`;
    } else if (hasAddress) {
      const address = `${club.location.address || ''}, ${club.location.city || ''}, Bulgaria`;
      return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
    }
    return null;
  };

  const handleShare = () => {
    const text = t('clubs.ClubLocation.actions.shareText', {
      clubName: club.name,
      address: club.location?.address || '',
      city: club.location?.city || ''
    });
    if (navigator.share) {
      navigator.share({
        title: t('clubs.ClubLocation.actions.shareTitle', { clubName: club.name }),
        text: text,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(`${text} - ${window.location.href}`);
      alert(t('clubs.ClubLocation.messages.infoCopied'));
    }
  };

  const getFacilityIcon = (facility) => {
    const facilityIcons = {
      'паркинг': faParking,
      'parking': faParking,
      'parkplatz': faParking,
      'wifi': faWifi,
      'тоалетни': faRestroom,
      'restroom': faRestroom,
      'toilette': faRestroom,
      'кафе': faCoffee,
      'cafe': faCoffee,
      'café': faCoffee,
      'асансьор': faElevator,
      'elevator': faElevator,
      'aufzug': faElevator,
      'достъпност': faUniversalAccess,
      'accessibility': faUniversalAccess,
      'barrierefreiheit': faUniversalAccess
    };

    const key = Object.keys(facilityIcons).find(k =>
      facility.toLowerCase().includes(k)
    );

    return facilityIcons[key] || faInfoCircle;
  };

  const getVenueTypeLabel = (type) => {
    return t(`clubs.ClubLocation.venueTypes.${type}`, {
      defaultValue: t('clubs.ClubLocation.venueTypes.default')
    });
  };

  const getDayName = (day, short = false) => {
    const suffix = short ? 'Short' : '';
    return t(`clubs.ClubLocation.days.${day}${suffix}`);
  };

  const googleMapsUrl = getGoogleMapsUrl();
  const directionsUrl = getDirectionsUrl();

  return (
    <section id="general-location" className="general-location-main">
      <div className="general-location-container">

        {/* Header */}
        <div className="general-location-header">
          <div className="general-location-badge">
            <FontAwesomeIcon icon={faLocationDot} />
            <span>{t('clubs.ClubLocation.header.badge')}</span>
          </div>
          <h2 className="general-location-title">{t('clubs.ClubLocation.header.title')}</h2>
          <p className="general-location-subtitle">
            {t('clubs.ClubLocation.header.subtitle')}
          </p>

          {/* Quick Actions - показваме само ако имаме данни */}
          {(googleMapsUrl || directionsUrl) && (
            <div className="general-location-actions">
              
              {googleMapsUrl && (
                <a href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="general-quick-action maps"
                >
                  <FontAwesomeIcon icon={faMapPin} />
                  Google Maps
                </a>
              )}
              
              {directionsUrl && (
                <a href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="general-quick-action directions"
                >
                  <FontAwesomeIcon icon={faRoute} />
                  {t('clubs.ClubLocation.actions.directions')}
                </a>
              )}
              
              <button
                className="general-quick-action share"
                onClick={handleShare}
              >
                <FontAwesomeIcon icon={faShare} />
                {t('clubs.ClubLocation.actions.share')}
              </button>
            </div>
          )}
        </div>

        <div className="general-location-grid">

          {/* Map Section - показваме само ако имаме координати */}
          {hasCoordinates && (
            <div className={`general-map-section ${mapExpanded ? 'expanded' : ''}`}>
              <div className="general-map-header">
                <h3>
                  <FontAwesomeIcon icon={faMapPin} />
                  {t('clubs.ClubLocation.map.title')}
                </h3>
                <div className="general-map-actions">
                  <button
                    className="general-map-action"
                    onClick={() => setMapExpanded(!mapExpanded)}
                    title={mapExpanded ? t('clubs.ClubLocation.map.compress') : t('clubs.ClubLocation.map.expand')}
                  >
                    <FontAwesomeIcon icon={mapExpanded ? faCompress : faExpand} />
                  </button>
                  
                  {googleMapsUrl && (
                    <a href={googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="general-map-action"
                      title={t('clubs.ClubLocation.map.openInGoogleMaps')}
                    >
                      <FontAwesomeIcon icon={faExternalLinkAlt} />
                    </a>
                  )}
                </div>
              </div>

              <div className="general-map-container">
                <MapContainer
                  center={clubPosition}
                  zoom={15}
                  scrollWheelZoom={true}
                  className="general-leaflet-map"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  <MapController center={clubPosition} zoom={15} />

                  <MarkerClusterGroup chunkedLoading maxClusterRadius={50}>
                    <Marker position={clubPosition} icon={createClubIcon(true)}>
                      <Popup className="general-custom-popup">
                        <div className="general-popup-content">
                          <h4>{club.name}</h4>
                          <p>{club.location?.address || club.location?.city}</p>
                          <div className="general-popup-actions">

                            {directionsUrl && (
                              
                                <a href={directionsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="general-popup-btn"
                              >
                                <FontAwesomeIcon icon={faRoute} />
                                {t('clubs.ClubLocation.actions.directions')}
                              </a>
                            )}
                            
                            {googleMapsUrl && (
                              <a href={googleMapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="general-popup-btn"
                              >
                                <FontAwesomeIcon icon={faMapPin} />
                                Google Maps
                              </a>
                            )}
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  </MarkerClusterGroup>
                </MapContainer>
              </div>
            </div>
          )}

          {/* No Map Placeholder - показваме ако няма координати но има адрес */}
          {!hasCoordinates && hasAddress && (
            <div className="general-map-section no-map">
              <div className="general-no-map-placeholder">
                <FontAwesomeIcon icon={faExclamationTriangle} />
                <h3>{t('clubs.ClubLocation.noMap.title')}</h3>
                <p>{t('clubs.ClubLocation.noMap.description')}</p>
                {googleMapsUrl && (
                  <a href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="general-quick-action maps"
                  >
                    <FontAwesomeIcon icon={faMapPin} />
                    Google Maps
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Info Column */}
          <div className="general-location-info">

            {/* Address Card - показваме само ако има адрес */}
            {hasAddress && (
              <div className="general-info-card address">
                <div className="general-card-header">
                  <FontAwesomeIcon icon={faMapMarkerAlt} />
                  <h3>{t('clubs.ClubLocation.address.title')}</h3>
                </div>
                <div className="general-address-info">
                  {club.location.address && (
                    <p className="general-main-address">{club.location.address}</p>
                  )}
                  {club.location.city && (
                    <p className="general-city-info">
                      {club.location.city}
                      {club.location.region && `, ${club.location.region}`}
                    </p>
                  )}
                  {club.location.postalCode && (
                    <p className="general-postal-info">📮 {club.location.postalCode}</p>
                  )}
                </div>

                {club.location.venue && (
                  <div className="general-address-details">
                    {club.location.venue.type && (
                      <div className="general-address-item">
                        <FontAwesomeIcon icon={faBuilding} />
                        <span>{t('clubs.ClubLocation.address.type')}: {getVenueTypeLabel(club.location.venue.type)}</span>
                      </div>
                    )}
                    {club.location.venue.floor && (
                      <div className="general-address-item">
                        <FontAwesomeIcon icon={faElevator} />
                        <span>{t('clubs.ClubLocation.address.floor')}: {club.location.venue.floor}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Transport Card - показваме само ако имаме координати */}
            {hasCoordinates && (
              <div className="general-info-card transport">
                <div className="general-card-header">
                  <FontAwesomeIcon icon={faDirections} />
                  <h3>{t('clubs.ClubLocation.transport.title')}</h3>
                </div>

                <div className="general-transport-options">
                  {transportOptions.map(option => (
                    <div
                      key={option.id}
                      className={`general-transport-option ${selectedTransport === option.id ? 'active' : ''}`}
                      onClick={() => setSelectedTransport(option.id)}
                      style={{ '--transport-color': option.color }}
                    >
                      <div className="general-transport-icon">
                        <FontAwesomeIcon icon={option.icon} />
                      </div>
                      <div className="general-transport-info">
                        <h4>{option.label}</h4>
                        <div className="general-transport-meta">
                          <span className="general-transport-time">🕐 {option.time}</span>
                          <span className="general-transport-desc">{option.info}</span>
                        </div>
                      </div>
                      <div className="general-transport-select">
                        <div className="general-radio-indicator" />
                      </div>
                    </div>
                  ))}
                </div>

                {selectedTransport && (
                  <div className="general-transport-details">
                    <h4>{t('clubs.ClubLocation.transport.details')}</h4>
                    <p>{transportOptions.find(t => t.id === selectedTransport)?.description}</p>
                  </div>
                )}
              </div>
            )}

            {/* Venue Info Card - показваме само ако има venue данни */}
            {hasVenueInfo && (
              <div className="general-info-card venue">
                <div className="general-card-header">
                  <FontAwesomeIcon icon={faBuilding} />
                  <h3>{t('clubs.ClubLocation.venue.title')}</h3>
                  <button
                    className="general-card-action"
                    onClick={() => setShowVenueModal(true)}
                  >
                    <FontAwesomeIcon icon={faInfoCircle} />
                  </button>
                </div>

                <div className="general-venue-summary">
                  {club.location.venue.size && (
                    <div className="general-venue-stat">
                      <span className="general-stat-label">{t('clubs.ClubLocation.venue.area')}</span>
                      <span className="general-stat-value">{club.location.venue.size}</span>
                    </div>
                  )}
                  {club.location.venue.capacity > 0 && (
                    <div className="general-venue-stat">
                      <span className="general-stat-label">{t('clubs.ClubLocation.venue.capacity')}</span>
                      <span className="general-stat-value">{club.location.venue.capacity} {t('clubs.ClubLocation.venue.seats')}</span>
                    </div>
                  )}
                  {club.location.venue.accessibility !== undefined && (
                    <div className="general-venue-stat accessibility">
                      <span className="general-stat-label">{t('clubs.ClubLocation.venue.accessibility')}</span>
                      <span className={`general-stat-value ${club.location.venue.accessibility ? 'yes' : 'no'}`}>
                        <FontAwesomeIcon icon={faUniversalAccess} />
                        {club.location.venue.accessibility
                          ? t('clubs.ClubLocation.venue.accessible')
                          : t('clubs.ClubLocation.venue.notAccessible')
                        }
                      </span>
                    </div>
                  )}
                </div>

                {club.location.venue.facilities && club.location.venue.facilities.length > 0 && (
                  <div className="general-facilities-preview">
                    <h4>{t('clubs.ClubLocation.venue.facilities')}</h4>
                    <div className="general-facilities-grid">
                      {club.location.venue.facilities.slice(0, 4).map((facility, index) => (
                        <div key={index} className="general-facility-item">
                          <FontAwesomeIcon icon={getFacilityIcon(facility)} />
                          <span>{facility}</span>
                        </div>
                      ))}
                      {club.location.venue.facilities.length > 4 && (
                        <div className="general-facility-more">
                          +{club.location.venue.facilities.length - 4} {t('clubs.ClubLocation.venue.more')}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Contact & Hours */}
            <div className="general-contact-hours-grid">

              {/* Working Hours - показваме само ако има работни часове */}
              {hasWorkingHours && (
                <div className="general-info-card hours">
                  <div className="general-card-header">
                    <FontAwesomeIcon icon={faClock} />
                    <h3>{t('clubs.ClubLocation.hours.title')}</h3>
                  </div>
                  <div className="general-hours-list">
                    {Object.entries(club.contacts.workingHours)
                      .filter(([day, hours]) => typeof hours === 'string' && hours)
                      .map(([day, hours]) => (
                        <div key={day} className="general-hours-row">
                          <span className="general-day">{getDayName(day, true)}</span>
                          <span className={`general-hours ${hours === 'closed' ? 'closed' : ''}`}>
                            {hours === 'closed' ? t('clubs.ClubLocation.hours.closed') : hours}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Quick Contacts - показва се само ако showContactForm е true И има контакти */}
              {club.preferences?.showContactForm && hasContacts && (
                <div className="general-info-card contacts">
                  <div className="general-card-header">
                    <FontAwesomeIcon icon={faPhoneAlt} />
                    <h3>{t('clubs.ClubLocation.contacts.title')}</h3>
                    <button
                      className="general-card-action"
                      onClick={() => setShowContactModal(true)}
                    >
                      <FontAwesomeIcon icon={faInfoCircle} />
                    </button>
                  </div>
                  <div className="general-contacts-list">
                    {club.contacts.phone && (
                      <a href={`tel:${club.contacts.phone}`} className="general-contact-item">
                        <FontAwesomeIcon icon={faPhoneAlt} />
                        <span>{club.contacts.phone}</span>
                      </a>
                    )}
                    {club.contacts.email && (
                      <a href={`mailto:${club.contacts.email}`} className="general-contact-item">
                        <FontAwesomeIcon icon={faEnvelope} />
                        <span>{club.contacts.email}</span>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Venue Details Modal - показваме само ако има venue данни */}
      {showVenueModal && hasVenueInfo && (
        <div className="general-modal-overlay" onClick={() => setShowVenueModal(false)}>
          <div className="general-modal" onClick={(e) => e.stopPropagation()}>
            <div className="general-modal-header">
              <h3>
                <FontAwesomeIcon icon={faBuilding} />
                {t('clubs.ClubLocation.modals.venue.title')}
              </h3>
              <button className="general-modal-close" onClick={() => setShowVenueModal(false)}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className="general-modal-content">
              <div className="general-venue-details">
                <div className="general-venue-grid">
                  {club.location.venue.type && (
                    <div className="general-venue-detail">
                      <FontAwesomeIcon icon={faBuilding} />
                      <div>
                        <span className="general-detail-label">{t('clubs.ClubLocation.modals.venue.buildingType')}</span>
                        <span className="general-detail-value">{getVenueTypeLabel(club.location.venue.type)}</span>
                      </div>
                    </div>
                  )}

                  {club.location.venue.capacity > 0 && (
                    <div className="general-venue-detail">
                      <FontAwesomeIcon icon={faUserFriends} />
                      <div>
                        <span className="general-detail-label">{t('clubs.ClubLocation.venue.capacity')}</span>
                        <span className="general-detail-value">{club.location.venue.capacity} {t('clubs.ClubLocation.venue.seats')}</span>
                      </div>
                    </div>
                  )}

                  {club.location.venue.size && (
                    <div className="general-venue-detail">
                      <FontAwesomeIcon icon={faBuilding} />
                      <div>
                        <span className="general-detail-label">{t('clubs.ClubLocation.venue.area')}</span>
                        <span className="general-detail-value">{club.location.venue.size}</span>
                      </div>
                    </div>
                  )}

                  {club.location.venue.accessibility !== undefined && (
                    <div className="general-venue-detail accessibility">
                      <FontAwesomeIcon icon={faUniversalAccess} />
                      <div>
                        <span className="general-detail-label">{t('clubs.ClubLocation.venue.accessibility')}</span>
                        <span className={`general-detail-value ${club.location.venue.accessibility ? 'accessible' : 'not-accessible'}`}>
                          {club.location.venue.accessibility
                            ? t('clubs.ClubLocation.modals.venue.accessibleForDisabled')
                            : t('clubs.ClubLocation.venue.notAccessible')
                          }
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {club.location.venue.facilities && club.location.venue.facilities.length > 0 && (
                  <div className="general-facilities-section">
                    <h4>{t('clubs.ClubLocation.modals.venue.facilitiesAndServices')}</h4>
                    <div className="general-facilities-list">
                      {club.location.venue.facilities.map((facility, index) => (
                        <div key={index} className="general-facility-tag">
                          <FontAwesomeIcon icon={getFacilityIcon(facility)} />
                          <span>{facility}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {club.location.venue.description && (
                  <div className="general-venue-description">
                    <h4>{t('clubs.ClubLocation.modals.venue.description')}</h4>
                    <p>{club.location.venue.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact Details Modal - показва се само ако showContactForm е true */}
      {club.preferences?.showContactForm && showContactModal && hasContacts && (
        <div className="general-modal-overlay" onClick={() => setShowContactModal(false)}>
          <div className="general-modal" onClick={(e) => e.stopPropagation()}>
            <div className="general-modal-header">
              <h3>
                <FontAwesomeIcon icon={faPhoneAlt} />
                {t('clubs.ClubLocation.modals.contact.title')}
              </h3>
              <button className="general-modal-close" onClick={() => setShowContactModal(false)}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className="general-modal-content">
              <div className="general-contact-details">
                {club.contacts.phone && (
                  <div className="general-contact-detail">
                    <div className="general-contact-icon">
                      <FontAwesomeIcon icon={faPhoneAlt} />
                    </div>
                    <div className="general-contact-info">
                      <span className="general-contact-label">{t('clubs.ClubLocation.modals.contact.mainPhone')}</span>
                      <a href={`tel:${club.contacts.phone}`} className="general-contact-value">
                        {club.contacts.phone}
                      </a>
                    </div>
                  </div>
                )}

                {club.contacts.mobile && club.contacts.mobile !== club.contacts.phone && (
                  <div className="general-contact-detail">
                    <div className="general-contact-icon">
                      <FontAwesomeIcon icon={faPhoneAlt} />
                    </div>
                    <div className="general-contact-info">
                      <span className="general-contact-label">{t('clubs.ClubLocation.modals.contact.mobilePhone')}</span>
                      <a href={`tel:${club.contacts.mobile}`} className="general-contact-value">
                        {club.contacts.mobile}
                      </a>
                    </div>
                  </div>
                )}

                {club.contacts.email && (
                  <div className="general-contact-detail">
                    <div className="general-contact-icon">
                      <FontAwesomeIcon icon={faEnvelope} />
                    </div>
                    <div className="general-contact-info">
                      <span className="general-contact-label">{t('clubs.ClubLocation.modals.contact.emailAddress')}</span>
                      <a href={`mailto:${club.contacts.email}`} className="general-contact-value">
                        {club.contacts.email}
                      </a>
                    </div>
                  </div>
                )}

                {hasWorkingHours && (
                  <div className="general-working-hours-section">
                    <h4>{t('clubs.ClubLocation.modals.contact.detailedWorkingHours')}</h4>
                    <div className="general-hours-detailed">
                      {Object.entries(club.contacts.workingHours)
                        .filter(([day, hours]) => typeof hours === 'string' && hours)
                        .map(([day, hours]) => (
                          <div key={day} className="general-hours-detail">
                            <span className="general-hours-day">{getDayName(day)}</span>
                            <span className={`general-hours-time ${hours === 'closed' ? 'closed' : ''}`}>
                              {hours === 'closed' ? t('clubs.ClubLocation.hours.closed') : hours}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ClubLocation;