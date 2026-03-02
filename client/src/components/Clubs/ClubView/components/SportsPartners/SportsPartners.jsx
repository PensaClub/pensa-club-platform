import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHandshake,
  faUsers,
  faHeart,
  faStar,
  faGift,
  faTrophy,
  faUserMd,
  faGraduationCap,
  faDollarSign,
  faStore,
  faPhone,
  faMapMarkerAlt,
  faGlobe,
  faEnvelope,
  faClock,
  faPercent,
  faShoppingCart,
  faStethoscope,
  faSchool,
  faBuilding,
  faShieldAlt,
  faGem,
  faAward,
  faMedal,
  faCheckCircle,
  faInfoCircle,
  faExternalLinkAlt,
  faThumbsUp,
  faHandsHelping,
  faMoneyBillWave,
  faTools,
  faFirstAid,
  faCopy,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import './sportsPartners.css';

export const SportsPartners = ({ club }) => {
  const { t, i18n } = useTranslation('clubs');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);

  if (!club?.finances?.sponsors?.length && 
      !club?.socialImpact?.partnerships?.length && 
      !club?.pensionersSpecific?.healthServices?.medicalPartners?.length) {
    return null;
  }

  const sponsors = club.finances?.sponsors || [];
  const partnerships = club.socialImpact?.partnerships || [];
  const medicalPartners = club.pensionersSpecific?.healthServices?.medicalPartners || [];

  const getPartnershipCategoryMapping = () => {
    const healthTerms = t('clubs.SportsPartners.partnershipTerms.health', { returnObjects: true });
    const sportsTerms = t('clubs.SportsPartners.partnershipTerms.sports', { returnObjects: true });
    const educationTerms = t('clubs.SportsPartners.partnershipTerms.education', { returnObjects: true });
    
    return { healthTerms, sportsTerms, educationTerms };
  };

  const getPartnershipCategory = (partnershipType) => {
    const { healthTerms, sportsTerms, educationTerms } = getPartnershipCategoryMapping();
    
    if (healthTerms.includes(partnershipType)) return 'medical';
    if (sportsTerms.includes(partnershipType)) return 'sports';
    if (educationTerms.includes(partnershipType)) return 'education';
    return 'other';
  };

  const getPartnershipIcon = (partnershipType) => {
    const { healthTerms, sportsTerms, educationTerms } = getPartnershipCategoryMapping();
    
    if (healthTerms.includes(partnershipType)) return faStethoscope;
    if (sportsTerms.includes(partnershipType)) return faTrophy;
    if (educationTerms.includes(partnershipType)) return faGraduationCap;
    return faBuilding;
  };

  const getPartnershipColor = (partnershipType) => {
    const { healthTerms, sportsTerms, educationTerms } = getPartnershipCategoryMapping();
    
    if (healthTerms.includes(partnershipType)) return '#ef4444';
    if (sportsTerms.includes(partnershipType)) return '#10b981';
    if (educationTerms.includes(partnershipType)) return '#3b82f6';
    return '#6b7280';
  };

  const allPartners = [
    ...sponsors.map(sponsor => ({
      id: `sponsor-${sponsor.name}`,
      name: sponsor.name,
      type: 'sponsor',
      category: 'financial',
      contribution: sponsor.contribution,
      contributionType: sponsor.type,
      contact: sponsor.contact,
      address: sponsor.address,
      website: sponsor.website,
      workingHours: sponsor.workingHours,
      discount: sponsor.discount,
      description: sponsor.description || sponsor.contribution,
      icon: sponsor.type === 'services' ? faTools : 
            sponsor.type === 'goods' ? faGift : faMoneyBillWave,
      color: '#f59e0b'
    })),
    
    ...partnerships.map(partnership => ({
      id: `partnership-${partnership.partner}`,
      name: partnership.partner,
      type: 'partnership',
      category: getPartnershipCategory(partnership.type),
      description: partnership.description,
      partnershipType: partnership.type,
      icon: getPartnershipIcon(partnership.type),
      color: getPartnershipColor(partnership.type)
    })),
    
    ...medicalPartners.map(partner => ({
      id: `medical-${partner.name}`,
      name: partner.name,
      type: 'medical',
      category: 'medical',
      service: partner.service,
      contact: partner.contact,
      address: partner.address,
      workingHours: partner.workingHours,
      discount: partner.discount,
      description: partner.service,
      icon: faUserMd,
      color: '#ef4444'
    }))
  ];

  if (allPartners.length === 0) {
    return null;
  }

  const getCategories = () => [
    { 
      key: 'all', 
      label: t('clubs.SportsPartners.categories.all'), 
      icon: faUsers, 
      color: '#6366f1' 
    },
    { 
      key: 'financial', 
      label: t('clubs.SportsPartners.categories.financial'), 
      icon: faMoneyBillWave, 
      color: '#f59e0b' 
    },
    { 
      key: 'medical', 
      label: t('clubs.SportsPartners.categories.medical'), 
      icon: faStethoscope, 
      color: '#ef4444' 
    },
    { 
      key: 'sports', 
      label: t('clubs.SportsPartners.categories.sports'), 
      icon: faTrophy, 
      color: '#10b981' 
    },
    { 
      key: 'education', 
      label: t('clubs.SportsPartners.categories.education'), 
      icon: faGraduationCap, 
      color: '#3b82f6' 
    },
    { 
      key: 'other', 
      label: t('clubs.SportsPartners.categories.other'), 
      icon: faBuilding, 
      color: '#6b7280' 
    }
  ].filter(category => {
    if (category.key === 'all') return true;
    return allPartners.some(partner => partner.category === category.key);
  });

  const categories = getCategories();

  const filteredPartners = activeCategory === 'all' 
    ? allPartners 
    : allPartners.filter(partner => partner.category === activeCategory);

  const stats = {
    totalPartners: allPartners.length,
    sponsors: sponsors.length,
    medicalPartners: medicalPartners.length,
    partnerships: partnerships.length
  };

  const handleCall = (phoneNumber) => {
    if (phoneNumber) {
      window.open(`tel:${phoneNumber}`, '_self');
    }
  };

  const handleCopyPhone = async (phoneNumber) => {
    if (phoneNumber) {
      try {
        await navigator.clipboard.writeText(phoneNumber);
        alert(t('clubs.SportsPartners.messages.phoneCopied'));
      } catch (err) {
        console.error('Copy error:', err);
      }
    }
  };

  const handleWebsite = (website) => {
    if (website) {
      const url = website.startsWith('http') ? website : `https://${website}`;
      window.open(url, '_blank');
    }
  };

  const handleShowDetails = (partner) => {
    setSelectedPartner(partner);
  };

  const handleContactUs = () => {
    setShowContactModal(true);
  };

  const hasContactInfo = (partner) => {
    return partner.contact || partner.address || partner.website || partner.workingHours;
  };

  const getPartnerTypeLabel = (partner) => {
    if (partner.type === 'sponsor') return t('clubs.SportsPartners.partnerTypes.sponsor');
    if (partner.type === 'partnership') return t('clubs.SportsPartners.partnerTypes.partnership');
    if (partner.type === 'medical') return t('clubs.SportsPartners.partnerTypes.medical');
    return '';
  };

  const getContributionTypeLabel = (contributionType) => {
    const typeMap = {
      'services': t('clubs.SportsPartners.contributionTypes.services'),
      'goods': t('clubs.SportsPartners.contributionTypes.goods'),
      'discounts': t('clubs.SportsPartners.contributionTypes.discounts'),
      'financial': t('clubs.SportsPartners.contributionTypes.financial')
    };
    return typeMap[contributionType] || contributionType;
  };

  const getPartnershipTypeLabel = (partnershipType) => {
    const { healthTerms, sportsTerms, educationTerms } = getPartnershipCategoryMapping();
    
    if (healthTerms.includes(partnershipType)) {
      return t('clubs.SportsPartners.partnershipTypes.health');
    }
    if (sportsTerms.includes(partnershipType)) {
      return t('clubs.SportsPartners.partnershipTypes.sports');
    }
    if (educationTerms.includes(partnershipType)) {
      return t('clubs.SportsPartners.partnershipTypes.education');
    }
    return partnershipType;
  };

  return (
    <section id="sports-partners" className="sports-partners-section">
      <div className="sports-partners-container">
        
        <div className="sports-partners-header">
          <div className="sports-partners-header-content">
            <div className="sports-partners-badge">
              <FontAwesomeIcon icon={faGem} />
              <span>{t('clubs.SportsPartners.header.badge')}</span>
            </div>
            <h2 className="sports-partners-title">
              {t('clubs.SportsPartners.header.title')}
            </h2>
            <p className="sports-partners-subtitle">
              {t('clubs.SportsPartners.header.subtitle')}
            </p>
          </div>
          
          <div className="sports-partners-stats">
            <div className="sports-partners-stat-card">
              <div className="sports-partners-stat-icon">
                <FontAwesomeIcon icon={faUsers} />
              </div>
              <div className="sports-partners-stat-content">
                <span className="sports-partners-stat-number">{stats.totalPartners}</span>
                <span className="sports-partners-stat-label">{t('clubs.SportsPartners.stats.partners')}</span>
              </div>
            </div>
            
            {stats.sponsors > 0 && (
              <div className="sports-partners-stat-card">
                <div className="sports-partners-stat-icon">
                  <FontAwesomeIcon icon={faGift} />
                </div>
                <div className="sports-partners-stat-content">
                  <span className="sports-partners-stat-number">{stats.sponsors}</span>
                  <span className="sports-partners-stat-label">{t('clubs.SportsPartners.stats.sponsors')}</span>
                </div>
              </div>
            )}
            
            {stats.medicalPartners > 0 && (
              <div className="sports-partners-stat-card">
                <div className="sports-partners-stat-icon">
                  <FontAwesomeIcon icon={faStethoscope} />
                </div>
                <div className="sports-partners-stat-content">
                  <span className="sports-partners-stat-number">{stats.medicalPartners}</span>
                  <span className="sports-partners-stat-label">{t('clubs.SportsPartners.stats.medical')}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="sports-partners-filters">
          {categories.map(category => {
            const count = category.key === 'all' ? allPartners.length :
                         allPartners.filter(p => p.category === category.key).length;
            
            return (
              <button
                key={category.key}
                onClick={() => setActiveCategory(category.key)}
                className={`sports-partners-filter-chip ${activeCategory === category.key ? 'active' : ''}`}
                style={{ '--filter-color': category.color }}
              >
                <FontAwesomeIcon icon={category.icon} />
                <span>{category.label}</span>
                <span className="sports-partners-filter-count">{count}</span>
              </button>
            );
          })}
        </div>

        <div className="sports-partners-content">
          <div className="sports-partners-grid">
            {filteredPartners.map((partner, index) => (
              <div 
                key={partner.id}
                className="sports-partners-card"
                style={{ '--card-delay': `${index * 0.1}s` }}
              >
                <div className="sports-partners-card-header">
                  <div 
                    className="sports-partners-card-icon"
                    style={{ '--icon-color': partner.color }}
                  >
                    <FontAwesomeIcon icon={partner.icon} />
                  </div>
                  
                  <div className="sports-partners-card-title">
                    <h3>{partner.name}</h3>
                    <div className="sports-partners-card-type">
                      {getPartnerTypeLabel(partner)}
                    </div>
                  </div>
                  
                  <div className="sports-partners-card-badge">
                    <FontAwesomeIcon icon={faCheckCircle} />
                  </div>
                </div>

                <div className="sports-partners-card-content">
                  <p className="sports-partners-card-description">
                    {partner.description}
                  </p>

                  {(partner.contact || partner.address || partner.workingHours) && (
                    <div className="sports-partners-contact-details">
                      {partner.contact && (
                        <div className="sports-partners-detail">
                          <FontAwesomeIcon icon={faPhone} />
                          <span>{partner.contact}</span>
                        </div>
                      )}
                      
                      {partner.address && (
                        <div className="sports-partners-detail">
                          <FontAwesomeIcon icon={faMapMarkerAlt} />
                          <span>{partner.address}</span>
                        </div>
                      )}
                      
                      {partner.workingHours && (
                        <div className="sports-partners-detail">
                          <FontAwesomeIcon icon={faClock} />
                          <span>{partner.workingHours}</span>
                        </div>
                      )}
                      
                      {partner.discount && (
                        <div className="sports-partners-discount">
                          <FontAwesomeIcon icon={faPercent} />
                          <span>{t('clubs.SportsPartners.labels.discount')}: {partner.discount}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {partner.type === 'sponsor' && (
                    <div className="sports-partners-contribution">
                      <div className="sports-partners-contribution-label">
                        <FontAwesomeIcon icon={faGift} />
                        {t('clubs.SportsPartners.labels.contribution')}:
                      </div>
                      <div className="sports-partners-contribution-value">
                        {partner.contribution}
                      </div>
                      {partner.contributionType && (
                        <div className="sports-partners-contribution-type">
                          {getContributionTypeLabel(partner.contributionType)}
                        </div>
                      )}
                    </div>
                  )}

                  {partner.type === 'partnership' && (
                    <div className="sports-partners-partnership-details">
                      <div className="sports-partners-partnership-type">
                        <FontAwesomeIcon icon={faHandshake} />
                        <span>
                          {getPartnershipTypeLabel(partner.partnershipType)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="sports-partners-card-actions">
                  {partner.contact && (
                    <>
                      <button 
                        className="sports-partners-action-btn primary"
                        onClick={() => handleCall(partner.contact)}
                        title={t('clubs.SportsPartners.actions.call')}
                      >
                        <FontAwesomeIcon icon={faPhone} />
                        <span>{t('clubs.SportsPartners.actions.call')}</span>
                      </button>
                      <button 
                        className="sports-partners-action-btn secondary"
                        onClick={() => handleCopyPhone(partner.contact)}
                        title={t('clubs.SportsPartners.actions.copy')}
                      >
                        <FontAwesomeIcon icon={faCopy} />
                      </button>
                    </>
                  )}
                  
                  {partner.website && (
                    <button 
                      className="sports-partners-action-btn primary"
                      onClick={() => handleWebsite(partner.website)}
                      title={t('clubs.SportsPartners.actions.website')}
                    >
                      <FontAwesomeIcon icon={faGlobe} />
                      <span>{t('clubs.SportsPartners.actions.website')}</span>
                    </button>
                  )}
                  
                  {hasContactInfo(partner) && (
                    <button 
                      className="sports-partners-action-btn secondary"
                      onClick={() => handleShowDetails(partner)}
                      title={t('clubs.SportsPartners.actions.details')}
                    >
                      <FontAwesomeIcon icon={faInfoCircle} />
                      <span>{t('clubs.SportsPartners.actions.details')}</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="sports-partners-benefits">
          <div className="sports-partners-benefits-header">
            <h3>{t('clubs.SportsPartners.benefits.title')}</h3>
            <p>{t('clubs.SportsPartners.benefits.subtitle')}</p>
          </div>
          
          <div className="sports-partners-benefits-grid">
            <div className="sports-partners-benefit-card">
              <div className="sports-partners-benefit-icon">
                <FontAwesomeIcon icon={faPercent} />
              </div>
              <h4>{t('clubs.SportsPartners.benefits.discounts.title')}</h4>
              <p>{t('clubs.SportsPartners.benefits.discounts.description')}</p>
            </div>
            
            <div className="sports-partners-benefit-card">
              <div className="sports-partners-benefit-icon">
                <FontAwesomeIcon icon={faStethoscope} />
              </div>
              <h4>{t('clubs.SportsPartners.benefits.healthServices.title')}</h4>
              <p>{t('clubs.SportsPartners.benefits.healthServices.description')}</p>
            </div>
            
            <div className="sports-partners-benefit-card">
              <div className="sports-partners-benefit-icon">
                <FontAwesomeIcon icon={faTrophy} />
              </div>
              <h4>{t('clubs.SportsPartners.benefits.sportsFacilities.title')}</h4>
              <p>{t('clubs.SportsPartners.benefits.sportsFacilities.description')}</p>
            </div>
            
            <div className="sports-partners-benefit-card">
              <div className="sports-partners-benefit-icon">
                <FontAwesomeIcon icon={faGraduationCap} />
              </div>
              <h4>{t('clubs.SportsPartners.benefits.training.title')}</h4>
              <p>{t('clubs.SportsPartners.benefits.training.description')}</p>
            </div>
          </div>
        </div>

        <div className="sports-partners-cta">
          <div className="sports-partners-cta-content">
            <h3>{t('clubs.SportsPartners.cta.title')}</h3>
            <p>{t('clubs.SportsPartners.cta.subtitle')}</p>
            <div className="sports-partners-cta-actions">
              <button 
                className="sports-partners-cta-btn primary"
                onClick={handleContactUs}
              >
                <FontAwesomeIcon icon={faHandshake} />
                <span>{t('clubs.SportsPartners.cta.becomePartner')}</span>
              </button>
              <button 
                className="sports-partners-cta-btn secondary"
                onClick={handleContactUs}
              >
                <FontAwesomeIcon icon={faEnvelope} />
                <span>{t('clubs.SportsPartners.cta.contactUs')}</span>
              </button>
            </div>
          </div>
          
          <div className="sports-partners-cta-stats">
            <div className="sports-partners-cta-stat">
              <span className="sports-partners-cta-stat-number">{club.membership?.totalMembers || 0}</span>
              <span className="sports-partners-cta-stat-label">{t('clubs.SportsPartners.cta.stats.activeMembers')}</span>
            </div>
            <div className="sports-partners-cta-stat">
              <span className="sports-partners-cta-stat-number">{club.stats?.yearsActive || 0}</span>
              <span className="sports-partners-cta-stat-label">{t('clubs.SportsPartners.cta.stats.yearsExperience')}</span>
            </div>
            <div className="sports-partners-cta-stat">
              <span className="sports-partners-cta-stat-number">{club.metadata?.rating || 0}</span>
              <span className="sports-partners-cta-stat-label">{t('clubs.SportsPartners.cta.stats.rating')}</span>
            </div>
          </div>
        </div>
      </div>

      {selectedPartner && (
        <div className="sports-partners-modal-overlay" onClick={() => setSelectedPartner(null)}>
          <div className="sports-partners-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sports-partners-modal-header">
              <h3>{selectedPartner.name}</h3>
              <button 
                onClick={() => setSelectedPartner(null)}
                className="sports-partners-modal-close"
                title={t('clubs.SportsPartners.modal.close')}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <div className="sports-partners-modal-content">
              <p>{selectedPartner.description}</p>
              
              {selectedPartner.contact && (
                <div className="sports-partners-modal-detail">
                  <FontAwesomeIcon icon={faPhone} />
                  <span>{t('clubs.SportsPartners.modal.phone')}: {selectedPartner.contact}</span>
                  <button 
                    onClick={() => handleCall(selectedPartner.contact)}
                    title={t('clubs.SportsPartners.actions.call')}
                  >
                    <FontAwesomeIcon icon={faPhone} />
                  </button>
                  <button 
                    onClick={() => handleCopyPhone(selectedPartner.contact)}
                    title={t('clubs.SportsPartners.actions.copy')}
                  >
                    <FontAwesomeIcon icon={faCopy} />
                  </button>
                </div>
              )}
              
              {selectedPartner.address && (
                <div className="sports-partners-modal-detail">
                  <FontAwesomeIcon icon={faMapMarkerAlt} />
                  <span>{t('clubs.SportsPartners.modal.address')}: {selectedPartner.address}</span>
                </div>
              )}
              
              {selectedPartner.workingHours && (
                <div className="sports-partners-modal-detail">
                  <FontAwesomeIcon icon={faClock} />
                  <span>{t('clubs.SportsPartners.modal.workingHours')}: {selectedPartner.workingHours}</span>
                </div>
              )}
              
              {selectedPartner.website && (
                <div className="sports-partners-modal-detail">
                  <FontAwesomeIcon icon={faGlobe} />
                  <span>{t('clubs.SportsPartners.modal.website')}: {selectedPartner.website}</span>
                  <button 
                    onClick={() => handleWebsite(selectedPartner.website)}
                    title={t('clubs.SportsPartners.actions.website')}
                  >
                    <FontAwesomeIcon icon={faExternalLinkAlt} />
                  </button>
                </div>
              )}
              
              {selectedPartner.discount && (
                <div className="sports-partners-modal-detail">
                  <FontAwesomeIcon icon={faPercent} />
                  <span>{t('clubs.SportsPartners.modal.discount')}: {selectedPartner.discount}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showContactModal && (
        <div className="sports-partners-modal-overlay" onClick={() => setShowContactModal(false)}>
          <div className="sports-partners-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sports-partners-modal-header">
              <h3>{t('clubs.SportsPartners.contactModal.title')}</h3>
              <button 
                onClick={() => setShowContactModal(false)}
                className="sports-partners-modal-close"
                title={t('clubs.SportsPartners.modal.close')}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <div className="sports-partners-modal-content">
              <p>{t('clubs.SportsPartners.contactModal.subtitle')}</p>
              
              {club.contacts?.phone && (
                <div className="sports-partners-modal-detail">
                  <FontAwesomeIcon icon={faPhone} />
                  <span>{t('clubs.SportsPartners.modal.phone')}: {club.contacts.phone}</span>
                  <button 
                    onClick={() => handleCall(club.contacts.phone)}
                    title={t('clubs.SportsPartners.actions.call')}
                  >
                    <FontAwesomeIcon icon={faPhone} />
                  </button>
                  <button 
                    onClick={() => handleCopyPhone(club.contacts.phone)}
                    title={t('clubs.SportsPartners.actions.copy')}
                  >
                    <FontAwesomeIcon icon={faCopy} />
                  </button>
                </div>
              )}
              
              {club.contacts?.email && (
                <div className="sports-partners-modal-detail">
                  <FontAwesomeIcon icon={faEnvelope} />
                  <span>{t('clubs.SportsPartners.modal.email')}: {club.contacts.email}</span>
                  <button 
                    onClick={() => window.open(`mailto:${club.contacts.email}`, '_self')}
                    title={t('clubs.SportsPartners.actions.email')}
                  >
                    <FontAwesomeIcon icon={faEnvelope} />
                  </button>
                </div>
              )}
              
              {club.location?.address && (
                <div className="sports-partners-modal-detail">
                  <FontAwesomeIcon icon={faMapMarkerAlt} />
                  <span>{t('clubs.SportsPartners.modal.address')}: {club.location.address}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default SportsPartners;