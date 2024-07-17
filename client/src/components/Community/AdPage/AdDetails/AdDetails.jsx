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
import { AdsCard } from '../../AdsCard/AdsCard';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ImageEnlarger } from '../../../ImageEnlarger/ImageEnlarger';
import { SearchBar } from '../../SearchBar/SearchBar';

export const AdDetails = () => {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;

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
                  <FontAwesomeIcon icon={faCaretLeft} />
                </p>{' '}
              </div>
              <h2 className="ads-details-back">
                <FontAwesomeIcon icon={faChevronLeft} />{' '}
                <strong>Всички обяви</strong>
              </h2>
              <section className="ads-details-main">
                <div className="ads-details-container">
                  <div className="ads-details-icons">
                    <Link>
                      <div className="group-icon">
                        <FontAwesomeIcon icon={faPhone} className="icon" />
                        <p>Обади се</p>
                      </div>
                    </Link>
                    <Link>
                      <div className="group-icon">
                        <FontAwesomeIcon icon={faEnvelope} className="icon" />
                        <p>Изпрати съобщение</p>
                      </div>
                    </Link>
                    <Link>
                      <div className="group-icon">
                        <FontAwesomeIcon icon={faShareNodes} className="icon" />
                        <p>Сподели</p>
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
                        <p>София</p> {/* here is*/}
                        {/* <p className='ads-exp'>{new Date(ad.creationDate).toLocaleDateString('bg-BG', { month: 'long' })}</p> */}
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
                          <Link>
                            <span>Виж всички обяви на потребителя</span>
                          </Link>
                        </div>
                      </section>
                    </div>
                  </div>
                  <div className="ads-details-desc">
                    <h3>Описание</h3>
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
    </>
  );
};
