import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHandshake,
  faAward,
  faShieldAlt,
  faHeart,
  faBalanceScale
} from '@fortawesome/free-solid-svg-icons';
import './aboutFoundation.css';

export const AboutFoundation = () => {
  const { t } = useTranslation();

  const foundationValues = [
    { icon: faHandshake, key: 'community' },
    { icon: faAward, key: 'quality' },
    { icon: faShieldAlt, key: 'trust' },
    { icon: faHeart, key: 'care' }
  ];

  return (
    <section className="aboutfoundation-section">
      <div className="aboutfoundation-container">
        <div className="aboutfoundation-header">
          <span className="aboutfoundation-label">{t('about.foundation.label')}</span>
          <h2 className="aboutfoundation-title">{t('about.foundation.title')}</h2>
          <p className="aboutfoundation-description">
            {t('about.foundation.description')}
          </p>
          
          {/* Nonprofit Info Box */}
          <div className="aboutfoundation-legal-info">
            <FontAwesomeIcon icon={faBalanceScale} className="aboutfoundation-legal-icon" />
            <div className="aboutfoundation-legal-text">
              <span className="aboutfoundation-legal-status">{t('about.foundation.legalStatus')}</span>
              <span className="aboutfoundation-legal-eik">{t('about.foundation.eik')}: 208034387</span>
            </div>
          </div>
        </div>

        <div className="aboutfoundation-content">
          <div className="aboutfoundation-mission">
            <h3>{t('about.foundation.missionTitle')}</h3>
            <p>{t('about.foundation.missionText')}</p>
          </div>

          <div className="aboutfoundation-values">
            <h3>{t('about.foundation.valuesTitle')}</h3>
            <div className="aboutfoundation-values-grid">
              {foundationValues.map((value) => (
                <div key={value.key} className="aboutfoundation-value-card">
                  <div className="aboutfoundation-value-icon">
                    <FontAwesomeIcon icon={value.icon} />
                  </div>
                  <h4>{t(`about.foundation.values.${value.key}.title`)}</h4>
                  <p>{t(`about.foundation.values.${value.key}.description`)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutFoundation;