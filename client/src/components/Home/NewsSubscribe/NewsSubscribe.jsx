import './newsSubscribe.css';
import { useRef, useState, useEffect } from 'react';
import { useTranslation } from "react-i18next";
import { useAuthContext } from '../../contexts/UserContext';
import { useCommunityContext } from '../../contexts/CommunityContext';
import ReCAPTCHA from "react-google-recaptcha";

export const NewsSubscribe = () => {
    const { t } = useTranslation();
    const { username: lsUsername, userEmail: lsEmail } = useAuthContext();
    const { subscribeNewUser } = useCommunityContext();
    const [userName, setUserName] = useState(lsUsername || "");
    const [userEmail, setUserEmail] = useState(lsEmail || "");
    const [errors, setErrors] = useState({ userEmail: '', userName: '' });
    const [showRecaptcha, setShowRecaptcha] = useState(false);
    const [recaptchaToken, setRecaptchaToken] = useState(null);
    const [recaptchaSize, setRecaptchaSize] = useState("normal");
    const [formFocus, setFormFocus] = useState({name: false, email: false});
    const sectionRef = useRef(null);

    useEffect(() => {
        const token = localStorage.getItem('recaptchaToken');
        if (token) {
            setRecaptchaToken(token);
        }
        
        const updateRecaptchaSize = () => {
            if (window.innerWidth <= 450) {
                setRecaptchaSize("compact");
            } else {
                setRecaptchaSize("normal");
            }
        };

        // Анимация при скролване
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    sectionRef.current.classList.add('visible');
                }
            },
            { threshold: 0.2 }
        );
        
        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        updateRecaptchaSize(); // Initial check
        window.addEventListener("resize", updateRecaptchaSize);

        return () => {
            window.removeEventListener("resize", updateRecaptchaSize);
            if (sectionRef.current) {
                observer.unobserve(sectionRef.current);
            }
        };
    }, []);

    const validateEmail = (email) => {
        const ve = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return ve.test(email);
    }

    const handleNameChange = (e) => {
        setUserName(e.target.value);
        if (e.target.value) {
            setErrors(prev => ({ ...prev, userName: "" }));
        }
    }

    const handleEmailChange = (e) => {
        setUserEmail(e.target.value);
        if (validateEmail(e.target.value)) {
            setErrors(prev => ({ ...prev, userEmail: "" }));
        }
    }

    const form = useRef();

    const sendEmail = async (e) => {
        e.preventDefault();

        let hasError = false;
        let newErrors = { userName: "", userEmail: "" };
        if (!userName) {
            newErrors.userName = "news-subscribe.errors.required-field";
            hasError = true;
        }
        if (!userEmail) {
            newErrors.userEmail = "news-subscribe.errors.required-field";
            hasError = true;
        } else if (!validateEmail(userEmail)) {
            newErrors.userEmail = "news-subscribe.errors.invalid-email";
            hasError = true;
        }

        if (hasError) {
            setErrors(newErrors);
            return;
        }

        if (!recaptchaToken) {
            setShowRecaptcha(true);
            return;
        }

        const response = await subscribeNewUser(userName, userEmail);

        if (response?.message === "Subscriber added successfully.") {
            localStorage.setItem('recaptchaToken', recaptchaToken);
            setShowRecaptcha(false);
            setRecaptchaToken(null);
        } else {
            setShowRecaptcha(true);
        }
    }

    const onRecaptchaChange = (token) => {
        setRecaptchaToken(token);
    }

    return (
        <section className="subscribe-modern" ref={sectionRef}>
            <div className="subscribe-background">
                <div className="bg-wave"></div>
                <div className="bg-shape shape1"></div>
                <div className="bg-shape shape2"></div>
                <div className="subscribe-pattern"></div>
            </div>
            
            <div className="subscribe-container">
                <div className="subscribe-header">
                    <h2 className="subscribe-title">
                        {t('news-subscribe.title')} 
                        <span className="highlight">Pensa club</span>
                    </h2>
                    <p className="subscribe-description">{t('news-subscribe.desc')}</p>
                </div>
                
                <div className="subscribe-form-container">
                    {showRecaptcha && (
                        <div className="recaptcha-wrapper">
                            <ReCAPTCHA
                                sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                                onChange={onRecaptchaChange}
                                size={recaptchaSize}
                            />
                        </div>
                    )}
                    
                    <form ref={form} onSubmit={sendEmail} className="subscribe-form">
                        <div className="form-fields">
                            <div className="form-group">
                                <div className={`input-wrapper ${formFocus.name ? 'focused' : ''} ${errors.userName ? 'error' : ''}`}>
                                    <div className="input-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                            <path fill="none" stroke="currentColor" strokeWidth="2" d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11ZM16 15H8C5.79086 15 4 16.7909 4 19V21H20V19C20 16.7909 18.2091 15 16 15Z"/>
                                        </svg>
                                    </div>
                                    <input 
                                        type="text" 
                                        name="user_name" 
                                        id="name" 
                                        placeholder={t('news-subscribe.name-placeholder')} 
                                        value={userName} 
                                        onChange={handleNameChange}
                                        onFocus={() => setFormFocus(prev => ({...prev, name: true}))}
                                        onBlur={() => setFormFocus(prev => ({...prev, name: false}))}
                                    />
                                </div>
                                {errors.userName && <div className="error-message">{t(`${errors.userName}`)}</div>}
                            </div>
                            
                            <div className="form-group">
                                <div className={`input-wrapper ${formFocus.email ? 'focused' : ''} ${errors.userEmail ? 'error' : ''}`}>
                                    <div className="input-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                            <path fill="none" stroke="currentColor" strokeWidth="2" d="M22 6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6M22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6M22 6L12 13L2 6"/>
                                        </svg>
                                    </div>
                                    <input 
                                        type="email" 
                                        name="user_email" 
                                        id="email" 
                                        placeholder={t('news-subscribe.email-placeholder')} 
                                        value={userEmail} 
                                        onChange={handleEmailChange}
                                        onFocus={() => setFormFocus(prev => ({...prev, email: true}))}
                                        onBlur={() => setFormFocus(prev => ({...prev, email: false}))}
                                    />
                                </div>
                                {errors.userEmail && <div className="error-message">{t(`${errors.userEmail}`)}</div>}
                            </div>
                        </div>
                        
                        <button type="submit" className="subscribe-button">
                            <span>{t('news-subscribe.subscribe-btn')}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                <path fill="none" stroke="currentColor" strokeWidth="2" d="M12 4L10.59 5.41L16.17 11H4V13H16.17L10.59 18.59L12 20L20 12L12 4Z"/>
                            </svg>
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
}