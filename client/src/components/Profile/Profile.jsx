import { Link } from 'react-router-dom';
import { ProfileData }  from './ProfileData';
import ProfileForm from './ProfileForm';
import ProfileAddress from './ProfileAddress';
import './profile.css'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faLocationDot , faUser, faLock, faScroll, faMountainSun} from '@fortawesome/free-solid-svg-icons'

export const Profile = () => {
    return (
        <>
             
            <section className="profile-section">
                <section className="account-menu">
                    <h3>Акаунт</h3>
                    <Link to="data"><FontAwesomeIcon icon={faUser} className="icon"/>Лични данни</Link>
                    <Link to="address"><FontAwesomeIcon icon={faLocationDot} className="icon"/>Адрес</Link>
                    <Link to="password"><FontAwesomeIcon icon={faLock} className="icon" />Парола</Link>
                    <Link to="announced"><FontAwesomeIcon icon={faScroll} className="icon"/>Обяви</Link>
                    <Link to="interests"><FontAwesomeIcon icon={faMountainSun} className="icon"/>Интереси</Link>
                    <Link to="anothers"> <FontAwesomeIcon icon={faMountainSun} className="icon"/>Други</Link>
                </section>
                <div className="main-profile">
                    <section className="profile-data">
                        <div className="avatar">
                            <img src="/images/sign-up/avatar.jpg" alt="User avatar" />
                        </div>
                        <div className="user-data">
                            <h2>Профил</h2>
                            <p>Име: Юзер</p>
                            <p>Фамилия: Юзер</p>
                            <p>Телефон: +35659599589</p>
                            <p>Адрес: гр.София</p>
                            <p>Имейл: example@gmail.com</p>
                        </div>
                    </section>
                   <ProfileForm />
                   <ProfileData />
                   <ProfileAddress />
                    {/* <Outlet /> */}
                </div>
            </section>
                    
        </>
    )
}