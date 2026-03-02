import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHandHoldingHeart,
  faHome,
  faShoppingCart,
  faUsers,
  faUserFriends,
  faBrain,
  faSmile,
  faHeart,
  faLeaf,
  faBookReader,
  faGamepad,
  faPuzzlePiece,
  faHandsHelping,
  faEye,
  faVolumeUp,
  faWheelchair,
  faUniversalAccess,
  faMobile,
  faEnvelope,
  faCalendarAlt,
  faClock,
  faMapMarkerAlt,
  faInfoCircle,
  faCheckCircle,
  faTimes,
  faGraduationCap,
  faChild,
  faUserPlus,
  faLightbulb,
  faThumbsUp
} from '@fortawesome/free-solid-svg-icons';
import './wellnessServices.css';

export const WellnessServices = ({ club }) => {
  const { t } = useTranslation('clubs');
  const [activeCategory, setActiveCategory] = useState('support');

  if (!club?.pensionersSpecific?.supportServices && 
      !club?.pensionersSpecific?.specialPrograms && 
      !club?.pensionersSpecific?.accessibility &&
      !club?.pensionersSpecific?.ageSpecificNeeds) {
    return null;
  }

  const pensionersSpecific = club.pensionersSpecific || {};
  const supportServices = pensionersSpecific.supportServices || {};
  const specialPrograms = pensionersSpecific.specialPrograms || {};
  const accessibility = pensionersSpecific.accessibility || {};
  const ageSpecificNeeds = pensionersSpecific.ageSpecificNeeds || {};
  const contacts = club.contacts || {};

  const availableSupport = Object.entries(supportServices)
    .filter(([key, value]) => value === true)
    .map(([key]) => key);

  const mentalHealthSupport = specialPrograms.mentalHealthSupport || [];
  const memoryActivities = specialPrograms.memoryActivities || [];
  const intergenerationalPrograms = specialPrograms.intergenerationalPrograms || [];
  const volunteerPrograms = specialPrograms.volunteerPrograms || [];

  const availableAccessibility = Object.entries(accessibility)
    .filter(([key, value]) => value === true)
    .map(([key]) => key);

  const socialIsolationPrevention = ageSpecificNeeds.socialIsolationPrevention || [];
  const cognitiveStimulation = ageSpecificNeeds.cognitiveStimulation || [];

  if (availableSupport.length === 0 && 
      mentalHealthSupport.length === 0 && 
      memoryActivities.length === 0 && 
      intergenerationalPrograms.length === 0 &&
      availableAccessibility.length === 0 &&
      socialIsolationPrevention.length === 0 &&
      cognitiveStimulation.length === 0 &&
      volunteerPrograms.length === 0) {
    return null;
  }

  const getWellnessCategories = () => [
    { 
      key: 'support', 
      label: t('clubs.WellnessServices.categories.support'), 
      icon: faHandHoldingHeart,
      count: availableSupport.length
    },
    { 
      key: 'mental', 
      label: t('clubs.WellnessServices.categories.mental'), 
      icon: faBrain,
      count: mentalHealthSupport.length + memoryActivities.length
    },
    { 
      key: 'social', 
      label: t('clubs.WellnessServices.categories.social'), 
      icon: faUsers,
      count: intergenerationalPrograms.length + socialIsolationPrevention.length + volunteerPrograms.length
    },
    { 
      key: 'accessibility', 
      label: t('clubs.WellnessServices.categories.accessibility'), 
      icon: faUniversalAccess,
      count: availableAccessibility.length
    },
    { 
      key: 'cognitive', 
      label: t('clubs.WellnessServices.categories.cognitive'), 
      icon: faLightbulb,
      count: cognitiveStimulation.length
    }
  ].filter(category => category.count > 0);

  const wellnessCategories = getWellnessCategories();

  const getFrequencyText = (frequency) => {
    if (!frequency) return '';
    const freq = frequency.toLowerCase();
    const frequencyMap = t('clubs.WellnessServices.frequencies', { returnObjects: true });
    
    for (const [key, terms] of Object.entries(frequencyMap)) {
      if (terms.some(term => freq.includes(term))) {
        return t(`clubs.WellnessServices.frequencyLabels.${key}`);
      }
    }
    return frequency;
  };

  const getSupportServiceLabel = (serviceKey) => {
    return t(`clubs.WellnessServices.supportServiceLabels.${serviceKey}`, serviceKey);
  };

  const getAccessibilityLabel = (accessKey) => {
    return t(`clubs.WellnessServices.accessibilityLabels.${accessKey}`, accessKey);
  };

  const getServiceCountText = (count) => {
    return count === 1 ? t('clubs.WellnessServices.serviceCount.single') : t('clubs.WellnessServices.serviceCount.plural');
  };

  return (
    <section id="wellness-services" className="wellness-services-section">
      <div className="wellness-services-container">
        
        <div className="wellness-services-header">
          <div className="wellness-services-badge">
            <FontAwesomeIcon icon={faHandHoldingHeart} />
            <span>{t('clubs.WellnessServices.header.badge')}</span>
          </div>
          <h2 className="wellness-services-title">
            {t('clubs.WellnessServices.header.title')}
          </h2>
          <p className="wellness-services-subtitle">
            {t('clubs.WellnessServices.header.subtitle')}
          </p>
        </div>

        {wellnessCategories.length > 0 && (
          <div className="wellness-services-overview">
            {wellnessCategories.map((category, index) => (
              <div 
                key={category.key} 
                className="wellness-services-overview-card"
                style={{ '--category-delay': `${index * 0.1}s` }}
                onClick={() => setActiveCategory(category.key)}
              >
                <div className="wellness-services-overview-icon">
                  <FontAwesomeIcon icon={category.icon} />
                </div>
                <div className="wellness-services-overview-content">
                  <h4>{category.label}</h4>
                  <div className="wellness-services-overview-count">
                    {category.count} {getServiceCountText(category.count)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="wellness-services-nav">
          {wellnessCategories.map(category => (
            <button
              key={category.key}
              onClick={() => setActiveCategory(category.key)}
              className={`wellness-services-nav-btn ${activeCategory === category.key ? 'active' : ''}`}
            >
              <FontAwesomeIcon icon={category.icon} />
              <span>{category.label}</span>
              <div className="wellness-services-nav-count">{category.count}</div>
            </button>
          ))}
        </div>

        <div className="wellness-services-content">
          
          {activeCategory === 'support' && availableSupport.length > 0 && (
            <div className="wellness-services-support">
              <div className="wellness-services-support-header">
                <h3>{t('clubs.WellnessServices.supportTab.title')}</h3>
                <p>{t('clubs.WellnessServices.supportTab.subtitle')}</p>
              </div>
              
              <div className="wellness-services-support-list">
                {availableSupport.map((serviceKey, index) => (
                  <div key={serviceKey} className="wellness-services-support-item">
                    <FontAwesomeIcon icon={faCheckCircle} />
                    <span>{getSupportServiceLabel(serviceKey)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeCategory === 'mental' && (mentalHealthSupport.length > 0 || memoryActivities.length > 0) && (
            <div className="wellness-services-mental">
              <div className="wellness-services-mental-header">
                <h3>{t('clubs.WellnessServices.mentalTab.title')}</h3>
                <p>{t('clubs.WellnessServices.mentalTab.subtitle')}</p>
              </div>
              
              {mentalHealthSupport.length > 0 && (
                <div className="wellness-services-mental-section">
                  <h4>
                    <FontAwesomeIcon icon={faHeart} />
                    {t('clubs.WellnessServices.mentalTab.psychologicalSupport')}
                  </h4>
                  <div className="wellness-services-mental-grid">
                    {mentalHealthSupport.map((support, index) => (
                      <div key={index} className="wellness-services-mental-card">
                        <div className="wellness-services-mental-icon">
                          <FontAwesomeIcon icon={faBrain} />
                        </div>
                        <div className="wellness-services-mental-content">
                          {support.type && <h5>{support.type}</h5>}
                          <div className="wellness-services-mental-details">
                            {support.frequency && (
                              <div className="wellness-services-mental-detail">
                                <FontAwesomeIcon icon={faCalendarAlt} />
                                <span>{getFrequencyText(support.frequency)}</span>
                              </div>
                            )}
                            {support.therapist && (
                              <div className="wellness-services-mental-detail">
                                <FontAwesomeIcon icon={faUserFriends} />
                                <span>{support.therapist}</span>
                              </div>
                            )}
                            {support.participants && (
                              <div className="wellness-services-mental-detail">
                                <FontAwesomeIcon icon={faUsers} />
                                <span>{t('clubs.WellnessServices.participants', { count: support.participants })}</span>
                              </div>
                            )}
                          </div>
                          {support.focus && (
                            <p className="wellness-services-mental-focus">{support.focus}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {memoryActivities.length > 0 && (
                <div className="wellness-services-memory-section">
                  <h4>
                    <FontAwesomeIcon icon={faPuzzlePiece} />
                    {t('clubs.WellnessServices.mentalTab.memoryActivities')}
                  </h4>
                  <div className="wellness-services-memory-grid">
                    {memoryActivities.map((activity, index) => (
                      <div key={index} className="wellness-services-memory-card">
                        <div className="wellness-services-memory-icon">
                          <FontAwesomeIcon icon={faGamepad} />
                        </div>
                        <div className="wellness-services-memory-content">
                          {activity.name && <h5>{activity.name}</h5>}
                          {activity.description && <p>{activity.description}</p>}
                          <div className="wellness-services-memory-details">
                            {activity.frequency && (
                              <div className="wellness-services-memory-detail">
                                <FontAwesomeIcon icon={faClock} />
                                <span>{getFrequencyText(activity.frequency)}</span>
                              </div>
                            )}
                            {activity.instructor && (
                              <div className="wellness-services-memory-detail">
                                <FontAwesomeIcon icon={faGraduationCap} />
                                <span>{activity.instructor}</span>
                              </div>
                            )}
                            {activity.participants && (
                              <div className="wellness-services-memory-detail">
                                <FontAwesomeIcon icon={faUsers} />
                                <span>{t('clubs.WellnessServices.participants', { count: activity.participants })}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeCategory === 'social' && (intergenerationalPrograms.length > 0 || socialIsolationPrevention.length > 0 || volunteerPrograms.length > 0) && (
            <div className="wellness-services-social">
              <div className="wellness-services-social-header">
                <h3>{t('clubs.WellnessServices.socialTab.title')}</h3>
                <p>{t('clubs.WellnessServices.socialTab.subtitle')}</p>
              </div>
              
              {intergenerationalPrograms.length > 0 && (
                <div className="wellness-services-intergenerational-section">
                  <h4>
                    <FontAwesomeIcon icon={faChild} />
                    {t('clubs.WellnessServices.socialTab.intergenerationalPrograms')}
                  </h4>
                  <div className="wellness-services-intergenerational-grid">
                    {intergenerationalPrograms.map((program, index) => (
                      <div key={index} className="wellness-services-intergenerational-card">
                        <div className="wellness-services-intergenerational-header">
                          <div className="wellness-services-intergenerational-icon">
                            <FontAwesomeIcon icon={faUserPlus} />
                          </div>
                          {program.ageRange && (
                            <div className="wellness-services-intergenerational-age">
                              {program.ageRange}
                            </div>
                          )}
                        </div>
                        <div className="wellness-services-intergenerational-content">
                          {program.name && <h5>{program.name}</h5>}
                          {program.description && <p>{program.description}</p>}
                          <div className="wellness-services-intergenerational-details">
                            {program.frequency && (
                              <div className="wellness-services-intergenerational-detail">
                                <FontAwesomeIcon icon={faCalendarAlt} />
                                <span>{getFrequencyText(program.frequency)}</span>
                              </div>
                            )}
                            {program.participants && (
                              <div className="wellness-services-intergenerational-detail">
                                <FontAwesomeIcon icon={faUsers} />
                                <span>{t('clubs.WellnessServices.participants', { count: program.participants })}</span>
                              </div>
                            )}
                            {program.coordinator && (
                              <div className="wellness-services-intergenerational-detail">
                                <FontAwesomeIcon icon={faUserFriends} />
                                <span>{program.coordinator}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {socialIsolationPrevention.length > 0 && (
                <div className="wellness-services-isolation-section">
                  <h4>
                    <FontAwesomeIcon icon={faHandsHelping} />
                    {t('clubs.WellnessServices.socialTab.isolationPrevention')}
                  </h4>
                  <div className="wellness-services-isolation-list">
                    {socialIsolationPrevention.map((prevention, index) => (
                      <div key={index} className="wellness-services-isolation-item">
                        <FontAwesomeIcon icon={faThumbsUp} />
                        <span>{prevention}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {volunteerPrograms.length > 0 && (
                <div className="wellness-services-volunteer-section">
                  <h4>
                    <FontAwesomeIcon icon={faHandsHelping} />
                    {t('clubs.WellnessServices.socialTab.volunteerPrograms')}
                  </h4>
                  <div className="wellness-services-volunteer-grid">
                    {volunteerPrograms.map((program, index) => (
                      <div key={index} className="wellness-services-volunteer-card">
                        <div className="wellness-services-volunteer-icon">
                          <FontAwesomeIcon icon={faHeart} />
                        </div>
                        <div className="wellness-services-volunteer-content">
                          {program.name && <h5>{program.name}</h5>}
                          {program.description && <p>{program.description}</p>}
                          <div className="wellness-services-volunteer-stats">
                            {program.volunteers && (
                              <div className="wellness-services-volunteer-stat">
                                <FontAwesomeIcon icon={faUsers} />
                                <span>{t('clubs.WellnessServices.socialTab.volunteers', { count: program.volunteers })}</span>
                              </div>
                            )}
                            {program.hoursPerWeek && (
                              <div className="wellness-services-volunteer-stat">
                                <FontAwesomeIcon icon={faClock} />
                                <span>{t('clubs.WellnessServices.socialTab.hoursPerWeek', { hours: program.hoursPerWeek })}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeCategory === 'accessibility' && availableAccessibility.length > 0 && (
            <div className="wellness-services-accessibility">
              <div className="wellness-services-accessibility-header">
                <h3>{t('clubs.WellnessServices.accessibilityTab.title')}</h3>
                <p>{t('clubs.WellnessServices.accessibilityTab.subtitle')}</p>
              </div>
              
              <div className="wellness-services-accessibility-list">
                {availableAccessibility.map((accessKey, index) => (
                  <div key={accessKey} className="wellness-services-accessibility-item">
                    <FontAwesomeIcon icon={faCheckCircle} />
                    <span>{getAccessibilityLabel(accessKey)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeCategory === 'cognitive' && cognitiveStimulation.length > 0 && (
            <div className="wellness-services-cognitive">
              <div className="wellness-services-cognitive-header">
                <h3>{t('clubs.WellnessServices.cognitiveTab.title')}</h3>
                <p>{t('clubs.WellnessServices.cognitiveTab.subtitle')}</p>
              </div>
              
              <div className="wellness-services-cognitive-list">
                {cognitiveStimulation.map((activity, index) => (
                  <div key={index} className="wellness-services-cognitive-item">
                    <div className="wellness-services-cognitive-icon">
                      <FontAwesomeIcon icon={faLightbulb} />
                    </div>
                    <div className="wellness-services-cognitive-content">
                      <h5>{activity}</h5>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default WellnessServices;