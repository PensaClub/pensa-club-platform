import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Marker, Popup, Circle, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMapMarkerAlt,
  faDirections,
  faCar,
  faBus,
  faSubway,
  faWalking,
  faBicycle,
  faParking,
  faWheelchair,
  faElevator,
  faStairs,
  faPhone,
  faClock,
  faInfoCircle,
  faRoute,
  faCompass,
  faLocationArrow,
  faShareAlt,
  faUsers,
  faCopy,
  faCheckCircle,
  faMapSigns,
  faRoad
} from '@fortawesome/free-solid-svg-icons';
import 'leaflet/dist/leaflet.css';
import './traditionalLocation.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const clubIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#059669" width="32" height="32">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

export const TraditionalLocation = ({ club }) => {
  const { t, i18n } = useTranslation('clubs');
  const [activeTab, setActiveTab] = useState('map');
  const [selectedTransport, setSelectedTransport] = useState('walking');
  const [mapLoaded, setMapLoaded] = useState(false);
  const [copiedItems, setCopiedItems] = useState({});

  if (!club?.name) {
    return null;
  }

  const location = club.location || {};
  const contacts = club.contacts || {};

  const hasLocationContent = 
    location.address ||
    location.city ||
    location.coordinates ||
    contacts.phone ||
    contacts.email;

  if (!hasLocationContent) {
    return null;
  }

  const coordinates = location.coordinates || { lat: 42.6777, lng: 23.3219 };
  const venue = location.venue || {};
  const nearbyPlaces = club.location?.nearbyPlaces || [];

  const getTransportOptions = () => [
    {
      id: 'walking',
      name: t('clubs.TraditionalLocation.transport.walking.name'),
      icon: faWalking,
      color: '#059669',
      duration: t('clubs.TraditionalLocation.transport.walking.duration'),
      description: t('clubs.TraditionalLocation.transport.walking.description'),
      instructions: [
        t('clubs.TraditionalLocation.transport.walking.instruction1'),
        t('clubs.TraditionalLocation.transport.walking.instruction2'),
        t('clubs.TraditionalLocation.transport.walking.instruction3')
      ]
    },
    {
      id: 'bus',
      name: t('clubs.TraditionalLocation.transport.bus.name'),
      icon: faBus,
      color: '#3b82f6',
      duration: t('clubs.TraditionalLocation.transport.bus.duration'),
      description: t('clubs.TraditionalLocation.transport.bus.description'),
      instructions: [
        t('clubs.TraditionalLocation.transport.bus.instruction1'),
        t('clubs.TraditionalLocation.transport.bus.instruction2'),
        t('clubs.TraditionalLocation.transport.bus.instruction3')
      ]
    },
    {
      id: 'metro',
      name: t('clubs.TraditionalLocation.transport.metro.name'),
      icon: faSubway,
      color: '#ef4444',
      duration: t('clubs.TraditionalLocation.transport.metro.duration'),
      description: t('clubs.TraditionalLocation.transport.metro.description'),
      instructions: [
        t('clubs.TraditionalLocation.transport.metro.instruction1'),
        t('clubs.TraditionalLocation.transport.metro.instruction2'),
        t('clubs.TraditionalLocation.transport.metro.instruction3')
      ]
    },
    {
      id: 'car',
      name: t('clubs.TraditionalLocation.transport.car.name'),
      icon: faCar,
      color: '#8b5cf6',
      duration: t('clubs.TraditionalLocation.transport.car.duration'),
      description: t('clubs.TraditionalLocation.transport.car.description'),
      instructions: [
        t('clubs.TraditionalLocation.transport.car.instruction1'),
        t('clubs.TraditionalLocation.transport.car.instruction2'),
        t('clubs.TraditionalLocation.transport.car.instruction3')
      ]
    }
  ];

  const getParkingInfo = () => ({
    street: {
      type: t('clubs.TraditionalLocation.parking.street.type'),
      price: t('clubs.TraditionalLocation.parking.street.price'),
      maxTime: t('clubs.TraditionalLocation.parking.street.maxTime'),
      workingHours: t('clubs.TraditionalLocation.parking.street.workingHours')
    },
    paid: {
      name: t('clubs.TraditionalLocation.parking.paid.name'),
      distance: t('clubs.TraditionalLocation.parking.paid.distance'),
      price: t('clubs.TraditionalLocation.parking.paid.price'),
      capacity: t('clubs.TraditionalLocation.parking.paid.capacity'),
      workingHours: t('clubs.TraditionalLocation.parking.paid.workingHours')
    },
    free: {
      location: t('clubs.TraditionalLocation.parking.free.location'),
      distance: t('clubs.TraditionalLocation.parking.free.distance'),
      note: t('clubs.TraditionalLocation.parking.free.note')
    }
  });

  const getAccessibilityFeatures = () => [
    {
      feature: t('clubs.TraditionalLocation.accessibility.wheelchair'),
      available: venue.accessibility !== false,
      icon: faWheelchair,
      description: venue.accessibility !== false ? 
        t('clubs.TraditionalLocation.accessibility.wheelchairAvailable') : 
        t('clubs.TraditionalLocation.accessibility.wheelchairLimited')
    },
    {
      feature: t('clubs.TraditionalLocation.accessibility.entrance'),
      available: true,
      icon: faStairs,
      description: t('clubs.TraditionalLocation.accessibility.entranceDescription')
    },
    {
      feature: t('clubs.TraditionalLocation.accessibility.publicAccess'),
      available: true,
      icon: faElevator,
      description: t('clubs.TraditionalLocation.accessibility.publicAccessDescription')
    }
  ];

  useEffect(() => {
    setMapLoaded(true);
  }, []);

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
      alert(t('clubs.TraditionalLocation.messages.copyError'));
    }
  };

  const handleDirections = (platform) => {
    const coords = `${coordinates.lat},${coordinates.lng}`;
    const address = encodeURIComponent(`${location.address || t('clubs.TraditionalLocation.messages.addressNotSpecified')}, ${location.city || t('clubs.TraditionalLocation.messages.defaultCountry')}`);
    
    switch(platform) {
      case 'google':
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${coords}`, '_blank');
        break;
      case 'apple':
        window.open(`http://maps.apple.com/?daddr=${coords}`, '_blank');
        break;
      case 'waze':
        window.open(`https://waze.com/ul?navigate=yes&ll=${coords}`, '_blank');
        break;
      default:
        alert(t('clubs.TraditionalLocation.messages.openingMap'));
    }
  };

  const handleShare = () => {
    const locationText = `${location.address || t('clubs.TraditionalLocation.messages.addressNotSpecified')}, ${location.city || ''}`;
    if (navigator.share) {
      navigator.share({
        title: t('clubs.TraditionalLocation.messages.shareTitle', { clubName: club.name }),
        text: locationText,
        url: window.location.href
      });
    } else {
      copyToClipboard(locationText, 'share');
      alert(t('clubs.TraditionalLocation.messages.addressCopied'));
    }
  };

  const handleCallPhone = (phone) => {
    window.open(`tel:${phone}`);
  };

  const transportOptions = getTransportOptions();
  const parkingInfo = getParkingInfo();
  const accessibilityFeatures = getAccessibilityFeatures();

  return (
    <section id="traditional-location" className="traditional-location-main-section">
      <div className="traditional-location-container">
        
        <div className="traditional-location-header">
          <div className="traditional-location-badge">
            <FontAwesomeIcon icon={faMapMarkerAlt} />
            <span>{t('clubs.TraditionalLocation.header.badge')}</span>
          </div>
          <h2 className="traditional-location-title">{t('clubs.TraditionalLocation.header.title')}</h2>
          <p className="traditional-location-subtitle">
            {t('clubs.TraditionalLocation.header.subtitle')}
          </p>
        </div>

        <div className="traditional-location-quick-info">
          <div className="traditional-location-address-card">
            <div className="traditional-location-address-icon">
              <FontAwesomeIcon icon={faMapMarkerAlt} />
            </div>
            <div className="traditional-location-address-info">
              <h3>{t('clubs.TraditionalLocation.address.title')}</h3>
              <div className="traditional-location-full-address">
                {location.address && <div>{location.address}</div>}
                {location.city && <div>{location.city}{location.postalCode && ` ${location.postalCode}`}</div>}
                {location.region && <div>{location.region}</div>}
                {!location.address && <div>{t('clubs.TraditionalLocation.address.comingSoon')}</div>}
              </div>
            </div>
            <div className="traditional-location-address-actions">
              <button 
                className="traditional-location-action-btn primary"
                onClick={() => handleDirections('google')}
              >
                <FontAwesomeIcon icon={faDirections} />
                {t('clubs.TraditionalLocation.actions.directions')}
              </button>
              <button 
                className="traditional-location-action-btn secondary"
                onClick={handleShare}
              >
                <FontAwesomeIcon icon={faShareAlt} />
                {t('clubs.TraditionalLocation.actions.share')}
              </button>
              {location.address && (
                <button 
                  className={`traditional-location-copy-btn ${copiedItems['address'] ? 'copied' : ''}`}
                  onClick={() => copyToClipboard(`${location.address}, ${location.city || ''}`, 'address')}
                >
                  <FontAwesomeIcon icon={copiedItems['address'] ? faCheckCircle : faCopy} />
                  {copiedItems['address'] ? t('clubs.TraditionalLocation.actions.copied') : t('clubs.TraditionalLocation.actions.copy')}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="traditional-location-tabs">
          <button
            className={`traditional-location-tab ${activeTab === 'map' ? 'active' : ''}`}
            onClick={() => setActiveTab('map')}
          >
            <FontAwesomeIcon icon={faMapMarkerAlt} />
            {t('clubs.TraditionalLocation.tabs.map')}
          </button>
          <button
            className={`traditional-location-tab ${activeTab === 'transport' ? 'active' : ''}`}
            onClick={() => setActiveTab('transport')}
          >
            <FontAwesomeIcon icon={faBus} />
            {t('clubs.TraditionalLocation.tabs.transport')}
          </button>
          <button
            className={`traditional-location-tab ${activeTab === 'parking' ? 'active' : ''}`}
            onClick={() => setActiveTab('parking')}
          >
            <FontAwesomeIcon icon={faParking} />
            {t('clubs.TraditionalLocation.tabs.parking')}
          </button>
          {nearbyPlaces.length > 0 && (
            <button
              className={`traditional-location-tab ${activeTab === 'nearby' ? 'active' : ''}`}
              onClick={() => setActiveTab('nearby')}
            >
              <FontAwesomeIcon icon={faCompass} />
              {t('clubs.TraditionalLocation.tabs.nearby')}
            </button>
          )}
        </div>

        <div className="traditional-location-content">
          
          {activeTab === 'map' && (
            <div className="traditional-location-map-section">
              <div className="traditional-location-map-container">
                {mapLoaded && (
                  <MapContainer
                    center={[coordinates.lat, coordinates.lng]}
                    zoom={16}
                    style={{ height: '400px', width: '100%' }}
                    className="traditional-location-leaflet-map"
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    
                    <Marker 
                      position={[coordinates.lat, coordinates.lng]}
                      icon={clubIcon}
                    >
                      <Popup>
                        <div className="traditional-location-popup">
                          <h4>{club.name}</h4>
                          {location.address && <p>{location.address}</p>}
                          {location.city && <p>{location.city}</p>}
                          <div className="traditional-location-popup-actions">
                            <button onClick={() => handleDirections('google')}>
                              <FontAwesomeIcon icon={faDirections} />
                              {t('clubs.TraditionalLocation.actions.directions')}
                            </button>
                          </div>
                        </div>
                      </Popup>
                      <Tooltip permanent direction="top" offset={[0, -10]}>
                        <strong>{club.name}</strong>
                      </Tooltip>
                    </Marker>

                    {nearbyPlaces.map((place, index) => (
                      <Marker 
                        key={index}
                        position={[place.coordinates.lat, place.coordinates.lng]}
                      >
                        <Popup>
                          <div className="traditional-location-popup">
                            <h4>{place.name}</h4>
                            <p>{place.description}</p>
                            {place.distance && <p><strong>{t('clubs.TraditionalLocation.nearby.distance')}:</strong> {place.distance}</p>}
                          </div>
                        </Popup>
                      </Marker>
                    ))}

                    <Circle
                      center={[coordinates.lat, coordinates.lng]}
                      radius={250}
                      color="#059669"
                      fillColor="#059669"
                      fillOpacity={0.1}
                      weight={2}
                    >
                      <Tooltip>
                        {t('clubs.TraditionalLocation.map.radiusTooltip')}
                      </Tooltip>
                    </Circle>
                  </MapContainer>
                )}
                
                <div className="traditional-location-map-controls">
                  <div className="traditional-location-map-legend">
                    <div className="traditional-location-legend-item">
                      <div className="traditional-location-legend-icon club"></div>
                      <span>{t('clubs.TraditionalLocation.map.legend.club')}</span>
                    </div>
                  </div>
                  
                  <div className="traditional-location-map-actions">
                    <button onClick={() => handleDirections('google')}>
                      <FontAwesomeIcon icon={faDirections} />
                      Google Maps
                    </button>
                    <button onClick={() => handleDirections('apple')}>
                      <FontAwesomeIcon icon={faDirections} />
                      Apple Maps
                    </button>
                    <button onClick={() => handleDirections('waze')}>
                      <FontAwesomeIcon icon={faRoute} />
                      Waze
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="traditional-location-venue-info">
                <h3>{t('clubs.TraditionalLocation.venue.title')}</h3>
                <div className="traditional-location-venue-details">
                  {venue.type && (
                    <div className="traditional-location-venue-item">
                      <FontAwesomeIcon icon={faInfoCircle} />
                      <span>{t('clubs.TraditionalLocation.venue.type')}: {venue.type === 'municipal' ? t('clubs.TraditionalLocation.venue.municipal') : venue.type}</span>
                    </div>
                  )}
                  {venue.size && (
                    <div className="traditional-location-venue-item">
                      <FontAwesomeIcon icon={faMapSigns} />
                      <span>{t('clubs.TraditionalLocation.venue.size')}: {venue.size}</span>
                    </div>
                  )}
                  {venue.capacity && (
                    <div className="traditional-location-venue-item">
                      <FontAwesomeIcon icon={faUsers} />
                      <span>{t('clubs.TraditionalLocation.venue.capacity')}: {venue.capacity} {t('clubs.TraditionalLocation.venue.people')}</span>
                    </div>
                  )}
                  
                  {!venue.type && !venue.size && !venue.capacity && (
                    <>
                      <div className="traditional-location-venue-item">
                        <FontAwesomeIcon icon={faInfoCircle} />
                        <span>{t('clubs.TraditionalLocation.venue.defaultType')}</span>
                      </div>
                      <div className="traditional-location-venue-item">
                        <FontAwesomeIcon icon={faUsers} />
                        <span>{t('clubs.TraditionalLocation.venue.defaultDescription')}</span>
                      </div>
                    </>
                  )}
                </div>
                
                {venue.facilities && venue.facilities.length > 0 && (
                  <div className="traditional-location-facilities">
                    <h4>{t('clubs.TraditionalLocation.venue.facilities')}</h4>
                    <div className="traditional-location-facilities-list">
                      {venue.facilities.map((facility, index) => (
                        <span key={index} className="traditional-location-facility-tag">
                          {facility}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'transport' && (
            <div className="traditional-location-transport-section">
              <div className="traditional-location-transport-options">
                {transportOptions.map(option => (
                  <div 
                    key={option.id}
                    className={`traditional-location-transport-card ${
                      selectedTransport === option.id ? 'selected' : ''
                    }`}
                    onClick={() => setSelectedTransport(option.id)}
                  >
                    <div 
                      className="traditional-location-transport-icon"
                      style={{ background: option.color }}
                    >
                      <FontAwesomeIcon icon={option.icon} />
                    </div>
                    <div className="traditional-location-transport-info">
                      <h4>{option.name}</h4>
                      <p>{option.description}</p>
                      <span className="traditional-location-transport-duration">{option.duration}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="traditional-location-transport-details">
                {transportOptions
                  .filter(option => option.id === selectedTransport)
                  .map(option => (
                    <div key={option.id} className="traditional-location-instructions">
                      <div className="traditional-location-instructions-header">
                        <FontAwesomeIcon icon={option.icon} style={{ color: option.color }} />
                        <h3>{t('clubs.TraditionalLocation.transport.instructionsFor')} {option.name}</h3>
                      </div>
                      <ul className="traditional-location-instructions-list">
                        {option.instructions.map((instruction, index) => (
                          <li key={index}>{instruction}</li>
                        ))}
                      </ul>
                    </div>
                  ))
                }
              </div>
            </div>
          )}

          {activeTab === 'parking' && (
            <div className="traditional-location-parking-section">
              <div className="traditional-location-parking-grid">
                <div className="traditional-location-parking-card">
                  <div className="traditional-location-parking-header">
                    <FontAwesomeIcon icon={faRoad} />
                    <h3>{t('clubs.TraditionalLocation.parking.street.title')}</h3>
                  </div>
                  <div className="traditional-location-parking-details">
                    <div className="traditional-location-parking-item">
                      <span className="traditional-location-parking-label">{t('clubs.TraditionalLocation.parking.labels.type')}:</span>
                      <span>{parkingInfo.street.type}</span>
                    </div>
                    <div className="traditional-location-parking-item">
                      <span className="traditional-location-parking-label">{t('clubs.TraditionalLocation.parking.labels.price')}:</span>
                      <span>{parkingInfo.street.price}</span>
                    </div>
                    <div className="traditional-location-parking-item">
                      <span className="traditional-location-parking-label">{t('clubs.TraditionalLocation.parking.labels.maxTime')}:</span>
                      <span>{parkingInfo.street.maxTime}</span>
                    </div>
                    <div className="traditional-location-parking-item">
                      <span className="traditional-location-parking-label">{t('clubs.TraditionalLocation.parking.labels.workingHours')}:</span>
                      <span>{parkingInfo.street.workingHours}</span>
                    </div>
                  </div>
                </div>
                
                <div className="traditional-location-parking-card">
                  <div className="traditional-location-parking-header">
                    <FontAwesomeIcon icon={faParking} />
                    <h3>{t('clubs.TraditionalLocation.parking.paid.title')}</h3>
                  </div>
                  <div className="traditional-location-parking-details">
                    <div className="traditional-location-parking-item">
                      <span className="traditional-location-parking-label">{t('clubs.TraditionalLocation.parking.labels.type')}:</span>
                      <span>{parkingInfo.paid.name}</span>
                    </div>
                    <div className="traditional-location-parking-item">
                      <span className="traditional-location-parking-label">{t('clubs.TraditionalLocation.parking.labels.distance')}:</span>
                      <span>{parkingInfo.paid.distance}</span>
                    </div>
                    <div className="traditional-location-parking-item">
                      <span className="traditional-location-parking-label">{t('clubs.TraditionalLocation.parking.labels.price')}:</span>
                      <span>{parkingInfo.paid.price}</span>
                    </div>
                    <div className="traditional-location-parking-item">
                      <span className="traditional-location-parking-label">{t('clubs.TraditionalLocation.parking.labels.capacity')}:</span>
                      <span>{parkingInfo.paid.capacity}</span>
                    </div>
                  </div>
                </div>
                
                <div className="traditional-location-parking-card">
                  <div className="traditional-location-parking-header">
                    <FontAwesomeIcon icon={faLocationArrow} />
                    <h3>{t('clubs.TraditionalLocation.parking.free.title')}</h3>
                  </div>
                  <div className="traditional-location-parking-details">
                    <div className="traditional-location-parking-item">
                      <span className="traditional-location-parking-label">{t('clubs.TraditionalLocation.parking.labels.location')}:</span>
                      <span>{parkingInfo.free.location}</span>
                    </div>
                    <div className="traditional-location-parking-item">
                      <span className="traditional-location-parking-label">{t('clubs.TraditionalLocation.parking.labels.distance')}:</span>
                      <span>{parkingInfo.free.distance}</span>
                    </div>
                    <div className="traditional-location-parking-note">
                      <FontAwesomeIcon icon={faInfoCircle} />
                      <span>{parkingInfo.free.note}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'nearby' && nearbyPlaces.length > 0 && (
            <div className="traditional-location-nearby-section">
              <div className="traditional-location-nearby-grid">
                {nearbyPlaces.map((place, index) => (
                  <div key={index} className="traditional-location-nearby-card">
                    <div className="traditional-location-nearby-icon">
                      <FontAwesomeIcon icon={faMapMarkerAlt} />
                    </div>
                    <div className="traditional-location-nearby-info">
                      <h4>{place.name}</h4>
                      <p>{place.description}</p>
                      {place.distance && <span className="traditional-location-nearby-distance">{place.distance}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="traditional-location-accessibility">
          <div className="traditional-location-accessibility-header">
            <FontAwesomeIcon icon={faWheelchair} />
            <h3>{t('clubs.TraditionalLocation.accessibility.title')}</h3>
            <p>{t('clubs.TraditionalLocation.accessibility.subtitle')}</p>
          </div>
          
          <div className="traditional-location-accessibility-grid">
            {accessibilityFeatures.map((feature, index) => (
              <div key={index} className="traditional-location-accessibility-item">
                <div className={`traditional-location-accessibility-status ${
                  feature.available ? 'available' : 'unavailable'
                }`}>
                  <FontAwesomeIcon icon={feature.icon} />
                </div>
                <div className="traditional-location-accessibility-details">
                  <h4>{feature.feature}</h4>
                  <p>{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="traditional-location-help">
          <div className="traditional-location-help-content">
            <h3>{t('clubs.TraditionalLocation.help.title')}</h3>
            <p>{t('clubs.TraditionalLocation.help.subtitle')}</p>
            <div className="traditional-location-help-buttons">
              {contacts.phone && (
                <button 
                  className="traditional-location-help-btn primary"
                  onClick={() => handleCallPhone(contacts.phone)}
                >
                  <FontAwesomeIcon icon={faPhone} />
                  {t('clubs.TraditionalLocation.help.call')}: {contacts.phone}
                </button>
              )}
              <button 
                className="traditional-location-help-btn secondary"
                onClick={() => handleDirections('google')}
              >
                <FontAwesomeIcon icon={faDirections} />
                {t('clubs.TraditionalLocation.help.realTimeNavigation')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TraditionalLocation;