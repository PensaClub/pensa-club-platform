import React, { useContext, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, NavLink } from "react-router-dom";
import { Routes, Route, Outlet } from "react-router-dom";
import { ProfileData } from "./ProfileData";
import ProfileForm from "./ProfileForm";
import ProfileAddress from "./ProfileAddress";
import { ProfilePassword } from "./ProfilePassword";
import { useTranslation } from "react-i18next";
import "./profile-new.css"; // Новият CSS файл за дизайна
import { UserContext } from "../contexts/UserContext";

import {
  DashboardIcon,
  UsersIcon,
  AnalyticsIcon,
  WarningIcon,
  ChatIcon,
  ForumIcon,
  RightArrowIcon,
  LeftArrowIcon,
  NotificationIcon,
  DownArrowIcon,
  CircleIcon,
  LogoutIcon,
  RefreshIcon,
  ArrowIcon,
  SearchIcon,
  BillingIcon,
  JobsAdsIcon,
  EducationIcon,
  MenuIcon
} from "../Articles/articleUtils/AdminIcons";

import { ProfileSkills } from "./ProfileSkills";
import { ProfileWorks } from "./ProfileWorks";
import { ProfileInterests } from "./ProfileInterests";
import { ProfileAnnounced } from "./ProfileAnnounced";
import { AdminGuard } from "../Guards/AdminGuard";
import { PendingAnnouncements } from "../AdminDashboard/PendingAnnouncements/PendingAnnouncements";
import { ApprovedAnnouncements } from "../AdminDashboard/ApprovedAnnouncements/ApprovedAnnouncements";
import { AllAnnouncements } from "../AdminDashboard/AllAnnouncements/AllAnnouncements";
import { RejectAnnouncements } from "../AdminDashboard/RejectAnnouncements/RejectAnnouncements";
import { AllUsers } from "../AdminDashboard/AllUsers/AllUsers";
import { UnfinishedProfiles } from "../AdminDashboard/UnfinishedProfiles/UnfinishedProfiles";
import { AllUsersStatistics } from "../AdminDashboard/AllUsersStatistics/AllUsersStatistics";
import { AdminSuggestUsers } from "../AdminDashboard/AdminSuggestUser/AdminSuggestUsers";
import { SuggestResolvedUsers } from "../AdminDashboard/AdminSuggestUser/SuggesResolvedtUsers/SuggestResolvedUsers";
import { ProfileMessages } from "./ProfileMessages";
import { AdminSubscription } from "../AdminDashboard/AdminSubscription/AdminSubscription";
import ArticleCreateForm from "../Articles/ArticleCreateForm/ArticleCreateForm";

