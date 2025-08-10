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
  faEyeSlash
} from '@fortawesome/free-solid-svg-icons';
import './clubManagement.css';

export const ClubManagement = ({ club }) => {
  const [showAllMembers, setShowAllMembers] = useState(false);
  const [showContactDetails, setShowContactDetails] = useState({});

  const getRoleIcon = (role) => {
    const roleIcons = {
      'председател': faCrown,
      'заместник-председател': faUserTie,
      'секретар': faUsers,
      'касиер': faUsers,
      'културен деец': faUsers,
      'спортен координатор': faUsers,
      'треньор': faUsers,
      'медицински консултант': faUsers,
      'арт директор': faUsers,
      'режисьор': faUsers,
      'член': faUsers
    };
    return roleIcons[role.toLowerCase()] || faUsers;
  };

  const getRoleColor = (role) => {
    const roleColors = {
      'председател': 'chairman',
      'заместник-председател': 'vice-chairman',
      'секретар': 'secretary',
      'касиер': 'treasurer',
      'културен деец': 'cultural',
      'спортен координатор': 'sports',
      'треньор': 'trainer',
      'медицински консултант': 'medical',
      'арт директор': 'art',
      'режисьор': 'director',
      'член': 'member'
    };
    return roleColors[role.toLowerCase()] || 'member';
  };

  const toggleContactDetails = (memberName) => {
    setShowContactDetails(prev => ({
      ...prev,
      [memberName]: !prev[memberName]
    }));
  };

  const formatPhone = (phone) => {
    // Скрива част от телефонния номер за privacy
    if (phone.length >= 10) {
      return phone.slice(0, 4) + '***' + phone.slice(-3);
    }
    return phone;
  };

  const formatEmail = (email) => {
    // Скрива част от имейла за privacy
    const [name, domain] = email.split('@');
    const maskedName = name.slice(0, 2) + '***' + name.slice(-1);
    return `${maskedName}@${domain}`;
  };

  const visibleMembers = showAllMembers 
    ? club.management.board 
    : club.management.board.slice(0, 4);

  if (!club.management.board || club.management.board.length === 0) {
    return (
      <section id="club-management" className="club-management">
        <div className="management-container">
          <h2>Ръководство на клуба</h2>
          <div className="no-management">
            <FontAwesomeIcon icon={faUsers} className="no-management-icon" />
            <p>Информацията за ръководството не е налична</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="club-management" className="club-management">
      <div className="management-container">
        <div className="management-header">
          <h2>Ръководство на клуба</h2>
          <p className="management-subtitle">
            Запознайте се с хората, които водят клуба и организират дейностите
          </p>
        </div>

        <div className="management-grid">
          {visibleMembers.map((member, index) => (
            <div key={index} className={`member-card ${getRoleColor(member.role)}`}>
              <div className="member-header">
                <div className="member-avatar">
                  {member.avatar ? (
                    <img src={member.avatar} alt={member.name} />
                  ) : (
                    <div className="avatar-placeholder">
                      <FontAwesomeIcon icon={faUsers} />
                    </div>
                  )}
                  <div className="role-badge">
                    <FontAwesomeIcon icon={getRoleIcon(member.role)} />
                  </div>
                </div>
                
                <div className="member-info">
                  <h3 className="member-name">{member.name}</h3>
                  <p className="member-role">{member.role}</p>
                </div>
              </div>

              {member.bio && (
                <div className="member-bio">
                  <p>{member.bio}</p>
                </div>
              )}

              <div className="member-contact">
                <button 
                  className="contact-toggle-btn"
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
                  <div className="contact-details">
                    {member.phone && (
                      <div className="contact-item">
                        <FontAwesomeIcon icon={faPhone} />
                        <a href={`tel:${member.phone}`}>
                          {formatPhone(member.phone)}
                        </a>
                      </div>
                    )}
                    
                    {member.email && (
                      <div className="contact-item">
                        <FontAwesomeIcon icon={faEnvelope} />
                        <a href={`mailto:${member.email}`}>
                          {formatEmail(member.email)}
                        </a>
                      </div>
                    )}
                    
                    {member.address && (
                      <div className="contact-item">
                        <FontAwesomeIcon icon={faMapMarkerAlt} />
                        <span>{member.address}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {club.management.board.length > 4 && (
          <div className="show-more-section">
            <button 
              className="show-more-btn"
              onClick={() => setShowAllMembers(!showAllMembers)}
            >
              <span>
                {showAllMembers 
                  ? 'Покажи по-малко' 
                  : `Покажи всички (${club.management.board.length - 4} още)`
                }
              </span>
              <FontAwesomeIcon 
                icon={showAllMembers ? faChevronUp : faChevronDown} 
              />
            </button>
          </div>
        )}

        {/* Структура на управлението */}
        <div className="management-structure">
          <h3>Структура на управлението</h3>
          <div className="structure-chart">
            {/* Председател */}
            {club.management.board.find(m => m.role.includes('председател') && !m.role.includes('заместник')) && (
              <div className="structure-level chairman-level">
                <div className="structure-role">
                  <FontAwesomeIcon icon={faCrown} />
                  <span>Председател</span>
                </div>
              </div>
            )}

            {/* Заместник-председател */}
            {club.management.board.find(m => m.role.includes('заместник-председател')) && (
              <div className="structure-level vice-chairman-level">
                <div className="structure-role">
                  <FontAwesomeIcon icon={faUserTie} />
                  <span>Заместник-председател</span>
                </div>
              </div>
            )}

            {/* Секретар и касиер */}
            <div className="structure-level admin-level">
              {club.management.board.find(m => m.role.includes('секретар')) && (
                <div className="structure-role">
                  <FontAwesomeIcon icon={faUsers} />
                  <span>Секретар</span>
                </div>
              )}
              {club.management.board.find(m => m.role.includes('касиер')) && (
                <div className="structure-role">
                  <FontAwesomeIcon icon={faUsers} />
                  <span>Касиер</span>
                </div>
              )}
            </div>

            {/* Други роли */}
            <div className="structure-level members-level">
              {club.management.board
                .filter(m => !['председател', 'заместник-председател', 'секретар', 'касиер'].some(role => m.role.includes(role)))
                .map((member, index) => (
                  <div key={index} className="structure-role">
                    <FontAwesomeIcon icon={getRoleIcon(member.role)} />
                    <span>{member.role}</span>
                  </div>
                ))
              }
            </div>
          </div>
        </div>

        {/* Контакт с ръководството */}
        <div className="management-contact-section">
          <h3>Как да се свържете с ръководството</h3>
          <div className="contact-methods">
            <div className="contact-method">
              <FontAwesomeIcon icon={faPhone} />
              <div>
                <strong>Телефон на клуба</strong>
                <p>Основният телефон за връзка с клуба</p>
                <a href={`tel:${club.contacts.phone}`}>{club.contacts.phone}</a>
              </div>
            </div>
            
            <div className="contact-method">
              <FontAwesomeIcon icon={faEnvelope} />
              <div>
                <strong>Общ имейл</strong>
                <p>За общи въпроси и информация</p>
                <a href={`mailto:${club.contacts.email}`}>{club.contacts.email}</a>
              </div>
            </div>
            
            <div className="contact-method">
              <FontAwesomeIcon icon={faMapMarkerAlt} />
              <div>
                <strong>Адрес на клуба</strong>
                <p>Където можете да ни намерите</p>
                <span>{club.location.address}, {club.location.city}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClubManagement;