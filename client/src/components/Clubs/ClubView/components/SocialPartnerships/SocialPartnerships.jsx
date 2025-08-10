import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHandshake,
  faBuilding,
  faHeart,
  faGlobe,
  faUniversity,
  faHospital,
  faStore,
  faIndustry,
  faPalette,
  faLeaf,
  faGraduationCap,
  faShieldAlt,
  faTrophy,
  faAward,
  faUsers,
  faCalendarAlt,
  faMapMarkerAlt,
  faPhone,
  faEnvelope,
  faExternalLinkAlt,
  faSearch,
  faFilter,
  faInfoCircle,
  faCheckCircle,
  faLink,
  faNetworkWired,
  faStar,
  faChevronDown,
  faChevronUp,
  faEye,
  faShareAlt,
  faTags,
  faHistory
} from '@fortawesome/free-solid-svg-icons';
import './socialPartnerships.css';

export const SocialPartnerships = ({ club }) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedPartner, setExpandedPartner] = useState(null);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'network'

  // Проверяваме дали има необходимите данни
  if (!club?.socialImpact?.partnerships && 
      !club?.partnerships && 
      !club?.collaborations &&
      !club?.sponsors) {
    return null;
  }

  // Събираме всички партньорства
  const socialPartnerships = club.socialImpact?.partnerships || [];
  const generalPartnerships = club.partnerships || [];
  const collaborations = club.collaborations || [];
  const sponsors = club.sponsors || [];

  // Създаваме обединен списък с партньори
  const allPartnerships = [
    ...socialPartnerships.map(partnership => ({
      ...partnership,
      id: `social-${partnership.partner}`,
      category: getPartnershipCategory(partnership.partner, partnership.type),
      source: 'social',
      priority: getPriorityLevel(partnership.type)
    })),
    ...generalPartnerships.map(partnership => ({
      ...partnership,
      id: `general-${partnership.name || partnership.partner}`,
      partner: partnership.name || partnership.partner,
      category: getPartnershipCategory(partnership.name || partnership.partner, partnership.type),
      source: 'general',
      priority: getPriorityLevel(partnership.type)
    })),
    ...collaborations.map(collab => ({
      ...collab,
      id: `collab-${collab.name || collab.partner}`,
      partner: collab.name || collab.partner,
      category: getPartnershipCategory(collab.name || collab.partner, collab.type || 'collaboration'),
      source: 'collaboration',
      priority: getPriorityLevel(collab.type || 'collaboration')
    })),
    ...sponsors.map(sponsor => ({
      ...sponsor,
      id: `sponsor-${sponsor.name || sponsor.partner}`,
      partner: sponsor.name || sponsor.partner,
      category: 'sponsor',
      type: 'sponsor',
      source: 'sponsor',
      priority: getPriorityLevel('sponsor')
    }))
  ];

  // Ако няма партньорства, не показваме компонента
  if (allPartnerships.length === 0) {
    return null;
  }

  // Helper функции
  function getPartnershipCategory(partnerName, partnerType) {
    const name = partnerName?.toLowerCase() || '';
    const type = partnerType?.toLowerCase() || '';
    
    if (type.includes('спонсор') || type.includes('sponsor')) return 'sponsor';
    if (type.includes('държав') || type.includes('общин') || type.includes('government')) return 'government';
    if (type.includes('медицин') || type.includes('болниц') || type.includes('health')) return 'healthcare';
    if (type.includes('образов') || type.includes('школа') || type.includes('университ')) return 'education';
    if (type.includes('бизнес') || type.includes('фирма') || type.includes('компани')) return 'business';
    if (type.includes('нпо') || type.includes('ngo') || type.includes('organization')) return 'ngo';
    if (type.includes('култур') || type.includes('изкуств') || type.includes('culture')) return 'culture';
    
    // Fallback based on name
    if (name.includes('общин') || name.includes('кметств')) return 'government';
    if (name.includes('болниц') || name.includes('поликлиник')) return 'healthcare';
    if (name.includes('училищ') || name.includes('университ')) return 'education';
    if (name.includes('клуб') || name.includes('сдружение')) return 'ngo';
    
    return 'business';
  }

  function getPriorityLevel(type) {
    const typeStr = type?.toLowerCase() || '';
    if (typeStr.includes('стратег') || typeStr.includes('strategic')) return 'high';
    if (typeStr.includes('спонсор') || typeStr.includes('sponsor')) return 'high';
    if (typeStr.includes('дългосроч') || typeStr.includes('long-term')) return 'medium';
    return 'normal';
  }

  function getCategoryIcon(category) {
    switch(category) {
      case 'government': return faUniversity;
      case 'healthcare': return faHospital;
      case 'education': return faGraduationCap;
      case 'business': return faBuilding;
      case 'ngo': return faHeart;
      case 'culture': return faPalette;
      case 'sponsor': return faTrophy;
      default: return faHandshake;
    }
  }

  function getCategoryColor(category) {
    switch(category) {
      case 'government': return '#dc2626';
      case 'healthcare': return '#059669';
      case 'education': return '#2563eb';
      case 'business': return '#7c3aed';
      case 'ngo': return '#ea580c';
      case 'culture': return '#c026d3';
      case 'sponsor': return '#ca8a04';
      default: return '#6b7280';
    }
  }

  function getCategoryLabel(category) {
    switch(category) {
      case 'government': return 'Държавни';
      case 'healthcare': return 'Здравеопазване';
      case 'education': return 'Образование';
      case 'business': return 'Бизнес';
      case 'ngo': return 'НПО';
      case 'culture': return 'Култура';
      case 'sponsor': return 'Спонсори';
      default: return 'Други';
    }
  }

  function getPriorityIcon(priority) {
    switch(priority) {
      case 'high': return faStar;
      case 'medium': return faAward;
      default: return faCheckCircle;
    }
  }

  function getPriorityColor(priority) {
    switch(priority) {
      case 'high': return '#f59e0b';
      case 'medium': return '#8b5cf6';
      default: return '#10b981';
    }
  }

  // Категории за филтриране
  const categories = [
    { key: 'all', label: 'Всички', icon: faHandshake },
    { key: 'government', label: 'Държавни', icon: faUniversity },
    { key: 'healthcare', label: 'Здравеопазване', icon: faHospital },
    { key: 'education', label: 'Образование', icon: faGraduationCap },
    { key: 'business', label: 'Бизнес', icon: faBuilding },
    { key: 'ngo', label: 'НПО', icon: faHeart },
    { key: 'culture', label: 'Култура', icon: faPalette },
    { key: 'sponsor', label: 'Спонсори', icon: faTrophy }
  ];

  // Филтриране на партньорства
  const filteredPartnerships = allPartnerships.filter(partnership => {
    const matchesCategory = activeCategory === 'all' || partnership.category === activeCategory;
    const matchesSearch = partnership.partner?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         partnership.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         partnership.type?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Сортиране по приоритет и име
  const sortedPartnerships = filteredPartnerships.sort((a, b) => {
    const priorityOrder = { 'high': 3, 'medium': 2, 'normal': 1 };
    const aPriority = priorityOrder[a.priority] || 1;
    const bPriority = priorityOrder[b.priority] || 1;
    
    if (aPriority !== bPriority) {
      return bPriority - aPriority;
    }
    
    return (a.partner || '').localeCompare(b.partner || '');
  });

  const togglePartnerExpansion = (partnerId) => {
    setExpandedPartner(expandedPartner === partnerId ? null : partnerId);
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('bg-BG', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <section id="social-partnerships" className="social-partnerships-section">
      <div className="social-partnerships-container">
        
        {/* Header */}
        <div className="social-partnerships-header">
          <div className="social-partnerships-header-content">
            <div className="social-partnerships-badge">
              <FontAwesomeIcon icon={faNetworkWired} />
              <span>Нашите партньори</span>
            </div>
            <h2 className="social-partnerships-title">
              Заедно сме по-силни
            </h2>
            <p className="social-partnerships-subtitle">
              Открийте организациите и институциите, с които работим за постигане на нашите цели
            </p>
          </div>
          
          {/* Partnership Stats */}
          <div className="social-partnerships-stats">
            <div className="social-partnerships-stat">
              <span className="social-partnerships-stat-number">{allPartnerships.length}</span>
              <span className="social-partnerships-stat-label">Партньори</span>
            </div>
            <div className="social-partnerships-stat">
              <span className="social-partnerships-stat-number">
                {allPartnerships.filter(p => p.priority === 'high').length}
              </span>
              <span className="social-partnerships-stat-label">Стратегически</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="social-partnerships-controls">
          {/* Search Bar */}
          <div className="social-partnerships-search-bar">
            <FontAwesomeIcon icon={faSearch} />
            <input
              type="text"
              placeholder="Търсете партньор или организация..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="social-partnerships-toolbar">
            {/* View Mode Toggle */}
            <div className="social-partnerships-view-toggle">
              <button 
                onClick={() => setViewMode('cards')}
                className={`social-partnerships-view-btn ${viewMode === 'cards' ? 'active' : ''}`}
              >
                <FontAwesomeIcon icon={faUsers} />
                <span>Карти</span>
              </button>
              <button 
                onClick={() => setViewMode('network')}
                className={`social-partnerships-view-btn ${viewMode === 'network' ? 'active' : ''}`}
              >
                <FontAwesomeIcon icon={faNetworkWired} />
                <span>Мрежа</span>
              </button>
            </div>
            
            {/* Category Filter */}
            <div className="social-partnerships-category-filters">
              {categories.map(category => (
                <button
                  key={category.key}
                  onClick={() => setActiveCategory(category.key)}
                  className={`social-partnerships-category-btn ${activeCategory === category.key ? 'active' : ''}`}
                >
                  <FontAwesomeIcon icon={category.icon} />
                  <span>{category.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Partnerships Display */}
        {viewMode === 'cards' ? (
          <div className="social-partnerships-grid">
            {sortedPartnerships.map((partnership, index) => (
              <div 
                key={partnership.id}
                className="social-partnerships-card"
                style={{ '--partnership-delay': `${index * 0.1}s` }}
              >
                <div className="social-partnerships-card-header">
                  <div className="social-partnerships-card-icon-section">
                    <div 
                      className="social-partnerships-card-icon"
                      style={{ backgroundColor: getCategoryColor(partnership.category) }}
                    >
                      <FontAwesomeIcon icon={getCategoryIcon(partnership.category)} />
                    </div>
                    <div 
                      className="social-partnerships-priority-badge"
                      style={{ backgroundColor: getPriorityColor(partnership.priority) }}
                    >
                      <FontAwesomeIcon icon={getPriorityIcon(partnership.priority)} />
                    </div>
                  </div>
                  
                  <div className="social-partnerships-card-title-section">
                    <h3 className="social-partnerships-card-title">{partnership.partner}</h3>
                    <div 
                      className="social-partnerships-card-category"
                      style={{ backgroundColor: getCategoryColor(partnership.category) }}
                    >
                      {getCategoryLabel(partnership.category)}
                    </div>
                  </div>
                </div>
                
                <div className="social-partnerships-card-content">
                  {partnership.description && (
                    <p className="social-partnerships-card-description">
                      {partnership.description}
                    </p>
                  )}
                  
                  <div className="social-partnerships-card-details">
                    {partnership.type && (
                      <div className="social-partnerships-card-detail">
                        <FontAwesomeIcon icon={faTags} />
                        <span>{partnership.type}</span>
                      </div>
                    )}
                    {partnership.since && (
                      <div className="social-partnerships-card-detail">
                        <FontAwesomeIcon icon={faHistory} />
                        <span>От {formatDate(partnership.since) || partnership.since}</span>
                      </div>
                    )}
                    {partnership.location && (
                      <div className="social-partnerships-card-detail">
                        <FontAwesomeIcon icon={faMapMarkerAlt} />
                        <span>{partnership.location}</span>
                      </div>
                    )}
                  </div>
                  
                  {(partnership.website || partnership.email || partnership.phone || 
                    partnership.projects || partnership.achievements) && (
                    <button 
                      onClick={() => togglePartnerExpansion(partnership.id)}
                      className="social-partnerships-expand-btn"
                    >
                      <span>
                        {expandedPartner === partnership.id ? 'Скрий детайли' : 'Вижте повече'}
                      </span>
                      <FontAwesomeIcon 
                        icon={expandedPartner === partnership.id ? faChevronUp : faChevronDown} 
                      />
                    </button>
                  )}
                  
                  {expandedPartner === partnership.id && (
                    <div className="social-partnerships-expanded-content">
                      {partnership.projects && (
                        <div className="social-partnerships-projects">
                          <h4>Общи проекти:</h4>
                          <ul>
                            {partnership.projects.map((project, idx) => (
                              <li key={idx}>{project}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {partnership.achievements && (
                        <div className="social-partnerships-achievements">
                          <h4>Постижения:</h4>
                          <ul>
                            {partnership.achievements.map((achievement, idx) => (
                              <li key={idx}>{achievement}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      <div className="social-partnerships-contact-info">
                        {partnership.website && (
                          <a 
                            href={partnership.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="social-partnerships-contact-link"
                          >
                            <FontAwesomeIcon icon={faExternalLinkAlt} />
                            <span>Уебсайт</span>
                          </a>
                        )}
                        {partnership.email && (
                          <a 
                            href={`mailto:${partnership.email}`}
                            className="social-partnerships-contact-link"
                          >
                            <FontAwesomeIcon icon={faEnvelope} />
                            <span>Имейл</span>
                          </a>
                        )}
                        {partnership.phone && (
                          <a 
                            href={`tel:${partnership.phone}`}
                            className="social-partnerships-contact-link"
                          >
                            <FontAwesomeIcon icon={faPhone} />
                            <span>Телефон</span>
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="social-partnerships-network">
            <div className="social-partnerships-network-center">
              <div className="social-partnerships-club-node">
                <FontAwesomeIcon icon={faHeart} />
                <span>{club.name}</span>
              </div>
            </div>
            
            <div className="social-partnerships-network-nodes">
              {sortedPartnerships.map((partnership, index) => (
                <div 
                  key={partnership.id}
                  className={`social-partnerships-network-node ${partnership.category}`}
                  style={{ 
                    '--node-delay': `${index * 0.2}s`,
                    '--node-angle': `${(index * 360) / sortedPartnerships.length}deg`
                  }}
                >
                  <div 
                    className="social-partnerships-node-icon"
                    style={{ backgroundColor: getCategoryColor(partnership.category) }}
                  >
                    <FontAwesomeIcon icon={getCategoryIcon(partnership.category)} />
                  </div>
                  <span className="social-partnerships-node-label">{partnership.partner}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {filteredPartnerships.length === 0 && (
          <div className="social-partnerships-no-results">
            <FontAwesomeIcon icon={faHandshake} />
            <h3>Няма намерени партньори</h3>
            <p>Опитайте с различни критерии за търсене</p>
            <button 
              onClick={() => {setActiveCategory('all'); setSearchTerm('');}}
              className="social-partnerships-reset-btn"
            >
              Покажи всички партньори
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default SocialPartnerships;