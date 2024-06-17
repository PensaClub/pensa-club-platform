import './header.css';

import { useContext, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRightToBracket,
  faAddressCard,
  faUser,
  faArrowRightFromBracket,
  faMap,
  faBars,
  faCircleQuestion,
  faCircleExclamation,
  faGlobe,
} from '@fortawesome/free-solid-svg-icons';

import { useTranslation } from 'react-i18next';
import AlertModal from './AlertModal/AlertModal';

export const Header = () => {
  const { t, i18n } = useTranslation();

  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const { isAuthentication, isFinish } = useContext(UserContext);
  const [finishProfile, setFinishProfile] = useState(false);
  const [currLang, setCurrLang] = useState('en');

  const dropdownRef = useRef(null);

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setDropdownOpen(false);
      setMenuOpen(!isMenuOpen);
    }
  };
  const handleDropdownToggle = () => {
    setDropdownOpen(!isDropdownOpen);
    setMenuOpen(!isMenuOpen);
  };

  const handleDropdownItemClick = () => {
    setDropdownOpen(false);
    setMenuOpen(!isMenuOpen);
  };

  const handleModalToggle = () => {
    setModalOpen(!isModalOpen);
  };

  useEffect(() => {
    setFinishProfile(isFinish);

    document.addEventListener('mousedown', handleClickOutside);
    setMenuOpen(!isMenuOpen);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      setMenuOpen(!isMenuOpen);
    };
  }, [isFinish]);
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const currentLanguage = i18n.language;

  return (
    <section className="site-header">
      <header className={isMenuOpen ? 'scrolled' : ''}>
        <Link to="/">
          <img src="/images/homePage/logo.png" alt="logo" className="logo" />{' '}
          Pensa Club
        </Link>
        <section className="navy">
          <nav className="navbar">
            <Link to="/map" className="nav-item" style={{ '--i': 0 }}>
              {t('header.map')}
            </Link>
            <Link to="/craigslist" className="nav-item" style={{ '--i': 1 }}>
              {t('header.craigslist')}
            </Link>
            
          </nav>
          <div className="dropdown" ref={dropdownRef}>
            <input
              type="checkbox"
              id="dropdown-toggle"
              className="dropdown-checkbox"
              checked={isDropdownOpen}
              onChange={handleDropdownToggle}
            />
            {!finishProfile && !isDropdownOpen && (
              <span
                className="warning-icon-image"
                onClick={(e) => {
                  e.stopPropagation();
                  handleModalToggle();
                }}
              >
                <FontAwesomeIcon icon={faCircleExclamation} />
              </span>
            )}
            <label htmlFor="dropdown-toggle" className="dropdown-toggle">
              <img
                src="/images/homePage/avatar2.png"
                alt="Profile"
                className="profile-img"
              />
            </label>

            <div
              className={`dropdown-menu dropdown-menu-right rounded-0 ${
                isDropdownOpen ? 'active' : ''
              }`}
            >
              <div className="social-icons-header">
                <FontAwesomeIcon icon={faMap} className="social-mobile" />
                <Link
                  to="/map"
                  className="dropdown-item desktop-unactive"
                  onClick={handleDropdownItemClick}
                >
                  {t('header.map')}
                </Link>
              </div>
              <div className="social-icons-header">
                <FontAwesomeIcon className="social-mobile" icon={faBars} />
                <Link
                  to="/craigslist"
                  className="dropdown-item desktop-unactive"
                  onClick={handleDropdownItemClick}
                >
                  {t('header.craigslist')}
                </Link>
              </div>
              {!isAuthentication && (
                <>
                  <div className="social-icons-header">
                    <FontAwesomeIcon icon={faArrowRightToBracket} />
                    <Link
                      to="/sign-up?view=login"
                      className="dropdown-item"
                      onClick={handleDropdownItemClick}
                    >
                      {t('header.login')}
                    </Link>
                  </div>
                  <div className="social-icons-header">
                    <FontAwesomeIcon icon={faAddressCard} />
                    <Link
                      to="/sign-up?view=register"
                      className="dropdown-item"
                      onClick={handleDropdownItemClick}
                    >
                      {t('header.register')}
                    </Link>
                  </div>
                </>
              )}
              {isAuthentication && (
                <>
                  <div className="social-icons-header">
                    <FontAwesomeIcon icon={faUser} />
                    <div className="alert-modal">
                      <Link
                        to="/profile"
                        className={`dropdown-item ${
                          !finishProfile ? 'incomplete-profile' : ''
                        }`}
                        onClick={handleDropdownItemClick}
                      >
                        {t('header.profile')}
                      </Link>
                      {!finishProfile && (
                        <span
                          className="warning-icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleModalToggle();
                          }}
                        >
                          <FontAwesomeIcon icon={faCircleExclamation} />
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="social-icons-header">
                    <FontAwesomeIcon icon={faArrowRightFromBracket} />
                    <Link
                      to="/logout"
                      className="dropdown-item"
                      onClick={handleDropdownItemClick}
                    >
                      {t('header.logout')}
                    </Link>
                  </div>
                </>
              )}

              <div className="social-icons-header">
                <FontAwesomeIcon icon={faGlobe} />
                <div className="dropdown-item">
                  {currentLanguage !== 'en' && (
                    <button onClick={() => changeLanguage('en')}>
                      English
                    </button>
                  )}
                  {currentLanguage !== 'bg' && (
                    <button onClick={() => changeLanguage('bg')}>
                      български
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </header>
      <div className="after-header"></div>
      <AlertModal isOpen={isModalOpen} onClose={handleModalToggle}>
        <p>
          Вашият профил е непълен. Моля, завършете го, за да продължите да
          използвате всички възможности на платформата.
        </p>
      </AlertModal>
    </section>
  );
};
