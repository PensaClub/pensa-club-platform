// src/components/Clubs/ClubView/components/ClubPensionersSpecific/ClubPensionersSpecific.jsx
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

import './clubPensionersSpecific.css';

const ClubPensionersSpecific = ({ club }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('healthServices');
  const [expandedSections, setExpandedSections] = useState({});

  const pensionersData = club.pensionersSpecific || {};

  // Проверка дали има данни за показване
  const hasData = Object.keys(pensionersData).length > 0 && 
    Object.values(pensionersData).some(section => {
      if (typeof section === 'object' && section !== null) {
        return Object.keys(section).length > 0;
      }
      return false;
    });

  if (!hasData) {
    return null;
  }

  const tabs = [
    { 
      id: 'healthServices', 
      label: t('clubs.pensioners.tabs.healthServices'), 
      icon: faUserMd,
      hasData: pensionersData.healthServices && Object.keys(pensionersData.healthServices).length > 0
    },
    { 
      id: 'supportServices', 
      label: t('clubs.pensioners.tabs.supportServices'), 
      icon: faHandsHelping,
      hasData: pensionersData.supportServices && Object.keys(pensionersData.supportServices).length > 0
    },
    { 
      id: 'accessibility', 
      label: t('clubs.pensioners.tabs.accessibility'), 
      icon: faUniversalAccess,
      hasData: pensionersData.accessibility && Object.keys(pensionersData.accessibility).length > 0
    },
    { 
      id: 'specialPrograms', 
      label: t('clubs.pensioners.tabs.specialPrograms'), 
      icon: faBrain,
      hasData: pensionersData.specialPrograms && Object.keys(pensionersData.specialPrograms).length > 0
    },
    { 
      id: 'ageSpecificNeeds', 
      label: t('clubs.pensioners.tabs.ageSpecificNeeds'), 
      icon: faHeartbeat,
      hasData: pensionersData.ageSpecificNeeds && Object.keys(pensionersData.ageSpecificNeeds).length > 0
    }
  ].filter(tab => tab.hasData);

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
                      {/* Contact info - показва се само ако showContactForm е true */}
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
                      {/* Discount info - показва се само ако showFinances е true */}
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
                    <span>{healthData.emergencyProtocol.nearestHospital}</span>
                  </div>
                </div>
              )}

              {/* Emergency contacts - показва се само ако showContactForm е true */}
              {club.preferences?.showContactForm && healthData.emergencyProtocol.emergencyContacts?.length > 0 && (
                <div className="emergency-item">
                  <FontAwesomeIcon icon={faPhone} />
                  <div>
                    <strong>Телефони за спешни случаи:</strong>
                    <div className="emergency-contacts">
                      {healthData.emergencyProtocol.emergencyContacts.map((contact, index) => (
                        <span key={index} className="emergency-contact">{contact}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {healthData.emergencyProtocol.specialNeeds?.length > 0 && (
                <div className="emergency-item">
                  <FontAwesomeIcon icon={faInfoCircle} />
                  <div>
                    <strong>Специални нужди:</strong>
                    <ul className="special-needs-list">
                      {healthData.emergencyProtocol.specialNeeds.map((need, index) => (
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

    const availableServices = servicesList.filter(service => supportData[service.key]);

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

    const availableFeatures = accessibilityFeatures.filter(feature => accessibilityData[feature.key]);

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

        {/* Similar sections for other program types... */}
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
                      {/* Price info - показва се само ако showFinances е true */}
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

  if (tabs.length === 0) {
    return null;
  }

  return (
    <section id="club-pensioners-specific" className="club-pensioners-specific">
      <div className="container">
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