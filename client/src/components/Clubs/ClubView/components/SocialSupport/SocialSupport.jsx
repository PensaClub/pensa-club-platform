import { useState } from 'react';
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
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedService, setExpandedService] = useState(null);

  // Проверяваме дали има необходимите данни
  if (!club?.pensionersSpecific?.supportServices && 
      !club?.pensionersSpecific?.healthServices && 
      !club?.pensionersSpecific?.accessibility) {
    return null;
  }

  // Събираме всички услуги
  const supportServices = club.pensionersSpecific?.supportServices || {};
  const healthServices = club.pensionersSpecific?.healthServices || {};
  const accessibility = club.pensionersSpecific?.accessibility || {};

  // Създаваме масив с всички налични услуги
  const allServices = [];

  // Support Services
  if (supportServices.homeVisits) {
    allServices.push({
      id: 'home-visits',
      name: 'Домашни посещения',
      description: 'Редовни посещения в дома за компания и подкрепа',
      category: 'home',
      icon: faHome,
      available: true,
      details: 'Нашите доброволци посещават самотни членове за разговор и моральна подкрепа'
    });
  }

  if (supportServices.shoppingAssistance) {
    allServices.push({
      id: 'shopping',
      name: 'Помощ при пазаруване',
      description: 'Придружаване или пазаруване вместо вас',
      category: 'daily',
      icon: faShoppingCart,
      available: true,
      details: 'Помагаме с ежедневните покупки и придружаваме до магазини'
    });
  }

  if (supportServices.documentHelp) {
    allServices.push({
      id: 'documents',
      name: 'Помощ с документи',
      description: 'Съдействие при попълване на документи и заявления',
      category: 'admin',
      icon: faFileAlt,
      available: true,
      details: 'Помагаме с административни процедури и документи'
    });
  }

  if (supportServices.companionship) {
    allServices.push({
      id: 'companionship',
      name: 'Придружаване',
      description: 'Компания при посещения и разходки',
      category: 'social',
      icon: faUserFriends,
      available: true,
      details: 'Придружаваме при посещения на лекар, срещи или разходки'
    });
  }

  if (supportServices.transportService) {
    allServices.push({
      id: 'transport',
      name: 'Транспортни услуги',
      description: 'Превоз до важни дестинации',
      category: 'transport',
      icon: faCar,
      available: true,
      details: 'Осигуряваме транспорт до болница, аптека и други важни места'
    });
  }

  if (supportServices.mealDelivery) {
    allServices.push({
      id: 'meals',
      name: 'Доставка на храна',
      description: 'Топла храна доставена в дома',
      category: 'daily',
      icon: faUtensils,
      available: true,
      details: 'Приготвяме и доставяме топли обяди за нуждаещи се членове'
    });
  }

  if (supportServices.cleaningHelp) {
    allServices.push({
      id: 'cleaning',
      name: 'Помощ за почистване',
      description: 'Съдействие при домашните дейности',
      category: 'home',
      icon: faBroom,
      available: true,
      details: 'Помагаме с основно почистване и домашни задачи'
    });
  }

  if (supportServices.techSupport) {
    allServices.push({
      id: 'tech',
      name: 'Техническа помощ',
      description: 'Помощ с компютри и технологии',
      category: 'tech',
      icon: faLaptop,
      available: true,
      details: 'Обучение и помощ при използване на технологии'
    });
  }

  // Health Services
  if (healthServices.regularCheckups) {
    allServices.push({
      id: 'checkups',
      name: 'Редовни здравни прегледи',
      description: 'Организирани медицински прегледи',
      category: 'health',
      icon: faStethoscope,
      available: true,
      details: 'Координираме редовни здравни прегледи с медицински партньори'
    });
  }

  if (healthServices.bloodPressureMonitoring) {
    allServices.push({
      id: 'blood-pressure',
      name: 'Измерване на кръвно налягане',
      description: 'Редовно наблюдение на кръвното налягане',
      category: 'health',
      icon: faHeartbeat,
      available: true,
      details: 'Безплатно измерване и проследяване на кръвното налягане'
    });
  }

  if (healthServices.healthLectures?.length > 0) {
    allServices.push({
      id: 'health-lectures',
      name: 'Здравни лекции',
      description: 'Образователни лекции за здравето',
      category: 'health',
      icon: faGraduationCap,
      available: true,
      details: `Провеждаме ${healthServices.healthLectures.length} вида здравни лекции`,
      lectures: healthServices.healthLectures
    });
  }

  // Accessibility Services
  const accessibilityServices = [];
  if (accessibility.wheelchairAccess) accessibilityServices.push('Достъп с инвалидна количка');
  if (accessibility.elevatorAccess) accessibilityServices.push('Асансьорен достъп');
  if (accessibility.hearingLoop) accessibilityServices.push('Слухово оборудване');
  if (accessibility.largeTextMaterials) accessibilityServices.push('Материали с едър шрифт');
  if (accessibility.handrails) accessibilityServices.push('Парапети и опори');
  if (accessibility.nonSlipFloors) accessibilityServices.push('Нехлъзгащи подове');
  if (accessibility.goodLighting) accessibilityServices.push('Добро осветление');
  if (accessibility.restingAreas) accessibilityServices.push('Места за почивка');

  if (accessibilityServices.length > 0) {
    allServices.push({
      id: 'accessibility',
      name: 'Достъпност и удобства',
      description: 'Приспособления за хора с увреждания',
      category: 'accessibility',
      icon: faWheelchair,
      available: true,
      details: 'Нашият клуб е оборудван с удобства за всички',
      features: accessibilityServices
    });
  }

  // Emergency Services
  const emergencyProtocol = healthServices.emergencyProtocol;
  if (emergencyProtocol?.hasEmergencyPlan) {
    allServices.push({
      id: 'emergency',
      name: 'Спешна помощ',
      description: 'Протокол за спешни случаи',
      category: 'emergency',
      icon: faAmbulance,
      available: true,
      details: 'Имаме установен протокол за действие при спешни случаи',
      protocol: emergencyProtocol
    });
  }

  // Ако няма услуги, не показваме компонента
  if (allServices.length === 0) {
    return null;
  }

  // Категории за филтриране
  const categories = [
    { key: 'all', label: 'Всички', icon: faHandHoldingHeart },
    { key: 'health', label: 'Здравеопазване', icon: faMedkit },
    { key: 'home', label: 'Домашни услуги', icon: faHome },
    { key: 'daily', label: 'Ежедневни нужди', icon: faShoppingCart },
    { key: 'social', label: 'Социални', icon: faUserFriends },
    { key: 'transport', label: 'Транспорт', icon: faCar },
    { key: 'emergency', label: 'Спешни', icon: faAmbulance },
    { key: 'accessibility', label: 'Достъпност', icon: faWheelchair }
  ];

  // Филтриране на услуги
  const filteredServices = allServices.filter(service => {
    const matchesCategory = activeCategory === 'all' || service.category === activeCategory;
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleServiceExpansion = (serviceId) => {
    setExpandedService(expandedService === serviceId ? null : serviceId);
  };

  function getCategoryColor(category) {
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
  }

  return (
    <section id="social-support" className="social-support-section">
      <div className="social-support-container">
        
        {/* Header */}
        <div className="social-support-header">
          <div className="social-support-header-content">
            <div className="social-support-badge">
              <FontAwesomeIcon icon={faShieldAlt} />
              <span>Наши услуги</span>
            </div>
            <h2 className="social-support-title">
              Грижим се за вашите нужди
            </h2>
            <p className="social-support-subtitle">
              Откриите всички услуги и подкрепа която предлагаме на нашите членове
            </p>
          </div>
          
          {/* Quick Stats */}
          <div className="social-support-quick-stats">
            <div className="social-support-stat">
              <span className="social-support-stat-number">{allServices.length}</span>
              <span className="social-support-stat-label">Налични услуги</span>
            </div>
            <div className="social-support-stat">
              <span className="social-support-stat-number">24/7</span>
              <span className="social-support-stat-label">Спешна помощ</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="social-support-controls">
          <div className="social-support-search-bar">
            <FontAwesomeIcon icon={faSearch} />
            <input
              type="text"
              placeholder="Търсете услуга..."
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

        {/* Services Grid */}
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
                  <span>Научете повече</span>
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
                        <h4>Налични лекции:</h4>
                        <ul>
                          {service.lectures.map((lecture, index) => (
                            <li key={index}>
                              <strong>{lecture.topic}</strong>
                              <span>Лектор: {lecture.lecturer}</span>
                              <span>Честота: {lecture.frequency}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {service.features && (
                      <div className="social-support-features">
                        <h4>Налични удобства:</h4>
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
                        <h4>Спешни контакти:</h4>
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
                            <span>Най-близка болница: {service.protocol.nearestHospital}</span>
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

        {/* No Results */}
        {filteredServices.length === 0 && (
          <div className="social-support-no-results">
            <FontAwesomeIcon icon={faQuestionCircle} />
            <h3>Няма намерени услуги</h3>
            <p>Опитайте с различни критерии за търсене</p>
            <button 
              onClick={() => {setActiveCategory('all'); setSearchTerm('');}}
              className="social-support-reset-btn"
            >
              Покажи всички услуги
            </button>
          </div>
        )}

        {/* Emergency Contact Bar */}
        {club.contacts && (
          <div className="social-support-emergency-bar">
            <div className="social-support-emergency-content">
              <div className="social-support-emergency-header">
                <FontAwesomeIcon icon={faExclamationTriangle} />
                <h3>При спешност</h3>
              </div>
              <div className="social-support-emergency-actions">
                <a href="tel:150" className="social-support-emergency-action primary">
                  <FontAwesomeIcon icon={faAmbulance} />
                  <div>
                    <span>Спешна помощ</span>
                    <strong>150</strong>
                  </div>
                </a>
                {club.contacts.phone && (
                  <a href={`tel:${club.contacts.phone}`} className="social-support-emergency-action secondary">
                    <FontAwesomeIcon icon={faPhone} />
                    <div>
                      <span>Клуб {club.name}</span>
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