import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHandHoldingHeart,
  faUsers,
  faCalendarAlt,
  faMapMarkerAlt,
  faEuroSign,
  faChartLine,
  faCheckCircle,
  faTimesCircle,
  faClock,
  faUserFriends,
  faHandsHelping,
  faHeart,
  faGift,
  faHome,
  faUtensils,
  faMedkit,
  faGraduationCap,
  faTree,
  faChevronRight,
  faFilter,
  faSearch,
  faEye,
  faArrowRight,
  faUser
} from '@fortawesome/free-solid-svg-icons';
import './socialProjects.css';

export const SocialProjects = ({ club }) => {
  const { t, i18n } = useTranslation();
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);

  if (!club?.socialImpact?.communityProjects && !club?.socialImpact?.volunteering && !club?.activities?.events) {
    return null;
  }

  const formatDate = (dateString) => {
    const locale = i18n.language === 'bg' ? 'bg-BG' : 
                   i18n.language === 'en' ? 'en-US' : 
                   'de-DE';
    return new Date(dateString).toLocaleDateString(locale);
  };

  const getCommunityCategory = (name) => {
    const lowerName = name.toLowerCase();
    const healthTerms = t('clubs.SocialProjects.categories.healthTerms', { returnObjects: true });
    const educationTerms = t('clubs.SocialProjects.categories.educationTerms', { returnObjects: true });
    const supportTerms = t('clubs.SocialProjects.categories.supportTerms', { returnObjects: true });
    
    if (healthTerms.some(term => lowerName.includes(term))) return 'health';
    if (educationTerms.some(term => lowerName.includes(term))) return 'education';
    if (supportTerms.some(term => lowerName.includes(term))) return 'support';
    return 'community';
  };

  const getVolunteerCategory = (project) => {
    const lowerProject = project.toLowerCase();
    const supportTerms = t('clubs.SocialProjects.categories.volunteerSupportTerms', { returnObjects: true });
    const healthTerms = t('clubs.SocialProjects.categories.volunteerHealthTerms', { returnObjects: true });
    
    if (supportTerms.some(term => lowerProject.includes(term))) return 'support';
    if (healthTerms.some(term => lowerProject.includes(term))) return 'health';
    return 'volunteering';
  };

  const getProjectStatusTranslation = (status) => {
    const statusMap = {
      'активен': t('clubs.SocialProjects.status.active'),
      'планиран': t('clubs.SocialProjects.status.planned'),
      'завършен': t('clubs.SocialProjects.status.completed'),
      'сезонен': t('clubs.SocialProjects.status.seasonal'),
      'active': t('clubs.SocialProjects.status.active'),
      'planned': t('clubs.SocialProjects.status.planned'),
      'completed': t('clubs.SocialProjects.status.completed'),
      'seasonal': t('clubs.SocialProjects.status.seasonal')
    };
    return statusMap[status] || status;
  };

  const allProjects = [];

  if (club.socialImpact?.communityProjects) {
    club.socialImpact.communityProjects.forEach(project => {
      allProjects.push({
        id: `community-${project.name}`,
        title: project.name,
        description: project.description,
        type: 'community',
        status: project.status || 'active',
        beneficiaries: project.beneficiaries,
        budget: project.budget,
        category: getCommunityCategory(project.name),
        details: {
          [t('clubs.SocialProjects.details.duration')]: t('clubs.SocialProjects.details.permanent'),
          [t('clubs.SocialProjects.details.coordinator')]: t('clubs.SocialProjects.details.clubManagement'),
          [t('clubs.SocialProjects.details.impact')]: t('clubs.SocialProjects.details.helpedPeople', { count: project.beneficiaries })
        }
      });
    });
  }

  if (club.socialImpact?.volunteering) {
    club.socialImpact.volunteering.forEach(volunteer => {
      allProjects.push({
        id: `volunteer-${volunteer.project}`,
        title: volunteer.project,
        description: volunteer.description || t('clubs.SocialProjects.volunteer.description', { participants: volunteer.participants }),
        type: 'volunteering',
        status: 'active',
        beneficiaries: null,
        participants: volunteer.participants,
        coordinator: volunteer.coordinator,
        hoursPerMonth: volunteer.hoursPerMonth,
        category: getVolunteerCategory(volunteer.project),
        details: {
          [t('clubs.SocialProjects.details.duration')]: t('clubs.SocialProjects.details.permanent'),
          [t('clubs.SocialProjects.details.coordinator')]: volunteer.coordinator,
          [t('clubs.SocialProjects.details.impact')]: t('clubs.SocialProjects.details.hoursPerMonth', { hours: volunteer.hoursPerMonth })
        }
      });
    });
  }

  if (club.activities?.events) {
    club.activities.events
      .filter(event => event.type === 'charity' || event.type === 'social' || event.type === 'community')
      .forEach(event => {
        allProjects.push({
          id: `event-${event.id}`,
          title: event.title,
          description: event.description,
          type: 'event',
          status: 'planned',
          date: event.date,
          participants: event.participants,
          category: event.type,
          details: {
            [t('clubs.SocialProjects.details.duration')]: t('clubs.SocialProjects.details.oneTime'),
            [t('clubs.SocialProjects.details.date')]: event.date,
            [t('clubs.SocialProjects.details.time')]: event.time,
            [t('clubs.SocialProjects.details.impact')]: t('clubs.SocialProjects.details.participants', { count: event.participants })
          }
        });
      });
  }

  if (allProjects.length === 0) {
    return null;
  }

  const getCategories = () => [
    { key: 'all', label: t('clubs.SocialProjects.filters.all'), icon: faHandsHelping },
    { key: 'community', label: t('clubs.SocialProjects.filters.community'), icon: faUsers },
    { key: 'volunteering', label: t('clubs.SocialProjects.filters.volunteering'), icon: faHeart },
    { key: 'event', label: t('clubs.SocialProjects.filters.events'), icon: faCalendarAlt },
    { key: 'health', label: t('clubs.SocialProjects.filters.health'), icon: faMedkit },
    { key: 'support', label: t('clubs.SocialProjects.filters.support'), icon: faHome },
    { key: 'education', label: t('clubs.SocialProjects.filters.education'), icon: faGraduationCap }
  ];

  const categories = getCategories();

  const filteredProjects = allProjects.filter(project => {
    const matchesFilter = activeFilter === 'all' || project.category === activeFilter || project.type === activeFilter;
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getProjectIcon = (category) => {
    switch(category) {
      case 'health': return faMedkit;
      case 'education': return faGraduationCap;
      case 'support': return faHome;
      case 'community': return faUsers;
      case 'volunteering': return faHeart;
      case 'event': return faCalendarAlt;
      default: return faHandsHelping;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'активен':
      case 'active': return '#10b981';
      case 'планиран':
      case 'planned': return '#3b82f6';
      case 'завършен':
      case 'completed': return '#64748b';
      case 'сезонен':
      case 'seasonal': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const openProjectModal = (project) => {
    setSelectedProject(project);
  };

  const closeProjectModal = () => {
    setSelectedProject(null);
  };

  const resetFilters = () => {
    setActiveFilter('all');
    setSearchTerm('');
  };

  const getCurrencySymbol = () => {
    return club.membership?.membershipFee?.currency || t('clubs.SocialProjects.currency');
  };

  return (
    <section id="social-projects" className="social-projects-section">
      <div className="social-projects-container">
        
        <div className="social-projects-header">
          <div className="social-projects-wave-bg">
            <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25"></path>
              <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5"></path>
              <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"></path>
            </svg>
          </div>
          
          <div className="social-projects-header-content">
            <div className="social-projects-badge">
              <FontAwesomeIcon icon={faHandHoldingHeart} />
              <span>{t('clubs.SocialProjects.header.badge')}</span>
            </div>
            <h2 className="social-projects-title">{t('clubs.SocialProjects.header.title')}</h2>
            <p className="social-projects-subtitle">
              {t('clubs.SocialProjects.header.subtitle')}
            </p>
          </div>
        </div>

        <div className="social-projects-stats-ribbon">
          <div className="social-projects-stat-card">
            <div className="social-projects-stat-icon">
              <FontAwesomeIcon icon={faHandsHelping} />
            </div>
            <div className="social-projects-stat-content">
              <span className="social-projects-stat-number">{allProjects.length}</span>
              <span className="social-projects-stat-label">{t('clubs.SocialProjects.stats.activeProjects')}</span>
            </div>
          </div>
          
          {club.stats?.projectsBeneficiaries && (
            <div className="social-projects-stat-card">
              <div className="social-projects-stat-icon">
                <FontAwesomeIcon icon={faUsers} />
              </div>
              <div className="social-projects-stat-content">
                <span className="social-projects-stat-number">{club.stats.projectsBeneficiaries}+</span>
                <span className="social-projects-stat-label">{t('clubs.SocialProjects.stats.helpedPeople')}</span>
              </div>
            </div>
          )}
          
          {club.stats?.donationsDistributed && (
            <div className="social-projects-stat-card">
              <div className="social-projects-stat-icon">
                <FontAwesomeIcon icon={faGift} />
              </div>
              <div className="social-projects-stat-content">
                <span className="social-projects-stat-number">{club.stats.donationsDistributed}</span>
                <span className="social-projects-stat-label">{getCurrencySymbol()} {t('clubs.SocialProjects.stats.donations')}</span>
              </div>
            </div>
          )}
        </div>

        <div className="social-projects-controls">
          <div className="social-projects-search-wrapper">
            <FontAwesomeIcon icon={faSearch} />
            <input
              type="text"
              placeholder={t('clubs.SocialProjects.search.placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="social-projects-search"
            />
          </div>
          
          <div className="social-projects-filters">
            <FontAwesomeIcon icon={faFilter} />
            <div className="social-projects-filter-buttons">
              {categories.map(category => (
                <button
                  key={category.key}
                  onClick={() => setActiveFilter(category.key)}
                  className={`social-projects-filter-btn ${activeFilter === category.key ? 'active' : ''}`}
                >
                  <FontAwesomeIcon icon={category.icon} />
                  <span>{category.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="social-projects-grid">
          {filteredProjects.map((project, index) => (
            <article 
              key={project.id} 
              className={`social-projects-card ${project.type} card-${(index % 3) + 1}`}
              onClick={() => openProjectModal(project)}
            >
              <div className="social-projects-card-header">
                <div className="social-projects-card-icon">
                  <FontAwesomeIcon icon={getProjectIcon(project.category)} />
                </div>
                <div 
                  className="social-projects-card-status"
                  style={{ backgroundColor: getStatusColor(project.status) }}
                >
                  {getProjectStatusTranslation(project.status)}
                </div>
              </div>

              <div className="social-projects-card-content">
                <h3 className="social-projects-card-title">{project.title}</h3>
                <p className="social-projects-card-description">{project.description}</p>
                
                <div className="social-projects-card-metrics">
                  {project.beneficiaries && (
                    <div className="social-projects-metric">
                      <FontAwesomeIcon icon={faUsers} />
                      <span>{t('clubs.SocialProjects.metrics.people', { count: project.beneficiaries })}</span>
                    </div>
                  )}
                  {project.participants && (
                    <div className="social-projects-metric">
                      <FontAwesomeIcon icon={faUserFriends} />
                      <span>{t('clubs.SocialProjects.metrics.participants', { count: project.participants })}</span>
                    </div>
                  )}
                  {project.budget && (
                    <div className="social-projects-metric">
                      <FontAwesomeIcon icon={faEuroSign} />
                      <span>{project.budget} {getCurrencySymbol()}</span>
                    </div>
                  )}
                  {project.date && (
                    <div className="social-projects-metric">
                      <FontAwesomeIcon icon={faCalendarAlt} />
                      <span>{formatDate(project.date)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="social-projects-card-footer">
                <button className="social-projects-view-btn">
                  <FontAwesomeIcon icon={faEye} />
                  <span>{t('clubs.SocialProjects.actions.viewMore')}</span>
                  <FontAwesomeIcon icon={faArrowRight} />
                </button>
              </div>
            </article>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="social-projects-no-results">
            <FontAwesomeIcon icon={faSearch} />
            <h3>{t('clubs.SocialProjects.noResults.title')}</h3>
            <p>{t('clubs.SocialProjects.noResults.message')}</p>
            <button 
              onClick={resetFilters}
              className="social-projects-reset-btn"
            >
              {t('clubs.SocialProjects.noResults.showAll')}
            </button>
          </div>
        )}

        {selectedProject && (
          <div className="social-projects-modal" onClick={closeProjectModal}>
            <div className="social-projects-modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="social-projects-modal-close" onClick={closeProjectModal}>
                <FontAwesomeIcon icon={faTimesCircle} />
              </button>
              
              <div className="social-projects-modal-header">
                <div className="social-projects-modal-icon">
                  <FontAwesomeIcon icon={getProjectIcon(selectedProject.category)} />
                </div>
                <div className="social-projects-modal-title-section">
                  <h3>{selectedProject.title}</h3>
                  <div 
                    className="social-projects-modal-status"
                    style={{ backgroundColor: getStatusColor(selectedProject.status) }}
                  >
                    {getProjectStatusTranslation(selectedProject.status)}
                  </div>
                </div>
              </div>
              
              <div className="social-projects-modal-body">
                <p>{selectedProject.description}</p>
                
                <div className="social-projects-modal-details">
                  {Object.entries(selectedProject.details).map(([key, value]) => (
                    <div key={key} className="social-projects-detail-item">
                      <strong>{key}:</strong> {value}
                    </div>
                  ))}
                </div>
                
                {selectedProject.coordinator && (
                  <div className="social-projects-coordinator">
                    <FontAwesomeIcon icon={faUser} />
                    <span>{t('clubs.SocialProjects.modal.coordinator')}: {selectedProject.coordinator}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default SocialProjects;