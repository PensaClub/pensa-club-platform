import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserMd,
  faHandsHelping,
  faUniversalAccess,
  faBrain,
  faHeartbeat,
  faCalendarAlt,
  faMapMarkerAlt,
  faPhone,
  faClock,
  faUsers,
  faGraduationCap,
  faBuilding,
  faMedkit,
  faExclamationTriangle,
  faAmbulance,
  faInfoCircle,
  faHome,
  faShoppingCart,
  faFileAlt,
  faUserFriends,
  faCar,
  faUtensils,
  faBroom,
  faLaptop,
  faWheelchair,
  faElevator,
  faVolumeUp,
  faEye,
  faHandPaper,
  faShieldAlt,
  faLightbulb,
  faCouch,
  faChild,
  faHands,
  faDumbbell,
  faChartLine,
  faAppleAlt,
  faChevronDown,
  faChevronUp
} from '@fortawesome/free-solid-svg-icons';

import './ClubPensionersSpecific.css';

const ClubPensionersSpecific = ({ club }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('healthServices');
  const [expandedSections, setExpandedSections] = useState({});

  const pensionersData = club.pensionersSpecific || {};

  // По-стриктна проверка за реални данни
  const hasRealData = () => {
    if (!pensionersData || Object.keys(pensionersData).length === 0) return false;

    // Проверяваме healthServices
    const healthServices = pensionersData.healthServices || {};
    const hasHealthData = 
      healthServices.regularCheckups === true ||
      healthServices.bloodPressureMonitoring === true ||
      (healthServices.healthLectures && healthServices.healthLectures.length > 0) ||
      (healthServices.medicalPartners && healthServices.medicalPartners.length > 0) ||
      (healthServices.emergencyProtocol && (
        healthServices.emergencyProtocol.hasEmergencyPlan === true ||
        healthServices.emergencyProtocol.nearestHospital ||
        (healthServices.emergencyProtocol.specialNeeds && healthServices.emergencyProtocol.specialNeeds.length > 0) ||
        (healthServices.emergencyProtocol.emergencyContacts && healthServices.emergencyProtocol.emergencyContacts.length > 0)
      ));

    // Проверяваме supportServices
    const supportServices = pensionersData.supportServices || {};
    const hasSupportData = Object.values(supportServices).some(value => value === true);

    // Проверяваме accessibility
    const accessibility = pensionersData.accessibility || {};
    const hasAccessibilityData = Object.values(accessibility).some(value => value === true);

    // Проверяваме specialPrograms
    const specialPrograms = pensionersData.specialPrograms || {};
    const hasSpecialProgramsData = 
      (specialPrograms.memoryActivities && specialPrograms.memoryActivities.length > 0) ||
      (specialPrograms.volunteerPrograms && specialPrograms.volunteerPrograms.length > 0) ||
      (specialPrograms.mentalHealthSupport && specialPrograms.mentalHealthSupport.length > 0) ||
      (specialPrograms.intergenerationalPrograms && specialPrograms.intergenerationalPrograms.length > 0);

    // Проверяваме ageSpecificNeeds
    const ageSpecificNeeds = pensionersData.ageSpecificNeeds || {};
    const hasAgeSpecificData = 
      (ageSpecificNeeds.nutritionSupport && ageSpecificNeeds.nutritionSupport.length > 0) ||
      (ageSpecificNeeds.lowImpactActivities && ageSpecificNeeds.lowImpactActivities.length > 0);

    return hasHealthData || hasSupportData || hasAccessibilityData || hasSpecialProgramsData || hasAgeSpecificData;
  };

  // Ако няма реални данни, не показваме компонента
  if (!hasRealData()) {
    return null;
  }

  const tabs = [
    { 
      id: 'healthServices', 
      label: t('clubs.pensioners.tabs.healthServices'), 
      icon: faUserMd,
      hasData: (() => {
        const healthServices = pensionersData.healthServices || {};
        return healthServices.regularCheckups === true ||
               healthServices.bloodPressureMonitoring === true ||
               (healthServices.healthLectures && healthServices.healthLectures.length > 0) ||
               (healthServices.medicalPartners && healthServices.medicalPartners.length > 0) ||
               (healthServices.emergencyProtocol && (
                 healthServices.emergencyProtocol.hasEmergencyPlan === true ||
                 healthServices.emergencyProtocol.nearestHospital ||
                 (healthServices.emergencyProtocol.specialNeeds && healthServices.emergencyProtocol.specialNeeds.length > 0) ||
                 (healthServices.emergencyProtocol.emergencyContacts && healthServices.emergencyProtocol.emergencyContacts.length > 0)
               ));
      })()
    },
    { 
      id: 'supportServices', 
      label: t('clubs.pensioners.tabs.supportServices'), 
      icon: faHandsHelping,
      hasData: (() => {
        const supportServices = pensionersData.supportServices || {};
        return Object.values(supportServices).some(value => value === true);
      })()
    },
    { 
      id: 'accessibility', 
      label: t('clubs.pensioners.tabs.accessibility'), 
      icon: faUniversalAccess,
      hasData: (() => {
        const accessibility = pensionersData.accessibility || {};
        return Object.values(accessibility).some(value => value === true);
      })()
    },
    { 
      id: 'specialPrograms', 
      label: t('clubs.pensioners.tabs.specialPrograms'), 
      icon: faBrain,
      hasData: (() => {
        const specialPrograms = pensionersData.specialPrograms || {};
        return (specialPrograms.memoryActivities && specialPrograms.memoryActivities.length > 0) ||
               (specialPrograms.volunteerPrograms && specialPrograms.volunteerPrograms.length > 0) ||
               (specialPrograms.mentalHealthSupport && specialPrograms.mentalHealthSupport.length > 0) ||
               (specialPrograms.intergenerationalPrograms && specialPrograms.intergenerationalPrograms.length > 0);
      })()
    },
    { 
      id: 'ageSpecificNeeds', 
      label: t('clubs.pensioners.tabs.ageSpecificNeeds'), 
      icon: faHeartbeat,
      hasData: (() => {
        const ageSpecificNeeds = pensionersData.ageSpecificNeeds || {};
        return (ageSpecificNeeds.nutritionSupport && ageSpecificNeeds.nutritionSupport.length > 0) ||
               (ageSpecificNeeds.lowImpactActivities && ageSpecificNeeds.lowImpactActivities.length > 0);
      })()
    }
  ].filter(tab => tab.hasData);

  // Ако няма табове с данни, не показваме компонента
  if (tabs.length === 0) {
    return null;
  }

  // Задаваме активния таб към първия наличен
  if (!tabs.find(tab => tab.id === activeTab)) {
    setActiveTab(tabs[0].id);
  }

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const renderHealthServices = () => {
    const healthData = pensionersData.healthServices || {};
    
    return (
      <div className="club-pensioners-tab-content">
        {/* Basic Services */}
        {(healthData.regularCheckups || healthData.bloodPressureMonitoring) && (
          <div className="club-pensioners-section">
            <h4 className="club-pensioners-section-title">
              <FontAwesomeIcon icon={faHeartbeat} />
              {t('clubs.pensioners.healthServices.basicServices')}
            </h4>
            
            <div className="club-pensioners-services-grid">
              {healthData.regularCheckups && (
                <div className="club-pensioners-service-item">
                  <FontAwesomeIcon icon={faHeartbeat} className="service-icon" />
                  <div className="service-content">
                    <h5>{t('clubs.pensioners.healthServices.regularCheckups.title')}</h5>
                    <p>{t('clubs.pensioners.healthServices.regularCheckups.description')}</p>
                  </div>
                </div>
              )}

              {healthData.bloodPressureMonitoring && (
                <div className="club-pensioners-service-item">
                  <FontAwesomeIcon icon={faHeartbeat} className="service-icon" />
                  <div className="service-content">
                    <h5>{t('clubs.pensioners.healthServices.bloodPressureMonitoring.title')}</h5>
                    <p>{t('clubs.pensioners.healthServices.bloodPressureMonitoring.description')}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Health Lectures */}
        {healthData.healthLectures?.length > 0 && (
          <div className="club-pensioners-section">
            <h4 className="club-pensioners-section-title">
              <FontAwesomeIcon icon={faGraduationCap} />
              {t('clubs.pensioners.healthServices.healthLectures.title')}
            </h4>
            
            <div className="club-pensioners-lectures-list">
              {healthData.healthLectures.map((lecture, index) => (
                <div key={index} className="club-pensioners-lecture-item">
                  <div className="lecture-content">
                    <h5>{lecture.topic}</h5>
                    <div className="lecture-meta">
                      {lecture.lecturer && (
                        <span className="meta-item">
                          <FontAwesomeIcon icon={faUserMd} />
                          {lecture.lecturer}
                        </span>
                      )}
                      {lecture.frequency && (
                        <span className="meta-item">
                          <FontAwesomeIcon icon={faCalendarAlt} />
                          {lecture.frequency}
                        </span>
                      )}
                      {lecture.duration && (
                        <span className="meta-item">
                          <FontAwesomeIcon icon={faClock} />
                          {lecture.duration}
                        </span>
                      )}
                      {lecture.nextDate && (
                        <span className="meta-item next-date">
                          <FontAwesomeIcon icon={faCalendarAlt} />
                          {new Date(lecture.nextDate).toLocaleDateString('bg-BG')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Medical Partners */}
        {healthData.medicalPartners?.length > 0 && (
          <div className="club-pensioners-section">
            <h4 className="club-pensioners-section-title">
              <FontAwesomeIcon icon={faMedkit} />
              {t('clubs.pensioners.healthServices.medicalPartners.title')}
            </h4>
            
            <div className="club-pensioners-partners-list">
              {healthData.medicalPartners.map((partner, index) => (
                <div key={index} className="club-pensioners-partner-item">
                  <div className="partner-icon">
                    <FontAwesomeIcon icon={faBuilding} />
                  </div>
                  <div className="partner-content">
                    <h5>{partner.name}</h5>
                    <div className="partner-details">
                      {partner.service && (
                        <div className="partner-detail">
                          <FontAwesomeIcon icon={faMedkit} />
                          <span>{partner.service}</span>
                        </div>
                      )}
                      {club.preferences?.showContactForm && partner.contact && (
                        <div className="partner-detail">
                          <FontAwesomeIcon icon={faPhone} />
                          <span>{partner.contact}</span>
                        </div>
                      )}
                      {partner.address && (
                        <div className="partner-detail">
                          <FontAwesomeIcon icon={faMapMarkerAlt} />
                          <span>{partner.address}</span>
                        </div>
                      )}
                      {partner.workingHours && (
                        <div className="partner-detail">
                          <FontAwesomeIcon icon={faClock} />
                          <span>{partner.workingHours}</span>
                        </div>
                      )}
                      {club.preferences?.showFinances && partner.discount && (
                        <div className="partner-discount">
                          <FontAwesomeIcon icon={faChartLine} />
                          <span>Отстъпка: {partner.discount}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Emergency Protocol */}
        {healthData.emergencyProtocol && (
          <div className="club-pensioners-section">
            <h4 className="club-pensioners-section-title">
              <FontAwesomeIcon icon={faExclamationTriangle} />
              {t('clubs.pensioners.healthServices.emergencyProtocol.title')}
            </h4>
            
            <div className="club-pensioners-emergency-info">
              {healthData.emergencyProtocol.hasEmergencyPlan && (
                <div className="emergency-badge">
                  <FontAwesomeIcon icon={faExclamationTriangle} />
                  <span>Има план за спешни случаи</span>
                </div>
              )}
              
              {healthData.emergencyProtocol.nearestHospital && (
                <div className="emergency-item">
                  <FontAwesomeIcon icon={faAmbulance} />
                  <div>
                    <strong>Най-близка болница:</strong>
                    <span>{healthData.emergencyProtocol?.nearestHospital}</span>
                  </div>
                </div>
              )}

              {club.preferences?.showContactForm && healthData.emergencyProtocol.emergencyContacts?.length > 0 && (
                <div className="emergency-item">
                  <FontAwesomeIcon icon={faPhone} />
                  <div>
                    <strong>Телефони за спешни случаи:</strong>
                    <div className="emergency-contacts">
                      {healthData.emergencyProtocol?.emergencyContacts.map((contact, index) => (
                        <span key={index} className="emergency-contact">{contact}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {healthData.emergencyProtocol?.specialNeeds?.length > 0 && (
                <div className="emergency-item">
                  <FontAwesomeIcon icon={faInfoCircle} />
                  <div>
                    <strong>Специални нужди:</strong>
                    <ul className="special-needs-list">
                      {healthData.emergencyProtocol?.specialNeeds.map((need, index) => (
                        <li key={index}>{need}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSupportServices = () => {
    const supportData = pensionersData.supportServices || {};
    
    const servicesList = [
      { key: 'homeVisits', icon: faHome, title: 'homeVisits' },
      { key: 'shoppingAssistance', icon: faShoppingCart, title: 'shoppingAssistance' },
      { key: 'documentHelp', icon: faFileAlt, title: 'documentHelp' },
      { key: 'companionship', icon: faUserFriends, title: 'companionship' },
      { key: 'transportService', icon: faCar, title: 'transportService' },
      { key: 'mealDelivery', icon: faUtensils, title: 'mealDelivery' },
      { key: 'cleaningHelp', icon: faBroom, title: 'cleaningHelp' },
      { key: 'techSupport', icon: faLaptop, title: 'techSupport' }
    ];

    const availableServices = servicesList.filter(service => supportData[service.key] === true);

    return (
      <div className="club-pensioners-tab-content">
        <div className="club-pensioners-services-grid">
          {availableServices.map(service => (
            <div key={service.key} className="club-pensioners-service-item">
              <FontAwesomeIcon icon={service.icon} className="service-icon" />
              <div className="service-content">
                <h5>{t(`clubs.pensioners.supportServices.${service.title}.title`)}</h5>
                <p>{t(`clubs.pensioners.supportServices.${service.title}.description`)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderAccessibility = () => {
    const accessibilityData = pensionersData.accessibility || {};
    
    const accessibilityFeatures = [
      { key: 'wheelchairAccess', icon: faWheelchair, title: 'wheelchairAccess' },
      { key: 'elevatorAccess', icon: faElevator, title: 'elevatorAccess' },
      { key: 'hearingLoop', icon: faVolumeUp, title: 'hearingLoop' },
      { key: 'largeTextMaterials', icon: faEye, title: 'largeTextMaterials' },
      { key: 'handrails', icon: faHandPaper, title: 'handrails' },
      { key: 'nonSlipFloors', icon: faShieldAlt, title: 'nonSlipFloors' },
      { key: 'goodLighting', icon: faLightbulb, title: 'goodLighting' },
      { key: 'restingAreas', icon: faCouch, title: 'restingAreas' }
    ];

    const availableFeatures = accessibilityFeatures.filter(feature => accessibilityData[feature.key] === true);

    return (
      <div className="club-pensioners-tab-content">
        <div className="club-pensioners-services-grid">
          {availableFeatures.map(feature => (
            <div key={feature.key} className="club-pensioners-service-item">
              <FontAwesomeIcon icon={feature.icon} className="service-icon" />
              <div className="service-content">
                <h5>{t(`clubs.pensioners.accessibility.${feature.title}.title`)}</h5>
                <p>{t(`clubs.pensioners.accessibility.${feature.title}.description`)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSpecialPrograms = () => {
    const programsData = pensionersData.specialPrograms || {};

    return (
      <div className="club-pensioners-tab-content">
        {/* Memory Activities */}
        {programsData.memoryActivities?.length > 0 && (
          <div className="club-pensioners-section">
            <h4 className="club-pensioners-section-title">
              <FontAwesomeIcon icon={faBrain} />
              {t('clubs.pensioners.specialPrograms.memoryActivities.title')}
            </h4>
            
            <div className="club-pensioners-programs-list">
              {programsData.memoryActivities.map((activity, index) => (
                <div key={index} className="club-pensioners-program-item">
                  <div className="program-icon">
                    <FontAwesomeIcon icon={faBrain} />
                  </div>
                  <div className="program-content">
                    <h5>{activity.name}</h5>
                    <div className="program-meta">
                      {activity.frequency && (
                        <span className="meta-item">
                          <FontAwesomeIcon icon={faCalendarAlt} />
                          {activity.frequency}
                        </span>
                      )}
                      {activity.instructor && (
                        <span className="meta-item">
                          <FontAwesomeIcon icon={faUserFriends} />
                          {activity.instructor}
                        </span>
                      )}
                      {activity.participants > 0 && (
                        <span className="meta-item">
                          <FontAwesomeIcon icon={faUsers} />
                          {activity.participants} участници
                        </span>
                      )}
                    </div>
                    {activity.description && (
                      <p className="program-description">{activity.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Volunteer Programs */}
        {programsData.volunteerPrograms?.length > 0 && (
          <div className="club-pensioners-section">
            <h4 className="club-pensioners-section-title">
              <FontAwesomeIcon icon={faHandsHelping} />
              {t('clubs.pensioners.specialPrograms.volunteerPrograms.title')}
            </h4>
            
            <div className="club-pensioners-programs-list">
              {programsData.volunteerPrograms.map((program, index) => (
                <div key={index} className="club-pensioners-program-item">
                  <div className="program-icon">
                    <FontAwesomeIcon icon={faHandsHelping} />
                  </div>
                  <div className="program-content">
                    <h5>{program.name}</h5>
                    <div className="program-meta">
                      {program.coordinator && (
                        <span className="meta-item">
                          <FontAwesomeIcon icon={faUserFriends} />
                          {program.coordinator}
                        </span>
                      )}
                      {program.volunteers > 0 && (
                        <span className="meta-item">
                          <FontAwesomeIcon icon={faUsers} />
                          {program.volunteers} доброволци
                        </span>
                      )}
                      {program.hoursPerWeek > 0 && (
                        <span className="meta-item">
                          <FontAwesomeIcon icon={faClock} />
                          {program.hoursPerWeek} часа седмично
                        </span>
                      )}
                    </div>
                    {program.description && (
                      <p className="program-description">{program.description}</p>
                    )}
                    {program.training && (
                      <p className="program-training">
                        <strong>Обучение:</strong> {program.training}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mental Health Support */}
        {programsData.mentalHealthSupport?.length > 0 && (
          <div className="club-pensioners-section">
            <h4 className="club-pensioners-section-title">
              <FontAwesomeIcon icon={faHeartbeat} />
              {t('clubs.pensioners.specialPrograms.mentalHealthSupport.title')}
            </h4>
            
            <div className="club-pensioners-programs-list">
              {programsData.mentalHealthSupport.map((support, index) => (
                <div key={index} className="club-pensioners-program-item">
                  <div className="program-icon">
                    <FontAwesomeIcon icon={faHeartbeat} />
                  </div>
                  <div className="program-content">
                    <h5>{support.focus}</h5>
                    <div className="program-meta">
                      {support.therapist && (
                        <span className="meta-item">
                          <FontAwesomeIcon icon={faUserMd} />
                          {support.therapist}
                        </span>
                      )}
                      {support.frequency && (
                        <span className="meta-item">
                          <FontAwesomeIcon icon={faCalendarAlt} />
                          {support.frequency}
                        </span>
                      )}
                      {support.availability && (
                        <span className="meta-item">
                          <FontAwesomeIcon icon={faClock} />
                          {support.availability}
                        </span>
                      )}
                      {support.participants > 0 && (
                        <span className="meta-item">
                          <FontAwesomeIcon icon={faUsers} />
                          {support.participants} участници
                        </span>
                      )}
                    </div>
                    {club.preferences?.showContactForm && support.contact && (
                      <div className="program-contact">
                        <FontAwesomeIcon icon={faPhone} />
                        <span>Контакт: {support.contact}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Intergenerational Programs */}
        {programsData.intergenerationalPrograms?.length > 0 && (
          <div className="club-pensioners-section">
            <h4 className="club-pensioners-section-title">
              <FontAwesomeIcon icon={faChild} />
              {t('clubs.pensioners.specialPrograms.intergenerationalPrograms.title')}
            </h4>
            
            <div className="club-pensioners-programs-list">
              {programsData.intergenerationalPrograms.map((program, index) => (
                <div key={index} className="club-pensioners-program-item">
                  <div className="program-icon">
                    <FontAwesomeIcon icon={faChild} />
                  </div>
                  <div className="program-content">
                    <h5>{program.name}</h5>
                    <div className="program-meta">
                      {program.venue && (
                        <span className="meta-item">
                          <FontAwesomeIcon icon={faBuilding} />
                          {program.venue}
                        </span>
                      )}
                      {program.ageRange && (
                        <span className="meta-item">
                          <FontAwesomeIcon icon={faUsers} />
                          {program.ageRange}
                        </span>
                      )}
                      {program.frequency && (
                        <span className="meta-item">
                          <FontAwesomeIcon icon={faCalendarAlt} />
                          {program.frequency}
                        </span>
                      )}
                      {program.coordinator && (
                        <span className="meta-item">
                          <FontAwesomeIcon icon={faUserFriends} />
                          {program.coordinator}
                        </span>
                      )}
                      {program.participants > 0 && (
                        <span className="meta-item">
                          <FontAwesomeIcon icon={faUsers} />
                          {program.participants} участници
                        </span>
                      )}
                    </div>
                    {program.description && (
                      <p className="program-description">{program.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderAgeSpecificNeeds = () => {
    const needsData = pensionersData.ageSpecificNeeds || {};

    return (
      <div className="club-pensioners-tab-content">
        {/* Low Impact Activities */}
        {needsData.lowImpactActivities?.length > 0 && (
          <div className="club-pensioners-section">
            <h4 className="club-pensioners-section-title">
              <FontAwesomeIcon icon={faDumbbell} />
              {t('clubs.pensioners.ageSpecificNeeds.lowImpactActivities.title')}
            </h4>
            
            <div className="club-pensioners-programs-list">
              {needsData.lowImpactActivities.map((activity, index) => (
                <div key={index} className="club-pensioners-program-item">
                  <div className="program-icon">
                    <FontAwesomeIcon icon={faDumbbell} />
                  </div>
                  <div className="program-content">
                    <h5>{activity.name}</h5>
                    <div className="program-meta">
                      <span className="meta-item">
                        <FontAwesomeIcon icon={faChartLine} />
                        Интензивност: {activity.intensity}
                      </span>
                      {activity.duration && (
                        <span className="meta-item">
                          <FontAwesomeIcon icon={faClock} />
                          {activity.duration}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Nutrition Support */}
        {needsData.nutritionSupport?.length > 0 && (
          <div className="club-pensioners-section">
            <h4 className="club-pensioners-section-title">
              <FontAwesomeIcon icon={faAppleAlt} />
              {t('clubs.pensioners.ageSpecificNeeds.nutritionSupport.title')}
            </h4>
            
            <div className="club-pensioners-programs-list">
              {needsData.nutritionSupport.map((support, index) => (
                <div key={index} className="club-pensioners-program-item">
                  <div className="program-icon">
                    <FontAwesomeIcon icon={faAppleAlt} />
                  </div>
                  <div className="program-content">
                    <h5>{support.service}</h5>
                    <div className="program-meta">
                      {support.provider && (
                        <span className="meta-item">
                          <FontAwesomeIcon icon={faBuilding} />
                          {support.provider}
                        </span>
                      )}
                      {support.frequency && (
                        <span className="meta-item">
                          <FontAwesomeIcon icon={faCalendarAlt} />
                          {support.frequency}
                        </span>
                      )}
                      {club.preferences?.showFinances && support.price && (
                        <span className="meta-item price">
                          <FontAwesomeIcon icon={faChartLine} />
                          {support.price}
                        </span>
                      )}
                    </div>
                    {support.coverage && (
                      <p className="program-description">{support.coverage}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'healthServices':
        return renderHealthServices();
      case 'supportServices':
        return renderSupportServices();
      case 'accessibility':
        return renderAccessibility();
      case 'specialPrograms':
        return renderSpecialPrograms();
      case 'ageSpecificNeeds':
        return renderAgeSpecificNeeds();
      default:
        return null;
    }
  };

  return (
    <section id="club-pensioners-specific" className="club-pensioners-specific">
      <div className="container-specific">
        <div className="club-pensioners-header">
          <h2 className="section-title">
            <FontAwesomeIcon icon={faUserMd} />
            {t('clubs.pensioners.sectionTitle')}
          </h2>
          <p className="section-subtitle">
            {t('clubs.pensioners.sectionSubtitle')}
          </p>
        </div>

        <div className="club-pensioners-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`club-pensioners-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <FontAwesomeIcon icon={tab.icon} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="club-pensioners-content">
          {renderTabContent()}
        </div>
      </div>
    </section>
  );
};

export default ClubPensionersSpecific;