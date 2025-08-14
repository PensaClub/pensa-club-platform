import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEnvelope,
  faPhone,
  faClock,
  faMapMarkerAlt,
  faPaperPlane,
  faUser,
  faTag,
  faComments,
  faCheckCircle,
  faExclamationTriangle,
  faSpinner,
  faCalendarAlt,
  faQuestionCircle,
  faTimes,
  faInfoCircle,
  faRoute,
  faShare,
  faHeadset,
  faBusinessTime,
  faMobileAlt,
  faGlobe,
  faLocationDot,
  faHandshake,
  faUserFriends,
  faChevronDown,
  faChevronUp
} from '@fortawesome/free-solid-svg-icons';
import { 
  faFacebook, 
  faInstagram, 
  faYoutube,
  faTwitter,
  faLinkedin
} from '@fortawesome/free-brands-svg-icons';
import './clubContact.css';

export const ClubContact = ({ club }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'membership',
    message: '',
    preferredContact: 'email'
  });
  const [formStatus, setFormStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);
  const [showHoursModal, setShowHoursModal] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  // ПРОВЕРКА ЗА ДАННИ
  if (!club?.contacts || (!club.contacts.phone && !club.contacts.email)) {
    return null;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormStatus({ type: '', message: '' });

    if (!formData.name || !formData.email || !formData.message) {
      setFormStatus({
        type: 'error',
        message: 'Моля попълнете всички задължителни полета'
      });
      setIsSubmitting(false);
      return;
    }

    // Изпращане на имейл чрез mailto
    const recipientEmail = club.contacts.email;
    const subject = encodeURIComponent(`${getSubjectLabel(formData.subject)} - ${formData.name}`);
    const body = encodeURIComponent(`
Име: ${formData.name}
Email: ${formData.email}
Телефон: ${formData.phone || 'Не е посочен'}
Предпочитан контакт: ${formData.preferredContact === 'email' ? 'Email' : 'Телефон'}

Тема: ${getSubjectLabel(formData.subject)}

Съобщение:
${formData.message}

---
Изпратено от ${club.name} уебсайт
Дата: ${new Date().toLocaleDateString('bg-BG')}
    `);

    try {
      // Симулация на изпращане
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Отваряне на mailto
      if (recipientEmail) {
        window.location.href = `mailto:${recipientEmail}?subject=${subject}&body=${body}`;
      }
      
      setFormStatus({
        type: 'success',
        message: 'Email клиентът ви е отворен! Изпратете съобщението за да го получим.'
      });
      
      // Изчистване на формата след успех
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: 'membership',
          message: '',
          preferredContact: 'email'
        });
        setFormStatus({ type: '', message: '' });
      }, 3000);
      
    } catch (error) {
      setFormStatus({
        type: 'error',
        message: 'Възникна грешка. Моля опитайте отново или ни се обадете директно.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSubjectLabel = (subject) => {
    const subjects = {
      'membership': 'Членство в клуба',
      'activities': 'Дейности и програми',
      'events': 'События',
      'volunteer': 'Доброволчество',
      'general': 'Общи въпроси',
      'complaint': 'Жалба/предложение',
      'partnership': 'Партньорство',
      'donation': 'Дарение/спонсорство'
    };
    return subjects[subject] || 'Общ въпрос';
  };

  const getSocialIcon = (platform) => {
    const icons = {
      'facebook': faFacebook,
      'instagram': faInstagram,
      'youtube': faYoutube,
      'twitter': faTwitter,
      'linkedin': faLinkedin
    };
    return icons[platform.toLowerCase()] || faGlobe;
  };

  const getSocialUrl = (platform, handle) => {
    if (handle.startsWith('http')) return handle;
    
    const urls = {
      'facebook': `https://${handle}`,
      'instagram': `https://instagram.com/${handle.replace('@', '')}`,
      'youtube': `https://youtube.com/${handle}`,
      'twitter': `https://twitter.com/${handle.replace('@', '')}`,
      'linkedin': `https://linkedin.com/company/${handle}`
    };
    
    return urls[platform.toLowerCase()] || `https://${handle}`;
  };

  const getTodayHours = () => {
    if (!club.contacts?.workingHours) return 'Не е посочено';
    
    const today = new Date().getDay();
    const dayIndex = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][today];
    return club.contacts.workingHours[dayIndex] || 'closed';
  };

  const getTodayName = () => {
    const days = ['Неделя', 'Понеделник', 'Вторник', 'Сряда', 'Четвъртък', 'Петък', 'Събота'];
    return days[new Date().getDay()];
  };

  const handleShare = () => {
    const text = `Свържете се с ${club.name}`;
    const contactInfo = `📞 ${club.contacts.phone || ''} 📧 ${club.contacts.email || ''}`;
    
    if (navigator.share) {
      navigator.share({
        title: text,
        text: `${text}\n${contactInfo}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(`${text}\n${contactInfo}\n${window.location.href}`);
      alert('Контактната информация е копирана в клипборда!');
    }
  };

  // FAQ данни
  const faqData = [
    {
      question: "Как мога да стана член на клуба?",
      answer: "За да станете член, трябва да попълните заявление и да заплатите членския внос. Свържете се с нас за повече информация."
    },
    {
      question: "Колко струва членството?",
      answer: club.membership?.membershipFee ? 
        `Месечният внос е ${club.membership.membershipFee.monthly} ${club.membership.membershipFee.currency}, а годишният - ${club.membership.membershipFee.yearly} ${club.membership.membershipFee.currency}.` :
        "Свържете се с нас за информация за цените."
    },
    {
      question: "Какви са изискванията за членство?",
      answer: club.membership?.requirements?.length > 0 ?
        club.membership.requirements.join(', ') :
        "Свържете се с нас за подробна информация за изискванията."
    },
    {
      question: "Какво включва членството?",
      answer: club.membership?.benefits?.length > 0 ?
        club.membership.benefits.join(', ') :
        "Участие в всички дейности и събития на клуба."
    },
    {
      question: "Мога ли да посетя клуба преди да стана член?",
      answer: "Разбира се! Заповядайте в работното ни време или се свържете с нас да уговорим среща."
    }
  ];

  return (
    <section id="general-contact" className="general-contact-main">
      <div className="general-contact-container">
        
        {/* Header */}
        <div className="general-contact-header">
          <div className="general-contact-badge">
            <FontAwesomeIcon icon={faHeadset} />
            <span>Свържете се с нас</span>
          </div>
          <h2 className="general-contact-title">Тук сме за вас</h2>
          <p className="general-contact-subtitle">
            Готови сме да отговорим на всички ваши въпроси и да ви помогнем
          </p>
          
          {/* Quick actions */}
          <div className="general-contact-actions">
            <button 
              className="general-quick-action faq"
              onClick={() => setShowFAQ(true)}
            >
              <FontAwesomeIcon icon={faQuestionCircle} />
              Често задавани въпроси
            </button>
            <button 
              className="general-quick-action share"
              onClick={handleShare}
            >
              <FontAwesomeIcon icon={faShare} />
              Споделяне
            </button>
          </div>
        </div>

        <div className="general-contact-layout">
          
          {/* Contact Methods */}
          <div className="general-contact-methods">
            
            {/* Primary Contact */}
            <div className="general-contact-card primary">
              <div className="general-card-header">
                <FontAwesomeIcon icon={faHeadset} />
                <h3>Основни контакти</h3>
              </div>
              
              <div className="general-contact-options">
                {club.contacts.phone && (
                  <a href={`tel:${club.contacts.phone}`} className="general-contact-option phone">
                    <div className="general-option-icon">
                      <FontAwesomeIcon icon={faPhone} />
                    </div>
                    <div className="general-option-content">
                      <span className="general-option-label">Телефон</span>
                      <span className="general-option-value">{club.contacts.phone}</span>
                      <span className="general-option-desc">Обадете се директно</span>
                    </div>
                  </a>
                )}
                
                {club.contacts.mobile && club.contacts.mobile !== club.contacts.phone && (
                  <a href={`tel:${club.contacts.mobile}`} className="general-contact-option mobile">
                    <div className="general-option-icon">
                      <FontAwesomeIcon icon={faMobileAlt} />
                    </div>
                    <div className="general-option-content">
                      <span className="general-option-label">Мобилен</span>
                      <span className="general-option-value">{club.contacts.mobile}</span>
                      <span className="general-option-desc">SMS и обаждания</span>
                    </div>
                  </a>
                )}
                
                {club.contacts.email && (
                  <a href={`mailto:${club.contacts.email}`} className="general-contact-option email">
                    <div className="general-option-icon">
                      <FontAwesomeIcon icon={faEnvelope} />
                    </div>
                    <div className="general-option-content">
                      <span className="general-option-label">Email</span>
                      <span className="general-option-value">{club.contacts.email}</span>
                      <span className="general-option-desc">Изпратете съобщение</span>
                    </div>
                  </a>
                )}

                {club.contacts.website && (
                  <a href={club.contacts.website} target="_blank" rel="noopener noreferrer" className="general-contact-option website">
                    <div className="general-option-icon">
                      <FontAwesomeIcon icon={faGlobe} />
                    </div>
                    <div className="general-option-content">
                      <span className="general-option-label">Уебсайт</span>
                      <span className="general-option-value">{club.contacts.website}</span>
                      <span className="general-option-desc">Посетете сайта ни</span>
                    </div>
                  </a>
                )}
              </div>
            </div>

            {/* Working Hours */}
            {club.contacts?.workingHours && (
              <div className="general-contact-card hours">
                <div className="general-card-header">
                  <FontAwesomeIcon icon={faBusinessTime} />
                  <h3>Работно време</h3>
                  <button 
                    className="general-card-action"
                    onClick={() => setShowHoursModal(true)}
                    title="Подробно работно време"
                  >
                    <FontAwesomeIcon icon={faInfoCircle} />
                  </button>
                </div>
                
                <div className="general-today-status">
                  <div className="general-today-info">
                    <span className="general-today-label">{getTodayName()}</span>
                    <span className={`general-today-hours ${getTodayHours() === 'closed' ? 'closed' : 'open'}`}>
                      {getTodayHours() === 'closed' ? 'Затворено' : getTodayHours()}
                    </span>
                  </div>
                  
                  {getTodayHours() !== 'closed' && (
                    <div className="general-status-indicator open">
                      <div className="general-status-dot"></div>
                      <span>Отворено сега</span>
                    </div>
                  )}
                  
                  {getTodayHours() === 'closed' && (
                    <div className="general-status-indicator closed">
                      <div className="general-status-dot"></div>
                      <span>Затворено</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Location */}
            {club.location && (
              <div className="general-contact-card location">
                <div className="general-card-header">
                  <FontAwesomeIcon icon={faLocationDot} />
                  <h3>Нашето местоположение</h3>
                </div>
                
                <div className="general-location-info">
                  <div className="general-address">
                    <FontAwesomeIcon icon={faMapMarkerAlt} />
                    <div>
                      <span className="general-address-line">{club.location.address}</span>
                      <span className="general-city-line">{club.location.city}{club.location.region && `, ${club.location.region}`}</span>
                    </div>
                  </div>
                  
                  <div className="general-location-actions">
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${club.location.address}, ${club.location.city}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="general-location-btn maps"
                    >
                      <FontAwesomeIcon icon={faMapMarkerAlt} />
                      Google Maps
                    </a>
                    
                    {club.location.coordinates && (
                      <a 
                        href={`https://www.google.com/maps/dir/?api=1&destination=${club.location.coordinates.lat},${club.location.coordinates.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="general-location-btn directions"
                      >
                        <FontAwesomeIcon icon={faRoute} />
                        Маршрут
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Social Media */}
            {club.contacts?.socialMedia && Object.keys(club.contacts.socialMedia).length > 0 && (
              <div className="general-contact-card social">
                <div className="general-card-header">
                  <FontAwesomeIcon icon={faUserFriends} />
                  <h3>Социални мрежи</h3>
                </div>
                
                <div className="general-social-links">
                  {Object.entries(club.contacts.socialMedia).map(([platform, handle]) => (
                    
                     <a key={platform}
                      href={getSocialUrl(platform, handle)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`general-social-link ${platform.toLowerCase()}`}
                    >
                      <FontAwesomeIcon icon={getSocialIcon(platform)} />
                      <span>{platform}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Contact Form */}
          <div className="general-contact-form-section">
            <div className="general-form-wrapper">
              <div className="general-form-header">
                <h3>
                  <FontAwesomeIcon icon={faPaperPlane} />
                  Изпратете съобщение
                </h3>
                <p>Ще ви отговорим в рамките на 24 часа</p>
              </div>
              
              <form onSubmit={handleSubmit} className="general-contact-form">
                <div className="general-form-grid">
                  <div className="general-form-field">
                    <label htmlFor="name">Име *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Вашето име"
                      required
                    />
                    <FontAwesomeIcon icon={faUser} className="general-field-icon" />
                  </div>
                  
                  <div className="general-form-field">
                    <label htmlFor="email">Email *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="email@example.com"
                      required
                    />
                    <FontAwesomeIcon icon={faEnvelope} className="general-field-icon" />
                  </div>

                  <div className="general-form-field">
                    <label htmlFor="phone">Телефон</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="0888 123 456"
                    />
                    <FontAwesomeIcon icon={faPhone} className="general-field-icon" />
                  </div>
                  
                  <div className="general-form-field">
                    <label htmlFor="preferredContact">Предпочитан контакт</label>
                    <select
                      id="preferredContact"
                      name="preferredContact"
                      value={formData.preferredContact}
                      onChange={handleInputChange}
                    >
                      <option value="email">Email</option>
                      <option value="phone">Телефон</option>
                    </select>
                    <FontAwesomeIcon icon={faHandshake} className="general-field-icon" />
                  </div>
                </div>

                <div className="general-form-field">
                  <label htmlFor="subject">Тема</label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                  >
                    <option value="membership">Членство в клуба</option>
                    <option value="activities">Дейности и програми</option>
                    <option value="events">События</option>
                    <option value="volunteer">Доброволчество</option>
                    <option value="partnership">Партньорство</option>
                    <option value="donation">Дарение/спонсорство</option>
                    <option value="general">Общи въпроси</option>
                    <option value="complaint">Жалба/предложение</option>
                  </select>
                  <FontAwesomeIcon icon={faTag} className="general-field-icon" />
                </div>

                <div className="general-form-field">
                  <label htmlFor="message">Съобщение *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Напишете вашето съобщение тук..."
                    rows="5"
                    required
                  ></textarea>
                  <FontAwesomeIcon icon={faComments} className="general-field-icon" />
                </div>

                {formStatus.message && (
                  <div className={`general-form-alert ${formStatus.type}`}>
                    <FontAwesomeIcon 
                      icon={formStatus.type === 'success' ? faCheckCircle : faExclamationTriangle} 
                    />
                    <span>{formStatus.message}</span>
                  </div>
                )}

                <button 
                  type="submit" 
                  className="general-submit-button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} className="general-spinning" />
                      Изпращане...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faPaperPlane} />
                      Изпрати съобщение
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Modal */}
      {showFAQ && (
        <div className="general-modal-overlay" onClick={() => setShowFAQ(false)}>
          <div className="general-modal" onClick={(e) => e.stopPropagation()}>
            <div className="general-modal-header">
              <h3>
                <FontAwesomeIcon icon={faQuestionCircle} />
                Често задавани въпроси
              </h3>
              <button className="general-modal-close" onClick={() => setShowFAQ(false)}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <div className="general-modal-content">
              <div className="general-faq-list">
                {faqData.map((faq, index) => (
                  <div key={index} className="general-faq-item">
                    <button
                      className="general-faq-question"
                      onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                    >
                      <span>{faq.question}</span>
                      <FontAwesomeIcon 
                        icon={expandedFAQ === index ? faChevronUp : faChevronDown} 
                      />
                    </button>
                    
                    {expandedFAQ === index && (
                      <div className="general-faq-answer">
                        <p>{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="general-faq-footer">
                <p>Не намирате отговор на въпроса си?</p>
                <button 
                  className="general-contact-us-btn"
                  onClick={() => setShowFAQ(false)}
                >
                  <FontAwesomeIcon icon={faEnvelope} />
                  Свържете се с нас
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Working Hours Modal */}
      {showHoursModal && club.contacts?.workingHours && (
        <div className="general-modal-overlay" onClick={() => setShowHoursModal(false)}>
          <div className="general-modal" onClick={(e) => e.stopPropagation()}>
            <div className="general-modal-header">
              <h3>
                <FontAwesomeIcon icon={faBusinessTime} />
                Подробно работно време
              </h3>
              <button className="general-modal-close" onClick={() => setShowHoursModal(false)}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <div className="general-modal-content">
              <div className="general-hours-detailed">
                {Object.entries(club.contacts.workingHours).map(([day, hours]) => {
                  const dayNames = {
                    monday: 'Понеделник',
                    tuesday: 'Вторник',
                    wednesday: 'Сряда',
                    thursday: 'Четвъртък',
                    friday: 'Петък',
                    saturday: 'Събота',
                    sunday: 'Неделя'
                  };
                  
                  const today = new Date().getDay();
                  const dayIndex = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][today];
                  const isToday = day === dayIndex;
                  
                  return (
                    <div key={day} className={`general-hours-row ${isToday ? 'today' : ''}`}>
                      <div className="general-hours-day">
                        <FontAwesomeIcon icon={faCalendarAlt} />
                        <span>{dayNames[day]}</span>
                        {isToday && <span className="general-today-badge">Днес</span>}
                      </div>
                      <div className={`general-hours-time ${hours === 'closed' ? 'closed' : 'open'}`}>
                        {hours === 'closed' ? 'Затворено' : hours}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="general-hours-note">
                <FontAwesomeIcon icon={faInfoCircle} />
                <p>Работното време може да се променя по време на празници. За актуална информация се свържете с нас.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ClubContact;