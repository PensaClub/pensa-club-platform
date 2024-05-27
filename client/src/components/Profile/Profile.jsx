import { Link, Route, Routes } from 'react-router-dom';
import { ProfileData } from './ProfileData';
import ProfileForm from './ProfileForm';
import './profile.css'

export const Profile = () => {
    return (
        <>
             
            <section className="profile-section">
                <section className="account-menu">
                    <h3>Акаунт</h3>
                    <Link to="data">Лични данни</Link>
                    <Link to="address">Адрес</Link>
                    <Link to="password">Парола</Link>
                    <Link to="announced">Обяви</Link>
                    <Link to="interests">Интереси</Link>
                    <Link to="anothers">Други</Link>
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
                   <ProfileData />
                   <ProfileForm />
                    {/* <Outlet /> */}
                </div>
            </section>
                    
        </>
    )
}