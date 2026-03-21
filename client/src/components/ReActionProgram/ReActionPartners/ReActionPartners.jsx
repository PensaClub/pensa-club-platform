import { useTranslation } from 'react-i18next';
import './reActionPartners.css';

const ReActionPartners = () => {
  const { t, i18n } = useTranslation('reaction');
  const lang = i18n.language;

  const bfwLogo = lang === 'bg'
      ? '/images/BFW%20LOGO/BG-FULL%20LOGO/BFFW-FullLogo-Prink.png'
      : '/images/BFW%20LOGO/ENG-FULL%20LOGO/BFFW-FullLogo-Pink-ENG.png';

  const euLogoH = lang === 'bg'
      ? '/images/EU%20LOGO/co-funded_BG/horizontal/BG_Co-fundedbytheEU_RGB_POS.png'
      : '/images/EU%20LOGO/co-funded_EN/horizontal/EN_Co-fundedbytheEU_RGB_POS.png';

  const euLogoV = euLogoH;

  return (
    <section className="rapart">
      <div className="rapart-container">
        <div className="rapart-logos">
          <div className="rapart-logo-item">
            <img src={bfwLogo} alt="Bulgarian Fund for Women" className="rapart-logo" />
            <span className="rapart-logo-label">{t('partners.bfwLabel', 'Български фонд за жените')}</span>
          </div>
          <div className="rapart-divider"></div>
          <div className="rapart-logo-item">
            <picture>
              <source media="(max-width: 480px)" srcSet={euLogoV} />
              <img src={euLogoH} alt="Co-funded by the European Union" className="rapart-logo" />
            </picture>
            <span className="rapart-logo-label">{t('partners.euLabel', 'Съфинансирано от ЕС')}</span>
          </div>
          <div className="rapart-divider"></div>
          <div className="rapart-logo-item">
            <img src="/images/homePage/logo.png" alt="Pensa Club" className="rapart-logo" />
            <span className="rapart-logo-label">{t('partners.pensaLabel', 'Фондация ПЕНСА')}</span>
          </div>
        </div>
        <p className="rapart-disclaimer">{t('partners.euDisclaimer')}</p>
      </div>
    </section>
  );
};

export default ReActionPartners;
