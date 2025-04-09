import { useState, useRef, useEffect, useContext } from "react";
import "./header.css";
import { Link, NavLink, useLocation } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";
import { useTranslation } from "react-i18next";
import AlertModal from "./AlertModal/AlertModal";

export const Header = ({ additionalClasses }) => {
  const { t, i18n } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { isAuthentication, isFinish, profileData } = useContext(UserContext);
  const [isModalOpen, setModalOpen] = useState(false);
  const profileRef = useRef(null);
  const location = useLocation();

  // Обработване на скролване
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Затваряне на профил менюто при клик извън него
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Затваряне на профил менюто при промяна на пътя
  useEffect(() => {
    setProfileOpen(false);
  }, [location.pathname]);

  const toggleProfileMenu = () => {
    setProfileOpen(!profileOpen);
  };

  const handleModalToggle = () => {
    setModalOpen(!isModalOpen);
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

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const currentLanguage = i18n.language;

  return (
    <>
      <header className={`${scrolled ? "scrolled" : ""} ${additionalClasses || ""}`}>
        <Link to="/">
          <img src="/images/homePage/logo-2.png" alt="logo" className="logo" />
          Pensa Club
        </Link>

        <div className="navy">
          <nav className="navbar">
            <NavLink
              to="/articles"
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            >
             Статии
            </NavLink>
            <div className="has-dropdown">
              <NavLink
                to="/craigslist?reset=true"
                className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
              >
                {t("header.craigslist")}
                <svg className="dropdown-arrow" width="12" height="6" viewBox="0 0 12 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L6 5L11 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </NavLink>

              <div className="community-dropdown">
                <Link to="/map" className="dropdown-link">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="currentColor" />
                  </svg>
                  {t("header.map")}
                </Link>
                <Link to="/community" className="dropdown-link">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 12.75C13.63 12.75 15.07 13.14 16.24 13.65C17.32 14.13 18 15.21 18 16.38V18H6V16.39C6 15.21 6.68 14.13 7.76 13.66C8.93 13.14 10.37 12.75 12 12.75ZM4 13H8V11H4V13ZM16 13H20V11H16V13ZM12 10.5C10.34 10.5 9 9.16 9 7.5C9 5.84 10.34 4.5 12 4.5C13.66 4.5 15 5.84 15 7.5C15 9.16 13.66 10.5 12 10.5ZM21 9.75C21 11.16 19.16 12 18 12C18.84 12 20 10.84 20 9.75C20 8.66 18.84 7.5 18 7.5C19.16 7.5 21 8.36 21 9.75ZM3 9.75C3 8.36 4.84 7.5 6 7.5C5.16 7.5 4 8.66 4 9.75C4 10.84 5.16 12 6 12C4.84 12 3 11.16 3 9.75Z" fill="currentColor" />
                  </svg>
                  {t("header.community")}
                </Link>
              </div>
            </div>

            <NavLink
              to="/ad/create"
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            >
              {t("header.ad-create")}
            </NavLink>
          </nav>

          <div className="profile-section-home" ref={profileRef}>
            {isAuthentication && !isFinish && (
              <span
                className="warning-icon-image"
                onClick={(e) => {
                  e.stopPropagation();
                  handleModalToggle();
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 17C11.45 17 11 16.55 11 16C11 15.45 11.45 15 12 15C12.55 15 13 15.45 13 16C13 16.55 12.55 17 12 17ZM13 13H11V7H13V13Z" fill="#BB1D3D" />
                </svg>
              </span>
            )}

            <div className="profile-toggle" onClick={toggleProfileMenu}>
              <img
                src={
                  profileData?.details?.imageURL ||
                  getProfileImage(profileData?.details?.gender)
                }
                alt="Profile"
                className="profile-image"
              />
            </div>

            <div className={`profile-dropdown ${profileOpen ? "active" : ""}`}>
              <div className="dropdown-header-home">
                <h4>{profileData?.details?.username || t("header.welcome")}</h4>
              </div>

              <div className="dropdown-menu-links">
                {!isAuthentication ? (
                  <>
                    <Link to="/sign-up?view=login" className="menu-link">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11 7L9.6 8.4L12.2 11H2V13H12.2L9.6 15.6L11 17L16 12L11 7Z" fill="currentColor" />
                        <path d="M20 19H12V21H20C21.1 21 22 20.1 22 19V5C22 3.9 21.1 3 20 3H12V5H20V19Z" fill="currentColor" />
                      </svg>
                      {t("header.login")}
                    </Link>
                    <Link to="/sign-up?view=register" className="menu-link">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15 12C17.21 12 19 10.21 19 8C19 5.79 17.21 4 15 4C12.79 4 11 5.79 11 8C11 10.21 12.79 12 15 12ZM15 6C16.1 6 17 6.9 17 8C17 9.1 16.1 10 15 10C13.9 10 13 9.1 13 8C13 6.9 13.9 6 15 6ZM15 14C12.33 14 7 15.34 7 18V20H23V18C23 15.34 17.67 14 15 14ZM9 18C9.22 17.28 12.31 16 15 16C17.7 16 20.8 17.29 21 18H9ZM6 15V12H9V10H6V7H4V10H1V12H4V15H6Z" fill="currentColor" />
                      </svg>
                      {t("header.register")}
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to={isFinish ? "/profile/data" : "/profile/profile-form"}
                      className="menu-link"
                    >
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 6C13.1 6 14 6.9 14 8C14 9.1 13.1 10 12 10C10.9 10 10 9.1 10 8C10 6.9 10.9 6 12 6ZM12 13C9.33 13 4 14.34 4 17V20H20V17C20 14.34 14.67 13 12 13ZM18 18H6V17.01C6.2 16.29 9.3 15 12 15C14.7 15 17.8 16.29 18 17V18Z" fill="currentColor" />
                      </svg>
                      {t("header.profile")}
                    </Link>
                    <Link to="/logout" className="menu-link">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17 7L15.59 8.41L18.17 11H8V13H18.17L15.59 15.58L17 17L22 12L17 7Z" fill="currentColor" />
                        <path d="M4 19H12V21H4C2.9 21 2 20.1 2 19V5C2 3.9 2.9 3 4 3H12V5H4V19Z" fill="currentColor" />
                      </svg>
                      {t("header.logout")}
                    </Link>
                  </>
                )}

                <div className="menu-link">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.87 15.07L10.33 12.56L10.36 12.53C12.1 10.59 13.34 8.36 14.07 6H17V4H10V2H8V4H1V6H12.17C11.5 7.92 10.44 9.75 9 11.35C8.07 10.32 7.3 9.19 6.69 8H4.69C5.42 9.63 6.42 11.17 7.67 12.56L2.58 17.58L4 19L9 14L12.11 17.11L12.87 15.07ZM18.5 10H16.5L12 22H14L15.12 19H19.87L21 22H23L18.5 10ZM15.88 17L17.5 12.67L19.12 17H15.88Z" fill="currentColor" />
                  </svg>
                  {currentLanguage !== "bg" ? (
                    <button onClick={() => changeLanguage("bg")}>
                      Български
                    </button>
                  ) : (
                    <button onClick={() => changeLanguage("en")}>
                      English
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="header-line"></div>

      <AlertModal isOpen={isModalOpen} onClose={handleModalToggle}>
        <p>{t("profile.alert_message")}</p>
      </AlertModal>
    </>
  );
};