import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faUsers, faRocket } from '@fortawesome/free-solid-svg-icons';
import './aboutHero.css';

export const AboutHero = () => {
  const { t } = useTranslation('home');

  return (
    <section className="abouthero-section">
      <div className="abouthero-container">
        <div className="abouthero-content-wrapper">
          
          {/* Ляво - Снимки колаж */}
          <div className="abouthero-images-grid">
            <div className="abouthero-image-item abouthero-image-circle-large">
              <img src="/images/about/seniors-group-1.jpg" alt="Happy seniors" />
            </div>

            <div className="abouthero-image-item abouthero-image-rounded-top">
              <img src="/images/about/seniors-group-2.jpg" alt="Active seniors" />
            </div>

            <div className="abouthero-image-item abouthero-image-rounded-bottom">
              <img src="/images/about/seniors-group-3.jpg" alt="Community" />
            </div>

            <div className="abouthero-image-item abouthero-image-circle-small">
              <img src="/images/about/seniors-group-4.jpg" alt="Support" />
            </div>
          </div>

          {/* Дясно - Текстово съдържание */}
          <div className="abouthero-text-content">
            <div className="abouthero-badge">
              <FontAwesomeIcon icon={faHeart} />
              <span>{t('about.hero.badge')}</span>
            </div>

            <h1 className="abouthero-title">
              {t('about.hero.title')}
            </h1>

            <p className="abouthero-subtitle">
              {t('about.hero.subtitle')}
            </p>
          </div>

        </div>

        {/* Долни карти с информация */}
        <div className="abouthero-stats">
          <div className="abouthero-stat-item">
            <div className="abouthero-stat-icon">
              <FontAwesomeIcon icon={faUsers} />
            </div>
            <div className="abouthero-stat-content">
              <h3>{t('about.hero.stats.community')}</h3>
              <p>{t('about.hero.stats.communityDesc')}</p>
            </div>
          </div>

          <div className="abouthero-stat-item">
            <div className="abouthero-stat-icon">
              <FontAwesomeIcon icon={faRocket} />
            </div>
            <div className="abouthero-stat-content">
              <h3>{t('about.hero.stats.innovation')}</h3>
              <p>{t('about.hero.stats.innovationDesc')}</p>
            </div>
          </div>

          <div className="abouthero-stat-item">
            <div className="abouthero-stat-icon">
              <FontAwesomeIcon icon={faHeart} />
            </div>
            <div className="abouthero-stat-content">
              <h3>{t('about.hero.stats.support')}</h3>
              <p>{t('about.hero.stats.supportDesc')}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutHero;