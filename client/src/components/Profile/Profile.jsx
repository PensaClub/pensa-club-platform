import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useContext, Fragment } from 'react';
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
} from '@fortawesome/free-solid-svg-icons';
import { ProfileSkills } from './ProfileSkills';
import { ProfileWorks } from './ProfileWorks';
import { ProfileInterests } from './ProfileInterests';
import { ProfileAnnounced } from './ProfileAnnounced';
import { AdminGuard } from '../Guards/AdminGuard';
import { PendingAnnouncements } from '../AdminDashboard/PendingAnnouncements/PendingAnnouncements';

export const Profile = () => {
  const location = useLocation()
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { isFinish, profileData, isAdmin } = useContext(UserContext);

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
const isAdminPanel =location.pathname.startsWith('/profile/pending-announcements')
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
        <Link to='anothers' onClick={toggleMenu}>
          <FontAwesomeIcon icon={faMountainSun} className='icon' />
          {t('profile.anothers')}
        </Link>
        {isAdmin && ( 
          <div className="admin-dashboard">
            <h3>{t('profile.admin_dashboard')}</h3>
            <Link to='pending-announcements' onClick={toggleMenu}>
              <FontAwesomeIcon icon={faScroll} className='icon' />
              {t('profile.pending_announcements')}
            </Link>
          </div>
        )}
      </section>
      <div className='main-profile'>
        {isFinish === true && !isAdminPanel &&(
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

              <p>
                <FontAwesomeIcon icon={faLocationDot} className='icon' /> {profileData?.details?.settlement}, {profileData?.details?.municipality},{' '}
                {profileData?.details?.region}
              </p>
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
          <Route path='pending-announcements' element={<AdminGuard><PendingAnnouncements /></AdminGuard>} />
        </Routes>
      </div>
    </section>
  );
};
