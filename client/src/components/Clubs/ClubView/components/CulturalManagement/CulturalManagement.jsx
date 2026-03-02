import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers,
  faUser,
  faPhone,
  faEnvelope,
  faMapMarkerAlt,
  faClock,
  faCalendarAlt,
  faUserTie,
  faGavel,
  faClipboardList,
  faCalculator,
  faHandshake,
  faPaperPlane,
  faBuilding,
  faComments,
  faStar,
  faAward,
  faGraduationCap,
  faHeart,
  faUserCircle,
  faPhoneAlt,
  faMobile,
  faFax,
  faGlobe,
  faTimes,
  faCheck,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import './culturalManagement.css';

export const CulturalManagement = ({ club }) => {
  const { t, i18n } = useTranslation('clubs');
  const [selectedMember, setSelectedMember] = useState(null);
  const [formStatus, setFormStatus] = useState(null);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const getRoleIcons = () => ({
    'chairman': faGavel,
    'president': faGavel,
    'председател': faGavel,
    'secretary': faClipboardList,
    'секретар': faClipboardList,
    'treasurer': faCalculator,
    'касиер': faCalculator,
    'vice-chairman': faUserTie,
    'заместник-председател': faUserTie,
    'cultural-officer': faStar,
    'културен деец': faStar,
    'member': faUser,
    'член': faUser
  });

  const translateRole = (role) => {
    const roleTranslations = {
      'председател': t('clubs.CulturalManagement.roles.chairman'),
      'секретар': t('clubs.CulturalManagement.roles.secretary'),
      'касиер': t('clubs.CulturalManagement.roles.treasurer'),
      'заместник-председател': t('clubs.CulturalManagement.roles.viceChairman'),
      'културен деец': t('clubs.CulturalManagement.roles.culturalOfficer'),
      'член': t('clubs.CulturalManagement.roles.member')
    };
    return roleTranslations[role] || role;
  };

  const translateSpecialty = (specialty) => {
    const specialtyTranslations = {
      'Организация': t('clubs.CulturalManagement.specialties.organization'),
      'Културни събития': t('clubs.CulturalManagement.specialties.culturalEvents'),
      'Образование': t('clubs.CulturalManagement.specialties.education'),
      'Документооборот': t('clubs.CulturalManagement.specialties.documentation'),
      'Администрация': t('clubs.CulturalManagement.specialties.administration'),
      'Комуникации': t('clubs.CulturalManagement.specialties.communications'),
      'Финанси': t('clubs.CulturalManagement.specialties.finance'),
      'Бюджет': t('clubs.CulturalManagement.specialties.budget'),
      'Счетоводство': t('clubs.CulturalManagement.specialties.accounting')
    };
    return specialtyTranslations[specialty] || specialty;
  };

  // Default board members if not provided
  const defaultBoardMembers = [
    {
      name: "Анка Димитрова",
      role: "председател",
      phone: "0888567123",
      email: "anka.dimitrova@zlatnaesenta.bg",
      address: t('clubs.CulturalManagement.defaultAddresses.address1'),
      avatar: "https://picsum.photos/150/150?random=101",
      bio: t('clubs.CulturalManagement.defaultBios.chairman'),
      experience: t('clubs.CulturalManagement.experience.threeYears'),
      specialties: ["Организация", "Културни събития", "Образование"]
    },
    {
      name: "Васил Георгиев",
      role: "секретар",
      phone: "0877234567",
      email: "secretary@zlatnaesenta.bg",
      address: t('clubs.CulturalManagement.defaultAddresses.address2'),
      avatar: "https://picsum.photos/150/150?random=102",
      bio: t('clubs.CulturalManagement.defaultBios.secretary'),
      experience: t('clubs.CulturalManagement.experience.fourYears'),
      specialties: ["Документооборот", "Администрация", "Комуникации"]
    },
    {
      name: "Мария Петкова",
      role: "касиер",
      phone: "0899345678",
      email: "treasurer@zlatnaesenta.bg",
      address: t('clubs.CulturalManagement.defaultAddresses.address3'),
      avatar: "https://picsum.photos/150/150?random=103",
      bio: t('clubs.CulturalManagement.defaultBios.treasurer'),
      experience: t('clubs.CulturalManagement.experience.fiveYears'),
      specialties: ["Финанси", "Бюджет", "Счетоводство"]
    }
  ];

  const boardMembers = club.management?.board || defaultBoardMembers;

  const getDefaultWorkingHours = () => ({
    monday: "09:00-17:00",
    tuesday: "09:00-17:00",
    wednesday: "09:00-17:00",
    thursday: "09:00-17:00",
    friday: "09:00-17:00",
    saturday: "10:00-15:00",
    sunday: t('clubs.CulturalManagement.workingHours.closed')
  });

  const officeInfo = {
    address: club.location?.address || t('clubs.CulturalManagement.defaultOffice.address'),
    city: club.location?.city || t('clubs.CulturalManagement.defaultOffice.city'),
    postalCode: club.location?.postalCode || "1463",
    phone: club.contacts?.phone || "02/856-4321",
    mobile: club.contacts?.mobile || "0888567123",
    email: club.contacts?.email || "info@zlatnaesenta.bg",
    website: club.contacts?.website || "www.zlatnaesenta-sofia.bg",
    workingHours: club.contacts?.workingHours || getDefaultWorkingHours()
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setFormStatus('sending');

    if (officeInfo.email) {
      const subjectTranslation = getSubjectTranslation(contactForm.subject);
      const subject = encodeURIComponent(t('clubs.CulturalManagement.modals.contact.emailSubject', { 
        clubName: club.name || t('clubs.CulturalManagement.defaultClubName'),
        subject: subjectTranslation 
      }));
      
      const body = encodeURIComponent(t('clubs.CulturalManagement.modals.contact.emailBody', {
        clubName: club.name || t('clubs.CulturalManagement.defaultClubName'),
        name: contactForm.name,
        email: contactForm.email,
        phone: contactForm.phone || t('clubs.CulturalManagement.form.notSpecified'),
        subject: subjectTranslation,
        message: contactForm.message,
        senderEmail: contactForm.email
      }));
      
      try {
        window.location.href = `mailto:${officeInfo.email}?subject=${subject}&body=${body}`;
        setFormStatus('sent');
        setTimeout(() => {
          setFormStatus(null);
          setContactForm({ name: '', email: '', phone: '', subject: '', message: '' });
        }, 3000);
      } catch (error) {
        setFormStatus('error');
      }
    } else {
      setFormStatus('error');
    }
  };

  const getSubjectTranslation = (subjectKey) => {
    const subjects = {
      'membership': t('clubs.CulturalManagement.form.subjects.membership'),
      'activities': t('clubs.CulturalManagement.form.subjects.activities'),
      'events': t('clubs.CulturalManagement.form.subjects.events'),
      'volunteering': t('clubs.CulturalManagement.form.subjects.volunteering'),
      'other': t('clubs.CulturalManagement.form.subjects.other')
    };
    return subjects[subjectKey] || subjectKey;
  };

  const handleInputChange = (field, value) => {
    setContactForm(prev => ({ ...prev, [field]: value }));
  };

  const formatWorkingHours = (hours) => {
    const dayNames = {
      monday: t('clubs.CulturalManagement.workingHours.days.monday'),
      tuesday: t('clubs.CulturalManagement.workingHours.days.tuesday'),
      wednesday: t('clubs.CulturalManagement.workingHours.days.wednesday'),
      thursday: t('clubs.CulturalManagement.workingHours.days.thursday'),
      friday: t('clubs.CulturalManagement.workingHours.days.friday'),
      saturday: t('clubs.CulturalManagement.workingHours.days.saturday'),
      sunday: t('clubs.CulturalManagement.workingHours.days.sunday')
    };

    return Object.entries(hours).map(([day, time]) => ({
      day: dayNames[day],
      time: time === 'closed' || time === 'затворено' ? 
        t('clubs.CulturalManagement.workingHours.closed') : time
    }));
  };

  const getRoleColor = (role) => {
    const colors = {
      'председател': '#ef4444',
      'chairman': '#ef4444',
      'president': '#ef4444',
      'секретар': '#3b82f6',
      'secretary': '#3b82f6',
      'касиер': '#10b981',
      'treasurer': '#10b981',
      'заместник-председател': '#f59e0b',
      'vice-chairman': '#f59e0b',
      'културен деец': '#8b5cf6',
      'cultural-officer': '#8b5cf6',
      'член': '#6b7280',
      'member': '#6b7280'
    };
    return colors[role] || '#6b7280';
  };

  const roleIcons = getRoleIcons();

  return (
    <section id="cultural-management" className="cultural-management-main-section">
      <div className="cultural-management-container">
        
        <div className="cultural-management-header">
          <div className="cultural-management-badge">
            <FontAwesomeIcon icon={faUsers} />
            <span>{t('clubs.CulturalManagement.header.badge')}</span>
          </div>
          <h2 className="cultural-management-title">{t('clubs.CulturalManagement.header.title')}</h2>
          <p className="cultural-management-subtitle">
            {t('clubs.CulturalManagement.header.subtitle')}
          </p>
        </div>

        <div className="cultural-management-board-section">
          <div className="cultural-management-section-header">
            <h3>{t('clubs.CulturalManagement.board.title')}</h3>
            <p>{t('clubs.CulturalManagement.board.subtitle')}</p>
          </div>
          
          <div className="cultural-management-board-grid">
            {boardMembers.map((member, index) => (
              <div key={index} className="cultural-management-member-card">
                <div className="cultural-management-member-avatar">
                  <img src={member.avatar} alt={member.name} />
                  <div 
                    className="cultural-management-member-role-badge"
                    style={{ background: getRoleColor(member.role) }}
                  >
                    <FontAwesomeIcon icon={roleIcons[member.role] || faUser} />
                  </div>
                </div>
                
                <div className="cultural-management-member-info">
                  <h4>{member.name}</h4>
                  <div className="cultural-management-member-role">{translateRole(member.role)}</div>
                  <p className="cultural-management-member-bio">{member.bio}</p>
                  
                  {member.specialties && (
                    <div className="cultural-management-member-specialties">
                      {member.specialties.map((specialty, idx) => (
                        <span key={idx} className="cultural-management-specialty-tag">
                          {translateSpecialty(specialty)}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="cultural-management-member-contact">
                    <div className="cultural-management-contact-item">
                      <FontAwesomeIcon icon={faPhone} />
                      <span>{member.phone}</span>
                    </div>
                    <div className="cultural-management-contact-item">
                      <FontAwesomeIcon icon={faEnvelope} />
                      <span>{member.email}</span>
                    </div>
                    {member.experience && (
                      <div className="cultural-management-contact-item">
                        <FontAwesomeIcon icon={faAward} />
                        <span>{t('clubs.CulturalManagement.member.experience')}: {member.experience}</span>
                      </div>
                    )}
                  </div>
                  
                  <button 
                    className="cultural-management-member-btn"
                    onClick={() => setSelectedMember(member)}
                  >
                    <FontAwesomeIcon icon={faComments} />
                    {t('clubs.CulturalManagement.member.contact')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="cultural-management-contact-section">
          
          <div className="cultural-management-office-info">
            <div className="cultural-management-office-header">
              <FontAwesomeIcon icon={faBuilding} />
              <h3>{t('clubs.CulturalManagement.office.title')}</h3>
            </div>
            
            <div className="cultural-management-office-details">
              <div className="cultural-management-office-address">
                <h4>{t('clubs.CulturalManagement.office.address.title')}</h4>
                <div className="cultural-management-address-info">
                  <FontAwesomeIcon icon={faMapMarkerAlt} />
                  <div>
                    <div>{officeInfo.address}</div>
                    <div>{officeInfo.city} {officeInfo.postalCode}</div>
                  </div>
                </div>
              </div>
              
              <div className="cultural-management-office-contacts">
                <h4>{t('clubs.CulturalManagement.office.contacts.title')}</h4>
                <div className="cultural-management-contact-list">
                  <div className="cultural-management-contact-row">
                    <FontAwesomeIcon icon={faPhoneAlt} />
                    <span>{t('clubs.CulturalManagement.office.contacts.phone')}: {officeInfo.phone}</span>
                  </div>
                  <div className="cultural-management-contact-row">
                    <FontAwesomeIcon icon={faMobile} />
                    <span>{t('clubs.CulturalManagement.office.contacts.mobile')}: {officeInfo.mobile}</span>
                  </div>
                  <div className="cultural-management-contact-row">
                    <FontAwesomeIcon icon={faEnvelope} />
                    <span>{officeInfo.email}</span>
                  </div>
                  {officeInfo.website && (
                    <div className="cultural-management-contact-row">
                      <FontAwesomeIcon icon={faGlobe} />
                      <span>{officeInfo.website}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="cultural-management-office-hours">
                <h4>{t('clubs.CulturalManagement.office.workingHours.title')}</h4>
                <div className="cultural-management-hours-list">
                  {formatWorkingHours(officeInfo.workingHours).map((day, index) => (
                    <div key={index} className="cultural-management-hours-row">
                      <span className="cultural-management-day">{day.day}</span>
                      <span className="cultural-management-time">{day.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="cultural-management-contact-form">
            <div className="cultural-management-form-header">
              <FontAwesomeIcon icon={faPaperPlane} />
              <h3>{t('clubs.CulturalManagement.contactForm.title')}</h3>
              <p>{t('clubs.CulturalManagement.contactForm.subtitle')}</p>
            </div>
            
            {formStatus === 'sent' ? (
              <div className="cultural-management-form-success">
                <FontAwesomeIcon icon={faCheck} />
                <h4>{t('clubs.CulturalManagement.form.success.title')}</h4>
                <p>{t('clubs.CulturalManagement.form.success.message')}</p>
              </div>
            ) : formStatus === 'error' ? (
              <div className="cultural-management-form-error">
                <FontAwesomeIcon icon={faExclamationTriangle} />
                <h4>{t('clubs.CulturalManagement.form.error.title')}</h4>
                <p>{t('clubs.CulturalManagement.form.error.message')}</p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="cultural-management-form">
                <div className="cultural-management-form-row">
                  <div className="cultural-management-form-group">
                    <label>{t('clubs.CulturalManagement.form.name')}</label>
                    <input
                      type="text"
                      value={contactForm.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder={t('clubs.CulturalManagement.form.namePlaceholder')}
                      required
                    />
                  </div>
                  
                  <div className="cultural-management-form-group">
                    <label>{t('clubs.CulturalManagement.form.email')}</label>
                    <input
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder={t('clubs.CulturalManagement.form.emailPlaceholder')}
                      required
                    />
                  </div>
                </div>
                
                <div className="cultural-management-form-row">
                  <div className="cultural-management-form-group">
                    <label>{t('clubs.CulturalManagement.form.phone')}</label>
                    <input
                      type="tel"
                      value={contactForm.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder={t('clubs.CulturalManagement.form.phonePlaceholder')}
                    />
                  </div>
                  
                  <div className="cultural-management-form-group">
                    <label>{t('clubs.CulturalManagement.form.subject')}</label>
                    <select
                      value={contactForm.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      required
                    >
                      <option value="">{t('clubs.CulturalManagement.form.subjectPlaceholder')}</option>
                      <option value="membership">{t('clubs.CulturalManagement.form.subjects.membership')}</option>
                      <option value="activities">{t('clubs.CulturalManagement.form.subjects.activities')}</option>
                      <option value="events">{t('clubs.CulturalManagement.form.subjects.events')}</option>
                      <option value="volunteering">{t('clubs.CulturalManagement.form.subjects.volunteering')}</option>
                      <option value="other">{t('clubs.CulturalManagement.form.subjects.other')}</option>
                    </select>
                  </div>
                </div>
                
                <div className="cultural-management-form-group">
                  <label>{t('clubs.CulturalManagement.form.message')}</label>
                  <textarea
                    value={contactForm.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    placeholder={t('clubs.CulturalManagement.form.messagePlaceholder')}
                    rows="5"
                    required
                  />
                </div>
                
                <button type="submit" className="cultural-management-submit-btn" disabled={formStatus === 'sending'}>
                  <FontAwesomeIcon icon={faPaperPlane} />
                  {formStatus === 'sending' ? t('clubs.CulturalManagement.form.sending') : t('clubs.CulturalManagement.form.submit')}
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="cultural-management-quick-contact">
          <h3>{t('clubs.CulturalManagement.quickContact.title')}</h3>
          <div className="cultural-management-quick-grid">
            <div className="cultural-management-quick-card">
              <div className="cultural-management-quick-icon">
                <FontAwesomeIcon icon={faGavel} />
              </div>
              <div className="cultural-management-quick-info">
                <h4>{t('clubs.CulturalManagement.quickContact.chairman')}</h4>
                <p>{boardMembers[0]?.name}</p>
                <div className="cultural-management-quick-contact-info">
                  <span>{boardMembers[0]?.phone}</span>
                  <span>{boardMembers[0]?.email}</span>
                </div>
              </div>
            </div>
            
            <div className="cultural-management-quick-card">
              <div className="cultural-management-quick-icon">
                <FontAwesomeIcon icon={faCalculator} />
              </div>
              <div className="cultural-management-quick-info">
                <h4>{t('clubs.CulturalManagement.quickContact.finance')}</h4>
                <p>{boardMembers.find(m => m.role === 'касиер' || m.role === 'treasurer')?.name || t('clubs.CulturalManagement.roles.treasurer')}</p>
                <div className="cultural-management-quick-contact-info">
                  <span>{boardMembers.find(m => m.role === 'касиер' || m.role === 'treasurer')?.phone || officeInfo.phone}</span>
                  <span>{boardMembers.find(m => m.role === 'касиер' || m.role === 'treasurer')?.email || officeInfo.email}</span>
                </div>
              </div>
            </div>
            
            <div className="cultural-management-quick-card">
              <div className="cultural-management-quick-icon">
                <FontAwesomeIcon icon={faStar} />
              </div>
              <div className="cultural-management-quick-info">
                <h4>{t('clubs.CulturalManagement.quickContact.events')}</h4>
                <p>{boardMembers.find(m => m.role === 'културен деец' || m.role === 'cultural-officer')?.name || t('clubs.CulturalManagement.quickContact.culturalDepartment')}</p>
                <div className="cultural-management-quick-contact-info">
                  <span>{boardMembers.find(m => m.role === 'културен деец' || m.role === 'cultural-officer')?.phone || officeInfo.phone}</span>
                  <span>{boardMembers.find(m => m.role === 'културен деец' || m.role === 'cultural-officer')?.email || officeInfo.email}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedMember && (
        <div className="cultural-management-modal-overlay" onClick={() => setSelectedMember(null)}>
          <div className="cultural-management-modal" onClick={(e) => e.stopPropagation()}>
            <button 
              className="cultural-management-modal-close"
              onClick={() => setSelectedMember(null)}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
            
            <div className="cultural-management-modal-content">
              <div className="cultural-management-modal-header">
                <img src={selectedMember.avatar} alt={selectedMember.name} />
                <div className="cultural-management-modal-info">
                  <h3>{selectedMember.name}</h3>
                  <div className="cultural-management-modal-role">{translateRole(selectedMember.role)}</div>
                  <p>{selectedMember.bio}</p>
                </div>
              </div>
              
              <div className="cultural-management-modal-details">
                <div className="cultural-management-modal-contact">
                  <h4>{t('clubs.CulturalManagement.modal.contacts')}</h4>
                  <div className="cultural-management-modal-contact-list">
                    <div className="cultural-management-modal-contact-item">
                      <FontAwesomeIcon icon={faPhone} />
                      <span>{selectedMember.phone}</span>
                    </div>
                    <div className="cultural-management-modal-contact-item">
                      <FontAwesomeIcon icon={faEnvelope} />
                      <span>{selectedMember.email}</span>
                    </div>
                    <div className="cultural-management-modal-contact-item">
                      <FontAwesomeIcon icon={faMapMarkerAlt} />
                      <span>{selectedMember.address}</span>
                    </div>
                  </div>
                </div>
                
                {selectedMember.specialties && (
                  <div className="cultural-management-modal-specialties">
                    <h4>{t('clubs.CulturalManagement.modal.specialties')}</h4>
                    <div className="cultural-management-modal-specialty-tags">
                      {selectedMember.specialties.map((specialty, idx) => (
                        <span key={idx} className="cultural-management-modal-specialty-tag">
                          {translateSpecialty(specialty)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="cultural-management-modal-actions">
                <button className="cultural-management-modal-btn primary">
                  <FontAwesomeIcon icon={faPhone} />
                  {t('clubs.CulturalManagement.modal.buttons.call')}
                </button>
                <button className="cultural-management-modal-btn secondary">
                  <FontAwesomeIcon icon={faEnvelope} />
                  {t('clubs.CulturalManagement.modal.buttons.email')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default CulturalManagement;