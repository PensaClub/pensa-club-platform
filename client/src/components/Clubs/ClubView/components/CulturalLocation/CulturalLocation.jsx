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
  faTaxi,
  faWalking,
  faBicycle,
  faParking,
  faWheelchair,
  faElevator,
  faStairs,
  faHospital,
  faShoppingCart,
  faUtensils,
  faGasPump,
  faBus as faBusStop,
  faPhone,
  faClock,
  faInfoCircle,
  faRoute,
  faCompass,
  faMapSigns,
  faRoad,
  faLocationArrow,
  faExpand,
  faShareAlt,
  faPrint,
  faDownload,
  faSearchPlus,
  faSearchMinus,
  faUsers
} from '@fortawesome/free-solid-svg-icons';
import 'leaflet/dist/leaflet.css';
import './culturalLocation.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const clubIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#dc2626" width="32" height="32">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const hospitalIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ef4444" width="24" height="24">
      <path d="M19 8h-2v3h-3v2h3v3h2v-3h3v-2h-3V8zM4 6h5v2h2V6h1V4H4v2zm0 4h8v2H4v-2zm0 4h8v2H4v-2z"/>
    </svg>
  `),
  iconSize: [24, 24],
  iconAnchor: [12, 24],
});

const busIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#3b82f6" width="24" height="24">
      <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>
    </svg>
  `),
  iconSize: [24, 24],
  iconAnchor: [12, 24],
});

const parkingIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#8b5cf6" width="24" height="24">
      <path d="M13,3A9,9 0 0,0 4,12H1L4,15L7,12H4A7,7 0 0,1 11,5A7,7 0 0,1 18,12A7,7 0 0,1 11,19H8V21H13A9,9 0 0,0 22,12A9,9 0 0,0 13,3M15,11V9H10V15H12V13H15V11Z"/>
    </svg>
  `),
  iconSize: [24, 24],
  iconAnchor: [12, 24],
});

export const CulturalLocation = ({ club }) => {
  const { t, i18n } = useTranslation('clubs');
  const [activeTab, setActiveTab] = useState('map');
  const [selectedTransport, setSelectedTransport] = useState('walking');
  const [mapLoaded, setMapLoaded] = useState(false);

  if (!club?.location || !club.location.coordinates) {
    return null;
  }

  const getDefaultCity = () => {
    return i18n.language === 'bg' ? 'София' :
           i18n.language === 'en' ? 'Sofia' :
           'Sofia';
  };

  const location = {
    address: club.location.address || t('clubs.CulturalLocation.location.defaultAddress'),
    city: club.location.city || getDefaultCity(),
    municipality: club.location.municipality || t('clubs.CulturalLocation.location.defaultMunicipality'),
    region: club.location.region || t('clubs.CulturalLocation.location.defaultRegion'),
    postalCode: club.location.postalCode || '',
    coordinates: {
      lat: club.location.coordinates.lat || 42.6777,
      lng: club.location.coordinates.lng || 23.3219
    }
  };

  const venue = {
    type: club.location?.venue?.type || 'municipal',
    size: club.location?.venue?.size || t('clubs.CulturalLocation.venue.noSize'),
    capacity: club.location?.venue?.capacity || t('clubs.CulturalLocation.venue.noCapacity'),
    facilities: club.location?.venue?.facilities || [t('clubs.CulturalLocation.venue.defaultFacility')],
    accessibility: club.location?.venue?.accessibility !== false
  };

  const getVenueTypeTranslation = (type) => {
    const types = {
      'municipal': t('clubs.CulturalLocation.venue.types.municipal'),
      'community': t('clubs.CulturalLocation.venue.types.community'),
      'cultural': t('clubs.CulturalLocation.venue.types.cultural'),
      'school': t('clubs.CulturalLocation.venue.types.school'),
      'private': t('clubs.CulturalLocation.venue.types.private')
    };
    return types[type] || type;
  };

  const generateNearbyPlaces = (baseCoords) => {
    const places = [];
    
    if (club.location?.nearbyPlaces && Array.isArray(club.location.nearbyPlaces)) {
      club.location.nearbyPlaces.forEach((place, index) => {
        places.push({
          name: place.name,
          distance: place.distance || `${Math.floor(Math.random() * 300 + 100)}${t('clubs.CulturalLocation.units.meters')}`,
          type: place.type || 'general',
          icon: place.type === 'hospital' ? hospitalIcon : 
                place.type === 'transport' ? busIcon :
                place.type === 'parking' ? parkingIcon : busIcon,
          description: place.description || t('clubs.CulturalLocation.nearbyPlaces.noInfo'),
          coordinates: place.coordinates || {
            lat: baseCoords.lat + (Math.random() - 0.5) * 0.005,
            lng: baseCoords.lng + (Math.random() - 0.5) * 0.005
          }
        });
      });
    } else {
      const defaultPlaces = [
        {
          name: t('clubs.CulturalLocation.nearbyPlaces.default.transport.name'),
          distance: `150${t('clubs.CulturalLocation.units.meters')}`,
          type: 'transport',
          icon: busIcon,
          description: t('clubs.CulturalLocation.nearbyPlaces.default.transport.description'),
          coordinates: { 
            lat: baseCoords.lat + 0.001, 
            lng: baseCoords.lng - 0.001 
          }
        }
      ];

      if (location.city.toLowerCase().includes('sofia') || location.city.toLowerCase().includes('софия')) {
        defaultPlaces.push({
          name: t('clubs.CulturalLocation.nearbyPlaces.default.hospital.name'),
          distance: `300${t('clubs.CulturalLocation.units.meters')}`,
          type: 'hospital',
          icon: hospitalIcon,
          description: t('clubs.CulturalLocation.nearbyPlaces.default.hospital.description'),
          coordinates: { 
            lat: baseCoords.lat + 0.002, 
            lng: baseCoords.lng + 0.001 
          }
        });
      }

      places.push(...defaultPlaces);
    }

    return places;
  };

  const nearbyPlaces = generateNearbyPlaces(location.coordinates);

  const getTransportOptions = () => [
    {
      id: 'walking',
      name: t('clubs.CulturalLocation.transport.walking.name'),
      icon: faWalking,
      color: '#10b981',
      duration: t('clubs.CulturalLocation.transport.walking.duration'),
      description: t('clubs.CulturalLocation.transport.walking.description', { city: location.city }),
      instructions: club.location?.transport?.walking || [
        t('clubs.CulturalLocation.transport.walking.instructions.0'),
        t('clubs.CulturalLocation.transport.walking.instructions.1', { address: location.address }),
        t('clubs.CulturalLocation.transport.walking.instructions.2')
      ]
    },
    {
      id: 'bus',
      name: t('clubs.CulturalLocation.transport.bus.name'),
      icon: faBus,
      color: '#3b82f6',
      duration: t('clubs.CulturalLocation.transport.bus.duration'),
      description: t('clubs.CulturalLocation.transport.bus.description'),
      instructions: club.location?.transport?.bus || [
        t('clubs.CulturalLocation.transport.bus.instructions.0'),
        t('clubs.CulturalLocation.transport.bus.instructions.1'),
        t('clubs.CulturalLocation.transport.bus.instructions.2', { address: location.address })
      ]
    },
    {
      id: 'metro',
      name: t('clubs.CulturalLocation.transport.metro.name'),
      icon: faSubway,
      color: '#ef4444',
      duration: t('clubs.CulturalLocation.transport.metro.duration'),
      description: t('clubs.CulturalLocation.transport.metro.description'),
      instructions: club.location?.transport?.metro || [
        t('clubs.CulturalLocation.transport.metro.instructions.0'),
        t('clubs.CulturalLocation.transport.metro.instructions.1'),
        t('clubs.CulturalLocation.transport.metro.instructions.2')
      ]
    },
    {
      id: 'car',
      name: t('clubs.CulturalLocation.transport.car.name'),
      icon: faCar,
      color: '#8b5cf6',
      duration: t('clubs.CulturalLocation.transport.car.duration'),
      description: t('clubs.CulturalLocation.transport.car.description'),
      instructions: club.location?.transport?.car || [
        t('clubs.CulturalLocation.transport.car.instructions.0'),
        t('clubs.CulturalLocation.transport.car.instructions.1', { address: location.address, city: location.city }),
        t('clubs.CulturalLocation.transport.car.instructions.2')
      ]
    }
  ];

  const transportOptions = getTransportOptions();

  const getParkingInfo = () => ({
    street: {
      type: club.location?.parking?.street?.type || t('clubs.CulturalLocation.parking.street.defaultType'),
      price: club.location?.parking?.street?.price || t('clubs.CulturalLocation.parking.street.defaultPrice'),
      maxTime: club.location?.parking?.street?.maxTime || t('clubs.CulturalLocation.parking.street.defaultMaxTime'),
      workingHours: club.location?.parking?.street?.workingHours || t('clubs.CulturalLocation.parking.street.defaultHours')
    },
    underground: club.location?.parking?.underground ? {
      name: club.location.parking.underground.name,
      distance: club.location.parking.underground.distance,
      price: club.location.parking.underground.price,
      capacity: club.location.parking.underground.capacity,
      workingHours: club.location.parking.underground.workingHours || '24/7'
    } : null,
    free: club.location?.parking?.free ? {
      location: club.location.parking.free.location,
      distance: club.location.parking.free.distance,
      note: club.location.parking.free.note
    } : {
      location: t('clubs.CulturalLocation.parking.free.defaultLocation'),
      distance: t('clubs.CulturalLocation.parking.free.defaultDistance'),
      note: t('clubs.CulturalLocation.parking.free.defaultNote')
    }
  });

  const parkingInfo = getParkingInfo();

  const getAccessibilityFeatures = () => [
    {
      feature: t('clubs.CulturalLocation.accessibility.wheelchair.name'),
      available: venue.accessibility,
      icon: faWheelchair,
      description: venue.accessibility ? 
        club.location?.accessibility?.wheelchair || t('clubs.CulturalLocation.accessibility.wheelchair.available') : 
        t('clubs.CulturalLocation.accessibility.wheelchair.limited')
    },
    {
      feature: t('clubs.CulturalLocation.accessibility.elevator.name'),
      available: club.location?.accessibility?.elevator !== false,
      icon: faElevator,
      description: club.location?.accessibility?.elevatorDescription || 
        (club.location?.accessibility?.elevator !== false ? 
          t('clubs.CulturalLocation.accessibility.elevator.available') : 
          t('clubs.CulturalLocation.accessibility.elevator.unavailable'))
    },
    {
      feature: t('clubs.CulturalLocation.accessibility.safety.name'),
      available: true,
      icon: faStairs,
      description: club.location?.accessibility?.safety || t('clubs.CulturalLocation.accessibility.safety.basic')
    }
  ];

  const accessibilityFeatures = getAccessibilityFeatures();

  useEffect(() => {
    setMapLoaded(true);
  }, []);

  const handleDirections = (transport) => {
    const coords = `${location.coordinates.lat},${location.coordinates.lng}`;
    
    switch(transport) {
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
        alert(t('clubs.CulturalLocation.actions.openingMap'));
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: t('clubs.CulturalLocation.share.title', { clubName: club.name }),
        text: `${location.address}, ${location.city}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(`${location.address}, ${location.city}`);
      alert(t('clubs.CulturalLocation.actions.addressCopied'));
    }
  };

  const handleCall = () => {
    const phone = club.contacts?.phone;
    if (phone) {
      window.location.href = `tel:${phone}`;
    } else {
      alert(t('clubs.CulturalLocation.actions.noPhone'));
    }
  };

  return (
    <section id="cultural-location" className="cultural-location-main-section">
      <div className="cultural-location-container">
        
        <div className="cultural-location-header">
          <div className="cultural-location-badge">
            <FontAwesomeIcon icon={faMapMarkerAlt} />
            <span>{t('clubs.CulturalLocation.header.badge')}</span>
          </div>
          <h2 className="cultural-location-title">{t('clubs.CulturalLocation.header.title')}</h2>
          <p className="cultural-location-subtitle">
            {t('clubs.CulturalLocation.header.subtitle')}
          </p>
        </div>

        <div className="cultural-location-quick-info">
          <div className="cultural-location-address-card">
            <div className="cultural-location-address-icon">
              <FontAwesomeIcon icon={faMapMarkerAlt} />
            </div>
            <div className="cultural-location-address-info">
              <h3>{club.name}</h3>
              <div className="cultural-location-full-address">
                <div>{location.address}</div>
                {location.city && <div>{location.city} {location.postalCode}</div>}
                {location.region && <div>{location.region}</div>}
              </div>
            </div>
            <div className="cultural-location-address-actions">
              <button 
                className="cultural-location-action-btn"
                onClick={() => handleDirections('google')}
              >
                <FontAwesomeIcon icon={faDirections} />
                {t('clubs.CulturalLocation.actions.route')}
              </button>
              <button 
                className="cultural-location-action-btn"
                onClick={handleShare}
              >
                <FontAwesomeIcon icon={faShareAlt} />
                {t('clubs.CulturalLocation.actions.share')}
              </button>
            </div>
          </div>
        </div>

        <div className="cultural-location-tabs">
          <button
            className={`cultural-location-tab ${activeTab === 'map' ? 'active' : ''}`}
            onClick={() => setActiveTab('map')}
          >
            <FontAwesomeIcon icon={faMapMarkerAlt} />
            {t('clubs.CulturalLocation.tabs.map')}
          </button>
          <button
            className={`cultural-location-tab ${activeTab === 'transport' ? 'active' : ''}`}
            onClick={() => setActiveTab('transport')}
          >
            <FontAwesomeIcon icon={faBus} />
            {t('clubs.CulturalLocation.tabs.transport')}
          </button>
          <button
            className={`cultural-location-tab ${activeTab === 'parking' ? 'active' : ''}`}
            onClick={() => setActiveTab('parking')}
          >
            <FontAwesomeIcon icon={faParking} />
            {t('clubs.CulturalLocation.tabs.parking')}
          </button>
          {nearbyPlaces.length > 0 && (
            <button
              className={`cultural-location-tab ${activeTab === 'nearby' ? 'active' : ''}`}
              onClick={() => setActiveTab('nearby')}
            >
              <FontAwesomeIcon icon={faCompass} />
              {t('clubs.CulturalLocation.tabs.nearby')}
            </button>
          )}
        </div>

        <div className="cultural-location-content">
          
          {activeTab === 'map' && (
            <div className="cultural-location-map-section">
              <div className="cultural-location-map-container">
                {mapLoaded && (
                  <MapContainer
                    center={[location.coordinates.lat, location.coordinates.lng]}
                    zoom={16}
                    style={{ height: '400px', width: '100%' }}
                    className="cultural-location-leaflet-map"
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    
                    <Marker 
                      position={[location.coordinates.lat, location.coordinates.lng]}
                      icon={clubIcon}
                    >
                      <Popup>
                        <div className="cultural-location-popup">
                          <h4>{club.name}</h4>
                          <p>{location.address}</p>
                          {location.city && <p>{location.city}</p>}
                          <div className="cultural-location-popup-actions">
                            <button onClick={() => handleDirections('google')}>
                              <FontAwesomeIcon icon={faDirections} />
                              {t('clubs.CulturalLocation.actions.route')}
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
                        icon={place.icon}
                      >
                        <Popup>
                          <div className="cultural-location-popup">
                            <h4>{place.name}</h4>
                            <p>{place.description}</p>
                            <p><strong>{t('clubs.CulturalLocation.map.distance')}:</strong> {place.distance}</p>
                          </div>
                        </Popup>
                      </Marker>
                    ))}

                    <Circle
                      center={[location.coordinates.lat, location.coordinates.lng]}
                      radius={200}
                      color="#10b981"
                      fillColor="#10b981"
                      fillOpacity={0.1}
                      weight={2}
                    >
                      <Tooltip>
                        {t('clubs.CulturalLocation.map.walkingRadius')}
                      </Tooltip>
                    </Circle>
                  </MapContainer>
                )}
                
                <div className="cultural-location-map-controls">
                  <div className="cultural-location-map-legend">
                    <div className="cultural-location-legend-item">
                      <div className="cultural-location-legend-icon club"></div>
                      <span>{t('clubs.CulturalLocation.map.legend.club')}</span>
                    </div>
                    {nearbyPlaces.some(p => p.type === 'hospital') && (
                      <div className="cultural-location-legend-item">
                        <div className="cultural-location-legend-icon hospital"></div>
                        <span>{t('clubs.CulturalLocation.map.legend.healthcare')}</span>
                      </div>
                    )}
                    {nearbyPlaces.some(p => p.type === 'transport') && (
                      <div className="cultural-location-legend-item">
                        <div className="cultural-location-legend-icon transport"></div>
                        <span>{t('clubs.CulturalLocation.map.legend.transport')}</span>
                      </div>
                    )}
                    {nearbyPlaces.some(p => p.type === 'parking') && (
                      <div className="cultural-location-legend-item">
                        <div className="cultural-location-legend-icon parking"></div>
                        <span>{t('clubs.CulturalLocation.map.legend.parking')}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="cultural-location-map-actions">
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
              
              <div className="cultural-location-venue-info">
                <h3>{t('clubs.CulturalLocation.venue.title')}</h3>
                <div className="cultural-location-venue-details">
                  <div className="cultural-location-venue-item">
                    <FontAwesomeIcon icon={faInfoCircle} />
                    <span>{t('clubs.CulturalLocation.venue.type')}: {getVenueTypeTranslation(venue.type)}</span>
                  </div>
                  {venue.size !== t('clubs.CulturalLocation.venue.noSize') && (
                    <div className="cultural-location-venue-item">
                      <FontAwesomeIcon icon={faExpand} />
                      <span>{t('clubs.CulturalLocation.venue.area')}: {venue.size}</span>
                    </div>
                  )}
                  {venue.capacity !== t('clubs.CulturalLocation.venue.noCapacity') && (
                    <div className="cultural-location-venue-item">
                      <FontAwesomeIcon icon={faUsers} />
                      <span>{t('clubs.CulturalLocation.venue.capacity')}: {venue.capacity} {t('clubs.CulturalLocation.units.people')}</span>
                    </div>
                  )}
                </div>
                
                {venue.facilities && venue.facilities.length > 0 && (
                  <div className="cultural-location-facilities">
                    <h4>{t('clubs.CulturalLocation.venue.facilities')}</h4>
                    <div className="cultural-location-facilities-list">
                      {venue.facilities.map((facility, index) => (
                        <span key={index} className="cultural-location-facility-tag">
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
            <div className="cultural-location-transport-section">
              <div className="cultural-location-transport-options">
                {transportOptions.map(option => (
                  <div 
                    key={option.id}
                    className={`cultural-location-transport-card ${
                      selectedTransport === option.id ? 'selected' : ''
                    }`}
                    onClick={() => setSelectedTransport(option.id)}
                  >
                    <div 
                      className="cultural-location-transport-icon"
                      style={{ background: option.color }}
                    >
                      <FontAwesomeIcon icon={option.icon} />
                    </div>
                    <div className="cultural-location-transport-info">
                      <h4>{option.name}</h4>
                      <p>{option.description}</p>
                      <span className="cultural-location-transport-duration">{option.duration}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="cultural-location-transport-details">
                {transportOptions
                  .filter(option => option.id === selectedTransport)
                  .map(option => (
                    <div key={option.id} className="cultural-location-instructions">
                      <div className="cultural-location-instructions-header">
                        <FontAwesomeIcon icon={option.icon} style={{ color: option.color }} />
                        <h3>{t('clubs.CulturalLocation.transport.instructionsTitle', { method: option.name })}</h3>
                      </div>
                      <ul className="cultural-location-instructions-list">
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
            <div className="cultural-location-parking-section">
              <div className="cultural-location-parking-grid">
                <div className="cultural-location-parking-card">
                  <div className="cultural-location-parking-header">
                    <FontAwesomeIcon icon={faRoad} />
                    <h3>{t('clubs.CulturalLocation.parking.street.title')}</h3>
                  </div>
                  <div className="cultural-location-parking-details">
                    <div className="cultural-location-parking-item">
                      <span className="cultural-location-parking-label">{t('clubs.CulturalLocation.parking.type')}:</span>
                      <span>{parkingInfo.street.type}</span>
                    </div>
                    <div className="cultural-location-parking-item">
                      <span className="cultural-location-parking-label">{t('clubs.CulturalLocation.parking.price')}:</span>
                      <span>{parkingInfo.street.price}</span>
                    </div>
                    <div className="cultural-location-parking-item">
                      <span className="cultural-location-parking-label">{t('clubs.CulturalLocation.parking.maxTime')}:</span>
                      <span>{parkingInfo.street.maxTime}</span>
                    </div>
                    <div className="cultural-location-parking-item">
                      <span className="cultural-location-parking-label">{t('clubs.CulturalLocation.parking.workingHours')}:</span>
                      <span>{parkingInfo.street.workingHours}</span>
                    </div>
                  </div>
                </div>
                
                {parkingInfo.underground && (
                  <div className="cultural-location-parking-card">
                    <div className="cultural-location-parking-header">
                      <FontAwesomeIcon icon={faParking} />
                      <h3>{t('clubs.CulturalLocation.parking.underground.title')}</h3>
                    </div>
                    <div className="cultural-location-parking-details">
                      <div className="cultural-location-parking-item">
                        <span className="cultural-location-parking-label">{t('clubs.CulturalLocation.parking.name')}:</span>
                        <span>{parkingInfo.underground.name}</span>
                      </div>
                      <div className="cultural-location-parking-item">
                        <span className="cultural-location-parking-label">{t('clubs.CulturalLocation.parking.distance')}:</span>
                        <span>{parkingInfo.underground.distance}</span>
                      </div>
                      <div className="cultural-location-parking-item">
                        <span className="cultural-location-parking-label">{t('clubs.CulturalLocation.parking.price')}:</span>
                        <span>{parkingInfo.underground.price}</span>
                      </div>
                      <div className="cultural-location-parking-item">
                        <span className="cultural-location-parking-label">{t('clubs.CulturalLocation.parking.capacity')}:</span>
                        <span>{parkingInfo.underground.capacity}</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="cultural-location-parking-card">
                  <div className="cultural-location-parking-header">
                    <FontAwesomeIcon icon={faLocationArrow} />
                    <h3>{t('clubs.CulturalLocation.parking.free.title')}</h3>
                  </div>
                  <div className="cultural-location-parking-details">
                    <div className="cultural-location-parking-item">
                      <span className="cultural-location-parking-label">{t('clubs.CulturalLocation.parking.location')}:</span>
                      <span>{parkingInfo.free.location}</span>
                    </div>
                    <div className="cultural-location-parking-item">
                      <span className="cultural-location-parking-label">{t('clubs.CulturalLocation.parking.distance')}:</span>
                      <span>{parkingInfo.free.distance}</span>
                    </div>
                    <div className="cultural-location-parking-note">
                      <FontAwesomeIcon icon={faInfoCircle} />
                      <span>{parkingInfo.free.note}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'nearby' && nearbyPlaces.length > 0 && (
            <div className="cultural-location-nearby-section">
              <div className="cultural-location-nearby-grid">
                {nearbyPlaces.map((place, index) => (
                  <div key={index} className="cultural-location-nearby-card">
                    <div className="cultural-location-nearby-icon">
                      <FontAwesomeIcon icon={
                        place.type === 'hospital' ? faHospital :
                        place.type === 'transport' ? faBusStop :
                        place.type === 'parking' ? faParking :
                        place.type === 'restaurant' ? faUtensils :
                        place.type === 'shopping' ? faShoppingCart :
                        place.type === 'gas' ? faGasPump :
                        faMapMarkerAlt
                      } />
                    </div>
                    <div className="cultural-location-nearby-info">
                      <h4>{place.name}</h4>
                      <p>{place.description}</p>
                      <span className="cultural-location-nearby-distance">{place.distance}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {(venue.accessibility || club.location?.accessibility) && (
          <div className="cultural-location-accessibility">
            <div className="cultural-location-accessibility-header">
              <FontAwesomeIcon icon={faWheelchair} />
              <h3>{t('clubs.CulturalLocation.accessibility.title')}</h3>
              <p>{t('clubs.CulturalLocation.accessibility.subtitle')}</p>
            </div>
            
            <div className="cultural-location-accessibility-grid">
              {accessibilityFeatures.map((feature, index) => (
                <div key={index} className="cultural-location-accessibility-item">
                  <div className={`cultural-location-accessibility-status ${
                    feature.available ? 'available' : 'unavailable'
                  }`}>
                    <FontAwesomeIcon icon={feature.icon} />
                  </div>
                  <div className="cultural-location-accessibility-details">
                    <h4>{feature.feature}</h4>
                    <p>{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="cultural-location-help">
          <div className="cultural-location-help-content">
            <h3>{t('clubs.CulturalLocation.help.title')}</h3>
            <p>{t('clubs.CulturalLocation.help.subtitle')}</p>
            <div className="cultural-location-help-buttons">
              {club.contacts?.phone && (
                <button className="cultural-location-help-btn primary" onClick={handleCall}>
                  <FontAwesomeIcon icon={faPhone} />
                  {t('clubs.CulturalLocation.help.call')}: {club.contacts.phone}
                </button>
              )}
              <button 
                className="cultural-location-help-btn secondary"
                onClick={() => handleDirections('google')}
              >
                <FontAwesomeIcon icon={faDirections} />
                {t('clubs.CulturalLocation.help.realTimeNavigation')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CulturalLocation;