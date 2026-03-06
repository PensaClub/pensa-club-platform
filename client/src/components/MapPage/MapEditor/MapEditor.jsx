import React, { useEffect, useState, useRef, Fragment } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  GeoJSON,
  useMapEvents,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-fullscreen";
import L, { DivIcon, point } from "leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import "./mapEditor.css";
import "./scrollModal.css";
import { LocalizedLink as Link } from '../../LocalizedLink/LocalizedLink';
import { useLocalizedNavigate } from '../../../hooks/useLocalizedNavigate';
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { useAuthContext } from "../../contexts/UserContext";
import { MapNotify } from "./MapNotifi";
import { MapSidebar } from "./MapSidebar"; // Import the MapSidebar component
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const createCustomClusterIcon = (cluster) => {
  return new DivIcon({
    html: `<div class="cluster-icon">${cluster.getChildCount()}</div>`,
    className: "custom-marker-cluster",
    iconSize: point(33, 33, true),
  });
};

L.Marker.prototype.options.icon = DefaultIcon;

const MapWithZoomControl = () => {
  const { t } = useTranslation(['community', 'auth']);
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
    container.addEventListener("wheel", handleWheel);

    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, [map]);

  return (
    <>
      {showModal && (
        <div className={`mapeditor-modal-overlay ${showModal ? "show" : ""}`}>
          <div className="mapeditor-modal-content">
            <p>{t("map.zoom_instructions")}</p>
          </div>
        </div>
      )}
    </>
  );
};

const ImageModal = ({ src, alt, onClose }) => (
  <div className="image-modal-overlay" onClick={onClose}>
    <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
      <button className="image-modal-close" onClick={onClose}>
        <FontAwesomeIcon icon={faXmark} style={{ color: "#000000" }} />
      </button>
      <img src={src} alt={alt} className="image-modal-img" />
    </div>
  </div>
);

