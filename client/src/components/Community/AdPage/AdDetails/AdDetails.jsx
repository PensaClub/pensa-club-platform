import { useEffect, useState, useContext, useRef } from "react";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPhone,
  faEnvelope,
  faShareNodes,
  faChevronLeft,
  faCaretLeft,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { HeaderCommunity } from "../../HeaderCommunity/HeaderCommunity";
import { ImageEnlarger } from "../../../ImageEnlarger/ImageEnlarger";
import "./adDetails.css";
import "./sidebar-details.css";
import "./../../../MapPage/MapEditor/scrollModal.css";
import { Link, useParams, useNavigate } from "react-router-dom";
import { SearchBar } from "../../SearchBar/SearchBar";
import { CommunityContext } from "../../../contexts/CommunityContext";
import { UserSidebar } from "./UserSidebar";
import { toast } from "react-toastify";

const ImageModal = ({ src, alt, onClose }) => (
  <div
    className="image-modal-overlay"
    onClick={(e) => {
      e.stopPropagation();
      onClose(e);
    }}
  >
    <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
      <button
        className="image-modal-close"
        onClick={(e) => {
          e.stopPropagation();
          onClose(e);
        }}
      >
        <FontAwesomeIcon icon={faXmark} style={{ color: "#000000" }} />
      </button>
      <img src={src} alt={alt} className="image-modal-img" />
    </div>
  </div>
);

