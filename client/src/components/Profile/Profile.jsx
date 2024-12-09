import React, { useContext, useEffect, useState } from "react";
import { Link, useLocation, useNavigate, NavLink } from "react-router-dom";
import { Routes, Route, Outlet } from "react-router-dom";
import { ProfileData } from "./ProfileData";
import ProfileForm from "./ProfileForm";
import ProfileAddress from "./ProfileAddress";
import { ProfilePassword } from "./ProfilePassword";
import { useTranslation } from "react-i18next";
import "./profile.css";
import { UserContext } from "../contexts/UserContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLocationDot,
  faUser,
  faLock,
  faScroll,
  faMountainSun,
  faTimes,
  faBars,
  faEnvelope,
  faBriefcase,
  faUniversalAccess,
  faUsersGear,
  faCircleCheck,
  faBan,
  faBookOpenReader,
  faUsers,
  faChartPie,
  faAddressCard,
  faPeopleArrows,
  faCircleExclamation,
} from "@fortawesome/free-solid-svg-icons";
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
  const [showAdsSubMenu, setShowAdsSubMenu] = useState(false);
  const [showUsersSubMenu, setShowUsersSubMenu] = useState(false);
  const [showSuggestSubMenu, setShowSuggestSubMenu] = useState(false);
  const [allUsers, setAllUsers] = useState("");
  const [unfinishedUsers, setUnfinishedUsers] = useState("");
  const [allSuggestedUsers, setAllSuggestedUsers] = useState("");
  const [resolvedUsers, setResolvedUsers] = useState("");
  const [allSubscriptionEmails, setAllSubscriptionEmails] = useState("");
  const [isModalOpen, setModalOpen] = useState(false);
  useEffect(() => {
    window.scrollTo({ top: 0 });
    if (!profileData) {
      navigate("/profile/profile-form");
    }
    if (!isFinish) {
      navigate("/profile/profile-form");
    }
  }, [isFinish, navigate, profileData]);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleLogout = () => {
    navigate("/logout");
  };

  const toggleAdsSubMenu = () => {
    setShowAdsSubMenu(!showAdsSubMenu);
  };
  const toggleUsersSubMenu = () => {
    setShowUsersSubMenu(!showUsersSubMenu);
  };
  const toggleSuggestSubMenu = () => {
    setShowSuggestSubMenu(!showSuggestSubMenu);
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

  const isAdminPanel =
    location.pathname.startsWith("/profile/pending-announcements") ||
    location.pathname.startsWith("/profile/approved-announcements") ||
    location.pathname.startsWith("/profile/reject-announcements") ||
    location.pathname.startsWith("/profile/ads-admin") ||
    location.pathname.startsWith("/profile/users-admin") ||
    location.pathname.startsWith("/profile/users-statistic") ||
    location.pathname.startsWith("/profile/users-unfinished") ||
    location.pathname.startsWith("/profile/admin-suggest-users") ||
    location.pathname.startsWith("/profile/suggest-resolved-users") ||
    location.pathname.startsWith("/profile/messages") ||
    location.pathname.startsWith("/profile/subscription-admin");

  return (
    <section className="profile-section">
      {/* {isFinish && (
        <button className="menu-toggle" onClick={toggleMenu}>
          <FontAwesomeIcon icon={menuOpen ? faTimes : faBars} />
        </button>
      )} */}

      <div className="main-profile">
        {/* {isFinish === true && !isAdminPanel && ( */}
        <section className="profile-data">
          {/* <NavLink to='/logout' onClick={handleLogout}>
              <button type='button' className='top-right-button'>
                {t('profile.logout')}
              </button>
            </NavLink> */}
          <div className="avatar">
            <img
              src={
                profileData?.details?.imageURL ||
                getProfileImage(profileData?.details?.gender)
                // "/images/homePage/user-img.png"
              }
              alt="User avatar"
            />
          </div>
          <div className="user-data">
            {profileData?.details?.username !== "" ? (
              <h2>{profileData?.details?.username}</h2>
            ) : (
              ""
            )}
            {profileData?.details?.firstName ||
            profileData?.details?.lastName ? (
              <p>
                <FontAwesomeIcon icon={faUser} className="icon" />
                {profileData?.details?.firstName
                  ? profileData?.details?.firstName
                  : ""}{" "}
                {profileData?.details?.lastName
                  ? profileData?.details?.lastName
                  : ""}
              </p>
            ) : (
              ""
            )}

            <p>
              <FontAwesomeIcon icon={faEnvelope} className="icon" />{" "}
              {profileData?.email}
            </p>
            {isFinish && (
              <>
                {currentLanguage === "bg" ? (
                  <p>
                    <FontAwesomeIcon icon={faLocationDot} className="icon" />
                    {profileData?.details?.region}
                  </p>
                ) : (
                  <p>
                    <FontAwesomeIcon icon={faLocationDot} className="icon" />
                    {/* {" "} */}
                    {/* {addressId?.settlementEn}, {addressId?.municipalityEn},{" "} */}
                    {addressId?.regionEn}
                  </p>
                )}
              </>
            )}
          </div>
        </section>
        <section
          className={`account-menu ${menuOpen ? "open" : ""} ${
            !isFinish ? "disabled" : ""
          }`}
        >
          <NavLink to="data" onClick={toggleMenu}>
            <FontAwesomeIcon icon={faUser} className="icon" />
            {t("profile.personal_data")}
          </NavLink>
          <NavLink
            to="address"
            onClick={toggleMenu}
            className={({ isActive }) => `${isActive ? "active" : ""}`}
          >
            <FontAwesomeIcon icon={faLocationDot} className="icon" />
            {t("profile.address")}
          </NavLink>
          <NavLink to="password" onClick={toggleMenu}>
            <FontAwesomeIcon icon={faLock} className="icon" />
            {t("profile.password")}
          </NavLink>
          <NavLink to="announced" onClick={toggleMenu}>
            <FontAwesomeIcon icon={faScroll} className="icon" />
            {t("profile.announced")}
          </NavLink>

          <NavLink to="messages" onClick={toggleMenu}>
            <FontAwesomeIcon icon={faMountainSun} className="icon" />
            {t("profile.messages")}
          </NavLink>
          {isAdmin && (
            <div className="admin-dashboard">
              <h3>{t("profile.admin_dashboard")}</h3>
              <NavLink to="ads-admin" onClick={toggleAdsSubMenu}>
                <FontAwesomeIcon icon={faBookOpenReader} className="icon" />
                {t("profile.ads-statistic")}
              </NavLink>
              <div className={`ads-submenu ${showAdsSubMenu ? "show" : ""}`}>
                <NavLink to="pending-announcements" onClick={toggleMenu}>
                  <FontAwesomeIcon icon={faScroll} className="icon" />
                  {t("profile.pending_announcements")}{" "}
                  {adsCount > 0 && (
                    <>
                      - {adsCount}{" "}
                      {adsCount === 1 ? t("profile.ads-one") : t("profile.ads")}
                    </>
                  )}
                </NavLink>
                <NavLink to="approved-announcements" onClick={toggleMenu}>
                  <FontAwesomeIcon icon={faCircleCheck} className="icon" />
                  {t("profile.approved_announcements")}{" "}
                  {approvedCount > 0 && (
                    <>
                      - {approvedCount}{" "}
                      {approvedCount === 1
                        ? t("profile.ads-one")
                        : t("profile.ads")}
                    </>
                  )}
                </NavLink>
                <NavLink to="reject-announcements" onClick={toggleMenu}>
                  <FontAwesomeIcon icon={faBan} className="icon" />
                  {t("profile.reject_announcements")}{" "}
                  {rejectCount > 0 && (
                    <>
                      - {rejectCount}{" "}
                      {rejectCount === 1
                        ? t("profile.ads-one")
                        : t("profile.ads")}
                    </>
                  )}
                </NavLink>
              </div>
              <NavLink to="users-statistic" onClick={toggleUsersSubMenu}>
                <FontAwesomeIcon icon={faChartPie} className="icon" />
                {t("admin.users")}
              </NavLink>
              <div className={`ads-submenu ${showUsersSubMenu ? "show" : ""}`}>
                <NavLink to="users-admin" onClick={toggleMenu}>
                  <FontAwesomeIcon icon={faUsers} className="icon" />
                  {t("profile.all_users")} {allUsers >= 1 && <>- {allUsers}</>}
                </NavLink>
              </div>
              <div className={`ads-submenu ${showUsersSubMenu ? "show" : ""}`}>
                <NavLink to="users-unfinished" onClick={toggleMenu}>
                  <FontAwesomeIcon icon={faAddressCard} className="icon" />
                  {t("admin.unfinished_users")}{" "}
                  {unfinishedUsers >= 1 && <>- {unfinishedUsers}</>}
                </NavLink>
              </div>
              <NavLink to="admin-suggest-users" onClick={toggleSuggestSubMenu}>
                <FontAwesomeIcon icon={faPeopleArrows} className="icon" />
                {t("admin.admin-suggest-users")}{" "}
                {allSuggestedUsers >= 1 && <>- {allSuggestedUsers}</>}
              </NavLink>
              <div
                className={`ads-submenu ${showSuggestSubMenu ? "show" : ""}`}
              >
                <NavLink to="suggest-resolved-users" onClick={toggleMenu}>
                  <FontAwesomeIcon icon={faAddressCard} className="icon" />
                  {t("admin.suggest_resolved_users")}{" "}
                  {resolvedUsers >= 1 && <>- {resolvedUsers}</>}
                </NavLink>
              </div>
              <NavLink to="subscription-admin">
                <FontAwesomeIcon icon={faEnvelope} className="icon" />
                {t("admin.ads_subscription")}{" "}
                {allSubscriptionEmails >= 1 && <>- {allSubscriptionEmails}</>}
              </NavLink>
            </div>
          )}
        </section>
      </div>
      <div className="main-data">
        <section
          className={`account-menu-mobile ${menuOpen ? "open" : ""} ${
            !isFinish ? "disabled" : ""
          }`}
        >
          <NavLink to="data" onClick={toggleMenu}>
            <FontAwesomeIcon icon={faUser} className="icon" />
          </NavLink>
          <NavLink
            to="address"
            onClick={toggleMenu}
            className={({ isActive }) => `${isActive ? "active" : ""}`}
          >
            <FontAwesomeIcon icon={faLocationDot} className="icon" />
          </NavLink>
          <NavLink to="password" onClick={toggleMenu}>
            <FontAwesomeIcon icon={faLock} className="icon" />
          </NavLink>
          <NavLink to="announced" onClick={toggleMenu}>
            <FontAwesomeIcon icon={faScroll} className="icon" />
          </NavLink>
          {/* <NavLink to="skills" onClick={toggleMenu}>
            <FontAwesomeIcon icon={faUniversalAccess} className="icon" />
            
          </NavLink>
          <NavLink to="workOptions" onClick={toggleMenu}>
            <FontAwesomeIcon icon={faBriefcase} className="icon" />
            
          </NavLink>
          <NavLink to="interestOptions" onClick={toggleMenu}>
            <FontAwesomeIcon icon={faUsersGear} className="icon" />
            
          </NavLink> */}

          <NavLink to="messages" onClick={toggleMenu}>
            <FontAwesomeIcon icon={faMountainSun} className="icon" />
          </NavLink>
          {isAdmin && (
            <div className="admin-dashboard">
              <h3>{t("profile.admin_dashboard")}</h3>
              <NavLink to="ads-admin" onClick={toggleAdsSubMenu}>
                <FontAwesomeIcon icon={faBookOpenReader} className="icon" />
                {t("profile.ads-statistic")}
              </NavLink>
              <div className={`ads-submenu ${showAdsSubMenu ? "show" : ""}`}>
                <NavLink to="pending-announcements" onClick={toggleMenu}>
                  <FontAwesomeIcon icon={faScroll} className="icon" />
                  {t("profile.pending_announcements")}{" "}
                  {adsCount > 0 && (
                    <>
                      - {adsCount}{" "}
                      {adsCount === 1 ? t("profile.ads-one") : t("profile.ads")}
                    </>
                  )}
                </NavLink>
                <NavLink to="approved-announcements" onClick={toggleMenu}>
                  <FontAwesomeIcon icon={faCircleCheck} className="icon" />
                  {t("profile.approved_announcements")}{" "}
                  {approvedCount > 0 && (
                    <>
                      - {approvedCount}{" "}
                      {approvedCount === 1
                        ? t("profile.ads-one")
                        : t("profile.ads")}
                    </>
                  )}
                </NavLink>
                <NavLink to="reject-announcements" onClick={toggleMenu}>
                  <FontAwesomeIcon icon={faBan} className="icon" />
                  {t("profile.reject_announcements")}{" "}
                  {rejectCount > 0 && (
                    <>
                      - {rejectCount}{" "}
                      {rejectCount === 1
                        ? t("profile.ads-one")
                        : t("profile.ads")}
                    </>
                  )}
                </NavLink>
              </div>
              <NavLink to="users-statistic" onClick={toggleUsersSubMenu}>
                <FontAwesomeIcon icon={faChartPie} className="icon" />
                {t("admin.users")}
              </NavLink>
              <div className={`ads-submenu ${showUsersSubMenu ? "show" : ""}`}>
                <NavLink to="users-admin" onClick={toggleMenu}>
                  <FontAwesomeIcon icon={faUsers} className="icon" />
                  {t("profile.all_users")} {allUsers >= 1 && <>- {allUsers}</>}
                </NavLink>
              </div>
              <div className={`ads-submenu ${showUsersSubMenu ? "show" : ""}`}>
                <NavLink to="users-unfinished" onClick={toggleMenu}>
                  <FontAwesomeIcon icon={faAddressCard} className="icon" />
                  {t("admin.unfinished_users")}{" "}
                  {unfinishedUsers >= 1 && <>- {unfinishedUsers}</>}
                </NavLink>
              </div>
              <NavLink to="admin-suggest-users" onClick={toggleSuggestSubMenu}>
                <FontAwesomeIcon icon={faPeopleArrows} className="icon" />
                {t("admin.admin-suggest-users")}{" "}
                {allSuggestedUsers >= 1 && <>- {allSuggestedUsers}</>}
              </NavLink>
              <div
                className={`ads-submenu ${showSuggestSubMenu ? "show" : ""}`}
              >
                <NavLink to="suggest-resolved-users" onClick={toggleMenu}>
                  <FontAwesomeIcon icon={faAddressCard} className="icon" />
                  {t("admin.suggest_resolved_users")}{" "}
                  {resolvedUsers >= 1 && <>- {resolvedUsers}</>}
                </NavLink>
              </div>
              <NavLink to="subscription-admin">
                <FontAwesomeIcon icon={faEnvelope} className="icon" />
                {t("admin.ads_subscription")}{" "}
                {allSubscriptionEmails >= 1 && <>- {allSubscriptionEmails}</>}
              </NavLink>
            </div>
          )}
        </section>
        {!isFinish && (
          <div className="unfinished-profiles">
            <p className="warning-info">Вашият профил е непълен!</p>
            {/* {!isFinish && (
            <span
              className="warning-icon-image"
              onClick={(e) => {
                e.stopPropagation();
                handleModalToggle();
              }}
            >
              <FontAwesomeIcon icon={faCircleExclamation} />
            </span>
          )} */}
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
          <Route
            path="announced"
            element={<ProfileAnnounced />}
            profileData={profileData}
          />
          <Route path="interestOptions" element={<ProfileInterests />} />
          <Route path="messages" element={<ProfileMessages />} />
          <Route
            path="ads-admin"
            element={
              <AdminGuard>
                <AllAnnouncements />
              </AdminGuard>
            }
          />
          <Route
            path="users-statistic"
            element={
              <AdminGuard>
                <AllUsersStatistics />
              </AdminGuard>
            }
          />
          <Route
            path="users-admin"
            element={
              <AdminGuard>
                <AllUsers setAllUsers={setAllUsers} />
              </AdminGuard>
            }
          />
          <Route
            path="users-unfinished"
            element={
              <AdminGuard>
                <UnfinishedProfiles setUnfinishedUsers={setUnfinishedUsers} />
              </AdminGuard>
            }
          />
          <Route
            path="pending-announcements"
            element={
              <AdminGuard>
                <PendingAnnouncements setAdsCount={setAdsCount} />
              </AdminGuard>
            }
          />
          <Route
            path="approved-announcements"
            element={
              <AdminGuard>
                <ApprovedAnnouncements setApprovedCount={setApprovedCount} />
              </AdminGuard>
            }
          />
          <Route
            path="reject-announcements"
            element={
              <AdminGuard>
                <RejectAnnouncements setRejectCount={setRejectCount} />
              </AdminGuard>
            }
          />
          <Route
            path="admin-suggest-users"
            element={
              <AdminGuard>
                <AdminSuggestUsers
                  setAllSuggestedUsers={setAllSuggestedUsers}
                />
              </AdminGuard>
            }
          />
          <Route
            path="subscription-admin"
            element={
              <AdminGuard>
                <AdminSubscription
                  setAllSubscriptionEmails={setAllSubscriptionEmails}
                />
              </AdminGuard>
            }
          />
          <Route
            path="suggest-resolved-users"
            element={
              <AdminGuard>
                <SuggestResolvedUsers setResolvedUsers={setResolvedUsers} />
              </AdminGuard>
            }
          />
        </Routes>
      </div>
    </section>
  );
};

// <>
// <p className="warning-info">Вашият профил е непълен!</p>
// {!isFinish && (
//   <span
//     className="warning-icon-image"
//     onClick={(e) => {
//       e.stopPropagation();
//       handleModalToggle();
//     }}
//   >
//     <FontAwesomeIcon icon={faCircleExclamation} />
//   </span>
// )}
// <p>
//   Ако желаете да се възползвате от всички възможности на
//   платформата, продължете като Pensa потребител и открийте
//   близо до Вас други потребители на нашата карта със сходни
//   интереси и умения, както и много други или продължете като
//   обикновен потребител.
// </p>
// <div className="profile-data-btns">
//   <NavLink to="/profile/profile-form" onClick={handleLogout}>
//     <button type="button" className="btn-general btn-orange">
//       Pensa потребител
//     </button>
//   </NavLink>
//   <NavLink to="/profile/profile-form" onClick={handleLogout}>
//     <button type="button" className="btn-general btn-green">
//       Обикновен потребител
//     </button>
//   </NavLink>
// </div>
// </>
