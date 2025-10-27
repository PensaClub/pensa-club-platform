/* eslint-disable no-unused-vars */
import { useContext, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, NavLink, Routes, Route, Outlet } from "react-router-dom";
import { ProfileData } from "./ProfileData";
import ProfileForm from "./ProfileForm";
import ProfileAddress from "./ProfileAddress";
import { ProfilePassword } from "./ProfilePassword";
import { useTranslation } from "react-i18next";
import "./profile-new.css";
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
import { ProfessionalAvatarBuilder } from "../AvatarDemo/ProfessionalAvatarBuilder";
import ArticlePreviewPage from "../Articles/ArticleCreateForm/ArticlePreviewPage";
import { AllPublications } from "../Initiatives/CreatePublication/AllPublications/AllPublications";
import { AllStories } from "../Initiatives/CreateStory/AllStories/AllStories";
import PublicationForm from '../Initiatives/CreatePublication/MainForm/MainFormPublication';
import ClubCreateForm from "../Clubs/ClubCreateForm/ClubCreateForm";
import MyClubs from "../Clubs/MyClubs/MyClubs";
import DraftClubs from "../Clubs/DraftClubs/DraftClubs";
import MembershipClubs from "../Clubs/MembershipClubs/MembershipClubs";
import ClubsAdmin from "../Clubs/ClubsAdmin/ClubsAdmin";

// 🎨 НОВИ ИКОНКИ КОМПОНЕНТИ
const HomeIcon = () => (
  <svg className="menu-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5523 5.44772 21 6 21H9M19 10L21 12M19 10V20C19 20.5523 18.5523 21 18 21H15M9 21C9.55228 21 10 20.5523 10 20V16C10 15.4477 10.4477 15 11 15H13C13.5523 15 14 15.4477 14 16V20C14 20.5523 14.4477 21 15 21M9 21H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const InitiativesIcon = () => (
  <svg className="menu-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 21H15M12 3V4M18.3636 5.63636L17.6565 6.34347M21 12H20M4 12H3M6.34347 6.34347L5.63636 5.63636M12 17C9.79086 17 8 15.2091 8 13C8 11.3644 8.9298 9.95264 10.2764 9.2764C10.7461 9.02499 11.2461 8.84269 11.7686 8.73754C11.9174 8.70857 12 8.5772 12 8.42632V8C12 7.44772 12.4477 7 13 7C13.5523 7 14 7.44772 14 8V8.42632C14 8.5772 14.0826 8.70857 14.2314 8.73754C15.4154 8.98941 16.4362 9.71459 17.0786 10.7158C17.3694 11.1749 17.5819 11.6874 17.6998 12.2323C17.7311 12.3693 17.8789 12.4303 17.9951 12.3493C18.5542 11.9732 19.2734 12.0686 19.7266 12.5819C20.264 13.1926 20.2155 14.1414 19.6156 14.6909C19.1296 15.1382 18.4048 15.1609 17.892 14.7565C17.7782 14.6686 17.6142 14.6964 17.5332 14.8261C17.2094 15.3624 16.7768 15.8233 16.2639 16.176C15.5635 16.6637 14.7486 16.9545 13.8952 16.9923C13.792 16.9968 13.7024 17.0673 13.6711 17.166C13.5671 17.4946 13.3048 17.7524 12.9749 17.8554C12.3432 18.0486 11.6568 18.0486 11.0251 17.8554C10.6952 17.7524 10.4329 17.4946 10.3289 17.166C10.2976 17.0673 10.208 16.9968 10.1048 16.9923C8.91304 16.9488 7.83094 16.3914 7.10558 15.5003C7.03802 15.4186 6.91813 15.4015 6.82973 15.462C6.31421 15.8248 5.62028 15.7626 5.17381 15.3161C4.61784 14.7602 4.61784 13.8506 5.17381 13.2947C5.64106 12.8274 6.36334 12.7551 6.91352 13.0781C7.01893 13.1384 7.15409 13.0987 7.21484 12.9937C7.47484 12.5375 7.8273 12.1424 8.25 11.8333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ProjectsIcon = () => (
  <svg className="menu-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 7C3 5.89543 3.89543 5 5 5H9.58579C9.851 5 10.1054 5.10536 10.2929 5.29289L12 7H19C20.1046 7 21 7.89543 21 9V18C21 19.1046 20.1046 20 19 20H5C3.89543 20 3 19.1046 3 18V7Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PublicationsIcon = () => (
  <svg className="menu-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 19.5C4 18.1193 5.11929 17 6.5 17H20M4 19.5C4 20.8807 5.11929 22 6.5 22H20V2H6.5C5.11929 2 4 3.11929 4 4.5V19.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 7H16M8 11H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const StoriesIcon = () => (
  <svg className="menu-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 9H17M7 13H13M21 20L17.6757 18.3378C17.4237 18.2118 17.2977 18.1488 17.1656 18.1044C17.0484 18.065 16.9277 18.0365 16.8052 18.0193C16.6672 18 16.5263 18 16.2446 18H6.2C5.07989 18 4.51984 18 4.09202 17.782C3.71569 17.5903 3.40973 17.2843 3.21799 16.908C3 16.4802 3 15.9201 3 14.8V7.2C3 6.07989 3 5.51984 3.21799 5.09202C3.40973 4.71569 3.71569 4.40973 4.09202 4.21799C4.51984 4 5.07989 4 6.2 4H17.8C18.9201 4 19.4802 4 19.908 4.21799C20.2843 4.40973 20.5903 4.71569 20.782 5.09202C21 5.51984 21 6.07989 21 7.2V20Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const BookmarkIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 21L12 16L5 21V5C5 3.89543 5.89543 3 7 3H17C18.1046 3 19 3.89543 19 5V21Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const MapIcon = () => (
  <svg className="menu-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="currentColor" />
  </svg>
);

const GamesIcon = () => (
  <svg className="menu-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 11H10M8 9V13M15.5 12H15.51M18.5 12H18.51M7 16.4L4.56569 18.8343C3.78526 19.6147 3.39505 20.0049 3.00394 19.9952C2.66557 19.9867 2.35037 19.8241 2.14346 19.5528C2 19.3555 2 18.8062 2 17.7077V11C2 8.17157 2 6.75736 2.87868 5.87868C3.75736 5 5.17157 5 8 5H16C18.8284 5 20.2426 5 21.1213 5.87868C22 6.75736 22 8.17157 22 11V12C22 14.8284 22 16.2426 21.1213 17.1213C20.2426 18 18.8284 18 16 18H11.4C10.5074 18 10.0611 18 9.64386 18.1118C9.27242 18.2099 8.9195 18.3644 8.5979 18.5692C8.23183 18.8005 7.91464 19.1177 7.28026 19.7521L6 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const AboutIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
    <path d="M12 17V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="12" cy="8" r="1" fill="currentColor" />
  </svg>
);
const ClubsIcon = () => (
  <svg className="menu-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 20C17 18.3431 14.7614 17 12 17C9.23858 17 7 18.3431 7 20M21 17C21 15.7635 19.7085 14.7012 18 14.25M3 17C3 15.7635 4.29153 14.7012 6 14.25M18 10.5C19.1046 10.5 20 9.60457 20 8.5C20 7.39543 19.1046 6.5 18 6.5M6 10.5C4.89543 10.5 4 9.60457 4 8.5C4 7.39543 4.89543 6.5 6 6.5M12 14C10.3431 14 9 12.6569 9 11C9 9.34315 10.3431 8 12 8C13.6569 8 15 9.34315 15 11C15 12.6569 13.6569 14 12 14Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const AvatarIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
    <path d="M5 20C5 16.6863 7.68629 14 11 14H13C16.3137 14 19 16.6863 19 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

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

  const [subMenuStates, setSubMenuStates] = useState({
    ads: false,
    users: false,
    suggest: false,
    articles: false,
    initiatives: false,
    projects: false,
    community: false,
    messages: false,
    applications: false,
    clubs: false
  });

  const [applicationsStats, setApplicationsStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

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
      "/profile/project-preview": t("profile.projectPreview"),
      "/profile/publications": t("profile.publications"),
      "/profile/stories": t("profile.stories"),
      "/profile/publication-create": t("profile.publicationCreate"),
      "/profile/clubs": t("myClubs.clubs"),
      "/profile/club-create": t("profile.clubCreate"),
      "/profile/club-drafts": t("profile.clubDrafts"),
      "/profile/clubs-admin": t("profile.clubsAdmin"),
      "/profile/club-membership": t("profile.clubMembership"),
      "/profile/mentors-overview": t("admin.mentors.overview"),
      "/profile/mentors-applications": t("admin.mentors.applications"),
      "/profile/mentors-statistics": t("admin.mentors.statistics")
    };

    const matchedPath = Object.keys(pathTitleMap).find(key => path.includes(key));
    return matchedPath ? pathTitleMap[matchedPath] : "Профил";
  };

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
    "/profile/article-preview",
    "/profile/publications",
    "/profile/stories",
    "/profile/publication-create",
    "/profile/applications-admin",
    "/profile/clubs",
    "/profile/club-create",
    "/profile/club-drafts",
    "/profile/clubs-admin",
    "/profile/club-membership",
    "/profile/mentors-overview",
    "/profile/mentors-applications",
    "/profile/mentors-statistics"
  ];

  const isAdminPanel = adminPaths.some(path => location.pathname.startsWith(path));

  useEffect(() => {
    window.scrollTo({ top: 0 });
    // if (!profileData) {
    //   navigate("/profile/profile-form");
    // }
    // if (!isFinish) {
    //   navigate("/profile/profile-form");
    // }
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

  const toggleProfileMenu = () => {
    setProfileMenuOpen(!profileMenuOpen);
  };

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

            {/* 🎨 ОПРАВЕНО ПАДАЩО МЕНЮ */}
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
                  {/* ✅ НАЧАЛО */}
                  <NavLink to="/" className="dropdown-item-new-profile" onClick={() => setProfileMenuOpen(false)}>
                    <span className="link-content">
                      <HomeIcon />
                      {t("header.home")}
                    </span>
                  </NavLink>

                  {/* ✅ СТАТИИ */}
                  <NavLink to="/articles" className="dropdown-item-new-profile" onClick={() => setProfileMenuOpen(false)}>
                    <span className="link-content">
                      <ForumIcon className="menu-icon" />
                      {t("header.articles")}
                    </span>
                  </NavLink>

                  {/* ✅ ОБЩНОСТ DROPDOWN */}
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
                      {/* Craigslist */}
                      <NavLink
                        to="/craigslist?reset=true"
                        className="profile-dropdown-item-new-profile"
                        onClick={() => {
                          setProfileMenuOpen(false);
                          setProfileCommunityOpen(false);
                        }}
                      >
                        <UsersIcon className="menu-icon" />
                        {t("header.craigslist")}
                      </NavLink>

                      {/* ✅ Инициативи */}
                      <NavLink
                        to="/initiatives"
                        className="profile-dropdown-item-new-profile"
                        onClick={() => {
                          setProfileMenuOpen(false);
                          setProfileCommunityOpen(false);
                        }}
                      >
                        <InitiativesIcon className="menu-icon" />
                        {t("header.initiatives")}
                      </NavLink>

                      {/* ✅ Проекти */}
                      <NavLink
                        to="/projects"
                        className="profile-dropdown-item-new-profile"
                        onClick={() => {
                          setProfileMenuOpen(false);
                          setProfileCommunityOpen(false);
                        }}
                      >
                        <ProjectsIcon className="menu-icon" />
                        {t("header.projects")}
                      </NavLink>

                      {/* ✅ ПУБЛИКАЦИИ */}
                      <NavLink
                        to="/publications"
                        className="profile-dropdown-item-new-profile"
                        onClick={() => {
                          setProfileMenuOpen(false);
                          setProfileCommunityOpen(false);
                        }}
                      >
                        <PublicationsIcon className="menu-icon" />
                        {t("header.publications")}
                      </NavLink>

                      {/* ✅ ИСТОРИИ */}
                      <NavLink
                        to="/stories"
                        className="profile-dropdown-item-new-profile"
                        onClick={() => {
                          setProfileMenuOpen(false);
                          setProfileCommunityOpen(false);
                        }}
                      >
                        <StoriesIcon className="menu-icon" />
                        {t("header.stories")}
                      </NavLink>

                      {/* ✅ Карта */}
                      <NavLink
                        to="/map"
                        className="profile-dropdown-item-new-profile"
                        onClick={() => {
                          setProfileMenuOpen(false);
                          setProfileCommunityOpen(false);
                        }}
                      >
                        <MapIcon className="menu-icon" />
                        {t("header.map")}
                      </NavLink>
                    </div>
                  </div>

                  {/* ✅ КЛУБОВЕ */}
                  <NavLink to="/clubs" className="dropdown-item-new-profile" onClick={() => setProfileMenuOpen(false)}>
                    <span className="link-content">
                      <ClubsIcon className="menu-icon" />
                      {t("header.clubs")}
                    </span>
                  </NavLink>

                  {/* ✅ ИГРИ */}
                  <NavLink to="/games" className="dropdown-item-new-profile" onClick={() => setProfileMenuOpen(false)}>
                    <span className="link-content">
                      <GamesIcon className="menu-icon" />
                      {t("header.games")}
                    </span>
                  </NavLink>

                  {/* ✅ СЪЗДАЙ ОБЯВА */}
                  <NavLink to="/ad/create" className="dropdown-item-new-profile" onClick={() => setProfileMenuOpen(false)}>
                    <span className="link-content">
                      <JobsAdsIcon className="menu-icon" />
                      {t("header.ad-create")}
                    </span>
                  </NavLink>

                  {/* ✅ ЗА НАС */}
                  <NavLink to="/about" className="dropdown-item-new-profile" onClick={() => setProfileMenuOpen(false)}>
                    <span className="link-content">
                      <AboutIcon className="menu-icon" />
                      {t("header.about")}
                    </span>
                  </NavLink>

                  {/* Език суич */}
                  <LanguageSwitcherAdmin isMobile={true} onClick={() => {
                    setProfileMenuOpen(false);
                    setProfileCommunityOpen(false);
                  }} />

                  {/* Logout */}
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
                      <HomeIcon />
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
                      <BookmarkIcon />
                      {t("profile.bookmarks")}
                    </span>
                    <ArrowIcon className="icon-arrow" />
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="avatars"
                    className={({ isActive }) => isActive ? 'active' : ''}
                  >
                    <span className="link-content">
                      <AvatarIcon />
                      Аватар
                    </span>
                    <ArrowIcon className="icon-arrow" />
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="clubs"
                    onClick={() => toggleSubMenu('clubs')}
                    className={({ isActive }) => isActive ? 'active' : ''}
                  >
                    <span className="link-content">
                      <ClubsIcon />
                      {t("myClubs.clubs")}
                    </span>
                    <span className={`arrow-icon ${subMenuStates.clubs ? 'rotated' : ''}`}>
                      {subMenuStates.clubs ? <DownArrowIcon /> : <ArrowIcon />}
                    </span>
                  </NavLink>
                  <ul className={`sub-menu ${subMenuStates.clubs ? 'expanded' : ''}`}>
                    <li>
                      <NavLink to="club-membership" className={({ isActive }) => isActive ? 'active' : ''}>
                        <CircleIcon className="icon" />
                        {t("profile.clubMembership")}
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to="club-create" className={({ isActive }) => isActive ? 'active' : ''}>
                        <CircleIcon className="icon" />
                        {t("profile.newClub")}
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to="club-drafts" className={({ isActive }) => isActive ? 'active' : ''}>
                        <CircleIcon className="icon" />
                        {t("profile.clubDrafts")}
                      </NavLink>
                    </li>
                  </ul>
                </li>
              </ul>
            </div>

            {(isAdmin || isModerator) && (
              <div className="menu-section admin">
                <h3>{t("profile.admin_dashboard")}</h3>
                <ul>
                  <li>
                    <NavLink
                      to="clubs-admin"
                      className={({ isActive }) => isActive ? 'active' : ''}
                    >
                      <span className="link-content">
                        <ClubsIcon />
                        {t("profile.clubsAdmin")}
                      </span>
                      <ArrowIcon className="icon-arrow" />
                    </NavLink>
                  </li>
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
                        {subMenuStates.ads ? <DownArrowIcon /> : <ArrowIcon />}
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
                            {subMenuStates.users ? <DownArrowIcon /> : <ArrowIcon />}
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
                          <ArrowIcon className="icon-arrow" />
                        </NavLink>
                      </li>
                      <li>
                        <NavLink
                          to="mentors-overview"
                          onClick={() => toggleSubMenu('mentors')}
                          className={({ isActive }) => isActive ? 'active' : ''}
                        >
                          <span className="link-content">
                            <UsersIcon className="icon" />
                            {t("admin.mentors.title")}
                          </span>
                          <span className={`arrow-icon ${subMenuStates.mentors ? 'rotated' : ''}`}>
                            {subMenuStates.mentors ? <DownArrowIcon /> : <ArrowIcon />}
                          </span>
                        </NavLink>
                        <ul className={`sub-menu ${subMenuStates.mentors ? 'expanded' : ''}`}>
                          <li>
                            <NavLink to="mentors-overview" className={({ isActive }) => isActive ? 'active' : ''}>
                              <CircleIcon className="icon" />
                              {t("admin.mentors.overview")}
                            </NavLink>
                          </li>
                          <li>
                            <NavLink to="mentors-applications" className={({ isActive }) => isActive ? 'active' : ''}>
                              <CircleIcon className="icon" />
                              {t("admin.mentors.applications")}
                            </NavLink>
                          </li>
                          <li>
                            <NavLink to="mentors-statistics" className={({ isActive }) => isActive ? 'active' : ''}>
                              <CircleIcon className="icon" />
                              {t("admin.mentors.statistics")}
                            </NavLink>
                          </li>
                        </ul>
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
                        {subMenuStates.suggest ? <DownArrowIcon /> : <ArrowIcon />}
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
                        {subMenuStates.articles ? <DownArrowIcon /> : <ArrowIcon />}
                      </span>
                    </NavLink>
                    <ul className={`sub-menu ${subMenuStates.articles ? 'expanded' : ''}`}>
                      <li>
                        <NavLink to="article-create" className={({ isActive }) => isActive ? 'active' : ''}>
                          <CircleIcon className="icon" />
                          {t('profile.new_article')}
                        </NavLink>
                      </li>
                    </ul>
                  </li>

                  <li>
                    <NavLink
                      to="initiatives"
                      onClick={() => toggleSubMenu('initiatives')}
                      className={({ isActive }) => isActive ? 'active' : ''}
                    >
                      <span className="link-content">
                        <InitiativesIcon />
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
                    </ul>
                  </li>

                  <li>
                    <NavLink
                      to="projects"
                      onClick={() => toggleSubMenu('projects')}
                      className={({ isActive }) => isActive ? 'active' : ''}
                    >
                      <span className="link-content">
                        <ProjectsIcon />
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
                    </ul>
                  </li>

                  <li>
                    <NavLink
                      to="publications"
                      className={({ isActive }) => isActive ? 'active' : ''}
                    >
                      <span className="link-content">
                        <PublicationsIcon />
                        {t("profile.publications")}
                      </span>
                      <ArrowIcon className="icon-arrow" />
                    </NavLink>
                  </li>

                  <li>
                    <NavLink
                      to="stories"
                      className={({ isActive }) => isActive ? 'active' : ''}
                    >
                      <span className="link-content">
                        <StoriesIcon />
                        {t("profile.stories")}
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
          {/* {!isFinish && (
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
          )} */}

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
            <Route path="bookmarks" element={<BookmarkedItems />} />
            <Route path="avatars" element={<ProfessionalAvatarBuilder />} />
            <Route path="clubs" element={<MyClubs />} />
            <Route path="club-create" element={<ClubCreateForm />} />
            <Route path="club-drafts" element={<DraftClubs />} />
            <Route path="club-membership" element={<MembershipClubs isEditMode={true} />} />
            <Route path="ads-admin" element={<ManagementGuard><AllAnnouncements /></ManagementGuard>} />
            <Route path="article-create" element={<ManagementGuard><ArticleCreateForm /></ManagementGuard>} />
            <Route path="articles" element={<ManagementGuard><AllArticles /></ManagementGuard>} />
            <Route path="projects" element={<ManagementGuard><AllProjects /></ManagementGuard>} />
            <Route path="projects-drafts" element={<ManagementGuard><DraftProjects /></ManagementGuard>} />
            <Route path="initiatives" element={<ManagementGuard><AllInitiatives /></ManagementGuard>} />
            <Route path="initiative-create" element={<ManagementGuard><InitiativeCreateForm /></ManagementGuard>} />
            <Route path="projects-create" element={<ManagementGuard><ProjectCreateForm /></ManagementGuard>} />
            <Route path="project-preview" element={<ManagementGuard><ProjectPreview /></ManagementGuard>} />
            <Route path="article-preview" element={<ManagementGuard><ArticlePreviewPage /></ManagementGuard>} />
            <Route path="publications" element={<ManagementGuard><AllPublications /></ManagementGuard>} />
            <Route path="stories" element={<ManagementGuard><AllStories /></ManagementGuard>} />
            <Route path="initiative-drafts" element={<ManagementGuard><DraftInitiatives /></ManagementGuard>} />
            <Route path="publication-create" element={<ManagementGuard><PublicationForm /></ManagementGuard>} />
            <Route path="clubs-admin" element={<AdminGuard><ClubsAdmin /></AdminGuard>} />
            <Route path="article-edit/:id" element={<ManagementGuard><EditArticle /></ManagementGuard>} />
            <Route path="pending-announcements" element={<ManagementGuard><PendingAnnouncements setAdsCount={setAdsCount} /></ManagementGuard>} />
            <Route path="approved-announcements" element={<ManagementGuard><ApprovedAnnouncements setApprovedCount={setApprovedCount} /></ManagementGuard>} />
            <Route path="reject-announcements" element={<ManagementGuard><RejectAnnouncements setRejectCount={setRejectCount} /></ManagementGuard>} />
            <Route path="admin-suggest-users" element={<ManagementGuard><AdminSuggestUsers setAllSuggestedUsers={setAllSuggestedUsers} /></ManagementGuard>} />
            <Route path="subscription-admin" element={<ManagementGuard><AdminSubscription setAllSubscriptionEmails={setAllSubscriptionEmails} /></ManagementGuard>} />
            <Route path="suggest-resolved-users" element={<ManagementGuard><SuggestResolvedUsers setResolvedUsers={setResolvedUsers} /></ManagementGuard>} />
            <Route path="users-statistic" element={<AdminGuard><AllUsersStatistics /></AdminGuard>} />
            <Route path="applications-admin" element={<ManagementGuard><ApplicationsAdmin setApplicationsStats={setApplicationsStats} /></ManagementGuard>} />
            {/* <Route path="mentors-overview" element={<AdminGuard><AdminDigiBridgeMentors /></AdminGuard>} />
<Route path="mentors-applications" element={<AdminGuard><AdminDigiBridgeMentorApplications /></AdminGuard>} />
<Route path="mentors-statistics" element={<AdminGuard><AdminDigiBridgeMentorStatistics /></AdminGuard>} /> */}
            <Route path="users-admin" element={<AdminGuard><AllUsers setAllUsers={setAllUsers} /></AdminGuard>} />
            <Route path="users-unfinished" element={<AdminGuard><UnfinishedProfiles setUnfinishedUsers={setUnfinishedUsers} /></AdminGuard>} />
          </Routes>
        </main>
      </div>
    </div>
  );
};