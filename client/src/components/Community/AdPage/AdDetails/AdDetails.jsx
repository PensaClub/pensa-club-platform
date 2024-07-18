import { HeaderCommunity } from '../../HeaderCommunity/HeaderCommunity';
import './adDetails.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPhone,
  faEnvelope,
  faShareNodes,
  faChevronLeft,
  faCaretLeft,
} from '@fortawesome/free-solid-svg-icons';
import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { ImageEnlarger } from '../../../ImageEnlarger/ImageEnlarger';
import { SearchBar } from '../../SearchBar/SearchBar';
import { CommunityContext } from '../../../contexts/CommunityContext';

export const AdDetails = () => {
  const { t } = useTranslation();

  const [ad, setAd] = useState({});

  const { getAdById } = useContext(CommunityContext);

  const adId = useParams();

  useEffect(() => {
    getAdById
      .then((adData) => setAd(adData))
      .catch((error) => console.error('Failed to fetch ad', error));
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
                      <ImageEnlarger images={ad.images} />
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
                        {t('community.validate_until')}:{''}
                        <span> {ad.expirationDate}</span>
                      </p>
                      <section className="user-info-details">
                        <div className="ads-details-user-info">
                          <div className="ads-details-username">
                            <img
                              src={
                                ad.account.details?.imageURL ||
                                'images/homePage/avatar2.png'
                              }
                              alt={ad.account.details?.username}
                            />
                            <Link>
                              <span className="details-underlined">
                                {ad.account.details?.username}
                              </span>
                            </Link>
                          </div>
                          <p>
                            {t('map.job')}:{' '}
                            {ad.account.details?.workOptions.split(', ')}
                          </p>
                          <p>
                            {t('map.interests')}:{' '}
                            {ad.account.details?.interestOptions.split(', ')}
                          </p>
                          <p>
                            {t('map.skills')}:{' '}
                            {ad.account.details?.skills.split(', ')}
                          </p>
                          <Link>
                            <span className="details-underlined">
                              {t('ads.all-user-ads')}
                            </span>
                          </Link>
                        </div>
                      </section>
                    </div>
                  </div>
                  <div className="ads-details-desc">
                    <h3>{t('ads.description')}</h3>
                    <hr />
                    <p>{ad.description}</p>
                  </div>
                </div>
              </section>
            </div>
          </section>
        </section>
      </section>
    </>
  );
};
