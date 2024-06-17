import { Link } from 'react-router-dom';
import { useState, useEffect, useContext } from 'react';
import { Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { ProfileData } from './ProfileData';
import ProfileForm from './ProfileForm';
import ProfileAddress from './ProfileAddress';
import { ProfilePassword } from './ProfilePassword';
import  {ProfileImage}  from './ProfileImage';
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
  faImage,
  faBars,
  faEnvelope,
  faPhone,
  faBriefcase,
  faUniversalAccess,
  faUsersGear,
} from '@fortawesome/free-solid-svg-icons';
import { ProfileSkills } from './ProfileSkills';
import { ProfileWorks } from './ProfileWorks';
import { ProfileInterests } from './ProfileInterests';
import { ProfileAnnounced } from './ProfileAnnounced';

export const Profile = () => {
    const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  // const [profileData, setProfileData] = useState('');
  // const [isName, setIsName] = useState(false);

  const { userEmail, isFinish, profileData } =
    useContext(UserContext);
  //    const isFinish = true;
  //   console.log(isFinish);

  // const fieldMapping = {
  //   phone_number: "phoneNumber",
  //   username: "username",
  //   region: "region",
  //   municipality: "municipality",
  //   settlement: "settlement",
  //   work_options: "workOptions",
  //   skills: "skills",
  //   interest_options: "interestOptions",
  //   district: "district",
  //   block: "block",
  //   street: "street",
  //   street_number: "streetNumber",
  //   location: "location",
  //   first_name: "firstName",
  //   last_name: "lastName",
  //   gender: "gender",
  //   birth_date: "birthDate",
  // };

  useEffect(() => {
    window.scrollTo({ top: 0 });
    
    // const serializedData = localStorage.getItem("userDetails");
    // const userDetails = JSON.parse(serializedData);
    // if (userDetails) {
    //   setProfileData (userDetails.details);
    // } 
  }, []);

  // useEffect(() => {
  //   const loadProfileData = async () => {
  //     if (isFinish) {
  //       const userDetails = await getProfileData(userId);
  //       // console.log(userDetails);
  //       setUserData(userDetails);
  //       console.log(userData);
  //     }
  //   };

  //   loadProfileData();
  // }, [userId]);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <section className="profile-section">
      <button className="menu-toggle" onClick={toggleMenu}>
        <FontAwesomeIcon icon={menuOpen ? faTimes : faBars} />
      </button>

            <section className={`account-menu ${menuOpen ? 'open' : ''} ${!isFinish ? 'disabled' : ''}`}>
                <h3>{t('profile.account')}</h3>
                <Link to="image" onClick={toggleMenu}><FontAwesomeIcon icon={faImage} className="icon" />{t('profile.photo')}</Link>
                <Link to="data" onClick={toggleMenu}><FontAwesomeIcon icon={faUser} className="icon" />{t('profile.personal_data')}</Link>
                <Link to="address" onClick={toggleMenu}><FontAwesomeIcon icon={faLocationDot} className="icon" />{t('profile.address')}</Link>
                <Link to="password" onClick={toggleMenu}><FontAwesomeIcon icon={faLock} className="icon" />{t('profile.password')}</Link>
                <Link to="announced" onClick={toggleMenu}><FontAwesomeIcon icon={faScroll} className="icon" />{t('profile.announced')}</Link>
                <Link to="skills" onClick={toggleMenu}><FontAwesomeIcon icon={faUniversalAccess} className="icon" />{t('map.skills')}</Link>
                <Link to="workOptions" onClick={toggleMenu}><FontAwesomeIcon icon={faBriefcase} className="icon" />{t('map.job')}</Link>
                <Link to="interestOptions" onClick={toggleMenu}><FontAwesomeIcon icon={faUsersGear} className="icon" />{t('map.interests')}</Link>
                <Link to="anothers" onClick={toggleMenu}><FontAwesomeIcon icon={faMountainSun} className="icon" />{t('profile.anothers')}</Link>
            </section>
            <div className="main-profile">

                {isFinish === true &&
                    <section className="profile-data">
                        <div className="avatar">
                            <img src="/images/sign-up/avatar.jpg" alt="User avatar" />
                        </div>
                        <div className="user-data">

                            <h2>{profileData.username}</h2>
                            <p><FontAwesomeIcon icon={faUser} className="icon" /> {profileData.firstName} {profileData.lastName}</p>
                            
                            <p><FontAwesomeIcon icon={faPhone} className="icon"/> {profileData.phoneNumber}</p>
                            {/* TODO: map settlement name */}
                            <p><FontAwesomeIcon icon={faLocationDot} className="icon" /> {profileData.settlement}</p>
                            <p><FontAwesomeIcon icon={faEnvelope} className="icon"/> {profileData.email}</p>

                        </div>
                    </section>
                }



        <Outlet />
        <Routes>
          {/* {!isFinish && <Route path="profile-form" element={<ProfileForm />} />} */}
          <Route path="profile-form" element={<ProfileForm />} />
          <Route path="image" element={<ProfileImage />} />
          <Route path="data" element={<ProfileData />} />
          <Route path="address" element={<ProfileAddress />} />
          <Route path="password" element={<ProfilePassword />} />
          <Route path="skills" element={<ProfileSkills />} />
          <Route path="workOptions" element={<ProfileWorks />} />
          <Route path="announced" element={<ProfileAnnounced />} />
          <Route path="interestOptions" element={<ProfileInterests />} />
          {/* <Route path="anothers" element={<ProfileOthers />} /> */}
        </Routes>
      </div>
    </section>
  );
};
