import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPhone,
  faEnvelope,
  faMapMarkerAlt,
  faClock,
  faGlobe,
  faFax,
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

  const contacts = club.contacts || {
    phone: "02/856-4321",
    mobile: "0888567123", 
    email: "info@zlatnaesenta.bg",
    website: "www.zlatnaesenta-sofia.bg",
    socialMedia: {
      facebook: "facebook.com/zlatnaesenta.sofia"
    },
    workingHours: {
      monday: "09:00-17:00",
      tuesday: "09:00-17:00",
      wednesday: "09:00-17:00",
      thursday: "09:00-17:00",
      friday: "09:00-17:00",
      saturday: "10:00-15:00",
      sunday: "затворено"
    }
  };

  const emergencyContacts = [
    {
      title: "Спешни случаи",
      name: "Дежурен",
      phone: "0888567123",
      available: "24/7",
      icon: faPhoneAlt
    },
    {
      title: "Председател",
      name: club.management?.board?.[0]?.name || "Анка Димитрова",
      phone: club.management?.board?.[0]?.phone || "0888567123",
      available: "09:00-20:00",
      icon: faUser
    },
    {
      title: "Медицинска помощ",
      name: "Медсестра",
      phone: "0877123456",
      available: "работни дни",
      icon: faUsers
    }
  ];

  const contactMethods = [
    {
      id: 'visit',
      title: 'Посетете ни',
      description: 'Елате в клуба за лична среща',
      icon: faMapMarkerAlt,
      color: '#ef4444',
      details: 'Работно време: Пн-Пт 09:00-17:00'
    },
    {
      id: 'call',
      title: 'Обадете се',
      description: 'Моментален контакт по телефон',
      icon: faPhone,
      color: '#10b981',
      details: contacts.phone
    },
    {
      id: 'email',
      title: 'Пишете email',
      description: 'Детайлни запитвания и документи',
      icon: faEnvelope,
      color: '#3b82f6',
      details: contacts.email
    },
    {
      id: 'online',
      title: 'Онлайн среща',
      description: 'Видео разговор или онлайн консултация',
      icon: faGlobe,
      color: '#8b5cf6',
      details: 'По предварително записване'
    }
  ];

  const socialMedia = [
    {
      platform: 'Facebook',
      url: contacts.socialMedia?.facebook,
      icon: faFacebook,
      color: '#1877f2',
      followers: '234 последователи'
    },
    {
      platform: 'Instagram',
      url: contacts.socialMedia?.instagram,
      icon: faInstagram,
      color: '#e4405f',
      followers: '156 последователи'
    },
    {
      platform: 'YouTube',
      url: contacts.socialMedia?.youtube,
      icon: faYoutube,
      color: '#ff0000',
      followers: '89 абонати'
    }
  ].filter(social => social.url);

  const workingHours = [
    { day: 'Понеделник', time: contacts.workingHours?.monday || '09:00-17:00' },
    { day: 'Вторник', time: contacts.workingHours?.tuesday || '09:00-17:00' },
    { day: 'Сряда', time: contacts.workingHours?.wednesday || '09:00-17:00' },
    { day: 'Четвъртък', time: contacts.workingHours?.thursday || '09:00-17:00' },
    { day: 'Петък', time: contacts.workingHours?.friday || '09:00-17:00' },
    { day: 'Събота', time: contacts.workingHours?.saturday || '10:00-15:00' },
    { day: 'Неделя', time: contacts.workingHours?.sunday || 'затворено' }
  ];

  const faqItems = [
    {
      question: "Как мога да стана член на клуба?",
      answer: "Можете да се запишете като попълните формата за членство или да дойдете лично в клуба през работно време."
    },
    {
      question: "Колко струва месечната такса?",
      answer: `Месечната такса е ${club.membership?.membershipFee?.monthly || 15} лв., а годишната е ${club.membership?.membershipFee?.yearly || 150} лв.`
    },
    {
      question: "Има ли възрастови ограничения?",
      answer: "Клубът е предназначен за хора над 60 години, но приемаме и по-млади членове при специални обстоятелства."
    },
    {
      question: "Какви дейности предлагате?",
      answer: "Предлагаме хор, народни танци, творчески работилници, екскурзии, лекции и много други културни дейности."
    }
  ];

  const handleInputChange = (field, value) => {
    setContactForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormStatus('sending');
    
    // Simulate form submission
    setTimeout(() => {
      setFormStatus('success');
      setContactForm({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        contactMethod: 'email'
      });
      
      setTimeout(() => setFormStatus(null), 3000);
    }, 1500);
  };

  const getCurrentDay = () => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[new Date().getDay()];
  };

  const isOpenNow = () => {
    const currentDay = getCurrentDay();
    const todayHours = contacts.workingHours?.[currentDay];
    if (!todayHours || todayHours === 'closed' || todayHours === 'затворено') return false;
    
    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes();
    const [start, end] = todayHours.split('-').map(time => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 100 + minutes;
    });
    
    return currentTime >= start && currentTime <= end;
  };

  return (
    <section id="club-contact" className="cultural-contacts-main-section">
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
          <div className="cultural-contacts-status">
            <div className={`cultural-contacts-status-indicator ${isOpenNow() ? 'open' : 'closed'}`}>
              <div className="cultural-contacts-status-dot"></div>
              <span>{isOpenNow() ? 'Отворено сега' : 'Затворено сега'}</span>
            </div>
          </div>
          
          <div className="cultural-contacts-quick-grid">
            <div className="cultural-contacts-quick-item">
              <FontAwesomeIcon icon={faPhone} />
              <div>
                <span className="cultural-contacts-quick-label">Телефон</span>
                <span className="cultural-contacts-quick-value">{contacts.phone}</span>
              </div>
            </div>
            
            <div className="cultural-contacts-quick-item">
              <FontAwesomeIcon icon={faMobile} />
              <div>
                <span className="cultural-contacts-quick-label">Мобилен</span>
                <span className="cultural-contacts-quick-value">{contacts.mobile}</span>
              </div>
            </div>
            
            <div className="cultural-contacts-quick-item">
              <FontAwesomeIcon icon={faEnvelope} />
              <div>
                <span className="cultural-contacts-quick-label">Email</span>
                <span className="cultural-contacts-quick-value">{contacts.email}</span>
              </div>
            </div>
            
            {contacts.website && (
              <div className="cultural-contacts-quick-item">
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

          {/* Contact Form */}
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
                    <option value="membership">Информация за членство</option>
                    <option value="activities">Дейности и програми</option>
                    <option value="events">Събития и мероприятия</option>
                    <option value="volunteering">Доброволчество</option>
                    <option value="complaint">Оплакване или предложение</option>
                    <option value="other">Друго</option>
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
                  <label className="cultural-contacts-radio-label">
                    <input
                      type="radio"
                      value="phone"
                      checked={contactForm.contactMethod === 'phone'}
                      onChange={(e) => handleInputChange('contactMethod', e.target.value)}
                    />
                    <span>Телефон</span>
                  </label>
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
            </form>
          </div>
        </div>

        {/* Working Hours & Emergency */}
        <div className="cultural-contacts-info-grid">
          
          {/* Working Hours */}
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
                    day.day.toLowerCase() === getCurrentDay() ? 'today' : ''
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

          {/* Emergency Contacts */}
          <div className="cultural-contacts-emergency-card">
            <div className="cultural-contacts-emergency-header">
              <FontAwesomeIcon icon={faExclamationTriangle} />
              <h3>Спешни контакти</h3>
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
                    <span className="cultural-contacts-emergency-phone">{contact.phone}</span>
                    <span className="cultural-contacts-emergency-time">{contact.available}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Social Media */}
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
                      <p>{social.followers}</p>
                      <a href={`https://${social.url}`} target="_blank" rel="noopener noreferrer">
                        Последвайте ни
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* FAQ Section */}
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

        {/* Call to Action */}
        <div className="cultural-contacts-cta">
          <div className="cultural-contacts-cta-content">
            <h3>Все още имате въпроси?</h3>
            <p>Нашият екип е готов да ви помогне и да отговори на всички ваши въпроси</p>
            <div className="cultural-contacts-cta-buttons">
              <button className="cultural-contacts-cta-primary">
                <FontAwesomeIcon icon={faPhone} />
                Обадете се сега
              </button>
              <button className="cultural-contacts-cta-secondary">
                <FontAwesomeIcon icon={faMapMarkerAlt} />
                Посетете ни
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CulturalContacts;