export const Profile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;
  const [menuOpen, setMenuOpen] = useState(false);
  const { isFinish, profileData, isAdmin, addressId } = useContext(UserContext);
  const [adsCount, setAdsCount] = useState("");
  const [approvedCount, setApprovedCount] = useState("");
  const [rejectCount, setRejectCount] = useState("");
  const [allUsers, setAllUsers] = useState("");
  const [unfinishedUsers, setUnfinishedUsers] = useState("");
  const [allSuggestedUsers, setAllSuggestedUsers] = useState("");
  const [resolvedUsers, setResolvedUsers] = useState("");
  const [allSubscriptionEmails, setAllSubscriptionEmails] = useState("");
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const sideMenuRef = useRef(null);
  // Модернизирано управление на състоянията на подменютата
  const [subMenuStates, setSubMenuStates] = useState({
    ads: false,
    users: false,
    suggest: false
  });

  // Получаваме текущата секция от URL-а с обект за съпоставяне
  const getCurrentSection = () => {
    const path = location.pathname;

    const pathTitleMap = {
      "/profile/data": t("profile.personal_data"),
      "/profile/address": t("profile.address"),
      "/profile/password": t("profile.password"),
      "/profile/announced": t("profile.announced"),
      "/profile/messages": t("profile.messages"),
      "/profile/skills": "Skills",
      "/profile/workOptions": "Work Options",
      "/profile/interestOptions": "Interests",
      "/profile/ads-admin": t("profile.ads-statistic"),
      "/profile/pending-announcements": t("profile.pending_announcements"),
      "/profile/approved-announcements": t("profile.approved_announcements"),
      "/profile/reject-announcements": t("profile.reject_announcements"),
      "/profile/users-statistic": t("admin.users"),
      "/profile/users-admin": t("profile.all_users"),
      "/profile/users-unfinished": t("admin.unfinished_users"),
      "/profile/admin-suggest-users": t("admin.admin-suggest-users"),
      "/profile/suggest-resolved-users": t("admin.suggest_resolved_users"),
      "/profile/subscription-admin": t("admin.ads_subscription"),
      "/profile/article-create": "Създаване на статии",
    };

    const matchedPath = Object.keys(pathTitleMap).find(key => path.includes(key));
    return matchedPath ? pathTitleMap[matchedPath] : "Профил";
  };

  // Пътища за админския панел
  const adminPaths = [
    "/profile/pending-announcements",
    "/profile/approved-announcements",
    "/profile/reject-announcements",
    "/profile/ads-admin",
    "/profile/users-admin",
    "/profile/users-statistic",
    "/profile/users-unfinished",
    "/profile/admin-suggest-users",
    "/profile/suggest-resolved-users",
    "/profile/messages",
    "/profile/subscription-admin"
  ];

  const isAdminPanel = adminPaths.some(path => location.pathname.startsWith(path));

  useEffect(() => {
    window.scrollTo({ top: 0 });
    if (!profileData) {
      navigate("/profile/profile-form");
    }
    if (!isFinish) {
      navigate("/profile/profile-form");
    }
  }, [isFinish, navigate, profileData]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  useEffect(() => {
    const handleClickOutsideMenu = (event) => {
      if (
        window.innerWidth <= 1024 && 
        sideMenuRef.current && 
        event.target && 
        event.target.nodeType && 
        !sideMenuRef.current.contains(event.target) &&
        !(event.target.closest && event.target.closest('.menu-toggle'))
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutsideMenu);
    return () => {
      document.removeEventListener('mousedown', handleClickOutsideMenu);
    };
  }, []);

  // const handleLogout = () => {
  //   navigate("/logout");
  // };
  const toggleProfileMenu = () => {
    setProfileMenuOpen(!profileMenuOpen);
  };
  // Единна функция за превключване на подменюта
  const toggleSubMenu = (menuName) => {
    setSubMenuStates(prev => ({
      ...prev,
      [menuName]: !prev[menuName]
    }));
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

  // Обновяване на админския панел
  const refreshAdminPanel = () => {
    setSubMenuStates({
      ads: false,
      users: false,
      suggest: false
    });
    navigate('/profile/data');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      refreshAdminPanel();
    }
  };

  return (
    <div className={`profile-panel ${menuOpen ? 'menu-open' : ''}`}>
      {/* Хедър, подобен на админския */}
      <header className="profile-header">
        <button onClick={toggleMenu} className="menu-toggle" data-testid="menu-toggle">
          <MenuIcon />
        </button>
        <Link to="/" className="logo-link">
          <img src="/images/homePage/logo-2.png" alt="Logo" className="logo-site-profile" />
        </Link>
        <h2>Pensa Club</h2>

        <div className="search-container">
          <SearchIcon className="search-icon" />
          <input type="text" placeholder="Търси ..." className="search-input" />
        </div>

        <div className="header-right">
          <button className="notification-button">
            <NotificationIcon primaryStroke="#333" secondaryStroke="#20b2aa" />
          </button>
          <div className="profile-menu" ref={profileMenuRef}>
            <button className="profile-button" onClick={toggleProfileMenu}>
              <img
                src={profileData?.details?.imageURL || getProfileImage(profileData?.details?.gender)}
                alt="User"
                className="profile-image"
              />
            </button>
            <span className="profile-name">
              {profileData?.details?.username || profileData?.email}
            </span>

            {/* Падащото меню */}
            {profileMenuOpen && (
              <div className="profile-dropdown-new">
                <div className="dropdown-header">
                  <img
                    src={profileData?.details?.imageURL || getProfileImage(profileData?.details?.gender)}
                    alt="User"
                    className="dropdown-profile-image"
                  />
                  <div className="dropdown-username">
                    {profileData?.details?.username || profileData?.email}
                  </div>
                </div>
                <div className="dropdown-links">
                  <NavLink to="/" className="dropdown-item" onClick={() => setProfileMenuOpen(false)}>
                    <span className="link-content">
                      <DashboardIcon className="menu-icon" />
                      {t("header.home")}
                    </span>
                  </NavLink>
                  <NavLink to="/craigslist?reset=true" className="dropdown-item" onClick={() => setProfileMenuOpen(false)}>
                    <span className="link-content">
                      <ForumIcon className="menu-icon" />
                      {t("header.craigslist")}
                    </span>
                  </NavLink>
                  <NavLink to="/ad/create" className="dropdown-item" onClick={() => setProfileMenuOpen(false)}>
                    <span className="link-content">
                      <JobsAdsIcon className="menu-icon" />
                      {t("header.ad-create")}
                    </span>
                  </NavLink>
                  <NavLink to="/logout" className="dropdown-item" onClick={() => setProfileMenuOpen(false)}>
                    <span className="link-content">
                      <LogoutIcon className="menu-icon" />
                      {t("header.logout")}
                    </span>
                  </NavLink>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="profile-container">
        {/* Странично меню, стилизирано като в админския панел */}
        <nav className={`side-menu ${menuOpen ? 'open' : ''} ${!isFinish ? 'disabled' : ''}`} ref={sideMenuRef}>
          <div className="menu-content">
            <div className="menu-header">
              <div className="current-section">{getCurrentSection()}</div>
              <div
                className="refresh-button"
                onClick={refreshAdminPanel}
                onKeyDown={handleKeyDown}
                role="button"
                tabIndex={0}
              >
                <RefreshIcon />
              </div>
            </div>

            <div className="menu-section main">
              <h3>{t("profile.main")}</h3>
              <ul>
                <li>
                  <NavLink
                    to="data"
                    className={({ isActive }) => isActive ? 'active' : ''}
                  >
                    <span className="link-content">
                      <UsersIcon className="icon" />
                      {t("profile.personal_data")}
                    </span>
                    <ArrowIcon className="icon-arrow" />
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="address"
                    className={({ isActive }) => isActive ? 'active' : ''}
                  >
                    <span className="link-content">
                      <DashboardIcon className="icon" />
                      {t("profile.address")}
                    </span>
                    <ArrowIcon className="icon-arrow" />
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="password"
                    className={({ isActive }) => isActive ? 'active' : ''}
                  >
                    <span className="link-content">
                      <BillingIcon className="icon" />
                      {t("profile.password")}
                    </span>
                    <ArrowIcon className="icon-arrow" />
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="announced"
                    className={({ isActive }) => isActive ? 'active' : ''}
                  >
                    <span className="link-content">
                      <ForumIcon className="icon" />
                      {t("profile.announced")}
                    </span>
                    <ArrowIcon className="icon-arrow" />
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="messages"
                    className={({ isActive }) => isActive ? 'active' : ''}
                  >
                    <span className="link-content">
                      <ChatIcon className="icon" />
                      {t("profile.messages")}
                    </span>
                    <ArrowIcon className="icon-arrow" />
                  </NavLink>
                </li>
              </ul>
            </div>

            {isAdmin && (
              <div className="menu-section admin">
                <h3>{t("profile.admin_dashboard")}</h3>
                <ul>
                  <li>
                    <NavLink
                      to="ads-admin"
                      onClick={() => toggleSubMenu('ads')}
                      className={({ isActive }) => isActive ? 'active' : ''}
                    >
                      <span className="link-content">
                        <JobsAdsIcon className="icon" />
                        {t("profile.ads-statistic")}
                      </span>
                      <span className={`arrow-icon ${subMenuStates.ads ? 'rotated' : ''}`}>
                        {subMenuStates.ads ?
                          <DownArrowIcon /> :
                          <ArrowIcon />
                        }
                      </span>
                    </NavLink>
                    <ul className={`sub-menu ${subMenuStates.ads ? 'expanded' : ''}`}>
                      <li>
                        <NavLink to="pending-announcements" className={({ isActive }) => isActive ? 'active' : ''}>
                          <CircleIcon className="icon" />
                          {t("profile.pending_announcements")} {adsCount > 0 && <> - {adsCount} {adsCount === 1 ? t("profile.ads-one") : t("profile.ads")}</>}
                        </NavLink>
                      </li>
                      <li>
                        <NavLink to="approved-announcements" className={({ isActive }) => isActive ? 'active' : ''}>
                          <CircleIcon className="icon" />
                          {t("profile.approved_announcements")} {approvedCount > 0 && <> - {approvedCount} {approvedCount === 1 ? t("profile.ads-one") : t("profile.ads")}</>}
                        </NavLink>
                      </li>
                      <li>
                        <NavLink to="reject-announcements" className={({ isActive }) => isActive ? 'active' : ''}>
                          <CircleIcon className="icon" />
                          {t("profile.reject_announcements")} {rejectCount > 0 && <> - {rejectCount} {rejectCount === 1 ? t("profile.ads-one") : t("profile.ads")}</>}
                        </NavLink>
                      </li>
                    </ul>
                  </li>

                  <li>
                    <NavLink
                      to="users-statistic"
                      onClick={() => toggleSubMenu('users')}
                      className={({ isActive }) => isActive ? 'active' : ''}
                    >
                      <span className="link-content">
                        <AnalyticsIcon className="icon" />
                        {t("admin.users")}
                      </span>
                      <span className={`arrow-icon ${subMenuStates.users ? 'rotated' : ''}`}>
                        {subMenuStates.users ?
                          <DownArrowIcon /> :
                          <ArrowIcon />
                        }
                      </span>
                    </NavLink>
                    <ul className={`sub-menu ${subMenuStates.users ? 'expanded' : ''}`}>
                      <li>
                        <NavLink to="users-admin" className={({ isActive }) => isActive ? 'active' : ''}>
                          <CircleIcon className="icon" />
                          {t("profile.all_users")} {allUsers >= 1 && <>- {allUsers}</>}
                        </NavLink>
                      </li>
                      <li>
                        <NavLink to="users-unfinished" className={({ isActive }) => isActive ? 'active' : ''}>
                          <CircleIcon className="icon" />
                          {t("admin.unfinished_users")} {unfinishedUsers >= 1 && <>- {unfinishedUsers}</>}
                        </NavLink>
                      </li>
                    </ul>
                  </li>

                  <li>
                    <NavLink
                      to="admin-suggest-users"
                      onClick={() => toggleSubMenu('suggest')}
                      className={({ isActive }) => isActive ? 'active' : ''}
                    >
                      <span className="link-content">
                        <UsersIcon className="icon" />
                        {t("admin.admin-suggest-users")} {allSuggestedUsers >= 1 && <>- {allSuggestedUsers}</>}
                      </span>
                      <span className={`arrow-icon ${subMenuStates.suggest ? 'rotated' : ''}`}>
                        {subMenuStates.suggest ?
                          <DownArrowIcon /> :
                          <ArrowIcon />
                        }
                      </span>
                    </NavLink>
                    <ul className={`sub-menu ${subMenuStates.suggest ? 'expanded' : ''}`}>
                      <li>
                        <NavLink to="suggest-resolved-users" className={({ isActive }) => isActive ? 'active' : ''}>
                          <CircleIcon className="icon" />
                          {t("admin.suggest_resolved_users")} {resolvedUsers >= 1 && <>- {resolvedUsers}</>}
                        </NavLink>
                      </li>
                    </ul>
                  </li>

                  <li>
                    <NavLink
                      to="subscription-admin"
                      className={({ isActive }) => isActive ? 'active' : ''}
                    >
                      <span className="link-content">
                        <EducationIcon className="icon" />
                        {t("admin.ads_subscription")} {allSubscriptionEmails >= 1 && <>- {allSubscriptionEmails}</>}
                      </span>
                      <ArrowIcon className="icon-arrow" />
                    </NavLink>
                  </li>

                  <li>
                    <NavLink
                      to="article-create"
                      className={({ isActive }) => isActive ? 'active' : ''}
                    >
                      <span className="link-content">
                        <ForumIcon className="icon" />
                        Създаване на статии
                      </span>
                      <ArrowIcon className="icon-arrow" />
                    </NavLink>
                  </li>
                </ul>
              </div>
            )}

            <div className="side-menu-profile">
              <div className="admin-profile-side-menu">
                <img
                  src={profileData?.details?.imageURL || getProfileImage(profileData?.details?.gender)}
                  alt="Профилна снимка"
                  className="side-menu-profile-image"
                />
                <div className="side-menu-profile-info">
                  <span className="side-menu-profile-name">{profileData?.details?.username || profileData?.email}</span>
                  {/* <NavLink to="/profile/data" className="side-menu-profile-link">
                    {t("profile.view_profile")}
                    <RightArrowIcon />
                  </NavLink> */}
                </div>
              </div>
            </div>

            <div className="back-to-site">
              <h2 className="back-to-site-title">
                <NavLink to="/">
                  <LeftArrowIcon /> Към сайта
                </NavLink>
              </h2>
            </div>
          </div>
        </nav>

        <main className="profile-content">
          {!isFinish && (
            <div className="unfinished-profiles">
              <p className="warning-info">Вашият профил е непълен!</p>
              <p>
                Ако желаете да се възползвате от всички възможности на
                платформата, продължете като Pensa потребител или продължете като
                обикновен потребител.
              </p>
              <div className="profile-data-btns">
                <NavLink
                  to="/profile/profile-form"
                  onClick={(e) => {
                    window.scrollTo({ top: e.pageY + 100 });
                  }}
                >
                  <button type="button" className="btn-general btn-orange">
                    Pensa потребител
                  </button>
                </NavLink>
                <NavLink to="/">
                  <button type="button" className="btn-general btn-green">
                    Обикновен потребител
                  </button>
                </NavLink>
              </div>
            </div>
          )}

          <Outlet />
          <Routes>
            {!isFinish && <Route path="profile-form" element={<ProfileForm />} />}
            <Route path="data" element={<ProfileData />} />
            <Route path="address" element={<ProfileAddress />} />
            <Route path="password" element={<ProfilePassword />} />
            <Route path="skills" element={<ProfileSkills />} />
            <Route path="workOptions" element={<ProfileWorks />} />
            <Route path="announced" element={<ProfileAnnounced />} profileData={profileData} />
            <Route path="interestOptions" element={<ProfileInterests />} />
            <Route path="messages" element={<ProfileMessages />} />
            <Route path="ads-admin" element={<AdminGuard><AllAnnouncements /></AdminGuard>} />
            <Route path="users-statistic" element={<AdminGuard><AllUsersStatistics /></AdminGuard>} />
            <Route path="article-create" element={<AdminGuard><ArticleCreateForm /></AdminGuard>} />
            <Route path="users-admin" element={<AdminGuard><AllUsers setAllUsers={setAllUsers} /></AdminGuard>} />
            <Route path="users-unfinished" element={<AdminGuard><UnfinishedProfiles setUnfinishedUsers={setUnfinishedUsers} /></AdminGuard>} />
            <Route path="pending-announcements" element={<AdminGuard><PendingAnnouncements setAdsCount={setAdsCount} /></AdminGuard>} />
            <Route path="approved-announcements" element={<AdminGuard><ApprovedAnnouncements setApprovedCount={setApprovedCount} /></AdminGuard>} />
            <Route path="reject-announcements" element={<AdminGuard><RejectAnnouncements setRejectCount={setRejectCount} /></AdminGuard>} />
            <Route path="admin-suggest-users" element={<AdminGuard><AdminSuggestUsers setAllSuggestedUsers={setAllSuggestedUsers} /></AdminGuard>} />
            <Route path="subscription-admin" element={<AdminGuard><AdminSubscription setAllSubscriptionEmails={setAllSubscriptionEmails} /></AdminGuard>} />
            <Route path="suggest-resolved-users" element={<AdminGuard><SuggestResolvedUsers setResolvedUsers={setResolvedUsers} /></AdminGuard>} />
          </Routes>
        </main>
      </div>
    </div>
  );
};