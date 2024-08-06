import React, { useContext, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Routes, Route, Outlet } from 'react-router-dom';
import { ProfileData } from './ProfileData';
import ProfileForm from './ProfileForm';
import ProfileAddress from './ProfileAddress';
import { ProfilePassword } from './ProfilePassword';
import { useTranslation } from 'react-i18next';
import './profile.css';
import { UserContext } from '../contexts/UserContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
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
} from '@fortawesome/free-solid-svg-icons';
import { ProfileSkills } from './ProfileSkills';
import { ProfileWorks } from './ProfileWorks';
import { ProfileInterests } from './ProfileInterests';
import { ProfileAnnounced } from './ProfileAnnounced';
import { AdminGuard } from '../Guards/AdminGuard';
import { PendingAnnouncements } from '../AdminDashboard/PendingAnnouncements/PendingAnnouncements';
import { ApprovedAnnouncements } from '../AdminDashboard/ApprovedAnnouncements/ApprovedAnnouncements';
import { AllAnnouncements } from '../AdminDashboard/AllAnnouncements/AllAnnouncements';
import { RejectAnnouncements } from '../AdminDashboard/RejectAnnouncements/RejectAnnouncements';
import { AllUsers } from '../AdminDashboard/AllUsers/AllUsers';

import { UnfinishedProfiles } from '../AdminDashboard/UnfinishedProfiles/UnfinishedProfiles';
import { AllUsersStatistics } from '../AdminDashboard/AllUsersStatistics/AllUsersStatistics';
import { AdminSuggestUsers } from '../AdminDashboard/AdminSuggestUser/AdminSuggestUsers';
import { SuggestResolvedUsers } from '../AdminDashboard/AdminSuggestUser/SuggesResolvedtUsers/SuggestResolvedUsers';
import { ProfileMessages } from './ProfileMessages';

