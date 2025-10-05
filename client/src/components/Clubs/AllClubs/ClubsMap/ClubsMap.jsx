import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
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

const createCustomIcon = (category, isSelected = false) => {
  const colors = {
    'cultural': '#3182ce',
    'general': '#0c55d3ff', 
    'sports': '#38a169',
    'educational': '#805ad5',
    'traditional': '#d97706'
  };
  
  const color = colors[category] || '#4a5568';
  const size = isSelected ? 40 : 40;
  const opacity = isSelected ? 1 : 0.9;
  
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
        📍
      </div>
    `,
    className: 'custom-div-icon',
    iconSize: [size, size],
    iconAnchor: [size/2, size],
    popupAnchor: [0, -size]
  });
};

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
  const { t } = useTranslation();

  const getCategoryLabel = (category) => {
    return t(`clubs.ClubsMap.categories.${category}`, { 
      defaultValue: t('clubs.ClubsMap.categories.general') 
    });
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
        
        {club.metadata?.rating && (
          <div className="club-popup-rating">
            <div className="club-popup-stars">
              {renderStars(club.metadata.rating)}
            </div>
            <span className="club-popup-rating-value">{club.metadata.rating}</span>
          </div>
        )}
        
        <div className="club-popup-location">
          <FontAwesomeIcon icon={faMapMarkerAlt} />
          <span>{club.location.address}, {club.location.city}</span>
        </div>
        
        <p className="club-popup-description">
          {club.shortDescription?.slice(0, 100)}...
        </p>
        
        <div className="club-popup-contacts">
          {club.contacts?.phone && (
            <a href={`tel:${club.contacts.phone}`} className="club-popup-contact">
              <FontAwesomeIcon icon={faPhone} />
            </a>
          )}
          {club.contacts?.email && (
            <a href={`mailto:${club.contacts.email}`} className="club-popup-contact">
              <FontAwesomeIcon icon={faEnvelope} />
            </a>
          )}
        </div>
        
        <div className="club-popup-actions">
          <button 
            onClick={() => onViewDetails(club)}
            className="club-popup-btn primary"
          >
            <span>{t('clubs.ClubsMap.popup.viewDetails')}</span>
            <FontAwesomeIcon icon={faArrowRight} />
          </button>
        </div>
      </div>
    </div>
  );
};

export const ClubsMap = ({ clubs, selectedClub, onClubSelect }) => {
  const { t } = useTranslation();
  const [mapReady, setMapReady] = useState(false);
  const markerRefs = useRef({});
  const previousSelectedClubId = useRef(null);

  // България центрирана позиция
  const bulgariaCenterPosition = [42.7339, 25.4858];
  
  const handleMarkerClick = (club) => {
    onClubSelect(club);
  };

  const handleViewDetails = (club) => {
    window.open(`/clubs/${club.slug}`, '_blank');
  };

  useEffect(() => {
    const currentSelectedId = selectedClub?.id;
    const prevSelectedId = previousSelectedClubId.current;
    
    // Затваряме предишния popup ако има такъв
    if (prevSelectedId && prevSelectedId !== currentSelectedId) {
      const prevMarker = markerRefs.current[prevSelectedId];
      if (prevMarker && typeof prevMarker.closePopup === 'function') {
        prevMarker.closePopup();
      }
    }
    
    if (currentSelectedId && currentSelectedId !== prevSelectedId) {
      const currentMarker = markerRefs.current[currentSelectedId];
      if (currentMarker && typeof currentMarker.openPopup === 'function') {
        // Малка пауза за да се update-не view-то преди да отворим popup
        setTimeout(() => {
          currentMarker.openPopup();
        }, 500);
      }
    }
    
    // Запомняме текущия ID за следващия път
    previousSelectedClubId.current = currentSelectedId;
  }, [selectedClub?.id]); // Само ID-то за да избегнем безкрайни re-render-и

  return (
    <div className="clubs-map-container">
      <div className="clubs-map-header">
        <h3 className="clubs-map-title">
          <FontAwesomeIcon icon={faMapMarkerAlt} />
          {t('clubs.ClubsMap.title')}
        </h3>
        <div className="clubs-map-legend">
          <div className="legend-item">
            <div className="legend-marker cultural"></div>
            <span>{t('clubs.ClubsMap.legend.cultural')}</span>
          </div>
          <div className="legend-item">
            <div className="legend-marker general"></div>
            <span>{t('clubs.ClubsMap.legend.general')}</span>
          </div>
          <div className="legend-item">
            <div className="legend-marker sports"></div>
            <span>{t('clubs.ClubsMap.legend.sports')}</span>
          </div>
          <div className="legend-item">
            <div className="legend-marker educational"></div>
            <span>{t('clubs.ClubsMap.legend.educational')}</span>
          </div>
          <div className="legend-item">
            <div className="legend-marker traditional"></div>
            <span>{t('clubs.ClubsMap.legend.traditional')}</span>
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
              if (!club.location?.coordinates?.lat || !club.location?.coordinates?.lng) {
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
                      markerRefs.current[club.id] = ref;
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
            <p>{t('clubs.ClubsMap.loading')}</p>
          </div>
        )}
      </div>
      
      <div className="clubs-map-info">
        <p>
          <FontAwesomeIcon icon={faMapPin} />
          {t('clubs.ClubsMap.info.shown', { count: clubs.length })}
        </p>
      </div>
    </div>
  );
};