import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
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
    const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

    const moreMenuRef = useRef(null);
    const userMenuRef = useRef(null);
    const langMenuRef = useRef(null);
    const headerRef = useRef(null);

    const isMentorOrAdmin = isAdmin || isModerator || profileData?.role === 'mentor';

    const mainNavItems = [
        { key: 'home', label: t('digiBridge.header.nav.home', 'Начало'), path: '/academy' },
        { key: 'courses', label: t('digiBridge.header.nav.courses', 'Курсове'), path: '/academy/courses' },
        { key: 'lectures', label: t('digiBridge.header.nav.lectures', 'Лекции'), path: '/academy/lectures' },
        { key: 'mentors', label: t('digiBridge.header.nav.mentors', 'Ментори'), path: '/academy/mentors' },
    ];

    const moreNavItems = [
        { key: 'events', label: t('digiBridge.header.nav.events', 'Събития'), path: '/academy/events', icon: '📅' },
        { key: 'library', label: t('digiBridge.header.nav.library', 'Библиотека'), path: '/academy/library', icon: '📚' },
        { key: 'community', label: t('digiBridge.header.nav.community', 'Общност'), path: '/academy/community', icon: '👥' },
        { key: 'about', label: t('digiBridge.header.nav.about', 'За нас'), path: '/academy/about', icon: 'ℹ️' },
    ];

    const languages = [
        { code: 'bg', name: 'Български', flag: '🇧🇬' },
        { code: 'en', name: 'English', flag: '🇬🇧' },
        { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    ];

    const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [location.pathname]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (moreMenuRef.current && !moreMenuRef.current.contains(e.target)) {
                setIsMoreMenuOpen(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
                setIsUserMenuOpen(false);
            }
            if (langMenuRef.current && !langMenuRef.current.contains(e.target)) {
                setIsLangMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        setIsMobileMenuOpen(false);
        setIsMoreMenuOpen(false);
        setIsUserMenuOpen(false);
        setIsLangMenuOpen(false);
    }, [location.pathname]);

    const isActive = (path) => location.pathname === path;

    const handleLanguageChange = (langCode) => {
        i18n.changeLanguage(langCode);
        setIsLangMenuOpen(false);
    };

    const getProfileImage = (gender) => {
        switch (gender) {
            case "male": return "/images/homePage/user-male.png";
            case "female": return "/images/homePage/user-female.png";
            case "other": return "/images/homePage/user-it.png";
            default: return "/images/homePage/user-img.png";
        }
    };

    const toggleMobileMenu = useCallback(() => {
        setIsMobileMenuOpen(prev => !prev);
    }, []);

    return (
        <>
            <header
                ref={headerRef}
                className={`dbh-header ${isScrolled ? 'dbh-header--scrolled' : ''}`}
            >
                <div className="dbh-container">
                    {/* ===== ЛЯВА ЧАСТ: Logo + Navigation ===== */}
                    <div className="dbh-main">
                        {/* Logo */}
                        <Link to="/academy" className="dbh-logo">
                            <span className="dbh-logo__icon">🎓</span>
                            <div className="dbh-logo__text">
                                <span className="dbh-logo__title">DigiBridge</span>
                                <span className="dbh-logo__subtitle">Academy</span>
                            </div>
                        </Link>

                        {/* Main Navigation */}
                        <nav className="dbh-nav">
                            {mainNavItems.map((item) => (
                                <Link
                                    key={item.key}
                                    to={item.path}
                                    className={`dbh-nav__link ${isActive(item.path) ? 'dbh-nav__link--active' : ''}`}
                                >
                                    {item.label}
                                </Link>
                            ))}

                            {/* More Menu */}
                            <div className="dbh-more" ref={moreMenuRef}>
                                <button
                                    className={`dbh-more__trigger ${isMoreMenuOpen ? 'dbh-more__trigger--open' : ''}`}
                                    onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                                    aria-expanded={isMoreMenuOpen}
                                >
                                    <span>{t('digiBridge.header.nav.more')}</span>
                                    <svg className="dbh-more__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M6 9l6 6 6-6" />
                                    </svg>
                                </button>

                                <div className={`dbh-mega ${isMoreMenuOpen ? 'dbh-mega--open' : ''}`}>
                                    <div className="dbh-mega__content">
                                        {moreNavItems.map((item) => (
                                            <Link
                                                key={item.key}
                                                to={item.path}
                                                className={`dbh-mega__item ${isActive(item.path) ? 'dbh-mega__item--active' : ''}`}
                                            >
                                                <span className="dbh-mega__icon">{item.icon}</span>
                                                <span className="dbh-mega__label">{item.label}</span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Chat link */}
                            {isAuthentication && (
                                <Link
                                    to={isMentorOrAdmin ? '/academy/mentor-dashboard' : '/my-chats'}
                                    className={`dbh-nav__link dbh-nav__link--chat ${isActive(isMentorOrAdmin ? '/academy/mentor-dashboard' : '/my-chats') ? 'dbh-nav__link--active' : ''}`}
                                >
                                    💬
                                    <span className="dbh-nav__chat-text">
                                        {isMentorOrAdmin ? t('digiBridge.header.nav.dashboard', 'Табло') : t('digiBridge.header.nav.myChats', 'Чат')}
                                    </span>
                                </Link>
                            )}
                        </nav>
                    </div>

                    {/* ===== ДЯСНА ЧАСТ: Actions (отделени) ===== */}
                    <div className="dbh-actions">
                        {/* Back to Pensa */}
                        <Link to="/" className="dbh-back">
                            <span className="dbh-back__icon">←</span>
                            <span className="dbh-back__text">Pensa Club</span>
                        </Link>

                        {/* Language */}
                        <div className="dbh-lang" ref={langMenuRef}>
                            <button
                                className="dbh-lang__trigger"
                                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                                aria-label={t('digiBridge.header.changeLanguage', 'Смени езика')}
                            >
                                <span className="dbh-lang__flag">{currentLanguage.flag}</span>
                            </button>

                            <div className={`dbh-lang__menu ${isLangMenuOpen ? 'dbh-lang__menu--open' : ''}`}>
                                {languages.map((lang) => (
                                    <button
                                        key={lang.code}
                                        className={`dbh-lang__option ${i18n.language === lang.code ? 'dbh-lang__option--active' : ''}`}
                                        onClick={() => handleLanguageChange(lang.code)}
                                    >
                                        <span className="dbh-lang__option-flag">{lang.flag}</span>
                                        <span className="dbh-lang__option-name">{lang.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* User */}
                        <div className="dbh-user" ref={userMenuRef}>
                            <button
                                className="dbh-user__trigger"
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                aria-label={t('digiBridge.header.userMenu', 'Потребителско меню')}
                            >
                                <img
                                    src={profileData?.details?.imageURL || getProfileImage(profileData?.details?.gender)}
                                    alt=""
                                    className="dbh-user__avatar"
                                />
                            </button>

                            <div className={`dbh-user__menu ${isUserMenuOpen ? 'dbh-user__menu--open' : ''}`}>
                                {!isAuthentication ? (
                                    <>
                                        <Link to="/sign-up?view=login" className="dbh-user__link">
                                            <span className="dbh-user__link-icon">🔑</span>
                                            {t('header.login', 'Вход')}
                                        </Link>
                                        <Link to="/sign-up?view=register" className="dbh-user__link">
                                            <span className="dbh-user__link-icon">✨</span>
                                            {t('header.register', 'Регистрация')}
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <div className="dbh-user__info">
                                            <img
                                                src={profileData?.details?.imageURL || getProfileImage(profileData?.details?.gender)}
                                                alt=""
                                                className="dbh-user__info-avatar"
                                            />
                                            <div className="dbh-user__info-text">
                                                <span className="dbh-user__info-name">
                                                    {profileData?.details?.username || t('header.welcome', 'Здравей')}
                                                </span>
                                                {profileData?.details?.email && (
                                                    <span className="dbh-user__info-email">{profileData.details.email}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="dbh-user__divider"></div>
                                        <Link to="/academy/dashboard" className="dbh-user__link">
                                            <span className="dbh-user__link-icon">📊</span>
                                            {t('digiBridge.header.dropdown.dashboard', 'Табло')}
                                        </Link>
                                        <Link to="/academy/my-courses" className="dbh-user__link">
                                            <span className="dbh-user__link-icon">📚</span>
                                            {t('digiBridge.header.dropdown.myCourses', 'Моите курсове')}
                                        </Link>
                                        <Link to={isFinish ? "/profile/data" : "/profile/profile-form"} className="dbh-user__link">
                                            <span className="dbh-user__link-icon">👤</span>
                                            {t('header.profile', 'Профил')}
                                        </Link>
                                        <div className="dbh-user__divider"></div>
                                        <Link to="/logout" className="dbh-user__link dbh-user__link--logout">
                                            <span className="dbh-user__link-icon">🚪</span>
                                            {t('header.logout', 'Изход')}
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Mobile Toggle */}
                        <button
                            className={`dbh-mobile-toggle ${isMobileMenuOpen ? 'dbh-mobile-toggle--open' : ''}`}
                            onClick={toggleMobileMenu}
                            aria-label="Menu"
                            aria-expanded={isMobileMenuOpen}
                        >
                            <span className="dbh-mobile-toggle__line"></span>
                            <span className="dbh-mobile-toggle__line"></span>
                            <span className="dbh-mobile-toggle__line"></span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu */}
            <div className={`dbh-mobile ${isMobileMenuOpen ? 'dbh-mobile--open' : ''}`}>
                <div className="dbh-mobile__backdrop" onClick={() => setIsMobileMenuOpen(false)}></div>
                <nav className="dbh-mobile__nav">
                    <div className="dbh-mobile__header">
                        <span className="dbh-mobile__title">Меню</span>
                        <button className="dbh-mobile__close" onClick={() => setIsMobileMenuOpen(false)}>✕</button>
                    </div>

                    <div className="dbh-mobile__section">
                        <span className="dbh-mobile__section-title">Навигация</span>
                        {mainNavItems.map((item) => (
                            <Link
                                key={item.key}
                                to={item.path}
                                className={`dbh-mobile__link ${isActive(item.path) ? 'dbh-mobile__link--active' : ''}`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>

                    <div className="dbh-mobile__section">
                        <span className="dbh-mobile__section-title">Още</span>
                        {moreNavItems.map((item) => (
                            <Link
                                key={item.key}
                                to={item.path}
                                className={`dbh-mobile__link ${isActive(item.path) ? 'dbh-mobile__link--active' : ''}`}
                            >
                                <span className="dbh-mobile__link-icon">{item.icon}</span>
                                {item.label}
                            </Link>
                        ))}
                    </div>

                    {isAuthentication && (
                        <div className="dbh-mobile__section">
                            <span className="dbh-mobile__section-title">Акаунт</span>
                            <Link
                                to={isMentorOrAdmin ? '/academy/mentor-dashboard' : '/my-chats'}
                                className="dbh-mobile__link"
                            >
                                <span className="dbh-mobile__link-icon">💬</span>
                                {isMentorOrAdmin ? 'Табло на ментора' : 'Моите чатове'}
                            </Link>
                        </div>
                    )}
                </nav>
            </div>
        </>
    );
};

export default DigiBridgeHeader;