export const AdDetails = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [ad, setAd] = useState({});
  const [userDetails, setUserDetails] = useState({});
  const [adTownName, setAdTownName] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userAds, setUserAds] = useState([]);
  const { getAdById, fetchTowns, getMyAds } = useContext(CommunityContext);
  const { adId } = useParams();
  const [modalImage, setModalImage] = useState(null);
  const adContainerRef = useRef(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  useEffect(() => {
    async function fetchAd() {
      try {
        const response = await getAdById(adId);
        if (!response.ads) navigate("/404");
        setAd(response.ads);
        setUserDetails(response.details);
        const townsData = await fetchTowns(
          Number(response.ads.adRegion),
          Number(response.ads.adSubregion)
        );
        const town = townsData?.find(
          (t) => t.id === Number(response.ads.adTown)
        );
        const townName = i18n.language === "bg" ? town.bg : town.en;
        setAdTownName(townName);
      } catch (error) {
        console.error("Failed to fetch ad", error);
      }
    }
    fetchAd();
  }, [adId, i18n.language]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  const handleSearchRedirect = (filters) => {
    const searchParams = new URLSearchParams(filters).toString();
    navigate(`/craigslist?${searchParams}`);
  };

  const handleReadMoreClick = async (e) => {
    e.preventDefault();
    if (isSidebarOpen) return;
    try {
      const userAdsResponse = await getMyAds(ad?.account?.email);
      const sortedAds = userAdsResponse?.ads.sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
      );
      setUserAds({ ...userAdsResponse, ads: sortedAds });
      setSelectedUser(userDetails);
      setIsSidebarOpen(true);
      if (adContainerRef.current) {
        adContainerRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });

        setTimeout(() => {
          window.scrollBy(0, 500);
        }, 500);
      }
    } catch (error) {
      console.error("Failed to fetch user ads", error);
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

  const shareAd = async () => {
    const shareData = {
      title: ad.summary,
      text: ad.description,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        toast.error(t("errors.share"));
      }
    } else {
      toast.error(t("errors.share"));
    }
  };

  const handlePhoneClick = (e) => {
    if (!userDetails?.phoneNumber) {
      e.preventDefault();
      toast.error(t("missing_phone"));
    }
  };

  const handleEmailClick = (e) => {
    if (!ad?.account?.email) {
      e.preventDefault();
      toast.error(t("missing_email"));
    }
  };

  const closeModal = (e) => {
    e.stopPropagation();
    setModalImage(null);
  };

  const getProfileImage = (gender) => {
    switch (gender) {
      case "male":
        return "/images/homePage/user-male.png";
      case "female":
        return "/images/homePage/user-female.png";
      case "other":
        return "/images/homePage/user-it.png";
      default:
        return "/images/homePage/user-img.png";
    }
  };

  return (
    <>
      <section className="background-ads-details">
        <section className="ads-details-page" ref={adContainerRef}>
          <section className="main-details">
            <div className="hero-bg-details"></div>

            <div className="hero-section-details">
              <div className="ad-details-back-phone">
                <p>
                  <Link to="/craigslist">
                    <FontAwesomeIcon icon={faCaretLeft} />{" "}
                  </Link>
                </p>{" "}
              </div>
              <h2 className="ads-details-back">
                <Link to="/craigslist">
                  <FontAwesomeIcon icon={faChevronLeft} />{" "}
                  <strong>{t("ads.all-ads")}</strong>
                </Link>
              </h2>
              <section className="ads-details-main">
                <div className="ads-details-container">
                  <div className="ads-details-card">
                    <div className="img-ads-details">
                      <div className="position-category">
                        {ad?.images && ad?.images?.length > 0 && (
                          <ImageEnlarger
                            images={ad?.images.map((img) => img.imageURL)}
                            ad={ad}
                            t={t}
                          />
                        )}
                        <p className="position-text-absolute">
                          {t(`search-criteria.${ad?.category}`)}
                        </p>
                      </div>
                    </div>
                    <div className="ads-details-info">
                      <div className="ads-details-desc">
                        <h2 className="title-details">{ad?.summary}</h2>
                        <div className="subinfo-ads-details">
                          <p>
                          <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="location-dot" className="svg-inline--fa fa-location-dot icon" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path fill="currentColor" d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"></path></svg>
                          { adTownName && (adTownName + ", ")}{ad?.street && ("ул. " + ad?.street)}
                          </p>
                          {ad?.extraFields?.price && (
                            <p className="elipse price">
                              {" "}
                              {ad?.extraFields?.price} {t("ads.price_lv")}{" "}
                            </p>
                          )}
                        </div>
                        <hr />
                        <h3>{t("ads.description")}</h3>
                        {ad?.extraFields?.eventStartDate &&
                        ad?.extraFields?.eventEndDate && (
                          <div className="ads-data-elipse">
                            <p className="elipse">
                              {t("ads.event_start_date")}:{" "}
                              {new Date(
                                ad?.extraFields?.eventStartDate
                              ).toLocaleDateString(i18n.language)}
                            </p>
                            <p className="elipse">
                              {t("ads.event_end_date")}:{" "}
                              {new Date(
                                ad?.extraFields?.eventEndDate
                              ).toLocaleDateString(i18n.language)}
                            </p>
                          </div>
                        )}
                        <h5>{ad?.description}</h5>
                      </div>
                      <div className="ads-details-icons">
                        <Link
                          to={
                            userDetails?.phoneNumber
                              ? `tel:${userDetails?.phoneNumber}`
                              : "#"
                          }
                          onClick={handlePhoneClick}
                        >
                          <div className="group-icon">
                            <FontAwesomeIcon icon={faPhone} className="icon" />
                            {userDetails?.phoneNumber ? (
                              <p>{userDetails?.phoneNumber}</p>
                            ) : (
                              <p>{t("ads.call")}</p>
                            )}
                          </div>
                        </Link>
                        <Link
                          to={
                            ad?.account?.email
                              ? `mailto:${ad?.account?.email}`
                              : "#"
                          }
                          onClick={handleEmailClick}
                        >
                          <div className="group-icon">
                            <FontAwesomeIcon
                              icon={faEnvelope}
                              className="icon"
                            />
                            <p>{ad?.account?.email}</p>
                          </div>
                        </Link>
                        <Link>
                          <div className="group-icon">
                            <button
                              onClick={shareAd}
                              style={{
                                background: "none",
                                cursor: "pointer",
                              }}
                            >
                              <FontAwesomeIcon
                                icon={faShareNodes}
                                className="icon"
                              />
                              <p>{t("ads.share")}</p>
                            </button>
                          </div>
                        </Link>
                      </div>
                      {/* <div className="ads-details-icons">
                        <Link
                          to={
                            userDetails?.phoneNumber
                              ? `tel:${userDetails?.phoneNumber}`
                              : "#"
                          }
                          onClick={handlePhoneClick}
                        >
                          <div className="group-icon">
                            <FontAwesomeIcon icon={faPhone} className="icon" />
                            {userDetails?.phoneNumber ? (
                              <p>{userDetails?.phoneNumber}</p>
                            ) : (
                              <p>{t("ads.call")}</p>
                            )}
                          </div>
                        </Link>
                        <Link
                          to={
                            ad?.account?.email
                              ? `mailto:${ad?.account?.email}`
                              : "#"
                          }
                          onClick={handleEmailClick}
                        >
                          <div className="group-icon">
                            <FontAwesomeIcon
                              icon={faEnvelope}
                              className="icon"
                            />
                            <p>{ad?.account?.email}</p>
                          </div>
                        </Link>
                        <Link>
                          <div className="group-icon">
                            <button
                              onClick={shareAd}
                              style={{ background: "none", cursor: "pointer" }}
                            >
                              <FontAwesomeIcon
                                icon={faShareNodes}
                                className="icon"
                              />
                              <p>{t("ads.share")}</p>
                            </button>
                          </div>
                        </Link>
                      </div> */} <div className="tags-details-mapping">
                          {ad?.tags &&
                            ad?.tags?.length > 0 &&
                            ad?.tags?.map((tag, index) => (
                              <h5 key={index}>{tag}</h5>
                            ))}
                        </div>
                      <section className="user-info-details">
                        <div className="ads-details-user-info">
                        <p className="ads-details-data">
                        {t("community.validate_until")}: {""}
                        <span>
                          {ad?.expirationDate
                            ? new Date(ad?.expirationDate).toLocaleDateString(
                                i18n.language
                              )
                            : ""}
                        </span>
                      </p>
                          <div className="ads-details-username">
                            <img
                              src={
                                userDetails?.imageURL ||
                                getProfileImage(userDetails?.gender)
                              }
                              alt={userDetails?.username}
                            />
                            <Link to="#" onClick={handleReadMoreClick}>
                              <span className="details-underlined">
                                {userDetails?.username}
                              </span>
                            </Link>
                          </div>
                          {/* {userDetails?.workOptions &&
                            userDetails?.workOptions?.length > 0 && (
                              <p>
                                {t("map.job")}:{" "}
                                {userDetails?.workOptions.map((opt, index) => {
                                  if (index < 2) {
                                    return (
                                      <span key={index}>
                                        {t(`options.work-options.${opt}`)},{" "}
                                      </span>
                                    );
                                  }
                                  if (index === 2) {
                                    return (
                                      <span key={index}>
                                        {t("map.and")}{" "}
                                        {userDetails?.workOptions?.length - 2}{" "}
                                        {t("map.more")}...
                                      </span>
                                    );
                                  }
                                  return null;
                                })}
                              </p>
                            )}
                          {userDetails?.interestOptions &&
                            userDetails?.interestOptions?.length > 0 && (
                              <p>
                                {t("map.interests")}:{" "}
                                {userDetails?.interestOptions.map(
                                  (opt, index) => {
                                    if (index < 2) {
                                      return (
                                        <span key={index}>
                                          {t(`options.interestOptions.${opt}`)},{" "}
                                        </span>
                                      );
                                    }
                                    if (index === 2) {
                                      return (
                                        <span key={index}>
                                          {t("map.and")}{" "}
                                          {userDetails?.interestOptions
                                            ?.length - 2}{" "}
                                          {t("map.more")}...
                                        </span>
                                      );
                                    }
                                    return null;
                                  }
                                )}
                              </p>
                            )}
                          {userDetails?.skills &&
                            userDetails?.skills?.length > 0 && (
                              <p>
                                {t("map.skills")}:{" "}
                                {userDetails?.skills.map((opt, index) => {
                                  if (index < 2) {
                                    return (
                                      <span key={index}>
                                        {t(`options.skills.${opt}`)},{" "}
                                      </span>
                                    );
                                  }
                                  if (index === 2) {
                                    return (
                                      <span key={index}>
                                        {t("map.and")}{" "}
                                        {userDetails?.skills?.length - 2}{" "}
                                        {t("map.more")}...
                                      </span>
                                    );
                                  }
                                  return null;
                                })}
                              </p>
                            )} */}
                          {/* <Link to="#" onClick={handleReadMoreClick}>
                            <span className="details-underlined">
                              {t("ads.all-user-ads")}
                            </span>
                          </Link> */}
                        </div>
                      </section>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </section>
        </section>
      </section>
      {isSidebarOpen && (
        <UserSidebar
          selectedUser={selectedUser}
          userAds={userAds}
          closeSidebar={closeSidebar}
          setModalImage={setModalImage}
        />
      )}
      {modalImage && (
        <ImageModal src={modalImage} alt="Ad Image" onClose={closeModal} />
      )}
    </>
  );
};
