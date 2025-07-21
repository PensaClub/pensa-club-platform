import { useContext, useEffect, useRef, useState } from "react";
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
  MenuIcon,
  SearchIconProfile
} from "../Articles/articleUtils/AdminIcons";

import { ProfileSkills } from "./ProfileSkills";
import { ProfileWorks } from "./ProfileWorks";
import { ProfileInterests } from "./ProfileInterests";
import { ProfileAnnounced } from "./ProfileAnnounced";
import { AdminGuard } from "../Guards/AdminGuard";
import { ManagementGuard } from "../Guards/ManagementGuard";
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
import { AllArticles } from "../Articles/AllArticles/AllArticles";
import EditArticle from "../Articles/AllArticles/EditArticle/EditArticle";
import { changeLanguage } from "i18next";
import InitiativeCreateForm from "../Initiatives/CreateIniciative/InitiativeCreateForm/InitiativeCreateForm";
import DraftInitiatives from "../Initiatives/DraftInitiatives/DraftInitiatives";
import { AllInitiatives } from "../Initiatives/AllInitiatives/AllInitiatives";
import { BookmarkedItems } from "./BookmarkedItems/BookmarkedItems";
import { ApplicationsAdmin } from "../Initiatives/ApplicationsAdmin/ApplicationsAdmin";
import ProjectCreateForm from "../Initiatives/CreateProject/ProjectCreateForm";
import { AllProjects } from "../Initiatives/CreateProject/AllProjects/AllProjects";
import ProjectPreview from "../Initiatives/CreateProject/ProjectPreview/ProjectPreview";
import DraftProjects from "../Initiatives/CreateProject/DraftProjects/DraftProjects";
import { LanguageSwitcherAdmin } from "../LanguageSwitcher/LanguageSwitcherAdmin";
// import { InitiativePreviewPage } from "../Initiatives/CreateIniciative/InitiativePreviewPage/InitiativePreviewPage";

