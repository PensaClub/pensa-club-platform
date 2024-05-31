import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-fullscreen';

import './mapEditor.css';
import L, { DivIcon, point } from 'leaflet';
import { Link } from 'react-router-dom';
import MarkerClusterGroup from 'react-leaflet-cluster';


const DefaultIcon = L.icon({
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});
const createCustomClusterIcon = (cluster) => {
    return new DivIcon({
        html: `<div class="cluster-icon">${cluster.getChildCount()}</div>`,
        className: 'custom-marker-cluster',
        iconSize: point(33, 33, true)
    });
};
L.Marker.prototype.options.icon = DefaultIcon;
const adsData = [
    {
        id: 1,
        name: "John Doe",
        description: "Looking for help with gardening.",
        img: "https://toppng.com/uploads/preview/stock-person-png-stock-photo-man-11563049686zqeb9zmqjd.png",
        position: [42.7003941385199, 23.388164180994426]
    },
    {
        id: 2,
        name: "Jane Smith",
        description: "Need assistance with grocery shopping.",
        img: "https://toppng.com/uploads/preview/free-png-happy-black-person-png-images-transparent-black-man-thumbs-up-11563648491mkncpzrjrf.png",
        position: [42.701655682184395, 23.335979128141805]
    },
    {
        id: 3,
        name: "Bobi Iliev",
        description: "Need assistance with grocery shopping.",
        img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqZctoWcCyQuSUlcN9bKPmSD-B8Gyy_mVo5A&s",
        position: [42.68373935990047, 23.33872570987089]
    },
];
const position = [42.72991533257769, 24.674647996012656]; // начaлнa позиция -задал съм България

export const MapEditor = () => {
    const [geoJsonData, setGeoJsonData] = useState(null);
    const [showGeoJSON, setShowGeoJSON] = useState(true);

    useEffect(() => {
        fetch('/Bulgaria_admin_level_6.geojson')
            .then(response => response.json())
            .then(data => {
                setGeoJsonData(data);
            })
            .catch(error => console.error('Failed to load GeoJSON data', error));
    }, []);

    const normalStyle = {
        fillColor: '#ffeb3b',
        weight: 1,
        opacity: 1,
        color: '#e91e63',
        fillOpacity: 0.15,
    };

    const onEachFeature = (feature, layer) => {
        layer.on('mouseover', (e) => {
            if (showGeoJSON) {
                e.target.setStyle({
                    weight: 3,
                    fillOpacity: 0.6,
                    fillColor: 'var(--green)',
                    color: 'var(--orange)',
                });
                // e.target.bringToFront(); ненужно за момента 
            }
        });

        layer.on('mouseout', (e) => {
            e.target.setStyle(normalStyle);
        });
    };

    const MapEvents = () => {
        useMapEvents({
            zoomend: (e) => {
                const zoomLevel = e.target.getZoom();
                setShowGeoJSON(zoomLevel <= 12); // направил съм го да изключи над този zoom level 
            }
        });
        return null;
    };

    return (
        <MapContainer center={position} zoom={7} scrollWheelZoom={false} style={{ height: "70vh", width: "100%" }} fullscreenControl={true}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url={'https://tile.openstreetmap.org/{z}/{x}/{y}.png'}
            />
            <MapEvents />
            <MarkerClusterGroup
                chunkedLoading
                iconCreateFunction={createCustomClusterIcon}
                showCoverageOnHover={false}
                
            >
                {adsData.map(ad => (
                    <Marker key={ad.id} position={ad.position}>
                        <Popup>
                            <div className="ad-card-editor">
                                <img src={ad.img} alt={ad.name} className="ad-img-editor" />
                                <div className="ad-details-editor">
                                    <h3 className="ad-name-editor">{ad.name}</h3>
                                    <p className="ad-description-editor">{ad.description}</p>
                                    <Link to="#" id="read-more-editor" className="read-more">Прочети повече</Link>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MarkerClusterGroup>
            {showGeoJSON && geoJsonData && (
                <GeoJSON data={geoJsonData} style={normalStyle} onEachFeature={onEachFeature} />
            )}
        </MapContainer>
    );
};
