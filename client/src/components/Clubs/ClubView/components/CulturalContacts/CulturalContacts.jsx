import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPhone,
  faEnvelope,
  faMapMarkerAlt,
  faClock,
  faGlobe,
  faMobile,
  faCalendarAlt,
  faPaperPlane,
  faUser,
  faQuestionCircle,
  faInfoCircle,
  faHandshake,
  faUsers,
  faComments,
  faCheckCircle,
  faExclamationTriangle,
  faPhoneAlt
} from '@fortawesome/free-solid-svg-icons';
import { 
  faFacebook,
  faInstagram,
  faYoutube,
  faTwitter
} from '@fortawesome/free-brands-svg-icons';
import './culturalContacts.css';

export const CulturalContacts = ({ club }) => {
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    contactMethod: 'email'
  });

  const [formStatus, setFormStatus] = useState(null);

  // ПРОВЕРКА ЗА ДАННИ - ако няма контакти, не показваме компонента
  if (!club?.contacts || (!club.contacts.phone && !club.contacts.email)) {
    return null;
  }

  const contacts = {
    phone: club.contacts.phone || null,
    mobile: club.contacts.mobile || null,
    email: club.contacts.email || null,
    website: club.contacts.website || null,
    socialMedia: club.contacts.socialMedia || {},
    workingHours: club.contacts.workingHours || {}
  };

  // Спешни контакти от реални данни
  const getEmergencyContacts = () => {
    const emergencyList = [];
    
    if (club.contacts?.emergency) {
      emergencyList.push(...club.contacts.emergency);
    } else {
      // Ако няма специални спешни контакти, използваме основните
      if (contacts.phone) {
        emergencyList.push({
          title: "Основен телефон",
          name: "Клубна рецепция",
          phone: contacts.phone,
          available: "работно време",
          icon: faPhone
        });
      }
      
      if (contacts.mobile) {
        emergencyList.push({
          title: "Мобилен телефон",
          name: "Дежурен",
          phone: contacts.mobile,
          available: "извън работно време",
          icon: faMobile
        });
      }

      // Добавяме председателя ако има данни
      if (club.management?.board?.[0]) {
        const president = club.management.board[0];
        if (president.phone) {
          emergencyList.push({
            title: "Председател",
            name: president.name,
            phone: president.phone,
            available: "09:00-20:00",
            icon: faUser
          });
        }
      }
    }
    
    return emergencyList;
  };

  const emergencyContacts = getEmergencyContacts();

  const contactMethods = [
    {
      id: 'visit',
      title: 'Посетете ни',
      description: 'Елате в клуба за лична среща',
      icon: faMapMarkerAlt,
      color: '#ef4444',
      details: club.location?.address ? 
        `${club.location.address}, ${club.location.city || ''}` : 
        'Работно време: по договаряне'
    },
    contacts.phone ? {
      id: 'call',
      title: 'Обадете се',
      description: 'Моментален контакт по телефон',
      icon: faPhone,
      color: '#10b981',
      details: contacts.phone
    } : null,
    contacts.email ? {
      id: 'email',
      title: 'Пишете email',
      description: 'Детайлни запитвания и документи',
      icon: faEnvelope,
      color: '#3b82f6',
      details: contacts.email
    } : null,
    contacts.website ? {
      id: 'online',
      title: 'Посетете сайта',
      description: 'Онлайн информация и ресурси',
      icon: faGlobe,
      color: '#8b5cf6',
      details: contacts.website
    } : null
  ].filter(Boolean);

  // Социални медии с реални данни
  const socialMedia = [
    contacts.socialMedia?.facebook ? {
      platform: 'Facebook',
      url: contacts.socialMedia.facebook,
      icon: faFacebook,
      color: '#1877f2'
    } : null,
    contacts.socialMedia?.instagram ? {
      platform: 'Instagram',
      url: contacts.socialMedia.instagram,
      icon: faInstagram,
      color: '#e4405f'
    } : null,
    contacts.socialMedia?.youtube ? {
      platform: 'YouTube',
      url: contacts.socialMedia.youtube,
      icon: faYoutube,
      color: '#ff0000'
    } : null,
    contacts.socialMedia?.twitter ? {
      platform: 'Twitter',
      url: contacts.socialMedia.twitter,
      icon: faTwitter,
      color: '#1da1f2'
    } : null
  ].filter(Boolean);

  // Работно време с реални данни
  const getWorkingHours = () => {
    const defaultHours = {
      monday: '09:00-17:00',
      tuesday: '09:00-17:00', 
      wednesday: '09:00-17:00',
      thursday: '09:00-17:00',
      friday: '09:00-17:00',
      saturday: '10:00-15:00',
      sunday: 'затворено'
    };

    return [
      { day: 'Понеделник', time: contacts.workingHours?.monday || defaultHours.monday },
      { day: 'Вторник', time: contacts.workingHours?.tuesday || defaultHours.tuesday },
      { day: 'Сряда', time: contacts.workingHours?.wednesday || defaultHours.wednesday },
      { day: 'Четвъртък', time: contacts.workingHours?.thursday || defaultHours.thursday },
      { day: 'Петък', time: contacts.workingHours?.friday || defaultHours.friday },
      { day: 'Събота', time: contacts.workingHours?.saturday || defaultHours.saturday },
      { day: 'Неделя', time: contacts.workingHours?.sunday || defaultHours.sunday }
    ];
  };

  const workingHours = getWorkingHours();

  // FAQ с реални данни
  const getFaqItems = () => {
    if (club.faq && Array.isArray(club.faq)) {
      return club.faq;
    }

    // Генерираме FAQ базирано на наличните данни
    const faqList = [
      {
        question: "Как мога да стана член на клуба?",
        answer: club.membership ? 
          `Можете да се запишете като попълните формата за членство или да дойдете лично в клуба. Месечната такса е ${club.membership.membershipFee?.monthly || 'по договаряне'} лв.` :
          "Можете да се запишете като попълните формата за членство или да дойдете лично в клуба през работно време."
      }
    ];

    if (club.membership?.membershipFee) {
      faqList.push({
        question: "Колко струва месечната такса?",
        answer: `Месечната такса е ${club.membership.membershipFee.monthly || 'по договаряне'} лв.${club.membership.membershipFee.yearly ? `, а годишната е ${club.membership.membershipFee.yearly} лв.` : ''}`
      });
    }

    if (club.membership?.requirements?.minAge) {
      faqList.push({
        question: "Има ли възрастови ограничения?",
        answer: `Минималната възраст за членство е ${club.membership.requirements.minAge} години.`
      });
    } else {
      faqList.push({
        question: "Има ли възрастови ограничения?",
        answer: "Клубът е предназначен за хора над 55 години, но приемаме и по-млади членове при специални обстоятелства."
      });
    }

    if (club.activities) {
      const activities = [];
      if (club.activities.events?.length) activities.push('събития');
      if (club.activities.trips?.length) activities.push('екскурзии');
      if (club.activities.classes?.length) activities.push('занятия');
      
      if (activities.length > 0) {
        faqList.push({
          question: "Какви дейности предлагате?",
          answer: `Предлагаме ${activities.join(', ')} и много други културни дейности.`
        });
      }
    }

    return faqList;
  };

  const faqItems = getFaqItems();

  const handleInputChange = (field, value) => {
    setContactForm(prev => ({ ...prev, [field]: value }));
  };

  // ФУНКЦИОНАЛНА ФОРМА
  const handleSubmit = (e) => {
    e.preventDefault();
    setFormStatus('sending');
    
    if (contacts.email) {
      const subject = encodeURIComponent(`${contactForm.subject || 'Запитване'} - ${club.name}`);
      const body = encodeURIComponent(`
Здравейте,

Получихте съобщение от ${club.name}:

Име: ${contactForm.name}
Email: ${contactForm.email}
Телефон: ${contactForm.phone || 'Не е посочен'}
Тема: ${contactForm.subject}
Предпочитан отговор: ${contactForm.contactMethod === 'email' ? 'Email' : 'Телефон'}

Съобщение:
${contactForm.message}

---
Изпратено от контактната форма на ${club.name}
      `);
      
      try {
        window.location.href = `mailto:${contacts.email}?subject=${subject}&body=${body}`;
        setFormStatus('success');
        setContactForm({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
          contactMethod: 'email'
        });
        
        setTimeout(() => setFormStatus(null), 5000);
      } catch (error) {
        setFormStatus('error');
        setTimeout(() => setFormStatus(null), 3000);
      }
    } else {
      setFormStatus('error');
      setTimeout(() => setFormStatus(null), 3000);
    }
  };

  // ФУНКЦИОНАЛНИ БУТОНИ
  const handleCall = () => {
    const phone = contacts.phone || contacts.mobile;
    if (phone) {
      window.location.href = `tel:${phone}`;
    } else {
      alert('Телефонен номер не е наличен');
    }
  };

  const handleVisit = () => {
    if (club.location?.coordinates) {
      const coords = `${club.location.coordinates.lat},${club.location.coordinates.lng}`;
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${coords}`, '_blank');
    } else if (club.location?.address) {
      const address = encodeURIComponent(`${club.location.address}, ${club.location.city || ''}`);
      window.open(`https://www.google.com/maps/search/${address}`, '_blank');
    } else {
      alert('Адресът не е наличен');
    }
  };

  const getCurrentDay = () => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[new Date().getDay()];
  };

  const isOpenNow = () => {
    const currentDay = getCurrentDay();
    const todayHours = contacts.workingHours?.[currentDay];
    if (!todayHours || todayHours === 'closed' || todayHours === 'затворено') return false;
    
    try {
      const now = new Date();
      const currentTime = now.getHours() * 100 + now.getMinutes();
      const [start, end] = todayHours.split('-').map(time => {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 100 + minutes;
      });
      
      return currentTime >= start && currentTime <= end;
    } catch {
      return false;
    }
  };

  return (
    <section id="cultural-contacts" className="cultural-contacts-main-section">
      <div className="cultural-contacts-container">
        
        {/* Header */}
        <div className="cultural-contacts-header">
          <div className="cultural-contacts-badge">
            <FontAwesomeIcon icon={faComments} />
            <span>Контакти и връзка</span>
          </div>
          <h2 className="cultural-contacts-title">Свържете се с нас</h2>
          <p className="cultural-contacts-subtitle">
            Търсите информация или искате да се присъедините? Ние сме тук, за да ви помогнем!
          </p>
        </div>

        {/* Quick Contact Info */}
        <div className="cultural-contacts-quick-info">
          {Object.keys(contacts.workingHours).length > 0 && (
            <div className="cultural-contacts-status">
              <div className={`cultural-contacts-status-indicator ${isOpenNow() ? 'open' : 'closed'}`}>
                <div className="cultural-contacts-status-dot"></div>
                <span>{isOpenNow() ? 'Отворено сега' : 'Затворено сега'}</span>
              </div>
            </div>
          )}
          
          <div className="cultural-contacts-quick-grid">
            {contacts.phone && (
              <div className="cultural-contacts-quick-item" onClick={handleCall} style={{cursor: 'pointer'}}>
                <FontAwesomeIcon icon={faPhone} />
                <div>
                  <span className="cultural-contacts-quick-label">Телефон</span>
                  <span className="cultural-contacts-quick-value">{contacts.phone}</span>
                </div>
              </div>
            )}
            
            {contacts.mobile && (
              <div className="cultural-contacts-quick-item" onClick={() => window.location.href = `tel:${contacts.mobile}`} style={{cursor: 'pointer'}}>
                <FontAwesomeIcon icon={faMobile} />
                <div>
                  <span className="cultural-contacts-quick-label">Мобилен</span>
                  <span className="cultural-contacts-quick-value">{contacts.mobile}</span>
                </div>
              </div>
            )}
            
            {contacts.email && (
              <div className="cultural-contacts-quick-item" onClick={() => window.location.href = `mailto:${contacts.email}`} style={{cursor: 'pointer'}}>
                <FontAwesomeIcon icon={faEnvelope} />
                <div>
                  <span className="cultural-contacts-quick-label">Email</span>
                  <span className="cultural-contacts-quick-value">{contacts.email}</span>
                </div>
              </div>
            )}
            
            {contacts.website && (
              <div className="cultural-contacts-quick-item" onClick={() => window.open(`https://${contacts.website}`, '_blank')} style={{cursor: 'pointer'}}>
                <FontAwesomeIcon icon={faGlobe} />
                <div>
                  <span className="cultural-contacts-quick-label">Уебсайт</span>
                  <span className="cultural-contacts-quick-value">{contacts.website}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="cultural-contacts-main-grid">
          
          {/* Contact Methods */}
          <div className="cultural-contacts-methods">
            <h3>Начини за връзка</h3>
            <div className="cultural-contacts-methods-grid">
              {contactMethods.map(method => (
                <div key={method.id} className="cultural-contacts-method-card">
                  <div 
                    className="cultural-contacts-method-icon"
                    style={{ background: method.color }}
                  >
                    <FontAwesomeIcon icon={method.icon} />
                  </div>
                  <div className="cultural-contacts-method-content">
                    <h4>{method.title}</h4>
                    <p>{method.description}</p>
                    <span className="cultural-contacts-method-details">{method.details}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Form - показваме само ако има имейл */}
          {contacts.email && (
            <div className="cultural-contacts-form-section">
              <h3>Изпратете съобщение</h3>
              <form onSubmit={handleSubmit} className="cultural-contacts-form">
                <div className="cultural-contacts-form-row">
                  <div className="cultural-contacts-form-group">
                    <label>Име и фамилия *</label>
                    <input
                      type="text"
                      value={contactForm.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Вашето име"
                      required
                    />
                  </div>
                  
                  <div className="cultural-contacts-form-group">
                    <label>Email адрес *</label>
                    <input
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="email@example.com"
                      required
                    />
                  </div>
                </div>
                
                <div className="cultural-contacts-form-row">
                  <div className="cultural-contacts-form-group">
                    <label>Телефон</label>
                    <input
                      type="tel"
                      value={contactForm.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="0888 123 456"
                    />
                  </div>
                  
                  <div className="cultural-contacts-form-group">
                    <label>Тема *</label>
                    <select
                      value={contactForm.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      required
                    >
                      <option value="">Изберете тема</option>
                      <option value="Информация за членство">Информация за членство</option>
                      <option value="Дейности и програми">Дейности и програми</option>
                      <option value="Събития и мероприятия">Събития и мероприятия</option>
                      <option value="Доброволчество">Доброволчество</option>
                      <option value="Оплакване или предложение">Оплакване или предложение</option>
                      <option value="Друго">Друго</option>
                    </select>
                  </div>
                </div>
                
                <div className="cultural-contacts-form-group">
                  <label>Предпочитан начин за отговор</label>
                  <div className="cultural-contacts-radio-group">
                    <label className="cultural-contacts-radio-label">
                      <input
                        type="radio"
                        value="email"
                        checked={contactForm.contactMethod === 'email'}
                        onChange={(e) => handleInputChange('contactMethod', e.target.value)}
                      />
                      <span>Email</span>
                    </label>
                    {(contacts.phone || contacts.mobile) && (
                      <label className="cultural-contacts-radio-label">
                        <input
                          type="radio"
                          value="phone"
                          checked={contactForm.contactMethod === 'phone'}
                          onChange={(e) => handleInputChange('contactMethod', e.target.value)}
                        />
                        <span>Телефон</span>
                      </label>
                    )}
                  </div>
                </div>
                
                <div className="cultural-contacts-form-group">
                  <label>Съобщение *</label>
                  <textarea
                    value={contactForm.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    placeholder="Напишете вашето съобщение тук..."
                    rows="5"
                    required
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="cultural-contacts-submit-btn"
                  disabled={formStatus === 'sending'}
                >
                  {formStatus === 'sending' ? (
                    <>
                      <div className="cultural-contacts-spinner"></div>
                      Изпраща се...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faPaperPlane} />
                      Изпрати съобщение
                    </>
                  )}
                </button>
                
                {formStatus === 'success' && (
                  <div className="cultural-contacts-success-message">
                    <FontAwesomeIcon icon={faCheckCircle} />
                    Съобщението е изпратено успешно! Ще ви отговорим в рамките на 24 часа.
                  </div>
                )}

                {formStatus === 'error' && (
                  <div className="cultural-contacts-error-message">
                    <FontAwesomeIcon icon={faExclamationTriangle} />
                    Възникна грешка при изпращането. Моля опитайте отново.
                  </div>
                )}
              </form>
            </div>
          )}
        </div>

        {/* Working Hours & Emergency & Social */}
        <div className="cultural-contacts-info-grid">
          
          {/* Working Hours - показваме само ако има данни */}
          {Object.keys(contacts.workingHours).length > 0 && (
            <div className="cultural-contacts-hours-card">
              <div className="cultural-contacts-hours-header">
                <FontAwesomeIcon icon={faClock} />
                <h3>Работно време</h3>
              </div>
              <div className="cultural-contacts-hours-list">
                {workingHours.map((day, index) => (
                  <div 
                    key={index} 
                    className={`cultural-contacts-hours-row ${
                      day.day.toLowerCase().includes(getCurrentDay()) ? 'today' : ''
                    }`}
                  >
                    <span className="cultural-contacts-day">{day.day}</span>
                    <span className={`cultural-contacts-time ${
                      day.time === 'затворено' ? 'closed' : ''
                    }`}>
                      {day.time === 'затворено' ? 'Затворено' : day.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Emergency Contacts - показваме само ако има данни */}
          {emergencyContacts.length > 0 && (
            <div className="cultural-contacts-emergency-card">
              <div className="cultural-contacts-emergency-header">
                <FontAwesomeIcon icon={faExclamationTriangle} />
                <h3>Важни контакти</h3>
              </div>
              <div className="cultural-contacts-emergency-list">
                {emergencyContacts.map((contact, index) => (
                  <div key={index} className="cultural-contacts-emergency-item">
                    <div className="cultural-contacts-emergency-icon">
                      <FontAwesomeIcon icon={contact.icon} />
                    </div>
                    <div className="cultural-contacts-emergency-info">
                      <h4>{contact.title}</h4>
                      <p>{contact.name}</p>
                      <span 
                        className="cultural-contacts-emergency-phone"
                        onClick={() => window.location.href = `tel:${contact.phone}`}
                        style={{cursor: 'pointer'}}
                      >
                        {contact.phone}
                      </span>
                      <span className="cultural-contacts-emergency-time">{contact.available}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Social Media - показваме само ако има данни */}
          {socialMedia.length > 0 && (
            <div className="cultural-contacts-social-card">
              <div className="cultural-contacts-social-header">
                <FontAwesomeIcon icon={faUsers} />
                <h3>Социални мрежи</h3>
              </div>
              <div className="cultural-contacts-social-list">
                {socialMedia.map((social, index) => (
                  <div key={index} className="cultural-contacts-social-item">
                    <div 
                      className="cultural-contacts-social-icon"
                      style={{ background: social.color }}
                    >
                      <FontAwesomeIcon icon={social.icon} />
                    </div>
                    <div className="cultural-contacts-social-info">
                      <h4>{social.platform}</h4>
                      <a 
                        href={social.url.startsWith('http') ? social.url : `https://${social.url}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        Последвайте ни
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* FAQ Section - показваме само ако има данни */}
        {faqItems.length > 0 && (
          <div className="cultural-contacts-faq">
            <div className="cultural-contacts-faq-header">
              <FontAwesomeIcon icon={faQuestionCircle} />
              <h3>Често задавани въпроси</h3>
              <p>Намерете бързи отговори на най-честите въпроси</p>
            </div>
            <div className="cultural-contacts-faq-grid">
              {faqItems.map((item, index) => (
                <div key={index} className="cultural-contacts-faq-item">
                  <div className="cultural-contacts-faq-question">
                    <FontAwesomeIcon icon={faQuestionCircle} />
                    <h4>{item.question}</h4>
                  </div>
                  <p className="cultural-contacts-faq-answer">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="cultural-contacts-cta">
          <div className="cultural-contacts-cta-content">
            <h3>Все още имате въпроси?</h3>
            <p>Нашият екип е готов да ви помогне и да отговори на всички ваши въпроси</p>
            <div className="cultural-contacts-cta-buttons">
              {(contacts.phone || contacts.mobile) && (
                <button className="cultural-contacts-cta-primary" onClick={handleCall}>
                  <FontAwesomeIcon icon={faPhone} />
                  Обадете се сега
                </button>
              )}
              {club.location && (
                <button className="cultural-contacts-cta-secondary" onClick={handleVisit}>
                  <FontAwesomeIcon icon={faMapMarkerAlt} />
                  Посетете ни
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CulturalContacts;