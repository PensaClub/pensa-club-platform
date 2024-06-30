import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-fullscreen';
import L, { DivIcon, point } from 'leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import './mapEditor.css';
import './sidebar.css';
import './scrollModal.css';

import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../../contexts/UserContext';

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

const MapWithZoomControl = () => {
    const map = useMap();
    const [showModal, setShowModal] = useState(false);
    useEffect(() => {
        const handleWheel = (e) => {
            if (e.ctrlKey) {
                e.preventDefault();
                if (e.deltaY > 0) {
                    map.zoomOut();
                } else {
                    map.zoomIn();
                }
            } else {
                setShowModal(true);
                setTimeout(() => {
                    setShowModal(false);
                }, 3000);
            }
        };

        const container = map.getContainer();
        container.addEventListener('wheel', handleWheel,);

        return () => {
            container.removeEventListener('wheel', handleWheel);
        };
    }, [map]);

    return (
        <>
            {showModal && (
                <div className={`mapeditor-modal-overlay ${showModal ? 'show' : ''}`}>
                    <div className="mapeditor-modal-content">
                        Задръжте бутона Ctrl натиснат, докато превъртате, за да промените мащаба на картата
                    </div>
                </div>
            )}
        </>
    );
};

export const MapEditor = ({ filteredUsers }) => {
    const [geoJsonData, setGeoJsonData] = useState(null);
    const [showGeoJSON, setShowGeoJSON] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const{profileData} = useAuthContext()
    
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const sidebarRef = useRef(null);
    const { t } = useTranslation(); 
    useEffect(() => {
        fetch('/Bulgaria_admin_level_6.geojson')
            .then(response => response.json())
            .then(data => {
                setGeoJsonData(data);
            })
            .catch(error => console.error('Failed to load GeoJSON data', error));
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                setIsSidebarOpen(false);
            }
        };

        if (isSidebarOpen) {
            document.body.classList.add('active-sidebar');
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.body.classList.remove('active-sidebar');
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isSidebarOpen]);

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

    const handleReadMoreClick = (e, user) => {
        e.preventDefault();
        setSelectedUser(user);
        setIsSidebarOpen(true);
    };

    const closeSidebar = () => {
        setSelectedUser(null);
        setIsSidebarOpen(false);
    };

    const position = [42.72991533257769, 24.674647996012656];

    return (
        <div className="map-editor">
            <MapContainer className="map-container" center={position} zoom={7} scrollWheelZoom={false} style={{ height: "70vh", width: "100%" }} fullscreenControl={true}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url={'https://tile.openstreetmap.org/{z}/{x}/{y}.png'}
                />
                <MapWithZoomControl />
                <MapEvents />

                <MarkerClusterGroup
                    chunkedLoading
                    iconCreateFunction={createCustomClusterIcon}
                    showCoverageOnHover={false}
                >
                    {filteredUsers.map(user => (
                        user.details?.location && (
                            <Marker key={user.email} position={[user.details.location.lat, user.details.location.lon]}>
                                <Popup>
                                    <div className="ad-card-editor">
                                  <img src={user?.details?.imageURL || "/images/homePage/avatar2.png"} alt={user.details.firstName} className="ad-img-editor" /> {/* <-- Отметка тук */}
                                        <div className="ad-details-editor">
                                        <h3 className="ad-name-editor">{user.details.firstName} {user.details.lastName}</h3>
                                            <p className="ad-description-editor">Професия: {user.details.workOptions ? user.details.workOptions.map(option => t(`options.work-options.${option}`)).join(', ') : 'Няма информация'}</p> {/* Проверка за work_options */}
                                            <p className="ad-description-editor">Интереси: {user.details.interestOptions ? user.details.interestOptions.map(option => t(`options.interestOptions.${option}`)).join(', ') : 'Няма информация'}</p> {/* Проверка за interest_options */}
                                            <p className="ad-description-editor">Умения: {user.details.skills ? user.details.skills.map(option => t(`options.skills.${option}`)).join(', ') : 'Няма информация'}</p> {/* Проверка за skillss */}
                                            <Link to="#" id="read-more-editor" className="read-more" onClick={(e) => handleReadMoreClick(e, user)}>Прочети повече</Link>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        )
                    ))}
                </MarkerClusterGroup>
                {showGeoJSON && geoJsonData && (
                    <GeoJSON data={geoJsonData} style={normalStyle} onEachFeature={onEachFeature} />
                )}
            </MapContainer>
            {selectedUser && (
                <div className="sidebar-map" ref={sidebarRef}>
                    <button className="close-button" onClick={closeSidebar}>Close</button>
                    <div className="sidebar-content">
                        <h2>{selectedUser.details.firstName} {selectedUser.details.lastName}</h2>
                        <div className="user-map-info">
                        <img className="user-map-img" src={selectedUser?.details?.imageURL  || "/images/homePage/avatar2.png"} alt="user-img" />
                            <div className="map-desc-user">
                            <p>Професия: {selectedUser.details.workOptions ? selectedUser.details.workOptions.map(option => t(`options.work-options.${option}`)).join(', ') : 'Няма информация'}</p> {/* Проверка за work_options */}
                                <p>Интереси: {selectedUser.details.interestOptions ? selectedUser.details.interestOptions.map(option => t(`options.interestOptions.${option}`)).join(', ') : 'Няма информация'}</p> {/* Проверка за interest_options */}
                                <p>Умения: {selectedUser.details.skills ? selectedUser.details.skills.map(option => t(`options.skills.${option}`)).join(', ') : 'Няма информация'}</p> {/* Проверка за skillss */}
                                <p>Телефон: <Link to={`tel:${selectedUser.details.phoneNumber}`}>{selectedUser.details.phoneNumber}</Link></p>
                                <p>Имейл: <Link to={`mailto:${selectedUser.email}`}>{selectedUser.email}</Link></p>
                            </div>
                        </div>
                        <div className="color-lines-pipe"></div>
                        <h3 className="ad-title">Обяви на {selectedUser.details.firstName}</h3>
                        <div className="color-lines-pipe"></div>

                        <div className='ad-scroll'>
                            {selectedUser.details.ads && selectedUser.details.ads.length > 0 ? selectedUser.details.ads.map(ad => (
                                <div key={ad.id} className="ad-map">
                                    <img src={ad.img} alt="ad-img" />
                                    <div className="ad-desc">
                                        <h3>{ad.title}</h3>
                                        <p>{ad.description}</p>
                                    </div>
                                    <div className="color-lines"></div>
                                </div>
                            )) : <h3>В момента няма обяви</h3>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
