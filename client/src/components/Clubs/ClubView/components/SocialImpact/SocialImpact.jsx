import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChartLine,
  faUsers,
  faHandsHelping,
  faHeart,
  faGlobe,
  faCalendarAlt,
  faClock,
  faAward,
  faLightbulb,
  faHandHoldingHeart,
  faUserFriends,
  faHome,
  faUtensils,
  faMedkit,
  faGraduationCap,
  faTree,
  faBuilding,
  faHandshake,
  faChartBar,
  faArrowUp,
  faArrowDown,
  faCheckCircle,
  faStopwatch,
  faCalendar,
  faMapMarkerAlt,
  faEuroSign,
  faPercentage,
  faFlag,
  faPhone,
  faEnvelope,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import './socialImpact.css';

export const SocialImpact = ({ club }) => {
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [animatedNumbers, setAnimatedNumbers] = useState({});
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  // Проверяваме дали има необходимите данни
  if (!club?.socialImpact?.communityProjects && 
      !club?.socialImpact?.volunteering && 
      !club?.socialImpact?.partnerships && 
      !club?.stats) {
    return null;
  }

  // Събираме данни за въздействието
  const communityProjects = club.socialImpact?.communityProjects || [];
  const volunteering = club.socialImpact?.volunteering || [];
  const partnerships = club.socialImpact?.partnerships || [];
  const stats = club.stats || {};

  // Изчисляваме метрики
  const totalBeneficiaries = communityProjects.reduce((sum, project) => sum + (project.beneficiaries || 0), 0);
  const totalVolunteers = volunteering.reduce((sum, vol) => sum + (vol.participants || 0), 0);
  const totalHours = volunteering.reduce((sum, vol) => sum + (vol.hoursPerMonth || 0), 0) * 12; // годишно
  const activeCommunityProjects = communityProjects.filter(p => p.status === 'активен').length;
  const totalBudget = communityProjects.reduce((sum, project) => sum + (project.budget || 0), 0);
  const yearsActive = club.foundedYear ? new Date().getFullYear() - club.foundedYear : 0;

  // Главни метрики
  const keyMetrics = [
    {
      id: 'beneficiaries',
      label: 'Помогнати хора',
      value: totalBeneficiaries || stats.projectsBeneficiaries || 0,
      icon: faUsers,
      color: '#3b82f6',
      description: 'Общ брой хора, които са получили помощ от нашите програми',
      trend: '+15%',
      period: 'тази година'
    },
    {
      id: 'volunteers',
      label: 'Активни доброволци',
      value: totalVolunteers || stats.totalMembers || 0,
      icon: faHandsHelping,
      color: '#10b981',
      description: 'Брой хора, които активно участват в доброволческите ни програми',
      trend: '+23%',
      period: 'спрямо миналата година'
    },
    {
      id: 'hours',
      label: 'Доброволчески часове',
      value: totalHours || 0,
      icon: faClock,
      color: '#f59e0b',
      description: 'Общо отработени часове от доброволци през годината',
      trend: '+8%',
      period: 'средно месечно'
    },
    {
      id: 'projects',
      label: 'Активни проекти',
      value: activeCommunityProjects || stats.programs || 0,
      icon: faLightbulb,
      color: '#8b5cf6',
      description: 'Брой програми и проекти, които в момента се изпълняват',
      trend: '+12%',
      period: 'нови проекти'
    }
  ];

  // Филтрираме метриките които имат стойност > 0
  const validMetrics = keyMetrics.filter(metric => metric.value > 0);

  // Ако няма валидни метрики, не показваме компонента
  if (validMetrics.length === 0) {
    return null;
  }

  // Анимация на числата
  useEffect(() => {
    const animateNumber = (finalValue, duration = 2000) => {
      const increment = finalValue / (duration / 16);
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= finalValue) {
          current = finalValue;
          clearInterval(timer);
        }
        return Math.floor(current);
      }, 16);
      
      return timer;
    };

    // Стартираме анимацията за всяка метрика
    validMetrics.forEach(metric => {
      const timer = animateNumber(metric.value);
      setAnimatedNumbers(prev => ({
        ...prev,
        [metric.id]: { value: metric.value, timer }
      }));
    });

    // Cleanup
    return () => {
      Object.values(animatedNumbers).forEach(item => {
        if (item.timer) clearInterval(item.timer);
      });
    };
  }, []);

  // Helper функции
  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getCategoryIcon = (projectName) => {
    const name = projectName.toLowerCase();
    if (name.includes('дом') || name.includes('топъл')) return faHome;
    if (name.includes('храна') || name.includes('обяд')) return faUtensils;
    if (name.includes('здрав') || name.includes('медицин')) return faMedkit;
    if (name.includes('образование') || name.includes('учене')) return faGraduationCap;
    if (name.includes('околна') || name.includes('парк')) return faTree;
    return faHeart;
  };

  const getCategoryColor = (projectName) => {
    const name = projectName.toLowerCase();
    if (name.includes('дом') || name.includes('топъл')) return '#10b981';
    if (name.includes('храна') || name.includes('обяд')) return '#f59e0b';
    if (name.includes('здрав') || name.includes('медицин')) return '#ef4444';
    if (name.includes('образование') || name.includes('учене')) return '#3b82f6';
    if (name.includes('околна') || name.includes('парк')) return '#22c55e';
    return '#8b5cf6';
  };

  const handleMetricClick = (metric) => {
    setSelectedMetric(selectedMetric?.id === metric.id ? null : metric);
  };

  return (
    <section id="social-impact" className="social-impact-section">
      <div className="social-impact-container">
        
        {/* Header */}
        <div className="social-impact-header">
          <div className="social-impact-header-content">
            <div className="social-impact-badge">
              <FontAwesomeIcon icon={faChartLine} />
              <span>Нашето въздействие</span>
            </div>
            <h2 className="social-impact-title">
              Мериме промяната която правим
            </h2>
            <p className="social-impact-subtitle">
              Всяка цифра разказва история за хора, които сме помогнали и общността, която сме подкрепили
            </p>
          </div>
          
          {/* Years Active */}
          {yearsActive > 0 && (
            <div className="social-impact-years-badge">
              <div className="social-impact-years-number">{yearsActive}</div>
              <div className="social-impact-years-label">години активност</div>
            </div>
          )}
        </div>

        {/* Key Metrics Dashboard */}
        <div className="social-impact-metrics-dashboard">
          {validMetrics.map((metric, index) => (
            <div 
              key={metric.id}
              className={`social-impact-metric-card ${selectedMetric?.id === metric.id ? 'expanded' : ''}`}
              onClick={() => handleMetricClick(metric)}
              style={{ '--delay': `${index * 0.1}s` }}
            >
              <div className="social-impact-metric-header">
                <div 
                  className="social-impact-metric-icon"
                  style={{ backgroundColor: metric.color }}
                >
                  <FontAwesomeIcon icon={metric.icon} />
                </div>
                <div className="social-impact-metric-trend">
                  <FontAwesomeIcon icon={faArrowUp} />
                  <span>{metric.trend}</span>
                </div>
              </div>
              
              <div className="social-impact-metric-content">
                <div className="social-impact-metric-number">
                  {formatNumber(metric.value)}
                </div>
                <div className="social-impact-metric-label">
                  {metric.label}
                </div>
                <div className="social-impact-metric-period">
                  {metric.period}
                </div>
              </div>
              
              {selectedMetric?.id === metric.id && (
                <div className="social-impact-metric-details">
                  <p>{metric.description}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Projects Impact Grid */}
        {communityProjects.length > 0 && (
          <div className="social-impact-projects-section">
            <h3 className="social-impact-section-title">
              <FontAwesomeIcon icon={faFlag} />
              Проекти с въздействие
            </h3>
            
            <div className="social-impact-projects-grid">
              {communityProjects.map((project, index) => (
                <div 
                  key={project.name}
                  className="social-impact-project-card"
                  style={{ '--project-delay': `${index * 0.15}s` }}
                >
                  <div className="social-impact-project-header">
                    <div 
                      className="social-impact-project-icon"
                      style={{ backgroundColor: getCategoryColor(project.name) }}
                    >
                      <FontAwesomeIcon icon={getCategoryIcon(project.name)} />
                    </div>
                    <div 
                      className="social-impact-project-status"
                      style={{ 
                        backgroundColor: project.status === 'активен' ? '#10b981' : 
                                        project.status === 'завършен' ? '#64748b' : '#f59e0b'
                      }}
                    >
                      {project.status}
                    </div>
                  </div>
                  
                  <div className="social-impact-project-content">
                    <h4 className="social-impact-project-name">{project.name}</h4>
                    <p className="social-impact-project-description">{project.description}</p>
                    
                    <div className="social-impact-project-metrics">
                      {project.beneficiaries && (
                        <div className="social-impact-project-metric">
                          <FontAwesomeIcon icon={faUsers} />
                          <span>{project.beneficiaries} човека</span>
                        </div>
                      )}
                      {project.budget && (
                        <div className="social-impact-project-metric">
                          <FontAwesomeIcon icon={faEuroSign} />
                          <span>{project.budget} лв.</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Partnerships Network */}
        {partnerships.length > 0 && (
          <div className="social-impact-partnerships-section">
            <h3 className="social-impact-section-title">
              <FontAwesomeIcon icon={faHandshake} />
              Мрежа от партньори
            </h3>
            
            <div className="social-impact-partnerships-grid">
              {partnerships.map((partnership, index) => (
                <div 
                  key={partnership.partner}
                  className="social-impact-partnership-card"
                  style={{ '--partner-delay': `${index * 0.1}s` }}
                >
                  <div className="social-impact-partnership-header">
                    <h4>{partnership.partner}</h4>
                    <span className="social-impact-partnership-type">
                      {partnership.type}
                    </span>
                  </div>
                  <p className="social-impact-partnership-description">
                    {partnership.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Impact Timeline */}
        {yearsActive > 0 && (
          <div className="social-impact-timeline-section">
            <h3 className="social-impact-section-title">
              <FontAwesomeIcon icon={faCalendar} />
              Нашето развитие през годините
            </h3>
            
            <div className="social-impact-timeline">
              <div className="social-impact-timeline-item">
                <div className="social-impact-timeline-year">{club.foundedYear}</div>
                <div className="social-impact-timeline-content">
                  <h4>Основаване на клуба</h4>
                  <p>Започнахме нашето пътуване с мисията да помагаме на общността</p>
                </div>
              </div>
              
              {club.achievements?.awards && club.achievements.awards.map((award, index) => (
                <div key={index} className="social-impact-timeline-item">
                  <div className="social-impact-timeline-year">{award.year}</div>
                  <div className="social-impact-timeline-content">
                    <h4>{award.name}</h4>
                    <p>{award.description}</p>
                    <span className="social-impact-timeline-source">от {award.awardedBy}</span>
                  </div>
                </div>
              ))}
              
              <div className="social-impact-timeline-item current">
                <div className="social-impact-timeline-year">{new Date().getFullYear()}</div>
                <div className="social-impact-timeline-content">
                  <h4>Продължаваме напред</h4>
                  <p>С {totalBeneficiaries > 0 ? totalBeneficiaries : 'много'} помогнати хора и {validMetrics.length} активни програми</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="social-impact-cta-section">
          <div className="social-impact-cta-content">
            <FontAwesomeIcon icon={faHandHoldingHeart} />
            <h3>Станете част от промяната</h3>
            <p>Всяка цифра представлява реален човек, който е получил помощ. Присъединете се към нас и помогнете да увеличим тези числа.</p>
            <div className="social-impact-cta-buttons">
              <button 
                onClick={() => setShowJoinModal(true)}
                className="social-impact-cta-btn primary"
              >
                <FontAwesomeIcon icon={faUsers} />
                <span>Включете се</span>
              </button>
              
              <button 
                onClick={() => setShowInfoModal(true)}
                className="social-impact-cta-btn secondary"
              >
                <FontAwesomeIcon icon={faHeart} />
                <span>Научете повече</span>
              </button>
            </div>
          </div>
        </div>

        {/* Join Modal */}
        {showJoinModal && (
          <div className="social-impact-modal" onClick={() => setShowJoinModal(false)}>
            <div className="social-impact-modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="social-impact-modal-close" onClick={() => setShowJoinModal(false)}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
              
              <div className="social-impact-modal-header">
                <FontAwesomeIcon icon={faHandHoldingHeart} />
                <h3>Включете се в промяната</h3>
                <p>Изберете как искате да помогнете на нашата кауза</p>
              </div>
              
              <div className="social-impact-modal-actions">
                {club.contacts?.email && (
                  <a 
                    href={`mailto:${club.contacts.email}?subject=Искам да се включа като доброволец&body=Здравейте,%0D%0A%0D%0AИскам да се включа като доброволец в дейностите на клуба.%0D%0A%0D%0AМоля свържете се с мен за повече информация.%0D%0A%0D%0AБлагодаря!`}
                    className="social-impact-modal-btn primary"
                  >
                    <FontAwesomeIcon icon={faHandsHelping} />
                    <span>Стана доброволец</span>
                  </a>
                )}
                {club.contacts?.phone && (
                  <a 
                    href={`tel:${club.contacts.phone}`}
                    className="social-impact-modal-btn secondary"
                  >
                    <FontAwesomeIcon icon={faPhone} />
                    <span>Обадете се</span>
                  </a>
                )}
                {club.contacts?.email && (
                  <a 
                    href={`mailto:${club.contacts.email}?subject=Искам да подкрепя финансово&body=Здравейте,%0D%0A%0D%0AИскам да подкрепя финансово дейностите на клуба.%0D%0A%0D%0AМоля дайте ми информация за начините за дарение.%0D%0A%0D%0AБлагодаря!`}
                    className="social-impact-modal-btn secondary"
                  >
                    <FontAwesomeIcon icon={faHeart} />
                    <span>Финансова подкрепа</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Info Modal */}
        {showInfoModal && (
          <div className="social-impact-modal" onClick={() => setShowInfoModal(false)}>
            <div className="social-impact-modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="social-impact-modal-close" onClick={() => setShowInfoModal(false)}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
              
              <div className="social-impact-modal-header">
                <FontAwesomeIcon icon={faChartLine} />
                <h3>Научете повече за нашето въздействие</h3>
                <p>Открийте как работим и как можете да се включите</p>
              </div>
              
              <div className="social-impact-modal-info">
                <div className="social-impact-info-section">
                  <h4>Как работим</h4>
                  <p>Ние работим директно с общността, предоставяйки услуги и подкрепа където има най-голяма нужда. Всички наши програми са насочени към подобряване качеството на живот на членовете ни.</p>
                </div>
                
                <div className="social-impact-info-section">
                  <h4>Вашият принос</h4>
                  <p>Всяко дарение и всеки доброволчески час се използва максимално ефективно за помощ на нуждаещите се. Прозрачността е важен принцип в нашата работа.</p>
                </div>
                
                <div className="social-impact-info-section">
                  <h4>Резултати</h4>
                  <p>Благодарение на подкрепата на хора като вас, успяваме да променяме живота на все повече хора всяка година.</p>
                </div>
                
                <div className="social-impact-modal-actions">
                  {club.contacts?.email && (
                    <a 
                      href={`mailto:${club.contacts.email}?subject=Искам повече информация&body=Здравейте,%0D%0A%0D%0AИскам да получа повече информация за дейностите на клуба и начините за включване.%0D%0A%0D%0AБлагодаря!`}
                      className="social-impact-modal-btn primary"
                    >
                      <FontAwesomeIcon icon={faEnvelope} />
                      <span>Пишете ни</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default SocialImpact;