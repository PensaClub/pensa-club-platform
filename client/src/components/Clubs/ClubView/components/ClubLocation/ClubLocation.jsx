import { useState, useEffect } from 'react';
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
  faEnvelope
} from '@fortawesome/free-solid-svg-icons';
import 'leaflet/dist/leaflet.css';
import './clubLocation.css';
import { faAccessibleIcon } from '@fortawesome/free-brands-svg-icons';

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
    className: `custom-marker ${isMain ? 'main-club' : 'other-club'}`,
    html: `
      <div class="marker-icon">
        <i class="fas fa-users"></i>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  });
};

// Компонент за изцентроване на картата
const MapController = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);
  
  return null;
};

export const ClubLocation = ({ club }) => {
  const [mapExpanded, setMapExpanded] = useState(false);
  const [selectedTransport, setSelectedTransport] = useState('walking');

  const transportOptions = [
    { id: 'walking', icon: faWalking, label: 'Пеша', time: '10-15 мин', info: 'Лесно достъпен пеша от центъра' },
    { id: 'bus', icon: faBus, label: 'Автобус', time: '5-20 мин', info: 'Градски транспорт с намалени цени за пенсионери' },
    { id: 'car', icon: faCar, label: 'Кола', time: '5-10 мин', info: 'Безплатен паркинг на улицата' }
  ];

  // Координати на клуба
  const clubPosition = [club.location.coordinates.lat, club.location.coordinates.lng];

  const getGoogleMapsUrl = () => {
    const address = `${club.location.address}, ${club.location.city}, Bulgaria`;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  };

  const getDirectionsUrl = () => {
    const coords = club.location.coordinates;
    return `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`;
  };

  return (
    <section id="club-location" className="club-location">
      <div className="location-container">
        <div className="location-header-clubview">
          <h2>
            <FontAwesomeIcon icon={faLocationDot} />
            Местоположение и достъп
          </h2>
          <p className="location-subtitle">
            Как да стигнете до нашия клуб и полезна информация за посещението
          </p>
        </div>

        <div className="location-main-grid">
          {/* Лява колона - Карта */}
          <div className={`map-section-clubview ${mapExpanded ? 'expanded' : ''}`}>
            <div className="map-header">
              <h3>
                <FontAwesomeIcon icon={faMapPin} />
                Интерактивна карта
              </h3>
              <button 
                className="expand-btn"
                onClick={() => setMapExpanded(!mapExpanded)}
              >
                <FontAwesomeIcon icon={mapExpanded ? faCompress : faExpand} />
              </button>
            </div>

            <div className="map-container">
              <MapContainer
                center={clubPosition}
                zoom={15}
                scrollWheelZoom={true}
                className="leaflet-map"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                <MapController center={clubPosition} zoom={15} />

                <MarkerClusterGroup chunkedLoading maxClusterRadius={50}>
                  <Marker position={clubPosition} icon={createClubIcon(true)}>
                    <Popup className="custom-popup">
                      <div className="popup-content">
                        <h4>{club.name}</h4>
                        <p>{club.location.address}</p>
                        <div className="popup-actions">
                          <a 
                            href={getDirectionsUrl()} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="popup-btn"
                          >
                            <FontAwesomeIcon icon={faRoute} />
                            Маршрут
                          </a>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                </MarkerClusterGroup>
              </MapContainer>
            </div>
          </div>

          {/* Дясна колона - Информация */}
          <div className="info-column">
            
            {/* Адрес */}
            <div className="info-card address-card">
              <div className="card-header">
                <FontAwesomeIcon icon={faMapMarkerAlt} />
                <h3>Адрес на клуба</h3>
              </div>
              <div className="address-info">
                <p className="main-address">{club.location.address}</p>
                <p className="city-info">{club.location.city}, {club.location.region}</p>
                {club.location.postalCode && (
                  <p className="postal-info">Пощенски код: {club.location.postalCode}</p>
                )}
              </div>
              <div className="address-actions">
                <a href={getGoogleMapsUrl()} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                  <FontAwesomeIcon icon={faMapPin} />
                  Google Maps
                </a>
                <a href={getDirectionsUrl()} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                  <FontAwesomeIcon icon={faRoute} />
                  Маршрут
                </a>
              </div>
            </div>

            {/* Информация за сградата */}
            <div className="info-card venue-card">
              <div className="card-header">
                <FontAwesomeIcon icon={faBuilding} />
                <h3>Информация за сградата</h3>
              </div>
              <div className="venue-info-grid">
                <div className="venue-row">
                  <span className="label">Тип:</span>
                  <span className="value">
                    {club.location.venue.type === 'municipal' && 'Общинска сграда'}
                    {club.location.venue.type === 'rented' && 'Наета сграда'}
                    {club.location.venue.type === 'cultural_center' && 'Културен дом'}
                    {club.location.venue.type === 'sports_center' && 'Спортен център'}
                    {club.location.venue.type === 'community_center' && 'Местен център'}
                  </span>
                </div>
                <div className="venue-row">
                  <span className="label">Площ:</span>
                  <span className="value">{club.location.venue.size}</span>
                </div>
                <div className="venue-row">
                  <span className="label">Капацитет:</span>
                  <span className="value">{club.location.venue.capacity} места</span>
                </div>
                <div className={`venue-row accessibility ${club.location.venue.accessibility ? 'accessible' : 'not-accessible'}`}>
                  <span className="label">Достъпност:</span>
                  <span className="value">
                    <FontAwesomeIcon icon={faAccessibleIcon} />
                    {club.location.venue.accessibility ? 'Достъпна' : 'Не е достъпна'}
                  </span>
                </div>
              </div>
              
              {/* Удобства */}
              {club.location.venue.facilities && club.location.venue.facilities.length > 0 && (
                <div className="facilities-section">
                  <h4>Удобства</h4>
                  <div className="facilities-tags">
                    {club.location.venue.facilities.map((facility, index) => (
                      <span key={index} className="facility-tag">
                        <FontAwesomeIcon icon={faInfoCircle} />
                        {facility}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Транспорт */}
            <div className="info-card transport-card">
              <div className="card-header">
                <FontAwesomeIcon icon={faDirections} />
                <h3>Как да стигнете</h3>
              </div>
              
              <div className="transport-options">
                {transportOptions.map(option => (
                  <div 
                    key={option.id}
                    className={`transport-option ${selectedTransport === option.id ? 'active' : ''}`}
                    onClick={() => setSelectedTransport(option.id)}
                  >
                    <div className="transport-icon">
                      <FontAwesomeIcon icon={option.icon} />
                    </div>
                    <div className="transport-details">
                      <h4>{option.label}</h4>
                      <p className="transport-time">{option.time}</p>
                      <p className="transport-info">{option.info}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Работно време и контакти */}
            <div className="bottom-grid">
              <div className="info-card hours-card">
                <div className="card-header">
                  <FontAwesomeIcon icon={faClock} />
                  <h3>Работно време</h3>
                </div>
                <div className="hours-grid">
                  {Object.entries(club.contacts.workingHours).map(([day, hours]) => {
                    const dayNames = {
                      monday: 'Понеделник',
                      tuesday: 'Вторник',
                      wednesday: 'Сряда',
                      thursday: 'Четвъртък',
                      friday: 'Петък',
                      saturday: 'Събота',
                      sunday: 'Неделя'
                    };
                    
                    return (
                      <div key={day} className="hours-row">
                        <span className="day">{dayNames[day]}</span>
                        <span className={`hours ${hours === 'closed' ? 'closed' : ''}`}>
                          {hours === 'closed' ? 'Затворено' : hours}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="info-card contact-card">
                <div className="card-header">
                  <FontAwesomeIcon icon={faPhoneAlt} />
                  <h3>Бързи контакти</h3>
                </div>
                <div className="contact-list">
                  <a href={`tel:${club.contacts.phone}`} className="contact-item">
                    <FontAwesomeIcon icon={faPhoneAlt} />
                    <span>{club.contacts.phone}</span>
                  </a>
                  {club.contacts.mobile && club.contacts.mobile !== club.contacts.phone && (
                    <a href={`tel:${club.contacts.mobile}`} className="contact-item">
                      <FontAwesomeIcon icon={faPhoneAlt} />
                      <span>{club.contacts.mobile}</span>
                    </a>
                  )}
                  <a href={`mailto:${club.contacts.email}`} className="contact-item">
                    <FontAwesomeIcon icon={faEnvelope} />
                    <span>{club.contacts.email}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClubLocation;