import { useState } from 'react';
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
  faArrowRight
} from '@fortawesome/free-solid-svg-icons';
import './socialProjects.css';

export const SocialProjects = ({ club }) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);

  // Проверяваме дали има необходимите данни
  if (!club?.socialImpact?.communityProjects && !club?.socialImpact?.volunteering && !club?.activities?.events) {
    return null;
  }

  // Събираме всички проекти от различни источни
  const allProjects = [];

  // Community Projects
  if (club.socialImpact?.communityProjects) {
    club.socialImpact.communityProjects.forEach(project => {
      allProjects.push({
        id: `community-${project.name}`,
        title: project.name,
        description: project.description,
        type: 'community',
        status: project.status || 'активен',
        beneficiaries: project.beneficiaries,
        budget: project.budget,
        category: getCommunityCategory(project.name),
        details: {
          duration: 'Постоянен',
          coordinator: 'Ръководство на клуба',
          impact: `${project.beneficiaries} помогнати хора`
        }
      });
    });
  }

  // Volunteering Projects
  if (club.socialImpact?.volunteering) {
    club.socialImpact.volunteering.forEach(volunteer => {
      allProjects.push({
        id: `volunteer-${volunteer.project}`,
        title: volunteer.project,
        description: volunteer.description || `Доброволческа дейност с ${volunteer.participants} участници`,
        type: 'volunteering',
        status: 'активен',
        beneficiaries: null,
        participants: volunteer.participants,
        coordinator: volunteer.coordinator,
        hoursPerMonth: volunteer.hoursPerMonth,
        category: getVolunteerCategory(volunteer.project),
        details: {
          duration: 'Постоянен',
          coordinator: volunteer.coordinator,
          impact: `${volunteer.hoursPerMonth} часа месечно`
        }
      });
    });
  }

  // Events that are social/charity type
  if (club.activities?.events) {
    club.activities.events
      .filter(event => event.type === 'charity' || event.type === 'social' || event.type === 'community')
      .forEach(event => {
        allProjects.push({
          id: `event-${event.id}`,
          title: event.title,
          description: event.description,
          type: 'event',
          status: 'планиран',
          date: event.date,
          participants: event.participants,
          category: event.type,
          details: {
            duration: 'Еднократно',
            date: event.date,
            time: event.time,
            impact: `${event.participants} участници`
          }
        });
      });
  }

  // Ако няма проекти, не показваме компонента
  if (allProjects.length === 0) {
    return null;
  }

  // Categories за филтриране
  const categories = [
    { key: 'all', label: 'Всички', icon: faHandsHelping },
    { key: 'community', label: 'Общностни', icon: faUsers },
    { key: 'volunteering', label: 'Доброволчески', icon: faHeart },
    { key: 'event', label: 'Събития', icon: faCalendarAlt },
    { key: 'health', label: 'Здравеопазване', icon: faMedkit },
    { key: 'support', label: 'Подкрепа', icon: faHome },
    { key: 'education', label: 'Образование', icon: faGraduationCap }
  ];

  // Филтриране на проекти
  const filteredProjects = allProjects.filter(project => {
    const matchesFilter = activeFilter === 'all' || project.category === activeFilter || project.type === activeFilter;
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Helper функции за категоризиране
  function getCommunityCategory(name) {
    if (name.toLowerCase().includes('здрав') || name.toLowerCase().includes('медицин')) return 'health';
    if (name.toLowerCase().includes('образование') || name.toLowerCase().includes('учене')) return 'education';
    if (name.toLowerCase().includes('дом') || name.toLowerCase().includes('подкрепа')) return 'support';
    return 'community';
  }

  function getVolunteerCategory(project) {
    if (project.toLowerCase().includes('самотни') || project.toLowerCase().includes('дом')) return 'support';
    if (project.toLowerCase().includes('храна') || project.toLowerCase().includes('обяд')) return 'support';
    if (project.toLowerCase().includes('лекарство') || project.toLowerCase().includes('здрав')) return 'health';
    return 'volunteering';
  }

  function getProjectIcon(category) {
    switch(category) {
      case 'health': return faMedkit;
      case 'education': return faGraduationCap;
      case 'support': return faHome;
      case 'community': return faUsers;
      case 'volunteering': return faHeart;
      case 'event': return faCalendarAlt;
      default: return faHandsHelping;
    }
  }

  function getStatusColor(status) {
    switch(status) {
      case 'активен': return '#10b981';
      case 'планиран': return '#3b82f6';
      case 'завършен': return '#64748b';
      case 'сезонен': return '#f59e0b';
      default: return '#6b7280';
    }
  }

  const openProjectModal = (project) => {
    setSelectedProject(project);
  };

  const closeProjectModal = () => {
    setSelectedProject(null);
  };

  return (
    <section id="social-projects" className="social-projects-section">
      <div className="social-projects-container">
        
        {/* Section Header - уникален дизайн с wave ефект */}
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
              <span>Нашите проекти</span>
            </div>
            <h2 className="social-projects-title">Как правим разлика</h2>
            <p className="social-projects-subtitle">
              Открийте начините, по които нашият клуб помага на общността и прави света по-добро място
            </p>
          </div>
        </div>

        {/* Stats Cards - хоризонтален дизайн с градиенти */}
        <div className="social-projects-stats-ribbon">
          <div className="social-projects-stat-card">
            <div className="social-projects-stat-icon">
              <FontAwesomeIcon icon={faHandsHelping} />
            </div>
            <div className="social-projects-stat-content">
              <span className="social-projects-stat-number">{allProjects.length}</span>
              <span className="social-projects-stat-label">Активни проекта</span>
            </div>
          </div>
          
          {club.stats?.projectsBeneficiaries && (
            <div className="social-projects-stat-card">
              <div className="social-projects-stat-icon">
                <FontAwesomeIcon icon={faUsers} />
              </div>
              <div className="social-projects-stat-content">
                <span className="social-projects-stat-number">{club.stats.projectsBeneficiaries}+</span>
                <span className="social-projects-stat-label">Помогнати хора</span>
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
                <span className="social-projects-stat-label">лв. дарения</span>
              </div>
            </div>
          )}
        </div>

        {/* Filter & Search Bar - модерен дизайн */}
        <div className="social-projects-controls">
          <div className="social-projects-search-wrapper">
            <FontAwesomeIcon icon={faSearch} />
            <input
              type="text"
              placeholder="Търсете проект..."
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

        {/* Projects Grid - мозайка дизайн */}
        <div className="social-projects-grid">
          {filteredProjects.map((project, index) => (
            <article 
              key={project.id} 
              className={`social-projects-card ${project.type} card-${(index % 3) + 1}`}
              onClick={() => openProjectModal(project)}
            >
              {/* Card Header */}
              <div className="social-projects-card-header">
                <div className="social-projects-card-icon">
                  <FontAwesomeIcon icon={getProjectIcon(project.category)} />
                </div>
                <div 
                  className="social-projects-card-status"
                  style={{ backgroundColor: getStatusColor(project.status) }}
                >
                  {project.status}
                </div>
              </div>

              {/* Card Content */}
              <div className="social-projects-card-content">
                <h3 className="social-projects-card-title">{project.title}</h3>
                <p className="social-projects-card-description">{project.description}</p>
                
                {/* Project Metrics */}
                <div className="social-projects-card-metrics">
                  {project.beneficiaries && (
                    <div className="social-projects-metric">
                      <FontAwesomeIcon icon={faUsers} />
                      <span>{project.beneficiaries} човека</span>
                    </div>
                  )}
                  {project.participants && (
                    <div className="social-projects-metric">
                      <FontAwesomeIcon icon={faUserFriends} />
                      <span>{project.participants} участници</span>
                    </div>
                  )}
                  {project.budget && (
                    <div className="social-projects-metric">
                      <FontAwesomeIcon icon={faEuroSign} />
                      <span>{project.budget} лв.</span>
                    </div>
                  )}
                  {project.date && (
                    <div className="social-projects-metric">
                      <FontAwesomeIcon icon={faCalendarAlt} />
                      <span>{new Date(project.date).toLocaleDateString('bg-BG')}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="social-projects-card-footer">
                <button className="social-projects-view-btn">
                  <FontAwesomeIcon icon={faEye} />
                  <span>Вижте повече</span>
                  <FontAwesomeIcon icon={faArrowRight} />
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* No Results */}
        {filteredProjects.length === 0 && (
          <div className="social-projects-no-results">
            <FontAwesomeIcon icon={faSearch} />
            <h3>Няма намерени проекти</h3>
            <p>Опитайте с различни критерии за търсене</p>
            <button 
              onClick={() => {setActiveFilter('all'); setSearchTerm('');}}
              className="social-projects-reset-btn"
            >
              Покажи всички проекти
            </button>
          </div>
        )}

        {/* Project Modal */}
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
                    {selectedProject.status}
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
                    <span>Координатор: {selectedProject.coordinator}</span>
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