/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import { LocalizedLink as Link } from '../../LocalizedLink/LocalizedLink';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import './headerCommunity.css';

export const HeaderCommunity = () => {
    const { i18n } = useTranslation();
    const currentLanguage = i18n.language;

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <>
            <header className="header-community">
                <div className="header-community-logo">
                    <Link to="/">
                        <img src="/images/homePage/logo-2.png" alt="logo" className="logo" />{' '}
                        Pensa Club
                    </Link>
                </div>
                <div className="actions-container">
                    <div className="plus-icon-container">
                        <Link to="/ad/create">
                            <FontAwesomeIcon icon={faPlus} className="plus-icon" />
                        </Link>
                    </div>
                    <div className="language-container">
                        {currentLanguage !== 'bg' && (
                            <button onClick={() => changeLanguage('bg')} className="language-button-community">
                                <img src="/icons/bulgaria-flag-icon.svg" alt="Bulgarian" className="flag-icon" />
                            </button>
                        )}
                        {currentLanguage !== 'en' && (
                            <button onClick={() => changeLanguage('en')} className="language-button-community">
                                <img src="/icons/united-kingdom-flag-icon.svg" alt="English" className="flag-icon" />
                            </button>
                        )}
                    </div>
                </div>
            </header>
        </>
    );
};
