import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('services');
  const [expandedService, setExpandedService] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedLecture, setSelectedLecture] = useState(null);

  if (!club?.pensionersSpecific?.healthServices && 
      !club?.pensionersSpecific?.ageSpecificNeeds?.nutritionSupport?.length &&
      !club?.pensionersSpecific?.ageSpecificNeeds?.fallPrevention?.length) {
    return null;
  }

  const pensionersSpecific = club.pensionersSpecific || {};
  const healthServices = pensionersSpecific.healthServices || {};
  const ageSpecificNeeds = pensionersSpecific.ageSpecificNeeds || {};
  const contacts = club.contacts || {};

  const getHealthFeatures = () => [
    healthServices.regularCheckups && {
      key: 'checkups',
      icon: faStethoscope,
      title: t('clubs.HealthActivities.services.checkups.title'),
      description: t('clubs.HealthActivities.services.checkups.description'),
      color: '#3b82f6'
    },
    healthServices.bloodPressureMonitoring && {
      key: 'pressure',
      icon: faHeartbeat,
      title: t('clubs.HealthActivities.services.pressure.title'),
      description: t('clubs.HealthActivities.services.pressure.description'),
      color: '#ef4444'
    },
    ageSpecificNeeds.medicationReminders && {
      key: 'medication',
      icon: faPills,
      title: t('clubs.HealthActivities.services.medication.title'),
      description: t('clubs.HealthActivities.services.medication.description'),
      color: '#8b5cf6'
    },
    healthServices.emergencyProtocol?.hasEmergencyPlan && {
      key: 'emergency',
      icon: faAmbulance,
      title: t('clubs.HealthActivities.services.emergency.title'),
      description: t('clubs.HealthActivities.services.emergency.description'),
      color: '#f59e0b'
    }
  ].filter(Boolean);

  const healthFeatures = getHealthFeatures();
  const healthLectures = healthServices.healthLectures || [];
  const medicalPartners = healthServices.medicalPartners || [];
  const nutritionSupport = ageSpecificNeeds.nutritionSupport || [];
  const fallPrevention = ageSpecificNeeds.fallPrevention || [];
  const emergencyInfo = healthServices.emergencyProtocol || {};

  if (healthFeatures.length === 0 && 
      healthLectures.length === 0 && 
      medicalPartners.length === 0 && 
      nutritionSupport.length === 0 && 
      fallPrevention.length === 0) {
    return null;
  }

  const getHealthTabs = () => [
    { key: 'services', label: t('clubs.HealthActivities.tabs.services'), icon: faStethoscope },
    { key: 'education', label: t('clubs.HealthActivities.tabs.education'), icon: faGraduationCap },
    { key: 'partners', label: t('clubs.HealthActivities.tabs.partners'), icon: faHospital },
    { key: 'nutrition', label: t('clubs.HealthActivities.tabs.nutrition'), icon: faAppleAlt },
    { key: 'safety', label: t('clubs.HealthActivities.tabs.safety'), icon: faShieldAlt }
  ];

  const healthTabs = getHealthTabs();

  const getFrequencyText = (frequency) => {
    const freq = frequency.toLowerCase();
    const frequencyMap = t('clubs.HealthActivities.frequencies', { returnObjects: true });
    
    for (const [key, terms] of Object.entries(frequencyMap)) {
      if (terms.some(term => freq.includes(term))) {
        return t(`clubs.HealthActivities.frequencyLabels.${key}`);
      }
    }
    return frequency;
  };

  const formatNextDate = (dateString) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      const locale = i18n.language === 'bg' ? 'bg-BG' : 
                     i18n.language === 'de' ? 'de-DE' : 'en-US';
      
      return date.toLocaleDateString(locale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getServiceBenefits = (serviceKey) => {
    return t(`clubs.HealthActivities.services.${serviceKey}.benefits`, { returnObjects: true });
  };

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
        
        <div className="health-activities-header">
          <div className="health-activities-badge">
            <FontAwesomeIcon icon={faHeartbeat} />
            <span>{t('clubs.HealthActivities.header.badge')}</span>
          </div>
          <h2 className="health-activities-title">
            {t('clubs.HealthActivities.header.title')}
          </h2>
          <p className="health-activities-subtitle">
            {t('clubs.HealthActivities.header.subtitle')}
          </p>
        </div>

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
                  <span>{t('clubs.HealthActivities.status.active')}</span>
                </div>
              </div>
            ))}
          </div>
        )}

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

        <div className="health-activities-content">
          
          {activeTab === 'services' && healthFeatures.length > 0 && (
            <div className="health-activities-services">
              <div className="health-activities-services-header">
                <h3>{t('clubs.HealthActivities.servicesTab.title')}</h3>
                <p>{t('clubs.HealthActivities.servicesTab.subtitle')}</p>
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
                          <h5>{t('clubs.HealthActivities.benefits')}:</h5>
                          <ul>
                            {getServiceBenefits(service.key).map((benefit, idx) => (
                              <li key={idx}>{benefit}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'education' && healthLectures.length > 0 && (
            <div className="health-activities-education">
              <div className="health-activities-education-header">
                <h3>{t('clubs.HealthActivities.educationTab.title')}</h3>
                <p>{t('clubs.HealthActivities.educationTab.subtitle')}</p>
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
                        <span>{t('clubs.HealthActivities.actions.schedule')}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'partners' && medicalPartners.length > 0 && (
            <div className="health-activities-partners">
              <div className="health-activities-partners-header">
                <h3>{t('clubs.HealthActivities.partnersTab.title')}</h3>
                <p>{t('clubs.HealthActivities.partnersTab.subtitle')}</p>
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
                          <span>{t('clubs.HealthActivities.actions.call')}</span>
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'nutrition' && nutritionSupport.length > 0 && (
            <div className="health-activities-nutrition">
              <div className="health-activities-nutrition-header">
                <h3>{t('clubs.HealthActivities.nutritionTab.title')}</h3>
                <p>{t('clubs.HealthActivities.nutritionTab.subtitle')}</p>
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

          {activeTab === 'safety' && (fallPrevention.length > 0 || emergencyInfo.hasEmergencyPlan) && (
            <div className="health-activities-safety">
              <div className="health-activities-safety-header">
                <h3>{t('clubs.HealthActivities.safetyTab.title')}</h3>
                <p>{t('clubs.HealthActivities.safetyTab.subtitle')}</p>
              </div>
              
              {fallPrevention.length > 0 && (
                <div className="health-activities-prevention">
                  <h4>
                    <FontAwesomeIcon icon={faShieldAlt} />
                    {t('clubs.HealthActivities.safetyTab.fallPrevention')}
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
                    {t('clubs.HealthActivities.safetyTab.emergencyProtocol')}
                  </h4>
                  <div className="health-activities-emergency-content">
                    {emergencyInfo.nearestHospital && (
                      <div className="health-activities-emergency-item">
                        <div className="health-activities-emergency-icon">
                          <FontAwesomeIcon icon={faHospital} />
                        </div>
                        <div>
                          <strong>{t('clubs.HealthActivities.safetyTab.nearestHospital')}:</strong>
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
                          <strong>{t('clubs.HealthActivities.safetyTab.emergencyContacts')}:</strong>
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
                          <strong>{t('clubs.HealthActivities.safetyTab.specialEquipment')}:</strong>
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
              <h3>{t('clubs.HealthActivities.scheduleModal.title')}</h3>
              <p>{selectedLecture.topic}</p>
            </div>
            
            <div className="health-activities-modal-body">
              <div className="health-activities-lecture-schedule">
                <div className="health-activities-schedule-item">
                  <FontAwesomeIcon icon={faUserMd} />
                  <div>
                    <strong>{t('clubs.HealthActivities.scheduleModal.lecturer')}:</strong>
                    <span>{selectedLecture.lecturer}</span>
                  </div>
                </div>
                
                <div className="health-activities-schedule-item">
                  <FontAwesomeIcon icon={faClock} />
                  <div>
                    <strong>{t('clubs.HealthActivities.scheduleModal.duration')}:</strong>
                    <span>{selectedLecture.duration}</span>
                  </div>
                </div>
                
                <div className="health-activities-schedule-item">
                  <FontAwesomeIcon icon={faCalendarCheck} />
                  <div>
                    <strong>{t('clubs.HealthActivities.scheduleModal.frequency')}:</strong>
                    <span>{getFrequencyText(selectedLecture.frequency)}</span>
                  </div>
                </div>
                
                {selectedLecture.nextDate && (
                  <div className="health-activities-schedule-item">
                    <FontAwesomeIcon icon={faCalendarCheck} />
                    <div>
                      <strong>{t('clubs.HealthActivities.scheduleModal.nextLecture')}:</strong>
                      <span>{formatNextDate(selectedLecture.nextDate)}</span>
                    </div>
                  </div>
                )}
              </div>
              
              {contacts.phone && (
                <div className="health-activities-modal-footer">
                  <p>{t('clubs.HealthActivities.scheduleModal.contactInfo')}:</p>
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