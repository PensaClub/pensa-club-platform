import { useTranslation } from 'react-i18next';
import './reActionLandingPartners.css';

const ReActionLandingPartners = () => {
    const { t, i18n } = useTranslation('reaction');
    const lang = i18n.language;

    const bfwLogo = lang === 'bg'
        ? '/images/BFW%20LOGO/BG-FULL%20LOGO/BFFW-FullLogo-Prink.png'
        : '/images/BFW%20LOGO/ENG-FULL%20LOGO/BFFW-FullLogo-Pink-ENG.png';

    const euLogo = lang === 'bg'
        ? '/images/EU%20LOGO/co-funded_BG/horizontal/BG_Co-fundedbytheEU_RGB_POS.png'
        : '/images/EU%20LOGO/co-funded_EN/horizontal/EN_Co-fundedbytheEU_RGB_POS.png';

    return (
        <section className="ralp">
            <h2 className="ralp-title">{t('hub.partners.title', 'Партньори')}</h2>
            <div className="ralp-logos">
                <div className="ralp-partner">
                    <img
                        src={bfwLogo}
                        alt={t('partners.bfwLabel', 'Български фонд за жените')}
                        className="ralp-logo"
                    />
                    <span className="ralp-label">{t('partners.bfwLabel', 'Български фонд за жените')}</span>
                </div>
                <div className="ralp-partner">
                    <img
                        src={euLogo}
                        alt={t('partners.euLabel', 'Съфинансирано от ЕС')}
                        className="ralp-logo"
                    />
                    <span className="ralp-label">{t('partners.euLabel', 'Съфинансирано от ЕС')}</span>
                </div>
                <div className="ralp-partner">
                    <img
                        src="/images/homePage/logo.png"
                        alt={t('partners.pensaLabel', 'Сдружение ПЕНСА')}
                        className="ralp-logo"
                    />
                    <span className="ralp-label">{t('partners.pensaLabel', 'Сдружение ПЕНСА')}</span>
                </div>
            </div>
            <p className="ralp-disclaimer">{t('partners.euDisclaimer')}</p>
        </section>
    );
};

export default ReActionLandingPartners;
