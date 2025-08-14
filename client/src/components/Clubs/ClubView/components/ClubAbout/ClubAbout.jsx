import { 
  faAward, 
  faChevronDown, 
  faChevronUp, 
  faHandHoldingHeart, 
  faHandsHelping, 
  faHeart, 
  faHistory, 
  faMapMarkerAlt, 
  faTrophy, 
  faUsers,
  faCalendarAlt,
  faInfoCircle,
  faShieldAlt,
  faUserShield,
  faHeartbeat,
  faHome,
  faEye,
  faEyeSlash,
  faCheckCircle,
  faTimesCircle,
  faBuilding,
  faUniversalAccess
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import './clubAbout.css';

export const ClubAbout = ({ club }) => {
  const [expandedSection, setExpandedSection] = useState('description');

  // ОСНОВНА ПРОВЕРКА - ако няма достатъчно данни, не показваме компонента
  if (!club?.name || (!club.fullDescription && !club.shortDescription)) {
    return null;
  }

  // Безопасно извличане на данни с fallbacks
  const getClubData = () => {
    const achievements = club.achievements || { awards: [], recognitions: [], certificates: [] };
    const socialImpact = club.socialImpact || { volunteering: [], communityProjects: [], partnerships: [] };
    const pensionersSpecific = club.pensionersSpecific || {
      healthServices: { regularCheckups: false, bloodPressureMonitoring: false, healthLectures: [] },
      supportServices: {},
      accessibility: {}
    };
    const regionalInfo = club.regionalInfo || null;

    return { achievements, socialImpact, pensionersSpecific, regionalInfo };
  };

  const { achievements, socialImpact, pensionersSpecific, regionalInfo } = getClubData();

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // Изчисляване на възрастова структура
  const calculateAgeData = () => {
    if (!club.membership?.ageGroups || !club.membership?.totalMembers) {
      return [];
    }

    const total = club.membership.totalMembers;
    const ageGroups = club.membership.ageGroups;
    
    return Object.entries(ageGroups).map(([range, count]) => ({
      range,
      count,
      percentage: Math.round((count / total) * 100)
    }));
  };

  const ageData = calculateAgeData();

  // Проверка дали има постижения
  const hasAchievements = () => {
    return achievements.awards.length > 0 || 
           achievements.recognitions.length > 0 || 
           achievements.certificates.length > 0;
  };

  // Проверка дали има социално въздействие
  const hasSocialImpact = () => {
    return socialImpact.volunteering.length > 0 || 
           socialImpact.communityProjects.length > 0 || 
           socialImpact.partnerships.length > 0;
  };

  // Проверка дали има услуги
  const hasServices = () => {
    const healthServices = pensionersSpecific.healthServices || {};
    const supportServices = pensionersSpecific.supportServices || {};
    const accessibility = pensionersSpecific.accessibility || {};

    return Object.values(healthServices).some(value => value === true || (Array.isArray(value) && value.length > 0)) ||
           Object.values(supportServices).some(value => value === true) ||
           Object.values(accessibility).some(value => value === true);
  };

  // Получаване на активни услуги
  const getActiveServices = () => {
    const healthServices = pensionersSpecific.healthServices || {};
    const supportServices = pensionersSpecific.supportServices || {};
    const accessibility = pensionersSpecific.accessibility || {};

    const serviceLabels = {
      // Health services
      regularCheckups: 'Редовни здравни прегледи',
      bloodPressureMonitoring: 'Измерване на кръвно налягане',
      healthLectures: 'Здравни лекции',
      
      // Support services
      homeVisits: 'Домашни посещения',
      shoppingAssistance: 'Помощ при пазаруване',
      documentHelp: 'Помощ с документи',
      companionship: 'Придружаване',
      transportService: 'Транспортни услуги',
      mealDelivery: 'Доставка на храна',
      cleaningHelp: 'Помощ за почистване',
      techSupport: 'Техническа подкрепа',
      
      // Accessibility
      wheelchairAccess: 'Достъп с инвалидна количка',
      elevatorAccess: 'Асансьор',
      hearingLoop: 'Слухово оборудване',
      largeTextMaterials: 'Материали с едър шрифт',
      handrails: 'Парапети и опори',
      nonSlipFloors: 'Нехлъзгащи подове',
      goodLighting: 'Добро осветление',
      restingAreas: 'Места за почивка'
    };

    const services = {
      health: [],
      support: [],
      accessibility: []
    };

    // Health services
    Object.entries(healthServices).forEach(([key, value]) => {
      if (value === true || (Array.isArray(value) && value.length > 0)) {
        const label = serviceLabels[key];
        if (label) {
          services.health.push({
            key,
            label,
            value: Array.isArray(value) ? `${label} (${value.length})` : label,
            active: true
          });
        }
      }
    });

    // Support services
    Object.entries(supportServices).forEach(([key, value]) => {
      if (value === true) {
        const label = serviceLabels[key];
        if (label) {
          services.support.push({
            key,
            label,
            active: true
          });
        }
      }
    });

    // Accessibility
    Object.entries(accessibility).forEach(([key, value]) => {
      const label = serviceLabels[key];
      if (label) {
        services.accessibility.push({
          key,
          label,
          active: value === true
        });
      }
    });

    return services;
  };

  const activeServices = getActiveServices();

  return (
    <section id="general-club-about" className="general-about-main">
      <div className="general-about-container">
        
        {/* Header с динамичен дизайн */}
        <div className="general-about-header">
          <div className="general-about-header-content">
            <div className="general-about-badge">
              <FontAwesomeIcon icon={faInfoCircle} />
              <span>За нашия клуб</span>
            </div>
            <h2 className="general-about-title">Научете повече за нас</h2>
            <p className="general-about-subtitle">
              Историята, мисията и всичко, което прави клуба ни специален
            </p>
          </div>
          
          {/* Stats overview */}
          <div className="general-about-stats">
            <div className="general-about-stat">
              <FontAwesomeIcon icon={faHistory} />
              <span>{club.foundedYear ? new Date().getFullYear() - club.foundedYear : '—'}</span>
              <label>години</label>
            </div>
            <div className="general-about-stat">
              <FontAwesomeIcon icon={faUsers} />
              <span>{club.membership?.totalMembers || '—'}</span>
              <label>членове</label>
            </div>
            <div className="general-about-stat">
              <FontAwesomeIcon icon={faMapMarkerAlt} />
              <span>{club.location?.city || '—'}</span>
              <label>град</label>
            </div>
          </div>
        </div>

        <div className="general-about-content">
          
          {/* Основна информация - винаги показваме */}
          <div className="general-about-section">
            <div 
              className="general-section-header"
              onClick={() => toggleSection('description')}
            >
              <div className="general-section-title">
                <FontAwesomeIcon icon={faUsers} />
                <h3>История и описание</h3>
              </div>
              <FontAwesomeIcon 
                icon={expandedSection === 'description' ? faChevronUp : faChevronDown}
                className="general-toggle-icon"
              />
            </div>
            
            {expandedSection === 'description' && (
              <div className="general-section-content">
                <div className="general-description-layout">
                  
                  {/* Основен текст */}
                  <div className="general-description-main">
                    <div className="general-description-text">
                      <p>{club.fullDescription || club.shortDescription}</p>
                    </div>
                    
                    {/* Ключови факти */}
                    <div className="general-key-facts">
                      {club.foundedYear && (
                        <div className="general-fact-card">
                          <div className="general-fact-icon">
                            <FontAwesomeIcon icon={faHistory} />
                          </div>
                          <div className="general-fact-content">
                            <span className="general-fact-label">Основан</span>
                            <span className="general-fact-value">
                              {club.foundedYear} г. ({new Date().getFullYear() - club.foundedYear} години активност)
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {(club.location?.city || club.location?.region) && (
                        <div className="general-fact-card">
                          <div className="general-fact-icon">
                            <FontAwesomeIcon icon={faMapMarkerAlt} />
                          </div>
                          <div className="general-fact-content">
                            <span className="general-fact-label">Локация</span>
                            <span className="general-fact-value">
                              {club.location.city}{club.location.region && `, ${club.location.region}`}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {club.membership?.totalMembers && (
                        <div className="general-fact-card">
                          <div className="general-fact-icon">
                            <FontAwesomeIcon icon={faUsers} />
                          </div>
                          <div className="general-fact-content">
                            <span className="general-fact-label">Членове</span>
                            <span className="general-fact-value">{club.membership.totalMembers} души</span>
                          </div>
                        </div>
                      )}

                      {club.location?.venue && (
                        <div className="general-fact-card">
                          <div className="general-fact-icon">
                            <FontAwesomeIcon icon={faBuilding} />
                          </div>
                          <div className="general-fact-content">
                            <span className="general-fact-label">Помещение</span>
                            <span className="general-fact-value">
                              {club.location.venue.size} • {club.location.venue.capacity} места
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Възрастова статистика - само ако има данни */}
                  {ageData.length > 0 && (
                    <div className="general-age-demographics">
                      <h4>
                        <FontAwesomeIcon icon={faCalendarAlt} />
                        Възрастова структура
                      </h4>
                      <div className="general-age-chart">
                        {ageData.map(({ range, count, percentage }) => (
                          <div key={range} className="general-age-group">
                            <div className="general-age-info">
                              <span className="general-age-range">{range} години</span>
                              <span className="general-age-percentage">{percentage}%</span>
                            </div>
                            <div className="general-age-bar">
                              <div 
                                className="general-age-fill"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="general-age-count">{count} души</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Постижения - само ако има данни */}
          {hasAchievements() && (
            <div className="general-about-section">
              <div 
                className="general-section-header"
                onClick={() => toggleSection('achievements')}
              >
                <div className="general-section-title">
                  <FontAwesomeIcon icon={faTrophy} />
                  <h3>Постижения и награди</h3>
                  <span className="general-section-count">
                    {achievements.awards.length + achievements.recognitions.length + achievements.certificates.length}
                  </span>
                </div>
                <FontAwesomeIcon 
                  icon={expandedSection === 'achievements' ? faChevronUp : faChevronDown}
                  className="general-toggle-icon"
                />
              </div>
              
              {expandedSection === 'achievements' && (
                <div className="general-section-content">
                  <div className="general-achievements-grid">
                    
                    {/* Награди */}
                    {achievements.awards.map((award, index) => (
                      <div key={`award-${index}`} className="general-achievement-card award">
                        <div className="general-achievement-icon">
                          <FontAwesomeIcon icon={faTrophy} />
                        </div>
                        <div className="general-achievement-content">
                          <h4>{award.name}</h4>
                          <p>{award.description}</p>
                          <div className="general-achievement-meta">
                            {award.year && <span>📅 {award.year} г.</span>}
                            {award.awardedBy && <span>🏛️ {award.awardedBy}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Признания */}
                    {achievements.recognitions.map((recognition, index) => (
                      <div key={`recognition-${index}`} className="general-achievement-card recognition">
                        <div className="general-achievement-icon">
                          <FontAwesomeIcon icon={faAward} />
                        </div>
                        <div className="general-achievement-content">
                          <h4>Признание</h4>
                          <p>{recognition}</p>
                        </div>
                      </div>
                    ))}

                    {/* Сертификати */}
                    {achievements.certificates.map((certificate, index) => (
                      <div key={`certificate-${index}`} className="general-achievement-card certificate">
                        <div className="general-achievement-icon">
                          <FontAwesomeIcon icon={faShieldAlt} />
                        </div>
                        <div className="general-achievement-content">
                          <h4>{certificate.name}</h4>
                          <div className="general-achievement-meta">
                            {certificate.issueDate && <span>📅 Издаден: {new Date(certificate.issueDate).getFullYear()}</span>}
                            {certificate.issuedBy && <span>🏛️ {certificate.issuedBy}</span>}
                            {certificate.validUntil && <span>⏰ Валиден до: {new Date(certificate.validUntil).getFullYear()}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Социално въздействие - само ако има данни */}
          {hasSocialImpact() && (
            <div className="general-about-section">
              <div 
                className="general-section-header"
                onClick={() => toggleSection('impact')}
              >
                <div className="general-section-title">
                  <FontAwesomeIcon icon={faHandsHelping} />
                  <h3>Социално въздействие</h3>
                  <span className="general-section-count">
                    {socialImpact.volunteering.length + socialImpact.communityProjects.length + socialImpact.partnerships.length}
                  </span>
                </div>
                <FontAwesomeIcon 
                  icon={expandedSection === 'impact' ? faChevronUp : faChevronDown}
                  className="general-toggle-icon"
                />
              </div>
              
              {expandedSection === 'impact' && (
                <div className="general-section-content">
                  <div className="general-impact-layout">
                    
                    {/* Доброволчество */}
                    {socialImpact.volunteering.length > 0 && (
                      <div className="general-impact-category">
                        <h4>
                          <FontAwesomeIcon icon={faHandHoldingHeart} />
                          Доброволчески проекти
                        </h4>
                        <div className="general-impact-items">
                          {socialImpact.volunteering.map((project, index) => (
                            <div key={index} className="general-impact-item">
                              <div className="general-impact-header">
                                <h5>{project.project}</h5>
                                <div className="general-impact-stats">
                                  <span>👥 {project.participants} доброволци</span>
                                  {project.hoursPerMonth && <span>⏱️ {project.hoursPerMonth}ч/месец</span>}
                                </div>
                              </div>
                              {project.coordinator && (
                                <p>Координатор: <strong>{project.coordinator}</strong></p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Проекти за общността */}
                    {socialImpact.communityProjects.length > 0 && (
                      <div className="general-impact-category">
                        <h4>
                          <FontAwesomeIcon icon={faUsers} />
                          Проекти за общността
                        </h4>
                        <div className="general-impact-items">
                          {socialImpact.communityProjects.map((project, index) => (
                            <div key={index} className="general-impact-item">
                              <div className="general-impact-header">
                                <h5>{project.name}</h5>
                                <div className="general-impact-stats">
                                  {project.beneficiaries && <span>👥 {project.beneficiaries} ползватели</span>}
                                  {project.status && (
                                    <span className={`general-status ${project.status.toLowerCase()}`}>
                                      {project.status}
                                    </span>
                                  )}
                                </div>
                              </div>
                              {project.description && <p>{project.description}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Партньорства */}
                    {socialImpact.partnerships.length > 0 && (
                      <div className="general-impact-category">
                        <h4>
                          <FontAwesomeIcon icon={faHandsHelping} />
                          Партньорства
                        </h4>
                        <div className="general-impact-items">
                          {socialImpact.partnerships.map((partnership, index) => (
                            <div key={index} className="general-impact-item">
                              <div className="general-impact-header">
                                <h5>{partnership.partner}</h5>
                                <span className="general-partnership-type">{partnership.type}</span>
                              </div>
                              {partnership.description && <p>{partnership.description}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Услуги и грижи - само ако има данни */}
          {hasServices() && (
            <div className="general-about-section">
              <div 
                className="general-section-header"
                onClick={() => toggleSection('services')}
              >
                <div className="general-section-title">
                  <FontAwesomeIcon icon={faHeart} />
                  <h3>Услуги и грижи</h3>
                </div>
                <FontAwesomeIcon 
                  icon={expandedSection === 'services' ? faChevronUp : faChevronDown}
                  className="general-toggle-icon"
                />
              </div>
              
              {expandedSection === 'services' && (
                <div className="general-section-content">
                  <div className="general-services-grid">
                    
                    {/* Здравни услуги */}
                    {activeServices.health.length > 0 && (
                      <div className="general-service-category">
                        <h4>
                          <FontAwesomeIcon icon={faHeartbeat} />
                          Здравни услуги
                        </h4>
                        <div className="general-service-list">
                          {activeServices.health.map((service, index) => (
                            <div key={index} className="general-service-item active">
                              <FontAwesomeIcon icon={faCheckCircle} />
                              <span>{service.value || service.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Помощни услуги */}
                    {activeServices.support.length > 0 && (
                      <div className="general-service-category">
                        <h4>
                          <FontAwesomeIcon icon={faHome} />
                          Помощни услуги
                        </h4>
                        <div className="general-service-list">
                          {activeServices.support.map((service, index) => (
                            <div key={index} className="general-service-item active">
                              <FontAwesomeIcon icon={faCheckCircle} />
                              <span>{service.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Достъпност */}
                    {activeServices.accessibility.length > 0 && (
                      <div className="general-service-category">
                        <h4>
                          <FontAwesomeIcon icon={faUniversalAccess} />
                          Достъпност
                        </h4>
                        <div className="general-service-list">
                          {activeServices.accessibility.map((service, index) => (
                            <div key={index} className={`general-service-item ${service.active ? 'active' : 'inactive'}`}>
                              <FontAwesomeIcon icon={service.active ? faCheckCircle : faTimesCircle} />
                              <span>{service.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Регионална информация - само ако има данни */}
          {regionalInfo && (
            <div className="general-about-section">
              <div 
                className="general-section-header"
                onClick={() => toggleSection('regional')}
              >
                <div className="general-section-title">
                  <FontAwesomeIcon icon={faMapMarkerAlt} />
                  <h3>Регионална информация</h3>
                </div>
                <FontAwesomeIcon 
                  icon={expandedSection === 'regional' ? faChevronUp : faChevronDown}
                  className="general-toggle-icon"
                />
              </div>
              
              {expandedSection === 'regional' && (
                <div className="general-section-content">
                  <div className="general-regional-info">
                    <div className="general-regional-grid">
                      <div className="general-regional-item">
                        <div className="general-regional-icon">
                          <FontAwesomeIcon icon={faUserShield} />
                        </div>
                        <div className="general-regional-content">
                          <span className="general-regional-label">Тип клуб</span>
                          <span className={`general-club-type ${regionalInfo.regionalRole}`}>
                            {regionalInfo.isCentralClub ? 'Централен клуб' : 'Местен клуб'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="general-regional-item">
                        <div className="general-regional-icon">
                          <FontAwesomeIcon icon={faMapMarkerAlt} />
                        </div>
                        <div className="general-regional-content">
                          <span className="general-regional-label">Обслужвана област</span>
                          <span className="general-regional-value">{regionalInfo.coverageArea}</span>
                        </div>
                      </div>
                      
                      {regionalInfo.affiliatedClubs?.length > 0 && (
                        <div className="general-regional-item">
                          <div className="general-regional-icon">
                            <FontAwesomeIcon icon={faUsers} />
                          </div>
                          <div className="general-regional-content">
                            <span className="general-regional-label">Свързани клубове</span>
                            <span className="general-regional-value">
                              {regionalInfo.affiliatedClubs.length} клуба в мрежата
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
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

export default ClubAbout;