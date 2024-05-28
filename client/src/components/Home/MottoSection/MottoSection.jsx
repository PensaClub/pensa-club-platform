import { Link } from 'react-router-dom'

import './motto.css'

import {Link} from 'react-router-dom'
import { useTranslation } from "react-i18next";


export const MottoSection = () => {
    const {t} = useTranslation();

    return (
        <>
            <section className="motto-section">
                <div className="motto-desc">
                    <img src="/images/homePage/logo.png" alt="logo" />
                    <div className="motto-info">
                        <h3>ДА ПРЕЧУПИМ ТАЗИ ТЕНДЕНЦИЯ </h3>
                        <h3>ДА СМЕНИМ ТОЗИ МОДЕЛ </h3>
                        <h3>ДА БЪДЕМ В КРАК С ВРЕМЕТО  </h3>
                        <p> Създаване на иновативна, дигитална и <span>интерактивна платформа</span>, насочена към подобряване на качеството на живот на възрастните хора, като ги включи активно в съвременното общество, подкрепи ги в развитието на нови умения и интереси и насърчи <span>здравословния</span> и <span>пълноценен</span>, достоен живот.</p>
                    </div>
                    <Link to="/#"className="btn-general btn-orange" id="btn-join">{t('motto.about-btn')}</Link> {/*трябва да води към about page*/}
                </div>
            </section>
        </>
    )
}