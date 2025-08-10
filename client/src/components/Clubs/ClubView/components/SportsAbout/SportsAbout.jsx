import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHeartbeat,
  faDumbbell,
  faRunning,
  faShieldAlt,
  faUsers,
  faTrophy,
  faLeaf,
  faStethoscope,
  faUserMd,
  faWeight,
  faStopwatch,
  faFire,
  faMedal,
  faChartLine,
  faHandHoldingHeart,
  faEye,
  faEyeSlash,
  faChevronDown,
  faChevronUp,
  faMapMarkerAlt,
  faCalendarAlt,
  faClock,
  faWheelchair,
  faSwimmer,
  faBicycle,
  faWalking,
  faAppleAlt,
  faHome,
  faBuilding,
  faMobile // заменил faPhone с faMobile
} from '@fortawesome/free-solid-svg-icons';
import './sportsAbout.css';

export const SportsAbout = ({ club }) => {
  const [activeSection, setActiveSection] = useState('mission');
  const [expandedFacility, setExpandedFacility] = useState(null);

  // Проверяваме дали има необходимите данни
  if (!club?.fullDescription && 
      !club?.shortDescription &&
      !club?.foundedYear && 
      !club?.location?.venue &&
      !club?.membership &&
      !club?.management?.board &&
      !club?.activities?.regular) {
    return null;
  }

  // Събираме данни
  const description = club.fullDescription || club.shortDescription;
  const membership = club.membership || {};
  const location = club.location || {};
  const venue = location.venue || {};
  const management = club.management || {};
  const board = management.board || [];
  const activities = club.activities || {};
  const regularActivities = activities.regular || [];
  const pensionersSpecific = club.pensionersSpecific || {};
  const healthServices = pensionersSpecific.healthServices || {};
  const accessibility = pensionersSpecific.accessibility || {};
  const ageSpecificNeeds = pensionersSpecific.ageSpecificNeeds || {};

  // Ако няма основно описание, не показваме компонента
  if (!description && !club.foundedYear && !venue.facilities?.length) {
    return null;
  }

  // Секции за показване
  const sections = [
    { key: 'mission', label: 'Мисия', icon: faHeartbeat },
    { key: 'facilities', label: 'Съоръжения', icon: faBuilding },
    { key: 'safety', label: 'Безопасност', icon: faShieldAlt },
    { key: 'instructors', label: 'Екип', icon: faUserMd }
  ];

  // Спортни съоръжения и оборудване
  const facilities = venue.facilities || [];
  const sportsFacilities = [
    ...facilities.map(facility => ({
      name: facility,
      type: getFacilityType(facility),
      icon: getFacilityIcon(facility),
      description: getFacilityDescription(facility)
    }))
  ];

  // Helper функции
  function getFacilityType(facilityName) {
    const name = facilityName.toLowerCase();
    if (name.includes('басейн') || name.includes('вода')) return 'aquatic';
    if (name.includes('фитнес') || name.includes('зала') || name.includes('тренажор')) return 'fitness';
    if (name.includes('сауна') || name.includes('спа') || name.includes('масаж')) return 'wellness';
    if (name.includes('съблекални') || name.includes('стая') || name.includes('офис')) return 'support';
    return 'general';
  }

  function getFacilityIcon(facilityName) {
    const name = facilityName.toLowerCase();
    if (name.includes('басейн')) return faSwimmer;
    if (name.includes('фитнес') || name.includes('тренажор')) return faDumbbell;
    if (name.includes('сауна') || name.includes('спа')) return faLeaf;
    if (name.includes('салон') || name.includes('зала')) return faRunning;
    if (name.includes('съблекални')) return faUsers;
    if (name.includes('терапевтичен') || name.includes('медицинск')) return faStethoscope;
    return faBuilding;
  }

  function getFacilityDescription(facilityName) {
    const name = facilityName.toLowerCase();
    if (name.includes('басейн')) return 'Подходящ за водна аеробика и плуване';
    if (name.includes('фитнес')) return 'Модерно оборудване за силови тренировки';
    if (name.includes('сауна')) return 'За релаксация и възстановяване';
    if (name.includes('салон')) return 'Просторна зала за групови занимания';
    if (name.includes('съблекални')) return 'Удобни помещения с душове';
    if (name.includes('терапевтичен')) return 'За рехабилитация и лечебна гимнастика';
    return 'Част от спортния комплекс';
  }

  function getFacilityColor(type) {
    switch(type) {
      case 'aquatic': return '#06b6d4';
      case 'fitness': return '#f97316';
      case 'wellness': return '#22c55e';
      case 'support': return '#8b5cf6';
      default: return '#6b7280';
    }
  }

  // Инструктори от борда
  const instructors = board.filter(member => 
    member.role && (
      member.role.includes('треньор') || 
      member.role.includes('инструктор') ||
      member.bio?.toLowerCase().includes('треньор') ||
      member.bio?.toLowerCase().includes('инструктор') ||
      member.bio?.toLowerCase().includes('фитнес') ||
      member.bio?.toLowerCase().includes('спорт')
    )
  );

  // Здравни и безопасности мерки
  const safetyFeatures = [
    healthServices.regularCheckups && {
      icon: faStethoscope,
      text: 'Редовни здравни прегледи'
    },
    healthServices.bloodPressureMonitoring && {
      icon: faHeartbeat,
      text: 'Мониторинг на кръвното налягане'
    },
    healthServices.emergencyProtocol?.hasEmergencyPlan && {
      icon: faShieldAlt,
      text: 'Спешен план за действие'
    },
    accessibility.wheelchairAccess && {
      icon: faWheelchair,
      text: 'Достъп за хора с увреждания'
    },
    venue.accessibility && {
      icon: faShieldAlt,
      text: 'Безбариерна среда'
    }
  ].filter(Boolean);

  // Специализирани програми
  const specialPrograms = [
    ...ageSpecificNeeds.lowImpactActivities?.map(activity => ({
      name: activity.name,
      intensity: activity.intensity,
      suitableFor: activity.suitableFor || [],
      icon: getActivityIconByIntensity(activity.intensity)
    })) || []
  ];

  function getActivityIconByIntensity(intensity) {
    switch(intensity) {
      case 'ниска': return faLeaf;
      case 'средна': return faWalking;
      case 'висока': return faRunning;
      default: return faHeartbeat;
    }
  }

  const toggleFacility = (index) => {
    setExpandedFacility(expandedFacility === index ? null : index);
  };

  const formatFoundedYear = () => {
    if (!club.foundedYear) return null;
    const currentYear = new Date().getFullYear();
    const yearsActive = currentYear - club.foundedYear;
    return `Основан през ${club.foundedYear} г. (${yearsActive} години активност)`;
  };

  return (
    <section id="sports-about" className="sports-about-section">
      <div className="sports-about-container">
        
        {/* Header */}
        <div className="sports-about-header">
          <div className="sports-about-badge">
            <FontAwesomeIcon icon={faHeartbeat} />
            <span>За нашия клуб</span>
          </div>
          <h2 className="sports-about-title">
            Вашето здраве е нашият приоритет
          </h2>
          <p className="sports-about-subtitle">
            Открийте как помагаме на нашите членове да останат активни, здрави и щастливи
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="sports-about-nav">
          {sections.map(section => (
            <button
              key={section.key}
              onClick={() => setActiveSection(section.key)}
              className={`sports-about-nav-btn ${activeSection === section.key ? 'active' : ''}`}
            >
              <FontAwesomeIcon icon={section.icon} />
              <span>{section.label}</span>
            </button>
          ))}
        </div>

        {/* Content Sections */}
        <div className="sports-about-content">
          
          {/* Mission Section */}
          {activeSection === 'mission' && (
            <div className="sports-about-mission">
              <div className="sports-about-mission-main">
                <div className="sports-about-mission-text">
                  <h3>Нашата мисия</h3>
                  {description && <p>{description}</p>}
                  
                  {club.foundedYear && (
                    <div className="sports-about-founded">
                      <FontAwesomeIcon icon={faCalendarAlt} />
                      <span>{formatFoundedYear()}</span>
                    </div>
                  )}

                  {location.address && (
                    <div className="sports-about-location">
                      <FontAwesomeIcon icon={faMapMarkerAlt} />
                      <span>{location.address}</span>
                    </div>
                  )}
                </div>
                
                {club.mainImage && (
                  <div className="sports-about-mission-image">
                    <img src={club.mainImage} alt={club.name} />
                  </div>
                )}
              </div>

              {/* Membership Benefits */}
              {membership.benefits?.length > 0 && (
                <div className="sports-about-benefits">
                  <h4>
                    <FontAwesomeIcon icon={faTrophy} />
                    Предимства за членовете
                  </h4>
                  <div className="sports-about-benefits-grid">
                    {membership.benefits.map((benefit, index) => (
                      <div key={index} className="sports-about-benefit-item">
                        <FontAwesomeIcon icon={faHandHoldingHeart} />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Special Programs */}
              {specialPrograms.length > 0 && (
                <div className="sports-about-programs">
                  <h4>
                    <FontAwesomeIcon icon={faLeaf} />
                    Специализирани програми
                  </h4>
                  <div className="sports-about-programs-grid">
                    {specialPrograms.map((program, index) => (
                      <div key={index} className="sports-about-program-card">
                        <div className="sports-about-program-icon">
                          <FontAwesomeIcon icon={program.icon} />
                        </div>
                        <div className="sports-about-program-content">
                          <h5>{program.name}</h5>
                          <span className="sports-about-program-intensity">
                            Интензитет: {program.intensity}
                          </span>
                          {program.suitableFor.length > 0 && (
                            <div className="sports-about-program-suitable">
                              Подходящо за: {program.suitableFor.join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Facilities Section */}
          {activeSection === 'facilities' && (
            <div className="sports-about-facilities">
              <div className="sports-about-facilities-header">
                <h3>Нашите съоръжения</h3>
                <p>Модерно оборудване и удобства за всички ваши спортни нужди</p>
              </div>

              {venue.size && (
                <div className="sports-about-venue-info">
                  <div className="sports-about-venue-stat">
                    <FontAwesomeIcon icon={faBuilding} />
                    <div>
                      <span className="sports-about-venue-value">{venue.size}</span>
                      <span className="sports-about-venue-label">Обща площ</span>
                    </div>
                  </div>
                  {venue.capacity && (
                    <div className="sports-about-venue-stat">
                      <FontAwesomeIcon icon={faUsers} />
                      <div>
                        <span className="sports-about-venue-value">{venue.capacity}</span>
                        <span className="sports-about-venue-label">Капацитет</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {sportsFacilities.length > 0 && (
                <div className="sports-about-facilities-grid">
                  {sportsFacilities.map((facility, index) => (
                    <div 
                      key={index}
                      className="sports-about-facility-card"
                      style={{ '--facility-color': getFacilityColor(facility.type) }}
                    >
                      <div className="sports-about-facility-header">
                        <div className="sports-about-facility-icon">
                          <FontAwesomeIcon icon={facility.icon} />
                        </div>
                        <h4>{facility.name}</h4>
                        <button 
                          onClick={() => toggleFacility(index)}
                          className="sports-about-facility-toggle"
                        >
                          <FontAwesomeIcon 
                            icon={expandedFacility === index ? faChevronUp : faChevronDown} 
                          />
                        </button>
                      </div>
                      
                      {expandedFacility === index && (
                        <div className="sports-about-facility-content">
                          <p>{facility.description}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Safety Section */}
          {activeSection === 'safety' && (
            <div className="sports-about-safety">
              <div className="sports-about-safety-header">
                <h3>Безопасност и здраве</h3>
                <p>Вашата сигурност и здраве са нашият главен приоритет</p>
              </div>

              {safetyFeatures.length > 0 && (
                <div className="sports-about-safety-features">
                  <h4>Мерки за безопасност</h4>
                  <div className="sports-about-safety-grid">
                    {safetyFeatures.map((feature, index) => (
                      <div key={index} className="sports-about-safety-item">
                        <div className="sports-about-safety-icon">
                          <FontAwesomeIcon icon={feature.icon} />
                        </div>
                        <span>{feature.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {healthServices.medicalPartners?.length > 0 && (
                <div className="sports-about-medical-partners">
                  <h4>Медицински партньори</h4>
                  <div className="sports-about-partners-list">
                    {healthServices.medicalPartners.map((partner, index) => (
                      <div key={index} className="sports-about-partner-card">
                        <div className="sports-about-partner-icon">
                          <FontAwesomeIcon icon={faStethoscope} />
                        </div>
                        <div className="sports-about-partner-content">
                          <h5>{partner.name}</h5>
                          <p>{partner.service}</p>
                          {partner.contact && (
                            <div className="sports-about-partner-contact">
                              <FontAwesomeIcon icon={faMobile} />
                              <span>{partner.contact}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {healthServices.emergencyProtocol?.nearestHospital && (
                <div className="sports-about-emergency">
                  <h4>Спешна помощ</h4>
                  <div className="sports-about-emergency-info">
                    <FontAwesomeIcon icon={faMapMarkerAlt} />
                    <div>
                      <strong>Най-близка болница:</strong>
                      <span>{healthServices.emergencyProtocol.nearestHospital}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Instructors Section */}
          {activeSection === 'instructors' && (
            <div className="sports-about-instructors">
              <div className="sports-about-instructors-header">
                <h3>Нашият екип</h3>
                <p>Професионални инструктори и специалисти грижещи се за вашето здраве</p>
              </div>

              {instructors.length > 0 ? (
                <div className="sports-about-instructors-grid">
                  {instructors.map((instructor, index) => (
                    <div key={index} className="sports-about-instructor-card">
                      {instructor.avatar && (
                        <div className="sports-about-instructor-avatar">
                          <img src={instructor.avatar} alt={instructor.name} />
                        </div>
                      )}
                      <div className="sports-about-instructor-content">
                        <h4>{instructor.name}</h4>
                        <span className="sports-about-instructor-role">{instructor.role}</span>
                        {instructor.bio && (
                          <p className="sports-about-instructor-bio">{instructor.bio}</p>
                        )}
                        {instructor.phone && (
                          <div className="sports-about-instructor-contact">
                            <FontAwesomeIcon icon={faMobile} />
                            <span>{instructor.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="sports-about-no-instructors">
                  <FontAwesomeIcon icon={faUsers} />
                  <h4>Нашият екип</h4>
                  <p>Имаме опитни специалисти, които ще ви помогнат да постигнете целите си.</p>
                </div>
              )}

              {regularActivities.length > 0 && (
                <div className="sports-about-activities-preview">
                  <h4>Активности с инструктори</h4>
                  <div className="sports-about-activities-list">
                    {regularActivities.filter(activity => activity.instructor).map((activity, index) => (
                      <div key={index} className="sports-about-activity-item">
                        <div className="sports-about-activity-info">
                          <h5>{activity.name}</h5>
                          <span>Инструктор: {activity.instructor}</span>
                        </div>
                        <div className="sports-about-activity-schedule">
                          <FontAwesomeIcon icon={faClock} />
                          <span>{activity.day} • {activity.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default SportsAbout;