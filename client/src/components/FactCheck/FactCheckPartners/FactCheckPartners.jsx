import { useTranslation } from 'react-i18next';
import './factCheckPartners.css';

const FactCheckPartners = () => {
  const { t, i18n } = useTranslation('factcheck');
  const lang = i18n.language;

  const bfwLogo = lang === 'bg'
      ? '/images/BFW%20LOGO/BG-FULL%20LOGO/BFFW-FullLogo-Prink.png'
      : '/images/BFW%20LOGO/ENG-FULL%20LOGO/BFFW-FullLogo-Pink-ENG.png';

  const euLogo = lang === 'bg'
      ? '/images/EU%20LOGO/co-funded_BG/horizontal/BG_Co-fundedbytheEU_RGB_POS.png'
      : '/images/EU%20LOGO/co-funded_EN/horizontal/EN_Co-fundedbytheEU_RGB_POS.png';

  return (
    <section className="fcp">
      <div className="fcp-container">
        <div className="fcp-logos">
          <div className="fcp-logo-item">
            <img src={bfwLogo} alt="Bulgarian Fund for Women" className="fcp-logo" />
            <span className="fcp-logo-label">{t('partners.bfwLabel', 'Български фонд за жените')}</span>
          </div>
          <div className="fcp-divider"></div>
          <div className="fcp-logo-item">
            <img src={euLogo} alt="Co-funded by the European Union" className="fcp-logo" />
            <span className="fcp-logo-label">{t('partners.euLabel', 'Съфинансирано от ЕС')}</span>
          </div>
          <div className="fcp-divider"></div>
          <div className="fcp-logo-item">
            <img src="/images/homePage/logo.png" alt="Pensa Club" className="fcp-logo" />
            <span className="fcp-logo-label">{t('partners.pensaLabel', 'Фондация ПЕНСА')}</span>
          </div>
        </div>
        <p className="fcp-text">{t('partners.disclaimer')}</p>
        <p className="fcp-disclaimer">{t('partners.euDisclaimer')}</p>
      </div>
    </section>
  );
};

export default FactCheckPartners;
