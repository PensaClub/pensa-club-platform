// components/Clubs/AllClubs/ClubsMap/ClubsMap.jsx
import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, 
  faMapMarkerAlt, 
  faStar,
  faPhone,
  faEnvelope,
  faArrowRight,
  faMapPin
} from '@fortawesome/free-solid-svg-icons';
import 'leaflet/dist/leaflet.css';
import './clubsMap.css';

// Поправка на default иконките на Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom иконки за различни типове клубове
const createCustomIcon = (category, isSelected = false) => {
  const colors = {
    'cultural': '#3182ce',
    'general': '#4a5568', 
    'sports': '#38a169',
    'educational': '#805ad5'
  };
  
  const color = colors[category] || '#4a5568';
  const size = isSelected ? 35 : 25;
  const opacity = isSelected ? 1 : 0.8;
  
  return L.divIcon({
    html: `
      <div class="custom-marker ${isSelected ? 'selected' : ''}" style="
        background-color: ${color}; 
        width: ${size}px; 
        height: ${size}px;
        opacity: ${opacity};
        border: ${isSelected ? '3px solid white' : '2px solid white'};
        box-shadow: ${isSelected ? '0 0 20px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.2)'};
      ">
        <i class="fas fa-home"></i>
      </div>
    `,
    className: 'custom-div-icon',
    iconSize: [size, size],
    iconAnchor: [size/2, size],
    popupAnchor: [0, -size]
  });
};

// Компонент за промяна на view при избиране на клуб
const MapController = ({ selectedClub, clubs }) => {
  const map = useMap();
  
  useEffect(() => {
    if (selectedClub && selectedClub.location.coordinates.lat) {
      map.setView(
        [selectedClub.location.coordinates.lat, selectedClub.location.coordinates.lng], 
        15,
        { animate: true, duration: 1 }
      );
    } else if (clubs.length > 0) {
      // Fit всички клубове в view
      const group = new L.featureGroup();
      clubs.forEach(club => {
        if (club.location.coordinates.lat && club.location.coordinates.lng) {
          group.addLayer(L.marker([club.location.coordinates.lat, club.location.coordinates.lng]));
        }
      });
      
      if (group.getLayers().length > 0) {
        map.fitBounds(group.getBounds(), { padding: [20, 20] });
      }
    }
  }, [selectedClub, clubs, map]);
  
  return null;
};

// Popup компонент за клуб
const ClubPopup = ({ club, onSelect, onViewDetails }) => {
  const getCategoryLabel = (category) => {
    const labels = {
      'cultural': 'Културен',
      'general': 'Общ',
      'sports': 'Спортен', 
      'educational': 'Образователен'
    };
    return labels[category] || category;
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="popup-star filled">★</span>);
    }
    
    if (hasHalfStar) {
      stars.push(<span key="half" className="popup-star half">★</span>);
    }
    
    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<span key={`empty-${i}`} className="popup-star empty">☆</span>);
    }
    
    return stars;
  };

  return (
    <div className="club-popup">
      <div className="club-popup-header">
        <img 
          src={club.mainImage || club.logo} 
          alt={club.name}
          className="club-popup-image"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        <div className="club-popup-image-placeholder" style={{ display: 'none' }}>
          <FontAwesomeIcon icon={faUsers} />
        </div>
        
        <div className="club-popup-badges">
          <span className="club-popup-category">
            {getCategoryLabel(club.category)}
          </span>
        </div>
      </div>
      
      <div className="club-popup-content">
        <h3 className="club-popup-title">{club.name}</h3>
        
        <div className="club-popup-rating">
          <div className="club-popup-stars">
            {renderStars(club.metadata.rating)}
          </div>
          <span className="club-popup-rating-value">{club.metadata.rating}</span>
        </div>
        
        <div className="club-popup-location">
          <FontAwesomeIcon icon={faMapMarkerAlt} />
          <span>{club.location.address}, {club.location.city}</span>
        </div>
        
        <p className="club-popup-description">
          {club.shortDescription.slice(0, 100)}...
        </p>
        
        <div className="club-popup-stats">
          <div className="club-popup-stat">
            <FontAwesomeIcon icon={faUsers} />
            <span>{club.membership.totalMembers} членове</span>
          </div>
          <div className="club-popup-stat">
            <FontAwesomeIcon icon={faMapPin} />
            <span>{club.activities.regular.length} дейности</span>
          </div>
        </div>
        
        <div className="club-popup-contacts">
          {club.contacts.phone && (
            <a href={`tel:${club.contacts.phone}`} className="club-popup-contact">
              <FontAwesomeIcon icon={faPhone} />
            </a>
          )}
          {club.contacts.email && (
            <a href={`mailto:${club.contacts.email}`} className="club-popup-contact">
              <FontAwesomeIcon icon={faEnvelope} />
            </a>
          )}
        </div>
        
        <div className="club-popup-actions">
          <button 
            onClick={() => onSelect(club)}
            className="club-popup-btn secondary"
          >
            Избери клуб
          </button>
          <button 
            onClick={() => onViewDetails(club)}
            className="club-popup-btn primary"
          >
            <span>Виж детайли</span>
            <FontAwesomeIcon icon={faArrowRight} />
          </button>
        </div>
      </div>
    </div>
  );
};