export const Profile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;
  const [menuOpen, setMenuOpen] = useState(false);
  const { isFinish, profileData, isAdmin, addressId } = useContext(UserContext);
  const [adsCount, setAdsCount] = useState('');
  const [approvedCount, setApprovedCount] = useState('');
  const [rejectCount, setRejectCount] = useState('');
  const [showAdsSubMenu, setShowAdsSubMenu] = useState(false);
  const [showUsersSubMenu, setShowUsersSubMenu] = useState(false);
  const [showSuggestSubMenu, setShowSuggestSubMenu] = useState(false);
  const [allUsers, setAllUsers] = useState('');
  const [unfinishedUsers, setUnfinishedUsers] = useState('');
  const [allSuggestedUsers, setAllSuggestedUsers] = useState('');
  const [resolvedUsers, setResolvedUsers] = useState('');
  useEffect(() => {
    window.scrollTo({ top: 0 });
    if (!profileData) {
      navigate('/profile/profile-form');
    }
    if (!isFinish) {
      navigate('/profile/profile-form');
    }
  }, [isFinish, navigate, profileData]);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleLogout = () => {
    navigate('/logout');
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
  const isAdminPanel = location.pathname.startsWith('/profile/pending-announcements')
    || location.pathname.startsWith('/profile/approved-announcements')
    || location.pathname.startsWith('/profile/reject-announcements')
    || location.pathname.startsWith('/profile/ads-admin')
    || location.pathname.startsWith('/profile/users-admin')
    || location.pathname.startsWith('/profile/users-statistic')
    || location.pathname.startsWith('/profile/users-unfinished')
    || location.pathname.startsWith('/profile/admin-suggest-users')
    || location.pathname.startsWith('/profile/suggest-resolved-users')
    || location.pathname.startsWith('/profile/messages')

  return (
    <section className='profile-section'>
      <button className='menu-toggle' onClick={toggleMenu}>
        <FontAwesomeIcon icon={menuOpen ? faTimes : faBars} />
      </button>

      <section className={`account-menu ${menuOpen ? 'open' : ''} ${!isFinish ? 'disabled' : ''}`}>
        <h3>{t('profile.account')}</h3>
        <Link to='data' onClick={toggleMenu}>
          <FontAwesomeIcon icon={faUser} className='icon' />
          {t('profile.personal_data')}
        </Link>
        <Link to='address' onClick={toggleMenu}>
          <FontAwesomeIcon icon={faLocationDot} className='icon' />
          {t('profile.address')}
        </Link>
        <Link to='password' onClick={toggleMenu}>
          <FontAwesomeIcon icon={faLock} className='icon' />
          {t('profile.password')}
        </Link>
        <Link to='announced' onClick={toggleMenu}>
          <FontAwesomeIcon icon={faScroll} className='icon' />
          {t('profile.announced')}
        </Link>
        <Link to='skills' onClick={toggleMenu}>
          <FontAwesomeIcon icon={faUniversalAccess} className='icon' />
          {t('map.skills')}
        </Link>
        <Link to='workOptions' onClick={toggleMenu}>
          <FontAwesomeIcon icon={faBriefcase} className='icon' />
          {t('map.job')}
        </Link>
        <Link to='interestOptions' onClick={toggleMenu}>
          <FontAwesomeIcon icon={faUsersGear} className='icon' />
          {t('map.interests')}
        </Link>
        
        <Link to='messages' onClick={toggleMenu}>
          <FontAwesomeIcon icon={faMountainSun} className='icon' />
          {t('profile.messages')}
        </Link>
        {isAdmin && (
          <div className="admin-dashboard">
            <h3>{t('profile.admin_dashboard')}</h3>
            <Link to='ads-admin' onClick={toggleAdsSubMenu}>
              <FontAwesomeIcon icon={faBookOpenReader} className='icon' />
              {t('profile.ads-statistic')}
            </Link>
            <div className={`ads-submenu ${showAdsSubMenu ? 'show' : ''}`}>
              <Link to='pending-announcements' onClick={toggleMenu}>
                <FontAwesomeIcon icon={faScroll} className='icon' />
                {t('profile.pending_announcements')} {adsCount > 0 && (<>- {adsCount} {adsCount === 1 ? t('profile.ads-one') : t('profile.ads')}</>)}
              </Link>
              <Link to='approved-announcements' onClick={toggleMenu}>
                <FontAwesomeIcon icon={faCircleCheck} className='icon' />
                {t('profile.approved_announcements')} {approvedCount > 0 && (<>- {approvedCount} {approvedCount === 1 ? t('profile.ads-one') : t('profile.ads')}</>)}
              </Link>
              <Link to='reject-announcements' onClick={toggleMenu}>
                <FontAwesomeIcon icon={faBan} className='icon' />
                {t('profile.reject_announcements')} {rejectCount > 0 && (<>- {rejectCount} {rejectCount === 1 ? t('profile.ads-one') : t('profile.ads')}</>)}
              </Link>
            </div>
            <Link to='users-statistic' onClick={toggleUsersSubMenu}>
              <FontAwesomeIcon icon={faChartPie} className='icon' />
              {t('admin.users')}
            </Link>
            <div className={`ads-submenu ${showUsersSubMenu ? 'show' : ''}`}>
              <Link to='users-admin' onClick={toggleMenu}>
                <FontAwesomeIcon icon={faUsers} className='icon' />
                {t('profile.all_users')} {allUsers >= 1 && (<>- {allUsers}</>)}
              </Link>
            </div>
            <div className={`ads-submenu ${showUsersSubMenu ? 'show' : ''}`}>
              <Link to='users-unfinished' onClick={toggleMenu}>
                <FontAwesomeIcon icon={faAddressCard} className='icon' />
                {t('admin.unfinished_users')} {unfinishedUsers >= 1 && (<>- {unfinishedUsers}</>)}
              </Link>
            </div>
            <Link to='admin-suggest-users' onClick={toggleSuggestSubMenu}>
              <FontAwesomeIcon icon={faPeopleArrows} className='icon' />
              {t('admin.admin-suggest-users')} {allSuggestedUsers >= 1 && (<>- {allSuggestedUsers}</>)}
            </Link>
            <div className={`ads-submenu ${showSuggestSubMenu ? 'show' : ''}`}>
              <Link to='suggest-resolved-users' onClick={toggleMenu}>
                <FontAwesomeIcon icon={faAddressCard} className='icon' />
                {t('admin.suggest_resolved_users')} {resolvedUsers >= 1 && (<>- {resolvedUsers}</>)}
              </Link>
            </div>
          </div>
        )}
      </section>
      <div className='main-profile'>
        {isFinish === true && !isAdminPanel && (
          <section className='profile-data'>
            <Link to='/logout' onClick={handleLogout}>
              <button type='button' className='top-right-button'>
                {t('profile.logout')}
              </button>
            </Link>
            <div className='avatar'>
              <img src={profileData?.details?.imageURL || '/images/sign-up/avatar.jpg'} alt='User avatar' />
            </div>
            <div className='user-data'>
              <h2>{profileData?.details?.username}</h2>
              {profileData?.details?.firstName || profileData?.details?.lastName ? (
                <p>
                  <FontAwesomeIcon icon={faUser} className='icon' />
                  {profileData?.details?.firstName ? profileData?.details?.firstName : ''}{' '}
                  {profileData?.details?.lastName ? profileData?.details?.lastName : ''}
                </p>
              ) : (
                ''
              )}

              <p>
                <FontAwesomeIcon icon={faEnvelope} className='icon' /> {profileData?.email}
              </p>

              {currentLanguage === 'bg'
              ? <p>
              <FontAwesomeIcon icon={faLocationDot} className='icon' /> {profileData?.details?.settlement}, {profileData?.details?.municipality},{' '}
              {profileData?.details?.region}
            </p>
            : <p>
            <FontAwesomeIcon icon={faLocationDot} className='icon' /> {addressId?.settlementEn}, {addressId?.municipalityEn},{' '}
            {addressId?.regionEn}
          </p>}
            </div>

          </section>
        )}

        <Outlet />
        <Routes>
          {!isFinish && <Route path='profile-form' element={<ProfileForm />} />}

          <Route path='data' element={<ProfileData />} />
          <Route path='address' element={<ProfileAddress />} />
          <Route path='password' element={<ProfilePassword />} />
          <Route path='skills' element={<ProfileSkills />} />
          <Route path='workOptions' element={<ProfileWorks />} />
          <Route path='announced' element={<ProfileAnnounced />} profileData={profileData} />
          <Route path='interestOptions' element={<ProfileInterests />} />
          <Route path='messages' element={<ProfileMessages />} />
          <Route path='ads-admin' element={<AdminGuard><AllAnnouncements /></AdminGuard>} />
          <Route path='users-statistic' element={<AdminGuard><AllUsersStatistics /></AdminGuard>} />
          <Route path='users-admin' element={<AdminGuard><AllUsers setAllUsers={setAllUsers} /></AdminGuard>} />
          <Route path='users-unfinished' element={<AdminGuard><UnfinishedProfiles setUnfinishedUsers={setUnfinishedUsers} /></AdminGuard>} />
          <Route path='pending-announcements' element={<AdminGuard><PendingAnnouncements setAdsCount={setAdsCount} /></AdminGuard>} />
          <Route path='approved-announcements' element={<AdminGuard><ApprovedAnnouncements setApprovedCount={setApprovedCount} /></AdminGuard>} />
          <Route path='reject-announcements' element={<AdminGuard><RejectAnnouncements setRejectCount={setRejectCount} /></AdminGuard>} />
          <Route path='admin-suggest-users' element={<AdminGuard><AdminSuggestUsers setAllSuggestedUsers={setAllSuggestedUsers} /></AdminGuard>} />
          <Route path='suggest-resolved-users' element={<AdminGuard><SuggestResolvedUsers setResolvedUsers={setResolvedUsers} /></AdminGuard>} />

        </Routes>
      </div>
    </section>
  );
};
