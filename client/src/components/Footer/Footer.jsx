import './footer.css'
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useAuthContext } from '../contexts/UserContext';

export const Footer = ({ additionalClasses }) => {
    const { t } = useTranslation();
    const { isAuthentication } = useAuthContext();
    return (
        <footer className={additionalClasses}>

            <section className="footer">
                <img src="/images/homePage/logo-2.png" alt="logo" />
                <div className="footer-links">
                    <h3>{t('footer.site-map')}</h3>
                    <p><Link to="/map">{t('footer.map')}</Link></p>
                    <p><Link to="/craigslist">{t('footer.craigslist')}</Link></p>
                    {isAuthentication && (<p><Link to="/ad/create">{t('footer.add-ad')}</Link></p>)}
                    <p><Link to="/contact">{t('footer.contact')}</Link></p>

                </div>
                <div className="footer-links">
                    <h3>{t('footer.partners')}</h3>
                    <p><Link to={"https://buditel.softuni.bg/"} target="_blank">{t('footer.softuni_buditel')}</Link></p>
                    <p><Link to={"https://costeffective.software/"} target="_blank">Cost-Effective Solutions</Link></p>
                    <p><Link to={"https://softuni.bg/"} target="_blank">{t('footer.softuni')}</Link></p>
                </div>
                <div className="footer-info">
                    <div className="second-info">
                        <img src="/images/homePage/logo-2.png" alt="logo" />
                        <h3 onClick={()=>window.scrollTo({ top: 0 })}>Pensa club &copy;</h3>
                    </div>
                    <div className="info-desc">
                        <p>{t('footer.financial')}: <Link to={"https://bg.usembassy.gov/education-culture/grant-opportunities/"}target="_blank">Small Grants US Embassy</Link></p>
                        <p>{t('footer.country-city')}</p>

                        <p>{t('footer.email')}</p>
                    </div>
                </div>
            </section>
            <section className='footer-privacy'>
                <p><Link to="/privacy-policy">{t('footer.privacy')}</Link></p>
                <p>&copy; {t('footer.copyright')}</p>
            </section>
        </footer>

    );

}