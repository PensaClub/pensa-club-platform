import React, { useEffect, useState, useRef, Fragment } from 'react';
import { Link } from 'react-router-dom';
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
import { SearchBar } from '../../SearchBar/SearchBar';
import './adDetails.css';
import './sidebar-details.css';
import './../../../MapPage/MapEditor/scrollModal.css';
export const AdDetails = () => {
  const { t } = useTranslation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const [selectedUser, setSelectedUser] = useState(null);

  const images = [
    '/images/homePage/avatar3.jpg',
    '/images/homePage/avatar2.png',
    '/images/homePage/avatar3.jpg',
    '/images/homePage/avatar3.jpg',
    '/images/homePage/avatar3.jpg',
  ];

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
                        <p>{t('ads.call')}</p>
                      </div>
                    </Link>
                    <Link>
                      <div className="group-icon">
                        <FontAwesomeIcon icon={faEnvelope} className="icon" />
                        <p>{t('ads.send-message')}</p>
                      </div>
                    </Link>
                    <Link>
                      <div className="group-icon">
                        <FontAwesomeIcon icon={faShareNodes} className="icon" />
                        <p>{t('ads.share')}</p>
                      </div>
                    </Link>
                  </div>
                  <div className="ads-details-card">
                    <div className="img-ads-details">
                      <ImageEnlarger images={images} />
                      <p>Дарявам</p>
                    </div>
                    <div className="ads-details-info">
                      <h3 className="title-details">Фотоапарат</h3>
                      <div className="subinfo-ads">
                        <p>#фотография</p>
                        <p>София</p>
                      </div>
                      <p className="ads-details-data">
                        {t('community.validate_until')}:{''}
                        <span> 12 август 2024</span>
                      </p>
                      <section className="user-info-details">
                        <div className="ads-details-user-info">
                          <div className="ads-details-username">
                            <img src={'/images/homePage/avatar2.png'} />
                            <Link>
                              <span>Георги Иванов</span>
                            </Link>
                          </div>
                          <p>Професия:</p>
                          <p>Интереси:</p>
                          <p>Умения:</p>
                          <Link onClick={(e) => handleReadMoreClick(e, { details: { username: 'Георги Иванов', imageURL: '/images/homePage/avatar2.png', workOptions: ['work-option1'], interestOptions: ['interest-option1'], skills: ['skill1'], phoneNumber: '123456789', email: 'georgi.ivanov@example.com' }, ads: [] })}>
                            <span className='all-ads-user'>{t('ads.all-user-ads')}</span>
                          </Link>
                        </div>
                      </section>
                    </div>
                  </div>
                  <div className="ads-details-desc">
                    <h3>{t('ads.description')}</h3>
                    <hr />
                    <p>
                      Lorem ipsum dolor, sit amet consectetur adipisicing elit.
                      Sit molestiae quos odit id aut at, velit consectetur
                      eveniet nam aliquid nostrum, facilis adipisci, maxime
                      dignissimos sunt nobis. Numquam, sit nesciunt!
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </section>
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
  );
};