export const MapEditor = ({ filteredUsers }) => {
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [showGeoJSON, setShowGeoJSON] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const mapContainerRef = useRef(null);
  const [modalImage, setModalImage] = useState(null);
  const [scrollPosition] = useState(0);
  const { isAuthentication } = useAuthContext();
  const navigate = useLocalizedNavigate();
  const { t } = useTranslation(['community', 'auth']);

  useEffect(() => {

    fetch("/Bulgaria_admin_level_6.geojson")
      .then((response) => response.json())
      .then((data) => {
        setGeoJsonData(data);
      })
      .catch((error) => console.error("Failed to load GeoJSON data", error));
  }, []);

  useEffect(() => {

    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsSidebarOpen(false);
      }
    };

    if (isSidebarOpen) {
      document.body.classList.add("active-sidebar");
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.body.classList.remove("active-sidebar");
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSidebarOpen]);

  const normalStyle = {
    fillColor: "#ffeb3b",
    weight: 1,
    opacity: 1,
    color: "#e91e63",
    fillOpacity: 0.15,
  };

  const onEachFeature = (feature, layer) => {
    layer.on("mouseover", (e) => {
      if (showGeoJSON) {
        e.target.setStyle({
          weight: 3,
          fillOpacity: 0.6,
          fillColor: "var(--green)",
          color: "var(--orange)",
        });
      }
    });

    layer.on("mouseout", (e) => {
      e.target.setStyle(normalStyle);
    });
  };

  const getRegionMarkerLocation = ({ region }) => {

    if (geoJsonData?.features) {
      const currRegion =
        region == "София-столица"
          ? "София-град"
          : region == "София"
            ? "Софийска"
            : region;
      const currGeoJson = geoJsonData["features"]?.filter(
        (r) => r.properties.name == currRegion
      )[0];
      const layer = L.geoJSON(currGeoJson);
      const bounds = layer.getBounds().getCenter();

      return [bounds?.lat, bounds?.lng];
    }
  };

  const handleAdClick = (ad) => {
    if (isAuthentication) {
      navigate(`/ad/details/${ad.adId}`);
    } else {
      setOpen(true);
    }
  };

  // const handleImageClick = (image) => {
  //   setModalImage(image);
  // };

  const closeNotify = () => {
    setOpen(false);
  };

  const closeModal = () => {
    setModalImage(null);
  };

  const MapEvents = () => {
    useMapEvents({
      zoomend: (e) => {
        const zoomLevel = e.target.getZoom();
        setShowGeoJSON(zoomLevel <= 12); 
      },
    });
    return null;
  };
  const handleReadMoreClick = (e, user) => {
    e.preventDefault();
    setSelectedUser(user);
    setIsSidebarOpen(true);

    if (mapContainerRef.current) {
      mapContainerRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      setTimeout(() => {
        window.scrollBy(0, 500);
      }, 500);
    }
  };

  const closeSidebar = () => {
    setSelectedUser(null);
    setIsSidebarOpen(false);
    window.scrollTo({
      top: scrollPosition,
      behavior: "smooth",
    });
  };

  const trimString = (str, num) => {
    if (str.length <= num) return str;
    return str.slice(0, num) + "...";
  };

  const position = [42.72991533257769, 24.674647996012656];

  return (
    <div className="map-editor">
      <div ref={mapContainerRef}>
        <MapContainer
          className="map-container"
          center={position}
          zoom={7}
          scrollWheelZoom={false}
          style={{ height: "70vh", width: "100%" }}
          fullscreenControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url={"https://tile.openstreetmap.org/{z}/{x}/{y}.png"}
          />
          <MapWithZoomControl />
          <MapEvents />

          <MarkerClusterGroup
            chunkedLoading
            iconCreateFunction={createCustomClusterIcon}
            showCoverageOnHover={false}
          >
            {filteredUsers.map(
              (user) =>
                user.details?.region && geoJsonData && (
                  <Marker
                    key={user.email}
                    position={getRegionMarkerLocation(user.details)}
                  >
                    <Popup>
                      <div className="ad-card-editor">
                        <img
                          src={
                            user?.details?.imageURL ||
                            "/images/homePage/avatar2.png"
                          }
                          alt={user.details.firstName}
                          className="ad-img-editor"
                        />
                        <div className="ad-details-editor">
                          <h3 className="ad-name-editor">
                            {user.details.username}
                          </h3>
                          {user.details.workOptions &&
                            user.details.workOptions.length > 0 && (
                              <p className="ad-description-editor">
                                {t("map.profession")}:{" "}
                                {user.details.workOptions
                                  .map((option) =>
                                    t(`options.work-options.${option}`)
                                  )
                                  .join(", ")}
                              </p>
                            )}
                          {user.details.interestOptions &&
                            user.details.interestOptions.length > 0 && (
                              <p className="ad-description-editor">
                                {t("map.interests")}:{" "}
                                {user.details.interestOptions
                                  .map((option) =>
                                    t(`options.interestOptions.${option}`)
                                  )
                                  .join(", ")}
                              </p>
                            )}
                          {user.details.skills &&
                            user.details.skills.length > 0 && (
                              <p className="ad-description-editor">
                                {t("map.skills")}:{" "}
                                {user.details.skills
                                  .map((option) =>
                                    t(`options.skills.${option}`)
                                  )
                                  .join(", ")}
                              </p>
                            )}
                          <Link
                            to="#"
                            id="read-more-editor"
                            className="read-more"
                            onClick={(e) => handleReadMoreClick(e, user)}
                          >
                            {t("map.read_more")}
                          </Link>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                )
            )}
          </MarkerClusterGroup>
          {showGeoJSON && geoJsonData && (
            <GeoJSON
              data={geoJsonData}
              style={normalStyle}
              onEachFeature={onEachFeature}
            />
          )}
        </MapContainer>
      </div>
      {selectedUser && (
        <MapSidebar
          selectedUser={selectedUser}
          userAds={
            filteredUsers.find((user) => user.email === selectedUser.email)
              ?.ads || []
          }
          closeSidebar={closeSidebar}
          setModalImage={setModalImage}
        />
      )}
      {open && !isAuthentication && <MapNotify onClose={closeNotify} />}
      {modalImage && (
        <ImageModal src={modalImage} alt="Ad Image" onClose={closeModal} />
      )}
    </div>
  );
};
