import React from 'react';
import './profile.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot, faPhone, faEnvelope, faSheetPlastic } from '@fortawesome/free-solid-svg-icons';

export const ProfileAnnounced = () => {
    return (
        <>
        <div className='announced'>
            <p className='view-more'>виж повече</p>
            <section className='profile-data ads'>
                <div className='avatar-announced'>
                    <img src="/images/sign-up/avatar.jpg" alt="User avatar" />
                    <p>продавам</p>
                </div>
                <div className='user-data user-data-ads'>
                    <h3>Обява 1</h3>
                    <div className='ads-elipse'>
                    <p className='elipse'>мебели</p>
                    <p className='elipse'>София</p>
                    <p className='elipse'>юни </p>
                    </div>
                    <p>Валидна до: 01 юни 2025</p>
                    <div className='ads-btns'>
                    <button className='ads-btn red'>Редактирай</button>
                    <button className='ads-btn green'>Изтрий</button>
                    </div>
                </div>
            </section>
</div>
            <div className='announced'>
            <p className='view-more'>виж повече</p>
            <section className='profile-data ads'>
                <div className='avatar-announced'>
                    <img src="/images/sign-up/avatar.jpg" alt="User avatar" />
                    <p>продавам</p>
                </div>
                <div className='user-data user-data-ads'>
                    <h3>Обява 1</h3>
                    <div className='ads-elipse'>
                    <p className='elipse'>мебели</p>
                    <p className='elipse'>София</p>
                    <p className='elipse'>юни </p>
                    </div>
                    <p>Валидна до: 01 юни 2025</p>
                    <div className='ads-btns'>
                    <button className='ads-btn red'>Редактирай</button>
                    <button className='ads-btn green'>Изтрий</button>
                    </div>
                </div>
            </section>
            
        </div>
        </>
    );
}
