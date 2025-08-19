import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [animatedNumbers, setAnimatedNumbers] = useState({});
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  if (!club?.socialImpact?.communityProjects && 
      !club?.socialImpact?.volunteering && 
      !club?.socialImpact?.partnerships && 
      !club?.stats) {
    return null;
  }

  const communityProjects = club.socialImpact?.communityProjects || [];
  const volunteering = club.socialImpact?.volunteering || [];
  const partnerships = club.socialImpact?.partnerships || [];
  const stats = club.stats || {};

  const totalBeneficiaries = communityProjects.reduce((sum, project) => sum + (project.beneficiaries || 0), 0);
  const totalVolunteers = volunteering.reduce((sum, vol) => sum + (vol.participants || 0), 0);
  const totalHours = volunteering.reduce((sum, vol) => sum + (vol.hoursPerMonth || 0), 0) * 12;
  const activeCommunityProjects = communityProjects.filter(p => 
    p.status === 'активен' || p.status === 'active'
  ).length;
  const totalBudget = communityProjects.reduce((sum, project) => sum + (project.budget || 0), 0);
  const yearsActive = club.foundedYear ? new Date().getFullYear() - club.foundedYear : 0;

  const getKeyMetrics = () => [
    {
      id: 'beneficiaries',
      label: t('clubs.SocialImpact.metrics.beneficiaries.label'),
      value: totalBeneficiaries || stats.projectsBeneficiaries || 0,
      icon: faUsers,
      color: '#3b82f6',
      description: t('clubs.SocialImpact.metrics.beneficiaries.description'),
      trend: '+15%',
      period: t('clubs.SocialImpact.metrics.beneficiaries.period')
    },
    {
      id: 'volunteers',
      label: t('clubs.SocialImpact.metrics.volunteers.label'),
      value: totalVolunteers || stats.totalMembers || 0,
      icon: faHandsHelping,
      color: '#10b981',
      description: t('clubs.SocialImpact.metrics.volunteers.description'),
      trend: '+23%',
      period: t('clubs.SocialImpact.metrics.volunteers.period')
    },
    {
      id: 'hours',
      label: t('clubs.SocialImpact.metrics.hours.label'),
      value: totalHours || 0,
      icon: faClock,
      color: '#f59e0b',
      description: t('clubs.SocialImpact.metrics.hours.description'),
      trend: '+8%',
      period: t('clubs.SocialImpact.metrics.hours.period')
    },
    {
      id: 'projects',
      label: t('clubs.SocialImpact.metrics.projects.label'),
      value: activeCommunityProjects || stats.programs || 0,
      icon: faLightbulb,
      color: '#8b5cf6',
      description: t('clubs.SocialImpact.metrics.projects.description'),
      trend: '+12%',
      period: t('clubs.SocialImpact.metrics.projects.period')
    }
  ];

  const keyMetrics = getKeyMetrics();
  const validMetrics = keyMetrics.filter(metric => metric.value > 0);

  if (validMetrics.length === 0) {
    return null;
  }

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

    validMetrics.forEach(metric => {
      const timer = animateNumber(metric.value);
      setAnimatedNumbers(prev => ({
        ...prev,
        [metric.id]: { value: metric.value, timer }
      }));
    });

    return () => {
      Object.values(animatedNumbers).forEach(item => {
        if (item.timer) clearInterval(item.timer);
      });
    };
  }, []);

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getCategoryIcon = (projectName) => {
    const name = projectName.toLowerCase();
    const homeTerms = t('clubs.SocialImpact.categories.homeTerms', { returnObjects: true });
    const foodTerms = t('clubs.SocialImpact.categories.foodTerms', { returnObjects: true });
    const healthTerms = t('clubs.SocialImpact.categories.healthTerms', { returnObjects: true });
    const educationTerms = t('clubs.SocialImpact.categories.educationTerms', { returnObjects: true });
    const environmentTerms = t('clubs.SocialImpact.categories.environmentTerms', { returnObjects: true });
    
    if (homeTerms.some(term => name.includes(term))) return faHome;
    if (foodTerms.some(term => name.includes(term))) return faUtensils;
    if (healthTerms.some(term => name.includes(term))) return faMedkit;
    if (educationTerms.some(term => name.includes(term))) return faGraduationCap;
    if (environmentTerms.some(term => name.includes(term))) return faTree;
    return faHeart;
  };

  const getCategoryColor = (projectName) => {
    const name = projectName.toLowerCase();
    const homeTerms = t('clubs.SocialImpact.categories.homeTerms', { returnObjects: true });
    const foodTerms = t('clubs.SocialImpact.categories.foodTerms', { returnObjects: true });
    const healthTerms = t('clubs.SocialImpact.categories.healthTerms', { returnObjects: true });
    const educationTerms = t('clubs.SocialImpact.categories.educationTerms', { returnObjects: true });
    const environmentTerms = t('clubs.SocialImpact.categories.environmentTerms', { returnObjects: true });
    
    if (homeTerms.some(term => name.includes(term))) return '#10b981';
    if (foodTerms.some(term => name.includes(term))) return '#f59e0b';
    if (healthTerms.some(term => name.includes(term))) return '#ef4444';
    if (educationTerms.some(term => name.includes(term))) return '#3b82f6';
    if (environmentTerms.some(term => name.includes(term))) return '#22c55e';
    return '#8b5cf6';
  };

  const getProjectStatusTranslation = (status) => {
    const statusMap = {
      'активен': t('clubs.SocialImpact.projectStatus.active'),
      'завършен': t('clubs.SocialImpact.projectStatus.completed'),
      'планиран': t('clubs.SocialImpact.projectStatus.planned'),
      'active': t('clubs.SocialImpact.projectStatus.active'),
      'completed': t('clubs.SocialImpact.projectStatus.completed'),
      'planned': t('clubs.SocialImpact.projectStatus.planned')
    };
    return statusMap[status] || status;
  };

  const getProjectStatusColor = (status) => {
    switch(status) {
      case 'активен':
      case 'active': return '#10b981';
      case 'завършен':
      case 'completed': return '#64748b';
      case 'планиран':
      case 'planned': return '#f59e0b';
      default: return '#f59e0b';
    }
  };

  const getCurrencySymbol = () => {
    return club.membership?.membershipFee?.currency || t('clubs.SocialImpact.currency');
  };

  const handleMetricClick = (metric) => {
    setSelectedMetric(selectedMetric?.id === metric.id ? null : metric);
  };

  const getVolunteerEmailSubject = () => {
    return encodeURIComponent(t('clubs.SocialImpact.modals.join.volunteerEmailSubject'));
  };

  const getVolunteerEmailBody = () => {
    return encodeURIComponent(t('clubs.SocialImpact.modals.join.volunteerEmailBody'));
  };

  const getDonationEmailSubject = () => {
    return encodeURIComponent(t('clubs.SocialImpact.modals.join.donationEmailSubject'));
  };

  const getDonationEmailBody = () => {
    return encodeURIComponent(t('clubs.SocialImpact.modals.join.donationEmailBody'));
  };

  const getInfoEmailSubject = () => {
    return encodeURIComponent(t('clubs.SocialImpact.modals.info.emailSubject'));
  };

  const getInfoEmailBody = () => {
    return encodeURIComponent(t('clubs.SocialImpact.modals.info.emailBody'));
  };

  return (
    <section id="social-impact" className="social-impact-section">
      <div className="social-impact-container">
        
        <div className="social-impact-header">
          <div className="social-impact-header-content">
            <div className="social-impact-badge">
              <FontAwesomeIcon icon={faChartLine} />
              <span>{t('clubs.SocialImpact.header.badge')}</span>
            </div>
            <h2 className="social-impact-title">
              {t('clubs.SocialImpact.header.title')}
            </h2>
            <p className="social-impact-subtitle">
              {t('clubs.SocialImpact.header.subtitle')}
            </p>
          </div>
          
          {yearsActive > 0 && (
            <div className="social-impact-years-badge">
              <div className="social-impact-years-number">{yearsActive}</div>
              <div className="social-impact-years-label">{t('clubs.SocialImpact.yearsActive')}</div>
            </div>
          )}
        </div>

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

        {communityProjects.length > 0 && (
          <div className="social-impact-projects-section">
            <h3 className="social-impact-section-title">
              <FontAwesomeIcon icon={faFlag} />
              {t('clubs.SocialImpact.projects.title')}
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
                      style={{ backgroundColor: getProjectStatusColor(project.status) }}
                    >
                      {getProjectStatusTranslation(project.status)}
                    </div>
                  </div>
                  
                  <div className="social-impact-project-content">
                    <h4 className="social-impact-project-name">{project.name}</h4>
                    <p className="social-impact-project-description">{project.description}</p>
                    
                    <div className="social-impact-project-metrics">
                      {project.beneficiaries && (
                        <div className="social-impact-project-metric">
                          <FontAwesomeIcon icon={faUsers} />
                          <span>{t('clubs.SocialImpact.projects.beneficiaries', { count: project.beneficiaries })}</span>
                        </div>
                      )}
                      {project.budget && (
                        <div className="social-impact-project-metric">
                          <FontAwesomeIcon icon={faEuroSign} />
                          <span>{project.budget} {getCurrencySymbol()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {partnerships.length > 0 && (
          <div className="social-impact-partnerships-section">
            <h3 className="social-impact-section-title">
              <FontAwesomeIcon icon={faHandshake} />
              {t('clubs.SocialImpact.partnerships.title')}
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

        {yearsActive > 0 && (
          <div className="social-impact-timeline-section">
            <h3 className="social-impact-section-title">
              <FontAwesomeIcon icon={faCalendar} />
              {t('clubs.SocialImpact.timeline.title')}
            </h3>
            
            <div className="social-impact-timeline">
              <div className="social-impact-timeline-item">
                <div className="social-impact-timeline-year">{club.foundedYear}</div>
                <div className="social-impact-timeline-content">
                  <h4>{t('clubs.SocialImpact.timeline.founding.title')}</h4>
                  <p>{t('clubs.SocialImpact.timeline.founding.description')}</p>
                </div>
              </div>
              
              {club.achievements?.awards && club.achievements.awards.map((award, index) => (
                <div key={index} className="social-impact-timeline-item">
                  <div className="social-impact-timeline-year">{award.year}</div>
                  <div className="social-impact-timeline-content">
                    <h4>{award.name}</h4>
                    <p>{award.description}</p>
                    <span className="social-impact-timeline-source">{t('clubs.SocialImpact.timeline.awardedBy')} {award.awardedBy}</span>
                  </div>
                </div>
              ))}
              
              <div className="social-impact-timeline-item current">
                <div className="social-impact-timeline-year">{new Date().getFullYear()}</div>
                <div className="social-impact-timeline-content">
                  <h4>{t('clubs.SocialImpact.timeline.current.title')}</h4>
                  <p>{t('clubs.SocialImpact.timeline.current.description', { 
                    beneficiaries: totalBeneficiaries > 0 ? totalBeneficiaries : t('clubs.SocialImpact.timeline.current.many'),
                    programs: validMetrics.length 
                  })}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="social-impact-cta-section">
          <div className="social-impact-cta-content">
            <FontAwesomeIcon icon={faHandHoldingHeart} />
            <h3>{t('clubs.SocialImpact.cta.title')}</h3>
            <p>{t('clubs.SocialImpact.cta.description')}</p>
            <div className="social-impact-cta-buttons">
              <button 
                onClick={() => setShowJoinModal(true)}
                className="social-impact-cta-btn primary"
              >
                <FontAwesomeIcon icon={faUsers} />
                <span>{t('clubs.SocialImpact.cta.joinUs')}</span>
              </button>
              
              <button 
                onClick={() => setShowInfoModal(true)}
                className="social-impact-cta-btn secondary"
              >
                <FontAwesomeIcon icon={faHeart} />
                <span>{t('clubs.SocialImpact.cta.learnMore')}</span>
              </button>
            </div>
          </div>
        </div>

        {showJoinModal && (
          <div className="social-impact-modal" onClick={() => setShowJoinModal(false)}>
            <div className="social-impact-modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="social-impact-modal-close" onClick={() => setShowJoinModal(false)}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
              
              <div className="social-impact-modal-header">
                <FontAwesomeIcon icon={faHandHoldingHeart} />
                <h3>{t('clubs.SocialImpact.modals.join.title')}</h3>
                <p>{t('clubs.SocialImpact.modals.join.description')}</p>
              </div>
              
              <div className="social-impact-modal-actions">
                {club.contacts?.email && (
                  <a 
                    href={`mailto:${club.contacts.email}?subject=${getVolunteerEmailSubject()}&body=${getVolunteerEmailBody()}`}
                    className="social-impact-modal-btn primary"
                  >
                    <FontAwesomeIcon icon={faHandsHelping} />
                    <span>{t('clubs.SocialImpact.modals.join.becomeVolunteer')}</span>
                  </a>
                )}
                {club.contacts?.phone && (
                  <a 
                    href={`tel:${club.contacts.phone}`}
                    className="social-impact-modal-btn secondary"
                  >
                    <FontAwesomeIcon icon={faPhone} />
                    <span>{t('clubs.SocialImpact.modals.join.callUs')}</span>
                  </a>
                )}
                {club.contacts?.email && (
                  <a 
                    href={`mailto:${club.contacts.email}?subject=${getDonationEmailSubject()}&body=${getDonationEmailBody()}`}
                    className="social-impact-modal-btn secondary"
                  >
                    <FontAwesomeIcon icon={faHeart} />
                    <span>{t('clubs.SocialImpact.modals.join.financialSupport')}</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {showInfoModal && (
          <div className="social-impact-modal" onClick={() => setShowInfoModal(false)}>
            <div className="social-impact-modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="social-impact-modal-close" onClick={() => setShowInfoModal(false)}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
              
              <div className="social-impact-modal-header">
                <FontAwesomeIcon icon={faChartLine} />
                <h3>{t('clubs.SocialImpact.modals.info.title')}</h3>
                <p>{t('clubs.SocialImpact.modals.info.description')}</p>
              </div>
              
              <div className="social-impact-modal-info">
                <div className="social-impact-info-section">
                  <h4>{t('clubs.SocialImpact.modals.info.howWeWork.title')}</h4>
                  <p>{t('clubs.SocialImpact.modals.info.howWeWork.description')}</p>
                </div>
                
                <div className="social-impact-info-section">
                  <h4>{t('clubs.SocialImpact.modals.info.yourContribution.title')}</h4>
                  <p>{t('clubs.SocialImpact.modals.info.yourContribution.description')}</p>
                </div>
                
                <div className="social-impact-info-section">
                  <h4>{t('clubs.SocialImpact.modals.info.results.title')}</h4>
                  <p>{t('clubs.SocialImpact.modals.info.results.description')}</p>
                </div>
                
                <div className="social-impact-modal-actions">
                  {club.contacts?.email && (
                    <a 
                      href={`mailto:${club.contacts.email}?subject=${getInfoEmailSubject()}&body=${getInfoEmailBody()}`}
                      className="social-impact-modal-btn primary"
                    >
                      <FontAwesomeIcon icon={faEnvelope} />
                      <span>{t('clubs.SocialImpact.modals.info.writeToUs')}</span>
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