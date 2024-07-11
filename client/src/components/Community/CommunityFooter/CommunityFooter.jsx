import { useTranslation } from "react-i18next";
import { MenuCommunity } from "../MenuCommunity/MenuCommunity";
import "./communityFooter.css";

export const CommunityFooter = () => {
    const {t} = useTranslation();

    return (
        <>
        {/* <footer className="footer-com-fix">
            <div className="footer-menu">
            <section className='footer-privacy-commun'>
                <p>{t('footer.privacy')}</p>
                <p>&copy; {t('footer.copyright')}</p>
            </section>
            </div>
        </footer>
        <MenuCommunity/> */}

        </>
    )
}