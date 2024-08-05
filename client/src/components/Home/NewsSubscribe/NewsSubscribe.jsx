import './newsSubscribe.css'

import { useRef, useState } from 'react'
import { useTranslation } from "react-i18next";
import { useAuthContext } from '../../contexts/UserContext';
import { useCommunityContext } from '../../contexts/CommunityContext';

export const NewsSubscribe = () => {
    const { t } = useTranslation();
    const {username: lsUsername, userEmail: lsEmail} = useAuthContext();
    const {subscribeNewUser} = useCommunityContext();
    const [userName, setUserName] = useState(lsUsername ||"");
    const [userEmail, setUserEmail] = useState(lsEmail || "");
    const [errors, setErrors] = useState({ userEmail: '', userName: '' })

    const validateEmail = (email) => {
        const ve = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return ve.test(email);
    }

    const handleNameChange = (e) => {
        setUserName(e.target.value)
        if (e.target.value) {
            setErrors(prev => ({ ...prev, userName: "" }))
        }
    }
    const handleEmailChange = (e) => {
        setUserEmail(e.target.value)
        if (validateEmail(e.target.value)) {
            setErrors(prev => ({ ...prev, userEmail: "" }))
        }
    }
    const form = useRef()
    const sendEmail = (e) => {
        e.preventDefault()
        let hasError = false;
        let newErrors = { userName: "", userEmail: "" }
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

        subscribeNewUser(userName, userEmail);
    }
    return (
        <>

            <section className="subscribe-news">
                <div className="single-subscribe-info">
                    <h3>{t('news-subscribe.title')} <span>Pensa club</span></h3>
                    <p>{t('news-subscribe.desc')}</p>
                </div>
                <form ref={form} onSubmit={sendEmail} className="news-form mb-lg-0">
                    <div className="form-row">
                        <div className="col-subscribe ">
                            <div className="error-username">
                                <input type="text" name="user_name" className="input" id="name" placeholder={t('news-subscribe.name-placeholder')} value={userName} onChange={handleNameChange} />
                                {errors.userName && <div className="error-message">{t(`${errors.userName}`)}</div>}
                            </div>
                            <div className="error-email">
                                <input type="email" className="input" name="user_email" id="email" placeholder={t('news-subscribe.email-placeholder')} value={userEmail} onChange={handleEmailChange} />
                                {errors.userEmail && <div className="error-message">{t(`${errors.userEmail}`)}</div>}
                            </div>
                        </div>
                    </div>
                    <div className="news-btn">
                        <button type="submit" className="btn-general btn-green" id="btn-subscribe">{t('news-subscribe.subscribe-btn')}</button>
                    </div>
                </form>

            </section>
        </>
    )

}