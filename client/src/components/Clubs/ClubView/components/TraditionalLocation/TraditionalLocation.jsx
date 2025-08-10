import { useState, useEffect } from 'react';
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

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icon for club
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
  const [activeTab, setActiveTab] = useState('map');
  const [selectedTransport, setSelectedTransport] = useState('walking');
  const [mapLoaded, setMapLoaded] = useState(false);
  const [copiedItems, setCopiedItems] = useState({});

  // Проверяваме дали има необходимите данни
  if (!club?.name) {
    return null;
  }

  // Извличаме САМО реални данни от клуба
  const location = club.location || {};
  const contacts = club.contacts || {};

  // Проверяваме дали има РЕАЛНО съдържание за показване
  const hasLocationContent = 
    location.address ||
    location.city ||
    location.coordinates ||
    contacts.phone ||
    contacts.email;

  if (!hasLocationContent) {
    return null;
  }

  // Default координати ако няма реални (само за показване на картата)
  const coordinates = location.coordinates || { lat: 42.6777, lng: 23.3219 };
  const venue = location.venue || {};

  // Извличаме реални близки места САМО ако има такива данни в club обекта
  const nearbyPlaces = club.location?.nearbyPlaces || [];

  const transportOptions = [
    {
      id: 'walking',
      name: 'Пеша',
      icon: faWalking,
      color: '#059669',
      duration: '5-15 мин',
      description: 'От центъра на града',
      instructions: [
        'От градския център - 10 минути пеша',
        'Следвайте главната улица',
        'Търсете указателните табели'
      ]
    },
    {
      id: 'bus',
      name: 'Автобус',
      icon: faBus,
      color: '#3b82f6',
      duration: '15-25 мин',
      description: 'Градски транспорт',
      instructions: [
        'Използвайте градския транспорт',
        'Проверете разписанието на спирките',
        'Следвайте указанията за посока'
      ]
    },
    {
      id: 'metro',
      name: 'Метро',
      icon: faSubway,
      color: '#ef4444',
      duration: '20-30 мин',
      description: 'Бърз градски транспорт',
      instructions: [
        'Използвайте метрото ако има станция наблизо',
        'Проверете картата на метрото',
        'Планирайте най-краткия маршрут'
      ]
    },
    {
      id: 'car',
      name: 'Автомобил',
      icon: faCar,
      color: '#8b5cf6',
      duration: '10-40 мин',
      description: 'В зависимост от трафика',
      instructions: [
        'Проверете за места за паркиране',
        'Използвайте GPS навигация',
        'Внимавайте за ограниченията в движението'
      ]
    }
  ];

  const parkingInfo = {
    street: {
      type: 'Улично паркиране',
      price: 'Според местните такси',
      maxTime: 'Според регулациите',
      workingHours: 'Проверете местните знаци'
    },
    paid: {
      name: 'Платени паркинги в района',
      distance: 'Различни разстояния',
      price: 'Според тарифите',
      capacity: 'Различен капацитет',
      workingHours: 'Различно работно време'
    },
    free: {
      location: 'Улици в района',
      distance: 'Различни разстояния',
      note: 'Търсете безплатни места наоколо'
    }
  };

  const accessibilityFeatures = [
    {
      feature: 'Достъп с инвалидна количка',
      available: venue.accessibility !== false,
      icon: faWheelchair,
      description: venue.accessibility !== false ? 'Проверете на място за достъпност' : 'Ограничен достъп'
    },
    {
      feature: 'Удобен вход',
      available: true,
      icon: faStairs,
      description: 'Проверете условията на място'
    },
    {
      feature: 'Обществен достъп',
      available: true,
      icon: faElevator,
      description: 'Отворен за посетители според работното време'
    }
  ];

  useEffect(() => {
    setMapLoaded(true);
  }, []);

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

  const handleDirections = (platform) => {
    const coords = `${coordinates.lat},${coordinates.lng}`;
    const address = encodeURIComponent(`${location.address || 'адрес не е посочен'}, ${location.city || 'България'}`);
    
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
        alert('Отваряне на карта...');
    }
  };

  const handleShare = () => {
    const locationText = `${location.address || 'Адресът не е посочен'}, ${location.city || ''}`;
    if (navigator.share) {
      navigator.share({
        title: `Локация на ${club.name}`,
        text: locationText,
        url: window.location.href
      });
    } else {
      copyToClipboard(locationText, 'share');
      alert('Адресът е копиран в клипборда!');
    }
  };

  const handleCallPhone = (phone) => {
    window.open(`tel:${phone}`);
  };

  return (
    <section id="traditional-location" className="traditional-location-main-section">
      <div className="traditional-location-container">
        
        {/* Header */}
        <div className="traditional-location-header">
          <div className="traditional-location-badge">
            <FontAwesomeIcon icon={faMapMarkerAlt} />
            <span>Местоположение</span>
          </div>
          <h2 className="traditional-location-title">Къде ни намирате</h2>
          <p className="traditional-location-subtitle">
            Подробна информация за локацията, транспорт и удобства
          </p>
        </div>

        {/* Quick Info */}
        <div className="traditional-location-quick-info">
          <div className="traditional-location-address-card">
            <div className="traditional-location-address-icon">
              <FontAwesomeIcon icon={faMapMarkerAlt} />
            </div>
            <div className="traditional-location-address-info">
              <h3>Нашият адрес</h3>
              <div className="traditional-location-full-address">
                {location.address && <div>{location.address}</div>}
                {location.city && <div>{location.city}{location.postalCode && ` ${location.postalCode}`}</div>}
                {location.region && <div>{location.region}</div>}
                {!location.address && <div>Адресът ще бъде обявен скоро</div>}
              </div>
            </div>
            <div className="traditional-location-address-actions">
              <button 
                className="traditional-location-action-btn primary"
                onClick={() => handleDirections('google')}
              >
                <FontAwesomeIcon icon={faDirections} />
                Маршрут
              </button>
              <button 
                className="traditional-location-action-btn secondary"
                onClick={handleShare}
              >
                <FontAwesomeIcon icon={faShareAlt} />
                Споделяне
              </button>
              {location.address && (
                <button 
                  className={`traditional-location-copy-btn ${copiedItems['address'] ? 'copied' : ''}`}
                  onClick={() => copyToClipboard(`${location.address}, ${location.city || ''}`, 'address')}
                >
                  <FontAwesomeIcon icon={copiedItems['address'] ? faCheckCircle : faCopy} />
                  {copiedItems['address'] ? 'Копирано!' : 'Копирай'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Tabs */}
        <div className="traditional-location-tabs">
          <button
            className={`traditional-location-tab ${activeTab === 'map' ? 'active' : ''}`}
            onClick={() => setActiveTab('map')}
          >
            <FontAwesomeIcon icon={faMapMarkerAlt} />
            Карта
          </button>
          <button
            className={`traditional-location-tab ${activeTab === 'transport' ? 'active' : ''}`}
            onClick={() => setActiveTab('transport')}
          >
            <FontAwesomeIcon icon={faBus} />
            Транспорт
          </button>
          <button
            className={`traditional-location-tab ${activeTab === 'parking' ? 'active' : ''}`}
            onClick={() => setActiveTab('parking')}
          >
            <FontAwesomeIcon icon={faParking} />
            Паркиране
          </button>
          {/* Показваме таба "В района" САМО ако има реални данни */}
          {nearbyPlaces.length > 0 && (
            <button
              className={`traditional-location-tab ${activeTab === 'nearby' ? 'active' : ''}`}
              onClick={() => setActiveTab('nearby')}
            >
              <FontAwesomeIcon icon={faCompass} />
              В района
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div className="traditional-location-content">
          
          {/* Map Tab */}
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
                    
                    {/* Main club marker */}
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
                              Маршрут
                            </button>
                          </div>
                        </div>
                      </Popup>
                      <Tooltip permanent direction="top" offset={[0, -10]}>
                        <strong>{club.name}</strong>
                      </Tooltip>
                    </Marker>

                    {/* САМО реални nearby places markers ако има такива */}
                    {nearbyPlaces.map((place, index) => (
                      <Marker 
                        key={index}
                        position={[place.coordinates.lat, place.coordinates.lng]}
                      >
                        <Popup>
                          <div className="traditional-location-popup">
                            <h4>{place.name}</h4>
                            <p>{place.description}</p>
                            {place.distance && <p><strong>Разстояние:</strong> {place.distance}</p>}
                          </div>
                        </Popup>
                      </Marker>
                    ))}

                    {/* Walking radius circle */}
                    <Circle
                      center={[coordinates.lat, coordinates.lng]}
                      radius={250}
                      color="#059669"
                      fillColor="#059669"
                      fillOpacity={0.1}
                      weight={2}
                    >
                      <Tooltip>
                        250м от клуба
                      </Tooltip>
                    </Circle>
                  </MapContainer>
                )}
                
                <div className="traditional-location-map-controls">
                  <div className="traditional-location-map-legend">
                    <div className="traditional-location-legend-item">
                      <div className="traditional-location-legend-icon club"></div>
                      <span>Клуб</span>
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
                <h3>Информация за мястото</h3>
                <div className="traditional-location-venue-details">
                  {venue.type && (
                    <div className="traditional-location-venue-item">
                      <FontAwesomeIcon icon={faInfoCircle} />
                      <span>Тип: {venue.type === 'municipal' ? 'Общинска сграда' : venue.type}</span>
                    </div>
                  )}
                  {venue.size && (
                    <div className="traditional-location-venue-item">
                      <FontAwesomeIcon icon={faMapSigns} />
                      <span>Площ: {venue.size}</span>
                    </div>
                  )}
                  {venue.capacity && (
                    <div className="traditional-location-venue-item">
                      <FontAwesomeIcon icon={faUsers} />
                      <span>Капацитет: {venue.capacity} души</span>
                    </div>
                  )}
                  
                  {/* Default venue info if none provided */}
                  {!venue.type && !venue.size && !venue.capacity && (
                    <>
                      <div className="traditional-location-venue-item">
                        <FontAwesomeIcon icon={faInfoCircle} />
                        <span>Традиционен културен център</span>
                      </div>
                      <div className="traditional-location-venue-item">
                        <FontAwesomeIcon icon={faUsers} />
                        <span>Подходящ за групови дейности</span>
                      </div>
                    </>
                  )}
                </div>
                
                {venue.facilities && venue.facilities.length > 0 && (
                  <div className="traditional-location-facilities">
                    <h4>Удобства</h4>
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

          {/* Transport Tab */}
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
                        <h3>Инструкции за {option.name}</h3>
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

          {/* Parking Tab */}
          {activeTab === 'parking' && (
            <div className="traditional-location-parking-section">
              <div className="traditional-location-parking-grid">
                <div className="traditional-location-parking-card">
                  <div className="traditional-location-parking-header">
                    <FontAwesomeIcon icon={faRoad} />
                    <h3>Улично паркиране</h3>
                  </div>
                  <div className="traditional-location-parking-details">
                    <div className="traditional-location-parking-item">
                      <span className="traditional-location-parking-label">Тип:</span>
                      <span>{parkingInfo.street.type}</span>
                    </div>
                    <div className="traditional-location-parking-item">
                      <span className="traditional-location-parking-label">Цена:</span>
                      <span>{parkingInfo.street.price}</span>
                    </div>
                    <div className="traditional-location-parking-item">
                      <span className="traditional-location-parking-label">Максимално време:</span>
                      <span>{parkingInfo.street.maxTime}</span>
                    </div>
                    <div className="traditional-location-parking-item">
                      <span className="traditional-location-parking-label">Работно време:</span>
                      <span>{parkingInfo.street.workingHours}</span>
                    </div>
                  </div>
                </div>
                
                <div className="traditional-location-parking-card">
                  <div className="traditional-location-parking-header">
                    <FontAwesomeIcon icon={faParking} />
                    <h3>Платени паркинги</h3>
                  </div>
                  <div className="traditional-location-parking-details">
                    <div className="traditional-location-parking-item">
                      <span className="traditional-location-parking-label">Тип:</span>
                      <span>{parkingInfo.paid.name}</span>
                    </div>
                    <div className="traditional-location-parking-item">
                      <span className="traditional-location-parking-label">Разстояние:</span>
                      <span>{parkingInfo.paid.distance}</span>
                    </div>
                    <div className="traditional-location-parking-item">
                      <span className="traditional-location-parking-label">Цена:</span>
                      <span>{parkingInfo.paid.price}</span>
                    </div>
                    <div className="traditional-location-parking-item">
                      <span className="traditional-location-parking-label">Капацитет:</span>
                      <span>{parkingInfo.paid.capacity}</span>
                    </div>
                  </div>
                </div>
                
                <div className="traditional-location-parking-card">
                  <div className="traditional-location-parking-header">
                    <FontAwesomeIcon icon={faLocationArrow} />
                    <h3>Безплатно паркиране</h3>
                  </div>
                  <div className="traditional-location-parking-details">
                    <div className="traditional-location-parking-item">
                      <span className="traditional-location-parking-label">Локация:</span>
                      <span>{parkingInfo.free.location}</span>
                    </div>
                    <div className="traditional-location-parking-item">
                      <span className="traditional-location-parking-label">Разстояние:</span>
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

          {/* Nearby Tab - показва се САМО ако има реални данни */}
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

        {/* Accessibility Section */}
        <div className="traditional-location-accessibility">
          <div className="traditional-location-accessibility-header">
            <FontAwesomeIcon icon={faWheelchair} />
            <h3>Достъпност</h3>
            <p>Информация за хора с увреждания и ограничена подвижност</p>
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

        {/* Contact & Help */}
        <div className="traditional-location-help">
          <div className="traditional-location-help-content">
            <h3>Нужна ви е помощ?</h3>
            <p>Ако имате затруднения с намирането на клуба или ако се нуждаете от допълнителна информация</p>
            <div className="traditional-location-help-buttons">
              {contacts.phone && (
                <button 
                  className="traditional-location-help-btn primary"
                  onClick={() => handleCallPhone(contacts.phone)}
                >
                  <FontAwesomeIcon icon={faPhone} />
                  Обадете се: {contacts.phone}
                </button>
              )}
              <button 
                className="traditional-location-help-btn secondary"
                onClick={() => handleDirections('google')}
              >
                <FontAwesomeIcon icon={faDirections} />
                Навигация в реално време
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TraditionalLocation;