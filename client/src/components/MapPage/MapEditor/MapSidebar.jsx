import React, { useEffect, useRef, useState, Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp } from '@fortawesome/free-solid-svg-icons';
import { useAuthContext } from '../../contexts/UserContext';
import './sidebar.css';

export const MapSidebar = ({ selectedUser, userAds, closeSidebar }) => {
    const { t } = useTranslation();
    const sidebarRef = useRef(null);
    const scrollContentRef = useRef(null);
    const [showScrollToTop, setShowScrollToTop] = useState(false);
    const { isAuthentication } = useAuthContext();
    const navigate = useNavigate();

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
        };
    }, [closeSidebar]);

    useEffect(() => {
        if (userAds && userAds.length > 10) {
            const handleScroll = () => {
                if (scrollContentRef.current) {
                    const scrollTop = scrollContentRef.current.scrollTop;
                    setShowScrollToTop(scrollTop > 0);
                }
            };

            const scrollContent = scrollContentRef.current;
            if (scrollContent) {
                scrollContent.addEventListener('scroll', handleScroll);
            }

            return () => {
                if (scrollContent) {
                    scrollContent.removeEventListener('scroll', handleScroll);
                }
            };
        }
    }, [scrollContentRef, userAds]);

    const handleAdClick = (ad) => {
        if (isAuthentication) {
            navigate(`/ad/details/${ad.adId}`);
        }
    };

    const trimString = (str, num) => {
        if (str.length <= num) return str;
        return str.slice(0, num) + '...';
    };

    const handleScrollToTop = () => {
        scrollContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="ad-sidebar-map" ref={sidebarRef}>
            <button className="ad-close-button" onClick={closeSidebar}>{t('map.close')}</button>
            <div className="ad-sidebar-content"><h2>{selectedUser?.details?.username}</h2>
                <div className="ad-scroll-side-content" ref={scrollContentRef}>
                    <div className="ad-user-map-info">
                        <img className="ad-user-map-img" src={selectedUser?.details?.imageURL || "/images/homePage/avatar2.png"} alt="user-img" />
                        <div className="ad-map-desc-user">
                            {selectedUser?.details?.workOptions && selectedUser?.details?.workOptions?.length > 0 && (
                                <p className="ad-description-editor">
                                    {t('map.profession')}: {selectedUser?.details?.workOptions?.map(option => t(`options.work-options.${option}`)).join(', ')}
                                </p>
                            )}
                            {selectedUser?.details?.interestOptions && selectedUser?.details?.interestOptions.length > 0 && (
                                <p className="ad-description-editor">
                                    {t('map.interests')}: {selectedUser?.details?.interestOptions.map(option => t(`options.interestOptions.${option}`)).join(', ')}
                                </p>
                            )}
                            {selectedUser?.details?.skills && selectedUser?.details?.skills?.length > 0 && (
                                <p className="ad-description-editor">
                                    {t('map.skills')}: {selectedUser?.details?.skills.map(option => t(`options.skills.${option}`)).join(', ')}
                                </p>
                            )}
                            {selectedUser?.details?.phoneNumber && selectedUser?.details?.phoneNumber.length > 0 &&
                                (<p>{t('map.phone')}: <Link to={`tel:${selectedUser?.details?.phoneNumber}`}>{selectedUser?.details?.phoneNumber}</Link></p>)}
                            <p>{t('map.email')}: <Link to={`mailto:${selectedUser.email}`}>{selectedUser.email}</Link></p>
                        </div>
                    </div>
                    <div className="ad-color-lines-pipe"></div>
                    <h3 className="ad-title">{t('map.ads_by')} {selectedUser?.details?.username}</h3>
                    <div className="ad-color-lines-pipe"></div>
                    <div className='ad-scroll'>
                        {userAds.length > 0 ? userAds.map(ad => (
                            <Fragment key={ad?.adId}>
                                <div className="ad-map">
                                    <img src={ad?.images[0]?.imageURL} alt="ad-img" onClick={() => handleAdClick(ad)} />
                                    <div className="ad-desc" onClick={() => handleAdClick(ad)}>
                                        <h3>{ad?.summary}</h3>
                                        <p className='ad-desc-map'>{trimString(ad?.description, 50)}</p>
                                    </div>
                                    <p className='ad-map-valid'>{t('community.validate_until')} : {new Date(ad?.expirationDate).toLocaleDateString('bg-BG')}</p>
                                    <p className='ad-category'>{t(`search-criteria.${ad.category}`)}</p>
                                </div>
                                <div className="color-lines"></div>
                            </Fragment>
                        )) : <h3>{t('map.no_ads')}</h3>}
                        <div id="scroll-sentinel"></div>
                    </div>
                    {showScrollToTop && (
                        <button className="scroll-to-top-button" onClick={handleScrollToTop}>
                            <FontAwesomeIcon icon={faArrowUp} className='arrow-up-side-bar' />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
