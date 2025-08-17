import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t, i18n } = useTranslation();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedPartner, setExpandedPartner] = useState(null);
  const [viewMode, setViewMode] = useState('cards');

  if (!club?.socialImpact?.partnerships && 
      !club?.partnerships && 
      !club?.collaborations &&
      !club?.sponsors) {
    return null;
  }

  const socialPartnerships = club.socialImpact?.partnerships || [];
  const generalPartnerships = club.partnerships || [];
  const collaborations = club.collaborations || [];
  const sponsors = club.sponsors || [];

  const getPartnershipCategory = (partnerName, partnerType) => {
    const name = partnerName?.toLowerCase() || '';
    const type = partnerType?.toLowerCase() || '';
    
    const categoryTerms = t('clubs.SocialPartnerships.categoryTerms', { returnObjects: true });
    
    for (const [categoryKey, terms] of Object.entries(categoryTerms)) {
      const typeTerms = terms.type || [];
      const nameTerms = terms.name || [];
      
      if (typeTerms.some(term => type.includes(term)) || nameTerms.some(term => name.includes(term))) {
        return categoryKey;
      }
    }
    
    return 'business';
  };

  const getPriorityLevel = (type) => {
    const typeStr = type?.toLowerCase() || '';
    const priorityTerms = t('clubs.SocialPartnerships.priorityTerms', { returnObjects: true });
    
    if (priorityTerms.high.some(term => typeStr.includes(term))) return 'high';
    if (priorityTerms.medium.some(term => typeStr.includes(term))) return 'medium';
    return 'normal';
  };

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

  if (allPartnerships.length === 0) {
    return null;
  }

  const getCategoryIcon = (category) => {
    const iconMap = {
      government: faUniversity,
      healthcare: faHospital,
      education: faGraduationCap,
      business: faBuilding,
      ngo: faHeart,
      culture: faPalette,
      sponsor: faTrophy
    };
    return iconMap[category] || faHandshake;
  };

  const getCategoryColor = (category) => {
    const colorMap = {
      government: '#dc2626',
      healthcare: '#059669',
      education: '#2563eb',
      business: '#7c3aed',
      ngo: '#ea580c',
      culture: '#c026d3',
      sponsor: '#ca8a04'
    };
    return colorMap[category] || '#6b7280';
  };

  const getCategoryLabel = (category) => {
    return t(`clubs.SocialPartnerships.categories.${category}`, category);
  };

  const getPriorityIcon = (priority) => {
    const iconMap = {
      high: faStar,
      medium: faAward,
      normal: faCheckCircle
    };
    return iconMap[priority] || faCheckCircle;
  };

  const getPriorityColor = (priority) => {
    const colorMap = {
      high: '#f59e0b',
      medium: '#8b5cf6',
      normal: '#10b981'
    };
    return colorMap[priority] || '#10b981';
  };

  const getCategories = () => [
    { key: 'all', label: t('clubs.SocialPartnerships.categories.all'), icon: faHandshake },
    { key: 'government', label: t('clubs.SocialPartnerships.categories.government'), icon: faUniversity },
    { key: 'healthcare', label: t('clubs.SocialPartnerships.categories.healthcare'), icon: faHospital },
    { key: 'education', label: t('clubs.SocialPartnerships.categories.education'), icon: faGraduationCap },
    { key: 'business', label: t('clubs.SocialPartnerships.categories.business'), icon: faBuilding },
    { key: 'ngo', label: t('clubs.SocialPartnerships.categories.ngo'), icon: faHeart },
    { key: 'culture', label: t('clubs.SocialPartnerships.categories.culture'), icon: faPalette },
    { key: 'sponsor', label: t('clubs.SocialPartnerships.categories.sponsor'), icon: faTrophy }
  ];

  const categories = getCategories();

  const filteredPartnerships = allPartnerships.filter(partnership => {
    const matchesCategory = activeCategory === 'all' || partnership.category === activeCategory;
    const matchesSearch = partnership.partner?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         partnership.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         partnership.type?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
    const locale = i18n.language === 'bg' ? 'bg-BG' : 
                   i18n.language === 'de' ? 'de-DE' : 'en-US';
    
    return date.toLocaleDateString(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const resetFilters = () => {
    setActiveCategory('all');
    setSearchTerm('');
  };

  return (
    <section id="social-partnerships" className="social-partnerships-section">
      <div className="social-partnerships-container">
        
        <div className="social-partnerships-header">
          <div className="social-partnerships-header-content">
            <div className="social-partnerships-badge">
              <FontAwesomeIcon icon={faNetworkWired} />
              <span>{t('clubs.SocialPartnerships.header.badge')}</span>
            </div>
            <h2 className="social-partnerships-title">
              {t('clubs.SocialPartnerships.header.title')}
            </h2>
            <p className="social-partnerships-subtitle">
              {t('clubs.SocialPartnerships.header.subtitle')}
            </p>
          </div>
          
          <div className="social-partnerships-stats">
            <div className="social-partnerships-stat">
              <span className="social-partnerships-stat-number">{allPartnerships.length}</span>
              <span className="social-partnerships-stat-label">{t('clubs.SocialPartnerships.stats.partners')}</span>
            </div>
            <div className="social-partnerships-stat">
              <span className="social-partnerships-stat-number">
                {allPartnerships.filter(p => p.priority === 'high').length}
              </span>
              <span className="social-partnerships-stat-label">{t('clubs.SocialPartnerships.stats.strategic')}</span>
            </div>
          </div>
        </div>

        <div className="social-partnerships-controls">
          <div className="social-partnerships-search-bar">
            <FontAwesomeIcon icon={faSearch} />
            <input
              type="text"
              placeholder={t('clubs.SocialPartnerships.search.placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="social-partnerships-toolbar">
            <div className="social-partnerships-view-toggle">
              <button 
                onClick={() => setViewMode('cards')}
                className={`social-partnerships-view-btn ${viewMode === 'cards' ? 'active' : ''}`}
              >
                <FontAwesomeIcon icon={faUsers} />
                <span>{t('clubs.SocialPartnerships.viewModes.cards')}</span>
              </button>
              <button 
                onClick={() => setViewMode('network')}
                className={`social-partnerships-view-btn ${viewMode === 'network' ? 'active' : ''}`}
              >
                <FontAwesomeIcon icon={faNetworkWired} />
                <span>{t('clubs.SocialPartnerships.viewModes.network')}</span>
              </button>
            </div>
            
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
                        <span>{t('clubs.SocialPartnerships.details.since')} {formatDate(partnership.since) || partnership.since}</span>
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
                        {expandedPartner === partnership.id ? 
                          t('clubs.SocialPartnerships.actions.hideDetails') : 
                          t('clubs.SocialPartnerships.actions.showMore')}
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
                          <h4>{t('clubs.SocialPartnerships.details.jointProjects')}:</h4>
                          <ul>
                            {partnership.projects.map((project, idx) => (
                              <li key={idx}>{project}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {partnership.achievements && (
                        <div className="social-partnerships-achievements">
                          <h4>{t('clubs.SocialPartnerships.details.achievements')}:</h4>
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
                            <span>{t('clubs.SocialPartnerships.contact.website')}</span>
                          </a>
                        )}
                        {partnership.email && (
                          <a 
                            href={`mailto:${partnership.email}`}
                            className="social-partnerships-contact-link"
                          >
                            <FontAwesomeIcon icon={faEnvelope} />
                            <span>{t('clubs.SocialPartnerships.contact.email')}</span>
                          </a>
                        )}
                        {partnership.phone && (
                          <a 
                            href={`tel:${partnership.phone}`}
                            className="social-partnerships-contact-link"
                          >
                            <FontAwesomeIcon icon={faPhone} />
                            <span>{t('clubs.SocialPartnerships.contact.phone')}</span>
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

        {filteredPartnerships.length === 0 && (
          <div className="social-partnerships-no-results">
            <FontAwesomeIcon icon={faHandshake} />
            <h3>{t('clubs.SocialPartnerships.noResults.title')}</h3>
            <p>{t('clubs.SocialPartnerships.noResults.message')}</p>
            <button 
              onClick={resetFilters}
              className="social-partnerships-reset-btn"
            >
              {t('clubs.SocialPartnerships.noResults.showAll')}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default SocialPartnerships;