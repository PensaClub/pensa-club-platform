/* eslint-disable jsx-a11y/alt-text */
import { HeaderCommunity } from '../../HeaderCommunity/HeaderCommunity';
import './adDetails.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPhone,
  faEnvelope,
  faShareNodes,
  faChevronLeft,
  faCaretLeft,
} from "@fortawesome/free-solid-svg-icons";
import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { ImageEnlarger } from "../../../ImageEnlarger/ImageEnlarger";
import { SearchBar } from "../../SearchBar/SearchBar";
import { CommunityContext } from "../../../contexts/CommunityContext";

export const AdDetails = () => {
  const { t, i18n } = useTranslation();

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

  return (
    <section className="background-ads-details">
      <section className="ads-details-page">
        <HeaderCommunity />
        <section className="main-details">
          <div className="hero-bg-details"></div>
          <div className="hero-section-details">
            <h1>{t("community.community")}</h1>
            <SearchBar />
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
    </section>
  );
};
