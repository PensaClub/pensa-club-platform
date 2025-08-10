import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHeartbeat,
  faStethoscope,
  faUserMd,
  faHospital,
  faPills,
  faAppleAlt,
  faShieldAlt,
  faEye,
  faWeight,
  faDroplet,
  faBrain,
  faHandHoldingHeart,
  faCalendarCheck,
  faClipboardCheck,
  faPhoneAlt,
  faClock,
  faMapMarkerAlt,
  faExclamationTriangle,
  faInfoCircle,
  faCheckCircle,
  faTimes,
  faChevronDown,
  faChevronUp,
  faPlay,
  faBookOpen,
  faGraduationCap,
  faAmbulance,
  faFirstAid,
  faMobile,
  faEnvelope,
  faHome,
  faWalking,
  faLeaf,
  faStar,
  faAward,
  faUsers,
  faPlus,
  faMinus
} from '@fortawesome/free-solid-svg-icons';
import './healthActivities.css';

export const HealthActivities = ({ club }) => {
  const [activeTab, setActiveTab] = useState('services');
  const [expandedService, setExpandedService] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedLecture, setSelectedLecture] = useState(null);

  // Проверяваме дали има необходимите данни
  if (!club?.pensionersSpecific?.healthServices && 
      !club?.pensionersSpecific?.ageSpecificNeeds?.nutritionSupport?.length &&
      !club?.pensionersSpecific?.ageSpecificNeeds?.fallPrevention?.length) {
    return null;
  }

  // Събираме данни
  const pensionersSpecific = club.pensionersSpecific || {};
  const healthServices = pensionersSpecific.healthServices || {};
  const ageSpecificNeeds = pensionersSpecific.ageSpecificNeeds || {};
  const contacts = club.contacts || {};

  // Здравни услуги
  const healthFeatures = [
    healthServices.regularCheckups && {
      key: 'checkups',
      icon: faStethoscope,
      title: 'Редовни прегледи',
      description: 'Професионални здравни прегледи за всички членове',
      color: '#3b82f6'
    },
    healthServices.bloodPressureMonitoring && {
      key: 'pressure',
      icon: faHeartbeat,
      title: 'Мониторинг на кръвното',
      description: 'Редовно следене на кръвното налягане',
      color: '#ef4444'
    },
    ageSpecificNeeds.medicationReminders && {
      key: 'medication',
      icon: faPills,
      title: 'Напомняния за лекарства',
      description: 'Система за напомняне на лекарствени дози',
      color: '#8b5cf6'
    },
    healthServices.emergencyProtocol?.hasEmergencyPlan && {
      key: 'emergency',
      icon: faAmbulance,
      title: 'Спешен протокол',
      description: 'Готовност за спешни медицински случаи',
      color: '#f59e0b'
    }
  ].filter(Boolean);

  // Здравни лекции
  const healthLectures = healthServices.healthLectures || [];

  // Медицински партньори
  const medicalPartners = healthServices.medicalPartners || [];

  // Хранителна подкрепа
  const nutritionSupport = ageSpecificNeeds.nutritionSupport || [];

  // Превенция на падания
  const fallPrevention = ageSpecificNeeds.fallPrevention || [];

  // Спешна информация
  const emergencyInfo = healthServices.emergencyProtocol || {};

  // Ако няма здравни данни, не показваме компонента
  if (healthFeatures.length === 0 && 
      healthLectures.length === 0 && 
      medicalPartners.length === 0 && 
      nutritionSupport.length === 0 && 
      fallPrevention.length === 0) {
    return null;
  }

  // Табове за навигация
  const healthTabs = [
    { key: 'services', label: 'Услуги', icon: faStethoscope },
    { key: 'education', label: 'Образование', icon: faGraduationCap },
    { key: 'partners', label: 'Партньори', icon: faHospital },
    { key: 'nutrition', label: 'Хранене', icon: faAppleAlt },
    { key: 'safety', label: 'Безопасност', icon: faShieldAlt }
  ];

  // Helper функции
  function getFrequencyText(frequency) {
    const freq = frequency.toLowerCase();
    if (freq.includes('седмично')) return 'Седмично';
    if (freq.includes('месечно')) return 'Месечно';
    if (freq.includes('тримесечно')) return 'Тримесечно';
    if (freq.includes('годишно')) return 'Годишно';
    return frequency;
  }

  function formatNextDate(dateString) {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('bg-BG', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  }

  const toggleService = (index) => {
    setExpandedService(expandedService === index ? null : index);
  };

  const openScheduleModal = (lecture) => {
    setSelectedLecture(lecture);
    setShowScheduleModal(true);
  };

  return (
    <section id="health-activities" className="health-activities-section">
      <div className="health-activities-container">
        
        {/* Header */}
        <div className="health-activities-header">
          <div className="health-activities-badge">
            <FontAwesomeIcon icon={faHeartbeat} />
            <span>Здравни дейности</span>
          </div>
          <h2 className="health-activities-title">
            Грижа за вашето здраве и благополучие
          </h2>
          <p className="health-activities-subtitle">
            Комплексни здравни услуги и превантивни програми за активна и здравословна старост
          </p>
        </div>

        {/* Health Overview Cards */}
        {healthFeatures.length > 0 && (
          <div className="health-activities-overview">
            {healthFeatures.map((feature, index) => (
              <div 
                key={feature.key} 
                className="health-activities-overview-card"
                style={{ 
                  '--feature-color': feature.color,
                  '--feature-delay': `${index * 0.1}s` 
                }}
              >
                <div className="health-activities-overview-icon">
                  <FontAwesomeIcon icon={feature.icon} />
                </div>
                <div className="health-activities-overview-content">
                  <h4>{feature.title}</h4>
                  <p>{feature.description}</p>
                </div>
                <div className="health-activities-overview-status">
                  <FontAwesomeIcon icon={faCheckCircle} />
                  <span>Активно</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="health-activities-nav">
          {healthTabs.map(tab => {
            let hasContent = false;
            
            switch(tab.key) {
              case 'services':
                hasContent = healthFeatures.length > 0;
                break;
              case 'education':
                hasContent = healthLectures.length > 0;
                break;
              case 'partners':
                hasContent = medicalPartners.length > 0;
                break;
              case 'nutrition':
                hasContent = nutritionSupport.length > 0;
                break;
              case 'safety':
                hasContent = fallPrevention.length > 0 || emergencyInfo.hasEmergencyPlan;
                break;
            }

            return hasContent && (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`health-activities-nav-btn ${activeTab === tab.key ? 'active' : ''}`}
              >
                <FontAwesomeIcon icon={tab.icon} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="health-activities-content">
          
          {/* Services Tab */}
          {activeTab === 'services' && healthFeatures.length > 0 && (
            <div className="health-activities-services">
              <div className="health-activities-services-header">
                <h3>Здравни услуги</h3>
                <p>Професионална грижа за вашето здраве и превенция</p>
              </div>
              
              <div className="health-activities-services-grid">
                {healthFeatures.map((service, index) => (
                  <div 
                    key={service.key} 
                    className="health-activities-service-card"
                    style={{ '--service-color': service.color }}
                  >
                    <div className="health-activities-service-header">
                      <div className="health-activities-service-icon">
                        <FontAwesomeIcon icon={service.icon} />
                      </div>
                      <div className="health-activities-service-info">
                        <h4>{service.title}</h4>
                        <p>{service.description}</p>
                      </div>
                      <button 
                        onClick={() => toggleService(index)}
                        className="health-activities-service-toggle"
                      >
                        <FontAwesomeIcon 
                          icon={expandedService === index ? faChevronUp : faChevronDown} 
                        />
                      </button>
                    </div>
                    
                    {expandedService === index && (
                      <div className="health-activities-service-details">
                        <div className="health-activities-service-benefits">
                          <h5>Предимства:</h5>
                          <ul>
                            {service.key === 'checkups' && (
                              <>
                                <li>Ранно откриване на здравословни проблеми</li>
                                <li>Персонализирани препоръки за здраве</li>
                                <li>Редовно проследяване на здравословното състояние</li>
                              </>
                            )}
                            {service.key === 'pressure' && (
                              <>
                                <li>Ежедневен мониторинг на кръвното налягане</li>
                                <li>Спешно уведомяване при отклонения</li>
                                <li>Връзка с лекуващия лекар</li>
                              </>
                            )}
                            {service.key === 'medication' && (
                              <>
                                <li>Навременно приемане на лекарства</li>
                                <li>Предотвратяване на пропуски</li>
                                <li>Следене на лекарствени взаимодействия</li>
                              </>
                            )}
                            {service.key === 'emergency' && (
                              <>
                                <li>Бърза реакция при спешни случаи</li>
                                <li>Обучен персонал за първа помощ</li>
                                <li>Директна връзка със спешни служби</li>
                              </>
                            )}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education Tab */}
          {activeTab === 'education' && healthLectures.length > 0 && (
            <div className="health-activities-education">
              <div className="health-activities-education-header">
                <h3>Здравно образование</h3>
                <p>Лекции и семинари за здравословен начин на живот</p>
              </div>
              
              <div className="health-activities-lectures-grid">
                {healthLectures.map((lecture, index) => (
                  <div key={index} className="health-activities-lecture-card">
                    <div className="health-activities-lecture-header">
                      <div className="health-activities-lecture-icon">
                        <FontAwesomeIcon icon={faBookOpen} />
                      </div>
                      <div className="health-activities-lecture-type">
                        <span>{getFrequencyText(lecture.frequency)}</span>
                      </div>
                    </div>
                    
                    <div className="health-activities-lecture-content">
                      <h4>{lecture.topic}</h4>
                      <div className="health-activities-lecture-details">
                        <div className="health-activities-lecture-detail">
                          <FontAwesomeIcon icon={faUserMd} />
                          <span>{lecture.lecturer}</span>
                        </div>
                        <div className="health-activities-lecture-detail">
                          <FontAwesomeIcon icon={faClock} />
                          <span>{lecture.duration}</span>
                        </div>
                        {lecture.nextDate && (
                          <div className="health-activities-lecture-detail">
                            <FontAwesomeIcon icon={faCalendarCheck} />
                            <span>{formatNextDate(lecture.nextDate)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="health-activities-lecture-footer">
                      <button 
                        onClick={() => openScheduleModal(lecture)}
                        className="health-activities-lecture-btn"
                      >
                        <FontAwesomeIcon icon={faCalendarCheck} />
                        <span>График</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Partners Tab */}
          {activeTab === 'partners' && medicalPartners.length > 0 && (
            <div className="health-activities-partners">
              <div className="health-activities-partners-header">
                <h3>Медицински партньори</h3>
                <p>Професионални здравни услуги от наши партньори</p>
              </div>
              
              <div className="health-activities-partners-grid">
                {medicalPartners.map((partner, index) => (
                  <div key={index} className="health-activities-partner-card">
                    <div className="health-activities-partner-header">
                      <div className="health-activities-partner-icon">
                        <FontAwesomeIcon icon={faHospital} />
                      </div>
                      {partner.discount && (
                        <div className="health-activities-partner-discount">
                          -{partner.discount}
                        </div>
                      )}
                    </div>
                    
                    <div className="health-activities-partner-content">
                      <h4>{partner.name}</h4>
                      <p>{partner.service}</p>
                      
                      <div className="health-activities-partner-details">
                        {partner.contact && (
                          <div className="health-activities-partner-detail">
                            <FontAwesomeIcon icon={faMobile} />
                            <span>{partner.contact}</span>
                          </div>
                        )}
                        {partner.address && (
                          <div className="health-activities-partner-detail">
                            <FontAwesomeIcon icon={faMapMarkerAlt} />
                            <span>{partner.address}</span>
                          </div>
                        )}
                        {partner.workingHours && (
                          <div className="health-activities-partner-detail">
                            <FontAwesomeIcon icon={faClock} />
                            <span>{partner.workingHours}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {partner.contact && (
                      <div className="health-activities-partner-footer">
                        <a 
                          href={`tel:${partner.contact}`}
                          className="health-activities-partner-btn"
                        >
                          <FontAwesomeIcon icon={faPhoneAlt} />
                          <span>Обади се</span>
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Nutrition Tab */}
          {activeTab === 'nutrition' && nutritionSupport.length > 0 && (
            <div className="health-activities-nutrition">
              <div className="health-activities-nutrition-header">
                <h3>Хранителна подкрепа</h3>
                <p>Здравословно хранене за активна старост</p>
              </div>
              
              <div className="health-activities-nutrition-grid">
                {nutritionSupport.map((nutrition, index) => (
                  <div key={index} className="health-activities-nutrition-card">
                    <div className="health-activities-nutrition-icon">
                      <FontAwesomeIcon icon={faAppleAlt} />
                    </div>
                    
                    <div className="health-activities-nutrition-content">
                      <h4>{nutrition.service}</h4>
                      <div className="health-activities-nutrition-details">
                        {nutrition.provider && (
                          <div className="health-activities-nutrition-detail">
                            <FontAwesomeIcon icon={faUserMd} />
                            <span>{nutrition.provider}</span>
                          </div>
                        )}
                        {nutrition.frequency && (
                          <div className="health-activities-nutrition-detail">
                            <FontAwesomeIcon icon={faCalendarCheck} />
                            <span>{nutrition.frequency}</span>
                          </div>
                        )}
                        {nutrition.price && (
                          <div className="health-activities-nutrition-detail">
                            <FontAwesomeIcon icon={faStar} />
                            <span>{nutrition.price}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Safety Tab */}
          {activeTab === 'safety' && (fallPrevention.length > 0 || emergencyInfo.hasEmergencyPlan) && (
            <div className="health-activities-safety">
              <div className="health-activities-safety-header">
                <h3>Безопасност и превенция</h3>
                <p>Мерки за безопасност и спешни протоколи</p>
              </div>
              
              {fallPrevention.length > 0 && (
                <div className="health-activities-prevention">
                  <h4>
                    <FontAwesomeIcon icon={faShieldAlt} />
                    Превенция на падания
                  </h4>
                  <div className="health-activities-prevention-list">
                    {fallPrevention.map((measure, index) => (
                      <div key={index} className="health-activities-prevention-item">
                        <FontAwesomeIcon icon={faCheckCircle} />
                        <span>{measure}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {emergencyInfo.hasEmergencyPlan && (
                <div className="health-activities-emergency">
                  <h4>
                    <FontAwesomeIcon icon={faAmbulance} />
                    Спешен протокол
                  </h4>
                  <div className="health-activities-emergency-content">
                    {emergencyInfo.nearestHospital && (
                      <div className="health-activities-emergency-item">
                        <div className="health-activities-emergency-icon">
                          <FontAwesomeIcon icon={faHospital} />
                        </div>
                        <div>
                          <strong>Най-близка болница:</strong>
                          <span>{emergencyInfo.nearestHospital}</span>
                        </div>
                      </div>
                    )}
                    
                    {emergencyInfo.emergencyContacts?.length > 0 && (
                      <div className="health-activities-emergency-item">
                        <div className="health-activities-emergency-icon">
                          <FontAwesomeIcon icon={faPhoneAlt} />
                        </div>
                        <div>
                          <strong>Спешни контакти:</strong>
                          <div className="health-activities-emergency-contacts">
                            {emergencyInfo.emergencyContacts.map((contact, idx) => (
                              <a key={idx} href={`tel:${contact}`} className="health-activities-emergency-contact">
                                {contact}
                              </a>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {emergencyInfo.specialNeeds?.length > 0 && (
                      <div className="health-activities-emergency-item">
                        <div className="health-activities-emergency-icon">
                          <FontAwesomeIcon icon={faFirstAid} />
                        </div>
                        <div>
                          <strong>Специално оборудване:</strong>
                          <ul>
                            {emergencyInfo.specialNeeds.map((need, idx) => (
                              <li key={idx}>{need}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && selectedLecture && (
        <div className="health-activities-modal" onClick={() => setShowScheduleModal(false)}>
          <div className="health-activities-modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="health-activities-modal-close" 
              onClick={() => setShowScheduleModal(false)}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
            
            <div className="health-activities-modal-header">
              <FontAwesomeIcon icon={faCalendarCheck} />
              <h3>График на лекцията</h3>
              <p>{selectedLecture.topic}</p>
            </div>
            
            <div className="health-activities-modal-body">
              <div className="health-activities-lecture-schedule">
                <div className="health-activities-schedule-item">
                  <FontAwesomeIcon icon={faUserMd} />
                  <div>
                    <strong>Лектор:</strong>
                    <span>{selectedLecture.lecturer}</span>
                  </div>
                </div>
                
                <div className="health-activities-schedule-item">
                  <FontAwesomeIcon icon={faClock} />
                  <div>
                    <strong>Продължителност:</strong>
                    <span>{selectedLecture.duration}</span>
                  </div>
                </div>
                
                <div className="health-activities-schedule-item">
                  <FontAwesomeIcon icon={faCalendarCheck} />
                  <div>
                    <strong>Честота:</strong>
                    <span>{getFrequencyText(selectedLecture.frequency)}</span>
                  </div>
                </div>
                
                {selectedLecture.nextDate && (
                  <div className="health-activities-schedule-item">
                    <FontAwesomeIcon icon={faCalendarCheck} />
                    <div>
                      <strong>Следваща лекция:</strong>
                      <span>{formatNextDate(selectedLecture.nextDate)}</span>
                    </div>
                  </div>
                )}
              </div>
              
              {contacts.phone && (
                <div className="health-activities-modal-footer">
                  <p>За повече информация се свържете с нас:</p>
                  <a href={`tel:${contacts.phone}`} className="health-activities-contact-btn">
                    <FontAwesomeIcon icon={faPhoneAlt} />
                    <span>{contacts.phone}</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default HealthActivities;