// components/SportsPartners/SportsPartners.jsx
import { useState } from 'react';
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
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);

  // Проверяваме дали има партньори
  if (!club?.finances?.sponsors?.length && 
      !club?.socialImpact?.partnerships?.length && 
      !club?.pensionersSpecific?.healthServices?.medicalPartners?.length) {
    return null;
  }

  // Събираме всички партньори от различните секции
  const sponsors = club.finances?.sponsors || [];
  const partnerships = club.socialImpact?.partnerships || [];
  const medicalPartners = club.pensionersSpecific?.healthServices?.medicalPartners || [];

  // Създаваме унифицирана структура за всички партньори
  const allPartners = [
    // Спонсори
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
    
    // Партньорства
    ...partnerships.map(partnership => ({
      id: `partnership-${partnership.partner}`,
      name: partnership.partner,
      type: 'partnership',
      category: partnership.type === 'здравно' ? 'medical' :
                partnership.type === 'спортно' ? 'sports' :
                partnership.type === 'образователно' ? 'education' : 'other',
      description: partnership.description,
      partnershipType: partnership.type,
      icon: partnership.type === 'здравно' ? faStethoscope :
            partnership.type === 'спортно' ? faTrophy :
            partnership.type === 'образователно' ? faGraduationCap : faBuilding,
      color: partnership.type === 'здравно' ? '#ef4444' :
             partnership.type === 'спортно' ? '#10b981' :
             partnership.type === 'образователно' ? '#3b82f6' : '#6b7280'
    })),
    
    // Медицински партньори
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

  // Ако няма партньори, не показваме компонента
  if (allPartners.length === 0) {
    return null;
  }

  // Категории за филтриране
  const categories = [
    { key: 'all', label: 'Всички партньори', icon: faUsers, color: '#6366f1' },
    { key: 'financial', label: 'Спонсори', icon: faMoneyBillWave, color: '#f59e0b' },
    { key: 'medical', label: 'Медицински', icon: faStethoscope, color: '#ef4444' },
    { key: 'sports', label: 'Спортни', icon: faTrophy, color: '#10b981' },
    { key: 'education', label: 'Образователни', icon: faGraduationCap, color: '#3b82f6' },
    { key: 'other', label: 'Други', icon: faBuilding, color: '#6b7280' }
  ].filter(category => {
    if (category.key === 'all') return true;
    return allPartners.some(partner => partner.category === category.key);
  });

  // Филтрираме партньорите
  const filteredPartners = activeCategory === 'all' 
    ? allPartners 
    : allPartners.filter(partner => partner.category === activeCategory);

  // Статистики
  const stats = {
    totalPartners: allPartners.length,
    sponsors: sponsors.length,
    medicalPartners: medicalPartners.length,
    partnerships: partnerships.length
  };

  // Handler функции
  const handleCall = (phoneNumber) => {
    if (phoneNumber) {
      window.open(`tel:${phoneNumber}`, '_self');
    }
  };

  const handleCopyPhone = async (phoneNumber) => {
    if (phoneNumber) {
      try {
        await navigator.clipboard.writeText(phoneNumber);
        // Можем да добавим toast notification тук
        alert('Телефонният номер е копиран!');
      } catch (err) {
        console.error('Грешка при копиране:', err);
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

  return (
    <section id="sports-partners" className="sports-partners-section">
      <div className="sports-partners-container">
        
        {/* Header */}
        <div className="sports-partners-header">
          <div className="sports-partners-header-content">
            <div className="sports-partners-badge">
              <FontAwesomeIcon icon={faGem} />
              <span>Нашата мрежа</span>
            </div>
            <h2 className="sports-partners-title">
              Партньори и спонсори
            </h2>
            <p className="sports-partners-subtitle">
              Благодарим на всички партньори, които подкрепят нашата мисия за активно и здравословно стареене
            </p>
          </div>
          
          <div className="sports-partners-stats">
            <div className="sports-partners-stat-card">
              <div className="sports-partners-stat-icon">
                <FontAwesomeIcon icon={faUsers} />
              </div>
              <div className="sports-partners-stat-content">
                <span className="sports-partners-stat-number">{stats.totalPartners}</span>
                <span className="sports-partners-stat-label">Партньори</span>
              </div>
            </div>
            
            {stats.sponsors > 0 && (
              <div className="sports-partners-stat-card">
                <div className="sports-partners-stat-icon">
                  <FontAwesomeIcon icon={faGift} />
                </div>
                <div className="sports-partners-stat-content">
                  <span className="sports-partners-stat-number">{stats.sponsors}</span>
                  <span className="sports-partners-stat-label">Спонсори</span>
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
                  <span className="sports-partners-stat-label">Медицински</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Category Filters */}
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

        {/* Partners Grid */}
        <div className="sports-partners-content">
          <div className="sports-partners-grid">
            {filteredPartners.map((partner, index) => (
              <div 
                key={partner.id}
                className="sports-partners-card"
                style={{ '--card-delay': `${index * 0.1}s` }}
              >
                {/* Partner Header */}
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
                      {partner.type === 'sponsor' && 'Спонсор'}
                      {partner.type === 'partnership' && 'Партньор'}
                      {partner.type === 'medical' && 'Медицински партньор'}
                    </div>
                  </div>
                  
                  <div className="sports-partners-card-badge">
                    <FontAwesomeIcon icon={faCheckCircle} />
                  </div>
                </div>

                {/* Partner Content */}
                <div className="sports-partners-card-content">
                  <p className="sports-partners-card-description">
                    {partner.description}
                  </p>

                  {/* Contact Details */}
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
                          <span>Отстъпка: {partner.discount}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Contribution/Service Details */}
                  {partner.type === 'sponsor' && (
                    <div className="sports-partners-contribution">
                      <div className="sports-partners-contribution-label">
                        <FontAwesomeIcon icon={faGift} />
                        Приносът:
                      </div>
                      <div className="sports-partners-contribution-value">
                        {partner.contribution}
                      </div>
                      {partner.contributionType && (
                        <div className="sports-partners-contribution-type">
                          {partner.contributionType === 'services' && 'Услуги'}
                          {partner.contributionType === 'goods' && 'Стоки'}
                          {partner.contributionType === 'discounts' && 'Отстъпки'}
                          {partner.contributionType === 'financial' && 'Финансова подкрепа'}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Partnership Details */}
                  {partner.type === 'partnership' && (
                    <div className="sports-partners-partnership-details">
                      <div className="sports-partners-partnership-type">
                        <FontAwesomeIcon icon={faHandshake} />
                        <span>
                          {partner.partnershipType === 'здравно' && 'Здравно партньорство'}
                          {partner.partnershipType === 'спортно' && 'Спортно партньорство'}
                          {partner.partnershipType === 'образователно' && 'Образователно партньорство'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Partner Actions */}
                <div className="sports-partners-card-actions">
                  {partner.contact && (
                    <>
                      <button 
                        className="sports-partners-action-btn primary"
                        onClick={() => handleCall(partner.contact)}
                      >
                        <FontAwesomeIcon icon={faPhone} />
                        <span>Обади се</span>
                      </button>
                      <button 
                        className="sports-partners-action-btn secondary"
                        onClick={() => handleCopyPhone(partner.contact)}
                      >
                        <FontAwesomeIcon icon={faCopy} />
                        {/* <span>Копирай</span> */}
                      </button>
                    </>
                  )}
                  
                  {partner.website && (
                    <button 
                      className="sports-partners-action-btn primary"
                      onClick={() => handleWebsite(partner.website)}
                    >
                      <FontAwesomeIcon icon={faGlobe} />
                      <span>Уебсайт</span>
                    </button>
                  )}
                  
                  {hasContactInfo(partner) && (
                    <button 
                      className="sports-partners-action-btn secondary"
                      onClick={() => handleShowDetails(partner)}
                    >
                      <FontAwesomeIcon icon={faInfoCircle} />
                      <span>Детайли</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Partnership Benefits */}
        <div className="sports-partners-benefits">
          <div className="sports-partners-benefits-header">
            <h3>Предимства за нашите членове</h3>
            <p>Благодарение на партньорствата ни, членовете получават:</p>
          </div>
          
          <div className="sports-partners-benefits-grid">
            <div className="sports-partners-benefit-card">
              <div className="sports-partners-benefit-icon">
                <FontAwesomeIcon icon={faPercent} />
              </div>
              <h4>Отстъпки</h4>
              <p>Специални цени за спортни стоки, медицински услуги и хранителни добавки</p>
            </div>
            
            <div className="sports-partners-benefit-card">
              <div className="sports-partners-benefit-icon">
                <FontAwesomeIcon icon={faStethoscope} />
              </div>
              <h4>Здравни услуги</h4>
              <p>Достъп до специализирани медицински прегледи и консултации</p>
            </div>
            
            <div className="sports-partners-benefit-card">
              <div className="sports-partners-benefit-icon">
                <FontAwesomeIcon icon={faTrophy} />
              </div>
              <h4>Спортни съоръжения</h4>
              <p>Безплатен или преференциален достъп до спортни зали и басейни</p>
            </div>
            
            <div className="sports-partners-benefit-card">
              <div className="sports-partners-benefit-icon">
                <FontAwesomeIcon icon={faGraduationCap} />
              </div>
              <h4>Обучения</h4>
              <p>Участие в специализирани курсове и семинари за здравословен живот</p>
            </div>
          </div>
        </div>

        {/* Partnership Call to Action */}
        <div className="sports-partners-cta">
          <div className="sports-partners-cta-content">
            <h3>Искате да станете наш партньор?</h3>
            <p>
              Присъединете се към нашата мисия за подкрепа на активния и здравословен начин на живот
              сред възрастните хора в нашия регион.
            </p>
            <div className="sports-partners-cta-actions">
              <button 
                className="sports-partners-cta-btn primary"
                onClick={handleContactUs}
              >
                <FontAwesomeIcon icon={faHandshake} />
                <span>Станете партньор</span>
              </button>
              <button 
                className="sports-partners-cta-btn secondary"
                onClick={handleContactUs}
              >
                <FontAwesomeIcon icon={faEnvelope} />
                <span>Свържете се с нас</span>
              </button>
            </div>
          </div>
          
          <div className="sports-partners-cta-stats">
            <div className="sports-partners-cta-stat">
              <span className="sports-partners-cta-stat-number">{club.membership?.totalMembers || 0}</span>
              <span className="sports-partners-cta-stat-label">Активни членове</span>
            </div>
            <div className="sports-partners-cta-stat">
              <span className="sports-partners-cta-stat-number">{club.stats?.yearsActive || 0}</span>
              <span className="sports-partners-cta-stat-label">Години опит</span>
            </div>
            <div className="sports-partners-cta-stat">
              <span className="sports-partners-cta-stat-number">{club.metadata?.rating || 0}</span>
              <span className="sports-partners-cta-stat-label">Рейтинг</span>
            </div>
          </div>
        </div>
      </div>

      {/* Partner Details Modal */}
      {selectedPartner && (
        <div className="sports-partners-modal-overlay" onClick={() => setSelectedPartner(null)}>
          <div className="sports-partners-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sports-partners-modal-header">
              <h3>{selectedPartner.name}</h3>
              <button 
                onClick={() => setSelectedPartner(null)}
                className="sports-partners-modal-close"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <div className="sports-partners-modal-content">
              <p>{selectedPartner.description}</p>
              
              {selectedPartner.contact && (
                <div className="sports-partners-modal-detail">
                  <FontAwesomeIcon icon={faPhone} />
                  <span>Телефон: {selectedPartner.contact}</span>
                  <button onClick={() => handleCall(selectedPartner.contact)}>
                    <FontAwesomeIcon icon={faPhone} />
                  </button>
                  <button onClick={() => handleCopyPhone(selectedPartner.contact)}>
                    <FontAwesomeIcon icon={faCopy} />
                  </button>
                </div>
              )}
              
              {selectedPartner.address && (
                <div className="sports-partners-modal-detail">
                  <FontAwesomeIcon icon={faMapMarkerAlt} />
                  <span>Адрес: {selectedPartner.address}</span>
                </div>
              )}
              
              {selectedPartner.workingHours && (
                <div className="sports-partners-modal-detail">
                  <FontAwesomeIcon icon={faClock} />
                  <span>Работно време: {selectedPartner.workingHours}</span>
                </div>
              )}
              
              {selectedPartner.website && (
                <div className="sports-partners-modal-detail">
                  <FontAwesomeIcon icon={faGlobe} />
                  <span>Уебсайт: {selectedPartner.website}</span>
                  <button onClick={() => handleWebsite(selectedPartner.website)}>
                    <FontAwesomeIcon icon={faExternalLinkAlt} />
                  </button>
                </div>
              )}
              
              {selectedPartner.discount && (
                <div className="sports-partners-modal-detail">
                  <FontAwesomeIcon icon={faPercent} />
                  <span>Отстъпка: {selectedPartner.discount}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {showContactModal && (
        <div className="sports-partners-modal-overlay" onClick={() => setShowContactModal(false)}>
          <div className="sports-partners-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sports-partners-modal-header">
              <h3>Свържете се с нас</h3>
              <button 
                onClick={() => setShowContactModal(false)}
                className="sports-partners-modal-close"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <div className="sports-partners-modal-content">
              <p>За повече информация за партньорство се свържете с нас:</p>
              
              {club.contacts?.phone && (
                <div className="sports-partners-modal-detail">
                  <FontAwesomeIcon icon={faPhone} />
                  <span>Телефон: {club.contacts.phone}</span>
                  <button onClick={() => handleCall(club.contacts.phone)}>
                    <FontAwesomeIcon icon={faPhone} />
                  </button>
                  <button onClick={() => handleCopyPhone(club.contacts.phone)}>
                    <FontAwesomeIcon icon={faCopy} />
                  </button>
                </div>
              )}
              
              {club.contacts?.email && (
                <div className="sports-partners-modal-detail">
                  <FontAwesomeIcon icon={faEnvelope} />
                  <span>Имейл: {club.contacts.email}</span>
                  <button onClick={() => window.open(`mailto:${club.contacts.email}`, '_self')}>
                    <FontAwesomeIcon icon={faEnvelope} />
                  </button>
                </div>
              )}
              
              {club.location?.address && (
                <div className="sports-partners-modal-detail">
                  <FontAwesomeIcon icon={faMapMarkerAlt} />
                  <span>Адрес: {club.location.address}</span>
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