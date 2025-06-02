import { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import './initiativesMap.css';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export const InitiativesMap = ({ initiatives, onHide }) => {
    const { t } = useTranslation();

    // Премахваме grouping логиката - cluster ще се прави автоматично
    const markers = useMemo(() => {
        return initiatives.map((initiative, index) => ({
            id: initiative.id || index,
            position: [initiative.location.coordinates.lat, initiative.location.coordinates.lng],
            initiative: initiative
        }));
    }, [initiatives]);

    const createCustomIcon = (count) => {
        return L.divIcon({
            className: 'custom-marker',
            html: `
        <div class="marker-circle">
          <span class="marker-number">${count}</span>
        </div>
      `,
            iconSize: [40, 40],
            iconAnchor: [20, 20],
        });
    };

    const createCustomIconWithCounter = (count) => {
        return L.divIcon({
            className: 'custom-png-marker',
            html: `
      <div class="png-marker-wrapper">
        <img src="/images/map/map-icon.png" alt="marker" class="marker-image"/>
        <span class="marker-counter">${count}</span>
      </div>
    `,
            iconSize: [40, 40],
            iconAnchor: [20, 40],
            popupAnchor: [0, -40]
        });
    };

    // Custom cluster icon
    const createClusterCustomIcon = (cluster) => {
        return L.divIcon({
            html: `<div class="cluster-icon">${cluster.getChildCount()}</div>`,
            className: 'custom-marker-cluster',
            iconSize: [40, 40],
        });
    };

    return (
        <div className="initiatives-map-container">
            <div className="map-header">
                <h2 className="map-title">
                    {initiatives.length} {t('initiatives.map.projectsIn')} {initiatives.length > 1 ? t('initiatives.map.locations') : t('initiatives.map.location')}
                </h2>
                <button className="hide-map-btn" onClick={onHide}>
                    ⊗ {t('initiatives.map.hideMap')}
                </button>
            </div>

            <div className="leaflet-map-wrapper">
                <MapContainer
                    center={[42.7339, 25.4858]}
                    zoom={7}
                    style={{ height: '500px', width: '100%' }}
                    zoomControl={true}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
                    />

                    <MarkerClusterGroup
                        chunkedLoading
                        iconCreateFunction={createClusterCustomIcon}
                        maxClusterRadius={80}
                        spiderfyOnMaxZoom={true}
                        showCoverageOnHover={false}
                        zoomToBoundsOnClick={true}
                    >
                        {markers.map((marker) => (
                            <Marker
                                key={marker.id}
                                position={marker.position}
                                icon={createCustomIconWithCounter(1)}
                            >
                                <Popup>
                                    <div className="map-popup">
                                        <h3>{marker.initiative.title}</h3>
                                        <p>{marker.initiative.shortDescription}</p>
                                        <div className="initiative-info">
                                            <span className="status-badge-view status-{marker.initiative.status}">
                                                {t('initiatives.map.status')}: {marker.initiative.status}
                                            </span>
                                            {marker.initiative.category && (
                                                <span className="category-badge">
                                                    {t('initiatives.map.category')}: {marker.initiative.category}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MarkerClusterGroup>
                </MapContainer>
            </div>

            <div className="map-footer">
                <span>Pensa club </span>
                <Link to="/privacy-policy" className="privacy-link">
                    {t('initiatives.map.privacyStatement')}
                </Link>
            </div>
        </div>
    );
};