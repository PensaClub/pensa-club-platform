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

const userAds = {
    "user": {
        "id": 1,
        "name": "John Doe",
        "phone": "123-456-7890",
        interestOptions: "Нови Знания",
        workOptions: "Журналистика",
        email: "john@abv.bg",
        img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqZctoWcCyQuSUlcN9bKPmSD-B8Gyy_mVo5A&s",

        "ads": [
            {
                "id": 1,
                "title": "Gardening Help Needed",
                "description": "Looking for someone to help with gardening.",
                img: "/images/map/add.png",

            },
            {
                "id": 2,
                "title": "Grocery Shopping Assistance",
                "description": "Need assistance with grocery shopping.",
                img: "/images/map/add.png",

            },
            {
                "id": 3,
                "title": "Dog Walking",
                "description": "Looking for someone to walk my dog.",
                img: "/images/map/add.png",

            },
            {
                "id": 4,
                "title": "Dog Walking",
                "description": "Looking for someone to walk my dog.",
                img: "/images/map/add.png",

            },
            {
                "id": 5,
                "title": "Dog Walking",
                "description": "Looking for someone to walk my dog.",
                img: "/images/map/add.png",

            },
            {
                "id": 6,
                "title": "Dog Walking",
                "description": "Looking for someone to walk my dog.",
                img: "/images/map/add.png",

            },
            {
                "id": 7,
                "title": "Dog Walking",
                "description": "Looking for someone to walk my dog.",
                img: "/images/map/add.png",

            }
        ]
    }
};

const position = [42.72991533257769, 24.674647996012656];
const MapWithZoomControl = () => {
    const map = useMap();
    const [showModal,setShowModal]=useState(false);
    useEffect(() => {
        const handleWheel = (e) => {
            if (e.ctrlKey) {
                e.preventDefault();
                if (e.deltaY > 0) {
                    map.zoomOut();
                } else {
                    map.zoomIn();
                }
            }else{
                setShowModal(true)
                setTimeout(()=>{
                setShowModal(false)

                },3000)
            }
        };

        const container = map.getContainer();
        container.addEventListener('wheel', handleWheel);

        return () => {
            container.removeEventListener('wheel', handleWheel);
        };
    }, [map]);

    return (
            <>
                {showModal && (
                    <div className={`mapeditor-modal-overlay ${showModal ? 'show' : ''}`}>
                    <div className="mapeditor-modal-content">
                        Задръжте бутона Ctrl натиснат, докато превъртате,за да промените мащаба на картата
                    </div>
                </div>
                )}
            
            </>

    )
};
export const MapEditor = () => {
    const [geoJsonData, setGeoJsonData] = useState(null);
    const [showGeoJSON, setShowGeoJSON] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const sidebarRef = useRef(null);

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

    const handleReadMoreClick = (e, userId) => {
        e.preventDefault();
        const user = userAds.user;
        setSelectedUser(user);
        // console.log("User selected:", user);  
        setIsSidebarOpen(true);
    };

    const closeSidebar = () => {
        setSelectedUser(null);
        setIsSidebarOpen(false);
    };

    return (
        <div className="map-editor">
            {/* <button id="toggleSidebar" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>Toggle Sidebar</button> */}
            <MapContainer className="map-container"center={position} zoom={7} scrollWheelZoom={false} style={{ height: "70vh", width: "100%" }} fullscreenControl={true}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url={'https://tile.openstreetmap.org/{z}/{x}/{y}.png'}
                />
                <MapWithZoomControl/>
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
                                        <Link to="#" id="read-more-editor" className="read-more" onClick={(e) => handleReadMoreClick(e, ad.id)}>Прочети повече</Link>
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
            {selectedUser && (
                    <div className="sidebar-map" ref={sidebarRef}>
                        <button className="close-button" onClick={closeSidebar}>Close</button>
                        <div className="sidebar-content">
                            <h2>{selectedUser.name}</h2>
                            <div className="user-map-info">
                                <img className="user-map-img" src={selectedUser.img} alt="user-img" />
                                <div className="map-desc-user">
                                    <p>Професия: {selectedUser.workOptions}</p>
                                    <p>Интереси: {selectedUser.interestOptions} </p>
                                    <p>Телефон: <Link to={`tel:${selectedUser.phone}`}>{selectedUser.phone}</Link></p>
                                    <p>Имейл: <Link to={`mailto:${selectedUser.email}`}>{selectedUser.email}</Link></p>
                                </div>
                            </div>
                            <div className="color-lines-pipe"></div>
                                <h3 className="ad-title" >Обяви на {selectedUser.name}</h3>
                            <div className="color-lines-pipe"></div>

                            <div className='ad-scroll'> 
                                {selectedUser.ads.length>0 ? selectedUser.ads.map(ad => (
                                    <>
                                        <div key={ad.id} className="ad-map">
                                            <img src={ad.img} alt="ad-img" />
                                            <div className="ad-desc">
                                                <h3>{ad.title}</h3>
                                                <p>{ad.description}</p>
                                            </div>
                                        </div>
                                        <div className="color-lines"></div>
                                    </>
                                )):<h3>В момента няма обяви</h3>}
                            </div>

                        </div>
                    </div>
                )}
        </div>
    );
};
