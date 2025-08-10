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
  faListCheck
} from '@fortawesome/free-solid-svg-icons';
import './traditionalAbout.css';

export const TraditionalAbout = ({ club }) => {
  // Проверяваме дали има необходимите данни
  if (!club?.name) {
    return null;
  }

  // Основна информация
  const hasBasicInfo = club.fullDescription || club.shortDescription;
  
  // Статистики за about секцията - САМО с реални данни
  const aboutStats = [];
  if (club.membership?.totalMembers) {
    aboutStats.push({
      icon: faUsers,
      label: 'Активни членове',
      value: club.membership.totalMembers,
      color: '#dc2626'
    });
  }
  if (club.foundedYear) {
    const yearsActive = new Date().getFullYear() - club.foundedYear;
    aboutStats.push({
      icon: faCalendarAlt,
      label: 'Години традиция',
      value: yearsActive,
      color: '#d97706'
    });
  }
  if (club.stats?.programs) {
    aboutStats.push({
      icon: faListCheck,
      label: 'Програми',
      value: club.stats.programs,
      color: '#059669'
    });
  }
  if (club.stats?.events) {
    aboutStats.push({
      icon: faAward,
      label: 'Събития годишно',
      value: club.stats.events,
      color: '#7c3aed'
    });
  }

  // Възрастови групи - САМО ако има данни
  const ageGroups = club.membership?.ageGroups;
  const hasAgeGroups = ageGroups && Object.keys(ageGroups).length > 0;

  // Ползи от членството - САМО ако има данни
  const benefits = club.membership?.benefits || [];

  // Изисквания за членство - САМО ако има данни
  const requirements = club.membership?.requirements || [];

  // Награди и постижения - САМО ако има данни
  const achievements = club.achievements?.awards || [];
  const recognitions = club.achievements?.recognitions || [];

  // Социално въздействие - САМО ако има данни
  const volunteering = club.socialImpact?.volunteering || [];
  const partnerships = club.socialImpact?.partnerships || [];

  // Ако няма почти нищо за показване, не показваме компонента
  if (!hasBasicInfo && aboutStats.length === 0 && !hasAgeGroups && benefits.length === 0) {
    return null;
  }

  return (
    <section id="traditional-about" className="traditional-about-main-section">
      <div className="traditional-about-container">
        
        {/* Header */}
        <div className="traditional-about-header">
          <div className="traditional-about-badge">
            <FontAwesomeIcon icon={faHistory} />
            <span>За нашия клуб</span>
          </div>
          <h2 className="traditional-about-title">Нашата история и мисия</h2>
          {club.shortDescription && (
            <p className="traditional-about-subtitle">
              {club.shortDescription}
            </p>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="traditional-about-main-grid">
          
          {/* Story Section - показва се САМО ако има описание */}
          {club.fullDescription && (
            <div className="traditional-about-story">
              <div className="traditional-about-story-header">
                <FontAwesomeIcon icon={faQuoteLeft} />
                <h3>Нашата история</h3>
              </div>
              <div className="traditional-about-story-content">
                <p>{club.fullDescription}</p>
                {club.foundedYear && (
                  <div className="traditional-about-founded">
                    <FontAwesomeIcon icon={faCalendarAlt} />
                    <span>Основан през {club.foundedYear} година</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Stats Grid - показва се САМО ако има статистики */}
          {aboutStats.length > 0 && (
            <div className="traditional-about-stats">
              <h3>Нашите числа</h3>
              <div className="traditional-about-stats-grid">
                {aboutStats.map((stat, index) => (
                  <div key={index} className="traditional-about-stat-card">
                    <div 
                      className="traditional-about-stat-icon"
                      style={{ backgroundColor: stat.color }}
                    >
                      <FontAwesomeIcon icon={stat.icon} />
                    </div>
                    <div className="traditional-about-stat-content">
                      <div className="traditional-about-stat-value">{stat.value}</div>
                      <div className="traditional-about-stat-label">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Additional Info Grid - показва се САМО при наличие на данни */}
        {(hasAgeGroups || benefits.length > 0 || requirements.length > 0) && (
          <div className="traditional-about-info-grid">
            
            {/* Age Groups - показва се САМО ако има възрастови групи */}
            {hasAgeGroups && (
              <div className="traditional-about-demographics">
                <div className="traditional-about-section-header">
                  <FontAwesomeIcon icon={faUsers} />
                  <h3>Нашите членове</h3>
                </div>
                <div className="traditional-about-age-groups">
                  {Object.entries(ageGroups).map(([range, count]) => (
                    <div key={range} className="traditional-about-age-group">
                      <div className="traditional-about-age-range">{range} години</div>
                      <div className="traditional-about-age-count">{count} души</div>
                      <div 
                        className="traditional-about-age-bar"
                        style={{ 
                          width: `${(count / club.membership.totalMembers) * 100}%` 
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Benefits - показва се САМО ако има ползи */}
            {benefits.length > 0 && (
              <div className="traditional-about-benefits">
                <div className="traditional-about-section-header">
                  <FontAwesomeIcon icon={faGem} />
                  <h3>Ползи от членството</h3>
                </div>
                <div className="traditional-about-benefits-list">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="traditional-about-benefit-item">
                      <FontAwesomeIcon icon={faStar} />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Requirements - показва се САМО ако има изисквания */}
            {requirements.length > 0 && (
              <div className="traditional-about-requirements">
                <div className="traditional-about-section-header">
                  <FontAwesomeIcon icon={faHandshake} />
                  <h3>Как да се присъедините</h3>
                </div>
                <div className="traditional-about-requirements-list">
                  {requirements.map((requirement, index) => (
                    <div key={index} className="traditional-about-requirement-item">
                      <FontAwesomeIcon icon={faLeaf} />
                      <span>{requirement}</span>
                    </div>
                  ))}
                </div>
                {/* Membership Fee - показва се САМО ако има данни за такса */}
                {club.membership?.membershipFee && (
                  <div className="traditional-about-membership-fee">
                    <h4>Членски внос</h4>
                    <div className="traditional-about-fee-options">
                      {club.membership.membershipFee.monthly && (
                        <div className="traditional-about-fee-option">
                          <span className="traditional-about-fee-amount">
                            {club.membership.membershipFee.monthly} {club.membership.membershipFee.currency}
                          </span>
                          <span className="traditional-about-fee-period">месечно</span>
                        </div>
                      )}
                      {club.membership.membershipFee.yearly && (
                        <div className="traditional-about-fee-option">
                          <span className="traditional-about-fee-amount">
                            {club.membership.membershipFee.yearly} {club.membership.membershipFee.currency}
                          </span>
                          <span className="traditional-about-fee-period">годишно</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Achievements Section - показва се САМО ако има награди/признания */}
        {(achievements.length > 0 || recognitions.length > 0) && (
          <div className="traditional-about-achievements">
            <div className="traditional-about-achievements-header">
              <FontAwesomeIcon icon={faCrown} />
              <h3>Нашите постижения</h3>
              <p>Признание за нашата дейност през годините</p>
            </div>
            
            <div className="traditional-about-achievements-grid">
              {/* Awards - показва се САМО ако има награди */}
              {achievements.length > 0 && (
                <div className="traditional-about-awards">
                  <h4>Награди</h4>
                  <div className="traditional-about-awards-list">
                    {achievements.map((award, index) => (
                      <div key={index} className="traditional-about-award-item">
                        <div className="traditional-about-award-icon">
                          <FontAwesomeIcon icon={faAward} />
                        </div>
                        <div className="traditional-about-award-content">
                          <h5>{award.name}</h5>
                          <p>{award.description}</p>
                          <div className="traditional-about-award-details">
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
                <div className="traditional-about-recognitions">
                  <h4>Признания</h4>
                  <div className="traditional-about-recognitions-list">
                    {recognitions.map((recognition, index) => (
                      <div key={index} className="traditional-about-recognition-item">
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

        {/* Social Impact - показва се САМО ако има доброволчество/партньорства */}
        {(volunteering.length > 0 || partnerships.length > 0) && (
          <div className="traditional-about-impact">
            <div className="traditional-about-impact-header">
              <FontAwesomeIcon icon={faGlobe} />
              <h3>Нашето въздействие</h3>
              <p>Как допринасяме за общността</p>
            </div>
            
            <div className="traditional-about-impact-grid">
              {/* Volunteering - показва се САМО ако има доброволческа дейност */}
              {volunteering.length > 0 && (
                <div className="traditional-about-volunteering">
                  <h4>Доброволчество</h4>
                  <div className="traditional-about-volunteering-list">
                    {volunteering.map((project, index) => (
                      <div key={index} className="traditional-about-volunteer-project">
                        <h5>{project.project}</h5>
                        <p>{project.description || `${project.participants} участници`}</p>
                        {project.coordinator && (
                          <div className="traditional-about-coordinator">
                            Координатор: {project.coordinator}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Partnerships - показва се САМО ако има партньорства */}
              {partnerships.length > 0 && (
                <div className="traditional-about-partnerships">
                  <h4>Партньорства</h4>
                  <div className="traditional-about-partnerships-list">
                    {partnerships.map((partnership, index) => (
                      <div key={index} className="traditional-about-partnership-item">
                        <h5>{partnership.partner}</h5>
                        <div className="traditional-about-partnership-type">{partnership.type}</div>
                        {partnership.description && (
                          <p>{partnership.description}</p>
                        )}
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

export default TraditionalAbout;