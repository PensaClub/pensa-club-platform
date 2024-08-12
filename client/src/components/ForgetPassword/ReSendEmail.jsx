import { Link, useLocation } from 'react-router-dom';
import { useAuthContext } from '../contexts/UserContext';
import { useState, useEffect } from 'react';
import './forgetPassword.css';
import { useTranslation } from 'react-i18next';

export const ReSendEmail = () => {
    const location = useLocation();
    const { t } = useTranslation();
    const { email } = location.state || {};
    const { onForgetPasswordSubmit } = useAuthContext();
    const [attempts, setAttempts] = useState(() => Number(localStorage.getItem('attempts')) || 0);
    const [timer, setTimer] = useState(() => Number(localStorage.getItem('timer')) || 0);
    const [isLocked, setIsLocked] = useState(() => {
        const savedAttempts = Number(localStorage.getItem('attempts')) || 0;
        return savedAttempts > 0;
    });

    useEffect(() => {
        let interval;
        if (isLocked) {
            interval = setInterval(() => {
                setTimer((prevTimer) => {
                    if (prevTimer > 0) {
                        localStorage.setItem('timer', prevTimer - 1);
                        return prevTimer - 1;
                    } else {
                        setIsLocked(false);
                        localStorage.removeItem('timer');
                        localStorage.removeItem('attempts');
                        clearInterval(interval);
                        return 0;
                    }
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isLocked]);

    useEffect(() => {
        if (attempts > 0 && attempts < 3) {
            setIsLocked(true);
            setTimer(60);
            localStorage.setItem('timer', 60);
        } else if (attempts >= 3) {
            setIsLocked(true);
            setTimer(15 * 60); // 15 minutes after the third attempt
            localStorage.setItem('timer', 15 * 60);
        }
        localStorage.setItem('attempts', attempts);
    }, [attempts]);

    const handleResendEmail = async () => {
        if (!isLocked && email) {
            await onForgetPasswordSubmit({ email });
            setAttempts((prevAttempts) => prevAttempts + 1);
        }
    };

    return (
        <>
            <section className="forget-pass">
                <div className="forget-pass-container">
                    <h2>{t('form.check-email')}</h2>
                    <p>{t('form.reset-password-link')}</p>
                    {email && <p><span>{t("form.email-label")}: {email}</span></p>}
                    <p>{t('form.resend-email-simple-text')}</p>
                    <button className='forget-resend-btn' type="submit" onClick={handleResendEmail} disabled={isLocked}>
                        {t('form.resend-button-text')}
                    </button>
                    {isLocked && attempts < 3  && (
                            <p className='wait-message'>
                              ({t('form.wait')} {Math.floor(timer / 60)}:
                              {timer % 60 < 10 ? '0' : ''}
                              {timer % 60} {t('form.minutes')})
                            </p>
                    )}
                    {isLocked && attempts >= 3 && <p>{t('form.too-many-attempts')} {Math.floor(timer / 60)} {t('form.minutes')} {t('form.and')} {timer % 60} {t('form.seconds')}.</p>}
                    
                    <Link to="/sign-up">{t('form.back-to-login')}</Link>
                </div>
                <div className="logo-forget-pass">
                    <Link to="/">
                        <img src="/images/homePage/logo.png" alt="logo" className='logo-reset-pass' />Penca Club&copy; 
                    </Link>
                </div>
            </section>
        </>
    );
}
