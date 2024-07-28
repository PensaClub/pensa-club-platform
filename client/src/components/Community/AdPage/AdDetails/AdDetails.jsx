/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useRef, useContext, Fragment } from 'react';
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
import { Link, useParams } from 'react-router-dom';
import { SearchBar } from '../../SearchBar/SearchBar';
import { CommunityContext } from '../../../contexts/CommunityContext';
import { UserSidebar } from './UserSidebar';
import {
  FacebookShareButton,
  TelegramShareButton,
  LinkedinShareButton,
  FacebookIcon,
  TelegramIcon,
  LinkedinIcon,
} from 'react-share';

export const AdDetails = () => {
  const { t, i18n } = useTranslation();
  const [ad, setAd] = useState({});
  const [userDetails, setUserDetails] = useState({});
  const [adTownName, setAdTownName] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userAds, setUserAds] = useState([]);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const { getAdById, fetchTowns, getMyAds } = useContext(CommunityContext);
  const { adId } = useParams();

  useEffect(() => {
    async function fetchAd() {
      try {
        const response = await getAdById(adId);
        setAd(response.ads);
        setUserDetails(response.details);
        const townsData = await fetchTowns(Number(response.ads.adRegion), Number(response.ads.adSubregion));
        const town = townsData.find(t => t.id === Number(response.ads.adTown));
        const townName = i18n.language === 'bg' ? town.bg : town.en;
        setAdTownName(townName);
      } catch (error) {
        console.error('Failed to fetch ad', error);
      }
    }
    fetchAd();
  }, [adId, i18n.language]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  const handleReadMoreClick = async (e) => {
    e.preventDefault();
    try {
      const userAdsResponse = await getMyAds(ad.account.email);
      setUserAds(userAdsResponse);
      setSelectedUser(userDetails);
      setIsSidebarOpen(true);
    } catch (error) {
      console.error('Failed to fetch user ads', error);
    }
  };

  const closeSidebar = () => {
    setSelectedUser(null);
    setIsSidebarOpen(false);
  };

  const currentUrl = window.location.href;

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
                        <p>{userDetails?.phoneNumber ? (userDetails?.phoneNumber) : (t('ads.call'))}</p>
                      </div>
                    </Link>
                    <Link>
                      <div className="group-icon">
                        <FontAwesomeIcon icon={faEnvelope} className="icon" />
                        <p>{ad?.account?.email}</p>
                      </div>
                    </Link>
                    <div onClick={() => setShowShareOptions(!showShareOptions)}>
                      <div className="group-icon share-button-ad" onClick={() => setShowShareOptions(!showShareOptions)}>
                        <FontAwesomeIcon icon={faShareNodes} className="icon" />
                        <p>{t('ads.share')}</p>
                        {showShareOptions && (
                          <div className="share-options">
                            <FacebookShareButton url={currentUrl}>
                              <FacebookIcon size={32} round />
                            </FacebookShareButton>
                            <TelegramShareButton url={currentUrl}>
                              <TelegramIcon size={32} round />
                            </TelegramShareButton>
                            <LinkedinShareButton url={currentUrl}>
                              <LinkedinIcon size={32} round />
                            </LinkedinShareButton>
                          </div>
                        )}
                      </div>

                    </div>

                  </div>
                  <div className="ads-details-card">
                    <div className="img-ads-details">
                      <div>
                        {ad?.images && ad?.images?.length > 0 && (
                          <ImageEnlarger images={ad?.images.map(img => img.imageURL)} ad={ad} t={t} />
                        )}
                        <p>{t(`search-criteria.${ad?.category}`)}</p>
                      </div>
                      <div className="ads-details-desc">
                        <h3>{t('ads.description')}</h3>
                        <hr />
                        <h5>{ad?.description}</h5>
                      </div>
                    </div>
                    <div className="ads-details-info">
                      <h3 className="title-details">{ad?.summary}</h3>
                      <div className='ads-data-elipse'>
                        <p className='elipse price'>{adTownName}</p>
                        {ad?.extraFields?.price && (
                          <p className='elipse price'> {ad?.extraFields?.price} {t('ads.price_lv')} </p>
                        )}
                        {ad?.extraFields?.eventStartDate && ad?.extraFields?.eventEndDate && (
                          <>
                            <p className='elipse'>{t('ads.event_start_date')}: {new Date(ad?.extraFields?.eventStartDate).toLocaleDateString(i18n.language)}</p>
                            <p className='elipse'>{t('ads.event_end_date')}: {new Date(ad?.extraFields?.eventEndDate).toLocaleDateString(i18n.language)}</p>
                          </>
                        )}
                      </div>
                      <div className="subinfo-ads">
                        {ad?.tags && ad?.tags?.length > 0 && ad?.tags?.map((tag, index) => (
                          <p key={index}>{tag}</p>
                        ))}
                        <p>{ad?.street}</p>
                      </div>
                      <p className="ads-details-data">
                        {t('community.validate_until')}: {''}
                        <span>{ad?.expirationDate ? new Date(ad?.expirationDate).toLocaleDateString(i18n.language) : ''}</span>
                      </p>
                      <section className="user-info-details">
                        <div className="ads-details-user-info">
                          <div className="ads-details-username">
                            <img
                              src={userDetails?.imageURL || 'images/homePage/avatar2.png'}
                              alt={userDetails?.username}
                            />
                            <Link to="#" onClick={handleReadMoreClick}>
                              <span className="details-underlined">{userDetails?.username}</span>
                            </Link>
                          </div>
                          {userDetails?.workOptions && userDetails?.workOptions?.length > 0 && (
                            <p>
                              {t('map.job')}:{' '}
                              {userDetails?.workOptions.map((opt, index) => {
                                if (index < 2) {
                                  return (
                                    <span key={index}>{t(`options.work-options.${opt}`)}, </span>
                                  );
                                }
                                if (index === 2) {
                                  return (
                                    <span key={index}>
                                      {t('map.and')} {userDetails?.workOptions?.length - 2}{' '}
                                      {t('map.more')}...
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
                                {t('map.interests')}:{' '}
                                {userDetails?.interestOptions.map((opt, index) => {
                                  if (index < 2) {
                                    return (
                                      <span key={index}>
                                        {t(`options.interestOptions.${opt}`)},{' '}
                                      </span>
                                    );
                                  }
                                  if (index === 2) {
                                    return (
                                      <span key={index}>
                                        {t('map.and')} {userDetails?.interestOptions?.length - 2}{' '}
                                        {t('map.more')}...
                                      </span>
                                    );
                                  }
                                  return null;
                                })}
                              </p>
                            )}
                          {userDetails?.skills && userDetails?.skills?.length > 0 && (
                            <p>
                              {t('map.skills')}:{' '}
                              {userDetails?.skills.map((opt, index) => {
                                if (index < 2) {
                                  return (
                                    <span key={index}>{t(`options.skills.${opt}`)}, </span>
                                  );
                                }
                                if (index === 2) {
                                  return (
                                    <span key={index}>
                                      {t('map.and')} {userDetails?.skills?.length - 2}{' '}
                                      {t('map.more')}...
                                    </span>
                                  );
                                }
                                return null;
                              })}
                            </p>
                          )}
                          <Link to="#" onClick={handleReadMoreClick}>
                            <span className="details-underlined">{t('ads.all-user-ads')}</span>
                          </Link>
                        </div>
                      </section>
                    </div>
                  </div>
                  {/* <div className="ads-details-desc">
                    <h3>{t('ads.description')}</h3>
                    <hr />
                    <p>{ad?.description}</p>
                  </div> */}
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
        />
      )}
    </>
  );
};
