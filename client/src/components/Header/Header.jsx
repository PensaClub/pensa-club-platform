import { useState, useRef, useEffect, useContext } from "react";
import "./header.css";
import { useLocation, useNavigate } from 'react-router-dom';
import { LocalizedLink as Link, LocalizedNavLink as NavLink } from '../LocalizedLink/LocalizedLink';
import { UserContext } from "../contexts/UserContext";
import { useTranslation } from "react-i18next";
import AlertModal from "./AlertModal/AlertModal";
import { useInitiativeContext } from "../contexts/InitiativeProvider";
import { useClubContext } from "../contexts/ClubContext";
import { BookmarkIcon, BookmarkIconHeader } from "../Initiatives/Icons/InitiativeIcons";
import { LanguageSwitcher } from "../LanguageSwitcher/LanguageSwitcher";
import { useActiveChatCount } from "../hooks/useActiveChatCount";
import { localePath, stripLangFromPath } from "../../utils/languageUtils";
import { getResizedUrl } from "../../utils/firebaseImageResize";
export const Header = ({ additionalClasses }) => {
  const { t, i18n } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthentication, isFinish, profileData } = useContext(UserContext);
  const { bookmarkedInitiatives, hasBookmarks, hasBookmarksProjects, bookMarkedProjects } = useInitiativeContext();
  const { bookmarkedClubs = [], hasBookmarkedClubs } = useClubContext();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [mobileCommunityOpen, setMobileCommunityOpen] = useState(false);
  const [mobileReactionOpen, setMobileReactionOpen] = useState(false);
  const profileRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [activeMobileSubmenu, setActiveMobileSubmenu] = useState(null);
  const userEmail = profileData?.email || '';
  const userId = userEmail.replace(/\./g, '_dot_').replace(/@/g, '_at_');
  const userRole = profileData?.role || 'user';
  const activeChatCount = useActiveChatCount(userId, userRole);
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

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }

      if (mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target) &&
        !e.target.classList.contains('mobile-menu-toggle')) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setProfileOpen(false);
    setMobileMenuOpen(false);
    setMobileCommunityOpen(false);
    setMobileReactionOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [mobileMenuOpen]);

  const toggleProfileMenu = () => {
    setProfileOpen(!profileOpen);
  };

  const toggleMobileCommunity = () => {
    setMobileCommunityOpen(!mobileCommunityOpen);
  };

  const toggleMobileReaction = () => {
    setMobileReactionOpen(!mobileReactionOpen);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
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

  const changeLanguage = async (lng) => {
    if (lng === i18n.language) return;
    // Navigate to the localized version of the current path so the language
    // persists on refresh — the app uses URL-prefix-based language detection.
    const cleanPath = stripLangFromPath(window.location.pathname);
    const targetPath = localePath(cleanPath, lng);
    await i18n.changeLanguage(lng);
    navigate(targetPath, { replace: true });
  };

  const currentLanguage = i18n.language;

  const totalBookmarks = (bookmarkedInitiatives?.length || 0) +
    (bookMarkedProjects?.length || 0) +
    (bookmarkedClubs?.length || 0);

  const hasAnyBookmarks = hasBookmarks || hasBookmarksProjects || hasBookmarkedClubs || totalBookmarks > 0;

  return (
    <>
      <header className={`${scrolled ? "scrolled" : ""} ${additionalClasses || ""}`}>
        <Link to="/">
          <img src="/images/homePage/logo-2.png" alt="logo" className="logo" />
          Pensa Club
        </Link>

        <div className="navy">
          {/* Десктоп навигация */}
          <nav className="navbar desktop-nav">
            {/* DigiBridge Academy — mega dropdown */}
            <div className="has-dropdown academy-nav-item">
              <NavLink
                to="/academy"
                className={({ isActive }) =>
                  `nav-item academy-nav-trigger ${isActive || location.pathname.startsWith('/academy') ? "active" : ""}`
                }
              >
                <svg className="academy-nav-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 3L1 9L5 11.18V17.18L12 21L19 17.18V11.18L21 10.09V17H23V9L12 3ZM18.82 9L12 12.72L5.18 9L12 5.28L18.82 9ZM17 15.99L12 18.72L7 15.99V12.27L12 15L17 12.27V15.99Z" fill="currentColor" />
                </svg>
                {t("header.academy")}
                <svg className="dropdown-arrow" width="12" height="6" viewBox="0 0 12 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L6 5L11 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </NavLink>

              <div className="acd-mega">
                <div className="acd-header">
                  <span className="acd-title">DigiBridge Academy</span>
                </div>
                <Link to="/academy/courses" className="acd-item">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 5C19.89 4.65 18.67 4.5 17.5 4.5C15.55 4.5 13.45 4.9 12 6C10.55 4.9 8.45 4.5 6.5 4.5C4.55 4.5 2.45 4.9 1 6V20.65C1 20.9 1.25 21.15 1.5 21.15C1.6 21.15 1.65 21.1 1.75 21.1C3.1 20.45 5.05 20 6.5 20C8.45 20 10.55 20.4 12 21.5C13.35 20.65 15.8 20 17.5 20C19.15 20 20.85 20.3 22.25 21.05C22.35 21.1 22.4 21.1 22.5 21.1C22.75 21.1 23 20.85 23 20.6V6C22.4 5.55 21.75 5.25 21 5ZM21 18.5C19.9 18.15 18.7 18 17.5 18C15.8 18 13.35 18.65 12 19.5V8C13.35 7.15 15.8 6.5 17.5 6.5C18.7 6.5 19.9 6.65 21 7V18.5Z" fill="currentColor" />
                  </svg>
                  <div className="acd-item-text">
                    <span className="acd-item-title">{t("header.academy-courses")}</span>
                    <span className="acd-item-desc">{t("header.academy-courses-desc")}</span>
                  </div>
                </Link>
                <Link to="/academy/lectures" className="acd-item">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 3H3C1.89 3 1 3.89 1 5V17C1 18.1 1.89 19 3 19H8V21H16V19H21C22.1 19 22.99 18.1 22.99 17L23 5C23 3.89 22.1 3 21 3ZM21 17H3V5H21V17ZM16 11L10 14.5V7.5L16 11Z" fill="currentColor" />
                  </svg>
                  <div className="acd-item-text">
                    <span className="acd-item-title">{t("header.academy-lectures")}</span>
                    <span className="acd-item-desc">{t("header.academy-lectures-desc")}</span>
                  </div>
                </Link>
                <Link to="/academy/mentors" className="acd-item">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14ZM21.12 6.46L19.44 8.14C20.07 9.26 20.07 10.74 19.44 11.86L21.12 13.54C22.56 11.5 22.56 8.5 21.12 6.46ZM17.76 9.82L16.08 8.14C16.69 9.26 16.69 10.74 16.08 11.86L17.76 13.54C19.2 11.5 19.2 8.5 17.76 9.82Z" fill="currentColor" />
                  </svg>
                  <div className="acd-item-text">
                    <span className="acd-item-title">{t("header.academy-mentors")}</span>
                    <span className="acd-item-desc">{t("header.academy-mentors-desc")}</span>
                  </div>
                </Link>
                <Link to="/academy/seminars" className="acd-item">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19ZM17 12H12V17H17V12ZM7 7H12V9H7V7ZM7 11H10V13H7V11Z" fill="currentColor" />
                  </svg>
                  <div className="acd-item-text">
                    <span className="acd-item-title">{t("header.academy-seminars", "Семинари")}</span>
                    <span className="acd-item-desc">{t("header.academy-seminars-desc", "Практически занятия и дискусии")}</span>
                  </div>
                </Link>
                <Link to="/academy" className="acd-cta">
                  {t("header.academy-cta")} →
                </Link>
              </div>
            </div>

            <NavLink
              to="/articles"
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            >
              {t("header.articles")}
            </NavLink>
            <div className="has-dropdown">
              <span className="nav-item dropdown-trigger">
                {t("header.community")}
                <svg className="dropdown-arrow" width="12" height="6" viewBox="0 0 12 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L6 5L11 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>

              <div className="community-dropdown">
                <Link to="/community?reset=true" className="dropdown-link">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 12.75C13.63 12.75 15.07 13.14 16.24 13.65C17.32 14.13 18 15.21 18 16.38V18H6V16.39C6 15.21 6.68 14.13 7.76 13.66C8.93 13.14 10.37 12.75 12 12.75ZM4 13H8V11H4V13ZM16 13H20V11H16V13ZM12 10.5C10.34 10.5 9 9.16 9 7.5C9 5.84 10.34 4.5 12 4.5C13.66 4.5 15 5.84 15 7.5C15 9.16 13.66 10.5 12 10.5ZM21 9.75C21 11.16 19.16 12 18 12C18.84 12 20 10.84 20 9.75C20 8.66 18.84 7.5 18 7.5C19.16 7.5 21 8.36 21 9.75ZM3 9.75C3 8.36 4.84 7.5 6 7.5C5.16 7.5 4 8.66 4 9.75C4 10.84 5.16 12 6 12C4.84 12 3 11.16 3 9.75Z" fill="currentColor" />
                  </svg>
                  {t("header.community")}
                </Link>

                {/* НОВА ИКОНКА - Initiatives (лампичка) */}
                <Link to="/initiatives" className="dropdown-link">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 21H15M12 3V4M18.3636 5.63636L17.6565 6.34347M21 12H20M4 12H3M6.34347 6.34347L5.63636 5.63636M12 17C9.79086 17 8 15.2091 8 13C8 11.3644 8.9298 9.95264 10.2764 9.2764C10.7461 9.02499 11.2461 8.84269 11.7686 8.73754C11.9174 8.70857 12 8.5772 12 8.42632V8C12 7.44772 12.4477 7 13 7C13.5523 7 14 7.44772 14 8V8.42632C14 8.5772 14.0826 8.70857 14.2314 8.73754C15.4154 8.98941 16.4362 9.71459 17.0786 10.7158C17.3694 11.1749 17.5819 11.6874 17.6998 12.2323C17.7311 12.3693 17.8789 12.4303 17.9951 12.3493C18.5542 11.9732 19.2734 12.0686 19.7266 12.5819C20.264 13.1926 20.2155 14.1414 19.6156 14.6909C19.1296 15.1382 18.4048 15.1609 17.892 14.7565C17.7782 14.6686 17.6142 14.6964 17.5332 14.8261C17.2094 15.3624 16.7768 15.8233 16.2639 16.176C15.5635 16.6637 14.7486 16.9545 13.8952 16.9923C13.792 16.9968 13.7024 17.0673 13.6711 17.166C13.5671 17.4946 13.3048 17.7524 12.9749 17.8554C12.3432 18.0486 11.6568 18.0486 11.0251 17.8554C10.6952 17.7524 10.4329 17.4946 10.3289 17.166C10.2976 17.0673 10.208 16.9968 10.1048 16.9923C8.91304 16.9488 7.83094 16.3914 7.10558 15.5003C7.03802 15.4186 6.91813 15.4015 6.82973 15.462C6.31421 15.8248 5.62028 15.7626 5.17381 15.3161C4.61784 14.7602 4.61784 13.8506 5.17381 13.2947C5.64106 12.8274 6.36334 12.7551 6.91352 13.0781C7.01893 13.1384 7.15409 13.0987 7.21484 12.9937C7.47484 12.5375 7.8273 12.1424 8.25 11.8333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {t("header.initiatives")}
                </Link>

                {/* НОВА ИКОНКА - Projects (папка) */}
                <Link to="/projects" className="dropdown-link">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 7C3 5.89543 3.89543 5 5 5H9.58579C9.851 5 10.1054 5.10536 10.2929 5.29289L12 7H19C20.1046 7 21 7.89543 21 9V18C21 19.1046 20.1046 20 19 20H5C3.89543 20 3 19.1046 3 18V7Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {t("header.projects")}
                </Link>

                {/* НОВА ИКОНКА - Publications (книга) */}
                <Link to="/publications" className="dropdown-link">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 19.5C4 18.1193 5.11929 17 6.5 17H20M4 19.5C4 20.8807 5.11929 22 6.5 22H20V2H6.5C5.11929 2 4 3.11929 4 4.5V19.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M8 7H16M8 11H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  {t("header.publications")}
                </Link>

                {/* НОВА ИКОНКА - Stories (чат балонче) */}
                <Link to="/stories" className="dropdown-link">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 9H17M7 13H13M21 20L17.6757 18.3378C17.4237 18.2118 17.2977 18.1488 17.1656 18.1044C17.0484 18.065 16.9277 18.0365 16.8052 18.0193C16.6672 18 16.5263 18 16.2446 18H6.2C5.07989 18 4.51984 18 4.09202 17.782C3.71569 17.5903 3.40973 17.2843 3.21799 16.908C3 16.4802 3 15.9201 3 14.8V7.2C3 6.07989 3 5.51984 3.21799 5.09202C3.40973 4.71569 3.71569 4.40973 4.09202 4.21799C4.51984 4 5.07989 4 6.2 4H17.8C18.9201 4 19.4802 4 19.908 4.21799C20.2843 4.40973 20.5903 4.71569 20.782 5.09202C21 5.51984 21 6.07989 21 7.2V20Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {t("header.stories")}
                </Link>

                <Link to="/map" className="dropdown-link">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="currentColor" />
                  </svg>
                  {t("header.map")}
                </Link>
              </div>
            </div>

            {/* <NavLink
              to="/ad/create"
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            >
              {t("header.ad-create")}
            </NavLink> */}

            {/* НОВА ИКОНКА - Clubs (група хора) */}
            <NavLink
              to="/clubs"
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            >
              {t("header.clubs")}
            </NavLink>

            {/* Програма ReАкция — mega dropdown */}
            <div className="has-dropdown rxd-nav-item">
              <NavLink
                to="/reaction"
                className={({ isActive }) =>
                  `nav-item rxd-nav-trigger ${isActive || location.pathname.startsWith('/reaction') || location.pathname.startsWith('/fact-check') ? "active" : ""}`
                }
              >
                <svg className="rxd-nav-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12L11 14L15 10M12 3L4 7V12C4 16.4183 7.58172 21 12 21C16.4183 21 20 16.4183 20 12V7L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {t("header.reaction-program")}
                <svg className="dropdown-arrow" width="12" height="6" viewBox="0 0 12 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L6 5L11 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </NavLink>

              <div className="rxd-mega">
                <div className="rxd-header">
                  <span className="rxd-title">{t("header.reaction-program")}</span>
                </div>
                <Link to="/reaction" className="rxd-item">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="rxd-item-text">
                    <span className="rxd-item-title">{t("header.reaction-landing")}</span>
                    <span className="rxd-item-desc">{t("header.reaction-landing-desc")}</span>
                  </div>
                </Link>
                <Link to="/reaction/book" className="rxd-item">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="1.5" />
                    <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                  <div className="rxd-item-text">
                    <span className="rxd-item-title">{t("header.reaction-book")}</span>
                    <span className="rxd-item-desc">{t("header.reaction-book-desc")}</span>
                  </div>
                </Link>
                <Link to="/fact-check" className="rxd-item">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12L11 14L15 10M12 3L4 7V12C4 16.4183 7.58172 21 12 21C16.4183 21 20 16.4183 20 12V7L12 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="rxd-item-text">
                    <span className="rxd-item-title">{t("header.reaction-factcheck")}</span>
                    <span className="rxd-item-desc">{t("header.reaction-factcheck-desc")}</span>
                  </div>
                </Link>
                <Link to="/reaction/track" className="rxd-item">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <div className="rxd-item-text">
                    <span className="rxd-item-title">{t("header.reaction-track")}</span>
                    <span className="rxd-item-desc">{t("header.reaction-track-desc")}</span>
                  </div>
                </Link>
                <Link to="/reaction" className="rxd-cta">
                  {t("header.reaction-cta")} →
                </Link>
              </div>
            </div>

            {/* ЧАТ ЛИНК */}
            {isAuthentication && (
              <>
                {(profileData?.role === 'admin' || profileData?.role === 'mentor') ? (
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <NavLink
                      to="/academy/mentor-dashboard"
                      className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
                    >
                      {t("header.chats")}
                    </NavLink>
                    {/* ✅ BADGE */}
                    {activeChatCount > 0 && (
                      <span className="header-nav-badge">
                        {activeChatCount > 99 ? '99+' : activeChatCount}
                      </span>
                    )}
                  </div>
                ) : (
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <NavLink
                      to="/my-chats"
                      className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
                    >
                      {t("header.chats")}

                    </NavLink>
                    {/* ✅ BADGE */}
                    {activeChatCount > 0 && (
                      <span className="header-nav-badge">
                        {activeChatCount > 99 ? '99+' : activeChatCount}
                      </span>
                    )}
                  </div>
                )}
              </>
            )}
            {/* НОВА ИКОНКА - Games (контролер) */}
            <NavLink
              to="/games"
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            >
              {t("header.games")}
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            >
              {t("header.about")}
            </NavLink>

            <LanguageSwitcher />
          </nav>

          {/* Бутон за мобилното меню */}
          <button className="mobile-menu-toggle" onClick={toggleMobileMenu} aria-label="Меню">
            {mobileMenuOpen ? (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor" />
              </svg>
            ) : (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 18H21V16H3V18ZM3 13H21V11H3V13ZM3 6V8H21V6H3Z" fill="currentColor" />
              </svg>
            )}
          </button>

          {/* Bookmark иконка */}
          {hasAnyBookmarks && isAuthentication && (
            <div className="bookmark-header-section desktop-bookmark">
              <Link to="profile/bookmarks" className="bookmark-header-button">
                <BookmarkIconHeader />
                <span className="bookmark-count">{totalBookmarks}</span>
              </Link>
            </div>
          )}

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
                src={getResizedUrl(
                  profileData?.details?.imageURL ||
                  getProfileImage(profileData?.details?.gender),
                  200
                )}
                alt="Profile"
                className="profile-image-header"
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  const fallback = profileData?.details?.imageURL ||
                    getProfileImage(profileData?.details?.gender);
                  if (e.target.src !== fallback) e.target.src = fallback;
                }}
              />
            </div>

            <div className={`profile-dropdown ${profileOpen ? "active" : ""}`}>
              <div className="dropdown-header-home">
                <h4>{profileData?.details?.username || t("header.welcome")}</h4>
              </div>

              <div className="dropdown-menu-links">
                {hasAnyBookmarks && isAuthentication && (
                  <Link to="profile/bookmarks" className="menu-link" onClick={() => setProfileOpen(false)}>
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 21L12 16L5 21V5C5 3.89543 5.89543 3 7 3H17C18.1046 3 19 3.89543 19 5V21Z" fill="currentColor" />
                    </svg>
                    За четене ({totalBookmarks})
                  </Link>
                )}

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

      {/* Мобилно меню */}
      <div className={`mobile-menu-container ${mobileMenuOpen ? 'active' : ''}`} ref={mobileMenuRef}>
        <div className="mobile-menu-content">
          <div className="mobile-menu-header">
            <img src="/images/homePage/logo-2.png" alt="Pensa" className="mobile-logo" />
            <h3>Pensa Club</h3>
            <button className="mobile-close-btn" onClick={toggleMobileMenu} aria-label="Затвори менюто">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor" />
              </svg>
            </button>
          </div>

          <div className="mobile-menu-links">
            {location.pathname !== "/" && (
              <NavLink
                to="/"
                className="mobile-nav-item"
                onClick={toggleMobileMenu}
              >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5523 5.44772 21 6 21H9M19 10L21 12M19 10V20C19 20.5523 18.5523 21 18 21H15M9 21C9.55228 21 10 20.5523 10 20V16C10 15.4477 10.4477 15 11 15H13C13.5523 15 14 15.4477 14 16V20C14 20.5523 14.4477 21 15 21M9 21H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {t("header.home") || "Начална страница"}
              </NavLink>
            )}

            {/* DigiBridge Academy — мобилна секция */}
            <div className="mobile-academy-section">
              <div className="mobile-academy-label">DigiBridge Academy</div>
              <NavLink
                to="/academy/courses"
                className={({ isActive }) => `mobile-nav-item mobile-academy-item ${isActive ? "active" : ""}`}
                onClick={toggleMobileMenu}
              >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 5C19.89 4.65 18.67 4.5 17.5 4.5C15.55 4.5 13.45 4.9 12 6C10.55 4.9 8.45 4.5 6.5 4.5C4.55 4.5 2.45 4.9 1 6V20.65C1 20.9 1.25 21.15 1.5 21.15C1.6 21.15 1.65 21.1 1.75 21.1C3.1 20.45 5.05 20 6.5 20C8.45 20 10.55 20.4 12 21.5C13.35 20.65 15.8 20 17.5 20C19.15 20 20.85 20.3 22.25 21.05C22.35 21.1 22.4 21.1 22.5 21.1C22.75 21.1 23 20.85 23 20.6V6C22.4 5.55 21.75 5.25 21 5ZM21 18.5C19.9 18.15 18.7 18 17.5 18C15.8 18 13.35 18.65 12 19.5V8C13.35 7.15 15.8 6.5 17.5 6.5C18.7 6.5 19.9 6.65 21 7V18.5Z" fill="currentColor" />
                </svg>
                {t("header.academy-courses")}
              </NavLink>
              <NavLink
                to="/academy/lectures"
                className={({ isActive }) => `mobile-nav-item mobile-academy-item ${isActive ? "active" : ""}`}
                onClick={toggleMobileMenu}
              >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 3H3C1.89 3 1 3.89 1 5V17C1 18.1 1.89 19 3 19H8V21H16V19H21C22.1 19 22.99 18.1 22.99 17L23 5C23 3.89 22.1 3 21 3ZM21 17H3V5H21V17ZM16 11L10 14.5V7.5L16 11Z" fill="currentColor" />
                </svg>
                {t("header.academy-lectures")}
              </NavLink>
              <NavLink
                to="/academy/mentors"
                className={({ isActive }) => `mobile-nav-item mobile-academy-item ${isActive ? "active" : ""}`}
                onClick={toggleMobileMenu}
              >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14ZM21.12 6.46L19.44 8.14C20.07 9.26 20.07 10.74 19.44 11.86L21.12 13.54C22.56 11.5 22.56 8.5 21.12 6.46ZM17.76 9.82L16.08 8.14C16.69 9.26 16.69 10.74 16.08 11.86L17.76 13.54C19.2 11.5 19.2 8.5 17.76 9.82Z" fill="currentColor" />
                </svg>
                {t("header.academy-mentors")}
              </NavLink>
              <NavLink
                to="/academy/seminars"
                className={({ isActive }) => `mobile-nav-item mobile-academy-item ${isActive ? "active" : ""}`}
                onClick={toggleMobileMenu}
              >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19ZM17 12H12V17H17V12ZM7 7H12V9H7V7ZM7 11H10V13H7V11Z" fill="currentColor" />
                </svg>
                {t("header.academy-seminars", "Семинари")}
              </NavLink>
            </div>

            <NavLink
              to="/articles"
              className={({ isActive }) => `mobile-nav-item ${isActive ? "active" : ""}`}
              onClick={toggleMobileMenu}
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12H15M9 16H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L18.7071 8.70711C18.8946 8.89464 19 9.149 19 9.41421V19C19 20.1046 18.1046 21 17 21Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {t("header.articles")}
            </NavLink>

            {/* Общност с dropdown */}
            <div className="mobile-dropdown-container">
              <button
                className={`mobile-nav-item mobile-dropdown-toggle ${mobileCommunityOpen ? 'active' : ''}`}
                onClick={toggleMobileCommunity}
              >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 20C18 18.4087 17.3679 16.8826 16.2426 15.7574C15.1174 14.6321 13.5913 14 12 14C10.4087 14 8.88258 14.6321 7.75736 15.7574C6.63214 16.8826 6 18.4087 6 20M12 11C13.6569 11 15 9.65685 15 8C15 6.34315 13.6569 5 12 5C10.3431 5 9 6.34315 9 8C9 9.65685 10.3431 11 12 11Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M22 20C22 18.6044 21.2672 17.2078 20 16.2M16 11C17.6569 11 19 9.65685 19 8C19 6.34315 17.6569 5 16 5M2 20C2 18.6044 2.73276 17.2078 4 16.2M8 11C6.34315 11 5 9.65685 5 8C5 6.34315 6.34315 5 8 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {t("header.community")}
                <svg
                  className={`mobile-dropdown-arrow ${mobileCommunityOpen ? 'rotated' : ''}`}
                  width="12"
                  height="6"
                  viewBox="0 0 12 6"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M1 1L6 5L11 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              <div className={`mobile-dropdown-content ${mobileCommunityOpen ? 'active' : ''}`}>
                <NavLink
                  to="/community?reset=true"
                  className={({ isActive }) => `mobile-dropdown-item ${isActive ? "active" : ""}`}
                  onClick={toggleMobileMenu}
                >
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.5 2C13.0899 2 16 4.91015 16 8.5C16 10.0993 15.4102 11.5582 14.4274 12.6822L21.2929 19.5477L19.8787 20.9619L13.0132 14.0964C11.8891 15.0793 10.4303 15.6691 8.83105 15.6691C5.24119 15.6691 2.33105 12.7589 2.33105 9.16907C2.33105 5.57921 5.24119 2.66907 8.83105 2.66907" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {t("header.community")}
                </NavLink>

                <NavLink
                  to="/initiatives"
                  className={({ isActive }) => `mobile-dropdown-item ${isActive ? "active" : ""}`}
                  onClick={toggleMobileMenu}
                >
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 21H15M12 3C8.68629 3 6 5.68629 6 9C6 11.2208 7.21497 13.1599 9 14.1973V17H15V14.1973C16.785 13.1599 18 11.2208 18 9C18 5.68629 15.3137 3 12 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {t("header.initiatives")}
                </NavLink>

                <NavLink
                  to="/projects"
                  className={({ isActive }) => `mobile-dropdown-item ${isActive ? "active" : ""}`}
                  onClick={toggleMobileMenu}
                >
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 7C3 5.89543 3.89543 5 5 5H9.58579C9.851 5 10.1054 5.10536 10.2929 5.29289L12 7H19C20.1046 7 21 7.89543 21 9V18C21 19.1046 20.1046 20 19 20H5C3.89543 20 3 19.1046 3 18V7Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {t("header.projects")}
                </NavLink>

                <NavLink
                  to="/publications"
                  className={({ isActive }) => `mobile-dropdown-item ${isActive ? "active" : ""}`}
                  onClick={toggleMobileMenu}
                >
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 19.5C4 18.1193 5.11929 17 6.5 17H20M4 19.5C4 20.8807 5.11929 22 6.5 22H20V2H6.5C5.11929 2 4 3.11929 4 4.5V19.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M8 7H16M8 11H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  {t("header.publications")}
                </NavLink>

                <NavLink
                  to="/stories"
                  className={({ isActive }) => `mobile-dropdown-item ${isActive ? "active" : ""}`}
                  onClick={toggleMobileMenu}
                >
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 9H17M7 13H13M21 20L17.6757 18.3378C17.4237 18.2118 17.2977 18.1488 17.1656 18.1044C17.0484 18.065 16.9277 18.0365 16.8052 18.0193C16.6672 18 16.5263 18 16.2446 18H6.2C5.07989 18 4.51984 18 4.09202 17.782C3.71569 17.5903 3.40973 17.2843 3.21799 16.908C3 16.4802 3 15.9201 3 14.8V7.2C3 6.07989 3 5.51984 3.21799 5.09202C3.40973 4.71569 3.71569 4.40973 4.09202 4.21799C4.51984 4 5.07989 4 6.2 4H17.8C18.9201 4 19.4802 4 19.908 4.21799C20.2843 4.40973 20.5903 4.71569 20.782 5.09202C21 5.51984 21 6.07989 21 7.2V20Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {t("header.stories")}
                </NavLink>

                <NavLink
                  to="/map"
                  className={({ isActive }) => `mobile-dropdown-item ${isActive ? "active" : ""}`}
                  onClick={toggleMobileMenu}
                >
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M12 22C16 18 20 14.4183 20 10C20 5.58172 16.4183 2 12 2C7.58172 2 4 5.58172 4 10C4 14.4183 8 18 12 22Z" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                  {t("header.map")}
                </NavLink>
              </div>
            </div>

            <NavLink
              to="/clubs"
              className={({ isActive }) => `mobile-nav-item ${isActive ? "active" : ""}`}
              onClick={toggleMobileMenu}
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 20C17 18.3431 14.7614 17 12 17C9.23858 17 7 18.3431 7 20M21 17C21 15.7635 19.7085 14.7012 18 14.25M3 17C3 15.7635 4.29153 14.7012 6 14.25M18 10.5C19.1046 10.5 20 9.60457 20 8.5C20 7.39543 19.1046 6.5 18 6.5M6 10.5C4.89543 10.5 4 9.60457 4 8.5C4 7.39543 4.89543 6.5 6 6.5M12 14C10.3431 14 9 12.6569 9 11C9 9.34315 10.3431 8 12 8C13.6569 8 15 9.34315 15 11C15 12.6569 13.6569 14 12 14Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {t("header.clubs")}
            </NavLink>

            {/* Програма ReАкция — мобилна секция */}
            <div className="mobile-reaction-section">
              <div className="mobile-reaction-label">{t("header.reaction-program")}</div>
              <NavLink
                to="/reaction"
                className={({ isActive }) => `mobile-nav-item mobile-reaction-item ${isActive ? "active" : ""}`}
                onClick={toggleMobileMenu}
              >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {t("header.reaction-landing")}
              </NavLink>
              <NavLink
                to="/reaction/book"
                className={({ isActive }) => `mobile-nav-item mobile-reaction-item ${isActive ? "active" : ""}`}
                onClick={toggleMobileMenu}
              >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="1.5" />
                  <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                {t("header.reaction-book")}
              </NavLink>
              <NavLink
                to="/fact-check"
                className={({ isActive }) => `mobile-nav-item mobile-reaction-item ${isActive ? "active" : ""}`}
                onClick={toggleMobileMenu}
              >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12L11 14L15 10M12 3L4 7V12C4 16.4183 7.58172 21 12 21C16.4183 21 20 16.4183 20 12V7L12 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {t("header.reaction-factcheck")}
              </NavLink>
              <NavLink
                to="/reaction/track"
                className={({ isActive }) => `mobile-nav-item mobile-reaction-item ${isActive ? "active" : ""}`}
                onClick={toggleMobileMenu}
              >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                {t("header.reaction-track")}
              </NavLink>
            </div>

            {/* ✅ ЧАТ ЛИНК MOBILE */}
            {isAuthentication && (
              <NavLink
                to={(profileData?.role === 'admin' || profileData?.role === 'mentor') ? "/academy/mentor-dashboard" : "/my-chats"}
                className={({ isActive }) => `mobile-nav-item ${isActive ? "active" : ""}`}
                onClick={toggleMobileMenu}
              >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 10H8.01M12 10H12.01M16 10H16.01M21 12C21 16.4183 16.9706 20 12 20C10.4607 20 9.01172 19.6565 7.74467 19.0511L3 20L4.39499 16.28C3.51156 15.0423 3 13.5743 3 12C3 7.58172 7.02944 4 12 4C16.9706 4 21 7.58172 21 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {t("header.chats")}
              </NavLink>
            )}

            <NavLink
              to="/games"
              className={({ isActive }) => `mobile-nav-item ${isActive ? "active" : ""}`}
              onClick={toggleMobileMenu}
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 11H10M8 9V13M15.5 12H15.51M18.5 12H18.51M7 16.4L4.56569 18.8343C3.78526 19.6147 3.39505 20.0049 3.00394 19.9952C2.66557 19.9867 2.35037 19.8241 2.14346 19.5528C2 19.3555 2 18.8062 2 17.7077V11C2 8.17157 2 6.75736 2.87868 5.87868C3.75736 5 5.17157 5 8 5H16C18.8284 5 20.2426 5 21.1213 5.87868C22 6.75736 22 8.17157 22 11V12C22 14.8284 22 16.2426 21.1213 17.1213C20.2426 18 18.8284 18 16 18H11.4C10.5074 18 10.0611 18 9.64386 18.1118C9.27242 18.2099 8.9195 18.3644 8.5979 18.5692C8.23183 18.8005 7.91464 19.1177 7.28026 19.7521L6 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {t("header.games")}
            </NavLink>

            <NavLink
              to="/about"
              className={({ isActive }) => `mobile-nav-item ${isActive ? "active" : ""}`}
              onClick={toggleMobileMenu}
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                <path d="M12 17V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="12" cy="8" r="1" fill="currentColor" />
              </svg>
              {t("header.about")}
            </NavLink>

            {hasAnyBookmarks && isAuthentication && (
              <Link to="profile/bookmarks" className="mobile-nav-item" onClick={toggleMobileMenu}>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 21L12 16L5 21V5C5 3.89543 5.89543 3 7 3H17C18.1046 3 19 3.89543 19 5V21Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {t("header.bookmarks") || "За четене"} ({totalBookmarks})
              </Link>
            )}

            {!isAuthentication ? (
              <>
                <Link to="/sign-up?view=login" className="mobile-nav-item" onClick={toggleMobileMenu}>
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H15M10 17L15 12M15 12L10 7M15 12H3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {t("header.login")}
                </Link>
                <Link to="/sign-up?view=register" className="mobile-nav-item" onClick={toggleMobileMenu}>
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21M20 8V14M23 11H17M12.5 7C12.5 9.20914 10.7091 11 8.5 11C6.29086 11 4.5 9.20914 4.5 7C4.5 4.79086 6.29086 3 8.5 3C10.7091 3 12.5 4.79086 12.5 7Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {t("header.register")}
                </Link>
              </>
            ) : (
              <>
                <Link
                  to={isFinish ? "/profile/data" : "/profile/profile-form"}
                  className="mobile-nav-item"
                  onClick={toggleMobileMenu}
                >
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {t("header.profile")}
                </Link>
                <Link to="/logout" className="mobile-nav-item" onClick={toggleMobileMenu}>
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9M16 17L21 12M21 12L16 7M21 12H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {t("header.logout")}
                </Link>
              </>
            )}

            <LanguageSwitcher isMobile={true} onMobileMenuToggle={toggleMobileMenu} />
          </div>
        </div>
      </div>

      <div className="header-line"></div>

      <AlertModal isOpen={isModalOpen} onClose={handleModalToggle}>
        <p>{t("profile.alert_message")}</p>
      </AlertModal>
    </>
  );
};