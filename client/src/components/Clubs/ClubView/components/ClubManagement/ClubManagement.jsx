import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, 
  faPhone,
  faEnvelope,
  faMapMarkerAlt,
  faUserTie,
  faCrown,
  faChevronDown,
  faChevronUp,
  faEye,
  faEyeSlash,
  faTimes,
  faInfoCircle,
  faCalendarAlt,
  faIdCard,
  faBuilding,
  faShare,
  faDownload,
  faPrint,
  faUserShield,
  faHandshake,
  faAward,
  faGraduationCap
} from '@fortawesome/free-solid-svg-icons';
import './clubManagement.css';

export const ClubManagement = ({ club }) => {
  const [showAllMembers, setShowAllMembers] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showContactDetails, setShowContactDetails] = useState({});

  // ПРОВЕРКА ЗА ДАННИ - ако няма ръководство, не показваме компонента
  if (!club?.management?.board || club.management.board.length === 0) {
    return null;
  }

  const boardMembers = club.management.board.filter(member => 
    member && member.name && member.role
  );

  if (boardMembers.length === 0) {
    return null;
  }

  const getRoleIcon = (role) => {
    const roleIcons = {
      'председател': faCrown,
      'заместник-председател': faUserTie,
      'секретар': faUsers,
      'касиер': faUsers,
      'културен деец': faGraduationCap,
      'спортен координатор': faAward,
      'треньор': faHandshake,
      'медицински консултант': faUserShield,
      'арт директор': faGraduationCap,
      'режисьор': faGraduationCap,
      'член': faUsers
    };
    return roleIcons[role.toLowerCase()] || faUsers;
  };

  const getRoleInfo = (role) => {
    const roleData = {
      'председател': { 
        color: '#f59e0b', 
        bgColor: '#fef3c7', 
        priority: 1,
        description: 'Ръководи дейността на клуба и представлява клуба пред трети лица'
      },
      'заместник-председател': { 
        color: '#3b82f6', 
        bgColor: '#dbeafe', 
        priority: 2,
        description: 'Помага на председателя и го замества при необходимост'
      },
      'секретар': { 
        color: '#8b5cf6', 
        bgColor: '#ede9fe', 
        priority: 3,
        description: 'Води протоколите и документацията на клуба'
      },
      'касиер': { 
        color: '#ef4444', 
        bgColor: '#fee2e2', 
        priority: 4,
        description: 'Отговаря за финансовата дейност и бюджета'
      },
      'културен деец': { 
        color: '#10b981', 
        bgColor: '#d1fae5', 
        priority: 5,
        description: 'Организира културни дейности и събития'
      },
      'спортен координатор': { 
        color: '#f97316', 
        bgColor: '#fed7aa', 
        priority: 6,
        description: 'Координира спортните дейности и активности'
      }
    };
    
    return roleData[role.toLowerCase()] || { 
      color: '#6b7280', 
      bgColor: '#f3f4f6', 
      priority: 10,
      description: 'Член на управителния съвет'
    };
  };

  const visibleMembers = showAllMembers ? boardMembers : boardMembers.slice(0, 4);

  const toggleContactDetails = (memberName) => {
    setShowContactDetails(prev => ({
      ...prev,
      [memberName]: !prev[memberName]
    }));
  };

  const openMemberModal = (member) => {
    setSelectedMember(member);
    setShowMemberModal(true);
  };

  const closeMemberModal = () => {
    setShowMemberModal(false);
    setSelectedMember(null);
  };

  const formatPhone = (phone, reveal = false) => {
    if (!phone) return '';
    if (reveal || phone.length < 8) return phone;
    return phone.slice(0, 4) + '***' + phone.slice(-3);
  };

  const formatEmail = (email, reveal = false) => {
    if (!email) return '';
    if (reveal) return email;
    const [name, domain] = email.split('@');
    if (!domain) return email;
    const maskedName = name.slice(0, 2) + '***' + name.slice(-1);
    return `${maskedName}@${domain}`;
  };

  const handleCall = (phone) => {
    if (phone) {
      window.location.href = `tel:${phone}`;
    }
  };

  const handleEmail = (email) => {
    if (email) {
      window.location.href = `mailto:${email}`;
    }
  };

  const handleShare = (member) => {
    const text = `${member.name} - ${member.role} в ${club.name}`;
    if (navigator.share) {
      navigator.share({
        title: `${member.name}`,
        text: text,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(text);
      alert('Информацията е копирана в клипборда!');
    }
  };

  const sortedMembers = [...boardMembers].sort((a, b) => {
    const priorityA = getRoleInfo(a.role).priority;
    const priorityB = getRoleInfo(b.role).priority;
    return priorityA - priorityB;
  });

  return (
    <section id="general-management" className="general-management-main">
      <div className="general-management-container">
        
        {/* Header */}
        <div className="general-management-header">
          <div className="general-management-badge">
            <FontAwesomeIcon icon={faUserShield} />
            <span>Ръководство на клуба</span>
          </div>
          <h2 className="general-management-title">Нашето ръководство</h2>
          <p className="general-management-subtitle">
            Запознайте се с хората, които водят клуба и организират дейностите
          </p>
          
          {/* Stats */}
          <div className="general-management-stats">
            <div className="general-management-stat">
              <span>{boardMembers.length}</span>
              <label>членове в борда</label>
            </div>
            <div className="general-management-stat">
              <span>{new Set(boardMembers.map(m => getRoleInfo(m.role).priority <= 4 ? 'exec' : 'member')).size}</span>
              <label>нива управление</label>
            </div>
            <div className="general-management-stat">
              <span>{club.foundedYear ? new Date().getFullYear() - club.foundedYear : '—'}</span>
              <label>години опит</label>
            </div>
          </div>
        </div>

        {/* Management Grid */}
        <div className="general-management-grid">
          {visibleMembers.map((member, index) => {
            const roleInfo = getRoleInfo(member.role);
            
            return (
              <div 
                key={member.name || index} 
                className="general-member-card"
                style={{ '--role-color': roleInfo.color, '--role-bg': roleInfo.bgColor }}
              >
                <div className="general-member-header">
                  <div className="general-member-avatar">
                    {member.avatar ? (
                      <img src={member.avatar} alt={member.name} />
                    ) : (
                      <div className="general-avatar-placeholder">
                        <FontAwesomeIcon icon={faUsers} />
                      </div>
                    )}
                    <div className="general-role-badge">
                      <FontAwesomeIcon icon={getRoleIcon(member.role)} />
                    </div>
                  </div>
                  
                  <div className="general-member-info">
                    <h3 className="general-member-name">{member.name}</h3>
                    <p className="general-member-role">{member.role}</p>
                    {member.bio && (
                      <p className="general-member-bio-preview">
                        {member.bio.length > 100 ? `${member.bio.substring(0, 100)}...` : member.bio}
                      </p>
                    )}
                  </div>

                  <div className="general-member-actions">
                    <button 
                      className="general-action-btn"
                      onClick={() => handleShare(member)}
                      title="Споделяне"
                    >
                      <FontAwesomeIcon icon={faShare} />
                    </button>
                    <button 
                      className="general-action-btn"
                      onClick={() => openMemberModal(member)}
                      title="Повече информация"
                    >
                      <FontAwesomeIcon icon={faInfoCircle} />
                    </button>
                  </div>
                </div>

                <div className="general-member-contact">
                  <button 
                    className="general-contact-toggle"
                    onClick={() => toggleContactDetails(member.name)}
                  >
                    <FontAwesomeIcon 
                      icon={showContactDetails[member.name] ? faEyeSlash : faEye} 
                    />
                    <span>
                      {showContactDetails[member.name] ? 'Скрий контакти' : 'Покажи контакти'}
                    </span>
                  </button>

                  {showContactDetails[member.name] && (
                    <div className="general-contact-details">
                      {member.phone && (
                        <div className="general-contact-item">
                          <FontAwesomeIcon icon={faPhone} />
                          <span>{formatPhone(member.phone, true)}</span>
                          <button 
                            className="general-contact-action"
                            onClick={() => handleCall(member.phone)}
                            title="Обади се"
                          >
                            <FontAwesomeIcon icon={faPhone} />
                          </button>
                        </div>
                      )}
                      
                      {member.email && (
                        <div className="general-contact-item">
                          <FontAwesomeIcon icon={faEnvelope} />
                          <span>{formatEmail(member.email, true)}</span>
                          <button 
                            className="general-contact-action"
                            onClick={() => handleEmail(member.email)}
                            title="Изпрати имейл"
                          >
                            <FontAwesomeIcon icon={faEnvelope} />
                          </button>
                        </div>
                      )}
                      
                      {member.address && (
                        <div className="general-contact-item">
                          <FontAwesomeIcon icon={faMapMarkerAlt} />
                          <span>{member.address}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Show More Button */}
        {boardMembers.length > 4 && (
          <div className="general-show-more-section">
            <button 
              className="general-show-more-btn"
              onClick={() => setShowAllMembers(!showAllMembers)}
            >
              <span>
                {showAllMembers 
                  ? 'Покажи по-малко' 
                  : `Покажи всички (${boardMembers.length - 4} още)`
                }
              </span>
              <FontAwesomeIcon 
                icon={showAllMembers ? faChevronUp : faChevronDown} 
              />
            </button>
          </div>
        )}

        {/* Management Structure */}
        <div className="general-management-structure">
          <h3>
            <FontAwesomeIcon icon={faBuilding} />
            Структура на управлението
          </h3>
          <div className="general-structure-chart">
            {sortedMembers.map((member, index) => {
              const roleInfo = getRoleInfo(member.role);
              return (
                <div 
                  key={member.name || index}
                  className="general-structure-item"
                  style={{ '--role-color': roleInfo.color, '--role-bg': roleInfo.bgColor }}
                >
                  <div className="general-structure-icon">
                    <FontAwesomeIcon icon={getRoleIcon(member.role)} />
                  </div>
                  <div className="general-structure-info">
                    <h4>{member.role}</h4>
                    <p>{member.name}</p>
                    <span>{roleInfo.description}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Contact Section */}
        <div className="general-contact-section">
          <h3>
            <FontAwesomeIcon icon={faHandshake} />
            Как да се свържете с ръководството
          </h3>
          
          <div className="general-contact-methods">
            {club.contacts?.phone && (
              <div className="general-contact-method">
                <div className="general-contact-icon">
                  <FontAwesomeIcon icon={faPhone} />
                </div>
                <div className="general-contact-content">
                  <h4>Телефон на клуба</h4>
                  <p>Основният телефон за връзка с клуба</p>
                  <a href={`tel:${club.contacts.phone}`}>{club.contacts.phone}</a>
                </div>
              </div>
            )}
            
            {club.contacts?.email && (
              <div className="general-contact-method">
                <div className="general-contact-icon">
                  <FontAwesomeIcon icon={faEnvelope} />
                </div>
                <div className="general-contact-content">
                  <h4>Общ имейл</h4>
                  <p>За общи въпроси и информация</p>
                  <a href={`mailto:${club.contacts.email}`}>{club.contacts.email}</a>
                </div>
              </div>
            )}
            
            {club.location && (
              <div className="general-contact-method">
                <div className="general-contact-icon">
                  <FontAwesomeIcon icon={faMapMarkerAlt} />
                </div>
                <div className="general-contact-content">
                  <h4>Адрес на клуба</h4>
                  <p>Където можете да ни намерите</p>
                  <span>
                    {club.location.address}
                    {club.location.city && `, ${club.location.city}`}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Member Details Modal */}
      {showMemberModal && selectedMember && (
        <div className="general-modal-overlay" onClick={closeMemberModal}>
          <div className="general-modal" onClick={(e) => e.stopPropagation()}>
            <div className="general-modal-header">
              <h3>
                <FontAwesomeIcon icon={faIdCard} />
                Информация за член
              </h3>
              <button className="general-modal-close" onClick={closeMemberModal}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <div className="general-modal-content">
              <div className="general-member-profile">
                <div className="general-profile-avatar">
                  {selectedMember.avatar ? (
                    <img src={selectedMember.avatar} alt={selectedMember.name} />
                  ) : (
                    <div className="general-profile-placeholder">
                      <FontAwesomeIcon icon={faUsers} />
                    </div>
                  )}
                  <div className="general-profile-badge">
                    <FontAwesomeIcon icon={getRoleIcon(selectedMember.role)} />
                  </div>
                </div>
                
                <div className="general-profile-info">
                  <h4>{selectedMember.name}</h4>
                  <p className="general-profile-role">{selectedMember.role}</p>
                  
                  {selectedMember.bio && (
                    <div className="general-profile-bio">
                      <h5>Биография</h5>
                      <p>{selectedMember.bio}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="general-profile-details">
                <h5>Контактна информация</h5>
                <div className="general-profile-contacts">
                  {selectedMember.phone && (
                    <div className="general-profile-contact">
                      <FontAwesomeIcon icon={faPhone} />
                      <span>{selectedMember.phone}</span>
                      <button 
                        className="general-profile-action"
                        onClick={() => handleCall(selectedMember.phone)}
                      >
                        Обади се
                      </button>
                    </div>
                  )}
                  
                  {selectedMember.email && (
                    <div className="general-profile-contact">
                      <FontAwesomeIcon icon={faEnvelope} />
                      <span>{selectedMember.email}</span>
                      <button 
                        className="general-profile-action"
                        onClick={() => handleEmail(selectedMember.email)}
                      >
                        Изпрати имейл
                      </button>
                    </div>
                  )}
                  
                  {selectedMember.address && (
                    <div className="general-profile-contact">
                      <FontAwesomeIcon icon={faMapMarkerAlt} />
                      <span>{selectedMember.address}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="general-profile-role-info">
                <h5>За ролята</h5>
                <p>{getRoleInfo(selectedMember.role).description}</p>
              </div>

              <div className="general-profile-actions">
                <button 
                  className="general-profile-btn share"
                  onClick={() => handleShare(selectedMember)}
                >
                  <FontAwesomeIcon icon={faShare} />
                  Споделяне
                </button>
                {selectedMember.phone && (
                  <button 
                    className="general-profile-btn call"
                    onClick={() => handleCall(selectedMember.phone)}
                  >
                    <FontAwesomeIcon icon={faPhone} />
                    Обади се
                  </button>
                )}
                {selectedMember.email && (
                  <button 
                    className="general-profile-btn email"
                    onClick={() => handleEmail(selectedMember.email)}
                  >
                    <FontAwesomeIcon icon={faEnvelope} />
                    Изпрати имейл
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ClubManagement;