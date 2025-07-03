import { useState, useCallback, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {  faMapMarkerAlt, 
  faSearch, 
  faTimes, 
  faLocationArrow } from '@fortawesome/free-solid-svg-icons';
import './locationPicker.css';

// Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Компонент за обработка на кликове върху картата
const LocationMarker = ({ position, onLocationChange }) => {
  useMapEvents({
    click(e) {
      onLocationChange(e.latlng);
    },
  });

  return position ? (
    <Marker 
      position={position}
      icon={L.divIcon({
        className: 'location-picker-marker',
        html: `
          <div class="picker-marker-circle">
            <div class="picker-marker-dot"></div>
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      })}
    />
  ) : null;
};

export const LocationPicker = ({ 
  initialPosition = { lat: 42.6977, lng: 23.3219 }, // София по подразбиране
  initialAddress = '',
  onLocationChange 
}) => {
  const [position, setPosition] = useState(
    initialPosition.lat && initialPosition.lng ? 
    [initialPosition.lat, initialPosition.lng] : null
  );
  const [address, setAddress] = useState(initialAddress);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const mapRef = useRef();

  // Reverse geocoding - получаване на адрес от координати
  const getAddressFromCoords = useCallback(async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      );
      const data = await response.json();
      return data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    } catch (error) {
      console.error('Geocoding error:', error);
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
  }, []);

  // Forward geocoding - търсене на адреси
  const searchAddresses = useCallback(async (query) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=bg`
      );
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error('Search error:', error);
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Обработка на промяна на местоположение
  const handleLocationChange = useCallback(async (latlng) => {
    const newPosition = [latlng.lat, latlng.lng];
    setPosition(newPosition);
    
    // Получаваме адреса
    const newAddress = await getAddressFromCoords(latlng.lat, latlng.lng);
    setAddress(newAddress);
    
    // Изпращаме данните нагоре
    onLocationChange({
      lat: latlng.lat,
      lng: latlng.lng,
      address: newAddress
    });
  }, [onLocationChange, getAddressFromCoords]);

  // Избиране на предложение от търсенето
  const handleSuggestionSelect = useCallback((suggestion) => {
    const lat = parseFloat(suggestion.lat);
    const lng = parseFloat(suggestion.lon);
    const newPosition = [lat, lng];
    
    setPosition(newPosition);
    setAddress(suggestion.display_name);
    setSearchQuery('');
    setSuggestions([]);
    
    // Центрираме картата
    if (mapRef.current) {
      mapRef.current.flyTo(newPosition, 15);
    }
    
    onLocationChange({
      lat,
      lng,
      address: suggestion.display_name
    });
  }, [onLocationChange]);

  // Получаване на текущото местоположение
  const getCurrentLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          handleLocationChange({ lat: latitude, lng: longitude });
          
          if (mapRef.current) {
            mapRef.current.flyTo([latitude, longitude], 15);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert('Не може да се получи текущото местоположение');
        }
      );
    } else {
      alert('Geolocation не се поддържа от този браузър');
    }
  }, [handleLocationChange]);

  // Търсене с debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        searchAddresses(searchQuery);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchAddresses]);

  return (
    <div className="location-picker-container">
      <div className="location-picker-header">
        <h4>
          <FontAwesomeIcon icon={faMapMarkerAlt} />
          Избери местоположение
        </h4>
        <p>Кликни върху картата или търси адрес</p>
      </div>

      {/* Търсене на адреси */}
      <div className="location-search">
        <div className="search-input-group-picker">
          <FontAwesomeIcon icon={faSearch} className="search-icon" />
          <input
            type="text"
            placeholder="Търси адрес..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="location-search-input"
          />
          {searchQuery && (
            <button 
              onClick={() => {
                setSearchQuery('');
                setSuggestions([]);
              }}
              className="clear-search-btn"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          )}
        </div>

        {/* Suggestions dropdown */}
        {suggestions.length > 0 && (
          <div className="search-suggestions">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="suggestion-item"
                onClick={() => handleSuggestionSelect(suggestion)}
              >
                <FontAwesomeIcon icon={faMapMarkerAlt} />
                <span>{suggestion.display_name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Бутон за текущо местоположение */}
      <div className="location-actions">
        <button 
          onClick={getCurrentLocation}
          className="current-location-btn"
        >
          <FontAwesomeIcon icon={faLocationArrow} />
          Текущо местоположение
        </button>
      </div>

      {/* Картата */}
      <div className="location-map-wrapper">
        <MapContainer
          center={[42.6977, 23.3219]}
          zoom={13}
          style={{ height: '300px', width: '100%' }}
          ref={mapRef}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <LocationMarker 
            position={position} 
            onLocationChange={handleLocationChange}
          />
        </MapContainer>
      </div>

      {/* Избран адрес */}
      {address && (
        <div className="selected-location">
          <div className="location-info">
            <FontAwesomeIcon icon={faMapMarkerAlt} />
            <div className="location-details">
              <strong>Избрано местоположение:</strong>
              <p>{address}</p>
              {position && (
                <small>
                  Координати: {position[0].toFixed(6)}, {position[1].toFixed(6)}
                </small>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};