import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { UserContext } from '../../contexts/UserContext';
import './digiBridgeHeader.css';

export const DigiBridgeHeader = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { isAuthentication, isFinish, profileData, isAdmin, isModerator } = useContext(UserContext);

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  const userDropdownRef = useRef(null);
  const langDropdownRef = useRef(null);

  // ✅ Проверка дали е ментор или админ
  const isMentorOrAdmin = isAdmin || isModerator || profileData?.role === 'mentor';

  // ✅ ОСНОВНИ ЛИНКОВЕ (ВИНАГИ ВИДИМИ)
  const baseNavigationItems = [
    { key: 'home', label: t('digiBridge.header.nav.home'), path: '/academy' },
    { key: 'courses', label: t('digiBridge.header.nav.courses'), path: '/academy/courses' },
    { key: 'mentors', label: t('digiBridge.header.nav.mentors'), path: '/academy/mentors' },
    { key: 'events', label: t('digiBridge.header.nav.events'), path: '/academy/events' },
    { key: 'library', label: t('digiBridge.header.nav.library'), path: '/academy/library' },
    { key: 'community', label: t('digiBridge.header.nav.community'), path: '/academy/community' },
    { key: 'about', label: t('digiBridge.header.nav.about'), path: '/academy/about' },
  ];

  // ✅ CHAT ЛИНК (САМО ЗА LOGGED IN USERS)
  const chatNavigationItem = isAuthentication
    ? {
        key: 'chat',
        label: isMentorOrAdmin
          ? t('digiBridge.header.nav.mentorDashboard')
          : t('digiBridge.header.nav.myChats'),
        path: isMentorOrAdmin ? '/academy/mentor-dashboard' : '/my-chats',
      }
    : null;

  // ✅ ОБЕДИНЕНИ ЛИНКОВЕ (основни + chat ако е logged in)
  const allNavigationItems = chatNavigationItem
    ? [...baseNavigationItems, chatNavigationItem]
    : baseNavigationItems;

  const languages = [
    { code: 'bg', name: 'Български', flag: '🇧🇬' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target)) {
        setIsLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserDropdownOpen(false);
    setIsLangDropdownOpen(false);
  }, [location.pathname]);

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLanguageChange = (langCode) => {
    i18n.changeLanguage(langCode);
    setIsLangDropdownOpen(false);
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

  return (
    <header className={`digibridge-header ${isScrolled ? 'digibridge-header-scrolled' : ''}`}>
      <div className="digibridge-header-container">
        
        {/* Logo */}
        <Link to="/academy" className="digibridge-header-logo">
          <span className="digibridge-header-logo-icon">🌉</span>
          <div className="digibridge-header-logo-content">
            <span className="digibridge-header-logo-title">DigiBridge</span>
            <span className="digibridge-header-logo-subtitle">{t('digiBridge.header.tagline')}</span>
          </div>
        </Link>

        {/* ✅ НАВИГАЦИЯ (всички линкове + chat ако е logged in) */}
        <nav className="digibridge-header-navigation">
          {allNavigationItems.map((item) => (
            <Link
              key={item.key}
              to={item.path}
              className={`digibridge-header-nav-item ${isActive(item.path) ? 'digibridge-header-nav-item-active' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right Section */}
        <div className="digibridge-header-actions">
          
          {/* Back to Pensa Club */}
          <Link to="/" className="digibridge-header-back-link">
            Pensa Club
          </Link>

          {/* Language Dropdown */}
          <div className="digibridge-header-language" ref={langDropdownRef}>
            <button
              className="digibridge-header-language-toggle"
              onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
              aria-label={t('digiBridge.header.changeLanguage')}
            >
              <span className="digibridge-header-language-flag">{currentLanguage.flag}</span>
            </button>

            {isLangDropdownOpen && (
              <div className="digibridge-header-language-menu">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    className={`digibridge-header-language-option ${i18n.language === lang.code ? 'digibridge-header-language-option-active' : ''}`}
                    onClick={() => handleLanguageChange(lang.code)}
                  >
                    <span className="digibridge-header-language-option-flag">{lang.flag}</span>
                    <span className="digibridge-header-language-option-name">{lang.name}</span>
                    {i18n.language === lang.code && (
                      <svg className="digibridge-header-language-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="digibridge-header-user" ref={userDropdownRef}>
            <button
              className="digibridge-header-user-toggle"
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              aria-label={t('digiBridge.header.userMenu')}
            >
              <img
                src={
                  profileData?.details?.imageURL ||
                  getProfileImage(profileData?.details?.gender)
                }
                alt="Profile"
                className="digibridge-header-user-avatar"
              />
            </button>

            {isUserDropdownOpen && (
              <div className="digibridge-header-user-menu">
                <div className="digibridge-header-user-info">
                  <img
                    src={
                      profileData?.details?.imageURL ||
                      getProfileImage(profileData?.details?.gender)
                    }
                    alt="Profile"
                    className="digibridge-header-user-info-avatar"
                  />
                  <div className="digibridge-header-user-info-details">
                    <p className="digibridge-header-user-info-name">
                      {profileData?.details?.username || t("header.welcome")}
                    </p>
                    {profileData?.details?.email && (
                      <p className="digibridge-header-user-info-email">
                        {profileData.details.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="digibridge-header-user-divider"></div>

                {!isAuthentication ? (
                  <>
                    <Link to="/sign-up?view=login" className="digibridge-header-user-link">
                      <svg className="digibridge-header-user-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 7L9.6 8.4L12.2 11H2V13H12.2L9.6 15.6L11 17L16 12L11 7Z" />
                        <path d="M20 19H12V21H20C21.1 21 22 20.1 22 19V5C22 3.9 21.1 3 20 3H12V5H20V19Z" />
                      </svg>
                      <span>{t('header.login')}</span>
                    </Link>
                    <Link to="/sign-up?view=register" className="digibridge-header-user-link">
                      <svg className="digibridge-header-user-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M15 12C17.21 12 19 10.21 19 8C19 5.79 17.21 4 15 4C12.79 4 11 5.79 11 8C11 10.21 12.79 12 15 12Z" />
                        <path d="M15 14C12.33 14 7 15.34 7 18V20H23V18C23 15.34 17.67 14 15 14Z" />
                      </svg>
                      <span>{t('header.register')}</span>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/academy/dashboard" className="digibridge-header-user-link">
                      <svg className="digibridge-header-user-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="7" height="7"/>
                        <rect x="14" y="3" width="7" height="7"/>
                        <rect x="14" y="14" width="7" height="7"/>
                        <rect x="3" y="14" width="7" height="7"/>
                      </svg>
                      <span>{t('digiBridge.header.dropdown.dashboard')}</span>
                    </Link>

                    <Link to="/academy/my-courses" className="digibridge-header-user-link">
                      <svg className="digibridge-header-user-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                      </svg>
                      <span>{t('digiBridge.header.dropdown.myCourses')}</span>
                    </Link>

                    <Link to="/academy/my-mentor" className="digibridge-header-user-link">
                      <svg className="digibridge-header-user-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                      </svg>
                      <span>{t('digiBridge.header.dropdown.myMentor')}</span>
                    </Link>

                    <Link 
                      to={isFinish ? "/profile/data" : "/profile/profile-form"} 
                      className="digibridge-header-user-link"
                    >
                      <svg className="digibridge-header-user-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                      <span>{t('header.profile')}</span>
                    </Link>

                    <div className="digibridge-header-user-divider"></div>

                    <Link to="/logout" className="digibridge-header-user-link digibridge-header-user-link-logout">
                      <svg className="digibridge-header-user-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                        <polyline points="16 17 21 12 16 7"/>
                        <line x1="21" y1="12" x2="9" y2="12"/>
                      </svg>
                      <span>{t('header.logout')}</span>
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="digibridge-header-mobile-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={t('digiBridge.header.mobileMenu')}
          >
            <span className={`digibridge-header-hamburger ${isMobileMenuOpen ? 'digibridge-header-hamburger-open' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <>
          <nav className="digibridge-header-mobile-nav">
            <div className="digibridge-header-mobile-nav-content">
              {allNavigationItems.map((item) => (
                <Link
                  key={item.key}
                  to={item.path}
                  className={`digibridge-header-mobile-nav-link ${isActive(item.path) ? 'digibridge-header-mobile-nav-link-active' : ''}`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
          <div className="digibridge-header-mobile-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>
        </>
      )}
    </header>
  );
};