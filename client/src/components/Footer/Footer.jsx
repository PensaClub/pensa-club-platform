import './footer.css'
import { useTranslation } from "react-i18next";

export const Footer = ({additionalClasses}) => {
    const {t} = useTranslation();

    return (
        <footer className={additionalClasses}>
            
            <section className="footer">
                <img src="/images/homePage/logo.png" alt="logo" />
                <div className="footer-links">
                    <h3>{t('footer.site-map')}</h3>
                    <p>{t('footer.communities')}</p>
                    <p>{t('footer.map')}</p>
                    <p>{t('footer.craigslist')}</p>
                </div>
                <div className="footer-links">
                    <h3>{t('footer.partners')}</h3>
                    <p>{t('footer.softuni')}</p>
                </div>
                <div className="footer-info">
                    <div className="second-info">
                        <img src="/images/homePage/logo.png" alt="logo" />
                        <h3>Pensa club &copy;</h3>
                    </div>
                    <div className="info-desc">
                    <p>{t('footer.country-city')}</p>
                
                    <p>{t('footer.street')}</p> 
                 
                    <p>{t('footer.phone')}</p> 
                    <p>{t('footer.email')}</p> 
                    </div>
                </div>
            </section>
            <section className='footer-privacy'>
                <p>{t('footer.privacy')}</p>
                <p>&copy; {t('footer.copyright')}</p>
            </section>
        </footer>

    );

}