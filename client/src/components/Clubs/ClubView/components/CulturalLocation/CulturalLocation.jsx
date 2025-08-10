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
  const [activeTab, setActiveTab] = useState('map');
  const [selectedTransport, setSelectedTransport] = useState('walking');
  const [mapLoaded, setMapLoaded] = useState(false);

  const location = club.location || {
    address: "ул. Витоша 127, ет. 2",
    city: "София",
    municipality: "Столична",
    region: "София-град",
    postalCode: "1463",
    coordinates: { lat: 42.6777, lng: 23.3219 }
  };

  const venue = club.location?.venue || {
    type: "municipal",
    size: "180 кв.м",
    capacity: 80,
    facilities: ["голяма зала", "кухня", "библиотека", "сцена", "пиано"],
    accessibility: true
  };

  // Nearby places with coordinates
  const nearbyPlaces = [
    {
      name: 'Болница "Софиямед"',
      distance: '200м',
      type: 'hospital',
      icon: hospitalIcon,
      description: 'Спешна медицинска помощ',
      coordinates: { lat: 42.6785, lng: 23.3225 }
    },
    {
      name: 'Автобусна спирка "Житница"',
      distance: '100м',
      type: 'transport',
      icon: busIcon,
      description: 'Линии: 9, 72, 76, 204',
      coordinates: { lat: 42.6770, lng: 23.3215 }
    },
    {
      name: 'Подземен паркинг "Централен"',
      distance: '150м',
      type: 'parking',
      icon: parkingIcon,
      description: '3 лв/час, 200 места',
      coordinates: { lat: 42.6780, lng: 23.3210 }
    }
  ];

  const transportOptions = [
    {
      id: 'walking',
      name: 'Пеша',
      icon: faWalking,
      color: '#10b981',
      duration: '5-15 мин',
      description: 'От центъра на града',
      instructions: [
        'От пл. "Александър Невски" - 8 минути пеша',
        'От бул. "Витоша" - 3 минути пеша',
        'Следвайте указателните табели'
      ]
    },
    {
      id: 'bus',
      name: 'Автобус',
      icon: faBus,
      color: '#3b82f6',
      duration: '10-20 мин',
      description: 'Градски транспорт',
      instructions: [
        'Линии: 9, 72, 76, 204',
        'Спирка: "Житница"',
        'От спирката 2 минути пеша'
      ]
    },
    {
      id: 'metro',
      name: 'Метро',
      icon: faSubway,
      color: '#ef4444',
      duration: '15-25 мин',
      description: 'Най-бързият вариант',
      instructions: [
        'Линия М2 (синя)',
        'Станция "Софийски университет"',
        'От станцията 7 минути пеша'
      ]
    },
    {
      id: 'car',
      name: 'Автомобил',
      icon: faCar,
      color: '#8b5cf6',
      duration: '5-30 мин',
      description: 'В зависимост от трафика',
      instructions: [
        'От Околовръстно шосе - 15 мин',
        'Паркиране: синя зона',
        'Подземен паркинг наблизо'
      ]
    }
  ];

  const parkingInfo = {
    street: {
      type: 'Синя зона',
      price: '2 лв/час',
      maxTime: '2 часа',
      workingHours: 'Пн-Пт: 08:00-19:00'
    },
    underground: {
      name: 'Подземен паркинг "Централен"',
      distance: '150м',
      price: '3 лв/час',
      capacity: '200 места',
      workingHours: '24/7'
    },
    free: {
      location: 'Улици около парк "Борисова градина"',
      distance: '400м',
      note: 'Безплатни места - малко на брой'
    }
  };

  const accessibilityFeatures = [
    {
      feature: 'Достъп с инвалидна количка',
      available: venue.accessibility,
      icon: faWheelchair,
      description: venue.accessibility ? 'Пълен достъп до всички помещения' : 'Ограничен достъп'
    },
    {
      feature: 'Асансьор',
      available: true,
      icon: faElevator,
      description: 'Достъп до втория етаж'
    },
    {
      feature: 'Парапети и опори',
      available: true,
      icon: faStairs,
      description: 'Безопасно движение в сградата'
    }
  ];

  useEffect(() => {
    setMapLoaded(true);
  }, []);

  const handleDirections = (transport) => {
    const coords = `${location.coordinates.lat},${location.coordinates.lng}`;
    const address = encodeURIComponent(`${location.address}, ${location.city}`);
    
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
        alert('Отваряне на карта...');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Локация на ${club.name}`,
        text: `${location.address}, ${location.city}`,
        url: window.location.href
      });
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(`${location.address}, ${location.city}`);
      alert('Адресът е копиран в клипборда!');
    }
  };

  return (
    <section id="club-location" className="cultural-location-main-section">
      <div className="cultural-location-container">
        
        {/* Header */}
        <div className="cultural-location-header">
          <div className="cultural-location-badge">
            <FontAwesomeIcon icon={faMapMarkerAlt} />
            <span>Локация и достъп</span>
          </div>
          <h2 className="cultural-location-title">Как да ни намерите</h2>
          <p className="cultural-location-subtitle">
            Подробна информация за локацията, транспорт и удобства в района
          </p>
        </div>

        {/* Quick Info */}
        <div className="cultural-location-quick-info">
          <div className="cultural-location-address-card">
            <div className="cultural-location-address-icon">
              <FontAwesomeIcon icon={faMapMarkerAlt} />
            </div>
            <div className="cultural-location-address-info">
              <h3>Основен адрес</h3>
              <div className="cultural-location-full-address">
                <div>{location.address}</div>
                <div>{location.city} {location.postalCode}</div>
                <div>{location.region}</div>
              </div>
            </div>
            <div className="cultural-location-address-actions">
              <button 
                className="cultural-location-action-btn"
                onClick={() => handleDirections('google')}
              >
                <FontAwesomeIcon icon={faDirections} />
                Маршрут
              </button>
              <button 
                className="cultural-location-action-btn"
                onClick={handleShare}
              >
                <FontAwesomeIcon icon={faShareAlt} />
                Споделяне
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Tabs */}
        <div className="cultural-location-tabs">
          <button
            className={`cultural-location-tab ${activeTab === 'map' ? 'active' : ''}`}
            onClick={() => setActiveTab('map')}
          >
            <FontAwesomeIcon icon={faMapMarkerAlt} />
            Карта
          </button>
          <button
            className={`cultural-location-tab ${activeTab === 'transport' ? 'active' : ''}`}
            onClick={() => setActiveTab('transport')}
          >
            <FontAwesomeIcon icon={faBus} />
            Транспорт
          </button>
          <button
            className={`cultural-location-tab ${activeTab === 'parking' ? 'active' : ''}`}
            onClick={() => setActiveTab('parking')}
          >
            <FontAwesomeIcon icon={faParking} />
            Паркиране
          </button>
          <button
            className={`cultural-location-tab ${activeTab === 'nearby' ? 'active' : ''}`}
            onClick={() => setActiveTab('nearby')}
          >
            <FontAwesomeIcon icon={faCompass} />
            В района
          </button>
        </div>

        {/* Tab Content */}
        <div className="cultural-location-content">
          
          {/* Map Tab */}
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
                    
                    {/* Main club marker */}
                    <Marker 
                      position={[location.coordinates.lat, location.coordinates.lng]}
                      icon={clubIcon}
                    >
                      <Popup>
                        <div className="cultural-location-popup">
                          <h4>{club.name || 'Клуб "Златна есен"'}</h4>
                          <p>{location.address}</p>
                          <p>{location.city}</p>
                          <div className="cultural-location-popup-actions">
                            <button onClick={() => handleDirections('google')}>
                              <FontAwesomeIcon icon={faDirections} />
                              Маршрут
                            </button>
                          </div>
                        </div>
                      </Popup>
                      <Tooltip permanent direction="top" offset={[0, -10]}>
                        <strong>{club.name || 'Клуб "Златна есен"'}</strong>
                      </Tooltip>
                    </Marker>

                    {/* Nearby places markers */}
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
                            <p><strong>Разстояние:</strong> {place.distance}</p>
                          </div>
                        </Popup>
                      </Marker>
                    ))}

                    {/* Walking radius circle */}
                    <Circle
                      center={[location.coordinates.lat, location.coordinates.lng]}
                      radius={200}
                      color="#10b981"
                      fillColor="#10b981"
                      fillOpacity={0.1}
                      weight={2}
                    >
                      <Tooltip>
                        200м пеша от клуба
                      </Tooltip>
                    </Circle>
                  </MapContainer>
                )}
                
                <div className="cultural-location-map-controls">
                  <div className="cultural-location-map-legend">
                    <div className="cultural-location-legend-item">
                      <div className="cultural-location-legend-icon club"></div>
                      <span>Клуб</span>
                    </div>
                    <div className="cultural-location-legend-item">
                      <div className="cultural-location-legend-icon hospital"></div>
                      <span>Болница</span>
                    </div>
                    <div className="cultural-location-legend-item">
                      <div className="cultural-location-legend-icon transport"></div>
                      <span>Транспорт</span>
                    </div>
                    <div className="cultural-location-legend-item">
                      <div className="cultural-location-legend-icon parking"></div>
                      <span>Паркинг</span>
                    </div>
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
                <h3>Информация за мястото</h3>
                <div className="cultural-location-venue-details">
                  <div className="cultural-location-venue-item">
                    <FontAwesomeIcon icon={faInfoCircle} />
                    <span>Тип: {venue.type === 'municipal' ? 'Общинска сграда' : venue.type}</span>
                  </div>
                  <div className="cultural-location-venue-item">
                    <FontAwesomeIcon icon={faExpand} />
                    <span>Площ: {venue.size}</span>
                  </div>
                  <div className="cultural-location-venue-item">
                    <FontAwesomeIcon icon={faUsers} />
                    <span>Капацитет: {venue.capacity} души</span>
                  </div>
                </div>
                
                <div className="cultural-location-facilities">
                  <h4>Удобства</h4>
                  <div className="cultural-location-facilities-list">
                    {venue.facilities?.map((facility, index) => (
                      <span key={index} className="cultural-location-facility-tag">
                        {facility}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Transport Tab */}
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
                        <h3>Инструкции за {option.name}</h3>
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

          {/* Parking Tab */}
          {activeTab === 'parking' && (
            <div className="cultural-location-parking-section">
              <div className="cultural-location-parking-grid">
                <div className="cultural-location-parking-card">
                  <div className="cultural-location-parking-header">
                    <FontAwesomeIcon icon={faRoad} />
                    <h3>Улично паркиране</h3>
                  </div>
                  <div className="cultural-location-parking-details">
                    <div className="cultural-location-parking-item">
                      <span className="cultural-location-parking-label">Тип:</span>
                      <span>{parkingInfo.street.type}</span>
                    </div>
                    <div className="cultural-location-parking-item">
                      <span className="cultural-location-parking-label">Цена:</span>
                      <span>{parkingInfo.street.price}</span>
                    </div>
                    <div className="cultural-location-parking-item">
                      <span className="cultural-location-parking-label">Макс. време:</span>
                      <span>{parkingInfo.street.maxTime}</span>
                    </div>
                    <div className="cultural-location-parking-item">
                      <span className="cultural-location-parking-label">Работно време:</span>
                      <span>{parkingInfo.street.workingHours}</span>
                    </div>
                  </div>
                </div>
                
                <div className="cultural-location-parking-card">
                  <div className="cultural-location-parking-header">
                    <FontAwesomeIcon icon={faParking} />
                    <h3>Подземен паркинг</h3>
                  </div>
                  <div className="cultural-location-parking-details">
                    <div className="cultural-location-parking-item">
                      <span className="cultural-location-parking-label">Име:</span>
                      <span>{parkingInfo.underground.name}</span>
                    </div>
                    <div className="cultural-location-parking-item">
                      <span className="cultural-location-parking-label">Разстояние:</span>
                      <span>{parkingInfo.underground.distance}</span>
                    </div>
                    <div className="cultural-location-parking-item">
                      <span className="cultural-location-parking-label">Цена:</span>
                      <span>{parkingInfo.underground.price}</span>
                    </div>
                    <div className="cultural-location-parking-item">
                      <span className="cultural-location-parking-label">Капацитет:</span>
                      <span>{parkingInfo.underground.capacity}</span>
                    </div>
                  </div>
                </div>
                
                <div className="cultural-location-parking-card">
                  <div className="cultural-location-parking-header">
                    <FontAwesomeIcon icon={faLocationArrow} />
                    <h3>Безплатно паркиране</h3>
                  </div>
                  <div className="cultural-location-parking-details">
                    <div className="cultural-location-parking-item">
                      <span className="cultural-location-parking-label">Локация:</span>
                      <span>{parkingInfo.free.location}</span>
                    </div>
                    <div className="cultural-location-parking-item">
                      <span className="cultural-location-parking-label">Разстояние:</span>
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

          {/* Nearby Tab */}
          {activeTab === 'nearby' && (
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

        {/* Accessibility Section */}
        <div className="cultural-location-accessibility">
          <div className="cultural-location-accessibility-header">
            <FontAwesomeIcon icon={faWheelchair} />
            <h3>Достъпност</h3>
            <p>Информация за хора с увреждания и ограничена подвижност</p>
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

        {/* Contact & Help */}
        <div className="cultural-location-help">
          <div className="cultural-location-help-content">
            <h3>Нужна ви е помощ?</h3>
            <p>Ако имате затруднения с намирането на клуба или нуждаете от допълнителна информация</p>
            <div className="cultural-location-help-buttons">
              <button className="cultural-location-help-btn primary">
                <FontAwesomeIcon icon={faPhone} />
                Обадете се: {club.contacts?.phone || '02/856-4321'}
              </button>
              <button className="cultural-location-help-btn secondary">
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

export default CulturalLocation;