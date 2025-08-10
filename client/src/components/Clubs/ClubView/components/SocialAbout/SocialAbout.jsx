import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers,
  faCalendarAlt,
  faMapMarkerAlt,
  faAward,
  faHeart,
  faHandshake,
  faGem,
  faCrown,
  faLeaf,
  faTree,
  faStar,
  faQuoteLeft,
  faHistory,
  faEye,
  faLightbulb,
  faChurch,
  faGlobe,
  faListCheck,
  faHandHoldingHeart,
  faUserFriends,
  faMedkit,
  faHome,
  faHandsHelping
} from '@fortawesome/free-solid-svg-icons';
import './socialAbout.css';

export const SocialAbout = ({ club }) => {
  // Проверяваме дали има необходимите данни
  if (!club?.name) {
    return null;
  }

  // Основна информация
  const hasBasicInfo = club.fullDescription || club.shortDescription;
  
  // Статистики за about секцията - САМО с реални данни
  const aboutStats = [];
  if (club.stats?.totalMembers) {
    aboutStats.push({
      icon: faUsers,
      label: 'Активни членове',
      value: club.stats.totalMembers,
      color: '#16a34a'
    });
  }
  if (club.foundedYear) {
    const yearsActive = new Date().getFullYear() - club.foundedYear;
    aboutStats.push({
      icon: faCalendarAlt,
      label: 'Години дейност',
      value: yearsActive,
      color: '#0891b2'
    });
  }
  if (club.stats?.programs) {
    aboutStats.push({
      icon: faListCheck,
      label: 'Програми',
      value: club.stats.programs,
      color: '#dc2626'
    });
  }
  if (club.stats?.projectsBeneficiaries) {
    aboutStats.push({
      icon: faHandHoldingHeart,
      label: 'Помогнати хора',
      value: club.stats.projectsBeneficiaries,
      color: '#7c3aed'
    });
  }

  // Ползи от членството - САМО ако има данни
  const benefits = club.membership?.benefits || [];

  // Изисквания за членство - САМО ако има данни
  const requirements = club.membership?.requirements || [];

  // Награди и постижения - САМО ако има данни
  const achievements = club.achievements?.awards || [];
  const recognitions = club.achievements?.recognitions || [];

  // Социално въздействие - САМО ако има данни
  const volunteering = club.socialImpact?.volunteering || [];
  const communityProjects = club.socialImpact?.communityProjects || [];

  // Специални услуги за пенсионери - САМО ако има данни
  const supportServices = club.pensionersSpecific?.supportServices;
  const healthServices = club.pensionersSpecific?.healthServices;
  const hasSpecialPrograms = club.pensionersSpecific?.specialPrograms && 
    (club.pensionersSpecific.specialPrograms.memoryActivities?.length > 0 ||
     club.pensionersSpecific.specialPrograms.intergenerationalPrograms?.length > 0 ||
     club.pensionersSpecific.specialPrograms.volunteerPrograms?.length > 0);

  // Ако няма почти нищо за показване, не показваме компонента
  if (!hasBasicInfo && aboutStats.length === 0 && benefits.length === 0 && 
      achievements.length === 0 && volunteering.length === 0 && 
      communityProjects.length === 0 && !supportServices && !healthServices) {
    return null;
  }

  return (
    <section id="social-about" className="social-about-main-section">
      <div className="social-about-container">
        
        {/* Header */}
        <div className="social-about-header">
          <div className="social-about-badge">
            <FontAwesomeIcon icon={faHeart} />
            <span>За нашия клуб</span>
          </div>
          <h2 className="social-about-title">Нашата мисия и ценности</h2>
          {club.shortDescription && (
            <p className="social-about-subtitle">
              {club.shortDescription}
            </p>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="social-about-main-grid">
          
          {/* Story Section - показва се САМО ако има описание */}
          {club.fullDescription && (
            <div className="social-about-story">
              <div className="social-about-story-header">
                <FontAwesomeIcon icon={faQuoteLeft} />
                <h3>Нашата история</h3>
              </div>
              <div className="social-about-story-content">
                <p>{club.fullDescription}</p>
                {club.foundedYear && (
                  <div className="social-about-founded">
                    <FontAwesomeIcon icon={faCalendarAlt} />
                    <span>Основан през {club.foundedYear} година</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Stats Grid - показва се САМО ако има статистики */}
          {aboutStats.length > 0 && (
            <div className="social-about-stats">
              <h3>Нашето въздействие</h3>
              <div className="social-about-stats-grid">
                {aboutStats.map((stat, index) => (
                  <div key={index} className="social-about-stat-card">
                    <div 
                      className="social-about-stat-icon"
                      style={{ backgroundColor: stat.color }}
                    >
                      <FontAwesomeIcon icon={stat.icon} />
                    </div>
                    <div className="social-about-stat-content">
                      <div className="social-about-stat-value">{stat.value}</div>
                      <div className="social-about-stat-label">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Additional Info Grid - показва се САМО при наличие на данни */}
        {(benefits.length > 0 || requirements.length > 0 || (supportServices && Object.values(supportServices).some(v => v === true))) && (
          <div className="social-about-info-grid">
            
            {/* Benefits - показва се САМО ако има ползи */}
            {benefits.length > 0 && (
              <div className="social-about-benefits">
                <div className="social-about-section-header">
                  <FontAwesomeIcon icon={faGem} />
                  <h3>Ползи от членството</h3>
                </div>
                <div className="social-about-benefits-list">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="social-about-benefit-item">
                      <FontAwesomeIcon icon={faStar} />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Requirements - показва се САМО ако има изисквания */}
            {requirements.length > 0 && (
              <div className="social-about-requirements">
                <div className="social-about-section-header">
                  <FontAwesomeIcon icon={faHandshake} />
                  <h3>Как да се присъедините</h3>
                </div>
                <div className="social-about-requirements-list">
                  {requirements.map((requirement, index) => (
                    <div key={index} className="social-about-requirement-item">
                      <FontAwesomeIcon icon={faLeaf} />
                      <span>{requirement}</span>
                    </div>
                  ))}
                </div>
                {/* Membership Fee - показва се САМО ако има данни за такса */}
                {club.membership?.membershipFee && (
                  <div className="social-about-membership-fee">
                    <h4>Членски внос</h4>
                    <div className="social-about-fee-options">
                      {club.membership.membershipFee.monthly && (
                        <div className="social-about-fee-option">
                          <span className="social-about-fee-amount">
                            {club.membership.membershipFee.monthly} {club.membership.membershipFee.currency}
                          </span>
                          <span className="social-about-fee-period">месечно</span>
                        </div>
                      )}
                      {club.membership.membershipFee.yearly && (
                        <div className="social-about-fee-option">
                          <span className="social-about-fee-amount">
                            {club.membership.membershipFee.yearly} {club.membership.membershipFee.currency}
                          </span>
                          <span className="social-about-fee-period">годишно</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Support Services - показва се САМО ако има услуги */}
            {supportServices && Object.values(supportServices).some(v => v === true) && (
              <div className="social-about-support-services">
                <div className="social-about-section-header">
                  <FontAwesomeIcon icon={faHandHoldingHeart} />
                  <h3>Нашите услуги</h3>
                </div>
                <div className="social-about-services-grid">
                  {supportServices.homeVisits && (
                    <div className="social-about-service-item">
                      <FontAwesomeIcon icon={faHome} />
                      <span>Домашни посещения</span>
                    </div>
                  )}
                  {supportServices.shoppingAssistance && (
                    <div className="social-about-service-item">
                      <FontAwesomeIcon icon={faHandsHelping} />
                      <span>Помощ при пазаруване</span>
                    </div>
                  )}
                  {supportServices.documentHelp && (
                    <div className="social-about-service-item">
                      <FontAwesomeIcon icon={faListCheck} />
                      <span>Помощ с документи</span>
                    </div>
                  )}
                  {supportServices.companionship && (
                    <div className="social-about-service-item">
                      <FontAwesomeIcon icon={faUserFriends} />
                      <span>Придружаване</span>
                    </div>
                  )}
                  {supportServices.transportService && (
                    <div className="social-about-service-item">
                      <FontAwesomeIcon icon={faMapMarkerAlt} />
                      <span>Транспортни услуги</span>
                    </div>
                  )}
                  {supportServices.mealDelivery && (
                    <div className="social-about-service-item">
                      <FontAwesomeIcon icon={faHeart} />
                      <span>Доставка на храна</span>
                    </div>
                  )}
                  {supportServices.cleaningHelp && (
                    <div className="social-about-service-item">
                      <FontAwesomeIcon icon={faHome} />
                      <span>Помощ за почистване</span>
                    </div>
                  )}
                  {(healthServices?.regularCheckups || healthServices?.bloodPressureMonitoring || healthServices?.healthLectures?.length > 0) && (
                    <div className="social-about-service-item">
                      <FontAwesomeIcon icon={faMedkit} />
                      <span>Здравни услуги</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Social Impact Section - показва се САМО ако има въздействие */}
        {(volunteering.length > 0 || communityProjects.length > 0) && (
          <div className="social-about-impact">
            <div className="social-about-impact-header">
              <FontAwesomeIcon icon={faGlobe} />
              <h3>Нашето социално въздействие</h3>
              <p>Как правим разлика в общността</p>
            </div>
            
            <div className="social-about-impact-grid">
              {/* Volunteering - показва се САМО ако има доброволческа дейност */}
              {volunteering.length > 0 && (
                <div className="social-about-volunteering">
                  <h4>Доброволчество</h4>
                  <div className="social-about-volunteering-list">
                    {volunteering.map((project, index) => (
                      <div key={index} className="social-about-volunteer-project">
                        <h5>{project.project}</h5>
                        <p>{project.description || `${project.participants} участници`}</p>
                        {project.coordinator && (
                          <div className="social-about-coordinator">
                            Координатор: {project.coordinator}
                          </div>
                        )}
                        {project.hoursPerMonth && (
                          <div className="social-about-hours">
                            {project.hoursPerMonth} часа месечно
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Community Projects - показва се САМО ако има проекти */}
              {communityProjects.length > 0 && (
                <div className="social-about-projects">
                  <h4>Общностни проекти</h4>
                  <div className="social-about-projects-list">
                    {communityProjects.map((project, index) => (
                      <div key={index} className="social-about-project-item">
                        <h5>{project.name}</h5>
                        <p>{project.description}</p>
                        <div className="social-about-project-details">
                          {project.beneficiaries && (
                            <span className="social-about-beneficiaries">
                              <FontAwesomeIcon icon={faUsers} />
                              {project.beneficiaries} бенефициенти
                            </span>
                          )}
                          <span className={`social-about-status ${project.status}`}>
                            {project.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Achievements Section - показва се САМО ако има награди/признания */}
        {(achievements.length > 0 || recognitions.length > 0) && (
          <div className="social-about-achievements">
            <div className="social-about-achievements-header">
              <FontAwesomeIcon icon={faCrown} />
              <h3>Нашите постижения</h3>
              <p>Признание за нашата дейност</p>
            </div>
            
            <div className="social-about-achievements-grid">
              {/* Awards - показва се САМО ако има награди */}
              {achievements.length > 0 && (
                <div className="social-about-awards">
                  <h4>Награди</h4>
                  <div className="social-about-awards-list">
                    {achievements.map((award, index) => (
                      <div key={index} className="social-about-award-item">
                        <div className="social-about-award-icon">
                          <FontAwesomeIcon icon={faAward} />
                        </div>
                        <div className="social-about-award-content">
                          <h5>{award.name}</h5>
                          <p>{award.description}</p>
                          <div className="social-about-award-details">
                            <span>{award.year}</span>
                            <span>•</span>
                            <span>{award.awardedBy}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recognitions - показва се САМО ако има признания */}
              {recognitions.length > 0 && (
                <div className="social-about-recognitions">
                  <h4>Признания</h4>
                  <div className="social-about-recognitions-list">
                    {recognitions.map((recognition, index) => (
                      <div key={index} className="social-about-recognition-item">
                        <FontAwesomeIcon icon={faHeart} />
                        <span>{recognition}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default SocialAbout;