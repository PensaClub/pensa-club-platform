import { useTranslation } from 'react-i18next';
import './reActionPartners.css';

const ReActionPartners = () => {
  const { t } = useTranslation('reaction');

  return (
    <section className="rapart">
      <div className="rapart-container">
        <div className="rapart-logos">
          <div className="rapart-logo-item">
            <img src="/images/partners/BFFW-20Logo-Prink2.svg" alt="Bulgarian Fund for Women" className="rapart-logo" />
            <span className="rapart-logo-label">{t('partners.bfjLabel')}</span>
          </div>
          <div className="rapart-divider"></div>
          <div className="rapart-logo-item">
            <img src="/images/homePage/logo.png" alt="Pensa Club" className="rapart-logo" />
            <span className="rapart-logo-label">{t('partners.pensaLabel')}</span>
          </div>
        </div>
        <p className="rapart-text">{t('partners.programText')}</p>
        <p className="rapart-disclaimer">{t('partners.disclaimer')}</p>
      </div>
    </section>
  );
};

export default ReActionPartners;
