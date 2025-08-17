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
  faRoad,
  faDumbbell,
  faRunning,
  faSwimmer,
  faHeartbeat,
  faTrophy,
  faFire,
  faBolt,
  faStopwatch,
  faRoad as faTrack,
  faFlag
} from '@fortawesome/free-solid-svg-icons';
import 'leaflet/dist/leaflet.css';
import './sportsLocation.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const sportsClubIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#3b82f6" width="36" height="36">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  `),
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

export const SportsLocation = ({ club }) => {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('map');
  const [selectedTransport, setSelectedTransport] = useState('running');
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

  const getSportsTransportOptions = () => [
    {
      id: 'running',
      name: t('clubs.SportsLocation.transport.running.name'),
      icon: faRunning,
      color: '#ef4444',
      duration: t('clubs.SportsLocation.transport.running.duration'),
      description: t('clubs.SportsLocation.transport.running.description'),
      instructions: t('clubs.SportsLocation.transport.running.instructions', { returnObjects: true })
    },
    {
      id: 'cycling',
      name: t('clubs.SportsLocation.transport.cycling.name'),
      icon: faBicycle,
      color: '#10b981',
      duration: t('clubs.SportsLocation.transport.cycling.duration'),
      description: t('clubs.SportsLocation.transport.cycling.description'),
      instructions: t('clubs.SportsLocation.transport.cycling.instructions', { returnObjects: true })
    },
    {
      id: 'walking',
      name: t('clubs.SportsLocation.transport.walking.name'),
      icon: faWalking,
      color: '#059669',
      duration: t('clubs.SportsLocation.transport.walking.duration'),
      description: t('clubs.SportsLocation.transport.walking.description'),
      instructions: t('clubs.SportsLocation.transport.walking.instructions', { returnObjects: true })
    },
    {
      id: 'bus',
      name: t('clubs.SportsLocation.transport.bus.name'),
      icon: faBus,
      color: '#3b82f6',
      duration: t('clubs.SportsLocation.transport.bus.duration'),
      description: t('clubs.SportsLocation.transport.bus.description'),
      instructions: t('clubs.SportsLocation.transport.bus.instructions', { returnObjects: true })
    },
    {
      id: 'car',
      name: t('clubs.SportsLocation.transport.car.name'),
      icon: faCar,
      color: '#8b5cf6',
      duration: t('clubs.SportsLocation.transport.car.duration'),
      description: t('clubs.SportsLocation.transport.car.description'),
      instructions: t('clubs.SportsLocation.transport.car.instructions', { returnObjects: true })
    }
  ];

  const getSportsParkingInfo = () => ({
    sports: {
      type: t('clubs.SportsLocation.parking.sports.type'),
      price: t('clubs.SportsLocation.parking.sports.price'),
      maxTime: t('clubs.SportsLocation.parking.sports.maxTime'),
      workingHours: t('clubs.SportsLocation.parking.sports.workingHours'),
      features: t('clubs.SportsLocation.parking.sports.features', { returnObjects: true })
    },
    street: {
      type: t('clubs.SportsLocation.parking.street.type'),
      price: t('clubs.SportsLocation.parking.street.price'),
      maxTime: t('clubs.SportsLocation.parking.street.maxTime'),
      workingHours: t('clubs.SportsLocation.parking.street.workingHours'),
      features: t('clubs.SportsLocation.parking.street.features', { returnObjects: true })
    },
    underground: {
      type: t('clubs.SportsLocation.parking.underground.type'),
      price: t('clubs.SportsLocation.parking.underground.price'),
      maxTime: t('clubs.SportsLocation.parking.underground.maxTime'),
      workingHours: t('clubs.SportsLocation.parking.underground.workingHours'),
      features: t('clubs.SportsLocation.parking.underground.features', { returnObjects: true })
    }
  });

  const getSportsAccessibilityFeatures = () => [
    {
      feature: t('clubs.SportsLocation.accessibility.wheelchair.feature'),
      available: venue.accessibility !== false,
      icon: faWheelchair,
      description: venue.accessibility !== false ? 
        t('clubs.SportsLocation.accessibility.wheelchair.available') : 
        t('clubs.SportsLocation.accessibility.wheelchair.limited')
    },
    {
      feature: t('clubs.SportsLocation.accessibility.elevator.feature'),
      available: venue.elevatorAccess !== false,
      icon: faElevator,
      description: t('clubs.SportsLocation.accessibility.elevator.description')
    },
    {
      feature: t('clubs.SportsLocation.accessibility.stairs.feature'),
      available: true,
      icon: faStairs,
      description: t('clubs.SportsLocation.accessibility.stairs.description')
    },
    {
      feature: t('clubs.SportsLocation.accessibility.safety.feature'),
      available: true,
      icon: faHeartbeat,
      description: t('clubs.SportsLocation.accessibility.safety.description')
    }
  ];

  const sportsTransportOptions = getSportsTransportOptions();
  const sportsParkingInfo = getSportsParkingInfo();
  const sportsAccessibilityFeatures = getSportsAccessibilityFeatures();

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
      alert(t('clubs.SportsLocation.messages.copyError'));
    }
  };

  const handleDirections = (platform) => {
    const coords = `${coordinates.lat},${coordinates.lng}`;
    
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
        alert(t('clubs.SportsLocation.messages.openingMap'));
    }
  };

  const handleShare = () => {
    const locationText = `${location.address || t('clubs.SportsLocation.messages.noAddress')}, ${location.city || ''}`;
    if (navigator.share) {
      navigator.share({
        title: t('clubs.SportsLocation.share.title', { clubName: club.name }),
        text: locationText,
        url: window.location.href
      });
    } else {
      copyToClipboard(locationText, 'share');
      alert(t('clubs.SportsLocation.messages.addressCopied'));
    }
  };

  const handleCallPhone = (phone) => {
    window.open(`tel:${phone}`);
  };

  const getVenueTypeLabel = (type) => {
    if (type === 'sports_complex') {
      return t('clubs.SportsLocation.venue.types.sportsComplex');
    }
    return t('clubs.SportsLocation.venue.types.sportsFacility');
  };

  return (
    <section id="sports-location" className="sports-location-main-section">
      <div className="sports-location-container">
        
        <div className="sports-location-header">
          <div className="sports-location-badge">
            <FontAwesomeIcon icon={faFlag} />
            <span>{t('clubs.SportsLocation.header.badge')}</span>
          </div>
          <h2 className="sports-location-title">
            <FontAwesomeIcon icon={faBolt} className="sports-location-title-icon" />
            {t('clubs.SportsLocation.header.title')}
          </h2>
          <p className="sports-location-subtitle">
            {t('clubs.SportsLocation.header.subtitle')}
          </p>
        </div>

        <div className="sports-location-quick-info">
          <div className="sports-location-address-card">
            <div className="sports-location-address-icon">
              <FontAwesomeIcon icon={faDumbbell} />
              <div className="sports-location-icon-pulse"></div>
            </div>
            <div className="sports-location-address-info">
              <h3>
                <FontAwesomeIcon icon={faTrophy} />
                {t('clubs.SportsLocation.quickInfo.title')}
              </h3>
              <div className="sports-location-full-address">
                {location.address && <div>{location.address}</div>}
                {location.city && <div>{location.city}{location.postalCode && ` ${location.postalCode}`}</div>}
                {location.region && <div>{location.region}</div>}
                {!location.address && <div>{t('clubs.SportsLocation.quickInfo.addressSoon')}</div>}
              </div>
              <div className="sports-location-venue-type">
                <FontAwesomeIcon icon={faFire} />
                <span>{getVenueTypeLabel(venue.type)}</span>
              </div>
            </div>
            <div className="sports-location-address-actions">
              <button 
                className="sports-location-action-btn primary"
                onClick={() => handleDirections('google')}
              >
                <FontAwesomeIcon icon={faDirections} />
                <span>{t('clubs.SportsLocation.actions.navigation')}</span>
                <div className="sports-location-btn-energy"></div>
              </button>
              <button 
                className="sports-location-action-btn secondary"
                onClick={handleShare}
              >
                <FontAwesomeIcon icon={faShareAlt} />
                {t('clubs.SportsLocation.actions.share')}
              </button>
              {location.address && (
                <button 
                  className={`sports-location-copy-btn ${copiedItems['address'] ? 'copied' : ''}`}
                  onClick={() => copyToClipboard(`${location.address}, ${location.city || ''}`, 'address')}
                >
                  <FontAwesomeIcon icon={copiedItems['address'] ? faCheckCircle : faCopy} />
                  {copiedItems['address'] ? t('clubs.SportsLocation.actions.copied') : t('clubs.SportsLocation.actions.copy')}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="sports-location-tabs">
          <button
            className={`sports-location-tab ${activeTab === 'map' ? 'active' : ''}`}
            onClick={() => setActiveTab('map')}
          >
            <FontAwesomeIcon icon={faMapMarkerAlt} />
            <span>{t('clubs.SportsLocation.tabs.map')}</span>
            <div className="sports-location-tab-energy"></div>
          </button>
          <button
            className={`sports-location-tab ${activeTab === 'transport' ? 'active' : ''}`}
            onClick={() => setActiveTab('transport')}
          >
            <FontAwesomeIcon icon={faRunning} />
            <span>{t('clubs.SportsLocation.tabs.transport')}</span>
            <div className="sports-location-tab-energy"></div>
          </button>
          <button
            className={`sports-location-tab ${activeTab === 'parking' ? 'active' : ''}`}
            onClick={() => setActiveTab('parking')}
          >
            <FontAwesomeIcon icon={faParking} />
            <span>{t('clubs.SportsLocation.tabs.parking')}</span>
            <div className="sports-location-tab-energy"></div>
          </button>
          {nearbyPlaces.length > 0 && (
            <button
              className={`sports-location-tab ${activeTab === 'nearby' ? 'active' : ''}`}
              onClick={() => setActiveTab('nearby')}
            >
              <FontAwesomeIcon icon={faCompass} />
              <span>{t('clubs.SportsLocation.tabs.nearby')}</span>
              <div className="sports-location-tab-energy"></div>
            </button>
          )}
        </div>

        <div className="sports-location-content">
          
          {activeTab === 'map' && (
            <div className="sports-location-map-section">
              <div className="sports-location-map-container">
                {mapLoaded && (
                  <MapContainer
                    center={[coordinates.lat, coordinates.lng]}
                    zoom={16}
                    style={{ height: '500px', width: '100%' }}
                    className="sports-location-leaflet-map"
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    
                    <Marker 
                      position={[coordinates.lat, coordinates.lng]}
                      icon={sportsClubIcon}
                    >
                      <Popup>
                        <div className="sports-location-popup">
                          <h4>
                            <FontAwesomeIcon icon={faDumbbell} />
                            {club.name}
                          </h4>
                          {location.address && <p>{location.address}</p>}
                          {location.city && <p>{location.city}</p>}
                          <div className="sports-location-popup-actions">
                            <button onClick={() => handleDirections('google')}>
                              <FontAwesomeIcon icon={faDirections} />
                              {t('clubs.SportsLocation.actions.navigation')}
                            </button>
                          </div>
                        </div>
                      </Popup>
                      <Tooltip permanent direction="top" offset={[0, -15]}>
                        <strong>
                          <FontAwesomeIcon icon={faTrophy} /> {club.name}
                        </strong>
                      </Tooltip>
                    </Marker>

                    {nearbyPlaces.map((place, index) => (
                      <Marker 
                        key={index}
                        position={[place.coordinates.lat, place.coordinates.lng]}
                      >
                        <Popup>
                          <div className="sports-location-popup">
                            <h4>{place.name}</h4>
                            <p>{place.description}</p>
                            {place.distance && <p><strong>{t('clubs.SportsLocation.map.distance')}:</strong> {place.distance}</p>}
                          </div>
                        </Popup>
                      </Marker>
                    ))}

                    <Circle
                      center={[coordinates.lat, coordinates.lng]}
                      radius={500}
                      color="#3b82f6"
                      fillColor="#3b82f6"
                      fillOpacity={0.1}
                      weight={3}
                    >
                      <Tooltip>
                        {t('clubs.SportsLocation.map.trainingZone')}
                      </Tooltip>
                    </Circle>
                  </MapContainer>
                )}
                
                <div className="sports-location-map-controls">
                  <div className="sports-location-map-legend">
                    <div className="sports-location-legend-item">
                      <div className="sports-location-legend-icon sports-club"></div>
                      <span>{t('clubs.SportsLocation.map.legend.sportsClub')}</span>
                    </div>
                    <div className="sports-location-legend-item">
                      <div className="sports-location-legend-icon training-zone"></div>
                      <span>{t('clubs.SportsLocation.map.legend.trainingZone')}</span>
                    </div>
                  </div>
                  
                  <div className="sports-location-map-actions">
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
              
              <div className="sports-location-venue-info">
                <div className="sports-location-venue-header">
                  <FontAwesomeIcon icon={faFire} />
                  <h3>{t('clubs.SportsLocation.venue.title')}</h3>
                </div>
                <div className="sports-location-venue-details">
                  {venue.type && (
                    <div className="sports-location-venue-item">
                      <FontAwesomeIcon icon={faInfoCircle} />
                      <span>{t('clubs.SportsLocation.venue.type')}: {getVenueTypeLabel(venue.type)}</span>
                    </div>
                  )}
                  {venue.size && (
                    <div className="sports-location-venue-item">
                      <FontAwesomeIcon icon={faMapSigns} />
                      <span>{t('clubs.SportsLocation.venue.size')}: {venue.size}</span>
                    </div>
                  )}
                  {venue.capacity && (
                    <div className="sports-location-venue-item">
                      <FontAwesomeIcon icon={faUsers} />
                      <span>{t('clubs.SportsLocation.venue.capacity')}: {venue.capacity} {t('clubs.SportsLocation.venue.athletes')}</span>
                    </div>
                  )}
                  
                  {!venue.type && !venue.size && !venue.capacity && (
                    <>
                      <div className="sports-location-venue-item">
                        <FontAwesomeIcon icon={faDumbbell} />
                        <span>{t('clubs.SportsLocation.venue.modern')}</span>
                      </div>
                      <div className="sports-location-venue-item">
                        <FontAwesomeIcon icon={faUsers} />
                        <span>{t('clubs.SportsLocation.venue.allAges')}</span>
                      </div>
                    </>
                  )}
                </div>
                
                {venue.facilities && venue.facilities.length > 0 && (
                  <div className="sports-location-facilities">
                    <h4>
                      <FontAwesomeIcon icon={faTrophy} />
                      {t('clubs.SportsLocation.venue.facilities')}
                    </h4>
                    <div className="sports-location-facilities-list">
                      {venue.facilities.map((facility, index) => (
                        <span key={index} className="sports-location-facility-tag">
                          <FontAwesomeIcon icon={faCheckCircle} />
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
            <div className="sports-location-transport-section">
              <div className="sports-location-transport-header">
                <FontAwesomeIcon icon={faHeartbeat} />
                <h3>{t('clubs.SportsLocation.transport.title')}</h3>
                <p>{t('clubs.SportsLocation.transport.subtitle')}</p>
              </div>
              
              <div className="sports-location-transport-options">
                {sportsTransportOptions.map(option => (
                  <div 
                    key={option.id}
                    className={`sports-location-transport-card ${
                      selectedTransport === option.id ? 'selected' : ''
                    }`}
                    onClick={() => setSelectedTransport(option.id)}
                  >
                    <div 
                      className="sports-location-transport-icon"
                      style={{ background: option.color }}
                    >
                      <FontAwesomeIcon icon={option.icon} />
                      <div className="sports-location-transport-pulse"></div>
                    </div>
                    <div className="sports-location-transport-info">
                      <h4>{option.name}</h4>
                      <p>{option.description}</p>
                      <span className="sports-location-transport-duration">
                        <FontAwesomeIcon icon={faStopwatch} />
                        {option.duration}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="sports-location-transport-details">
                {sportsTransportOptions
                  .filter(option => option.id === selectedTransport)
                  .map(option => (
                    <div key={option.id} className="sports-location-instructions">
                      <div className="sports-location-instructions-header">
                        <FontAwesomeIcon icon={option.icon} style={{ color: option.color }} />
                        <h3>{t('clubs.SportsLocation.transport.tipsFor')} {option.name}</h3>
                        <FontAwesomeIcon icon={faFire} className="sports-location-fire-icon" />
                      </div>
                      <ul className="sports-location-instructions-list">
                        {option.instructions.map((instruction, index) => (
                          <li key={index}>
                            <FontAwesomeIcon icon={faBolt} />
                            {instruction}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))
                }
              </div>
            </div>
          )}

          {activeTab === 'parking' && (
            <div className="sports-location-parking-section">
              <div className="sports-location-parking-header">
                <FontAwesomeIcon icon={faParking} />
                <h3>{t('clubs.SportsLocation.parking.title')}</h3>
                <p>{t('clubs.SportsLocation.parking.subtitle')}</p>
              </div>
              
              <div className="sports-location-parking-grid">
                {Object.entries(sportsParkingInfo).map(([key, parking]) => (
                  <div key={key} className="sports-location-parking-card">
                    <div className="sports-location-parking-header">
                      <FontAwesomeIcon 
                        icon={key === 'sports' ? faDumbbell : key === 'underground' ? faElevator : faRoad} 
                      />
                      <h3>{parking.type}</h3>
                    </div>
                    <div className="sports-location-parking-details">
                      <div className="sports-location-parking-item">
                        <span className="sports-location-parking-label">{t('clubs.SportsLocation.parking.price')}:</span>
                        <span>{parking.price}</span>
                      </div>
                      <div className="sports-location-parking-item">
                        <span className="sports-location-parking-label">{t('clubs.SportsLocation.parking.maxTime')}:</span>
                        <span>{parking.maxTime}</span>
                      </div>
                      <div className="sports-location-parking-item">
                        <span className="sports-location-parking-label">{t('clubs.SportsLocation.parking.workingHours')}:</span>
                        <span>{parking.workingHours}</span>
                      </div>
                      
                      <div className="sports-location-parking-features">
                        <h4>{t('clubs.SportsLocation.parking.advantages')}:</h4>
                        <div className="sports-location-features-list">
                          {parking.features.map((feature, index) => (
                            <span key={index} className="sports-location-feature-tag">
                              <FontAwesomeIcon icon={faCheckCircle} />
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'nearby' && nearbyPlaces.length > 0 && (
            <div className="sports-location-nearby-section">
              <div className="sports-location-nearby-header">
                <FontAwesomeIcon icon={faCompass} />
                <h3>{t('clubs.SportsLocation.nearby.title')}</h3>
                <p>{t('clubs.SportsLocation.nearby.subtitle')}</p>
              </div>
              
              <div className="sports-location-nearby-grid">
                {nearbyPlaces.map((place, index) => (
                  <div key={index} className="sports-location-nearby-card">
                    <div className="sports-location-nearby-icon">
                      <FontAwesomeIcon icon={faMapMarkerAlt} />
                      <div className="sports-location-nearby-pulse"></div>
                    </div>
                    <div className="sports-location-nearby-info">
                      <h4>{place.name}</h4>
                      <p>{place.description}</p>
                      {place.distance && (
                        <span className="sports-location-nearby-distance">
                          <FontAwesomeIcon icon={faLocationArrow} />
                          {place.distance}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="sports-location-accessibility">
          <div className="sports-location-accessibility-header">
            <FontAwesomeIcon icon={faHeartbeat} />
            <h3>{t('clubs.SportsLocation.accessibility.title')}</h3>
            <p>{t('clubs.SportsLocation.accessibility.subtitle')}</p>
          </div>
          
          <div className="sports-location-accessibility-grid">
            {sportsAccessibilityFeatures.map((feature, index) => (
              <div key={index} className="sports-location-accessibility-item">
                <div className={`sports-location-accessibility-status ${
                  feature.available ? 'available' : 'unavailable'
                }`}>
                  <FontAwesomeIcon icon={feature.icon} />
                  <div className="sports-location-accessibility-pulse"></div>
                </div>
                <div className="sports-location-accessibility-details">
                  <h4>{feature.feature}</h4>
                  <p>{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="sports-location-help">
          <div className="sports-location-help-content">
            <FontAwesomeIcon icon={faTrophy} className="sports-location-help-trophy" />
            <h3>{t('clubs.SportsLocation.help.title')}</h3>
            <p>{t('clubs.SportsLocation.help.subtitle')}</p>
            <div className="sports-location-help-buttons">
              {contacts.phone && (
                <button 
                  className="sports-location-help-btn primary"
                  onClick={() => handleCallPhone(contacts.phone)}
                >
                  <FontAwesomeIcon icon={faPhone} />
                  {t('clubs.SportsLocation.help.callUs')}: {contacts.phone}
                  <div className="sports-location-btn-energy"></div>
                </button>
              )}
              <button 
                className="sports-location-help-btn secondary"
                onClick={() => handleDirections('google')}
              >
                <FontAwesomeIcon icon={faDirections} />
                {t('clubs.SportsLocation.help.realTimeNavigation')}
              </button>
            </div>
          </div>
          <div className="sports-location-help-bg-elements">
            <FontAwesomeIcon icon={faDumbbell} className="sports-location-bg-icon" />
            <FontAwesomeIcon icon={faHeartbeat} className="sports-location-bg-icon" />
            <FontAwesomeIcon icon={faBolt} className="sports-location-bg-icon" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default SportsLocation;