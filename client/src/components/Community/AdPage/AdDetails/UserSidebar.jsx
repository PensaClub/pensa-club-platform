import React, { useEffect, useRef, Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import './sidebar-details.css';
import '../../../MapPage/MapEditor/sidebar.css'

export const UserSidebar = ({ selectedUser, userAds, closeSidebar }) => {
  const { t } = useTranslation();
  const sidebarRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        closeSidebar();
      }
    };
    document.body.classList.add('active-sidebar');
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
              document.body.classList.remove('active-sidebar');
        document.removeEventListener('mousedown', handleClickOutside);
    };
    
  }, [closeSidebar]);

  const trimString = (str, num) => {
    if (str.length <= num) return str;
    return str.slice(0, num) + '...';
  };

  return (
    <div className="ad-sidebar-map" ref={sidebarRef}>
      <button className="ad-close-button" onClick={closeSidebar}>{t('map.close')}</button>
      <div className="ad-sidebar-content"><h2>{selectedUser?.username}</h2>
        <div className="ad-scroll-side-content">
          <div className="ad-user-map-info">
            <img className="ad-user-map-img" src={selectedUser?.imageURL || "/images/homePage/avatar2.png"} alt="user-img" />
            <div className="ad-map-desc-user">
              {selectedUser?.workOptions && selectedUser?.workOptions?.length > 0 && (
                <p className="ad-description-editor">
                  {t('map.profession')}: {selectedUser?.workOptions.map(option => t(`options.work-options.${option}`)).join(', ')}
                </p>
              )}
              {selectedUser?.interestOptions && selectedUser?.interestOptions.length > 0 && (
                <p className="ad-description-editor">
                  {t('map.interests')}: {selectedUser?.interestOptions.map(option => t(`options.interestOptions.${option}`)).join(', ')}
                </p>
              )}
              {selectedUser?.skills && selectedUser?.skills.length > 0 && (
                <p className="ad-description-editor">
                  {t('map.skills')}: {selectedUser?.skills.map(option => t(`options.skills.${option}`)).join(', ')}
                </p>
              )}
              {selectedUser?.phoneNumber && selectedUser?.phoneNumber.length > 0 && 
              (<p>{t('map.phone')}: <Link to={`tel:${selectedUser?.phoneNumber}`}>{selectedUser?.phoneNumber}</Link></p>)}
              <p>{t('map.email')}: <Link to={`mailto:${selectedUser.email}`}>{selectedUser.email}</Link></p>
            </div>
          </div>
          <div className="ad-color-lines-pipe"></div>
          <h3 className="ad-title">{t('map.ads_by')} {selectedUser?.username}</h3>
          <div className="ad-color-lines-pipe"></div>
          <div className='ad-scroll'>
            {userAds.ads.length > 0 ? userAds.ads.map(ad => (
              <Fragment key={ad?.adId}>
                <div className="ad-map">
                  <img src={ad?.images[0]?.imageURL} alt="ad-img" />
                  <div className="ad-desc">
                    <h3>{ad?.summary}</h3>
                    <p className='ad-desc-map'>{trimString(ad?.description, 50)}</p>
                  </div>
                  <p className='ad-map-valid'>{t('community.validate_until')} : {new Date(ad?.expirationDate).toLocaleDateString('bg-BG')}</p>
                  <p className='ad-category'>{t(`search-criteria.${ad?.category}`)}</p>
                </div>
                <div className="ad-color-lines"></div>
              </Fragment>
            )) : <h3>{t('map.no_ads')}</h3>}
          </div>
        </div>
      </div>
    </div>
  );
};