export const ClubsMap = ({ clubs, selectedClub, onClubSelect }) => {
  const [mapReady, setMapReady] = useState(false);
  const popupRefs = useRef({});

  // България центрирана позиция
  const bulgariaCenterPosition = [42.7339, 25.4858];
  
  const handleMarkerClick = (club) => {
    onClubSelect(club);
  };

  const handleViewDetails = (club) => {
    window.open(`/clubs/${club.slug}`, '_blank');
  };

  // Затваряме всички попъпи когато се избере нов клуб
  useEffect(() => {
    if (selectedClub) {
      Object.values(popupRefs.current).forEach(popup => {
        if (popup && popup._source !== selectedClub) {
          popup.close();
        }
      });
    }
  }, [selectedClub]);

  return (
    <div className="clubs-map-container">
      <div className="clubs-map-header">
        <h3 className="clubs-map-title">
          <FontAwesomeIcon icon={faMapMarkerAlt} />
          Карта на клубовете
        </h3>
        <div className="clubs-map-legend">
          <div className="legend-item">
            <div className="legend-marker cultural"></div>
            <span>Културни</span>
          </div>
          <div className="legend-item">
            <div className="legend-marker general"></div>
            <span>Общи</span>
          </div>
          <div className="legend-item">
            <div className="legend-marker sports"></div>
            <span>Спортни</span>
          </div>
          <div className="legend-item">
            <div className="legend-marker educational"></div>
            <span>Образователни</span>
          </div>
        </div>
      </div>
      
      <div className="clubs-map-wrapper">
        <MapContainer
          center={bulgariaCenterPosition}
          zoom={7}
          scrollWheelZoom={true}
          className="clubs-leaflet-map"
          whenReady={() => setMapReady(true)}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapController selectedClub={selectedClub} clubs={clubs} />
          
          <MarkerClusterGroup
            chunkedLoading
            maxClusterRadius={50}
            spiderfyOnMaxZoom={true}
            showCoverageOnHover={false}
            zoomToBoundsOnClick={true}
            iconCreateFunction={(cluster) => {
              const count = cluster.getChildCount();
              const size = count < 10 ? 'small' : count < 100 ? 'medium' : 'large';
              
              return L.divIcon({
                html: `<div class="cluster-marker cluster-${size}"><span>${count}</span></div>`,
                className: 'custom-cluster-icon',
                iconSize: L.point(40, 40, true),
              });
            }}
          >
            {clubs.map((club) => {
              if (!club.location.coordinates.lat || !club.location.coordinates.lng) {
                return null;
              }
              
              const isSelected = selectedClub && selectedClub.id === club.id;
              
              return (
                <Marker
                  key={club.id}
                  position={[club.location.coordinates.lat, club.location.coordinates.lng]}
                  icon={createCustomIcon(club.category, isSelected)}
                  eventHandlers={{
                    click: () => handleMarkerClick(club),
                  }}
                  ref={(ref) => {
                    if (ref) {
                      popupRefs.current[club.id] = ref;
                    }
                  }}
                >
                  <Popup
                    closeButton={true}
                    closeOnClick={false}
                    className="custom-popup"
                    maxWidth={320}
                    minWidth={280}
                  >
                    <ClubPopup 
                      club={club} 
                      onSelect={onClubSelect}
                      onViewDetails={handleViewDetails}
                    />
                  </Popup>
                </Marker>
              );
            })}
          </MarkerClusterGroup>
        </MapContainer>
        
        {!mapReady && (
          <div className="clubs-map-loading">
            <div className="loading-spinner"></div>
            <p>Зареждане на картата...</p>
          </div>
        )}
      </div>
      
      <div className="clubs-map-info">
        <p>
          <FontAwesomeIcon icon={faMapPin} />
          Показани {clubs.length} клуба в България
        </p>
      </div>
    </div>
  );
};