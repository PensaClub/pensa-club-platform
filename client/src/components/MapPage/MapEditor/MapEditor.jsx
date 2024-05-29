import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './mapEditor.css'
import L from 'leaflet';
import { Link } from 'react-router-dom';

// Задаване на правилните икони за маркерите
const DefaultIcon = L.icon({
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;
const adsData = [
    {
        id: 1,
        name: "John Doe",
        description: "Looking for help with gardening.",
        img: "http://1.gravatar.com/avatar/47db31bd2e0b161008607d84c74305b5?s=96&d=mm&r=g",
        position: [51.505, -0.09]
    },
    {
        id: 2,
        name: "Jane Smith",
        description: "Need assistance with grocery shopping.",
        img: "http://1.gravatar.com/avatar/47db31bd2e0b161008607d84c74305b5?s=96&d=mm&r=g",
        position: [51.515, -0.1]
    },  
     {
        id: 2,
        name: "Bobi Iliev",
        description: "Need assistance with grocery shopping.",
        img: "http://1.gravatar.com/avatar/47db31bd2e0b161008607d84c74305b5?s=96&d=mm&r=g",
        position: [51.515, -0.2]
    },

];
const position = [51.505, -0.09];

export const MapEditor = () => {
    return (
        <MapContainer center={position} zoom={13} scrollWheelZoom={false} style={{ height: "70vh", width: "100%" }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url={`https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiYmVibzEzMTMzIiwiYSI6ImNsd3E4N2Y2MzEzNWsyanFxcXl0c3g3c24ifQ.4JNDXk3JlfP59tzu1stwOw`}
                // url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
           />
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
        </MapContainer>
    );
};
