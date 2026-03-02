import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
  faGraduationCap,
  faCheck,
  faExclamationTriangle,
  faPaperPlane,
  faCommentDots
} from '@fortawesome/free-solid-svg-icons';
import './clubManagement.css';
import { useClubContext } from '../../../../contexts/ClubContext';

export const ClubManagement = ({ club }) => {
  const { t } = useTranslation('clubs');
  const { sendPersonalEmail } = useClubContext();

  const [showAllMembers, setShowAllMembers] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showContactDetails, setShowContactDetails] = useState({});
  const [contactForm, setContactForm] = useState({
    from: '',
    to: '',
    subject: '',
    message: ''
  });
  const [formStatus, setFormStatus] = useState(null);

  // Keyboard handling за правилна работа на Ctrl+C
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Затваряме модала само при ESC и без modifier keys
      if (event.key === 'Escape' && !event.ctrlKey && !event.altKey && !event.shiftKey && !event.metaKey) {
        if (showMemberModal || showContactModal) {
          closeModals();
        }
      }
    };

    // Добавяме listener само когато има отворен модал
    if (showMemberModal || showContactModal) {
      document.addEventListener('keydown', handleKeyDown);
    }

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showMemberModal, showContactModal]);

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
    const normalizedRole = role.toLowerCase();
    const roleIcons = {
      'председател': faCrown,
      'president': faCrown,
      'präsident': faCrown,
      'заместник-председател': faUserTie,
      'vice-president': faUserTie,
      'vizepräsident': faUserTie,
      'секретар': faUsers,
      'secretary': faUsers,
      'sekretär': faUsers,
      'касиер': faUsers,
      'treasurer': faUsers,
      'schatzmeister': faUsers,
      'културен деец': faGraduationCap,
      'cultural coordinator': faGraduationCap,
      'kulturkoordinator': faGraduationCap,
      'спортен координатор': faAward,
      'sports coordinator': faAward,
      'sportkoordinator': faAward,
      'треньор': faHandshake,
      'trainer': faHandshake,
      'медицински консултант': faUserShield,
      'medical consultant': faUserShield,
      'medizinischer berater': faUserShield,
      'арт директор': faGraduationCap,
      'art director': faGraduationCap,
      'kunstdirektor': faGraduationCap,
      'режисьор': faGraduationCap,
      'director': faGraduationCap,
      'член': faUsers,
      'member': faUsers,
      'mitglied': faUsers
    };
    return roleIcons[normalizedRole] || faUsers;
  };

  const getRoleInfo = (role) => {
    const normalizedRole = role.toLowerCase();
    const baseRoleData = {
      'председател': { priority: 1, key: 'president' },
      'president': { priority: 1, key: 'president' },
      'präsident': { priority: 1, key: 'president' },
      'заместник-председател': { priority: 2, key: 'vicePresident' },
      'vice-president': { priority: 2, key: 'vicePresident' },
      'vizepräsident': { priority: 2, key: 'vicePresident' },
      'секретар': { priority: 3, key: 'secretary' },
      'secretary': { priority: 3, key: 'secretary' },
      'sekretär': { priority: 3, key: 'secretary' },
      'касиер': { priority: 4, key: 'treasurer' },
      'treasurer': { priority: 4, key: 'treasurer' },
      'schatzmeister': { priority: 4, key: 'treasurer' },
      'културен деец': { priority: 5, key: 'culturalCoordinator' },
      'cultural coordinator': { priority: 5, key: 'culturalCoordinator' },
      'kulturkoordinator': { priority: 5, key: 'culturalCoordinator' },
      'спортен координатор': { priority: 6, key: 'sportsCoordinator' },
      'sports coordinator': { priority: 6, key: 'sportsCoordinator' },
      'sportkoordinator': { priority: 6, key: 'sportsCoordinator' }
    };

    const roleData = baseRoleData[normalizedRole] || { priority: 10, key: 'member' };

    const colors = {
      president: { color: '#f59e0b', bgColor: '#fef3c7' },
      vicePresident: { color: '#3b82f6', bgColor: '#dbeafe' },
      secretary: { color: '#8b5cf6', bgColor: '#ede9fe' },
      treasurer: { color: '#ef4444', bgColor: '#fee2e2' },
      culturalCoordinator: { color: '#10b981', bgColor: '#d1fae5' },
      sportsCoordinator: { color: '#f97316', bgColor: '#fed7aa' },
      member: { color: '#6b7280', bgColor: '#f3f4f6' }
    };

    const colorInfo = colors[roleData.key] || colors.member;

    return {
      ...colorInfo,
      priority: roleData.priority,
      description: t(`clubs.ClubManagement.roles.${roleData.key}.description`)
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

  const openContactModal = (member) => {
    setSelectedMember(member);
    setShowContactModal(true);
    setFormStatus(null);
    setContactForm({
      from: '',
      to: member.email || '',
      subject: `Съобщение до ${member.name} - ${member.role}`,
      message: ''
    });
  };

  const closeModals = () => {
    setShowMemberModal(false);
    setShowContactModal(false);
    setSelectedMember(null);
    setFormStatus(null);
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
    const text = t('clubs.ClubManagement.shareText', {
      name: member.name,
      role: member.role,
      clubName: club.name
    });
    if (navigator.share) {
      navigator.share({
        title: member.name,
        text: text,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(text);
      alert(t('clubs.ClubManagement.messages.infoCopied'));
    }
  };

  // Обработка на форма за лично съобщение
  const handleFormChange = (field, value) => {
    setContactForm(prev => ({ ...prev, [field]: value }));
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();

    // Валидация
    if (!contactForm.from.trim() || !contactForm.to.trim() || !contactForm.subject.trim() || !contactForm.message.trim()) {
      alert('Моля, попълнете всички полета');
      return;
    }

    // Валидация на имейл адреси
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactForm.from)) {
      alert('Моля, въведете валиден имейл адрес в полето "От"');
      return;
    }
    if (!emailRegex.test(contactForm.to)) {
      alert('Моля, въведете валиден имейл адрес в полето "До"');
      return;
    }

    setFormStatus('sending');

    try {
      // Използваме personalEmail ендпойнта
      const success = await sendPersonalEmail({
        from: contactForm.from,
        to: contactForm.to,
        subject: contactForm.subject,
        message: contactForm.message
      });

      if (success) {
        setFormStatus('success');
        setTimeout(() => {
          closeModals();
        }, 2000);
      } else {
        setFormStatus('error');
      }
    } catch (error) {
      console.error('Error sending personal email:', error);
      setFormStatus('error');
    }

    if (formStatus === 'error') {
      setTimeout(() => setFormStatus(null), 3000);
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
            <span>{t('clubs.ClubManagement.header.badge')}</span>
          </div>
          <h2 className="general-management-title">{t('clubs.ClubManagement.header.title')}</h2>
          <p className="general-management-subtitle">
            {t('clubs.ClubManagement.header.subtitle')}
          </p>

          {/* Stats */}
          <div className="general-management-stats">
            <div className="general-management-stat">
              <span>{boardMembers.length}</span>
              <label>{t('clubs.ClubManagement.stats.boardMembers')}</label>
            </div>
            <div className="general-management-stat">
              <span>{new Set(boardMembers.map(m => getRoleInfo(m.role).priority <= 4 ? 'exec' : 'member')).size}</span>
              <label>{t('clubs.ClubManagement.stats.managementLevels')}</label>
            </div>
            <div className="general-management-stat">
              <span>{club.foundedYear ? new Date().getFullYear() - club.foundedYear : '—'}</span>
              <label>{t('clubs.ClubManagement.stats.yearsExperience')}</label>
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
                      title={t('clubs.ClubManagement.actions.share')}
                    >
                      <FontAwesomeIcon icon={faShare} />
                    </button>
                    <button
                      className="general-action-btn"
                      onClick={() => openMemberModal(member)}
                      title={t('clubs.ClubManagement.actions.moreInfo')}
                    >
                      <FontAwesomeIcon icon={faInfoCircle} />
                    </button>
                    {member.email && (
                      <button
                        className="general-action-btn"
                        onClick={() => openContactModal(member)}
                        title="Изпрати лично съобщение"
                      >
                        <FontAwesomeIcon icon={faCommentDots} />
                      </button>
                    )}
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
                      {showContactDetails[member.name]
                        ? t('clubs.ClubManagement.contact.hideContacts')
                        : t('clubs.ClubManagement.contact.showContacts')
                      }
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
                            title={t('clubs.ClubManagement.contact.call')}
                          >
                            <FontAwesomeIcon icon={faPhone} />
                          </button>
                        </div>
                      )}
                      {member.email && (
                        <div className="general-contact-item">
                          <FontAwesomeIcon icon={faEnvelope} />
                          <span
                            className="general-email-clickable"
                            onClick={() => openContactModal(member)}
                            title="Изпрати лично съобщение"
                          >
                            {formatEmail(member.email, true)}
                          </span>
                          <div className="general-contact-actions">
                            <button
                              className="general-contact-action"
                              onClick={() => handleEmail(member.email)}
                              title={t('clubs.ClubManagement.contact.sendEmail')}
                            >
                              <FontAwesomeIcon icon={faEnvelope} />
                            </button>
                            <button
                              className="general-contact-action"
                              onClick={() => openContactModal(member)}
                              title="Изпрати лично съобщение"
                            >
                              <FontAwesomeIcon icon={faCommentDots} />
                            </button>
                          </div>
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
                  ? t('clubs.ClubManagement.actions.showLess')
                  : t('clubs.ClubManagement.actions.showAll', { count: boardMembers.length - 4 })
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
            {t('clubs.ClubManagement.structure.title')}
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
            {t('clubs.ClubManagement.contactSection.title')}
          </h3>

          <div className="general-contact-methods">
            {club.contacts?.phone && (
              <div className="general-contact-method">
                <div className="general-contact-icon">
                  <FontAwesomeIcon icon={faPhone} />
                </div>
                <div className="general-contact-content">
                  <h4>{t('clubs.ClubManagement.contactSection.clubPhone')}</h4>
                  <p>{t('clubs.ClubManagement.contactSection.clubPhoneDesc')}</p>
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
                  <h4>{t('clubs.ClubManagement.contactSection.generalEmail')}</h4>
                  <p>{t('clubs.ClubManagement.contactSection.generalEmailDesc')}</p>
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
                  <h4>{t('clubs.ClubManagement.contactSection.clubAddress')}</h4>
                  <p>{t('clubs.ClubManagement.contactSection.clubAddressDesc')}</p>
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
        <div className="general-modal-overlay" onClick={closeModals}>
          <div className="general-modal" onClick={(e) => e.stopPropagation()}>
            <div className="general-modal-header">
              <h3>
                <FontAwesomeIcon icon={faIdCard} />
                {t('clubs.ClubManagement.modal.title')}
              </h3>
              <button className="general-modal-close" onClick={closeModals}>
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
                      <h5>{t('clubs.ClubManagement.modal.biography')}</h5>
                      <p>{selectedMember.bio}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="general-profile-details">
                <h5>{t('clubs.ClubManagement.modal.contactInfo')}</h5>
                <div className="general-profile-contacts">
                  {selectedMember.phone && (
                    <div className="general-profile-contact">
                      <FontAwesomeIcon icon={faPhone} />
                      <span>{selectedMember.phone}</span>
                      <button
                        className="general-profile-action"
                        onClick={() => handleCall(selectedMember.phone)}
                      >
                        {t('clubs.ClubManagement.contact.call')}
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
                        {t('clubs.ClubManagement.contact.sendEmail')}
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
                <h5>{t('clubs.ClubManagement.modal.aboutRole')}</h5>
                <p>{getRoleInfo(selectedMember.role).description}</p>
              </div>

              <div className="general-profile-actions">
                <button
                  className="general-profile-btn share"
                  onClick={() => handleShare(selectedMember)}
                >
                  <FontAwesomeIcon icon={faShare} />
                  {t('clubs.ClubManagement.actions.share')}
                </button>
                {selectedMember.phone && (
                  <button
                    className="general-profile-btn call"
                    onClick={() => handleCall(selectedMember.phone)}
                  >
                    <FontAwesomeIcon icon={faPhone} />
                    {t('clubs.ClubManagement.contact.call')}
                  </button>
                )}
                {selectedMember.email && (
                  <button
                    className="general-profile-btn email"
                    onClick={() => handleEmail(selectedMember.email)}
                  >
                    <FontAwesomeIcon icon={faEnvelope} />
                    {t('clubs.ClubManagement.contact.sendEmail')}
                  </button>
                )}
                {selectedMember.email && (
                  <button
                    className="general-profile-btn contact"
                    onClick={() => openContactModal(selectedMember)}
                  >
                    <FontAwesomeIcon icon={faCommentDots} />
                    Изпрати лично съобщение
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Personal Contact Modal */}
      {showContactModal && selectedMember && (
        <div className="general-modal-overlay" onClick={closeModals}>
          <div className="general-modal" onClick={(e) => e.stopPropagation()}>
            <div className="general-modal-header">
              <h3>
                <FontAwesomeIcon icon={faPaperPlane} />
                Лично съобщение до {selectedMember.name}
              </h3>
              <button className="general-modal-close" onClick={closeModals}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className="general-modal-content">
              <div className="general-contact-recipient">
                <div className="general-recipient-info">
                  <div className="general-recipient-avatar">
                    {selectedMember.avatar ? (
                      <img src={selectedMember.avatar} alt={selectedMember.name} />
                    ) : (
                      <div className="general-recipient-placeholder">
                        <FontAwesomeIcon icon={faUsers} />
                      </div>
                    )}
                  </div>
                  <div className="general-recipient-details">
                    <h4>{selectedMember.name}</h4>
                    <p>{selectedMember.role}</p>
                    <span>{selectedMember.email}</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleContactSubmit} className="general-contact-form">
                <div className="general-form-row">
                  <div className="general-form-group">
                    <label>От (вашия имейл) *</label>
                    <input
                      type="email"
                      value={contactForm.from}
                      onChange={(e) => handleFormChange('from', e.target.value)}
                      placeholder="вашия@email.com"
                      required
                    />
                  </div>

                  <div className="general-form-group">
                    <label>До *</label>
                    <input
                      type="email"
                      value={contactForm.to}
                      onChange={(e) => handleFormChange('to', e.target.value)}
                      placeholder="получател@email.com"
                      required
                      readOnly
                    />
                  </div>
                </div>

                <div className="general-form-group">
                  <label>Тема *</label>
                  <input
                    type="text"
                    value={contactForm.subject}
                    onChange={(e) => handleFormChange('subject', e.target.value)}
                    placeholder="Тема на съобщението"
                    required
                  />
                </div>

                <div className="general-form-group">
                  <label>Съобщение *</label>
                  <textarea
                    value={contactForm.message}
                    onChange={(e) => handleFormChange('message', e.target.value)}
                    placeholder="Напишете вашето съобщение тук..."
                    rows="6"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="general-submit-btn"
                  disabled={formStatus === 'sending'}
                >
                  {formStatus === 'sending' ? (
                    <>
                      <div className="general-spinner"></div>
                      Изпращане...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faPaperPlane} />
                      Изпрати съобщение
                    </>
                  )}
                </button>

                {formStatus === 'success' && (
                  <div className="general-success-message">
                    <FontAwesomeIcon icon={faCheck} />
                    Съобщението е изпратено успешно!
                  </div>
                )}

                {formStatus === 'error' && (
                  <div className="general-error-message">
                    <FontAwesomeIcon icon={faExclamationTriangle} />
                    Възникна грешка при изпращането!
                  </div>
                )}
              </form>

              <div className="general-contact-note">
                <p><FontAwesomeIcon icon={faInfoCircle} /> Съобщението ще бъде изпратено директно на имейла на избрания член от управлението.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ClubManagement;