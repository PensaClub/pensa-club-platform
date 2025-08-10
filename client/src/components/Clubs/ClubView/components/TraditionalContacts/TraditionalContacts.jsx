import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPhone,
  faEnvelope,
  faMapMarkerAlt,
  faClock,
  faGlobe,
  faUser,
  faUsers,
  faMobile,
  faPaperPlane,
  faTimes,
  faCheck,
  faExclamationTriangle,
  faCopy,
  faCheckCircle
} from '@fortawesome/free-solid-svg-icons';
import './traditionalContacts.css';

export const TraditionalContacts = ({ club }) => {
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [formStatus, setFormStatus] = useState(null);
  const [copiedItems, setCopiedItems] = useState({}); // Tracking copied items

  // Проверяваме дали има необходимите данни
  if (!club?.name) {
    return null;
  }

  // Извличаме САМО реални данни от клуба
  const contacts = club.contacts || {};
  const location = club.location || {};
  const management = club.management || {};
  const board = management.board || [];
  const workingHours = contacts.workingHours || {};
  const socialMedia = contacts.socialMedia || {};

  // Проверяваме дали има РЕАЛНО съдържание за показване
  const hasContactContent = 
    contacts.phone ||
    contacts.mobile ||
    contacts.email ||
    contacts.website ||
    location.address ||
    board.length > 0 ||
    Object.keys(workingHours).length > 0 ||
    Object.keys(socialMedia).length > 0;

  if (!hasContactContent) {
    return null;
  }

  // Copy to clipboard function
  const copyToClipboard = async (text, type, id = 'main') => {
    try {
      await navigator.clipboard.writeText(text);
      
      // Mark as copied with unique ID
      const copyId = `${type}-${id}`;
      setCopiedItems(prev => ({
        ...prev,
        [copyId]: true
      }));
      
      // Remove copied status after 2 seconds
      setTimeout(() => {
        setCopiedItems(prev => {
          const newState = { ...prev };
          delete newState[copyId];
          return newState;
        });
      }, 2000);
      
    } catch (error) {
      console.error('Грешка при копиране:', error);
      alert('Грешка при копиране. Моля опитайте отново.');
    }
  };

  // Помощни функции
  const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    return phone.replace(/(\d{2})(\d{3})(\d{3})/, '$1 $2 $3');
  };

  const getDayName = (day) => {
    const days = {
      'monday': 'Понеделник',
      'tuesday': 'Вторник',
      'wednesday': 'Сряда',
      'thursday': 'Четвъртък',
      'friday': 'Петък',
      'saturday': 'Събота',
      'sunday': 'Неделя'
    };
    return days[day] || day;
  };

  const getSocialIcon = (platform) => {
    switch (platform.toLowerCase()) {
      case 'facebook': return faGlobe;
      case 'twitter': return faGlobe;
      case 'instagram': return faGlobe;
      case 'linkedin': return faGlobe;
      default: return faGlobe;
    }
  };

  const isCurrentlyOpen = () => {
    if (Object.keys(workingHours).length === 0) return null;
    
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const currentTime = now.getHours() * 100 + now.getMinutes();
    
    const todayHours = workingHours[currentDay];
    if (!todayHours || todayHours === 'closed') return false;
    
    const [openTime, closeTime] = todayHours.split('-');
    const openHour = parseInt(openTime.split(':')[0]) * 100 + parseInt(openTime.split(':')[1] || '0');
    const closeHour = parseInt(closeTime.split(':')[0]) * 100 + parseInt(closeTime.split(':')[1] || '0');
    
    return currentTime >= openHour && currentTime <= closeHour;
  };

  // Форма функции
  const openContactForm = () => {
    setIsContactFormOpen(true);
  };

  const closeContactForm = () => {
    setIsContactFormOpen(false);
    setContactForm({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    });
    setFormStatus(null);
  };

  const handleFormChange = (field, value) => {
    setContactForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setFormStatus('sending');

    const subject = encodeURIComponent(contactForm.subject || `Съобщение от ${contactForm.name}`);
    const body = encodeURIComponent(`
Име: ${contactForm.name}
Имейл: ${contactForm.email}
Телефон: ${contactForm.phone || 'Не е посочен'}

Съобщение:
${contactForm.message}

---
Изпратено от контактната форма на ${club.name}
    `);
    
    const mailtoLink = `mailto:${contacts.email}?subject=${subject}&body=${body}`;
    
    try {
      window.location.href = mailtoLink;
      setFormStatus('sent');
      setTimeout(() => {
        closeContactForm();
      }, 2000);
    } catch (error) {
      setFormStatus('error');
    }
  };

  const handleCallPhone = (phone) => {
    window.open(`tel:${phone}`);
  };

  const handleSendEmail = (email) => {
    window.open(`mailto:${email}`);
  };

  const handleOpenWebsite = (website) => {
    const url = website.startsWith('http') ? website : `https://${website}`;
    window.open(url, '_blank');
  };

  const handleOpenMap = () => {
    if (location.address) {
      const query = encodeURIComponent(`${location.address}, ${location.city || ''}`);
      window.open(`https://www.google.com/maps/search/${query}`, '_blank');
    }
  };

  const currentlyOpen = isCurrentlyOpen();

  return (
    <section id="traditional-contacts" className="traditional-contacts-main-section">
      <div className="traditional-contacts-container">
        
        {/* Header */}
        <div className="traditional-contacts-header">
          <div className="traditional-contacts-badge">
            <FontAwesomeIcon icon={faPhone} />
            <span>Свържете се с нас</span>
          </div>
          <h2 className="traditional-contacts-title">Контакти</h2>
          <p className="traditional-contacts-subtitle">
            Ще се радваме да отговорим на вашите въпроси и да ви помогнем
          </p>
        </div>

        <div className="traditional-contacts-main-grid">
          
          {/* Main Contact Info */}
          <div className="traditional-contacts-section">
            <div className="traditional-contacts-section-header">
              <FontAwesomeIcon icon={faPhone} />
              <h3>Основни контакти</h3>
              <p>Как можете да се свържете с нас</p>
            </div>
            
            <div className="traditional-contacts-info-grid">
              
              {/* Phone */}
              {contacts.phone && (
                <div className="traditional-contacts-info-card">
                  <div className="traditional-contacts-info-icon">
                    <FontAwesomeIcon icon={faPhone} />
                  </div>
                  <div className="traditional-contacts-info-content">
                    <h4>Телефон</h4>
                    <p>{formatPhoneNumber(contacts.phone)}</p>
                    <div className="traditional-contacts-action-buttons">
                      <button 
                        className="traditional-contacts-action-btn primary"
                        onClick={() => handleCallPhone(contacts.phone)}
                      >
                        <FontAwesomeIcon icon={faPhone} />
                        Обадете се
                      </button>
                      <button 
                        className={`traditional-contacts-copy-btn ${copiedItems['phone-main'] ? 'copied' : ''}`}
                        onClick={() => copyToClipboard(contacts.phone, 'phone', 'main')}
                        title="Копирай телефона"
                      >
                        <FontAwesomeIcon icon={copiedItems['phone-main'] ? faCheckCircle : faCopy} />
                        {copiedItems['phone-main'] ? 'Копирано!' : 'Копирай'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Mobile */}
              {contacts.mobile && (
                <div className="traditional-contacts-info-card">
                  <div className="traditional-contacts-info-icon">
                    <FontAwesomeIcon icon={faMobile} />
                  </div>
                  <div className="traditional-contacts-info-content">
                    <h4>Мобилен</h4>
                    <p>{formatPhoneNumber(contacts.mobile)}</p>
                    <div className="traditional-contacts-action-buttons">
                      <button 
                        className="traditional-contacts-action-btn primary"
                        onClick={() => handleCallPhone(contacts.mobile)}
                      >
                        <FontAwesomeIcon icon={faPhone} />
                        Обадете се
                      </button>
                      <button 
                        className={`traditional-contacts-copy-btn ${copiedItems['mobile-main'] ? 'copied' : ''}`}
                        onClick={() => copyToClipboard(contacts.mobile, 'mobile', 'main')}
                        title="Копирай мобилния"
                      >
                        <FontAwesomeIcon icon={copiedItems['mobile-main'] ? faCheckCircle : faCopy} />
                        {copiedItems['mobile-main'] ? 'Копирано!' : 'Копирай'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Email */}
              {contacts.email && (
                <div className="traditional-contacts-info-card">
                  <div className="traditional-contacts-info-icon">
                    <FontAwesomeIcon icon={faEnvelope} />
                  </div>
                  <div className="traditional-contacts-info-content">
                    <h4>Имейл</h4>
                    <p>{contacts.email}</p>
                    <div className="traditional-contacts-action-buttons">
                      <button 
                        className="traditional-contacts-action-btn primary"
                        onClick={() => handleSendEmail(contacts.email)}
                      >
                        <FontAwesomeIcon icon={faEnvelope} />
                        Изпратете имейл
                      </button>
                      <button 
                        className={`traditional-contacts-copy-btn ${copiedItems['email-main'] ? 'copied' : ''}`}
                        onClick={() => copyToClipboard(contacts.email, 'email', 'main')}
                        title="Копирай имейла"
                      >
                        <FontAwesomeIcon icon={copiedItems['email-main'] ? faCheckCircle : faCopy} />
                        {copiedItems['email-main'] ? 'Копирано!' : 'Копирай'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Website */}
              {contacts.website && (
                <div className="traditional-contacts-info-card">
                  <div className="traditional-contacts-info-icon">
                    <FontAwesomeIcon icon={faGlobe} />
                  </div>
                  <div className="traditional-contacts-info-content">
                    <h4>Уебсайт</h4>
                    <p>{contacts.website}</p>
                    <div className="traditional-contacts-action-buttons">
                      <button 
                        className="traditional-contacts-action-btn primary"
                        onClick={() => handleOpenWebsite(contacts.website)}
                      >
                        <FontAwesomeIcon icon={faGlobe} />
                        Посетете
                      </button>
                      <button 
                        className={`traditional-contacts-copy-btn ${copiedItems['website-main'] ? 'copied' : ''}`}
                        onClick={() => copyToClipboard(contacts.website, 'website', 'main')}
                        title="Копирай уебсайта"
                      >
                        <FontAwesomeIcon icon={copiedItems['website-main'] ? faCheckCircle : faCopy} />
                        {copiedItems['website-main'] ? 'Копирано!' : 'Копирай'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Address */}
              {location.address && (
                <div className="traditional-contacts-info-card full-width">
                  <div className="traditional-contacts-info-icon">
                    <FontAwesomeIcon icon={faMapMarkerAlt} />
                  </div>
                  <div className="traditional-contacts-info-content">
                    <h4>Адрес</h4>
                    <p>
                      {location.address}
                      {location.city && `, ${location.city}`}
                      {location.postalCode && ` ${location.postalCode}`}
                    </p>
                    <div className="traditional-contacts-action-buttons">
                      <button 
                        className="traditional-contacts-action-btn primary"
                        onClick={handleOpenMap}
                      >
                        <FontAwesomeIcon icon={faMapMarkerAlt} />
                        Покажи на картата
                      </button>
                      <button 
                        className={`traditional-contacts-copy-btn ${copiedItems['address-main'] ? 'copied' : ''}`}
                        onClick={() => copyToClipboard(`${location.address}${location.city ? `, ${location.city}` : ''}${location.postalCode ? ` ${location.postalCode}` : ''}`, 'address', 'main')}
                        title="Копирай адреса"
                      >
                        <FontAwesomeIcon icon={copiedItems['address-main'] ? faCheckCircle : faCopy} />
                        {copiedItems['address-main'] ? 'Копирано!' : 'Копирай'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Working Hours - показва се САМО ако има работно време */}
          {Object.keys(workingHours).length > 0 && (
            <div className="traditional-contacts-section">
              <div className="traditional-contacts-section-header">
                <FontAwesomeIcon icon={faClock} />
                <h3>Работно време</h3>
                <p>Кога можете да ни намерите</p>
                {currentlyOpen !== null && (
                  <div className={`traditional-contacts-status ${currentlyOpen ? 'open' : 'closed'}`}>
                    {currentlyOpen ? 'Сега сме отворени' : 'Сега сме затворени'}
                  </div>
                )}
              </div>
              
              <div className="traditional-contacts-hours">
                {Object.entries(workingHours).map(([day, hours]) => (
                  <div key={day} className="traditional-contacts-hours-item">
                    <div className="traditional-contacts-day">
                      {getDayName(day)}
                    </div>
                    <div className="traditional-contacts-time">
                      {hours === 'closed' ? 'Затворено' : hours}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Management Board - показва се САМО ако има ръководство */}
          {board.length > 0 && (
            <div className="traditional-contacts-section">
              <div className="traditional-contacts-section-header">
                <FontAwesomeIcon icon={faUsers} />
                <h3>Ръководство</h3>
                <p>Хора които можете да потърсите</p>
              </div>
              
              <div className="traditional-contacts-board">
                {board.map((member, index) => (
                  <div key={index} className="traditional-contacts-board-member">
                    {member.avatar && (
                      <div className="traditional-contacts-member-avatar">
                        <img src={member.avatar} alt={member.name} />
                      </div>
                    )}
                    <div className="traditional-contacts-member-info">
                      <h4>{member.name}</h4>
                      <div className="traditional-contacts-member-role">{member.role}</div>
                      {member.bio && (
                        <p>{member.bio}</p>
                      )}
                      <div className="traditional-contacts-member-contacts">
                        {member.phone && (
                          <div className="traditional-contacts-member-contact-row">
                            <button 
                              className="traditional-contacts-member-btn"
                              onClick={() => handleCallPhone(member.phone)}
                            >
                              <FontAwesomeIcon icon={faPhone} />
                              {formatPhoneNumber(member.phone)}
                            </button>
                            <button 
                              className={`traditional-contacts-member-copy-btn ${copiedItems[`phone-${index}`] ? 'copied' : ''}`}
                              onClick={() => copyToClipboard(member.phone, 'phone', index)}
                              title="Копирай телефона"
                            >
                              <FontAwesomeIcon icon={copiedItems[`phone-${index}`] ? faCheckCircle : faCopy} />
                            </button>
                          </div>
                        )}
                        {member.email && (
                          <div className="traditional-contacts-member-contact-row">
                            <button 
                              className="traditional-contacts-member-btn"
                              onClick={() => handleSendEmail(member.email)}
                            >
                              <FontAwesomeIcon icon={faEnvelope} />
                              {member.email}
                            </button>
                            <button 
                              className={`traditional-contacts-member-copy-btn ${copiedItems[`email-${index}`] ? 'copied' : ''}`}
                              onClick={() => copyToClipboard(member.email, 'email', index)}
                              title="Копирай имейла"
                            >
                              <FontAwesomeIcon icon={copiedItems[`email-${index}`] ? faCheckCircle : faCopy} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Social Media - показва се САМО ако има социални мрежи */}
          {Object.keys(socialMedia).length > 0 && (
            <div className="traditional-contacts-section">
              <div className="traditional-contacts-section-header">
                <FontAwesomeIcon icon={faGlobe} />
                <h3>Социални мрежи</h3>
                <p>Последвайте ни онлайн</p>
              </div>
              
              <div className="traditional-contacts-social">
                {Object.entries(socialMedia).map(([platform, url]) => (
                  <a 
                    key={platform}
                    href={url.startsWith('http') ? url : `https://${url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="traditional-contacts-social-link"
                  >
                    <FontAwesomeIcon icon={getSocialIcon(platform)} />
                    <span>{platform.charAt(0).toUpperCase() + platform.slice(1)}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Contact Form CTA - показва се САМО ако има имейл */}
          {contacts.email && (
            <div className="traditional-contacts-section">
              <div className="traditional-contacts-cta">
                <div className="traditional-contacts-cta-content">
                  <h3>Изпратете ни съобщение</h3>
                  <p>Имате въпрос или искате повече информация? Свържете се с нас!</p>
                  <button 
                    className="traditional-contacts-cta-btn"
                    onClick={openContactForm}
                  >
                    <FontAwesomeIcon icon={faPaperPlane} />
                    Свържете се с нас
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CONTACT FORM MODAL */}
      {isContactFormOpen && (
        <div className="traditional-contacts-form-modal">
          <div className="traditional-contacts-form-modal-overlay" onClick={closeContactForm}></div>
          <div className="traditional-contacts-form-modal-container">
            <button className="traditional-contacts-form-modal-close" onClick={closeContactForm}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            
            <div className="traditional-contacts-form-header">
              <FontAwesomeIcon icon={faPaperPlane} />
              <h3>Свържете се с {club.name}</h3>
              <p>Изпратете ни вашето съобщение и ще се свържем с вас</p>
            </div>
            
            {formStatus === 'sent' ? (
              <div className="traditional-contacts-form-success">
                <FontAwesomeIcon icon={faCheck} />
                <h4>Съобщението е изпратено!</h4>
                <p>Благодарим ви! Ще се свържем с вас скоро.</p>
              </div>
            ) : formStatus === 'error' ? (
              <div className="traditional-contacts-form-error">
                <FontAwesomeIcon icon={faExclamationTriangle} />
                <h4>Възникна грешка</h4>
                <p>Моля опитайте отново или се свържете с нас директно.</p>
                <button 
                  className="traditional-contacts-retry-btn"
                  onClick={() => setFormStatus(null)}
                >
                  Опитайте отново
                </button>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="traditional-contacts-form">
                <div className="traditional-contacts-form-row">
                  <div className="traditional-contacts-form-group">
                    <label htmlFor="name">
                      <FontAwesomeIcon icon={faUser} />
                      Вашето име *
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={contactForm.name}
                      onChange={(e) => handleFormChange('name', e.target.value)}
                      required
                      placeholder="Въведете вашето име"
                    />
                  </div>
                  
                  <div className="traditional-contacts-form-group">
                    <label htmlFor="email">
                      <FontAwesomeIcon icon={faEnvelope} />
                      Имейл адрес *
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={contactForm.email}
                      onChange={(e) => handleFormChange('email', e.target.value)}
                      required
                      placeholder="Въведете вашия имейл"
                    />
                  </div>
                </div>
                
                <div className="traditional-contacts-form-row">
                  <div className="traditional-contacts-form-group">
                    <label htmlFor="phone">
                      <FontAwesomeIcon icon={faPhone} />
                      Телефон
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={contactForm.phone}
                      onChange={(e) => handleFormChange('phone', e.target.value)}
                      placeholder="Въведете вашия телефон"
                    />
                  </div>
                  
                  <div className="traditional-contacts-form-group">
                    <label htmlFor="subject">
                      <FontAwesomeIcon icon={faEnvelope} />
                      Тема
                    </label>
                    <input
                      type="text"
                      id="subject"
                      value={contactForm.subject}
                      onChange={(e) => handleFormChange('subject', e.target.value)}
                      placeholder="Тема на съобщението"
                    />
                  </div>
                </div>
                
                <div className="traditional-contacts-form-group">
                  <label htmlFor="message">
                    <FontAwesomeIcon icon={faPaperPlane} />
                    Съобщение *
                  </label>
                  <textarea
                    id="message"
                    value={contactForm.message}
                    onChange={(e) => handleFormChange('message', e.target.value)}
                    required
                    placeholder="Напишете вашето съобщение тук..."
                    rows="5"
                  />
                </div>
                
                <div className="traditional-contacts-form-actions">
                  <button 
                    type="submit" 
                    className="traditional-contacts-submit-btn"
                    disabled={formStatus === 'sending'}
                  >
                    <FontAwesomeIcon icon={faPaperPlane} />
                    {formStatus === 'sending' ? 'Изпраща се...' : 'Изпрати съобщението'}
                  </button>
                  <button 
                    type="button" 
                    onClick={closeContactForm}
                    className="traditional-contacts-cancel-btn"
                  >
                    Отказ
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default TraditionalContacts;