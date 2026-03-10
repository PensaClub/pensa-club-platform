import { useTranslation } from 'react-i18next';
import './factCheckPartners.css';

const FactCheckPartners = () => {
  const { t } = useTranslation('factcheck');

  return (
    <section className="fcp">
      <div className="fcp-container">
        <div className="fcp-logos">
          <div className="fcp-logo-item">
            <img src="/images/partners/BFFW-20Logo-Prink2.svg" alt="Bulgarian Fund for Women" className="fcp-logo" />
            <span className="fcp-logo-label">{t('partners.bfjLabel')}</span>
          </div>
          <div className="fcp-divider"></div>
          <div className="fcp-logo-item">
            <img src="/images/homePage/logo.png" alt="Pensa Club" className="fcp-logo" />
            <span className="fcp-logo-label">{t('partners.pensaLabel')}</span>
          </div>
        </div>
        <p className="fcp-text">{t('partners.programText')}</p>
        <p className="fcp-disclaimer">{t('partners.disclaimer')}</p>
      </div>
    </section>
  );
};

export default FactCheckPartners;
