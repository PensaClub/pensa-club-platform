// components/SportsLocation/SportsLocation.jsx
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

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom sports club icon
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
  const [activeTab, setActiveTab] = useState('map');
  const [selectedTransport, setSelectedTransport] = useState('running');
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

  // Default координати ако няма реални
  const coordinates = location.coordinates || { lat: 42.6777, lng: 23.3219 };
  const venue = location.venue || {};

  // Извличаме реални близки места САМО ако има такива данни
  const nearbyPlaces = club.location?.nearbyPlaces || [];

  const sportsTransportOptions = [
    {
      id: 'running',
      name: 'Бягане',
      icon: faRunning,
      color: '#ef4444',
      duration: '10-20 мин',
      description: 'Активно пристигане',
      instructions: [
        'Отлична кардио тренировка преди клуба',
        'Използвайте безопасни пешеходни зони',
        'Носете спортни дрехи и обувки',
        'Планирайте маршрут през парковете'
      ]
    },
    {
      id: 'cycling',
      name: 'Колоездене',
      icon: faBicycle,
      color: '#10b981',
      duration: '5-15 мин',
      description: 'Еко и здравословно',
      instructions: [
        'Проверете велосипедните алеи',
        'Носете каска за безопасност',
        'Търсете места за заключване на велосипеда',
        'Следвайте правилата за движение'
      ]
    },
    {
      id: 'walking',
      name: 'Спортна разходка',
      icon: faWalking,
      color: '#059669',
      duration: '15-25 мин',
      description: 'Загряване преди тренировка',
      instructions: [
        'Бърза спортна разходка като загряване',
        'Използвайте удобни спортни обувки',
        'Правете разтягания по пътя',
        'Хидратирайте се добре'
      ]
    },
    {
      id: 'bus',
      name: 'Градски транспорт',
      icon: faBus,
      color: '#3b82f6',
      duration: '15-30 мин',
      description: 'Удобен достъп',
      instructions: [
        'Проверете разписанията на автобусите',
        'Използвайте спортна чанта за удобство',
        'Планирайте времето за пристигане',
        'Запазете енергия за тренировката'
      ]
    },
    {
      id: 'car',
      name: 'Автомобил',
      icon: faCar,
      color: '#8b5cf6',
      duration: '10-40 мин',
      description: 'Бърз достъп',
      instructions: [
        'Потърсете близо паркиране',
        'Проверете за спортни съоръжения наблизо',
        'Използвайте GPS за най-бързия път',
        'Носете спортната си екипировка в колата'
      ]
    }
  ];

  const sportsParkingInfo = {
    sports: {
      type: 'Спортен комплекс паркинг',
      price: 'Обикновено безплатен',
      maxTime: 'Според тренировките',
      workingHours: 'Според работното време на комплекса',
      features: ['Охрана', 'Видеонаблюдение', 'Близо до съблекални']
    },
    street: {
      type: 'Улично паркиране',
      price: 'Според зоната',
      maxTime: 'Според регулациите',
      workingHours: 'Проверете пътните знаци',
      features: ['Различни зони', 'Променливи цени', 'Ограничено време']
    },
    underground: {
      type: 'Подземен паркинг',
      price: 'Платен',
      maxTime: 'Без ограничение',
      workingHours: '24/7',
      features: ['Сигурност', 'Защита от времето', 'Резервация възможна']
    }
  };

  const sportsAccessibilityFeatures = [
    {
      feature: 'Спортен достъп с инвалидна количка',
      available: venue.accessibility !== false,
      icon: faWheelchair,
      description: venue.accessibility !== false ? 'Адаптирани спортни съоръжения' : 'Ограничен спортен достъп'
    },
    {
      feature: 'Фитнес лифт',
      available: venue.elevatorAccess !== false,
      icon: faElevator,
      description: 'Лесен достъп до всички етажи на спортния комплекс'
    },
    {
      feature: 'Спортни стълби',
      available: true,
      icon: faStairs,
      description: 'Стълбите също са част от тренировката!'
    },
    {
      feature: 'Безопасни зони',
      available: true,
      icon: faHeartbeat,
      description: 'Медицинска помощ и безопасност по време на тренировки'
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
    <section id="sports-location" className="sports-location-main-section">
      <div className="sports-location-container">
        
        {/* Header */}
        <div className="sports-location-header">
          <div className="sports-location-badge">
            <FontAwesomeIcon icon={faFlag} />
            <span>Дестинация</span>
          </div>
          <h2 className="sports-location-title">
            <FontAwesomeIcon icon={faBolt} className="sports-location-title-icon" />
            Къде тренираме
          </h2>
          <p className="sports-location-subtitle">
            Намерете най-бързия и най-активния път до вашия спортен клуб
          </p>
        </div>

        {/* Quick Sports Info */}
        <div className="sports-location-quick-info">
          <div className="sports-location-address-card">
            <div className="sports-location-address-icon">
              <FontAwesomeIcon icon={faDumbbell} />
              <div className="sports-location-icon-pulse"></div>
            </div>
            <div className="sports-location-address-info">
              <h3>
                <FontAwesomeIcon icon={faTrophy} />
                Нашия спортен център
              </h3>
              <div className="sports-location-full-address">
                {location.address && <div>{location.address}</div>}
                {location.city && <div>{location.city}{location.postalCode && ` ${location.postalCode}`}</div>}
                {location.region && <div>{location.region}</div>}
                {!location.address && <div>Адресът ще бъде обявен скоро</div>}
              </div>
              <div className="sports-location-venue-type">
                <FontAwesomeIcon icon={faFire} />
                <span>{venue.type === 'sports_complex' ? 'Спортен комплекс' : 'Спортно съоръжение'}</span>
              </div>
            </div>
            <div className="sports-location-address-actions">
              <button 
                className="sports-location-action-btn primary"
                onClick={() => handleDirections('google')}
              >
                <FontAwesomeIcon icon={faDirections} />
                <span>Навигация</span>
                <div className="sports-location-btn-energy"></div>
              </button>
              <button 
                className="sports-location-action-btn secondary"
                onClick={handleShare}
              >
                <FontAwesomeIcon icon={faShareAlt} />
                Споделяне
              </button>
              {location.address && (
                <button 
                  className={`sports-location-copy-btn ${copiedItems['address'] ? 'copied' : ''}`}
                  onClick={() => copyToClipboard(`${location.address}, ${location.city || ''}`, 'address')}
                >
                  <FontAwesomeIcon icon={copiedItems['address'] ? faCheckCircle : faCopy} />
                  {copiedItems['address'] ? 'Копирано!' : 'Копирай'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sports Tabs */}
        <div className="sports-location-tabs">
          <button
            className={`sports-location-tab ${activeTab === 'map' ? 'active' : ''}`}
            onClick={() => setActiveTab('map')}
          >
            <FontAwesomeIcon icon={faMapMarkerAlt} />
            <span>Карта</span>
            <div className="sports-location-tab-energy"></div>
          </button>
          <button
            className={`sports-location-tab ${activeTab === 'transport' ? 'active' : ''}`}
            onClick={() => setActiveTab('transport')}
          >
            <FontAwesomeIcon icon={faRunning} />
            <span>Активен транспорт</span>
            <div className="sports-location-tab-energy"></div>
          </button>
          <button
            className={`sports-location-tab ${activeTab === 'parking' ? 'active' : ''}`}
            onClick={() => setActiveTab('parking')}
          >
            <FontAwesomeIcon icon={faParking} />
            <span>Паркиране</span>
            <div className="sports-location-tab-energy"></div>
          </button>
          {nearbyPlaces.length > 0 && (
            <button
              className={`sports-location-tab ${activeTab === 'nearby' ? 'active' : ''}`}
              onClick={() => setActiveTab('nearby')}
            >
              <FontAwesomeIcon icon={faCompass} />
              <span>Спортни обекти</span>
              <div className="sports-location-tab-energy"></div>
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div className="sports-location-content">
          
          {/* Map Tab */}
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
                    
                    {/* Main sports club marker */}
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
                              Навигация
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

                    {/* Nearby places markers */}
                    {nearbyPlaces.map((place, index) => (
                      <Marker 
                        key={index}
                        position={[place.coordinates.lat, place.coordinates.lng]}
                      >
                        <Popup>
                          <div className="sports-location-popup">
                            <h4>{place.name}</h4>
                            <p>{place.description}</p>
                            {place.distance && <p><strong>Разстояние:</strong> {place.distance}</p>}
                          </div>
                        </Popup>
                      </Marker>
                    ))}

                    {/* Sports training radius circle */}
                    <Circle
                      center={[coordinates.lat, coordinates.lng]}
                      radius={500}
                      color="#3b82f6"
                      fillColor="#3b82f6"
                      fillOpacity={0.1}
                      weight={3}
                    >
                      <Tooltip>
                        500м спортна зона
                      </Tooltip>
                    </Circle>
                  </MapContainer>
                )}
                
                <div className="sports-location-map-controls">
                  <div className="sports-location-map-legend">
                    <div className="sports-location-legend-item">
                      <div className="sports-location-legend-icon sports-club"></div>
                      <span>Спортен клуб</span>
                    </div>
                    <div className="sports-location-legend-item">
                      <div className="sports-location-legend-icon training-zone"></div>
                      <span>Тренировъчна зона</span>
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
                  <h3>Спортни съоръжения</h3>
                </div>
                <div className="sports-location-venue-details">
                  {venue.type && (
                    <div className="sports-location-venue-item">
                      <FontAwesomeIcon icon={faInfoCircle} />
                      <span>Тип: {venue.type === 'sports_complex' ? 'Спортен комплекс' : venue.type}</span>
                    </div>
                  )}
                  {venue.size && (
                    <div className="sports-location-venue-item">
                      <FontAwesomeIcon icon={faMapSigns} />
                      <span>Площ: {venue.size}</span>
                    </div>
                  )}
                  {venue.capacity && (
                    <div className="sports-location-venue-item">
                      <FontAwesomeIcon icon={faUsers} />
                      <span>Капацитет: {venue.capacity} спортисти</span>
                    </div>
                  )}
                  
                  {!venue.type && !venue.size && !venue.capacity && (
                    <>
                      <div className="sports-location-venue-item">
                        <FontAwesomeIcon icon={faDumbbell} />
                        <span>Модерен спортен център</span>
                      </div>
                      <div className="sports-location-venue-item">
                        <FontAwesomeIcon icon={faUsers} />
                        <span>Подходящ за всички възрасти</span>
                      </div>
                    </>
                  )}
                </div>
                
                {venue.facilities && venue.facilities.length > 0 && (
                  <div className="sports-location-facilities">
                    <h4>
                      <FontAwesomeIcon icon={faTrophy} />
                      Спортни удобства
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

          {/* Transport Tab */}
          {activeTab === 'transport' && (
            <div className="sports-location-transport-section">
              <div className="sports-location-transport-header">
                <FontAwesomeIcon icon={faHeartbeat} />
                <h3>Изберете вашия активен начин</h3>
                <p>Всеки път до клуба може да бъде част от тренировката!</p>
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
                        <h3>Спортни съвети за {option.name}</h3>
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

          {/* Parking Tab */}
          {activeTab === 'parking' && (
            <div className="sports-location-parking-section">
              <div className="sports-location-parking-header">
                <FontAwesomeIcon icon={faParking} />
                <h3>Паркиране за спортисти</h3>
                <p>Информация за паркиране в близост до спортния комплекс</p>
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
                        <span className="sports-location-parking-label">Цена:</span>
                        <span>{parking.price}</span>
                      </div>
                      <div className="sports-location-parking-item">
                        <span className="sports-location-parking-label">Максимално време:</span>
                        <span>{parking.maxTime}</span>
                      </div>
                      <div className="sports-location-parking-item">
                        <span className="sports-location-parking-label">Работно време:</span>
                        <span>{parking.workingHours}</span>
                      </div>
                      
                      <div className="sports-location-parking-features">
                        <h4>Предимства:</h4>
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

          {/* Nearby Tab */}
          {activeTab === 'nearby' && nearbyPlaces.length > 0 && (
            <div className="sports-location-nearby-section">
              <div className="sports-location-nearby-header">
                <FontAwesomeIcon icon={faCompass} />
                <h3>Спортни обекти в района</h3>
                <p>Други спортни възможности в близост до нашия клуб</p>
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

        {/* Sports Accessibility */}
        <div className="sports-location-accessibility">
          <div className="sports-location-accessibility-header">
            <FontAwesomeIcon icon={faHeartbeat} />
            <h3>Спортна достъпност</h3>
            <p>Информация за достъпността на спортните съоръжения</p>
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

        {/* Sports Help */}
        <div className="sports-location-help">
          <div className="sports-location-help-content">
            <FontAwesomeIcon icon={faTrophy} className="sports-location-help-trophy" />
            <h3>Готови за тренировка?</h3>
            <p>Ако имате въпроси за достъпа до спортния комплекс или се нуждаете от помощ</p>
            <div className="sports-location-help-buttons">
              {contacts.phone && (
                <button 
                  className="sports-location-help-btn primary"
                  onClick={() => handleCallPhone(contacts.phone)}
                >
                  <FontAwesomeIcon icon={faPhone} />
                  Обадете се: {contacts.phone}
                  <div className="sports-location-btn-energy"></div>
                </button>
              )}
              <button 
                className="sports-location-help-btn secondary"
                onClick={() => handleDirections('google')}
              >
                <FontAwesomeIcon icon={faDirections} />
                Навигация в реално време
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