export const Profile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;
  const [menuOpen, setMenuOpen] = useState(false);
  const { isFinish, profileData, isAdmin, isModerator, addressId } = useContext(UserContext);
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
  const [profileCommunityOpen, setProfileCommunityOpen] = useState(false);
  // Модернизирано управление на състоянията на подменютата
  const [subMenuStates, setSubMenuStates] = useState({
    ads: false,
    users: false,
    suggest: false,
    articles: false,
    initiatives: false,
    projects: false,
    community: false,
    messages: false,
    applications: false
  });
  const [applicationsStats, setApplicationsStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
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
      "/profile/skills": t("profile.skills"),
      "/profile/workOptions": t("profile.workOptions"),
      "/profile/interestOptions": t("profile.interestOptions"),
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
      "/profile/articles": t("profile.articles"),
      "/profile/article-create": t("profile.newArticle"),
      "/profile/initiative-create": t("profile.newInitiative"),
      "/profile/initiative": t("profile.initiatives"),
      "/profile/bookmarks": t("profile.bookmarks"),
      "/profile/applications-admin": t("profile.applications"),
      "/profile/initiative-preview": t("profile.initiativePreview"),
      "/profile/projects": t("profile.projects"),
      "/profile/project-create": t("profile.projectCreate"),
      "/profile/project-preview": t("profile.projectPreview")

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
    "/profile/subscription-admin",
    "/profile/initiative",
    "/profile/initiative-create",
    "/profile/article-create",
    "/profile/articles",
    "/profile/applications-admin",
    "/profile/initiative-preview",
    "/profile/projects",
    "/profile/project-create",
    "/profile/project-preview",

    "/profile/applications-admin"
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
  const toggleProfileCommunity = () => {
    setProfileCommunityOpen(!profileCommunityOpen);
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
      suggest: false,
      initiatives: false
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
        <div className="header-left">
          <Link to="/" className="logo-link">
            <img src="/images/homePage/logo-2.png" alt="Logo" className="logo-site-profile" />
          </Link>
          <h2>Pensa Club</h2>
        </div>
        <div className="search-container">
          <SearchIconProfile className="-profile" />
          <input type="text" placeholder={t('profile.search_placeholder')} className="search-input" />
        </div>

        <div className="header-right">
          {/* Заменена камбанка с бутон за смяна на езика */}
          <LanguageSwitcherAdmin />

          <div className="profile-menu" ref={profileMenuRef}>
            <button className="profile-button" onClick={toggleProfileMenu}>
              <img
                src={profileData?.details?.imageURL || "/images/homePage/user-it.png"}
                alt="User"
                className="profile-image"
                onError={(e) => {
                  e.target.src = "/images/homePage/user-it.png";
                }}
              />
            </button>
            <span className="profile-name">
              {profileData?.details?.username || profileData?.email?.split('@')[0] || profileData?.email}
            </span>

            {/* Падащото меню с добавени линкове */}
            {profileMenuOpen && (
              <div className="profile-dropdown-new">
                <div className="dropdown-header">
                  <img
                    src={profileData?.details?.imageURL || "/images/homePage/user-it.png"}
                    alt="User"
                    className="dropdown-profile-image"
                    onError={(e) => {
                  e.target.src = "/images/homePage/user-it.png";
                }}
                  />
                  <div className="dropdown-username">
                    {profileData?.details?.username || profileData?.email}
                  </div>
                </div>
                <div className="dropdown-links">
                  <NavLink to="/" className="dropdown-item-new-profile" onClick={() => setProfileMenuOpen(false)}>
                    <span className="link-content">
                      <DashboardIcon className="menu-icon" />
                      {t("header.home")}
                    </span>
                  </NavLink>

                  <NavLink to="/articles" className="dropdown-item-new-profile" onClick={() => setProfileMenuOpen(false)}>
                    <span className="link-content">
                      <ForumIcon className="menu-icon" />
                      {t("header.articles")}
                    </span>
                  </NavLink>

                  {/* Общност dropdown */}
                  <div className="profile-dropdown-container">
                    <button
                      className={`dropdown-item-new-profile profile-dropdown-toggle ${profileCommunityOpen ? 'active' : ''}`}
                      onClick={toggleProfileCommunity}
                    >
                      <span className="link-content">
                        <UsersIcon className="menu-icon" />
                        {t("header.craigslist")}
                        <svg
                          className={`profile-dropdown-arrow ${profileCommunityOpen ? 'rotated' : ''}`}
                          width="12"
                          height="6"
                          viewBox="0 0 12 6"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M1 1L6 5L11 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    </button>

                    <div className={`profile-dropdown-content ${profileCommunityOpen ? 'active' : ''}`}>
                      <NavLink
                        to="/craigslist?reset=true"
                        className="profile-dropdown-item-new-profile"
                        onClick={() => {
                          setProfileMenuOpen(false);
                          setProfileCommunityOpen(false);
                        }}
                      >
                        <ForumIcon className="menu-icon" />
                        {t("header.craigslist")}
                      </NavLink>

                      <NavLink
                        to="/initiatives"
                        className="profile-dropdown-item-new-profile"
                        onClick={() => {
                          setProfileMenuOpen(false);
                          setProfileCommunityOpen(false);
                        }}
                      >
                        <DashboardIcon className="menu-icon" />
                        {t("header.initiatives")}
                      </NavLink>
                      <NavLink
                        to="/projects"
                        className="profile-dropdown-item-new-profile"
                        onClick={() => {
                          setProfileMenuOpen(false);
                          setProfileCommunityOpen(false);
                        }}
                      >
                        <svg className="menu-icon" width="24px" height="24px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="rgb(198, 198, 198)">
                          <path d="M7.25 6a.75.75 0 00-.75.75v7.5a.75.75 0 001.5 0v-7.5A.75.75 0 007.25 6zM12 6a.75.75 0 00-.75.75v4.5a.75.75 0 001.5 0v-4.5A.75.75 0 0012 6zm4 .75a.75.75 0 011.5 0v9.5a.75.75 0 01-1.5 0v-9.5z" />
                          <path
                            fillRule="evenodd"
                            d="M3.75 2A1.75 1.75 0 002 3.75v16.5c0 .966.784 1.75 1.75 1.75h16.5A1.75 1.75 0 0022 20.25V3.75A1.75 1.75 0 0020.25 2H3.75zM3.5 3.75a.25.25 0 01.25-.25h16.5a.25.25 0 01.25.25v16.5a.25.25 0 01-.25.25H3.75a.25.25 0 01-.25-.25V3.75z"
                          />
                        </svg>

                        {t("header.projects")}
                      </NavLink>
                      <NavLink
                        to="/map"
                        className="profile-dropdown-item-new-profile"
                        onClick={() => {
                          setProfileMenuOpen(false);
                          setProfileCommunityOpen(false);
                        }}
                      >
                        <UsersIcon className="menu-icon" />
                        {t("header.map")}
                      </NavLink>
                    </div>
                  </div>

                  <NavLink to="/ad/create" className="dropdown-item-new-profile" onClick={() => setProfileMenuOpen(false)}>
                    <span className="link-content">
                      <JobsAdsIcon className="menu-icon" />
                      {t("header.ad-create")}
                    </span>
                  </NavLink>
<LanguageSwitcherAdmin isMobile={true}  onClick={() => {
                          setProfileMenuOpen(false);
                          setProfileCommunityOpen(false);
                        }}/>
                  <NavLink to="/logout" className="dropdown-item-new-profile" onClick={() => setProfileMenuOpen(false)}>
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
                <li>
                  <NavLink
                    to="bookmarks"
                    className={({ isActive }) => isActive ? 'active' : ''}
                  >
                    <span className="link-content">
                      <ChatIcon className="icon" />
                      {t("profile.bookmarks")}
                    </span>
                  </NavLink>
                </li>
              </ul>
            </div>

            {(isAdmin || isModerator) && (
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

                  {isAdmin && (
                    <>
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
                          to="applications-admin"
                          className={({ isActive }) => isActive ? 'active' : ''}
                        >
                          <span className="link-content">
                            <UsersIcon className="icon" />
                            {t("profile.applications")} {applicationsStats.total > 0 && <>- {applicationsStats.total}</>}
                          </span>
                          {/* <ArrowIcon className="icon-arrow" /> */}
                        </NavLink>
                      </li>
                    </>
                  )}

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
                      to="articles"
                      onClick={() => toggleSubMenu('articles')}
                      className={({ isActive }) => isActive ? 'active' : ''}
                    >
                      <span className="link-content">
                        <ForumIcon className="icon" />
                        {t('profile.articles')}
                      </span>
                      <span className={`arrow-icon ${subMenuStates.articles ? 'rotated' : ''}`}>
                        {subMenuStates.articles ?
                          <DownArrowIcon /> :
                          <ArrowIcon />
                        }
                      </span>
                    </NavLink>
                    <ul className={`sub-menu ${subMenuStates.articles ? 'expanded' : ''}`}>
                      <li>
                        <NavLink to="article-create" className={({ isActive }) => isActive ? 'active' : ''}>
                          <CircleIcon className="icon" />
                          {t('profile.new_article')}
                        </NavLink>
                      </li>
                      {/* Тук може да добавяте и други подсекции свързани с публикации */}
                    </ul>
                  </li>
                  <li>
                    <NavLink
                      to="initiatives"
                      onClick={() => toggleSubMenu('initiatives')}
                      className={({ isActive }) => isActive ? 'active' : ''}
                    >
                      <span className="link-content">
                        <DashboardIcon className="icon" />
                        {t("profile.initiatives")}
                      </span>
                      <span className={`arrow-icon ${subMenuStates.initiatives ? 'rotated' : ''}`}>
                        {subMenuStates.initiatives ? <DownArrowIcon /> : <ArrowIcon />}
                      </span>
                    </NavLink>
                    <ul className={`sub-menu ${subMenuStates.initiatives ? 'expanded' : ''}`}>
                      <li>
                        <NavLink to="initiative-create" className={({ isActive }) => isActive ? 'active' : ''}>
                          <CircleIcon className="icon" />
                          {t("profile.newInitiative")}
                        </NavLink>
                      </li>
                      <li>
                        <NavLink to="initiative-drafts" className={({ isActive }) => isActive ? 'active' : ''}>
                          <CircleIcon className="icon" />
                          {t("profile.drafts")}
                        </NavLink>
                      </li>
                      {/* <li>
                        <NavLink to="/initiative-preview" className={({ isActive }) => isActive ? 'active' : ''}>
                          <CircleIcon className="icon" />
                          Preview инициатива
                        </NavLink>
                      </li> */} {/* Na nejno mqsto може да добавяте и други подсекции свързани с инициативи */}
                    </ul>
                  </li>
                  <li>
                    <NavLink
                      to="projects"
                      onClick={() => toggleSubMenu('projects')}
                      className={({ isActive }) => isActive ? 'active' : ''}
                    >
                      <span className="link-content">
                        <DashboardIcon className="icon" />
                        {t("profile.projects")}
                      </span>
                      <span className={`arrow-icon ${subMenuStates.projects ? 'rotated' : ''}`}>
                        {subMenuStates.projects ? <DownArrowIcon /> : <ArrowIcon />}
                      </span>
                    </NavLink>
                    <ul className={`sub-menu ${subMenuStates.projects ? 'expanded' : ''}`}>
                      <li>
                        <NavLink to="projects-create" className={({ isActive }) => isActive ? 'active' : ''}>
                          <CircleIcon className="icon" />
                          {t("profile.newProject")}
                        </NavLink>
                      </li>
                      <li>
                        <NavLink to="projects-drafts" className={({ isActive }) => isActive ? 'active' : ''}>
                          <CircleIcon className="icon" />
                          {t("profile.drafts")}
                        </NavLink>
                      </li>
                      {/* <li>
                        <NavLink to="/initiative-preview" className={({ isActive }) => isActive ? 'active' : ''}>
                          <CircleIcon className="icon" />
                          Preview инициатива
                        </NavLink>
                      </li> */} {/* Na nejno mqsto може да добавяте и други подсекции свързани с инициативи */}
                    </ul>
                  </li>
                </ul>
              </div>
            )}

            <div className="side-menu-profile">
              <div className="admin-profile-side-menu">
                <img
                  src={profileData?.details?.imageURL || "./images/homePage/user-it.png"}
                  alt={t('profile.profile_image')}
                  className="side-menu-profile-image"
                  onError={(e) => {
                  e.target.src = "/images/homePage/user-it.png";
                }}
                />
                <div className="side-menu-profile-info">
                  <span className="side-menu-profile-name">
                    {profileData?.details?.username ||
                      (profileData?.email ? profileData.email.split('@')[0] : '')}
                  </span>
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
                  <LeftArrowIcon /> {t('profile.to_website_btn')}
                </NavLink>
              </h2>
            </div>
          </div>
        </nav>

        <main className="profile-content">
          {!isFinish && (
            <div className="unfinished-profiles">
              <p className="warning-info">{t('profile.warning')}</p>
              <p>{t('profile.warning_desc')}</p>
              <div className="profile-data-btns">
                <NavLink
                  to="/profile/profile-form"
                  onClick={(e) => {
                    window.scrollTo({ top: e.pageY + 100 });
                  }}
                >
                  <button type="button" className="btn-general btn-orange">
                    {t('profile.pensa_user_btn')}
                  </button>
                </NavLink>
                <NavLink to="/">
                  <button type="button" className="btn-general btn-green">
                    {t('profile.standard_user_btn')}
                  </button>
                </NavLink>
              </div>
            </div>
          )}

          <Outlet />
          <Routes>
            {/* Regular user routes */}
            {!isFinish && <Route path="profile-form" element={<ProfileForm />} />}
            <Route path="data" element={<ProfileData />} />
            <Route path="address" element={<ProfileAddress />} />
            <Route path="password" element={<ProfilePassword />} />
            <Route path="skills" element={<ProfileSkills />} />
            <Route path="workOptions" element={<ProfileWorks />} />
            <Route path="announced" element={<ProfileAnnounced />} profileData={profileData} />
            <Route path="interestOptions" element={<ProfileInterests />} />
            <Route path="messages" element={<ProfileMessages />} />
            <Route path="bookmarks" element={<BookmarkedItems />} />

            {/* Management routes (Admin & Moderator) */}
            <Route path="ads-admin" element={<ManagementGuard><AllAnnouncements /></ManagementGuard>} />
            <Route path="article-create" element={<ManagementGuard><ArticleCreateForm /></ManagementGuard>} />
            <Route path="articles" element={<ManagementGuard><AllArticles /></ManagementGuard>} />
            <Route path="projects" element={<ManagementGuard><AllProjects /></ManagementGuard>} />
            <Route path="projects-drafts" element={<ManagementGuard><DraftProjects /></ManagementGuard>} />
            <Route path="initiatives" element={<ManagementGuard><AllInitiatives /></ManagementGuard>} />
            <Route path="initiative-create" element={<ManagementGuard><InitiativeCreateForm /></ManagementGuard>} />
            <Route path="projects-create" element={<ManagementGuard><ProjectCreateForm /></ManagementGuard>} />
            <Route path="project-preview" element={<ManagementGuard><ProjectPreview /></ManagementGuard>} />

            <Route path="initiative-drafts" element={<ManagementGuard><DraftInitiatives /></ManagementGuard>} />
            {/* <Route path="/profile/initiative-edit/:id" element={<ManagementGuard><AllInitiatives isEditMode={true}/></ManagementGuard>} /> */}

            {/* <Route path="initiative-preview" element={<ManagementGuard><InitiativePreviewPage /></ManagementGuard>}  /> */}
            <Route path="article-edit/:id" element={<ManagementGuard><EditArticle /></ManagementGuard>} />
            <Route path="pending-announcements" element={<ManagementGuard><PendingAnnouncements setAdsCount={setAdsCount} /></ManagementGuard>} />
            <Route path="approved-announcements" element={<ManagementGuard><ApprovedAnnouncements setApprovedCount={setApprovedCount} /></ManagementGuard>} />
            <Route path="reject-announcements" element={<ManagementGuard><RejectAnnouncements setRejectCount={setRejectCount} /></ManagementGuard>} />
            <Route path="admin-suggest-users" element={<ManagementGuard><AdminSuggestUsers setAllSuggestedUsers={setAllSuggestedUsers} /></ManagementGuard>} />
            <Route path="subscription-admin" element={<ManagementGuard><AdminSubscription setAllSubscriptionEmails={setAllSubscriptionEmails} /></ManagementGuard>} />
            <Route path="suggest-resolved-users" element={<ManagementGuard><SuggestResolvedUsers setResolvedUsers={setResolvedUsers} /></ManagementGuard>} />

            {/* Admin-only routes */}
            <Route path="users-statistic" element={<AdminGuard><AllUsersStatistics /></AdminGuard>} />
            <Route path="applications-admin" element={<ManagementGuard><ApplicationsAdmin setApplicationsStats={setApplicationsStats} /></ManagementGuard>} />
            <Route path="users-admin" element={<AdminGuard><AllUsers setAllUsers={setAllUsers} /></AdminGuard>} />
            <Route path="users-unfinished" element={<AdminGuard><UnfinishedProfiles setUnfinishedUsers={setUnfinishedUsers} /></AdminGuard>} />
          </Routes>
        </main>
      </div>
    </div>
  );
};
