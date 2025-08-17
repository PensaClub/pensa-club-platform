import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHandHoldingHeart,
  faHome,
  faShoppingCart,
  faFileAlt,
  faUserFriends,
  faCar,
  faUtensils,
  faBroom,
  faLaptop,
  faMedkit,
  faStethoscope,
  faHeartbeat,
  faGraduationCap,
  faWheelchair,
  faElevator,
  faVolumeUp,
  faTextHeight,
  faHandRock,
  faEye,
  faCouch,
  faPhone,
  faAmbulance,
  faHospital,
  faExclamationTriangle,
  faShieldAlt,
  faClock,
  faMapMarkerAlt,
  faInfoCircle,
  faCheckCircle,
  faTimesCircle,
  faQuestionCircle,
  faChevronRight,
  faChevronDown,
  faFilter,
  faSearch
} from '@fortawesome/free-solid-svg-icons';
import './socialSupport.css';

export const SocialSupport = ({ club }) => {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedService, setExpandedService] = useState(null);

  if (!club?.pensionersSpecific?.supportServices && 
      !club?.pensionersSpecific?.healthServices && 
      !club?.pensionersSpecific?.accessibility) {
    return null;
  }

  const supportServices = club.pensionersSpecific?.supportServices || {};
  const healthServices = club.pensionersSpecific?.healthServices || {};
  const accessibility = club.pensionersSpecific?.accessibility || {};

  const getServiceDefinitions = () => {
    const services = [];

    if (supportServices.homeVisits) {
      services.push({
        id: 'home-visits',
        name: t('clubs.SocialSupport.services.homeVisits.name'),
        description: t('clubs.SocialSupport.services.homeVisits.description'),
        category: 'home',
        icon: faHome,
        available: true,
        details: t('clubs.SocialSupport.services.homeVisits.details')
      });
    }

    if (supportServices.shoppingAssistance) {
      services.push({
        id: 'shopping',
        name: t('clubs.SocialSupport.services.shopping.name'),
        description: t('clubs.SocialSupport.services.shopping.description'),
        category: 'daily',
        icon: faShoppingCart,
        available: true,
        details: t('clubs.SocialSupport.services.shopping.details')
      });
    }

    if (supportServices.documentHelp) {
      services.push({
        id: 'documents',
        name: t('clubs.SocialSupport.services.documents.name'),
        description: t('clubs.SocialSupport.services.documents.description'),
        category: 'admin',
        icon: faFileAlt,
        available: true,
        details: t('clubs.SocialSupport.services.documents.details')
      });
    }

    if (supportServices.companionship) {
      services.push({
        id: 'companionship',
        name: t('clubs.SocialSupport.services.companionship.name'),
        description: t('clubs.SocialSupport.services.companionship.description'),
        category: 'social',
        icon: faUserFriends,
        available: true,
        details: t('clubs.SocialSupport.services.companionship.details')
      });
    }

    if (supportServices.transportService) {
      services.push({
        id: 'transport',
        name: t('clubs.SocialSupport.services.transport.name'),
        description: t('clubs.SocialSupport.services.transport.description'),
        category: 'transport',
        icon: faCar,
        available: true,
        details: t('clubs.SocialSupport.services.transport.details')
      });
    }

    if (supportServices.mealDelivery) {
      services.push({
        id: 'meals',
        name: t('clubs.SocialSupport.services.meals.name'),
        description: t('clubs.SocialSupport.services.meals.description'),
        category: 'daily',
        icon: faUtensils,
        available: true,
        details: t('clubs.SocialSupport.services.meals.details')
      });
    }

    if (supportServices.cleaningHelp) {
      services.push({
        id: 'cleaning',
        name: t('clubs.SocialSupport.services.cleaning.name'),
        description: t('clubs.SocialSupport.services.cleaning.description'),
        category: 'home',
        icon: faBroom,
        available: true,
        details: t('clubs.SocialSupport.services.cleaning.details')
      });
    }

    if (supportServices.techSupport) {
      services.push({
        id: 'tech',
        name: t('clubs.SocialSupport.services.tech.name'),
        description: t('clubs.SocialSupport.services.tech.description'),
        category: 'tech',
        icon: faLaptop,
        available: true,
        details: t('clubs.SocialSupport.services.tech.details')
      });
    }

    if (healthServices.regularCheckups) {
      services.push({
        id: 'checkups',
        name: t('clubs.SocialSupport.services.checkups.name'),
        description: t('clubs.SocialSupport.services.checkups.description'),
        category: 'health',
        icon: faStethoscope,
        available: true,
        details: t('clubs.SocialSupport.services.checkups.details')
      });
    }

    if (healthServices.bloodPressureMonitoring) {
      services.push({
        id: 'blood-pressure',
        name: t('clubs.SocialSupport.services.bloodPressure.name'),
        description: t('clubs.SocialSupport.services.bloodPressure.description'),
        category: 'health',
        icon: faHeartbeat,
        available: true,
        details: t('clubs.SocialSupport.services.bloodPressure.details')
      });
    }

    if (healthServices.healthLectures?.length > 0) {
      services.push({
        id: 'health-lectures',
        name: t('clubs.SocialSupport.services.healthLectures.name'),
        description: t('clubs.SocialSupport.services.healthLectures.description'),
        category: 'health',
        icon: faGraduationCap,
        available: true,
        details: t('clubs.SocialSupport.services.healthLectures.details', { count: healthServices.healthLectures.length }),
        lectures: healthServices.healthLectures
      });
    }

    const accessibilityFeatures = [];
    if (accessibility.wheelchairAccess) accessibilityFeatures.push(t('clubs.SocialSupport.accessibility.wheelchairAccess'));
    if (accessibility.elevatorAccess) accessibilityFeatures.push(t('clubs.SocialSupport.accessibility.elevatorAccess'));
    if (accessibility.hearingLoop) accessibilityFeatures.push(t('clubs.SocialSupport.accessibility.hearingLoop'));
    if (accessibility.largeTextMaterials) accessibilityFeatures.push(t('clubs.SocialSupport.accessibility.largeTextMaterials'));
    if (accessibility.handrails) accessibilityFeatures.push(t('clubs.SocialSupport.accessibility.handrails'));
    if (accessibility.nonSlipFloors) accessibilityFeatures.push(t('clubs.SocialSupport.accessibility.nonSlipFloors'));
    if (accessibility.goodLighting) accessibilityFeatures.push(t('clubs.SocialSupport.accessibility.goodLighting'));
    if (accessibility.restingAreas) accessibilityFeatures.push(t('clubs.SocialSupport.accessibility.restingAreas'));

    if (accessibilityFeatures.length > 0) {
      services.push({
        id: 'accessibility',
        name: t('clubs.SocialSupport.services.accessibility.name'),
        description: t('clubs.SocialSupport.services.accessibility.description'),
        category: 'accessibility',
        icon: faWheelchair,
        available: true,
        details: t('clubs.SocialSupport.services.accessibility.details'),
        features: accessibilityFeatures
      });
    }

    const emergencyProtocol = healthServices.emergencyProtocol;
    if (emergencyProtocol?.hasEmergencyPlan) {
      services.push({
        id: 'emergency',
        name: t('clubs.SocialSupport.services.emergency.name'),
        description: t('clubs.SocialSupport.services.emergency.description'),
        category: 'emergency',
        icon: faAmbulance,
        available: true,
        details: t('clubs.SocialSupport.services.emergency.details'),
        protocol: emergencyProtocol
      });
    }

    return services;
  };

  const allServices = getServiceDefinitions();

  if (allServices.length === 0) {
    return null;
  }

  const getCategories = () => [
    { key: 'all', label: t('clubs.SocialSupport.categories.all'), icon: faHandHoldingHeart },
    { key: 'health', label: t('clubs.SocialSupport.categories.health'), icon: faMedkit },
    { key: 'home', label: t('clubs.SocialSupport.categories.home'), icon: faHome },
    { key: 'daily', label: t('clubs.SocialSupport.categories.daily'), icon: faShoppingCart },
    { key: 'social', label: t('clubs.SocialSupport.categories.social'), icon: faUserFriends },
    { key: 'transport', label: t('clubs.SocialSupport.categories.transport'), icon: faCar },
    { key: 'emergency', label: t('clubs.SocialSupport.categories.emergency'), icon: faAmbulance },
    { key: 'accessibility', label: t('clubs.SocialSupport.categories.accessibility'), icon: faWheelchair }
  ];

  const categories = getCategories();

  const filteredServices = allServices.filter(service => {
    const matchesCategory = activeCategory === 'all' || service.category === activeCategory;
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleServiceExpansion = (serviceId) => {
    setExpandedService(expandedService === serviceId ? null : serviceId);
  };

  const getCategoryColor = (category) => {
    switch(category) {
      case 'health': return '#ef4444';
      case 'home': return '#10b981';
      case 'daily': return '#f59e0b';
      case 'social': return '#8b5cf6';
      case 'transport': return '#3b82f6';
      case 'emergency': return '#dc2626';
      case 'accessibility': return '#6366f1';
      case 'admin': return '#64748b';
      case 'tech': return '#06b6d4';
      default: return '#6b7280';
    }
  };

  const resetFilters = () => {
    setActiveCategory('all');
    setSearchTerm('');
  };

  return (
    <section id="social-support" className="social-support-section">
      <div className="social-support-container">
        
        <div className="social-support-header">
          <div className="social-support-header-content">
            <div className="social-support-badge">
              <FontAwesomeIcon icon={faShieldAlt} />
              <span>{t('clubs.SocialSupport.header.badge')}</span>
            </div>
            <h2 className="social-support-title">
              {t('clubs.SocialSupport.header.title')}
            </h2>
            <p className="social-support-subtitle">
              {t('clubs.SocialSupport.header.subtitle')}
            </p>
          </div>
          
          <div className="social-support-quick-stats">
            <div className="social-support-stat">
              <span className="social-support-stat-number">{allServices.length}</span>
              <span className="social-support-stat-label">{t('clubs.SocialSupport.stats.availableServices')}</span>
            </div>
            <div className="social-support-stat">
              <span className="social-support-stat-number">24/7</span>
              <span className="social-support-stat-label">{t('clubs.SocialSupport.stats.emergencyHelp')}</span>
            </div>
          </div>
        </div>

        <div className="social-support-controls">
          <div className="social-support-search-bar">
            <FontAwesomeIcon icon={faSearch} />
            <input
              type="text"
              placeholder={t('clubs.SocialSupport.search.placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="social-support-category-filters">
            {categories.map(category => (
              <button
                key={category.key}
                onClick={() => setActiveCategory(category.key)}
                className={`social-support-category-btn ${activeCategory === category.key ? 'active' : ''}`}
              >
                <FontAwesomeIcon icon={category.icon} />
                <span>{category.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="social-support-services-grid">
          {filteredServices.map((service) => (
            <div 
              key={service.id} 
              className={`social-support-service-card ${service.category}`}
              onClick={() => toggleServiceExpansion(service.id)}
            >
              <div className="social-support-service-header">
                <div 
                  className="social-support-service-icon"
                  style={{ backgroundColor: getCategoryColor(service.category) }}
                >
                  <FontAwesomeIcon icon={service.icon} />
                </div>
                <div className="social-support-service-status">
                  <FontAwesomeIcon 
                    icon={service.available ? faCheckCircle : faTimesCircle} 
                    className={service.available ? 'available' : 'unavailable'}
                  />
                </div>
              </div>
              
              <div className="social-support-service-content">
                <h3 className="social-support-service-name">{service.name}</h3>
                <p className="social-support-service-description">{service.description}</p>
                
                <button className="social-support-expand-btn">
                  <span>{t('clubs.SocialSupport.actions.learnMore')}</span>
                  <FontAwesomeIcon 
                    icon={expandedService === service.id ? faChevronDown : faChevronRight} 
                  />
                </button>
              </div>
              
              {expandedService === service.id && (
                <div className="social-support-service-details">
                  <div className="social-support-details-content">
                    <p>{service.details}</p>
                    
                    {service.lectures && (
                      <div className="social-support-lectures">
                        <h4>{t('clubs.SocialSupport.details.availableLectures')}:</h4>
                        <ul>
                          {service.lectures.map((lecture, index) => (
                            <li key={index}>
                              <strong>{lecture.topic}</strong>
                              <span>{t('clubs.SocialSupport.details.lecturer')}: {lecture.lecturer}</span>
                              <span>{t('clubs.SocialSupport.details.frequency')}: {lecture.frequency}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {service.features && (
                      <div className="social-support-features">
                        <h4>{t('clubs.SocialSupport.details.availableFeatures')}:</h4>
                        <ul>
                          {service.features.map((feature, index) => (
                            <li key={index}>
                              <FontAwesomeIcon icon={faCheckCircle} />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {service.protocol && (
                      <div className="social-support-protocol">
                        <h4>{t('clubs.SocialSupport.emergency.contacts')}:</h4>
                        <div className="social-support-emergency-contacts">
                          {service.protocol.emergencyContacts?.map((contact, index) => (
                            <a key={index} href={`tel:${contact}`} className="social-support-emergency-btn">
                              <FontAwesomeIcon icon={faPhone} />
                              <span>{contact}</span>
                            </a>
                          ))}
                        </div>
                        {service.protocol.nearestHospital && (
                          <div className="social-support-hospital">
                            <FontAwesomeIcon icon={faHospital} />
                            <span>{t('clubs.SocialSupport.emergency.nearestHospital')}: {service.protocol.nearestHospital}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredServices.length === 0 && (
          <div className="social-support-no-results">
            <FontAwesomeIcon icon={faQuestionCircle} />
            <h3>{t('clubs.SocialSupport.noResults.title')}</h3>
            <p>{t('clubs.SocialSupport.noResults.message')}</p>
            <button 
              onClick={resetFilters}
              className="social-support-reset-btn"
            >
              {t('clubs.SocialSupport.noResults.showAll')}
            </button>
          </div>
        )}

        {club.contacts && (
          <div className="social-support-emergency-bar">
            <div className="social-support-emergency-content">
              <div className="social-support-emergency-header">
                <FontAwesomeIcon icon={faExclamationTriangle} />
                <h3>{t('clubs.SocialSupport.emergency.title')}</h3>
              </div>
              <div className="social-support-emergency-actions">
                <a href="tel:150" className="social-support-emergency-action primary">
                  <FontAwesomeIcon icon={faAmbulance} />
                  <div>
                    <span>{t('clubs.SocialSupport.emergency.ambulance')}</span>
                    <strong>150</strong>
                  </div>
                </a>
                {club.contacts.phone && (
                  <a href={`tel:${club.contacts.phone}`} className="social-support-emergency-action secondary">
                    <FontAwesomeIcon icon={faPhone} />
                    <div>
                      <span>{t('clubs.SocialSupport.emergency.club')} {club.name}</span>
                      <strong>{club.contacts.phone}</strong>
                    </div>
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default SocialSupport;