import { useState } from 'react';
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
  const [activeCategory, setActiveCategory] = useState('support');

  // Проверяваме дали има необходимите данни
  if (!club?.pensionersSpecific?.supportServices && 
      !club?.pensionersSpecific?.specialPrograms && 
      !club?.pensionersSpecific?.accessibility &&
      !club?.pensionersSpecific?.ageSpecificNeeds) {
    return null;
  }

  // Събираме данни
  const pensionersSpecific = club.pensionersSpecific || {};
  const supportServices = pensionersSpecific.supportServices || {};
  const specialPrograms = pensionersSpecific.specialPrograms || {};
  const accessibility = pensionersSpecific.accessibility || {};
  const ageSpecificNeeds = pensionersSpecific.ageSpecificNeeds || {};
  const contacts = club.contacts || {};

  // Подкрепящи услуги - само boolean стойности
  const availableSupport = Object.entries(supportServices)
    .filter(([key, value]) => value === true)
    .map(([key]) => key);

  // Психологическа подкрепа
  const mentalHealthSupport = specialPrograms.mentalHealthSupport || [];

  // Дейности за памет
  const memoryActivities = specialPrograms.memoryActivities || [];

  // Междупоколенчески програми
  const intergenerationalPrograms = specialPrograms.intergenerationalPrograms || [];

  // Доброволчески програми
  const volunteerPrograms = specialPrograms.volunteerPrograms || [];

  // Достъпност - само boolean стойности
  const availableAccessibility = Object.entries(accessibility)
    .filter(([key, value]) => value === true)
    .map(([key]) => key);

  // Социална изолация превенция
  const socialIsolationPrevention = ageSpecificNeeds.socialIsolationPrevention || [];

  // Когнитивна стимулация
  const cognitiveStimulation = ageSpecificNeeds.cognitiveStimulation || [];

  // Ако няма wellness данни, не показваме компонента
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

  // Категории за навигация
  const wellnessCategories = [
    { 
      key: 'support', 
      label: 'Подкрепящи услуги', 
      icon: faHandHoldingHeart,
      count: availableSupport.length
    },
    { 
      key: 'mental', 
      label: 'Психично здраве', 
      icon: faBrain,
      count: mentalHealthSupport.length + memoryActivities.length
    },
    { 
      key: 'social', 
      label: 'Социални услуги', 
      icon: faUsers,
      count: intergenerationalPrograms.length + socialIsolationPrevention.length + volunteerPrograms.length
    },
    { 
      key: 'accessibility', 
      label: 'Достъпност', 
      icon: faUniversalAccess,
      count: availableAccessibility.length
    },
    { 
      key: 'cognitive', 
      label: 'Когнитивни дейности', 
      icon: faLightbulb,
      count: cognitiveStimulation.length
    }
  ].filter(category => category.count > 0);

  // Helper функции
  function getFrequencyText(frequency) {
    if (!frequency) return '';
    const freq = frequency.toLowerCase();
    if (freq.includes('седмично')) return 'Седмично';
    if (freq.includes('месечно')) return 'Месечно';
    if (freq.includes('ежедневно') || freq.includes('дневно')) return 'Ежедневно';
    return frequency;
  }

  return (
    <section id="wellness-services" className="wellness-services-section">
      <div className="wellness-services-container">
        
        {/* Header */}
        <div className="wellness-services-header">
          <div className="wellness-services-badge">
            <FontAwesomeIcon icon={faHandHoldingHeart} />
            <span>Wellness услуги</span>
          </div>
          <h2 className="wellness-services-title">
            Грижа за цялостното ви благополучие
          </h2>
          <p className="wellness-services-subtitle">
            Комплексни услуги за физическо, психично и социално благосъстояние
          </p>
        </div>

        {/* Wellness Overview */}
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
                    {category.count} {category.count === 1 ? 'услуга' : 'услуги'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Navigation */}
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

        {/* Content */}
        <div className="wellness-services-content">
          
          {/* Support Services */}
          {activeCategory === 'support' && availableSupport.length > 0 && (
            <div className="wellness-services-support">
              <div className="wellness-services-support-header">
                <h3>Подкрепящи услуги</h3>
                <p>Налични услуги за подкрепа</p>
              </div>
              
              <div className="wellness-services-support-list">
                {availableSupport.map((serviceKey, index) => (
                  <div key={serviceKey} className="wellness-services-support-item">
                    <FontAwesomeIcon icon={faCheckCircle} />
                    <span>{serviceKey}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mental Health */}
          {activeCategory === 'mental' && (mentalHealthSupport.length > 0 || memoryActivities.length > 0) && (
            <div className="wellness-services-mental">
              <div className="wellness-services-mental-header">
                <h3>Психично здраве и когнитивни дейности</h3>
                <p>Грижа за умственото благополучие и паметта</p>
              </div>
              
              {mentalHealthSupport.length > 0 && (
                <div className="wellness-services-mental-section">
                  <h4>
                    <FontAwesomeIcon icon={faHeart} />
                    Психологическа подкрепа
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
                                <span>{support.participants} участници</span>
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
                    Дейности за памет
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
                                <span>{activity.participants} участници</span>
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

          {/* Social Services */}
          {activeCategory === 'social' && (intergenerationalPrograms.length > 0 || socialIsolationPrevention.length > 0 || volunteerPrograms.length > 0) && (
            <div className="wellness-services-social">
              <div className="wellness-services-social-header">
                <h3>Социални услуги и програми</h3>
                <p>Връзки между хората и превенция на изолацията</p>
              </div>
              
              {intergenerationalPrograms.length > 0 && (
                <div className="wellness-services-intergenerational-section">
                  <h4>
                    <FontAwesomeIcon icon={faChild} />
                    Междупоколенчески програми
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
                                <span>{program.participants} участници</span>
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
                    Превенция на изолацията
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
                    Доброволчески програми
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
                                <span>{program.volunteers} доброволци</span>
                              </div>
                            )}
                            {program.hoursPerWeek && (
                              <div className="wellness-services-volunteer-stat">
                                <FontAwesomeIcon icon={faClock} />
                                <span>{program.hoursPerWeek}ч/седмица</span>
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

          {/* Accessibility */}
          {activeCategory === 'accessibility' && availableAccessibility.length > 0 && (
            <div className="wellness-services-accessibility">
              <div className="wellness-services-accessibility-header">
                <h3>Достъпност и удобства</h3>
                <p>Налични възможности за достъпност</p>
              </div>
              
              <div className="wellness-services-accessibility-list">
                {availableAccessibility.map((accessKey, index) => (
                  <div key={accessKey} className="wellness-services-accessibility-item">
                    <FontAwesomeIcon icon={faCheckCircle} />
                    <span>{accessKey}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cognitive Activities */}
          {activeCategory === 'cognitive' && cognitiveStimulation.length > 0 && (
            <div className="wellness-services-cognitive">
              <div className="wellness-services-cognitive-header">
                <h3>Когнитивни дейности</h3>
                <p>Налични дейности за умствена стимулация</p>
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