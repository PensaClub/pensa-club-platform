import { useTranslation } from 'react-i18next';
import './reActionLandingPartners.css';

const ReActionLandingPartners = () => {
    const { t } = useTranslation('reaction');

    return (
        <section className="ralp">
            <h2 className="ralp-title">{t('hub.partners.title', 'Партньори')}</h2>
            <div className="ralp-logos">
                <div className="ralp-partner">
                    <img
                        src="/images/partners/BFFW-20Logo-Prink2.svg"
                        alt="Български фонд за жените"
                        className="ralp-logo"
                    />
                    <span className="ralp-label">{t('partners.bffw', 'Български фонд за жените')}</span>
                </div>
                <div className="ralp-partner">
                    <img
                        src="/images/homePage/logo.png"
                        alt="Pensa Club"
                        className="ralp-logo"
                    />
                    <span className="ralp-label">{t('partners.pensa', 'Фондация ПЕНСА')}</span>
                </div>
            </div>
        </section>
    );
};

export default ReActionLandingPartners;
