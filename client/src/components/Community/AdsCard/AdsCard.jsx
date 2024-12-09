import { useState } from "react";
import "./adsCard.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { AdsCardSkeleton } from "../AdsCardSkeleton/AdsCardSkeleton";
import { useTranslation } from "react-i18next";
import { useAuthContext } from "../../contexts/UserContext";
import { useNavigate } from "react-router-dom";
import { AdModalNotify } from "./AdModalNotify";

const ImageModal = ({ src, alt, onClose }) => (
  <div className="image-modal-overlay-ads" onClick={onClose}>
    <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
      <button className="image-modal-close" onClick={onClose}>
        {" "}
        <FontAwesomeIcon icon={faXmark} style={{ color: "#000000" }} />
      </button>
      <img src={src} alt={alt} className="image-modal-img" />
    </div>
  </div>
);

export const AdsCard = ({ ads, isLoading }) => {
  const { isAuthentication } = useAuthContext();
  const [modalImage, setModalImage] = useState(null);
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();

  const getProfileImage = (gender) => {
    switch (gender) {
      case "male":
        return "/images/homePage/user-male.png";
      case "female":
        return "/images/homePage/user-female.png";
      case "other":
        return "/images/homePage/user-it.png";
      default:
        return "/images/homePage/user-female.png";
    }
  };

  if (isLoading && ads.result.length === 0) {
    return (
      <section className="ads-main">
        {Array(3)
          .fill()
          .map((_, index) => (
            <AdsCardSkeleton key={index} />
          ))}
      </section>
    );
  }

  const handleImageClick = (image) => {
    setModalImage(image);
  };

  const handleAdClick = (ad) => {
    if (isAuthentication) {
      navigate(`/ad/details/${ad.adId}`);
    } else {
      setOpen(true);
    }
  };

  const closeModal = () => {
    setModalImage(null);
  };

  const closeNotify = () => {
    setOpen(false);
  };

  return (
    <>
      <section className="ads-main">
        {ads.result.map((ad) => (
          <div key={ad.adId} className="ads-card">
            <div
              className="img-ads"
              onClick={() => handleImageClick(ad.images[0].imageURL)}
            >
              <img src={ad.images[0].imageURL} alt={ad.summary} />
              <p>{t(`search-criteria.${ad.category}`)}</p>
            </div>
            <div className="ads-info" onClick={() => handleAdClick(ad)}>
              <h3 className="title-card">{ad.summary}</h3>
              {ad.extraFields.price && (
                <p className="price">
                  {ad.extraFields.price} {t("ads.price_lv")}{" "}
                </p>
              )}
              {ad.tags.length > 0 && (
                <div className="subinfo-ads">
                  {ad.tags.map((tag) => (
                    <p key={tag + 1}>
                      {"#"}
                      {tag}
                    </p>
                  ))}
                </div>
              )}
              <div className="ads-user-info">
                <img
                  src={
                    ad.account.details.imageURL ||
                    getProfileImage(ad.account.details.gender)
                  }
                  alt={ad.account.details.username}
                />
                <p>{ad.account.details.username}</p>
                <div className="ads-data-elipse">
                  <svg
                    aria-hidden="true"
                    focusable="false"
                    data-prefix="fas"
                    data-icon="location-dot"
                    class="svg-inline--fa fa-location-dot commun-icon"
                    role="img"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 384 512"
                  >
                    <path
                      fill="currentColor"
                      d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"
                    ></path>
                  </svg>
                  <p className="elipse">{ad.adTown}</p>
                </div>
              </div>
              {/* <p className="ads-data">
                {t("community.validate_until")} :{" "}
                {new Date(ad.expirationDate).toLocaleDateString("bg-BG")}
              </p> */}
            </div>
          </div>
        ))}
      </section>
      {open && !isAuthentication && <AdModalNotify onClose={closeNotify} />}
      {modalImage && (
        <ImageModal src={modalImage} alt="Ad Image" onClose={closeModal} />
      )}
    </>
  );
};
