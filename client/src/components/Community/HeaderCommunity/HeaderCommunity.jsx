/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LocalizedLink as Link } from '../../LocalizedLink/LocalizedLink';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { localePath, stripLangFromPath } from '../../../utils/languageUtils';
import './headerCommunity.css';

export const HeaderCommunity = () => {
    const { i18n } = useTranslation();
    const navigate = useNavigate();
    const currentLanguage = i18n.language;

    const changeLanguage = async (lng) => {
        if (lng === i18n.language) return;
        const cleanPath = stripLangFromPath(window.location.pathname);
        const targetPath = localePath(cleanPath, lng);
        await i18n.changeLanguage(lng);
        navigate(targetPath, { replace: true });
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
