import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMapMarkedAlt,
  faNewspaper,
  faGraduationCap,
  faGamepad,
  faUserFriends,
  faHandsHelping,
  faBullseye,
  faEye,
  faLightbulb
} from '@fortawesome/free-solid-svg-icons';
import './aboutPlatform.css';

export const AboutPlatform = () => {
  const { t } = useTranslation();

  const platformFeatures = [
    { icon: faMapMarkedAlt, key: 'interactiveMap', color: '#3b82f6' },
    { icon: faNewspaper, key: 'announcements', color: '#10b981' },
    { icon: faGraduationCap, key: 'articles', color: '#f59e0b' },
    { icon: faUserFriends, key: 'clubsMap', color: '#ec4899' },
    { icon: faGamepad, key: 'games', color: '#8b5cf6' },
    { icon: faHandsHelping, key: 'mentorship', color: '#06b6d4' }
  ];

  const goals = [
    { icon: faBullseye, key: 'mission', color: '#3b82f6' },
    { icon: faEye, key: 'vision', color: '#10b981' },
    { icon: faLightbulb, key: 'goal', color: '#f59e0b' }
  ];

  return (
    <section className="aboutplatform-section">
      <div className="aboutplatform-container">
        {/* Header */}
        <div className="aboutplatform-header">
          <span className="aboutplatform-label">{t('about.platform.label')}</span>
          <h2 className="aboutplatform-title">{t('about.platform.title')}</h2>
          <p className="aboutplatform-description">
            {t('about.platform.description')}
          </p>
        </div>

        {/* Features Section */}
        <div className="aboutplatform-features-section">
          <h3 className="aboutplatform-section-title">
            {t('about.platform.featuresTitle')}
          </h3>

          <div className="aboutplatform-features-grid">
            {platformFeatures.map((feature, index) => (
              <div 
                key={feature.key} 
                className={`aboutplatform-feature-card aboutplatform-card-${index + 1}`}
              >
                <div 
                  className="aboutplatform-feature-icon"
                  style={{ background: `linear-gradient(135deg, ${feature.color}, ${feature.color}dd)` }}
                >
                  <FontAwesomeIcon icon={feature.icon} />
                </div>
                <div className="aboutplatform-feature-content">
                  <h4>{t(`about.platform.features.${feature.key}.title`)}</h4>
                  <p>{t(`about.platform.features.${feature.key}.description`)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Goals Section */}
        <div className="aboutplatform-goals-section">
          <div className="aboutplatform-goals-grid">
            {goals.map((goal) => (
              <div key={goal.key} className="aboutplatform-goal-card">
                <div 
                  className="aboutplatform-goal-icon-wrapper"
                  style={{ backgroundColor: `${goal.color}15` }}
                >
                  <div 
                    className="aboutplatform-goal-icon"
                    style={{ color: goal.color }}
                  >
                    <FontAwesomeIcon icon={goal.icon} />
                  </div>
                </div>
                <div className="aboutplatform-goal-content">
                  <h4>{t(`about.platform.${goal.key}.title`)}</h4>
                  <p>{t(`about.platform.${goal.key}.description`)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutPlatform;