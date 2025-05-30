import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
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

    const cityGroups = useMemo(() => {
        const groups = {};
        initiatives.forEach(initiative => {
            const cityKey = initiative.location.address;
            if (!groups[cityKey]) {
                groups[cityKey] = {
                    city: cityKey,
                    coordinates: initiative.location.coordinates,
                    initiatives: [],
                    count: 0
                };
            }
            groups[cityKey].initiatives.push(initiative);
            groups[cityKey].count++;
        });
        return Object.values(groups);
    }, [initiatives]);

    const uniqueCities = cityGroups.length;

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
            iconSize: [10, 10],
            iconAnchor: [15, 30],
            popupAnchor: [0, -30]
        });
    };
    return (
        <div className="initiatives-map-container">
            <div className="map-header">
                <h2 className="map-title">
                    {initiatives.length} {t('initiatives.map.projectsIn')} {uniqueCities} {t('initiatives.map.cities')}
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

                    {cityGroups.map((group, index) => (
                        <Marker
                            key={index}
                            position={[group.coordinates.lat, group.coordinates.lng]}
                            icon={createCustomIconWithCounter(group.count)}
                        >
                            <Popup>
                                <div className="map-popup">
                                    <h3>{group.city}</h3>
                                    <p><strong>{group.count}</strong> {t('initiatives.map.initiatives')}</p>
                                    <div className="initiative-list">
                                        {group.initiatives.slice(0, 3).map((initiative, idx) => (
                                            <div key={idx} className="initiative-item">
                                                • {initiative.title}
                                            </div>
                                        ))}
                                        {group.initiatives.length > 3 && (
                                            <div className="more-initiatives">
                                                +{group.initiatives.length - 3} {t('initiatives.map.more')}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
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