import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMapMarkerAlt, 
  faSearch, 
  faLocationArrow,
  faCheck,
  faTimes,
  faSpinner,
  faInfoCircle,
  faBuilding,
  faUsers,
  faRulerCombined,
  faWheelchair
} from '@fortawesome/free-solid-svg-icons';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './locationPicker.css';

// Fix за Leaflet иконите
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Компонент за location events
const LocationEvents = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng);
    },
  });
  return null;
};

const LocationPicker = ({ 
  locationData, 
  onLocationChange, 
  disabled = false,
  showVenueDetails = true 
}) => {
  const { t } = useTranslation();
  const mapRef = useRef(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPosition, setSelectedPosition] = useState(
    locationData?.coordinates?.lat && locationData?.coordinates?.lng 
      ? [locationData.coordinates.lat, locationData.coordinates.lng] 
      : [42.6977, 23.3219] // София по подразбиране
  );
  const [showMap, setShowMap] = useState(false);
  const [errors, setErrors] = useState({});

  // Bulgaria regions и cities
  const bulgariaRegions = [
    'Благоевград', 'Бургас', 'Варна', 'Велико Търново', 'Видин', 'Враца',
    'Габрово', 'Добрич', 'Кърджали', 'Кюстендил', 'Ловеч', 'Монтана',
    'Пазарджик', 'Перник', 'Плевен', 'Пловдив', 'Разград', 'Русе',
    'Силистра', 'Сливен', 'Смолян', 'София', 'София-град', 'Стара Загора',
    'Търговище', 'Хасково', 'Шумен', 'Ямбол'
  ];

  const venueTypes = [
    { value: 'municipal', label: t('clubForm.location.venueTypes.municipal') },
    { value: 'rented', label: t('clubForm.location.venueTypes.rented') },
    { value: 'owned', label: t('clubForm.location.venueTypes.owned') },
    { value: 'sports_complex', label: t('clubForm.location.venueTypes.sportsComplex') },
    { value: 'cultural_center', label: t('clubForm.location.venueTypes.culturalCenter') },
    { value: 'community_center', label: t('clubForm.location.venueTypes.communityCenter') },
    { value: 'private', label: t('clubForm.location.venueTypes.private') }
  ];

  const facilities = [
    { value: 'parking', label: t('clubForm.location.facilities.parking') },
    { value: 'wifi', label: t('clubForm.location.facilities.wifi') },
    { value: 'kitchen', label: t('clubForm.location.facilities.kitchen') },
    { value: 'restroom', label: t('clubForm.location.facilities.restroom') },
    { value: 'projector', label: t('clubForm.location.facilities.projector') },
    { value: 'sound_system', label: t('clubForm.location.facilities.soundSystem') },
    { value: 'air_conditioning', label: t('clubForm.location.facilities.airConditioning') },
    { value: 'heating', label: t('clubForm.location.facilities.heating') },
    { value: 'storage', label: t('clubForm.location.facilities.storage') },
    { value: 'garden', label: t('clubForm.location.facilities.garden') }
  ];

  // Geocoding search
  const searchLocation = useCallback(async (query) => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=bg&limit=5`
      );
      const data = await response.json();
      
      const results = data.map(item => ({
        id: item.place_id,
        name: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        type: item.type
      }));
      
      setSearchResults(results);
    } catch (error) {
      console.error('Geocoding error:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert(t('clubForm.location.geolocationNotSupported'));
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newPosition = [latitude, longitude];
        setSelectedPosition(newPosition);
        updateLocationData({ lat: latitude, lng: longitude });
        
        if (mapRef.current) {
          mapRef.current.setView(newPosition, 15);
        }
        setIsLoading(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert(t('clubForm.location.geolocationError'));
        setIsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Update location data
  const updateLocationData = (coordinates, address = '') => {
    const updatedLocation = {
      ...locationData,
      coordinates,
      ...(address && { address })
    };
    onLocationChange(updatedLocation);
  };

  // Handle map click
  const handleMapClick = (latlng) => {
    const newPosition = [latlng.lat, latlng.lng];
    setSelectedPosition(newPosition);
    updateLocationData({ lat: latlng.lat, lng: latlng.lng });
  };

  // Handle search result selection
  const handleSearchResultSelect = (result) => {
    const newPosition = [result.lat, result.lng];
    setSelectedPosition(newPosition);
    updateLocationData({ lat: result.lat, lng: result.lng }, result.name);
    setSearchResults([]);
    setSearchQuery('');
    
    setShowMap(true);
    if (mapRef.current) {
      setTimeout(() => {
        mapRef.current.setView(newPosition, 15);
      }, 100);
    }
  };

  // Handle field changes
  const handleFieldChange = (field, value) => {
    const updatedLocation = { ...locationData };
    
    if (field.includes('.')) {
      const keys = field.split('.');
      let current = updatedLocation;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
    } else {
      updatedLocation[field] = value;
    }
    
    onLocationChange(updatedLocation);
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // Handle facility toggle
  const handleFacilityToggle = (facilityValue) => {
    const currentFacilities = locationData?.venue?.facilities || [];
    const updatedFacilities = currentFacilities.includes(facilityValue)
      ? currentFacilities.filter(f => f !== facilityValue)
      : [...currentFacilities, facilityValue];
    
    handleFieldChange('venue.facilities', updatedFacilities);
  };

  return (
    <div className="location-picker">
      
      {/* Header */}
      <div className="location-picker-header">
        <h3 className="location-picker-title">
          <FontAwesomeIcon icon={faMapMarkerAlt} />
          {t('clubForm.location.title')}
        </h3>
        <p className="location-picker-subtitle">
          {t('clubForm.location.subtitle')}
        </p>
      </div>

      {/* Address Fields */}
      <div className="location-picker-address-section">
        <h4 className="location-picker-section-title">
          {t('clubForm.location.addressSection')}
        </h4>
        
        <div className="location-picker-form-grid">
          
          {/* Адрес */}
          <div className="location-picker-form-group location-picker-full-width">
            <label className="location-picker-form-label">
              {t('clubForm.location.fields.address')}
            </label>
            <input
              type="text"
              className="location-picker-form-input"
              placeholder={t('clubForm.location.placeholders.address')}
              value={locationData?.address || ''}
              onChange={(e) => handleFieldChange('address', e.target.value)}
              disabled={disabled}
            />
          </div>

          {/* Град */}
          <div className="location-picker-form-group">
            <label className="location-picker-form-label">
              {t('clubForm.location.fields.city')}
            </label>
            <input
              type="text"
              className="location-picker-form-input"
              placeholder={t('clubForm.location.placeholders.city')}
              value={locationData?.city || ''}
              onChange={(e) => handleFieldChange('city', e.target.value)}
              disabled={disabled}
            />
          </div>

          {/* Община */}
          <div className="location-picker-form-group">
            <label className="location-picker-form-label">
              {t('clubForm.location.fields.municipality')}
            </label>
            <input
              type="text"
              className="location-picker-form-input"
              placeholder={t('clubForm.location.placeholders.municipality')}
              value={locationData?.municipality || ''}
              onChange={(e) => handleFieldChange('municipality', e.target.value)}
              disabled={disabled}
            />
          </div>

          {/* Регион */}
          <div className="location-picker-form-group">
            <label className="location-picker-form-label">
              {t('clubForm.location.fields.region')}
            </label>
            <select
              className="location-picker-form-select"
              value={locationData?.region || ''}
              onChange={(e) => handleFieldChange('region', e.target.value)}
              disabled={disabled}
            >
              <option value="">{t('clubForm.location.placeholders.region')}</option>
              {bulgariaRegions.map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </div>

          {/* Пощенски код */}
          <div className="location-picker-form-group">
            <label className="location-picker-form-label">
              {t('clubForm.location.fields.postalCode')}
            </label>
            <input
              type="text"
              className="location-picker-form-input"
              placeholder={t('clubForm.location.placeholders.postalCode')}
              value={locationData?.postalCode || ''}
              onChange={(e) => handleFieldChange('postalCode', e.target.value)}
              disabled={disabled}
              maxLength={4}
            />
          </div>

        </div>
      </div>

      {/* Map Section */}
      <div className="location-picker-map-section">
        <div className="location-picker-map-header">
          <h4 className="location-picker-section-title">
            {t('clubForm.location.mapSection')}
          </h4>
          <div className="location-picker-map-controls">
            
            {/* Search */}
            <div className="location-picker-search">
              <div className="location-picker-search-input-container">
                <FontAwesomeIcon icon={faSearch} className="location-picker-search-icon" />
                <input
                  type="text"
                  className="location-picker-search-input"
                  placeholder={t('clubForm.location.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchLocation(searchQuery)}
                  disabled={disabled}
                />
                <button
                  type="button"
                  className="location-picker-search-btn"
                  onClick={() => searchLocation(searchQuery)}
                  disabled={disabled || isLoading}
                >
                  {isLoading ? (
                    <FontAwesomeIcon icon={faSpinner} spin />
                  ) : (
                    <FontAwesomeIcon icon={faSearch} />
                  )}
                </button>
              </div>
              
              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="location-picker-search-results">
                  {searchResults.map(result => (
                    <button
                      key={result.id}
                      className="location-picker-search-result"
                      onClick={() => handleSearchResultSelect(result)}
                    >
                      <FontAwesomeIcon icon={faMapMarkerAlt} />
                      <span>{result.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Current Location Button */}
            <button
              type="button"
              className="location-picker-current-btn"
              onClick={getCurrentLocation}
              disabled={disabled || isLoading}
              title={t('clubForm.location.getCurrentLocation')}
            >
              {isLoading ? (
                <FontAwesomeIcon icon={faSpinner} spin />
              ) : (
                <FontAwesomeIcon icon={faLocationArrow} />
              )}
            </button>

            {/* Toggle Map Button */}
            <button
              type="button"
              className="location-picker-toggle-map-btn"
              onClick={() => setShowMap(!showMap)}
              disabled={disabled}
            >
              {showMap ? (
                <>
                  <FontAwesomeIcon icon={faTimes} />
                  {t('clubForm.location.hideMap')}
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faMapMarkerAlt} />
                  {t('clubForm.location.showMap')}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Map Container */}
        {showMap && (
          <div className="location-picker-map-container">
            <MapContainer
              center={selectedPosition}
              zoom={13}
              style={{ height: '400px', width: '100%' }}
              ref={mapRef}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationEvents onLocationSelect={handleMapClick} />
              {selectedPosition && (
                <Marker position={selectedPosition}>
                  <Popup>
                    {locationData?.address || t('clubForm.location.selectedLocation')}
                  </Popup>
                </Marker>
              )}
            </MapContainer>
            
            {/* Coordinates Display */}
            {selectedPosition && (
              <div className="location-picker-coordinates">
                <small>
                  {t('clubForm.location.coordinates')}: {selectedPosition[0].toFixed(6)}, {selectedPosition[1].toFixed(6)}
                </small>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Venue Details */}
      {showVenueDetails && (
        <div className="location-picker-venue-section">
          <h4 className="location-picker-section-title">
            <FontAwesomeIcon icon={faBuilding} />
            {t('clubForm.location.venueSection')}
          </h4>
          
          <div className="location-picker-form-grid">
            
            {/* Тип сграда */}
            <div className="location-picker-form-group">
              <label className="location-picker-form-label">
                {t('clubForm.location.fields.venueType')}
              </label>
              <select
                className="location-picker-form-select"
                value={locationData?.venue?.type || 'municipal'}
                onChange={(e) => handleFieldChange('venue.type', e.target.value)}
                disabled={disabled}
              >
                {venueTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Размер */}
            <div className="location-picker-form-group">
              <label className="location-picker-form-label">
                <FontAwesomeIcon icon={faRulerCombined} />
                {t('clubForm.location.fields.size')}
              </label>
              <input
                type="text"
                className="location-picker-form-input"
                placeholder={t('clubForm.location.placeholders.size')}
                value={locationData?.venue?.size || ''}
                onChange={(e) => handleFieldChange('venue.size', e.target.value)}
                disabled={disabled}
              />
            </div>

            {/* Капацитет */}
            <div className="location-picker-form-group">
              <label className="location-picker-form-label">
                <FontAwesomeIcon icon={faUsers} />
                {t('clubForm.location.fields.capacity')}
              </label>
              <input
                type="number"
                className="location-picker-form-input"
                placeholder={t('clubForm.location.placeholders.capacity')}
                value={locationData?.venue?.capacity || ''}
                onChange={(e) => handleFieldChange('venue.capacity', parseInt(e.target.value) || 0)}
                disabled={disabled}
                min="0"
              />
            </div>

            {/* Достъпност */}
            <div className="location-picker-form-group">
              <label className="location-picker-checkbox-label">
                <input
                  type="checkbox"
                  checked={locationData?.venue?.accessibility || false}
                  onChange={(e) => handleFieldChange('venue.accessibility', e.target.checked)}
                  disabled={disabled}
                />
                <span className="location-picker-checkbox"></span>
                <FontAwesomeIcon icon={faWheelchair} />
                {t('clubForm.location.fields.accessibility')}
              </label>
            </div>

          </div>

          {/* Facilities */}
          <div className="location-picker-facilities">
            <h5 className="location-picker-facilities-title">
              {t('clubForm.location.facilities.title')}
            </h5>
            <div className="location-picker-facilities-grid">
              {facilities.map(facility => (
                <label
                  key={facility.value}
                  className="location-picker-facility-item"
                >
                  <input
                    type="checkbox"
                    checked={locationData?.venue?.facilities?.includes(facility.value) || false}
                    onChange={() => handleFacilityToggle(facility.value)}
                    disabled={disabled}
                  />
                  <span className="location-picker-facility-checkbox"></span>
                  <span className="location-picker-facility-label">{facility.label}</span>
                </label>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Help Section */}
      <div className="location-picker-help">
        <div className="location-picker-help-icon">
          <FontAwesomeIcon icon={faInfoCircle} />
        </div>
        <div className="location-picker-help-content">
          <h5>{t('clubForm.location.help.title')}</h5>
          <p>{t('clubForm.location.help.description')}</p>
        </div>
      </div>

    </div>
  );
};

export default LocationPicker;