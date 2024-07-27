import { useEffect, useState, useRef, Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPhone,
  faEnvelope,
  faShareNodes,
  faChevronLeft,
  faCaretLeft,
} from '@fortawesome/free-solid-svg-icons';
import { HeaderCommunity } from '../../HeaderCommunity/HeaderCommunity';
import { ImageEnlarger } from '../../../ImageEnlarger/ImageEnlarger';
import './adDetails.css';
import './sidebar-details.css';
import './../../../MapPage/MapEditor/scrollModal.css';
import { Link, useParams } from "react-router-dom";
import { ImageEnlarger } from "../../../ImageEnlarger/ImageEnlarger";
import { SearchBar } from "../../SearchBar/SearchBar";
import { CommunityContext } from "../../../contexts/CommunityContext";
export const AdDetails = () => {
  const { t } = useTranslation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [ad, setAd] = useState({});
  const [userDetails, setUserDetails] = useState({});
  const { getAdById } = useContext(CommunityContext);

  const { adId } = useParams();

  useEffect(() => {
    async function fetchAd() {
      getAdById(adId)
        .then((response) => {
          setAd(response.ads);
          setUserDetails(response.details);
          /* eslint-disable no-console */
          console.log(response);
        })
        .catch((error) => console.error("Failed to fetch ad", error));
    }
    fetchAd();
    // eslint-disable-next-line no-console
    console.log(ad);
  }, []);

  // const images = [
  //   '/images/homePage/avatar3.jpg',
  //   '/images/homePage/avatar2.png',
  //   '/images/homePage/avatar3.jpg',
  //   '/images/homePage/avatar3.jpg',
  //   '/images/homePage/avatar3.jpg',
  // ];

  useEffect(() => {
    window.scrollTo({ top: 0 });
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

  const handleReadMoreClick = (e, user) => {
    e.preventDefault();
    setSelectedUser(user);
    setIsSidebarOpen(true);
  };

  const closeSidebar = () => {
    setSelectedUser(null);
    setIsSidebarOpen(false);
  };

  const trimString = (str, num) => {
    if (str.length <= num) return str;
    return str.slice(0, num) + '...';
  };

  const position = [42.72991533257769, 24.674647996012656];

  return (

    <>
      <section className="background-ads-details">
        <section className="ads-details-page">
          <HeaderCommunity />
          <section className="main-details">
            <div className="hero-bg-details"></div>
            <div className="hero-section-details">
              <h1>{t('community.community')}</h1>
              <SearchBar />
              <div className="ad-details-back-phone">
                <p>
                  <Link to="/craigslist">
                    <FontAwesomeIcon icon={faCaretLeft} />{' '}
                  </Link>
                </p>{' '}
              </div>
              <h2 className="ads-details-back">
                <Link to="/craigslist">
                  <FontAwesomeIcon icon={faChevronLeft} />{' '}
                  <strong>{t('ads.all-ads')}</strong>

              </Link>
            </h2>
            <section className="ads-details-main">
              <div className="ads-details-container">
                <div className="ads-details-icons">
                  <Link>
                    <div className="group-icon">
                      <FontAwesomeIcon icon={faPhone} className="icon" />
                      <p>{t("ads.call")}</p>
                    </div>
                  </Link>
                  <Link>
                    <div className="group-icon">
                      <FontAwesomeIcon icon={faEnvelope} className="icon" />
                      <p>{t("ads.send-message")}</p>
                    </div>
                  </Link>
                  <Link>
                    <div className="group-icon">
                      <FontAwesomeIcon icon={faShareNodes} className="icon" />
                      <p>{t("ads.share")}</p>
                    </div>
                  </Link>
                </div>
                <div className="ads-details-card">
                  <div className="img-ads-details">
                    {ad?.images && <ImageEnlarger images={ad.images} />}
                    <p>{t(`search-criteria.${ad.category}`)}</p>
                  </div>
                  <div className="ads-details-info">
                    <h3 className="title-details">{ad.summary}</h3>
                    <div className="subinfo-ads">
                      {ad.tags?.map((tag) => {
                        <p>{tag}</p>; // TODO: как ще се превеждат таговете??
                      })}
                      <p>{ad.adTown}</p> {/* here is*/}
                      {/* <p className='ads-exp'>{new Date(ad.creationDate).toLocaleDateString('bg-BG', { month: 'long' })}</p> */}
                    </div>


                    <p className="ads-details-data">
                      {t("community.validate_until")}:{""}
                      <span> {ad.expirationDate}</span>
                    </p>
                    <section className="user-info-details">
                      <div className="ads-details-user-info">
                        <div className="ads-details-username">
                          <img
                            src={
                              userDetails?.imageURL ||
                              "images/homePage/avatar2.png"
                            }
                            alt={userDetails?.username}
                          />
                          <Link>
                            <span className="details-underlined">
                              {userDetails?.username}
                            </span>
                          </Link>
                        </div>
                        {userDetails?.workOptions && (
                          <p>
                            {t("map.job")}:{" "}
                            {userDetails.workOptions.map((opt, index) => {
                              if (index < 2) {
                                return (
                                  <p key={index}>
                                    {t(`options.work-options.${opt}`)}
                                  </p>
                                );
                              }
                              if (index === 2) {
                                return (
                                  <p>
                                    {t("map.and")}{" "}
                                    {userDetails.workOptions.length - 1}{" "}
                                    {t("map.more")}...
                                  </p>
                                );
                              }
                              return null;
                            })}
                          </p>
                        )}
                        {userDetails?.interestOptions && (
                          <p>
                            {t("map.interests")}:{" "}
                            {userDetails.interestOptions.map((opt, index) => {
                              if (index < 2) {
                                return (
                                  <p key={index}>
                                    {t(`options.interestOptions.${opt}`)}
                                  </p>
                                );
                              }
                              if (index === 2) {
                                return (
                                  <p>
                                    {t("map.and")}{" "}
                                    {userDetails.interestOptions.length - 1}{" "}
                                    {t("map.more")}...
                                  </p>
                                );
                              }
                              return null;
                            })}
                          </p>
                        )}
                        {userDetails?.skills && (
                          <p>
                            <p>{t("map.skills")}: </p>
                            {userDetails.skills.map((opt, index) => {
                              if (index < 2) {
                                return (
                                  <p key={index}>
                                    {t(`options.skills.${opt}`)}
                                  </p>
                                );
                              }
                              if (index === 2) {
                                return (
                                  <p>
                                    {t("map.and")}{" "}
                                    {userDetails.skills.length - 1}{" "}
                                    {t("map.more")}...
                                  </p>
                                );
                              }
                              return null;
                            })}
                          </p>
                        )}
                        <Link>
                          <span className="details-underlined">
                            {t("ads.all-user-ads")}
                          </span>
                        </Link>
                      </div>
                    </section>
                  </div>
                </div>
                <div className="ads-details-desc">
                  <h3>{t("ads.description")}</h3>
                  <hr />
                  <p>{ad.description}</p>
                </div>
              </div>
            </section>
          </div>
        </section>
      </section>

      {selectedUser && (
        <div className="sidebar-map" ref={sidebarRef}>
          <button className="close-button" onClick={closeSidebar}>{t('map.close')}</button>
          <div className="sidebar-content">
            <h2>{selectedUser.details.username}</h2>
            <div className="scroll-side-content">
              <div className="user-map-info">
                <img className="user-map-img" src={selectedUser.details.imageURL} alt="user-img" />
                <div className="map-desc-user">
                  {selectedUser.details.workOptions && selectedUser.details.workOptions.length > 0 && (
                    <p className="ad-description-editor">
                      {t('map.profession')}: {selectedUser.details.workOptions.map(option => t(`options.work-options.${option}`)).join(', ')}
                    </p>
                  )}
                  {selectedUser.details.interestOptions && selectedUser.details.interestOptions.length > 0 && (
                    <p className="ad-description-editor">
                      {t('map.interests')}: {selectedUser.details.interestOptions.map(option => t(`options.interestOptions.${option}`)).join(', ')}
                    </p>
                  )}
                  {selectedUser.details.skills && selectedUser.details.skills.length > 0 && (
                    <p className="ad-description-editor">
                      {t('map.skills')}: {selectedUser.details.skills.map(option => t(`options.skills.${option}`)).join(', ')}
                    </p>
                  )}
                  {selectedUser.details.phoneNumber && selectedUser.details.phoneNumber.length > 0 && 
                  (<p>{t('map.phone')}: <Link to={`tel:${selectedUser.details.phoneNumber}`}>{selectedUser.details.phoneNumber}</Link></p>)}
                  <p>{t('map.email')}: <Link to={`mailto:${selectedUser.email}`}>{selectedUser.email}</Link></p>
                </div>
              </div>
              <div className="color-lines-pipe"></div>
              <h3 className="ad-title">{t('map.ads_by')} {selectedUser.details.username}</h3>
              <div className="color-lines-pipe"></div>
              <div className='ad-scroll'>
                {selectedUser.ads && selectedUser.ads.length > 0 ? selectedUser.ads.map(ad => (
                  <Fragment key={ad.adId}>
                    <div className="ad-map">
                      <img src={ad.images[0].imageURL} alt="ad-img" />
                      <div className="ad-desc">
                        <h3>{ad.summary}</h3>
                        <p className='ad-desc-map'>{trimString(ad.description, 50)}</p>
                      </div>
                      <p className='ad-map-valid'>{t('community.validate_until')} : {new Date(ad.expirationDate).toLocaleDateString('bg-BG')}</p>
                      <p className='ad-category'>{t(`search-criteria.${ad.category}`)}</p>
                    </div>
                    <div className="color-lines"></div>
                  </Fragment>
                )) : <h3>{t('map.no_ads')}</h3>}
              </div>
            </div>
          </div>
        </div>
      )}
    </>

    </section>

  );
};

