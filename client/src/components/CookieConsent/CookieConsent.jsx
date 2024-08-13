import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCookies } from 'react-cookie';

import './cookieConsent.css'; 
import { useTranslation } from 'react-i18next';

export const CookieConsent = () => {
    const [cookies, setCookies] = useCookies(["cookieConsent"]);
    const [isVisible, setIsVisible] = useState(false);
    const { t } = useTranslation();
    const setCookieConsent = () => {
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 7); // валидност на бисквитката 7 дни
        setCookies("cookieConsent", true, { path: "/", expires: expirationDate });
        setIsVisible(false);
    };

    useEffect(() => {
        if (!cookies.cookieConsent) { // показва съобщението само ако няма съгласие
            const timeout = setTimeout(() => {
                setIsVisible(true);
            }, 3000);
            return () => clearTimeout(timeout);
        }
    }, [cookies.cookieConsent]);

    return isVisible ? (
        <div className={`cookie-consent ${isVisible ? 'show' : ''}`}>
            <div className="cookie-content">
                <img src="/icons/cookie-icon.svg" alt="Cookie Icon" className="cookie-icon" />
                <p>
                {t('cookieConsent.message')}{" "}
                    <Link to={"/privacy-policy"}>{t('cookieConsent.learnMore')}</Link>
                </p>
            </div>
            <button className="accept-button" onClick={setCookieConsent}>
            {t('cookieConsent.accept')}
            </button>
        </div>
    ) : null;
};
