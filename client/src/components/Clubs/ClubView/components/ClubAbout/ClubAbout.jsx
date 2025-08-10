import { faAward, faChevronDown, faChevronUp, faHandHoldingHeart, faHandsHelping, faHeart, faHistory, faMapMarkerAlt, faTrophy, faUsers } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import './clubAbout.css';
// В началото на компонента добави тези проверки:
export const ClubAbout = ({ club }) => {
  const [expandedSection, setExpandedSection] = useState('description');

  // Добави тези safe проверки
  const achievements = club.achievements || { awards: [], recognitions: [], certificates: [] };
  const socialImpact = club.socialImpact || { volunteering: [], communityProjects: [], partnerships: [] };
  const pensionersSpecific = club.pensionersSpecific || {
    healthServices: { regularCheckups: false, bloodPressureMonitoring: false, healthLectures: [] },
    supportServices: {},
    accessibility: {}
  };
  const regionalInfo = club.regionalInfo || null;

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const calculateAgePercentages = () => {
    const total = club.membership.totalMembers;
    const ageGroups = club.membership.ageGroups;
    
    return Object.entries(ageGroups).map(([range, count]) => ({
      range,
      count,
      percentage: Math.round((count / total) * 100)
    }));
  };

  const ageData = calculateAgePercentages();

  return (
    <section id="club-about" className="club-about">
      <div className="about-container">
        <div className="about-header">
          <h2>За клуба</h2>
          <p className="about-subtitle">
            Научете повече за нашата история, мисия и дейности
          </p>
        </div>

        <div className="about-content">
          {/* Основна информация */}
          <div className="about-section">
            <div 
              className="section-header"
              onClick={() => toggleSection('description')}
            >
              <h3>
                <FontAwesomeIcon icon={faUsers} />
                Описание на клуба
              </h3>
              <FontAwesomeIcon 
                icon={expandedSection === 'description' ? faChevronUp : faChevronDown}
                className="toggle-icon"
              />
            </div>
            
            {expandedSection === 'description' && (
              <div className="section-content">
                <div className="description-grid">
                  <div className="description-text">
                    <p>{club.fullDescription}</p>
                    
                    <div className="club-facts">
                      <div className="fact-item">
                        <FontAwesomeIcon icon={faHistory} />
                        <div>
                          <strong>Основан:</strong>
                          <span>{club.foundedYear} г. ({new Date().getFullYear() - club.foundedYear} години)</span>
                        </div>
                      </div>
                      
                      <div className="fact-item">
                        <FontAwesomeIcon icon={faMapMarkerAlt} />
                        <div>
                          <strong>Локация:</strong>
                          <span>{club.location.city}, {club.location.region}</span>
                        </div>
                      </div>
                      
                      <div className="fact-item">
                        <FontAwesomeIcon icon={faUsers} />
                        <div>
                          <strong>Общо членове:</strong>
                          <span>{club.membership.totalMembers} души</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Статистика по възрасти */}
                  <div className="age-statistics">
                    <h4>Възрастова структура</h4>
                    <div className="age-chart">
                      {ageData.map(({ range, count, percentage }) => (
                        <div key={range} className="age-group">
                          <div className="age-bar">
                            <div 
                              className="age-fill"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <div className="age-info">
                            <span className="age-range">{range} години</span>
                            <span className="age-count">{count} души ({percentage}%)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Постижения и награди - с проверка */}
          {(achievements.awards.length > 0 || achievements.recognitions.length > 0) && (
            <div className="about-section">
              <div 
                className="section-header"
                onClick={() => toggleSection('achievements')}
              >
                <h3>
                  <FontAwesomeIcon icon={faTrophy} />
                  Постижения и награди
                </h3>
                <FontAwesomeIcon 
                  icon={expandedSection === 'achievements' ? faChevronUp : faChevronDown}
                  className="toggle-icon"
                />
              </div>
              
              {expandedSection === 'achievements' && (
                <div className="section-content">
                  <div className="achievements-grid">
                    {achievements.awards.map((award, index) => (
                      <div key={index} className="achievement-card award">
                        <FontAwesomeIcon icon={faTrophy} className="achievement-icon" />
                        <div className="achievement-content">
                          <h4>{award.name}</h4>
                          <p>{award.description}</p>
                          <div className="achievement-meta">
                            <span>{award.year} г.</span>
                            <span>{award.awardedBy}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {achievements.recognitions.map((recognition, index) => (
                      <div key={index} className="achievement-card recognition">
                        <FontAwesomeIcon icon={faAward} className="achievement-icon" />
                        <div className="achievement-content">
                          <h4>Признание</h4>
                          <p>{recognition}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Социално въздействие - с проверка */}
          {(socialImpact.volunteering.length > 0 || socialImpact.communityProjects.length > 0) && (
            <div className="about-section">
              <div 
                className="section-header"
                onClick={() => toggleSection('impact')}
              >
                <h3>
                  <FontAwesomeIcon icon={faHandsHelping} />
                  Социално въздействие
                </h3>
                <FontAwesomeIcon 
                  icon={expandedSection === 'impact' ? faChevronUp : faChevronDown}
                  className="toggle-icon"
                />
              </div>
              
              {expandedSection === 'impact' && (
                <div className="section-content">
                  <div className="impact-grid">
                    {/* Доброволчество */}
                    {socialImpact.volunteering.length > 0 && (
                      <div className="impact-category">
                        <h4>
                          <FontAwesomeIcon icon={faHandHoldingHeart} />
                          Доброволчески проекти
                        </h4>
                        {socialImpact.volunteering.map((project, index) => (
                          <div key={index} className="impact-item">
                            <h5>{project.project}</h5>
                            <p>Координатор: {project.coordinator}</p>
                            <div className="project-stats">
                              <span>{project.participants} доброволци</span>
                              {project.hoursPerMonth && <span>{project.hoursPerMonth} часа месечно</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Проекти за общността */}
                    {socialImpact.communityProjects.length > 0 && (
                      <div className="impact-category">
                        <h4>
                          <FontAwesomeIcon icon={faUsers} />
                          Проекти за общността
                        </h4>
                        {socialImpact.communityProjects.map((project, index) => (
                          <div key={index} className="impact-item">
                            <h5>{project.name}</h5>
                            <p>{project.description}</p>
                            <div className="project-stats">
                              <span>{project.beneficiaries} ползватели</span>
                              <span className={`status ${project.status}`}>{project.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Специални услуги - с проверки */}
          <div className="about-section">
            <div 
              className="section-header"
              onClick={() => toggleSection('services')}
            >
              <h3>
                <FontAwesomeIcon icon={faHeart} />
                Специални услуги и грижи
              </h3>
              <FontAwesomeIcon 
                icon={expandedSection === 'services' ? faChevronUp : faChevronDown}
                className="toggle-icon"
              />
            </div>
            
            {expandedSection === 'services' && (
              <div className="section-content">
                <div className="services-grid">
                  {/* Здравни услуги */}
                  <div className="service-category">
                    <h4>Здравни услуги</h4>
                    <div className="service-items">
                      {pensionersSpecific.healthServices?.regularCheckups && (
                        <div className="service-item active">Редовни здравни прегледи</div>
                      )}
                      {pensionersSpecific.healthServices?.bloodPressureMonitoring && (
                        <div className="service-item active">Измерване на кръвно налягане</div>
                      )}
                      {pensionersSpecific.healthServices?.healthLectures?.length > 0 && (
                        <div className="service-item active">
                          Здравни лекции ({pensionersSpecific.healthServices.healthLectures.length})
                        </div>
                      )}
                      {(!pensionersSpecific.healthServices?.regularCheckups && 
                        !pensionersSpecific.healthServices?.bloodPressureMonitoring && 
                        !pensionersSpecific.healthServices?.healthLectures?.length) && (
                        <div className="service-item inactive">Все още няма здравни услуги</div>
                      )}
                    </div>
                  </div>

                  {/* Помощни услуги */}
                  <div className="service-category">
                    <h4>Помощни услуги</h4>
                    <div className="service-items">
                      {pensionersSpecific.supportServices && Object.entries(pensionersSpecific.supportServices).map(([key, value]) => {
                        const serviceNames = {
                          homeVisits: 'Домашни посещения',
                          shoppingAssistance: 'Помощ при пазаруване',
                          documentHelp: 'Помощ с документи',
                          companionship: 'Придружаване',
                          transportService: 'Транспортни услуги',
                          mealDelivery: 'Доставка на храна',
                          cleaningHelp: 'Помощ за почистване',
                          techSupport: 'Техническа подкрепа'
                        };
                        
                        return value && (
                          <div key={key} className="service-item active">
                            {serviceNames[key]}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Достъпност */}
                  <div className="service-category">
                    <h4>Достъпност</h4>
                    <div className="service-items">
                      {pensionersSpecific.accessibility && Object.entries(pensionersSpecific.accessibility).map(([key, value]) => {
                        const accessibilityNames = {
                          wheelchairAccess: 'Достъп с инвалидна количка',
                          elevatorAccess: 'Асансьор',
                          hearingLoop: 'Слухово оборудване',
                          largeTextMaterials: 'Материали с едър шрифт',
                          handrails: 'Парапети и опори',
                          nonSlipFloors: 'Нехлъзгащи подове',
                          goodLighting: 'Добро осветление',
                          restingAreas: 'Места за почивка'
                        };
                        
                        return (
                          <div key={key} className={`service-item ${value ? 'active' : 'inactive'}`}>
                            {accessibilityNames[key]}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Регионална информация - с проверка */}
          {regionalInfo && (
            <div className="about-section">
              <div 
                className="section-header"
                onClick={() => toggleSection('regional')}
              >
                <h3>
                  <FontAwesomeIcon icon={faMapMarkerAlt} />
                  Регионална информация
                </h3>
                <FontAwesomeIcon 
                  icon={expandedSection === 'regional' ? faChevronUp : faChevronDown}
                  className="toggle-icon"
                />
              </div>
              
              {expandedSection === 'regional' && (
                <div className="section-content">
                  <div className="regional-info">
                    <div className="regional-item">
                      <strong>Тип клуб:</strong>
                      <span className={`club-type ${regionalInfo.regionalRole}`}>
                        {regionalInfo.isCentralClub ? 'Централен клуб' : 'Местен клуб'}
                      </span>
                    </div>
                    
                    <div className="regional-item">
                      <strong>Обслужвана област:</strong>
                      <span>{regionalInfo.coverageArea}</span>
                    </div>
                    
                    {regionalInfo.affiliatedClubs?.length > 0 && (
                      <div className="regional-item">
                        <strong>Свързани клубове:</strong>
                        <span>{regionalInfo.affiliatedClubs.length} клуба в мрежата</span>
                      </div>
                    )}
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