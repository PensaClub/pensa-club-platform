import { Link } from 'react-router-dom'

import './motto.css'

export const MottoSection = () => {

    return (
        <>
            <section className="motto-section">
                <div className="motto-desc">
                    <img src="/images/homePage/logo.png" alt="logo" />
                    <div className="motto-info">
                        <h3>ДА ПРЕЧУПИМ ТАЗИ ТЕНДЕНЦИЯ </h3>
                        <h3>ДА СМЕНИМ ТОЗИ МОДЕЛ </h3>
                        <h3>ДА БЪДЕМ В КРАК С ВРЕМЕТО  </h3>
                        <p><span> Създаване на иновативна, дигитална и интерактивна платформа, насочена към подобряване на качеството на живот на възрастните хора, като ги включи активно в съвременното общество, подкрепи ги в развитието на нови умения и интереси и насърчи здравословния и пълноценен, достоен живот.</span></p>
                    </div>
                    <Link to="/#" className="btn-general btn-orange" id="btn-join">Прочетете повече</Link> {/*трябва да води към about page*/}
                </div>
            </section>
        </>
    )
}