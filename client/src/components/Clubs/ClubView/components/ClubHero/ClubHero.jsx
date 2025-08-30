import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, 
  faCalendarAlt, 
  faStar,
  faMapMarkerAlt,
  faPhone,
  faEnvelope,
  faGlobe,
  faChevronLeft,
  faChevronRight,
  faPlay,
  faTimes,
  faUserPlus,
  faInfoCircle,
  faEye,
  faHeart,
  faShare,
  faCrown,
  faUserCircle,
  faIdCard,
  faSearch
} from '@fortawesome/free-solid-svg-icons';
import { 
  faFacebook,
  faInstagram,
  faYoutube,
  faTwitter
} from '@fortawesome/free-brands-svg-icons';
import './clubHero.css';

export const ClubHero = ({ club }) => {
  const { t } = useTranslation();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [memberSearchTerm, setMemberSearchTerm] = useState('');

  if (!club?.name) {
    return null;
  }

  const getImages = () => {
    if (!club.preferences?.publicGallery) {
      return [];
    }
    
    const images = [];
    
    if (club.gallery && Array.isArray(club.gallery)) {
      images.push(...club.gallery.map(img => typeof img === 'string' ? img : img.src || img.url));
    }
    
    if (club.mainImage) {
      images.push(club.mainImage);
    }
    
    if (club.activities?.events) {
      club.activities.events.forEach(event => {
        if (event.images) {
          event.images.forEach(img => images.push(img.src || img));
        }
      });
    }
    
    return images.filter(Boolean).slice(0, 8);
  };

  const images = getImages();

  const nextImage = () => {
    if (images.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (images.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? images.length - 1 : prev - 1
      );
    }
  };

  const getCategoryLabel = (category) => {
    return t(`clubs.ClubHero.categories.${category}`, { 
      defaultValue: t('clubs.ClubHero.categories.general') 
    });
  };

  const renderStars = (rating) => {
    const stars = [];
    const safeRating = rating || 0;
    const fullStars = Math.floor(safeRating);
    const hasHalfStar = safeRating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<FontAwesomeIcon key={i} icon={faStar} className="general-star filled" />);
    }
    
    if (hasHalfStar) {
      stars.push(<FontAwesomeIcon key="half" icon={faStar} className="general-star half" />);
    }
    
    const remainingStars = 5 - Math.ceil(safeRating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<FontAwesomeIcon key={`empty-${i}`} icon={faStar} className="general-star empty" />);
    }
    
    return stars;
  };

  const getStats = () => {
    const totalMembers = club.membership?.totalMembers || 
                        club.membership?.activeMembers || 
                        club.stats?.totalMembers ||
                        (club.members ? club.members.filter(m => m.isActive !== false).length : 0) ||
                        (club.management?.board?.length || 0) + 20;
    
    const yearsActive = club.foundedYear ? 
                       new Date().getFullYear() - club.foundedYear : 
                       club.stats?.yearsActive ||
                       5;
    
    const activitiesCount = (club.activities?.regular?.length || 0) + 
                           (club.activities?.events?.length || 0) + 
                           (club.activities?.classes?.length || 0) ||
                           club.stats?.programs ||
                           3;

    const eventsCount = club.activities?.events?.length || 
                       club.stats?.events || 
                       12;

    return { totalMembers, yearsActive, activitiesCount, eventsCount };
  };

  const stats = getStats();

  const getMembers = () => {
    const members = [];
    
    if (club.members && Array.isArray(club.members)) {
      club.members.forEach(member => {
        if (member.isActive !== false) {
          members.push({
            id: member.id,
            name: `${member.firstName} ${member.lastName}`,
            role: member.role || t('clubs.ClubHero.members.defaultRole', { defaultValue: 'Член' }),
            phone: member.phone,
            email: member.email,
            address: member.address,
            avatar: member.photo?.src,
            isBoard: ['председател', 'секретар', 'касиер', 'заместник-председател'].includes(member.role?.toLowerCase()),
            memberSince: member.joinDate ? new Date(member.joinDate).getFullYear() : null,
            joinDate: member.joinDate,
            bio: null
          });
        }
      });
    }
    
    if (club.management?.board) {
      club.management.board.forEach(boardMember => {
        const existingMember = members.find(m => 
          m.name.toLowerCase() === boardMember.name.toLowerCase()
        );
        
        if (!existingMember) {
          members.push({
            name: boardMember.name,
            role: boardMember.role || t('clubs.ClubHero.members.boardMember', { defaultValue: 'Член на борда' }),
            phone: boardMember.phone,
            email: boardMember.email,
            address: boardMember.address,
            avatar: boardMember.avatar,
            bio: boardMember.bio,
            isBoard: true
          });
        } else {
          existingMember.bio = boardMember.bio;
          existingMember.avatar = existingMember.avatar || boardMember.avatar;
        }
      });
    }
    
    if (members.length === 0 && stats.totalMembers > 0) {
      const sampleNames = [
        'Мария Иванова', 'Георги Петров', 'Елена Стоянова', 'Иван Димитров',
        'Анна Николова', 'Стоян Георгиев', 'Рада Христова', 'Петър Милев'
      ];
      
      for (let i = 0; i < Math.min(8, stats.totalMembers); i++) {
        members.push({
          name: sampleNames[i] || `${t('clubs.ClubHero.members.defaultRole', { defaultValue: 'Член' })} ${i + 1}`,
          role: i === 0 ? 'Председател' : t('clubs.ClubHero.members.defaultRole', { defaultValue: 'Член' }),
          isBoard: i < 3,
          memberSince: 2018 + Math.floor(Math.random() * 6)
        });
      }
    }
    
    return members.sort((a, b) => {
      if (a.isBoard && !b.isBoard) return -1;
      if (!a.isBoard && b.isBoard) return 1;
      if (a.role === 'председател') return -1;
      if (b.role === 'председател') return 1;
      return a.name.localeCompare(b.name);
    });
  };

  const members = getMembers();

  const filteredMembers = members.filter(member =>
    member.name?.toLowerCase().includes(memberSearchTerm.toLowerCase()) ||
    member.role?.toLowerCase().includes(memberSearchTerm.toLowerCase())
  );

  const handleCall = () => {
    const phone = club.contacts?.phone || club.contacts?.mobile;
    if (phone) {
      window.location.href = `tel:${phone}`;
    } else {
      alert(t('clubs.ClubHero.messages.phoneNotAvailable'));
    }
  };

  const handleEmail = () => {
    if (club.contacts?.email) {
      window.location.href = `mailto:${club.contacts.email}`;
    } else {
      alert(t('clubs.ClubHero.messages.emailNotAvailable'));
    }
  };

  const handleWebsite = () => {
    if (club.contacts?.website) {
      window.open(`https://${club.contacts.website}`, '_blank');
    } else {
      alert(t('clubs.ClubHero.messages.websiteNotAvailable'));
    }
  };

  const handleSocial = (platform) => {
    const socialUrl = club.contacts?.socialMedia?.[platform];
    if (socialUrl) {
      window.open(socialUrl.startsWith('http') ? socialUrl : `https://${socialUrl}`, '_blank');
    } else {
      alert(`${platform} ${t('clubs.ClubHero.messages.socialNotAvailable')}`);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: club.name,
        text: club.shortDescription || club.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert(t('clubs.ClubHero.messages.linkCopied'));
    }
  };

  const openMembersModal = () => {
    if (!club.preferences?.showMembersList) {
      return;
    }
    setShowMembersModal(true);
    setMemberSearchTerm('');
  };

  const closeMembersModal = () => {
    setShowMembersModal(false);
    setMemberSearchTerm('');
  };

  return (
    <section id="general-club-hero" className="general-hero-main">
      <div className="general-hero-container">
        
        <div className="general-hero-top-bar">
          <div className="general-hero-badges">
            <span className="general-status-badge active">
              <div className="general-status-dot"></div>
              {t('clubs.ClubHero.status.activeClub')}
            </span>
            <span className="general-category-badge">
              {getCategoryLabel(club.category)}
            </span>
          </div>
          
          <div className="general-hero-actions">
            <button className="general-action-btn" onClick={handleShare}>
              <FontAwesomeIcon icon={faShare} />
              {t('clubs.ClubHero.actions.share')}
            </button>
            <button className="general-action-btn favorite">
              <FontAwesomeIcon icon={faHeart} />
              {t('clubs.ClubHero.actions.like')}
            </button>
          </div>
        </div>

        <div className="general-hero-content">
          
          <div className="general-hero-main-info">
            <div className="general-hero-title-section">
              <div className="general-hero-title-row">
                <h1 className="general-club-name">{club.name}</h1>
                {club.logo && (
                  <div className="general-club-logo">
                    <img src={club.logo} alt={`${club.name} лого`} />
                  </div>
                )}
              </div>
              
              {club.metadata?.rating && (
                <div className="general-club-rating">
                  <div className="general-stars">
                    {renderStars(club.metadata.rating)}
                  </div>
                  <span className="general-rating-value">{club.metadata.rating}</span>
                  <span className="general-rating-count">
                    ({club.metadata.views || 0} {t('clubs.ClubHero.stats.views')})
                  </span>
                </div>
              )}
            </div>

            {(club.location?.address || club.location?.city) && (
              <div className="general-location-info">
                <FontAwesomeIcon icon={faMapMarkerAlt} />
                <span>
                  {club.location.address ? `${club.location.address}, ` : ''}
                  {club.location.city || 'София'}
                </span>
              </div>
            )}

            <p className="general-club-description">
              {club.shortDescription || club.description || t('clubs.ClubHero.messages.defaultDescription')}
            </p>

            {club.preferences?.showStatistics && (
              <div className="general-stats-grid">
                {club.preferences?.showMembersList && (
                  <div className="general-stat-card" onClick={openMembersModal}>
                    <div className="general-stat-icon">
                      <FontAwesomeIcon icon={faUsers} />
                    </div>
                    <div className="general-stat-content">
                      <div className="general-stat-value">{stats.totalMembers}</div>
                      <div className="general-hero-stat-label">{t('clubs.ClubHero.stats.members')}</div>
                    </div>
                    <div className="general-stat-action">
                      <FontAwesomeIcon icon={faEye} />
                    </div>
                  </div>
                )}
                
                <div className="general-stat-card">
                  <div className="general-stat-icon">
                    <FontAwesomeIcon icon={faCalendarAlt} />
                  </div>
                  <div className="general-stat-content">
                    <div className="general-stat-value">{stats.yearsActive}</div>
                    <div className="general-hero-stat-label">{t('clubs.ClubHero.stats.years')}</div>
                  </div>
                </div>
                
                <div className="general-stat-card">
                  <div className="general-stat-icon">
                    <FontAwesomeIcon icon={faPlay} />
                  </div>
                  <div className="general-stat-content">
                    <div className="general-stat-value">{stats.activitiesCount}</div>
                    <div className="general-hero-stat-label">{t('clubs.ClubHero.stats.activities')}</div>
                  </div>
                </div>

                <div className="general-stat-card">
                  <div className="general-stat-icon">
                    <FontAwesomeIcon icon={faStar} />
                  </div>
                  <div className="general-stat-content">
                    <div className="general-stat-value">{stats.eventsCount}</div>
                    <div className="general-hero-stat-label">{t('clubs.ClubHero.stats.events')}</div>
                  </div>
                </div>
              </div>
            )}

            <div className="general-hero-bottom-section">
              {club.preferences?.showContactForm && (
                <div className="general-quick-contacts">
                  <h3>{t('clubs.ClubHero.contact.title')}</h3>
                  <div className="general-contact-buttons">
                    {club.contacts?.phone && (
                      <button className="general-contact-btn phone" onClick={handleCall}>
                        <FontAwesomeIcon icon={faPhone} />
                        <span>{t('clubs.ClubHero.actions.call')}</span>
                      </button>
                    )}
                    
                    {club.contacts?.email && (
                      <button className="general-contact-btn email" onClick={handleEmail}>
                        <FontAwesomeIcon icon={faEnvelope} />
                        <span>{t('clubs.ClubHero.actions.email')}</span>
                      </button>
                    )}
                    
                    {club.contacts?.website && (
                      <button className="general-contact-btn website" onClick={handleWebsite}>
                        <FontAwesomeIcon icon={faGlobe} />
                        <span>{t('clubs.ClubHero.actions.website')}</span>
                      </button>
                    )}
                    
                    {club.contacts?.socialMedia?.facebook && (
                      <button className="general-contact-btn facebook" onClick={() => handleSocial('facebook')}>
                        <FontAwesomeIcon icon={faFacebook} />
                        <span>Facebook</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {club.preferences?.allowOnlineRegistration && club.membership && (
                <div className="general-membership-card">
                  <div className="general-membership-header">
                    <FontAwesomeIcon icon={faUserPlus} />
                    <h3>{t('clubs.ClubHero.membership.title')}</h3>
                  </div>
                  
                  {club.membership.membershipFee && club.preferences?.showFinances && (
                    <div className="general-membership-fee">
                      <span className="general-fee-amount">
                        {club.membership.membershipFee.monthly} {' лв.'}
                      </span>
                      <span className="general-fee-period">{t('clubs.ClubHero.membership.monthly')}</span>
                    </div>
                  )}
                  
                  {club.membership.benefits && (
                    <div className="general-membership-benefits">
                      {club.membership.benefits.slice(0, 3).map((benefit, index) => (
                        <div key={index} className="general-benefit-item">
                          ✓ {benefit}
                        </div>
                      ))}
                      {club.membership.benefits.length > 3 && (
                        <div className="general-more-benefits">
                          +{club.membership.benefits.length - 3} {t('clubs.ClubHero.membership.moreParticipants')}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {club.preferences?.publicGallery && (
            <div className="general-hero-gallery">
              {images.length > 0 ? (
                <div className="general-gallery-container">
                  <div className="general-main-image-container">
                    <img 
                      src={images[currentImageIndex]} 
                      alt={`${club.name} - снимка ${currentImageIndex + 1}`}
                      className="general-main-image"
                    />
                    
                    {images.length > 1 && (
                      <>
                        <button className="general-nav-btn prev" onClick={prevImage}>
                          <FontAwesomeIcon icon={faChevronLeft} />
                        </button>
                        <button className="general-nav-btn next" onClick={nextImage}>
                          <FontAwesomeIcon icon={faChevronRight} />
                        </button>
                      </>
                    )}
                    
                    <div className="general-image-counter">
                      {currentImageIndex + 1} / {images.length}
                    </div>
                  </div>
                  
                  {images.length > 1 && (
                    <div className="general-thumbnails">
                      {images.slice(0, 6).map((image, index) => (
                        <div 
                          key={index}
                          className={`general-thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                          onClick={() => setCurrentImageIndex(index)}
                        >
                          <img src={image} alt={`Thumbnail ${index + 1}`} />
                          {images.length > 6 && index === 5 && (
                            <div className="general-more-images">+{images.length - 6}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="general-gallery-placeholder">
                  <div className="general-placeholder-content">
                    {club.logo ? (
                      <img src={club.logo} alt={club.name} className="general-placeholder-logo" />
                    ) : (
                      <FontAwesomeIcon icon={faUsers} className="general-placeholder-icon" />
                    )}
                    <h3>{club.name}</h3>
                    <p>{t('clubs.ClubHero.gallery.placeholder')}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {club.preferences?.showMembersList && showMembersModal && (
        <div className="general-modal-overlay" onClick={closeMembersModal}>
          <div className="general-modal" onClick={(e) => e.stopPropagation()}>
            <div className="general-modal-header">
              <h3>
                <FontAwesomeIcon icon={faUsers} />
                {t('clubs.ClubHero.members.title')} {club.name}
              </h3>
              <button className="general-modal-close" onClick={closeMembersModal}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <div className="general-modal-content">
              {members.length > 5 && (
                <div className="general-search-box">
                  <FontAwesomeIcon icon={faSearch} />
                  <input
                    type="text"
                    placeholder={t('clubs.ClubHero.members.searchPlaceholder')}
                    value={memberSearchTerm}
                    onChange={(e) => setMemberSearchTerm(e.target.value)}
                  />
                </div>
              )}
              
              <div className="general-members-grid">
                {filteredMembers.map((member, index) => (
                  <div key={member.id || index} className="general-member-card">
                    <div className="general-member-avatar">
                      {member.avatar ? (
                        <img src={member.avatar} alt={member.name} />
                      ) : (
                        <FontAwesomeIcon icon={faUserCircle} />
                      )}
                      {member.isBoard && (
                        <div className="general-member-crown">
                          <FontAwesomeIcon icon={faCrown} />
                        </div>
                      )}
                    </div>
                    
                    <div className="general-member-info">
                      <h4>{member.name}</h4>
                      <p className="general-member-role">{member.role}</p>
                      
                      {member.bio && (
                        <p className="general-member-bio">{member.bio}</p>
                      )}
                      
                      <div className="general-member-details">
                        {member.memberSince && (
                          <span>
                            <FontAwesomeIcon icon={faIdCard} />
                            {t('clubs.ClubHero.members.memberSince')} {member.memberSince}
                          </span>
                        )}
                        {member.phone && club.preferences?.showContactForm && (
                          <span>
                            <FontAwesomeIcon icon={faPhone} />
                            <a href={`tel:${member.phone}`}>{member.phone}</a>
                          </span>
                        )}
                        {member.email && club.preferences?.showContactForm && (
                          <span>
                            <FontAwesomeIcon icon={faEnvelope} />
                            <a href={`mailto:${member.email}`}>{member.email.split('@')[0]}</a>
                          </span>
                        )}
                      </div>
                      
                      {member.address && (
                        <div className="general-member-address">
                          <FontAwesomeIcon icon={faMapMarkerAlt} />
                          <span>{member.address}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {filteredMembers.length === 0 && memberSearchTerm && (
                <div className="general-no-results">
                  <FontAwesomeIcon icon={faInfoCircle} />
                  <p>{t('clubs.ClubHero.members.noResults')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ClubHero;