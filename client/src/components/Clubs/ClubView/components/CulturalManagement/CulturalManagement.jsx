import { useState } from 'react';
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
  faGlobe
} from '@fortawesome/free-solid-svg-icons';
import './culturalManagement.css';

export const CulturalManagement = ({ club }) => {
  const [selectedMember, setSelectedMember] = useState(null);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const roleIcons = {
    'председател': faGavel,
    'секретар': faClipboardList,
    'касиер': faCalculator,
    'заместник-председател': faUserTie,
    'културен деец': faStar,
    'член': faUser
  };

  const boardMembers = club.management?.board || [
    {
      name: "Анка Димитрова",
      role: "председател",
      phone: "0888567123",
      email: "anka.dimitrova@zlatnaesenta.bg",
      address: "ул. Витоша 45, София",
      avatar: "https://picsum.photos/150/150?random=101",
      bio: "Пенсионирана учителка по история с 35-годишен стаж. Председател на клуба от 2022 г.",
      experience: "3 години",
      specialties: ["Организация", "Културни събития", "Образование"]
    },
    {
      name: "Васил Георгиев",
      role: "секретар",
      phone: "0877234567",
      email: "secretary@zlatnaesenta.bg",
      address: "ул. Раковски 12, София",
      avatar: "https://picsum.photos/150/150?random=102",
      bio: "Бивш счетоводител, отговаря за документооборота и комуникацията",
      experience: "4 години",
      specialties: ["Документооборот", "Администрация", "Комуникации"]
    },
    {
      name: "Мария Петкова",
      role: "касиер",
      phone: "0899345678",
      email: "treasurer@zlatnaesenta.bg",
      address: "бул. Стамболийски 78, София",
      avatar: "https://picsum.photos/150/150?random=103",
      bio: "Пенсионирана банкерка, управлява финансите на клуба",
      experience: "5 години",
      specialties: ["Финанси", "Бюджет", "Счетоводство"]
    }
  ];

  const officeInfo = {
    address: club.location?.address || "ул. Витоша 127, ет. 2",
    city: club.location?.city || "София",
    postalCode: club.location?.postalCode || "1463",
    phone: club.contacts?.phone || "02/856-4321",
    mobile: club.contacts?.mobile || "0888567123",
    email: club.contacts?.email || "info@zlatnaesenta.bg",
    website: club.contacts?.website || "www.zlatnaesenta-sofia.bg",
    workingHours: club.contacts?.workingHours || {
      monday: "09:00-17:00",
      tuesday: "09:00-17:00",
      wednesday: "09:00-17:00",
      thursday: "09:00-17:00",
      friday: "09:00-17:00",
      saturday: "10:00-15:00",
      sunday: "затворено"
    }
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    alert(`Съобщението е изпратено успешно!\n\nИме: ${contactForm.name}\nТема: ${contactForm.subject}`);
    setContactForm({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  const handleInputChange = (field, value) => {
    setContactForm(prev => ({ ...prev, [field]: value }));
  };

  const formatWorkingHours = (hours) => {
    const dayNames = {
      monday: 'Понеделник',
      tuesday: 'Вторник', 
      wednesday: 'Сряда',
      thursday: 'Четвъртък',
      friday: 'Петък',
      saturday: 'Събота',
      sunday: 'Неделя'
    };

    return Object.entries(hours).map(([day, time]) => ({
      day: dayNames[day],
      time: time === 'closed' || time === 'затворено' ? 'Затворено' : time
    }));
  };

  const getRoleColor = (role) => {
    const colors = {
      'председател': '#ef4444',
      'секретар': '#3b82f6',
      'касиер': '#10b981',
      'заместник-председател': '#f59e0b',
      'културен деец': '#8b5cf6',
      'член': '#6b7280'
    };
    return colors[role] || '#6b7280';
  };

  return (
    <section id="cultural-management" className="cultural-management-main-section">
      <div className="cultural-management-container">
        
        {/* Header */}
        <div className="cultural-management-header">
          <div className="cultural-management-badge">
            <FontAwesomeIcon icon={faUsers} />
            <span>Ръководство и управление</span>
          </div>
          <h2 className="cultural-management-title">Нашето ръководство</h2>
          <p className="cultural-management-subtitle">
            Запознайте се с хората, които водят клуба напред с отдаденост и опит
          </p>
        </div>

        {/* Board Members */}
        <div className="cultural-management-board-section">
          <div className="cultural-management-section-header">
            <h3>Управителен съвет</h3>
            <p>Нашият опитен екип, който осигурява отличната работа на клуба</p>
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
                  <div className="cultural-management-member-role">{member.role}</div>
                  <p className="cultural-management-member-bio">{member.bio}</p>
                  
                  {member.specialties && (
                    <div className="cultural-management-member-specialties">
                      {member.specialties.map((specialty, idx) => (
                        <span key={idx} className="cultural-management-specialty-tag">
                          {specialty}
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
                        <span>Опит: {member.experience}</span>
                      </div>
                    )}
                  </div>
                  
                  <button 
                    className="cultural-management-member-btn"
                    onClick={() => setSelectedMember(member)}
                  >
                    <FontAwesomeIcon icon={faComments} />
                    Свържете се
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Office Information & Contact Form */}
        <div className="cultural-management-contact-section">
          
          {/* Office Info */}
          <div className="cultural-management-office-info">
            <div className="cultural-management-office-header">
              <FontAwesomeIcon icon={faBuilding} />
              <h3>Офис и контакти</h3>
            </div>
            
            <div className="cultural-management-office-details">
              <div className="cultural-management-office-address">
                <h4>Адрес</h4>
                <div className="cultural-management-address-info">
                  <FontAwesomeIcon icon={faMapMarkerAlt} />
                  <div>
                    <div>{officeInfo.address}</div>
                    <div>{officeInfo.city} {officeInfo.postalCode}</div>
                  </div>
                </div>
              </div>
              
              <div className="cultural-management-office-contacts">
                <h4>Контакти</h4>
                <div className="cultural-management-contact-list">
                  <div className="cultural-management-contact-row">
                    <FontAwesomeIcon icon={faPhoneAlt} />
                    <span>Тел: {officeInfo.phone}</span>
                  </div>
                  <div className="cultural-management-contact-row">
                    <FontAwesomeIcon icon={faMobile} />
                    <span>Моб: {officeInfo.mobile}</span>
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
                <h4>Работно време</h4>
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

          {/* Contact Form */}
          <div className="cultural-management-contact-form">
            <div className="cultural-management-form-header">
              <FontAwesomeIcon icon={faPaperPlane} />
              <h3>Свържете се с нас</h3>
              <p>Имате въпроси? Пишете ни и ще ви отговорим възможно най-скоро</p>
            </div>
            
            <form onSubmit={handleContactSubmit} className="cultural-management-form">
              <div className="cultural-management-form-row">
                <div className="cultural-management-form-group">
                  <label>Име и фамилия</label>
                  <input
                    type="text"
                    value={contactForm.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Вашето име"
                    required
                  />
                </div>
                
                <div className="cultural-management-form-group">
                  <label>Email адрес</label>
                  <input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="email@example.com"
                    required
                  />
                </div>
              </div>
              
              <div className="cultural-management-form-row">
                <div className="cultural-management-form-group">
                  <label>Телефон</label>
                  <input
                    type="tel"
                    value={contactForm.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="0888 123 456"
                  />
                </div>
                
                <div className="cultural-management-form-group">
                  <label>Тема</label>
                  <select
                    value={contactForm.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    required
                  >
                    <option value="">Изберете тема</option>
                    <option value="membership">Членство</option>
                    <option value="activities">Дейности</option>
                    <option value="events">Събития</option>
                    <option value="volunteering">Доброволчество</option>
                    <option value="other">Друго</option>
                  </select>
                </div>
              </div>
              
              <div className="cultural-management-form-group">
                <label>Съобщение</label>
                <textarea
                  value={contactForm.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  placeholder="Напишете вашето съобщение тук..."
                  rows="5"
                  required
                />
              </div>
              
              <button type="submit" className="cultural-management-submit-btn">
                <FontAwesomeIcon icon={faPaperPlane} />
                Изпрати съобщение
              </button>
            </form>
          </div>
        </div>

        {/* Quick Contact Cards */}
        <div className="cultural-management-quick-contact">
          <h3>Бързи контакти</h3>
          <div className="cultural-management-quick-grid">
            <div className="cultural-management-quick-card">
              <div className="cultural-management-quick-icon">
                <FontAwesomeIcon icon={faGavel} />
              </div>
              <div className="cultural-management-quick-info">
                <h4>Председател</h4>
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
                <h4>Финанси</h4>
                <p>{boardMembers.find(m => m.role === 'касиер')?.name || 'Касиер'}</p>
                <div className="cultural-management-quick-contact-info">
                  <span>{boardMembers.find(m => m.role === 'касиер')?.phone || officeInfo.phone}</span>
                  <span>{boardMembers.find(m => m.role === 'касиер')?.email || officeInfo.email}</span>
                </div>
              </div>
            </div>
            
            <div className="cultural-management-quick-card">
              <div className="cultural-management-quick-icon">
                <FontAwesomeIcon icon={faStar} />
              </div>
              <div className="cultural-management-quick-info">
                <h4>Събития</h4>
                <p>{boardMembers.find(m => m.role === 'културен деец')?.name || 'Културен отдел'}</p>
                <div className="cultural-management-quick-contact-info">
                  <span>{boardMembers.find(m => m.role === 'културен деец')?.phone || officeInfo.phone}</span>
                  <span>{boardMembers.find(m => m.role === 'културен деец')?.email || officeInfo.email}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Member Details Modal */}
      {selectedMember && (
        <div className="cultural-management-modal-overlay" onClick={() => setSelectedMember(null)}>
          <div className="cultural-management-modal" onClick={(e) => e.stopPropagation()}>
            <button 
              className="cultural-management-modal-close"
              onClick={() => setSelectedMember(null)}
            >
              ×
            </button>
            
            <div className="cultural-management-modal-content">
              <div className="cultural-management-modal-header">
                <img src={selectedMember.avatar} alt={selectedMember.name} />
                <div className="cultural-management-modal-info">
                  <h3>{selectedMember.name}</h3>
                  <div className="cultural-management-modal-role">{selectedMember.role}</div>
                  <p>{selectedMember.bio}</p>
                </div>
              </div>
              
              <div className="cultural-management-modal-details">
                <div className="cultural-management-modal-contact">
                  <h4>Контакти</h4>
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
                    <h4>Специалности</h4>
                    <div className="cultural-management-modal-specialty-tags">
                      {selectedMember.specialties.map((specialty, idx) => (
                        <span key={idx} className="cultural-management-modal-specialty-tag">
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="cultural-management-modal-actions">
                <button className="cultural-management-modal-btn primary">
                  <FontAwesomeIcon icon={faPhone} />
                  Обадете се
                </button>
                <button className="cultural-management-modal-btn secondary">
                  <FontAwesomeIcon icon={faEnvelope} />
                  Пишете email
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