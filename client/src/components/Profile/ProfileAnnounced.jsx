import React from 'react';
import './profile.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot, faPhone, faEnvelope, faSheetPlastic } from '@fortawesome/free-solid-svg-icons';

export const ProfileAnnounced = () => {
    return (
        <div className="announced">
            <section className="profile-data">
                <div className="avatar-announced">
                    <img src="/images/sign-up/avatar.jpg" alt="User avatar" />
                </div>
                <div className="user-data">
                    <h2>Обява 1</h2>
                    <p><FontAwesomeIcon icon={faSheetPlastic} className="icon" /> Име на обява</p>
                    <p><FontAwesomeIcon icon={faPhone} className="icon" /> +35659599589</p>
                    <p><FontAwesomeIcon icon={faLocationDot} className="icon" /> гр.София</p>
                    <p><FontAwesomeIcon icon={faEnvelope} className="icon" /> example@gmail.com</p>
                </div>
            </section>

            <section className="profile-data">
                <div className="avatar-announced">
                    <img src="/images/sign-up/avatar.jpg" alt="User avatar" />
                </div>
                <div className="user-data">
                    <h2>Обява 2</h2>
                    <p><FontAwesomeIcon icon={faSheetPlastic} className="icon" /> Име на обява</p>
                    <p><FontAwesomeIcon icon={faPhone} className="icon" /> +35659599589</p>
                    <p><FontAwesomeIcon icon={faLocationDot} className="icon" /> гр.София</p>
                    <p><FontAwesomeIcon icon={faEnvelope} className="icon" /> example@gmail.com</p>
                </div>
            </section>
        </div>
    );
}
