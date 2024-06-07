import { Link } from 'react-router-dom';
import { useState, useEffect, useContext } from 'react';
import { Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { ProfileData } from './ProfileData';
import ProfileForm from './ProfileForm';
import ProfileAddress from './ProfileAddress';
import './profile.css';
import { UserContext } from '../contexts/UserContext';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot, faUser, faLock, faScroll, faMountainSun, faTimes,faImage, faBars, faEnvelope,faPhone, faBriefcase, faUniversalAccess, faUsersGear  } from '@fortawesome/free-solid-svg-icons'

export const Profile = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [userData, setUserData] = useState('');

    const { isFinish, getProfileData,profileData } = useContext(UserContext);
    //    const isFinish = true;
    console.log(isFinish)


    const { userId } = useContext(UserContext);

    useEffect(() => {
        window.scrollTo({ top: 0 })
    }, [])

    useEffect(() => {
        if(isFinish) {
            // getProfileData()
            //     .then((res) => {
            //         setUserData(res)
            //     })
            //     .catch((err) => console.log(err.message))

            // Simona: test purposes only!! to be replaced with the above and tested again
            setUserData(profileData);
            console.log(profileData);
            
        }
    }, [isFinish])

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };


    return (


        <section className="profile-section">

            <button className="menu-toggle" onClick={toggleMenu}>
                <FontAwesomeIcon icon={menuOpen ? faTimes : faBars} />
            </button>

            <section className={`account-menu ${menuOpen ? 'open' : ''} ${!isFinish ? 'disabled' : ''}`}>
                <h3>Акаунт</h3>
                <Link to="image" onClick={toggleMenu}><FontAwesomeIcon icon={faImage} className="icon" />Снимка</Link>
                <Link to="data" onClick={toggleMenu}><FontAwesomeIcon icon={faUser} className="icon" />Лични данни</Link>
                <Link to="address" onClick={toggleMenu}><FontAwesomeIcon icon={faLocationDot} className="icon" />Адрес</Link>
                <Link to="password" onClick={toggleMenu}><FontAwesomeIcon icon={faLock} className="icon" />Парола</Link>
                <Link to="announced" onClick={toggleMenu}><FontAwesomeIcon icon={faScroll} className="icon" />Обяви</Link>
                <Link to="skills" onClick={toggleMenu}><FontAwesomeIcon icon={faUniversalAccess} className="icon" />Умения</Link>
                <Link to="workOptions" onClick={toggleMenu}><FontAwesomeIcon icon={faBriefcase} className="icon" />Професия</Link>
                <Link to="interestOptions" onClick={toggleMenu}><FontAwesomeIcon icon={faUsersGear} className="icon" />Интереси</Link>
                <Link to="anothers" onClick={toggleMenu}><FontAwesomeIcon icon={faMountainSun} className="icon" />Други</Link>
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
                <Routes >
                    {isFinish === false && <Route path="*" element={<Navigate to="profile-form" />} />}
                    <Route path="profile-form" element={<ProfileForm />} />
                    <Route path="data" element={<ProfileData />} />
                    <Route path="address" element={<ProfileAddress />} />
                    {/* <Route path="password" element={<ProfilePassword />} /> */}
                    {/* <Route path="announced" element={<ProfileAnnounced />} /> */}
                    {/* <Route path="interests" element={<ProfileInterests />} /> */}
                    {/* <Route path="anothers" element={<ProfileOthers />} /> */}
                </Routes>
            </div>

        </section>

    )
}