import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  faMobile
} from '@fortawesome/free-solid-svg-icons';
import './sportsAbout.css';

export const SportsAbout = ({ club }) => {
  const { t } = useTranslation('clubs');
  const [activeSection, setActiveSection] = useState('mission');
  const [expandedFacility, setExpandedFacility] = useState(null);

  if (!club?.fullDescription && 
      !club?.shortDescription &&
      !club?.foundedYear && 
      !club?.location?.venue &&
      !club?.membership &&
      !club?.management?.board &&
      !club?.activities?.regular) {
    return null;
  }

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

  if (!description && !club.foundedYear && !venue.facilities?.length) {
    return null;
  }

  const getSections = () => [
    { key: 'mission', label: t('clubs.SportsAbout.sections.mission'), icon: faHeartbeat },
    { key: 'facilities', label: t('clubs.SportsAbout.sections.facilities'), icon: faBuilding },
    { key: 'safety', label: t('clubs.SportsAbout.sections.safety'), icon: faShieldAlt },
    { key: 'instructors', label: t('clubs.SportsAbout.sections.instructors'), icon: faUserMd }
  ];

  const sections = getSections();

  const facilities = venue.facilities || [];

  const getFacilityType = (facilityName) => {
    const name = facilityName.toLowerCase();
    const facilityTerms = t('clubs.SportsAbout.facilityTerms', { returnObjects: true });
    
    for (const [typeKey, terms] of Object.entries(facilityTerms)) {
      if (terms.some(term => name.includes(term))) {
        return typeKey;
      }
    }
    return 'general';
  };

  const getFacilityIcon = (facilityName) => {
    const name = facilityName.toLowerCase();
    const iconTerms = t('clubs.SportsAbout.facilityIconTerms', { returnObjects: true });
    
    for (const [iconKey, terms] of Object.entries(iconTerms)) {
      if (terms.some(term => name.includes(term))) {
        const iconMap = {
          swimming: faSwimmer,
          fitness: faDumbbell,
          wellness: faLeaf,
          sports: faRunning,
          changing: faUsers,
          medical: faStethoscope
        };
        return iconMap[iconKey] || faBuilding;
      }
    }
    return faBuilding;
  };

  const getFacilityDescription = (facilityName) => {
    const name = facilityName.toLowerCase();
    const descriptionMap = t('clubs.SportsAbout.facilityDescriptions', { returnObjects: true });
    
    for (const [key, terms] of Object.entries(t('clubs.SportsAbout.facilityIconTerms', { returnObjects: true }))) {
      if (terms.some(term => name.includes(term))) {
        return descriptionMap[key];
      }
    }
    return descriptionMap.default;
  };

  const getFacilityColor = (type) => {
    const colorMap = {
      aquatic: '#06b6d4',
      fitness: '#f97316',
      wellness: '#22c55e',
      support: '#8b5cf6',
      general: '#6b7280'
    };
    return colorMap[type] || '#6b7280';
  };

  const sportsFacilities = facilities.map(facility => ({
    name: facility,
    type: getFacilityType(facility),
    icon: getFacilityIcon(facility),
    description: getFacilityDescription(facility)
  }));

  const getInstructorKeywords = () => t('clubs.SportsAbout.instructorKeywords', { returnObjects: true });

  const instructors = board.filter(member => {
    const keywords = getInstructorKeywords();
    return member.role && keywords.some(keyword => 
      member.role.includes(keyword) || 
      member.bio?.toLowerCase().includes(keyword)
    );
  });

  const getSafetyFeatures = () => [
    healthServices.regularCheckups && {
      icon: faStethoscope,
      text: t('clubs.SportsAbout.safetyFeatures.regularCheckups')
    },
    healthServices.bloodPressureMonitoring && {
      icon: faHeartbeat,
      text: t('clubs.SportsAbout.safetyFeatures.bloodPressureMonitoring')
    },
    healthServices.emergencyProtocol?.hasEmergencyPlan && {
      icon: faShieldAlt,
      text: t('clubs.SportsAbout.safetyFeatures.emergencyPlan')
    },
    accessibility.wheelchairAccess && {
      icon: faWheelchair,
      text: t('clubs.SportsAbout.safetyFeatures.wheelchairAccess')
    },
    venue.accessibility && {
      icon: faShieldAlt,
      text: t('clubs.SportsAbout.safetyFeatures.barrierFree')
    }
  ].filter(Boolean);

  const safetyFeatures = getSafetyFeatures();

  const getActivityIconByIntensity = (intensity) => {
    const intensityMap = {
      [t('clubs.SportsAbout.intensityLevels.low')]: faLeaf,
      [t('clubs.SportsAbout.intensityLevels.medium')]: faWalking,
      [t('clubs.SportsAbout.intensityLevels.high')]: faRunning
    };
    return intensityMap[intensity] || faHeartbeat;
  };

  const specialPrograms = [
    ...ageSpecificNeeds.lowImpactActivities?.map(activity => ({
      name: activity.name,
      intensity: activity.intensity,
      suitableFor: activity.suitableFor || [],
      icon: getActivityIconByIntensity(activity.intensity)
    })) || []
  ];

  const toggleFacility = (index) => {
    setExpandedFacility(expandedFacility === index ? null : index);
  };

  const formatFoundedYear = () => {
    if (!club.foundedYear) return null;
    const currentYear = new Date().getFullYear();
    const yearsActive = currentYear - club.foundedYear;
    return t('clubs.SportsAbout.foundedYear', { 
      year: club.foundedYear, 
      yearsActive 
    });
  };

  return (
    <section id="sports-about" className="sports-about-section">
      <div className="sports-about-container">
        
        <div className="sports-about-header">
          <div className="sports-about-badge">
            <FontAwesomeIcon icon={faHeartbeat} />
            <span>{t('clubs.SportsAbout.header.badge')}</span>
          </div>
          <h2 className="sports-about-title">
            {t('clubs.SportsAbout.header.title')}
          </h2>
          <p className="sports-about-subtitle">
            {t('clubs.SportsAbout.header.subtitle')}
          </p>
        </div>

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

        <div className="sports-about-content">
          
          {activeSection === 'mission' && (
            <div className="sports-about-mission">
              <div className="sports-about-mission-main">
                <div className="sports-about-mission-text">
                  <h3>{t('clubs.SportsAbout.mission.title')}</h3>
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

              {membership.benefits?.length > 0 && (
                <div className="sports-about-benefits">
                  <h4>
                    <FontAwesomeIcon icon={faTrophy} />
                    {t('clubs.SportsAbout.mission.membershipBenefits')}
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

              {specialPrograms.length > 0 && (
                <div className="sports-about-programs">
                  <h4>
                    <FontAwesomeIcon icon={faLeaf} />
                    {t('clubs.SportsAbout.mission.specialPrograms')}
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
                            {t('clubs.SportsAbout.mission.intensity')}: {program.intensity}
                          </span>
                          {program.suitableFor.length > 0 && (
                            <div className="sports-about-program-suitable">
                              {t('clubs.SportsAbout.mission.suitableFor')}: {program.suitableFor.join(', ')}
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

          {activeSection === 'facilities' && (
            <div className="sports-about-facilities">
              <div className="sports-about-facilities-header">
                <h3>{t('clubs.SportsAbout.facilities.title')}</h3>
                <p>{t('clubs.SportsAbout.facilities.subtitle')}</p>
              </div>

              {venue.size && (
                <div className="sports-about-venue-info">
                  <div className="sports-about-venue-stat">
                    <FontAwesomeIcon icon={faBuilding} />
                    <div>
                      <span className="sports-about-venue-value">{venue.size}</span>
                      <span className="sports-about-venue-label">{t('clubs.SportsAbout.facilities.totalArea')}</span>
                    </div>
                  </div>
                  {venue.capacity && (
                    <div className="sports-about-venue-stat">
                      <FontAwesomeIcon icon={faUsers} />
                      <div>
                        <span className="sports-about-venue-value">{venue.capacity}</span>
                        <span className="sports-about-venue-label">{t('clubs.SportsAbout.facilities.capacity')}</span>
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

          {activeSection === 'safety' && (
            <div className="sports-about-safety">
              <div className="sports-about-safety-header">
                <h3>{t('clubs.SportsAbout.safety.title')}</h3>
                <p>{t('clubs.SportsAbout.safety.subtitle')}</p>
              </div>

              {safetyFeatures.length > 0 && (
                <div className="sports-about-safety-features">
                  <h4>{t('clubs.SportsAbout.safety.measures')}</h4>
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
                  <h4>{t('clubs.SportsAbout.safety.medicalPartners')}</h4>
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
                  <h4>{t('clubs.SportsAbout.safety.emergencyHelp')}</h4>
                  <div className="sports-about-emergency-info">
                    <FontAwesomeIcon icon={faMapMarkerAlt} />
                    <div>
                      <strong>{t('clubs.SportsAbout.safety.nearestHospital')}:</strong>
                      <span>{healthServices.emergencyProtocol.nearestHospital}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeSection === 'instructors' && (
            <div className="sports-about-instructors">
              <div className="sports-about-instructors-header">
                <h3>{t('clubs.SportsAbout.instructors.title')}</h3>
                <p>{t('clubs.SportsAbout.instructors.subtitle')}</p>
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
                  <h4>{t('clubs.SportsAbout.instructors.ourTeam')}</h4>
                  <p>{t('clubs.SportsAbout.instructors.teamDescription')}</p>
                </div>
              )}

              {regularActivities.length > 0 && (
                <div className="sports-about-activities-preview">
                  <h4>{t('clubs.SportsAbout.instructors.activitiesWithInstructors')}</h4>
                  <div className="sports-about-activities-list">
                    {regularActivities.filter(activity => activity.instructor).map((activity, index) => (
                      <div key={index} className="sports-about-activity-item">
                        <div className="sports-about-activity-info">
                          <h5>{activity.name}</h5>
                          <span>{t('clubs.SportsAbout.instructors.instructor')}: {activity.instructor}</span>
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